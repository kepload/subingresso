# Bollino privato Fiera

Dal 20 novembre 2026 le nuove registrazioni dal calendario `/fiere`, dalle
schede `/fiere/<slug>` e dagli articoli dedicati alle fiere ricevono il bollino
**Fiera** nell'elenco iscritti della dashboard, sia negli ultimi cinque sia
in «Vedi tutti». Il server lo restituisce soltanto all'amministratore e al
servizio amministrativo già autorizzato. Non compare nei profili pubblici.

Conta la pagina effettiva al momento della registrazione, senza query o
parametri personali. Sono compresi gli URL canonici e il vecchio blog `?post=`.
La pagina iniziale della sessione, un UTM `fiere`, una visita precedente o un
successivo accesso non bastano. Le vecchie iscrizioni restano senza bollino:
la landing storica non certifica la pagina effettiva del signup.

Gli articoli devono esistere nel blog ed essere pubblicati: categoria
esattamente «Fiere», oppure uno degli undici articoli specifici elencati in
`account_private.is_fair_registration_path`. La guida mista «Mercato settimanale
o fiera» è esclusa. Per una nuova guida specifica fuori dalla categoria Fiere,
aggiornare esplicitamente quell'elenco; una citazione o una parola nello slug
non bastano. Alla pubblicazione iniziale il criterio include 24 articoli.

`auth.js` trasmette solo `registration_path`; `register-bypass` ne valida
formato e lunghezza e lo passa nei metadati Auth. Il fallback Auth usa lo stesso
snapshot. Il trigger su INSERT di `auth.users` salva l'evidenza nella tabella
privata `account_private.fair_signups`, con RLS e nessun grant a pubblico o
utenti normali. Nessuna colonna aggiunta a `profiles`. Il bollino è calcolato
dal database, non accettato come etichetta inviata dal browser. Il percorso
resta un'informazione tecnica dichiarata dal client, non una prova di identità
o una certificazione dell'attività professionale dell'utente.

Il record resta invariato dopo accessi o modifiche ai metadati e dopo modifiche
editoriali all'articolo. Segue la cancellazione autorizzata dell'account tramite
FK; nessun account viene cancellato dall'installazione. Il trigger di creazione
del profilo, consensi, statistiche di acquisizione e invii esistenti restano
invariati. Il percorso può essere visto dall'utente nei propri metadati Auth;
il bollino e la sua evidenza privata sono accessibili solo al servizio admin.

Applicazione: `PATCH_FAIR_SIGNUP_BADGE_20261120.sql`, poi deploy di
`register-bypass` con configurazione JWT conservata, quindi sito con
`auth.js?v=31`. Il push del solo sito non applica SQL né distribuisce la Edge.
Backup e ricevute private: `.local/lavori/iscritti-fiera-20261120/` nella root
principale. Il file SQL è riapplicabile e non ricostruisce lo storico.

Verifica locale: `scripts/test-fair-signup-badge.cjs`, con `PGLITE_MODULE` e
`PLAYWRIGHT_MODULE` indirizzati ai runtime locali. PostgreSQL in memoria:
17 provenienze, persistenza, metadati modificati, account preesistenti,
grant/RLS, diniego anonimi/non admin, servizio, paginazione e idempotenza.
Provider simulati: bypass/fallback, URL puliti, consensi e input non validi.
Browser: Chromium 1440/320 e WebKit 390 nei due temi. Nessun account o invio
reale di prova. Regressioni acquisizione e modulo/consensi passate.
