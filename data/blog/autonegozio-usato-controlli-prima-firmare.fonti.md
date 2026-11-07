# Autonegozio usato: fonti, file e verifiche

Priorità 23 del piano. Ricerca del **7 novembre 2026**. Titolo adattato
all'intento di acquisto: «Compro un banco con autonegozio usato: impianti,
portata e documenti da controllare». Testo di circa 605 parole, sei sezioni,
risposta iniziale in tre punti, due slot ADS inline/closing del componente
esistente. Nessuna modifica a template, annunci o altri articoli.

## Fonti istituzionali e limiti

- [ACI: acquisto di un veicolo usato](https://aci.gov.it/pratica-auto/acquisto-di-un-veicolo-consigli-e-cautele/).
  Verifiche preventive al PRA su intestazione e gravami, visura di dettaglio,
  confronto del telaio, documenti e controllo di persona anche con meccanico.
  La checklist registra questi riscontri senza chiamarli certificazione.
  Nessun prezzo della visura, termine di trasferimento o garanzia legale
  generalizzata inserito nell'articolo.
- [Codice della strada, art. 78, portale ACI](https://aci.gov.it/codice-della-strada/art-78/).
  Modifiche costruttive e funzionali, accertamenti e aggiornamenti dei documenti.
  Le eccezioni previste impediscono di attribuire collaudo e aggiornamento
  identici a qualsiasi intervento: il testo rimanda a officina/UMC per il
  veicolo concreto, senza elenco normativo presuntivamente completo.
- [Codice della strada, art. 167, portale ACI](https://aci.gov.it/codice-della-strada/art-167/).
  Divieto di superare la massa complessiva indicata nei documenti. La richiesta
  di pesata documentata, configurazione e valutazione degli assi è un metodo
  pratico da concordare con il tecnico. Non sono pubblicate tolleranze,
  formule di portata certificata o un carico aggiuntivo presunto disponibile.
- [Portale dell'Automobilista: revisioni](https://www.ilportaledellautomobilista.it/web/portale-automobilista/veicoli/revisioni).
  Periodicità differenziata per massa e categoria: il testo evita di assegnare
  a tutti gli autonegozi la scadenza di una comune automobile. Nessun costo,
  sanzione o modalità di circolazione dopo esito negativo riprodotti.
- [Vigili del Fuoco: Sicuro Gas 2017](https://www.vigilfuoco.it/sites/default/files/2024-06/sicuro_Gas_2017.pdf).
  Sezione mercati, indicazioni richiamate alla circolare 3794/2014; **pagina 34**
  originale letta anche visivamente: registro di manutenzione dei dispositivi
  e sistemi di sicurezza. La [pagina del Comune di Formigine](https://www.comune.formigine.mo.it/servizi/imprese-e-commercio/approfondimenti/informazioni-sui-mercati/mercati/sicurezza-degli-impianti-gpl)
  conferma manuali e registrazioni per autonegozi con GPL. I controlli GPL sono
  limitati ai mezzi equipaggiati; nessuna istruzione per interventi fai-da-te,
  quantità di bombole o piano antincendio completo desunti dalla checklist.
- [Provincia autonoma di Bolzano: certificato ATP](https://mobilitaet.provinz.bz.it/it/certificato-atp),
  pagina aggiornata il 10 giugno 2026. Descrive l'ambito dell'accordo, relativo
  a determinati alimenti deperibili e trasporti a temperatura controllata.
  Usata soltanto per questa distinzione; nessuna procedura o tariffa locale
  estesa al resto d'Italia. Applicabilità al mezzo da verificare, senza imporre
  ATP a ogni attività alimentare. Il primo recupero HTTP restituisce il guscio
  dell'applicazione: testo completo e prova salvati dopo rendering Chromium.
  La prima pagina candidata DGTNE era leggibile nel lettore web ma rispondeva
  HTTP406 direttamente: sostituita nei file finali con questa fonte.

Tutte le fonti collegate nell'articolo rispondevano HTTP200 nel recupero
diretto. Originali, ricevute/hash, pagina PDF 34 e rendering ATP conservati in
`.local/lavori/articoli/autonegozio-usato-controlli-prima-firmare/`.
La verifica di acqua, pulizia, temperature e allaccio è proposta di controllo
tecnico secondo l'uso reale, senza pretendere di elencare tutti i requisiti
sanitari, impiantistici o autorizzativi applicabili.

## Checklist scaricabile

`downloads/checklist-autonegozio-usato.xlsx`: sei schede, 26 controlli.

- `Come usarlo`: istruzioni brevi, identificazione del mezzo e riferimenti.
- `Controlli`: esiti distinti Non verificato / Conforme / Da verificare /
  Non applicabile, riferimenti documentali, incaricato, data e azioni.
- `Spese`: voci e preventivi, base IVA nelle note, chi paga, esclusioni e
  completezza per riga. Una casella vuota non equivale a costo zero.
- `Accordi`: punti e scadenze da portare al professionista; nessuna clausola
  contrattuale predisposta o accordo dichiarato automaticamente valido.
- `Riepilogo`: conteggi degli esiti e somme parziali dei soli costi completi
  con stato Preventivato. Separata la quota attribuita all'acquirente;
  segnalati importi mancanti, non confermati o privi di descrizione.
- `Fonti`: collegamenti istituzionali e data della consultazione.

File senza macro o connessioni esterne. Convalide dati, filtri, celle di input
evidenziate e stampa per foglio. Le 30 formule sono state eseguite dal motore
`formulas`; cache iniziali salvate, ricalcolo completo richiesto all'apertura.
Nessun punteggio di sicurezza, perizia, stima automatica del mezzo o
approvazione all'acquisto. Il significato di Conforme è esplicitamente limitato
all'esito immesso dall'utilizzatore dopo riscontro documentato.

Cinque scenari confrontati con risultati attesi indipendenti: modello
iniziale; quattro esiti e costi con pagatori diversi; importi mancanti e senza
descrizione; tutte le esclusioni di applicabilità e righe vuote; importi
decimali e zero. Tutti passati. Script riproducibili e ricevuta
`checklist-verificata.json` nel dossier privato.

SHA256 finale XLSX:
`e43ada4999ebc13eaa9f82f807d2893f6b362df84166e6c495a6201d3a0eb8d7`.

## Copertina e duplicati

Copertina originale creata tramite **imagegen integrato**: persone e mezzo
inventati, nessuna marca o attestazione di conformità. Scena illustrativa
dichiarata IA nell'articolo. WebP1600×900, 322.190 byte, percorso
`images/blog/autonegozio-usato-controlli-prima-firmare.webp`.
Prompt in `data/blog/autonegozio-usato-controlli-prima-firmare.prompt.md`;
originale PNG conservato nel dossier privato.

Catalogo pubblico riletto via API, colonne esplicite: **128 articoli**, nessun
doppione dello slug o del tema completo. Esiste una guida dedicata ATP,
distinta da questo controllo dell'intero mezzo e dalla checklist di acquisto.
Questa sessione non ha scritto nel DB né eseguito commit/push: integrazione,
pubblicazione e verifiche online affidate al coordinatore delle tre sessioni.


## Pubblicazione coordinata verificata

Pubblicato il 7 novembre 2026, ID `30804f60-3bc2-4a26-9985-5ce939865656`, materiali commit `14f917b`. Vercel riuscito `9v34mUXL8vYTwRdF2Aw8bqv79ikF`; copertina e file XLSX online identici SHA256. Canonical, NewsArticle, indice e sitemap verificati; Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript passati, download reale WebKit identico. Due ADS acquisto pertinenti e spazio Vetrine conservato. Verifiche automatiche senza scritture di prova. Tutti i 128 articoli precedenti invariati; tre nuovi articoli, totale 131. Prove coordinate in `.local/lavori/articoli/tre-articoli-20261107/`.
