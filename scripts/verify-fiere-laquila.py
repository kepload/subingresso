"""Verify the isolated L'Aquila delivery; write only a private build fixture.

python scripts/verify-fiere-laquila.py
No database, network, deployment or shared builder edits.
"""
import ast
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import shutil
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / '.local/verifiche/fiere-laquila-20261105'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    audit = read(ROOT / 'data/fiere-laquila.json')
    delta = read(ROOT / 'data/fiere-laquila-delta-20261105.json')
    previous = read(ROOT / 'data/fiere.json')
    original_hashes = {p: digest(p) for p in [ROOT / 'scripts/build-fiere.py', ROOT / 'data/fiere.json', ROOT / 'data/fiere-costi.json']}
    towns = {c['nome'] for c in read(ROOT / 'data/comuni.json') if c['sigla'] == 'AQ'}
    coverage = audit['research']['municipalityCoverage']
    assert len(towns) == len(coverage) == 108
    assert {c['city'] for c in coverage} == towns
    assert audit['province'] == delta['province'] == "L'Aquila"
    assert audit['checkedAt'] == '2026-11-05'
    assert len(audit['events']) == 31
    for row in audit['events']:
        assert row['city'] in towns and row['region'] == 'Abruzzo'
        assert row['category'] in {'tradizionale', 'mercatino', 'espositiva', 'sagra', 'artigianato'}
        assert urlparse(row['source']['url']).scheme == 'https'
        for edition in row.get('editions', []):
            if edition.get('start'):
                assert date.fromisoformat(edition['start']) <= date.fromisoformat(edition['end'])
                assert edition['year'] == int(edition['start'][:4])
            else:
                assert edition.get('periodOnly') and edition.get('label')
        assert 'attendance' not in row and 'reputation' not in row
    for c in coverage:
        assert c['eventCount'] == sum(e['city'] == c['city'] for e in audit['events'])

    # Integrate only in a private copy of inputs, so other sessions cannot collide.
    fixture = PRIVATE / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for path in (ROOT / 'data').glob('*.json'):
        shutil.copy2(path, fixture / 'data' / path.name)
    fees = read(fixture / 'data/fiere-costi.json')
    new_fee_ids = {r['eventId'] for r in delta['pricingRecords']}
    assert len(new_fee_ids) == 3
    assert not new_fee_ids & fees['events'].keys()
    for record in delta['pricingRecords']:
        fees['events'][record['eventId']] = {k: v for k, v in record.items() if k != 'eventId'}
    fees['checkedAt'] = '2026-11-05'
    (fixture / 'data/fiere-costi.json').write_text(json.dumps(fees, ensure_ascii=False), encoding='utf-8')

    class AddProvince(ast.NodeTransformer):
        edits = 0

        def visit_For(self, node):
            self.generic_visit(node)
            if (isinstance(node.target, ast.Tuple)
                    and [x.id for x in node.target.elts if isinstance(x, ast.Name)] == ['province', 'filename']):
                assert isinstance(node.iter, ast.Tuple)
                assert not any(isinstance(x, ast.Tuple) and x.elts[0].value == "L'Aquila" for x in node.iter.elts)
                node.iter.elts.append(ast.Tuple(elts=[ast.Constant("L'Aquila"), ast.Constant('fiere-laquila.json')], ctx=ast.Load()))
                self.edits += 1
            return node

    tree = ast.parse((ROOT / 'scripts/build-fiere.py').read_text(encoding='utf-8'))
    transform = AddProvince()
    tree = ast.fix_missing_locations(transform.visit(tree))
    assert transform.edits == 1
    namespace = {'__file__': str(ROOT / 'scripts/build-fiere.py'), '__name__': 'laquila_fixture'}
    exec(compile(tree, 'laquila_fixture', 'exec'), namespace)
    namespace['ROOT'] = fixture
    namespace['CATALOG_DATE'] = '2026-11-05'
    build = namespace['build_catalog']
    build()
    first_hash = digest(fixture / 'data/fiere.json')
    build()
    assert first_hash == digest(fixture / 'data/fiere.json'), 'Build non ripetibile'
    result = read(fixture / 'data/fiere.json')
    old_by_id = {e['id']: e for e in previous['events']}
    new_by_id = {e['id']: e for e in result['events']}
    assert len(new_by_id) == len(result['events'])
    assert old_by_id.keys() <= new_by_id.keys(), 'ID precedente perso'
    assert all(e == new_by_id[i] for i, e in old_by_id.items()), 'Scheda precedente modificata'
    added_ids = new_by_id.keys() - old_by_id.keys()
    assert added_ids == set(delta['addedIds']) and len(added_ids) == 30
    assert all(new_by_id[i]['province'] == "L'Aquila" for i in added_ids)
    assert delta['preservedEvents'] == [e for e in previous['events'] if e['province'] == "L'Aquila"]
    if len(previous['events']) == delta['baseCatalogCount']:
        assert digest(ROOT / 'data/fiere.json') == delta['baseCatalogSha256']
    assert len(new_by_id) == len(old_by_id) + 30
    assert {p: digest(p) for p in original_hashes} == original_hashes, 'Input condiviso alterato'
    assert new_by_id['abruzzo-l-aquila-fiera-dell-epifania'] == old_by_id['abruzzo-l-aquila-fiera-dell-epifania']
    assert new_by_id['abruzzo-l-aquila-fiera-di-pasqua-a-paganica']['editions'] == []
    assert new_by_id['abruzzo-l-aquila-fiera-di-san-massimo']['editions'] == []
    assert new_by_id['abruzzo-l-aquila-fiera-di-ognissanti-a-paganica']['editions'] == []
    assert new_by_id['abruzzo-campo-di-giove-mercatini-di-natale-il-borgo-incantato']['editions'][0]['periodOnly']
    assert new_by_id['abruzzo-san-demetrio-ne-vestini-fiera-delle-bucalette']['editions'][0]['year'] == 2025
    assert new_by_id['abruzzo-tornimparte-antica-fiera-di-tornimparte']['editions'][0]['start'] == '2026-10-18'
    assert new_by_id['abruzzo-l-aquila-fiera-di-ottobre-ad-arischia']['editions'][0]['end'] == '2026-10-11'
    assert [(d['start'], d['end']) for d in new_by_id['abruzzo-pratola-peligna-fiera-della-madonna-della-libera']['editions']] == [('2026-05-02', '2026-05-03'), ('2026-05-09', '2026-05-10')]
    assert new_by_id['abruzzo-sulmona-caccia-all-affare-mercatino-vintage']['merchandiseSectors'] == ['non-alimentare', 'antiquariato']
    assert len([e for e in result['events'] if e.get('pricing') and e['id'] in added_ids]) == 3
    counts = Counter('con-date-2026' if any(d.get('start', '').startswith('2026') for d in e.get('editions', []))
                     else 'storico' if any(d.get('start') for d in e.get('editions', []))
                     else 'periodo-stagione' if e.get('editions') else 'ricorrenza-o-preesistente' for e in audit['events'])
    report = dict(status='passed',province="L'Aquila",catalogBefore=len(old_by_id),catalogFixture=len(new_by_id),added=30,
                  previousUnchanged=len(old_by_id),municipalities=108,eventMunicipalities=23,provincialEvents=31,
                  editionTypes=dict(counts),pricingRecords=3,repeatableBuild=True,fixtureCatalogSha256=first_hash,
                  centralFilesUnchanged=True,limits='Fixture dati; nessun controllo browser, pubblicazione o sincronizzazione database eseguiti. Integrazione centrale da verificare separatamente.')
    PRIVATE.mkdir(parents=True, exist_ok=True)
    (PRIVATE / 'risultato.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=True, indent=2))


if __name__ == '__main__':
    main()
