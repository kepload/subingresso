# Pulizia delle versioni Vercel

Regola richiesta l'11 novembre 2026. Ogni dieci giorni conservare le dieci
versioni di produzione riuscite più recenti del progetto `subingresso`, ID
`prj_QsyHcCh5m4DGRTclNKR6z8MtaRnm`, nel team `team_OEH15rGwjmxGFhRiFzxaACrn`.
Proteggere inoltre ogni versione usata da un dominio o indicata come target di
produzione. Queste protezioni possono far conservare più di dieci versioni.

L'attività Windows `Subingresso - Pulizia versioni Vercel` esegue
`scripts/vercel-deployment-cleanup.ps1 -Apply` con l'utente corrente e privilegi
normali. Intervallo di dieci giorni, recupero delle esecuzioni saltate, rete
richiesta, una sola esecuzione alla volta, due tentativi aggiuntivi a distanza
di quindici minuti in caso di errore. Il PC deve essere acceso e l'utente deve
aver effettuato l'accesso. Vercel CLI usa l'autenticazione locale e il suo
rinnovo automatico. Logout o revoca dell'accesso interrompono la pulizia.
Le chiamate CLI sono sequenziali per evitare rinnovi concorrenti della stessa
credenziale a ogni esecuzione dopo giorni di inattività.

La prima opzione valutata, GitHub Actions, richiedeva un token dedicato.
L'accesso CLI disponibile ha rifiutato la creazione con HTTP 403,
`Cannot create tokens for this app`. Nessuna credenziale aggiuntiva creata.

## Controlli a ogni esecuzione

- Lettura completa delle pagine API di deploy e alias, limitata al progetto.
- Conteggio delle sole versioni di produzione READY, ordinato per data.
- Controllo del dominio `subingresso.it` e risposte HTTP 200 di home, fiere e blog.
- Nuova lettura dei dati prima di ogni cancellazione, verifica dell'identità del
  deploy e dei suoi alias. Rimozione di un solo ID con `vercel remove --safe`.
- Verifica della rimozione, delle dieci versioni conservate e della homepage.
  Dati incompleti o errori fermano le cancellazioni successive. Un nuovo
  tentativo rilegge lo stato corrente e riprende il lavoro restante.
- Resoconto privato JSON in `.local/verifiche/vercel-cleanup/`, anche per esiti
  parziali. Nessuna credenziale nei resoconti o negli argomenti dei processi.

Il piano cancella soltanto vecchi deploy di produzione di questo progetto.
Il progetto separato `subingresso.it`, le anteprime e le build annullate restano
fuori dalla selezione. Le regole di conservazione e i limiti applicati
direttamente da Vercel continuano a operare autonomamente. Lo spazio può
aumentare fra due pulizie, in base al numero e al peso delle pubblicazioni.

## Comandi di gestione

Simulazione con `powershell.exe -NoProfile -File scripts/vercel-deployment-cleanup.ps1`.
Pulizia con lo stesso comando e `-Apply`. Test con
`node --test scripts/test-vercel-deployment-cleanup.cjs`.

Stato e prossima esecuzione con `Get-ScheduledTaskInfo -TaskName
'Subingresso - Pulizia versioni Vercel'`. Per sospendere la regola usare
`Disable-ScheduledTask` con lo stesso nome. Ripresa soltanto su istruzione
dell'utente.

## Attivazione verificata l'11 novembre 2026

Task attivo, intervallo XML verificato di dieci giorni e prossima scadenza
21 novembre 2026 alle 10:03, ora di Roma. Due esecuzioni reali dello stesso task
con risultato Windows 0 hanno rimosso complessivamente 24 vecchi deploy.
La seconda ha riallineato il conteggio dopo la pubblicazione concorrente
dell'ultima revisione dello script. Esito finale con dieci versioni di
produzione READY e due anteprime protette dai rispettivi domini di ramo.
Home, fiere e blog verificati con HTTP 200.

Superati 17 test mirati, inclusi paginazione, cambio dominio, interruzioni,
ritentativi, nuove pubblicazioni concorrenti e rinnovo sequenziale delle
credenziali; passati anche i 35 controlli esistenti sulla regola di build.
Prove private in `.local/verifiche/vercel-cleanup/`, con definizione XML del
task e resoconti JSON delle simulazioni e delle esecuzioni.
