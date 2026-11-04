
## Perugia — ricerca documentale del 21 ottobre 2026

Ricerca attuale conclusa con limiti espliciti, pubblicata e verificata online.
TO DO spuntata solo dopo i controlli: **45 province concluse, 65 da fare su110**.

**152 manifestazioni in 47 comuni**, prima **10**: **142 aggiunte**, tutti i
dieci ID precedenti conservati. Ricognizione nominale dei **59 comuni**, tre
calendari originali Regione Umbria (nazionale/internazionale, regionale e locale)
e calendario comunale Perugia aggiornato: **120 registrazioni** confrontate,
incluse cancellazioni e duplicati stagionali, non 120 manifestazioni autonome.
Catalogo **5.580**, altre **5.428 schede identiche** al commit `1a82bc8`.
**146 schede con almeno una data puntuale, sei solo testuali, nove sintesi costi**
anche parziali/condizionate. Cache fiere JS98/JSON66.

Audit `data/fiere-perugia.json`: copertura nominale, **165 ricevute** con URL,
esiti e hash quando disponibili, **29 esclusioni motivate**, 14 limiti e
verifiche periodiche distinte. Fonti complete e motivazioni nelle singole schede.
Ripresa dell’archivio privato già raccolto; al checkpoint iniziale `90ba704` non
esisteva un audit provinciale Perugia pubblicato né una sua sezione in questo
registro. Le dieci schede importate non costituivano una ricerca conclusa.
Conservate le modifiche successive dell’intestazione fino a `1a82bc8`.
Alessandria già verificata: 158 schede in 75 comuni, test-online.json superato
in Chromium1440/320 e WebKit390; nessuna sua ricerca riaperta o file modificato.

Correzioni decisive da programmi e atti originali:

