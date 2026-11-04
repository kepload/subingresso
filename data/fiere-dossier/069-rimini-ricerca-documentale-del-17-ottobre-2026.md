
## Rimini — ricerca documentale del 17 ottobre 2026

**115 manifestazioni in 25 comuni**, prima 13: **+102 nette**. Controllati i
**27 comuni attuali**, inclusi Montecopiolo e Sassofeltrio. Correzione territoriale
solo nel build del calendario: anagrafica condivisa e coordinate preservate.
Dati, comuni, fonti/impronte, tentativi, esclusioni e limiti in `fiere-rimini.json`;
originali in `Documents/ricerca-fiere-rimini-20261017`.

La ricerca documentale attuale è chiusa con limiti espliciti. Le future verifiche
periodiche sono distinte: non serve attendere nuovi bandi o garantire un
censimento esaustivo. Nessun messaggio, email o domanda inviato a terzi.

- **Rimini:** calendari PDF 2026 e 2027 letti integralmente e controllati
  visivamente. Pasqua sospesa in entrambi. Separate alberi di Natale (2 posti,
  ID originale conservato), generi vari (27) e casette Tre Martiri (27, nessuna
  domanda possibile). Generi vari 2026 solo **20/21/22/24 dicembre**, esclusi
  mercoledì e sabato; domanda **20 ottobre 2026**. Fogheraccia 2027: domanda
  19 settembre 2026–17 gennaio 2027; Primavera: 22 settembre–20 gennaio 2027.
  **20 euro istruttoria + 16 bollo**, esclusi canone e altri oneri. Per autunno
  e domeniche di dicembre solo eventuale lista di attesa, non disponibilità.
- **Sant’Agata:** Tartufo **4/11/18/25 ottobre e 1 novembre**; Natale
  **6/7/8/13/20 dicembre**. Obbligatorie tutte le cinque giornate. Domande alla
  Pro Loco, termini 30 giugno/1 settembre trascorsi. PDF di moduli e regolamenti
  originali: quote per categoria, mq, strutture e IVA, senza bollo comunale.
- **MotoGP Misano:** 35 posti esterni (14 alimentari, 21 non alimentari), gare
  11–13 settembre e occupazione dalle 15 del 10 distinte. **61/55 euro per metro
  lineare**, più canone e utenze. Termine principale 31 luglio 2026; refuso
  2025 nella ripetizione al punto 6 segnalato. Cattolica ingegno: 14 posti e
  massimo 28 turnanti; domanda 2 marzo–1 aprile, **30 euro SUAP** più canone.
  Ventena con refuso 2025 e avvio eventualmente successivo: date testuali.
- **Santarcangelo:** San Martino mercato generale 7–11 novembre, anteprima 6
  solo ristoro/settori tematici; San Michele 26–27 settembre. Casteldelci corretto
  al **1 novembre**, superato il 15 regionale. Coriano **21–22 novembre**:
  termini e modulo 2024 non estesi al 2026. Pugliano: cinque lunedì, termine
  15 luglio trascorso e SCIA alimentare dopo accettazione. San Marco testuale
  per avviso 2026 con domanda al 2025. Sassofeltrio banchi **3–4 ottobre** dalle
  14, non venerdì 2. Maiolo mercatino solo 21 giugno. Mangiarsano 4 ottobre
  distinto dalle tre domeniche successive della Castagna.
- **Riccione Christmas Village:** **28 novembre 2026–10 gennaio 2027**, selezioni
  annunciate aperte da Promo D, senza termine o tariffa casetta pubblici.
  Notte delle Streghe: domanda **13 giugno 2026**, bollo 16 euro, commercianti
  e area handmade distinti. Giardini d’Autore primavera a Rimini; autunno
  **19–20 settembre a Castello Benelli, Bellaria**, superato il vecchio luogo.
- Ricorrenze estive per località con giornate separate. Misano solo settembre
  documentato; via Perugia e venerdì Cavour restano testuali. San Gregorio e
  feste senza giorni dei singoli banchi marcati `periodOnly`. Saloni IEG con
  contratto stand, non spunta; date 2027 solo se pubblicate. Cattolica Retrò
  deriva dall’avviso organizzativo, non da bando per singoli espositori.

**Esclusioni:** Gemmano gastronomia senza prova di area venditori esterni;
Montegridolfo concorso olio, non mostra mercato (28 novembre termine campioni,
13 dicembre premi). Bambini e riuso di oggetti propri esclusi dalle opportunità
professionali. Locandina Saludecio vista: professionisti non documentati, non
dichiarati vietati. Natale Santarcangelo con URL 2026 è 2025–2026. Al Mèni e
Matrioška con programmi storici; Smanèt settembre originale 404, censita solo
primavera da comunicato attuale. Mercati ordinari, soli spettacoli, gare e pasti
esclusi; gratuità visitatori, concorsi e appalti gestori non sono costi banco.

**Limiti reali:** registro regionale annuale storico non ottenuto integralmente.
375 richieste numerate nei 25 comuni dell’anagrafica, retry HTTP/HTTPS, Chromium
e fallback TLS falliti; risultati originali disponibili via web e snapshot
precedenti confrontati con Comuni, SUAP, organizzatori e portali territoriali.
Nessun errore trattato come assenza. 403/404, dettagli dietro login e refusi
registrati; nessun accesso privato. Tre pagine Rimini Turismo scaricate dopo
SSLError con controllo certificato disattivato, confrontate separatamente con
il dominio ufficiale. Alcune ricorrenze incomplete restano testuali o parziali,
senza inventare giornate; nuove pubblicazioni appartengono alla revisione futura.

Catalogo nazionale **4.102** eventi, **3.987 schede esterne a Rimini identiche**
al commit iniziale `1c6e0cb`. Test `scripts/test-fiere-rimini.cjs` mediante
PLAYWRIGHT_MODULE: preservazione, giorni commerciali, tariffe, mappa, settori,
dettagli e pagine senza JavaScript; Chromium 1440/390 e WebKit 390.
Cache JS64/catalogo46. **Pubblicazione verificata online il 17 ottobre 2026**,
commit `3af5098`: catalogo identico al Git pubblicato (SHA-256
`1c08d60906ebb09bfb1a6077e3289178d5b1fd064e374def2df2af466e5c6ab8`, fine riga LF).
115 schede verificate live su Chromium 1440/390 e WebKit 390, inclusi
mappa, settori, dettagli e pagine senza JavaScript. Passati anche i test
generali calendario, pagine e settori. TO DO spuntata dopo la verifica:
**30 province concluse, 80 rimanenti**; aggiornamenti periodici distinti.
