# Organizzatori, eventi e prenotazioni future — 18 ottobre 2026

## Intestazione scura — 21 ottobre 2026

Su richiesta, la barra superiore di `/organizzatore` segue il tema scuro:
fondo blu notte, logo chiaro, suffisso e azioni azzurri, menu e pulsanti
Messaggi/Area personale/Accedi coordinati, compresi hover e focus tastiera.
Regole limitate a `body.organizer-theme > header`; sostituiscono la scelta
storica dell'intestazione chiara. CSS selettore5, riferimenti area/dashboard
allineati; componenti condivisi, sessioni e dati invariati.
Regressione profili364 verifiche locali nei quattro formati/browser,
WebKit390 ripetuto isolatamente dopo errori transitori di accesso della
fixture. Controllo visivo con font/icone e barra autenticata reale simulando
la sola sessione: Chromium1440/320 e WebKit390, senza scritture reali.
Esiti, schermate e stato della pubblicazione:
`Documents/verifica-organizzatore-header-scuro-20261021/risultati.md`.

## Statistiche dell’organizzatore — 21 ottobre 2026

Richiesta: area più ricca, molte statistiche utili e presentazione curata.
Sezione sotto il profilo diretto, tema blu notte/ciano, periodi7/30/90 e
singolo evento/tutti. Visite e clic con confronto, salvataggi e avvisi attuali,
grafico giornaliero con dati apribili, occupazione degli eventi pubblicati
non conclusi, ripartizione email/telefono/sito, provenienza/dispositivo,
prossime date/scadenze e tabella per evento ordinabile. CSV protetto dalle
formule; filtri conservati, risposte obsolete/errori/logout non mostrano
dati precedenti. Nessuna cache persistente dei dati del proprietario.

`organizer_analytics` restituisce solo aggregati dei propri eventi: finestre
UTC comprendenti oggi, confronto agli stessi istanti precedenti, serie
completa; confronto nascosto finché lo storico non copre entrambi i periodi.
Giorni mai misurati con trattino, nessuna ricostruzione. Occupazione attuale:
attivi soltanto, assegnati=esterni+confermati, hold separati; tabella anche
bozze/conclusi. Salvataggi/avvisi sono la situazione corrente, non acquisizioni
storiche. Clic ogni100 visite, non conversioni o partecipazioni certificate.

Nuova rilevazione delle pagine evento e del dialog calendario: una visita e
un clic per tipo/evento/sessione/giorno, deduplica DB anche dopo reload.
JWT verificato dal server, proprietario e admin autenticati esclusi;
bozze/sospesi e contatti inesistenti ignorati. Provenienza solo categoria,
dispositivo dalla larghezza; codice sessione trasformato per evento/giorno,
nessun account, IP, URL o recapito nei record. Organizzatori senza accesso ai
log; conservazione190giorni con pulizia giornaliera della sola nuova tabella.
Privacy aggiornata. Nessuna attivazione dei pagamenti e nessun incasso esterno
dedotto dall’occupazione. Catalogo documentale invariato.

Patch `PATCH_ORGANIZZATORI_STATISTICHE_20261021.sql` additiva/idempotente,
cache organizzatori10, analyticsJS2/CSS1, engagement1. Test dedicati:
`test-organizer-analytics-db.cjs --with-migration` con ROLLBACK e regressioni
profilo/eventi; `test-organizer-analytics.cjs` e `test-event-engagement.cjs`,
Chromium1440/320 e WebKit390. Prove in
`Documents/verifica-organizzatori-statistiche-20261020/`. Backup tag/branch
remoti preventivi validi; lo script backup ha ripetuto il noto errore nel
cleanup tag, senza compromettere il checkpoint. Errori iniziali della sola
fixture SQL (CRLF, escape JS e ruolo ereditato) corretti; suite poi passata.
Backend applicato e riapplicato: identica data iniziale, un solo job attivo,
zero log di prova residui; API protetta e permessi privati verificati.
116profili/129annunci/19pagamenti/un organizzatore/un evento invariati,
prenotazioni0 e pagamenti disattivati. Suite analytics e engagement complete
passate anche con font/icone reali; profili364 e percorso eventi/capienza
Chromium1440/320 e WebKit390 passati. Pubblicato `b65e519`, Vercel riuscito
`2H2ytE2cLsJ4jcDTL7iMbXQ4YV5o`: nove asset identici, SSR aggiornato, API
statistiche anonima401 e pubblica eventi200. Suite analytics passata anche
sugli asset pubblicati nei tre formati/browser; tre prove anonime con SDK/
font/rete reali passate, senza errori/overflow/scritture. API con0eventi
pubblici: nessuna sessione reale proprietario usata, copertura tramite SQL
e fixture dichiarata. Scala finale del grafico con tacche intere esatte;
suite ripassata dopo un errore transitorio di cattura schermata Chromium.
Riscontri e limiti in `risultati.md` nella cartella prove.

## Profilo diretto e testi essenziali — 20 ottobre 2026

Preferenza corrente: l’area organizzatore è il profilo stesso, senza pagina
intermedia o «Vedi il profilo pubblico». Nome, iniziali, tipo, descrizione e
contatti pubblici subito visibili; eventi sotto, modifica nei campi apribili.
Nella finestra del profilo stessa presentazione, fino a tre eventi e comandi
Modifica profilo/Gestisci eventi. Niente guida a passaggi, spiegazioni di stato
ripetute o testi promozionali. Note di revisione e avviso sulla nuova
approvazione restano nel contesto utile; referente/telefono privato solo
nei campi proprietario, mai nella presentazione.

