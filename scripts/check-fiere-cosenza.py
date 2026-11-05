"""Check the append-only Cosenza delta and build an isolated local fixture.

python scripts/check-fiere-cosenza.py
No network calls, shared database writes or changes to the public catalogue.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / '.local/verifiche/cosenza-20261105'
OUT.mkdir(parents=True, exist_ok=True)


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


spec = importlib.util.spec_from_file_location('fiere_builder', ROOT / 'scripts/build-fiere.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
delta = read(ROOT / 'data/fiere-cosenza.json')
base = read(ROOT / 'data/fiere.json')
before = {p.name: sha(p) for p in (ROOT / 'data').glob('*.json')}
assert delta['province'] == 'Cosenza'
assert delta['integration']['mode'] == 'append-only-delta'
assert len(delta['research']['municipalityCoverage']) == 150
towns = {c['nome'] for c in read(ROOT / 'data/comuni.json') if c['provincia'] == 'Cosenza'}
assert {c['city'] for c in delta['research']['municipalityCoverage']} == towns
old = {e['id']: e for e in base['events']}
new = {builder.key(e['region'] + '-' + e['city'] + '-' + e['name']): e for e in delta['events']}
assert len(new) == len(delta['events']) == 40
assert not set(new) & set(old), 'Delta already integrated or event ID collision'
assert set(delta['costs']) <= set(new)
assert all(e['city'] in towns and e['region'] == 'Calabria' for e in new.values())
assert set(new) == set(delta['evidence'])
assert set(delta['integration']['preservedCosenzaIds']) == {e['id'] for e in old.values() if e['province'] == 'Cosenza'}
assert all(e['source']['url'].startswith('https://') for e in new.values())
assert not any(k in e for e in new.values() for k in ('attendance', 'reputation'))
assert all(not e.get('editions') for e in new.values() if e['city'] in ('San Nicola Arcella', "Sant'Agata di Esaro", 'San Donato di Ninea'))
for c in delta['research']['municipalityCoverage']:
    assert set(c['newEventIds']) == {k for k, e in new.items() if e['city'] == c['city']}
for k, e in new.items():
    for edition in e.get('editions', []):
        assert edition['sourceUrl'] == e['source']['url']
        assert edition['start'][:4] == str(edition['year'])
        assert edition['start'] <= edition['end']
assert new['calabria-rogliano-festa-del-pane']['editions'][0]['start'] == '2026-09-26'
assert new['calabria-montegiordano-sagra-dei-piselli-e-delle-fave']['editions'][0]['end'] == '2026-04-26'
assert len(new['calabria-castrovillari-fiera-delle-stagioni']['editions']) == 2

# A complete data-only fixture lets the existing builder validate additions
# without ever writing data/fiere-fonti.json or data/fiere.json in the checkout.
fixture = OUT / 'fixture'
(fixture / 'data').mkdir(parents=True, exist_ok=True)
(fixture / 'scripts').mkdir(exist_ok=True)
for p in (ROOT / 'data').glob('*.json'):
    shutil.copyfile(p, fixture / 'data' / p.name)
script = (ROOT / 'scripts/build-fiere.py').read_text(encoding='utf-8')
script = script.replace('CATALOG_DATE = "2026-11-04"', 'CATALOG_DATE = "2026-11-05"')
(fixture / 'scripts/build-fiere.py').write_text(script, encoding='utf-8')
sources = read(fixture / 'data/fiere-fonti.json')
sources.extend(delta['events'])
(fixture / 'data/fiere-fonti.json').write_text(json.dumps(sources, ensure_ascii=False), encoding='utf-8')
costs = read(fixture / 'data/fiere-costi.json')
assert not set(costs['events']) & set(delta['costs'])
costs['events'].update(delta['costs'])
costs['checkedAt'] = max(costs['checkedAt'], delta['checkedAt'])
(fixture / 'data/fiere-costi.json').write_text(json.dumps(costs, ensure_ascii=False), encoding='utf-8')
subprocess.run([sys.executable, str(fixture / 'scripts/build-fiere.py')], check=True)
first = sha(fixture / 'data/fiere.json')
result = read(fixture / 'data/fiere.json')
merged = {e['id']: e for e in result['events']}
assert len(merged) == len(old) + len(new)
assert all(merged[k] == v for k, v in old.items()), 'A previous record changed'
assert set(merged) - set(old) == set(new)
assert all(merged[k]['province'] == 'Cosenza' for k in new)
assert all(merged[k]['pricing'] == v for k, v in delta['costs'].items())
subprocess.run([sys.executable, str(fixture / 'scripts/build-fiere.py')], check=True)
assert first == sha(fixture / 'data/fiere.json'), 'Build is not reproducible'
assert before == {p.name: sha(p) for p in (ROOT / 'data').glob('*.json')}, 'Source checkout data changed'
report = dict(previous=len(old), additions=len(new), total=len(merged), previousIdentical=True,
              municipalities=150, costs=len(delta['costs']), reproducibleBuildSha256=first,
              sourceCheckoutDataUnchanged=True, browserChecked=False, published=False)
(OUT / 'esito.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
