# ADS personali — 24 ottobre 2026

Dal 26 ottobre la raccolta comprende anche una sezione distinta per gli
spazi Vetrina del blog, con anteprima, clic/impressioni e CSV per articolo.
Contratto `BLOG_VETRINE_ADS.md`; non sommare queste serie ai banner propri.

## Interfaccia del 27 ottobre 2026

Prima il grafico giornaliero delle visualizzazioni delle sole ADS proprie,
con totale, clic, tasso misurato e clic con risultato (almeno una delle
azioni previste, conteggiato una sola volta per clic). Un solo periodo generale;
le finestre si leggono all'apertura e si filtrano localmente. La serie usa
`event_day` UTC, zero nei giorni senza eventi dall'inizio della misurazione;
primo/ultimo giorno parziali. Righe senza data contribuiscono al totale ma
non sono collocate arbitrariamente nel grafico, con quantità esplicita.

Seguono «Statistiche dettagliate», chiuse all'apertura, e subito il mosaico
preesistente. Confronti, CSV, contesti numerici, Vetrine e correzioni degli
abbinamenti sono dentro il blocco chiuso. Il filtro articolo riguarda solo
il report: grafico generale e scheda della ADS mantengono i propri totali.

Il mosaico apre «Statistiche»: visualizzazioni/clic/CTR/azioni della ADS
sommati su tutti i formati e articoli, parole prioritarie ed esclusioni
effettivamente salvate, argomenti e quattro articoli con più visualizzazioni
misurate. Le regole descrivono gli abbinamenti attuali; gli articoli sono
riscontri storici del periodo. Cambiare anteprima mostra i numeri di quella
misura separatamente, conservando i totali della ADS. Regole non disponibili
segnalate senza presentare i valori iniziali come aggiornati; nessuna
modifica alle regole, alla rotazione o ai dati durante questa revisione.

Rimossi «Pausa animazioni», «Scarica raccolta», scorciatoia Statistiche e
«Usa ADS». Codici, link e download della singola ADS sono nei soli «Strumenti
tecnici», chiusi a ogni apertura della scheda. Autoplay privato conservato;
controlli pubblici invariati. Stati e richieste tardive delle nuove sezioni
sono invalidati all'uscita o al cambio account; nessuna cache persistente.

Dal26ottobre «Come stanno andando» mostra anche il confronto delle20ADS:
titolo, miniatura, codice, impressioni/clic/CTR misurato/conversioni sommati
su misure e posizioni nel periodo. Tutte incluse anche con zero righe;
filtri con clic/mostrate senza clic/mai mostrate e ordine clic/impressioni/CTR.
Un clic senza impressione misurata resta «Con clic», CTRsenza denominatore
assente. CSVconfronto completo con zero e CSVdettagliato separato; clic sulla
ADS apre la misura con più clic/impressioni disponibili. Su errore periodo
si conserva la finestra dei dati riusciti; logout/risposte tardive puliscono
anche il confronto. Nessun dato storico o significato delle conversioni cambia.

Selezione automatica nel blog per keyword, slot e formati:
`data/CONTEXTUAL_ADS.md`. Catalogo pubblico delle sole creatività proprie;
raccolta e statistiche restano protette dal ruolo admin.

Richiesta: raccolta privata admin con circa20 ADS delle sezioni redditizie,
più misure, riuso di alcuni banner blog e confronto dei risultati.

Seguito grafico: la pagina principale è una galleria a mosaico delle20ADS,
non una lista di miniature con editor fisso. Dal27ottobre ogni immagine usa le dimensioni
originali in CSSpixel1:1 quando entrano nello spazio; i formati più larghi
si riducono in proporzione, senza ritagli. Didascalia con
codice/misura. I rettangoli vengono incastrati con12px di distanza e44px di
didascalia. Vista iniziale20messaggi in misure miste da blog, filtro per
obiettivo/testo/misura; «Tutte le misure» mostra160varianti. Nessuna ADS
viene esclusa o duplicata nella vista iniziale. Nessuno scorrimento orizzontale
della galleria, anche per tutte160varianti e al resize. Su smartphone filtri
in una riga, misura/ricerca affiancate e barra non fissa durante lo scorrimento.
Al clic si apre il pannello della creatività/misura selezionata, con i dati
reali e gli strumenti tecnici chiusi. Le statistiche dettagliate sono in un
blocco apribile prima della galleria. Accesso admin conservato;
logout/cambio account chiudono anche il dialog e rimuovono la galleria.