`EventOrganizers.profileHTML` condiviso fra area e finestra; link
`/organizzatore?modifica=1` apre i campi, porta il focus al nome e consuma
il parametro. Riprova ripristina il focus sull’azione principale, non sui
nuovi contatti. Controlli accesso, revisioni, bozze e backend conservati.
Cache organizzatori9, profile-switch JS5/CSS4. Suite profili364 controlli
su quattro formati/browser, percorso eventi Chromium1440/320 e WebKit390,
usabilità68 passati. Prove `Documents/verifica-organizzatore-profilo-20261020/`.
Nessuna scrittura/account/evento/email reale di prova. Backup tag/branch
remoti verificati; noto errore cleanup nello script preventivo. Prima prova
Riprova ha rilevato il focus sul contatto: corretto e suite intera passata.

Pubblicato `d1491e6`, Vercel riuscito
`5aVu1B8WeYzSVZYMs8fhPBZhM1DJ`: sei pagine/asset identici al checkout;
profili364 e percorso eventi tre formati passati sugli asset pubblicati,
sessioni/backend simulati. Primo giro WebKit con errore access-control sui
soli endpoint localhost della fixture; ripetizione WebKit isolata91/91
passata. Font/icone reali e profilo nei tre formati verificati, nessun
overflow/errore. Accesso anonimo reale tre formati passato. API pubblica
eventi200 con zero record correnti: controllo profilo pubblico reale
condizionale non eseguito, nessuna approvazione dedotta o modificata.
API Vercel403 per token CLI locale invalido; pubblicazione verificata via
status Vercel del commit GitHub e confronto asset. Riscontri/errori/limiti
in `risultati.md` nella cartella prove; nessuna scrittura reale di prova.

## Posti disponibili e sold out — 20 ottobre 2026

Richiesta: verificare i pagamenti e rendere visibili massimo, posti liberi e
Sold out. Audit aggiornato: pagamenti eventi disattivati, nessun account Connect
collegato e nessuna prenotazione. Il checkout Vetrina resta distinto. Chiesta
la preferenza sul pagamento online facoltativo con l'8% già previsto; nessuna
attivazione economica dedotta dall'assenza di risposta.

Massimo per tipologia e totale fiera come somma delle tipologie attive. Nuova
gestione «Posti disponibili» nell'editor: massimo e posti assegnati fuori dal
sito; contatori separati per confermati online e blocchi di pagamento. Il DB
calcola liberi = massimo - esterni - confermati - blocchi non scaduti. Sold out
a zero, riapertura automatica quando tornano posti; rimborso parziale conserva
il posto, rimborso totale lo libera. Gli eventi del catalogo documentale non
ricevono disponibilità inventate.

Aggiornamenti dei posti senza ritirare l'evento o alterare l'approvazione;
revisione dedicata, audit, isolamento del proprietario e lock sull'evento
coordinato con la primitiva prenotazioni. Impossibile abbassare il massimo
sotto i posti occupati, disattivare una tipologia occupata o ignorare gli
assegnati esterni nella prenotazione futura. Bozze delle diverse tipologie
conservate durante un aggiornamento; feedback vicino al comando, errori con
riprova e ritorno del focus. Riepilogo pubblico su evento, profilo, anteprima
calendario e dialog; pagina e calendario aggiornano ogni30s e al ritorno nella
scheda. Errore di aggiornamento segnalato, evento ritirato non prenotabile.
La disponibilità dipende anche dagli aggiornamenti dell'organizzatore sulle
assegnazioni esterne: non è una garanzia di ammissione.

Patch additiva/idempotente `PATCH_EVENTI_DISPONIBILITA_20261020.sql` applicata
due volte e verificata via API. Prima/dopo invariati:116 profili,129 annunci,
19 pagamenti Vetrina,un organizzatore/un evento,zero prenotazioni,flag pagamenti
false e un posto totale. Nessun account/evento/email/acquisto reale di prova.
Suite `scripts/test-event-capacity-db.cjs` su SQL reale/ROLLBACK: massimo,
esterni, revisioni, privacy, pagati/hold/scadenze/rimborsi e sovraprenotazioni.
`scripts/test-event-capacity.cjs`: Chromium1440/320 e WebKit390, interfacce
reali/backend simulato; sold out/riapertura, aggiornamenti pagina/calendario/
dialog, errori/riprova, bozze multiple, ritiro e overflow passati. Percorso
organizzatori nei tre formati, audit usabilità68 e prezzi/Stripe passati.
Prove `Documents/verifica-fiere-posti-20261020/`; primo errore nella prova
di rete risolto correggendo la fixture, senza scritture reali. Cache
event-data2/organizzatori8/eventi5/calendario92/fiere CSS31/availability1.
Backup tag/branch remoti verificati; noto errore cleanup dello script backup.

Pubblicato `f6e7222`, Vercel READY `dpl_5ZFUMzJEkqW91NRwRc36nQ7CS8s7`.
Otto asset online identici al checkout; suite disponibilità passata anche
sugli asset pubblicati Chromium1440/320 e WebKit390, backend simulato.
Tre prove anonime con API/dati/font reali: evento200, refresh, calendario,
dialog e profilo mostrano il posto disponibile su uno. Scritture bloccate,
nessun errore JS/overflow o prenotazione/acquisto reale. Prove `online/`,
`live.json`, `deployment.json`, schermate e `risultati.md`. Audit usabilità68
ripetuto dopo l'ultima correzione del feedback, passato. Gitleaks superato.
Per le verifiche Vercel usare il progetto GitHub `subingresso`
(`prj_QsyHcCh5m4DGRTclNKR6z8MtaRnm`): il `.vercel/project.json` locale punta
al precedente progetto `subingresso.it`, non al deploy corrente del dominio.

## Verifica pubblicazione e fatturazione — 20 ottobre 2026

Ricontrollo API in sola lettura: un organizzatore approvato e un evento
pubblicato, zero prenotazioni, pagamenti eventi disattivati. Percorso completo
di richiesta profilo, creazione evento/posteggi, invio e revisione verificato
in Chromium1440/320 e WebKit390 con backend simulato; autorizzazioni, privacy,
revisioni e pagamenti disattivati verificati su SQL reale in ROLLBACK.

