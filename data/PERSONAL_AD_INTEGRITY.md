# Integrità delle statistiche ADS — 4 novembre 2026

I contatori descrivono eventi misurati secondo criteri espliciti, non persone
uniche né una certificazione che ogni evento appartenga a un essere umano.
Questa modifica corregge la raccolta delle ADS proprie. Non introduce campagne
cliente, fatturazione a clic, nuovi pagamenti o un servizio universale antifrode.

## Raccolta

- GET e HEAD del link pubblicitario navigano con 303 senza scrivere eventi.
- Un'impressione richiede almeno metà banner visibile per un secondo con
  documento attivo, sessione esistente e browser ammesso dalla misura.
- Il browser invia POST same-origin con contesto, tempi e sessione. L'API
  esclude cookie interni, prefetch e user agent di automazioni riconosciute;
  verifica input e origine. Un client HTTP può falsificare questi header:
  non sono usati come prova autonoma di umanità.
- L'API firma la richiesta SQL con HMAC-SHA256 e una chiave dedicata privata.
  `personal_ad_event_v3` verifica firma e data (massimo 60 secondi; tolleranza
  futura 5 secondi). Le vecchie RPC v1/v2 non sono eseguibili da anon/authenticated.
- L'impressione restituisce una ricevuta HMAC con ID impressione, sessione,
  ADS, misura, posizione, articolo e versione. Vale al massimo 24 ore e non
  viene salvata in uno storage persistente. I prefissi `ticket:` e `event:`
  separano firme browser e firme di scrittura SQL.
- Solo `click`/`auxclick` del browser con `isTrusted`, documento attivo e
  identità pronta usano la ricevuta. Focus, pointerdown e `dispatchEvent`/
  `.click()` da script non registrano clic. Il controllo `isTrusted` è un
  filtro client, non una barriera crittografica contro browser automatizzati.
- Il clic usa una navigazione POST nativa e poi 303: l'ID è disponibile prima
  della destinazione per il claim e le conversioni. Conservati tastiera,
  clic centrale e nuova scheda. Il normale link resta utilizzabile quando
  JS, rete, ricevuta o statistiche non sono disponibili, senza inventare eventi.
- Il server verifica ricevuta e corrispondente impressione effettivamente
  registrata; un cambio di sessione, ADS, formato, posizione, articolo o
  versione non può riusarla. Niente scritture dirette con la sola chiave pubblica.
- Lock e deduplica per sessione/articolo/ADS/versione/formato/posizione/tipo.
  Le ripetizioni restituiscono lo stesso evento. Limiti: 250 nuovi eventi/ora
  e 20 nuovi clic/ora per sessione; l'evento duplicato non consuma un altro clic.
- Admin/demo/account e sessioni interni esclusi anche sul server; logout e
  cambio identità invalidano le ricevute client. Il claim rifiuta eventi esclusi.

La chiave `PERSONAL_ADS_EVENT_KEY` è una variabile sensibile Vercel e una riga
privata in `data_quality.personal_ad_ingestion_key`, senza accesso client.
Nessuna credenziale nel repository. Una mancata configurazione ferma la misura
ma conserva la destinazione del banner. Nessun nuovo IP, user agent o fingerprint
nel database degli eventi.

I criteri di HMAC e degli eventi browser seguono la documentazione di
[PostgreSQL](https://www.postgresql.org/docs/current/pgcrypto.htm) e
[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted).

## Pulizia dello storico

L'audit ha ricostruito 80 richieste registrate come clic: 71 del picco abbinate
singolarmente ai log di hosting e compatibili con una scansione distribuita;
6 altre richieste senza sessione di origine indeterminata; 3 clic con sessione
e impressione precedente. Le prime due categorie sono escluse dal dato misurato
con ragioni distinte, senza attribuire alle 6 richieste un'origine inventata.

`data_quality.personal_ad_event_exclusions` conserva ID, ragione, istante,
evidenza e fotografia integrale dell'evento. Gli originali non sono cancellati
o alterati. La vista `data_quality.analytics_personal_ad_events` alimenta
riepiloghi, CTR, conversioni ed export con la stessa esclusione. Il ripristino
richiede una decisione esplicita sui singoli ID; non ricostruisce clic mancanti.
Backup, SHA256, abbinamenti e verifiche nelle cartelle private
`.local/backup/ads-counter-20261104` e `.local/verifiche/ads-counter-20261104`;
audit di origine in `.local/verifiche/audit-clic-ads-20261104`.

## Prove e limiti

`scripts/test-personal-ad-integrity-db.cjs`: SQL effettivo con tabelle temporanee
e ROLLBACK; firma falsa/scaduta, privilegi, sessione, visibilità, corrispondenze,
deduplica, esclusioni, claim e limite di clic. Nessun evento cliente di prova.
`scripts/test-personal-ad-integrity.cjs`: API e Chromium desktop/mobile più
WebKit, POST/303 con mouse/centrale/tastiera, attivazioni sintetiche, admin,
webdriver, errori e navigazione di riserva. Rete delle prove simulata.
Regressioni della raccolta, del contesto e del blog nei test esistenti.

Un bot evoluto può eseguire JS o imitare l'intero protocollo e ruotare sessioni;
questa protezione non lo rende identificabile con certezza. Prima di vendere
campagne con addebito per clic serviranno una politica commerciale di traffico
non valido, controlli antifrode aggiuntivi e audit per inserzionista: questo
intervento non attiva né certifica quel prodotto futuro.
