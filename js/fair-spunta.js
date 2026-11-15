// Explicit confirmations reviewed against the existing catalogue on 15 November 2026.
// Match the exact source and participation note: changed evidence hides the badge.
(function (global) {
    'use strict';
    const records = [
    [
        "abruzzo-fara-san-martino-feste-patronali-posteggi-commerciali",
        "https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti",
        "La pagina comunale Commercio indica le fiere del 29 giugno e 11 novembre e le feste patronali 24–26 agosto. Dal 1° gennaio 2026 sono soppresse le istanze cartacee: domande e spuntisti tramite istanza online, bollo con PagoRA. Importo totale, scadenza specifica, graduatorie e disponibilità dei posteggi non recuperati. Le date derivano dalla ricorrenza del servizio comunale, senza programma operativo annuale aggiuntivo."
    ],
    [
        "abruzzo-fara-san-martino-fiera-di-san-martino",
        "https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti",
        "La pagina comunale Commercio indica le fiere del 29 giugno e 11 novembre e le feste patronali 24–26 agosto. Dal 1° gennaio 2026 sono soppresse le istanze cartacee: domande e spuntisti tramite istanza online, bollo con PagoRA. Importo totale, scadenza specifica, graduatorie e disponibilità dei posteggi non recuperati. Le date derivano dalla ricorrenza del servizio comunale, senza programma operativo annuale aggiuntivo."
    ],
    [
        "abruzzo-fara-san-martino-fiera-tradizionale-del-29-giugno",
        "https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti",
        "La pagina comunale Commercio indica le fiere del 29 giugno e 11 novembre e le feste patronali 24–26 agosto. Dal 1° gennaio 2026 sono soppresse le istanze cartacee: domande e spuntisti tramite istanza online, bollo con PagoRA. Importo totale, scadenza specifica, graduatorie e disponibilità dei posteggi non recuperati. Le date derivano dalla ricorrenza del servizio comunale, senza programma operativo annuale aggiuntivo."
    ],
    [
        "calabria-castrovillari-fiera-delle-stagioni",
        "https://comune.castrovillari.cs.it/notizie/3646223/bando-pubblico-assegnazione-posteggi-fiera",
        "Gli avvisi 2026 indicano graduatoria, pagamento PagoPA e accesso degli spuntisti dalle ore 7 per i posti residui nelle date documentate. Non costituiscono disponibilità per altre giornate."
    ],
    [
        "emilia-romagna-cento-fiera-di-san-biagio",
        "https://www.comune.cento.fe.it/it/eventi/fiera-di-san-biagio-edizione-2025",
        "Fiera comunale il 3 febbraio. La pagina cita graduatorie degli spuntisti approvate con determinazione 82/2026. Gli orari della viabilità non sono orari di vendita; alcuni passaggi di montaggio conservano il 2025 e non vengono riutilizzati. Quota e posti residui non accertati."
    ],
    [
        "emilia-romagna-cervia-mercato-straordinario-cervia-mare",
        "https://www.comune.cervia.ra.it/it/page/mercati-straordinari-anno-2025",
        "Calendario 2026 malgrado slug 2025. Ingresso/uscita operatori non sono orari vendita. Cervia Mare 1 maggio spunta dalle 17.30. Eventuali posti vacanti e requisiti da verificare, nessuna disponibilità garantita."
    ],
    [
        "emilia-romagna-cesena-fiera-d-autunno",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati."
    ],
    [
        "emilia-romagna-cesena-fiera-di-natale",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati."
    ],
    [
        "emilia-romagna-cesena-fiera-di-primavera",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati."
    ],
    [
        "emilia-romagna-cesena-fiera-di-san-giovanni",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati. Cesena in Fiera/San Giovanni: giorni commerciali 20–24 giugno, fino alle 24; stand dell’organizzazione distinti dalle assegnazioni ambulanti."
    ],
    [
        "emilia-romagna-cesena-mercato-straordinario-d-ottobre",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati."
    ],
    [
        "emilia-romagna-cesena-sagra-del-monte",
        "https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/",
        "Calendario comunale 2026. Ambulanti autorizzati: ammissione, graduatoria e spunta presso SUAP. Ticket spuntisti anticipato allo Sportello Facile dopo pagamento, non garanzia di assegnazione. Servizio: https://www.comune.cesena.fc.it/servizio/acquisto-ticket-per-gli-spuntisti-nei-mercati-e-fiere-del-comune-di-cesena/ . Termine specifico 2026 e disponibilità residua non documentati."
    ],
    [
        "emilia-romagna-ferrara-fiera-cose-d-altri-tempi-oggetti-da-collezione-e-dell-artigianato",
        "https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Numero posteggi del piano/repertorio, non disponibilità attuale."
    ],
    [
        "emilia-romagna-ferrara-fiera-dei-buskers-i",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Piano 2024: quattro giornate, dodici posteggi e mantenimento soggetto a rivalutazione per i lavori. Non proiettata la durata del festival sui banchi."
    ],
    [
        "emilia-romagna-ferrara-fiera-dei-buskers-ii",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Piano 2024: un posteggio nella settimana del festival e mantenimento soggetto a rivalutazione. Nessuna disponibilità 2026 accertata."
    ],
    [
        "emilia-romagna-ferrara-fiera-dell-artigianato-artistico",
        "https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686",
        "Fiera tematica: autorizzazione al commercio su area pubblica e iscrizione artigiana; prodotti artistici e tradizionali, banco conforme e verifica del gestore. La spunta richiede documentazione dei prodotti. Deroga massima di quattro posteggi per imprese con produzione propria alimentare/artigianale prevista nel piano: non ammissione alimentare generalizzata. Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Le giornate aggiuntive di aprile sono quelle del calendario comunale 2026, anche se la ricorrenza generale del piano è mensile. Numero posteggi del piano/repertorio, non disponibilità attuale."
    ],
    [
        "emilia-romagna-ferrara-fiera-delle-gare-del-palio",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Piano 2024: un posteggio nella giornata delle gare, soggetto a rivalutazione. Data commerciale 2026 non confermata."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-dicembre",
        "https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=038008&progr_fiera=22",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Numero posteggi del piano/repertorio, non disponibilità attuale."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-quartesana",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Piano 2024: terza settimana di luglio e quattro posteggi. Il repertorio regionale 2026 segnala inizio 15 luglio; termine e singoli giorni non accertati."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-san-biagio",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Ricorrenza del piano 2024: 3 febbraio; non è una conferma dell’edizione 2026. Quattro posteggi di piano, non posti disponibili."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-san-giorgio",
        "https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Banchi 23–26 aprile; il luna park 2 aprile–3 maggio è separato. Il comunicato comunale consultato via ricerca web indica 120 espositori; i numeri amministrativi delle fonti precedenti differiscono. Nessuna disponibilità dedotta dai conteggi."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-san-giorgio-lunga",
        "https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Piano 2024: nove posteggi, normalmente festivi e prefestivi e separati dalla fiera ordinaria. Non si pubblica l’intero periodo come vendita quotidiana."
    ],
    [
        "emilia-romagna-ferrara-fiera-di-santa-teresa",
        "https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=038008&progr_fiera=15",
        "Operatori autorizzati al commercio su aree pubbliche: comunicazione per la spunta; per la graduatoria fiere con priorità la pagina comunale richiede domanda almeno 60 giorni prima. L’assegnazione dipende da graduatoria, merceologia e posti effettivamente liberi. Tariffe e disponibilità 2026 non accertate. Il calendario regionale indica soltanto il 18 ottobre; il piano 2024 prevede quattro giornate e due banchi in via Venezia. Ulteriori giornate commerciali 2026 non confermate, senza estendere la data alla durata del luna park. Numero posteggi del piano/repertorio, non disponibilità attuale."
    ],
    [
        "emilia-romagna-ferrara-il-baule-in-piazza-domenica-pontesana",
        "https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686",
        "Modulo originale: privato di beni propri, hobbista con tesserino, ambulante professionale o autore di ingegno con comunicazione al Comune; associazioni con statuto e disciplina specifica. Prenotazione e assegnazione gestore; contributo spese obbligatorio ma importo non pubblicato. Check-in prenotati 7–8:15, senza prenotazione 7:45–8:30, spunta 8:15–8:30; uscita non prima delle 15, sgombero entro 18 salvo eventi speciali. Date dal calendario comunale; requisiti da applicare alla propria categoria."
    ],
    [
        "emilia-romagna-modena-fiera-di-san-geminiano",
        "https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari",
        "Graduatoria provvisoria di spunta 2027 pubblicata dal Comune, determinazione n.1811/2026. Contattare il SUAP per posizione, requisiti e convocazione. Disponibilità e nuove domande non garantite."
    ],
    [
        "emilia-romagna-modena-fiera-di-sant-antonio",
        "https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari",
        "Il Comune ha pubblicato la graduatoria provvisoria di spunta per l’edizione 2027, determinazione n.1811 del 22 luglio 2026. Verificare graduatoria definitiva, requisiti e convocazione; non dedurre nuovi termini o iscrizioni aperte."
    ],
    [
        "emilia-romagna-montecchio-emilia-fiera-di-san-marco",
        "https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=035027&progr_fiera=1",
        "Assegnazione temporanea e spunta secondo graduatoria SUAP; autorizzazione, regolarità contributiva e documentazione GPL dove richiesta. Quote da verificare."
    ],
    [
        "emilia-romagna-pianello-val-tidone-fiera-del-primo-maggio",
        "https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html",
        "Moduli, elenchi autorizzati e spunta preordinata originali 2026. Richiesta anche cumulativa tramite SuapER o PEC con modulo; arrivo 6:30–7:30, montaggio dopo 8:30, niente miglioria. Elenchi e banchi vuoti non sono disponibilità attuale. Quote e disponibilità non confermate, salvo indicazioni specifiche riportate nella scheda."
    ],
    [
        "emilia-romagna-pianello-val-tidone-fiera-di-san-maurizio",
        "https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html",
        "Moduli, elenchi autorizzati e spunta preordinata originali 2026. Richiesta anche cumulativa tramite SuapER o PEC con modulo; arrivo 6:30–7:30, montaggio dopo 8:30, niente miglioria. Elenchi e banchi vuoti non sono disponibilità attuale. Quote e disponibilità non confermate, salvo indicazioni specifiche riportate nella scheda."
    ],
    [
        "emilia-romagna-pianello-val-tidone-grande-fiera-d-agosto",
        "https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html",
        "Moduli, elenchi autorizzati e spunta preordinata originali 2026. Richiesta anche cumulativa tramite SuapER o PEC con modulo; arrivo 6:30–7:30, montaggio dopo 8:30, niente miglioria. Elenchi e banchi vuoti non sono disponibilità attuale. Quote e disponibilità non confermate, salvo indicazioni specifiche riportate nella scheda."
    ],
    [
        "emilia-romagna-polinago-fiera-dello-statuto",
        "https://www.comune.polinago.mo.it/Dettaglionews?IDNews=243403",
        "Spunta alle 8:30 presso Polizia Locale, Corso Roma 71; ritardatari esclusi. Ricevuta del tributo da trasmettere o esibire. Edizione conclusa, non applicare queste condizioni al 2027."
    ],
    [
        "emilia-romagna-sassuolo-fiera-dei-tiramolla",
        "https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/",
        "Domanda spunta tramite Accesso Unitario almeno 30 giorni prima, con autorizzazione al commercio su area pubblica. Ricorrenza dalla pagina comunale; nessuna data futura calcolata."
    ],
    [
        "emilia-romagna-sassuolo-mercato-stagionale-delle-domeniche-di-ottobre",
        "https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/",
        "Spunta riservata a titolari di autorizzazione su area pubblica: richiesta tramite Accesso Unitario almeno 30 giorni prima. Gli spazi espositivi esterni al mercato stagionale seguono una procedura distinta, variabile annualmente. Termini ordinari per le domeniche residue già trascorsi."
    ],
    [
        "emilia-romagna-sogliano-al-rubicone-fiera-del-formaggio-di-fossa",
        "https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/",
        "Domanda con merceologie, foto e dimensioni a segreteria@prolocosogliano.eu entro 15 settembre 2026 (scaduto). Richieste tutte e tre le domeniche, priorità abbonamenti. Spunta alle 08:30 solo su eventuali posti non occupati. Banchi fino alle 20 dal regolamento; le 22 della pagina promozionale non prolungano la vendita."
    ],
    [
        "friuli-venezia-giulia-udine-fiera-di-santa-caterina",
        "https://www.comune.udine.it/content/download/2424/43368/file/regolamento_AP_approvato_da_DC51_2023_-con_numero_determina.pdf",
        "Regolamento 2023: spunta alle 8 del primo giorno, vendita 9–19, presenza per tutte le giornate; vietati generatori. Date 2026 non confermate: calendari secondari discordanti e possibile deroga della Giunta. Verificare avviso specifico presso il SUAP."
    ],
    [
        "lazio-aprilia-fiera-di-san-michele-arcangelo",
        "https://comune.aprilia.lt.it/sites/comune.aprilia.lt.it/files/2026-09/COMUNICATO%20agli%20operatori%20SAN%20MICHELE%202026.pdf",
        "Comunicazione SUAP 2026: titolari delle assegnazioni 2024–2028 sul posto entro le 12 del 26 settembre. Spunta alle 12:30 in Piazza Roma, riservata agli operatori della graduatoria di riserva 2024–2028. Non è accesso libero per nuovi spuntisti. CUP e TARIG sono dovuti negli importi individuali comunicati dagli uffici, non indicati nel comunicato; ricevute e titoli da tenere al banco."
    ],
    [
        "lazio-aprilia-mercatino-dell-usato-dell-artigianato-del-collezionismo-e-dell-hobbistica",
        "https://comune.aprilia.lt.it/servizi/partecipazione-al-mercatino-dellusato-dellartigianato-del-collezionismo-e-dellhobbistica",
        "Servizio comunale attivo: terza domenica del mese, 60 banchi previsti in Piazza Roma e primo tratto di Via dei Lauri; non sono posti residui. Professionisti tramite bando, professionisti spuntisti tramite istanza SUAP, hobbisti tramite Associazione Il Mercatino di Aprilia e titoli richiesti. Il servizio indica 30 giorni per le istanze di spuntisti e hobbisti. La ricorrenza resta testuale: nessun calendario di singole domeniche generato."
    ],
    [
        "lazio-montelibretti-fiera-della-beata-vergine-del-carmine",
        "https://comune.montelibretti.roma.it/wp-content/uploads/2026/09/AVVISO-PUBBLICO-FIERA-11.10.-2026.pdf",
        "56 posteggi previsti. Storici: conferma entro 23 settembre ore 10; nuovi richiedenti entro 29 settembre ore 10, termini scaduti. Moduli distinti, consegna a mano o PEC; spunta sui residui alle 8, ordine di arrivo. Fiera 8–18, allestimento 6–7:30. Autorizzati/SCIA, artigiani, espositori e associazioni secondo avviso; nessun posto garantito."
    ],
    [
        "lazio-montelibretti-fiera-di-san-nicola-da-bari",
        "https://comune.montelibretti.roma.it/wp-content/uploads/2026/03/AVVISO-PUBBLICO-FIERA-MAGGIO-2026_signed.pdf",
        "48 posteggi previsti. Domande entro 24 aprile ore 12 a mano o via PEC, termine scaduto; priorità storici 2025 e poi ordine di protocollo. Spunta sui posti residui alle 8 in ordine di arrivo. Fiera 8–18, allestimento 6–7:30. Autorizzati/SCIA, artigiani, espositori e associazioni secondo avviso; nessun posto garantito."
    ],
    [
        "lazio-prossedi-fiera-di-sant-agata",
        "https://comune.prossedi.lt.it/wp-content/uploads/2026/06/Avviso-SantAgata.pdf",
        "Avviso SUAP per il 5 luglio 2026 in Piazza Umberto I: domanda di spunta entro il 1 luglio via PEC o consegna a Polizia Locale/SUAP. Richiesti titolo per commercio su aree pubbliche o SCIA B, attrezzature e merci, requisiti soggettivi e settore dichiarato. La procedura riguarda gli eventuali posti liberi, non promette assegnazione. Canone, organico e orario di vendita non quantificati nell’avviso."
    ],
    [
        "lazio-sezze-fiera-della-croce",
        "https://www.comune.sezze.lt.it/dam/jcr%3A0f137cd6-8e18-4224-95c5-d515abbb615e/AVVISO%20PUBBLICO%20BANDO%20ALLEGATO%20A.pdf",
        "Bando comunale 2026 per operatori abilitati al commercio su aree pubbliche, alimentari con requisiti sanitari. Il documento dichiara 39 posteggi: organico, non disponibilità attuale. Domanda PEC con titoli, visura e preferenze secondo il bando; termine già scaduto. Priorità per presenze, anzianità e protocollo. Per la Croce sono liberi alla spunta i posti non occupati entro le 7:30, dopo le migliorie. Quote distinte da diritti di istruttoria."
    ],
    [
        "lazio-velletri-fiera-della-madonna-delle-grazie",
        "https://www.comune.velletri.rm.it/area_letturaNotizia/630272/pagsistema.html",
        "Spunta: domanda firmata digitalmente tramite modello ufficiale, una per PEC e un solo posteggio, dal 4 marzo al 3 aprile 2026. Termine scaduto. Graduatoria per presenze dal 2011 e anzianità impresa; assegnazione 3 maggio ore 8, assenza equivale a rinuncia."
    ],
    [
        "lazio-vicovaro-fiera-del-perdono",
        "https://www.comunedivicovaro.it/c058112/zf/index.php/atti-amministrativi/determine/dettaglio/atto/GT1RFeUB5PT0-H",
        "Edizione 2026 conclusa. Domanda entro il 28 luglio alle ore 11 tramite SUAP Impresainungiorno oppure PEC; ordinanza 27/2026 e avviso allegato alla determina 52/2026. Richiesti autorizzazione itinerante e, per alimentari, titolo sanitario. Domande tardive e spuntisti: maggiorazione del 30% del canone. Spunta dalle 14:30 del 1 agosto, modulo e documenti alla Polizia Locale, fino a esaurimento posti; nessuna disponibilità attuale dedotta. L’ordinanza contiene un refuso 2025 nel paragrafo della presenza: adottati giorni e orari espliciti dell’avviso 2026."
    ],
    [
        "liguria-borghetto-santo-spirito-fiera-di-san-matteo",
        "https://comune.borghettosantospirito.sv.it/download-file/16618",
        "Spunta per gli operatori senza posto fisso: richiesta alla Polizia Locale con carta d’esercizio, attestazione annuale valida, documento e autorizzazione; permesso di soggiorno se necessario. Modulo comunale indica Sant’Antonio 13 giugno e San Matteo 21 settembre, senza conferma di posti disponibili. I 30 giorni della pagina sono durata del procedimento, non termine di candidatura. Esiste una discordanza nelle fonti secondarie sul giorno: la scheda mantiene la data testuale, senza scegliere un anticipo non verificato."
    ],
    [
        "liguria-borghetto-santo-spirito-fiera-di-sant-antonio",
        "https://comune.borghettosantospirito.sv.it/download-file/16618",
        "Spunta per gli operatori senza posto fisso: richiesta alla Polizia Locale con carta d’esercizio, attestazione annuale valida, documento e autorizzazione; permesso di soggiorno se necessario. Modulo comunale indica Sant’Antonio 13 giugno e San Matteo 21 settembre, senza conferma di posti disponibili. I 30 giorni della pagina sono durata del procedimento, non termine di candidatura."
    ],
    [
        "liguria-chiavari-fiera-di-luglio",
        "https://www.comune.chiavari.ge.it/it/news/approvazione-graduatorie-fiera-2-luglio-2026",
        "Fiera del 2 luglio 2026 riservata al commercio su area pubblica alimentare e non alimentare. Titolari sul posto entro le 6:30 con canone pagato, altrimenti posto disponibile per la spunta. Spunta alle 7 nell’atrio del Palazzo Comunale in piazza N.S. dell’Orto 1 secondo le graduatorie allegate; attestazione annuale e prescrizioni di sicurezza obbligatorie. Edizione conclusa, nessuna disponibilità futura garantita. L’avviso operativo comunale del26 giugno è stato letto tramite il browser di ricerca, ma al download diretto restituisce410: graduatorie2026 raggiungibili come fonte alternativa."
    ],
    [
        "liguria-chiavari-fiera-di-sant-antonio",
        "https://www.comune.chiavari.ge.it/it/news/approvazione-graduatorie-fiera-di-s-antonio-e-agricola-edizione-2026",
        "Il Comune pubblica le graduatorie dei titolari e degli spuntisti per il 17–18 gennaio 2026. L’accesso avviene secondo la graduatoria e le prescrizioni comunali; non è una candidatura aperta né prova di posti disponibili. Documenti dell’operatore, eventuali oneri e modalità della singola assegnazione vanno verificati presso SUAP/Commercio. Edizione conclusa."
    ],
    [
        "liguria-genova-cornigliano",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-del-mare",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-dell-angelo",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-fiera-di-pontedecimo",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-fiera-di-san-pietro-e-paolo",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-fiera-di-sant-agata",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-libro-primavera",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-maggio",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-antonio",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-carlino",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-carlo",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-giuseppe",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-pietro-pra",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-rita",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-salvatore",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-s-zita",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-ss-cosma-e-damiano",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-genova-struppa",
        "https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026",
        "Per operatori autorizzati al commercio su area pubblica: modulo tramite PEC comunegenova@postemailcertificata.it almeno 30 giorni prima. Spunta normalmente il giovedì precedente alle 15 al Matitone, da confermare nell’avviso specifico; occupazione entro le 7. Obbligatori autorizzazione, carta di esercizio e attestazione annuale valida; oneri PagoPA prima della fiera. Il calendario comunale è indicativo e soggetto a variazioni; nessun posteggio garantito."
    ],
    [
        "liguria-lavagna-fiera-dell-agricoltura",
        "https://comune.lavagna.ge.it/novita/fiera-agricoltura-1-marzo-2026/",
        "Operatori occasionali in spunta: domanda via PEC postacertificata@pec.comune.lavagna.ge.it con licenza, carta di esercizio e attestazione annuale anche da fuori regione. Precedenza agli spuntisti già in graduatoria, poi graduatoria occasionale per anzianità. Termine 2026-02-13 già trascorso; nessun posteggio garantito. Distinte graduatorie produttori agricoli e merci varie/alimentari."
    ],
    [
        "liguria-lavagna-fiera-san-simone",
        "https://comune.lavagna.ge.it/novita/fiera-san-simone-28-ottobre-2026/",
        "Operatori occasionali in spunta: domanda via PEC postacertificata@pec.comune.lavagna.ge.it con licenza, carta di esercizio e attestazione annuale anche da fuori regione. Precedenza agli spuntisti già in graduatoria, poi graduatoria occasionale per anzianità. Termine 2026-10-09 già trascorso; nessun posteggio garantito. Estintore indispensabile per occupare il posto."
    ],
    [
        "liguria-recco-fiera-di-n-s-del-suffragio",
        "https://www.comune.recco.ge.it/novita/notizie/novita_2052.html",
        "Solo operatori commerciali ambulanti: esclusi hobbisti, OPI e mestieri girovaghi. Nessuna richiesta preventiva per la spunta: licenza originale e documenti alla Polizia Locale, presenza entro le 8:30 e spunta alle 8:45 del 7 settembre; precedenza per presenze e anzianità secondo settore. Alimentari senza somministrazione, consumo sul posto o panini; impianti conformi. Vendita 7–8 settembre, con chiusura all’una del 9: il 9 non è un terzo giorno pieno di fiera. Quota e posti non garantiti."
    ],
    [
        "liguria-recco-fiera-s-g-battista",
        "https://www.comune.recco.ge.it/novita/comunicati_stampa/novita_2032.html",
        "Il documento comunale 2026 prevede 24 banchi 6×4 m, otto alimentari e sedici non alimentari; per questa edizione undici in spunta (4 alimentari e 7 non alimentari). Non è prevista domanda preventiva: presenza obbligatoria 8:30, spunta 8:45, vendita 8:30–23. Alimentari solo dolciumi con ATECO 47.24 o 10.71. Licenza, attestazione annuale e carta di esercizio da esibire; dichiarazioni conformità impianti elettrico/gas. Dati dell’edizione conclusa, non disponibilità attuale."
    ],
    [
        "liguria-santo-stefano-al-mare-fiera-di-santo-stefano",
        "https://www.comune.santostefanoalmare.im.it/Dettaglionews?IDNews=410316",
        "Avviso comunale aggiornato 5 agosto 2026: spunta riservata a operatori autorizzati al commercio su area pubblica e iscritti nella graduatoria annuale. Istanza obbligatoria sul modello comunale entro il 31 gennaio di ciascun anno. Il testo non riapre i termini 2026 e la graduatoria non garantisce un posto libero. Fiera 9 agosto dal calendario regionale; tariffe non indicate nell’avviso."
    ],
    [
        "liguria-savona-fiera-di-natale",
        "https://iol.comune.savona.it/suap/istruzioni-suap/partecipazione-alla-spunta-per-mercati-e-fiere",
        "Spunta comunale: comunicazione con allegati entro il 31 gennaio; graduatoria valida dal 1° aprile al 31 marzo successivo. Integrazione entro il 31 luglio riservata a nuove autorizzazioni rilasciate dopo gennaio, esclusi subingressi. Termini 2026 trascorsi: verificare graduatoria e posto libero, senza garanzia di assegnazione. Quota del singolo posteggio non ricavabile dal calendario."
    ],
    [
        "liguria-savona-fiera-di-santa-lucia",
        "https://iol.comune.savona.it/suap/istruzioni-suap/partecipazione-alla-spunta-per-mercati-e-fiere",
        "Spunta comunale: comunicazione con allegati entro il 31 gennaio; graduatoria valida dal 1° aprile al 31 marzo successivo. Integrazione entro il 31 luglio riservata a nuove autorizzazioni rilasciate dopo gennaio, esclusi subingressi. Termini 2026 trascorsi: verificare graduatoria e posto libero, senza garanzia di assegnazione. Quota del singolo posteggio non ricavabile dal calendario."
    ],
    [
        "liguria-savona-fiera-nativita-di-maria-vergine",
        "https://iol.comune.savona.it/suap/istruzioni-suap/partecipazione-alla-spunta-per-mercati-e-fiere",
        "Spunta comunale: comunicazione con allegati entro il 31 gennaio; graduatoria valida dal 1° aprile al 31 marzo successivo. Integrazione entro il 31 luglio riservata a nuove autorizzazioni rilasciate dopo gennaio, esclusi subingressi. Termini 2026 trascorsi: verificare graduatoria e posto libero, senza garanzia di assegnazione. Quota del singolo posteggio non ricavabile dal calendario."
    ],
    [
        "liguria-savona-fiera-nostra-signoria-di-misericordia",
        "https://iol.comune.savona.it/suap/istruzioni-suap/partecipazione-alla-spunta-per-mercati-e-fiere",
        "Spunta comunale: comunicazione con allegati entro il 31 gennaio; graduatoria valida dal 1° aprile al 31 marzo successivo. Integrazione entro il 31 luglio riservata a nuove autorizzazioni rilasciate dopo gennaio, esclusi subingressi. Termini 2026 trascorsi: verificare graduatoria e posto libero, senza garanzia di assegnazione. Quota del singolo posteggio non ricavabile dal calendario."
    ],
    [
        "liguria-savona-fiera-santa-rita",
        "https://iol.comune.savona.it/suap/istruzioni-suap/partecipazione-alla-spunta-per-mercati-e-fiere",
        "Spunta comunale: comunicazione con allegati entro il 31 gennaio; graduatoria valida dal 1° aprile al 31 marzo successivo. Integrazione entro il 31 luglio riservata a nuove autorizzazioni rilasciate dopo gennaio, esclusi subingressi. Termini 2026 trascorsi: verificare graduatoria e posto libero, senza garanzia di assegnazione. Quota del singolo posteggio non ricavabile dal calendario."
    ],
    [
        "lombardia-arcore-fiera-di-sant-eustorgio",
        "https://comune.arcore.mb.it/novita/notizia/fiera-di-s-eustorgio-2-2/",
        "Fiera del lunedì 21 settembre. Titolari di concessione; i posteggi non occupati vengono assegnati in spunta dalla Polizia Locale alle 08:00 secondo graduatoria. Documentazione per operatori e planimetria negli allegati comunali; verifica titolo autorizzativo, carta di esercizio, attestazione e canone."
    ],
    [
        "lombardia-brescia-fiera-dei-santi-faustino-e-giovita",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-della-madunina-dei-custu",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-cristo-re",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-ognissanti",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-sant-angela-merici",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-sant-antonio",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-santa-maria-crocifissa-di-rosa",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-santa-maria-della-vittoria",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-brescia-fiera-di-santa-maria-delle-grazie",
        "https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf",
        "La comunicazione per partecipare alla spunta va presentata tramite Impresa in un giorno, entro il termine del calendario. Serve l’autorizzazione al commercio su aree pubbliche. La spunta assegna i soli posteggi liberi/non occupati; il numero dei banchi indica l’organico complessivo, non i posti disponibili."
    ],
    [
        "lombardia-cantu-fiera-del-crocifisso",
        "https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html",
        "Imprese autorizzate al commercio su area pubblica con attestazione 2026. Domanda per ciascuna fiera tramite Impresa in un giorno, con documenti, firma digitale e bollo. Il bando prevede spunta la mattina in ordine di arrivo sui soli posteggi effettivamente liberi; non garantisce assegnazione. Posteggi senza corrente; settore F Crocifisso prioritario ai produttori agricoli. L’organico dichiarato non è disponibilità."
    ],
    [
        "lombardia-cantu-fiera-di-s-apollonia",
        "https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html",
        "Imprese autorizzate al commercio su area pubblica con attestazione 2026. Domanda per ciascuna fiera tramite Impresa in un giorno, con documenti, firma digitale e bollo. Il bando prevede spunta la mattina in ordine di arrivo sui soli posteggi effettivamente liberi; non garantisce assegnazione. Posteggi senza corrente; settore F Crocifisso prioritario ai produttori agricoli. L’organico dichiarato non è disponibilità."
    ],
    [
        "lombardia-cantu-fiera-di-s-rocco",
        "https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html",
        "Imprese autorizzate al commercio su area pubblica con attestazione 2026. Domanda per ciascuna fiera tramite Impresa in un giorno, con documenti, firma digitale e bollo. Il bando prevede spunta la mattina in ordine di arrivo sui soli posteggi effettivamente liberi; non garantisce assegnazione. Posteggi senza corrente; settore F Crocifisso prioritario ai produttori agricoli. L’organico dichiarato non è disponibilità."
    ],
    [
        "lombardia-codogno-fiera-autunnale-di-codogno",
        "https://comune.codogno.lo.it/edizioni-fiera-autunnale/fiera-edizione-2026/",
        "Spunta del mercato fiera: domanda via ImpresaInUnGiorno entro il 23 settembre, graduatoria prevista il 3 novembre. Chiedi al Commercio eventuali possibilità residue. Stand espositivi e gestione bar/ristorazione seguono procedure distinte: il termine 16 ottobre alle 12:00 riguarda solo la concessione bar/ristorazione."
    ],
    [
        "lombardia-cremona-fiera-san-pietro",
        "https://www.comune.cremona.it/media/2846",
        "Domanda tramite SUAP Impresa in un giorno, procedimento Commercio – Richiesta di partecipazione alla fiera. Ambulanti autorizzati e produttori agricoli. Banco allestito entro le 07:00; spunta in ordine di graduatoria, poi sorteggio fra autorizzati presenti se restano posti. Senza domanda non si maturano presenze. Posteggi 12×5 m alimentari e 8×5 m non alimentari; vietati animali vivi e sub-concessione. Termine 2026 trascorso, non applicato al 2027."
    ],
    [
        "lombardia-gonzaga-mostra-mercato-del-c-era-una-volta-centro-storico",
        "https://www.ceraunavoltagonzaga.it/",
        "Domanda al Circolo Filatelico, Numismatico ed Hobbistico. Regolamento distingue professionisti e privati; prenotazione spunta 06:00–07:30 e assegnazione alle 07:30 solo nei posti liberi. Chiedere condizioni e quote correnti: la pagina tariffe si riferisce al 2025."
    ],
    [
        "lombardia-meda-fiera-di-calendimaggio",
        "https://www.comune.meda.mb.it/trasparenza-rifiuti/dettaglio-notizia/Fiera-di-Calendimaggio-2026/",
        "Partecipazione dei titolari di concessione pluriennale. Posteggi liberi assegnati prima secondo graduatoria dell’avviso del 3 marzo, poi secondo graduatoria generale degli spuntisti. Consulta graduatorie e SUAP; la scadenza 2030/2031 riguarda le concessioni, non la domanda 2026."
    ],
    [
        "lombardia-rescaldina-fiera-autunnale",
        "https://www.comune.rescaldina.mi.it/it/news/1958472",
        "Spunta ore 7 in piazza della Chiesa. Il 30 settembre indicato dall’avviso riguarda il pagamento, non la domanda. Informazioni SUAP 0331 467822."
    ],
    [
        "lombardia-rosate-fiera-di-rosate",
        "https://www.comune.rosate.mi.it/index.php/it/news/1960545",
        "30 posteggi complessivi, non disponibilità: domanda entro 31 marzo tramite SUAP Unione dei Fontanili / Impresainungiorno. Spunta per posti dei concessionari assenti, senza miglioria."
    ],
    [
        "lombardia-serina-fiera-zootecnica-con-spunta-ambulanti",
        "https://www.comune.serina.bg.it/novita/avvisi/dettaglio-notizia/Fiera-zootecnica-del-23-settembre-2026-Graduatoria-di-spunta/",
        "Graduatoria di spunta pubblicata il 14 settembre per la fiera del 23 settembre 2026. Consultare gli allegati e Polizia Locale/Commercio per requisiti, categorie, oneri e convocazione; non bando ancora aperto."
    ],
    [
        "lombardia-tirano-fiera-di-pentecoste",
        "https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036",
        "Domanda in bollo tramite PEC con firma digitale, secondo bando 2026. Termine ordinario 2026-02-24, già scaduto. Le domande complete tardive sono ammesse alla graduatoria di spunta solo se presentate non oltre dieci giorni prima della fiera; non è spunta libera senza domanda. Pentecoste ha due concessioni giornaliere distinte. Diritti di istruttoria e canone da distinguere; nessun posto garantito."
    ],
    [
        "lombardia-tirano-fiera-di-primavera",
        "https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036",
        "Domanda in bollo tramite PEC con firma digitale, secondo bando 2026. Termine ordinario 2026-01-29, già scaduto. Le domande complete tardive sono ammesse alla graduatoria di spunta solo se presentate non oltre dieci giorni prima della fiera; non è spunta libera senza domanda. Pentecoste ha due concessioni giornaliere distinte. Diritti di istruttoria e canone da distinguere; nessun posto garantito."
    ],
    [
        "lombardia-tirano-fiera-di-san-martino",
        "https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036",
        "Domanda in bollo tramite PEC con firma digitale, secondo bando 2026. Termine ordinario 2026-08-11, già scaduto. Le domande complete tardive sono ammesse alla graduatoria di spunta solo se presentate non oltre dieci giorni prima della fiera; non è spunta libera senza domanda. Pentecoste ha due concessioni giornaliere distinte. Diritti di istruttoria e canone da distinguere; nessun posto garantito."
    ],
    [
        "lombardia-tirano-fiera-di-san-michele",
        "https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036",
        "Domanda in bollo tramite PEC con firma digitale, secondo bando 2026. Termine ordinario 2026-06-27, già scaduto. Le domande complete tardive sono ammesse alla graduatoria di spunta solo se presentate non oltre dieci giorni prima della fiera; non è spunta libera senza domanda. Pentecoste ha due concessioni giornaliere distinte. Diritti di istruttoria e canone da distinguere; nessun posto garantito."
    ],
    [
        "marche-ancona-fiera-di-san-ciriaco",
        "https://anconaservizi.it/la-fiera-di-san-ciriaco-2026/",
        "Fiera tradizionale dal 1 al 4 maggio; 30 aprile solo anteprima gastronomica in Piazza Cavour. Gestione e assegnazioni curate da Ancona Servizi su graduatorie comunali, procedure distinte per ambulanti, artigiani e campionaria. Nessuna disponibilità desunta dal numero degli espositori; il bando 2025 non vale come domanda 2026. Avviso SUAP 14 gennaio 2026: domande solo tramite portale dalle 13 del 19 gennaio al 2 marzo 2026 ore 24. La spunta “oltre 50 posti” nella stessa pagina è del 2025 e non vale come disponibilità 2026. Recuperato il bando originale 2026 completo:375 posteggi previsti, non 437 del registro né posti liberi. Graduatoria unica ambulanti autorizzati/SCIA, regolarità contributiva e nessuna pendenza precedente. Scelta in presenza/online e saldo all’assegnazione; spunta entro 9:30 ogni giorno, sede da progetto esecutivo. Viale centrale senza autonegozi o foodtruck. Tariffario a pagina 5, verificato anche visivamente."
    ],
    [
        "marche-cagli-fiera-di-san-vittore",
        "https://comune.cagli.ps.it/novita/fiera-di-san-vittore-2026/",
        "Il Comune indica domenica 11 ottobre 2026 e pubblica graduatoria e avviso spunta. Non usare il vecchio modulo 2025 per la data o per i termini 2026. La graduatoria non equivale a posti disponibili; quota totale non pubblicata nella notizia. Locandina originale verificata visivamente: spunta dalle 7 presso Palazzo Comunale, ingresso prima porta a destra; apertura pubblica 8–20. Avviso relativo all’edizione conclusa2026."
    ],
    [
        "marche-comunanza-fiera-di-santa-caterina",
        "https://www.comune.comunanza.ap.it/novita/notizie/novita_145.html",
        "Bando 2026: 60 posteggi per commercianti su aree pubbliche, distinti dal vecchio organico regionale. Istanze esclusivamente tramite SUAP Piceno Consind dal 1° gennaio al 30 settembre 2026: termine scaduto; la PEC istituzionale e il cartaceo non sostituiscono la procedura. Per alimentari serve notifica sanitaria. Possibile istanza unica per le due fiere con indicazione esplicita. Canone secondo regolamento, senza cifra pubblicata nel bando; eventuale spunta sui posti non occupati secondo il documento. Graduatoria del 20 ottobre e convocazioni per il 3 novembre, agli orari assegnati: presentarsi con ricevuta PagoPA trasmessa da Abaco. Nel richiamo tariffario del bando permane una data 2025: non trasformata in tariffa 2026."
    ],
    [
        "marche-comunanza-mostra-ornitologica",
        "https://www.comune.comunanza.ap.it/novita/notizie/novita_85.html",
        "Bando 2026: 238 posteggi per commercianti su aree pubbliche, distinti dal vecchio organico regionale. Istanze esclusivamente tramite SUAP Piceno Consind dal 1° gennaio al 5 agosto 2026: termine scaduto; la PEC istituzionale e il cartaceo non sostituiscono la procedura. Per alimentari serve notifica sanitaria. Possibile istanza unica per le due fiere con indicazione esplicita. Canone secondo regolamento, senza cifra pubblicata nel bando; eventuale spunta sui posti non occupati secondo il documento. Graduatoria comunale approvata il 26 agosto."
    ],
    [
        "marche-fermo-fiera-di-natale",
        "https://www.visitfermo.it/wp-content/uploads/2026/10/pieghevole-autunno-2026.pdf",
        "Fiera su area pubblica nel calendario regionale 2026. L’organico dichiarato non indica posti liberi. Bando, settore ammesso, concessione temporanea, spunta, scadenza e canone vanno verificati nella procedura del Comune/SUAP; condizioni non pubblicate non sono presunte. Regolamento comunale artt. 20–26: assegnazione tramite selezione, spunta dei posti occasionalmente liberi e contributo aggiuntivo al canone di suolo. Il 15 luglio per Santa Maria/San Savino e il 15 novembre per Natale sono termini generali di pagamento del contributo, non termini della domanda; nessun importo annuale recuperato."
    ],
    [
        "marche-fermo-fiera-di-san-savino",
        "https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7",
        "Fiera su area pubblica nel calendario regionale 2026. L’organico dichiarato non indica posti liberi. Bando, settore ammesso, concessione temporanea, spunta, scadenza e canone vanno verificati nella procedura del Comune/SUAP; condizioni non pubblicate non sono presunte. Regolamento comunale artt. 20–26: assegnazione tramite selezione, spunta dei posti occasionalmente liberi e contributo aggiuntivo al canone di suolo. Il 15 luglio per Santa Maria/San Savino e il 15 novembre per Natale sono termini generali di pagamento del contributo, non termini della domanda; nessun importo annuale recuperato."
    ],
    [
        "marche-fermo-fiera-di-santa-maria",
        "https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7",
        "Fiera su area pubblica nel calendario regionale 2026. L’organico dichiarato non indica posti liberi. Bando, settore ammesso, concessione temporanea, spunta, scadenza e canone vanno verificati nella procedura del Comune/SUAP; condizioni non pubblicate non sono presunte. Regolamento comunale artt. 20–26: assegnazione tramite selezione, spunta dei posti occasionalmente liberi e contributo aggiuntivo al canone di suolo. Il 15 luglio per Santa Maria/San Savino e il 15 novembre per Natale sono termini generali di pagamento del contributo, non termini della domanda; nessun importo annuale recuperato."
    ],
    [
        "marche-montefano-sapori-d-autunno",
        "https://www.comune.montefano.mc.it/wp-content/blogs.dir/43/files/3-All.-Det-Bando-Fiera-Sapori-2026.pdf",
        "Fiera commerciale il 25 ottobre, distinta dalla festa 23–25 ottobre. Bando: 18 posteggi fino a 4×3 m, di cui sei per agricoltori; ulteriori otto per produttori di Montefano con esenzione dal canone. Istanza SUAP firmata digitalmente e in bollo entro il 24 agosto; scelta il 15 ottobre, 16–18, già trascorsa. Spunta dopo le 8 sui posti realmente rimasti; autorizzazione originale e requisiti contributivi. Area principale senza espositori di cibi cotti, generatori a scoppio, trifase o mezzi nel banco; elettricità fino a 0,8 kW. Spazi Pro Loco per artigiani, hobbisti, associazioni e gastronomia hanno regole e canone distinti: il divieto dell’area principale non è esteso a tutta la festa."
    ],
    [
        "marche-montefiore-dell-aso-fiera-grande-d-autunno",
        "https://montefiore-dell-aso-api.municipiumapp.it/s3/4332/allegati/atto-originale.pdf",
        "Determina Area 4 n.5/2026 originale recuperata nell’archivio degli allegati dopo la rimozione della pagina: 25 domande approvate, numero di richiedenti e non di posti liberi. Scelta convocata il 15 settembre; per il 20 settembre spunta alle 7:30 sui posti non occupati, banco pronto entro le 8 e uscita mezzi dopo le 17 compatibilmente con sicurezza. Richiesti titolo A/B, visura e documento. Edizione svolta nel 2026; nessuna disponibilità futura dedotta, nessuna quota documentata."
    ],
    [
        "marche-montegranaro-fiera-di-san-giuseppe",
        "https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=13",
        "Avviso comunale 25 febbraio 2026: spunta dalle 7 alla Palestra Temperini in via Bernardo Rossi per operatori senza concessione. Registro: domenica precedente il 19 marzo; fonti secondarie: 22 marzo. La pagina comunale non precisa il giorno, nessun atto risolutivo recuperato: data conservata testuale. Quota e posti liberi non pubblicati."
    ],
    [
        "marche-roccafluvione-fiera-delle-piante-e-mostra-mercato-del-tartufo-e-dei-prodotti-tipici",
        "https://www.halleyweb.com/c044064/de/attachment.php?serialDocumento=00PKOF020262Q&p7m=1",
        "Delibera Giunta 14/30 gennaio e determina Vigilanza 3/19 febbraio 2026: Fiera di Primavera comunale domenica 8 marzo, in concomitanza con Fiera delle Piante di fiori, piante e prodotti tipici della Pro Loco. Stessa giornata mantenuta nella scheda regionale, distinguendo aree e gestioni. Graduatoria rettificata con determina 5/4 marzo: non disponibilità corrente di posti. Scelta posti convocata il 4 marzo alle 14:45; richieste di rettifica entro 25 febbraio ore 12, non termine generale di domanda. Banchi nei soli stalli assegnati, concessionario o rappresentante autorizzato; occupazione dalle 7 alle 8, ritardatari perdono il posto senza rimborso. Vendita fino alle 19; spunta dalle 8:15 presso sede comunale per stalli liberi secondo norme regionali. Edizione trascorsa; termini non estesi al 2027."
    ],
    [
        "marche-san-benedetto-del-tronto-fiera-della-madonna-della-marina",
        "https://sportellounico.comunesbt.it/suap/wp-content/blogs.dir/3/files/sites/3/2026/07/DGC-n.-101-del-15.07.2026.pdf",
        "Delibera di Giunta 101 del 15 luglio 2026 e relazione di sicurezza originali: fiera del 25–26 luglio 2026. La delibera indica consistenza attuale di 115 posteggi, di cui 38 in concessione dodicennale: non sono posti liberi. La spunta si esegue unicamente sabato 25 luglio con assegnazione per entrambe le giornate e pagamento degli oneri di due giorni. Si applicano regolamento e disposizioni dell’edizione; le scadenze delle notizie 2024/2025 non vengono estese al 2026. Nessun importo per il singolo banco ricavato dai documenti recuperati. Edizione già trascorsa."
    ],
    [
        "piemonte-acqui-terme-fiera-di-santa-caterina",
        "https://www.comune.acquiterme.al.it/Dettaglionews?IDNews=416293",
        "Graduatoria definitiva e lista spunta pubblicate per il 15–17 novembre 2026. Scelta posteggi convocata il 25–26 settembre, già trascorsa. Spunta dal 15 novembre ore 8:30 presso Ufficio Commercio, Piazza Levi 12, secondo elenco pubblicato; nessuna garanzia di posto. Non è una nuova apertura delle domande."
    ],
    [
        "piemonte-casale-monferrato-fiera-di-agosto",
        "https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/",
        "Fiere su area pubblica riservate agli operatori con autorizzazione ambulante; per marzo anche produttori agricoli vivaisti e floricoltori. Concessioni dodecennali già assegnate: chi non ha concessione può presentarsi soltanto alla spunta il mattino della fiera, senza garanzia di posto. Date comunali prevalenti sui refusi del registro regionale."
    ],
    [
        "piemonte-casale-monferrato-fiera-di-aprile",
        "https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/",
        "Fiere su area pubblica riservate agli operatori con autorizzazione ambulante; per marzo anche produttori agricoli vivaisti e floricoltori. Concessioni dodecennali già assegnate: chi non ha concessione può presentarsi soltanto alla spunta il mattino della fiera, senza garanzia di posto. Date comunali prevalenti sui refusi del registro regionale."
    ],
    [
        "piemonte-casale-monferrato-fiera-di-dicembre",
        "https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/",
        "Fiere su area pubblica riservate agli operatori con autorizzazione ambulante; per marzo anche produttori agricoli vivaisti e floricoltori. Concessioni dodecennali già assegnate: chi non ha concessione può presentarsi soltanto alla spunta il mattino della fiera, senza garanzia di posto. Date comunali prevalenti sui refusi del registro regionale."
    ],
    [
        "piemonte-casale-monferrato-fiera-di-marzo",
        "https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/",
        "Fiere su area pubblica riservate agli operatori con autorizzazione ambulante; per marzo anche produttori agricoli vivaisti e floricoltori. Concessioni dodecennali già assegnate: chi non ha concessione può presentarsi soltanto alla spunta il mattino della fiera, senza garanzia di posto. Date comunali prevalenti sui refusi del registro regionale."
    ],
    [
        "piemonte-casale-monferrato-fiera-di-novembre",
        "https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/",
        "Fiere su area pubblica riservate agli operatori con autorizzazione ambulante; per marzo anche produttori agricoli vivaisti e floricoltori. Concessioni dodecennali già assegnate: chi non ha concessione può presentarsi soltanto alla spunta il mattino della fiera, senza garanzia di posto. Date comunali prevalenti sui refusi del registro regionale."
    ],
    [
        "piemonte-crescentino-fiera-del-campanile",
        "https://www.comune.crescentino.vc.it/Dettaglionews?IDNews=386826",
        "Istanza in bollo entro 30 marzo 2026 ore 23:59 esclusivamente via PEC a crescentino@cert.ruparpiemonte.it; documento, autorizzazione, Carta di esercizio e attestazione. Domande fuori termine/incomplete escluse dalla graduatoria; eventuali vacanti assegnati con spunta alle 8:00 presso il punto mobile della Polizia Locale. No GPL e generatore autonomo nel modulo alimentari."
    ],
    [
        "piemonte-santhia-fiera-di-santa-caterina",
        "https://www.comune.santhia.vc.it/Dettaglionews?IDNews=411440",
        "Modulo compilato e firmato via PEC a polizialocale@pec.comune.santhia.vc.it; PEC della ditta obbligatoria, documento, autorizzazione, Carta di esercizio e attestazione. Il pagamento ordinario arriva via PEC ed è dovuto entro 14 novembre. Per gli spuntisti il modulo prevede 40 € con POS all’assegnazione; l’ultima pagina vieta il POS in giorno di fiera per il pagamento ordinario: far confermare la gestione concreta. Nessuna disponibilità garantita."
    ],
    [
        "puglia-bitetto-fiera-di-maria-ss-addolorata",
        "https://www.comune.bitetto.ba.it/novita/fiera-in-onore-di-maria-ss-addolorata-del-6-settembre-2026/",
        "40 posteggi 5×8 m:10 alimentari, 6 somministrazione e 24 non alimentari. Posizionamento 15–24. Domanda entro 31 agosto 11:30; titoloA/B e bollo 16€. Spunta solo se restano posti. Graduatoria definitiva pubblicata 3 settembre."
    ],
    [
        "puglia-corato-fiera-della-madonna-del-pozzo",
        "https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026",
        "Unica domanda Impresainungiorno entro 30 giugno 2026, già scaduto; priorità per presenze e iscrizione. Spunta sui soli posti residui nella prima mattina. Titolo e pagamento necessari."
    ],
    [
        "puglia-corato-fiera-di-san-cataldo-festa-patronale",
        "https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026",
        "Unica domanda Impresainungiorno entro 30 giugno 2026, già scaduto; priorità per presenze e iscrizione. Spunta sui soli posti residui nella prima mattina. Titolo e pagamento necessari."
    ],
    [
        "puglia-sannicandro-di-bari-fiera-di-maggio",
        "https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf",
        "85 posteggi previsti, vendita 7–14. Domanda via PEC o raccomandata; per ottobre il termine è 7 agosto ore 12, per maggio 10 aprile ore 12: entrambi scaduti. Spunta dopo un’ora per iscritti senza assegnazione, non accesso libero. Canone da quantificare."
    ],
    [
        "puglia-sannicandro-di-bari-fiera-di-ottobre",
        "https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf",
        "85 posteggi previsti, vendita 7–14. Domanda via PEC o raccomandata; per ottobre il termine è 7 agosto ore 12, per maggio 10 aprile ore 12: entrambi scaduti. Spunta dopo un’ora per iscritti senza assegnazione, non accesso libero. Canone da quantificare."
    ],
    [
        "puglia-terlizzi-fiera-degli-animali-e-attrezzature-agricole",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "13 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-08-14; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-della-festa-patronale-del-carro",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "66 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-06-22; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-della-madonna-del-rosario",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "76 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-08-14; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-della-madonna-dell-annunziata",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "10 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-02-23; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-della-madonna-di-costantinopoli",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "10 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-02-23; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-della-madonna-di-sovereto",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "40 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-03-27; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "puglia-terlizzi-fiera-di-san-nicola",
        "https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html",
        "40 posteggi previsti dal bando originale recuperato via browser. Titolo A/B e modello via PEC. Termine 2026-10-23; assegnazione secondo graduatoria, spunta soltanto sui residui e con priorità agli istanti. Nessuna garanzia di disponibilità."
    ],
    [
        "toscana-arezzo-fiera-antiquaria",
        "https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/",
        "Spunta 2026: domanda online con SPID tramite il Comune. Le domande pervenute oltre il giorno 15 sono ammesse all’edizione del mese successivo a quello di invio. Settore antiquariato; operatori non professionisti seguono tesserino e regole specifiche. Verificare graduatoria, registrazione e posteggi temporaneamente liberi."
    ],
    [
        "toscana-arezzo-fiera-del-mestolo",
        "https://comune.arezzo.it/novita/fiera-del-mestolo-edizione-di-settembre-2026",
        "Spunta all’Informagiovani di piazza Sant’Agostino: il 9 settembre registrazione dalle 7:20 e scelta alle 8:15; il 10 e 11 registrazione dalle 7:30 e scelta alle 7:45. Portare licenza/SCIA, visura camerale e documento; richiesta regolarità contributiva. I nuovi operatori possono anticipare i documenti via email, senza diritto di precedenza."
    ],
    [
        "toscana-campiglia-marittima-fierone-di-venturina-terme",
        "https://www.comune.campigliamarittima.li.it/area_letturaNotizia/637439/pagsistema.html",
        "Accesso concessionari 8–9, registrazione entro le 9; spunta indicativamente alle 10 dopo compattamento. Pagamento CUP via PagoPA prima di vendere, senza contanti e con arretrati saldati. Alcuni posteggi solo gazebo, senza GPL/generatori. Nessuna garanzia di posti liberi."
    ],
    [
        "toscana-castiglion-fibocchi-fiera-della-madonna-del-rosario",
        "https://www.comune.castiglionfibocchi.ar.it/notizie/Avviso-di-partecipazione-nei-posteggi-liberi-della-fiera-annuale-2026.html",
        "Avviso comunale per assegnazioni temporanee nei posteggi liberi tramite domanda allegata. Posteggi ancora liberi assegnati alla spunta delle 8:15, secondo comparto merceologico, presenze e anzianità; non è documentata una scadenza datata né una disponibilità attuale. Consultare avviso e modulo."
    ],
    [
        "toscana-lucca-mercato-antiquario",
        "https://www.comune.lucca.it/vivere-il-comune/eventi/mercato-antiquario/",
        "Imprese individuali/società: spunta sabato al parcheggio Palatucci prima dell’avvio con licenza, visura camerale aggiornata e DURC valido; graduatoria Heritage per presenze e anzianità. Hobbisti non iscritti in CCIAA non ammessi. Il Comune conferma 19–20 settembre e ricorrenza mensile, senza calendario annuale completo; quota del banco non acquisita, gratuità riferita al pubblico."
    ],
    [
        "toscana-pistoia-fiera-dell-antiquariato-la-cattedrale",
        "https://www.comune.pistoia.it/it/servizi/4915",
        "Prenotazione spuntisti dal lunedì al mercoledì precedenti, con dati impresa, recapito e titoli; assegnazione comunicata il giovedì. Alla Cattedrale spunta senza prenotazione dalle 8 del sabato; in centro non è prevista spunta la mattina. Usato il calendario comunale puntuale, non la ricorrenza generale, con eccezioni maggio/agosto/dicembre. Requisiti del proprio settore, disponibilità effettiva, quota e modalità di partecipazione vanno confermati con il Comune o l’organizzatore ove non pubblicati; ingresso gratuito del pubblico non significa banco gratuito."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-castelnuovo-della-misericordia",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "8 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-gabbro",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "8 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-nibbiaia",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "3 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-marittimo",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "7 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-solvay",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "20 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-rosignano-marittimo-fiera-annuale-di-vada",
        "https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf",
        "52 posteggi regolamentari, non liberi. Concessioni e graduatorie comunali; spunta all’orario iniziale. Tariffe non quantificate nelle schede. Planimetria originale letta visivamente."
    ],
    [
        "toscana-san-casciano-in-val-di-pesa-fiera-arte-e-sport-di-cerbaia",
        "https://www.comune.san-casciano-val-di-pesa.fi.it/vivere-il-comune/eventi/fiera-arte-e-sport-cerbaia-2026",
        "Undici posteggi previsti: 7 non alimentari, 3 alimentari e 1 riservato. Assegnazione giornaliera dalla Polizia Municipale secondo graduatoria della spunta."
    ],
    [
        "toscana-scandicci-fierone-ambulante-di-scandicci",
        "https://www.comune.scandicci.fi.it/amministrazione/uffici/uo-62-sviluppo-economico",
        "Richiesta per spunta via PEC entro il 15 settembre dell’anno di riferimento, con appositi moduli comunali. Verificare graduatoria e disponibilità; non presentarsi presumendo l’ammissione."
    ],
    [
        "toscana-siena-fiera-di-san-giuseppe",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 12 posteggi con riserve specifiche. Consultare gli articoli 14 e 30 del regolamento per la spunta."
    ],
    [
        "toscana-siena-fiera-di-sant-isidoro-taverne-d-arbia",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 8 posteggi con riserve specifiche. Consultare gli articoli 14 e 30 del regolamento per la spunta."
    ],
    [
        "toscana-siena-fiera-di-santa-lucia",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 49 posteggi con riserve specifiche. Consultare gli articoli 14 e 30 del regolamento per la spunta."
    ],
    [
        "toscana-siena-mercatino-d-autunno",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 9 posteggi previsti. Le merci ammesse dipendono dal singolo posteggio. Verificare sospensioni e recuperi previsti dal Comune."
    ],
    [
        "toscana-siena-mercatino-d-estate",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 9 posteggi previsti. Il conflitto giugno/luglio negli originali impedisce di pubblicare un intervallo certo; non sono mantenuti due mercatini separati del Palio."
    ],
    [
        "toscana-siena-mercatino-di-natale",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 23 posteggi previsti. Le merci ammesse dipendono dal singolo posteggio. Verificare sospensioni e recuperi previsti dal Comune."
    ],
    [
        "toscana-siena-mercatino-di-pasqua",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 10 posteggi previsti. Le merci ammesse dipendono dal singolo posteggio. Verificare sospensioni e recuperi previsti dal Comune."
    ],
    [
        "toscana-siena-mercatino-di-primavera",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 9 posteggi previsti. Le merci ammesse dipendono dal singolo posteggio. Verificare sospensioni e recuperi previsti dal Comune."
    ],
    [
        "toscana-siena-mercato-mensile-dell-antiquariato",
        "https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf",
        "Piano e regolamento comunali approvati il 19 marzo 2026. Il numero dei posteggi è capienza regolamentare, non disponibilità. Concessioni e spunta seguono titoli e graduatorie; canone e assegnazioni non sono quantificati per il singolo banco. 23 posteggi, uno riservato. Orario di vendita 8–20; controllare graduatoria e regole di spunta."
    ],
    [
        "trentino-alto-adige-ala-fiera-di-san-luca",
        "https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre",
        "L’avviso comunale del 12 ottobre 2026 indica la richiesta tramite apposito modello per gli operatori interessati alla spunta. Termine e costi non riportati nell’avviso: verificarli presso il Comune; nessun posto garantito."
    ],
    [
        "trentino-alto-adige-ala-fiera-di-san-martino",
        "https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre",
        "L’avviso comunale del 12 ottobre 2026 indica la richiesta tramite apposito modello per gli operatori interessati alla spunta. Termine e costi non riportati nell’avviso: verificarli presso il Comune; nessun posto garantito."
    ],
    [
        "trentino-alto-adige-rovereto-fiera-della-festa-d-oro",
        "https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf",
        "Operatori con titolo abilitante per il commercio su area pubblica. Moduli del Consorzio Comuni Trentini da presentare via PEC per l’inserimento nella graduatoria di spunta. Il servizio generale ammette una data diversa stabilita annualmente: per il 2026 si segue il calendario ANVA."
    ],
    [
        "trentino-alto-adige-rovereto-fiera-di-san-marco",
        "https://www.comune.rovereto.tn.it/Servizi/Vendere-ai-mercati-saltuari",
        "Partecipazione specializzata, non una fiera generalista. Moduli per graduatoria di spunta via PEC all’ufficio attività produttive."
    ],
    [
        "trentino-alto-adige-rovereto-fiera-di-santa-caterina",
        "https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf",
        "Operatori con titolo abilitante per il commercio su area pubblica. Moduli del Consorzio Comuni Trentini da presentare via PEC per l’inserimento nella graduatoria di spunta. Il servizio generale ammette una data diversa stabilita annualmente: per il 2026 si segue il calendario ANVA."
    ],
    [
        "trentino-alto-adige-trento-fiera-di-san-giuseppe",
        "https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true",
        "Spuntisti: domanda di concessione, documento e SCIA via PEC; occorre essere inseriti nella graduatoria della singola fiera. Concessione degli eventuali posti liberi la mattina del mercato, senza garanzia di assegnazione."
    ],
    [
        "trentino-alto-adige-trento-fiera-di-santa-croce",
        "https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true",
        "Spuntisti: domanda di concessione, documento e SCIA via PEC; occorre essere inseriti nella graduatoria della singola fiera. Concessione degli eventuali posti liberi la mattina del mercato, senza garanzia di assegnazione."
    ],
    [
        "trentino-alto-adige-trento-fiera-di-santa-lucia",
        "https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true",
        "Spuntisti: domanda di concessione, documento e SCIA via PEC; occorre essere inseriti nella graduatoria della singola fiera. Concessione degli eventuali posti liberi la mattina del mercato, senza garanzia di assegnazione."
    ],
    [
        "trentino-alto-adige-trento-fiera-festa-d-oro",
        "https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true",
        "Spuntisti: domanda di concessione, documento e SCIA via PEC; occorre essere inseriti nella graduatoria della singola fiera. Concessione degli eventuali posti liberi la mattina del mercato, senza garanzia di assegnazione."
    ],
    [
        "umbria-marsciano-fiera-verde",
        "https://www.umbriatourism.it/it/w/fiera-verde-event",
        "Avviso comunale originale 2026: domanda entro 31 marzo via PEC o Protocollo, scaduto; tardive soltanto con eventuale riserva. Graduatorie per categoria e ordine cronologico; requisiti Registro Imprese/REA da 12 mesi salvo hobbisti, abilitazione e DURC ove dovuti. Spunta solo sui posti non occupati, valida per la singola giornata; non disponibilità garantita."
    ],
    [
        "umbria-montecchio-fiera-della-castagna-di-melezzole",
        "https://www.comune.montecchio.tr.it/novita/notizie/novita_1162.html",
        "Avviso originale di quattro pagine: fiera 17, 18, 24 e 25 ottobre 2026, sabato 14–19 e domenica 8–19. Domanda entro 14 ottobre ore 12, graduatoria e requisiti; spunta solo su posti effettivamente vacanti. Canone dovuto ma importo non pubblicato nell’avviso. Il 26 ottobre presente in fonti secondarie non è adottato."
    ],
    [
        "umbria-perugia-fiera-dei-morti",
        "https://www.comune.perugia.it/novita/avviso-pubblico-per-lassegnazione-temporanea-dei-posteggi-liberi-in-occasione-della-fiera-dei-morti-del-1-5-novembre-2026/",
        "Avviso comunale e graduatorie definitive 2026: fiera tradizionale 1–5 novembre. Domanda di spunta entro 1 luglio 2026, scaduto, tramite PEC e modelli comunali; iscrizione Registro Imprese e abilitazione itinerante. I 28 posteggi dell’avviso (22 commercio, 3 agricoltura, 3 artigianato) erano oggetto della selezione, non posti attualmente liberi. Assenze concessionari utilizzabili dal giorno successivo e secondo graduatoria. Le iniziative del centro e anteprima 31 ottobre sono distinte."
    ],
    [
        "veneto-campodarsego-fiera-dell-angelo",
        "https://www.comune.campodarsego.pd.it/novita/fiera-dellangelo-2026/",
        "Procedure distinte per titolari del mercato, fieristi e Fiera degli Uccelli. Fieristi: richiesta originale al Protocollo, PEC o email con bollo 16 €, priorità alle presenze storiche, canone anticipato tramite pagoPA e conferma via PEC. Dopo il 10 marzo richieste valutate solo in base ai posti residui e all’ordine di arrivo. Occupazione entro le 8 e permanenza fino alle 19; spunta secondo graduatoria e merceologia."
    ],
    [
        "veneto-castelmassa-fiera-nazionale-di-san-martino",
        "https://www.comune.castelmassa.ro.it/novita/208-fiera-di-san-martino/",
        "208ª edizione, 6–9 novembre 2026. Avviso comunale: per la spunta come operatore precario, richiesta tramite SUAP entro il 7 settembre 2026 (termine trascorso); graduatoria e spunta venerdì 6 novembre. Il sito della manifestazione annuncia le date ma mantiene il programma in aggiornamento. Nessuna disponibilità garantita e nessuna quota corrente ricostruita."
    ]
];
    const confirmations = new Map(records.map(([id, sourceUrl, note]) => [id, { sourceUrl, note }]));
    function allows(event) {
        if (!event || event.managedEventId) return false;
        const confirmation = confirmations.get(event.id);
        return Boolean(confirmation && confirmation.sourceUrl === event.source?.url
            && confirmation.note === event.participation?.note);
    }
    const api = { allows };
    global.FairSpunta = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