Il servizio attuale mette in contatto ambulante e organizzatore: nessun
checkout o trasferimento per le fiere, nessuna raccolta di dati di fatturazione
e nessuna fattura automatica. La richiesta di fattura per il posteggio viene
quindi gestita direttamente con l'organizzatore, fuori dal sito. I dettagli
fiscali dell'eventuale futuro incasso piattaforma vanno definiti prima
dell'attivazione; nessun flusso fiscale aggiunto o promessa di copertura.
La ricevuta Vetrina è un servizio distinto, non una fattura delle fiere.
Prove `Documents/verifica-fiere-campanella-20261020/`.

Correzione preferiti pubblicata `8b152f4`, Vercel READY; anche la pagina
evento mostra Salva e campanella sotto il titolo. API pubblica reale200 e
percorso salvataggi organizzatore verificati sui file pubblicati, quattro
formati/browser; profili304 controlli passati. Pagamenti, profili ed eventi
reali invariati, nessun invio o approvazione automatica del test dell'utente.

## Admin e pannello compatto — 20 ottobre 2026

Admin escluso dal default Organizzatore nei due percorsi: controllo is_admin
aggiornato e fallimento conservativo, scelta manuale conservata. Gestione
admin chiusa all'ingresso con contatori visibili; schede Fiere ed eventi e
Organizzatori, ricerca senza accenti, filtro stato, sei righe per pagina,
pending prima di bozze e resto. Aggiornamento conserva filtri, scheda,
pagina e apertura; cambio scheda azzera solo lo stato incompatibile.
Dettagli e azioni nel dialogo, bozze non approvabili. Logout/cambio account
e risposte fuori ordine conservano le protezioni. Backend, catalogo,
eventi e account reali invariati. Cache organizzatori7, profile-switch4
e nuovo css/event-admin1 limitato alla dashboard. Suite test-event-admin,
profili ed eventi/experience; prove Documents/verifica-admin-fiere-20261020.
Pubblicato `62f1f32`, Vercel READY `dpl_5Y9pX4g4MNEuDfbBL5CWsEWqD8so`:
sei asset identici. Profili304/pannello87 ed eventi tre formati passati
localmente e sugli asset pubblicati; backend simulato. Audit usabilità68,
controllo sito sei combinazioni e tre prove anonime reali font/accesso
passati. Timeout di risorse esterne del giro visuale risolto nella suite;
errori/limiti e prove in risultati.md nella cartella indicata sopra.

## Selettore profili — 19 ottobre 2026

**Correzione corrente successiva, richiesta dall’utente:** nome visibile
Ambulante, anziché Normale, nelle due dashboard e nel modal, titolo e avviso
modifiche compresi. Nella dashboard lo switch è tra blocco avatar/saluto/
email/modifica profilo e Performance posteggi; nessun ancoraggio allo schermo.
Nella pagina organizzatore resta in alto ma scorre con il contenuto. Tolti
i pulsanti aggiuntivi «Dashboard normale» e «Aggiorna», compreso l’ascoltatore
JS del comando rimosso. I dati continuano a caricarsi all’ingresso e dopo i
salvataggi tramite il percorso esistente. Lo switch Ambulante torna alla
dashboard senza aprire il modal; `?profilo=1` resta compatibile per gli altri
accessi diretti al profilo. Colori, scelta iniziale e backend conservati.
Cache CSS/JS selettore3 e organizzatori6 nei tre consumatori. La posizione
fissa e il nome Normale registrati sotto sono superati da questa richiesta.
Checkout isolato `Documents/subingresso-profili-ambulante-20261019` e prove
`Documents/verifica-profili-ambulante-layout-20261019/`;280 controlli profili
locali passati (70×4, Chromium1440/820/320 e WebKit390), con font/icone reali.
Verificata posizione tra saluto e Performance, scomparsa scorrendo nelle
due dashboard, nome, assenza pulsanti duplicati e ritorno dal solo switch;
predefiniti, modal e salvataggi conservati. Flusso completo eventi passato
Chromium1440/320 e WebKit390. Pubblicato `a424f8a`, Vercel READY
`dpl_8kpHtbcTy2XwpJGXWbPnAkJ2anWY`: sei asset pubblicati identici byte per
byte ai blob Git,70 controlli passati anche su HTML/JS/CSS pubblicati320,
backend simulato. Tre prove anonime su rete reale Chromium1440/320 e
WebKit390: nome Ambulante, link dello switch, scorrimento nel documento,
assenza dei due pulsanti, colori/font/logo e registrazione standard passati.
Nessun errore JS/overflow o scrittura reale, dati Pisa concorrenti conservati.
Prove `asset-online.json`, `pubblicazione.json`, `online/profili-online.json`,
`anonimo-online.json`, risultati locali e schermate. Scansioni segreti
superate senza bypass; checkpoint e branch remoto validi.

**Aggiornamento corrente del 19/10, prevale sulla descrizione iniziale sotto:**
Normale mantiene i colori chiari; Organizzatore usa blu notte, testi chiari
e azioni azzurre sia nel modal sia nell'area di gestione. Titolo, icone e
selezione distinguono la modalità, senza affidarsi al solo colore. Selettore
sempre disponibile: fuori dallo scorrimento del modal e fisso sotto l'header
nella pagina organizzatore; campi/editor con margine di scorrimento adeguato.

