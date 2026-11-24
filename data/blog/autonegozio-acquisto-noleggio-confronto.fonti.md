# Fonti e verifiche: autonegozio, acquisto o noleggio

Articolo unico **37**, preparato il **24 novembre 2026** sul branch esclusivo `articolo/codex1-20261124-37`. Primo turno: sola preparazione. Pubblicazione e verifiche online restano al turno assegnato dal coordinatore.

## Perimetro e duplicati

Controllati **153 post LIVE** prima della stesura: prima solo `slug,title`, poi `excerpt,content` dei sei candidati pertinenti. Ricevute nel dossier privato: `live-slug-title.json` e `duplicati-candidati.json`. Nessun duplicato del confronto economico tra acquisto e noleggio di un autonegozio sullo stesso periodo e percorrenza.

I più vicini sono `autonegozio-usato-controlli-prima-firmare`, sui controlli di proprietà, documenti e allestimento; `registratore-telematico-fiere-acquisto-noleggio`, dedicato alla cassa e alle giornate fatturate; `comprare-giro-mercati-margini-ore-chilometri`, sui margini delle piazze. Gli altri tre riguardano guasto, ampliamento posteggio e cambio targa ZTL. Qui il mezzo è l'oggetto del confronto, con debito residuo, manutenzione, eccedenze chilometriche e valore finale. Categoria **Guide**: tema del mezzo per l'attività ambulante, non esclusivamente fiere.

## Fonti primarie e limiti

Pagine recuperate **HTTP 200 il 24 novembre 2026**, dopo ricerca e lettura online. Originali HTML, testi, data UTC, URL finale e SHA256 conservati in `fonti-ricevute.json` nel dossier.

