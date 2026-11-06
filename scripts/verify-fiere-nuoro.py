"""Verifica Nuoro in fixture privata; non modifica catalogo, DB o altre province.

    python -B scripts/verify-fiere-nuoro.py
"""
import sys
sys.dont_write_bytecode = True
import hashlib
import importlib.util
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = 'e622823'
OUT = ROOT / '.local/verifiche/nuoro-finale-20261106'

def read(path):
    return json.loads(path.read_text(encoding='utf8'))

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf8')

def main():
    fixture = OUT / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for source in (ROOT / 'data').glob('*.json'):
        shutil.copy2(source, fixture / 'data' / source.name)
    baseline = {}
    for name in ['fiere.json', 'fiere-fonti.json', 'fiere-costi.json']:
        raw = subprocess.check_output(['git', 'show', BASE + ':data/' + name], cwd=ROOT)
        baseline[name] = json.loads(raw.decode('utf8'))
        (fixture / 'data' / name).write_bytes(raw)
    old = baseline['fiere.json']['events']
    old_costs = json.loads(json.dumps(baseline['fiere-costi.json']['events']))
    assert len(old) == 10266 and len(old_costs) == 477
    delta = read(ROOT / 'data/fiere-nuoro-finale-delta.json')
    events, updates = delta['events'], delta['existingUpdates']
    costs = read(ROOT / 'data/fiere-nuoro-finale-costi.json')['events']
    ids = {e['id'] for e in events}
    updated_ids = {u['id'] for u in updates}
    assert len(ids) == len(events) == 49
    assert len(updated_ids) == len(updates) == 2
    assert not ids & {e['id'] for e in old}
    assert len(costs) == 6 and set(costs) <= ids and not set(costs) & set(old_costs)
    spec = importlib.util.spec_from_file_location('nuoro_builder', ROOT / 'scripts/build-fiere.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.ROOT = fixture
    builder.build_catalog()
    assert read(fixture / 'data/fiere.json')['events'] == old
    provinces = read(ROOT / 'data/italia-province.json')['sardiniaMunicipalities']
    locations = {name for name, province in provinces.items() if province == 'Nuoro'}
    assert len(locations) == 53 and provinces['Seulo'] == 'Nuoro'
    assert provinces['Seui'] == 'Ogliastra' and provinces['Tortolì'] == 'Ogliastra'
    assert provinces['San Teodoro'] == 'Gallura Nord-Est Sardegna'
    for e in events:
        assert e['city'] in locations and e['region'] == 'Sardegna'
        assert e['id'] == builder.key(e['region'] + '-' + e['city'] + '-' + e['name'])
        assert not {'attendance', 'reputation'} & set(e)
        assert e['source']['checkedAt'] == '2026-11-06'
    audit = read(ROOT / 'data/fiere-nuoro-finale-ricognizione.json')['municipalities']
    assert len(audit) == 53 and {r['city'] for r in audit} == locations
    for r in audit:
        assert r['queryExecuted'] and r['queries'] and r['queryEvidence'] and r['outcome']
        assert set(r['newIds']) == {e['id'] for e in events if e['city'] == r['city']}
        for path in r['queryEvidence']:
            local = ROOT / path
            if local.exists():
                assert r['city'] in local.read_text(encoding='utf8')
    evidence_root = ROOT / '.local/ricerche/nuoro-finale-20261106'
    manifest_path = evidence_root / 'manifest.json'
    if manifest_path.exists():
        for item in read(manifest_path):
            assert hashlib.sha256((evidence_root / item['file']).read_bytes()).hexdigest() == item['sha256']
    rows = baseline['fiere-fonti.json']
    for update in updates:
        matches = [i for i, row in enumerate(rows) if builder.key(row['region'] + '-' + row['city'] + '-' + row['name']) == update['id']]
        assert len(matches) == 1 and rows[matches[0]] == update['initial']
        replacement = update['replacement']
        assert builder.key(replacement['region'] + '-' + replacement['city'] + '-' + replacement['name']) == update['id']
        rows[matches[0]] = replacement
    rows.extend(events)
    ledger = baseline['fiere-costi.json']
    ledger['events'].update(costs)
    write(fixture / 'data/fiere-fonti.json', rows)
    write(fixture / 'data/fiere-costi.json', ledger)
    builder.build_catalog()
    raw = (fixture / 'data/fiere.json').read_bytes()
    result = read(fixture / 'data/fiere.json')['events']
    current = {e['id']: e for e in result}
    assert len(current) == len(old) + 49 == 10315
    assert [e for e in result if e['id'] not in ids | updated_ids] == [e for e in old if e['id'] not in updated_ids]
    assert all(current[e['id']]['province'] == 'Nuoro' for e in events)
    assert all(ledger['events'][k] == v for k, v in old_costs.items())
    assert all(current[k]['pricing'] == v for k, v in costs.items())
    assert current['sardegna-tonara-sagra-del-torrone']['months'] == [4]
    assert current['sardegna-tonara-sagra-del-torrone']['editions'][0]['start'] == '2026-04-06'
    assert current['sardegna-aritzo-sagra-della-castagna-e-della-nocciola']['editions'][0]['start'] == '2026-10-24'
    by_city = {e['city']: e for e in events if 'Autunno in Barbagia' in e['name']}
    assert by_city['Oliena']['editions'][0]['start'] == '2026-09-11'
    assert by_city['Dorgali']['editions'][0]['start'] == '2026-09-26'
    assert by_city['Tonara']['editions'][0]['start'] == '2026-10-10'
    assert by_city['Seulo']['city'] == 'Seulo'
    historical = next(e for e in events if e['city'] == 'Dorgali' and e['category'] == 'mercatino')
    assert [(d['start'], d['end']) for d in current[historical['id']]['editions']] == [('2025-12-08','2025-12-08'),('2025-12-13','2025-12-13')]
    assert all(not e['editions'] for e in result if e['id'] in ids and e['name'] in ['Sagra del Vino', 'Sagra delle Ciliegie', 'Sagra de Su Ischidu'])
    other_sardinia = [e for e in old if e['region'] == 'Sardegna' and e['province'] != 'Nuoro']
    assert [e for e in result if e['region'] == 'Sardegna' and e['province'] != 'Nuoro'] == other_sardinia
    builder.build_catalog()
    assert raw == (fixture / 'data/fiere.json').read_bytes()
    report = dict(ok=True, baseline=10266, newEvents=49, explicitExistingUpdates=2,
                  total=10315, municipalities=53, municipalitiesWithNewEvents=38,
                  oldCostsPreserved=477, newCosts=6, otherSardinianRecordsPreserved=len(other_sardinia),
                  allOtherProvincesAndUnmodifiedIDsPreservedInOrder=True,
                  repeatedBuildIdentical=True, catalogSha256=hashlib.sha256(raw).hexdigest())
    write(OUT / 'checks.json', report)
    print(json.dumps(report))

if __name__ == '__main__':
    main()
