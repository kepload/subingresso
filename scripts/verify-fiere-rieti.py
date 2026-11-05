"""Fixture privata append-only di Rieti: nessun dato nazionale o live modificato."""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
FIXTURE = ROOT / ".local/verifiche/rieti-20261105/fixture"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    data = ROOT / "data"
    delta = read(data / "fiere-rieti-delta.json")
    costs = read(data / "fiere-rieti-costi.json")
    audit = read(data / "fiere-rieti-ricognizione.json")
    baseline = read(data / "fiere.json")
    source = read(data / "fiere-fonti.json")
    national_costs = read(data / "fiere-costi.json")
    before = {p.name: sha(p) for p in data.glob("*.json")}
    builder = ROOT / "scripts/build-fiere.py"
    spec = importlib.util.spec_from_file_location("rieti_builder", builder)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    events = delta["events"]
    ids = {e["id"] for e in events}
    old = {e["id"]: e for e in baseline["events"]}
    assert len(old) == len(baseline["events"])
    assert delta["mode"] == "append-only" and delta["province"] == "Rieti"
    assert events and len(ids) == len(events) and not ids.intersection(old)
    for event in events:
        assert event["region"] == "Lazio"
        assert event["id"] == module.key("Lazio-" + event["city"] + "-" + event["name"])
        assert event["source"]["url"].startswith("https://")
        assert event["source"]["checkedAt"] == delta["checkedAt"]
        assert not any(k in event for k in ("pricing", "attendance", "reputation"))
    communes = {x["nome"] for x in read(data / "comuni.json") if x["provincia"] == "Rieti"}
    assert len(audit["municipalities"]) == len(communes) == 73
    assert {x["city"] for x in audit["municipalities"]} == communes
    assert {eid for x in audit["municipalities"] for eid in x["newIds"]} == ids
    assert all(x["query"] and x["outcome"] and x["searchEvidence"] for x in audit["municipalities"])
    assert not audit["existingEventUpdateProposals"]
    assert set(costs["events"]) <= ids
    assert not set(costs["events"]).intersection(national_costs["events"])
    # Solo copie private; il builder effettivo resta identico.
    (FIXTURE / "scripts").mkdir(parents=True, exist_ok=True)
    (FIXTURE / "data").mkdir(exist_ok=True)
    shutil.copy2(builder, FIXTURE / "scripts/build-fiere.py")
    for file in data.glob("*.json"):
        shutil.copy2(file, FIXTURE / "data" / file.name)
    def write(name, value):
        (FIXTURE / "data" / name).write_text(json.dumps(value, ensure_ascii=False) + "\n", encoding="utf-8")
    def build():
        subprocess.run([sys.executable, "-X", "utf8", str(FIXTURE / "scripts/build-fiere.py")], check=True, cwd=FIXTURE)
        return read(FIXTURE / "data/fiere.json")
    base_build = build()
    assert base_build == baseline, "Il builder base non riproduce il catalogo di partenza"
    write("fiere-fonti.json", source + events)
    augmented_costs = dict(national_costs, events=dict(national_costs["events"], **costs["events"]))
    write("fiere-costi.json", augmented_costs)
    output = build()
    first_hash = sha(FIXTURE / "data/fiere.json")
    again = build()
    assert sha(FIXTURE / "data/fiere.json") == first_hash and again == output
    result = {e["id"]: e for e in output["events"]}
    assert len(result) == len(old) + len(events)
    assert set(result) - set(old) == ids
    assert all(result[eid] == row for eid, row in old.items()), "Scheda precedente alterata"
    assert all(result[eid]["province"] == "Rieti" for eid in ids)
    assert all(augmented_costs["events"][eid] == row for eid, row in national_costs["events"].items())
    assert all(result[eid]["pricing"] == row for eid, row in costs["events"].items())
    # Nuove date, ricognizione e costi passano nelle copie senza toccare la base.
    assert before == {p.name: sha(p) for p in data.glob("*.json")}
    dated = sum(bool(e.get("editions")) for e in events)
    report = dict(valid=True,baseEvents=len(old),addedEvents=len(events),totalEvents=len(result),
                  municipalitiesSurveyed=len(communes),municipalitiesWithAdditions=len({e["city"] for e in events}),
                  datedEvents=dated,periodOnlyEvents=len(events)-dated,
                  baseCosts=len(national_costs["events"]),addedCosts=len(costs["events"]),
                  baselineBuilderEqual=True,baseEventsUnchanged=True,baseCostsUnchanged=True,
                  repeatable=True,builderSha256=sha(builder),fixtureCatalogSha256=first_hash,
                  sourceFilesUnchanged=True,newIds=sorted(ids))
    report_path = FIXTURE.parent / "risultato.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "newIds"}, ensure_ascii=False))


if __name__ == "__main__":
    main()
