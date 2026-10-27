# Utilizzo del sito — 26 ottobre 2026

Richiesta: estendere la misura a ricerca, pubblicazione, accesso, annunci,
fiere, blog, calcolatore, Vetrine ed errori. Correggere anche gli errori del
wizard: messaggio sotto il campo, icona, bordo, focus e scorrimento coordinati.

Dal 27 ottobre anche i due account interni configurati sono esclusi dalla
raccolta e dai report commerciali, senza limitarne le funzioni personali.
Regole comuni e limiti dello storico: `ANALYTICS_EXCLUSIONS.md`.

## Raccolta e significato

`js/site-analytics.js` è caricato in modo sincrono dopo il tracker visite,
nei template HTML e SSR. Le misure precedenti restano distinte e invariate.

- Pagine: ingresso, uscita effettiva (`pagehide`), secondi con scheda visibile,
  massimo scorrimento. Campioni ogni 15 secondi, fino a 20 per pagina;
  all'uscita resta il totale. Tempo visibile e scorrimento non provano lettura.
- Ricerca annunci: risultati mostrati per combinazione di filtri, anche zero;
  località canonica, regione/provincia, tipo, vendita/affitto, raggio, giorni,
  fasce di 5.000 euro e 10 m². Nessun testo libero cercato. Il primo caricamento
  dei risultati è incluso: non sono esclusivamente ricerche digitate.
- Pubblicazione: scelta iniziale, passi raggiunti, ripresa bozza, selezione foto,
  tentativo, inserimento confermato ed errori per categoria/campo. Inserimento
  non significa approvazione/pubblicazione. Nessun nome, descrizione o foto
  copiati nel registro. L'ultimo passo raggiunto non prova un abbandono.
- Accesso: apertura, scheda, tentativo, errore categorizzato, accesso/iscrizione
  riusciti e account creato senza sessione immediata. Il contesto non contiene
  email/password. Stato di conferma richiesto distinto da conferma eseguita.
- Annunci: dettaglio, clic su telefono/WhatsApp/chat e preferiti; messaggi
  separati dopo conferma della scrittura. Nessun testo, ID conversazione o
  identità dell'interlocutore. Clic non equivalgono a contatti conclusi.
- Fiere: filtri/risultati, apertura dialogo, apertura fonte autorizzata,
  salvataggio/rimozione e promemoria dopo conferma. Le schede editoriali
  autonome hanno anche gli eventi pagina. Nessuna domanda di partecipazione
  viene presentata come inviata sulla base del clic sulla fonte.
- Blog: slug pubblico, tempo/scorrimento e collegamenti con destinazione e
  posizione. La sessione permette di osservare il seguito della navigazione;
  nessuna attribuzione automatica a una vendita.
- Calcolatore: primo avanzamento, domande, errori, risultato e salvataggio
  confermato. I valori economici restano nel registro valutazioni esistente.
- Vetrine: azioni del percorso esistente con dispositivo e provenienza.
  I pagamenti confermati restano nei registri ordini e nelle analisi esistenti.
- Errori: categorie definite, pagina e campo quando disponibile. Nessun testo
  integrale di eccezioni, stack, URL/token, nomi dei file o replay.

Ogni evento ha UUID idempotente, data server, tipo pagina, oggetto pubblico,
dispositivo stimato dalla larghezza (mobile ≤767, tablet ≤1024), categoria
pagina precedente, pagina d'ingresso e codici campagna/mezzo/canale. Nessun
nuovo identificativo persistente o IP/UA. Riusa `_session_id`; con storage
bloccato usa memoria della pagina. Logout/cambio account scarta la coda,
invalida risposte tardive e cambia il codice solo in memoria.

## Backend, accessi e conservazione

`PATCH_SITE_ANALYTICS_20261026.sql` crea due nuove tabelle private, senza
modificare annunci/profili/pagamenti o i loro trigger. `track_site_events`
accetta al massimo 20 eventi/32 KB; tipi, chiavi e valori sono validati dal
server. Località confrontate con il catalogo, dati sconosciuti scartati.
Deduplica UUID; limite serializzato di 300 eventi/sessione/ora. Admin e demo
autenticati sono esclusi dal server. Eventi anonimi restano pseudonimi,
non sono persone verificate; un client ostile può fabbricare eventi.
Lo stato autenticato deriva dal JWT al ricevimento: un evento in coda può
essere avvenuto prima dell'accesso, senza cambiare identità o data server.

Coda browser massima 100, invio differito e `keepalive` in uscita, massimo
due riprove di rete/5xx con gli stessi UUID. Errori di misura non bloccano
ricerca, pubblicazione, accesso, messaggi o pagamenti. Il mancato accesso
alla sessione non produce un invio anonimo per supposizione.

Nessun grant diretto anon/auth alle tabelle. `admin_site_analytics` verifica
is_admin, periodi 1–190 giorni, dispositivo e istante superiore fisso.
Riporta solo aggregati e righe prive di sessione/account. La data iniziale
è la reale installazione. Storico precedente non ricostruito.

Conservazione raw 190 giorni, cron giornaliero `site-analytics-retention`
solo sulla nuova tabella. L'applicazione deve verificare che pg_cron e il job
siano disponibili e attivi; nessun vecchio cron viene cambiato.

## Consultazione

Dashboard admin → «Utilizzo del sito», chiuso all'ingresso. Quattro numeri,
periodi, dispositivo, aggiornamento; azioni/passaggi e registro apribili.
Combinazioni aggregate: massimo 500 restituite, prime 100 della categoria
mostrate con limite esplicito. Registro paginato 100, CSV completo paginato
500 per richiesta con stesso istante/filtro, formule neutralizzate. Nessuna
esportazione parziale offerta in caso di errore/cambio dei dati.
Logout/cambio identità svuotano il pannello e invalidano letture/esportazioni.

Verifiche: `scripts/test-site-analytics-db.cjs` (SQL reale in ROLLBACK con
profili temporanei), `scripts/test-site-analytics.cjs` (raccolta e pannello
Chromium1440/768/320, WebKit390), `scripts/test-site-validation.cjs` (modulo
reale nei due temi, larghezza/engine via env). Servizi browser intercettati:
nessun annuncio, account, messaggio, email, ordine o evento reale di prova.
Prove e stato di pubblicazione in `Documents/raccolta-sito-errori-20261026`.