A ogni apertura ordinaria si verificano identità e dati correnti in sola
lettura: HEAD con conteggio esatto degli annunci propri `status=active` e
`expires_at` futuro/NULL, in parallelo alla RPC proprietario
`organizer_workspace`. Con profilo organizzatore esistente, eventi propri
non annullati (comprese bozze/in revisione) più numerosi degli annunci apre
Organizzatore. Parità, zero contenuti o errore apre Normale. Nessun uso del
numero di posteggi interni agli eventi. Attesa breve senza mostrare campi
destinati a sparire, timeout10s; switch già disponibile durante l'attesa.
Scelta manuale, chiusura e cambio identità invalidano la risposta pendente.
Ritorno esplicito da Organizzatore via `/dashboard?profilo=1` forza Normale
e consuma il parametro. Nessun cambio automatico dopo aver iniziato a usare
il profilo; ricalcolo alla prossima apertura. Nessun dato salvato nel browser,
registrazione standard e approvazione esistenti conservate, backend invariato.
CSS/JS selettore v2, prove `Documents/verifica-profili-default-colori-20261019/`;
anche l'ingresso ordinario `/dashboard` applica lo stesso confronto e porta
direttamente a `/organizzatore` quando prevalgono gli eventi. Switch fisso
presente in entrambe le dashboard. `?area=normale` forza quella normale;
link con hash/query espliciti mantengono la destinazione. Qualunque uso della
pagina durante l'attesa annulla il rinvio automatico per non interrompere
l'utente. Nessuna modifica ad auth.js o al percorso dei link esistenti.
Verifiche locali:264 controlli funzionali (66×4) Chromium1440/820/320 e
WebKit390 con font/icone reali;67 controlli320 sulla versione finale con
contrasto/logo corretti. Percorso completo eventi passato Chromium1440/320
e WebKit390, nessuna scrittura reale. HEAD SDK/API reale200 con conteggio
esatto e filtro scadenza/NULL; workspace proprietario senza sessione401.
Pubblicato `880981b`, Vercel READY `dpl_99A1Gje1rLK7A3S9FBWfavmh2vyg`
([deploy](https://vercel.com/kycykuardit-9234s-projects/subingresso/99A1Gje1rLK7A3S9FBWfavmh2vyg)).
Quattro asset pubblicati identici byte per byte ai blob Git.268/268 controlli
online (67×4) passati con backend simulato, inclusi ingresso automatico nelle
dashboard, ritorno esplicito, link diretti, interazioni prima/durante l'attesa,
modal e salvaguardie precedenti. Tre browser/formati con rete reale:
Chromium1440/320 e WebKit390, colori scuri, logo scuro su header chiaro,
font/logo coerenti con pagina standard, switch fisso fino al fondo pagina,
registrazione standard e nessuna scrittura eseguita. Prove `asset-online.json`,
`online/profili-online.json`, `anonimo-online.json`, schermate e API nella
cartella indicata. Scansione segreti superata senza bypass.
Backup remoto preventivo verificato;
il cleanup locale del vecchio script ha il noto errore PowerShell.

Preferenza dell’utente: utenza normale prevalente, registrazione semplice come prima; organizzatore scelto separatamente e sottoposto a controllo. «Il mio profilo» ora contiene un selettore di due schede (massimo360px,54px in altezza), Normale a sinistra e predefinito a ogni apertura, Organizzatore a destra, indicatore scorrevole. Clic, frecce/Home/End e swipe orizzontale sul selettore; scorrimento verticale non cambia modalità. Selettore fisso sopra il contenuto, pulsanti44px, focus nel dialogo/Escape/ritorno all’apertura, animazione disattivata con movimento ridotto. CSS e JS dedicati v1, nessuna modifica ad auth/registrazione o ruoli.

Scheda normale conserva tutti i campi, avatar, preferenze, sicurezza e acquisti; rimossi il riquadro promozionale organizzatore e il pulsante superiore duplicato. La scheda organizzatore legge solo alla selezione la RPC proprietario esistente, verifica l’identità e mostra nome/stato/note con collegamento al modulo completo e agli eventi. Nessun profilo attivato al clic, nessun contatto privato incluso nel riepilogo; link pubblico solo per approvati. Nuovi organizzatori usano lo stesso account e completano i dati aggiuntivi nel percorso esistente. Nell’area organizzatore il selettore indica la modalità attuale e Normale torna al modal già aperto, consumando il parametro URL.

I campi normali non sono ricreati passando tra le schede. Prima di navigare con modifiche non salvate viene chiesto se abbandonarle; il confronto riguarda i dati effettivamente inviati nell’ultimo salvataggio riuscito. Un salvataggio normale terminato dopo il cambio scheda non chiude il nuovo pannello. Richieste numerate, risposta vecchia ignorata, riepilogo svuotato alla chiusura/logout/cambio account; errore e riprova con focus ripristinato. Nessuna cache persistente né scrittura alla selezione, nessuna modifica a revisione profili/eventi, contatti o pagamenti.

`scripts/test-profile-switch.cjs`:172 verifiche (43 per Chromium1440×950,820×900,320×568 e WebKit390×844), HTML/JS/form reali e sessioni/RPC simulate. Copre selezione predefinita, dimensioni/font, scorrimento, tastiera/gesti, conservazione e salvataggio dati normali, avviso uscita, percorso completo e ritorno, quattro stati, link pubblico, XSS/recapiti privati, errore/riprova, risposte inverse, focus, movimento ridotto e logout/cambio account con risposta pendente. `PROFILE_USE_PUBLISHED=1` confronta e usa i quattro asset online; `PROFILE_VISUAL=1` carica font/icone esterni. Prove in `Documents/verifica-selettore-profili-20261019/`. Regressioni passate: flusso completo eventi Chromium1440/320 e WebKit390, audit usabilità68/68, account/acquisti e admin Chromium/WebKit1440/390/320. Nessun account/evento/email/acquisto reale creato o modificato.

Pubblicato `3c70f4b`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/FxD33Ev9aESEvqzazXhwT6u1XhBs). Quattro asset online identici byte per byte ai blob Git;172/172 verifiche ripetute sugli asset pubblicati con backend simulato. Browser con rete reale Chromium1440/320 e WebKit390: pagina organizzatore anonima, selettore, logo/font identici a `/contatti`, accesso e registrazione standard senza campi organizzatore; richieste di scrittura bloccate e nessun errore JS. Prova grafica con font/icone reali passata su WebKit390. Riscontri `asset-online.json`, `online/profili-online.json`, `anonimo-online.json`, `grafica/` e `risultati.md`. Primo confronto online anticipato mentre il deploy era pending: ripetuto dopo esito Vercel positivo. Backup remoto `backup/session-20261019-010927-selettore-profili` verificato (noto errore cleanup PowerShell); scansione segreti superata con il binario principale, nessun bypass. File estranei della cartella originale conservati.

Richiesta: lo stesso account deve poter organizzare fiere e mercatini, creare e gestire eventi approvati dall’admin. Predisporre prenotazioni per ambulanti: incasso sulla piattaforma, trasferimento all’organizzatore, commissione Subingresso **8% su ogni pagamento**. Approvazione separata del profilo organizzatore e di ogni evento; nessuna prenotazione o movimentazione di denaro attivata con questo intervento.

## Preferenza corrente: contatto diretto e coerenza grafica — 18 ottobre 2026

Il contatto privato con l’organizzatore è il percorso principale. I pagamenti sul sito saranno una scelta facoltativa dell’organizzatore; l’8% riguarda soltanto i pagamenti gestiti dalla piattaforma e va spiegato nel percorso di attivazione, senza pubblicizzarlo nei moduli o nelle pagine generali. Rimossa dall’area organizzatore l’intera sezione promozionale con ripartizione 8%/92% ed esempio. Nessun pagamento attivato né regola economica DB modificata.

Font Plus Jakarta Sans applicato anche al body delle pagine organizzatore/evento: logo, menu, footer e finestre di accesso ereditano ora lo stesso carattere delle altre pagine. CSS eventi v2 in tutti e quattro i riferimenti pubblicati; rimossi gli stili del riquadro eliminato.

Verifiche della correzione: flusso completo esistente passato in Chromium1440/320×568 e WebKit390. Confronto con `/contatti` su font realmente caricato, famiglia/peso/dimensione di logo/menu/footer identici; form e accesso standard coerenti, riquadro/percentuali assenti e contatto diretto presente nell’evento simulato. Pagina evento non disponibile verificata con HTML reale; evento200 simulato soltanto nel browser, nessun nuovo profilo/evento o invio reale. Nessun overflow/errore JS. Prove `Documents/verifica-organizzatori-font-20261018/`. Backup remoto verificato; consueto errore cleanup tag PowerShell.

Pubblicato `7b2f50a`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/GD9xNYHHuYzPxmydeBrLz6H5TpaA). Organizzatore/dashboard/profilo/CSS pubblicati identici al commit; evento404 reale con CSSv2 e no-store. Confronto font reale, logo/menu/footer, accesso standard e modulo passati anche sull’HTML online nei tre browser/formati. Apertura del modulo simulata nel browser senza autenticare account; rendering200 dell’evento isolato, CSS scaricato dal sito. Riscontri `asset-online.json`, `font-online.json` e schermate nella cartella prove. Backend, prenotazioni e contatti invariati; scansione segreti superata con il binario principale, hook del checkout isolato senza binario.

