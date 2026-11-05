"""Verifica offline del solo delta RC. Non esegue builder, rete, DB o deploy.

python scripts/verify-fiere-reggio-calabria-20261105.py --self-test
python scripts/verify-fiere-reggio-calabria-20261105.py --catalog percorso/catalogo-centrale.json
Gli artefatti di prova sono scritti esclusivamente nella .local del worktree.
"""
import argparse
import copy
from collections import Counter
from datetime import date
import hashlib
import json
import math
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / '.local/ricerche/fiere-reggio-calabria-20261105'
PREFIX = 'fiere-reggio-calabria-'
BASE_SHA = 'c10d80e2cb4713ac50af583eebdf5fcbe7b0ac81c73cc3a8b980e9ee9785adb7'


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()


def slug(value):
    plain = ''.join(c for c in unicodedata.normalize('NFD', value) if not unicodedata.combining(c))
    return re.sub('[^a-z0-9]+', '-', plain.lower()).strip('-')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate(delta, audit, fees, catalog):
    old = catalog['events']
    ids = [e['id'] for e in old]
    require(len(ids) == len(set(ids)), 'ID duplicati nella base')
    require(delta['province'] == audit['province'] == fees['province'] == 'Reggio Calabria', 'Provincia errata')
    require(delta['mode'] == 'append-only', 'Il delta deve essere append-only')
    added = delta['events']
    new_ids = [e['id'] for e in added]
    require(len(new_ids) == len(set(new_ids)), 'ID duplicati nel delta')
    require(not set(ids) & set(new_ids), 'Collisione ID con catalogo centrale')
    identities = {(slug(e['city']), slug(e['name'])) for e in old if e['region'] == 'Calabria'}
    require(not identities & {(slug(e['city']), slug(e['name'])) for e in added}, 'Identità già presente')
    require(set(fees['events']) <= set(new_ids), 'Costo riferito a ID estraneo al delta')
    source_urls = {s['url'] for s in audit['sources']}
    require(len(source_urls) == len(audit['sources']), 'Fonti duplicate')
    evidence = {e['eventId']: e for e in audit['eventEvidence']}
    require(len(evidence) == len(audit['eventEvidence']) and set(evidence) == set(new_ids), 'Evidenze incomplete')
    communes = [c for c in read(ROOT / 'data/comuni-picker.json') if c['sigla'] == 'RC']
    expected = {c['nome']: c['codiceIstat'] for c in communes}
    coverage = audit['municipalityCoverage']
    require(len(coverage) == 97 and {c['city']: c['istat'] for c in coverage} == expected, 'Copertura nominale non completa')
    locations = {c['nome']: c for c in read(ROOT / 'data/comuni.json') if c['regione'] == 'Calabria'}
    for row in coverage:
        actual = [e['id'] for e in added if e['city'] == row['city']]
        require(row['eventCount'] == len(actual) and row['eventIds'] == actual, 'Conteggio comunale incoerente')
        require(row['query'] and row['outcome'] and row['limit'], 'Esito comunale mancante')
    for e in added:
        require(e['region'] == 'Calabria' and e['province'] == 'Reggio Calabria' and e['city'] in expected, 'Scheda fuori provincia')
        require(e['id'] == slug(e['region'] + '-' + e['city'] + '-' + e['name']), 'ID non canonico')
        require(e['category'] in {'tradizionale', 'artigianato', 'sagra', 'mercatino', 'espositiva'}, 'Categoria errata')
        require(e['months'] and len(e['months']) == len(set(e['months'])) and all(type(m) is int and 1 <= m <= 12 for m in e['months']), 'Mesi errati')
        require(e['source']['url'] in source_urls and e['source']['checkedAt'] == '2026-11-05', 'Fonte principale mancante')
        require(set(e['sourceRecordIds']) <= source_urls, 'Fonte secondaria mancante')
        require(all(url.startswith('https://') for url in e['sourceRecordIds']), 'URL non HTTPS')
        require(not any(k in e for k in ['attendance', 'reputation', 'pricing']), 'Affluenza, notorietà o costi mescolati nel delta')
        require(set(e['merchandiseSectors']) <= {'alimentare', 'non-alimentare', 'artigianato', 'antiquariato'}, 'Settori errati')
        for field in ['lat', 'lng']:
            require(isinstance(e[field], (int, float)) and math.isfinite(e[field]) and e[field] == locations[e['city']][field], 'Coordinate non comunali')
        status = evidence[e['id']]['temporalStatus']
        require(bool(e['editions']) == (status != 'periodo-ricorrente'), 'Periodo promosso a data')
        for edition in e['editions']:
            start, end = date.fromisoformat(edition['start']), date.fromisoformat(edition['end'])
            require(start <= end and start.year == edition['year'], 'Date incoerenti')
            require(edition['dateType'] == 'confirmed' and edition['sourceUrl'] in e['sourceRecordIds'], 'Conferma senza fonte')
            require(status == ('edizione-2026-documentata' if start.year == 2026 else 'storico'), 'Storico classificato come corrente')
        require(e['participation']['type'] in {'check', 'public', 'selected', 'exhibitors'}, 'Partecipazione errata')
        if 'deadline' in e['participation']:
            date.fromisoformat(e['participation']['deadline'])
    for eid, fee in fees['events'].items():
        require(fee['kind'] in {'fee', 'unit', 'partial', 'free', 'conditional'}, 'Tipo costo errato')
        require(fee['sourceUrl'] in source_urls and fee['details'] and fee['period'] in {'2025', '2026'}, 'Costo senza anno o fonte')
        require(fee['checkedAt'] == '2026-11-05' and 0 < len(fee['label']) <= 160, 'Metadati costo errati')
    return new_ids


