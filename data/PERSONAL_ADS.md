# ADS personali — 24 ottobre 2026

Richiesta: raccolta privata admin con circa20 ADS delle sezioni redditizie,
più misure, riuso di alcuni banner blog e confronto dei risultati.

Seguito grafico: la pagina principale è una galleria a mosaico delle20ADS,
non una lista di miniature con editor fisso. Ogni immagine usa le dimensioni
originali in CSSpixel1:1, senza ridimensionamenti o ritagli; didascalia con
codice/misura. I rettangoli vengono incastrati con12px di distanza e44px di
didascalia. Vista iniziale20messaggi in misure miste da blog, filtro per
obiettivo/testo/misura; «Tutte le misure» mostra160varianti. Nessuna ADS
viene esclusa o duplicata nella vista iniziale. Sui piccoli schermi la sola
galleria scorre orizzontalmente per i formati larghi; nessun overflow pagina.
Al clic si apre il pannello della creatività/misura selezionata, con gli
stessi strumenti di riuso e i dati reali. Statistiche in un blocco apribile
dopo la galleria, scorciatoia nell’intestazione. Accesso admin conservato;
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
1080×1080,1080×1920.160varianti,320file PNG/SVG in `images/personal-ads`.
Grafica tipografica originale con font Jakarta già presente, SIL OFL:
tracciati SVG, raster PNG identico; nessuna foto o statistica dimostrativa.
Composizioni dedicate ai formati: titoli maiuscoli molto più grandi,
cifra dominante, agganci conservati anche nei banner mobili, testo che
occupa i verticali e i social, azioni leggibili con freccia. Blu/bianco per
vendita, inchiostro/oro per acquisto, blu/oro alternati per fiere.
Il build verifica i limiti effettivi dei glifi, compresi accenti e discendenti,
e blocca testi fuori immagine o sovrapposti. Audit opzionale in percorso
privato tramite `PERSONAL_ADS_BUILD_AUDIT`. Asset `?v=3` nel pannello,
nei link immagini e nei codici copiati; archivioZIP con nomi puliti.
IDcreatività, misure, posizioni e attribuzione restano invariati: i dati
prima/dopo il25/10 condividono lo stesso ID, non costituiscono un testA/B.
Build: `node scripts/build-personal-ads.cjs`, richiede Python fontTools
e sharp già disponibili nell’ambiente di sviluppo; nessun requisito runtime.

Per misura:codice HTML,link tracciato,PNG/SVG. ZIP per ADS o raccolta intera,
con tutte le misure,istruzioni,codici e link. Il nome posizione è un codice
`[a-z0-9_-]{1,80}`,mai dati personali. Immagini sole/off-site non misurano
impressioni:fuori dal blog usare almeno il link tracciato. Un banner largo
ridotto sul telefono diventa piccolo:lo strumento consiglia il formato mobile.

## Misura

`personal_ad_events`:impression/click,IDcreatività,formato,posizione,sessione
già esistente ed eventuale account verificato al claim. Nessun IP/email/UA
salvato. RLS senza accessi diretti anon/auth; soleRPC validate e autorizzate.
Dedup server per(sessione,ADS,formato,posizione,tipo),limite250eventi/ora
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

CTR= clic con precedente impressione misurata / impressioni;clic non
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
CSV,dettagli chiusi inizialmente. Zeri reali distinti da rapporti mancanti;
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
rettangoli reali confrontati con gli attributi originali, tutte160varianti,
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
