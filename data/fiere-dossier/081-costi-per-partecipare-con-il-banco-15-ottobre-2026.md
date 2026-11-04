
## Costi per partecipare con il banco — 15 ottobre 2026

Ricognizione delle fonti e dei link di partecipazione delle **3.447 schede**:
1.870 URL iniziali distinti dopo rimozione dei frammenti, 453 recuperi di
collegamenti e approfondimenti, 2.182 estrazioni testuali riuscite su 2.323
richieste. **Questi conteggi non sono documenti tutti letti integralmente né
altrettante fonti pertinenti**: 259 fonti con possibili importi sono state
individuate automaticamente, poi vagliate per escludere biglietti visitatori,
ristorazione, visite, sanzioni, tariffe degli organizzatori e vecchie edizioni.
47 ricerche mirate archiviate, oltre ai primi riscontri web. Non è un
censimento esaustivo di tutti i listini pubblicati sul web.

**40 schede con nuove informazioni sui costi**, oltre alle 106 note già
presenti: totale 146. Il nuovo archivio editoriale `fiere-costi.json` contiene
126 sintesi con fonte, periodo tariffario, data di consultazione e natura del
costo: 50 quote, 26 tariffe per unità, 30 costi parziali, 13 condizioni
particolari e sette quote esplicitamente gratuite. Questi numeri non indicano
126 preventivi completi. Le 86 note recuperate dagli audit precedenti ne
conservano la data di verifica; 40 integrazioni provengono dalla ricerca
corrente. Le altre 20 note restano nel dettaglio senza un prezzo sintetico
certificato, spesso perché richiedono un preventivo o un canone da determinare.

Fonti e decisioni principali:

- [Grottammare, tabella 2026](https://www.comune.grottammare.ap.it/wp-content/uploads/2026/05/TARIFFE-2026.pdf):
  tabella letta anche visivamente; tariffa base 3×3 m 90 € per due giorni,
  con vie a maggiore potenzialità, somministrazione, artigiani ed espositori
  trattati separatamente. Il percorso contiene maggio, ma il documento cita
  la delibera dell'8 ottobre 2026: anno letto nel documento.
- [Genova, tariffe 2026](https://www.comune.genova.it/sites/default/files/2025-12/Tariffe%202026.pdf)
  e [calendario comunale](https://www.comune.genova.it/sites/default/files/2026-01/calendario%20fiere%202026_0.pdf):
  canoni al m²/giorno per 17 fiere nominalmente presenti nel calendario.
  Non estesi automaticamente a saloni privati o altri eventi cittadini.
  Per quattro fiere il tariffario è speciale; discordanza seconda categoria
  3,95 € nel dispositivo/3,90 € nell'allegato dichiarata nelle schede.
- [Aosta, Marché Vert Noël 2026/2027](https://aosta-api.municipiumapp.it/s3/266/allegati/sport/avviso-edizione-2026_con-data_signed.pdf):
  intero periodo 3.800/4.000/10.000 € secondo attività, IVA e servizi base
  compresi; caparra compresa nel totale, potenziamento e parcheggio extra.
- [Gusti di Frontiera, linee guida 2026](https://gustidifrontiera.it/documents/59/LINEE_GUIDA_2026_.pdf):
  vendita non alimentare/alimentare 250/450 €, somministrazione 950/1.400 €,
  maggiorazione oltre 25 m² e servizi da pagare separatamente.
- [Borgotaro, modulo alimentari 2026](https://www.sagradelfungodiborgotaro.it/wp-content/uploads/2026/03/modulo-enoagroalimentare-2026-1.pdf):
  banco 3×3 m 200/350 € + IVA per uno/due weekend, corrente separata.
  Non trasferito ai non alimentari o a giornate singole.
- [Balon e Gran Balon](https://www.balon.it/partecipa-balon-torino-vendere-al-balon/):
  29/90 € per spazio standard, oltre 30 € annuali per anagrafica. Anno
  tariffario non esplicito: nessuna attribuzione arbitraria al 2026.
- [MonzaCon, modulo Summer 2026](https://www.monzacon.com/downloads/Modulo_Espositore_MonzaCon_SE26.pdf):
  evidenziati anche i 70 € di iscrizione/assicurazione oltre allo spazio;
  [Villa Roberti](https://mercatinobrugine.it/wp-content/uploads/2025/10/Mercatino-Pieghevole_MM-2.pdf):
  aggiunte le opzioni Barchessa 30/35 € oltre alle piazzole 40/50 € già note.
- Klimahouse: listino pubblicato **2027**, mostrato con quell'anno anche
  quando la scheda conserva date storiche 2026. Tempo Libero: prezzi
  pubblicati senza anno tariffario esplicito e senza interpretare gli
  scaglioni come progressivi. Listini non proiettati su altre edizioni.
- Prato: quota 105 € e bollo 16 €, ma l'articolo non chiarisce se la quota
  copra una o entrambe le domeniche. Chiari: 25 € riguarda l'11 gennaio.
  Gaggiano: modulo corrente con quote P.IVA 20/30 €, testo secondario con
  riferimenti precedenti segnalato. Uggiate: mantenuta avvertenza sui numeri
  e le lettere discordanti. Avvisi con bolli/diritti rimangono costi parziali.
- Laigueglia e Amantea: prezzi ricavati da resoconti giornalistici datati,
  qualificati come tali e da confermare con il Comune. Cosenza: tariffario
  riportato da Confartigianato, con refuso nella data della delibera dichiarato.
  Non spacciati per preventivi direttamente confermati dal Comune.

Archivio di ricerca fuori dal repository:
`C:/Users/utente/Documents/ricerca-costi-fiere-20261015`, con manifesto,
testi, hash, ricerche, selezione editoriale e controllo d'integrazione.
Nessun Comune o organizzatore contattato. Download falliti, pagine dinamiche,
listini solo grafici e preventivi riservati limitano la copertura: **importo
non verificato non significa gratuito né prezzo certamente non pubblicato**.

Nel sito: riga costi nell'elenco; sezione dedicata nel dettaglio, fonte
cliccabile, anno delle tariffe e data di consultazione. Nessun importo
stimato da dimensioni ipotetiche. Build con overlay dopo gli audit
provinciali: tutti gli ID e i campi estranei ai costi restano identici.
Cache `fiere.js` 43, catalogo 35, CSS 13.
Build, controlli settori e suite del calendario passati su Chromium
1440/820/390/320 e WebKit 390: costi nel dettaglio e nell'elenco, fonte,
anno diverso dall'edizione, gratuità e importo mancante, filtri, elenco/mappa,
tastiera, errori/riprova e assenza di overflow. Primo avvio browser fermato
per una versione Playwright senza relativo eseguibile; usato il pacchetto
già presente compatibile con i browser installati, senza cambiare dipendenze.