`/le-mie-ads` è un guscio senza catalogo/statistiche incorporati. L’API
`/api/personal-ads` restituisce la raccolta e le metriche solo dopo controllo
server `admin_personal_ads` sul ruolo corrente. Cambio account e logout
svuotano subito il contenuto e invalidano risposte/download pendenti.
Nessun link pubblico alla raccolta; accesso dall’admin della dashboard,
noindex/noarchive e risposte private/no-store. Le singole immagini sono
pubbliche perché devono poter apparire negli articoli.

Hosting: `/api/personal-ads` è riscritto su `/api/blog?personal_ads=1`;
il dispatch iniziale usa `lib/personal-ads-handler.cjs` e termina prima
dei normali header/cache del blog. Si riusa la funzione esistente per
restare nel limite12 del pianoHobby, conservando i percorsi pubblici.

## Materiali e riuso

20messaggi:7vendita,7acquisto,6fiere. Catalogo `lib/personal-ads.cjs`.
Revisione25/10: titoli brevi e incisivi, una sola frase di supporto e una
CTA; nessun paragrafo esplicativo. Esempi: «5.000 € in 2 giorni!!!» per le
fiere e «5.000 € al giorno!!!» per i posteggi; obiettivi pubblicitari in forma
esclamativa richiesta dall’utente, non dati di incasso misurati. Note nel catalogo, nessun
risultato attribuito a San Faustino/Lazise senza dati verificabili.
Quattro creatività rielaborano gli spunti del blog, i cui banner editoriali
restano autonomi. La richiesta riguarda la raccolta `/le-mie-ads`.

Otto dimensioni:300×250,336×280,728×90,970×250,320×100,300×600,
1080×1080,1080×1920.160varianti,480file PNG/SVG statico/animato in
`images/personal-ads`. Formati web PNG2×, social1080 nativi; anteprime e
inserimenti in SVG per testo nitido a qualsiasi densità. PNG a colori pieni,
senza la precedente palette256; scene dal WebP1600 originale, JPEG94/4:4:4
incorporato invece della precedente copia1080/JPEG84.
Grafica originale con font Jakarta già presente, SIL OFL: titoli in
tracciati SVG e raster PNG con lo stesso contenuto e la stessa geometria.
Le varianti300×600 e social riusano due scene IA originali già nel blog:
`aprire-banco-giovani-mercato.webp` e `fiere-lombardia-domande-aperte.webp`.
Provenienza nei rispettivi dossier `data/blog/`; immagini illustrative,
non prove di posteggi disponibili o incassi. JPEG incorporato negli SVG
per identica compatibilità browser/librsvg, nessuna dipendenza esterna.
Composizioni dedicate ai formati: titoli maiuscoli molto più grandi,
cifra dominante, agganci conservati anche nei banner mobili, azioni leggibili
con freccia. Importo, frase e contesto compatti, nessun «AL» isolato: «AL
GIORNO!!!» e «IN 2 GIORNI!!!» restano interi. Una riga piccola immediatamente
sotto dice «Scegli la fiera giusta per te», «Trova il posteggio giusto per te»
o «Metti in vendita il tuo posteggio», anche nei banner90/100px. Niente
paragrafi ingranditi e distanziati per riempire le altezze; immagini nella
parte rimanente dei formati più alti. Blu/bianco per
vendita, inchiostro/oro per acquisto, blu/oro alternati per fiere.
Il build verifica i limiti effettivi dei glifi, compresi accenti e discendenti,
e blocca testi fuori immagine o sovrapposti. Audit opzionale in percorso
privato tramite `PERSONAL_ADS_BUILD_AUDIT`. Asset `?v=5` nel pannello,
nei link immagini e nei codici copiati; archivioZIP con nomi puliti.
IDcreatività, misure, posizioni e attribuzione restano invariati: i dati
prima/dopo il25/10 condividono lo stesso ID, non costituiscono un testA/B.
Build: `node scripts/build-personal-ads.cjs`, richiede Python fontTools
e sharp già disponibili nell’ambiente di sviluppo; nessun requisito runtime.

Negli strumenti tecnici per misura:codice HTML,link tracciato,PNG HD/SVG
statico/SVG animato. ZIP per singola ADS, con tutte le misure, HTML pronti, istruzioni,codici e
link. Il nome posizione è un codice
`[a-z0-9_-]{1,80}`,mai dati personali. Immagini sole/off-site non misurano
impressioni:fuori dal blog usare almeno il link tracciato. Un banner largo
ridotto sul telefono diventa piccolo:lo strumento consiglia il formato mobile.

