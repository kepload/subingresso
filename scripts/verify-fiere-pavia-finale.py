"""Verify the Pavia delivery using the actual builder in a private fixture.

python -B scripts/verify-fiere-pavia-finale.py
No application, shared data or database is written.
"""
import sys
sys.dont_write_bytecode = True
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent.parent
BASE = 'e622823'
OUT = ROOT / '.local/verifiche/pavia-finale-20261106'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

def main():
    fixture = OUT / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for path in (ROOT / 'data').glob('*.json'):
        shutil.copy2(path, fixture / 'data' / path.name)
    base = {}
    for name in ['fiere.json', 'fiere-fonti.json', 'fiere-costi.json', 'fiere-importate.json']:
        raw = subprocess.check_output(['git', 'show', BASE+':data/'+name], cwd=ROOT)
        base[name] = json.loads(raw.decode('utf-8'))
        (fixture / 'data' / name).write_bytes(raw)
    old = base['fiere.json']['events']
    before = {e['id']: e for e in old}
    oldfees = base['fiere-costi.json']['events']
    assert len(old) == 10266 and len(oldfees) == 477
    delta = read(ROOT / 'data/fiere-pavia-finale-delta.json')
    events = delta['events']
    changes = delta['existingUpdates']
    fees = read(ROOT / 'data/fiere-pavia-finale-costi.json')
    audit = read(ROOT / 'data/fiere-pavia-finale-ricognizione.json')
    ids = {e['id'] for e in events}
    changed = {e['id'] for e in changes}
    assert len(events) == len(ids) == 128 and not ids & before.keys()
    assert len(changes) == len(changed) == 4 and changed <= before.keys()
    assert len(fees['events']) == 4 and set(fees['events']) <= ids
    assert not fees['existingUpdates'] and not fees['events'].keys() & oldfees.keys()
    assert fees['initialState'] == {k: None for k in fees['events']}
    spec = importlib.util.spec_from_file_location('pavia_builder', ROOT / 'scripts/build-fiere.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.ROOT = fixture
    builder.build_catalog()
    assert read(fixture / 'data/fiere.json')['events'] == old, 'Baseline build differs'
    locations = {c['nome'] for c in read(ROOT / 'data/comuni.json') if c['provincia'] == 'Pavia'}
    assert len(locations) == 186
    assert {r['city'] for r in audit['municipalities']} == locations
    assert len(audit['municipalities']) == 186
    assert len({r['currentMunicipality'] for r in audit['municipalities']}) == 185
    for row in audit['municipalities']:
        assert row['queryExecuted'] and row['queries'] and row['queryEvidence'] and row['outcome']
        assert set(row['newIds']) == {e['id'] for e in events if e['city'] == row['city']}
        assert set(row['updatedIds']) == {e['id'] for e in changes if e['before']['city'] == row['city']}
    for event in events:
        assert event['city'] in locations and event['region'] == 'Lombardia'
        assert event['source']['checkedAt'] == '2026-11-06'
        assert event['id'] == builder.key('Lombardia-'+event['city']+'-'+event['name'])
        assert not {'attendance', 'reputation'} & event.keys()
    rows = base['fiere-fonti.json'] + events
    imported = base['fiere-importate.json']['events']
    for change in changes:
        assert change['before'] == before[change['id']]
        assert change['before']['province'] == 'Pavia'
        assert change['beforeSource'] in imported
        after = change['after']
        assert after['city'] == change['before']['city']
        assert after['name'] == change['before']['name']
        assert change['id'] == builder.key(after['region']+'-'+after['city']+'-'+after['name'])
        assert not any(r['city'] == after['city'] and r['name'] == after['name'] for r in rows)
        rows.append(after)
    ledger = base['fiere-costi.json']
    ledger['events'].update(fees['events'])
    write(fixture / 'data/fiere-fonti.json', rows)
    write(fixture / 'data/fiere-costi.json', ledger)
    builder.build_catalog()
    output = read(fixture / 'data/fiere.json')
    current = {e['id']: e for e in output['events']}
    assert len(current) == len(old)+len(events) == 10394
    assert before.keys() <= current.keys(), 'An existing ID disappeared'
    assert all(current[e['id']]['province'] == 'Pavia' for e in events)
    assert sum(e['province'] == 'Pavia' for e in output['events']) == 134
    assert [e for e in output['events'] if e['province'] != 'Pavia'] == [e for e in old if e['province'] != 'Pavia']
    assert all(current[k] == v for k,v in before.items() if k not in changed)
    assert all(ledger['events'][k] == v for k,v in oldfees.items())
    assert all(current[k]['pricing'] == v for k,v in fees['events'].items())
    # Operational/date distinctions that a count-only test would miss.
    assert current['lombardia-borgo-san-siro-fiera-per-la-festa-del-paese']['editions'][0]['start'] == '2026-10-18'
    assert current['lombardia-borgo-san-siro-fiera-per-la-festa-del-paese']['editions'][0]['end'] == '2026-10-18'
    assert 'somministrazione' in current['lombardia-lomello-fiera-di-maggio']['participation']['note']
    assert len(current['lombardia-rovescala-primavera-dei-vini']['editions']) == 5
    assert len(current['lombardia-breme-sagra-della-cipolla-rossa']['editions']) == 2
    assert len(current['lombardia-langosco-sagra-del-buongustaio']['editions']) == 2
    assert len(current['lombardia-mortara-tri-pas-in-piasa']['editions']) == 4
    assert current['lombardia-pavia-pet-in-fiera']['editions'][0]['start'] == '2026-05-23'
    assert not current['lombardia-dorno-sagra-della-zucca-bertagnina']['editions']
    assert not current['lombardia-pavia-fiera-di-santa-rita']['editions']
    assert current['lombardia-pavia-fiera-di-santa-rita']['months'] == [5]
    assert current['lombardia-castelletto-di-branduzzo-castelletto-in-fiera']['editions'][0]['year'] == 2024
    assert current['lombardia-pieve-del-cairo-tenuta-il-mercato-della-domenica']['editions'][0]['start'] == '2026-10-11'
    assert not any('bozzola' in k for k in ids), 'Duplicate of the existing Easter fair'
    sardinia = {k:v for k,v in before.items() if v['region'] == 'Sardegna'}
    assert all(current[k] == v for k,v in sardinia.items())
    assert output['provinces'] == base['fiere.json']['provinces']
    assert len(audit['regionalRecords']) == 37
    assert all(r['read'] and r['reason'] and r['sha256'] for r in audit['regionalRecords'])
    # Private evidence verification is optional when only the Git commit is copied.
    proof = ROOT / '.local/ricerche/pavia-finale-20261106/manifest-sha256.json'
    proof_count = 0
    if proof.exists():
        for item in read(proof):
            path = ROOT / item['file']
            assert path.is_file(), str(path)
            assert hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'], str(path)
            proof_count += 1
    raw = (fixture / 'data/fiere.json').read_bytes()
    builder.build_catalog()
    assert raw == (fixture / 'data/fiere.json').read_bytes(), 'Repeated build differs'
    report = dict(ok=True,baselineEvents=10266,newEvents=128,totalEvents=10394,paviaEvents=134,
                  existingUpdates=4,allExistingIdsPreserved=True,unmodifiedBaselineRecords=10262,
                  otherProvinceRecordsPreservedInOrder=10260,sardiniaRecordsPreserved=len(sardinia),
                  currentSardiniaProvincesPreserved=True,catalogMunicipalities=186,currentMunicipalities=185,
                  regionalOriginalProgrammesRead=37,oldCostsPreserved=477,newCosts=4,totalCosts=481,
                  evidenceFilesVerified=proof_count,repeatedBuildIdentical=True,
                  catalogSha256=hashlib.sha256(raw).hexdigest())
    write(OUT / 'checks.json',report)
    print(json.dumps(report))

if __name__ == '__main__':
    main()
