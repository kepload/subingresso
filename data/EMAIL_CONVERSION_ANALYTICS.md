# Email e conversioni Vetrina — 23 ottobre 2026

Dashboard admin: `#email-vetrine`, periodi 7/30/90 giorni e tutto lo storico.
Consegne aggiornate dal provider tramite «Aggiorna»; aperture e clic arrivano
direttamente agli endpoint dedicati. Nessun nuovo invio periodico o cron.

## Misure e limiti

- Le 12 offerte precedenti sono consegnate, ma senza misurazione: aperture e
  clic non ricostruibili, visualizzati come non disponibili. Zero non significa
  assenza di dati. Le percentuali nuove usano solo le email misurabili.
- Aperture/clic: email distinte; caricamenti ripetuti ravvicinati non gonfiano
  il numero di destinatari. Proxy immagini e sistemi di sicurezza possono
  produrre aperture/clic automatici: non sono letture o persone certificate.
- La versione informata `vetrina-email-analytics-20261023` del consenso
  facoltativo e inizialmente vuoto include la misura di aperture/clic. La
  versione precedente rimane valida per le sole offerte. Nessun ampliamento
  dei 50 permessi attestati su WhatsApp. Trigger solo INSERT profiles;
  nessun reconsenso da aggiornamento profilo/metadata.
- Link separato `unsubscribe?type=tracking`: smette solo la misura; offerte e
  preferenze periodiche restano invariate. Revoca marketing interrompe anche
  la misura. Verifica del permesso attuale a ogni hit/attribuzione.
- Tracking Resend del dominio lasciato disattivato: nessun pixel o modifica
  ai link nelle email di accesso/password. Pixel/click solo nel renderer offerte
  quando `tracking_enabled` è vero. Nessun IP/UA/device ID nel registro app.
- Senza consenso alla misura il pulsante conduce comunque alla proposta,
  passando annunci e durata, senza token individuale della mail.
- Il percorso autenticato registra apertura/chiusura proposta, scelta
  durata/annunci, tentativo/errore apertura checkout, arrivo email e ritorno
  dall'annullamento. Nessun replay, tastiera o identificativo persistente nuovo.
- Aperture/tentativi/chiusure sul sito contano utenti distinti; checkout e
  acquisti contano ordini. Sono misure con denominatori diversi.
- Il ritorno da «Annulla» richiede il proprio flow UUID; non si deduce dagli
  ordini scaduti. «Non completato» include pagamenti failed storici, senza
  attribuire cause (rifiuto carta, abbandono ecc.). Il ritorno richiede accesso:
  una chiusura della scheda Stripe non produce un evento Annulla.
- Attribuzione all'ultimo arrivo email autenticato nei 7 giorni prima della
  creazione checkout, con consenso ancora valido. Acquisto solo da payments
  confermati, non dal redirect di ritorno. Pacchetti normalizzati per sessione,
  un ordine e importo totale lordo. Rimborsi email separatamente indicati.
- Storico Stripe disponibile anche prima della strumentazione; esclusi test,
  admin/demo e ordini senza profilo cliente valido. Nessuna falsa ricostruzione
  retroattiva del percorso. Periodi UTC, filtro per creazione mail/ordine/evento:
  una conversione tardiva può appartenere a una coorte diversa dal clic.

## Sicurezza e invii

`PATCH_EMAIL_CONVERSION_ANALYTICS_20261023.sql` abilita RLS senza accesso
diretto anon/auth alle nuove tabelle. Statistiche richiedono sempre admin
nel DB. Funnel deriva user_id da auth.uid; nessun ID cliente accettato dal
browser. Token email casuale permette solo hit o contesto dei propri annunci.
Limiti 30 eventi/minuto e 300/giorno per account, tipi/durate enumerati.

`api/vetrina-mail.js`: pixel o redirect fisso alla dashboard; niente open
redirect. HEAD e prefetch non registrano; errori misura non bloccano il link.
`vetrina-journey.js` rimuove token dal URL prima degli altri script e usa solo
memoria. Cambio account/logout invalidano richieste pendenti.

Checkout: nuova sessione accompagnata da UUID di ritorno; telemetria salvata
solo dopo la registrazione autorevole dell'ordine. Un errore di analisi non
blocca il pagamento. Nessun cambio a prezzi, webhook, ordini o trigger annunci.

`admin-email-analytics`: JWT admin oppure credenziale interna; sync legge
ultime 100 email inviate (anche campioni), conserva la consegna già confermata
anche se il successivo evento è differente. Aggiornamento esplicito, non cron.

«Inviami una copia» indirizza esclusivamente all'email Auth dell'admin che
richiede la copia; nessun destinatario arbitrario dal payload. Una ogni 24 ore,
idempotenza provider, nessun retry dopo esito ambiguo. Esempio con annuncio
pubblico reale, perché l'admin non ne ha attivi propri: nessuna riattivazione.
`is_test` esclude copia e azioni admin/demo dai risultati e dai limiti clienti.

## Verifiche

- SQL: migrazione + `verify-signup-promo.sql` +
  `verify-email-conversion-analytics.sql` nella stessa transazione ROLLBACK:
  permessi, consenso vecchio/nuovo, revoca separata, hit ripetuti, proprietà,
  pacchetto pagato contato una sola volta, annullo separato, limite copia.
- `test-email-conversion-analytics.cjs`: API/Edge simulati, proprietario
  destinatario, nessun retry, isolamento account e browser reali Chrome
  1440/768/320, Safari 390, chiaro/scuro, errori e risposte fuori ordine.
- Regressioni checkout/Stripe, nove varianti, consensi, disiscrizione e dialogo
  Premium passate senza addebiti, account o messaggi di prova a clienti.
- Inspector componente in tre formati: 0 FAIL/0 WARN. Schermate e prove private
  in `Documents/statistiche-mail-vetrine-20261023`; nessun indirizzo o token
  di un destinatario versionato. Cache auth24, premiumJS3, unsubscribeJS4;
  nuovi journey/adminJS/adminCSS1.

Riferimenti: [Garante, tracking pixel](https://www.garanteprivacy.it/temi/tracking-pixel),
[Resend, tracking](https://resend.com/docs/dashboard/domains/tracking).
