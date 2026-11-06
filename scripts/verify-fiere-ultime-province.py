"""Reproduce the final Pavia/Nuoro research against the preserved Git baseline.

Run python -B scripts/verify-fiere-ultime-province.py; output stays in .local/.
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
BASE = 'e6228235055e01c2942fb12166d3ec169c0ef167'
OUT = ROOT / '.local/verifiche/ultime-province-20261106'

def read(p):
    return json.loads(p.read_text(encoding='utf-8'))

def write(p, data):
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def reproduce():
    fixture = OUT / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for file in (ROOT / 'data').glob('*.json'):
        shutil.copy2(file, fixture / 'data' / file.name)
    baseline = {}
    for name in ['fiere.json', 'fiere-fonti.json', 'fiere-costi.json']:
        raw = subprocess.check_output(['git', 'show', BASE + ':data/' + name], cwd=ROOT)
        baseline[name] = json.loads(raw.decode('utf-8'))
        (fixture / 'data' / name).write_bytes(raw)
    old = baseline['fiere.json']['events']
    old_by_id = {e['id']: e for e in old}
    old_costs = json.loads(json.dumps(baseline['fiere-costi.json']['events']))
    assert len(old) == 10266 and len(old_costs) == 477
    spec = importlib.util.spec_from_file_location('final_provinces_builder', ROOT / 'scripts/build-fiere.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.ROOT = fixture
    builder.build_catalog()
    assert read(fixture / 'data/fiere.json')['events'] == old
    rows = baseline['fiere-fonti.json']
    ledger = baseline['fiere-costi.json']
    new_ids, updated_ids, cost_ids = set(), set(), set()
    counts = {}
    event_key = lambda e: builder.key(e['region'] + '-' + e['city'] + '-' + e['name'])
    for slug, province in [('pavia', 'Pavia'), ('nuoro', 'Nuoro')]:
        delta = read(ROOT / ('data/fiere-' + slug + '-finale-delta.json'))
        fees = read(ROOT / ('data/fiere-' + slug + '-finale-costi.json'))
        audit = read(ROOT / ('data/fiere-' + slug + '-finale-ricognizione.json'))
        assert delta['province'] == fees['province'] == province
        local_new = set()
        for event in delta['events']:
            identity = event_key(event)
            assert event['id'] == identity
            assert identity not in old_by_id and identity not in new_ids
            assert not {'attendance', 'reputation'} & set(event)
            assert event['source']['url'].startswith('https://')
            assert event['source']['checkedAt'] == '2026-11-06'
            new_ids.add(identity)
            local_new.add(identity)
            rows.append(event)
        for update in delta.get('existingUpdates', []):
            identity = update['id']
            assert old_by_id[identity]['province'] == province
            assert identity not in updated_ids
            after = update.get('after', update.get('replacement'))
            assert event_key(after) == identity
            before_source = update.get('beforeSource', update.get('initial'))
            matches = [i for i, e in enumerate(rows) if event_key(e) == identity]
            if matches:
                assert len(matches) == 1 and rows[matches[0]] == before_source
                rows[matches[0]] = after
            else:
                assert update.get('operation') == 'append-editorial-override'
                assert update['before'] == old_by_id[identity]
                rows.append(after)
            updated_ids.add(identity)
        assert not fees.get('existingUpdates'), 'Existing cost updates require a specific preservation review'
        for identity, price in fees['events'].items():
            assert identity in local_new and identity not in ledger['events']
            assert price['sourceUrl'].startswith('https://')
            ledger['events'][identity] = price
            cost_ids.add(identity)
        assert audit['province'] == province
        expected_cities = ({r['nome'] for r in read(ROOT / 'data/comuni.json') if r['provincia'] == province}
                           if province == 'Pavia' else
                           {city for city, p in read(ROOT / 'data/italia-province.json')['sardiniaMunicipalities'].items() if p == province})
        municipalities = audit['municipalities']
        assert len(municipalities) == len(expected_cities) == (186 if province == 'Pavia' else 53)
        assert {r['city'] for r in municipalities} == expected_cities
        for row in municipalities:
            assert row['queryExecuted'] and row['queries'] and row['queryEvidence'] and row['outcome']
            assert set(row['newIds']) == {e['id'] for e in delta['events'] if e['city'] == row['city']}
        counts[province] = dict(newEvents=len(local_new), sourceUpdates=len(delta.get('existingUpdates', [])),
                                newCosts=len(fees['events']), municipalities=len(municipalities),
                                municipalitiesWithNewEvents=len({e['city'] for e in delta['events']}))
    write(fixture / 'data/fiere-fonti.json', rows)
    write(fixture / 'data/fiere-costi.json', ledger)
    builder.build_catalog()
    raw = (fixture / 'data/fiere.json').read_bytes()
    result = read(fixture / 'data/fiere.json')
    current = {e['id']: e for e in result['events']}
    assert len(current) == len(old) + len(new_ids)
    assert set(current) == set(old_by_id) | new_ids
    protected = [e for e in old if e['id'] not in updated_ids]
    assert [e for e in result['events'] if e['id'] in old_by_id and e['id'] not in updated_ids] == protected
    for slug, province in [('pavia', 'Pavia'), ('nuoro', 'Nuoro')]:
        delta = read(ROOT / ('data/fiere-' + slug + '-finale-delta.json'))
        assert all(current[e['id']]['province'] == province for e in delta['events'])
        assert all(current[e['id']]['province'] == province for e in delta.get('existingUpdates', []))
    assert all(ledger['events'][k] == v for k, v in old_costs.items())
    assert all(current[k]['pricing'] == ledger['events'][k] for k in cost_ids)
    builder.build_catalog()
    assert raw == (fixture / 'data/fiere.json').read_bytes()
    report = dict(ok=True, baseline=BASE, baselineEvents=len(old), newEvents=len(new_ids),
                  updatedEvents=len(updated_ids), protectedEvents=len(protected), total=len(current),
                  baselineCostsPreserved=len(old_costs), newCosts=len(cost_ids), provinces=counts,
                  otherRecordsPreservedInOrder=True, repeatedBuildIdentical=True,
                  catalogSha256=hashlib.sha256(raw).hexdigest())
    write(OUT / 'checks.json', report)
    write(OUT / 'manifest.json', dict(newIds=sorted(new_ids), updatedIds=sorted(updated_ids), costIds=sorted(cost_ids), counts=counts))
    print(json.dumps(report))

if __name__ == '__main__':
    reproduce()