## Movimento e nitidezza — 25 ottobre 2026

Il titolo compare lettera per lettera nei primi1,6secondi di un ciclo6,4s.
Segue un doppio richiamo del pulsante, scala1,022; poi tempo di lettura.
Contesto, marchio e CTA restano disponibili durante la scrittura. Nessun
lampeggio, sfocatura, cambio di impaginazione o blocco del clic.

`js/personal-ads-motion.js` avvia gli SVG solo quando entrano in vista con
IntersectionObserver. Fuori campo, scheda nascosta, dialog aperto davanti
alla galleria e logout rimuovono il movimento. Nel sito il ciclo continua
finché visibile; nella raccolta non ci sono più comandi pausa. Il controllo
accanto a ciascun inserimento pubblico mostra la versione completa. La preferenza
riduci movimento conserva lo statico, senza scaricare automaticamente la
variante animata. «Riproduci animazioni» permette una prova esplicita anche
con tale preferenza; un successivo cambio della preferenza azzera la scelta.
Se il caricamento fallisce, il pulsante permette di riprovare mantenendo
nel frattempo il poster completo.

Scrittura/CTA usano opacity e transform CSS; niente timer per fotogramma o
librerie aggiunte. SVG isolato nello shadowDOM, fonte ammessa solo nella
directory pubblica delleADS su dominio locale o subingresso.it, nessuno
script/eventhandler/link o riferimento esterno nel markup importato. Risposte
tardive, cambio formato e rimozione invalidano il player; cache limitata12.
Il player non legge account, storage, sessioni o statistiche.

Codici blog con posterSVG, dati del player e inizializzatore. Il template
blog carica già il player: funziona anche dopo la rimozione degli script
dal contenuto tramite DOMPurify. Gli inserimenti precedenti con immagini
personali vengono riconosciuti. Pubblico CORS* solo su `/images/personal-ads`;
API privata e altri endpoint invariati. Senza JS/rete/feature, rimane il
poster cliccabile. Fuori dal blog il player richiede il codiceHTML, non il
solo filePNG. Nessuna compatibilità universale con reti pubblicitarie dichiarata.

Gli SVG `.animated.svg` autonomi fanno3cicli/19,2secondi e restano completi;
gli HTML usano il player con avvio in vista e pausa. ZIP24immagini+8HTML per
ADS, oltre codici/link; raccolta480immagini+160HTML. Non sono fileGIF.
Ricerca, decisioni e limiti: `data/PERSONAL_ADS_MOTION.md`.

## Misura

Estensione26ottobre: articolo e titolo, versione creatività/regole, dispositivo,
provenienza, giorno/ora e metadati di visibilità/abbinamento; filtri articolo e
CSVcompleto eventi admin. Contratto e limiti: `PERSONAL_AD_CONTEXT.md`.
Storico privo di articolo esplicitamente separato, non ricostruito.

`personal_ad_events`:impression/click,IDcreatività,formato,posizione,sessione
già esistente ed eventuale account verificato al claim. Nessun IP/email/UA
salvato. RLS senza accessi diretti anon/auth; soleRPC validate e autorizzate.
Dedup server per(sessione,articolo,ADS,versione,formato,posizione,tipo),
prima dell'estensione senza articolo/versione; limite250eventi/ora
per sessione. Clic esterni senza sessione contati per richiesta,mai chiamati
visitatori unici. Crawler/prefetch/HEAD/anteprime riconosciuti esclusi.

Tracker su blog e destinazioni principali; nessun nuovo ID persistente.
Impressione:almeno50%banner visibile per1secondo con documento attivo.
Link decorato al clic/focus con sessione esistente;API303 verso una delle
tre destinazioni fissate a catalogo,regione solo da whitelist. Su errore
statistiche la navigazione continua. RiferimentoUUIDdel clic nellaquery,
rimosso subito dal browser e conservato in sessionStorage,massimo7giorni.
Claim solo con accountverificato,immutabile fra account;logout/cambio
identità lo rimuovono. Admin/demo e navigator.webdriver esclusi daltracker.

