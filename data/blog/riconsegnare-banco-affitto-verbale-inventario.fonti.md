# Riconsegna del banco in affitto: fonti e verifiche

Punto **61** di `Articoli blog da sviluppare.md`. Ricerca e materiali del **14 novembre 2026**, sessione nuova Codex 2, worktree esclusivo `articolo-ciclo-20261114-1305-61`. Slug originale `riconsegnare-banco-affitto-verbale-inventario`.

## Ambito e duplicati

Elenco LIVE letto prima dei materiali: **139 post**, salvati integralmente nei soli campi editoriali esistenti. Nessun duplicato del verbale di riconsegna con confronto iniziale/finale. Gli articoli `comprare-banco-merce-inventario`, `comprare-banco-ancora-affittato` e `fine-affitto-posteggio-reintestazione-licenza` riguardano acquisto, disponibilità o pratiche amministrative: restano invariati. Quest'ultimo è collegato per tenere separata la riconsegna materiale dagli adempimenti.

L'articolo riguarda affitto d'azienda o di ramo d'azienda nel commercio su area pubblica; il suolo resta pubblico. Non presenta un contratto universale, una perizia, una liberatoria o un calcolo automatico del danno. Inventario finale e osservazioni sono prove da valutare insieme al contratto. Nessuna regola nazionale inventata per reintestazione, cauzione o termini di contestazione.

## Fonti primarie consultate

