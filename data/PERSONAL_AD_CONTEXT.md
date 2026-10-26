# Contesto e registro ADS — 26 ottobre 2026

Richiesta: raccogliere i dati utili a decidere quali ADS funzionano, in quali
articoli e condizioni. Estensione delle sole ADS proprie; Vetrine separate.
Statistiche riservate all'admin, nessuna campagna cliente o nuovo invio.

## Dati registrati

`PATCH_PERSONAL_AD_CONTEXT_20261026.sql` aggiunge a `personal_ad_events`
`article_slug`, `creative_version`, `context_version`, `context` JSONB.
Le righe precedenti restano con articolo vuoto, versione0 e contesto0:
nessuna ricostruzione da keyword, sessioni o ipotesi.

| Campo | Significato |
|---|---|
| `id`, `created_at`, `kind` | Evento deduplicato, momento server UTC, impressione/clic |
| `ad_id`, `format`, `placement`, `creative_version` | Creatività, formato realmente inserito, posizione e versione asset dichiarata;0 se ignota |
| `article_slug`, `context.article_title` | Articolo; titolo pubblico verificato e copiato dal DB al momento dell'evento |
| `article_published_at` | Revisione editoriale indicata dall'HTML, normalizzata in UTC; non hash del testo |
| `article_region` | Regione univoca riconosciuta nel titolo/slug, se disponibile; non posizione dell'utente |
| `device_class` | Telefono≤640px, tablet≤1024px, computer; sola fascia viewport |
| `source`, `referrer_type` | Blog/sito/esterno; categoria della provenienza della visita, senza dominio o URL salvati |
| `topics`, `keywords`, `priority_matches` | Temi e principali parole pubbliche riconosciute, fino20per lista; corrispondenze prioritarie della ADS |
| `match_basis`, `selection_weight`, `candidate_count` | Origine del match, peso pubblicitario, numero di candidate compatibili |
| `engine_version`, `post_rule_revision`, `ad_rule_revision` | Versioni del motore e delle correzioni applicate alla scelta |
| `visible_ms` | Tempo accumulato con almeno50%banner nel viewport e documento attivo, arrotondato100ms, massimo1ora |
| `page_ms` | Tempo dal caricamento, arrotondato1s, massimo24ore: comprende eventuali intervalli non attivi, non chiamarlo tempo di lettura |
| `scroll_percent` | Bordo inferiore del viewport rispetto alla pagina, arrotondato10punti |
| `motion` | SVG animato in riproduzione o statico al momento dell'evento; non prova di attenzione |

Nessun nuovo identificativo persistente, IP, email, user agent, fingerprint,
testo di ricerca, URL completo o referrer completo in questi eventi.
Sessione e claim account già esistenti restano interni; CSVeventi non espone
`session_id`, `user_id`, `claimed_at`. I registri non sono dichiarati anonimi.
La privacy descrive i metadati; finalità, scelte e tempi esistenti conservati.

## Scrittura e compatibilità

RPC `personal_ad_event_v2(..., p_context jsonb)` con allowlist, tipi, enum,
limiti numerici/8KB e verifica dello slug in `blog_posts`. Titolo copiato
dal server: non accetta testo libero del client per tale campo. RLS e privilegi
della tabella invariati: anon/authenticated senza accesso diretto.
Admin/demo esclusi dal server; automazioni, prefetch e anteprime come prima.

Deduplica aggiornata: sessione + ADS + versione + articolo + misura + posizione
+ tipo. Il limite250eventi/ora per sessione resta e il lock evita gare.
Un retry restituisce lo stesso ID e conserva i metadati originali. Il vecchio
`personal_ad_event` mantiene firma e chiama v2con contesto vuoto: stessa
deduplica storica nel gruppo senza articolo/versione0. Nessuna riga eliminata.

Il link SSR contiene già articolo/versione/match, anche senza JS. Il tracker
aggiunge dispositivo, provenienza e tempi a impressione/focus/pointer/clic.
L'API usa v2 e il solo slug del referrer del proprio blog come fallback per
vecchi link. La navigazione303 continua su errore di misura. Il formato cambia
solo quando cambia davvero l'immagine. Cambio creatività/versione/articolo
riavvia la misura1secondo; nascosto/pagehide interrompono il tempo visibile;
restore riattiva l'osservazione. Le anteprime admin non scrivono eventi.

Il CTR richiede impressione della stessa sessione/ADS/versione/articolo/
misura/posizione, precedente al clic e nello stesso periodo selezionato.
Un'impressione esterna al periodo non gonfia il numeratore. Conversioni,
attribuzione all'ultimo clic7giorni, bundle e rimborsi restano quelli del
contratto `PERSONAL_ADS.md`; l'articolo attribuito è quello del clic scelto.

## Lettura, filtri ed export

`admin_personal_ads` conserva le metriche e restituisce righe per giornoUTC,
articolo, versione e contesto; sommarle è necessario per confrontare una ADS.
`context_started_at` è il primo evento v2effettivo, nullo se non ce ne sono.
Il filtro articolo governa numeri, confronto, dettaglio, dispositivi/fonti/
giorni/versioni e CSVaggregati. «Senza articolo registrato» comprende storico
e provenienze senza articolo, non viene attribuito a un post inventato.

`admin_personal_ad_events` richiede admin corrente e restituisce soli campi
espliciti, senza identità. Pagine max500, ordine `(created_at,id)` decrescente,
cursore e istante `until` fisso: niente duplicati, salti dovuti a nuovi eventi
o spostamento della finestra fra pagine. `/api/personal-ads?action=events`
passa il token verificato dalla RPC; tutto `private, no-store`.

«Esporta tutti gli eventi CSV» comprende l'intero periodo, anche se è scelto
un singolo articolo. Stesso `until` per ogni pagina; logout/cambio identità/
uscita invalidano e interrompono l'export, senza scaricare file parziali.
Formula injection neutralizzata nei campi testo dei CSV. Metadati non raccolti
restano vuoti;0solo per misure effettivamente nulle o versione ignota dichiarata.

## Verifiche

`test-personal-ad-context-db.cjs`: migrazioni reali con tabelle temporanee,
identità sintetiche eROLLBACK; contesti/articoli/versioni, vecchio client,
duplicati immutabili, campi vietati, RLS/permessi, titoli, claim, CTR/coorte,
conversione fiera, bundle/rimborsi e paginazione. Nessuna scrittura cliente.
`test-personal-ad-context.cjs`: API, metadataSSR, filtri/CSV, pagine complete,
escaping, logout durante export e tracker su articoli diversi, nei quattro
formati/browser già previsti. Servizi simulati, metadatiQA fuori dal DB.
Audit metadati di tutti gli articoli pubblici inROLLBACK; dossier privato
`Documents/ads-dati-contesto-20261026`. Migrazione applicata prima del deploy.