## Percorsi e stati

Revisione qualità, 18–19 ottobre 2026: prove esplorative ripetibili con eventi/account simulati hanno riprodotto sette punti deboli: campi modificabili durante un salvataggio con successiva perdita del testo; feedback fuori dalla sezione usata; ritiro di un altro evento che cancellava modifiche all’editor; risposta admin vecchia capace di sovrascrivere la più recente; scheda privata ancora aperta dopo logout e dati ancora presenti; indicazione di invio generica. Riscontri iniziali `experience-before.json` in `Documents/verifica-qualita-organizzatori-20261018/`.

Correzioni: campi temporaneamente non interattivi durante la richiesta, riattivati anche su errore; ritorno del focus quando il comune è pronto senza interrompere un’altra scelta dell’utente; messaggi distinti accanto a profilo/dati evento/posteggi e pulizia di messaggi vecchi; consenso sulle modifiche prima di ritirare un altro evento. Indicazione dinamica di data/condizioni/posteggi mancanti, modifiche da salvare o «Pronto per l’invio». L’header fisso non copre più il titolo dell’editor quando vi si scorre.

Admin: aggiornamenti numerati, accettata soltanto la risposta più recente; su logout/cambio identità chiusura dialog, svuotamento DOM/dati/note e invalidazione delle risposte pendenti. Riavvio per lo stesso admin senza duplicare gli eventi dei pulsanti; anche le revisioni pendenti ignorano la vecchia sessione. Controlli server, stati e autorizzazioni invariati: nessun aggiramento delle revisioni, nessuna modifica schema/pagamenti.

Nuova suite `scripts/test-organizer-experience.cjs`, basata sugli stessi HTML/JS effettivi e backend simulato della suite completa. Controlla rete lenta, conservazione testo, focus, posizione feedback, risposte invertite, logout con richiesta pendente e dati privati aperti, cambio account, riavvio admin, scorrimento, dialog/overflow, ID, etichette e pulsanti almeno44px. Quattro combinazioni Chromium1440/820/320×568 e WebKit390. `scripts/test-organizer-events.cjs` resta eseguibile da solo e con `EVENT_USE_PUBLISHED=1`; esporta il server di prova soltanto per le suite. SQL reale preesistente ripetuto con ROLLBACK e passato, nessuna fixture persistente o email/acquisto reale. Cache allineate JS organizzatori5 e CSS eventi4, compresa la pagina evento SSR. Audit finale68/68 esiti positivi (17 controlli per quattro combinazioni); percorso completo e regressioni passati Chromium1440/320×568 e WebKit390. Prova del focus con attivazione da tastiera: WebKit non assegna il focus al pulsante con un semplice clic del mouse. Resoconto `risultati.md` e risultati finali `experience-after.json`. Pubblicato `2f7d024`, Vercel riuscito `DDkRQ2Y39XanUqarGyS9tvzztSWT`. Cinque asset/pagine identici al commit; evento404 reale con CSS4. Percorso completo sugli asset pubblicati passato in Chromium1440/320 e WebKit390; font reale, logo/menu/footer, accesso/modulo e contatti passati online negli stessi tre casi. Riscontri `asset-online.json`, `font-online.json` e cartella `online/`. Nessun errore JS o overflow; scansione segreti superata con il binario principale. Base Ferrara concorrente preservata; backup tag e branch remoti verificati, consueto errore cleanup PowerShell.

