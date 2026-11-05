# Reggio Calabria — consegna provinciale isolata, 5 novembre 2026

**31 nuove schede in 24 comuni**, ricognizione nominale dei **97 comuni**.
16 schede con date documentate del 2026, dieci edizioni storiche e cinque
con solo periodo. Sono date pubblicate dalle fonti, non certificazioni di
effettivo svolgimento. Il solo appuntamento futuro datato del delta è il
mercatino di Motta San Giovanni del 12–13 dicembre 2026, con domanda entro
il 7 novembre alle 12:00 e limiti del bando descritti sotto.

Consegna per integrazione centrale: **nessuna pubblicazione o completamento
online**. Ramo `research/reggio-calabria-20261105`, base `358d781`.
Nessuna modifica a catalogo nazionale, builder, database, indici, checklist,
memoria condivisa o altre province. Nessun contatto a terzi, credenziale,
nuova automazione o sessione aggiuntiva.

## Materiali

- [Delta append-only](../fiere-reggio-calabria-delta-20261105.json): solo
  nuove schede con ID canonici, senza sovrascritture o cancellazioni.
- [Ricognizione e fonti](../fiere-reggio-calabria-ricognizione-20261105.json):
  elenco nominale, query e prova privata per ciascun comune, esiti e limiti,
  fonti principali/secondarie e classificazione temporale di ogni evento.
- [Costi separati](../fiere-reggio-calabria-costi-20261105.json): sette
  approfondimenti, con anno, condizioni, voci parziali e discordanti.
- [Verificatore locale](../../scripts/verify-fiere-reggio-calabria-20261105.py):
  controlla delta, comuni, date, fonti, ID, costi e conservazione delle schede.

## Metodo e copertura

