(function (global) {
    'use strict';
    const commonJS = typeof module !== 'undefined' && module.exports;
    const spunta = commonJS ? require('./fair-spunta') : global.FairSpunta;
    const badges = commonJS ? require('./fair-badges') : global.FairBadges;
    // Reviewed snapshots bind a confirmation to its documented editions.
    const legacyEditions = new Map([
  [
    "puglia-aradeo-sagra-te-lu-pummitoru-schiattarisciatu",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-31\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.aradeo.le.it/wp-content/uploads/2026/07/AVVISO-PUBBLICO-2026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "sicilia-chiusa-sclafani-sagra-delle-ciliegie",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.chiusasclafani.pa.it/wp-content/uploads/2026/05/Avviso-Sagra-delle-ciliegie-2026.pdf\"}],\"venue\":\"Piazza Castello\"}"
  ],
  [
    "calabria-castrovillari-fiera-delle-stagioni",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-12\",\"end\":\"2026-07-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.castrovillari.cs.it/notizie/3646223/bando-pubblico-assegnazione-posteggi-fiera\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.castrovillari.cs.it/notizie/3646223/bando-pubblico-assegnazione-posteggi-fiera\"}],\"venue\":\"Centro cittadino\"}"
  ],
  [
    "calabria-catanzaro-mercatino-degli-hobbisti",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.catanzaro.it/novita/mercati-tematici-in-piazza-prefettura-al-via-domenica-31-maggio-con-gli-hobbisti/\"}],\"venue\":\"Piazza Prefettura\"}"
  ],
  [
    "sardegna-ollolai-autunno-in-barbagia-ollolai",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.ollolai.nu.it/media/acfupload/Avviso_Autunno_in_Barbagia_2026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "lombardia-brescia-fiera-dei-santi-faustino-e-giovita",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"},{\"year\":2027,\"start\":\"2027-02-15\",\"end\":\"2027-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitbrescia.it/eventi/fiera-santi-faustino-e-giovita-brescia/\"}],\"venue\":\"Centro storico: via San Faustino, piazza Loggia, piazza Vittoria e vie limitrofe\"}"
  ],
  [
    "lombardia-brescia-fiera-della-madunina-dei-custu",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Corsica e via Sardegna\"}"
  ],
  [
    "lombardia-brescia-fiera-di-cristo-re",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Trento\"}"
  ],
  [
    "lombardia-brescia-fiera-di-ognissanti",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Milano e lato est di via Industriale\"}"
  ],
  [
    "lombardia-brescia-fiera-di-sant-angela-merici",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-27\",\"end\":\"2026-01-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Calini e via Crispi\"}"
  ],
  [
    "lombardia-brescia-fiera-di-sant-antonio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via San Francesco d’Assisi\"}"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-crocifissa-di-rosa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Crocifissa di Rosa e via Lombroso\"}"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-della-vittoria",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via Repubblica Argentina\"}"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-delle-grazie",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}],\"venue\":\"Via delle Grazie, via Capriolo e via Santa Caterina\"}"
  ],
  [
    "lombardia-desenzano-del-garda-mercatino-dell-antiquariato",
    "{\"editions\":[{\"year\":2026,\"label\":\"Prima domenica di ogni mese da febbraio a dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/\"}],\"venue\":\"Via Angelo Anelli – lungolago\"}"
  ],
  [
    "lombardia-desenzano-del-garda-un-mondo-di-vintage",
    "{\"editions\":[{\"year\":2026,\"label\":\"Prima domenica del mese, febbraio–dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/vintage/\"}],\"venue\":\"Via Angelo Anelli\"}"
  ],
  [
    "lombardia-roccafranca-sagra-del-quaranti-mercatino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.sagradelquaranti.it/area-espositori/\"}],\"venue\":\"Via Santi Martiri Gervasio e Protasio\"}"
  ],
  [
    "lombardia-codogno-fiera-autunnale-di-codogno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-17\",\"end\":\"2026-11-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.codogno.lo.it/edizioni-fiera-autunnale/fiera-edizione-2026/\"}],\"venue\":\"Quartiere fieristico e mercato fiera\"}"
  ],
  [
    "lombardia-imbersago-mercatino-dell-antico",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"}],\"venue\":\"Centro di Imbersago\"}"
  ],
  [
    "lombardia-arcore-fiera-di-sant-eustorgio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-21\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.arcore.mb.it/novita/notizia/fiera-di-s-eustorgio-2-2/\"}],\"venue\":\"\"}"
  ],
  [
    "lombardia-meda-fiera-di-calendimaggio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.meda.mb.it/trasparenza-rifiuti/dettaglio-notizia/Fiera-di-Calendimaggio-2026/\"}],\"venue\":\"Area Via Milano / Icmesa\"}"
  ],
  [
    "toscana-arezzo-fiera-antiquaria",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-03\",\"end\":\"2026-01-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-01-31\",\"end\":\"2026-02-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-06-06\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"}],\"venue\":\"Piazza Grande e centro storico\"}"
  ],
  [
    "toscana-arezzo-fiera-del-mestolo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-09\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.arezzo.it/novita/fiera-del-mestolo-edizione-di-settembre-2026\"}],\"venue\":\"Via Margaritone, Guadagnoli, Niccolò Aretino, Spinello, Arena Eden e via Signorelli\"}"
  ],
  [
    "toscana-castiglion-fibocchi-fiera-della-madonna-del-rosario",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.castiglionfibocchi.ar.it/notizie/Avviso-di-partecipazione-nei-posteggi-liberi-della-fiera-annuale-2026.html\"}],\"venue\":\"Piazza delle Fiere\"}"
  ],
  [
    "friuli-venezia-giulia-trieste-barbacan-produce",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"}],\"venue\":\"Piazza Barbacan, Arco di Riccardo, San Silvestro e scalinate delle Medaglie d’Oro\"}"
  ],
  [
    "lombardia-rosate-fiera-di-rosate",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.rosate.mi.it/index.php/it/news/1960545\"}],\"venue\":\"Via Roma e viale Rimembranze\"}"
  ],
  [
    "lombardia-rescaldina-fiera-autunnale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-05\",\"end\":\"2026-10-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.rescaldina.mi.it/it/news/1958472\"}],\"venue\":\"\"}"
  ],
  [
    "lombardia-serina-fiera-zootecnica-con-spunta-ambulanti",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-23\",\"end\":\"2026-09-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.serina.bg.it/novita/avvisi/dettaglio-notizia/Fiera-zootecnica-del-23-settembre-2026-Graduatoria-di-spunta/\"}],\"venue\":\"Sede da verificare nel programma\"}"
  ],
  [
    "lombardia-clusone-mercatini-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-07\",\"end\":\"2026-12-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-21\",\"end\":\"2026-12-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-24\",\"end\":\"2026-12-24\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2026-12-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-27\",\"end\":\"2026-12-27\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-28\",\"end\":\"2026-12-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-29\",\"end\":\"2026-12-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-30\",\"end\":\"2026-12-30\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-31\",\"end\":\"2026-12-31\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-01\",\"end\":\"2027-01-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-02\",\"end\":\"2027-01-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-03\",\"end\":\"2027-01-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-04\",\"end\":\"2027-01-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-05\",\"end\":\"2027-01-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-06\",\"end\":\"2027-01-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"}],\"venue\":\"Corte Sant’Anna e Piazza Orologio\"}"
  ],
  [
    "veneto-campodarsego-fiera-dell-angelo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campodarsego.pd.it/novita/fiera-dellangelo-2026/\"}],\"venue\":\"Piazza Europa, via Roma, via Manzoni, via Caltana e piazza San Martino\"}"
  ],
  [
    "veneto-sarcedo-mercatino-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sarcedo.vi.it/wp-content/uploads/2026/09/ALL_A_AVVISO-MANIFESTAZIONE-INTERESSE-MERCATINO-NATALE2026.pdf\"}],\"venue\":\"Piazza Vellere, Madonnetta\"}"
  ],
  [
    "veneto-colceresa-ciliegia-in-festa-mercatino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.colceresa.vi.it/novita/ciliegia-in-festa-2026-domenica-7-giugno-mercatino/\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-modena-fiera-di-sant-antonio",
    "{\"editions\":[{\"year\":2027,\"start\":\"2027-01-17\",\"end\":\"2027-01-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-modena-fiera-di-san-geminiano",
    "{\"editions\":[{\"year\":2027,\"start\":\"2027-01-31\",\"end\":\"2027-01-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-polinago-fiera-dello-statuto",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-12\",\"end\":\"2026-07-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.polinago.mo.it/Dettaglionews?IDNews=243403\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-sassuolo-mercato-stagionale-delle-domeniche-di-ottobre",
    "{\"editions\":[{\"year\":2026,\"label\":\"Domeniche di ottobre 2026: 4, 11, 18 e 25 ottobre\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}],\"venue\":\"Vie Crispi, San Giorgio, Pia e piazze Martiri Partigiani, Garibaldi e Libertà\"}"
  ],
  [
    "emilia-romagna-sassuolo-fiera-dei-tiramolla",
    "{\"editions\":[{\"year\":2026,\"label\":\"Giovedì Santo; data della singola edizione da confermare nel programma comunale\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}],\"venue\":\"Piazza Martiri Partigiani\"}"
  ],
  [
    "emilia-romagna-sassuolo-mercatino-hobbisti-antiquariato-e-vintage",
    "{\"editions\":[{\"year\":2026,\"label\":\"Primo sabato del mese; verificare eccezioni e calendario delle edizioni\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}],\"venue\":\"Piazza Garibaldi\"}"
  ],
  [
    "emilia-romagna-fontanellato-mercatino-dell-antiquariato",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://fontanellato.org/\"}],\"venue\":\"Attorno alla Rocca Sanvitale, centro e portici\"}"
  ],
  [
    "emilia-romagna-parma-remira-market",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://parmawelcome.it/evento/remira-market-2/\"}],\"venue\":\"La Galleria, via Emilia Est 7b\"}"
  ],
  [
    "emilia-romagna-montecchio-emilia-fiera-di-san-marco",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=035027&progr_fiera=1\"}],\"venue\":\"piazza repubblica e vie adiacenti\"}"
  ],
  [
    "emilia-romagna-rio-saliceto-mercatino-del-passato-arti-e-ingegno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.riosaliceto.re.it/it/eventi/614838\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.riosaliceto.re.it/it/eventi/614838\"}],\"venue\":\"Piazza Carducci e centro\"}"
  ],
  [
    "lombardia-azzate-mostra-dell-usaa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105073/fvw_calendario_eventi-marzo-2026.pdf\"},{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105121/fvw_calendario_eventi-aprile-2026.pdf\"},{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105241/fvw_calendario_eventi-maggio-2026.pdf\"},{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.proazzate.org/news.php?n=74\"}],\"venue\":\"Via Primo Maggio / via 2 Giugno\"}"
  ],
  [
    "lombardia-cantu-fiera-del-crocifisso",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html\"}],\"venue\":\"VIALE ALLA MADONNA 22063\"}"
  ],
  [
    "lombardia-cantu-fiera-di-s-apollonia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-09\",\"end\":\"2026-02-09\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24315\"}],\"venue\":\"VIALE ALLA MADONNA 22063\"}"
  ],
  [
    "lombardia-cantu-fiera-di-s-rocco",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-15\",\"end\":\"2026-08-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24313\"}],\"venue\":\"VIALE ALLA MADONNA 22063\"}"
  ],
  [
    "piemonte-viu-mostra-mercato-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.viu.to.it/Dettaglionews?IDNews=415085\"}],\"venue\":\"Centro cittadino\"}"
  ],
  [
    "piemonte-cavour-tuttomele",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"}],\"venue\":\"Piazza Sforzini, Via Borgi, Via Serassio, Piazza IV Novembre, Piazza Martiri della Libertà, Piazza Solferino ed area fieristica Via Goito\"}"
  ],
  [
    "piemonte-torino-gran-balon",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.balon.it/portfolio/gran-balon-ottobre-2026/\"}],\"venue\":\"Borgo Dora – 10152 Torino \"}"
  ],
  [
    "lombardia-gonzaga-mostra-mercato-del-c-era-una-volta-centro-storico",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-06\",\"end\":\"2026-01-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-06-02\",\"end\":\"2026-06-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-08-23\",\"end\":\"2026-08-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2026-12-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"}],\"venue\":\"Piazza Matteotti e vie adiacenti\"}"
  ],
  [
    "lombardia-cremona-fiera-san-pietro",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-28\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cremona.it/media/2846\"}],\"venue\":\"Viale Po, da piazza Cadorna a Barriera Po\"}"
  ],
  [
    "lombardia-soresina-sapori-e-colori-d-autunno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prolocosoresina.it/saporiecoloridautunno/\"}],\"venue\":\"Centro cittadino e area mercatale\"}"
  ],
  [
    "veneto-portogruaro-fiera-di-sant-andrea",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "piemonte-prato-sesia-mercatino-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.pratosesia.com/Mercatino/Mercatino2026/Mercatino2026Iscrizioni.htm\"}],\"venue\":\"P.za Marconi e Via Fra Dolcino\"}"
  ],
  [
    "piemonte-ghemme-natale-nelle-cantine",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"},{\"year\":2026,\"start\":\"2026-12-07\",\"end\":\"2026-12-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"}],\"venue\":\"Piazza Castello, Via Interno Castello e vicoli\"}"
  ],
  [
    "piemonte-roccabruna-fiera-di-valle",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.confagricolturacuneo.it/aperte-le-iscrizioni-per-la-xxii-fiera-di-valle-di-roccabruna-in-programma-domenica-4-ottobre-2026/\"}],\"venue\":\"Strada dei Catari - Piazza Giorsetti ? centro cittadino\"}"
  ],
  [
    "piemonte-cortemilia-roba-veja-e-antica",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-23\",\"end\":\"2026-08-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cortemilia.cn.it/Dettaglionews?IDNews=403074\"}],\"venue\":\"Borgo San Pantaleo: via Cavour, piazza Roma, corso Tripoli\"}"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-san-giuseppe",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-santa-croce",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-ala-fiera-di-san-luca",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre\"}],\"venue\":\"Via Tre Chiodi\"}"
  ],
  [
    "trentino-alto-adige-ala-fiera-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre\"}],\"venue\":\"Via Tre Chiodi\"}"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-di-santa-caterina",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-lavis-fiera-dei-ciucioi",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-santa-lucia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}],\"venue\":\"Centro di Trento, in particolare via Mazzini e via Oss Mazzurana\"}"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-della-festa-d-oro",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-trento-fiera-festa-d-oro",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-di-san-marco",
    "{\"editions\":[{\"year\":2026,\"dateType\":\"calendar\",\"label\":\"Domenica coincidente o antecedente il 25 aprile; giorno 2026 da confermare con il provvedimento annuale.\",\"sourceUrl\":\"https://www.comune.rovereto.tn.it/Servizi/Vendere-ai-mercati-saltuari\"}],\"venue\":\"\"}"
  ],
  [
    "trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-11-27\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-04\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-11\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-18\",\"end\":\"2026-12-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2027-01-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"}],\"venue\":\"Parco degli Asburgo\"}"
  ],
  [
    "trentino-alto-adige-pomarolo-mercatino-di-natale-di-pomarolo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"}],\"venue\":\"Località S. Antonio, proprietà Conti Bossi Fedrigotti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-di-pasquetta",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Piazza Vassallo, Greve\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-di-primavera-di-strada",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Strada in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-del-giaggiolo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"San Polo in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-stelle-e-mercanti-di-strada",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-11\",\"end\":\"2026-06-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Strada in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-della-schiacciata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Piazza Anichini, Lucolena\"}"
  ],
  [
    "toscana-greve-in-chianti-stelle-e-mercanti-di-greve",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-16\",\"end\":\"2026-07-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Greve in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-delle-castagne",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Piazza Anichini, Lucolena\"}"
  ],
  [
    "toscana-greve-in-chianti-aspettando-natale-a-greve",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Greve in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-natalizio-di-panzano",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Panzano in Chianti\"}"
  ],
  [
    "toscana-greve-in-chianti-mercatino-natalizio-di-strada",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}],\"venue\":\"Strada in Chianti\"}"
  ],
  [
    "toscana-san-casciano-in-val-di-pesa-fiera-arte-e-sport-di-cerbaia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.san-casciano-val-di-pesa.fi.it/vivere-il-comune/eventi/fiera-arte-e-sport-cerbaia-2026\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.san-casciano-val-di-pesa.fi.it/vivere-il-comune/eventi/fiera-arte-e-sport-cerbaia-2026\"}],\"venue\":\"Piazza del Monumento, Cerbaia\"}"
  ],
  [
    "toscana-scandicci-fierone-ambulante-di-scandicci",
    "{\"editions\":[{\"year\":2026,\"label\":\"Secondo giovedì di ottobre, ricorrenza annuale del Fierone\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.scandicci.fi.it/amministrazione/uffici/uo-62-sviluppo-economico\"}],\"venue\":\"\"}"
  ],
  [
    "lazio-velletri-fiera-della-madonna-delle-grazie",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.velletri.rm.it/area_letturaNotizia/630272/pagsistema.html\"}],\"venue\":\"\"}"
  ],
  [
    "lazio-montelibretti-fiera-di-san-nicola-da-bari",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.montelibretti.roma.it/wp-content/uploads/2026/03/AVVISO-PUBBLICO-FIERA-MAGGIO-2026_signed.pdf\"}],\"venue\":\"Vie e piazze del centro\"}"
  ],
  [
    "lazio-montelibretti-fiera-della-beata-vergine-del-carmine",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.montelibretti.roma.it/wp-content/uploads/2026/09/AVVISO-PUBBLICO-FIERA-11.10.-2026.pdf\"}],\"venue\":\"Vie e piazze del centro\"}"
  ],
  [
    "lazio-vicovaro-fiera-del-perdono",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comunedivicovaro.it/c058112/zf/index.php/atti-amministrativi/determine/dettaglio/atto/GT1RFeUB5PT0-H\"}],\"venue\":\"San Cosimato: Via Tiburtina dal largo della fontana all’Oasi Francescana e Via Valeria Vecchia\"}"
  ],
  [
    "emilia-romagna-cervia-mercato-straordinario-cervia-mare",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cervia.ra.it/it/page/mercati-straordinari-anno-2025\"},{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cervia.ra.it/it/page/mercati-straordinari-anno-2025\"}],\"venue\":\"Viale Roma\"}"
  ],
  [
    "emilia-romagna-casola-valsenio-festa-di-primavera-mercatino-artistico",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://proloco-casolavalsenio.blogspot.com/2026/02/festa-di-primavera-e-sfilata-dei-carri.html\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://proloco-casolavalsenio.blogspot.com/2026/02/festa-di-primavera-e-sfilata-dei-carri.html\"}],\"venue\":\"Via Marconi, via Matteotti e piazza Sasdelli\"}"
  ],
  [
    "emilia-romagna-cesena-fiera-di-san-giovanni",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-20\",\"end\":\"2026-06-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-sogliano-al-rubicone-fiera-del-formaggio-di-fossa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-cesena-fiera-di-primavera",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"Piazza del Popolo, viale Mazzoni, via Pio Battistini\"}"
  ],
  [
    "emilia-romagna-cesena-sagra-del-monte",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-15\",\"end\":\"2026-08-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"Piazzale Basilica del Monte\"}"
  ],
  [
    "emilia-romagna-cesena-fiera-d-autunno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"Piazza del Popolo, via Pio Battistini, viale Mazzoni\"}"
  ],
  [
    "emilia-romagna-cesena-fiera-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"Piazza del Popolo, via Pio Battistini, viale Mazzoni\"}"
  ],
  [
    "emilia-romagna-cesena-mercato-straordinario-d-ottobre",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "emilia-romagna-gambettola-mostrascambio-auto-moto-d-epoca-e-cose-del-passato",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-09\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mostrascambio.org/wp-content/uploads/2026/02/MODULO-MAGGIO-2026.pdf\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mostrascambio.org/wp-content/uploads/2026/07/MODULO-SETTEMBRE-2023.pdf\"}],\"venue\":\"Vie e piazze del centro\"}"
  ],
  [
    "emilia-romagna-bertinoro-mercatino-estivo-degli-hobbisti-sotto-le-stelle",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza estiva documentata; calendario specifico 2026 non recuperato.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.bertinoro.fc.it/myportal/C_A809/api/content/download?id=67a07740f75468009b468260\"}],\"venue\":\"Centro di Bertinoro\"}"
  ],
  [
    "emilia-romagna-pianello-val-tidone-fiera-del-primo-maggio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}],\"venue\":\"Centro storico, Piazza Umberto I e Piazza Alpini\"}"
  ],
  [
    "emilia-romagna-pianello-val-tidone-grande-fiera-d-agosto",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-26\",\"end\":\"2026-08-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}],\"venue\":\"Centro storico, Piazza Umberto I e Piazza Alpini\"}"
  ],
  [
    "emilia-romagna-pianello-val-tidone-fiera-di-san-maurizio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}],\"venue\":\"Centro storico, Piazza Umberto I e Piazza Alpini\"}"
  ],
  [
    "friuli-venezia-giulia-udine-fiera-di-santa-caterina",
    "{\"editions\":[{\"year\":2026,\"label\":\"Novembre: calendario 2026 da confermare; non dedotto dalla ricorrenza\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.udine.it/content/download/2424/43368/file/regolamento_AP_approvato_da_DC51_2023_-con_numero_determina.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "friuli-venezia-giulia-caneva-mercatini-di-natale-di-stevena",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.protramontidisotto.it/app/download/12436861294/Una_Montagna_di_Eventi_2026.pdf?t=1785246264\"}],\"venue\":\"\"}"
  ],
  [
    "friuli-venezia-giulia-brugnera-dal-campat-alla-piazza-mercatino-di-maron",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.festeggiamentimaron.it/wp-content/uploads/2026/09/Regolamento_Espositori_2026_def.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "friuli-venezia-giulia-san-vito-al-tagliamento-magia-di-natale-mercatino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prosanvito.it/natale/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prosanvito.it/natale/\"}],\"venue\":\"\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-dell-artigianato-artistico",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-17\",\"end\":\"2026-01-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-18\",\"end\":\"2026-01-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-14\",\"end\":\"2026-02-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-14\",\"end\":\"2026-03-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-18\",\"end\":\"2026-04-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-16\",\"end\":\"2026-05-16\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-20\",\"end\":\"2026-06-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}],\"venue\":\"piazza trento trieste \\\"listone\\\"\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-santa-teresa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=038008&progr_fiera=15\"}],\"venue\":\"Pontelagoscuro, via Venezia (piano comunale); collocazione 2026 da riconfermare\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-cose-d-altri-tempi-oggetti-da-collezione-e-dell-artigianato",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-03\",\"end\":\"2026-01-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-04\",\"end\":\"2026-01-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-31\",\"end\":\"2026-02-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-05\",\"end\":\"2026-04-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-02\",\"end\":\"2026-05-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-06\",\"end\":\"2026-06-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-11-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}],\"venue\":\"c.so porta reno\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-dicembre",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}],\"venue\":\"piazza travaglio (area parcheggio), corso porta reno e piazza trento trieste\"}"
  ],
  [
    "emilia-romagna-ferrara-il-baule-in-piazza-domenica-pontesana",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-11\",\"end\":\"2026-01-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-08\",\"end\":\"2026-02-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-08\",\"end\":\"2026-03-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-13\",\"end\":\"2026-09-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}],\"venue\":\"Piazza Bruno Buozzi\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-biagio",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Viale Aldighieri\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-giorgio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}],\"venue\":\"Viale Alfonso I d’Este\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-giorgio-lunga",
    "{\"editions\":[{\"year\":2026,\"label\":\"Primavera 2026: giornate commerciali da confermare. Il calendario regionale 27 marzo–3 maggio non coincide con il nuovo programma del luna park 2 aprile–3 maggio.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Area luna park; collocazione 2026 da riconfermare\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-quartesana",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Piazza Concetta Pusinanti, Quartesana\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-dei-buskers-i",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Piazza Travaglio (piano 2024)\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-dei-buskers-ii",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Piazza Trento Trieste (piano 2024)\"}"
  ],
  [
    "emilia-romagna-ferrara-fiera-delle-gare-del-palio",
    "{\"editions\":[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}],\"venue\":\"Via Palestro (piano 2024)\"}"
  ],
  [
    "emilia-romagna-cento-fiera-di-san-biagio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-03\",\"end\":\"2026-02-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cento.fe.it/it/eventi/fiera-di-san-biagio-edizione-2025\"}],\"venue\":\"Corso Guercino e centro storico\"}"
  ],
  [
    "toscana-lucca-mercato-antiquario",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.lucca.it/vivere-il-comune/eventi/mercato-antiquario/\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "toscana-pistoia-fiera-dell-antiquariato-la-cattedrale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-10\",\"end\":\"2026-01-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-02-07\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-03-07\",\"end\":\"2026-03-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-04-11\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-10-10\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"}],\"venue\":\"La Cattedrale, via Sandro Pertini 396\"}"
  ],
  [
    "liguria-genova-fiera-di-sant-agata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-01\",\"end\":\"2026-02-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.genova.it/vivere-il-comune/eventi/eventi-sociali/fiera-di-santagata\"}],\"venue\":\"Quartiere San Fruttuoso: corso Sardegna, piazza Terralba e vie limitrofe\"}"
  ],
  [
    "liguria-chiavari-fiera-di-sant-antonio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-17\",\"end\":\"2026-01-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "liguria-genova-fiera-di-san-pietro-e-paolo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-28\",\"end\":\"2026-06-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"FOCE\"}"
  ],
  [
    "liguria-campomorone-mercatino-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Piazza Marconi e vie laterali\"}"
  ],
  [
    "liguria-chiavari-fiera-di-luglio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-02\",\"end\":\"2026-07-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "liguria-genova-s-giuseppe",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"BOLZANETO\"}"
  ],
  [
    "liguria-genova-dell-angelo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"MOLASSANA\"}"
  ],
  [
    "liguria-genova-s-zita",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"CENTRO\"}"
  ],
  [
    "liguria-genova-libro-primavera",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-09\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.genova.it/sites/default/files/2026-03/proposta%20calendario%20fiere%202026_agg.30.03.2026_def.%20fiera%20libro%20prim.pdf\",\"periodOnly\":true}],\"venue\":\"PIAZZA MATTEOTTI / GALLERIA MAZZINI\"}"
  ],
  [
    "liguria-genova-s-salvatore",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"S. P. D'ARENA\"}"
  ],
  [
    "liguria-genova-maggio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"NERVI\"}"
  ],
  [
    "liguria-genova-s-rita",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-22\",\"end\":\"2026-05-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"CENTRO\"}"
  ],
  [
    "liguria-genova-struppa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"STRUPPA\"}"
  ],
  [
    "liguria-genova-s-antonio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"BOCCADASSE\"}"
  ],
  [
    "liguria-genova-s-pietro-pra",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"PRA'\"}"
  ],
  [
    "liguria-genova-del-mare",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-07-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"PEGLI\"}"
  ],
  [
    "liguria-genova-fiera-di-pontedecimo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-13\",\"end\":\"2026-09-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"PONTEDECIMO\"}"
  ],
  [
    "liguria-genova-ss-cosma-e-damiano",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"S. P. D'ARENA\"}"
  ],
  [
    "liguria-genova-cornigliano",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"CORNIGLIANO\"}"
  ],
  [
    "liguria-genova-s-carlo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"VOLTRI\"}"
  ],
  [
    "liguria-genova-s-carlino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"VOLTRI\"}"
  ],
  [
    "liguria-recco-fiera-s-g-battista",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-24\",\"end\":\"2026-06-24\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"CENTRO URBANO - P.ZZA S.G. BATTISTA\"}"
  ],
  [
    "liguria-recco-fiera-di-n-s-del-suffragio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-07\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.recco.ge.it/novita/notizie/novita_2052.html\"}],\"venue\":\"CENTRO URBANO- VIA ROMA\"}"
  ],
  [
    "liguria-lavagna-fiera-san-simone",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-28\",\"end\":\"2026-10-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.lavagna.ge.it/novita/fiera-san-simone-28-ottobre-2026/\"}],\"venue\":\"Centro cittadino; sedi definite dal Comune\"}"
  ],
  [
    "liguria-lavagna-fiera-dell-agricoltura",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-01\",\"end\":\"2026-03-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.lavagna.ge.it/novita/fiera-agricoltura-1-marzo-2026/\"}],\"venue\":\"Centro cittadino; sedi definite dal Comune\"}"
  ],
  [
    "piemonte-acqui-terme-fiera-di-santa-caterina",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=2\"}],\"venue\":\"Centro cittadino\"}"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-marzo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}],\"venue\":\"Giardini Pubblici c/o Piazza d'Armi\"}"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-aprile",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-14\",\"end\":\"2026-04-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}],\"venue\":\"Piazzale Divisione Meccanizzata Mantova\"}"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-agosto",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-25\",\"end\":\"2026-08-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}],\"venue\":\"Piazzale Divisione Meccanizzata Mantova\"}"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-novembre",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-10\",\"end\":\"2026-11-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}],\"venue\":\"Piazzale Divisione Meccanizzata Mantova\"}"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-dicembre",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}],\"venue\":\"Piazza Castello\"}"
  ],
  [
    "piemonte-murisengo-fiera-internazionale-del-tartufo-bianco-trifola-d-or",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=1\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=1\"}],\"venue\":\"Piazza della Vittoria, Via Umberto I^, Piazza Boario, Piazza Lavazza e Via Marconi\"}"
  ],
  [
    "piemonte-odalengo-piccolo-fiera-tufo-tartufo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.odalengopiccolo.al.it/Dettaglionews?IDNews=402931\"}],\"venue\":\"Centro cittadino\"}"
  ],
  [
    "piemonte-portacomaro-fiera-di-san-bartolomeo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-24\",\"end\":\"2026-08-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.portacomaro.at.it/Dettaglionews?IDNews=407982\"}],\"venue\":\"Piazza Roggero - Piazza Tamburello, Viale Degiani\"}"
  ],
  [
    "marche-urbania-fiera-delle-donne",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-urbania-fiera-san-giuseppe",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-urbania-fiera-san-marco",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-urbania-fiera-san-cristoforo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-urbania-fiera-san-luca",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-24\",\"end\":\"2026-10-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-urbania-fiera-dell-immacolata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}],\"venue\":\"CAPOLUOGO\"}"
  ],
  [
    "marche-cagli-fiera-di-san-vittore",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.cagli.ps.it/novita/fiera-di-san-vittore-2026/\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "marche-ancona-fiera-di-san-ciriaco",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://anconaservizi.it/la-fiera-di-san-ciriaco-2026/\"}],\"venue\":\"Viale della Vittoria, Corso Stamira, Via XXIX Settembre; Piazza Cavour\"}"
  ],
  [
    "marche-jesi-palio-di-san-floriano-arte-e-mestieri-medievali",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-08\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.jesi.an.it/documents/20119/1645442/PALIO%2BSAN%2BFLORIANO_MERCATINO%2BMEDIEVALE_AVVISO.pdf/79bc5b2b-0dd3-d093-20fb-2b4009e9a8b0?t=1776353015699\"}],\"venue\":\"Piazza della Repubblica\"}"
  ],
  [
    "umbria-campello-sul-clitunno-fiera-dell-antiquariato-del-rigattiere-e-del-collezionismo-d-arte",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campello.pg.it/servizi/imprese_e_commercio/servizio_41.html\"},{\"year\":2026,\"label\":\"Prima domenica di ogni mese; aprile eccezionalmente12aprile2026\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.campello.pg.it/vivere_il_comune/eventi/evento_1.html\"}],\"venue\":\"Pissignano · viale Settecamini e viale Fonti del Clitunno\"}"
  ],
  [
    "umbria-marsciano-fiera-verde",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-18\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.umbriatourism.it/it/w/fiera-verde-event\"}],\"venue\":\"Marsciano · area espositiva da verificare\"}"
  ],
  [
    "umbria-passignano-sul-trasimeno-mercatino-del-pidocchietto",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-18\",\"end\":\"2026-01-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-08-16\",\"end\":\"2026-08-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"}],\"venue\":\"Giardini Baldoni · centro storico\"}"
  ],
  [
    "umbria-perugia-fiera-dei-morti",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.perugia.it/novita/avviso-pubblico-per-lassegnazione-temporanea-dei-posteggi-liberi-in-occasione-della-fiera-dei-morti-del-1-5-novembre-2026/\"}],\"venue\":\"Pian di Massiano · area della fiera tradizionale\"}"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-baracca",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-06\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}],\"venue\":\"Via Baracca\"}"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-cortile-di-santa-chiara",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-19\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-28\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-30\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-04\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-10\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-17\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-08\",\"end\":\"2026-10-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-12\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-27\",\"end\":\"2026-11-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-04\",\"end\":\"2026-12-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}],\"venue\":\"Cortile di Santa Chiara\"}"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-carita-lato-monumento",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-30\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-24\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-27\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-02\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-13\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}],\"venue\":\"Piazza Carità – lato monumento\"}"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-diaz-e-largo-berlinguer",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-01-30\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-02-27\",\"end\":\"2026-03-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-22\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-02\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-29\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-14\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-02\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-12\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}],\"venue\":\"Via Diaz e Largo Berlinguer\"}"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-miraglia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-28\",\"end\":\"2026-03-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-22\",\"end\":\"2026-04-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-24\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-07-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-03\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-10\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-01\",\"end\":\"2026-12-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-11\",\"end\":\"2026-12-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-17\",\"end\":\"2026-12-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}],\"venue\":\"Piazza Miraglia\"}"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-di-costantinopoli",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-03\",\"end\":\"2026-03-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Largo Poerio, via Gesmundo e via Vittorio Veneto\"}"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-dell-annunziata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-24\",\"end\":\"2026-03-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Via Millico, chiesa dell’Annunziata\"}"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-di-sovereto",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Sovereto\"}"
  ],
  [
    "puglia-terlizzi-fiera-della-festa-patronale-del-carro",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-08\",\"end\":\"2026-08-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Viale Roma\"}"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-del-rosario",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Corso Dante e corso Garibaldi; food truck via Ravenna/Pisciniello\"}"
  ],
  [
    "puglia-terlizzi-fiera-degli-animali-e-attrezzature-agricole",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Via Carelli\"}"
  ],
  [
    "puglia-terlizzi-fiera-di-san-nicola",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}],\"venue\":\"Corso Dante e corso Garibaldi\"}"
  ],
  [
    "puglia-corato-fiera-di-san-cataldo-festa-patronale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-22\",\"end\":\"2026-08-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026\"}],\"venue\":\"Corsi e piazze del percorso fieristico\"}"
  ],
  [
    "puglia-corato-fiera-della-madonna-del-pozzo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-30\",\"end\":\"2026-08-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026\"}],\"venue\":\"Corsi e piazze del percorso fieristico\"}"
  ],
  [
    "puglia-sannicandro-di-bari-fiera-di-maggio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf\"}],\"venue\":\"Aree fieristiche comunali\"}"
  ],
  [
    "puglia-sannicandro-di-bari-fiera-di-ottobre",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf\"}],\"venue\":\"Aree fieristiche comunali\"}"
  ],
  [
    "puglia-bitetto-fiera-di-maria-ss-addolorata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.bitetto.ba.it/novita/fiera-in-onore-di-maria-ss-addolorata-del-6-settembre-2026/\"}],\"venue\":\"Piazza Moro e tratti terminali corso Garibaldi/via Beato Giacomo\"}"
  ],
  [
    "puglia-rutigliano-festa-del-grano-e-fiera-del-fischietto-estiva",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.rutigliano.ba.it/novita/manifestazione-di-interesse-per-lassegnazione-di-spazi-espositivi-casette-gazebo-in-occasione-della-manifestazione-30-edizione-festa-del-grano-e-fiera-del-fischietto-edizio/\"}],\"venue\":\"Piazze e vie del centro storico\"}"
  ],
  [
    "campania-salerno-fiera-del-crocifisso",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-06\",\"end\":\"2026-03-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-13\",\"end\":\"2026-03-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-20\",\"end\":\"2026-03-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-27\",\"end\":\"2026-03-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"}],\"venue\":\"Via Giovanni Paolo II, perimetro del Parco del Mercatello\"}"
  ],
  [
    "toscana-siena-fiera-di-santa-lucia",
    "{\"editions\":[{\"year\":2026,\"label\":\"13 dicembre di ogni anno; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Pian dei Mantellini\"}"
  ],
  [
    "toscana-siena-fiera-di-san-giuseppe",
    "{\"editions\":[{\"year\":2026,\"label\":\"19 marzo di ogni anno; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Via Giovanni Duprè\"}"
  ],
  [
    "toscana-siena-fiera-di-sant-isidoro-taverne-d-arbia",
    "{\"editions\":[{\"year\":2026,\"label\":\"Seconda domenica di maggio; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Via Principale, Taverne d’Arbia\"}"
  ],
  [
    "toscana-siena-mercatino-di-natale",
    "{\"editions\":[{\"year\":2026,\"label\":\"Dall’ultima domenica di novembre al 6 gennaio; eventuale prolungamento alla domenica se il 6 cade venerdì o sabato. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Piazza Gramsci e viale XXV Aprile; Natale anche piazza Matteotti\"}"
  ],
  [
    "toscana-siena-mercatino-di-pasqua",
    "{\"editions\":[{\"year\":2026,\"label\":\"Dalla terza domenica antecedente Pasqua al lunedì successivo; sospensioni possibili per il calcio. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Piazza Gramsci e viale XXV Aprile; Natale anche piazza Matteotti\"}"
  ],
  [
    "toscana-siena-mercatino-di-primavera",
    "{\"editions\":[{\"year\":2026,\"label\":\"24 aprile–21 maggio, con eventuale continuità rispetto al mercato pasquale. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Piazza Gramsci e viale XXV Aprile; Natale anche piazza Matteotti\"}"
  ],
  [
    "toscana-siena-mercatino-d-estate",
    "{\"editions\":[{\"year\":2026,\"label\":\"Fine 5 agosto; inizio discordante: 5 luglio nella scheda del Piano e 5 giugno nell’articolo 31 del Regolamento. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Piazza Gramsci e viale XXV Aprile; Natale anche piazza Matteotti\"}"
  ],
  [
    "toscana-siena-mercatino-d-autunno",
    "{\"editions\":[{\"year\":2026,\"label\":\"10 settembre–10 ottobre; eventuali sospensioni per il calcio. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Piazza Gramsci e viale XXV Aprile; Natale anche piazza Matteotti\"}"
  ],
  [
    "toscana-siena-mercato-mensile-dell-antiquariato",
    "{\"editions\":[{\"year\":2026,\"label\":\"Terza domenica del mese; ad agosto quarta domenica. Ricorrenza regolamentare, nessuna data annuale calcolata.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}],\"venue\":\"Tartarugone, piazza del Mercato\"}"
  ],
  [
    "toscana-san-gimignano-fiera-di-sant-agostino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sangimignano.si.it/it/news/132950/divieto-di-presenza-degli-operatori-commerciali-non-assegnatari-fissi-alla-fiera-di-santagostino-del-29-agosto\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-gabbro",
    "{\"editions\":[{\"year\":2026,\"label\":\"30 settembre di ogni anno. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Parco Collecchi e piazza della Chiesa\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-castelnuovo-della-misericordia",
    "{\"editions\":[{\"year\":2026,\"label\":\"Terza domenica di ottobre e lunedì successivo. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Piazza Gramsci e via Traversa Livornese\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-solvay",
    "{\"editions\":[{\"year\":2026,\"label\":\"1 e 2 ottobre di ogni anno. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Piazza Monte alla Rena\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-marittimo",
    "{\"editions\":[{\"year\":2026,\"label\":\"10 settembre, San Nicola. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Piazza San Nicola\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-vada",
    "{\"editions\":[{\"year\":2026,\"label\":\"Lunedì successivo all’Assunzione e domenica precedente. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Piazza Garibaldi e via di Marina\"}"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-nibbiaia",
    "{\"editions\":[{\"year\":2026,\"label\":\"Lunedì successivo alla seconda domenica di ottobre. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}],\"venue\":\"Piazza Barontini e piazza Mazzini\"}"
  ],
  [
    "toscana-campiglia-marittima-fierone-di-venturina-terme",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-26\",\"end\":\"2026-08-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campigliamarittima.li.it/area_letturaNotizia/637439/pagsistema.html\"}],\"venue\":\"Centro di Venturina Terme\"}"
  ],
  [
    "liguria-savona-fiera-di-santa-lucia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Via Paleocapa / C.so Italia / Via Manzoni\"}"
  ],
  [
    "liguria-borghetto-santo-spirito-fiera-di-sant-antonio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Via Ponti\"}"
  ],
  [
    "liguria-borghetto-santo-spirito-fiera-di-san-matteo",
    "{\"editions\":[{\"year\":2026,\"label\":\"Settembre: Regione e modulo indicano 21/9; una fonte automatica riporta anche 13/9 senza atto comunale risolutivo. Data operativa da verificare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.borghettosantospirito.sv.it/download-file/16618\"}],\"venue\":\"Piazza Caduti sul Lavoro\"}"
  ],
  [
    "liguria-savona-fiera-nostra-signoria-di-misericordia",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Fraz. Santuario\"}"
  ],
  [
    "liguria-savona-fiera-santa-rita",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-22\",\"end\":\"2026-05-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Quartiere S.Rita\"}"
  ],
  [
    "liguria-savona-fiera-nativita-di-maria-vergine",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Santuario\"}"
  ],
  [
    "liguria-savona-fiera-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Piazza del Popolo (lato monte) / Via Monte Sisto\"}"
  ],
  [
    "liguria-ameglia-notte-blu",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ameglia.sp.it/novita/notizie/novita_573.html\"},{\"year\":2026,\"start\":\"2026-08-21\",\"end\":\"2026-08-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.halleyweb.com/c011001/zf/index.php/atti-amministrativi/delibere/dettaglio/atto/G1WpFeETqTT0-A\"}],\"venue\":\"Bocca di Magra e Fiumaretta\"}"
  ],
  [
    "liguria-la-spezia-mercatini-degli-hobbisti",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-01\",\"end\":\"2026-07-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-02\",\"end\":\"2026-07-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-13\",\"end\":\"2026-07-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-18\",\"end\":\"2026-07-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-22\",\"end\":\"2026-07-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-28\",\"end\":\"2026-07-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-22\",\"end\":\"2026-09-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-23\",\"end\":\"2026-09-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-06\",\"end\":\"2026-10-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-14\",\"end\":\"2026-10-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-21\",\"end\":\"2026-10-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-10-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"}],\"venue\":\"Via Chiodo, via Diaz, via Veneto, piazza Garibaldi/Saint Bon, Migliarina secondo il singolo giorno\"}"
  ],
  [
    "piemonte-santhia-fiera-di-santa-caterina",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.santhia.vc.it/Dettaglionews?IDNews=411440\"}],\"venue\":\"Corso Italia. Corso S. Ignazio, P.za A. Moro,, P.za Roma, P.za . Giovanni XXIII\"}"
  ],
  [
    "piemonte-crescentino-fiera-del-campanile",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.crescentino.vc.it/Dettaglionews?IDNews=386826\"}],\"venue\":\"Via Michelangelo tra Via Biletta e Via Angelini\"}"
  ],
  [
    "lombardia-tirano-fiera-di-pentecoste",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-24\",\"end\":\"2026-05-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"},{\"year\":2026,\"start\":\"2026-05-25\",\"end\":\"2026-05-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}],\"venue\":\"VIA DIVERSE VIE CITTADINE 23037\"}"
  ],
  [
    "lombardia-tirano-fiera-di-san-michele",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}],\"venue\":\"VIA DIVERSE VIE CITTADINE 23037\"}"
  ],
  [
    "lombardia-tirano-fiera-di-primavera",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}],\"venue\":\"VIA DIVERSE VIE CITTADINE 23037\"}"
  ],
  [
    "lombardia-tirano-fiera-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-11\",\"end\":\"2026-11-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}],\"venue\":\"VIA DIVERSE VIE CITTADINE 23037\"}"
  ],
  [
    "lombardia-novate-mezzola-mercatini-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.novatemezzola.so.it/c014046/po/attachment_news.php?id=1291\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "veneto-castelmassa-fiera-nazionale-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-06\",\"end\":\"2026-11-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.castelmassa.ro.it/novita/208-fiera-di-san-martino/\"}],\"venue\":\"Vie e piazze del centro\"}"
  ],
  [
    "liguria-santo-stefano-al-mare-fiera-di-santo-stefano",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-09\",\"end\":\"2026-08-09\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}],\"venue\":\"Lungomare\"}"
  ],
  [
    "valle-d-aosta-pre-saint-didier-creativa",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-22\",\"end\":\"2026-08-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/artigianato-fiere-mercatini/pre-saint-didier/creativa-fiera-della-creativita-valdostana-femminile/28797\"}],\"venue\":\"Centro paese\"}"
  ],
  [
    "valle-d-aosta-fenis-castello-in-fiera",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-04-11\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.acoteduchateau.com/area-espositori\"}],\"venue\":\"Ai piedi del Castello\"}"
  ],
  [
    "valle-d-aosta-nus-lo-martchia-de-tsalende",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.nus.ao.it/wp-content/uploads/2026/10/bando-mostra-mercato-natale-2026.pdf\"}],\"venue\":\"Via Risorgimento\"}"
  ],
  [
    "valle-d-aosta-chatillon-sagra-del-miele-e-dei-suoi-derivati",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/eventi-enogastronomici/chatillon/sagra-del-miele/21409\"}],\"venue\":\"Via Chanoux e Via Tollen\"}"
  ],
  [
    "valle-d-aosta-chatillon-le-petit-marche-du-bourg",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/fiere-e-mercatini/chatillon/le-petit-marche-du-bourg-mercatino-di-natale/21410\"}],\"venue\":\"Via Chanoux e Via Tollen\"}"
  ],
  [
    "marche-montefano-sapori-d-autunno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.montefano.mc.it/wp-content/blogs.dir/43/files/3-All.-Det-Bando-Fiera-Sapori-2026.pdf\"}],\"venue\":\"Centro storico: via San Donato e via della Vittoria; aree Pro Loco distinte\"}"
  ],
  [
    "marche-pollenza-fiera-di-primavera",
    "{\"editions\":[{\"year\":2026,\"label\":\"02-giu\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=16\",\"start\":\"2026-06-02\",\"end\":\"2026-06-02\"}],\"venue\":\"CASETTE VERDINI\"}"
  ],
  [
    "marche-civitanova-marche-civitanova-vintage-market",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-18\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mercatiniantiquari.com/appuntamenti.html\"}],\"venue\":\"Area basket dietro il Teatro Cecchetti / lungomare, secondo il programma comunale\"}"
  ],
  [
    "marche-fermo-fiera-di-santa-maria",
    "{\"editions\":[{\"year\":2026,\"label\":\"PRIMA DOMENICA DI AGOSTO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7\"}],\"venue\":\"FERMO CENTRO\"}"
  ],
  [
    "marche-fermo-fiera-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitfermo.it/wp-content/uploads/2026/10/pieghevole-autunno-2026.pdf\",\"label\":\"2026-12-08\"}],\"venue\":\"FERMO CENTRO\"}"
  ],
  [
    "marche-fermo-fiera-di-san-savino",
    "{\"editions\":[{\"year\":2026,\"label\":\"16 AGOSTO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7\",\"start\":\"2026-08-16\",\"end\":\"2026-08-16\"}],\"venue\":\"MARINA PALMENSE\"}"
  ],
  [
    "marche-montegranaro-fiera-di-san-giuseppe",
    "{\"editions\":[{\"year\":2026,\"label\":\"DOMENICA PRECEDENTE AL 19 MARZO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=13\"}],\"venue\":\"CENTRO STORICO\"}"
  ],
  [
    "marche-comunanza-mostra-ornitologica",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"label\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.comunanza.ap.it/novita/notizie/novita_85.html\"}],\"venue\":\"Vie Ascoli, E. Pascali, Galilei, traverse Mazzini e G. Bruno, Trieste e Trento\"}"
  ],
  [
    "marche-comunanza-fiera-di-santa-caterina",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"label\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.comunanza.ap.it/novita/notizie/novita_86.html\"}],\"venue\":\"Vie Ascoli, Dante, Mazzini e Piazza Garibaldi\"}"
  ],
  [
    "marche-montefiore-dell-aso-fiera-grande-d-autunno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"label\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://montefiore-dell-aso-api.municipiumapp.it/s3/4332/allegati/atto-originale.pdf\"}],\"venue\":\"Centro storico; scelta presso Municipio, Piazza della Repubblica 2\"}"
  ],
  [
    "marche-roccafluvione-fiera-delle-piante-e-mostra-mercato-del-tartufo-e-dei-prodotti-tipici",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-03-08\",\"end\":\"2026-03-08\",\"label\":\"8 marzo 2026: Primavera comunale in concomitanza con Fiera delle Piante Pro Loco\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.halleyweb.com/c044064/de/attachment.php?serialDocumento=00PKOF020262Q&p7m=1\"}],\"venue\":\"Roccafluvione: parcheggio SS78/Viale della Resistenza, via Foscolo e altre vie assegnate; esposizione Pro Loco concomitante\"}"
  ],
  [
    "marche-san-benedetto-del-tronto-fiera-della-madonna-della-marina",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-25\",\"end\":\"2026-07-26\",\"label\":\"2026-07-25 – 2026-07-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://sportellounico.comunesbt.it/suap/wp-content/blogs.dir/3/files/sites/3/2026/07/DGC-n.-101-del-15.07.2026.pdf\"}],\"venue\":\"Capoluogo\"}"
  ],
  [
    "abruzzo-popoli-fiera-dell-immacolata-concezione",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817\"}],\"venue\":\"\"}"
  ],
  [
    "abruzzo-lanciano-fiera-di-sant-egidio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-31\",\"end\":\"2026-08-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.lanciano.ch.it/ocmultibinary/download/5225/124704/2/13f3fcd7d9e76a68c0848f4ed42c9fe5.pdf/file/INFORMATIVA%2BFIERA%2BDI%2BSANT_EGIDIO%2B2026_signed.pdf\"}],\"venue\":\"Piazza Plebiscito, Corso Trento e Trieste, via dei Frentani e Piazza Garibaldi\"}"
  ],
  [
    "abruzzo-fara-san-martino-fiera-tradizionale-del-29-giugno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-29\",\"end\":\"2026-06-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}],\"venue\":\"Fara San Martino, aree definite dal Comune\"}"
  ],
  [
    "abruzzo-fara-san-martino-fiera-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-11\",\"end\":\"2026-11-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}],\"venue\":\"Fara San Martino, aree definite dal Comune\"}"
  ],
  [
    "abruzzo-fara-san-martino-feste-patronali-posteggi-commerciali",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-24\",\"end\":\"2026-08-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}],\"venue\":\"Fara San Martino, aree definite dal Comune\"}"
  ],
  [
    "lazio-aprilia-fiera-di-san-michele-arcangelo",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-26\",\"end\":\"2026-09-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.aprilia.lt.it/sites/comune.aprilia.lt.it/files/2026-09/COMUNICATO%20agli%20operatori%20SAN%20MICHELE%202026.pdf\"}],\"venue\":\"\"}"
  ],
  [
    "lazio-aprilia-mercatino-dell-usato-dell-artigianato-del-collezionismo-e-dell-hobbistica",
    "{\"editions\":[],\"venue\":\"Piazza Roma e primo tratto di Via dei Lauri\"}"
  ],
  [
    "lazio-sezze-fiera-della-croce",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sezze.lt.it/dam/jcr%3A0f137cd6-8e18-4224-95c5-d515abbb615e/AVVISO%20PUBBLICO%20BANDO%20ALLEGATO%20A.pdf\"}],\"venue\":\"Porta Pascibella, Via Marconi e Via San Leonardo\"}"
  ],
  [
    "lazio-prossedi-fiera-di-sant-agata",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.prossedi.lt.it/wp-content/uploads/2026/06/Avviso-SantAgata.pdf\"}],\"venue\":\"Piazza Umberto I\"}"
  ],
  [
    "lazio-fabrica-di-roma-mercatino-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"}],\"venue\":\"\"}"
  ],
  [
    "lazio-cassino-mercatino-dell-antiquariato-e-del-vintage",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.cassino.fr.it/it-it/vivere-il-comune/eventi/venerdi-1-maggio-con-cassino-in-fiore-2026-e-mercatino-dell-antiquariato-e-del-vintage-125614-1-1baf6962e7ded267c56e5a15b5050a62\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cassino.fr.it/it-it/novita/avvisi/2026/commercio-e-mercati/domenica-18-ottobre-il-mercatino-dell-antiquariato-e-del-vintage-403905-1-2bd4f301cea35a0fe500d52a1a131660\"}],\"venue\":\"\"}"
  ],
  [
    "lazio-supino-fiera-delle-quattro-strade",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.supino.fr.it/it/news/bando-per-la-concessione-temporanea-di-suolo-pubblico-per-l-esercizio-del-commercio-su-aree-max-60-psteggi?type=3\"}],\"venue\":\"\"}"
  ],
  [
    "umbria-montecchio-fiera-della-castagna-di-melezzole",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.montecchio.tr.it/novita/notizie/novita_1162.html\"},{\"year\":2026,\"start\":\"2026-10-24\",\"end\":\"2026-10-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.montecchio.tr.it/novita/notizie/novita_1162.html\"}],\"venue\":\"\"}"
  ],
  [
    "puglia-oria-fiera-di-san-barsanofrio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.oriaestate.it/eventi/184-fiera-di-san-barsanofio\"}],\"venue\":\"Via Torre Santa Susanna e viale Grande Europa, area stadio\"}"
  ],
  [
    "campania-montefalcione-i-mercatini-di-tok-tok-giugno",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-06-19\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}],\"venue\":\"Villa Artistica Gargiulo Castiglione, via Pietra Cupa1\"}"
  ],
  [
    "campania-montefalcione-i-mercatini-di-tok-tok-luglio",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-07-03\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}],\"venue\":\"Villa Artistica Gargiulo Castiglione, via Pietra Cupa1\"}"
  ],
  [
    "campania-montefalcione-le-favole-del-natale-mercatini-di-natale",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}],\"venue\":\"Villa Artistica Gargiulo Castiglione, via Pietra Cupa1\"}"
  ],
  [
    "sardegna-sanluri-festa-del-borgo-e-sagra-del-civraxu",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sanluri.su.it/novita/il-27-settembre-la-29esima-festa-del-borgo-e-la-sagra-del-civraxu/\"}],\"venue\":\"Centro storico\"}"
  ],
  [
    "abruzzo-sulmona-caccia-all-affare-mercatino-vintage",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-08-14\",\"end\":\"2026-08-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mercatiniantiquari.com/cacciaallaffaresulmona.html\"}],\"venue\":\"Giardini della Villa Comunale\"}"
  ],
  [
    "piemonte-gattinara-fiera-di-san-martino",
    "{\"editions\":[{\"year\":2026,\"start\":\"2026-11-10\",\"end\":\"2026-11-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044\"}],\"venue\":\"Corso Valsesia, Corso Garibaldi, Corso Vercelli, Piazza Cinema Italia e Piazza Paolotti\"}"
  ]
]);
    const reviewed = new Map([
  [
    "lombardia-concesio-fiera-di-sant-andrea",
    {
      "sourceUrl": "https://www.procedimenti.servizirl.it/sagre/public/programma/27029",
      "note": "Il calendario pubblica la manifestazione ma non una procedura di iscrizione per gli ambulanti. Chiedi al Comune o all’organizzatore se ammette il tuo settore, quali posteggi sono previsti e come presentare domanda, con relativi costi.",
      "editions": "[{\"year\":2026,\"start\":\"2026-11-30\",\"end\":\"2026-11-30\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/27029\"}]",
      "editionKeys": [
        "{\"year\":2026,\"start\":\"2026-11-30\",\"end\":\"2026-11-30\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/27029\"}"
      ],
      "facts": [
        {
          "topic": "spunta",
          "kind": "spunta",
          "status": "yes",
          "label": "Spunta con graduatoria",
          "title": "Fiera del 30 novembre 2026. Graduatoria di spunta riapprovata con determina 821 del 16/11/2026, che rettifica la 808/2026. Requisiti, convocazione e accesso richiedono verifica; nessun posto garantito.",
          "sourceUrl": "https://www.comune.concesio.bs.it/s3/2293/allegati/uffici/ecologia/2026/det_00821_16-11-2026.pdf",
          "locator": "pp. 2 e 5, riapprovazione graduatoria di spunta",
          "checkedAt": "2026-11-20",
          "notice": "Graduatoria già pubblicata; nuovi accessi da verificare."
        }
      ],
      "venue": "Via Sant'Andrea"
    }
  ],
  [
    "lombardia-gussago-fiera-dell-uva",
    {
      "sourceUrl": "https://www.comune.gussago.bs.it/novita/avvisi/novita_481.html",
      "note": "Bando per imprese iscritte alla CCIAA con autorizzazione al commercio su aree pubbliche di tipo A/B e imprenditori agricoli. Domanda esclusivamente telematica su Impresa in un giorno entro il termine del bando.",
      "editions": "[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.gussago.bs.it/novita/avvisi/novita_481.html\"}]",
      "editionKeys": [
        "{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.gussago.bs.it/novita/avvisi/novita_481.html\"}"
      ],
      "facts": [
        {
          "topic": "spunta",
          "kind": "no-spunta",
          "status": "no",
          "label": "No spunte",
          "title": "Solo fiera mercatale del 27 settembre 2026, Piazza Vittorio Veneto. Punto 8 del bando: spunta vietata. Non esteso alle altre aree della Festa dell Uva né al 2027.",
          "sourceUrl": "https://www.comune.gussago.bs.it/novita/avvisi/novita_481.html",
          "locator": "Bando 56a Festa dell Uva, punto 8",
          "checkedAt": "2026-11-20",
          "notice": ""
        }
      ],
      "venue": "Area mercatale di piazza Vittorio Veneto"
    }
  ],
  [
    "lombardia-castegnato-mercatini-di-natale",
    {
      "sourceUrl": "https://www.procedimenti.servizirl.it/sagre/public/programma/24485",
      "note": "Il calendario pubblica la manifestazione ma non una procedura di iscrizione per gli ambulanti. Chiedi al Comune o all’organizzatore se ammette il tuo settore, quali posteggi sono previsti e come presentare domanda, con relativi costi.",
      "editions": "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24485\"}]",
      "editionKeys": [
        "{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24485\"}"
      ],
      "facts": [
        {
          "topic": "hobby",
          "kind": "hobby",
          "status": "yes",
          "label": "Hobbisti ammessi",
          "title": "6 dicembre 2026, Piazza Dante. Solo oggetti e creazioni del proprio lavoro e ingegno; esclusa la merce acquistata per rivenderla. Domanda e assegnazione richieste. Termine prorogato al 15 novembre 2026 con determinazione 436 del 27/10/2026, ora trascorso; residui da verificare.",
          "sourceUrl": "https://mycity.s3.sbg.io.cloud.ovh.net/5349365/Avviso.pdf",
          "locator": "Avviso 2026 art. 1 e modulo hobbisti, dichiarazioni",
          "checkedAt": "2026-11-20",
          "notice": "Solo creazioni proprie; domande scadute."
        }
      ],
      "venue": "Piazza Dante"
    }
  ],
  [
    "lombardia-paitone-mercatini-di-natale",
    {
      "sourceUrl": "https://www.procedimenti.servizirl.it/sagre/public/programma/25889",
      "note": "Il calendario pubblica la manifestazione ma non una procedura di iscrizione per gli ambulanti. Chiedi al Comune o all’organizzatore se ammette il tuo settore, quali posteggi sono previsti e come presentare domanda, con relativi costi.",
      "editions": "[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/25889\"}]",
      "editionKeys": [
        "{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/25889\"}"
      ],
      "facts": [
        {
          "topic": "hobby",
          "kind": "hobby",
          "status": "yes",
          "label": "Hobbisti ammessi",
          "title": "Villaggio di Natale, Piazza Pertini, 13 dicembre 2026. Hobbisti previsti dal modulo comunale; domanda entro il 15 novembre 2026. Requisiti e assegnazione restano necessari; nessun posto garantito.",
          "sourceUrl": "https://www.comune.paitone.bs.it/area_letturaNotizia/46239/pagsistema.html",
          "locator": "Avviso 27/10/2026 e domanda, categorie",
          "checkedAt": "2026-11-20",
          "notice": "Domande scadute il 15/11/2026."
        }
      ],
      "venue": "Piazza Pertini"
    }
  ],
  [
    "lombardia-coccaglio-festa-patronale-e-mercatini",
    {
      "sourceUrl": "https://www.procedimenti.servizirl.it/sagre/public/programma/26183",
      "note": "Ammissione tramite l’organizzatore per gli espositori del settore indicato. Chiedi requisiti, selezione, disponibilità, giornate effettive di vendita e preventivo; la presenza di bancarelle non equivale a un bando aperto.",
      "editions": "[{\"year\":2026,\"label\":\"22 novembre indicato nel calendario 2026; titolo e programma ancora riferiti al 2025, da confermare\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/26183\"}]",
      "editionKeys": [
        "{\"year\":2026,\"label\":\"22 novembre indicato nel calendario 2026; titolo e programma ancora riferiti al 2025, da confermare\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/26183\"}"
      ],
      "facts": [
        {
          "topic": "hobby",
          "kind": "hobby",
          "status": "yes",
          "label": "Hobbisti ammessi",
          "title": "Mercatini patronali del 22 novembre 2026: modulo per hobbisti privati. Il Comune ha chiuso le prenotazioni il 19 ottobre per raggiunto limite di posti. Le istruzioni richiedono prenotazione e prevedono allontanamento degli espositori non prenotati; non è una conferma di spunta.",
          "sourceUrl": "https://www.comune.coccaglio.bs.it/export/sites/default/.galleries/documenti/eventi-news/DOMANDA.pdf",
          "locator": "Modulo 2026 p. 1; istruzioni e avviso chiusura 19/10/2026",
          "checkedAt": "2026-11-20",
          "notice": "Solo espositori già prenotati; iscrizioni chiuse."
        }
      ],
      "venue": "Zona Centro Storico"
    }
  ],
  [
    "lombardia-desenzano-del-garda-mercatino-dell-antiquariato",
    {
      "sourceUrl": "https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/",
      "note": "Ammessi operatori con partita IVA e hobbisti. Compilare il modulo dell’organizzatore e dichiarare la merce; esporre soltanto antiquariato o oggetti usati di almeno 40 anni.",
      "editions": "[{\"year\":2026,\"label\":\"Prima domenica di ogni mese da febbraio a dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/\"}]",
      "editionKeys": [
        "{\"year\":2026,\"label\":\"Prima domenica di ogni mese da febbraio a dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/\"}"
      ],
      "facts": [
        {
          "topic": "spunta",
          "kind": "spunta",
          "status": "yes",
          "label": "Spunte ammesse",
          "title": "Edizioni 2026 documentate: l associazione assegna gli eventuali posti liberi agli spuntisti entro le 8:30. Ammessi solo prodotti conformi al regolamento dell antiquariato; requisiti e disponibilità da verificare.",
          "sourceUrl": "https://www.antiquariatovintagedesenzano.it/regolamento-antiquariato/",
          "locator": "Paragrafo occupazione del posteggio",
          "checkedAt": "2026-11-20",
          "notice": "Spunta entro le 8:30, solo su posti liberi."
        }
      ],
      "venue": "Via Angelo Anelli – lungolago"
    }
  ],
  [
    "lombardia-desenzano-del-garda-un-mondo-di-vintage",
    {
      "sourceUrl": "https://www.antiquariatovintagedesenzano.it/vintage/",
      "note": "Ammessi espositori con partita IVA e hobbisti, selezionati per diversificare la merceologia. Usare il modulo specifico per il vintage; verificare tariffe e requisiti senza applicare quelli della sezione antiquariato.",
      "editions": "[{\"year\":2026,\"label\":\"Prima domenica del mese, febbraio–dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/vintage/\"}]",
      "editionKeys": [
        "{\"year\":2026,\"label\":\"Prima domenica del mese, febbraio–dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/vintage/\"}"
      ],
      "facts": [
        {
          "topic": "spunta",
          "kind": "spunta",
          "status": "yes",
          "label": "Spunte ammesse",
          "title": "Edizioni 2026 documentate: l associazione assegna gli eventuali posti liberi agli spuntisti entro le 8:30. Solo merce conforme al regolamento Vintage; esclusi prodotti nuovi o recenti anche artigianali. Requisiti e disponibilità da verificare.",
          "sourceUrl": "https://www.antiquariatovintagedesenzano.it/regolamento-vintage/",
          "locator": "Paragrafo occupazione della postazione",
          "checkedAt": "2026-11-20",
          "notice": "Spunta entro le 8:30, solo su posti liberi."
        }
      ],
      "venue": "Via Angelo Anelli"
    }
  ]
]);
    const editionKey = edition => JSON.stringify(edition);
    function get(event, { edition = null, now = new Date() } = {}) {
        if (!event) return [];
        const facts = badges?.get(event, { edition, now }) || [];
        const snapshot = legacyEditions.get(event.id);
        const legacyMatches = !event.managedEventId && edition && snapshot === JSON.stringify({ editions: event.editions, venue: event.venue || '' })
            && event.editions.some(item => editionKey(item) === editionKey(edition));
        const rows = [
            { topic: 'spunta', kind: 'unknown-spunta', status: 'unknown', label: 'Spunta da verificare', title: 'Spunta non verificata per questa edizione. Non significa che sia vietata.' },
            { topic: 'hobby', kind: 'unknown-hobby', status: 'unknown', label: 'Hobbisti da verificare', title: 'Ammissione degli hobbisti non verificata per questa edizione. Non significa che siano esclusi.' }
        ];
        const noSpunta = facts.find(item => item.kind === 'no-spunta');
        const hobby = facts.find(item => item.kind === 'hobby');
        const noHobby = facts.find(item => item.kind === 'no-hobby');
        if (legacyMatches && noSpunta) Object.assign(rows[0], noSpunta, { status: 'no' });
        else if (legacyMatches && spunta?.allows(event)) Object.assign(rows[0], {
            kind: 'spunta', status: 'yes', label: 'Spunte ammesse',
            title: 'Spunta prevista nelle modalità di partecipazione. Requisiti e termini nella scheda; assegnazione solo sui posti liberi.',
            sourceUrl: event.source?.url
        });
        if (legacyMatches && noHobby) Object.assign(rows[1], noHobby, { status: 'no' });
        else if (legacyMatches && hobby) Object.assign(rows[1], hobby, { status: 'yes', sourceUrl: event.source?.url });
        const record = reviewed.get(event.id);
        if (!event.managedEventId && edition && record && record.sourceUrl === event.source?.url
            && record.note === event.participation?.note && record.venue === (event.venue || '') && record.editions === JSON.stringify(event.editions)
            && record.editionKeys.includes(editionKey(edition))) {
            for (const fact of record.facts) {
                Object.assign(rows[fact.topic === 'spunta' ? 0 : 1], fact);
            }
        }
        return rows;
    }
    function notices(event, options) {
        return [...new Set(get(event, options).map(item => item.notice).filter(Boolean))];
    }
    const api = { get, notices };
    global.FairParticipation = api;
    if (commonJS) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
