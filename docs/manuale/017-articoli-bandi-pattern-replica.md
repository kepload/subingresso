
## 📰 Articoli "Bandi" — Pattern Replica

Pivot da "tutorial generico bandi" a "lista bandi reali" + sezione regionale unica + CTA `/annunci?regione=X`. Motivo: search intent mismatch — query "posteggi mercato [regione]" è transactional, il tutorial era informational → bounce alto, zero conversioni.

### Stato (6 mag 2026 — 20/20 COMPLETO)
- ✅ **20 fatte**: Lombardia (autonomo), Piemonte, Lazio, Veneto, Emilia-Romagna, Toscana, Campania, Puglia, Sicilia, Liguria, Marche, Trentino-A.A., Sardegna, Friuli-V.G., Valle d'Aosta, Umbria, Abruzzo, Molise, Basilicata, Calabria.
- Le ultime 5 (Umbria/Abruzzo/Molise/Basilicata/Calabria, basso volume search) chiuse il 6 mag 2026 sera.

### Template
- Slug: `bandi-posteggi-mercatali-{regione}` (lowercase, hyphenated). Categoria DB: `Bandi`.
- Lunghezza target: 3.300-4.500 char (sforare a 5k OK se bandi ricchi, vedi Sicilia/Lombardia).
- Format: HTML (DOMPurify-safe: `<p>`, `<strong>`, `<em>`, `<h2>`, `<ul><li>`, `<a href target="_blank" rel="noopener">`).
- 7-15 grassetti, frasi 10-15 parole, NO trattini lunghi, NO "esploriamo/approfondiamo/in conclusione".
- Struttura fissa: intro con problema → "Bandi attivi adesso" → "Bandi scaduti recentemente" (per "rosicare" — stile dell'utente) → **sezione regionale unica** (vedi sotto) → "Dove cercare i bandi nuovi" (3-4 link) → "Perché i bandi sono pochi" → "Subingresso: la via più veloce" → CTA `/annunci?regione=Nome` + `/vendi`.
- Per ogni bando: Comune, n. posteggi, scadenza esatta, durata concessione, settore, link/PEC. Date precise > vaghe.

### Sistemi regionali speciali scoperti (ognuno ha la sua "regola d'oro")
- **Umbria**: regione di festival, i bandi più ricchi sono eventistici annuali (Eurochocolate Perugia, Umbria Jazz, Festival Spoleto, Quintana Foligno, Calendimaggio Assisi, Tartufo Norcia). Eurochocolate ha tariffe 2-6k€ per i 9gg. Norcia post-sisma 2016 ha bandi atipici di riassegnazione container del Quadrilatero del Tartufo.
- **Abruzzo**: doppio binario costa/montagna. Bandi marzo-aprile per costa estiva (Pescara, Montesilvano, Vasto), settembre-ottobre per montagna invernale (Roccaraso, Pescasseroli). L'Aquila offre tariffe agevolate 3 anni nel centro storico riaperto post-sisma 2009. Costa dei Trabocchi (ciclovia 42km Vasto-Francavilla) bandi nuovi food/artigianato dal 2024.
- **Molise**: la regione **più accessibile d'Italia**. Bandi ricevono 10-15 domande dove in Lombardia ne riceverebbero 80-100 → vincibili al primo tentativo. Trampolino per costruirsi decennale e poi espandersi. Costa cortissima (35 km), Tratturi UNESCO 2019 nicchia food artigianale a concorrenza zero.
- **Basilicata**: tre economie distinte. Matera post-2019 (Capitale Cultura) con boom turistico permanente da 320k→700k visitatori e tariffe Sassi premium ma fatturati 3-4x. Costa tirrenica corta premium (Maratea), costa ionica più lunga e popolare (Metaponto-Policoro). Vulture (Aglianico DOC) sagre enologiche autunnali.
- **Calabria**: 716 km di costa (più lunga del Sud dopo Sicilia). Tirreno premium nazionale/internazionale (Costa degli Dei: Pizzo-Tropea-Capo Vaticano), Ionio popolare familiare (Riviera dei Gelsomini). 4 sagre cardine: Peperoncino Festival Diamante (100k+ visitatori, settembre), Cipolla Tropea, Tartufo Pizzo, Bergamotto Reggio.
- **Emilia-Romagna**: Comuni trasmettono elenco posteggi liberi a gennaio + luglio.
- **Campania**: 30 luglio scadenza Comuni → Regione → BURC + decreto unico (es. Decreto Dirigenziale 66/2025).
- **Puglia**: 30 aprile + 30 settembre Comuni → BURP entro 30gg → bandi semestrali maggio/ottobre. Sistema più organizzato d'Italia.
- **Marche**: calendario regionale annuale via DDDAPIM ogni gennaio (BUR Marche).
- **Sanremo**: scadenza unica 31 gennaio ogni anno.
- **Imperia**: sistema "spunta" giornaliera per posteggi liberi.
- **Veneto**: 90gg pubblicazione bando, 30gg domanda, 15gg revisioni.
- **Roma 18.000 concessioni**: bandone Gualtieri approvato mag 2024, slittato al 2026 per ricorsi TAR + ANA-UGL.
- **Palermo 906/2.135 vacanti**: situazione anomala (40% libero), Confimprese chiede tassa partecipazione 30€ vs 180€.
- **Savona Bolkestein 2032**: rappresentanti Fiva al MIMIT aprile 2026, concessioni attuali fino al 2032.
- **Trentino-Alto Adige**: due Province autonome (Trento L.P. 17/2010, Bolzano L.P. 7/2000) con regole proprie. Bolzano pubblica i bandi in italiano e tedesco, domande presentabili in entrambe le lingue. Mercatini di Natale = finestra annuale separata: bando giugno-luglio per casette stagionali novembre-gennaio (Bolzano, Merano, Bressanone, Trento, Rovereto, Brunico).
- **Sardegna**: due binari paralleli — mercati cittadini storici (San Benedetto Cagliari, Lu Mercatu Sassari, Sa Mura Oristano) con bandi rari, e posteggi turistici stagionali sulla costa con bandi annuali ricorrenti (1 giu - 15 set). Apertura finestra marzo-aprile. LR 5/2006 sul commercio. Settori top stagionali: gelato, cocco, bibite, abbigliamento mare.
- **Friuli-Venezia Giulia**: regione a statuto speciale, LR 29/2005 sul commercio. Particolarità chiave: clienti transfrontalieri (Slovenia/Austria) a Trieste, Gorizia, Tarvisiano cambiano il valore di alcuni posteggi. Costa Lignano-Grado = polmone turistico estivo, bandi stagionali giu-set ogni anno. Mercato delle Pulci di San Giacomo (Trieste) = appuntamento mensile storico per antiquariato/usato.
- **Valle d'Aosta**: regione a statuto speciale bilingue italiano-francese, LR 12/1999. **Fiera di Sant'Orso** ad Aosta (30-31 gennaio) = evento millenario, oltre 1000 banchi, bando dedicato esce settembre-ottobre dell'anno precedente. Stazioni sciistiche (Courmayeur, Cervinia, La Thuile, Pila, Champoluc) hanno bandi separati invernali (dic-apr) ed estivi (lug-ago). 74 Comuni piccoli = pochi bandi MA concorrenza bassissima → vincibili al primo tentativo.

### Workflow tecnico
- Articoli stanno SOLO in DB Supabase (`blog_posts`), non in file repo. NESSUN git push necessario.
- UPDATE: file SQL temp in `/tmp/`, dollar-quote `$content$ ... $content$` per evitare escape, eseguito con `supabase db query --linked --file /tmp/X.sql`. Rimuovere file dopo.
- **Bumpare `published_at = now()`**: freshness signal Google, ricrawl più probabile (la tabella non ha `updated_at`).
- **Aggiornare anche `excerpt`**: è la meta description su Google, conta per CTR.
- Filtro `?regione=Nome` su /annunci: valore deve matchare ESATTAMENTE quello in `js/data.js` (es. `Emilia-Romagna` col trattino, `Friuli-Venezia Giulia` col trattino e spazio, `Valle d'Aosta` con apostrofo, `Trentino-Alto Adige` col trattino).
- Sitemap dinamica fa fetch ogni 1h, niente da rigenerare.

### Output finora — char per articolo
Calabria 8866, Basilicata 7898, Abruzzo 7371, Molise 7276, Umbria 6403, Valle d'Aosta 5478, Friuli-V.G. 5416, Lombardia 5322, Trentino-A.A. 5278, Sardegna 5165, Sicilia 4950, Liguria 4385, Lazio 4291, Puglia 4246, Campania 4110, Emilia-R. 4015, Veneto 3993, Toscana 3814, Marche 3730, Piemonte 3347.

## 🐌 Pubblicazione Annuncio — Lessons Learned

- Tutti i webhook UI sync rimossi (30 apr 2026): annunci aveva 5 webhook che bloccavano INSERT 15-20s. Sostituiti con 2 trigger custom async via pg_net. INSERT < 800ms post-fix.
- **NON ricreare webhook UI dalla Dashboard.**
- Timeout INSERT su `annunci` = 45s in `vendi.html` (`_withTimeout`).
