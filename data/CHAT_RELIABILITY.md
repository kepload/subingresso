# Chat affidabili — 24 ottobre 2026

Schermata operativa: leggere e rispondere alla conversazione giusta. Conservati
URL, due pannelli desktop e navigazione lista/dettaglio sul telefono, identità
grafica, supporto e segnalazioni. Controller `js/pages/messaggi.js`, stili
`css/messaggi.css`, pagina `messaggi.html`.

- Stato separato per account e conversazione. Logout/cambio identità cancellano
  immediatamente testi, bozze, richieste, code e sottoscrizioni precedenti.
  Gli eventi ripetuti dello stesso account conservano la bozza. Login dalla
  pagina riavvia la chat senza ricaricare; i collegamenti diretti sono conservati.
- Ogni operazione cattura proprietario e revisione. Ogni scrittura usa il token
  della stessa sessione verificata e un destinatario immutabile: una risposta
  tardiva non può aggiornare la conversazione successiva o usare il nuovo account.
- Risposta mostrata subito con «Invio…»; «Inviato» soltanto dopo conferma del
  server o recupero della riga esatta. «Letto» deriva dal campo server, mai dal
  semplice invio. Errori e conferme ambigue hanno «Riprova» sulla stessa risposta.
  UUID client conservato durante tutte le riprove; la PK esistente impedisce
  duplicati anche dopo una risposta persa. Verifica della riga per ID,
  conversazione, mittente e testo; nessun retry con un nuovo ID.
- Coda ordinata per conversazione; un errore sospende le risposte successive.
  La riprova esplicita riparte dalla prima sospesa. Bozze, messaggi in attesa e
  token aggiuntivi non sono salvati in storage. Avviso nativo all'uscita quando
  resta testo non inviato; logout e cambio account azzerano tutto.
- `get_chat_inbox` legge soltanto conversazioni di cui `auth.uid()` è
  partecipante: ultimo messaggio, non letti, campi pubblici del posteggio e
  dell'interlocutore. Nessun telefono/email. Esecuzione solo authenticated,
  cursore composto attività/ID, pagine da 40; nessun massimo globale di 1.000
  messaggi applicato alla raccolta delle anteprime. Supporto presente anche
  senza conversazioni; creazione della riga solo al primo invio.
- Ultimi 50 messaggi all'apertura, storico precedente su richiesta. Cursori
  composti `created_at/id` conservano i microsecondi PostgreSQL. Recupero
  paginato di tutto il divario alla riconnessione, senza il vecchio limite di
  dieci; merge per ID tra caricamenti, invii, polling ed eventi realtime.
- Un canale Postgres Changes per account aggiorna anche le chat non aperte.
  RLS esistenti conservate. Reconnect/focus/ritorno online riconciliano inbox e
  chat; polling di sicurezza ogni dieci secondi quando la pagina è visibile.
  Broadcast separato del solo indicatore di digitazione, senza testo.
- Lettura solo dei messaggi ricevuti effettivamente visibili nella chat aperta,
  con pagina visibile e focus. Nessuna lettura della chat lasciata sul telefono
  o di quella che riceve un evento in background. Un errore di salvataggio non
  genera una falsa conferma locale.
- Scorrimento conservato durante recupero dello storico e nuovi arrivi, con
  pulsante «Nuovi messaggi». Nodi invariati riutilizzati negli aggiornamenti;
  caricamenti/errori distinguibili da una conversazione realmente vuota.
  Testi multilinea ed escape HTML, textarea a 16px, viewport visuale e safe area.
  Canoni indicati per anno; supporto e segnalazioni mantengono il proprio contesto.

Schema: `PATCH_CHAT_RELIABILITY_20261024.sql` aggiunge soltanto una RPC di
lettura e l'indice `(conversazione_id,created_at DESC,id DESC)`. Nessun cambio
a righe storiche, RLS, trigger di qualità/milestone o sistemi email.

Verifiche: `scripts/test-chat.cjs`, 25 scenari × quattro formati/temi
(Chrome 1440 chiaro, 768 scuro, 320 chiaro, Safari 390 scuro), API e realtime
simulati. `scripts/test-chat-db.cjs`: fixture di 1.207 messaggi in tabelle
temporanee e ROLLBACK; isolamento, grant, cursori, ultimo/non letti, confronto
con l'inventario reale in sola lettura. Nessun messaggio/email reale di prova.
Applicazione schema con confronto impronte di dati, trigger e policy invariati.
Prove e pubblicazione: `Documents/chat-affidabili-20261024`.

Riferimenti tecnici: [Auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
e [RLS e Postgres Changes](https://supabase.com/docs/guides/realtime/authorization#interaction-with-postgres-changes).