def append_fixture(catalog, added, fees):
    result = copy.deepcopy(catalog)
    for event in copy.deepcopy(added):
        if event['id'] in fees['events']:
            event['pricing'] = copy.deepcopy(fees['events'][event['id']])
            event['participation']['costs'] = event['pricing']['details']
        result['events'].append(event)
    return result


def preserve(before, after, new_ids):
    old, rows = before['events'], after['events']
    require(len(rows) == len(old) + len(new_ids), 'Conteggio append errato')
    require(rows[:len(old)] == old, 'Scheda preesistente modificata, riordinata o rimossa')
    require([e['id'] for e in rows[len(old):]] == new_ids, 'Delta non appeso in ordine')
    require(len({e['id'] for e in rows}) == len(rows), 'Collisione nel risultato')
    require(digest(rows[:len(old)]) == digest(old), 'Impronta preesistenti cambiata')
    require({k:v for k,v in before.items() if k != 'events'} == {k:v for k,v in after.items() if k != 'events'}, 'Metadati fixture alterati')


def negative_tests(base, result, ids, delta, audit, fees):
    tests = []
    def rejects(name, fn):
        try:
            fn()
        except ValueError:
            tests.append(name)
        else:
            raise ValueError('Controllo negativo non respinto: ' + name)
    changed = copy.deepcopy(result); changed['events'][0]['name'] += ' ALTERATO'
    rejects('modifica-scheda-preesistente', lambda: preserve(base, changed, ids))
    removed = copy.deepcopy(result); removed['events'].pop(0)
    rejects('rimozione-preesistente', lambda: preserve(base, removed, ids))
    collision = copy.deepcopy(delta); collision['events'][0]['id'] = base['events'][0]['id']
    rejects('collisione-ID-base', lambda: validate(collision, audit, fees, base))
    duplicate = copy.deepcopy(delta); duplicate['events'].append(duplicate['events'][0])
    rejects('duplicato-delta', lambda: validate(duplicate, audit, fees, base))
    foreign = copy.deepcopy(delta); foreign['events'][0]['province'] = 'Cosenza'
    rejects('scheda-fuori-provincia', lambda: validate(foreign, audit, fees, base))
    bad_fees = copy.deepcopy(fees); bad_fees['events'][base['events'][0]['id']] = next(iter(fees['events'].values()))
    rejects('costi-su-scheda-preesistente', lambda: validate(delta, audit, bad_fees, base))
    promoted = copy.deepcopy(delta); promoted['events'][0]['editions'] = [copy.deepcopy(delta['events'][2]['editions'][0])]
    rejects('periodo-promosso-a-data', lambda: validate(promoted, audit, fees, base))
    return tests


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--catalog', type=Path, default=ROOT / 'data/fiere.json')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    delta = read(ROOT / ('data/' + PREFIX + 'delta-20261105.json'))
    audit = read(ROOT / ('data/' + PREFIX + 'ricognizione-20261105.json'))
    fees = read(ROOT / ('data/' + PREFIX + 'costi-20261105.json'))
    catalog = read(args.catalog)
    ids = validate(delta, audit, fees, catalog)
    result = append_fixture(catalog, delta['events'], fees)
    preserve(catalog, result, ids)
    # La base della ricerca è obbligatoria per la prova completa, non per la verifica su una base centrale futura.
    baseline_path = PRIVATE / 'baseline-fiere.json'
    baseline_report = None
    if baseline_path.exists():
        require(hashlib.sha256(baseline_path.read_bytes()).hexdigest() == BASE_SHA == delta['baseCatalogSha256'], 'Fixture base differente dalla ricerca')
        baseline = read(baseline_path)
        require(len(baseline['events']) == delta['baseCount'] == 9587, 'Conteggio base inatteso')
        current_by_id = {e['id']: e for e in catalog['events']}
        unchanged = all(current_by_id.get(e['id']) == e for e in baseline['events'])
        baseline_report = dict(count=9587, sha256=BASE_SHA, unchangedInInput=unchanged)
        if args.catalog.resolve() == (ROOT/'data/fiere.json').resolve():
            require(args.catalog.read_bytes() == baseline_path.read_bytes(), 'Catalogo nazionale locale modificato')
    if args.self_test:
        require(baseline_path.exists(), 'Manca la fixture privata della ricerca')
    tests = negative_tests(catalog, result, ids, delta, audit, fees) if args.self_test else []
    originals = []
    for manifest_path in sorted(PRIVATE.glob('manifest-fonti*.json')):
        for record in read(manifest_path):
            if record.get('file'):
                path = PRIVATE / record['file']
                require(hashlib.sha256(path.read_bytes()).hexdigest() == record['sha256'], 'Originale alterato: '+record['file'])
                originals.append(record['file'])
    # Solo output privati, nessuna modifica al catalogo indicato da --catalog.
    PRIVATE.mkdir(parents=True, exist_ok=True)
    write(PRIVATE/'fixture-append.json', result)
    report = dict(status='PASS', inputCatalog=str(args.catalog), before=len(catalog['events']), added=len(ids), after=len(result['events']),
        previousRecordsUnchanged=True, previousSemanticSha256=digest(catalog['events']),
        previousPerRecordSha256={e['id']:digest(e) for e in catalog['events']},
        sourceBaseline=baseline_report, municipalities=len(audit['municipalityCoverage']),
        eventMunicipalities=len({e['city'] for e in delta['events']}), costRecords=len(fees['events']),
        temporalCounts=dict(Counter(e['temporalStatus'] for e in audit['eventEvidence'])),
        negativeTests=tests, downloadedOriginalsVerified=len(originals),
        note='Fixture offline; nessun builder, browser del sito, database, rete, pubblicazione o spunta online.')
    write(PRIVATE/'verifica.json', report)
    summary = {k:v for k,v in report.items() if k != 'previousPerRecordSha256'}
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
