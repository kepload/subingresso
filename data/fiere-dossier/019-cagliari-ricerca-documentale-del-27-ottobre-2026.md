
## Cagliari — ricerca documentale del 27 ottobre 2026

**Ricerca attuale conclusa con limiti documentali espliciti, pubblicata e
verificata online.** Checklist aggiornata soltanto dopo le prove di pubblicazione. Audit
`data/fiere-cagliari.json`: **89 manifestazioni in 40 comuni**, ricognizione
nominale di **tutti i 70 comuni** della circoscrizione attuale. Riprese e conservate
le tre schede/ID al commit `1ebd846`, nessun audit provinciale precedente concluso.
Gli altri 30 comuni hanno esito motivato, non una dichiarazione di assenza di eventi.

La lista ufficiale metropolitana dei 70 comuni coincide con le assegnazioni della
mappa del calendario. Esclusi i territori estranei dopo la riforma sarda; nessuna
modifica all’anagrafica condivisa. Pavia resta riservata. Nessun altro agente,
nessun intervento al controller, nessun messaggio, domanda o candidatura a terzi.

### Fonti e prove

Dossier privato `Documents/ricerca-fiere-cagliari-20261027`: ricevute con SHA256,
originali binari e testi, ricerche nominali `search-01`–`search-22`, ricognizione
municipale, ricerche interne, albi e originali. **1953 URL acquisiti unici**,
di cui **103 riferimenti esaminati a sostegno delle schede**: i due numeri
non rappresentano documenti tutti letti integralmente. Indici, API vuote, allegati
di navigazione e file non pertinenti non costituiscono conferme di manifestazioni.
I file originali disponibili sono stati verificati con hash; duplicati URL ricondotti
alla ricevuta e all’originale più recenti. Portali WordPress e sette albi Halley,
ricerche pubbliche di Pula/Escalaplano/Vallermosa e ricerca interna di Muravera;
la sola acquisizione non equivale a lettura o a ricognizione storica integrale.

Helper riusati `fetch.py`/`show_source.py`; passaggi privati `territory.py`,
`crawl-municipal.py`, `deepen.py`, `portal-search.py`, `assemble.py`, `integrate.py`.
Gli script del repository e del controller non sono stati cambiati: le nuove
schede entrano dal catalogo editoriale già consumato dal build, con audit separato.

### Riscontri che cambiano le informazioni per gli ambulanti

- Cagliari: bandi correlati caricati nel browser, recuperati con `PLAYWRIGHT_MODULE`.
  URL Wine Not/Oktober Fest invertiti e Sant’Efisio con slug St Patrick: identificati
  per contenuto e originali. Bonaria aprile ha oggetto copiato da Orienta Sardegna:
  la graduatoria originale conferma il 24 aprile. Giornate posteggi Sant’Efisio
  **1 e 4 maggio**, non intero percorso religioso 1–4. Graduatorie con font difettosi
  controllate visivamente; nessun dato personale degli operatori trascritto nel catalogo.
- Sestu: bando originale completo, quattro pagine lette visivamente. **Due bolli
  da 16 €**, più tassa suolo non quantificata: corretta la precedente sintesi limitata
  al solo bollo domanda. Festa 4–6 settembre, istanze entro 24 agosto, scelta 28 agosto.
- Muravera: programma turistico 16–19 e 24–25 aprile, ma concessione commerciale
  verificata **solo 19 aprile**. Bando e avviso di pagamento originali recuperati dal
  portale trasparenza: 12,25/26,25/37,50 € per gli spazi/categorie specificati,
  più bollo domanda 16 €. Obbligo presenza 8–22 e pagamento entro 17 aprile ore 9.
- Nove tappe Saboris Antigus confermate nel calendario ufficiale ENIT 2026;
  moduli comunali dove reperiti. Guasila: **10 € residenti / 20 € non residenti**,
  istanze entro 15 novembre, limiti merceologici e foto merci. Selegas adesione
  per una o entrambe le giornate; Siurgus Donigala scadenza 11 novembre.
- Serri: originali separati per Santa Lucia **17 maggio e 20 settembre 2026**;
  scadenze 12 maggio e 15 settembre, indirizzo specifico per i moduli. Nessuna
  confusione con Saboris Antigus dell’8 novembre.
