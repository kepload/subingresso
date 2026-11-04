
## Pordenone — ricerca documentale del 18 ottobre 2026

86 manifestazioni in 29 comuni; ricognizione nominativa di tutti i 50 comuni,
78 schede con date puntuali e 14 sintesi di costo. Catalogo nazionale 4.554;
conservati i due ID già pubblicati e identiche le 4.468 schede delle altre province.
Non esisteva un audit provinciale precedente nel commit iniziale 5be414c:
ripartenza dalle due schede e dalle fonti già registrate in FIERE.md.
Audit riproducibile: `data/fiere-pordenone.json`; originali, ricevute HTTP,
estrazioni, pagine renderizzate e immagini PDF fuori dal repo pubblico in
`Documents/ricerca-fiere-pordenone-20261018`. Backup remoto prima delle modifiche:
`backup/session-20261018-181439-fiere-pordenone`, più branch
`backup/pre-fiere-pordenone-20261018`. Nessun contatto/invio a terzi.

Letti calendario Pordenone Fiere 2026, registro regionale aggiornato al 4 giugno,
51 pagine di «Una Montagna di Eventi», 31 pagine del motore PromoTurismoFVG,
home comunali in Chromium, albi disponibili, programmi, regolamenti e moduli
originali. Non lettura integrale di tutti gli albi né censimento esaustivo.
Gli errori dei domini iniziali Pasiano/Prata sono conservati insieme ai domini
corretti letti; Santa Lucia Prata HTTP999 diretto recuperato in Chromium con
entrambi i PDF originali HTTP200. PLAYWRIGHT_MODULE per tutte le prove browser.

Distinzioni operative ricavate dagli originali:

- Casarsa Vino: senza somministrazione quattro giornate 25–26 aprile, 1 e 3
  maggio; 25 € al giorno 3×3, pacchetti 45/65/75 €, IVA e oneri inclusi.
  Somministrazione sette giorni, quote per m²/giorno e categoria più IVA e
  oneri comunali, senza inventare un totale. Termine 27 marzo già trascorso.
- Sacile Profumi e Sapori: hobbisti solo 4 ottobre (30 € 3×3), agroalimentari
  3–4 ottobre (60/90/110/130 € secondo dimensioni, IVA compresa). Modulo Fusioni
  è per la sfilata, non per banchi. Primavera agro 11–12 aprile distinta dal
  mercato principale del 12; tariffa senza moltiplicazione arbitraria per giorni.
- Sacellum: undici date 2026; 27 dicembre ancora provvisorio soltanto testuale.
  Quote giornaliere 15/20/25/35 € e abbonamenti separati, IVA inclusa. Vintage
  e usato ammessi secondo regolamento; niente alimentari/artigianato generico.
- Sacile Avvento 8 dicembre: 25 € 3×3 con elettricità, termine 28 novembre.
  San Vito Magia 8 e 13 dicembre: privati 20/35 €, operatori 35/50 € singolo
  giorno e 60/85 € entrambi secondo superficie; IVA inclusa per operatori.
  Voglia di Natale: soltanto 5–6, 8, 12–13 e 19–20 dicembre.
- Maron 22 novembre: 20 €, domanda entro 15 novembre, privati/autoproduzioni,
  niente rivendita/elettricità. Prata 13 dicembre: creatività non imprenditoriale,
  eccezione limitata 1–2 alimentari; nessuna quota inventata.
- Budoia: hobby 13 e 20 settembre; agro 12–13 e 19–20. Cordovado: mercato
  29–30 agosto, non la cena del 28. Spilimbergo Macia: mercato 14–16 agosto,
  non apertura/corteo del 13. Arba e Cavasso: sola domenica del mercatino,
  non tutti i giorni della festa. Erto autunno 18 ottobre, non 16–18.
- Rauscedo: Piazza dei Sapori 10–11 ottobre e Viticoltura 9–11 distinte,
  superfici, scadenze/scaglioni e IVA22% dai moduli; niente prezzo unico
  tra aree né disponibilità dedotta da vecchie candidature.
- Pordenone: Radioamatore 25–26 aprile risolto col sito organizzatore;
  antiquariato senza il 19 luglio non spiegato; Natale straordinario 13/20
  dicembre ancora da confermare e senza date puntuali. Europa 1–3 maggio
  dal PDF turistico, conflitto con il 4 dichiarato; nessuna proroga inventata.

22 esclusioni motivate nell'audit: Riso e Confetti 2026 non riconfermato
dall'organizzatore, fiere sportive/orientamento, mercatini scolastici,
ristorazione associativa senza mercato esterno documentato, eventi 2025,
moduli Barcis 2019, incarico organizzazione Natale Pravisdomini non domanda
banco, omonimie Vivaro Dueville/Castelnovo Vicentino, mercati settimanali.
Cinque schede con fonti secondarie dichiarate: Arba, Roveredo, Aria delle
Dolomiti, Cavasso, Fontanafredda. Fontana: originale Portale Eventi letto
via web; diretto/Chromium 403 e Facebook Cache miss. Alternativa dichiarata
inserita da AI non usata come prova; riscontri e limiti conservati.
Link di moduli assenti/chiusi, PDF vecchi e assenza di quote non diventano
gratuità, apertura candidature o ammissione generalizzata.

Ricerca attuale conclusa con limiti espliciti: piste documentali individuate
esaurite con originali, alternative accessibili o esclusioni motivate;
non occorre attendere futuri bandi. Verifiche periodiche separate per nuove
quote/domande, Natale non confermato, ricorrenze e sostituzione delle fonti
secondarie. Nessuna promessa di censimento esaustivo o posti disponibili.

Pubblicato `0119e58`, [Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/FnWF2C2K9n74CubB6oEv6Ze4A9pj).
Catalogo/audit/HTML/JS online identici al commit; tutte le 86 pagine HTTP200
con H1/canonical corretti. Test provinciale locale e online Chromium1440/320
e WebKit390 (elenco, mappa, date/costi/fonti, nove dialog, pagine senza JS);
suite generale cinque formati, settori, build e 4.554 pagine/1.864 sitemap
passati. Scansione segreti superata; 305 originali verificati, zero errori.
Cache fiere JS79/catalogo55. TO DO spuntata dopo esito verificato: 35 province
concluse, 75 da fare. Prove `publication-data.json`, `online-validation.json`,
`originals-validation.json` nell'archivio esterno. Test ripetibile:
`scripts/test-fiere-pordenone.cjs`, `FIERE_PN_BASE_URL` per il sito pubblico.


Nuova copia di conservazione completata con `python scripts/backup-fiere-research.py`:
`Documents/backup-subingresso/ricerche-fiere-20261018-165002`, 31,525 file,
5,899,371,433 byte, ogni copia verificata SHA256, zero errori; checksum del
manifest verificata. Inclusi originali Pordenone e prove online. Nessun
archivio precedente cancellato/sovrascritto. Copia locale, non esterna.
Riscontro `Documents/ricerca-fiere-pordenone-20261018/backup-verified.json`.
