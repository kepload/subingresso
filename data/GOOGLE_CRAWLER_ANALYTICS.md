# Esclusione dei crawler Google — 17 novembre 2026

Richiesta: evitare che le scansioni Google alimentino le visualizzazioni del sito.
La verifica del 16–17 novembre ha confermato 641 richieste Googlebot su 822 al
contatore; IP confrontati con gli intervalli ufficiali, senza attribuire nomi
ai visitatori anonimi. Prove private: `.local/verifiche/traffico-20261117/`.

## Filtro sulle nuove misure

`PATCH_ANALYTICS_GOOGLE_CRAWLERS_20261117.sql` aggiunge un trigger prima
dell'inserimento su `page_views` e `site_analytics_events`. Il crawler riceve
una risposta normale, ma la riga non viene salvata; `track_site_events` restituisce
zero eventi inseriti. Nessuna pagina è bloccata, nessuna istruzione robots/SEO
cambia e gli utenti provenienti dalla ricerca Google continuano a essere misurati.

Il filtro usa due segnali alternativi della richiesta PostgREST:

- IP appartenente ai 317 intervalli ufficiali dei crawler comuni Google,
  snapshot del 17 novembre: 170 IPv4 e 147 IPv6, inclusi gli IPv4 mappati in IPv6.
- User-agent Googlebot, GoogleOther o Google-InspectionTool, anche quando
  l'indirizzo non è disponibile o Google aggiorna gli intervalli.

Non vengono esclusi tutti gli IP della società Google: Chrome, l'app di ricerca
Google e un referrer google.com non bastano per escludere un visitatore.
Il gateway viene letto da `request.headers`: prima `cf-connecting-ip`, poi
`x-real-ip`, infine il primo indirizzo di `x-forwarded-for`. Non viene cercato
un indirizzo Google in tutta la catena dei proxy. Header assenti/non validi
non causano errori. Il controllo riguarda soltanto le misure e non è un sistema
di autorizzazione: un client può alterare il proprio user-agent/header.

Gli intervalli pubblici sono in una tabella privata con RLS e senza accesso
anonimo/autenticato. IP e user-agent dei visitatori sono letti in memoria della
richiesta e non aggiunti alle tabelle analitiche. I vecchi trigger di validazione,
deduplica ed esclusione degli account interni restano invariati.

## Limiti e manutenzione

Filtro dal momento dell'applicazione; nessuna cancellazione o riclassificazione
automatica dello storico. Alle righe precedenti manca una provenienza certa.
L'intervento copre le pagine e gli eventi generali del sito, non modifica i
contatori indipendenti di annunci/Vetrine/ADS, ordini o dati funzionali.

Nessun nuovo cron o servizio. La lista IP è uno snapshot da rivalidare quando
si interviene sul filtro; il riconoscimento user-agent resta un secondo segnale.
Non è una promessa di riconoscimento di ogni bot con identità nascosta.

## Verifiche

`scripts/verify-google-crawler-analytics.sql` esegue 24 casi su header, IPv4,
IPv6, IPv4 mappato, confini, precedenza dei proxy e normale traffico Google.
Usa tabelle temporanee, conserva l'esclusione degli account interni e verifica
la vera RPC con evento Googlebot, senza creare righe reali. Tutto in ROLLBACK.
Applicazione, idempotenza, controlli PostgREST e ricevuta sono conservati
in `.local/verifiche/googlebot-filtro-20261117/`.

Applicato il **17 novembre 2026 alle 17:53:59 Europe/Rome**: 317 intervalli,
due trigger. I 24 casi sono passati sia prima (migrazione ripetuta due volte
in ROLLBACK) sia dopo l'applicazione. Prove HTTP sul vero PostgREST:
Googlebot/GoogleOther scartati prima della validazione, la vera RPC Googlebot
restituisce zero; browser normale e app Google raggiungono la validazione
ordinaria. Nessuna riga di prova creata. Home/fiere/blog con user-agent
Googlebot rispondono HTTP 200. Nessun asset frontend modificato: non serve
un deploy Vercel per rendere efficace questa migrazione SQL.

Fonti primarie:

- [Verifica dei crawler Google](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests).
- [Intervalli ufficiali](https://developers.google.com/static/crawling/ipranges/common-crawlers.json).
- [Header nelle transazioni PostgREST](https://docs.postgrest.org/en/stable/references/transactions.html#request-headers-cookies-and-jwt-claims).
