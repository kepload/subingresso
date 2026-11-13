# Creazione idempotente degli annunci — 13 novembre 2026

`vendi.html` conserva nella bozza v2 `publication`: UUID v4 dell'annuncio,
proprietario, indicazione di invio tentato, timestamp anti spam e numero di foto.
L'ID viene generato prima dell'INSERT e salvato prima di inviare la richiesta.
Se il salvataggio della bozza fallisce, non parte alcun INSERT. Le bozze
precedenti ricevono l'identità al primo tentativo con il nuovo modulo.

Tutti gli INSERT della medesima operazione, inclusi i fallback di schema e
refresh JWT, inviano lo stesso `id`. Il vincolo live `annunci_pkey(id uuid)`
impedisce una seconda creazione. Nessun upsert, UPDATE o modifica di annunci
esistenti. Riconfermati in sola lettura il 13 novembre: grant INSERT/SELECT
su `id,user_id,status`, RLS di inserimento `auth.uid() = user_id`, lettura
dei propri annunci anche pending, trigger di qualità/moderazione/notifiche.
Non occorrono migrazioni, nuovi grant, deploy Edge o modifiche ai trigger.

Dopo un errore di INSERT, e prima di ogni retry già tentato, una GET senza
cache seleziona esclusivamente `id,user_id,status`, filtrando sia l'ID sia il
proprietario. Le risposte vengono ricontrollate nel client. Un annuncio proprio
`pending` o `active` completa il flusso senza riscrivere i dati. Altri stati
rimandano alla dashboard senza dichiarare una nuova pubblicazione. Un conflitto
senza riscontro verificato non è un successo e non genera un nuovo ID.
Se la lettura fallisce o è malformata, il retry si ferma e conserva la bozza.
Se non risulta alcun annuncio, può ripartire l'INSERT con lo stesso ID:
anche una precedente richiesta ancora in corso resta protetta dal vincolo.
Il timeout comprende anche la lettura del corpo JSON.

La bozza conserva identità e scelta Gratis/Vetrina dopo ricaricamento. La
riconciliazione precede validazione e upload, evitando di ricaricare foto per
un annuncio già creato. I File restano in IndexedDB fino all'esito verificato.
Le risposte di un'operazione di un altro account non svuotano bozze, non
aggiornano profili e non aprono checkout dell'account corrente. Ospite→account
mantiene il percorso precedente; logout/cambio account ripristinano la propria
bozza. «Ricomincia» e «Inserisci un altro» avviano un'operazione distinta.

Il limite di un minuto resta per le nuove pubblicazioni. Un esito incerto
conserva il timestamp; soltanto la stessa operazione può riprovare durante
quel minuto. Un errore certo rimuove soltanto il proprio timestamp. Il recupero
di un annuncio già esistente non è una nuova creazione.

Moderazione, scadenza di 270 giorni imposta dal DB, email e offerte restano
nei flussi esistenti. I retry non eseguono UPDATE e non riattivano i trigger
AFTER INSERT di una riga già creata. I giorni Vetrina già acquistati non sono
modificati. La scelta a pagamento ripresa usa lo stesso ID e i controlli
server esistenti, compresa la finestra dell'offerta di pubblicazione.

Verifiche: `scripts/test-listing-publication.cjs` in Chromium/WebKit con API,
Storage e checkout simulati; regressione `scripts/test-vendi.cjs`. Prove e
ricevute in `.local/lavori/bugfix-sequenziali-20261113-2137/A-01/`, rapporto
`A-01-esito.md` nella cartella superiore. Nessun annuncio/account/email/pagamento
di prova online. Il recupero richiede che la bozza sopravviva nello stesso
browser; non ricostruisce le operazioni inviate dal modulo precedente prive
di ID stabile. Il checkout reale e le consegne email non sono stati invocati.
Nel runtime WebKit Windows il salvataggio Blob in IndexedDB fallisce anche
con l'HTML precedente: la regressione completa si arresta su quel controllo.
I casi A-01 verificano comunque il recupero dell'ID e della foto già caricata,
senza un nuovo upload; persistenza locale dei byte verificata in Chromium.
