# Campobasso — ricerca del 6 novembre 2026

Proposta append-only sulla base `d240d1b`: **226 nuove identità in 70 comuni**,
con ricognizione nominale di **tutti gli 84 comuni**. Non sono 226 edizioni
confermate nel 2026: **197 schede hanno come fonte principale il calendario
regionale storico 2021**; 10 schede contengono edizioni documentate nel 2026.
Le altre attestazioni distinguono anni precedenti e periodi senza anno.
Il calendario 2021 documenta una previsione amministrativa, non l'effettivo
svolgimento di ciascuna fiera né la sua permanenza attuale.

File di consegna:

- [Delta](../fiere-campobasso-delta.json): solo nuovi ID, compatibili col builder.
- [Ricognizione](../fiere-campobasso-ricognizione.json): query eseguite, esiti
  specifici, fonti, limiti, esclusioni e due proposte di aggiornamento separate.
- [Costi provinciali](../fiere-campobasso-costi.json): nove note per nuovi ID,
  fondate su quattro documenti; sei riguardano la stessa domanda di Termoli.
- [Verificatore](../../scripts/verify-fiere-campobasso.py): fixture privata con
  il builder effettivo, senza modifica dei file nazionali.

Le sezioni di ricerca conservano la consegna iniziale; esito della successiva pubblicazione in fondo.

## Metodo e prove conservate

Ricerca nominale per ogni comune, seguita da approfondimenti selettivi su
Comuni, Pro Loco, organizzatori e fonti istituzionali. **116 query conservate**
nei 29 file `query-*.json`, con i risultati effettivamente restituiti; non sono
simulate ricerche comunali. Non è stata letta integralmente ogni pubblicazione
degli albi o ogni pagina social; ricerca conclusa con limiti, non censimento
certificato. Nessun contatto, domanda, credenziale letta, altra provincia,
sessione aggiuntiva o automazione avviata.

Originali e testi in `.local/worktrees/campobasso-20261106/.local/ricerche/campobasso-20261106/`:
79 tentativi di acquisizione, 75 risposte HTTP 200, con URL finale, dimensione
e SHA256 nei `fonti-*-http.json`. `event-evidence.json` collega ogni nuovo ID
all'originale e alle pagine pertinenti. Conservati anche PDF, testi estratti,
collegamenti delle pagine, immagini PDF lette e decisioni sui candidati regionali.
Le prove private restano escluse da Git e dal deploy.