- **Perugia:** Fiera dei Morti tradizionale **1–5 novembre**, domanda spunta
  **1 luglio 2026 scaduta**, distinta dalla fiera in centro e anteprima31ottobre.
  I28posteggi dell’avviso sono oggetto della selezione, non disponibilità oggi.
  [Avviso e graduatorie comunali](https://www.comune.perugia.it/novita/avviso-pubblico-per-lassegnazione-temporanea-dei-posteggi-liberi-in-occasione-della-fiera-dei-morti-del-1-5-novembre-2026/).
  GrandeFieraPasqua annullata; Anticamente21–22febbraio, BorgoBello11luglio;
  ArtigianiTradizione20maggio, discordanza24regionale dichiarata.
- **Todi:** mercato della Disfida **10–11 ottobre**, non fino11novembre del
  calendario regionale, né9/14 dedicati ad altre iniziative. SanGiuseppe22marzo,
  Consolazione8settembre, SanMartino11novembre con termini e organici distinti.
  [Programma originale](https://todi-api.municipiumapp.it/s3/7265/allegati/programma-disfida-di-san-fortunato-2026.pdf?verifica_perugia=20261021).
- **Gubbio:** fiere Sant’Ubaldo17maggio e SanGiovanni24giugno, termini già
  scaduti7/21aprile. Sant’Ubaldo canone32€ per24m² e54€ per40m², oltre diritti
  e bollo; non applicato automaticamente aSanGiovanni. Tartufo **30ottobre–1novembre
  e6–8novembre**, singolo732€ entrambi i weekend,488€ primo o305€ secondo,
  IVA inclusa; formati doppi/tripli e condizioni nel dettaglio, termine14settembre.
  [Avviso tartufo](https://gubbio-api.municipiumapp.it/s3/3321/allegati/avviso-mostra-mercato-del-tartufo-bianco.pdf?verifica_perugia=20261021).
- **Marsciano:** FieraVerde18–19aprile, termine31marzo; canoni23/47/70€ per
  moduli3×2/6×2/9×2m e due giorni, esenzioni scuole/no-profit, spunta giornaliera
  soltanto su posti rimasti liberi. SanGiovanni21giugno distinto dai mercatini
  serali21,23–26,28; non otto giorni continuativi di fiera ambulante.
  [Avviso originale](https://marsciano-api.municipiumapp.it/s3/3886/allegati/fiera-verde-2026/1-avviso-fiera-verde.pdf?verifica_perugia=20261021).
- **Pietralunga:** tartufo9–11e17–18ottobre, quote100/150/200€+IVA per aree,
  esenzioni riservate eGold5.000€+IVA, entrambe le settimane senza riduzione.
  **Valtopina:**14–15novembre, stand125/200€IVAinclusa, termine15ottobre,
  compresi luce generale/presaCEE, arredi esclusi; non costo giornaliero.
- **Giornate commerciali:** TulipanoCastiglione25–26aprile e1–2maggio;
  GaiteBevagna26–28giugno; OleaMevaniae31ottobre–1novembre; UNTOAssisi28ottobre–1novembre;
  FestaFrantoiCampello18ottobre e8novembre; Frantotipico25ottobre, non tutta la
  festa24–25. ArtiEMercantiMontefalco aggiunge17ottobre senza duplicareAMOLOLIO.
  ExpoCasa2026 verificata sul regolamento originale, distinta dalla homepage2027.

Limiti e chiusura documentale: PDF inizialmente403 Gubbio/Marsciano/Todi
recuperati200 via Chromium con parametro di verifica, dopo tentativi diretti
e cloud; tariffe decisive lette anche visualmente e hash conservati. Vecchio
URLingleseUmbriafiere ora404 anche nel browser: sostituito dal regolamentoPDF
organizzatore perExpoCasa. SanGiustino: notizia graduatoria17ottobre/convocazione
20ottobre originale; download restituisce JSONconPATHhttp:///malformato, nonPDF.
Date23–25ottobre e termine9ottobre da secondaria dichiarata, quota non inventata.
ScheggiaSanPaterniano testuale per contrasto11–12/12luglio; CuriositàCastelRitaldi
18ottobre da secondarie dichiarate. Tre schede secondarie in totale, mai segnate
come date confermate. CannaraSanMatteo20o27settembre rimane testuale.
FolignoSanFeliciano/Plestia eSellanoSantaCaterina non datati per calcolo automatico.
SpelloOro13–15novembre resta periodo con aperture banco da riconfermare.

Dodici comuni senza nuova scheda: Cerreto, Citerna, Collazzone, Fossato,
FrattaTodina, LiscianoNiccone, MonteCastelloVibio, Paciano, Poggiodomo, Preci,
Sigillo, Valfabbrica. Non si dichiara assenza di fiere: calendario originale
non sufficiente, documenti storici/non accessibili o iniziative senza mercato
autonomo provato, come motivato per ciascun comune nell’audit. Esclusi mercati
settimanali ordinari, sole sagre/visite, gare canine senza area vendita,
mostre culturali e viaggi fuori provincia. Nessuna lettura integrale di tutti
gli albi dichiarata. Nessuna email, domanda, candidatura o comunicazione a terzi.

Natale2026 recepito dalle fonti originali per Perugia, Costacciaro eGualdoTadino;
periodi lunghi marcati come tali, programmi2025non proiettati a fine2026.
Ricerca corrente chiusa dopo i tentativi praticabili registrati, con i limiti
espliciti sopra; nessuna attesa obbligata dei futuri bandi. Manutenzione futura
separata: nuove edizioni/atti, rettifiche, canoni, aperture e posti effettivi.

Originali, errori, programmi e prove fuori dal repository pubblico:
`C:\Users\utente\Documents\ricerca-fiere-perugia-20261021`.
Checkpoint remoto già eseguito prima delle modifiche:
`backup/session-20261021-000041-fiere-perugia`, ramo
`backup/pre-fiere-perugia-20261021`; non ripetuti alla ripresa.
Copia ricerche `Documents/backup-subingresso/ricerche-fiere-20261021-022524`:
**52.732 file,9.411.791.702 byte verificati SHA256, zero errori**.
Copia locale sullo stesso computer; integrazione finale delle prove nel supplemento.
Test `scripts/test-fiere-perugia.cjs` usa `PLAYWRIGHT_MODULE` e
`FIERE_PERUGIA_BASE_URL`/`FIERE_PERUGIA_OUT`: confronta tutte le altre province,
dieciID,59comuni,120righe,fonti,costi e correzioni; calendario/mappa completi,
dettagli e pagine senzaJS su Chromium1440/320 e WebKit390.

Pubblicazione **e4042b4**, Vercel **42G1HWcqo1E56noVgWqPaMNfY6LE** riuscito.
I quattro asset online corrispondono ai byte del commit Git; differenze CRLF
del checkout Windows riconosciute e non scambiate per mancato deploy.
**152 pagine HTTP200 con H1/canonical corretti**, calendario e mappa completi,
14dettagli operativi nei test Chromium1440/320 e WebKit390 **locali e online**
superati, nessun erroreJavaScript/overflow. Suite generale nei cinque formati,
settori,5580pagine/paginazione/escaping e build ripetibile passati. Gitleaks
staged e hook superati, nessun segreto. Tutti i cambiamenti preesistenti estranei
preservati e non inclusi nei commit. Prove `publication.json`, `test-local.json`,
`test-online.json`, `checks.json`, `deploy-status.json` nell’archivio privato.
Supplemento finaleSHA256: `ricerche-fiere-20261021-022524/supplements/perugia-final-20261021`.