Un primo passaggio web sul nome di ciascuno dei 97 comuni della base locale
`data/comuni-picker.json`, poi approfondimenti selettivi di Comuni, Regione,
Camera di Commercio, GAL e organizzatori. Verifica delle grafie Reggio di
Calabria/Reggio Calabria e Montebello Jonico/Ionico; esclusi risultati di
comuni omonimi o fiere fuori provincia. Il perimetro di 97 comuni è coerente
con la [descrizione istituzionale della Metrocity](https://www.cittametropolitana.rc.it/area_letturaNotizia/394475/pagsistema.html).

La ricognizione registra esiti individuali anche per i **73 comuni senza
nuova scheda**. È una ricerca delle fonti accessibili, con approfondimenti
selettivi; non un inventario integrale di albi, pagine social o manifestazioni.
Un esito negativo indica insufficienza delle prove selezionate, non assenza
di fiere. La profondità delle fonti disponibili varia da comune a comune.
Il catalogo esistente conteneva soltanto due schede provinciali: San Rocco
a Gioiosa Ionica e Madonna della Montagna a San Luca, entrambe invariate.

Esclusi mercati ordinari, concerti e feste solo religiose senza prova di
componente commerciale; sagre ammesse come tali senza presumere ingresso
di venditori esterni. Nessuna nuova affluenza, notorietà, disponibilità di
posteggi o valutazione commerciale.

## Riscontri e scelte principali

**Cittanova:** tre fiere distinte: San Rocco 19–21 settembre, San Girolamo
29–30 settembre e Rosario 10–11 ottobre 2026. Il PDF San Rocco è scaricato
e letto visivamente; le pagine comunali restituiscono 410 nel download.
San Girolamo e Rosario sono sostenuti dal testo comunale indicizzato,
conservato separatamente. Il percorso della pagina Rosario contiene ancora
San Rocco: prevalgono titolo, data e testo, senza creare una duplicazione.
Gli allegati di queste ultime due fiere non sono stati acquisiti.

**Reggio:** Feste Mariane 10–20 settembre 2026, smontaggio entro le 12:00
del 21; Comics 16–18 ottobre da sito e modulo espositori dell’organizzatore;
Bergarè 22–25 ottobre da sito della Camera di Commercio. Non mescolate
le date storiche del Comics presenti nello stesso sito. Il bando natalizio
comunale 2026, per organizzare il mercato, è soltanto esplorativo e
interrompibile: le date progettate 8 dicembre–8 gennaio non diventano
un’edizione confermata nel delta. Mercante in Fiera è un mercato domenicale
ordinario: conservata la pista, non aggiunto.

**Bivongi:** avviso comunale per Badia 17–18 agosto 2026, domanda entro
3 agosto. La fonte regionale oscilla fra trentesima e trentunesima edizione:
non utilizzato il numero d’edizione per l’identità. San Martino conserva
esclusivamente le date 11–15 novembre **2025**.

**Motta San Giovanni:** pagina comunale del 16 ottobre 2026 chiara su
12–13 dicembre e scadenza 7 novembre 2026. Il bando reca 2026 nel titolo,
nella delibera e nella scadenza, ma conserva 2025 all’art.3 e all’art.5:
discordanza dichiarata, con verifica necessaria prima della domanda.
La pagina e il bando documentano l’assegnazione gratuita della casetta,
non tutti gli oneri dell’operatore né un posto garantito.

**Palmi:** adottati 12–17 agosto 2026 dall’articolo sulla durata del bando;
il richiamo al 2025 nel preambolo è conservato come refuso apparente,
non corretto nel documento originale. Domande entro 24 luglio ore 12:00.
**Terranova:** avviso SUAP 3 maggio 2026 e domanda entro 28 aprile.
**Locri:** PDF commerciale Agrifest letto visivamente: 16–18 agosto
**2024**, domanda entro 5 agosto; nessuna proiezione al 2026.

**Mammola:** conservato solo il 9 agosto tradizionale. Il portale propone
9–10 agosto 2026, con URL 2024 e ultimo aggiornamento 2025; testo riferito
alla serata del 9, senza programma che provi due giornate di vendita.
**Scido:** campi data comunali 17 agosto **2024**; **Gerace, Carmine:**
22–23 luglio **2023**, nonostante l’aggiornamento della pagina nel 2026.
**Delianuova:** ordinanza per il 31 ottobre **2021**, senza dedurre una
data corrente dall’ultima domenica di ottobre. **Seminara:** solo prima
decade di agosto, con cadenza espressamente **non annuale**.

Altri riscontri conservati: Agnana (due ricorrenze con bancarelle),
Brancaleone in Fiera 24 gennaio 2026, Cardeto 31 ottobre 2026,
mercatino dell’usato Cinquefrondi 19 luglio 2026, Mare e Terra a Gioia
Tauro 17–19 luglio 2026 e Portosalvo a Siderno 3–8 settembre 2026,
anticipata rispetto al consueto calendario. Pezzo Duro a Gioiosa mantiene
solo la ricorrenza dell’8 agosto; Rizziconi conserva Agricoltura 2024 e
Natale 2025, San Ferdinando Re la finestra autorizzata 2025 e Stignano
A Fera da Mpetrata 2024. Arrosticini di Oppido resta nel 2023.

Tra i candidati non importati: Gran Galà e Pane di Grano di Bagnara
(estate documentata senza mese sufficientemente preciso selezionato),
Casignana Artigianale, Fungo di Giffone, San Martino di Ardore, Castagna
di Martone, fiere di Taurianova e diverse sagre dell’area grecanica.
Palio Ribusa: richiamo alla fiera storica senza prova sufficiente del mercato
commerciale odierno. Le ragioni puntuali restano nell’audit nominale.

## Costi: limiti da mantenere

Sette record nell’archivio separato. Nessun importo delle altre schede
trasformato in zero e nessun costo dei visitatori attribuito al banco.

- **Reggio, Feste Mariane:** tabella canoni per **10 giorni**, mentre il
  periodo dell’avviso è 10–20 settembre. Pentimele 2,68 €/m² e centro
  3,35 €/m², con totali esatti per i moduli pubblicati; non ricalcolati
  per undici giorni. Istruttoria, bolli e assicurazione separati.
- **Palmi:** 10 € istruttoria e 16 € bollo; canone e premio assicurativo
  non quantificati. I 500.000 € sono massimale RCT, non prezzo.
- **San Giorgio Morgeto:** 250 € agroalimentare o 150 € altri prodotti
  per i **due giorni**; banco e punto luce, senza corrente per altri usi.
  IVA non precisata. I 75 € per costume danneggiato non sono quota ordinaria.
- **Terranova:** 0,60 €/m²/giorno **prima delle riduzioni** richiamate
  dall’avviso; nessuna superficie ipotetica usata per stimare un totale.
- **Motta:** gratuità della casetta subordinata a selezione, non di tutti
  gli adempimenti e servizi. **Bivongi:** esenzione della quota soltanto
  per ETS senza scopo di lucro; tariffario dinamico non acquisito.
- **Rizziconi 2025:** art.9, pagina 6, indica 420 €/sei giorni e
  210 €/tre; il modulo a pagina 12 indica 4.000 €/tre e 200 €/sei.
  Entrambe le pagine lette visivamente. Nessuna cifra corretta per ipotesi
  o presentata come prezzo univoco.

## Prove e verifica

Archivio privato nel worktree:
`.local/ricerche/fiere-reggio-calabria-20261105/`.
Contiene query, risposte del motore web, originali scaricati, manifest
SHA256, estrazioni, pagine PDF renderizzate, fixture base/candidato e report.
I file del motore sono copie della risposta dello strumento, non originali
dei siti. HTTP 200 con corpo vuoto, presente per diverse fonti regionali,
non viene descritto come documento leggibile; la lettura è da testo
indicizzato. Errori 410 e cache miss conservati, nessuna cancellazione.

Il verificatore ha dimostrato localmente **9.587 → 9.618** nella sola
fixture, con tutte le **9.587 schede preesistenti identiche in ogni campo
e nello stesso ordine**. Catalogo nazionale identico anche nei byte.
Nessuna collisione fra i 31 nuovi ID e la base; identità comunali controllate.
Sette prove negative respingono modifiche, rimozioni, collisioni, duplicati,
province estranee, costi su vecchie schede e periodi promossi a date.
Controllate le impronte di 49 recuperi originali registrati nei manifest;
un download HTTP200 vuoto resta esplicitamente non leggibile.

Comando, dalla root del worktree:

```powershell
python scripts/verify-fiere-reggio-calabria-20261105.py --self-test
```

La fixture conserva intenzionalmente i metadati nazionali precedenti:
**non è un catalogo pubblicabile**, né una build del sito. Non sono stati
eseguiti build, test browser del sito o sincronizzazioni database, perché
l’integrazione non appartiene a questa consegna.

## Integrazione centrale successiva

1. Acquisire soltanto i cinque file di questo intervento. Preservare i delta
   già consegnati per L’Aquila e Cosenza e il lavoro parallelo di Catanzaro;
   Pavia resta riservata. Non sostituire `data/fiere.json` con la fixture.
2. Rieseguire il verificatore con `--catalog` sul catalogo effettivo centrale:
   controlla collisioni e identità anche sulle aggiunte successive alla base.
   La fixture privata della ricerca è richiesta soltanto per `--self-test`.
3. Integrare **in aggiunta** i 31 eventi e applicare i sette record costi
   esclusivamente ai rispettivi nuovi ID. Non usare questo delta come
   sostituzione di tutta la provincia: le due schede preesistenti vanno mantenute.
4. Adeguare centralmente il percorso di build e la data del catalogo dopo
   il 5 novembre 2026. Nessun ID deve essere rigenerato con nomi diversi.
   Conservare periodi, storico, limiti e costi discordanti; verificare
   duplicati semantici con gli eventuali altri delta centrali.
5. Build, verifiche UI/SSR, recensioni e qualsiasi eventuale aggiornamento
   al database vanno gestiti in una fase centrale separata, dopo controllo
   dei contratti. Questa sessione non ha eseguito sincronizzazioni.
6. Nessuna spunta di completamento o dichiarazione di pubblicazione deriva
   dalla sola ricerca. La sessione termina con Reggio Calabria.
