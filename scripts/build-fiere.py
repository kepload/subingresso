"""Build the calendar from curated sources and existing municipality coordinates.

python scripts/build-fiere.py
python scripts/build-fiere.py --boundaries path/to/limits_IT_regions.geojson
The second command additionally simplifies the CC BY 4.0 regional boundaries.
python scripts/build-fiere.py --province-boundaries provinces.geojson --sardinia-municipalities sardinia.geojson
"""
import argparse
from collections import Counter
from datetime import date
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
CATALOG_DATE = "2026-10-10"
MERCHANDISE_SECTORS = ("alimentare", "non-alimentare", "antiquariato", "artigianato")


def merchandise_sectors(row):
    """Group documented goods, without assuming that a generic fair sells food."""
    text = key(row.get("sectors", "")).replace("-", " ")
    # A missing/generic sector can still have an explicit theme in the event title.
    if text in {"", "misto", "merci varie", "generi vari"}:
        text = key(row["name"]).replace("-", " ")
    # Remove negative clauses before matching; a ban on serving food does not
    # exclude the sale of packaged food and must not remove that sector.
    text = re.sub(r"\b(?:esclus[oaie]|vietat[oaie]|non ammess[oaie]) (?:il settore |settore |prodotti )?(?:alimentar\w*|antiquariat\w*|artigianat\w*)\b", "", text)
    non_food = bool(re.search(r"\bnon alim(?:ent\w*)?\b", text))
    food_text = re.sub(r"\bnon alim(?:ent\w*)?\b", "", text)
    food = bool(re.search(r"\b(?:aliment\w*|agroaliment\w*|enogastronom\w*|gastronom\w*|dolc\w*|pasticceria|formaggi\w*|salumi|bevande|street food|food(?: truck)?|prodotti (?:agricoli|tipici)|miele|vino|vini|olio)\b", food_text))
    antiques = bool(re.search(r"\b(?:antiquari\w*|modernariat\w*|vintage|brocant\w*|collezion\w*|oggetti da collezione|oggetti d epoca)\b", text))
    crafts_text = re.sub(r"\b(?:vino|vini|birra|birre|pane|gelato|dolci|prodotti alimentari) artigianal\w*\b", "", text)
    crafts = bool(re.search(r"\b(?:artigian\w*|artgianato|artiogianato|hobbist\w*|hobbyst\w*|creativ\w*|creazioni|fatto a mano|opere (?:del proprio|dell) ingegno)\b", crafts_text))
    non_food = non_food or antiques or crafts or bool(re.search(r"\b(?:abbigliamento|calzature|pelletteria|bigiotteria|oggettistica|casalinghi|arredamento|arredi|mobili|libr[oi]|editoria|fumetti|giocattoli|elettronic\w*|flor\w*|fiori|piante|ceramich\w*|articoli (?:da regalo|sportivi|religiosi)|accessori|macchin\w*|attrezzature|ricambi|design|arte|usato|usati|cose usate)\b", text))
    flags = (food, non_food, antiques, crafts)
    return [sector for sector, included in zip(MERCHANDISE_SECTORS, flags) if included]

# Source abbreviations refer to the same recurring event, not additional fairs.
EVENT_ALIASES = {
    ("Brescia", "Fiera s.faustino e giovita"): "Fiera dei Santi Faustino e Giovita",
    ("Gorgonzola", "Fiera di s. caterina"): "Fiera di Santa Caterina",
    ("Rivolta d'Adda", "Fiera regionale di merci e bestiame di s.apollonia"): "Fiera di Santa Apollonia",
    ("Pesaro", "Fiera san nicola"): "Fiera di San Nicola",
    ("Jesi", "Fiera san settimio"): "Fiera di San Settimio",
    ("Senigallia", "Fiera sant'agostino"): "Fiera di Sant'Agostino",
    ("Fano", "Fiera san bartolomeo"): "Fiera di San Bartolomeo",
    ("Ascoli Piceno", "Fiera sant'emidio"): "Fiera di Sant'Emidio",
    ("Genova", "S. AGATA"): "Fiera di Sant'Agata",
    ("Genova", "S. PIETRO FOCE"): "Fiera di San Pietro e Paolo",
    ("Genova", "66° Salone Nautico Internazionale"): "Salone Nautico Internazionale",
    ("La Spezia", "Fiera di S. Giuseppe"): "Fiera di San Giuseppe",
    ("Savona", "Fiera di Sanata Lucia"): "Fiera di Santa Lucia",
    ("Savona", "Artigianato on the road"): "Artigianando on the road",
    ("Cogoleto", "mercatino artigianato e antiquariato - Mercatino agroalientare"): "Mercatino artigianato e antiquariato - Mercatino agroalimentare",
    ("Portogruaro", "FIERA DI SANT'ANDREA ANTICA SAGRA DELLE OCHE E DEGLI STIVALI"): "Fiera di Sant'Andrea",
    ("Sant'Agata Feltria", "FIERA NAZIONALE DEL TARTUFO BIANCO PREGIATO E DEI PRODOTTI AGRO-SILVO-PASTORALI"): "Fiera nazionale del Tartufo Bianco",
}


