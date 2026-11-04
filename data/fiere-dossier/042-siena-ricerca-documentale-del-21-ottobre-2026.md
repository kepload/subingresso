

## Siena — ricerca documentale del 21 ottobre 2026

Ricerca corrente conclusa con limiti espliciti; pubblicazione e verifica online
concluse. Commit `016bd57`: quattro asset identici ai file versionati e **85/85
pagine HTTP200**, con H1, canonical e costi corretti. Browser locale/online
Chromium 1440/320 e WebKit 390, anche senza JavaScript, superati; suite generale
in cinque formati, settori, build deterministica e tutte le **5.908 pagine**
con **2.570 voci sitemap** superati. TO DO e riepilogo aggiornati soltanto dopo
verifica: **49 province complete, 61 rimanenti su 110**.
**85 manifestazioni in 33 comuni**, ricognizione di tutti i **35 comuni**.
Partenza dal checkpoint `793b2f3`: nessun audit provinciale precedente,
una sola scheda del Primo Maggio di Montepulciano, identificativo conservato.
**84 aggiunte**, catalogo **5.908**; le altre **5.823 schede sono identiche**.
Audit riproducibile in `data/fiere-siena.json`: 267 ricevute selezionate,
28 gruppi di esclusioni, 15 limiti, nessuna pista documentale accessibile
rimasta aperta. Le ricevute includono errori e storico, non attestano tutte
lettura integrale. Originali, PDF, estrazioni, ricerche, tentativi e prove
in `Documents/ricerca-fiere-siena-20261021`, fuori dal repository pubblico.
Backup remoto preventivo `backup/session-20261021-151510-fiere-siena`
e ramo `backup/pre-fiere-siena-20261021`, già verificati alla preparazione.
Cache JS102/JSON70. Nessun contatto a terzi e nessuna altra provincia lavorata.
Copia locale dell’archivio verificata SHA256:
`Documents/backup-subingresso/ricerche-fiere-20261021-192711`, **60.101 file,
10.722.742.108 byte, zero errori**; supplemento finale per prove e registri.

Riscontri operativi e cautele:

- Siena: piano e regolamento del 19 marzo 2026 distinguono fiere, mercatini
  stagionali e antiquariato. Conflitto estate **5 luglio / 5 giugno** conservato
  nel testo, senza inventare un intervallo. Mercato nel Campo **4–8 dicembre**,
  domanda **14 settembre ore 13**, quote **650/900/1.200 € più IVA**, secondo
  categoria e sede; il compenso del gestore non diventa costo del banco.
- Abbadia: fiera 19 settembre, **193 posteggi**; scadenza corretta **16 luglio**,
  nuova domanda obbligatoria anche per i precedenti concessionari. Asciano:
  Sant’Isidoro ad Arbia distinto da quello di Taverne d’Arbia a Siena.
- Montalcino: sette mercatini, **70 € annuali / 10 € singola spunta**;
  Tartufo Bianco **7–8 e 14–15 novembre**. Giorni del Miele **26–27 settembre**,
  senza riutilizzare le date 2025. Bandi del gestore distinti dagli espositori.
- Monteriggioni: mercato medievale **10–12 luglio**, esclusa la cena del 9.
  Mercatino Eroico **1–4 ottobre**, distinto dalle giornate della ciclostorica.
  Pienza: fiori **9–10 maggio**, Cacio **5–6 settembre**. Programmi delle feste
  di Rapolano, Monteroni, Radicondoli e Radicofani ridotti ai giorni dei banchi.
- San Gimignano: Sant’Agostino senza spunta, assegnazioni già intervenute.
  Poggibonsi: San Lucchese riservato alle associazioni locali ammesse.
  Trequanda: scadenza **16 ottobre 2026** dal PDF, refuso 2025 nella pagina;
  restrizioni territoriali e merceologiche, inclusa l’ambiguità sugli alimenti,
  restano esplicite. San Quirico: bollo **16 €**, non costo complessivo.
- Chiusi: graduatoria con nome file 2025 contiene anche le due fiere 2026;
  termine domande 2025 storico. Chianciano: Immacolata solo **2025**.
  Natale Montepulciano: periodo generale **21 novembre–6 gennaio**, senza
  trasformarlo in apertura continua o inventare i fine settimana mancanti.
- Murlo e Monticiano: nessuna manifestazione commerciale attuale comprovata
  nelle piste consultate. Esclusi sagre con sola ristorazione, storia di fiere,
  Gallina 2018, programmi Sarteano non attuali e Charta non accessibile senza
  prova dei banchi. Touring Cetona/Chiusi e Pro Loco Pienza tentati anche nel
  browser; certificati comunali recuperati quando possibile. Fonti secondarie
  dichiarate nelle schede; mai tariffe visitatori attribuite agli espositori.

Manutenzione futura distinta dalla ricerca conclusa: nuovi bandi, disponibilità,
tariffe, rettifica estate Siena, giorni Natale Montepulciano, nuovi originali
Sarteano/Charta/Gallina e chiarimenti Trequanda/Sinalunga. Non si attendono
bandi futuri per chiudere la ricognizione attuale e non si promette esaustività.

64 schede hanno almeno una data puntuale, 13 dichiarano una fonte secondaria;
sei sintesi di costi/adempimenti e sette scadenze, anche passate. Test dedicato
`scripts/test-fiere-siena.cjs`, prove HTTP e browser nell’archivio locale;
il confronto usa i file Git pubblicati, non le terminazioni CRLF di Windows.
