"""Build frazioni/localita from GeoNames IT.zip, linked to current ISTAT comuni.

Usage: python scripts/build-localita.py IT.zip confini-comuni.geojson
Sources and licenses are preserved in data/localita.json and data/LOCALITA.md.
Uses only the Python standard library. Raw downloads stay outside the repository.
"""
import argparse
import collections
import datetime
import hashlib
import json
import math
from pathlib import Path
import re
import unicodedata
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ACTIVE_CODES = {"PPL", "PPLA", "PPLA2", "PPLA3", "PPLA4", "PPLC", "PPLL", "PPLX", "PPLR", "PPLS", "PPLF"}


def normalize(value):
    value = "".join(c for c in unicodedata.normalize("NFD", value.lower()) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def in_ring(x, y, ring):
    inside = False
    previous = ring[-1]
    for current in ring:
        ax, ay = previous[:2]
        bx, by = current[:2]
        if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
            inside = not inside
        previous = current
    return inside


def build(archive, boundaries):
    comuni = json.loads((ROOT / "data/comuni-picker.json").read_text(encoding="utf-8"))
    by_code = {row["codiceIstat"]: row for row in comuni}
    by_name = collections.defaultdict(list)
    for row in comuni:
        by_name[normalize(row["nome"])].append(row)
    # Reuse the same official post-merger names as the frontend.
    picker = (ROOT / "js/comune-picker.js").read_text(encoding="utf-8")
    aliases = {normalize(alias): single or double for alias, single, double in
               re.findall(r"'([^']+)': (?:'([^']+)'|\"([^\"]+)\")", picker)}
    with zipfile.ZipFile(archive) as source:
        records = [line.split("\t") for line in source.read("IT.txt").decode("utf-8").splitlines()]
    admin = {row[12]: row for row in records if row[7] == "ADM3"}

    def parent_for_code(code):
        if code in by_code:
            return by_code[code]
        area = admin.get(code)
        if not area:
            return None
        names = [area[1], *area[3].split(",")]
        found = {row["codiceIstat"]: row for name in names
                 for row in by_name.get(normalize(aliases.get(normalize(name), name)), [])}
        return next(iter(found.values())) if len(found) == 1 else None

    # For missing admin codes use the containing polygon, never the closest town.
    features = json.loads(Path(boundaries).read_text(encoding="utf-8"))["features"]
    grid = collections.defaultdict(list)
    for feature in features:
        props = feature["properties"]
        parent = parent_for_code(str(props["com_istat_code"]).zfill(6))
        if not parent:
            candidates = by_name.get(normalize(aliases.get(normalize(props["name"]), props["name"])), [])
            parent = candidates[0] if len(candidates) == 1 else None
        if not parent:
            continue
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        for polygon in polygons:
            xs, ys = zip(*(point[:2] for point in polygon[0]))
            box = (min(xs), min(ys), max(xs), max(ys))
            for gx in range(math.floor(box[0] * 10), math.floor(box[2] * 10) + 1):
                for gy in range(math.floor(box[1] * 10), math.floor(box[3] * 10) + 1):
                    grid[gx, gy].append((parent, box, polygon))

    def containing_parent(lat, lng):
        found = {}
        for parent, box, polygon in grid[math.floor(lng * 10), math.floor(lat * 10)]:
            if box[0] <= lng <= box[2] and box[1] <= lat <= box[3] and in_ring(lng, lat, polygon[0]) and not any(in_ring(lng, lat, hole) for hole in polygon[1:]):
                found[parent["codiceIstat"]] = parent
        return next(iter(found.values())) if len(found) == 1 else None

    seen = set()
    output = []
    counts = collections.Counter()
    for row in records:
        if row[6] != "P" or row[7] not in ACTIVE_CODES:
            continue
        lat, lng = float(row[4]), float(row[5])
        parent = parent_for_code(row[12])
        if not parent:
            parent = containing_parent(lat, lng)
            if parent:
                counts["resolvedByBoundary"] += 1
        if not parent:
            counts["unresolved"] += 1
            continue
        name = row[1].strip()
        key = normalize(name)
        official_key = normalize(parent["nome"])
        if key == official_key or key == "comune di " + official_key or aliases.get(key) == parent["nome"]:
            counts["municipalSeats"] += 1
            continue
        identity = (parent["codiceIstat"], key)
        if identity in seen:
            counts["duplicates"] += 1
            continue
        seen.add(identity)
        names = sorted({alt.strip() for alt in row[3].split(",") if alt.strip() and normalize(alt) != key and not alt.startswith("http")})
        entry = [int(row[0]), name, parent["codiceIstat"], round(lat, 5), round(lng, 5)]
        if names:
            entry.append(names)
        output.append(entry)
    output.sort(key=lambda row: (normalize(row[1]), row[2], row[0]))
    metadata = {
        "schemaVersion": 1,
        "generatedAt": datetime.date.today().isoformat(),
        "sources": [
            {"name": "GeoNames", "url": "https://download.geonames.org/export/dump/IT.zip", "license": "CC BY 4.0", "licenseUrl": "https://creativecommons.org/licenses/by/4.0/", "sha256": hashlib.sha256(Path(archive).read_bytes()).hexdigest()},
            {"name": "ISTAT / geojson-italy", "url": "https://github.com/guglielmo/geojson-italy", "license": "CC BY 4.0", "licenseUrl": "https://creativecommons.org/licenses/by/4.0/", "sha256": hashlib.sha256(Path(boundaries).read_bytes()).hexdigest()},
        ],
        "columns": ["geonameId", "nome", "codiceIstatComune", "lat", "lng", "aliases (optional)"],
        "counts": {"localita": len(output), **counts},
        "localita": output,
    }
    destination = ROOT / "data/localita.json"
    destination.write_text(json.dumps(metadata, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps(metadata["counts"]))
    print(f"{destination}: {destination.stat().st_size:,} bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", help="GeoNames IT.zip")
    parser.add_argument("boundaries", help="ISTAT geojson-italy municipality polygons")
    args = parser.parse_args()
    build(args.archive, args.boundaries)