def key(value):
    plain = unicodedata.normalize("NFD", value)
    return re.sub(r"[^a-z0-9]+", "-", "".join(c for c in plain if not unicodedata.combining(c)).lower()).strip("-")


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def build_catalog():
    province_map = json.loads((ROOT / "data/italia-province.json").read_text(encoding="utf-8"))
    sardinia_provinces = {key(name): province for name, province in province_map["sardiniaMunicipalities"].items()}
    rows = json.loads((ROOT / "data/fiere-fonti.json").read_text(encoding="utf-8"))
    imported = json.loads((ROOT / "data/fiere-importate.json").read_text(encoding="utf-8"))
    groups = {}
    for row in imported["events"]:
        row = dict(row)
        row["name"] = EVENT_ALIASES.get((row["city"], row["name"]), row["name"])
        identity = (row["region"], key(row["city"]), key(row["name"]))
        if identity not in groups:
            groups[identity] = row
        else:
            target = groups[identity]
            target["months"] = sorted(set(target["months"] + row["months"]))
            target["editions"].extend(row["editions"])
            target.setdefault("sourceRecordIds", []).extend(row.get("sourceRecordIds", []))
    # Editorial records keep their name and specific participation guidance.
    # Official calendar fields fill gaps, while dates can be overridden by a newer local source.
    combined = []
    for row in rows:
        identity = (row["region"], key(row["city"]), key(row["name"]))
        calendar = groups.pop(identity, {})
        event = dict(calendar, **row)
        if calendar:
            event["months"] = sorted(set(calendar["months"]))
            if row.get("editions"):
                years = {e["year"] for e in row["editions"]}
                event["editions"] = [e for e in calendar["editions"] if e["year"] not in years] + row["editions"]
            else:
                event["editions"] = calendar["editions"]
            event["calendarSource"] = calendar["source"]
        combined.append(event)
    combined.extend(groups.values())
    comuni = json.loads((ROOT / "data/comuni.json").read_text(encoding="utf-8"))
    locations = {(key(c["nome"]), REGION_ALIASES.get(c["regione"], c["regione"])): c for c in comuni}
    # This audited provincial file replaces its older regional/editorial entries.
    # Keep the national source snapshots intact and preserve every other province.
    for province, filename in (("Brescia", "fiere-brescia.json"), ("Lodi", "fiere-lodi.json"), ("Lecco", "fiere-lecco.json")):
        researched = json.loads((ROOT / "data" / filename).read_text(encoding="utf-8"))
        assert researched["province"] == province and researched["checkedAt"] <= CATALOG_DATE
        for row in researched["events"]:
            location = locations.get((key(row["city"]), row["region"]))
            assert location and location["provincia"] == province
        combined = [row for row in combined if
            locations.get((key(row["city"]), row["region"]), {}).get("provincia") != province]
        combined.extend(researched["events"])
    events = []
    for row in combined:
        city = locations.get((key(row["city"]), row["region"]))
        if city is None:
            raise ValueError("Missing municipality: " + row["city"] + " / " + row["region"])
        months = [int(n) for n in row["months"].split(",")] if isinstance(row["months"], str) else row["months"]
        assert months and len(months) == len(set(months)) and all(1 <= n <= 12 for n in months)
        assert row["category"] in CATEGORIES and row["source"]["url"].startswith("https://")
        province = sardinia_provinces[key(row["city"])] if row["region"] == "Sardegna" else city["provincia"]
        # A documented venue can supply coordinates missing from the municipality dataset.
        lat, lng = row.get("lat", city["lat"]), row.get("lng", city["lng"])
        assert isinstance(lat, (int, float)) and isinstance(lng, (int, float)), row["city"] + " has no coordinates"
        if "lat" in row or "lng" in row:
            assert row.get("coordinateSource", {}).get("url", "").startswith("https://")
        event = dict(row, id=key(row["region"] + "-" + row["city"] + "-" + row["name"]), months=months,
                     province=province, lat=lat, lng=lng)
        event["merchandiseSectors"] = merchandise_sectors(event)
        editions = []
        signatures = set()
        for edition in event.get("editions", []):
            assert edition["dateType"] in {"calendar", "confirmed"}
            assert edition["sourceUrl"].startswith("https://")
            if edition.get("start"):
                assert date.fromisoformat(edition["start"]) <= date.fromisoformat(edition["end"])
                assert int(edition["start"][:4]) == edition["year"]
            else:
                assert edition.get("label")
            signature = (edition["year"], edition.get("start"), edition.get("end"), edition.get("label"))
            if signature not in signatures:
                signatures.add(signature); editions.append(edition)
        event["editions"] = sorted(editions, key=lambda e: (e["year"], e.get("start", "9999")))
        if "participation" not in event:
            event["participation"] = {"type": "exhibitors" if event["category"] == "espositiva" else "check",
                "note": "Partecipazione tramite l’organizzatore e selezione degli espositori. Verifica categoria ammessa, preventivo e contratto dello stand." if event["category"] == "espositiva" else
                "Non è ancora disponibile una scheda operativa verificata. Consulta la fonte e chiedi al Comune o all’organizzatore se sono previsti posteggi per il tuo settore, come presentare domanda e quali sono i costi."}
        assert event["participation"]["type"] in {"public", "selected", "exhibitors", "check"}
        events.append(event)
    counts = Counter(e["region"] for e in events)
    assert len(events) == len({e["id"] for e in events}) and len(events) >= 200
    assert len(counts) == 20
    provinces = sorted((f["properties"]["name"] for f in province_map["features"]))
    assert all(e["province"] in provinces for e in events)
    write_json(ROOT / "data/fiere.json", {"catalogUpdatedAt": CATALOG_DATE, "periodType": "editions-and-usual-months",
               "provinces": provinces,
               "coordinateType": "municipality-centre", "regionalImportYear": imported["year"],
               "eventsWithEditionData": sum(bool(e["editions"]) for e in events),
               "eventsWithPublishedDates": sum(any(e.get("start") and not e.get("periodOnly") for e in event["editions"]) for event in events), "events": events})
    print(f"Catalog: {len(events)} unique events, {len(counts)} regions; {sum(bool(e['editions']) for e in events)} with edition data")


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


