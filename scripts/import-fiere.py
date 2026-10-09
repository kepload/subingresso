"""Normalize downloaded official 2026 calendars without network access.

python scripts/import-fiere.py --lombardia file.json --piemonte file.html --marche file.pdf
HTML/PDF extraction needs BeautifulSoup/pypdf only for this import, not for builds.
Incomplete PDF rows and ambiguous dates are reported rather than guessed.
"""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
CHECKED = "2026-10-09"
LOMBARDIA = "https://www.dati.lombardia.it/Commercio/Sagre-e-fiere-su-area-pubblica/hs8z-dcey"
PIEMONTE = "https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=-1&qualifica=-1&scelta=2"
MARCHE = "https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf"
MONTHS = "gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre".split()


def key(value):
    value = unicodedata.normalize("NFD", value)
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in value.lower() if not unicodedata.combining(c)))


def clean(value):
    return re.sub(r"\s+", " ", value).strip()


def months_in_label(value):
    value = value.lower()
    months = {i + 1 for i, name in enumerate(MONTHS) if re.search(r"\b" + name[:3] + r"(?:" + name[3:] + r")?\b", value)}
    months.update(int(m) for m in re.findall(r"\d{1,2}\s*/\s*(\d{1,2})\b", value) if 1 <= int(m) <= 12)
    if "ogni mese" in value or "tutti i mesi" in value:
        return list(range(1, 13))
    # Pasqua/Pentecoste or vague seasons do not imply an exact 2026 date.
    if not months and "pasqua" in value:
        months = {3, 4}
    return sorted(months)


def exact_dates(value):
    """Only explicit single dates or unambiguous ranges; never convert recurrence rules."""
    value = clean(value).lower()
    match = re.fullmatch(r"(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s*/\s*(\d{1,2})", value)
    if not match:
        match = re.fullmatch(r"(\d{1,2})(?:\s*-\s*(\d{1,2}))?\s*[- ]?\s*(" + "|".join(MONTHS + [m[:3] for m in MONTHS]) + r")", value)
    if not match:
        return {}
    first, last, month = match.groups()
    month = int(month) if month.isdigit() else next(i + 1 for i, name in enumerate(MONTHS) if name.startswith(month))
    try:
        start, end = date(2026, month, int(first)), date(2026, month, int(last or first))
        return {"start": start.isoformat(), "end": end.isoformat()} if end >= start else {}
    except ValueError:
        return {}


def category(name, sectors=""):
    name = name.lower()
    if "artigian" in name:
        return "artigianato"
    if "mercatin" in name or "antiquar" in name or "vintage" in name or "brocantage" in name:
        return "mercatino"
    if "sagra" in name or "festa" in name or "festival" in name:
        return "sagra"
    return "tradizionale"


