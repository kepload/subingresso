# Email Auth: verifica provenienza (C-01)

`supabase/functions/send-auth-email/index.ts` è l'HTTP Send Email Hook di
Supabase Auth. Il gateway deve mantenere `verify_jwt=false`: un JWT utente,
anonimo o di servizio non dimostra la provenienza di un Auth Hook.

Prima di usare il payload o contattare Resend, il codice verifica con
`standardwebhooks@1.0.0` gli header `webhook-id`, `webhook-timestamp` e
`webhook-signature` sul body originale letto con `req.text()`. La libreria
controlla HMAC-SHA256, confronto a tempo costante e timestamp entro ±300 secondi.
Il timestamp deve inoltre essere un intero positivo canonico e sicuro in JS.
Sono supportate più firme nell'header: basta una firma `v1` valida, anche dopo
altre firme, per consentire la rotazione senza dipendere dall'ordine.

La verifica precede il blocco che gestisce gli invii: firme mancanti/errate,
body alterato o timestamp non valido restituiscono HTTP 401 e zero chiamate al
provider. `SEND_EMAIL_HOOK_SECRET` mancante o malformato restituisce HTTP 503,
mai un successo o un invio. I rifiuti non riportano body, header, token o secret
nei log o nella risposta. Solo POST elabora email; OPTIONS conserva la risposta
200 senza effetti e gli altri metodi ricevono 405.

## Secret

`SEND_EMAIL_HOOK_SECRET` è un secret dell'ambiente Edge, distinto da chiavi JWT,
Resend e chiavi pubblicabili. Deve corrispondere alla chiave realmente usata
dal Send Email Hook. Formati accettati: `v1,whsec_<base64>` (Dashboard),
`whsec_<base64>` oppure il solo base64. La chiave decodificata deve avere da 24
a 64 byte; gli spazi esterni vengono rimossi. Non accetta liste di secret o
chiavi asimmetriche. Durante una rotazione il produttore può inviare più firme
e il verificatore riconosce quella della propria chiave configurata.

Non copiare un valore restituito dalla Management API solo perché ha forma
base64: potrebbe essere un digest o un valore mascherato. Recuperare il secret
originale da una fonte privata verificata oppure configurare una nuova chiave
canonica identica sui due lati. Nessun secret va salvato in Git o stampato.

## Test ripetibili, senza servizi reali

Con Node 24, dalla root del checkout interessato:

```powershell
npm.cmd install --prefix .local/auth-email-hook-fixture --no-save --package-lock=false --ignore-scripts --no-audit --no-fund standardwebhooks@1.0.0
node scripts/test-auth-email-hook.cjs
```

La dipendenza è isolata in `.local/`; package e lock del progetto non cambiano.
Il test carica il vero handler TypeScript e la stessa versione della libreria
usata dall'Edge, sostituisce Deno/Resend con fixture e firma con `node:crypto`
indipendentemente dalla libreria. Non legge credenziali né usa fetch reale.
L'esito dettagliato è `.local/auth-email-hook-fixture/test-results.json`.

Copre richieste senza firma e con solo Bearer, header mancanti, chiave errata,
alterazioni di ID/timestamp/body/Unicode/spazi, JSON invalido, scadenza futura e
passata, limiti esatti di 300 secondi, configurazioni mancanti/malformate,
formati del secret, firme multiple nei due ordini, i sei rami email già gestiti,
no-op firmato, metodi HTTP e assenza di dati sensibili nei rifiuti. Il test
documenta anche il comportamento preesistente C-02 senza correggerlo.

Controllo aggiuntivo possibile con Deno installato, usando una cache privata:

```powershell
$env:DENO_DIR = Join-Path (Get-Location) '.local/auth-email-hook-fixture/deno-cache'
deno check --no-config --no-lock --node-modules-dir=none supabase/functions/send-auth-email/index.ts
```

## Distribuzione e verifica riservate al coordinatore

1. Rileggere via API configurazione Auth, versione Edge e presenza dei secret;
   conservare privatamente sorgente/configurazioni per il ripristino.