def build_province_boundaries(path, sardinia_path):
    source = json.loads(path.read_text(encoding="utf-8"))
    sardinia = json.loads(sardinia_path.read_text(encoding="utf-8"))
    features = []
    for feature in source["features"]:
        geometry = feature["geometry"]
        if geometry["type"] == "Polygon":
            coords = [simplify_ring(ring) for ring in geometry["coordinates"]]
        else:
            assert geometry["type"] == "MultiPolygon"
            coords = [[simplify_ring(ring) for ring in polygon] for polygon in geometry["coordinates"]]
        properties = feature["properties"]
        features.append({"type": "Feature", "properties": {"name": properties["prov_name"], "abbr": properties["prov_acr"]},
                         "geometry": {"type": geometry["type"], "coordinates": coords}})
    municipalities = {f["properties"]["name"]: f["properties"]["prov_name"] for f in sardinia["features"]}
    assert len(features) == len({f["properties"]["name"] for f in features}) == 110
    assert len(municipalities) == 377
    write_json(ROOT / "data/italia-province.json", {"type": "FeatureCollection", "features": features,
               "sourceVersion": "geojson-italy/2026.2", "sourceCheckedAt": "2026-10-09",
               "sardiniaMunicipalities": municipalities})
    print("Map: 110 simplified provincial boundaries; 377 official Sardinian municipality assignments")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--boundaries", type=Path)
    parser.add_argument("--province-boundaries", type=Path)
    parser.add_argument("--sardinia-municipalities", type=Path)
    options = parser.parse_args()
    if options.province_boundaries:
        if not options.sardinia_municipalities:
            parser.error("--province-boundaries requires --sardinia-municipalities")
        build_province_boundaries(options.province_boundaries, options.sardinia_municipalities)
    build_catalog()
    if options.boundaries:
        build_boundaries(options.boundaries)
