# Fiere salvate e promemoria personali — 19 ottobre 2026

## Icone e avviso essenziale — 20 ottobre 2026

Nuova preferenza esplicita: Salva/campanella soltanto icone, accessibili con
nome e tooltip; nelle anteprime in alto a destra. Avvisami: mesi2–120,
scorciatoie2/3/5/6/12, data pronta, giorno dell'email e conferma. Nessun
testo didattico o doppia richiesta di consenso; l'apertura non attiva nulla.
Disattivazione separata per gli avvisi esistenti, modifica data nei dettagli.

La data del promemoria usa prima una data pubblicata con anticipo sufficiente;
in mancanza propone automaticamente la prossima ricorrenza annuale dall'ultima
edizione nota, dichiarando «Stimata dall’edizione YYYY». Se manca il giorno,
il primo giorno del periodo noto è soltanto indicativo. Cambio mesi ricalcola
la proposta; modifica manuale e avvisi già salvati conservano la loro data.
Nessuna proiezione per gli eventi singoli degli organizzatori. Stime salvate
come `personal`, mai come date pubblicate; catalogo, worker e DB invariati.
Supera il precedente divieto di proporre automaticamente stime personali.
Cache calendario95, saved-fairs JS/CSS3, modello3; CSS calendario32.
Prove `Documents/verifica-fiere-icone-avvisi-20261020/`: percorso completo
Chromium1440/820/320 e WebKit390, compresa Arsego stimata, provenienza, consenso,
mesi liberi, errori/riprova, disattivazione e isolamento account. API e invii
collaudati con dati simulati; nessuna scrittura o email reale di prova.

## Preferenza corrente — 20 ottobre 2026

«Salva» con segnalibro, come gli annunci, aggiunge/rimuove la singola fiera
con un clic e senza attivare email. Campanella separata «Avvisami» apre
subito la scelta dei mesi: minimo2, massimo120, numero libero e scorciatoie
2/3/5/6/12. L'avviso si attiva soltanto alla conferma; attivandolo si salva
anche la fiera. Stessi comandi nelle anteprime, nel dettaglio del calendario,
nelle pagine autonome/eventi e nella dashboard. Stato condiviso nella pagina,
blocco500ms/durante richiesta, ripristino su errore e isolamento account.

Rimossa «Gestisci fiera»: era l'etichetta provvisoria dei preferiti mentre
caricavano i dati, non un permesso di modifica dell'evento. Il salvataggio
legge lo stato aggiornato prima di scrivere; letture precedenti non annullano
le modifiche. Rimuovendo la fiera si disattiva anche il relativo avviso.

Supera il minimo1 e il percorso unico descritti nello storico sotto.
API/browser e RPC controllano il nuovo minimo; patch additiva
`PATCH_FIERE_MINIMO_MESI_20261020.sql`, senza riscrivere scelte pregresse.
Cache calendario91, saved-fairs JS/CSS2 e modello2; catalogo invariato.
Verifiche e limiti in `Documents/verifica-fiere-campanella-20261020/`.

Pubblicato `8b152f4`, Vercel READY `dpl_89wotv1DJ6kwWGHNqB8xkBtoFNdH`.
Sei asset identici; pagine catalogo/evento200 e API401/405 verificate.
Percorso completo sugli asset pubblicati passato Chromium1440/820/320 e
WebKit390: Salva immediato senza email, campanella/consenso,2/5/12mesi,
date, doppio clic, errori/riprova, scheda/dettaglio, dashboard, cambio account
e stato modificato da un'altra scheda del browser. Tre prove anonime reali
online con SDK/font/icone reali, accesso/annullo e nessun overflow/errore.
SQL reale ROLLBACK passato prima/dopo l'applicazione del minimo2 e con
migrazione completa; patch idempotente. Worker reale dry-run200/dovuti0,
cron attivo e ultime tre esecuzioni riuscite. Email ancora collaudate con
provider simulato: nessuna email reale di prova. Nessun account/evento/
acquisto/fiera salvata di prova rimasto nel DB. Regressioni fonti4,
calendario5, profili304 ed eventi3 passate; segreti verificati e ricerca
Alessandria concorrente preservata.

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

Prima dell'invio ricontrolla il catalogo/evento pubblicato. Una data pubblicata
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
sempre ROLLBACK.

Pubblicato `4dc4a2b`, Vercel READY `dpl_2nGPHs2oB52xC5ojs6QDeWLCrun8`.
Otto asset online identici: calendario, dashboard, privacy, JS calendario,
accesso e salvataggi, modello .mjs e CSS dedicato; MIME del modulo corretto.
API reale saved-fairs senza sessione/invalida401, metodo405 e conferma
disiscrizione200 senza modifiche. Tre prove anonime reali Chromium1440/320
e WebKit390, font/icone, accesso/registrazione, annullo e fonti passate.
Percorso completo sui file pubblicati passato Chromium1440/820/320 e
WebKit390, account/SDK/backend simulati: inclusa registrazione reale come
interfaccia, nessun salvataggio o avviso attivato automaticamente.
Corretto soltanto il MIME HTML della fixture evento per WebKit online.
Tracciamento Node File Trace verificato: modello e catalogo inclusi nella
funzione, nessun warning; normalizzati separatori Windows nel controllo.
Scansioni segreti superate; nessun account/evento/email reale di prova.
Le email sono verificate con provider simulato; il worker reale è stato
eseguito senza destinatari, non è stata inviata una mail di collaudo.

Cache: JS calendario87, accesso2; saved-fairs JS/CSS1 e modello1. CSS
calendario30, JSON59, data21 e preferiti annunci invariati. Registro e
prova finale aggiornati dopo le verifiche online.

Riferimenti: [Supabase, cron e Vault](https://supabase.com/docs/guides/functions/schedule-functions);
[Resend, idempotenza24ore](https://resend.com/docs/dashboard/emails/idempotency-keys).
