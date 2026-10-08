"""Build the calendar from curated sources and existing municipality coordinates.

python scripts/build-fiere.py
python scripts/build-fiere.py --boundaries path/to/limits_IT_regions.geojson
The second command additionally simplifies the CC BY 4.0 regional boundaries.
"""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
REGION_ALIASES = {
    "Trentino-Alto Adige/Südtirol": "Trentino-Alto Adige",
    "Valle d'Aosta/Vallée d'Aoste": "Valle d'Aosta",
}
CATEGORIES = {"tradizionale", "artigianato", "sagra", "espositiva", "mercatino"}


def key(value):
    plain = unicodedata.normalize("NFD", value)
    return re.sub(r"[^a-z0-9]+", "-", "".join(c for c in plain if not unicodedata.combining(c)).lower()).strip("-")


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def build_catalog():
    rows = json.loads((ROOT / "data/fiere-fonti.json").read_text(encoding="utf-8"))
    comuni = json.loads((ROOT / "data/comuni.json").read_text(encoding="utf-8"))
    locations = {(key(c["nome"]), REGION_ALIASES.get(c["regione"], c["regione"])): c for c in comuni}
    events = []
    for row in rows:
        city = locations.get((key(row["city"]), row["region"]))
        if city is None:
            raise ValueError("Missing municipality: " + row["city"] + " / " + row["region"])
        months = [int(n) for n in row["months"].split(",")]
        assert months and len(months) == len(set(months)) and all(1 <= n <= 12 for n in months)
        assert row["category"] in CATEGORIES and row["source"]["url"].startswith("https://")
        event = dict(row, id=key(row["region"] + "-" + row["city"] + "-" + row["name"]), months=months,
                     province=city["provincia"], lat=city["lat"], lng=city["lng"])
        events.append(event)
    counts = Counter(e["region"] for e in events)
    assert len(events) == len({e["id"] for e in events}) == 200
    assert len(counts) == 20 and set(counts.values()) == {10}
    write_json(ROOT / "data/fiere.json", {"catalogUpdatedAt": "2026-10-08", "periodType": "usual-months",
               "coordinateType": "municipality-centre", "events": events})
    print(f"Catalog: {len(events)} events, {len(counts)} regions, 10 per region")


def distance_sq(point, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    t = max(0, min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy))) if dx or dy else 0
    return (point[0] - a[0] - t * dx) ** 2 + (point[1] - a[1] - t * dy) ** 2


def simplify_line(points, tolerance=0.012):
    if len(points) <= 2:
        return points
    distances = [distance_sq(p, points[0], points[-1]) for p in points[1:-1]]
    maximum = max(distances)
    if maximum <= tolerance ** 2:
        return [points[0], points[-1]]
    pivot = distances.index(maximum) + 1
    return simplify_line(points[:pivot + 1], tolerance)[:-1] + simplify_line(points[pivot:], tolerance)


def simplify_ring(ring):
    simplified = simplify_line(ring)
    if len(simplified) < 4:
        simplified = ring
    return [[round(p[0], 4), round(p[1], 4)] for p in simplified]


def build_boundaries(path):
    source = json.loads(path.read_text(encoding="utf-8"))
    features = []
    for feature in source["features"]:
        geometry = feature["geometry"]
        coords = geometry["coordinates"]
        if geometry["type"] == "Polygon":
            coords = [simplify_ring(ring) for ring in coords]
        else:
            assert geometry["type"] == "MultiPolygon"
            coords = [[simplify_ring(ring) for ring in polygon] for polygon in coords]
        region = feature["properties"]["reg_name"]
        region = REGION_ALIASES.get(region, region)
        features.append({"type": "Feature", "properties": {"name": region},
                         "geometry": {"type": geometry["type"], "coordinates": coords}})
    assert len(features) == 20
    write_json(ROOT / "data/italia-regioni.json", {"type": "FeatureCollection", "features": features})
    print("Map: 20 simplified regional boundaries")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--boundaries", type=Path)
    options = parser.parse_args()
    build_catalog()
    if options.boundaries:
        build_boundaries(options.boundaries)
