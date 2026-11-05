"""Verifica isolata del delta Catanzaro, senza scritture nei dati condivisi.

python scripts/verify-fiere-catanzaro.py
Le fixture e le prove restano in .local/verifiche/catanzaro-20261105/.
"""
import copy
import hashlib
import json
import re
import shutil
import subprocess
import unicodedata
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DELTA = ROOT / 'data/fiere-catanzaro-delta.json'
COSTS = ROOT / 'data/fiere-catanzaro-costi.json'
AUDIT = ROOT / 'data/fiere-catanzaro-ricognizione.json'


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def normalized(value):
    plain = unicodedata.normalize('NFD', value)
    return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in plain if not unicodedata.combining(c)).lower()).strip('-')


def assert_append_only(before, after, additions):
    old = {e['id']: e for e in before}
    new = {e['id']: e for e in after}
    assert len(old) == len(before) and len(new) == len(after), 'ID duplicati'
    assert not set(old).intersection(additions), 'Collisione con ID preesistente'
    assert set(new) == set(old) | set(additions), 'Rimozioni o aggiunte inattese'
    assert all(new[k] == v for k, v in old.items()), 'Scheda preesistente modificata'


def main():
    assert DELTA.resolve().is_relative_to(ROOT.resolve())
    delta, costs, audit = read(DELTA), read(COSTS), read(AUDIT)
    base = read(ROOT / 'data/fiere.json')
    municipalities = {c['nome']: c for c in read(ROOT / 'data/comuni.json') if c['sigla'] == 'CZ'}
    assert delta['province'] == costs['province'] == audit['province'] == 'Catanzaro'
    assert delta['mode'] == 'append-only'
    assert len(municipalities) == 80
    coverage = audit['municipalityCoverage']
    assert len(coverage) == 80 and {c['city'] for c in coverage} == set(municipalities)
    events = delta['events']
    ids = [e['id'] for e in events]
    assert len(ids) == len(set(ids))
    assert not set(ids).intersection(e['id'] for e in base['events']), 'ID già presente: integrazione già fatta o collisione'
    assert set(costs['events']) <= set(ids), 'Costo assegnato a scheda precedente o estranea'
    assert not any(any(field in e for field in ('reputation', 'attendance')) for e in events)
    for e in events:
        assert e['region'] == 'Calabria' and e['city'] in municipalities
        assert e['id'] == normalized('Calabria-' + e['city'] + '-' + e['name'])
        assert e['source']['url'].startswith('https://')
        assert e['category'] in {'tradizionale', 'sagra', 'espositiva', 'artigianato', 'mercatino'}
        months = [int(m) for m in e['months'].split(',')]
        assert len(months) == len(set(months)) and all(1 <= m <= 12 for m in months)
        for ed in e.get('editions', []):
            assert ed['dateType'] in {'confirmed', 'calendar'}
            assert ed['sourceUrl'].startswith('https://')
            if ed.get('start'):
                start, end = date.fromisoformat(ed['start']), date.fromisoformat(ed['end'])
                assert start <= end and start.year == ed['year']
                assert set(range(start.month, end.month + 1)) <= set(months)
            else:
                assert ed.get('label') and ed.get('periodOnly') is True
        if e['research']['temporalStatus'] == 'recurring-period':
            assert not e.get('editions'), 'Ricorrenza trasformata in edizione'
        if e['research']['temporalStatus'] == 'historical-edition':
            assert all(ed['year'] < 2026 for ed in e['editions'])
    for town in coverage:
        assert town['newEventIds'] == [e['id'] for e in events if e['city'] == town['city']]
        assert town['istat'] == municipalities[town['city']]['codiceIstat']
        assert town['finding'] and town['limitation']

    # Hash di tutti i file già versionati: nessuna scrittura al checkout è permessa.
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    protected = {rel: digest((ROOT / rel).read_bytes()) for rel in tracked if rel and (ROOT / rel).is_file()}
    evidence = ROOT / '.local/ricerche/catanzaro-20261105'
    source_manifest = evidence / 'manifest-fonti.json'
    checked_sources = 0
    if source_manifest.exists():
        for record in read(source_manifest)['records']:
            if record.get('file') and record.get('sha256'):
                path = (evidence / record['file']).resolve()
                assert path.is_relative_to(evidence.resolve())
                assert digest(path.read_bytes()) == record['sha256'], 'Originale fonte alterato'
                checked_sources += 1

    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    fixture = ROOT / '.local/verifiche/catanzaro-20261105' / stamp
    fixture_data = fixture / 'data'
    fixture_data.mkdir(parents=True)
    for path in (ROOT / 'data').glob('*.json'):
        shutil.copy2(path, fixture_data / path.name)
    builder = (ROOT / 'scripts/build-fiere.py').read_text(encoding='utf-8')
    # Prima prova: builder effettivo, immutato, diretto alla sola fixture privata.
    ns = {'__file__': str(fixture / 'scripts/build-fiere.py'), '__name__': 'catanzaro_fixture'}
    exec(compile(builder, str(ROOT / 'scripts/build-fiere.py'), 'exec'), ns)
    ns['ROOT'] = fixture
    ns['build_catalog']()
    rebuilt = read(fixture_data / 'fiere.json')
    assert rebuilt == base, 'Catalogo base non riproducibile: interrompere integrazione'
    shutil.copy2(fixture_data / 'fiere.json', fixture / 'catalogo-prima.json')
    previous_fees = read(fixture_data / 'fiere-costi.json')
    old_fees = copy.deepcopy(previous_fees['events'])
    assert not set(old_fees).intersection(costs['events'])
    previous_fees['events'].update(costs['events'])
    previous_fees['checkedAt'] = delta['checkedAt']
    (fixture_data / 'fiere-costi.json').write_text(json.dumps(previous_fees, ensure_ascii=False), encoding='utf-8')
    # Adattatore solo in memoria: append dopo gli overlay provinciali/comunali.
    # Non usa il ramo del builder che rimpiazza tutte le schede di una provincia.
    marker = '    events = []\n    fee_research = '
    assert builder.count(marker) == 1, 'Builder cambiato: rivedere il punto append'
    patched = builder.replace(marker, '    combined.extend(CATANZARO_ADDITIONS)\n' + marker, 1)
    (fixture / 'builder-fixture.py').write_text(patched, encoding='utf-8')
    ns = {'__file__': str(fixture / 'scripts/build-fiere.py'), '__name__': 'catanzaro_fixture', 'CATANZARO_ADDITIONS': events}
    exec(compile(patched, str(fixture / 'builder-fixture.py'), 'exec'), ns)
    ns.update(ROOT=fixture, CATALOG_DATE=delta['checkedAt'])
    ns['build_catalog']()
    after = read(fixture_data / 'fiere.json')
    assert_append_only(base['events'], after['events'], ids)
    assert all(previous_fees['events'][k] == v for k, v in old_fees.items())
    assert set(previous_fees['events']) == set(old_fees) | set(costs['events'])
    first = (fixture_data / 'fiere.json').read_bytes()
    ns['build_catalog']()
    assert (fixture_data / 'fiere.json').read_bytes() == first, 'Build non ripetibile'

    # Controlli negativi: il verificatore deve rifiutare collisioni e mutazioni.
    rejected = []
    for case in ('collision', 'mutation', 'removal'):
        damaged = copy.deepcopy(after['events'])
        additions = list(ids)
        if case == 'collision':
            additions.append(base['events'][0]['id'])
        elif case == 'mutation':
            damaged[0]['name'] += ' modifica intenzionale fixture'
        else:
            damaged = damaged[1:]
        try:
            assert_append_only(base['events'], damaged, additions)
        except AssertionError:
            rejected.append(case)
        else:
            raise AssertionError('Caso negativo non rilevato: ' + case)
    assert all(digest((ROOT / rel).read_bytes()) == sha for rel, sha in protected.items()), 'File versionato modificato'
    report = {
        'status': 'passed', 'fixture': str(fixture.relative_to(ROOT)),
        'baseCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'baselineCatalogSha256': digest((ROOT / 'data/fiere.json').read_bytes()),
        'fixtureCatalogSha256': digest(first), 'baselineEvents': len(base['events']),
        'newEvents': len(events), 'fixtureEvents': len(after['events']),
        'allPreexistingRecordsUnchanged': True, 'preexistingCostsUnchanged': len(old_fees),
        'newCostNotes': len(costs['events']), 'municipalities': 80,
        'municipalitiesWithNewEvents': len({e['city'] for e in events}),
        'temporalStatusCounts': dict(Counter(e['research']['temporalStatus'] for e in events)),
        'originalAcquisitionsHashChecked': checked_sources, 'trackedFilesUnchanged': len(protected),
        'negativeControlsRejected': rejected, 'repeatBuildIdentical': True,
        'limitations': 'Verifica dati e builder in fixture privata; nessun browser, deploy, database o verifica online di completamento. La disponibilità degli espositori non è verificata.'}
    (fixture / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
