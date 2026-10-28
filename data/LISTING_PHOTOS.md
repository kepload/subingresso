# Foto del modulo vendita — 28 ottobre 2026

Fino a cinque foto facoltative. Invito rosso soltanto senza foto; ritorna se
si rimuovono tutte. Nessun elenco dei formati o contatore «anche gratis».

`js/listing-photos.js` riconosce i byte, anche con MIME assente o errato:
JPEG/JFIF, PNG, WebP, AVIF, GIF, BMP, TIFF, HEIC/HEIF. Rifiuta file non
leggibili e immagini oltre 60 milioni di pixel. Limite per originale **50 MiB**
(52.428.800 byte), verificato sia prima della selezione sia prima dell'upload.
Storage Supabase verificato via API: limite globale 52.428.800 byte; bucket
`listings` senza limite/MIME aggiuntivi. Nessuna configurazione remota cambiata.
Upload diretto con timeout 120 secondi, retry e cache delle foto già caricate.

Gli originali, inclusi metadati, non vengono ricompressi. Solo le anteprime
locali di HEIF/TIFF/AVIF diventano PNG, massimo 1280 px. Decoder caricati dal
dominio solo quando servono; HEIF tramite libheif-js 1.23.5, TIFF tramite
UTIF 3.1.0 e pako 1.0.11, AVIF tramite jSquash 2.1.1. Copie e licenze in
`js/vendor/`. Fonti: [libheif-js](https://github.com/catdad-experiments/libheif-js),
[UTIF](https://github.com/photopea/UTIF.js),
[jSquash](https://github.com/jamsinclair/jSquash).

Bozze IndexedDB conservano gli originali. Al recupero le anteprime speciali
si rigenerano; cambiare account o ricominciare scarta selezioni ancora in
apertura. Avanti e pubblicazione attendono che la selezione sia completata.

`lib/listing-image-source.cjs` apre HEIF e BMP sul server, usa Sharp per gli
altri formati. `lib/image-preview-cache.cjs` accetta originali fino a 50 MiB;
chiavi, qualità e sei dimensioni delle WebP esistenti restano uguali.
Nessuna conversione/cancellazione delle foto già pubblicate.

La modifica degli annunci esistenti conserva il proprio selettore e limite
precedente di 20 MiB. La richiesta riguarda il modulo di creazione.

Verifiche: `scripts/test-listing-photo-formats.cjs` con Playwright e
`HEIC_TEST_FILE` per un campione HEIC; browser Chromium/WebKit, integrità
SHA256, anteprime reali, MIME assente, file falsi, soglia esatta e +1 byte,
limite dello stream con e senza Content-Length. Wizard completo in
`scripts/test-vendi.cjs`; prove private `.local/verifiche/form-vendita-mobile-20261028`.