Chiarezza invio/approvazione, 18/10: un evento dell’account admin risultava da API in bozza, con un posteggio attivo e condizioni compilate, ma senza `submitted_at`. Nessuna richiesta pendente e proiezione pubblica vuota: mancava l’invio, non l’approvazione. Ora le bozze aprono automaticamente l’elenco admin, il riepilogo le conta come non inviate e «Vedi bozza» spiega perché Approva non è disponibile. Link alla propria area nel pannello admin; scheda proprietario «Completa e invia», avviso esplicito e pulsante di invio sopra l’elenco posteggi. Nessuna possibilità di approvare direttamente una bozza aggiunta; stati/RPC invariati, nessun invio o pubblicazione del test reale effettuato dall’agente. JS organizzatori4, cache allineate su area/dashboard/profilo. Prove `Documents/verifica-invio-eventi-admin-20261018/`.

Suite completa con caso bozza admin passata Chromium1440/320×568 e WebKit390: elenco aperto e conteggio, apertura bozza, Approva nascosto fino all’invio, avviso/pulsante proprietario, poi invio e approvazione normali, calendario e regressioni. Nessun overflow/errore JS. Stato reale ricontrollato in sola lettura e conservato in `stato-reale.json`, sempre bozza revisione2 senza invio. Pubblicato `f934ec7`, Vercel riuscito `CgSoNPYLQ4AixM4oFmjM2i3pUdS9`; quattro asset/pagine online identici al commit, riscontri in `asset-online.json`. Caso bozza/admin e flusso completo passati anche sugli asset pubblicati in Chromium1440, backend simulato isolato. Nessuna modifica al database o ai dati della ricerca Ferrara concorrente; backup remoto preventivo verificato, consueto errore cleanup tag.

Aggiornamento modulo del 18/10: date inizio/fine collegate, fine proposta per un giorno e riallineata se l’inizio la supera; min/max nel calendario e verifica manuale ISO anche dove `input.type` ricade su testo (WebKit Windows). Massimo366 giorni tra inizio/fine, scadenza domande non oltre l’inizio; date passate ammesse in bozza ma fermate prima dell’invio. Errori accanto ai campi, descritti per gli strumenti assistivi e focus sul primo da correggere; recapiti, spazi/minimi, comune selezionato, settori e numeri controllati prima delle RPC. Niente validazione al blur che sposti i pulsanti durante il clic. Condizioni min20 soltanto per inviare, almeno una tipologia attiva; nessuna perdita delle modifiche al profilo salvando evento/posteggi. Indicazioni e raggruppamenti più brevi, campi facoltativi espliciti, prezzo per un posteggio/intero evento e gratuito0 chiari. JS organizzatori3/CSS eventi3; schema e regole server invariati.

Prove in `Documents/verifica-modulo-eventi-20261018/`: estesa la suite browser con date invertite, riallineamento, limite366 e anno bisestile, scadenza domande, evento passato, stesso giorno, condizioni mancanti, settori/recapiti/testi invalidi, quantità frazionarie/fuori limiti, prezzi/decimali e gratuito, dimensioni e conservazione profilo. SQL reale in ROLLBACK passato con gli stessi casi negativi sulle RPC, più autorizzazioni/revisioni/privacy/prenotazioni disattivate già esistenti. Nessun profilo/evento dell’utente modificato e nessun invio/acquisto reale.

Suite completa locale passata Chromium1440/320×568 e WebKit390. Corrette durante le prove la validazione al blur che spostava il pulsante prima del clic e l’assenza di date native in WebKit Windows, che richiede controlli indipendenti da `input.type` e `validity`. Pubblicato `5f408e6`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/Bg7hoptAasVzQD7L1rEqpW6CMoi7); cinque asset/pagine identici al commit ed evento404 reale con CSS3. Test ripetibili sull’HTML/JS/CSS pubblicati tramite `EVENT_USE_PUBLISHED=1`, sempre con backend isolato per non creare eventi reali. Flusso completo e casi invalidi passati anche sugli asset pubblicati in tutti e tre i browser/formati; nessun errore JS o overflow. Scansione segreti superata usando il binario principale.

- `/organizzatore`: richiesta/modifica profilo, eventi, tipologie di posteggio con quantità, dimensioni, prezzo totale per l’intera manifestazione e condizioni. Accesso dallo stesso account, dashboard e calendario fiere. Nessuna modifica al wizard annunci o al sistema Vetrina.
- Dashboard admin: pannello Organizzatori ed eventi, contatori delle richieste, schede complete e note. Profilo `pending → approved/rejected/suspended`; evento `draft → pending → published/rejected`, ritiro proprietario `cancelled`. Nessuna cancellazione.
- Una modifica ai dati del profilo rimette il profilo in revisione e nasconde tutti i suoi eventi finché non torna approvato. Una modifica a evento/posteggi riporta l’evento in bozza e lo nasconde fino alla nuova approvazione. Le scritture richiedono la revisione corrente per evitare approvazioni o sovrascritture di dati cambiati nel frattempo.
- `/profilo?id=...`: nome dell’organizzazione anche nell’intestazione/titolo, contatti espressamente pubblici ed eventi pubblicati, oltre agli annunci già presenti. Referente, telefono privato e note non escono nelle proiezioni pubbliche. Almeno un recapito pubblico/sito obbligatorio; sito solo HTTPS.
- Calendario `/fiere`: integra gli eventi approvati con filtri/mappa/schede esistenti senza riscrivere il catalogo documentale. Errore del flusso organizzatori segnalato separatamente, catalogo consultabile e pulsante Riprova. Nessuna persistente copia pubblica di bozze.
- `/evento?id=UUID`: pagina pubblica resa dal server, senza cache, 404 per eventi non pubblici, 503 in caso di DB non raggiungibile. Tariffe, condizioni, date e contatti disponibili anche senza JavaScript. Gli eventi approvati entrano automaticamente nella sitemap; quelli non pubblici ne escono alla rigenerazione. Quantità = organico previsto, mai promessa di posti liberi.

