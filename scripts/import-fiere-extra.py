"""Import downloaded official calendars, preserving other regional snapshots.

Research-only dependencies: beautifulsoup4, xlrd, openpyxl.
No network calls. Ambiguous dates remain labels, never inferred recurrences.
"""
import argparse
from datetime import date
import hashlib
import importlib.util
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("base_import", Path(__file__).with_name("import-fiere.py"))
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
clean, key, category = base.clean, base.key, base.category
LIGURIA = "https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html"
VENETO = "https://www.regione.veneto.it/documents/10713/13530434/Calendario+Sagre+e+Fiere+08.10.2026.xlsx/ebd944f5-d5ec-4826-bbc4-faa0a6edce98"
ER = "https://wwwservizi.regione.emilia-romagna.it/sagre/default.asp"


def office_contacts(value):
    # Keep public organizational mailboxes; exclude named personal contacts.
    emails = re.findall(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", value)
    for address in emails:
        if re.match(r"^(info|comune|proloco|segreteria|turismo|commercio|protocollo|suap|eventi|manifestazioni|ufficio|urp|pec|settore|amministrazione|cultura|confesercenti|confcommercio)", address, re.I):
            return {"email": address}
    return {}


def organizer_name(value):
    # Organization only, without the following contact names/phone numbers.
    first = value.splitlines()[0].strip() if value.splitlines() else ""
    return clean(re.split(r"\b(?:tel|fax|cell|referente)\b|[\w.+-]+@|\d{5,}", first, flags=re.I)[0]).rstrip(" ,;:-(")


def event(region, city, name, months, source, checked):
    return {"region": region, "city": clean(city), "name": clean(name),
            "category": category(name), "months": months,
            "source": {"url": source, "label": f"Regione {region} · calendario 2026", "checkedAt": checked},
            "editions": [], "participation": {"type": "check", "note":
                "La presenza nel calendario non garantisce posteggi disponibili. Contatta il Comune/SUAP o l’organizzatore per settori ammessi, domanda, scadenza e costi."}}


def label_edition(label, source):
    return {"year": 2026, "label": clean(label), "dateType": "calendar", "sourceUrl": source}


def exact_edition(start, end, source):
    return {"year": start.year, "start": start.isoformat(), "end": end.isoformat(), "dateType": "calendar", "sourceUrl": source}


def veneto_dates(value):
    """Only single explicit dates or ranges explicitly introduced by dal/al.

    Hyphens alone can mean either a range or separate days (e.g. 5-8/12).
    Alternatives, recurrence rules and mixed multi-line schedules stay labels.
    """
    value = value.strip().lower()
    first = value.splitlines()[0].strip()
    if len(value.splitlines()) > 1 and re.search(r"\d\s*/\s*\d", "\n".join(value.splitlines()[1:])):
        return []
    match = re.fullmatch(r"dal\s+(\d{1,2})(?:/(\d{1,2}))?\s+al\s+(\d{1,2})/(\d{1,2})(?:\s+(?:sera|giornata intera))?", first)
    if match:
        d1, m1, d2, m2 = match.groups()
        try:
            start, end = date(2026, int(m1 or m2), int(d1)), date(2026, int(m2), int(d2))
            return [(start, end)] if end >= start else []
        except ValueError:
            return []
    match = re.fullmatch(r"(\d{1,2})/(\d{1,2})(?:\s+(?:sera|giornata intera|\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}))?", first)
    if match:
        try:
            day = date(2026, int(match[2]), int(match[1]))
            return [(day, day)]
        except ValueError:
            pass
    return []


def load_liguria(path, checked):
    import xlrd
    book = xlrd.open_workbook(path)
    events, skipped = [], []
    total = 0
    for sheet in book.sheets():
        if sheet.ncols != 9:
            continue
        for index in range(5, sheet.nrows):
            city, month, start, end, name, kind, sectors, venue, organizer = sheet.row_values(index)
            if not city or not name:
                continue
            total += 1
            row_ref = {"sheet": sheet.name, "row": index + 1}
            # Retain commercial fairs/markets and events with commercial sectors.
            # Meals, concerts and historical spectacles alone are insufficient.
            if not (re.search(r"fier|mercat|commercial|vendita", kind + " " + name, re.I) or
                    re.search(r"merci varie|alimentare[/ -]+non alimentare|abbigliamento|bigiotteri|antiquariat|artigian|street food|floroviva", sectors, re.I)):
                skipped.append(dict(row_ref, reason="no-commercial-evidence")); continue
            source = LIGURIA
            dates = []
            if isinstance(start, (int, float)) and isinstance(end, (int, float)):
                try:
                    first, last = (xlrd.xldate_as_datetime(v, book.datemode).date() for v in (start, end))
                    if first.year != 2026 or last < first or last.year > 2027:
                        raise ValueError("outside-calendar")
                    dates = [exact_edition(first, last, source)]
                    months = sorted({(date.fromordinal(n)).month for n in range(first.toordinal(), last.toordinal() + 1)})
                    # Long periods may not mean the bank operates every day.
                    if (last - first).days > 7:
                        dates[0]["periodOnly"] = True
                except (ValueError, OverflowError):
                    skipped.append(dict(row_ref, reason="invalid-or-outside-2026-dates")); continue
            else:
                months = base.months_in_label(str(month))
                if months:
                    dates = [label_edition(str(month) + ": " + str(start) + " – " + str(end), source)]
            if not months:
                skipped.append(dict(row_ref, reason="no-resolved-month")); continue
            item = event("Liguria", city, name, months, source, checked)
            item.update(venue=clean(venue), sectors=clean(sectors), organizer=organizer_name(organizer), editions=dates,
                        sourceRecordIds=[f"{sheet.name}:{index + 1}"])
            if re.search(r"fieristica", kind, re.I):
                item["category"] = "espositiva"
                item["participation"] = {"type": "exhibitors", "note": "Partecipazione tramite selezione degli espositori. Chiedi all’organizzatore requisiti, settori ammessi e preventivo dello stand."}
            if dates[0].get("periodOnly"):
                item["frequencyNote"] = "La fonte indica un periodo complessivo: verifica le singole giornate di vendita con l’organizzatore."
            contacts = office_contacts(organizer)
            if contacts:
                item["contacts"] = contacts
            events.append(item)
    return events, {"inputRows": total, "selectedRows": len(events), "url": LIGURIA, "sourceUpdatedAt": "2026-09", "skippedRows": skipped}


def load_veneto(path, checked):
    import openpyxl
    book = openpyxl.load_workbook(path, read_only=True, data_only=True)
    events, skipped, total = [], [], 0
    for index, row in enumerate(book.worksheets[0].iter_rows(min_row=3, values_only=True), 3):
        province, city, name, period, activity, website, organizer = [str(v or "") for v in row[:7]]
        if not city or not name:
            continue
        total += 1
        # Temporary catering at a parish party does not establish an opportunity
        # for external vendors. Require explicit markets/stalls/exhibitors.
        if not re.search(r"ambulant|bancarell|mercat|espositor", name + " " + activity, re.I):
            skipped.append({"row": index, "reason": "no-commercial-evidence"}); continue
        months = base.months_in_label(period)
        exact = veneto_dates(period)
        for first, last in exact:
            months = sorted(set(months) | {date.fromordinal(n).month for n in range(first.toordinal(), last.toordinal() + 1)})
        if not months:
            skipped.append({"row": index, "reason": "no-resolved-month"}); continue
        item = event("Veneto", city, name, months, VENETO, checked)
        item.update(editions=[exact_edition(a, b, VENETO) for a, b in exact] or [label_edition(period, VENETO)],
                    organizer=organizer_name(organizer), sourceRecordIds=[f"row:{index}"])
        # Extract merchandise categories, without copying event programs.
        product_labels = [(r"artigian", "Artigianato"), (r"antiquar", "Antiquariato"),
                          (r"vintage", "Vintage"), (r"collezion", "Collezionismo"),
                          (r"prodotti tipici|prodotti locali", "Prodotti tipici/locali"),
                          (r"agricol|bestiame", "Agricoltura e produzioni agricole"),
                          (r"piante|fiori|floroviva", "Piante e fiori"),
                          (r"abbigliamento", "Abbigliamento"), (r"aliment|gastronom", "Alimentari e gastronomia")]
        item["sectors"] = "; ".join(label for pattern, label in product_labels if re.search(pattern, name + " " + activity, re.I)) or "Categorie merceologiche da verificare con l’organizzatore."
        item["participation"]["note"] = "Il programma regionale menziona mercato, bancarelle o espositori. L’ammissione degli ambulanti esterni va verificata con l’organizzatore: chiedi settore ammesso, domanda, scadenza e costi."
        contacts = office_contacts(organizer)
        if contacts:
            item["contacts"] = contacts
        events.append(item)
    book.close()
    return events, {"inputRows": total, "selectedRows": len(events), "url": VENETO, "sourceUpdatedAt": "2026-10-08", "skippedRows": skipped}


def load_emilia_romagna(path, checked):
    from bs4 import BeautifulSoup
    records = json.loads(path.read_text(encoding="utf-8"))
    events, skipped = [], []
    for record in records:
        source = record["url"]
        if "error" in record:
            skipped.append({"url": source, "reason": "download-error"}); continue
        soup = BeautifulSoup(record["html"], "html.parser")
        title = soup.select_one("#content h1")
        fields = {clean(dt.get_text(" ", strip=True)): dt.find_next_sibling("dd") for dt in soup.select("#content dt")}
        where = fields.get("Dove")
        times = fields.get("Date e orari")
        if not title or not where or not times:
            skipped.append({"url": source, "reason": "missing-fields"}); continue
        city_tag = where.find("strong")
        city = re.fullmatch(r"(.+)\s+\([A-Z]{2}\)", clean(city_tag.get_text()) if city_tag else "")
        if not city:
            skipped.append({"url": source, "reason": "unresolved-city"}); continue
        days = sorted(set(re.findall(r"\b\d{2}/\d{2}/2026\b", times.get_text(" ", strip=True))), key=lambda d: d[6:] + d[3:5] + d[:2])
        if not days:
            skipped.append({"url": source, "reason": "no-2026-dates"}); continue
        dates = [date.fromisoformat("-".join(reversed(d.split("/")))) for d in days]
        name = clean(title.get_text(" ", strip=True))
        name = re.sub(r"^\d+\s*(?:\^|°|ª|esima)\s*", "", name, flags=re.I)
        notes = clean(fields["Note"].get_text(" ", strip=True)) if "Note" in fields else ""
        # The source has a July fair dated October, while its note says July.
        # Report the conflicting record instead of choosing one of the dates.
        if "di luglio" in name.lower() and "luglio" in notes.lower() and any(d.month != 7 for d in dates):
            skipped.append({"url": source, "reason": "conflicting-name-note-and-dates"}); continue
        item = event("Emilia-Romagna", city[1], name, sorted({d.month for d in dates}), source, checked)
        venue = clean(where.get_text(" ", strip=True)).removesuffix(clean(city_tag.get_text())).rstrip(" ,")
        item.update(venue=venue, editions=[exact_edition(d, d, source) for d in dates], sourceRecordIds=[source])
        if city[1].upper() == "ARGENTA" and "domeniche del mese di dicembre" in notes.lower():
            item.update(months=[12], editions=[label_edition("Presenza degli ambulanti nelle domeniche di dicembre; verificare le singole date.", source)],
                        frequencyNote="Il programma natalizio complessivo non coincide con i giorni di vendita: la fonte indica gli ambulanti nelle sole domeniche di dicembre.")
        if "Merci vendute" in fields:
            item["sectors"] = clean(fields["Merci vendute"].get_text(" ", strip=True))
        stalls = fields.get("Posteggi")
        if stalls and re.match(r"\s*\d+", stalls.get_text()):
            count = int(re.match(r"\s*(\d+)", stalls.get_text())[1])
            if count:
                item["stallCount"] = count
        item["participation"] = {"type": "public", "note": "Fiera su area pubblica nel calendario regionale. I posteggi sono l’organico dichiarato, non la disponibilità attuale. Contatta il SUAP comunale per domanda, graduatoria/spunta, tariffe e restrizioni del tuo settore."}
        # Only syntactically valid clock times; some official rows contain 23:90.
        clock = re.findall(r"\((\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\)", times.get_text(" ", strip=True))
        valid = sorted({a + " – " + b for a, b in clock if all(int(t[:2]) <= 23 and int(t[3:]) < 60 for t in (a, b))})
        if valid and len(valid) == len(set(clock)):
            item["hours"] = "; ".join(valid)
        events.append(item)
    return events, {"inputRows": len(records), "selectedRows": len(events), "url": ER,
                    "scope": "Schede 2026 restituite dalla ricerca regionale il 9 ottobre (edizioni future e mercatini periodici).", "skippedRows": skipped}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ["liguria", "veneto", "emilia-romagna"]:
        parser.add_argument("--" + name, type=Path)
    parser.add_argument("--checked-at", required=True, type=date.fromisoformat)
    args = parser.parse_args()
    output_path = ROOT / "data/fiere-importate.json"
    output = json.loads(output_path.read_text(encoding="utf-8"))
    comuni = json.loads((ROOT / "data/comuni.json").read_text(encoding="utf-8"))
    locations = {(key(c["nome"]), c["regione"]): c for c in comuni}
    results = {}
    for name, region in [("liguria", "Liguria"), ("veneto", "Veneto"), ("emilia_romagna", "Emilia-Romagna")]:
        path = getattr(args, name)
        if not path:
            continue
        rows, report = globals()["load_" + name](path, args.checked_at.isoformat())
        selected, unresolved = [], []
        for item in rows:
            city = locations.get((key(item["city"]), region))
            if not city or not all(isinstance(city.get(k), (int, float)) for k in ["lat", "lng"]):
                unresolved.append({"city": item["city"], "name": item["name"],
                                   "reason": "missing-coordinates" if city else "unresolved-municipality"}); continue
            item["city"] = city["nome"]
            selected.append(item)
        report.update(downloadedAt=args.checked_at.isoformat(), sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                      resolvedRows=len(selected), unresolvedMunicipalities=unresolved)
        output["sources"][name] = report
        output["events"] = [e for e in output["events"] if e["region"] != region] + selected
        results[region] = {"selected": len(selected), "unresolved": unresolved}
    output["importedAt"] = args.checked_at.isoformat()
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(results, ensure_ascii=False))


if __name__ == "__main__":
    main()
