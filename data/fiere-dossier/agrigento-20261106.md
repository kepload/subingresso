# Agrigento — ricerca e pubblicazione del 6 novembre 2026

Ricognizione nominale dei **43 comuni**: **34 nuove schede in 26 comuni**,
**8 note economiche**. È una ricerca documentale con limiti, non un censimento
certificato. Pubblicata e verificata online: catalogo nazionale a 9.893 schede e 462 note.

Le sezioni seguenti conservano la consegna della fase di ricerca; esito della successiva integrazione in fondo.

## File e prove

- [Delta append-only](../fiere-agrigento-delta.json): 34 ID nuovi, nessuna
  identità preesistente sovrascritta.
- [Ricognizione](../fiere-agrigento-ricognizione.json): query realmente eseguite,
  esito specifico di ciascun comune, riferimenti e limiti; comprende una proposta
  separata per San Calogero ad Agrigento, **esclusa dall’integrazione**.
- [Costi provinciali](../fiere-agrigento-costi.json): overlay separato per le
  sole nuove schede. Nessuna modifica del registro nazionale.
- [Verificatore](../../scripts/verify-fiere-agrigento.py): usa il builder
  effettivo su copie private.

Originali, testi, risultati di ricerca, metadati HTTP e SHA-256 in
`.local/worktrees/agrigento-20261106/.local/ricerche/agrigento-20261106/`. `manifest.json` elenca i recuperi,
compresi quelli falliti; `search-*.json` conserva query e risposta ricevuta,
senza presentare gli snippet come lettura integrale dei documenti collegati.
`visual-reading.json` distingue le letture dei PDF scansionati dal testo estratto.
Prove del builder in `.local/verifiche/agrigento-20261106/risultato.json`.
Gli originali di immagini e DOCX sono conservati anche quando il primo recupero
li ha salvati con estensione `.html`: i byte sono quelli scaricati, senza
conversione; i due moduli A/A1 hanno estrazione XML separata `*-docx.txt`.

Baseline del worktree: `d240d1b`, **9.859 schede e 454 note economiche**.
Backup remoto di sessione verificato:
`backup/session-20261106-004257-agrigento-ricerca-20261106`.
Primo push del tag fallito, secondo riuscito e presenza su origin verificata.
Conservati anche i riferimenti del coordinatore:
`backup/session-20261106-004134-tre-province-potenza-campobasso-agrigento-20261106`
e `backup/pre-tre-province-20261106`.

## Decisioni documentali

