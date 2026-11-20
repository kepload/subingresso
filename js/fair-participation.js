(function (global) {
    'use strict';
    const commonJS = typeof module !== 'undefined' && module.exports;
    const spunta = commonJS ? require('./fair-spunta') : global.FairSpunta;
    const badges = commonJS ? require('./fair-badges') : global.FairBadges;
    // Reviewed snapshots bind a confirmation to its documented editions.
    const legacyEditions = new Map([
  [
    "puglia-aradeo-sagra-te-lu-pummitoru-schiattarisciatu",
    "[{\"year\":2026,\"start\":\"2026-07-31\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.aradeo.le.it/wp-content/uploads/2026/07/AVVISO-PUBBLICO-2026.pdf\"}]"
  ],
  [
    "sicilia-chiusa-sclafani-sagra-delle-ciliegie",
    "[{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.chiusasclafani.pa.it/wp-content/uploads/2026/05/Avviso-Sagra-delle-ciliegie-2026.pdf\"}]"
  ],
  [
    "calabria-castrovillari-fiera-delle-stagioni",
    "[{\"year\":2026,\"start\":\"2026-07-12\",\"end\":\"2026-07-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.castrovillari.cs.it/notizie/3646223/bando-pubblico-assegnazione-posteggi-fiera\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.castrovillari.cs.it/notizie/3646223/bando-pubblico-assegnazione-posteggi-fiera\"}]"
  ],
  [
    "calabria-catanzaro-mercatino-degli-hobbisti",
    "[{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.catanzaro.it/novita/mercati-tematici-in-piazza-prefettura-al-via-domenica-31-maggio-con-gli-hobbisti/\"}]"
  ],
  [
    "sardegna-ollolai-autunno-in-barbagia-ollolai",
    "[{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.ollolai.nu.it/media/acfupload/Avviso_Autunno_in_Barbagia_2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-dei-santi-faustino-e-giovita",
    "[{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"},{\"year\":2027,\"start\":\"2027-02-15\",\"end\":\"2027-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitbrescia.it/eventi/fiera-santi-faustino-e-giovita-brescia/\"}]"
  ],
  [
    "lombardia-brescia-fiera-della-madunina-dei-custu",
    "[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-cristo-re",
    "[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-ognissanti",
    "[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-sant-angela-merici",
    "[{\"year\":2026,\"start\":\"2026-01-27\",\"end\":\"2026-01-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-sant-antonio",
    "[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-crocifissa-di-rosa",
    "[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-della-vittoria",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-brescia-fiera-di-santa-maria-delle-grazie",
    "[{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf\"}]"
  ],
  [
    "lombardia-desenzano-del-garda-mercatino-dell-antiquariato",
    "[{\"year\":2026,\"label\":\"Prima domenica di ogni mese da febbraio a dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/partecipazione-antiquariato/\"}]"
  ],
  [
    "lombardia-desenzano-del-garda-un-mondo-di-vintage",
    "[{\"year\":2026,\"label\":\"Prima domenica del mese, febbraio–dicembre 2026, ore 09:00–19:00\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.antiquariatovintagedesenzano.it/vintage/\"}]"
  ],
  [
    "lombardia-roccafranca-sagra-del-quaranti-mercatino",
    "[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.sagradelquaranti.it/area-espositori/\"}]"
  ],
  [
    "lombardia-codogno-fiera-autunnale-di-codogno",
    "[{\"year\":2026,\"start\":\"2026-11-17\",\"end\":\"2026-11-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.codogno.lo.it/edizioni-fiera-autunnale/fiera-edizione-2026/\"}]"
  ],
  [
    "lombardia-imbersago-mercatino-dell-antico",
    "[{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://prolocoimbersago.it/il-mercatino-dellantico/\"}]"
  ],
  [
    "lombardia-arcore-fiera-di-sant-eustorgio",
    "[{\"year\":2026,\"start\":\"2026-09-21\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.arcore.mb.it/novita/notizia/fiera-di-s-eustorgio-2-2/\"}]"
  ],
  [
    "lombardia-meda-fiera-di-calendimaggio",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.meda.mb.it/trasparenza-rifiuti/dettaglio-notizia/Fiera-di-Calendimaggio-2026/\"}]"
  ],
  [
    "toscana-arezzo-fiera-antiquaria",
    "[{\"year\":2026,\"start\":\"2026-01-03\",\"end\":\"2026-01-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-01-31\",\"end\":\"2026-02-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-06-06\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.discoverarezzo.com/eventi/fiera-antiquaria-di-arezzo/\"}]"
  ],
  [
    "toscana-arezzo-fiera-del-mestolo",
    "[{\"year\":2026,\"start\":\"2026-09-09\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.arezzo.it/novita/fiera-del-mestolo-edizione-di-settembre-2026\"}]"
  ],
  [
    "toscana-castiglion-fibocchi-fiera-della-madonna-del-rosario",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.castiglionfibocchi.ar.it/notizie/Avviso-di-partecipazione-nei-posteggi-liberi-della-fiera-annuale-2026.html\"}]"
  ],
  [
    "friuli-venezia-giulia-trieste-barbacan-produce",
    "[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf\"}]"
  ],
  [
    "lombardia-rosate-fiera-di-rosate",
    "[{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.rosate.mi.it/index.php/it/news/1960545\"}]"
  ],
  [
    "lombardia-rescaldina-fiera-autunnale",
    "[{\"year\":2026,\"start\":\"2026-10-05\",\"end\":\"2026-10-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.rescaldina.mi.it/it/news/1958472\"}]"
  ],
  [
    "lombardia-serina-fiera-zootecnica-con-spunta-ambulanti",
    "[{\"year\":2026,\"start\":\"2026-09-23\",\"end\":\"2026-09-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.serina.bg.it/novita/avvisi/dettaglio-notizia/Fiera-zootecnica-del-23-settembre-2026-Graduatoria-di-spunta/\"}]"
  ],
  [
    "lombardia-clusone-mercatini-di-natale",
    "[{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-07\",\"end\":\"2026-12-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-21\",\"end\":\"2026-12-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-24\",\"end\":\"2026-12-24\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2026-12-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-27\",\"end\":\"2026-12-27\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-28\",\"end\":\"2026-12-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-29\",\"end\":\"2026-12-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-30\",\"end\":\"2026-12-30\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2026,\"start\":\"2026-12-31\",\"end\":\"2026-12-31\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-01\",\"end\":\"2027-01-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-02\",\"end\":\"2027-01-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-03\",\"end\":\"2027-01-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-04\",\"end\":\"2027-01-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-05\",\"end\":\"2027-01-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"},{\"year\":2027,\"start\":\"2027-01-06\",\"end\":\"2027-01-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://turismoproclusone.it/wp-content/uploads/2026/09/MERCATINI-DI-NATALE-2026-TPC-Regolamento.pdf\"}]"
  ],
  [
    "veneto-campodarsego-fiera-dell-angelo",
    "[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campodarsego.pd.it/novita/fiera-dellangelo-2026/\"}]"
  ],
  [
    "veneto-sarcedo-mercatino-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sarcedo.vi.it/wp-content/uploads/2026/09/ALL_A_AVVISO-MANIFESTAZIONE-INTERESSE-MERCATINO-NATALE2026.pdf\"}]"
  ],
  [
    "veneto-colceresa-ciliegia-in-festa-mercatino",
    "[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.colceresa.vi.it/novita/ciliegia-in-festa-2026-domenica-7-giugno-mercatino/\"}]"
  ],
  [
    "emilia-romagna-modena-fiera-di-sant-antonio",
    "[{\"year\":2027,\"start\":\"2027-01-17\",\"end\":\"2027-01-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari\"}]"
  ],
  [
    "emilia-romagna-modena-fiera-di-san-geminiano",
    "[{\"year\":2027,\"start\":\"2027-01-31\",\"end\":\"2027-01-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari\"}]"
  ],
  [
    "emilia-romagna-polinago-fiera-dello-statuto",
    "[{\"year\":2026,\"start\":\"2026-07-12\",\"end\":\"2026-07-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.polinago.mo.it/Dettaglionews?IDNews=243403\"}]"
  ],
  [
    "emilia-romagna-sassuolo-mercato-stagionale-delle-domeniche-di-ottobre",
    "[{\"year\":2026,\"label\":\"Domeniche di ottobre 2026: 4, 11, 18 e 25 ottobre\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}]"
  ],
  [
    "emilia-romagna-sassuolo-fiera-dei-tiramolla",
    "[{\"year\":2026,\"label\":\"Giovedì Santo; data della singola edizione da confermare nel programma comunale\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}]"
  ],
  [
    "emilia-romagna-sassuolo-mercatino-hobbisti-antiquariato-e-vintage",
    "[{\"year\":2026,\"label\":\"Primo sabato del mese; verificare eccezioni e calendario delle edizioni\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/\"}]"
  ],
  [
    "emilia-romagna-fontanellato-mercatino-dell-antiquariato",
    "[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://fontanellato.org/\"}]"
  ],
  [
    "emilia-romagna-parma-remira-market",
    "[{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://parmawelcome.it/evento/remira-market-2/\"}]"
  ],
  [
    "emilia-romagna-montecchio-emilia-fiera-di-san-marco",
    "[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=035027&progr_fiera=1\"}]"
  ],
  [
    "emilia-romagna-rio-saliceto-mercatino-del-passato-arti-e-ingegno",
    "[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.riosaliceto.re.it/it/eventi/614838\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.riosaliceto.re.it/it/eventi/614838\"}]"
  ],
  [
    "lombardia-azzate-mostra-dell-usaa",
    "[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105073/fvw_calendario_eventi-marzo-2026.pdf\"},{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105121/fvw_calendario_eventi-aprile-2026.pdf\"},{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.varesedoyoulake.it/sites/default/files/evento/attachments/105241/fvw_calendario_eventi-maggio-2026.pdf\"},{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.proazzate.org/news.php?n=74\"}]"
  ],
  [
    "lombardia-cantu-fiera-del-crocifisso",
    "[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html\"}]"
  ],
  [
    "lombardia-cantu-fiera-di-s-apollonia",
    "[{\"year\":2026,\"start\":\"2026-02-09\",\"end\":\"2026-02-09\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24315\"}]"
  ],
  [
    "lombardia-cantu-fiera-di-s-rocco",
    "[{\"year\":2026,\"start\":\"2026-08-15\",\"end\":\"2026-08-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.procedimenti.servizirl.it/sagre/public/programma/24313\"}]"
  ],
  [
    "piemonte-viu-mostra-mercato-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.viu.to.it/Dettaglionews?IDNews=415085\"}]"
  ],
  [
    "piemonte-cavour-tuttomele",
    "[{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti\"}]"
  ],
  [
    "piemonte-torino-gran-balon",
    "[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.balon.it/portfolio/gran-balon-ottobre-2026/\"}]"
  ],
  [
    "lombardia-gonzaga-mostra-mercato-del-c-era-una-volta-centro-storico",
    "[{\"year\":2026,\"start\":\"2026-01-06\",\"end\":\"2026-01-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-06-02\",\"end\":\"2026-06-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-08-23\",\"end\":\"2026-08-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2026-12-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.ceraunavoltagonzaga.it/\"}]"
  ],
  [
    "lombardia-cremona-fiera-san-pietro",
    "[{\"year\":2026,\"start\":\"2026-06-28\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cremona.it/media/2846\"}]"
  ],
  [
    "lombardia-soresina-sapori-e-colori-d-autunno",
    "[{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prolocosoresina.it/saporiecoloridautunno/\"}]"
  ],
  [
    "veneto-portogruaro-fiera-di-sant-andrea",
    "[{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026\"}]"
  ],
  [
    "piemonte-prato-sesia-mercatino-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.pratosesia.com/Mercatino/Mercatino2026/Mercatino2026Iscrizioni.htm\"}]"
  ],
  [
    "piemonte-ghemme-natale-nelle-cantine",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"},{\"year\":2026,\"start\":\"2026-12-07\",\"end\":\"2026-12-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"},{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.noidelcastello.com/natale/\"}]"
  ],
  [
    "piemonte-roccabruna-fiera-di-valle",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.confagricolturacuneo.it/aperte-le-iscrizioni-per-la-xxii-fiera-di-valle-di-roccabruna-in-programma-domenica-4-ottobre-2026/\"}]"
  ],
  [
    "piemonte-cortemilia-roba-veja-e-antica",
    "[{\"year\":2026,\"start\":\"2026-08-23\",\"end\":\"2026-08-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cortemilia.cn.it/Dettaglionews?IDNews=403074\"}]"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-san-giuseppe",
    "[{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}]"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-santa-croce",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}]"
  ],
  [
    "trentino-alto-adige-ala-fiera-di-san-luca",
    "[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre\"}]"
  ],
  [
    "trentino-alto-adige-ala-fiera-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ala.tn.it/Novita/Avvisi/Fiere-di-ottobre-e-di-novembre\"}]"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-di-santa-caterina",
    "[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}]"
  ],
  [
    "trentino-alto-adige-lavis-fiera-dei-ciucioi",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}]"
  ],
  [
    "trentino-alto-adige-trento-fiera-di-santa-lucia",
    "[{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}]"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-della-festa-d-oro",
    "[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf\"}]"
  ],
  [
    "trentino-alto-adige-trento-fiera-festa-d-oro",
    "[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://albo.comune.trento.it/AttiVisualizzatore/download/determina/1478170?fId=1478227&sbustato=true\"}]"
  ],
  [
    "trentino-alto-adige-rovereto-fiera-di-san-marco",
    "[{\"year\":2026,\"dateType\":\"calendar\",\"label\":\"Domenica coincidente o antecedente il 25 aprile; giorno 2026 da confermare con il provvedimento annuale.\",\"sourceUrl\":\"https://www.comune.rovereto.tn.it/Servizi/Vendere-ai-mercati-saltuari\"}]"
  ],
  [
    "trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico",
    "[{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-11-27\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-04\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-11\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-18\",\"end\":\"2026-12-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"},{\"year\":2026,\"start\":\"2026-12-26\",\"end\":\"2027-01-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitvalsugana.it/it/eventi-valsugana/mercatino-di-natale-asburgico_2882_ide/\"}]"
  ],
  [
    "trentino-alto-adige-pomarolo-mercatino-di-natale-di-pomarolo",
    "[{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pomarolo.tn.it/content/download/3334/50934/file/Bando_mercatino_Natale_di_Pomarolo_edizione_2026.pdf\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-di-pasquetta",
    "[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-di-primavera-di-strada",
    "[{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-del-giaggiolo",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-stelle-e-mercanti-di-strada",
    "[{\"year\":2026,\"start\":\"2026-06-11\",\"end\":\"2026-06-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-della-schiacciata",
    "[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-stelle-e-mercanti-di-greve",
    "[{\"year\":2026,\"start\":\"2026-07-16\",\"end\":\"2026-07-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-artigiano-festa-delle-castagne",
    "[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-aspettando-natale-a-greve",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-natalizio-di-panzano",
    "[{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-greve-in-chianti-mercatino-natalizio-di-strada",
    "[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.greve-in-chianti.fi.it/novita/notizie/mercatini-artigiani-e-svuota-la-soffitta-2026\"}]"
  ],
  [
    "toscana-san-casciano-in-val-di-pesa-fiera-arte-e-sport-di-cerbaia",
    "[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.san-casciano-val-di-pesa.fi.it/vivere-il-comune/eventi/fiera-arte-e-sport-cerbaia-2026\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.san-casciano-val-di-pesa.fi.it/vivere-il-comune/eventi/fiera-arte-e-sport-cerbaia-2026\"}]"
  ],
  [
    "toscana-scandicci-fierone-ambulante-di-scandicci",
    "[{\"year\":2026,\"label\":\"Secondo giovedì di ottobre, ricorrenza annuale del Fierone\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.scandicci.fi.it/amministrazione/uffici/uo-62-sviluppo-economico\"}]"
  ],
  [
    "lazio-velletri-fiera-della-madonna-delle-grazie",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.velletri.rm.it/area_letturaNotizia/630272/pagsistema.html\"}]"
  ],
  [
    "lazio-montelibretti-fiera-di-san-nicola-da-bari",
    "[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.montelibretti.roma.it/wp-content/uploads/2026/03/AVVISO-PUBBLICO-FIERA-MAGGIO-2026_signed.pdf\"}]"
  ],
  [
    "lazio-montelibretti-fiera-della-beata-vergine-del-carmine",
    "[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.montelibretti.roma.it/wp-content/uploads/2026/09/AVVISO-PUBBLICO-FIERA-11.10.-2026.pdf\"}]"
  ],
  [
    "lazio-vicovaro-fiera-del-perdono",
    "[{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comunedivicovaro.it/c058112/zf/index.php/atti-amministrativi/determine/dettaglio/atto/GT1RFeUB5PT0-H\"}]"
  ],
  [
    "emilia-romagna-cervia-mercato-straordinario-cervia-mare",
    "[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cervia.ra.it/it/page/mercati-straordinari-anno-2025\"},{\"year\":2026,\"start\":\"2026-05-31\",\"end\":\"2026-05-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cervia.ra.it/it/page/mercati-straordinari-anno-2025\"}]"
  ],
  [
    "emilia-romagna-casola-valsenio-festa-di-primavera-mercatino-artistico",
    "[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://proloco-casolavalsenio.blogspot.com/2026/02/festa-di-primavera-e-sfilata-dei-carri.html\"},{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://proloco-casolavalsenio.blogspot.com/2026/02/festa-di-primavera-e-sfilata-dei-carri.html\"}]"
  ],
  [
    "emilia-romagna-cesena-fiera-di-san-giovanni",
    "[{\"year\":2026,\"start\":\"2026-06-20\",\"end\":\"2026-06-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-sogliano-al-rubicone-fiera-del-formaggio-di-fossa",
    "[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"},{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitsoglianoalrubicone.it/51a-fiera-del-formaggio-di-fossa-di-sogliano-dop/\"}]"
  ],
  [
    "emilia-romagna-cesena-fiera-di-primavera",
    "[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-cesena-sagra-del-monte",
    "[{\"year\":2026,\"start\":\"2026-08-15\",\"end\":\"2026-08-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-cesena-fiera-d-autunno",
    "[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-cesena-fiera-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-cesena-mercato-straordinario-d-ottobre",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cesena.fc.it/articoli/calendario-delle-fiere-e-dei-mercati/\"}]"
  ],
  [
    "emilia-romagna-gambettola-mostrascambio-auto-moto-d-epoca-e-cose-del-passato",
    "[{\"year\":2026,\"start\":\"2026-05-09\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mostrascambio.org/wp-content/uploads/2026/02/MODULO-MAGGIO-2026.pdf\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mostrascambio.org/wp-content/uploads/2026/07/MODULO-SETTEMBRE-2023.pdf\"}]"
  ],
  [
    "emilia-romagna-bertinoro-mercatino-estivo-degli-hobbisti-sotto-le-stelle",
    "[{\"year\":2026,\"label\":\"Ricorrenza estiva documentata; calendario specifico 2026 non recuperato.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.bertinoro.fc.it/myportal/C_A809/api/content/download?id=67a07740f75468009b468260\"}]"
  ],
  [
    "emilia-romagna-pianello-val-tidone-fiera-del-primo-maggio",
    "[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}]"
  ],
  [
    "emilia-romagna-pianello-val-tidone-grande-fiera-d-agosto",
    "[{\"year\":2026,\"start\":\"2026-08-26\",\"end\":\"2026-08-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}]"
  ],
  [
    "emilia-romagna-pianello-val-tidone-fiera-di-san-maurizio",
    "[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pianellovaltidone.pc.it/novita/avvisi/novita_213.html\"}]"
  ],
  [
    "friuli-venezia-giulia-udine-fiera-di-santa-caterina",
    "[{\"year\":2026,\"label\":\"Novembre: calendario 2026 da confermare; non dedotto dalla ricorrenza\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.udine.it/content/download/2424/43368/file/regolamento_AP_approvato_da_DC51_2023_-con_numero_determina.pdf\"}]"
  ],
  [
    "friuli-venezia-giulia-caneva-mercatini-di-natale-di-stevena",
    "[{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.protramontidisotto.it/app/download/12436861294/Una_Montagna_di_Eventi_2026.pdf?t=1785246264\"}]"
  ],
  [
    "friuli-venezia-giulia-brugnera-dal-campat-alla-piazza-mercatino-di-maron",
    "[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.festeggiamentimaron.it/wp-content/uploads/2026/09/Regolamento_Espositori_2026_def.pdf\"}]"
  ],
  [
    "friuli-venezia-giulia-san-vito-al-tagliamento-magia-di-natale-mercatino",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prosanvito.it/natale/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.prosanvito.it/natale/\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-dell-artigianato-artistico",
    "[{\"year\":2026,\"start\":\"2026-01-17\",\"end\":\"2026-01-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-18\",\"end\":\"2026-01-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-14\",\"end\":\"2026-02-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-14\",\"end\":\"2026-03-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-18\",\"end\":\"2026-04-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-16\",\"end\":\"2026-05-16\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-20\",\"end\":\"2026-06-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-19\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-14\",\"end\":\"2026-11-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-santa-teresa",
    "[{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://wwwservizi.regione.emilia-romagna.it/sagre/note.asp?anno=2026&cod_co=038008&progr_fiera=15\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-cose-d-altri-tempi-oggetti-da-collezione-e-dell-artigianato",
    "[{\"year\":2026,\"start\":\"2026-01-03\",\"end\":\"2026-01-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-04\",\"end\":\"2026-01-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-01-31\",\"end\":\"2026-02-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-04\",\"end\":\"2026-04-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-05\",\"end\":\"2026-04-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-02\",\"end\":\"2026-05-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-06\",\"end\":\"2026-06-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-05\",\"end\":\"2026-09-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-11-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-dicembre",
    "[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}]"
  ],
  [
    "emilia-romagna-ferrara-il-baule-in-piazza-domenica-pontesana",
    "[{\"year\":2026,\"start\":\"2026-01-11\",\"end\":\"2026-01-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-02-08\",\"end\":\"2026-02-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-03-08\",\"end\":\"2026-03-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-09-13\",\"end\":\"2026-09-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-biagio",
    "[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-giorgio",
    "[{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/attachments/file/view?canCache=0&hash=0286b34319693c43a275d33ec9d35609e8ece2adbaa99250634223ce8aea5686\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-san-giorgio-lunga",
    "[{\"year\":2026,\"label\":\"Primavera 2026: giornate commerciali da confermare. Il calendario regionale 27 marzo–3 maggio non coincide con il nuovo programma del luna park 2 aprile–3 maggio.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-di-quartesana",
    "[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-dei-buskers-i",
    "[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-dei-buskers-ii",
    "[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-ferrara-fiera-delle-gare-del-palio",
    "[{\"year\":2026,\"label\":\"Ricorrenza documentata; singole giornate dell’edizione attuale da confermare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.ferrara.it/static/d0/e2/cb/d0be2fcb758ca3536c8d13219b72bddbacf98b6c0c6e3664147fdd9609372f6a.pdf\"}]"
  ],
  [
    "emilia-romagna-cento-fiera-di-san-biagio",
    "[{\"year\":2026,\"start\":\"2026-02-03\",\"end\":\"2026-02-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cento.fe.it/it/eventi/fiera-di-san-biagio-edizione-2025\"}]"
  ],
  [
    "toscana-lucca-mercato-antiquario",
    "[{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.lucca.it/vivere-il-comune/eventi/mercato-antiquario/\"}]"
  ],
  [
    "toscana-pistoia-fiera-dell-antiquariato-la-cattedrale",
    "[{\"year\":2026,\"start\":\"2026-01-10\",\"end\":\"2026-01-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-02-07\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-03-07\",\"end\":\"2026-03-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-04-11\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-10-10\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"},{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.pistoia.it/it/servizi/4915\"}]"
  ],
  [
    "liguria-genova-fiera-di-sant-agata",
    "[{\"year\":2026,\"start\":\"2026-02-01\",\"end\":\"2026-02-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.genova.it/vivere-il-comune/eventi/eventi-sociali/fiera-di-santagata\"}]"
  ],
  [
    "liguria-chiavari-fiera-di-sant-antonio",
    "[{\"year\":2026,\"start\":\"2026-01-17\",\"end\":\"2026-01-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-fiera-di-san-pietro-e-paolo",
    "[{\"year\":2026,\"start\":\"2026-06-28\",\"end\":\"2026-06-28\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-campomorone-mercatino-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-chiavari-fiera-di-luglio",
    "[{\"year\":2026,\"start\":\"2026-07-02\",\"end\":\"2026-07-02\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-giuseppe",
    "[{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-dell-angelo",
    "[{\"year\":2026,\"start\":\"2026-04-06\",\"end\":\"2026-04-06\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-zita",
    "[{\"year\":2026,\"start\":\"2026-04-26\",\"end\":\"2026-04-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-libro-primavera",
    "[{\"year\":2026,\"start\":\"2026-04-09\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.genova.it/sites/default/files/2026-03/proposta%20calendario%20fiere%202026_agg.30.03.2026_def.%20fiera%20libro%20prim.pdf\",\"periodOnly\":true}]"
  ],
  [
    "liguria-genova-s-salvatore",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-maggio",
    "[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-rita",
    "[{\"year\":2026,\"start\":\"2026-05-22\",\"end\":\"2026-05-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-struppa",
    "[{\"year\":2026,\"start\":\"2026-06-07\",\"end\":\"2026-06-07\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-antonio",
    "[{\"year\":2026,\"start\":\"2026-06-14\",\"end\":\"2026-06-14\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-pietro-pra",
    "[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-del-mare",
    "[{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-07-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-fiera-di-pontedecimo",
    "[{\"year\":2026,\"start\":\"2026-09-13\",\"end\":\"2026-09-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-ss-cosma-e-damiano",
    "[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-cornigliano",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-carlo",
    "[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-01\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-genova-s-carlino",
    "[{\"year\":2026,\"start\":\"2026-11-08\",\"end\":\"2026-11-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-recco-fiera-s-g-battista",
    "[{\"year\":2026,\"start\":\"2026-06-24\",\"end\":\"2026-06-24\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-recco-fiera-di-n-s-del-suffragio",
    "[{\"year\":2026,\"start\":\"2026-09-07\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.recco.ge.it/novita/notizie/novita_2052.html\"}]"
  ],
  [
    "liguria-lavagna-fiera-san-simone",
    "[{\"year\":2026,\"start\":\"2026-10-28\",\"end\":\"2026-10-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.lavagna.ge.it/novita/fiera-san-simone-28-ottobre-2026/\"}]"
  ],
  [
    "liguria-lavagna-fiera-dell-agricoltura",
    "[{\"year\":2026,\"start\":\"2026-03-01\",\"end\":\"2026-03-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.lavagna.ge.it/novita/fiera-agricoltura-1-marzo-2026/\"}]"
  ],
  [
    "piemonte-acqui-terme-fiera-di-santa-caterina",
    "[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-17\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=2\"}]"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-marzo",
    "[{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}]"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-aprile",
    "[{\"year\":2026,\"start\":\"2026-04-14\",\"end\":\"2026-04-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}]"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-agosto",
    "[{\"year\":2026,\"start\":\"2026-08-25\",\"end\":\"2026-08-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}]"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-novembre",
    "[{\"year\":2026,\"start\":\"2026-11-10\",\"end\":\"2026-11-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}]"
  ],
  [
    "piemonte-casale-monferrato-fiera-di-dicembre",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.casale-monferrato.al.it/vivere-il-comune/vivere-casale-monferato/eventi-cultura-turismo/turismo/manifestazioni-ed-eventi/elenco-fiere-2026/\"}]"
  ],
  [
    "piemonte-murisengo-fiera-internazionale-del-tartufo-bianco-trifola-d-or",
    "[{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=1\"},{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=Al&qualifica=-1&scelta=1\"}]"
  ],
  [
    "piemonte-odalengo-piccolo-fiera-tufo-tartufo",
    "[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.odalengopiccolo.al.it/Dettaglionews?IDNews=402931\"}]"
  ],
  [
    "piemonte-portacomaro-fiera-di-san-bartolomeo",
    "[{\"year\":2026,\"start\":\"2026-08-24\",\"end\":\"2026-08-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.portacomaro.at.it/Dettaglionews?IDNews=407982\"}]"
  ],
  [
    "marche-urbania-fiera-delle-donne",
    "[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-urbania-fiera-san-giuseppe",
    "[{\"year\":2026,\"start\":\"2026-03-22\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-urbania-fiera-san-marco",
    "[{\"year\":2026,\"start\":\"2026-04-25\",\"end\":\"2026-04-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-urbania-fiera-san-cristoforo",
    "[{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-urbania-fiera-san-luca",
    "[{\"year\":2026,\"start\":\"2026-10-24\",\"end\":\"2026-10-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-urbania-fiera-dell-immacolata",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://mycity.s3.sbg.io.cloud.ovh.net/4799604/Domanda-fiere-2026.pdf\"}]"
  ],
  [
    "marche-cagli-fiera-di-san-vittore",
    "[{\"year\":2026,\"start\":\"2026-10-11\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.cagli.ps.it/novita/fiera-di-san-vittore-2026/\"}]"
  ],
  [
    "marche-ancona-fiera-di-san-ciriaco",
    "[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://anconaservizi.it/la-fiera-di-san-ciriaco-2026/\"}]"
  ],
  [
    "marche-jesi-palio-di-san-floriano-arte-e-mestieri-medievali",
    "[{\"year\":2026,\"start\":\"2026-05-08\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.jesi.an.it/documents/20119/1645442/PALIO%2BSAN%2BFLORIANO_MERCATINO%2BMEDIEVALE_AVVISO.pdf/79bc5b2b-0dd3-d093-20fb-2b4009e9a8b0?t=1776353015699\"}]"
  ],
  [
    "umbria-campello-sul-clitunno-fiera-dell-antiquariato-del-rigattiere-e-del-collezionismo-d-arte",
    "[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campello.pg.it/servizi/imprese_e_commercio/servizio_41.html\"},{\"year\":2026,\"label\":\"Prima domenica di ogni mese; aprile eccezionalmente12aprile2026\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.campello.pg.it/vivere_il_comune/eventi/evento_1.html\"}]"
  ],
  [
    "umbria-marsciano-fiera-verde",
    "[{\"year\":2026,\"start\":\"2026-04-18\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.umbriatourism.it/it/w/fiera-verde-event\"}]"
  ],
  [
    "umbria-passignano-sul-trasimeno-mercatino-del-pidocchietto",
    "[{\"year\":2026,\"start\":\"2026-01-18\",\"end\":\"2026-01-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-02-15\",\"end\":\"2026-02-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-03-15\",\"end\":\"2026-03-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-04-19\",\"end\":\"2026-04-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-05-17\",\"end\":\"2026-05-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-06-21\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-07-19\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-08-16\",\"end\":\"2026-08-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-11-15\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.passignano-sul-trasimeno.pg.it/vivere_il_comune/eventi/evento_15.html\"}]"
  ],
  [
    "umbria-perugia-fiera-dei-morti",
    "[{\"year\":2026,\"start\":\"2026-11-01\",\"end\":\"2026-11-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.perugia.it/novita/avviso-pubblico-per-lassegnazione-temporanea-dei-posteggi-liberi-in-occasione-della-fiera-dei-morti-del-1-5-novembre-2026/\"}]"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-baracca",
    "[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-06\",\"end\":\"2026-11-15\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}]"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-cortile-di-santa-chiara",
    "[{\"year\":2026,\"start\":\"2026-03-19\",\"end\":\"2026-03-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-28\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-30\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-04\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-01\",\"end\":\"2026-08-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-10\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-17\",\"end\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-08\",\"end\":\"2026-10-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-12\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-27\",\"end\":\"2026-11-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-04\",\"end\":\"2026-12-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}]"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-carita-lato-monumento",
    "[{\"year\":2026,\"start\":\"2026-01-30\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-24\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-27\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-02\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-13\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}]"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-via-diaz-e-largo-berlinguer",
    "[{\"year\":2026,\"start\":\"2026-01-30\",\"end\":\"2026-02-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-02-27\",\"end\":\"2026-03-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-22\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-02\",\"end\":\"2026-05-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-06-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-29\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-26\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-14\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-02\",\"end\":\"2026-10-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-12\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}]"
  ],
  [
    "campania-napoli-mercatini-hobbisti-e-opere-dell-ingegno-piazza-miraglia",
    "[{\"year\":2026,\"start\":\"2026-02-28\",\"end\":\"2026-03-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-03-28\",\"end\":\"2026-03-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-22\",\"end\":\"2026-04-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-04-24\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-05-29\",\"end\":\"2026-06-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-06-25\",\"end\":\"2026-07-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-08-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-08-03\",\"end\":\"2026-08-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-04\",\"end\":\"2026-09-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-10-10\",\"end\":\"2026-10-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-09\",\"end\":\"2026-11-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-30\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-01\",\"end\":\"2026-12-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-11\",\"end\":\"2026-12-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-17\",\"end\":\"2026-12-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://static-www.comune.napoli.it/wp-content/uploads/2026/01/CalendarioMercatini2026_ALL.1-signed.pdf\"}]"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-di-costantinopoli",
    "[{\"year\":2026,\"start\":\"2026-03-03\",\"end\":\"2026-03-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-dell-annunziata",
    "[{\"year\":2026,\"start\":\"2026-03-24\",\"end\":\"2026-03-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-di-sovereto",
    "[{\"year\":2026,\"start\":\"2026-04-23\",\"end\":\"2026-04-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-della-festa-patronale-del-carro",
    "[{\"year\":2026,\"start\":\"2026-08-08\",\"end\":\"2026-08-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-della-madonna-del-rosario",
    "[{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-degli-animali-e-attrezzature-agricole",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-terlizzi-fiera-di-san-nicola",
    "[{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.terlizzi.ba.it/novita/avvisi/novita_1737.html\"}]"
  ],
  [
    "puglia-corato-fiera-di-san-cataldo-festa-patronale",
    "[{\"year\":2026,\"start\":\"2026-08-22\",\"end\":\"2026-08-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026\"}]"
  ],
  [
    "puglia-corato-fiera-della-madonna-del-pozzo",
    "[{\"year\":2026,\"start\":\"2026-08-30\",\"end\":\"2026-08-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.corato.ba.it/novita/manifestazioni-fieristiche-fiera-san-cataldo-2026-e-fiera-madonna-del-pozzo-2026\"}]"
  ],
  [
    "puglia-sannicandro-di-bari-fiera-di-maggio",
    "[{\"year\":2026,\"start\":\"2026-05-10\",\"end\":\"2026-05-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf\"}]"
  ],
  [
    "puglia-sannicandro-di-bari-fiera-di-ottobre",
    "[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.sannicandro.bari.it/wp-content/uploads/2026/03/Bando-fiere-2026.pdf\"}]"
  ],
  [
    "puglia-bitetto-fiera-di-maria-ss-addolorata",
    "[{\"year\":2026,\"start\":\"2026-09-06\",\"end\":\"2026-09-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.bitetto.ba.it/novita/fiera-in-onore-di-maria-ss-addolorata-del-6-settembre-2026/\"}]"
  ],
  [
    "puglia-rutigliano-festa-del-grano-e-fiera-del-fischietto-estiva",
    "[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.rutigliano.ba.it/novita/manifestazione-di-interesse-per-lassegnazione-di-spazi-espositivi-casette-gazebo-in-occasione-della-manifestazione-30-edizione-festa-del-grano-e-fiera-del-fischietto-edizio/\"}]"
  ],
  [
    "campania-salerno-fiera-del-crocifisso",
    "[{\"year\":2026,\"start\":\"2026-03-06\",\"end\":\"2026-03-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-13\",\"end\":\"2026-03-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-20\",\"end\":\"2026-03-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"},{\"year\":2026,\"start\":\"2026-03-27\",\"end\":\"2026-03-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.salerno.it/sites/default/files/2026-02/avviso%20pubblico_.pdf\"}]"
  ],
  [
    "toscana-siena-fiera-di-santa-lucia",
    "[{\"year\":2026,\"label\":\"13 dicembre di ogni anno; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-fiera-di-san-giuseppe",
    "[{\"year\":2026,\"label\":\"19 marzo di ogni anno; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-fiera-di-sant-isidoro-taverne-d-arbia",
    "[{\"year\":2026,\"label\":\"Seconda domenica di maggio; ricorrenza da piano, non conferma separata dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercatino-di-natale",
    "[{\"year\":2026,\"label\":\"Dall’ultima domenica di novembre al 6 gennaio; eventuale prolungamento alla domenica se il 6 cade venerdì o sabato. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercatino-di-pasqua",
    "[{\"year\":2026,\"label\":\"Dalla terza domenica antecedente Pasqua al lunedì successivo; sospensioni possibili per il calcio. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercatino-di-primavera",
    "[{\"year\":2026,\"label\":\"24 aprile–21 maggio, con eventuale continuità rispetto al mercato pasquale. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercatino-d-estate",
    "[{\"year\":2026,\"label\":\"Fine 5 agosto; inizio discordante: 5 luglio nella scheda del Piano e 5 giugno nell’articolo 31 del Regolamento. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercatino-d-autunno",
    "[{\"year\":2026,\"label\":\"10 settembre–10 ottobre; eventuali sospensioni per il calcio. Periodo regolamentare da riconfermare per la singola edizione.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-siena-mercato-mensile-dell-antiquariato",
    "[{\"year\":2026,\"label\":\"Terza domenica del mese; ad agosto quarta domenica. Ricorrenza regolamentare, nessuna data annuale calcolata.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.siena.it/sites/default/files/2026-03/Allegato_A_piano_comunale_commercio_OK.pdf\"}]"
  ],
  [
    "toscana-san-gimignano-fiera-di-sant-agostino",
    "[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sangimignano.si.it/it/news/132950/divieto-di-presenza-degli-operatori-commerciali-non-assegnatari-fissi-alla-fiera-di-santagostino-del-29-agosto\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-gabbro",
    "[{\"year\":2026,\"label\":\"30 settembre di ogni anno. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-castelnuovo-della-misericordia",
    "[{\"year\":2026,\"label\":\"Terza domenica di ottobre e lunedì successivo. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-solvay",
    "[{\"year\":2026,\"label\":\"1 e 2 ottobre di ogni anno. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-rosignano-marittimo",
    "[{\"year\":2026,\"label\":\"10 settembre, San Nicola. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-vada",
    "[{\"year\":2026,\"label\":\"Lunedì successivo all’Assunzione e domenica precedente. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-rosignano-marittimo-fiera-annuale-di-nibbiaia",
    "[{\"year\":2026,\"label\":\"Lunedì successivo alla seconda domenica di ottobre. Ricorrenza regolamentare, non conferma autonoma dell’edizione 2026.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://trasparenza.comune.rosignano.livorno.it/moduli/downloadFile.php?file=oggetto_allegati/2621421002554323280O__Oregolamento_commercio_aree_pubbliche.pdf\"}]"
  ],
  [
    "toscana-campiglia-marittima-fierone-di-venturina-terme",
    "[{\"year\":2026,\"start\":\"2026-08-26\",\"end\":\"2026-08-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.campigliamarittima.li.it/area_letturaNotizia/637439/pagsistema.html\"}]"
  ],
  [
    "liguria-savona-fiera-di-santa-lucia",
    "[{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-borghetto-santo-spirito-fiera-di-sant-antonio",
    "[{\"year\":2026,\"start\":\"2026-06-13\",\"end\":\"2026-06-13\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-borghetto-santo-spirito-fiera-di-san-matteo",
    "[{\"year\":2026,\"label\":\"Settembre: Regione e modulo indicano 21/9; una fonte automatica riporta anche 13/9 senza atto comunale risolutivo. Data operativa da verificare.\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.borghettosantospirito.sv.it/download-file/16618\"}]"
  ],
  [
    "liguria-savona-fiera-nostra-signoria-di-misericordia",
    "[{\"year\":2026,\"start\":\"2026-03-18\",\"end\":\"2026-03-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-savona-fiera-santa-rita",
    "[{\"year\":2026,\"start\":\"2026-05-22\",\"end\":\"2026-05-22\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-savona-fiera-nativita-di-maria-vergine",
    "[{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-savona-fiera-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "liguria-ameglia-notte-blu",
    "[{\"year\":2026,\"start\":\"2026-07-24\",\"end\":\"2026-07-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.ameglia.sp.it/novita/notizie/novita_573.html\"},{\"year\":2026,\"start\":\"2026-08-21\",\"end\":\"2026-08-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.halleyweb.com/c011001/zf/index.php/atti-amministrativi/delibere/dettaglio/atto/G1WpFeETqTT0-A\"}]"
  ],
  [
    "liguria-la-spezia-mercatini-degli-hobbisti",
    "[{\"year\":2026,\"start\":\"2026-07-01\",\"end\":\"2026-07-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-02\",\"end\":\"2026-07-02\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-04\",\"end\":\"2026-07-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-13\",\"end\":\"2026-07-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-18\",\"end\":\"2026-07-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-22\",\"end\":\"2026-07-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-07-28\",\"end\":\"2026-07-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-62\"},{\"year\":2026,\"start\":\"2026-09-08\",\"end\":\"2026-09-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-19\",\"end\":\"2026-09-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-22\",\"end\":\"2026-09-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-09-23\",\"end\":\"2026-09-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/copy2_of_delibera-di-giunta\"},{\"year\":2026,\"start\":\"2026-10-03\",\"end\":\"2026-10-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-06\",\"end\":\"2026-10-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-14\",\"end\":\"2026-10-14\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-17\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-21\",\"end\":\"2026-10-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-10-31\",\"end\":\"2026-10-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-07\",\"end\":\"2026-11-07\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-21\",\"end\":\"2026-11-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-11-28\",\"end\":\"2026-11-28\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-05\",\"end\":\"2026-12-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-12\",\"end\":\"2026-12-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-19\",\"end\":\"2026-12-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"},{\"year\":2026,\"start\":\"2026-12-23\",\"end\":\"2026-12-23\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.laspezia.it/novita/comunicati/delibera-di-giunta-67\"}]"
  ],
  [
    "piemonte-santhia-fiera-di-santa-caterina",
    "[{\"year\":2026,\"start\":\"2026-11-22\",\"end\":\"2026-11-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.santhia.vc.it/Dettaglionews?IDNews=411440\"}]"
  ],
  [
    "piemonte-crescentino-fiera-del-campanile",
    "[{\"year\":2026,\"start\":\"2026-04-12\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.crescentino.vc.it/Dettaglionews?IDNews=386826\"}]"
  ],
  [
    "lombardia-tirano-fiera-di-pentecoste",
    "[{\"year\":2026,\"start\":\"2026-05-24\",\"end\":\"2026-05-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"},{\"year\":2026,\"start\":\"2026-05-25\",\"end\":\"2026-05-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}]"
  ],
  [
    "lombardia-tirano-fiera-di-san-michele",
    "[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}]"
  ],
  [
    "lombardia-tirano-fiera-di-primavera",
    "[{\"year\":2026,\"start\":\"2026-03-29\",\"end\":\"2026-03-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}]"
  ],
  [
    "lombardia-tirano-fiera-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-11\",\"end\":\"2026-11-11\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.tirano.so.it/it/news/127004/bando-pubblico-per-le-assegnazioni-di-concessioni-di-posteggio-nelle-fiere-per-l-anno-2024-1772278-1937036\"}]"
  ],
  [
    "lombardia-novate-mezzola-mercatini-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.novatemezzola.so.it/c014046/po/attachment_news.php?id=1291\"}]"
  ],
  [
    "veneto-castelmassa-fiera-nazionale-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-06\",\"end\":\"2026-11-09\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.castelmassa.ro.it/novita/208-fiera-di-san-martino/\"}]"
  ],
  [
    "liguria-santo-stefano-al-mare-fiera-di-santo-stefano",
    "[{\"year\":2026,\"start\":\"2026-08-09\",\"end\":\"2026-08-09\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html\"}]"
  ],
  [
    "valle-d-aosta-pre-saint-didier-creativa",
    "[{\"year\":2026,\"start\":\"2026-08-22\",\"end\":\"2026-08-22\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/artigianato-fiere-mercatini/pre-saint-didier/creativa-fiera-della-creativita-valdostana-femminile/28797\"}]"
  ],
  [
    "valle-d-aosta-fenis-castello-in-fiera",
    "[{\"year\":2026,\"start\":\"2026-04-11\",\"end\":\"2026-04-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.acoteduchateau.com/area-espositori\"}]"
  ],
  [
    "valle-d-aosta-nus-lo-martchia-de-tsalende",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-06\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.nus.ao.it/wp-content/uploads/2026/10/bando-mostra-mercato-natale-2026.pdf\"}]"
  ],
  [
    "valle-d-aosta-chatillon-sagra-del-miele-e-dei-suoi-derivati",
    "[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/eventi-enogastronomici/chatillon/sagra-del-miele/21409\"}]"
  ],
  [
    "valle-d-aosta-chatillon-le-petit-marche-du-bourg",
    "[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://balteus.lovevda.it/it/banca-dati/2/fiere-e-mercatini/chatillon/le-petit-marche-du-bourg-mercatino-di-natale/21410\"}]"
  ],
  [
    "marche-montefano-sapori-d-autunno",
    "[{\"year\":2026,\"start\":\"2026-10-25\",\"end\":\"2026-10-25\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.montefano.mc.it/wp-content/blogs.dir/43/files/3-All.-Det-Bando-Fiera-Sapori-2026.pdf\"}]"
  ],
  [
    "marche-pollenza-fiera-di-primavera",
    "[{\"year\":2026,\"label\":\"02-giu\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=16\",\"start\":\"2026-06-02\",\"end\":\"2026-06-02\"}]"
  ],
  [
    "marche-civitanova-marche-civitanova-vintage-market",
    "[{\"year\":2026,\"start\":\"2026-07-18\",\"end\":\"2026-07-19\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mercatiniantiquari.com/appuntamenti.html\"}]"
  ],
  [
    "marche-fermo-fiera-di-santa-maria",
    "[{\"year\":2026,\"label\":\"PRIMA DOMENICA DI AGOSTO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7\"}]"
  ],
  [
    "marche-fermo-fiera-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.visitfermo.it/wp-content/uploads/2026/10/pieghevole-autunno-2026.pdf\",\"label\":\"2026-12-08\"}]"
  ],
  [
    "marche-fermo-fiera-di-san-savino",
    "[{\"year\":2026,\"label\":\"16 AGOSTO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=7\",\"start\":\"2026-08-16\",\"end\":\"2026-08-16\"}]"
  ],
  [
    "marche-montegranaro-fiera-di-san-giuseppe",
    "[{\"year\":2026,\"label\":\"DOMENICA PRECEDENTE AL 19 MARZO\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf#page=13\"}]"
  ],
  [
    "marche-comunanza-mostra-ornitologica",
    "[{\"year\":2026,\"start\":\"2026-10-04\",\"end\":\"2026-10-04\",\"label\":\"2026-10-04\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.comunanza.ap.it/novita/notizie/novita_85.html\"}]"
  ],
  [
    "marche-comunanza-fiera-di-santa-caterina",
    "[{\"year\":2026,\"start\":\"2026-11-29\",\"end\":\"2026-11-29\",\"label\":\"2026-11-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.comunanza.ap.it/novita/notizie/novita_86.html\"}]"
  ],
  [
    "marche-montefiore-dell-aso-fiera-grande-d-autunno",
    "[{\"year\":2026,\"start\":\"2026-09-20\",\"end\":\"2026-09-20\",\"label\":\"2026-09-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://montefiore-dell-aso-api.municipiumapp.it/s3/4332/allegati/atto-originale.pdf\"}]"
  ],
  [
    "marche-roccafluvione-fiera-delle-piante-e-mostra-mercato-del-tartufo-e-dei-prodotti-tipici",
    "[{\"year\":2026,\"start\":\"2026-03-08\",\"end\":\"2026-03-08\",\"label\":\"8 marzo 2026: Primavera comunale in concomitanza con Fiera delle Piante Pro Loco\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.halleyweb.com/c044064/de/attachment.php?serialDocumento=00PKOF020262Q&p7m=1\"}]"
  ],
  [
    "marche-san-benedetto-del-tronto-fiera-della-madonna-della-marina",
    "[{\"year\":2026,\"start\":\"2026-07-25\",\"end\":\"2026-07-26\",\"label\":\"2026-07-25 – 2026-07-26\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://sportellounico.comunesbt.it/suap/wp-content/blogs.dir/3/files/sites/3/2026/07/DGC-n.-101-del-15.07.2026.pdf\"}]"
  ],
  [
    "abruzzo-popoli-fiera-dell-immacolata-concezione",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.popoli.pe.it/moduli/output_immagine.php?id=4817\"}]"
  ],
  [
    "abruzzo-lanciano-fiera-di-sant-egidio",
    "[{\"year\":2026,\"start\":\"2026-08-31\",\"end\":\"2026-08-31\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.lanciano.ch.it/ocmultibinary/download/5225/124704/2/13f3fcd7d9e76a68c0848f4ed42c9fe5.pdf/file/INFORMATIVA%2BFIERA%2BDI%2BSANT_EGIDIO%2B2026_signed.pdf\"}]"
  ],
  [
    "abruzzo-fara-san-martino-fiera-tradizionale-del-29-giugno",
    "[{\"year\":2026,\"start\":\"2026-06-29\",\"end\":\"2026-06-29\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}]"
  ],
  [
    "abruzzo-fara-san-martino-fiera-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-11\",\"end\":\"2026-11-11\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}]"
  ],
  [
    "abruzzo-fara-san-martino-feste-patronali-posteggi-commerciali",
    "[{\"year\":2026,\"start\":\"2026-08-24\",\"end\":\"2026-08-26\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://comune.farasanmartino.ch.it/menu/3283435/commercio-fiere-feste-patronali-hobbisti\"}]"
  ],
  [
    "lazio-aprilia-fiera-di-san-michele-arcangelo",
    "[{\"year\":2026,\"start\":\"2026-09-26\",\"end\":\"2026-09-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.aprilia.lt.it/sites/comune.aprilia.lt.it/files/2026-09/COMUNICATO%20agli%20operatori%20SAN%20MICHELE%202026.pdf\"}]"
  ],
  [
    "lazio-aprilia-mercatino-dell-usato-dell-artigianato-del-collezionismo-e-dell-hobbistica",
    "[]"
  ],
  [
    "lazio-sezze-fiera-della-croce",
    "[{\"year\":2026,\"start\":\"2026-05-03\",\"end\":\"2026-05-03\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sezze.lt.it/dam/jcr%3A0f137cd6-8e18-4224-95c5-d515abbb615e/AVVISO%20PUBBLICO%20BANDO%20ALLEGATO%20A.pdf\"}]"
  ],
  [
    "lazio-prossedi-fiera-di-sant-agata",
    "[{\"year\":2026,\"start\":\"2026-07-05\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.prossedi.lt.it/wp-content/uploads/2026/06/Avviso-SantAgata.pdf\"}]"
  ],
  [
    "lazio-fabrica-di-roma-mercatino-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-08\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"},{\"year\":2026,\"start\":\"2026-12-13\",\"end\":\"2026-12-13\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"},{\"year\":2026,\"start\":\"2026-12-20\",\"end\":\"2026-12-20\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.fabricadiroma.vt.it/notizie/Mercatino-di-Natale-2026.html\"}]"
  ],
  [
    "lazio-cassino-mercatino-dell-antiquariato-e-del-vintage",
    "[{\"year\":2026,\"start\":\"2026-05-01\",\"end\":\"2026-05-01\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.cassino.fr.it/it-it/vivere-il-comune/eventi/venerdi-1-maggio-con-cassino-in-fiore-2026-e-mercatino-dell-antiquariato-e-del-vintage-125614-1-1baf6962e7ded267c56e5a15b5050a62\"},{\"year\":2026,\"start\":\"2026-10-18\",\"end\":\"2026-10-18\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.cassino.fr.it/it-it/novita/avvisi/2026/commercio-e-mercati/domenica-18-ottobre-il-mercatino-dell-antiquariato-e-del-vintage-403905-1-2bd4f301cea35a0fe500d52a1a131660\"}]"
  ],
  [
    "lazio-supino-fiera-delle-quattro-strade",
    "[{\"year\":2026,\"start\":\"2026-09-12\",\"end\":\"2026-09-12\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.supino.fr.it/it/news/bando-per-la-concessione-temporanea-di-suolo-pubblico-per-l-esercizio-del-commercio-su-aree-max-60-psteggi?type=3\"}]"
  ],
  [
    "umbria-montecchio-fiera-della-castagna-di-melezzole",
    "[{\"year\":2026,\"start\":\"2026-10-17\",\"end\":\"2026-10-18\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.montecchio.tr.it/novita/notizie/novita_1162.html\"},{\"year\":2026,\"start\":\"2026-10-24\",\"end\":\"2026-10-25\",\"dateType\":\"calendar\",\"sourceUrl\":\"https://www.comune.montecchio.tr.it/novita/notizie/novita_1162.html\"}]"
  ],
  [
    "puglia-oria-fiera-di-san-barsanofrio",
    "[{\"year\":2026,\"start\":\"2026-08-29\",\"end\":\"2026-08-29\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.oriaestate.it/eventi/184-fiera-di-san-barsanofio\"}]"
  ],
  [
    "campania-montefalcione-i-mercatini-di-tok-tok-giugno",
    "[{\"year\":2026,\"start\":\"2026-06-19\",\"end\":\"2026-06-21\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}]"
  ],
  [
    "campania-montefalcione-i-mercatini-di-tok-tok-luglio",
    "[{\"year\":2026,\"start\":\"2026-07-03\",\"end\":\"2026-07-05\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}]"
  ],
  [
    "campania-montefalcione-le-favole-del-natale-mercatini-di-natale",
    "[{\"year\":2026,\"start\":\"2026-12-06\",\"end\":\"2026-12-08\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"},{\"year\":2026,\"start\":\"2026-12-22\",\"end\":\"2026-12-24\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.tok-tok-merkante.it/tok-tok-merkante-iniziative/\"}]"
  ],
  [
    "sardegna-sanluri-festa-del-borgo-e-sagra-del-civraxu",
    "[{\"year\":2026,\"start\":\"2026-09-27\",\"end\":\"2026-09-27\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.comune.sanluri.su.it/novita/il-27-settembre-la-29esima-festa-del-borgo-e-la-sagra-del-civraxu/\"}]"
  ],
  [
    "abruzzo-sulmona-caccia-all-affare-mercatino-vintage",
    "[{\"year\":2026,\"start\":\"2026-08-14\",\"end\":\"2026-08-16\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://www.mercatiniantiquari.com/cacciaallaffaresulmona.html\"}]"
  ],
  [
    "piemonte-gattinara-fiera-di-san-martino",
    "[{\"year\":2026,\"start\":\"2026-11-10\",\"end\":\"2026-11-10\",\"dateType\":\"confirmed\",\"sourceUrl\":\"https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044\"}]"
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  ]
]);
    const editionKey = edition => JSON.stringify(edition);
    function get(event, { edition = null, now = new Date() } = {}) {
        if (!event) return [];
        const facts = badges?.get(event, { edition, now }) || [];
        const snapshot = legacyEditions.get(event.id);
        const legacyMatches = !event.managedEventId && edition && snapshot === JSON.stringify(event.editions)
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
            && record.note === event.participation?.note && record.editions === JSON.stringify(event.editions)
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
