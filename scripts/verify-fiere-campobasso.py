"""Verify the Campobasso append-only proposal with the unchanged real builder.

Writes fixtures and reports only under .local/verifiche/campobasso-20261106.
Does not change the national catalogue, costs, builder or database.
Run: python scripts/verify-fiere-campobasso.py
"""
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata

ROOT = Path(__file__).resolve().parent.parent


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def key(value):
    plain = unicodedata.normalize("NFD", value)
    return re.sub(r"[^a-z0-9]+", "-", "".join(c for c in plain if not unicodedata.combining(c)).lower()).strip("-")


def main():
    delta = read(ROOT / "data/fiere-campobasso-delta.json")
    costs = read(ROOT / "data/fiere-campobasso-costi.json")
    audit = read(ROOT / "data/fiere-campobasso-ricognizione.json")
    actual = read(ROOT / "data/fiere.json")
    base_costs = read(ROOT / "data/fiere-costi.json")
    events = delta["events"]
    assert delta["province"] == costs["province"] == audit["province"] == "Campobasso"
    assert delta["mode"] == costs["mode"] == "append-only"
    municipalities = {c["nome"] for c in read(ROOT / "data/comuni.json") if c["provincia"] == "Campobasso"}
    assert len(municipalities) == 84
    assert len(audit["municipalities"]) == 84
    assert {c["city"] for c in audit["municipalities"]} == municipalities
    assert all(c["queryExecuted"] and c["queries"] and c["outcome"] and c["limits"] for c in audit["municipalities"])
    ids = {e["id"] for e in events}
    assert len(ids) == len(events)
    old_ids = {e["id"] for e in actual["events"]}
    assert not ids & old_ids, "New IDs collide with the current catalogue"
    identities = {(e["region"], key(e["city"]), key(e["name"])) for e in actual["events"]}
    for event in events:
        assert event["city"] in municipalities and event["region"] == "Molise"
        assert event["id"] == key("Molise-" + event["city"] + "-" + event["name"])
        assert (event["region"], key(event["city"]), key(event["name"])) not in identities
        assert event.get("participation", {}).get("note") and event["summary"]
        assert "reputation" not in event and "attendance" not in event
        assert "\ufffd" not in json.dumps(event, ensure_ascii=False)
    assert set(costs["events"]) <= ids
    assert not set(costs["events"]) & set(base_costs["events"])
    assert {i for c in audit["municipalities"] for i in c["newIds"]} == ids
    for c in audit["municipalities"]:
        assert set(c["newIds"]) == {e["id"] for e in events if e["city"] == c["city"]}
    assert all(p["id"] in old_ids and p["status"] == "proposal-only-not-applied" for p in audit["updateProposals"])

    output = ROOT / ".local/verifiche/campobasso-20261106"
    output.mkdir(parents=True, exist_ok=True)
    fixture = Path(tempfile.mkdtemp(prefix="fixture-", dir=output))
    (fixture / "scripts").mkdir()
    (fixture / "data").mkdir()
    builder = ROOT / "scripts/build-fiere.py"
    source = builder.read_text(encoding="utf-8")
    # Copy all builder inputs by their literal filenames, including the provincial tuple.
    names = {Path(n).name for n in re.findall(r'["\']([^"\']+\.json)["\']', source)}
    inputs = [ROOT / "data" / n for n in names if (ROOT / "data" / n).exists()]
    inputs += [builder, ROOT / "data/fiere.json"]
    hashes_before = {str(p.relative_to(ROOT)): digest(p) for p in set(inputs)}
    for path in inputs:
        shutil.copy2(path, fixture / path.relative_to(ROOT))
    assert digest(fixture / "scripts/build-fiere.py") == digest(builder)

    def build():
        result = subprocess.run([sys.executable, "scripts/build-fiere.py"], cwd=fixture, capture_output=True, text=True, encoding="utf-8")
        assert result.returncode == 0, result.stdout + result.stderr
        return result.stdout.strip(), read(fixture / "data/fiere.json")

    log_base, generated_base = build()
    assert generated_base == actual, "The current catalogue is not reproduced by its real builder"
    sources = read(fixture / "data/fiere-fonti.json")
    sources.extend(events)
    write(fixture / "data/fiere-fonti.json", sources)
    candidate_costs = read(fixture / "data/fiere-costi.json")
    candidate_costs["events"].update(costs["events"])
    write(fixture / "data/fiere-costi.json", candidate_costs)
    log_candidate, candidate = build()
    first_hash = digest(fixture / "data/fiere.json")
    log_repeat, repeated = build()
    assert digest(fixture / "data/fiere.json") == first_hash and candidate == repeated
    assert len(candidate["events"]) == len(actual["events"]) + len(events)
    assert [e for e in candidate["events"] if e["id"] in old_ids] == actual["events"], "A previous record changed or moved"
    added = [e for e in candidate["events"] if e["id"] in ids]
    assert len(added) == len(events) and all(e["province"] == "Campobasso" for e in added)
    assert all(candidate_costs["events"][k] == v for k, v in base_costs["events"].items())
    assert len(candidate_costs["events"]) == len(base_costs["events"]) + len(costs["events"])
    built = {e["id"]: e for e in added}
    for event in events:
        assert built[event["id"]]["name"] == event["name"]
        assert built[event["id"]]["source"] == event["source"]
        assert len(built[event["id"]]["editions"]) == len(event["editions"])
    for event_id, price in costs["events"].items():
        assert built[event_id]["pricing"] == price
        assert built[event_id]["participation"]["costs"] == price["details"]
    assert all(digest(ROOT / name) == value for name, value in hashes_before.items()), "A national worktree file changed"
    report = {
        "ok": True, "province": "Campobasso", "fixture": str(fixture),
        "builderSha256": digest(builder), "baseEvents": len(actual["events"]),
        "newEvents": len(events), "candidateEvents": len(candidate["events"]),
        "newMunicipalities": len({e["city"] for e in events}), "surveyedMunicipalities": len(municipalities),
        "baseCostNotes": len(base_costs["events"]), "newCostNotes": len(costs["events"]),
        "allPreviousEventsUnchangedAndSameOrder": True, "allPreviousCostsUnchanged": True,
        "repeatedBuildIdentical": True, "nationalFilesUnchanged": True,
        "candidateSha256": first_hash, "logs": [log_base, log_candidate, log_repeat],
        "inputHashes": hashes_before,
    }
    write(output / "report.json", report)
    print(json.dumps({k: v for k, v in report.items() if k not in {"inputHashes", "logs"}}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