def load_lombardia(path):
    rows = json.loads(path.read_text(encoding="utf-8"))
    events = []
    for r in rows:
        if r.get("anno") != "2026" or r.get("tipo") != "Fiera":
            continue
        # The official type also includes concerts, parades and private meals.
        if not re.search(r"fier|mercat|artigian|mostra|espos|bancar", r["denom"], re.I):
            continue
        if "mostra della capra" in r["denom"].lower() or "mostra interprovinciale capra" in r["denom"].lower():
            continue
        start, end = r["data_in"][:10], r["data_fine"][:10]
        date.fromisoformat(start); date.fromisoformat(end)
        if start > end:
            continue
        label = r["denom"]
        # Keep source spelling; remove only the explicit edition/year prefix.
        label = re.sub(r"^\d+\s*(?:\^|°|ESIMA)\s*", "", label, flags=re.I)
        label = re.sub(r"\s+(?:ANNO\s+)?2026$", "", label, flags=re.I)
        source = {"url": r.get("url_programma", {}).get("url", LOMBARDIA), "label": "Regione Lombardia · calendario 2026", "checkedAt": CHECKED}
        editions = [{"year": 2026, "start": start, "end": end, "dateType": "calendar", "sourceUrl": source["url"]}]
        periodic = start != end and bool(re.search(r"periodic|(?:ogni|tutti\s+i|tutte\s+le)\s+(?:luned|marted|mercoled|gioved|venerd|sabat|domenic|settiman|mese)", r.get("descriz", ""), re.I))
        if periodic:
            editions[0]["periodOnly"] = True
        events.append({"region": "Lombardia", "city": r["comune"], "name": clean(label).capitalize(),
                       "category": category(label), "months": list(range(int(start[5:7]), int(end[5:7]) + 1)),
                       "venue": clean(" ".join(r.get(k, "") for k in ["toponimo", "indirizzo", "civico"])),
                       "organizer": r.get("nome_org", ""), "hours": clean(r.get("ora_in", "") + " – " + r.get("ora_fine", "")),
                       "participation": {"type": "check", "note": "La presenza nel calendario non garantisce posteggi disponibili. Chiedi all’organizzatore il bando o le condizioni per il tuo settore."},
                       "source": source, "editions": editions, "sourceRecordIds": [r["id"]]})
        if periodic:
            events[-1]["frequencyNote"] = "Appuntamenti periodici: la fonte riporta il periodo complessivo, non tutte le singole giornate. Consulta il programma."
    return events, {"inputRows": len(rows), "selectedRows": len(events), "url": LOMBARDIA, "license": "CC0 1.0"}


def load_piemonte(path):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(path.read_bytes(), "html.parser", from_encoding="iso-8859-1")
    events = []
    for row in soup.select("table tr"):
        cells = row.select("td")
        if len(cells) != 7:
            continue
        values = [clean(c.get_text(" ", strip=True)) for c in cells]
        city = re.fullmatch(r"(.+)\s+\(([A-Za-z]{2})\)", values[0])
        dates = re.findall(r"\d{2}/\d{2}/2026", values[1])
        if not city or len(dates) != 2:
            continue
        convert = lambda d: date.fromisoformat("-".join(reversed(d.split("/")))).isoformat()
        start, end = map(convert, dates)
        organizer = re.split(r"\bTel:", values[3])[0].strip()
        phone = re.search(r"Tel:\s*([\d/ +.-]+)", values[3])
        email = cells[3].select_one('a[href^="mailto:"]')
        # Import business/association office contacts only, not named individual addresses.
        address = email["href"][7:] if email else ""
        if address and not re.match(r"^(info|comune|proloco|segreteria|turismo|commercio|protocollo|suap|eventi|manifestazioni|sviluppo|ufficio|urp|sindaco|pec|settore|amministrazione|cultura|sport)", address, re.I):
            address = ""
        contacts = {}
        if phone and clean(phone[1]): contacts["phone"] = clean(phone[1])
        if address: contacts["email"] = address
        event = {"region": "Piemonte", "city": city[1], "name": values[2], "category": category(values[2], values[5]),
                 "months": list(range(int(start[5:7]), int(end[5:7]) + 1)), "venue": values[4], "organizer": organizer,
                 "sectors": values[5], "source": {"url": PIEMONTE, "label": "Regione Piemonte · sagre e fiere mercato 2026", "checkedAt": CHECKED},
                 "editions": [{"year": 2026, "start": start, "end": end, "dateType": "calendar", "sourceUrl": PIEMONTE}],
                 "participation": {"type": "check", "note": "Il calendario indica i settori e i posti della manifestazione. Per disponibilità, tariffa e domanda contatta l’organizzatore; non è un elenco di posteggi liberi."}}
        if values[6].isdigit() and int(values[6]) > 0: event["stallCount"] = int(values[6])
        if contacts: event["contacts"] = contacts
        events.append(event)
    return events, {"inputRows": len(soup.select("table tr")) - 1, "selectedRows": len(events), "url": PIEMONTE}


