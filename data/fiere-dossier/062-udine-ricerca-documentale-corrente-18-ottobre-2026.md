
## Udine — ricerca documentale corrente, 18 ottobre 2026

**89 manifestazioni in 48 comuni**, prima cinque: 84 aggiunte, 66 schede con
almeno una data puntuale, 117 voci di edizione e sei sintesi di costo.
Catalogo nazionale 4.470; conservati i cinque ID pubblicati e le altre 4.381
schede. Audit `data/fiere-udine.json`, integrazione `scripts/build-fiere.py`;
cache fiere JS78/JSON54. Nessuna ricerca avviata su altre province.

Ripresa dai materiali conservati e dalle cinque schede pubblicate: nel commit
iniziale `a078dba` e in questo documento non esisteva ancora un audit Udine.
Checkpoint remoto già creato `backup/session-20261018-083453-fiere-udine` e
branch `backup/pre-fiere-udine-20261018`, conservati senza ripeterli alla ripresa.
Originali, testi, risultati e tentativi in
`Documents/ricerca-fiere-udine-20261018`; 444 ricevute di acquisizione nell’audit,
oltre alle ricerche e alle prove browser. I documenti di terzi restano fuori
dal repository pubblico, comprese graduatorie con dati personali.

Metodo: ricognizione nominativa dei 134 comuni, confronto con calendario
regionale del 4 giugno 2026 e 31 pagine del motore PromoTurismoFVG filtrato
2026–6 gennaio 2027 (216 occorrenze dichiarate, 31 candidati udinesi deduplicati;
non archivio integrale degli eventi passati). Le sette righe regionali Udine
sono sei manifestazioni perché Biker Fest ha due edizioni. Consultati originali
comunali/SUAP, programmi, regolamenti, moduli, organizzatori e alternative per
404, certificati scaduti e siti JavaScript; pagine dinamiche lette con Chromium
tramite `PLAYWRIGHT_MODULE`. La copertura dei 134 comuni è una ricognizione
nominativa, non una lettura integrale dei loro albi. Nessuna comunicazione a terzi.

Riscontri decisivi e distinzioni operative:

- Codroipo: delibera 230 del 30 settembre e graduatoria originale dei precari;
  mercato San Simone **25 ottobre**, distinto dalla festa 17–28. Graduatoria
  esistente non significa che vi siano posti ancora assegnabili.
- Udine Santa Caterina: regolamento 2023 con 182 posteggi, spunta alle 8,
  vendita 9–19 e divieto generatori. Appalto tecnico 2026 non è domanda banco;
  nessun atto trovato risolve le date discordanti 20–22/23 novembre. Mantenuto
  novembre testuale senza calcolare una conferma dal regolamento.
- Cervignano San Martino: originale comunale del regolamento 2010 recuperato
  dopo dominio vecchio con certificato scaduto/404. Domanda almeno 60 giorni
  prima, ricorrenza testuale e possibili deroghe; calendario, quote e graduatoria
  2026 non recuperati. Albo bloccato dal firewall anche in Chromium, servizi
  e calendario comunali invece letti. Questo limite è esplicito nella scheda.
- Tolmezzo: Festa della Mela, **banchi 19–20 settembre**, non intera festa
  17–20; regolamento distingue categorie, giorni e superfici aggiuntive.
  Gonars: 30 € ambulanti/10 € hobbisti e altre categorie dal modulo autunnale,
  senza trasferirli alla primavera. Pasian: Soffitte in Festa riservato a privati,
  contributo 10 €, divieti e termine il giorno prima; non opportunità professionale.
- Lignano: Villaggio del Gusto, domanda **31 ottobre 2026**, selezione fino
  a 15 food/5 oggettistica, non posti residui. Casette e IVA 22%, cauzioni e
  consumi distinti. Refuso «1–6 gennaio 2026» nel programma 2026/27 non corretto
  per ipotesi: blocco testuale da chiarire. Sandy Wheels senza quota ma con
  cauzione strutture 250 € e RC esclusa; termini food discordanti e trascorsi.
  Bersaglieri 28–31 maggio: 500 € IVA inclusa per l’intera manifestazione,
  non al giorno; pagine PDF renderizzate perché l’estrazione perde caratteri.
