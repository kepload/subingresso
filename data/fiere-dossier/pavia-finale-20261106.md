# Pavia — ricerca finale del 6 novembre 2026

Stato: **ricerca pronta per integrazione**. Questa consegna non dichiara pubblicazione, non aggiorna la checklist e non modifica il catalogo centrale. Baseline `e622823`: 10.266 schede, 477 note economiche, sei schede della provincia di Pavia.

## Risultato

128 nuove schede in 70 comuni, quattro arricchimenti espliciti di schede esistenti e quattro nuove note economiche. La fixture contiene 10.394 schede, delle quali 134 pavesi, e 481 note economiche. Nessun ID esistente è cancellato o rinominato. Non sono assegnati nuovi dati di affluenza o notorietà.

La ricognizione comprende tutte le 186 righe provinciali di `comuni.json`, riconciliate con i **185 comuni attuali**. Campospinoso e Albaredo Arnaboldi sono conservati come due righe dell’anagrafica del catalogo, entrambe ricondotte a Campospinoso Albaredo. L’incorporazione è efficace dal 18 novembre 2023; la Camera di Commercio indica oggi 185 comuni pavesi. Nessuna modifica al dataset condiviso. Fonti: [Comune](https://www.comune.campospinoso.pv.it/it-it/vivere-il-comune/rubriche/fusione-3502-1-036ba1c79d9c2e1722c17da812968452), [Camera di Commercio](https://www.cmp.camcom.it/suap/suap-delle-province-di-cremona-mantova-pavia), [legge regionale 5/2023](https://normelombardia.consiglio.regione.lombardia.it/normelombardia/Accessibile/main.aspx?idparte=lr002023111400005ar0003a&view=showpart).

## Metodo e originali

Il vecchio checkout `C:/Users/utente/Documents/subingresso-pavia-20261014`, ramo `ricerca/pavia-20261014`, è stato ispezionato soltanto in lettura: stato Git pulito, HEAD `28348a9`, nessun delta o dossier provinciale aggiuntivo e nessuna cartella `.local`. La ricerca negli archivi privati della root non ha trovato una precedente ricerca Pavia recuperabile; non sono stati spostati o ripristinati file. Il backup remoto centrale indicato nell’incarico è stato verificato: `backup/session-20261106-205906-ultime-pavia-nuoro`, oggetto `4bfbb2f830d8ae06286b0399cc137976add3938e`.

Sono state eseguite e salvate 187 query nominali web: una per ogni riga del catalogo e una aggiuntiva sul nome attuale Campospinoso Albaredo. Risultati e query effettive sono individuali nell’audit; i risultati del motore, spesso generici o riferiti a omonimi, non sono stati usati da soli per aggiungere schede.

Sono stati acquisiti lo [snapshot regionale via API](https://www.dati.lombardia.it/resource/hs8z-dcey.json?%24where=prov%3D%27PV%27&%24limit=50000), con 37 record provinciali 2026–2027 in nove comuni, e tutti i 37 programmi originali collegati. Ogni record ha una decisione individuale nell’audit. I programmi sono stati letti: tre scansioni senza testo utile sono state controllate anche visivamente. Il registro comprende anche semplici cene, karaoke e attività non commerciali, escluse motivatamente dalla proposta di nuove fiere.

Dal [sitemap VisitPavia](https://www.visitpavia.com/sitemap.xml) sono state scaricate 732 pagine evento originali. L’indice testuale è stato usato per la ricognizione e per individuare fiere, sagre, mostre mercato e mercatini tematici; la lettura e la curatela delle schede incluse sono documentate per evento. Non si dichiara una lettura manuale integrale di tutte le 732 pagine. Sono stati acquisiti inoltre 93 allegati e approfondimenti, i moduli dell’organizzatore di Autunno Pavese, il regolamento comunale di Pavia e gli originali regionali. Le acquisizioni conservano URL, stato HTTP, file e SHA-256; il manifesto privato verifica 1.909 file di prova.

Prove nel checkout assegnato: `.local/ricerche/pavia-finale-20261106/`. Riferimenti principali: `visitpavia-clean.json`, `nominal-queries.json`, `current-municipality-query.json`, `all-region-programmes-index.json`, `allegati-index.json`, `bandi-index.json`, `event-review.json`, `manifest-sha256.json`. Originali in `fonti/`, `allegati/`, `queries/`; script privati `download.py`, `nominal.py`, `regional-programmes.py`, `allegati.py`, `assemble.py`, `audit.py`.

## Condizioni operative e costi

- **Autunno Pavese**, 2–5 ottobre 2026: letti domanda e regolamento produttori di sette pagine e modulo Food Truck di cinque pagine. Ammessi operatori agroalimentari con sede nelle province di Cremona, Mantova e Pavia, previa accettazione. Domanda entro 31 luglio, saldo entro 28 settembre: termini scaduti. Acconto 50%; rinuncia almeno venti giorni prima con addebito del 50%, successivamente quota intera. Allestimenti 1–2 ottobre e disallestimento 6 ottobre specificati dal regolamento. Vendita e somministrazione richiedono le autorizzazioni dell’espositore; fritti/grigliati vietati nella Piazza del Gusto interna. [Modulo produttori 2026](https://www.autunnopavesedoc.it/wp-content/uploads/2026/07/AP_Modulo_Adesione_PRODUTTORI_2026.pdf), [Food Truck 2026](https://www.autunnopavesedoc.it/wp-content/uploads/2026/07/AP_Modulo_Adesione_FOODTRUCK_2026.pdf).
- **Nota economica Autunno Pavese**: iscrizione 120 € separata dallo spazio. Spazio allestito 65 €/m² o semi allestito 55 €/m², minimo 9 m²; postazione 6 m² 330 € a disponibilità limitata; Piazza del Gusto 12 m² 960 €; food truck esterno 500 € più iscrizione. Tutti gli importi IVA esclusa, IVA 22%. Servizi compresi ed extra sono distinti nella nota: non sono biglietti del pubblico né prezzi per un’edizione futura. Listino aggiuntivi verificato anche visivamente sulla pagina 3 del modulo produttori.
- **Fiere di marzo, agosto e ottobre di Vigevano**, tre note: bollo istanza 16 €, distinto da oneri istruttori e Canone Unico da quantificare in base al posteggio. Scelta tramite TownSpaces e CUP tramite PagoPA; mancato pagamento annulla la scelta. Solo per agosto la pagina specifica iscrizioni 6 maggio–12 luglio 2026, scadute. La pagina è stata letta via web e il paragrafo economico è stato confermato dall’indicizzazione della fonte; i successivi download diretti hanno restituito 503. Il PDF delle condizioni generali è disponibile, ma non contiene il tariffario. Prove e limite registrati. [Servizio comunale](https://comune.vigevano.pv.it/servizio/fiere/).
- **Sensia, Voghera**, ambulanti 15–17 maggio 2026: domanda in bollo entro 25 febbraio, dimensioni del banco, autorizzazione commerciale, anzianità d’impresa; certificazioni gas per chi ne fa uso, estintore per ogni operatore, massimo tre posteggi per settore e uno per autorizzazione. L’avviso non quantifica il bollo o il costo del banco: nessuna somma inventata. Il sito dell’organizzatore indica inaugurazione generale il 14, distinta dalle date dell’avviso ambulanti. Il documento contiene anche un residuo testuale «attestazione 2025» accanto al termine 15 aprile 2026: non è stato trasformato in un requisito certo aggiornato. [Avviso originale](https://www.comune.voghera.pv.it/s3/8018/allegati/news-fiera-2026-ambulanti.pdf).

## Quattro aggiornamenti, senza nuovi duplicati

| ID conservato | Approfondimento proposto |
| --- | --- |
| `lombardia-garlasco-fiera-di-pasqua` | La Sagra della Bozzola è la fiera pasquale già presente, stessa frazione e date 5–6 aprile: non viene aggiunta una seconda scheda. |
| `lombardia-borgo-san-siro-fiera-per-la-festa-del-paese` | Il programma distingue festa 15–19 ottobre e fiera commerciale **solo 18 ottobre 2026**; proposta correzione delle date del banco. |
| `lombardia-borgo-san-siro-fiera-di-primavera` | Calendario corrente 3 maggio; programma preliminare «3 o 24 maggio»: conservata la data del registro e spiegato il limite. Bancarelle e hobbisti documentati. |
| `lombardia-lomello-fiera-di-maggio` | Programma comunale 12 maggio, ore 8–13: massimo 40 banchi alimentari e non alimentari; **somministrazione non prevista**. |

I record `before` del catalogo e `beforeSource` dell’import sono inclusi in `existingUpdates`; `after` è l’override editoriale da aggiungere alle fonti. I due eventi Broni preesistenti restano invariati: i programmi letti documentano soprattutto il luna park e non giustificano un’invenzione di settori o condizioni per i banchi.

## Date, selezione e limiti

- Gli intervalli non continui sono separati: Primavera dei Vini solo le cinque domeniche di marzo; Cipolla Rossa di Breme 12–14 e 19–21 giugno; Buongustaio di Langosco 11–12 e 18–19 luglio; Tri Pas in Piasa quattro serate distinte. Le date del programma non significano che ogni giorno sia attivo un banco.
- Pet in Fiera: fonte organizzatore [petinfiera.it](https://www.petinfiera.it) conferma **23–24 maggio 2026**, concorde con VisitPavia; scartate le date 16–17 del precedente calendario regionale.
- Parona: registro regionale e testo concordano su 2–5 ottobre; il riepilogo turistico si ferma al 4. Adottato il registro concorde con il testo. Sant’Anna a Dorno: adottato 25–28 luglio 2026 da registro e testo, senza riprodurre il riepilogo errato con inizio 2025.
- Zucca Bertagnina: estensione 10–16 ottobre nella pagina territoriale contro singolo giorno 11 nel registro; pubblicato soltanto ottobre, con limite esplicito. Sito organizzatore in errore HTTP 500 al controllo.
- Le edizioni 2024 e 2025 sono storiche, non promesse 2026. Mercatino natalizio di Rivanazzano e mercatino da Forte dei Marmi a Garlasco sono esclusi dalla proposta per date discordanti nella medesima pagina.
- Due ricorrenze specializzate di Pavia, Santa Rita e Mercato dell’Antiquariato, derivano dal [regolamento comunale 2015](https://www.comune.pavia.it/media/174), artt. 50–51. Sono descritti periodo e disciplina storici, senza generare date puntuali 2026 o dichiarare conferma della disciplina attuale. La fiera antiquaria è un evento specializzato periodico, distinto da un mercato comunale ordinario settimanale.
- “Tenuta – Il Mercato della Domenica” di Pieve del Cairo è la quarta edizione autonoma della Fondazione Darefrutto, artigianato/handmade e produzioni locali, 11 ottobre 2026 ore 11–20. La fonte non ne documenta una periodicità fissa: censita soltanto questa data, senza generare altre domeniche o presentarlo come mercato comunale settimanale.
- Autunno Pavese in Tour non diventa una seconda fiera del capoluogo. Il Palio della Santa Croce del 3 maggio a Mortara, con vendita di prodotti documentata, resta distinto dal Palio dell’Oca di settembre. I programmi Corvino 2027 restano piste, senza dedurre automaticamente un nuovo evento o la continuità dell’edizione.
- Per i tre eventi di Colli Verdi, dove l’anagrafica condivisa non ha coordinate, sono usate le coordinate del luogo riportate nel JSON-LD originale VisitPavia, con `coordinateSource`: Pometo e Valverde restano frazioni del Comune attuale. Nessuna modifica al builder o al dataset comunale.

La ricerca è una ricognizione documentale nominale con limiti. Non certifica il censimento completo o l’assenza di eventi nei comuni senza nuove schede. Gli snippet, gli esiti negativi e i soli nomi dell’import non equivalgono a una ricerca approfondita. Le sagre con cucina propria non provano l’ammissione di operatori esterni. Gratuità pubblico, costo del banco, bollo, canone, IVA, servizi e ticket restano distinti. Non sono stati effettuati contatti o invii a terzi.

## Verifica riproducibile e integrazione

Eseguire `python -B scripts/verify-fiere-pavia-finale.py`. Usa il builder effettivo con i dati della baseline in `.local/verifiche/pavia-finale-20261106/fixture`, aggiunge soltanto le nuove fonti e gli override proposti, applica le quattro note e ricostruisce due volte.

Esito: 10.394 schede, 134 Pavia, quattro aggiornamenti autorizzati; tutti gli ID precedenti conservati. Le 10.260 schede delle altre province restano identiche e nello stesso ordine, comprese tutte le 361 schede della Sardegna e la relativa attribuzione alle province attuali. Anche i due record pavesi non aggiornati restano identici. Tutte le 477 note precedenti sono conservate; totale 481. Le due build producono gli stessi byte. Verificate 1.909 impronte dei file di prova. Report: `.local/verifiche/pavia-finale-20261106/checks.json`; SHA-256 del catalogo di fixture `0995a8ea49e46a1207ec05e53c20456ec69457d8de48617a571de8b2599dbcfe`.

Il test generale con fixture storiche segnalate nell’incarico non è stato alterato o usato per forzare modifiche estranee. La validazione significativa di questa consegna è il test provinciale con il builder reale.

Al coordinatore: aggiungere i 128 `events` di `data/fiere-pavia-finale-delta.json` a `data/fiere-fonti.json` e i quattro `existingUpdates.after` come override editoriali, verificando prima i rispettivi record iniziali; i quattro non sono nuove schede. Aggiungere le quattro note da `data/fiere-pavia-finale-costi.json` solo se gli ID non hanno già note, controllando `initialState`. Rigenerare con il builder invariato, integrare separatamente Nuoro e ripetere i controlli di conservazione. Checklist, memoria, indici condivisi, sincronizzazione degli ID recensioni, pubblicazione e verifica live spettano al coordinatore dopo l’integrazione. Nessuna scrittura DB in questa sessione.

## Integrazione e pubblicazione centrale

La consegna di ricerca sopra è stata integrata dal coordinatore insieme all’altra ultima provincia. Pubblicazione e controlli locali/online conclusi: [esito di chiusura delle 110 province](chiusura-pavia-nuoro-20261106.md). Originali privati conservati nel worktree provinciale indicato nel dossier centrale.