## Database e sicurezza

Patch `PATCH_EVENTI_ORGANIZZATORI_20261018.sql`, transazionale e riapplicabile. Tabelle `organizer_profiles`, `organizer_events`, `event_places`, `event_bookings`; nessun accesso diretto anon/auth/service_role. Solo RPC con identità dal token, controlli server di proprietà/admin e `search_path` vuoto. Nessuna fiducia in owner/status/prezzi/commissioni trasmessi dal browser. Comune/provincia/regione e coordinate derivano da `data_quality.locations`. Schema privato `event_private`: impostazioni, conti collegati futuri, eventi del gestore pagamenti, trasferimenti, audit revisioni. Nessun trigger o email delle tabelle annunci modificato; il sistema non manda email nuove.

RPC gestionali: `organizer_workspace`, `save_organizer_profile`, `save_organizer_event`, `save_event_place`, `submit_organizer_event`, `cancel_organizer_event`, `admin_event_workspace`, `review_organizer`, `review_organizer_event`. Pubbliche: `published_organizer_profile`, `published_organizer_events`; proiezioni esplicite, evento pubblicato **e** organizzatore approvato richiesti. Approvazione evento consentita solo su versione pending attuale, mai su bozza o evento concluso.

## Predisposizione economica, ancora disabilitata

- `event_private.settings.bookings_enabled=false`; anche ogni evento ha `bookings_enabled=false`. Nessun comando UI/RPC per attivare questi flag. Nessun nuovo endpoint di checkout/webhook o trasferimento attivo, nessuna credenziale Connect creata e nessun conto Stripe modificato.
- `reserve_event_place` è una primitiva futura, ora rifiuta ogni richiesta. Con attivazione server futura richiede account Connect con trasferimenti verificati, evento pubblico abilitato, organizzatore approvato, termine domande non scaduto e data futura/corrente. Blocca righe durante l’assegnazione e conta ordini pagati/blocchi non scaduti. Chiave di richiesta unica per acquirente: stesso carrello restituisce lo stesso ordine, carrello diverso viene rifiutato. Blocco provvisorio 15 minuti.
- Prenotazione conserva titolo, organizzatore, date, tipologia, quantità e prezzo del momento. Importi in centesimi EUR; commissione fissa **800 punti base**, arrotondata al centesimo più vicino, residuo esatto all’organizzatore. 100 € → 8 € + 92 €; nessuna commissione in più addebitata all’ambulante. Trigger impedisce riscrittura dei dati economici e cancellazione dello storico; il gestore del DB resta tecnicamente in grado di cambiare lo schema.
- Strutture private predisposte per deduplicare eventi del gestore, tracciare trasferimenti, rimborsi e contestazioni. Queste tabelle **non costituiscono un processore pagamenti funzionante**: i relativi aggiornamenti server devono essere implementati prima dell’attivazione.