- Bertiolo: programma originale prova mercati il **15 e 22 marzo**, non
  l’intera festa. Corno: recuperato libretto 2026 dopo errore TLS, ma moduli
  bancarelle ancora 2024 e quote prive d’anno: nessun prezzo attuale inventato.
- Forni di Sopra: programma immagine Erbe, banchi **14 e 21 giugno**, non
  i sabati; Funghi **13 settembre**, non il 12 contenuto nell’URL. Forni Avoltri:
  calendario originale 2026 conferma Festa del Mercato il 24 ottobre; la vecchia
  Festa dei Frutti di Bosco 2022 non viene trasformata in un’edizione attuale.
- Recuperati EXPO Distretto Cervignano dal sito originale, Vendoglio da Comune
  e locandina PDF, Ronchis dalla locandina originale: banchi solo **27 settembre
  e 4 ottobre**. Carlino: programma comunale con hobbisti solo **20 settembre**.
  Primulacco: mostra mercato fiori 15–24 maggio ogni giorno esplicitamente,
  distinta dal mercatino scolastico. Sauris Prosciutto: due fine settimana,
  non nove giorni continui. Casa Moderna esclude chiusure 6–8 ottobre.
- Sappada: coordinate mancanti nell’anagrafica condivisa; quattro schede usano
  il centro abitato dal nodo OpenStreetMap 64778154, letto via API, con fonte
  dedicata. Non rappresentano il posteggio esatto e non modificano l’anagrafica.

Esclusioni motivate nell’audit: **Festa della Zucca Venzone 2026 annullata**
dall’organizzatore; mercatini solo scolastici, beneficenza gestita dai volontari,
vendite di singoli negozi, mostre senza vendita provata, sagre con sola cucina
associativa e mercati settimanali ordinari. Dodici schede dichiarano una fonte
secondaria; anche l’edizione ottobre Mortegliano è secondaria, distinta dalla
primaria di aprile. Fonti primarie alternative cercate e limiti conservati.

Ricerca documentale attuale conclusa con limiti espliciti, senza promessa di
censimento esaustivo, posti liberi o autorizzazioni. Le piste individuate sono
state chiuse con originali/alternative accessibili o esclusioni motivate;
non occorre attendere bandi futuri. **Verifiche periodiche separate:** nuovi
bandi e quote, conferme Santa Caterina/Cervignano, programma San Carlo/Latisana,
Advent Pur annunciato dal 1 novembre, refuso gennaio Lignano, ricorrenze e
sostituzione delle fonti secondarie. Sauris Natale resta edizione 2025.

Pubblicato **65b6b38**, [Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/73k8m5MUtcc3NEcfsiwvjTGKXwHn); catalogo, audit,
HTML e JS identici ai file del commit, **89 pagine HTTP 200 con H1 e canonical
corretti**. Test provinciale passato localmente e online su Chromium 1440/320
e WebKit 390; suite generale locale sui cinque formati, build, settori e
4.470 pagine/1.778 voci sitemap passati. Scansione segreti senza rilievi.
Verificate 421 impronte degli originali, zero file mancanti o discordanti.
Nuova copia della ricerca conclusa in
`Documents/backup-subingresso/ricerche-fiere-20261018-110518`:
**30,055 file, 5,671,310,309 byte, tutti verificati SHA256, zero errori**;
manifest e propria checksum verificati. Include l’archivio Udine e le prove
online raccolte; nessun archivio precedente eliminato o sovrascritto.
TO DO spuntata e riepilogo aggiornato **dopo verifica**: 34 province concluse,
76 da fare su 110. File estranei preservati ed esclusi dai commit.
Prove `Documents/ricerca-fiere-udine-20261018/publication-data.json`,
`online-validation.json`, `originals-validation.json`, `backup-verified.json`;
metadati finali verificati separatamente nel successivo deploy di registrazione.
Test dedicato `scripts/test-fiere-udine.cjs`: dati precedenti, ID, esclusioni,
date commerciali, IVA/cauzioni, ricorrenze, elenco/mappa e pagine senza JavaScript
su Chromium 1440/320 e WebKit 390; variabile `FIERE_UD_BASE_URL` per il sito pubblico.