- [Ayvens, Glossario del noleggio auto](https://www.ayvens.com/it-it/blog/conducenti/termini-noleggio-a-lungo-termine/), aggiornamento dichiarato 22 settembre 2025: anticipo, cauzione, valore residuo, servizi e clausole. Usato per le definizioni. Le condizioni del fornitore non sono estese a tutti i contratti.
- [UnipolRental, FAQ contratto](https://www.unipolrental.it/faq/contratto): costi dei chilometri in più e in meno indicati nell'offerta, differenze per modello e allestimento, possibili variazioni e penali per restituzione anticipata. Il foglio non presume un rimborso per i chilometri inutilizzati né il diritto a una variazione gratuita.
- [Ayvens, guida ai costi del noleggio](https://www.ayvens.com/it-it/blog/conducenti/quanto-costa-noleggio-auto-lungo-termine-guida-costi/), aggiornamento dichiarato 29 ottobre 2026: struttura dei costi, servizi ed extra. Supporto alla lista delle voci da controllare, senza riprendere prezzi, aliquote o promesse commerciali.

Le fonti dei noleggiatori descrivono il noleggio di veicoli: **non provano disponibilità, prezzo o copertura di un autonegozio attrezzato**. L'articolo richiede due preventivi pertinenti con allestimento e servizi equivalenti. Nessuna offerta reale o tariffa media è attribuita al mezzo. Il metodo e le formule sono redazionali, non certificati dai fornitori. Non vengono formulate conclusioni fiscali o giuridiche.

## Foglio gratuito

`downloads/confronto-autonegozio-acquisto-noleggio.xlsx`, quattro fogli: **Leggi qui, Confronto, Esempio e Fonti**. Sedici celle gialle obbligatorie, comprese le voci verificate a zero; convalide, controlli delle formule, colori distinti e aree di stampa. Nessuna macro, connessione dati o collegamento a workbook esterni. Solo tre link volontari alle fonti.

- Periodo comune in mesi interi e chilometri totali previsti. Orizzonte fino alla normale fine del noleggio con restituzione.
- Acquisto: prezzo intero se contanti, oppure anticipo; somma delle sole rate pagate nel periodo; conteggio del debito da estinguere alla fine; manutenzione e altri costi totali. Non sommare prezzo intero e finanziamento, né gli interessi già nelle rate.
- Valore finale: ricavo stimato netto delle spese di vendita, **prima** dell'estinzione del debito già contato separatamente. Se si tiene il mezzo è un valore patrimoniale stimato, non liquidità incassata.
- Noleggio: anticipo non rimborsabile più canone mensile già ridotto per i mesi, manutenzione extra, altri extra, addebiti finali diversi dai chilometri ed eccedenza chilometrica per tariffa. Manutenzione inclusa nel canone = zero tra gli extra. Cauzione mostrata separatamente, con ipotesi di restituzione completa; possibili trattenute da contabilizzare una sola volta negli addebiti finali.
- Risultati: esborsi acquisto, costo dopo valore finale, costi medi mensili e per km, costo totale noleggio, cauzione e differenza noleggio meno acquisto. Il costo per km resta vuoto con zero chilometri. Nessuna rata mensile o disponibilità di cassa dedotta dal costo medio.

Dati mancanti, testuali, negativi o fuori dai limiti bloccano i risultati dipendenti. Limiti tecnici, non suggerimenti commerciali: 1-120 mesi; 0-10 milioni di km interi; importi 0-1 miliardo per voce; tariffa extra 0-100 euro/km. Confronto nominale prima delle imposte, senza attualizzazione, costo opportunità o risparmi fiscali. IVA da rendere coerente sul caso concreto. Esclusi leasing, riscatto, proroghe, recesso anticipato, rimborsi km inutilizzati e tariffe a scaglioni: per questi serve un conteggio dedicato.

**Esempio interamente inventato e separato:** 36 mesi, 45.000 km; acquisto 40.000 + manutenzione 6.000 - valore finale 22.000 = **24.000 euro**. Noleggio 3.000 + 600 × 36 + (45.000 - 36.000) × 0,10 = **25.500 euro**. Cauzione di 1.500 separata; tutte le altre spese a zero per ipotesi, non perché normalmente assenti. Differenza 1.500 euro, da rileggere cambiando km, manutenzione e valore finale.

**51 casi PASS sulle 32 formule effettive**, con `formulas.ExcelModel` e risultati aritmetici indipendenti. Coperti tutti i 16 campi mancanti, testo, negativi, limiti, mesi frazionari, zero, contanti e finanziamento equivalente, interessi, debito finale, soglia km e superamento di un km, cauzione distinta, trattenuta, manutenzione inclusa/extra, costi comuni, residuo nullo/inferiore/superiore agli esborsi, pareggio e centesimi. Controllati ZIP, convalide e cache iniziali/esempio; formule inalterate. Non usata un'installazione desktop di Excel. Ricevuta: `verifica-foglio.json` nel dossier. SHA256 XLSX: `a7f487e26b19f2065106912df8f598b820c3e09e0b28a85c9b32df997ef2f61e`.

## Articolo, copertina e browser

Testo principale **2.622 caratteri**, sei h2 brevi, tre risposte iniziali, hook e prime frasi delle sezioni in grassetto. Due slot ADS inline/closing secondo il riferimento esistente. CTA al download, ai controlli sull'usato e agli annunci. Metadati limitati ai sei campi richiesti.

Copertina originale IA generata con skill `imagegen` e strumento integrato, conversione a **1600×900 WebP**. Scena inventata dichiarata nel testo. [Prompt integrale](autonegozio-acquisto-noleggio-confronto.prompt.md); originale PNG nel dossier. Nessuna simulazione di reportage o prova sul campo.

Anteprima ottenuta con il renderer SSR corrente e il solo post locale, con data dimostrativa del 24 novembre; non è pubblicazione. Regole ADS lette dall'endpoint pubblico. Verificati sanificazione, titolo, descrizione, canonical, NewsArticle, sei h2, tre risposte, due ADS e spazio Vetrine.

**Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript: PASS**. Tutti e cinque gli screenshot esaminati visivamente; copertina leggibile, testo e CTA accessibili, nessun overflow, errore JS o asset locale mancante. Cinque download effettivi HTTP locali, identici al file finale per SHA256. Richieste di scrittura analytics/provider intercettate; nessuna scrittura reale dal browser. Ricevuta: `verifica-anteprima.json`.

## Consegna del primo turno

Backup preventivo remoto verificato: `backup/session-20261124-013640-articolo-37-preparazione`, eseguito dalla root principale, HEAD `0378eebc5971145158b405da119f6e92932861f6`. Le modifiche preesistenti della root non sono state toccate. Worktree assegnato pulito all'avvio, baseline `46d055238eeefc6003a96e9bca75afb9ee30a444`.

Dossier privato `.local/lavori/articoli/20261124-codex1/articolo-37/`: job, fonti/ricevute, controllo duplicati, generatori, verifica formule, anteprima, screenshot e ricevute download. `prepared.md` e `prepared.json` riportano commit, verifiche e hash definitivi dei sei file. Stage esplicito e push del solo branch come backup, senza main, inserimenti DB o documenti comuni. Nessun altro tema sviluppato. Per la fase pubblica occorrono assegnazione del coordinatore, ricontrollo LIVE e verifiche online previste dal mandato.
