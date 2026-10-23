# Aspetto personale — 23 ottobre 2026

Chiaro iniziale per tutti, amministratori e organizzatori compresi.
Il sistema operativo e il ruolo non scelgono il tema. Ogni utente può scegliere
Chiaro/Scuro in Profilo → Impostazioni → Aspetto. Lo stesso controllo è nel
profilo organizzatore, con salvataggio automatico e messaggio locale.

La sola chiave `auth.users.raw_user_meta_data.site_theme` contiene `light` o
`dark`; assenza e valori diversi significano chiaro. Non è un'autorizzazione.
Lettura con `auth.getUser()` dopo sessione disponibile, senza query ai ruoli.
Aggiornamento PUT `/auth/v1/user` con il token della sessione che ha avviato
la scelta, convalidato tramite getUser(token): un cambio account non può
indirizzare la scrittura all'utente successivo. Si invia soltanto `data.site_theme`.
L'API unisce le chiavi senza cancellare gli altri metadati; nessun campo
email/password viene inviato. Nessuna migrazione, scrittura su profili o invio email.

Contratto verificato il23/10 sul [codice Auth ufficiale](https://github.com/supabase/auth/blob/master/internal/api/user.go)
e sulla [fusione dei metadati](https://github.com/supabase/auth/blob/master/internal/models/user.go).

La preferenza viene riletta alla navigazione/ritorno in pagina e fra schede.
Il browser memorizza soltanto un segnale di invalidazione, mai il tema o ruoli
aggiuntivi; nessun nuovo token salvato. Logout/cambio account invalidano letture
e salvataggi pendenti. Durante il salvataggio il controllo è bloccato; errore
o CSS non disponibile mantengono la scelta precedente e consentono di riprovare.
La richiesta HTTP ha un limite di15secondi. Errori di lettura ripristinano chiaro.

I nomi `admin-theme.js`, `admin-theme.css` e `.admin-dark` sono conservati per
compatibilità: non indicano più accesso riservato agli amministratori. JS4,
CSS3. `css/theme-preferences.css?v=1` gestisce controllo e variante chiara
dell'area organizzatore, senza alterare dati, grafici o impaginazione.
Il generatore esclude quel foglio, già completo di entrambe le varianti.

Verifiche: scripts/test-admin-theme.cjs (87×3, Chrome1440/320 e Safari390),
scripts/test-profile-switch.cjs (91×4) e statistiche organizzatori nei quattro
browser/formati. Identità, sessioni e risposte di salvataggio sono simulate;
nessun account reale modificato durante le prove. Inspector impostazioni
1440/768/390 senza rilievi. Rigenerazione CSS identica ai byte precedenti.
Prove e stato pubblicazione: Documents/verifica-tema-profilo-20261023/risultati.md.

Pubblicato7e360bd, Vercel dpl_DWpq4kMAcCxGVMPm3zAMkvZ3LcUn READY.
22asset/pagine identici e13percorsi con script4; suite tema/profili/statistiche
ripetute sugli asset online. Quattro SSR scuri e home anonima chiara nei tre
browser/formati verificati; identità dei casi scuri simulate.
