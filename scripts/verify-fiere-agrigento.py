"""Verifica Agrigento in copie private con il builder effettivo, senza dati live."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / '.local/verifiche/agrigento-20261106'
FIXTURE = PRIVATE / 'fixture'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    data = ROOT / 'data'
    delta = read(data / 'fiere-agrigento-delta.json')
    audit = read(data / 'fiere-agrigento-ricognizione.json')
    costs = read(data / 'fiere-agrigento-costi.json')
    baseline = read(data / 'fiere.json')
    source = read(data / 'fiere-fonti.json')
    national_costs = read(data / 'fiere-costi.json')
    before = {str(p.relative_to(data)): sha(p) for p in data.rglob('*') if p.is_file()}
    builder = ROOT / 'scripts/build-fiere.py'
    spec = importlib.util.spec_from_file_location('agrigento_builder', builder)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    events = delta['events']
    ids = {e['id'] for e in events}
    old = {e['id']: e for e in baseline['events']}
    communes = {x['nome'] for x in read(data / 'comuni.json') if x['provincia'] == 'Agrigento'}
    assert delta['mode'] == 'append-only' and delta['province'] == 'Agrigento'
    assert len(old) == len(baseline['events'])
    assert events and len(ids) == len(events) and not ids.intersection(old)
    for event in events:
        assert event['region'] == 'Sicilia' and event['city'] in communes
        assert event['id'] == module.key('Sicilia-' + event['city'] + '-' + event['name'])
        assert event['source']['url'].startswith('https://')
        assert event['source']['checkedAt'] == delta['checkedAt']
        assert not any(k in event for k in ('pricing', 'attendance', 'reputation'))
    assert len(audit['municipalities']) == len(communes) == 43
    assert {x['city'] for x in audit['municipalities']} == communes
    assert {eid for x in audit['municipalities'] for eid in x['newIds']} == ids
    for city in audit['municipalities']:
        assert city['queryExecuted'] and city['searches'] and city['outcome']
        for search in city['searches']:
            proof = ROOT / search['evidenceFile']
            assert proof.is_file()
            recorded = read(proof)
            assert set(search['queries']) <= set(recorded['queries'])
    proposals = audit['existingEventUpdateProposals']
    assert len(proposals) == 1
    assert proposals[0]['id'] == 'sicilia-agrigento-fiera-di-san-calogero'
    assert proposals[0]['id'] in old and proposals[0]['id'] not in ids
    assert proposals[0]['action'] == 'proposal-only-do-not-apply'
    assert set(costs['events']) <= ids
    assert not set(costs['events']).intersection(national_costs['events'])
    (FIXTURE / 'scripts').mkdir(parents=True, exist_ok=True)
    (FIXTURE / 'data').mkdir(exist_ok=True)
    shutil.copy2(builder, FIXTURE / 'scripts/build-fiere.py')
    for file in data.glob('*.json'):
        shutil.copy2(file, FIXTURE / 'data' / file.name)

    def write(name, value):
        (FIXTURE / 'data' / name).write_text(json.dumps(value, ensure_ascii=False) + '\n', encoding='utf-8')

    def build():
        subprocess.run([sys.executable, '-B', '-X', 'utf8', str(FIXTURE / 'scripts/build-fiere.py')], check=True, cwd=FIXTURE)
        return read(FIXTURE / 'data/fiere.json')

    assert build() == baseline, 'Il builder base non riproduce il catalogo iniziale'
    write('fiere-fonti.json', source + events)
    augmented_costs = dict(national_costs, events=dict(national_costs['events'], **costs['events']))
    write('fiere-costi.json', augmented_costs)
    output = build()
    first_hash = sha(FIXTURE / 'data/fiere.json')
    assert build() == output and sha(FIXTURE / 'data/fiere.json') == first_hash
    result = {e['id']: e for e in output['events']}
    assert len(result) == len(old) + len(events)
    assert set(result) - set(old) == ids
    assert all(result[eid] == row for eid, row in old.items()), 'Scheda precedente alterata'
    assert all(result[eid]['province'] == 'Agrigento' for eid in ids)
    assert all(augmented_costs['events'][eid] == row for eid, row in national_costs['events'].items())
    assert all(result[eid]['pricing'] == row for eid, row in costs['events'].items())
    assert before == {str(p.relative_to(data)): sha(p) for p in data.rglob('*') if p.is_file()}
    report = dict(valid=True, baselineBuilderEqual=True, baseEvents=len(old), addedEvents=len(events),
                  totalEvents=len(result), baseCosts=len(national_costs['events']), addedCosts=len(costs['events']),
                  municipalitiesSurveyed=len(communes), municipalitiesWithAdditions=len({e['city'] for e in events}),
                  baseEventsUnchanged=True, baseCostsUnchanged=True, sourceFilesUnchanged=True,
                  repeatable=True, existingEventProposalsNotApplied=True, builderSha256=sha(builder),
                  fixtureCatalogSha256=first_hash, newIds=sorted(ids))
    (PRIVATE / 'risultato.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'newIds'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