CTR= clic con precedente impressione misurata nello stesso periodo,
articolo e versione / impressioni;clic non
misurati restano nei clic totali,senza gonfiare ilCTR. Conversione=un clic
con almeno un’azione dell’obiettivo:vendi→annuncioinviato,
compra→recapito consultato,fiere→fiera salvata. Non sono compravendite.
Gli invii restano conteggiati anche dopo vendita/rifiuto dell’annuncio;
escluse solo verebozze e demo. Una ricevuta minima server dei salvataggi
fiere conserva l’azione anche dopo rimozione dai preferiti:soliIDazione,
account e data,senza nome/luogo/token. Nuovo trigger su INSERT saved_fairs,
nessuna modifica ai trigger di annunci/email/pagamenti;ricevute eliminate
con l’account tramiteFK. Prima consultazione registrata per posteggio nel
registro recapiti,non chiamata o trattativa conclusa.
Ultimo clic nei7giorniprecedenti,ogni azione attribuita una volta soltanto;
iscrizioni e altre azioni separati. AcquistiVetrina da payments confermati,
bundle deduplicato percheckout,importi inEUR alnetto dei rimborsi;ordine
iniziato prima di un clic successivo conserva l’attribuzione precedente.
Il periodo seleziona la coorte diclic e azioni osservate fino aoggi;
i7giornipiùrecenti possono ancora maturare. Senza accesso alcuni percorsi
non sono attribuibili;nessuna ricostruzione dello storico precedente.

Statistiche aggregate perADS/misura/posizione,periodi7/30/90/365giorni,
CSV,dettagli chiusi inizialmente. Dal27ottobre niente pulsanti Aggiorna,
anche nelle Vetrine: i quattro periodi vengono letti all'apertura e conservati
solo in memoria per l'account. Cambiare periodo usa la fotografia già caricata;
focus, visibilità e autenticazione ripetuta dello stesso account non rileggono
i numeri. Per nuovi dati ricaricare la pagina. Logout/cambio account svuotano
anche queste fotografie e invalidano le letture pendenti. Un periodo fallito
non diventa zero e conserva la selezione riuscita, con invito a ricaricare.
Zeri reali distinti da rapporti mancanti;
errore mantiene gli ultimi dati con avviso,mai trasformato inzero.

## Verifiche

`scripts/test-personal-ads-db.cjs`:migrazione/funzioniSQL reali,fixture
temporanee inROLLBACK,RLS/ruoli,validazione,dedup,claim,isolamento/scadenza,
ultimo clic,treobiettivi,CTR,bundle/rimborsi e periodi.Nessun dato cliente.
`scripts/test-personal-ads.cjs`:API,Chrome1440/768/320,WebKit390 chiaro/scuro,
filtri,misure,copia,ZIP,CSV,errore/retry,cambioaccount con risposta tardiva,
tracker anon/login/logout/admin. Browser simulati;nessun Safari fisico.
Prove private:`Documents/ads-personali-20261024`;ZIP verificati anche con
Python zipfile/CRC. RegressoSSRblog e banner esistenti verificato a parte.

Prove mosaico:`Documents/ads-mosaico-20261024`, stessi browser/temi;
rettangoli confrontati con dimensioni originali/proporzioni adattate, tutte160varianti,
assenza sovrapposizioni, resize/filtri, dialog/focus/Escape, feedback live
sopra il livello modale per copia e ZIP (anche errore), ripristino al body,
logout e risposta tardiva. Nessun cambiamento a backend, misurazione o asset.
Inspector: testi pagina a16px dai bordi; eccezione edge-text per didascalia
parzialmente visibile nel canvas panoramico1:1, nessun overflow pagina.

Revisione copy/layout25/10: prove e tavole di tutte160varianti in
`Documents/ads-copy-layout-20261025`; geometria dei glifi, PNG/SVG e ZIP,
regressioneAPI/tracker/pannello in Chromium1440/768/320 e WebKit390.
Inspector app1440/768/390: avvisi motivati per colore delle creatività
e didascalie12px del mosaico; accesso admin e statistiche conservati.

Movimento: `scripts/test-personal-ads-motion.cjs`, Chromium1440/320 e
WebKit390; fotogrammi, progressione, CTA, ripetizione, ingresso/uscita,
pausa, scheda nascosta, avvio automatico della raccolta anche con movimento
ridotto, sfumature continue e fallback ridotto negli inserimenti, dialog, formato tardivo e
logout; riuso cross-origin con pausa senza clic, fallback offline/riprova e fine
delloSVG autonomo. Tutti160PNG controllati per dimensioni e colori pieni.
`test-blog-loading.cjs` include un inserimentoSSR sanificato e funzionante.
Prove `Documents/ads-movimento-hd-20261025`.
