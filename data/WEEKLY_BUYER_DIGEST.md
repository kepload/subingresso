# Digest acquirenti — contratto e verifica C-09

Correzione del 12 novembre 2026, limitata a
`supabase/functions/weekly-buyer-digest/index.ts`.

La query usa `annunci.settore`, presente nello schema corrente, al posto
dell'inesistente `merce`. Nessun consumer del digest usa questi due campi:
le schede continuano a mostrare titolo, prezzo, località e prima immagine.
Le colonne restano esplicite e non comprendono recapiti degli annunci.

Un errore nelle letture di annunci, alert, preferenze, deduplica o frequenza
interrompe il job con HTTP 500 prima di consultare destinatari o inviare email.
La risposta JSON contiene `error: "Digest failed"`, lo `stage` e, quando
disponibile e valido, solo il codice SQLSTATE/PostgREST. Le eccezioni hanno
lo stesso esito, senza testo del provider/DB, indirizzi, ID utente o token nei
log. Lo stage distingue `recent_offers`, `annunci`, `alerts`, `profiles`,
`digest_log_read`, `recipient`, `provider`, `digest_log_write` e
`initialization`.

Zero, uno o due annunci realmente ottenuti senza errori restano skip HTTP 200;
nessun alert resta `No alerts`. Nessun errore viene convertito in questi esiti.
Un errore Auth nella lettura del destinatario ferma gli invii successivi.
Un errore nel salvataggio del log restituisce 500 e ferma il ciclo: il provider
può avere già accettato l'email, quindi l'esito è parziale. Nessun recupero,
retry, nuova prenotazione o garanzia di invio atomico è introdotto dal fix.
Il precedente comportamento per una risposta HTTP negativa di Resend resta
`OK — 0 digest inviati` se nessuna consegna è riuscita, senza scrittura del log;
la diagnostica registra soltanto lo status. Non è una conferma di consegna.

## Regole conservate

- Autenticazione interna Bearer e fallback alla chiave servizio esistente.
- Annunci attivi creati negli ultimi sette giorni, ordinati dal più recente;
  esclusione dei propri annunci, raggio di 200 km, massimo cinque schede,
  almeno tre risultati globali e tre per destinatario. Alert nazionale,
  fallback da comune a regione e località ignote mantengono il comportamento.
- Un solo destinatario per ID fra gli alert; profilo mancante o
  `email_digest=false` esclude l'invio. Il comportamento legacy per `null`
  rimane invariato. Nessun consenso promozionale viene aggiunto o ampliato.
- Deduplica `weekly_digest_log(user_id, week_start)` e stessa settimana
  calcolata dal codice preesistente; offerte Vetrina degli ultimi sette giorni
  sostituiscono il digest, compresi esiti riservati/incerti, eccetto annullati.
- Template, uscita `type=digest`, helper email condivisi e cron invariati.

## Test ripetibile, interamente locale

Con Node 24, senza installazioni aggiuntive:

```powershell
node scripts/test-weekly-buyer-digest.cjs
node scripts/test-vetrina-email.cjs
```

La prima suite esegue il vero `Deno.serve` in VM e il vero helper
`email-frequency.mjs`. Solo `createClient` e `fetch` sono simulati; il database
fixture valida le colonne contro lo schema letto il 12/11/2026 e applica filtri,
ordine, proiezione e upsert. L'orologio è fisso, gli indirizzi sono `.invalid`;
nessuna credenziale viene letta e nessuna rete reale è accessibile all'handler.
La suite copre errori con dati nulli/parziali ed eccezioni, skip, invio normale,
consenso, frequenza, deduplica anche su due chiamate, filtri, limite cinque,
escaping e fallimenti prima/dopo accettazione del provider. La seconda è la
regressione esistente sui contratti Vetrina e sostituzione dei settimanali.

## Distribuzione e verifica sicura

Integrazione e distribuzione spettano al coordinatore. Prima del deploy
ricontrollare schema, versione/configurazione Edge e solo nome/schedule/active
del cron; salvare il bundle precedente in `.local/`. Distribuire soltanto
`weekly-buyer-digest`, con gli stessi secret e `verify_jwt` correnti, senza
migrazioni o modifiche al cron. Dopo il deploy scaricare bundle e metadati
dall'API Management: confrontare sorgente/selezione `settore` e guardie errori,
stato ACTIVE, versione e configurazione; riconfermare cron invariato.

Non invocare il digest live, nemmeno come smoke test; non leggere destinatari,
consegne o log personali. La presenza del bundle corretto conferma il deploy,
non certifica consegne future. Nessun arretrato viene recuperato manualmente.
