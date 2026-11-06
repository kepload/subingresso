"""Private append-only reproduction with the effective, unmodified builder.

Run: python -B scripts/verify-fiere-potenza.py
Writes only .local/verifiche/potenza-20261106; no network or database calls.
"""
import sys
sys.dont_write_bytecode = True
import hashlib
import importlib.util
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / '.local/verifiche/potenza-20261106'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    protected = [ROOT / 'scripts/build-fiere.py'] + list((ROOT / 'data').glob('*.json'))
    before = {str(p.relative_to(ROOT)): digest(p) for p in protected}
    fixture = PRIVATE / 'fixture'
    (fixture / 'data').mkdir(parents=True, exist_ok=True)
    for source in (ROOT / 'data').glob('*.json'):
        shutil.copy2(source, fixture / 'data' / source.name)
    spec = importlib.util.spec_from_file_location('potenza_effective_builder', ROOT / 'scripts/build-fiere.py')
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.ROOT = fixture
    base = read(ROOT / 'data/fiere.json')['events']
    assert len(base) == 10119, 'Publication baseline has changed; revalidate explicitly'
    assert len(read(ROOT / 'data/fiere-costi.json')['events']) == 471
    builder.build_catalog()
    baseline_built = read(fixture / 'data/fiere.json')['events']
    assert baseline_built == base, 'Effective baseline does not reproduce byte-equivalent records'
    delta = read(ROOT / 'data/fiere-potenza-delta.json')
    costs = read(ROOT / 'data/fiere-potenza-costi.json')
    base_ids = {e['id'] for e in base}
    new_ids = {e['id'] for e in delta['events']}
    assert len(new_ids) == len(delta['events']) and not (new_ids & base_ids)
    locations = {e['nome'] for e in read(ROOT / 'data/comuni.json') if e['provincia'] == 'Potenza'}
    for event in delta['events']:
        assert event['city'] in locations and event['region'] == 'Basilicata'
        assert event['id'] == builder.key(event['region'] + '-' + event['city'] + '-' + event['name'])
        assert not any(k in event for k in ('attendance', 'reputation'))
    rows = read(fixture / 'data/fiere-fonti.json')
    rows.extend(delta['events'])
    (fixture / 'data/fiere-fonti.json').write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
    ledger = read(fixture / 'data/fiere-costi.json')
    old_fees = json.loads(json.dumps(ledger['events']))
    assert set(costs['events']) <= new_ids
    assert not (set(costs['events']) & set(old_fees))
    ledger['events'].update(costs['events'])
    (fixture / 'data/fiere-costi.json').write_text(json.dumps(ledger, ensure_ascii=False), encoding='utf-8')
    builder.build_catalog()
    first_hash = digest(fixture / 'data/fiere.json')
    result = read(fixture / 'data/fiere.json')['events']
    result_by_id = {e['id']: e for e in result}
    assert len(result) == len(base) + len(new_ids)
    assert all(result_by_id[e['id']] == e for e in base), 'A baseline record changed'
    assert all(ledger['events'][k] == v for k, v in old_fees.items()), 'A baseline cost changed'
    assert {e['id'] for e in result if e['id'] not in base_ids} == new_ids
    assert all(result_by_id[k]['province'] == 'Potenza' for k in new_ids)
    audit = read(ROOT / 'data/fiere-potenza-ricognizione.json')
    review = audit['publicationRevalidation']['sectorReview']
    unknown = set(review['unknownSectorIds'])
    assert unknown <= new_ids
    assert all(result_by_id[k]['merchandiseSectors'] for k in new_ids - unknown), 'Review sector mapping'
    assert all(not result_by_id[k]['merchandiseSectors'] for k in unknown), 'Undocumented sector inference'
    assert all(result_by_id[k]['merchandiseSectors'] == ['alimentare'] for k in review['foodNormalizedIds'])
    assert all(p['id'] in base_ids and p['status'] == 'proposal-only-not-applied' for p in audit['proposedExistingUpdates'])
    builder.build_catalog()
    assert digest(fixture / 'data/fiere.json') == first_hash, 'Build is not repeatable'
    assert all(digest(ROOT / name) == value for name, value in before.items()), 'Source workspace mutated'
    audit = read(ROOT / 'data/fiere-potenza-ricognizione.json')
    assert len(audit['municipalities']) == 100
    assert {e['city'] for e in audit['municipalities']} == locations
    assert all(e['queryExecuted'] and e['queries'] and e['outcome'] and e['evidenceFiles'] for e in audit['municipalities'])
    for city in audit['municipalities']:
        assert set(city['newIds']) == {e['id'] for e in delta['events'] if e['city'] == city['city']}
    report = dict(ok=True, baseline=len(base), newEvents=len(new_ids), total=len(result),
                  municipalities=100, municipalitiesWithNewEvents=len({e['city'] for e in delta['events']}),
                  baseCostsUnchanged=len(old_fees), newCostNotes=len(costs['events']),
                  proposedExistingUpdatesNotApplied=len(audit['proposedExistingUpdates']),
                  sourceBuilderSha256=before[str(Path('scripts') / 'build-fiere.py')], fixtureCatalogSha256=first_hash,
                  repeatedBuildIdentical=True, allBaselineRecordsUnchanged=True,
                  allBaselineCostsUnchanged=True, protectedWorkspaceFilesUnchanged=True)
    PRIVATE.mkdir(parents=True, exist_ok=True)
    (PRIVATE / 'result.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