- Sinnai Calici d’Autunno 7 novembre: artigiani/hobbisti, CUP e bollo esenti,
  allestimento proprio. Somministrazione con graduatoria diversa: non nuovo bando food.
- Serdiana: avviso aggiornato 14 ottobre, priorità residenti e non residenti solo
  con residui; termine 16 ottobre ore 12. Partecipazione gratuita e niente CUP,
  ma gazebo bianco, trasporto, illuminazione e autorizzazioni a carico dell’espositore.
- Decimomannu: tabella quote settembre esaminata visivamente, settori e durate
  distinti, cauzione separata 250 € dove prevista. Due spazi area concerti riservati
  ad associazioni comunali, non offerta generalizzata agli ambulanti.
- Pula: originali per Santa Margherita **21–23 agosto** e Assunta **15 agosto**;
  il mercatino creativo reperito è un’edizione 2024, non rinnovo 2026. Isili:
  delibera 67/2026 e programma originale confermano Artis e Ortus **20 settembre**.
- Natale Cagliari: bandi rivolti ai gestori, non a singole casette. Annuncio comunale
  del 5 ottobre conferma mercatini **1 dicembre–6 gennaio**, con gestore individuato.
  Fiera Natale distinta: inizio autonomo non precisato, non copiato dai mercatini.

### Copertura, esclusioni e limiti

Copertura comune per comune e riferimenti sono nell’audit. Calendari regionali
senza anno, pagine storiche e date 2023–2025 rimangono tali; ad esempio Siliqua
mostra aggiornamento 2026 ma evento del 2023. Esclusi concerti individuali e calcio,
orientamento, processioni senza componente commerciale documentata, mercati
settimanali e ordinari; iniziative interne alla stessa rassegna non duplicate.
Mediterranea camerale è a **Oristano**, non a Cagliari; missioni fieristiche all’estero
e omonimi scartati. Genoni: atto trovato del 2011, nessuna conferma 2026 dedotta.

Collegamenti di Gergei/Villasor 404 e alcuni Sarroch 500; recuperato il programma
corrente Mercatini del Borgo a Sarroch. Collegamento espositori Vallermosa 410:
programma 2026 organizzatore letto, condizioni non inventate. Uta vecchia home 404,
Pula vecchio index.php 410 con recupero sul nuovo sito. Cinque URL regionali esplora
404 non sono dichiarati consultati. Assemini Sa Panada: determina 1010/2026 visibile
nell’indice, dettaglio non recuperato nel browser; il giorno 25 ottobre dei calendari
secondari non diventa una data confermata. Le assenze documentali sono limiti della
ricerca conclusa oggi, distinti da successivi bandi e manutenzione di nuove edizioni.

### Stato tecnico e pubblicazione

Backup remoto `backup/session-20261027-025405-fiere-cagliari` verificato su `1ebd846`;
errore successivo nel solo cleanup, backup non ripetuto. Dati e audit pronti: **89 schede, 54 con edizione 2026, 7 solo storiche e 28
con periodo usuale**; tutte le **7.741 schede esterne identiche**. Catalogo 7.830,
7.552 con dati edizione. Build ripetibile, settori, 7.830 pagine/3.414 sitemap e
test provinciale con `PLAYWRIGHT_MODULE` passati: Chromium 1440/320 e WebKit 390,
89 dialoghi per formato, mappa/elenco e sei pagine senza JS per formato.
Cache JS128/catalogo95. Dati pubblicati al commit **12d640c**, Vercel riuscito
`J1j5uUoKv9TxguzLYdTR6ApMsMEs` in 29,2 secondi: cinque asset identici ai byte Git,
**tutte le 89 pagine HTTP200/H1/canonical/fonti/note/costi verificate**. Browser online
con `PLAYWRIGHT_MODULE`: Chromium1440/320 e WebKit390, 89 dialoghi per formato,
mappa/elenco e sei pagine senza JS per formato. Sito reale negli stessi tre formati
senza errori pagina o overflow, dettaglio e conteggio 89 corretti; richieste non
GET/HEAD bloccate. Prove nel dossier privato. Checklist spuntata e riepilogo
**74 province concluse / 36 da fare su 110** soltanto dopo queste verifiche.