| Comune | Schede e trattamento delle date |
|---|---|
| Agrigento | Natale 2025: bando comunale recuperato nella copia Intradata, senza giorni di apertura. Mandorlo: bando 7–15 marzo 2026, corroborato dalla brochure comunale. San Calogero già presente: soltanto proposta nella ricognizione. |
| Alessandria della Rocca | Froscia/’ncannellata 9–11 maggio 2025, dall’avviso comunale alle aziende; seconda edizione nei contratti senza nuove date attribuite. |
| Bivona | Pescabivona 8–9 agosto 2026 dal programma comunale, con vendita della pesca esplicita. |
| Campobello di Licata | ’Mpurnatu/’Mpanata 8–10 maggio 2026: stand gastronomici e artigianali espliciti. Antichi Sapori esclusa: cena popolare senza prova di posteggi esterni. |
| Canicattì | Rosario 18–20 ottobre 2025 dal Comune. Nessuna data Rosario 2026 importata dai portali. Summer Village non aggiunto senza settori commerciali approfonditi. |
| Casteltermini | Santa Lucia 12–13 dicembre 2026 da Pro Loco e bando originale. Tataratà: mercatino e fiera bestiame documentati; 29–31 maggio è il calendario della festa, bestiame soltanto la domenica mattina. |
| Castrofilippo | Cipolla Paglina 7–10 agosto 2026 dall’avviso spettacoli: non è il bando degli espositori. |
| Cattolica Eraclea | Rosario: conservate 11–12 ottobre 2026, giornate esplicite nell’avviso di esenzione; non aggiunto il sabato dai portali. |
| Cianciana | San Martino 10 novembre 2024; sede dal testo nel Chiostro, senza confonderla col Municipio del template. |
| Comitini | Cacciatore 20–21 luglio 2024 dalla liquidazione regionale 4042/2025. Nessun evento 2026 dedotto da un articolo aggiornato. |
| Favara | Fiori 30 ottobre–1 novembre 2026 dal messaggio comunale nell’app ufficiale. |
| Joppolo Giancaxio | Melone Giallo 2–3 agosto 2025 dal PDF comunale letto visivamente. |
| Licata | Maggio 2026 attestato dal bando, senza inventare giorni assenti. Natale 6–28 dicembre 2025 è programma previsto dal bando del gestore. Ceramica 2024 non aggiunta dal solo vecchio PDF indicizzato e ora 404. |
| Lucca Sicula | Crocifisso settembre e Olio novembre da pagine comunali senza edizione annuale affidabile; nessun giorno proiettato sul 2026. |
| Menfi | Inycon 2–4 ottobre 2026 dal bando aggiornato; Villaggio e Area Espositiva nello stesso evento, con condizioni distinte. |
| Montevago | Festa del Vino 25–27 settembre 2026 dall’avviso espositori e originale. |
| Naro | Fiera San Calogero lungo viale Umberto dalla descrizione Visit Naro; giugno, senza edizione annuale. Non confusa con Agrigento. |
| Racalmuto | Maria SS. del Monte dal bando 2025: luglio e 59 posteggi. Nessuna data corrente calcolata. Agricoltura 2026 solo indicizzata: non inventata una manifestazione continua 25–31 luglio dai giorni distinti 25, 26 e 31. |
| Raffadali | Fastuca 17–20 settembre 2026 dal programma organizzatore. Rosario/Maccu: ottobre dal piano comunale, senza edizione annuale. |
| Ribera | Fiera dei Morti come ricorrenza storica di novembre dalla relazione comunale. Stampa 4 novembre 2026: riproposta 5–6 dicembre per maltempo; nessuna nuova edizione segnata come confermata senza atto comunale. |
| Sambuca di Sicilia | Aziende in Fiera 19–21 settembre 2026 dal PDF comunale letto visivamente; adesioni per operatori locali. |
| San Giovanni Gemini | Ottobre 10–12 ottobre 2026 da decreto 22 e ordinanza 45. Giugno 2026 dall’estratto del decreto 13, senza giorni. |
| Sant’Angelo Muxaro | Ricotta: gennaio dalla guida turistica provinciale. Vecchie ordinanze 2026 e programma Asparago rimangono piste indicizzate, con originali non recuperati. |
| Santa Margherita di Belice | Settembre, Novembre/li Ficu e Ficodindia da pagine comunali, senza anno. Mostra Pecora parte della fiera di settembre, nessun duplicato. “I Sapori del Territorio” è descrizione gastronomica, non un quarto evento. |
| Santo Stefano Quisquina | Formaggio 30–31 maggio 2026: programma e moduli comunali originali A/A1, con requisiti sanitari distinti. |
| Sciacca | Ferragosto dall’atto e PDF integrale: 12–17 agosto è la finestra dei servizi igienici, non calendario certo dei banchi; soltanto agosto 2026. |

Le **25 schede con un riferimento annuale** comprendono **19 con giorni
documentati** e sei con etichetta/periodo; le altre nove conservano soltanto
il periodo tradizionale. “Confirmed” indica una data esplicita della fonte,
anche storica: non significa che l’edizione sia futura o che vi siano posti.
I programmi di affidamento del gestore sono contrassegnati `calendar`.

