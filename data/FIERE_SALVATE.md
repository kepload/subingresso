# Fiere salvate e promemoria personali — 19 ottobre 2026

Richiesta approvata: salvare la singola fiera e scegliere liberamente i mesi
di anticipo, inclusi5 e12. Sostituisce la precedente proposta di ricerche
salvate e riepiloghi su molte fiere: nessun nuovo avviso su altre opportunità.

## Percorso

- «Salva questa fiera» nel dettaglio del calendario, nelle pagine autonome
  da Google e negli eventi pubblicati dagli organizzatori. Account richiesto;
  accesso/registrazione e annullo conservano la fiera scelta.
- Salvataggio possibile senza email. Il promemoria richiede scelta esplicita.
  Numero da1 a120 mesi, scorciatoie3/5/6/12; calcolo per mesi di calendario,
  fine mese limitata all'ultimo giorno valido, inclusi anni bisestili.
- Data pubblicata oppure data indicativa scelta personalmente. Nessuna
  prossima edizione inventata da un vecchio calendario. Un anticipo già
  passato viene respinto con istruzione di cambiare mesi o data.
- Dashboard Ambulante, scheda «Le mie fiere»: stato, data prevista, modifica,
  disattivazione e rimozione. Nessun dato salvato in cache persistenti globali.
- Email: ricorda di controllare come partecipare; non dichiara candidature
  aperte o posti disponibili. Link alla fiera, gestione e disattivazione
  della singola scelta. GET mostra conferma; POST disattiva. La disiscrizione
  generale esistente arresta anche i nuovi promemoria; quella dai soli
  riepiloghi lascia indipendente la scelta personale.

## Architettura e invii

`api/saved-fairs.js`: sessione Supabase verificata, metadati canonici dal
catalogo o dalla RPC degli eventi pubblicati. Risposte private/no-store.
`public.saved_fairs`: dati del proprietario tramite RPC, nessun accesso
diretto per anon/authenticated. Identità ricavata dalla sessione; revisioni
contro aggiornamenti vecchi. Un salvataggio per account/fiera.

`fair_private.deliveries`: coda e registri riservati; chiave unica per utente,
fiera ed edizione/data personale. Rimuovi/risalva non duplica l'invio della
stessa edizione. Lease e payload immutabile proteggono chiamate concorrenti
e retry. Richieste Resend con Idempotency-Key; gli esiti incerti oltre23ore
restano sospesi per verifica, prima della scadenza delle24ore del provider.
Il payload con destinatario/corpo viene rimosso dopo esito inviato o rifiutato.
Conservare l'identificativo minimo finché serve a non ripetere l'avviso.

`fair-reminders` usa le credenziali interne esistenti, nessuna chiave nel Git.
Solo il percorso di disiscrizione accetta un token individuale senza login;
esecuzione e dry-run richiedono il bearer interno. Cron orario al minuto15:
gli avvisi del giorno diventano dovuti dalle09 Europe/Rome; ritenti in coda
per limiti/indisponibilità. Nessun nuovo annuncio attiva un promemoria.

Prima dell'invio ricontrolla il catalogo/evento pubblicato. Una data ufficiale
non più presente viene sospesa; le date pubblicate degli eventi organizzatore
vengono riallineate conservando l'identità dell'evento e senza secondi invii.
Le date personali restano dichiaratamente indicative.

Migrazione `PATCH_FIERE_SALVATE_20261019.sql`; cron separato
`scripts/setup-fair-reminders-cron.sql`, credenziale in Vault letta dal
meccanismo interno esistente, senza restituirla al client. Dati fiere,
preferiti annunci, pagamenti e trigger annunci conservati.

## Verifica

`test-saved-fairs-unit.cjs`: date, API, metadati, contenuti email, limiti,
errori, ritenti e dry-run, rete simulata. `test-saved-fairs-db.cjs`: SQL reale
in ROLLBACK, isolamento,12mesi, lease, duplicati, annullo e invii incerti.
`test-saved-fairs.cjs`: HTML/auth reali con backend simulato, quattro formati.
Regressioni accesso fonti,4.923 pagine, organizzatori e profili passate;
calendario320 passato. Moduli .mjs aggiunti ai MIME dei server di prova.
Corretto fetch same-origin per evitare un errore WebKit intermittente sui
controlli CORS delle richieste annullate durante il cambio account.
Prove `Documents/verifica-fiere-promemoria-20261019/`.

Backup remoto `backup/session-20261019-212903-fiere-salvate-promemoria` e
branch preventivo verificati; noto errore cleanup PowerShell. Checkout isolato
`Documents/subingresso-fiere-promemoria-20261019`; preferiti reattivi80031bb
e file estranei conservati. Backend applicato, worker fair-reminders ed
email-unsubscribe distribuiti; cron attivo, credenziale soltanto in Vault,
inaccessibile ad anon/authenticated. Esecuzione reale200 con zero destinatari
e invii, chiamata senza credenziale401. SQL reale ripassato dopo applicazione,
sempre ROLLBACK. Pubblicazione frontend da verificare.

Riferimenti: [Supabase, cron e Vault](https://supabase.com/docs/guides/functions/schedule-functions);
[Resend, idempotenza24ore](https://resend.com/docs/dashboard/emails/idempotency-keys).
