"""Reproduce the Oristano addition and prove preservation of the publication baseline.

Run python -B scripts/verify-fiere-oristano.py. Writes only to .local/verifiche/.
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
BASE = 'e4b06a329fc7293ccfddf617161be3a6a219369b'
OUT = ROOT / '.local/verifiche/oristano-20261106'

def read(p):
    return json.loads(p.read_text(encoding='utf-8'))

def main():
    fixture = OUT / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for source in (ROOT / 'data').glob('*.json'):
        shutil.copy2(source, fixture / 'data' / source.name)
    baseline = {}
    for name in ['fiere.json', 'fiere-fonti.json', 'fiere-costi.json']:
        raw = subprocess.check_output(['git', 'show', BASE + ':data/' + name], cwd=ROOT)
        baseline[name] = json.loads(raw.decode('utf-8'))
        (fixture / 'data' / name).write_bytes(raw)
    old = baseline['fiere.json']['events']
    assert len(old) == 10202
    old_costs = json.loads(json.dumps(baseline['fiere-costi.json']['events']))
    assert len(old_costs) == 473
    delta = read(ROOT / 'data/fiere-oristano-delta.json')['events']
    costs = read(ROOT / 'data/fiere-oristano-costi.json')['events']
    ids = {e['id'] for e in delta}
    assert len(ids) == len(delta) == 64
    assert not ids & {e['id'] for e in old}
    assert len(costs) == 4 and set(costs) <= ids
    assert not set(costs) & set(old_costs)
    spec = importlib.util.spec_from_file_location('oristano_builder', ROOT / 'scripts/build-fiere.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.ROOT = fixture
    builder.build_catalog()
    assert read(fixture / 'data/fiere.json')['events'] == old
    locations = {r['nome'] for r in read(ROOT / 'data/comuni.json') if r['provincia'] == 'Oristano'}
    for e in delta:
        assert e['city'] in locations and e['region'] == 'Sardegna'
        assert e['id'] == builder.key(e['region'] + '-' + e['city'] + '-' + e['name'])
        assert not {'attendance', 'reputation'} & set(e)
        assert e['source']['checkedAt'] == '2026-11-06'
    audit = read(ROOT / 'data/fiere-oristano-ricognizione.json')['municipalities']
    assert len(audit) == len(locations) == 87
    assert {r['city'] for r in audit} == locations
    for r in audit:
        assert r['queryExecuted'] and r['queries'] and r['queryEvidence'] and r['outcome']
        assert set(r['newIds']) == {e['id'] for e in delta if e['city'] == r['city']}
    rows = baseline['fiere-fonti.json'] + delta
    ledger = baseline['fiere-costi.json']
    ledger['events'].update(costs)
    for name, data in [('fiere-fonti.json', rows), ('fiere-costi.json', ledger)]:
        (fixture / 'data' / name).write_text(json.dumps(data, ensure_ascii=False), encoding='utf-8')
    builder.build_catalog()
    raw = (fixture / 'data/fiere.json').read_bytes()
    result = read(fixture / 'data/fiere.json')
    current = {e['id']: e for e in result['events']}
    assert len(current) == len(old) + len(delta) == 10266
    assert [e for e in result['events'] if e['id'] not in ids] == old
    assert all(current[e['id']]['province'] == 'Oristano' for e in delta)
    assert all(ledger['events'][k] == v for k, v in old_costs.items())
    assert current['sardegna-oristano-sartiglia-commercio-ambulante']['editions'][1]['start'] == '2026-02-17'
    assert current['sardegna-baressa-sagra-della-mandorla']['editions'][0]['start'] == '2026-09-12'
    assert current['sardegna-simaxis-sagra-del-riso']['editions'][0]['year'] == 2024
    assert not current['sardegna-tramatza-sagra-della-cipolla']['editions']
    assert not current['sardegna-soddi-sagra-de-su-cazau']['merchandiseSectors']
    assert all(current[k]['pricing'] == v for k, v in costs.items())
    builder.build_catalog()
    assert raw == (fixture / 'data/fiere.json').read_bytes()
    report = dict(ok=True, baseline=10202, newEvents=64, total=10266,
                  municipalities=87, municipalitiesWithNewEvents=len({e['city'] for e in delta}),
                  oldCostsPreserved=473, newCosts=4, repeatedBuildIdentical=True,
                  allBaselineRecordsPreservedInOrder=True,
                  catalogSha256=hashlib.sha256(raw).hexdigest())
    (OUT / 'checks.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))

if __name__ == '__main__':
    main()
