# Vibo Valentia — ricerca del 5 novembre 2026

Proposta append-only sulla base `da5ff17`: **23 nuove identità in 10 comuni**,
ricognizione nominale dei **50 comuni**, quattro note economiche separate.
Ricerca conclusa con limiti; delta integrato e verificato online su autorizzazione
esplicita. Catalogo, fonti e costi nazionali aggiornati solo con le aggiunte;
registro ID recensioni sincronizzato senza modificare recensioni.

## File e prove

- [Delta](../fiere-vibo-valentia-delta.json),
  [ricognizione comune per comune](../fiere-vibo-valentia-ricognizione.json),
  [costi](../fiere-vibo-valentia-costi.json).
- Originali, testi estratti, risposte HTTP, locandina e query effettive:
  `.local/worktrees/vibo-valentia-20261105/.local/ricerche/vibo-valentia-20261105/`
  della root principale; ricerca privata esclusa dal deploy.
- [Verificatore provinciale](../../scripts/verify-fiere-vibo-valentia.py);
  esito e fixture in `.local/verifiche/vibo-valentia-20261105/`.
- Backup preventivo già verificato dal coordinatore:
  `backup/session-20261105-193831-due-province-rieti-vibo-20261105` e
  `backup/pre-rieti-vibo-20261105`; nessun duplicato creato durante la ricerca.

## Selezione

| Comune | Nuove schede e criterio |
|---|---|
| Drapia | Santi Cosma e Damiano: avviso originale, 25–27 settembre 2024. Santa Croce, Sujaca, Vino e Dolce: portale turistico comunale, soltanto mesi usuali. Scartati anni generati dal plugin e intervalli fino a ottobre. Fiera Monte Carmelo esclusa per intervallo incoerente. |
| Ricadi | Birra 30 luglio e Cipolla 13 agosto 2026: date dall’avviso comunale. Termini domanda trascorsi; alimentari via SUAP, modelli distinti per altre categorie. |
| Spilinga | Nduja: avviso comunale per l’8 agosto 2025; non proiettata l’edizione 2026. |
| Mileto | Posteggi per il pellegrinaggio del 10 maggio 2026 a Paravati: quattro pagine originali scansionate lette visivamente. Domanda scaduta il 7 maggio; 35 box previsti nel bando, nessuna disponibilità corrente attestata. |
| Nicotera | Mercatino delle Sette Porte dal regolamento: domenicale sperimentale, senza anno di edizione; esclusi commercianti e artigiani professionali. Non duplicato un mercatino antiquario da portale terzo. |
| Zambrone | Mercatino estivo dal regolamento del 2016, senza conferma 2026. Artigianato lungomare dal comunicato Aramoni: agosto senza anno esplicito. |
| San Gregorio d’Ippona | Fiera del 25 aprile 2024 da pagina comunale; gratuità rivolta al pubblico. |
| Capistrano | Capistranarte: edizione dell’11 agosto 2022, distinta dall’aggiornamento della pagina nel 2024. |
| Brognaturo | Sagra Paesana 3 settembre 2026: post e locandina dell’associazione Brognaturo nel Cuore. Menu pubblico 10 €, escluso dai costi banco. |
| Vibo Valentia | Rosario, Sant’Anna, Sant’Antonio, Carmine, Vibo Marina, Bivona e Piscopio: art. 29 del regolamento, pagine 12–13, soltanto ricorrenze senza anno. Longobardi/Porto Salvo esclusi per identità da chiarire. Vibo in Fermento 30 ottobre 2026 da testo indicizzato del portale regionale, accesso diretto 403. |

Nove schede riportano un’edizione datata; quattordici soltanto un periodo o una
ricorrenza. Non aggiunte disponibilità, affluenza o notorietà. L’unica scheda
preesistente della provincia, Ferragosto di Serra San Bruno, resta identica.
La proposta separata nella ricognizione segnala anche l’incoerenza tra giorni
della settimana e date numeriche nell’avviso 2026: non applicata automaticamente.

## Note economiche