1. **Codice civile, articolo 2561**, banca dati del Ministero dell'economia e delle finanze: [testo ufficiale consultabile](https://def.giustiziatributaria.gov.it/DocTribFrontend/executePrintArticolo.do?articolo=Articolo+2561&codiceOrdinamento=0000000000025610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&id=%7B9E93F1BE-06AE-4F24-8E9D-B838F7E0C2E6%7D). Conservazione dell'efficienza di organizzazione e impianti e delle normali scorte; regolazione economica della differenza fra consistenze iniziali e finali ai valori correnti finali. Ricevuta HTTP 200 e PDF conservati. La scheda indica testo in vigore dal 19 aprile 1942.
2. **Codice civile, articolo 2562**, stessa banca dati: [testo consultato](https://def.giustiziatributaria.gov.it/DocTribFrontend/executePrintArticolo.do?articolo=Articolo+2562&codiceOrdinamento=0000000000025620000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&id=%7B9E93F1BE-06AE-4F24-8E9D-B838F7E0C2E6%7D). Estensione delle disposizioni dell'articolo precedente all'affitto d'azienda. Ricevuta HTTP 200 e PDF conservati.
3. **Corte di cassazione, Ufficio del Massimario, rassegna civile maggio 2023**, [pagina 112, ordinanza 13363 del 16 maggio 2023, Rv. 667695-02](https://www.cortedicassazione.it/resources/cms/documents/Rassegna_mensile_MAGGIO_2023settore_civile.pdf#page=112). Confronto anche qualitativo delle componenti aziendali; la rassegna distingue l'affitto d'azienda dalle regole su migliorie e addizioni della locazione immobiliare. Si cita la massima ufficiale, non si dichiara letto il fascicolo integrale della causa. Ricevuta PDF HTTP 200 e testo delle pagine pertinenti conservati.
4. **Comune di Paderno Dugnano**, [servizio commercio su aree pubbliche, subentro e cessazione](https://www.comune.paderno-dugnano.mi.it/servizi/imprese-e-commercio/dettaglio-servizio/Commercio-al-dettaglio-su-aree-pubbliche-su-posteggio-in-concessione-segnalare-il-subentro-il-trasferimento-di-sede-il-cambiamento-di-ragione-sociale-la-sospensione-dellattivita-e-la-cessazione/). Consultato per riscontrare la separazione fra documenti privati e pratiche SUAP. Indicazioni locali, senza estensione nazionale di scadenze o documenti. Nell'articolo resta solo il richiamo alla verifica presso il proprio SUAP e all'articolo interno dedicato.

Normattiva non è stata leggibile tramite lo strumento web per i due articoli: i testi sono stati verificati sul portale ministeriale. Il primo download con Python requests è fallito per certificati CA locali; il download con urllib e archivio certificati di Windows è riuscito mantenendo la verifica TLS. Non sono stati aggirati controlli di certificato.

Ricevute, data/ora UTC, URL, stato HTTP, dimensioni e SHA256 delle quattro fonti in `fonti-ricevute.json` nel dossier privato. Gli esempi (50/44 maglie, tavoli, bilancia, tessuto) sono interamente inventati e dichiarati. Nessun prezzo, danno, incasso o riscontro sul campo viene presentato come osservato.

## Risorsa gratuita

`downloads/verbale-riconsegna-banco-affitto.xlsx`: sette fogli, celle operative inizialmente vuote, esempio separato, riferimenti a inventario e proprietà, confronto di quantità e stato, riserve di entrambe le parti, deposito senza saldo automatico, allegati e firme. Il testo libero e le unità richiedono controllo umano. I soli calcoli sono le differenze di quantità: finale meno iniziale. Nessun calcolo monetario, macro, connessione dati o collegamento a cartelle di lavoro esterne. I link alle fonti sono normali collegamenti cliccabili.

**220 scenari PASS** tramite `formulas.ExcelModel` sulle formule lette dall'XLSX, confrontati con aritmetica Python indipendente: vuoti, un dato mancante, zeri certi, testo, numero memorizzato come testo, booleani, negativi, quantità frazionarie ammesse per scorte e respinte per attrezzature, differenze positive/negative/nulle, quantità grandi e quattro esempi. Validazioni numeriche attive; formule protette anche da input incollati non validi. Nessuna protezione con password; il modello resta modificabile.

Valori iniziali delle formule memorizzati per i lettori che non ricalcolano. Hash definitivo dopo l'aggiunta delle cache: **`2017be86caf66669640984f19857204bacadd8edfa043c19b08d2aed9bd8818b`**. Ricevute di struttura e formule allineate al file definitivo. Non è stata usata un'applicazione desktop Excel o LibreOffice.

## Copertina e articolo

Copertina originale generata con `image_gen`, scena inventata dichiarata nel corpo. Prompt integrale nel file `.prompt.md`; originale nel dossier privato. WebP **1600 × 900**, SHA256 **`8d2b00316bb4bd9cf88c27b6fd292a52e346bc8371b7a0769a9b2934d5e1b11f`**. Originale e anteprime esaminati visivamente.

Articolo di **585 parole**, sei h2, tre punti iniziali, due slot ADS inline/closing, un download e collegamento interno pertinente. Rendering con l'handler SSR effettivo, sanitizzazione e regole ADS correnti; nessuna modifica a codice, template, CSS, API o servizi condivisi.

## Prove e pubblicazione

Dossier privato: `.local/lavori/articoli/ciclo-quote-20261114-1305/articolo-61/` nella root principale. Generatore e verifica del file, script adattato da `netto-vendita-banco-20261113`, fonti, baseline, checkpoint e ricevute conservati lì. Nessun vecchio modo mutativo eseguito: lo script è una copia specifica per lo slug e il worktree assegnati.

Backup di sessione remoto verificato: `backup/session-20261114-133938-articolo-61-riconsegna`, HEAD iniziale `0378eebc5971145158b405da119f6e92932861f6`. Ramo preventivo del coordinatore `backup/pre-articoli-quote-20261114-1305` verificato. L'helper ha rimosso un vecchio tag locale nel suo cleanup standard, conservando i riferimenti remoti; nessun'altra pulizia eseguita.

Anteprima: Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript. SEO/canonical/NewsArticle e due spazi ADS verificati, assenza di overflow ed errori JavaScript. Download effettivo con WebKit tramite HTTP locale, hash confrontato col file definitivo. Richieste browser di scrittura analytics/provider intercettate; nessun invio, account o annuncio reale di prova. Esame visivo di desktop e schermo 320 px.

**Pubblicato e verificato il 14 novembre 2026:** [articolo pubblico](https://subingresso.it/blog?post=riconsegnare-banco-affitto-verbale-inventario), ID `e6db047f-459e-43f5-bba7-f3af9d9550a8`, inserimento registrato alle **12:52:25 UTC**. Materiali `ae230e9ef3f3257d49ebb22bae18017f41e574a1`; [deploy Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/6qEqGfakH18ZmUPpqEGsYA1aQjxC). Prima del singolo INSERT sono stati riletti schema, vincoli (inclusa unicità slug), assenza di trigger applicativi e tutti i post: baseline immutata. Operazione idempotente, nessun UPDATE o DELETE. Dopo l'inserimento i **139 post precedenti sono identici in tutti i nove campi dello schema**, totale **140**.

Pagina HTTP 200, titolo, descrizione, canonical, NewsArticle, indice e sitemap verificati online. Copertina e XLSX HTTP 200 con gli hash definitivi sopra. Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript: **cinque percorsi online PASS**, nessun overflow o errore JavaScript; download WebKit effettivo identico. Scritture browser intercettate. Screenshot WebKit online esaminato; anche le celle dell'XLSX sono state esaminate con una rappresentazione HTML tecnica, distinta dalla stampa Excel.

Ricevute `deploy-ae230e9.json`, `insert-response.json`, `schema-prima-inserimento.json`, `riconsegnare-banco-affitto-verbale-inventario-pubblicazione.json`, `riconsegnare-banco-affitto-verbale-inventario-online-verificato.json` e `riconsegnare-banco-affitto-verbale-inventario-esito.json` nel dossier privato. Checkpoint JSON/Markdown aggiornati prima e dopo le operazioni remote; nessuna operazione incompleta.

Il primo hook pre-commit non trovava l'eseguibile gitleaks nel worktree. Copiata la dipendenza già presente nella root principale nella cartella ignorata prevista dal progetto; scansione esplicita dell'intero commit materiali **PASS, zero segreti**, senza bypass. I commit documentali successivi usano anche l'hook con gitleaks disponibile. Memoria ed elenco aggiornati limitatamente al punto 61.
