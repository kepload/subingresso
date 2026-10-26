# Anteprime persistenti — 22 ottobre 2026

`api/image.js` usa `lib/image-preview-cache.cjs`. Prima legge la WebP già
salvata nel bucket pubblico `image-previews`; soltanto una vera assenza
(404, anche incapsulato nel 400 di Storage) permette di leggere l'originale.
Da quell'unico download prepara le sei dimensioni 48/96/192/480/768/1280.
Le richieste simultanee nella stessa funzione condividono il lavoro;
istanze diverse possono duplicare il primo download, ma i conflitti di
scrittura non sovrascrivono le anteprime esistenti. I file persistono fra
pubblicazioni e riavvii, oltre alla cache CDN delle risposte già esistente.

Gli URL frontend restano v1: formato, qualità, proporzioni, orientamento e
byte delle anteprime non cambiano. Le foto originali restano intatte nei
bucket `listings` e `avatars`, caricate dal browser soltanto al clic.
SEO e collegamenti agli originali restano invariati.

Le chiavi delle anteprime sono `v1/<sha256(percorso-originale)>/<larghezza>.webp`.
Gli upload degli originali usano già nomi nuovi per ogni file. Se in futuro
si sovrascrivono gli originali sullo stesso percorso, va introdotta una
nuova versione della chiave; lo stesso vale cambiando le trasformazioni.

Il bucket accetta soltanto WebP fino a 4 MiB. Nessuna nuova policy consente
scritture da anonimi o utenti: il server usa `IMAGE_PREVIEW_STORAGE_KEY`,
variabile Vercel di tipo **Secret** nei contesti production/preview. Il valore proviene
dalla chiave server Supabase esistente e non va copiato in Git, output o
file di prova. GET pubblici privi di credenziali; upload solo al bucket
derivato, `upsert=false`, mai agli originali. I secret nelle liste Management
possono essere mascherati: recuperare il singolo ID con `?reveal=true`,
soltanto in memoria. Non usare i vecchi JWT legacy non più validi.

Dal 26 ottobre 2026: protezione aggiornata tramite PATCH del solo
`type=sensitive`, con `visibility=secret` verificata. ID, valore e contesti
conservati; valore non letto né reinviato. L'API di lettura restituisce
`decrypted=false` senza valore. Cambiare questa protezione non richiede
di ruotare la chiave Supabase condivisa.

Errori del cache storage, secret mancante o salvataggi falliti non causano
un fallback indiscriminato agli originali; risposta non memorizzabile
503/502, riprova consentita. Le anteprime già salvate restano leggibili
anche senza credenziale di scrittura. Nessun servizio/piano a pagamento
attivato. Le WebP consumano poco spazio/banda Supabase: non eliminano ogni
egress né il consumo già maturato nel ciclo di fatturazione.

Verifiche: `node scripts/test-image-preview-cache.cjs` e
`node scripts/test-image-previews.cjs` con `PLAYWRIGHT_MODULE` quando
Playwright non è installato nel checkout. Coprono nuovo avvio, sei richieste
contemporanee, uguaglianza byte, errori, ritentativi, privacy delle chiavi,
HEAD e apertura degli originali su Chrome e Safari. Prove operative e
inventario prima/dopo in `Documents/verifica-anteprime-persistenti-20261022/`.
