# Profilo privato e sessione dashboard

Correzione C-03, 12 novembre 2026. Nessuna modifica a schema, ruoli o servizi.

- L'uscita, anche da un'altra scheda, e il cambio identità invalidano subito
  la dashboard. Il dialogo viene chiuso e svuotato: contatti, nome, cognome,
  avatar, preferenze, metadati account, link pubblico e contenuto organizzatore.
  Anche la baseline del modulo e i messaggi asincroni vengono invalidati.
- La dashboard privata viene nascosta; resta il normale invito ad accedere.
  Il nuovo accesso, anche allo stesso account, ricarica e verifica i dati.
- `goToProfilo()` apre solo dopo `auth.getUser()`, con identità uguale a quella
  proprietaria dei dati caricati. Un errore o una sessione assente revocano
  l'accesso; una nuova identità richiede un nuovo bootstrap.
- Una versione di sessione impedisce a letture iniziali, aperture, salvataggi
  e upload precedenti di aggiornare il pannello dopo l'uscita. L'upload non
  prosegue con l'upsert dopo un cambio identità. Il reset password ignora
  messaggi appartenenti alla sessione precedente.
- Il rinnovo della sessione dello stesso utente conserva il modulo. La semplice
  chiusura annulla un'apertura ancora in attesa senza svuotare un profilo valido.
- Nessun dato privato viene aggiunto allo storage persistente. La verifica
  all'apertura richiede rete; durante l'attesa i dati del dialogo restano nascosti.

Implementazione: `dashboard.html`, `js/profile-switch.js`, `js/vetrina-account.js`.
Gli unici riferimenti runtime dei due JS sono nella dashboard; cache aggiornate
a `profile-switch.js?v=6` e `vetrina-account.js?v=5`.

Verifica: `node scripts/test-dashboard-session-isolation.cjs`, con
`PLAYWRIGHT_MODULE` se Playwright non è installato nel progetto.
La suite carica HTML e script completi, intercetta tutta la rete e usa SDK e
provider simulati; due schede propagano gli eventi tramite storage reale.
Chromium 1440/768/320 e WebKit 390; 244 controlli su uscita, svuotamento,
autorizzazione, A→B, rientro, rinnovo sessione e risposte tardive. Nessun account,
email, upload o record reale di prova. Screenshot e risultati in
`.local/verifiche/c03-dashboard-session/` (oppure `DASHBOARD_SESSION_QA_DIR`).

`DASHBOARD_SESSION_BASELINE=1` è il modo di riproduzione del difetto: eseguirlo
solo sulla baseline precedente al fix. La vecchia `test-profile-switch.cjs`
estrae funzioni isolate senza il bootstrap della dashboard e non inizializza
il nuovo stato di sessione: il suo timeout non sostituisce la suite completa.

## Pubblicazione verificata — 12 novembre 2026

Il coordinatore ha integrato il fix senza sovrapposizioni con C-09, ripetuto
i 244 controlli sui quattro formati, le sei combinazioni acquisti e i controlli
delle statistiche. Materiali `cb4a034`, Vercel riuscito. Dashboard e due JS
scaricati dal dominio pubblico coincidono con i sorgenti testati, normalizzando
soltanto CRLF/LF; riferimenti runtime v6/v5 confermati.

La stessa suite completa ha poi passato altri 244 controlli usando quei tre
file effettivamente scaricati dal sito, con SDK e provider intercettati.
Nessun account reale, reset email, upload o record di prova è stato creato.
Questo conferma il comportamento dei file pubblicati nelle condizioni della
fixture, senza affermare un collaudo con account reali. Il limite della vecchia
suite isolata resta esplicito.

Prove private del coordinatore:
`.local/lavori/bugfix-paralleli-20261112-0750/C03-published-assets.json`,
`published-assets/`, `C03-published-browser/results.json`; prove dell'integrazione
nel relativo worktree, `.local/verifiche/c03-dashboard-session/`.
