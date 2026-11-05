# Catanzaro — consegna provinciale del 5 novembre 2026

Ricognizione nominale degli **80 comuni**, con **52 nuove schede** per **24 comuni**
e **7 note economiche separate**. Ricerca documentale con limiti: non censimento
certificato né prova di disponibilità di posteggi. **Non integrata e non pubblicata.**

Lavoro sul solo ramo `research/catanzaro-20261105`, base `358d781`.
Backup remoto fornito dall’utente e verificato:
`backup/session-20261105-104256-ricerche-catanzaro-reggio-20261105`.
Nessuna modifica al catalogo nazionale, builder, checklist, registri condivisi,
database o altre province. Nessun invio, contatto o attività automatica ricorrente.

## Materiali provinciali

- [Delta append-only](../fiere-catanzaro-delta.json): solo ID nuovi, calcolati
  con la stessa normalizzazione del builder; nessuna sostituzione provinciale.
- [Ricognizione nominale e fonti](../fiere-catanzaro-ricognizione.json): una voce
  per ciascun comune, esiti, piste scartate, limiti e impronte degli originali.
- [Costi separati](../fiere-catanzaro-costi.json): sette proposte associate solo
  a nuovi ID; prezzi e condizioni esclusi spiegati a parte.
- [Verificatore locale](../../scripts/verify-fiere-catanzaro.py): usa il builder
  effettivo in fixture privata e controlla tutti i record precedenti.

Prove private: `.local/ricerche/catanzaro-20261105/`, con ricerche nominali,
approfondimenti web, risposte HTTP, originali PDF/Word/HTML, testi e SHA-256.
Gli errori HTTP e le pagine prive di testo restano conservati, senza considerarli
prove positive. Non tutti i documenti sono letti integralmente: lettura mirata
ai passaggi provinciali pertinenti. Nessuna cancellazione effettuata.

## Date e copertura

Le 52 schede distinguono:

| Stato della scheda | Numero | Significato |
|---|---:|---|
| Edizione con giorni pubblicati 2026/2027 | 25 | Programma primario; non certifica svolgimento o disponibilità |
| Edizione con solo mese | 1 | La Rosa Arte Funeraria, febbraio 2027 senza giorni |
| Periodo ricorrente senza edizione corrente | 18 | Nessuna data annuale generata |
| Edizione storica con giorni | 7 | Anni 2024/2025 mantenuti |
| Storico e mese di edizione insieme | 1 | Festivalbeer: ottobre 2025 e agosto 2026 senza giorno |

