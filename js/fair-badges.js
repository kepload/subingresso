// Explicit catalogue evidence. No keyword-based admission decisions at runtime.
(function (global) {
    'use strict';
    const records = [
    [
        "abruzzo-lanciano-fiera-di-sant-egidio",
        "https://www.comune.lanciano.ch.it/ocmultibinary/download/4796/115640/2/600d46372f46295570b36d19e276f96f.pdf/file/2_AVVISO%2Bfiere%2B2026_signed.pdf",
        "Edizione del 31 agosto 2026 documentata dal Comune. Domanda entro il 30 giugno 2026, termine scaduto, tramite PEC, raccomandata o URP, in bollo da 16 € salvo esenzioni. Ammessi ambulanti abilitati, artigiani iscritti all’Albo, hobbisti con tesserino e associazioni senza fini di lucro; vendita riservata ai prodotti elencati nell’informativa. Canone unico e quota organizzativa separati dal bollo; esenzione della sola quota forfettaria per hobbisti e terzo settore. La delibera 275/2026 ha successivamente rimodulato le quote: importi non recuperati, nessun prezzo totale dedotto. I 171 posteggi del piano non misurano i posti disponibili.",
        {
            "hobby": true
        }
    ],
    [
        "abruzzo-popoli-fiera-dell-immacolata-concezione",
        "https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817",
        "Avviso originale 2026 di Popoli Terme: 91 posteggi NON alimentari, graduatoria con anzianità e prelazione degli esercizi nelle aree della fiera. Domanda entro 16 novembre 2026 con bollo 16 €, carta di esercizio e attestazione annuale; CUP da pagare dopo assegnazione entro 30 novembre, importo individuale non pubblicato. Non è prevista la spunta il giorno della fiera. Le 91 posizioni sono l’organico, non posti attualmente liberi. Ingresso operatori 7:00–8:00; uscita non prima delle 14:00.",
        {
            "window": {
                "knownFrom": "2026-10-25",
                "deadline": "2026-11-16",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "abruzzo-sulmona-caccia-all-affare-mercatino-vintage",
        "https://www.mercatiniantiquari.com/cacciaallaffaresulmona.html",
        "L’organizzatore ammette commercianti e hobbisti con tesserino della Regione Abruzzo per antiquariato, collezionismo e vintage. Domanda attraverso il sito dell’organizzatore; ingresso libero del pubblico distinto da costo e assegnazione dello spazio.",
        {
            "hobby": true
        }
    ],
    [
        "calabria-catanzaro-mercatino-degli-hobbisti",
        "https://www.comune.catanzaro.it/novita/mercati-tematici-in-piazza-prefettura-al-via-domenica-31-maggio-con-gli-hobbisti/",
        "Riservato agli hobbisti iscritti al registro comunale; avviso riaperto fino al 26 giugno 2026, termine trascorso. Non estendere la singola data d’avvio a tutte le domeniche.",
        {
            "hobby": true
        }
    ],
    [
        "campania-montefalcione-i-mercatini-di-tok-tok-giugno",
        "https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/",
        "Invito diretto dell’organizzatore ad artigiani, artisti e hobbisti; nessun prezzo, scadenza specifica del singolo mercatino o posto libero verificato. Il termine generale30giugno della community non è scadenza per tutti gli eventi. Partecipazione soggetta a condizioni da concordare.",
        {
            "hobby": true
        }
    ],
    [
        "campania-montefalcione-i-mercatini-di-tok-tok-luglio",
        "https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/",
        "Invito diretto dell’organizzatore ad artigiani, artisti e hobbisti; nessun prezzo, scadenza specifica del singolo mercatino o posto libero verificato. Il termine generale30giugno della community non è scadenza per tutti gli eventi. Partecipazione soggetta a condizioni da concordare.",
        {
            "hobby": true
        }
    ],
    [
        "campania-montefalcione-le-favole-del-natale-mercatini-di-natale",
        "https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/",
        "Invito diretto dell’organizzatore ad artigiani, artisti e hobbisti; nessun prezzo, scadenza specifica del singolo mercatino o posto libero verificato. Il termine generale30giugno della community non è scadenza per tutti gli eventi. Partecipazione soggetta a condizioni da concordare.",
        {
            "hobby": true
        }
    ],
    [
        "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-cortile-di-santa-chiara",
        "https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf",
        "Calendario delle assegnazioni SUAP 2026 a diverse associazioni, aggregate per luogo senza moltiplicare la stessa manifestazione. Riservato a hobbisti e operatori del proprio ingegno non professionisti: non è una concessione generale per ambulanti. Resta necessario il titolo della Municipalità e l’adesione al soggetto assegnatario; possibili sospensioni per fiere comunali e lavori. Costi del singolo banco non pubblicati.",
        {
            "hobby": true
        }
    ],
    [
        "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-carita-lato-monumento",
        "https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf",
        "Calendario delle assegnazioni SUAP 2026 a diverse associazioni, aggregate per luogo senza moltiplicare la stessa manifestazione. Riservato a hobbisti e operatori del proprio ingegno non professionisti: non è una concessione generale per ambulanti. Resta necessario il titolo della Municipalità e l’adesione al soggetto assegnatario; possibili sospensioni per fiere comunali e lavori. Costi del singolo banco non pubblicati.",
        {
            "hobby": true
        }
    ],
    [
        "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-miraglia",
        "https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf",
        "Calendario delle assegnazioni SUAP 2026 a diverse associazioni, aggregate per luogo senza moltiplicare la stessa manifestazione. Riservato a hobbisti e operatori del proprio ingegno non professionisti: non è una concessione generale per ambulanti. Resta necessario il titolo della Municipalità e l’adesione al soggetto assegnatario; possibili sospensioni per fiere comunali e lavori. Costi del singolo banco non pubblicati.",
        {
            "hobby": true
        }
    ],
    [
        "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-baracca",
        "https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf",
        "Calendario delle assegnazioni SUAP 2026 a diverse associazioni, aggregate per luogo senza moltiplicare la stessa manifestazione. Riservato a hobbisti e operatori del proprio ingegno non professionisti: non è una concessione generale per ambulanti. Resta necessario il titolo della Municipalità e l’adesione al soggetto assegnatario; possibili sospensioni per fiere comunali e lavori. Costi del singolo banco non pubblicati.",
        {
            "hobby": true
        }
    ],
    [
        "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-diaz-e-largo-berlinguer",
        "https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf",
        "Calendario delle assegnazioni SUAP 2026 a diverse associazioni, aggregate per luogo senza moltiplicare la stessa manifestazione. Riservato a hobbisti e operatori del proprio ingegno non professionisti: non è una concessione generale per ambulanti. Resta necessario il titolo della Municipalità e l’adesione al soggetto assegnatario; possibili sospensioni per fiere comunali e lavori. Costi del singolo banco non pubblicati.",
        {
            "hobby": true
        }
    ],
    [
        "campania-salerno-fiera-del-crocifisso",
        "https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf",
        "Quattro venerdì, ore 8–18. Domanda PEC al SUAP entro 15 febbraio 2026 ore 23:59, già scaduta; operatori su aree pubbliche, artigiani, agricoltori e nove posteggi riservati agli hobbisti secondo avviso. Pagamenti/documenti per l’autorizzazione entro 1 marzo. Le graduatorie non attestano posti ancora disponibili.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-bertinoro-mercatino-estivo-degli-hobbisti-sotto-le-stelle",
        "https://www.comune.bertinoro.fc.it/myportal/C_A809/api/content/download?id=67a07740f75468009b468260",
        "Regolamento originale: commercianti autorizzati, hobbisti con tesserino, produttori agricoli e OPI nelle rispettive categorie. Il calendario 7 giugno–30 agosto altrove è 2025, non proiettato. Assegnazione tramite organizzazione, tributi e quote correnti da verificare.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-casola-valsenio-festa-di-primavera-mercatino-artistico",
        "https://proloco-casolavalsenio.blogspot.com/2026/02/festa-di-primavera-e-sfilata-dei-carri.html",
        "Avviso Pro Loco 13 febbraio 2026 e regolamenti originali. OPI opere proprie non seriali; hobbisti con tesserino; professionisti con documenti di vendita. Domanda, regolamento firmato, documento e pagamento anticipato entro 18 aprile, scaduto. 25 aprile ingresso operatori 8–9, apertura 10, permanenza almeno 18; 1 maggio ingresso 16–17, apertura 17.30, permanenza almeno 23. Refusi 3 maggio nel modulo commerciale non sono altre date. Recuperi meteo 26 aprile/2 maggio solo eventuali.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-castelvetro-di-modena-mercatino-di-natale",
        "https://www.visitcastelvetro.it/wp-content/uploads/2025/10/DOMANDA-COMPLETApartecipazione_Natale-P.IVA_-1.pdf",
        "Modulo specifico per alimentari senza somministrazione e categorie varie con P.IVA: domanda via email entro 16 novembre, con documento e foto di prodotti/stand. Tardive solo con spazi residui. Selezione e conferma del Consorzio; saldo entro 23 novembre. Modulo separato per OPI. Attrezzature, allestimento e documentazione tecnica a carico dell’espositore.",
        {
            "window": {
                "knownFrom": "2026-10-14",
                "deadline": "2026-11-16",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "emilia-romagna-fontanellato-mercatino-dell-antiquariato",
        "https://www.comune.fontanellato.pr.it/amministrazione/documenti-e-dati/regolamenti/regolamento-mostra-mercato-mercatino-dellantiquariato/",
        "Ammessi operatori su aree pubbliche del settore e hobbisti in regola. Domanda al SUAP tramite SuapER o PEC; verifica requisiti, regolarità contributiva e quota. Abbigliamento/accessori devono essere databili ad almeno 50 anni, secondo il regolamento.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-gambettola-mostrascambio-auto-moto-d-epoca-e-cose-del-passato",
        "https://www.mostrascambio.org/iscrizioni-mostrascambio/",
        "Letti moduli maggio/settembre 2026: maggio domande 23 marzo–18 aprile, settembre 27 luglio–17 agosto, termini scaduti. Commercianti autorizzati, OPI, hobbisti con tesserino e privati secondo categoria. Precedenza già partecipanti; nuovi secondo spazi per settore e ordine richieste. PDF settembre nel nome dice 2023, nel testo 2026. Spazi nominali 4×3 m non garantiti ovunque.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-parma-remira-market",
        "https://parmawelcome.it/evento/remira-market-2/",
        "Ammessi hobbisti, privati e professionisti; candidatura tramite modulo e conferma dell’organizzatore. Postazione 3×2 m sotto tettoia, vuota; gazebo non ammessi. Saldo dopo conferma.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-rimini-fiera-della-domenica-di-primavera",
        "https://www.comune.rimini.it/system/files/2025-07/CALENDARIO%20ELENCO%20%20FIERE%202026.pdf",
        "Domanda 2027 dal 22 settembre 2026 al 20 gennaio 2027. Quattro posti piante/fiori anche per produttori agricoli, senza mezzi. Domanda separata via PEC sportello.unico@pec.comune.rimini.it con modulo, documento, autorizzazione e ricevuta. Posteggi dichiarati, non disponibilità.",
        {
            "window": {
                "knownFrom": "2026-09-22",
                "deadline": "2027-01-20",
                "years": [
                    2027
                ]
            }
        }
    ],
    [
        "emilia-romagna-rimini-fiera-della-fogheraccia",
        "https://www.comune.rimini.it/system/files/2025-07/CALENDARIO%20ELENCO%20%20FIERE%202026.pdf",
        "Domanda 2027 dal 19 settembre 2026 al 17 gennaio 2027. Termine 2026 trascorso. Domanda separata via PEC sportello.unico@pec.comune.rimini.it con modulo, documento, autorizzazione e ricevuta. Posteggi dichiarati, non disponibilità.",
        {
            "window": {
                "knownFrom": "2026-09-19",
                "deadline": "2027-01-17",
                "years": [
                    2027
                ]
            }
        }
    ],
    [
        "emilia-romagna-rio-saliceto-mercatino-del-passato-arti-e-ingegno",
        "https://www.comune.riosaliceto.re.it/it/eventi/614838",
        "Ammessi autorizzati su area pubblica, venditori di opere dell’ingegno e hobbisti con tesserino previsto dalla normativa regionale. Quote piazzole, domanda e disponibilità al gestore; ingresso gratuito riguarda i visitatori.",
        {
            "hobby": true
        }
    ],
    [
        "emilia-romagna-sassuolo-mercatino-hobbisti-antiquariato-e-vintage",
        "https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/",
        "Ammessi hobbisti con tesserino e commercianti su area pubblica dei settori indicati. Inviare domanda di ammissione a SGP; consultare regolamento. Non estendere a qualunque merceologia.",
        {
            "hobby": true
        }
    ],
    [
        "friuli-venezia-giulia-brugnera-dal-campat-alla-piazza-mercatino-di-maron",
        "https://www.festeggiamentimaron.it/wp-content/uploads/2026/09/Regolamento_Espositori_2026_def.pdf",
        "Solo privati/hobbisti con vendita occasionale di oggetti fatti da loro; vietata mera rivendita. Modulo online più adesione firmata, conferma organizzatore e ordine cronologico fino a capienza. Allestimento entro 7:45, presenza intera giornata; nessun allaccio elettrico fornito.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-18",
                "deadline": "2026-11-15",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "friuli-venezia-giulia-caneva-mercatini-di-natale-di-stevena",
        "https://www.protramontidisotto.it/app/download/12436861294/Una_Montagna_di_Eventi_2026.pdf?t=1785246264",
        "Ammessi come tipologie hobbisti, artigiani, aziende agricole e associazioni nel calendario territoriale; selezione, quote e termine specifici non recuperati. Il mercatino dei bambini dell’11 ottobre è un’altra iniziativa esclusa.",
        {
            "hobby": true
        }
    ],
    [
        "friuli-venezia-giulia-sacile-mercatino-dell-avvento",
        "https://www.prosacile.it/_files/ugd/9fdbf5_1466ba0c751d4960a2fc8683a3ad41c7.pdf",
        "Domanda, foto merci e documento a Pro Sacile entro 28 novembre 2026. Richiesta soggetta ad accettazione e conferma. Non equivale alle casette enogastronomiche aperte per l’intero Natale.",
        {
            "window": {
                "knownFrom": "2026-10-18",
                "deadline": "2026-11-28",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "friuli-venezia-giulia-san-vito-al-tagliamento-magia-di-natale-mercatino",
        "https://www.prosanvito.it/natale/",
        "Richiesta online entro 15 novembre 2026; ammesse categorie hobbista/artigiano/commerciante. Solo spazio e punto corrente forniti: tavolo, gazebo, illuminazione e prolunga propri. Pagamento in loco, richiesta non equivale a posto confermato.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-18",
                "deadline": "2026-11-15",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "friuli-venezia-giulia-trieste-barbacan-produce",
        "https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf",
        "Candidatura tramite modulo online e selezione della giuria. Ammessi produttori diretti con partita IVA e hobbisti; esclusi concept store. Quota 80 euro IVA inclusa per edizione. Spazio 2 × 1,5 m, un solo marchio; tavolo e ombrellone propri, senza elettricità e gazebo. Iscrizioni dicembre dal 30 ottobre all’8 novembre; ottobre chiuso il 20 settembre. Quota non rimborsabile per rinuncia o maltempo.",
        {
            "hobby": true
        }
    ],
    [
        "friuli-venezia-giulia-trieste-mercatino-dell-antiquariato-e-dell-usato",
        "https://www.discover-trieste.it/vivi/trieste-now/mercatino-antiquariato",
        "Commercianti di settore, privati e artisti: domande per il 2027 dal 19 ottobre al 18 novembre 2026 tramite SUO con identità digitale. Sorteggio primo semestre: 20 novembre ore 10. Graduatorie e canone tramite pagoPA. Posteggi non occupati entro le 8:30 possono essere assegnati giornalmente agli interessati presenti, con modulo alla Polizia Locale e plateatico. Verificare categoria e pagamenti pregressi.",
        {
            "window": {
                "knownFrom": "2026-10-19",
                "deadline": "2026-11-18",
                "years": [
                    2027
                ]
            }
        }
    ],
    [
        "lazio-cassino-mercatino-dell-antiquariato-e-del-vintage",
        "https://comune.cassino.fr.it/it-it/vivere-il-comune/eventi/venerdi-1-maggio-con-cassino-in-fiore-2026-e-mercatino-dell-antiquariato-e-del-vintage-125614-1-1baf6962e7ded267c56e5a15b5050a62",
        "Avviso ottobre 2026–2027: 80 moduli 3 × 4 m, massimo 3 adiacenti per operatore. Domanda su modello al protocollo o PEC, istruttoria fino 30 giorni; scadenza 30 novembre 2027. Professionisti e hobbisti con tesserino, questi ultimi massimo 36 giorni/anno. Edizione 18 ottobre 8–20; 20 settembre 2026 espressamente sospeso. Le gare per affidare il gestore non sono domande del singolo banco. Disponibilità e condizioni da verificare, nessun posto garantito.",
        {
            "hobby": true
        }
    ],
    [
        "lazio-castel-san-pietro-romano-mercatini-di-natale",
        "https://www.comune.castelsanpietroromano.rm.it/novita/avvisi/novita_491.html",
        "Inviare il modulo allegato via email entro 15 novembre 2026, con recapito email e telefono; oggetto riferito ai mercatini del 13, 20 e 27 dicembre. Comune e Pro Loco selezionano per tipologia nei limiti degli spazi, comunicazione entro 1 dicembre. Casette montate ed energia elettrica fornite; avvio dalle 10:30.",
        {
            "window": {
                "knownFrom": "2026-10-16",
                "deadline": "2026-11-15",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lazio-fabrica-di-roma-mercatino-di-natale",
        "https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html",
        "Piazza Duomo, tre singole giornate. Ammessi prodotti a tema natalizio; gli espositori portano gazebo 3×3 e tavolini. Domanda all’ufficio Cultura entro il 15 novembre 2026; il modello consente di scegliere le giornate e distingue imprese, artigiani e hobbisti. Disponibilità attuale, ammissione del singolo operatore e condizioni non pubblicate devono essere verificate con il gestore; nessun posto è garantito.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-26",
                "deadline": "2026-11-15",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lazio-supino-fiera-delle-quattro-strade",
        "https://comune.supino.fr.it/it/news/bando-per-la-concessione-temporanea-di-suolo-pubblico-per-l-esercizio-del-commercio-su-aree-max-60-psteggi?type=3",
        "Via La Mola, max 60 posteggi del bando: non disponibilità residua. Originale scansito letto: domande entro 10 settembre 2026 ore 23: 59 via PEC, email o protocollo, ordine cronologico; ammessi alimentare, nonalimentare e artigianato hobbistico, esclusi animali vivi. Nessuna quota dedotta dal bando. Disponibilità, ammissione e condizioni dell’edizione da verificare con il Comune o il gestore; nessun posteggio è garantito.",
        {
            "hobby": true
        }
    ],
    [
        "liguria-ameglia-notte-blu",
        "https://www.halleyweb.com/c011001/zf/index.php/atti-amministrativi/delibere/dettaglio/atto/G1WpFeETqTT0-A",
        "Originali comunali: Notte Blu 24 luglio e seconda edizione 21 agosto 2026. Il bando di luglio seleziona due organizzatori per Bocca di Magra e Fiumaretta, non assegna direttamente un banco. Ammessi ambulanti, artigiani e hobbisti/OPI con titolo ligure; gazebo massimo 3 × 3 m. Quota espositori non individuata: nessuna gratuità dedotta dall’assenza di oneri per il Comune.",
        {
            "hobby": true
        }
    ],
    [
        "liguria-campomorone-mercatino-di-natale",
        "https://www.comune.campomorone.ge.it/novita/notizie/novita_239.html",
        "Domande dal 28 settembre al 30 ottobre 2026 per email all’indirizzo indicato nei contatti e nel modulo comunale, oppure consegna all’ufficio, con il modulo corretto. Ammessi hobbisti/OPI, produttori agricoli, artigiani e titolari di autorizzazione secondo le dichiarazioni del modulo; per gli occasionali tesserino o richiesta corredata da bollo e foto. Singoli: ricevuta della quota obbligatoria allegata; associazioni con modulo distinto. Assegnazione degli spazi comunale, nessun posto garantito.",
        {
            "hobby": true
        }
    ],
    [
        "liguria-la-spezia-mercatini-degli-hobbisti",
        "https://www.istanze.spezianet.it/suap-lp/pubblicazioni/DETERMINA.pdf",
        "Mercati riservati a operatori con tesserino Hobbista rilasciato da un Comune ligure. Date numeriche dei comunicati comunali luglio–dicembre 2026; i nomi dei giorni nel testo contengono refusi (22/7,28/7,22/12), senza cambiare le date numeriche. Sede da controllare nel singolo calendario e possibili variazioni esplicitate dal Comune. Il vecchio avviso gestori 1230 è sostituito dalla determina 1569: non è una candidatura aperta per un banco. Quote espositori non individuate.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-clusone-mercatini-di-natale",
        "https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf",
        "Domanda entro 11 ottobre 2026 a turismoproclusone@gmail.com, con almeno 5 fotografie della merce. Ammessi commercianti, artigiani, hobbisti, associazioni e produttori; priorità locali e prodotti coerenti. Minimo 8 giornate consecutive prima di Natale, 4 dopo Natale salvo deroga organizzativa. Conferma scritta, pagamento e cauzione entro 5 giorni. Disponibilità da confermare.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-desenzano-del-garda-mercatino-dell-antiquariato",
        "https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/",
        "Ammessi operatori con partita IVA e hobbisti. Compilare il modulo dell’organizzatore e dichiarare la merce; esporre soltanto antiquariato o oggetti usati di almeno 40 anni.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-desenzano-del-garda-un-mondo-di-vintage",
        "https://www.antiquariatovintagedesenzano.it/vintage/",
        "Ammessi espositori con partita IVA e hobbisti, selezionati per diversificare la merceologia. Usare il modulo specifico per il vintage; verificare tariffe e requisiti senza applicare quelli della sezione antiquariato.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-imbersago-mercatino-dell-antico",
        "https://prolocoimbersago.it/il-mercatino-dellantico/",
        "Ammessi anche operatori commerciali con autorizzazione, oltre a collezionisti e hobbisti. Beni con almeno 30 anni e categorie vintage previste dal regolamento; merce nuova esclusa salvo eccezioni indicate. Posteggi 5×3 m per autorizzati, 3×3 m per hobbisti. Termine annuale scaduto; per spazi residui il regolamento contempla assegnazione per arrivo con priorità agli operatori commerciali: verifica disponibilità e documenti con la Pro Loco.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-mese-mercatini-di-natale",
        "https://www.comune.mese.so.it/novita/notizie/novita_94.html",
        "Avviso comunale: domenica 29 novembre dalle 9 alle 19; iscrizioni entro il 16 novembre salvo esaurimento posti. L’accensione dell’albero del 28 novembre non è una seconda giornata di mercato. Modulo online indicato dal Comune; quota e categoria da verificare prima della domanda, nessuna iscrizione effettuata.",
        {
            "window": {
                "knownFrom": "2026-10-23",
                "deadline": "2026-11-16",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lombardia-novate-mezzola-mercatini-di-natale",
        "https://www.comune.novatemezzola.so.it/c014046/po/attachment_news.php?id=1291",
        "Regolamento 2026: soltanto 6 dicembre, ore 10–18. Domanda entro il 4 dicembre; artigiani, associazioni, hobbisti e prodotti del territorio Sondrio, Lecco e Alto Lario, con selezione dell’organizzazione. Spazi di circa 3–4 metri lineari, gazebo e tavoli propri; energia solo per illuminazione e prolunga di almeno 20 m. No stufette, forni o altri elettrodomestici. Articolo 13 senza spese espositive; nessuna assegnazione automatica.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-23",
                "deadline": "2026-12-04",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lombardia-pizzighettone-natale-idee-regalo",
        "https://www.pizzighettone.it/manifestazione/990-Natale_Idee_Regalo_Unisciti_a_noi_.php",
        "Iscrizione online dal link nella scheda dell’organizzatore; scegliere da una a quattro giornate. Termine 16 novembre o prima se i posti si esauriscono. Listino 2026 verificato visivamente; sconto sulle quattro giornate. Verificare categoria, assegnazione e servizi inclusi.",
        {
            "window": {
                "knownFrom": "2026-10-14",
                "deadline": "2026-11-16",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lombardia-roccafranca-sagra-del-quaranti-mercatino",
        "https://www.sagradelquaranti.it/area-espositori/",
        "Compilare il modulo mercatino 2026 e inviarlo per email. Sono previste candidature come attività, hobbista o associazione. Ammessa la merce dichiarata ma vietata la somministrazione di alimenti e bevande. Portare gazebo e arredi propri; assegnazione a cura dell’organizzazione.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-secugnago-mercatino-per-l-accensione-dell-albero-di-natale",
        "https://docs.google.com/forms/d/e/1FAIpQLSd2N30GIdD_zE8kbBXI8GGyNa3Io0eQslWwvEOxIFSel-U4vg/viewform",
        "Compila il modulo: selezione per spazi e varietà dei prodotti, risposta entro il 25 novembre. Il modulo conferma 8 dicembre 2026 e termine 20 novembre; prevale sull’avviso con scadenza rimasta al 2025.",
        {
            "window": {
                "knownFrom": "2026-10-10",
                "deadline": "2026-11-20",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lombardia-soresina-sapori-e-colori-d-autunno",
        "https://www.prolocosoresina.it/saporiecoloridautunno/",
        "Moduli distinti per hobbisti e artisti; per stand prodotti tipici scrivere alla Pro Loco. Hobbisti autonomi, concesso solo lo spazio. Il corpo e il titolo attuali specificano 2026 anche se il metadato della pagina è 2025; date 19–21 provinciali sostituite da domenica 20 settembre.",
        {
            "hobby": true
        }
    ],
    [
        "lombardia-uggiate-trevano-mercatino-di-natale-di-uggiate-con-ronago",
        "https://comune.uggiateconronago.co.it/notizie/3659763/mercatino-natale-2026-aperte-adesioni",
        "Modello firmato in PDF via email al protocollo con documento e allegato hobbisti; spazi 3×3 m assegnati in ordine di ricezione fino a esaurimento. Attrezzature e corrente a cura del richiedente. Il modulo contempla P.IVA ma la dichiarazione n.1 menziona solo occasionali/associazioni: verificare la propria categoria. Autorizzazioni necessarie a carico dell’operatore. 50 postazioni dichiarate, non posti ancora liberi.",
        {
            "window": {
                "knownFrom": "2026-10-14",
                "deadline": "2026-11-27",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "lombardia-vigano-fiera-di-santa-apollonia",
        "https://www.comune.vigano.lc.it/Novita/Notizie/BANDO-PUBBLICO-PER-L-ASSEGNAZIONE-DEI-POSTEGGI-FIERA-DI-S.-APOLLONIA-ANNI-2027-2028-2029",
        "Bando per 52 posteggi, alimentari e non alimentari, 8×4 m. Domanda esclusivamente tramite Impresainungiorno con documenti e dichiarazioni richiesti dal bando. Concessioni 2027–2029; pubblicata la data del 7 febbraio 2027, non quelle 2028/2029. Posteggi senza elettricità. Per eventuali posti residui/spunta è prevista domanda almeno tre giorni prima: verifica con il Comune.",
        {
            "window": {
                "knownFrom": "2026-10-10",
                "deadline": "2026-12-07",
                "years": [
                    2027,
                    2028,
                    2029
                ]
            }
        }
    ],
    [
        "marche-civitanova-marche-civitanova-vintage-market",
        "https://www.mercatiniantiquari.com/appuntamenti.html",
        "Calendario Brandozzi: 18–19 luglio 2026, commercianti e hobbisti con tesserino Marche per vintage e collezionismo. Il Comune indica area basket retro Teatro Cecchetti; il calendario organizzatore dice genericamente lungomare. Discrepanza conservata, sede esatta da verificare; non duplicato come due eventi.",
        {
            "hobby": true
        }
    ],
    [
        "marche-fermo-tipicita-festival",
        "https://tipicita.citynetgroup.com/tipicita/minisito_espositori.php",
        "Programma ufficiale 2026: 6–8 marzo. Edizione 2027: 12–14 marzo e candidature entro 31 gennaio 2027 dall’annuncio organizzatore. Area espositori con richiesta soggetta a conferma; nessun modulo inviato. Prezzi 2027 distinti dal 2026.",
        {
            "window": {
                "knownFrom": "2026-10-25",
                "deadline": "2027-01-31",
                "years": [
                    2027
                ]
            }
        }
    ],
    [
        "marche-jesi-palio-di-san-floriano-arte-e-mestieri-medievali",
        "https://www.comune.jesi.an.it/documents/20119/1645442/PALIO%2BSAN%2BFLORIANO_MERCATINO%2BMEDIEVALE_AVVISO.pdf/79bc5b2b-0dd3-d093-20fb-2b4009e9a8b0?t=1776353015699",
        "Avviso originale: 20 posteggi per artigiani iscritti, creativi/hobbisti con tesserino e ambulanti. Banco e abbigliamento a tema medievale; nuove domande entro 30 aprile 2026 in bollo da €16, scaduto. Chi aveva già domanda valida segue il percorso di sola comunicazione previsto nell’avviso. Il bollo non è la tariffa stand.",
        {
            "hobby": true
        }
    ],
    [
        "marche-pollenza-fiera-di-primavera",
        "https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=16",
        "Calendario regionale delle fiere su aree pubbliche 2026. Il numero di posteggi indica la consistenza dichiarata, non disponibilità. Per concessione temporanea e spunta valgono i bandi e le graduatorie del Comune/SUAP; costi e termini non pubblicati non sono presunti. Avviso e regolamento pubblicati nel 2025 per la fiera promozionale della Sagra de lu Ciammellottu, stessa località Casette Verdini e data 2 giugno: conservati nella stessa scheda senza duplicazione. Ammessi ambulanti, artigiani, agricoltori, hobbisti e imprese nei limiti del regolamento; aree professionali via Europa/Menichelli e area distinta via Cento. Nessun nuovo bando 2026 recuperato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-dell-immacolata",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-delle-donne",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-san-cristoforo",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-san-giuseppe",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-san-luca",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "marche-urbania-fiera-san-marco",
        "https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf",
        "Usare la domanda comunale fiere 2026: operatori autorizzati, produttori agricoli e hobbisti/creativi con tesserino, documentazione secondo il profilo. Il regolamento comunale pubblicato richiede la domanda per i posteggi liberi almeno 60 giorni prima; la spunta segue regole distinte e non garantisce assegnazione. Le date del modulo 2026 prevalgono sul registro regionale non aggiornato.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-almese-mercatino-di-natale",
        "https://comune.almese.to.it/novita/mercatino-di-natale-2026-aperte-le-iscrizioni/",
        "Modulo online collegato dal Comune (tally.so/r/Ek9WXX). Artigiani, produttori, OPI e associazioni; commercianti con sede in un Comune del Distretto Monte Musinè. Disponibilità confermata dall’organizzatore, annullamento per maltempo. Form letto senza invio: superficie e corrente richieste; mezzi nei parcheggi dedicati, non dietro il banco.",
        {
            "window": {
                "knownFrom": "2026-10-14",
                "deadline": "2026-11-29",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "piemonte-cavour-tuttomele",
        "https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti",
        "Due moduli e regolamenti distinti sul sito Procavour. Bancarelle esterne riservate a P.IVA: candidatura e regolamento firmati via email, scelta organizzatore e pagamento dopo conferma e fattura. Hobbisti con tesserino, opere proprie, massimo 50 spazi dichiarati: termine scaduto, nessuna disponibilità garantita. Expo con pagode a Via Goito gestito separatamente (tuttomele.info). Allestimento bancarelle 7–8, sgombero entro 19; non è l’orario di apertura Expo.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-cortemilia-roba-veja-e-antica",
        "https://www.comune.cortemilia.cn.it/Dettaglionews?IDNews=403074",
        "Disciplinare 2026: 20% delle postazioni riservato a commercianti su area pubblica con autorizzazione e regolarità contributiva; priorità per anzianità CCIAA. Hobbisti con tesserino ed elenco beni. Istanza preferibilmente entro il 7 agosto; assegnazione dalle 7 e allestimento entro le 8. Nessun costo pubblicato nel disciplinare.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-ghemme-natale-nelle-cantine",
        "https://www.noidelcastello.com/natale/",
        "Candidatura firmata con foto dei prodotti e dell’allestimento soltanto via WhatsApp. Ammessi creativi/hobbisti con tesserino, associazioni e commercianti con P.IVA; produzioni proprie, valore massimo 150 €/pezzo. Selezione e conferma prima del pagamento, da eseguire entro 15 giorni dalla conferma e comunque entro il 15 novembre. Cantina obbligatoriamente per tre giorni. Quote non restituite per maltempo, annullamento o rinuncia; ristoro e somministrazione su accordo specifico.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-murisengo-fiera-internazionale-del-tartufo-bianco-trifola-d-or",
        "https://www.fieradeltartufo.net/modulistica-fiera/",
        "Lettere ufficiali 2026, termine 20 agosto già trascorso. Professionisti e hobbisti con moduli e quote distinti, conferma obbligatoria prima di pagare tramite PagoPA. Gazebo bianco e allestimento 6:30–7:30. Hobbisti con tesserino. Bollo 16 € distinto dalla quota; i refusi 2025/2048 negli allegati non sono nuove scadenze. Disponibilità da confermare.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-odalengo-piccolo-fiera-tufo-tartufo",
        "https://www.comune.odalengopiccolo.al.it/Dettaglionews?IDNews=402931",
        "Modulo comunale per commercianti, artigiani, artisti/hobbisti con tesserino e altri espositori autorizzati. Assegnazione a discrezione del comitato; gazebo non forniti. Apertura ore 9. Il 30 settembre è termine delle rinunce, non domanda. Edizione conclusa; costi da avviso 2026.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-portacomaro-fiera-di-san-bartolomeo",
        "https://comune.portacomaro.at.it/Dettaglionews?IDNews=407982",
        "Fiera commerciale il 24 agosto, non tutti i giorni 20–24 del programma regionale della festa. Due moduli comunali distinti per commercianti e hobbisti, da consegnare al Comune o inviare a protocollo@comune.portacomaro.at.it. Hobbisti: tesserino originale, copia richiesta di rilascio ed elenco dei beni, documento e permesso di soggiorno quando previsto. Metratura e permanenza da indicare; nessuna quota o scadenza non pubblicata inventata.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-prato-sesia-mercatino-di-natale",
        "https://www.pratosesia.com/Mercatino/Mercatino2026/Mercatino2026Iscrizioni.htm",
        "Modulo firmato con documento via email o WhatsApp; selezione fino a esaurimento. Ammessi artigiani, hobbisti con tesserino, produttori/commercianti di tipicità, associazioni. Esclusi antiquariato, libri, alimentari occasionali e somministrazione. Accredito Piazza Europa 7:15–8:30: la pagina contiene un refuso «14 dicembre», mentre il modulo conferma il 13. Quote per il banco, distinte dai pasti. Il numero di posteggi del registro è una consistenza, non disponibilità residua.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-15",
                "deadline": "2026-12-11",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "piemonte-roccabruna-fiera-di-valle",
        "https://www.confagricolturacuneo.it/aperte-le-iscrizioni-per-la-xxii-fiera-di-valle-di-roccabruna-in-programma-domenica-4-ottobre-2026/",
        "Ammessi artigiani, commercianti, produttori e hobbisti. Modulo via email ad anagrafe@comune.roccabruna.cn.it. Presenza per l’intera giornata; smontaggio dopo le 19. Termine già trascorso.",
        {
            "hobby": true
        }
    ],
    [
        "piemonte-viu-mostra-mercato-di-san-martino",
        "https://www.comune.viu.to.it/Dettaglionews?IDNews=415085",
        "Moduli distinti 2026 alla Pro Loco. Professionali con P.IVA, dichiarazioni e copia DURC; pagamento all’incaricato al posizionamento. Hobbisti con tesserino, copia domanda di rilascio, elenco beni e documento. Termine assoluto non trovato. Serata danzante del 7 separata dalla mostra mercato dell’8.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-aradeo-sagra-te-lu-pummitoru-schiattarisciatu",
        "https://www.comune.aradeo.le.it/wp-content/uploads/2026/07/AVVISO-PUBBLICO-2026.pdf",
        "Avviso 2026: 31 luglio–2 agosto, ore 19–24 in viale Nicola Frigino; termine 16 luglio ore 18. Area gastronomica riservata alle categorie ed esperienze indicate nell’avviso. Hobbisti con tesserino; esenzione dal canone limitata agli hobbisti, non estesa ai venditori di prodotti locali confezionati. Ammissibilità merceologica e autorizzazione restano necessarie.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-fiera-della-maddalena",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "21 luglio nel bando, data espressamente indicativa. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-fiera-di-san-barsanofrio",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Il programma specifico conferma il 29 agosto, oltre al bando indicativo. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-fiera-di-san-cosimo",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Un mese e due giorni dopo Pasqua: mese maggio, senza giorno calcolato. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-dei-santi-medici",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "26 settembre nel bando, data espressamente indicativa. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-dell-uva",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Prima decade di settembre, non dieci giorni continuativi di sagra. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-della-madonna-della-scala",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Secondo giovedì dopo Pasqua: nessuna data puntuale ricostruita. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-della-madonna-di-gallana",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "14–15 agosto nel bando, espressamente indicativi. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-di-san-barsanofrio",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "29–30 agosto nel bando, espressamente indicativi. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-di-san-cosimo",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Un mese e due giorni dopo Pasqua; distinta dalla fiera diurna. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-di-san-francesco-di-paola",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Seconda metà di aprile, soltanto periodo indicativo. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-di-san-lorenzo",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "10 agosto nel bando, data espressamente indicativa. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-di-sant-antonio",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "12–13 giugno nel bando, espressamente indicativi e non conferma definitiva. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-oria-sagra-ti-la-sasizza",
        "https://comune.oria.br.it/wp-content/uploads/2025/03/Bando-Fiere-2026-Oria.docx",
        "Seconda domenica di ottobre, senza giorno calcolato automaticamente. Bando 2026 originale: date espressamente indicative, da fissare definitivamente per esigenze liturgiche, organizzative e di sicurezza. Istanza unica tramite impresainungiorno.gov.it, con manifestazioni elencate, almeno 30 giorni prima della prima; CUP per ogni evento entro 10 giorni dall’inizio, importo non indicato. Operatori autorizzati, artigiani, creativi e hobbisti con tesserino secondo requisiti; assegnazione per presenze, anzianità e ordine di domanda. SUAP 0831 846515/846514/846535. La scheda non garantisce disponibilità o ammissione. Chiedere a organizzatore e SUAP categorie ammesse, nuova edizione, domanda, autorizzazioni, costi e servizi; ingresso libero per il pubblico non significa banco gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-rutigliano-festa-del-grano-e-fiera-del-fischietto-estiva",
        "https://www.comune.rutigliano.ba.it/novita/manifestazione-di-interesse-per-lassegnazione-di-spazi-espositivi-casette-gazebo-in-occasione-della-manifestazione-30-edizione-festa-del-grano-e-fiera-del-fischietto-edizio/",
        "Vendita 5 luglio 16–01 del 6. Riservata ai figuli, hobbisti e commercianti di terracotta del territorio; termine 18 giugno 18 già scaduto. Comune fornisce struttura e luce, restano CUP/autorizzazioni/allestimento: non interamente gratuito.",
        {
            "hobby": true
        }
    ],
    [
        "puglia-san-ferdinando-di-puglia-fiera-nazionale-del-carciofo-mediterraneo-e-del-prodotto-ortofrutticolo",
        "https://comune.sanferdinandodipuglia.bt.it/novita/fiera-nazionale-del-carciofo-edizione-2026/",
        "Domanda entro 17 novembre 2026, con prodotti/servizi, spazio richiesto e dichiarazione antimafia; pagamento totale tramite PagoPA, sezione Fiere, indicando lo spazio. Assegnazione dell’Ufficio Fiera, non posto garantito. Il modulo conferma 19–22 novembre; non usate le date 8–9, 12–15 o 13–16 dei calendari esterni.",
        {
            "window": {
                "knownFrom": "2026-10-30",
                "deadline": "2026-11-17",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "sardegna-ollolai-autunno-in-barbagia-ollolai",
        "https://comune.ollolai.nu.it/media/acfupload/Avviso_Autunno_in_Barbagia_2026.pdf",
        "Avviso 2026: istanze dal 25 settembre al 25 ottobre, termine scaduto, via PEC in PDF o a mano; hobbisti con tesserino e operatori dell’ingegno con dichiarazione. Priorità ai locali e offerta esterna non concorrenziale. Allegato A 2026: obbligo di apertura entrambe le giornate; ristoro vietato in Piazza Marconi.",
        {
            "hobby": true
        }
    ],
    [
        "sardegna-sanluri-festa-del-borgo-e-sagra-del-civraxu",
        "https://www.comune.sanluri.su.it/novita/il-27-settembre-la-29esima-festa-del-borgo-e-la-sagra-del-civraxu/",
        "Adesioni 2026 entro il 12 settembre alla Pro Loco, con moduli distinti per espositori e hobbisti e per somministrazione. Tariffe e assegnazioni da verificare nel regolamento.",
        {
            "hobby": true
        }
    ],
    [
        "sicilia-chiusa-sclafani-sagra-delle-ciliegie",
        "https://www.comune.chiusasclafani.pa.it/wp-content/uploads/2026/05/Avviso-Sagra-delle-ciliegie-2026.pdf",
        "Avviso 2026: domanda entro 10 giugno ore 14 con documento d’identità al Protocollo o per email/PEC. Ammessi produttori, commercianti, artigiani, hobbisti e associazioni; domande tardive non accolte. Le opzioni con stand comunale non costituiscono promessa di disponibilità attuale. Verifica con l’organizzazione requisiti, costi e disponibilità: la scheda non assegna un posteggio.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-aspettando-natale-a-greve",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-artigiano-di-pasquetta",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-artigiano-festa-del-giaggiolo",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-artigiano-festa-della-schiacciata",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-artigiano-festa-delle-castagne",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-artigiano-festa-di-primavera-di-strada",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-natalizio-di-panzano",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-mercatino-natalizio-di-strada",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-stelle-e-mercanti-di-greve",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-greve-in-chianti-stelle-e-mercanti-di-strada",
        "https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026",
        "Artigiani o hobbisti che realizzano manufatti propri; la pagina richiede tesserino hobbisti. Adesioni all’Ufficio Promozione o associazione indicata; Cittaslow solo artigiani all’opera.",
        {
            "hobby": true
        }
    ],
    [
        "toscana-grosseto-fiera-del-madonnino",
        "https://www.fieradelmadonnino.it/",
        "Edizione 2026 conclusa; prossima edizione 23–25 aprile 2027 confermata dall’organizzatore. Modulo 2027 specifico per ambulanti, piccolo commercio e dimostratori: domanda entro 13 gennaio 2027, saldo entro 5 marzo 2027. Partecipazione subordinata all’accettazione del promotore e al regolamento; allestimento 21–22 e smontaggio 26–27 aprile esclusi dai giorni di vendita. I settori Etruria Vinum e Toscoleum non sono contati come fiere autonome.",
        {
            "window": {
                "knownFrom": "2026-10-24",
                "deadline": "2027-01-13",
                "years": [
                    2027
                ]
            }
        }
    ],
    [
        "trentino-alto-adige-pomarolo-mercatino-di-natale-di-pomarolo",
        "https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf",
        "Imprese commerciali/agricole, hobbisti con tesserino e associazioni ammesse al bando. Domanda con relazione prodotti, documento e cauzione: consegna a mano, raccomandata pervenuta entro il termine oppure dalla PEC del candidato alla PEC comunale. Presenza obbligatoria tutte le date. Selezione per qualità, coerenza natalizia e valorizzazione locale.",
        {
            "hobby": true
        }
    ],
    [
        "umbria-campello-sul-clitunno-fiera-dell-antiquariato-del-rigattiere-e-del-collezionismo-d-arte",
        "https://www.comune.campello.pg.it/servizi/imprese_e_commercio/servizio_41.html",
        "Prima domenica di ogni mese, ricorrenza non convertita automaticamente in giorni 2026; eccezione 12 aprile 2026 esplicita nella pagina evento comunale. Hobbisti con tesserino: richiesta fra il giorno successivo alla fiera e il martedì precedente; prime 50 domande, assegnazione entro venerdì 13. Concessionari confermano entro martedì. Ingresso 6:30–8:30. Posto fisso richiedibile dopo tre presenze consecutive nello stesso banco; due bolli 16€ separati.",
        {
            "hobby": true
        }
    ],
    [
        "umbria-passignano-sul-trasimeno-mercatino-del-pidocchietto",
        "https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html",
        "Comune:12 appuntamenti 2026 espliciti, terza domenica. Massimo 40 soggetti previsti,20 ammessi 2026: né 20 né 40 sono posti oggi liberi. Hobbisti con tesserino, artisti e creativi secondo selezione annuale;8–24 aprile–settembre, fino 21 negli altri mesi. Procedura 2027 distinta, non ammissione 2026.",
        {
            "hobby": true
        }
    ],
    [
        "valle-d-aosta-chatillon-le-petit-marche-du-bourg",
        "https://balteus.lovevda.it/it/banca-dati/2/fiere-e-mercatini/chatillon/le-petit-marche-du-bourg-mercatino-di-natale/21410",
        "Moduli originali 2026 distinti per artigiani/hobbisti, commercianti/agricoltori, street food, associazioni e negozi locali. Domanda almeno 10 giorni prima e conferma organizzatore necessaria. Banchi 10–18, mezzi non possono allontanarsi prima delle 19. Cinque street food è massimo, non disponibilità. Nessun bollo richiesto nei moduli.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-25",
                "deadline": "2026-11-19",
                "years": [
                    2026
                ]
            }
        }
    ],
    [
        "valle-d-aosta-chatillon-sagra-del-miele-e-dei-suoi-derivati",
        "https://balteus.lovevda.it/it/banca-dati/2/eventi-enogastronomici/chatillon/sagra-del-miele/21409",
        "Moduli originali 2026 distinti per artigiani/hobbisti, commercianti/agricoltori, street food, associazioni e negozi locali. Domanda almeno 10 giorni prima e conferma organizzatore necessaria. Banchi 10–18, mezzi non possono allontanarsi prima delle 19. Cinque street food è massimo, non disponibilità. Nessun bollo richiesto nei moduli. Mercato solo 25 ottobre: cena 23 e attività 24 non aggiungono giornate di vendita.",
        {
            "hobby": true
        }
    ],
    [
        "valle-d-aosta-pre-saint-didier-creativa",
        "https://balteus.lovevda.it/it/banca-dati/2/artigianato-fiere-mercatini/pre-saint-didier/creativa-fiera-della-creativita-valdostana-femminile/28797",
        "Fiera del 22 agosto 2026 riservata alle artigiane e hobbiste residenti in Valle d’Aosta secondo la presentazione turistica. Non mercato generalista; avviso di selezione, quota e disponibilità non recuperati.",
        {
            "hobby": true
        }
    ],
    [
        "veneto-colceresa-ciliegia-in-festa-mercatino",
        "https://www.comune.colceresa.vi.it/novita/ciliegia-in-festa-2026-domenica-7-giugno-mercatino/",
        "Domanda PDF via email, non fotografie JPEG. Moduli distinti per hobbisti e per operatori alimentari/imprenditori agricoli; rivenditori non alimentari non indicati. Termine ed edizione conclusi.",
        {
            "hobby": true
        }
    ],
    [
        "veneto-portogruaro-fiera-di-sant-andrea",
        "https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026",
        "Ambulanti e produttori agricoli: modulo C, domanda completa, documenti e pagamento entro il 30 ottobre all’Ufficio Fiera (via C. Valle 40) o per email. Il 22 novembre è riservato alle associazioni e, tramite modulo B, ad hobbisti/artigiani; non è la giornata del modulo C. Selezione dell’organizzatore, regolarità contributiva per ambulanti. Gas generalmente vietato, con eventuali limitate aree da concordare con l’Ufficio Fiera; nessuna disponibilità garantita. Altri referenti: Ufficio Fiera: 378 3066844.",
        {
            "hobby": true
        }
    ],
    [
        "veneto-sarcedo-mercatino-di-natale",
        "https://www.comune.sarcedo.vi.it/wp-content/uploads/2026/09/ALL_A_AVVISO-MANIFESTAZIONE-INTERESSE-MERCATINO-NATALE2026.pdf",
        "Modulo B via PEC sarcedo.vi@cert.ip-veneto.net, email info@comune.sarcedo.vi.it o protocollo. Ammessi commercianti con autorizzazione itinerante tipo B; alimentari con SCIA sanitaria senza sede fissa; hobbisti con opere proprie non alimentari e associazioni. Massimo 3×3 m, ordine cronologico; annullato con pioggia.",
        {
            "hobby": true,
            "window": {
                "knownFrom": "2026-10-13",
                "deadline": "2026-12-03",
                "years": [
                    2026
                ],
                "closesAt": "23:59"
            }
        }
    ],
    [
        "trentino-alto-adige-lavis-fiera-dei-ciucioi",
        "https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf",
        "Area hobbisti separata nel Piazzale delle Scuole Don Grazioli: avviso comunale 2026 per 24 spazi, domande dal 12 ottobre al 2 novembre, termine trascorso; assegnazione in ordine di protocollo e canone di 10 € per il solo spazio hobbisti. La fiera commerciale e la relativa spunta hanno procedure distinte, ancora da confermare, insieme all’ammissione della bigiotteria commerciale. Gli oltre 130 banchi citati nel riepilogo sono un dato da riconfermare, non posti liberi.",
        {
            "hobby": true,
            "hobbyScope": "Solo area hobbisti separata, 24 spazi: domande 2026 chiuse il 2 novembre. Non è un’ammissione alla fiera commerciale.",
            "hobbyEditionKeys": [
                "2026|2026-12-06|2026-12-06"
            ],
            "editions": "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}]",
            "evidenceUrl": "https://comune.lavis.tn.it/it/news/fiera-dei-ciucioi-2025-mercatino-dell-hobbismo?type=3"
        }
    ]
];
    const confirmations = new Map(records.map(([id, sourceUrl, note, facts]) => [id, { sourceUrl, note, ...facts }]));
    // Explicit denials, reviewed per edition; never inferred from missing data.
    const denialRecords = [
    {
        "id": "piemonte-gattinara-fiera-di-san-martino",
        "sourceUrl": "https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044",
        "note": "Fai domanda solo sullo sportello online del Comune con SPID o CIE. Non presentarti alla spunta: serve l’assegnazione prima della fiera.",
        "editions": "[{\"year\":2026,\"start\":\"2026-11-10\",\"end\":\"2026-11-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044\"}]",
        "editionKeys": [
            "2026|2026-11-10|2026-11-10"
        ],
        "kind": "no-spunta",
        "scope": "Fiera del 10 novembre 2026: nessun posteggio in spunta, neppure presentandosi la mattina.",
        "evidenceUrl": "https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044",
        "locator": "Sezione NON SARANNO ASSEGNATI POSTEGGI IN SPUNTA",
        "checkedAt": "2026-11-16",
        "proofKey": "gattinara"
    },
    {
        "id": "piemonte-torino-gran-balon",
        "sourceUrl": "https://www.balon.it/portfolio/gran-balon-ottobre-2026/",
        "note": "Mercato periodico tematico, con requisiti e selezione del soggetto attuatore. Verificare categoria professionale/occasionale ammessa, candidatura, quota e disponibilità. Nessuna concessione o spunta automatica.",
        "editions": "[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.balon.it/portfolio/gran-balon-ottobre-2026/\"}]",
        "editionKeys": [
            "2026|2026-10-11|2026-10-11"
        ],
        "kind": "no-spunta",
        "scope": "Gran Balon, edizione documentata dell'11 ottobre 2026. Il regolamento esclude l'assegnazione dei posti vacanti; prenotazioni e disdette anticipate restano distinte.",
        "evidenceUrl": "https://www.comune.torino.it/media/11811",
        "locator": "Regolamento 284, art. 11 comma 4, pagina PDF 8; versione esecutiva 12 luglio 2026",
        "checkedAt": "2026-11-16",
        "proofKey": "gran-balon"
    },
    {
        "id": "valle-d-aosta-nus-lo-martchia-de-tsalende",
        "sourceUrl": "https://comune.nus.ao.it/wp-content/uploads/2026/10/bando-mostra-mercato-natale-2026.pdf",
        "note": "Decreto 1/2026: 6 dicembre ore 10–18, domanda 9 novembre. Cinquanta postazioni 3 × 3 m sono capienza, non disponibilità; graduatoria cronologica, spunta NON ammessa. Non professionisti con permesso, professionisti e associazioni/scuole per finalità previste; alimentari solo professionisti con registrazione sanitaria. Domanda e autorizzazione in bollo, importi non specificati nel decreto.",
        "editions": "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.nus.ao.it/wp-content/uploads/2026/10/bando-mostra-mercato-natale-2026.pdf\"}]",
        "editionKeys": [
            "2026|2026-12-06|2026-12-06"
        ],
        "kind": "no-spunta",
        "scope": "Mostra mercato del 6 dicembre 2026: la spunta non e ammessa.",
        "evidenceUrl": "https://comune.nus.ao.it/wp-content/uploads/2026/10/bando-mostra-mercato-natale-2026.pdf",
        "locator": "Decreto 1/2026, pagina 2, punto 3",
        "checkedAt": "2026-11-16",
        "proofKey": "nus"
    },
    {
        "id": "abruzzo-popoli-fiera-dell-immacolata-concezione",
        "sourceUrl": "https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817",
        "note": "Avviso originale 2026 di Popoli Terme: 91 posteggi NON alimentari, graduatoria con anzianità e prelazione degli esercizi nelle aree della fiera. Domanda entro 16 novembre 2026 con bollo 16 €, carta di esercizio e attestazione annuale; CUP da pagare dopo assegnazione entro 30 novembre, importo individuale non pubblicato. Non è prevista la spunta il giorno della fiera. Le 91 posizioni sono l’organico, non posti attualmente liberi. Ingresso operatori 7:00–8:00; uscita non prima delle 14:00.",
        "editions": "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817\"}]",
        "editionKeys": [
            "2026|2026-12-08|2026-12-08"
        ],
        "kind": "no-spunta",
        "scope": "Fiera dell'Immacolata dell'8 dicembre 2026: non e prevista la spunta il giorno della fiera.",
        "evidenceUrl": "https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817",
        "locator": "Avviso 2026, pagina 1, punto 10",
        "checkedAt": "2026-11-16",
        "proofKey": "popoli"
    },
    {
        "id": "toscana-san-gimignano-fiera-di-sant-agostino",
        "sourceUrl": "https://www.comune.sangimignano.si.it/it/news/132950/divieto-di-presenza-degli-operatori-commerciali-non-assegnatari-fissi-alla-fiera-di-santagostino-del-29-agosto",
        "note": "Fiera comunale documentata per il 2026. L’assegnazione di concessioni è distinta dall’accesso occasionale e dalle variazioni del mercato settimanale; costo non quantificato nella fonte. Nell’edizione del 29 agosto è espressamente vietata la partecipazione degli spuntisti e l’assegnazione a spunta per concomitanza con Festival SANGIN.",
        "editions": "[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sangimignano.si.it/it/news/132950/divieto-di-presenza-degli-operatori-commerciali-non-assegnatari-fissi-alla-fiera-di-santagostino-del-29-agosto\"}]",
        "editionKeys": [
            "2026|2026-08-29|2026-08-29"
        ],
        "kind": "no-spunta",
        "scope": "Solo Fiera di Sant'Agostino del 29 agosto 2026: vietate la partecipazione degli spuntisti e l'assegnazione a spunta.",
        "evidenceUrl": "https://www.comune.sangimignano.si.it/it/news/132950/divieto-di-presenza-degli-operatori-commerciali-non-assegnatari-fissi-alla-fiera-di-santagostino-del-29-agosto",
        "locator": "Avviso del 21 agosto 2026, descrizione, delibera 163/2026",
        "checkedAt": "2026-11-16",
        "proofKey": "san-gimignano"
    },
    {
        "id": "lombardia-azzate-mostra-dell-usaa",
        "sourceUrl": "https://www.proazzate.org/news.php?n=74",
        "note": "Riservata esclusivamente a privati: esclusi professionisti, antiquari e hobbisti. Abbigliamento/scarpe/borse massimo 25% dello spazio. Pagamento espositori in contanti all’ingresso, importo da chiedere. Telefono solo lun–ven della settimana precedente, 17:30–18:30, senza WhatsApp.",
        "editions": "[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105073/fvw_calendario_eventi-marzo-2026.pdf\"},{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105121/fvw_calendario_eventi-aprile-2026.pdf\"},{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105241/fvw_calendario_eventi-maggio-2026.pdf\"},{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.proazzate.org/news.php?n=74\"}]",
        "editionKeys": [
            "2026|2026-10-25|2026-10-25"
        ],
        "kind": "no-hobby",
        "scope": "Solo Mostra dell'Usaa del 25 ottobre 2026: l'organizzatore esclude gli hobbisti; ammessi privati secondo il regolamento.",
        "evidenceUrl": "https://www.proazzate.org/news.php?n=74",
        "locator": "Notizia del 28 settembre 2026, paragrafo La manifestazione e solo ed esclusivamente per PRIVATI",
        "checkedAt": "2026-11-16",
        "proofKey": "azzate"
    },
    {
        "id": "valle-d-aosta-fenis-castello-in-fiera",
        "sourceUrl": "https://www.acoteduchateau.com/area-espositori",
        "note": "Area espositori 2026: professionisti e artigiani iscritti all’Albo valdostano, hobbisti esclusi. Adesione entro 28 febbraio ore 12, selezione 12 marzo, pagamento 1–5 aprile: termini scaduti. Gazebo 3 × 3 m, tavolo/juta, illuminazione e sorveglianza inclusi; bevande riservate all’organizzatore.",
        "editions": "[{\"year\":2026,\"start\":\"2026-04-11\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.acoteduchateau.com/area-espositori\"}]",
        "editionKeys": [
            "2026|2026-04-11|2026-04-12"
        ],
        "kind": "no-hobby",
        "scope": "Castello in Fiera, 11-12 aprile 2026: hobbisti non ammessi.",
        "evidenceUrl": "https://www.acoteduchateau.com/area-espositori",
        "locator": "Area espositori 2026, Chi puo partecipare",
        "checkedAt": "2026-11-16",
        "proofKey": "fenis"
    },
    {
        "id": "trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico",
        "sourceUrl": "https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/",
        "note": "Modulo espositori 2026: partita IVA obbligatoria; hobbisti e operatori del proprio ingegno esclusi. Candidabili anche commercianti, con assortimento dettagliato sottoposto a selezione: la bigiotteria commerciale non è automaticamente ammessa. Domanda ordinaria entro il 31 maggio 2026, termine trascorso; costi, disponibilità e possibili candidature tardive da chiedere all’organizzatore.",
        "editions": "[{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-11-27\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-04\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-11\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-18\",\"end\":\"2026-12-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2027-01-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"}]",
        "editionKeys": [
            "2026|2026-11-21|2026-11-22",
            "2026|2026-11-27|2026-11-29",
            "2026|2026-12-04|2026-12-08",
            "2026|2026-12-11|2026-12-13",
            "2026|2026-12-18|2026-12-24",
            "2026|2026-12-26|2027-01-06"
        ],
        "kind": "no-hobby",
        "scope": "Mercatino Asburgico 2026/2027: hobbisti e operatori del proprio ingegno esclusi; partita IVA obbligatoria. Commercianti soggetti a selezione.",
        "evidenceUrl": "https://visitlevicoterme.it/wp-content/uploads/2026/03/RICHIESTA-PARTECIPAZIONE-web-Mercatino-di-Natale-2026.pdf",
        "locator": "Modulo espositori 2026, pagina 1, nota alla partita IVA",
        "checkedAt": "2026-11-18",
        "proofKey": "levico-2026"
    }
];
    const denials = new Map(denialRecords.map(record => [record.id, record]));
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    function get(event, { now = new Date(), edition = null } = {}) {
        if (!event || event.managedEventId) return [];
        const confirmation = confirmations.get(event.id);
        const denial = denials.get(event.id);
        const matches = record => record && record.sourceUrl === event.source?.url && record.note === event.participation?.note;
        const badges = [];
        if (matches(denial) && edition && denial.editions === JSON.stringify(event.editions) && denial.editionKeys.includes([edition.year, edition.start, edition.end].join('|'))) {
            badges.push({ kind: denial.kind, label: denial.kind === 'no-spunta' ? 'No spunte' : 'No hobbisti', title: denial.scope, sourceUrl: denial.evidenceUrl });
        }
        if (!matches(confirmation)) return badges;
        const hobbyEditionMatches = !confirmation.hobbyEditionKeys || (edition
            && confirmation.editions === JSON.stringify(event.editions)
            && confirmation.hobbyEditionKeys.includes([edition.year, edition.start, edition.end].join('|')));
        if (confirmation.hobby && hobbyEditionMatches && !badges.some(badge => badge.kind === 'no-hobby')) badges.push({ kind: 'hobby', label: 'Hobbisti ammessi', title: confirmation.hobbyScope || 'Hobbisti previsti nelle modalità di partecipazione. Requisiti, tesserino e prodotti ammessi nella scheda.' });
        const window = confirmation.window;
        if (!window || event.participation.deadline !== window.deadline || !edition || !window.years.includes(edition.year)) return badges;
        const instant = new Date(now);
        if (!Number.isFinite(instant.getTime())) return badges;
        const parts = Object.fromEntries(formatter.formatToParts(instant).map(part => [part.type, part.value]));
        const today = parts.year + '-' + parts.month + '-' + parts.day;
        const time = parts.hour + ':' + parts.minute;
        // Without a published closing hour, stop at the beginning of deadline day.
        if (today < window.knownFrom || today > window.deadline || (today === window.deadline && (!window.closesAt || time >= window.closesAt))) return badges;
        const days = (Date.parse(window.deadline + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000;
        const closing = days <= 7;
        const deadline = window.deadline.split('-').reverse().join('/');
        badges.unshift({ kind: closing ? 'closing' : 'open', label: closing ? 'In scadenza' : 'Iscrizioni aperte', title: 'Domande ' + window.years.join('–') + ' · termine ' + deadline + (window.closesAt ? ' ore ' + window.closesAt : '') + '. Assegnazione soggetta ai requisiti e alla conferma previsti nella scheda.' });
        return badges;
    }
    const api = { get };
    global.FairBadges = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
