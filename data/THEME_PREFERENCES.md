# Aspetto personale — 23 ottobre 2026

Ombre, 27 ottobre 2026: tutte le utility Tailwind con colore d'ombra usano
`--ad-shadow-color: rgb(0 0 0 / .28)` in scuro, compresi hover e contenuti
dinamici. Profondità, focus e tema chiaro conservati; niente aloni pastello.
Il generatore include le ombre anche nella build completa; usare
`node scripts/build-admin-theme.cjs --shadows-only` per aggiornare soltanto
questa parte senza rigenerare i colori di altre funzionalità. CSS7/JS8 nei
template, SSR e fallback. Verifica: `scripts/test-dark-shadows.cjs`, otto
colori, sei profondità, quattro formati/browser, contatti desktop/mobile,
chiaro identico al CSS originale, hover/dinamico/focus. Prove private in
`.local/verifiche/ombre-dark-20261027`. Nessun account o dato reale modificato.

Chiaro iniziale per tutti, amministratori e organizzatori compresi.
Il sistema operativo e il ruolo non scelgono il tema. Ogni utente può scegliere
Chiaro/Scuro con il pulsante «Modalità scura» direttamente nella pagina
personale/dashboard e sopra il profilo organizzatore. Fuori da impostazioni,
dialoghi e form; aria-pressed, stato Attiva/Disattivata, salvataggio automatico
e messaggio locale. Altezza44px, focus visibile e tastiera nativa.

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
Per evitare il flash, js/admin-theme.js7 è sincrono subito dopo charset nel
head; css/admin-theme.css6 è un foglio bloccante prima del body. Stesso schema
per tutti gli HTML e le pagine SSR. Nessuna attesa di Auth per il tema già noto.
Il browser conserva _si_theme_preference_v1: soltanto {id,theme}, scritto dopo
GET/PUT confermato. La copia si applica solo se l’ID coincide con quello della
sessione Supabase locale con access/refresh token presenti. È solo aspetto:
non abilita accessi, ruoli o controlli; non contiene token aggiuntivi. Non è
una scelta globale del browser e non prevale sulla verifica server.

Prima lettura con sessione ma senza copia valida (anche copia corrotta o di
altro account): html.theme-pending mantiene un fondo scuro e attende il GET
prima di mostrare il body, evitando anche il flash della migrazione dalle
vecchie sessioni con metadati obsoleti. Anonimi e chiaro già confermato sono
visibili subito. Storage bloccato non rompe la pagina. GET ha limite15secondi.
La lettura con errore temporaneo conserva l’aspetto precedente e comunica
l’errore; 401/403, identità discordante e sessione assente lo invalidano.
Il ritorno dalla cronologia riconcilia senza azzeramento temporaneo al chiaro.

Un segnale di invalidazione sincronizza le altre schede. Logout/cambio account invalidano letture
e salvataggi pendenti. Durante il salvataggio il controllo è bloccato; errore
o CSS non disponibile mantengono la scelta precedente e consentono di riprovare.
La richiesta HTTP ha un limite di15secondi.

I nomi `admin-theme.js`, `admin-theme.css` e `.admin-dark` sono conservati per
compatibilità: non indicano più accesso riservato agli amministratori. JS5,
CSS4. `css/theme-preferences.css?v=2` gestisce controllo e variante chiara
dell'area organizzatore, senza alterare dati, grafici o impaginazione.
Il generatore esclude quel foglio, già completo di entrambe le varianti.

Verifiche originali: scripts/test-admin-theme.cjs (87×3, Chrome1440/320 e Safari390),
scripts/test-profile-switch.cjs (91×4) e statistiche organizzatori nei quattro
browser/formati. Identità, sessioni e risposte di salvataggio sono simulate;
nessun account reale modificato durante le prove. Inspector impostazioni
1440/768/390 senza rilievi. Rigenerazione CSS identica ai byte precedenti.
Prove originali: Documents/verifica-tema-profilo-20261023/risultati.md.
Correzione flash/pulsante: scripts/test-theme-first-paint.cjs confronta la
versione696f9f5 con la nuova, CSS ritardato180ms e Auth900ms, campionamento
di ogni fotogramma in Chrome1440/320 e Safari390. Cache presente/assente,
corrotta/altro account, home/organizzatore, chiaro/anonimo/storage bloccato,
cronologia e logout fra schede. Scripts/test-admin-theme.cjs verifica anche
il pulsante diretto e l’isolamento di GET/PUT. Nessun account reale modificato.
Prove/stato corrente: Documents/verifica-tema-senza-flash-20261023/risultati.md.

Correzione pubblicataa772847, Vercel dpl_9HeTF5BKnLUkepVg9oyrfmU5xhCu READY.
22pagine/asset identici online,13percorsi aggiornati;267controlli tema e33scenari
primo disegno passati anche sugli asset pubblicati. QuattroSSR nei treformati
scuri dal primo fotogramma e senza pannelli bianchi. Profili Chromium273
controlli passati; suite WebKit390 con errore nelle richieste locali /qa,
riprodotto anche su696f9f5 precedente alla modifica: limite registrato nelle prove.

Pubblicazione originale7e360bd, Vercel dpl_DWpq4kMAcCxGVMPm3zAMkvZ3LcUn READY.
22asset/pagine identici e13percorsi con script4; suite tema/profili/statistiche
ripetute sugli asset online. Quattro SSR scuri e home anonima chiara nei tre
browser/formati verificati; identità dei casi scuri simulate.