2. Preparare `SEND_EMAIL_HOOK_SECRET` nell'ambiente Edge e, se necessario,
   aggiornare soltanto il signing secret Auth con lo stesso valore reale.
   Coordinare il cambio chiave e le eventuali richieste già in transito;
   mantenere URI, hook abilitato e altre impostazioni. La versione precedente
   ignora il nuovo secret Edge: predisporre entrambi i lati prima del deploy.
3. Distribuire esclusivamente `send-auth-email` con verifica JWT del gateway
   disabilitata (`--no-verify-jwt` se si usa la CLI). Non è necessario creare
   `supabase/config.toml`; il flag e la configurazione live vanno verificati
   dal coordinatore. Nessun SQL richiesto.
4. Verificare firma valida e firma alterata senza inviare email usando questo
   identico body, firmato sul testo originale con il secret reale in memoria:

   ```json
   {"user":{"email":"fixture@example.invalid"},"email_data":{"email_action_type":"c01_signed_noop"}}
   ```

   Generare `webhook-id`, timestamp corrente in secondi e firma
   `v1,<base64(HMAC-SHA256(chiave_decodificata, id.timestamp.body))>`.
   La richiesta valida deve ricevere 200 `{}`. Cambiando solo la firma deve
   ricevere 401; entrambe devono lasciare intatto il provider. L'azione no-op
   non appartiene allo switch email e non contatta Resend neppure se firmata.
   Non usare recovery/signup reali per verificare il deploy.
5. Confermare via API nuova versione, `verify_jwt=false`, sorgente distribuito
   e presenza del secret prima di dichiarare applicata la correzione online.

Se il secret è errato, correggere l'allineamento dei due lati e ridistribuire
se necessario. Per un ripristino completo recuperare le configurazioni e il
bundle privati precedenti; la vecchia versione riapre C-01, quindi il ritorno
al codice vulnerabile è una decisione esplicita del coordinatore. Non attivare
il JWT generico come sostituto della firma.

## Limiti mantenuti

La modifica riguarda esclusivamente C-01. Template, destinatari, link e
comportamento degli errori Resend restano quelli precedenti: **C-02 resta
aperto**. Il limite temporale non crea un archivio persistente degli ID;
richieste firmate ripetute nella finestra restano accettabili. Le fixture
dimostrano il controllo di provenienza, non una consegna email reale.

Fonti ufficiali consultate l'11 novembre 2026:
[Supabase Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook),
[Standard Webhooks: specifica](https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md),
[Standard Webhooks: libreria JavaScript](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries/javascript).

## Esito di distribuzione — 11 novembre 2026

Il coordinatore ha integrato la correzione senza sovrapposizioni con C-07 e
ripetuto i 64 test locali. Il signing secret canonico da 32 byte è stato
predisposto nelle due API prima del deploy; le altre impostazioni Auth sono
rimaste invariate. Edge `send-auth-email` v12 ACTIVE, `verify_jwt=false`.
Online: no-op firmato 200 `{}`, firma errata/assente/scaduta 401; nessuna
azione di invio inclusa nei payload di controllo. Il bundle distribuito
contiene il verificatore previsto. Deno check e cinque smoke nativi senza
rete sono passati nel worktree della sessione C-01.

Due controlli preliminari del coordinatore si sono arrestati prima del deploy:
GET Edge espone il digest in `value`, mentre il valore Auth mascherato non ha
un contratto documentato `sha256(secret)`. Le verifiche sono state corrette
senza riusare valori mascherati come chiavi; POST/PATCH hanno accettato lo
stesso valore canonico, il digest Edge è stato verificato e il no-op firmato
ha confermato il verificatore Edge. Queste prove **non verificano il signer
Auth end-to-end né una consegna reale**. Nessun account o invio di prova.

Ricevute, backup binario e log privati:
`.local/lavori/bugfix-paralleli-20261111-1714/C01-deployment.json` e materiali
collegati. La Management API non documenta una modalità per rileggere il
secret Auth originale: [Get Auth config](https://supabase.com/docs/reference/api/v1-get-auth-service-config).
