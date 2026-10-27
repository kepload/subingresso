# Esclusione degli account interni — 27 ottobre 2026

I due account indicati dal proprietario sono esclusi dalle misure commerciali.
La configurazione usa UUID in una tabella privata; indirizzi e UUID non sono
pubblicati nel repository. Non cambiare `is_admin` o `is_demo` per ottenere
questa esclusione.

Annunci e fiere salvati, consultazione, contatti, messaggi, valutazioni,
pagamenti, ricevute e permessi restano operativi. I loro record funzionali
sono conservati. Un pagamento effettivo dell'account interno continua a
essere registrato e attivato, ma non entra negli incassi commerciali.

## Raccolta e report

- `analytics_tracking_context` riconosce solo l'account autenticato e registra
  gli identificativi di misura già esistenti, senza email nel browser.
- Il client aspetta questa risposta prima delle misure anonime, usa il JWT
  per visite/conversioni e conserva un marcatore di esclusione sul dispositivo.
  Il marcatore vale anche dopo il logout; l'accesso con un cliente diverso lo
  rimuove e cambia gli identificativi di misura, senza toccare i dati personali.
- Le esclusioni sono controllate anche nel database, per visite, annunci,
  clic, ricerche, banner, fiere/eventi e contatori. Un errore nella misura
  non impedisce un'azione sul prodotto.
- I report commerciali usano viste private filtrate: utenti, annunci, funnel,
  messaggi, valutazioni, Vetrine, email e ordini. Le funzioni di autorizzazione,
  gestione account e acquisti personali continuano a leggere i record veri.
- I preferiti interni restano salvati, ma non aumentano i contatori pubblici.
  I contatori correggibili sono ricostruiti dalle righe conservate, con snapshot
  privati; la correzione dei giornalieri è applicata una volta sola.
- Il grafico crescita conta ordini Vetrina live confermati, una volta per
  checkout; tentativi incompleti e pacchetti non gonfiano gli acquisti.

## Storico e limiti

I record attribuibili agli account interni e le sessioni già collegate sono
esclusi anche dallo storico. Un vecchio evento anonimo o un contatore aggregato
senza autore non permette di stabilire chi lo ha prodotto: non viene cancellato
o corretto per ipotesi. Il riconoscimento di un browser esclude le sue misure
future, senza attribuire automaticamente al proprietario tutte le visite passate.
Un browser nuovo o con memoria cancellata richiede un accesso per riconoscere
il proprietario. I contatori dimostrativi della home restano una regola separata.

## Applicazione e verifiche

`PATCH_ANALYTICS_EXCLUSIONS_20261027.sql` è idempotente. Il punto commentato
`analytics-exclusion-accounts` viene completato in fase di applicazione con
gli UUID risolti da `auth.users`, in una copia privata e nella stessa transazione.
Non rendere la configurazione modificabile da un normale utente.

`scripts/verify-analytics-exclusions.sql` verifica in ROLLBACK account interni,
preferiti, contatori, contatti, report, accessi admin e clienti ordinari.
`scripts/test-analytics-exclusions.cjs` usa Chromium/WebKit con rete simulata
per esclusione, logout, cambio account e risposte fuori ordine.
`scripts/test-analytics-valuation.cjs` controlla report e conteggi mantenendo
le valutazioni anonime. Nessun messaggio, pagamento o invio email di prova.
