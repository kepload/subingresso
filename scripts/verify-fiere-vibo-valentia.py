"""Validate only the Vibo Valentia append-only proposal in a private builder fixture."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / '.local/verifiche/vibo-valentia-20261105'
FIXTURE = PRIVATE / 'fixture'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    PRIVATE.mkdir(parents=True, exist_ok=True)
    (FIXTURE / 'data').mkdir(parents=True, exist_ok=True)
    (FIXTURE / 'scripts').mkdir(exist_ok=True)
    protected = ['data/fiere-fonti.json', 'data/fiere.json', 'data/fiere-costi.json', 'scripts/build-fiere.py']
    before = {name: digest(ROOT / name) for name in protected}
    for path in (ROOT / 'data').glob('*.json'):
        shutil.copy2(path, FIXTURE / 'data' / path.name)
    shutil.copy2(ROOT / 'scripts/build-fiere.py', FIXTURE / 'scripts/build-fiere.py')
    run = lambda: subprocess.run([sys.executable, str(FIXTURE / 'scripts/build-fiere.py')], cwd=FIXTURE, check=True)
    baseline = read(ROOT / 'data/fiere.json')['events']
    run()
    generated_base = read(FIXTURE / 'data/fiere.json')['events']
    assert generated_base == baseline, 'Effective builder does not reproduce base'
    original = {event['id']: event for event in baseline}
    delta = read(ROOT / 'data/fiere-vibo-valentia-delta.json')
    costs = read(ROOT / 'data/fiere-vibo-valentia-costi.json')['events']
    coverage = read(ROOT / 'data/fiere-vibo-valentia-ricognizione.json')['municipalities']
    assert len(coverage) == len({row['city'] for row in coverage}) == 50
    ids = [event['id'] for event in delta['events']]
    assert len(ids) == len(set(ids)) and not (set(ids) & set(original))
    assert set(costs) <= set(ids)
    assert {ident for row in coverage for ident in row['newIds']} == set(ids)
    assert all(row['queryExecuted'] and (ROOT / row['evidenceFile']).is_file() for row in coverage)
    sources = read(FIXTURE / 'data/fiere-fonti.json')
    sources.extend(delta['events'])
    (FIXTURE / 'data/fiere-fonti.json').write_text(json.dumps(sources, ensure_ascii=False), encoding='utf-8')
    original_costs = read(ROOT / 'data/fiere-costi.json')
    new_costs = read(ROOT / 'data/fiere-costi.json')
    assert not (set(costs) & set(new_costs['events']))
    new_costs['events'].update(costs)
    (FIXTURE / 'data/fiere-costi.json').write_text(json.dumps(new_costs, ensure_ascii=False), encoding='utf-8')
    run()
    first_bytes = (FIXTURE / 'data/fiere.json').read_bytes()
    after = read(FIXTURE / 'data/fiere.json')['events']
    after_map = {event['id']: event for event in after}
    assert len(after) == len(baseline) + len(ids)
    assert all(after_map[ident] == event for ident, event in original.items()), 'Changed pre-existing event'
    assert all(new_costs['events'][ident] == value for ident, value in original_costs['events'].items())
    assert set(after_map) - set(original) == set(ids)
    assert all(after_map[ident]['province'] == 'Vibo Valentia' for ident in ids)
    for ident, cost in costs.items():
        assert after_map[ident]['pricing'] == cost
    run()
    assert first_bytes == (FIXTURE / 'data/fiere.json').read_bytes(), 'Non-reproducible build'
    assert before == {name: digest(ROOT / name) for name in protected}, 'Changed protected live source'
    result = dict(validated=True, baseline=len(baseline), added=len(ids), result=len(after), municipalities=50,
                  municipalitiesWithAdditions=len({event['city'] for event in delta['events']}),
                  previousCosts=len(original_costs['events']), addedCostNotes=len(costs),
                  allPreviousEventsUnchanged=True, allPreviousCostsUnchanged=True, repeatBuildIdentical=True,
                  protectedHashes=before, fixture=str(FIXTURE), ids=ids)
    (PRIVATE / 'result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