def load_marche(path):
    from pypdf import PdfReader
    events, skipped = [], []
    reader = PdfReader(path)
    for page_number, page in enumerate(reader.pages, 1):
        lines = page.extract_text(extraction_mode="layout").splitlines()
        for line_index, line in enumerate(lines):
            if not re.match(r"^(PU|MC|FM|AP|AN)\s", line): continue
            # Normalize spaces inside known phrases before splitting PDF cells.
            line = re.sub(r"FIERA\s{2,}DI", "FIERA DI", line)
            line = re.sub(r"(\b\d{1,2})\s{2,}(" + "|".join(m.upper() for m in MONTHS) + ")", r"\1 \2", line)
            values = re.split(r"\s{2,}", line.strip())
            if len(values) != 9:
                skipped.append({"page": page_number, "row": clean(line), "reason": "ambiguous-columns"}); continue
            prov, city, venue, period, frequency, hours, name, stalls, sectors = values
            # A wrapped cell can belong to the previous or next PDF row.
            # Reject those rows instead of attaching text to the wrong event.
            wrapped = False
            for extra in lines[line_index + 1:]:
                if re.match(r"^(PU|MC|FM|AP|AN|PV)\s", extra): break
                if not extra.strip(): continue
                wrapped = True
            if wrapped:
                skipped.append({"page": page_number, "row": clean(line), "reason": "wrapped-pdf-row"}); continue
            months = months_in_label(period)
            if not months or "2017" in period or not re.search(r"fier|mercat|sagr|mostra|fior|fest|expo", name, re.I):
                skipped.append({"page": page_number, "row": clean(line), "reason": "unclear-period-or-name"}); continue
            name = clean(name).capitalize()
            url = MARCHE + "#page=" + str(page_number)
            event = {"region": "Marche", "city": clean(city), "name": name, "category": category(name), "months": months,
                     "venue": clean(venue), "hours": hours, "frequencyNote": frequency, "sectors": sectors,
                     "source": {"url": url, "label": "Regione Marche · calendario 2026 aggiornato a giugno", "checkedAt": CHECKED},
                     "editions": [{"year": 2026, "label": clean(period), "dateType": "calendar", "sourceUrl": url, **exact_dates(period)}],
                     "participation": {"type": "public", "note": "Fiera su area pubblica nel calendario regionale. Il numero di posteggi è l’organico dichiarato, non i posti liberi. Verifica con il SUAP comunale il bando, il settore ammesso e i termini della domanda."}}
            if stalls.isdigit() and int(stalls) > 0: event["stallCount"] = int(stalls)
            events.append(event)
    return events, {"inputRows": len(events) + len(skipped), "selectedRows": len(events), "url": MARCHE, "skippedRows": skipped}


def main():
    parser = argparse.ArgumentParser()
    for name in ["lombardia", "piemonte", "marche"]: parser.add_argument("--" + name, required=True, type=Path)
    args = parser.parse_args()
    events, sources = [], {}
    for region in ["lombardia", "piemonte", "marche"]:
        path = getattr(args, region)
        rows, report = globals()["load_" + region](path)
        report["downloadedAt"] = CHECKED
        report["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
        events.extend(rows); sources[region] = report
    # Resolve municipalities against the same authoritative coordinate file as the site.
    comuni = json.loads((ROOT / "data/comuni.json").read_text(encoding="utf-8"))
    locations = {(key(c["nome"]), c["regione"]): c["nome"] for c in comuni}
    selected, unresolved = [], []
    for event in events:
        city = locations.get((key(event["city"]), event["region"]))
        if not city:
            unresolved.append({"region": event["region"], "city": event["city"], "name": event["name"]}); continue
        event["city"] = city; selected.append(event)
    output = {"importedAt": CHECKED, "year": 2026, "sources": sources, "unresolvedMunicipalities": unresolved, "events": selected}
    (ROOT / "data/fiere-importate.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"selected": len(selected), "regions": dict(Counter(e["region"] for e in selected)), "unresolved": unresolved}, ensure_ascii=False))


if __name__ == "__main__": main()