Il [portale regionale](https://www.regione.molise.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/224)
collega il [calendario originale 2021](https://cloud.urbi.it/urbi/progs/urp/fecore02.sto?DOCORE_testata=21442506&DOCORE_versione=1&FNSTR=TGXWGGAPAO_2021.PFF&DB_NAME=l1200158&ContestoChk=DE).
Letta la sezione fiere di Campobasso, pagine 21–47. L'altro PDF indicizzato,
già usato dalla base per Bojano, è invece **anno 2011**: non datato al 2026
dalla data di scansione del motore di ricerca. Nessuna importazione dei mercati
settimanali ordinari come fiere nuove.

Backup della sessione verificato su origin:
`backup/session-20261106-004257-campobasso-ricerca-20261106`.
Primo push del tag fallito, secondo riuscito e verificato con `ls-remote`.
Restano validi i backup del coordinatore indicati nella richiesta.

## Approfondimenti e identità

| Comune | Decisione dalle fonti originali |
|---|---|
| Campobasso | CampoBazar con disciplinare aggiornato nel 2025; Natale come previsione dell'avviso 2024; Campobasso in Fiera con ordinanza del rinvio dal 25 gennaio al 1 febbraio 2026. Richiamati 22 febbraio e 29 marzo, rinviabili in caso di maltempo; determina di settembre senza giorno dedotto. Corpus Domini già presente: nessuna nuova identità. |
| Termoli | Bando 17 febbraio 2026 approfondito e graduatorie successive: Madonna a Lungo 7 aprile; Pietro e Paolo 28–30 giugno; Carmelo 15–16 luglio; Santa Maria degli Angeli 1–2 agosto; Ferragosto 15 agosto; pre-sagra/pesce 21–22 agosto. San Basso già presente e non modificato. Hobbisti 24 giugno–6 settembre come finestra stagionale, non apertura quotidiana certificata. |
| Guglionesi | Sant'Adamo dal bando 2024: zona A soltanto 27 giugno, zona B 27–29 giugno. Non confusa con Sant'Adamo di vendemmia. |
| Montecilfone | San Giorgio 22 aprile 2026 dal titolo dell'avviso comunale di assegnazione. Allegati JavaScript non acquisiti: nessuna finta lettura delle graduatorie. Fiere serali raggruppate senza date non scisse in nuove identità. |
| Lucito | San Nicola 5 dicembre 2025; Immacolata 11 settembre 2025 dalla pagina comunale, invece del 10 settembre del calendario 2021. Una sola identità per Immacolata; maggio di San Nicola resta soltanto storico. |
| Cercemaggiore | San Vincenzo Martire 10–11 settembre 2025: aggiornamento della pagina nel 2026 non cambia l'anno dell'evento. Distinto da San Vincenzo Ferrero del 1 luglio nel calendario storico. San Biagio febbraio e dopo Pasqua riuniti sotto una sola identità. |
| San Giovanni in Galdo | Trippa e Panunto nel 2025, Pasta con Polpette 31 agosto 2025; Pasta e Fagioli/Fricas­sea 1–2 agosto 2024. Spezzatino: conservato solo giugno, perché la pagina presenta il programma religioso 24–30 giugno 2024 senza separare le serate gastronomiche. |
| Guardiaregia | Cantine di…Vine 23–25 ottobre 2026 dal portale della Camera di Commercio del Molise, con orari differenti venerdì e fine settimana. Nessun prezzo banco dalle degustazioni. |
| San Massimo | Festa della Castagna 18–19 ottobre 2024 dal Comune. Ingresso e navetta gratuiti riguardano i visitatori. |
| San Martino in Pensilis | Fiera Santa Rosa 30–31 agosto 2024 da ordinanza, nome/sede corroborati dal calendario. Pampanella soltanto 8 agosto 2018, da Confcommercio partecipante con uno stand. |
| Spinete | Sapor d’na vota 11 ottobre 2025 dal programma comunale. Il resoconto musicale 2026 non sostituisce il programma annuale. |
| Monacilioni, Ferrazzano, Ripalimosani | Soppressata a maggio dal Comitato; Argentina Fest a luglio e Ferragosto dalla Pro Loco senza anno; mercatini natalizi di Ripalimosani dalla relazione comunale 2014–2019. Nessuna data 2026 dedotta. |
| Sepino | Pro Loco e calendario storico corroborano Piana d'Olmo e Altilia. Santa Cristina: Pro Loco fiera il 23 luglio, calendario anche il 24; mantenuto solo luglio senza risolvere la differenza. |

Altre cautele: San Pardo di Larino a ottobre escluso per possibile sovrapposizione
con la Fiera d'Ottobre preesistente; San Zenone/San Zenone I di Montenero in una
sola scheda con i due periodi; Madonna delle Grazie di Fossalto distinta per
sede (centro e Lisciaro); Canneto attribuito a Roccavivara, senza trascinarne
il testo nella precedente voce di Ripabottoni. Matrice Madonna della Strada
esclusa perché il periodo relativo non basta a ricavare un mese certo.

I 14 comuni senza aggiunte hanno esiti individuali nell'audit: Bonefro,
Castropignano, Cercepiccola, Colle d'Anchise, Montemitro, Montorio nei Frentani,
Oratino, Pietracatella, Pietracupa, Portocannone, Provvidenti, San Giacomo degli
Schiavoni, San Polo Matese, Santa Croce di Magliano. Non significa assenza di
eventi. Fra le piste aperte: Creatività di Bonefro, Tartufo e Tintilia,
Cantine Cercepiccolesi, Tolle, Vicolo Invita, percorso gastronomico Pietracupa,
Oktoberfest Portocannone, Prosciutto, Taccozze e Fagioli, baccalà santacrocese.
Non trasferiti ai comuni eventi vicini proposti automaticamente dai portali.
La terza domenica di agosto nella pagina di Provvidenti riguarda Montréal,
non una data commerciale del paese molisano.

## Costi e accesso ai posteggi

- **Natale Campobasso 2024:** art. 5, pagina 2 letta anche visivamente:
  noleggio casetta indicativo **circa 700 € + IVA**, struttura presumibilmente
  4 × 2,50 m, condivisibile fra due operatori. Impianto elettrico e consumo
  compresi; occupazione a carico di ciascun operatore, non quantificata.
  Non diviso per due o per i giorni e non presentato come preventivo definitivo.
- **CampoBazar:** partecipazione gratuita e canone esente soltanto nelle
  condizioni del disciplinare comunale (cessioni occasionali non professionali,
  dichiarazione di assenza di rilevanza economica/commerciale). Vietati alimenti
  e beni nuovi; non opportunità gratuita per un normale banco d'impresa.
- **Sant'Adamo Guglionesi 2024:** **16 € di bollo** della domanda; occupazione
  anticipata separata e non quantificata. Nessun prezzo completo del banco.
- **Termoli 2026:** art. 2 e art. 4 punto 9 del bando: **bollo 16 € e
  istruttoria 100 € per la domanda**, che permette di selezionare più eventi.
  Sei note riferite ai sei nuovi eventi del bando: non sei tariffe autonome,
  non moltiplicati gli oneri per fiera, posteggio o giorno. CUP separato,
  comunicato con avviso agli assegnatari; IVA/servizi non quantificati.
  Domande scadute il 9 marzo secondo le graduatorie. Sagra del Pesce:
  alimentari limitati a dolciumi, frutta secca e pannocchie.

Fonti: [Natale Campobasso](https://www.comune.campobasso.it/campobasso2/po/attachment_news.php?id=2864),
[CampoBazar](https://egov.comune.campobasso.it/campobasso2/zf/index.php/servizi-aggiuntivi/index/index/idtesto/20290),
[Sant'Adamo](https://halleyweb.com/guglionesi/po/attachment_news.php?id=1474),
[bando Termoli 2026](https://www.comune.termoli.cb.it/wp-content/uploads/2026/02/BANDO_FESTE_ANNO_2026.pdf).

Esclusi dai costi banco: menù Spinete 17/20 €, menù Tartufando 28 € da snippet,
biglietti e navette gratuiti. Nessuna affluenza, notorietà o disponibilità
commerciale inventata. Le graduatorie non attestano posti oggi liberi.

**Proposte separate, non applicate:** Corpus Domini Campobasso, bando storico
20–22 giugno 2025 con bollo 16 € e istruttoria 51,65 €, canone/contributo festa
separati; San Basso Termoli, posteggi del bando 3–5 agosto 2026 e oneri della
domanda comune. Restano intatti i due ID, tutte le schede e i costi preesistenti.

## Accessi falliti e limiti di lettura

Tre errori TLS: newsletter UNPLI 2016 (certificato non valido), Tartufando
(certificato scaduto), dominio `egov.hseweb.it` per settembre Campobasso
(nome certificato non corrispondente). La pagina di settembre è stata poi
recuperata dal dominio comunale valido. Tartufando e baccalà UNPLI restano
soltanto piste da snippet indicizzati, non originali integralmente letti.
Un tentativo di URL Sant'Elena ha restituito **404**, conservato come errore:
la scheda Sant'Elena utilizza solo il calendario regionale 2021.

L'allegato dell'ordinanza Campobasso in Fiera, pur richiesto come non firmato,
è un contenitore di firma con PDF incorporato: originale conservato, testo
estratto dal PDF; nessuna validazione della firma dichiarata. Le determine
scansionate Termoli hanno restituito solo intestazioni nell'estrazione:
le pagine pertinenti sono state renderizzate e lette visivamente; per le
date e i requisiti usati si conservano anche bando e pagine comunali leggibili.

## Verifiche e stato della consegna

`python scripts/verify-fiere-campobasso.py` passato: il builder effettivo
riproduce la base **9.859**, candidato **10.085** solo in fixture privata;
build successive identiche. Tutte le **9.859 schede precedenti identiche in
ogni campo e nello stesso ordine**, tutte le **454 note economiche precedenti
identiche**, nove nuove note soltanto sui nuovi ID. Nessuna collisione degli ID,
comuni/provincia e copertura 84/84 verificati. Report e fixture conservati in
`.local/verifiche/campobasso-20261106/`.

Non modificati cataloghi nazionali, builder, registro costi nazionale, checklist,
memoria o DB. Ricerca pronta per l'integrazione separata sotto mutex; **non
pubblicata**, checklist non chiusa. La successiva integrazione dovrà confrontare
il delta con la base allora corrente e ripetere le verifiche pertinenti.

## Pubblicazione verificata

Commit `e494dd3`, Vercel Ready `dpl_H7yYjcoixfLkZ6vcifqqc85xGNaQ` su subingresso.it. Catalogo 10.119 schede e 471 note; tutte le 9.893 schede e 462 note precedenti identiche nello stesso ordine. Due build identiche, settori e SEO passati. Tutte le 230 schede provinciali nel filtro e SSR; dettagli/pagine su 14 campioni (tutte le nuove note e le edizioni 2026 incluse), Chromium1440/320 e WebKit390 locali/online. Catalogo online identico, 226 letture API riuscite e 10.119 ID recensioni sincronizzati. Due proposte su eventi precedenti escluse. Nessun account, recensione o invio reale di prova.

Prove `.local/verifiche/campobasso-pubblicazione-20261106/`. Fonti e limiti storici conservati. Solo Campobasso aggiuntiva conclusa con 6.1 sol low; Potenza ferma, nessuna prosecuzione automatica.
