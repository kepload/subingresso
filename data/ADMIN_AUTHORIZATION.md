# Autorizzazioni amministrative — C-07

Contratto della patch `PATCH_ADMIN_AUTHORIZATION_20261111.sql`, da applicare dopo le patch storiche. La pubblicazione del repository non applica automaticamente SQL a Supabase.

Il controllo dei permessi usa `public.profiles.is_admin IS TRUE`, senza passare dalle viste analitiche. L'assenza di un profilo, un valore NULL e un account demo/escluso senza permessi non autorizzano l'accesso. Gli admin restano autorizzati anche se esclusi dalle statistiche o marcati demo. Le viste analitiche continuano a filtrare i dati dei report.

| RPC | Utente richiesto | Chiamata service_role senza utente |
|---|---|---|
| `admin_bando_alerts_stats()` | Admin | Ammessa, come prima |
| `admin_bando_scouting_list(text, integer)` | Admin | Ammessa, come prima |
| `admin_bando_scouting_decide(uuid, text)` | Admin | Ammessa, come prima |
| `admin_blog_stats(integer)` | Admin con identità | Negata, come prima |
| `admin_bump_post_freshness(text)` | Admin con identità | Negata, come prima |

Per tutte e cinque le firme, EXECUTE è revocato a `PUBLIC` e `anon`; rimane a `authenticated` e `service_role`. Il controllo interno resta necessario e restituisce SQLSTATE `42501` quando nega l'accesso. Per i bandi il servizio è riconosciuto dal ruolo JWT verificato di Supabase (`auth.role()`), mai da parametri della RPC. Il proprietario di una funzione SECURITY DEFINER non identifica il chiamante.

Sono preservati firme, parametri predefiniti, payload, ordinamenti, filtri analitici, azioni e attributi delle funzioni. Non vengono modificate tabelle, righe, trigger, policy, Edge Function o SQL storici. Le chiamate di `bando-action` alle tabelle con il proprio client di servizio restano esterne a questa patch. Nessun nuovo invio o automatismo è introdotto.

## Verifica locale

Il test esegue realmente PL/pgSQL in PostgreSQL WASM PGlite, con fixture in memoria, RLS e ruoli separati. Non legge credenziali, non invoca endpoint remoti e non installa dipendenze condivise. I trigger di pubblicazione e invio non sono presenti nella fixture.

Installazione privata e avvio da PowerShell, nella root del checkout:

```powershell
npm.cmd install --prefix .local/c07/pg-fixture --no-save --package-lock=false --ignore-scripts --no-audit --no-fund @electric-sql/pglite@0.3.14
$env:PGLITE_MODULE = Join-Path (Get-Location) '.local\c07\pg-fixture\node_modules\@electric-sql\pglite'
node scripts/test-admin-authorization.cjs
```

Opzionalmente `--baseline=<snapshot-json-locale>` accetta lo snapshot privato dei metadati con `metadata.functions[]` e le cinque definizioni originali. Non scarica nulla: riproduce il difetto prima di applicare la patch e confronta i report completi prima/dopo. Lo snapshot non è necessario per la regressione ordinaria.

Copertura: grant espliciti anon e PUBLIC, controllo interno anche dopo un grant temporaneo, profilo assente, flag NULL, identità assente, non admin ordinario/demo/escluso, admin escluso e demo admin, azioni approve/reject, attributo reviewed_by, timestamp blog, slug assente, decisione già eseguita, chiamate di servizio con claim separati e JSON, idempotenza. I dinieghi verificano anche l'assenza di effetti sulle righe.

## Applicazione e verifica del coordinatore

1. Rileggere in READ ONLY definizioni, proprietario, configurazioni e ACL delle cinque firme; confrontarle con lo snapshot. Se aggregate/firme/configurazioni sono cambiate, riesaminare la patch prima di applicarla.
2. Conservare privatamente `pg_get_functiondef`, ACL e proprietario correnti; applicare l'intero file SQL in una sola transazione con un client che arresta l'esecuzione al primo errore, per esempio `psql -v ON_ERROR_STOP=1 -f PATCH_ADMIN_AUTHORIZATION_20261111.sql` tramite la connessione gestionale già autorizzata. Il file contiene BEGIN/COMMIT.
3. Rileggere `pg_proc`: le cinque definizioni devono coincidere con la patch; il proprietario e le configurazioni devono restare quelli precedenti. Verificare `has_function_privilege` per `anon=false`, `authenticated=true`, `service_role=true` e assenza di EXECUTE a PUBLIC.
4. Dopo il confronto delle definizioni appena lette con la patch, ripetere il test locale ordinario con fixture nuove. L'opzione `--baseline` serve esclusivamente allo snapshot precedente al fix, perché verifica che il vecchio difetto sia riproducibile. Non invocare le RPC vulnerabili o mutanti sui dati veri e non mandare email di prova. I grant e i corpi verificati online sono evidenza di distribuzione; l'esecuzione funzionale è verificata sulle fixture.

Per un guasto prima del COMMIT, eseguire ROLLBACK. Dopo il COMMIT, un ripristino cieco delle vecchie definizioni reintroduce C-07: preferire una correzione successiva. Per contenere un guasto applicativo, il coordinatore può revocare temporaneamente EXECUTE ad `authenticated`, mantenendo il solo servizio sulle cinque funzioni e tenendo revocati PUBLIC/anon. Ciò interrompe i cinque pannelli/azioni admin fino alla correzione. Le definizioni originali private servono per confronto e ripristino controllato; ripristinare anche i grant anonimi riaprirebbe la vulnerabilità.

## Fonti della regola

PostgreSQL assegna NULL alle variabili di SELECT INTO senza righe: [Basic Statements](https://www.postgresql.org/docs/current/plpgsql-statements.html). Per le funzioni SECURITY DEFINER, l'accesso EXECUTE va limitato esplicitamente: [CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html), [Supabase Database Functions](https://supabase.com/docs/guides/database/functions).

La sessione C-07 ha verificato metadati live in sola lettura l'11 novembre 2026, alle 16:17 UTC, e preparato la correzione locale. Applicazione e verifica live appartengono al coordinatore; questo documento non certifica una migrazione già applicata.