Fonti principali direttamente recuperate:
[Bivona](https://www.comune.bivona.ag.it/novita/avvisi/novita_147.html),
[Santa Lucia](https://prolococasteltermini.it/news/11a-sagra-della-cuccia-e-mercatino-di-santa-lucia-12-e-13-dicembre-2026/),
[Cattolica Eraclea](https://www.comune.cattolicaeraclea.ag.it/novita/notizie/novita_83.html),
[Montevago](https://www.comune.montevago.ag.it/novita/avvisi/novita_260.html),
[Menfi, bando aggiornato](https://www.comune.menfi.ag.it/wp-content/uploads/2026/09/Avviso-per-partecipazione-villaggio-tipicita-e-area-Expo-aggionato.pdf),
[Santo Stefano, programma e moduli](https://www.comune.santostefanoquisquina.ag.it/novita/comunicati_stampa/novita_492.html),
[Racalmuto, archivio 2025](https://trasparenza.comune.racalmuto.ag.it/zf/index.php/trasparenza/index/index/categoria/313).
Il delta collega la fonte specifica di ogni scheda.

## Costi: quote, canoni e servizi separati

| Evento | Dato verificato | Limite |
|---|---|---|
| Natale Agrigento 2025 | Bollo 16 € + istruttoria 15 € per il singolo | CUP, TARI, struttura e corrente non quantificati; non totale banco. |
| Mandorlo Agrigento 2026 | Bollo 16 € + istruttoria 15 € per il singolo | CUP, TARI, casetta e servizi distinti, senza totale. |
| Santa Lucia 2026 | 25 € per modulo fino a 3 metri di fronte, uno o due giorni | Spazi maggiori con aumento proporzionale; gazebo proprio, IVA non precisata. |
| Rosario Cattolica 2026 | Esenzione occupazione 11–12 ottobre | Non dimostra gratuità complessiva di banco e servizi. |
| Maggio Licata 2026 | Diritti SUAP 30 € | Bollo senza importo; quota partecipazione distinta e non quantificata. |
| Inycon 2026 | Villaggio selezionato gratuito; Area Espositiva 200 € per tre giorni | Stand/banco/corrente del Villaggio secondo bando; trasporti/materiali esclusi, IVA non specificata. |
| Vino Montevago 2026 | Suolo gratuito; bollo 16 € + diritti 5,16 € | 21,16 € sono soli oneri amministrativi; servizi e IVA non quantificati. |
| Formaggio Quisquina 2026 | Suolo 1,03 €/m²; punto luce 50 € separato | Modulo A senza moltiplicatore giornaliero; nessuna esenzione dedotta dal diverso A1. |

PDF dei prezzi letti anche visivamente dove necessario. Nessuna quota dedotta
da biglietti visitatori, degustazioni, donazioni, acquisto meloni, contributi
pubblici o appalti dei servizi. Nessuna affluenza o notorietà aggiunta.

## Limiti e comuni senza aggiunte

Aragona, Burgio, Calamonaci, Caltabellotta, Camastra, Cammarata, Grotte,
Lampedusa e Linosa, Montallegro, Palma di Montechiaro, Porto Empedocle,
Ravanusa, Realmonte, San Biagio Platani, Santa Elisabetta, Siculiana e
Villafranca Sicula: **esiti specifici e piste nella ricognizione**, non
affermazioni di assenza eventi. Nessuna lettura integrale di tutti gli albi,
social o archivi storici e nessuna soglia di completezza inventata.

Errori e casi rilevanti:

- Agrigento: vecchi avvisi 404 e tentativi nei nuovi percorsi 500; bando
  Mandorlo e Natale recuperati nella copia Intradata, dichiarata come tale.
  Brochure Mandorlo recuperata anche dal dominio comunale corrente.
- Sant’Angelo: pagine e vecchi PDF restituiscono 404; testo indicizzato
  conservato come tale, senza spacciare gli originali per scaricati.
- Racalmuto: certificato scaduto. Alcuni documenti pubblici recuperati con
  validazione TLS disattivata, metadati `tlsVerification:false`. Le pagine
  correnti differiscono dall’indice del motore per spostamento della paginazione.
- Siculiana: certificato non validato e portale turistico in manutenzione;
  affidamenti indicizzati non confusi con atti integrali recuperati.
- Allegati Halley di San Giovanni, Montevago e Quisquina: GET diretto della
  funzione generava errore applicativo. Recuperati con la stessa richiesta
  pubblica POST di download usata dal sito, senza inviare domande o contatti.
- Nessun annullamento definitivo attestato da un originale pertinente.
  Rinvio Ribera distinto da una nuova edizione confermata.

## Verifica privata e consegna

`python -B -X utf8 scripts/verify-fiere-agrigento.py`:

- builder base identico semanticamente al catalogo di partenza;
- fixture con **9.893 schede** dopo +34 e **462 note** dopo +8;
- tutte le **9.859 schede e 454 note precedenti invariate**;
- due build del delta identiche, ID coerenti con il builder, nessun conflitto;
- tutti i 43 comuni e i riferimenti alle query controllati;
- proposta San Calogero non applicata; file nazionali e altri dati invariati.

Nessun DB, dato reale di test, invio, contatto, UI o configurazione modificati.
Nessun sub-agente, altra provincia, loop o task avviati. Pavia resta riservata.
Rapporto e segnale pronto nella cartella condivisa autorizzata
`.local/lavori/tre-province-20261106/`; integrazione e pubblicazione rimandate
alla successiva istruzione del launcher sotto mutex, senza attesa attiva.

## Pubblicazione verificata

Commit dati `3fdaa4c`, ricerca `bdf8041`; Vercel Ready `dpl_8GrHAbAfLaYrmAkTQ5bxMxErMAdy`, dominio subingresso.it. Tutte le 9.859 schede e 454 note precedenti invariate; due build identiche, settori e SEO passati. Filtro, dettagli e pagine delle 35 schede provinciali verificati su Chromium1440/320 e WebKit390 locali/online; catalogo online identico, 34 letture API recensioni riuscite e 9.893 ID sincronizzati. Proposta San Calogero esclusa.

Prove di pubblicazione `.local/verifiche/agrigento-pubblicazione-20261106/`. Errori parziali: primo script fermato prima di scrivere per fonte senza ID, corretto; test generale pagine fermato nella fase browser per risoluzione Playwright, suite provinciale completa passata con modulo presente. Nessun account, recensione o invio reale di prova. Solo Agrigento conclusa; Potenza/Campobasso ferme, nessuna ripresa automatica.