| Scheda | Riscontro e limite |
|---|---|
| Santi Cosma e Damiano | Canone 2024 per tutta la fiera: 40 € fino a 25 m²; 60 € oltre 25 e fino a 80 m². Non prezzo complessivo di servizi/altri oneri e non tariffa 2026. |
| Sette Porte | Art. 7, pagina 5 verificata visivamente: 5 € per domenica, occupazione/gestione/vigilanza comprese, anticipo mensile. Regolamento senza anno, sperimentalità e applicazione attuale da verificare. |
| Paravati | Pagina 3 letta visivamente: bollo 16 € separato dal dovuto CUP da calcolare. Nessun totale banco ricavato. |
| Mercatino estivo Zambrone | Esenzione tassa occupazione nel documento 2016; non gratuità complessiva o applicazione corrente. |

IVA e servizi mancanti non sono aggiunti né considerati inclusi. Nessun costo
storico viene presentato come offerta corrente.

## Metodo e limiti

Eseguite 50 query nominali distinte, conservate in tredici risposte web di
gruppo, seguite da ricerche mirate e letture selettive. Elenco dei comuni
riscontrato sul portale SUAP impresainungiorno; inclusa la variante Ionadi/Jonadi.
L’audit riporta esito specifico, query, fonti, ID selezionati e limiti di ogni
comune. Non esaminati integralmente tutti gli albi, social o archivi: nessun
evento assente può essere certificato dall’esito negativo di ricerca.

Gli originali scaricati non equivalgono tutti a documenti integralmente letti.
PDF principali letti per le sezioni pertinenti; Mileto e quota Nicotera anche
visivamente. Pagine senza eventi o archivi vuoti descrivono il recupero, non
assenza di iniziative sul territorio. Elenco storico Pro Loco Vibo Marina usato
come pista, senza importazione indiscriminata; errori geografici e sinonimi
non diventano nuove identità. Ricorrenze turistiche automatiche non confermano
le annualità future.

Errori conservati: HTTP 403 per Regione e Limbadi on the Road; certificato TLS
scaduto per pagina Pro Loco Maierato. Gli allegati dinamici di Ricadi e Spilinga
rispondono HTTP 200 con HTML di errore applicativo, **non PDF recuperati**.
Per Vibo in Fermento la prova è il testo indicizzato del dominio primario, non
lettura dell’originale integrale. Annunci secondari non confermati esclusi:
Immacolata Dasà, Ognissanti Serra, Castagna Pizzoni e altri dettagli nell’audit.
Tropea: denuncia annullamento mercatini 2024 distinta da Borgo Incantato 2025;
nessuna cancellazione estesa al 2026. Calendario Spadola con testo 2025 e widget
2026 scartato; risultati di comuni omonimi fuori provincia esclusi.

## Verifiche

Nel worktree di ricerca, `python scripts/verify-fiere-vibo-valentia.py` usa il builder effettivo copiato
in fixture privata: riproduce prima la base, aggiunge soltanto delta e costi
provinciali nelle copie, esegue due build e confronta tutti i record.

Esito: **9.751 → 9.774** nella sola fixture; tutti i 9.751 record e le 448 note
economiche precedenti invariati, 23 nuovi ID coerenti col builder e con la
provincia, quattro nuovi riscontri economici, due build identiche. Impronte
dei quattro file protetti nazionali verificate invariate. Nessun test con
scritture reali o invio di email; questo primo esito riguarda la fixture di ricerca.
Backup aggiornato eseguito e verificato nella fase di pubblicazione sotto.

## Pubblicazione verificata

Commit `c5bc603635676a5596482a6d9b3cca30473e8390`, Vercel Ready `dpl_3qJBmC1F71cZvVzME7SPANjWNKf7`.
Dominio https://subingresso.it: catalogo completo semanticamente identico alla build,
9.774 schede; tutti i 9.751 record precedenti e le 448 note economiche invariati.
Backup aggiornato `backup/session-20261105-195303-pubblica-vibo-valentia-20261105`
e ramo `backup/pre-pubblica-vibo-valentia-20261105` verificati prima delle modifiche.
Due build identiche, settori e SEO passati; filtro, dettagli e tutte le 24 pagine
provinciali verificati in Chromium 1440/320 e WebKit 390, locali e online.
9.774 ID recensioni sincronizzati; 23 letture API pubbliche riuscite, nessun dato
reale di collaudo creato. Prove in `.local/verifiche/vibo-valentia-pubblica-20261105/`.
Casella chiusa solo dopo verifica live; stato 102 concluse/8 aperte.
Rieti conserva la propria sessione e il proprio stato; nessuna prosecuzione.