Architettura prevista: Stripe Connect con incasso sulla piattaforma e trasferimento separato della quota organizzatore, coerente con [documentazione Stripe](https://docs.stripe.com/connect/separate-charges-and-transfers). I costi del gestore, rimborsi e contestazioni hanno effetti sul saldo piattaforma: non considerare l’8% un guadagno netto garantito. Nessuna nuova tariffa di elaborazione o regola fiscale inventata/applicata agli utenti.

Prima di attivare i pagamenti: onboarding Connect e aggiornamenti verificati delle capacità; checkout autenticato con prezzo server/idempotenza e scadenza coordinata al blocco inventario; webhook firmati, importo/valuta/ordine verificati e deduplicati; conferma solo da pagamento riuscito (mai dal ritorno browser); gestione incassi tardivi dopo scadenza senza sovraprenotazioni; trasferimenti idempotenti e riconciliazione, costi del gestore, rimborsi parziali/totali e reversals, contestazioni e blocco trasferimenti. Definire con il proprietario tempistiche di accredito, annullamenti e trattamento fiscale; aggiornare termini/privacy e verificare in ambiente test prima di abilitare i flag. L’attuale incarico autorizza la predisposizione, non questi passaggi futuri.

## Verifiche

- `node scripts/test-organizer-db.cjs --with-migration`: migrazione + prove SQL reali in una sola transazione annullata. Senza flag: verifica installazione corrente. Fixture con account esistenti, senza creare utenti, inviare email o addebitare carte. Prova autorizzazioni/proprietà, doppia revisione, profili sospesi, revisioni obsolete, geografia, privacy pubblica, modifiche da riapprovare, pagamenti disattivati e, solo nel ROLLBACK, blocchi posti/idempotenza/quote.
- `scripts/test-organizer-events.cjs`: interfaccia reale con backend simulato, browser desktop e mobile, flusso profilo/evento/posteggi/admin/calendario/pagina pubblica, errori e isolamento. Le simulazioni browser non sostituiscono i controlli SQL.

Database applicato e verificato il 18/10; API pubbliche rispondono 200 e quelle gestionali senza autenticazione 401. Prima/dopo: 113 profili, 128 annunci, 19 pagamenti Vetrina invariati; zero organizzatori/eventi/prenotazioni creati davvero, flag prenotazioni false. Tutte le fixture SQL annullate. Prove e schermate in `Documents/verifica-organizzatori-20261018/`.

Flusso completo passato in Chromium1440/320×568 e WebKit390: accesso, richiesta/approvazione profilo, evento/posteggi, invio e revisione admin, calendario/pagina pubblica/sitemap, XSS, modifiche da riapprovare, 404/503, errori/riprova, ritiro e isolamento account. Corretti il ripristino asincrono del comune e il falso stato di modifiche non salvate in WebKit. Schermate senza overflow. Regressioni: calendario cinque formati/browser; 4.554 pagine e 1.864 voci sitemap, tre casi browser; pannello admin sei casi (Chromium/WebKit1440/390/320), Vetrina/prezzi/Stripe simulati, statistiche e qualità dati passate. Prima esecuzione pagine fermata per variabile PLAYWRIGHT_MODULE mancante, ripresa con il modulo già installato.

Pubblicazione iniziale `b63ca32`; il controllo online ha rilevato che `auth.getUser()` senza sessione restituisce `AuthSessionMissingError`: ora apre correttamente il percorso Accedi/Registrati. Correttivo pubblicato `7984e1a`, cache `organizzatori.js?v=2`, Vercel **READY** `dpl_EaHy6LQm835h6QJzdMAuTJnUYq5p`. Otto pagine/asset online identici byte per byte al commit. Area organizzatore, modulo di accesso standard, assenza popup venditore e calendario/RPC reali verificati online in Chromium1440/320×568 e WebKit390, senza scritture né errori JS. `/evento` e UUID non pubblico rispondono 404 con `no-store`; sitemap200. Il rendering200 di un evento e la revisione completa sono provati con backend browser simulato e SQL reale in ROLLBACK: non è stato pubblicato un evento fittizio sul sito.

Riscontri: `online-assets-final.json`, `online-browser.json`, `database-applied.json`, `database-result.json`, `verifiche-locali.json` e schermate nella cartella prove. Originali dei primi tentativi conservati. Nessun account/email/annuncio/addebito di prova reale, nessuna comunicazione a terzi. L’ultimo aggiornamento concorrente del blog `cec497e` è incluso nella base e preservato. File estranei al task esclusi dai commit; backup preventivi remoti validi e scansioni segreti superate. Pagamenti eventi **ancora disattivati**, integrazione operativa da completare nella fase futura descritta sopra.


## Ridisegno statistiche e rimozione riepilogo admin — 22 ottobre 2026

Richiesta esplicita: rimuovere dalla dashboard amministratore «Il sito sotto controllo» e rendere più grafiche le statistiche degli organizzatori, seguendo `C:/Users/utente/Desktop/Skill/taste-skill`. Tolti markup, dialog dedicato, CSS, script e chiamata di avvio del riepilogo: nessun aggiornamento automatico ogni minuto. Restano moderazione, numeri admin, provenienza utenti e gestione fiere nei loro pannelli. Gli endpoint e i controlli server esistenti restano disponibili; nessun dato storico eliminato.

Direzione `True-black flat`, seed **546030239**, con Jakarta locale conservato e azzurro Subingresso sui dati al posto del lime. Domanda: «Quali eventi ricevono interesse e hanno ancora posti?». Firma: ogni quadrato rappresenta un posteggio, fino a 80 posti; oltre quella soglia la barra resta proporzionale, con conteggi esatti. Non è una piantina fisica. Capienza = assegnazioni esterne + confermati online + blocchi di pagamento + liberi; tutte le viste usano la risposta server corrente. Eventi conclusi, bozze e profili non approvati non entrano nella capienza attiva. Nessun ricavo stimato.

Riepilogo in una sola fascia, numeri tabulari, grafico ridisegnato alla larghezza effettiva con tacche intere, tabella che diventa lista su telefono. Filtri, confronto, storico mancante, agenda e CSV restano. L'aggiornamento conserva la vista precedente mentre attende, disabilita l'esportazione e non riapplica risposte superate; logout svuota grafici e contenuto. Caricamento iniziale statico, senza animazioni decorative. Profilo sempre diretto e più compatto su computer; tema nero/grigio limitato alla pagina organizzatore. Cache `organizer-analytics.js?v=3`, CSS2, nuovo adattatore `organizer-charts.js?v=1` dal helper SVG della skill, con distruzione degli osservatori al cambio vista.

Un tentativo di ridisegno della composizione analytics, motivato dall'assenza di un obiettivo cumulativo misurabile, ha restituito lo stesso modello. Il grafico mantiene quindi l'andamento giornaliero previsto dalle regole condivise della skill: nessuna cumulata senza soglia utile. Il sito conserva la navigazione e il logo testuale richiesti dall'utente. La verifica sorgente della skill passa senza avvisi; l'ispettore reale a 1440/768/390 dà zero errori e un avviso accettato: alcuni pannelli iniziano sotto la prima schermata, perché il profilo completo e le statistiche condividono la pagina. Non vengono nascosti dati per far rientrare artificialmente l'intera area in un solo schermo.

Prove locali: statistiche Chromium1440/768/320 e WebKit390, conteggi, grafico responsive, filtri/UTC, storico parziale, errore/riprova, risposta tardiva, CSV con formule neutralizzate, zero attività, 1.000 posti, logout e XSS; flusso eventi completo Chromium1440/320 e WebKit390. Contratto di rimozione admin e sintassi degli script inline passano. Le schermate usano dati isolati di collaudo; in produzione la fonte è la RPC esistente, senza dati dimostrativi da sostituire. Nessun account, evento, email, pagamento o assegnazione reale creato o modificato per le prove.

Checkout isolato `Documents/subingresso-statistiche-fiere-20261022`, riscontri e pubblicazione `Documents/verifica-statistiche-fiere-20261022/risultati.md`. Backup remoto preventivo `backup/session-20261022-005042-admin-statistiche-fiere` verificato; pulizia locale del helper con errore PowerShell già noto. Copia della produzione precedente nel ramo `backup/pre-statistiche-fiere-live-20261022` (34557fb). Modifiche concorrenti conservate fuori dal commit. La verifica online è registrata nella cartella prove dopo il deploy.
