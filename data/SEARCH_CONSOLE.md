# Google Search Console diretto — Subingresso

Connettore locale in sola lettura, senza Windsor, abbonamenti o intermediari dati.
Google resta il fornitore dei dati. L'AI li tratta quando si esegue l'analisi:
non significa che nessuna piattaforma AI possa vedere i risultati richiesti.
Non raccoglie nuove visite e non installa tracker sul sito.

## Stato e funzionamento

`node scripts/search-console.cjs status` mostra se la credenziale locale esiste
e la data dell'ultimo rapporto. Non certifica l'autorizzazione effettiva.
`node scripts/search-console.cjs report` interroga direttamente Google e salva
un rapporto JSON e Markdown in `.local/search-console/reports/`, esclusa da Git
e Vercel. `latest.json` indica l'ultimo rapporto completo. Su errore non cambia.

Nessun task Windows, cron, server pubblico o modifica al database. L'AI aggiorna
il rapporto quando una richiesta riguarda SEO, traffico Google o risultati del
blog, se configurato. I rapporti sono leggibili solo dove esiste questo progetto;
un'altra macchina o un'altra AI non ottiene accesso automaticamente.

## Collegamento iniziale (proprietario Google)

1. In [Google Cloud Console](https://console.cloud.google.com/), scegliere o creare
   un progetto personale dedicato e abilitare **Google Search Console API**.
   Non attivare altri servizi o acquisti. Se viene richiesto un abbonamento o
   fatturazione, fermarsi e verificare prima di accettare.
2. In **IAM e amministrazione → Account di servizio**, creare un account
   `subingresso-search-console`. Nessun ruolo IAM di progetto, nessuna delega
   a livello di dominio. Creare una chiave JSON e salvarla direttamente in
   `.local/search-console/google-service-account.json` del progetto. Non incollare
   la chiave in chat, non inviarla a terzi e non metterla nel repository pubblico.
3. In [Search Console](https://search.google.com/search-console), aprire la
   proprietà effettiva di Subingresso, **Impostazioni → Utenti e autorizzazioni**:
   aggiungere l'email dell'account di servizio con accesso **Limitato**, sufficiente
   per i dati Performance. Non attribuire il ruolo Proprietario. Occorre essere
   proprietario della proprietà per aggiungere utenti.
4. Dalla root del progetto:

   ```powershell
   node scripts/search-console.cjs setup --credentials .local/search-console/google-service-account.json --property sc-domain:subingresso.it
   node scripts/search-console.cjs report
   ```

   Se Search Console mostra una proprietà prefisso URL invece di Dominio,
   specificare esattamente `--property https://subingresso.it/` (o la variante
   www/http effettivamente verificata). Non mescolare proprietà diverse nei confronti.

Il setup importa solo identità e chiave strettamente necessarie e le cifra con
Windows DPAPI CurrentUser in `credentials.dpapi`. Il programma le decifra soltanto
in memoria con lo stesso utente Windows. Non memorizza token di accesso su disco.
Non consente di inviare credenziali agli URL contenuti nel JSON: gli endpoint
Google sono fissi. Il file cifrato non va messo in Git o nel deploy.

Il JSON originale NON viene cancellato automaticamente. Dopo un rapporto reale
riuscito concordare con l'utente la rimozione della copia in chiaro e di eventuali
copie nei Download: la protezione DPAPI non protegge queste copie. Le normali
autorizzazioni Windows devono riservare la cartella all'utente. DPAPI non rende
immuni da malware che girano come lo stesso utente o da un PC compromesso.

La connessione richiede una chiave realmente creata e autorizzata da Google:
non basta sviluppare il programma. Finché non c'è, segnalare «non collegato».

## Rapporto per il lavoro dell'utente

- Italia, ricerca web, confronto tra due periodi consecutivi di 28 giorni.
- Totali: clic, impressioni, CTR e posizione media. Totali separati richiesti a
  Google per posteggi, blog, fiere, valutatore; mai ricavati sommando le query.
- Pagine, ricerche, combinazioni ricerca/pagina, dispositivi e giorni.
- `--days 7` o `--days 90`; `--end YYYY-MM-DD` per un confronto ripetibile.
- Date inclusive nel fuso Pacifico usato da Google, non Europe/Rome o UTC.
  Fine predefinita tre giorni prima di oggi, `dataState=final`. Giorni senza dati
  non trasformati in zeri; verificare observedDays prima di trarre conclusioni.
- Paginazione da 25.000 righe, tetto esplicito 50.000 per estrazione. Anche senza
  raggiungerlo Google non garantisce tutte le righe. Query anonimizzate e diversa
  aggregazione possono produrre somme inferiori ai totali.
- `previousOnly` conserva righe presenti solo prima; non dichiararle azzerate
  automaticamente. Posizioni confrontate solo sulle medesime chiavi, ma il mix
  di dispositivo può cambiare: non è una posizione SERP fissa o garantita.
- Search Console misura il nostro sito: non dimostra il sorpasso di un concorrente.
  I dati possono essere conservati localmente nel tempo, senza inventare storico.

Le API non ricevono dati dal database utenti né credenziali Supabase/Stripe.
I file di rapporto contengono query aggregate: trattarli come dati privati,
non pubblicarli né allegarli a commit. Nessuna analisi AI in background implicita.

## Errori, revoca e rotazione

403: verificare API abilitata, email di servizio autorizzata e proprietà corretta.
401/400 durante token: controllare chiave revocata e orologio Windows.
429: riprovare più tardi. Non cambiare account per aggirare le quote.

Per interrompere l'accesso rimuovere l'utente in Search Console e revocare la
chiave in Google Cloud. Il setup non sovrascrive credenziali esistenti: prima
di ruotarle concordare backup privato e gestione del vecchio archivio; non
cancellarlo o sovrascriverlo autonomamente. Nessuna promessa di accesso eterno.

## Verifica

`node --test scripts/test-search-console.cjs`: periodi, fuso, filtri, JWT firmato
con chiave sintetica in memoria, paginazione, errori, assenti/zeri, report, DPAPI.
Non usa credenziali reali, non invia richieste a Google e non crea dati utenti.
La prova live richiede l'autorizzazione iniziale e non è sostituita dai mock.

Fonti: [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query),
[autenticazione account di servizio](https://developers.google.com/identity/protocols/oauth2/service-account),
[permessi Search Console](https://support.google.com/webmasters/answer/7687615),
[protezione chiavi Google](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys).