Il catalogo base contiene una sola scheda provinciale, **Fiera di Sant’Antonio
a Lamezia Terme**, conservata in ogni campo. Le altre quattro fiere lametine
sono nuove identità; non viene duplicata Sant’Antonio. I periodi del
[repertorio comunale](https://www.comune.lamezia-terme.cz.it/it/page/fiere-lametine)
non sono conferme annuali: pagina aggiornata 2025 con bollo e riferimenti datati.

Il delta riguarda Catanzaro, Lamezia Terme, Curinga, Soveria Mannelli,
Marcellinara, Borgia, Andali, Gasperina, Squillace, Sellia, San Sostene, Taverna,
Montauro, Belcastro, Cerva, Soverato, Decollatura, Chiaravalle Centrale,
Vallefiorita, Sellia Marina, Sersale, Magisano, Montepaone e Nocera Terinese.
Gli altri **56 comuni hanno un esito esplicito nella ricognizione**: nessuna nuova
scheda sufficientemente sostenuta, non dichiarazione di assenza di eventi.

La lista degli 80 comuni è confrontata con `data/comuni.json` e con l’elenco del
[Ministero della Cultura](https://sabap-cz-kr.cultura.gov.it/?page_id=1949).
Per ogni comune sono conservate query nominale, nota specifica, eventuali ID e
limiti di accesso. Albi completi, social non indicizzati, locandine non recuperate
e documenti non accessibili restano fuori dalla verifica integrale.

## Fonti e decisioni principali

| Comune / ambito | Fonte primaria e uso |
|---|---|
| Catanzaro, fiere estive | [Avvisi comunali 2026](https://www.comune.catanzaro.it/novita/pubblicati-avvisi-per-assegnazione-posteggi-fiere-san-vitaliano-madonna-di-porto-salvo-e-san-lorenzo/): Vitaliano 15–16 luglio, Porto Salvo 25–26 luglio, Lorenzo 8–10 agosto. Vecchio portale di dettaglio non leggibile nel controllo web: nessun costo ricostruito. |
| Catanzaro, PalaColosimo | [Calendario comunale 2026–2027](https://www.comune.catanzaro.it/novita/ente-fiera-palacolosimo-di-catanzaro-presentato-il-nuovo-calendario-eventi-2026-2027-tra-economia-grande-affluenza-e-sviluppo-del-territorio/): saloni distinti; Wushu escluso perché torneo sportivo. Nessun accesso ambulanti implicito. |
| deGusto | [Presentazione organizzatore](https://www.salonedegusto.it/wp-content/uploads/2026/02/Presentazione-deGusto-2026.pdf): 14–17 novembre 2026 a Catanzaro, anche se l’organizzatore si chiama Cosenza Fiere. Nessuna ricerca su Cosenza né dato di affluenza aggiunto. |
| Mercati tematici Catanzaro | [Avvio maggio 2026](https://www.comune.catanzaro.it/novita/mercati-tematici-in-piazza-prefettura-al-via-domenica-31-maggio-con-gli-hobbisti/): Piazza Prefettura; antiquariato prima e quarta domenica, hobbisti avvio 31 maggio. Ipotesi di febbraio su altre sedi non mantenuta come secondo mercato; km0 non confermato per completamento autorizzazioni. |
| Expo FATA / uva | [UNPLI e organizzatori](https://catanzaro.eu/expo-fata-2026-festa-dell-uva-germaneto/): 22–25 ottobre 2026, con presentazione il 22 e Expo dal 23. Non quattro giorni di medesimi orari espositivi. |
| Lamezia Comics | [Scheda comunale dedicata](https://www.comune.lamezia-terme.cz.it/it/eventi/725799) e [organizzatore](https://lameziacomics.it/): 11–13 settembre 2026; pubblico gratuito, costo stand non noto. |
| Curinga | [Modulo comunale nel percorso 2024](https://www.comune.curinga.cz.it/wp-content/uploads/2024/05/CA_05_DOMANDA_PER_ASSEGNAZIONE_POSTEGGIO-FIERE-2024-3-1.pdf): quattro periodi; anno contrattuale delle tariffe non espresso. Nessuna conferma 2026 ricavata dalla sola modulistica. |
| Soveria Mannelli | [Regolamento 2021, art. 79](https://www.comune.soveriamannelli.cz.it/wp-content/uploads/CUP-vigente.pdf): Purità terza e quarta domenica ottobre, Immacolata e Lucia. Purità è una identità con due ricorrenze, non un intervallo continuo. |
| Marcellinara | [Pagina comunale](https://www.comune.marcellinara.cz.it/evento/la-fiera-di-marcellinara): 15 settembre e 6 ottobre 2024 separati, non tutta la durata del contenitore della pagina. |
| Borgia | [Statuto 2026](https://www.comune.borgia.cz.it/novita/notizie/novita_16.html) e [repertorio Pro Loco, p. 10](https://prolocomongrassano.it/wp-content/uploads/2025/04/visit-unpli-calabria-2025.pdf): San Leonardo solo periodo 4–6 novembre; nessuna edizione 2026 dedotta. Pagina PDF letta anche visivamente. |
| Andali | [Repertorio comunale](https://www.comunediandali.it/servizi-al-turismo/manifestazioni-e-sagre.html): salsiccia e patata, senza anno; numeri di edizione datati non riportati come correnti. |
| Gasperina | [Organizzatore](https://www.prolocogasperina.it/eventi) e [Assaggia & Passeggia](https://www.prolocogasperina.it/eventi/assaggia-passeggia-quarta-edizione-2026): giornate e mesi distinti; Zuccaland dal portale Pro Loco, Festivalbeer agosto 2026 senza giorno. |
| Squillace | [Pagina e allegati comunali](https://comune.squillace.cz.it/notizie/3674048/avviso-manifestazione-interesse-stand-mercatini): 14 novembre 2026, procedure hobbisti e somministrazione distinte; anno 22026 nell’avviso hobbisti conservato come refuso, non scadenza corretta per ipotesi. |
| Sellia | [Modulo artigianato](https://comune.sellia.cz.it/wp-content/uploads/2026/07/Scheda-adesione-sagra-SETTORE-ARTIGIANATO-2026-1.docx) e [enogastronomia](https://comune.sellia.cz.it/wp-content/uploads/2026/07/Scheda-adesione-sagra-SETTORE-ENOGASTRONOMICO.docx): 17 agosto 2026, allestimento e spazi distinti. |
| Soverato | [Delibera Galilea 13/2026](https://soverato.contrasparenza.it/documenti/allegati/trasparenza/40/delibera-gm-n-13-2026-approvazione-tariffa-partecipazione-fiera-della-galilea-2026.pdf): 6–7 aprile; [artigianale 2024](https://www.comune.soverato.cz.it/dam/jcr:f7fd64b1-8758-4501-b4df-d388dfd0a18d/avviso-fiera-artigianale-2024.pdf) separata e subordinata al procedimento demaniale. |
| Decollatura | [Ordinanza comunale 46/2026](https://www.icserrastretta.edu.it/pa/wp-content/uploads/2026/09/ord_00046_17-09-2026-1.pdf): fiera 20–21 settembre, scuole chiuse solo il 21. Il PDF risolve il limite del titolo della pagina scolastica. |
| Chiaravalle, Vallefiorita, Sellia Marina, Sersale | Schede UNPLI singole elencate nel registro fonti. Calendario pubblico caricato tramite endpoint pubblico del sito, con sole letture. Chiaravalle 6 novembre è alternativa meteo, Merendella 2 agosto è richiamo ad anni passati, Sersale ha orari interni discordanti omessi. La locandina ufficiale di Vallefiorita, letta visivamente, conferma prodotti tipici e artigianato; orario discordante omesso. |
| Altre fonti selezionate | Pagine comunali di San Sostene, Taverna, Montauro, Belcastro, Cerva, Magisano e Nocera Terinese; associazione Ri...vivi...amo Montepaone. URL e SHA-256 nella ricognizione. |

Il [resoconto GAL agosto 2024](https://www.galserrecalabresi.it/wp-content/uploads/2024/09/Newsletter_agosto_2024.pdf)
documenta ulteriori iniziative in diversi comuni: conservate in `historicalFindingsOutsideDelta`,
senza inventare giorni né trasformare il mese della newsletter in data dell’evento.
La relazione fine mandato di Zagarise è trattata allo stesso modo.

Piste non elevate a conferma: Girifalco URL comunale 410, date discordanti Davoli
e Pentone, Cicala e Jacurso in graduatorie di contributi, Petronà atto senza giorni,
Fossato Serralta/Calabria Straordinaria con testo diretto non leggibile, eventi
ricavati automaticamente da atti da aggregatori. Anche la presenza di una data
2026 in una pagina terza non sostituisce l’originale annuale verificato.

## Costi e condizioni

| Voce | Riscontro e limite |
|---|---|
| Curinga, quattro fiere | Suolo 30 / 40 / 25 / 40 euro nel modulo archiviato sotto 2024; validità annuale non espressa, `period: null`. Non quota completa né listino 2026. |
| Galilea 2026 | Dispositivo: **1 €/m² × superficie occupata × 2 giorni**. Non un euro complessivo per entrambe le giornate; bollo, IVA e servizi non quantificati. PDF controllato visivamente. |
| Bacco al Borgo, hobbisti | Importo suolo comunicato ai selezionati; energia non fornita. Nessuna cifra pubblicata; la regola non viene attribuita automaticamente agli stand di somministrazione. |
| Sellia | Allestimento proprio; spazi comunali con punto luce al prezzo stabilito ma senza cifra. Condizioni di spazio pubblico/privato separate. |

Nessuna nota economica applicata alla scheda Sant’Antonio preesistente. Bollo
lametino 14,62 euro datato, tariffario Falerna 2025 non associabile a una nuova
edizione verificata, biglietti visitatori, gratuità pubblico e contributi pubblici
restano esclusi dai prezzi espositore.

## Verifiche e integrazione successiva

Il verificatore ha riprodotto il catalogo base con il builder immutato nella
fixture, poi aggiunto il delta con un adattatore **solo in memoria**. Risultato:
**9.587 schede precedenti identiche in tutti i campi**, **426 note economiche
precedenti identiche**, **9.639 schede nella sola fixture**. Seconda build identica;
controlli negativi su collisione, mutazione e rimozione correttamente respinti.
Confronto SHA-256 degli originali e dei file versionati del checkout superato.
Le prove finali restano sotto `.local/verifiche/catanzaro-20261105/`.

Per ripetere: `python scripts/verify-fiere-catanzaro.py`. Il comando crea una
nuova fixture datata nel worktree; non modifica il catalogo effettivo. Interrompe
se trova ID già integrati o una base non riproducibile. Il numero complessivo
può aumentare se nel frattempo sono state integrate altre province: tutte devono
restare invariate. Nessun test del sito necessario per questi soli dati proposti.

Solo nella successiva integrazione centrale autorizzata:

1. Acquisire il commit provinciale e rieseguire il verificatore sulla base più
   recente, preservando L’Aquila, Cosenza e ogni altro lavoro concorrente.
2. Integrare `events` per append dopo gli overlay provinciali/comunali. **Non
   registrare questo delta nel ciclo del builder che rimpiazza l’intera provincia**:
   eliminerebbe la scheda lametina preesistente. Conservare l’ID Sant’Antonio.
3. Appendere le sette note al registro costi solo dopo controllo collisioni;
   adeguare la data catalogo centralmente. Non forzare collisioni, alias o merge
   di nuove varianti del nome: sottoporle a revisione.
4. Ripetere confronto integrale dei record precedenti e build; eseguire poi le
   verifiche centrali su pagine, SEO e recensioni previste dai contratti. Eventuale
   sincronizzazione ID recensioni è una scrittura condivisa, non eseguita qui.
5. Pubblicazione e aggiornamento checklist restano attività centrali separate:
   questa consegna non giustifica alcuna spunta online.

Fine della sola provincia. Nessun’altra ricerca o rinnovo automatico autorizzato.
