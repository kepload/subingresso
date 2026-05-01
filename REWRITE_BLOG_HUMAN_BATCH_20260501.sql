-- ============================================================
--  REWRITE BLOG POSTS — STILE UMANO (1 maggio 2026)
--  10 articoli riscritti: paragrafi corti, tono pratico ambulante,
--  niente AI tells (trattini lunghi, "esploriamo", liste uniformi).
--  Target lunghezza: 2.300-3.200 caratteri ciascuno.
--  Eseguire nel SQL Editor di Supabase.
-- ============================================================

-- ───────────────────────────────────────────────────────────
--  1. migliori-mercati-lago-di-garda-posteggi-ambulanti
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Il Garda non è un lago "normale" se lo guardi dal banco di un ambulante. In trenta chilometri ci sono mercati che vivono di residenti, mercati che vivono di turisti tedeschi, mercati che fanno il pieno solo da maggio a settembre e altri che lavorano anche d'inverno. Vendere o comprare un posteggio qui senza distinguere queste cose è il modo più rapido per pentirsene.</p>

<p>Faccio un giro veloce sui mercati che girano davvero, sponda per sponda, con quello che conta sapere prima di firmare.</p>

<h2>Desenzano: il martedì che lavora tutto l'anno</h2>

<p>Desenzano è una delle poche piazze del Garda che non si addormenta a ottobre. La stazione, l'A4, le aziende intorno, i quartieri popolati: il martedì in centro vedi clienti reali, non solo bermuda e infradito. Per un compratore è una buona notizia, perché il banco regge anche fuori stagione.</p>

<p>L'altro lato della medaglia: i prezzi richiesti per i posteggi qui sono fra i più alti del lago. Se vendi, hai un argomento serio. Se compri, fai conto che la trattativa parte da un piano alto.</p>

<h2>Bardolino e Lazise: il banco da turismo</h2>

<p>Mercoledì a Lazise, giovedì a Bardolino. Sono due piazze molto belle, molto piene, e questo è sia il punto di forza sia la trappola. Funzionano se vendi cose che il turista compra mentre passeggia: abbigliamento estivo, accessori, prodotti tipici, piccola pelletteria. Funzionano molto meno se hai un banco di articoli pesanti, da spesa abituale, da clientela fissa.</p>

<p>Quando guardi un annuncio di un posteggio qui, la prima domanda è secca: cosa vendono i banchi che hanno preso il posto migliore? Ti aiuta a capire se il tuo settore ci sta o no.</p>

<h2>Salò: il sabato che non sbaglia un colpo</h2>

<p>Salò è la sorpresa per chi guarda il Garda solo in cartolina. Il sabato porta clientela locale dalla Valtenesi e dalla sponda bresciana, ma anche turisti italiani e stranieri. È uno dei pochi mercati della zona dove convivono il turista d'impulso e il cliente fisso che torna ogni settimana.</p>

<p>Per un venditore vale la pena scriverlo a chiare lettere nell'annuncio: non è "posteggio in zona turistica", è mercato con continuità. Cambia la valutazione.</p>

<h2>Peschiera, Sirmione, Garda, Malcesine</h2>

<p>Qui si fa stagione. Punto. Peschiera ha il vantaggio di Verona vicina e dei campeggi giganti, Sirmione ha clientela che spende ma orari complicati, Malcesine e Garda sono cartoline pure ma ti spengono quando finisce settembre.</p>

<p>Comprare un banco in queste piazze ha senso se ti organizzi: estate forte sul lago, inverno su mercati invernali in pianura o un altro lavoro. Andare al Garda tutto l'anno aspettandosi numeri da agosto è un autogol.</p>

<h2>Cosa scrivere nell'annuncio (se vendi)</h2>

<p>Un posteggio sul Garda venduto bene non si vende solo col nome del paese. Metti giorno di mercato, posizione approssimativa, metratura, settore, attrezzatura inclusa, tipo di clientela e la verità sulla stagionalità. Chi compra serio cerca proprio queste informazioni: senza, scarta l'annuncio in dieci secondi.</p>

<p>Se stai cercando un posteggio sul Garda dai un'occhiata agli <a href="/annunci.html">annunci attivi su Subingresso.it</a>. Se invece il banco ce l'hai già e vuoi capire un prezzo realistico prima di metterlo in vendita, parti dal <a href="/valutatore.html">valutatore gratuito</a>: nei mercati turistici è dove si sbaglia di più.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'migliori-mercati-lago-di-garda-posteggi-ambulanti';

-- ───────────────────────────────────────────────────────────
--  2. costi-nascosti-posteggio-mercatale
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Quando guardi un posteggio in vendita ti fissi sul prezzo. Normale: è la cifra grossa, è quella della trattativa. Solo che il prezzo è una parte sola del conto. Sotto ci sono spese che chi è del mestiere conosce a memoria, ma chi entra adesso scopre solo dopo aver firmato. E lì cominciano i problemi.</p>

<p>Non sono costi nascosti per davvero. Sono in chiaro, scritti nei regolamenti comunali, prevedibili al centesimo. Il punto è che quasi nessuno fa le domande giuste prima di mettere mano al portafoglio.</p>

<h2>Tassa di concessione e suolo pubblico</h2>

<p>Il posteggio non è tuo come può esserlo un negozio. È una concessione comunale, e questa va pagata ogni anno. L'importo cambia parecchio: a Milano paghi un mondo, in un piccolo Comune del Sud paghi quattro spiccioli. Prima di firmare fatti dare dal venditore l'F24 dell'anno prima e chiama l'ufficio commercio del Comune per verifica.</p>

<p>Aggiungi TOSAP o COSAP, quelle sull'occupazione del suolo. Anche qui la cifra dipende dal Comune, dal banco e dalla zona. In certe città capoluogo si arriva tranquillamente a quattro-cinquecento euro l'anno solo per quella.</p>

<h2>L'attrezzatura "inclusa"</h2>

<p>"Attrezzatura inclusa" negli annunci è una frase che spesso traduce: vecchi pali piegati, un telone macchiato, due cassette di legno e un bancone di vent'anni fa. Chiedi le foto. Vai a vedere di persona. Se non ti serve o non è in stato decente, il prezzo va riconsiderato.</p>

<p>Il furgone è l'altro punto. Se non ce l'hai, mettilo in conto. Se ce l'hai ma è piccolo per il volume del banco che stai prendendo, lo cambierai entro l'anno. Non è un dettaglio: per un usato decente si parla di otto-quindicimila euro.</p>

<h2>I contributi INPS commercianti</h2>

<p>Questa è la voce che spaventa chi viene dal lavoro dipendente. Da ambulante con partita IVA i contributi alla gestione commercianti li paghi tu, fissi, anche nei mesi morti. Sono circa 4.500 euro l'anno di minimale, da spalmare in quattro rate. Se vai male a gennaio, scadono lo stesso.</p>

<p>Non c'è niente di losco. È che quando fai i conti in testa pensi al fatturato del banco e ti dimentichi delle uscite che corrono in automatico. Un commercialista bravo ti fa il quadro in mezz'ora.</p>

<h2>Commercialista: spendi e dormi</h2>

<p>In fase di acquisto un commercialista serve davvero. Verifica che il venditore non abbia debiti col Fisco o con l'INPS che possono trascinarsi sull'azienda, imposta la tua partita IVA con il regime giusto, segue gli adempimenti. Costo: 600-1.200 euro l'anno per un'attività piccola. Risparmio in errori evitati: ne vale dieci volte tanto.</p>

<h2>Le assenze ti costano la concessione</h2>

<p>Detto in chiaro: se manchi al mercato troppe volte senza giustificazione, perdi il posteggio. La soglia varia da Comune a Comune, di solito tra il 30 e il 50% delle giornate l'anno. Vacanze, malattie, imprevisti vanno comunicati.</p>

<p>Se vieni dal dipendente questo cambio di mentalità è il più duro. Non fa scappare nessuno, ma è bene saperlo prima di firmare.</p>

<h2>Il budget vero</h2>

<p>Fai una lista. Tassa concessione, TOSAP, INPS, commercialista, assicurazione, ammortamento furgone, carburante, manutenzione. Sommala. Confrontala con un fatturato realistico, non quello che ti racconta il venditore. Se i conti reggono anche in uno scenario un po' peggiore del previsto, è un buon affare.</p>

<p>Per partire dalla cifra giusta, dai un'occhiata al <a href="/valutatore.html">valutatore di Subingresso.it</a>: tiene conto di settore, zona e giorni di mercato. Non è oro colato, ma evita di pagare il 30% in più solo perché "ti piaceva il posto".</p>$CONTENT$, updated_at = NOW() WHERE slug = 'costi-nascosti-posteggio-mercatale';

-- ───────────────────────────────────────────────────────────
--  3. vendere-la-tua-licenza-ambulante (slug lungo)
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Vendere la licenza ambulante non è come vendere un'auto usata. Sei tu, da una parte, con anni di mercati alle spalle e una concessione che sulla carta vale poco ma nei fatti vale parecchio. Dall'altra hai gente che spera di pagarti il meno possibile, magari approfittando della tua fretta o della tua stanchezza.</p>

<p>Il prezzo giusto esiste. Si trova guardando i numeri che hai in tasca, non quelli che ti racconta chi ti vuole comprare il banco a metà.</p>

<h2>Prima cosa: capisci cosa stai vendendo</h2>

<p>Una licenza tipo A (con posteggio fisso) e una tipo B (itinerante) non valgono uguale. La A è legata a un mercato, a un giorno, a una zona. Cambia molto se sei al sabato di Salò o al rionale di una frazione. La B vale meno, perché non porta clientela ma solo l'autorizzazione a girare.</p>

<p>Aggiungi il giro d'affari, l'attrezzatura, l'eventuale magazzino in affitto, la fedeltà dei clienti. Tutto questo entra nel prezzo finale, non solo il pezzo di carta.</p>

<h2>Tre numeri da avere in mano</h2>

<p>Prima di mettere il banco in vendita raccogli tre cose.</p>

<p><strong>Fatturato medio degli ultimi tre anni.</strong> Non delle estati buone, la media reale. È il numero su cui un compratore serio fa i suoi conti.</p>

<p><strong>Giorni di mercato fatti.</strong> Quanti banchi all'anno tieni davvero? Tutto il calendario completo o lo molli a giugno?</p>

<p><strong>Posizione e metratura.</strong> Sei in testa al mercato, in mezzo, in coda? Sei due metri o sei dodici? Per chi sa leggere il mercato cambia tutto.</p>

<h2>Quanto vale, alla fine</h2>

<p>Per le licenze tipo A il riferimento più diffuso è una cifra fra il 40 e l'80% del fatturato annuo, attrezzatura compresa. La forchetta è larga apposta: dipende da zona, settore, attrezzatura, anni di concessione residui. Un banco di alimentari in un mercato storico va sul lato alto. Un banco generico in periferia va sul lato basso.</p>

<p>Il <a href="/valutatore.html">valutatore di Subingresso.it</a> tira fuori una cifra orientativa partendo dai dati che gli dai. Ti serve non per fissare il prezzo a caso, ma per non partire da una richiesta troppo bassa o troppo alta.</p>

<h2>Errori che ti fanno svendere</h2>

<p>Mettere il prezzo a istinto. Annunci scritti in tre righe ("vendo posteggio Treviglio prezzo trattabile"). Foto inesistenti o brutte. Rispondere male alle prime telefonate. Accettare la prima offerta perché "tanto è già qualcosa".</p>

<p>Il compratore serio cerca chiarezza. Annuncio dettagliato, foto del banco montato, dati su giorni e fatturato, disponibilità a far vedere il posteggio in azione almeno una volta. Dieci minuti in più di lavoro sull'annuncio ti fanno guadagnare migliaia di euro sul finale.</p>

<h2>La trattativa</h2>

<p>Il compratore arriverà sotto il tuo prezzo. Sempre. Lascia margine, ma non troppo: se chiedi 30 e accetti 18 ti sei fatto male da solo. Una richiesta tipica è il 10-15% sopra al prezzo a cui sei disposto a chiudere. Da lì si tratta.</p>

<p>Quando trovi il giusto, formalizzate con un atto notarile per la cessione d'azienda. Niente "vediamo come va", niente accordi a stretta di mano. Costa qualche centinaio di euro e ti tiene fuori dai guai per sempre.</p>

<p>Se vuoi mettere subito in vetrina il tuo posteggio, <a href="/vendi.html">pubblica un annuncio gratuito</a>. Se prima hai bisogno di un'idea sul prezzo, parti dal valutatore.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'vendere-la-tua-licenza-ambulante--la-guida-per-non-farti-fregare-sul-prezzo--723';

-- ───────────────────────────────────────────────────────────
--  4. posteggi-mercatali-piemonte-liguria
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Piemonte e Liguria condividono un confine, ma sui mercati non si somigliano per niente. Il Piemonte ha grandi piazze storiche e una clientela cittadina solida. La Liguria è una striscia stretta dove tutto si muove sull'asse mare-collina e la stagione decide quasi tutto.</p>

<p>Se stai pensando di comprare o vendere un posteggio in una delle due regioni, vale la pena guardarle separate.</p>

<h2>Piemonte: Porta Palazzo è un mondo a parte</h2>

<p>Il mercato di Porta Palazzo a Torino è il più grande d'Europa nella sua categoria. Tutti i giorni, qualsiasi tempo, qualsiasi stagione. Per chi ci lavora è una piazza durissima ma molto redditizia: il flusso non si ferma mai, ma il livello di concorrenza è altissimo. Un posteggio qui costa di più, ma ti garantisce clientela ogni singolo giorno dell'anno.</p>

<p>Fuori dal capoluogo i mercati di Cuneo, Asti, Alessandria, Novara hanno un peso loro. Sono settimanali grandi, con tradizione contadina e prodotti tipici. Vendere bene in Piemonte vuol dire avere un settore che si lega al territorio: alimentari, abbigliamento da lavoro, casalinghi solidi. La piazza piemontese non si esalta per le mode passeggere.</p>

<p>Per un acquirente, attenzione a una cosa: i mercati delle frazioni e dei piccoli Comuni stanno svuotandosi. La popolazione invecchia e cala. Verifica i numeri reali del banco, non quelli di dieci anni fa.</p>

<h2>Liguria: la stagione è la chiave</h2>

<p>In Liguria la geografia ti dà una mano e te la toglie. I mercati della Riviera (Sanremo, Imperia, Diano Marina, Alassio, Sestri Levante, Rapallo) lavorano forte da Pasqua a settembre, con turisti italiani e tantissimi stranieri. Vendi bene articoli da turista: prodotti tipici, abbigliamento estivo, accessori, calzature. D'inverno alcuni di questi mercati restano vivi, altri si spengono quasi del tutto.</p>

<p>Genova fa storia a sé. Sturla, Sarzano, la Foce, e poi i mercati rionali nei vari quartieri: lavoro tutto l'anno, clientela locale, dinamica simile alle grandi città italiane. Lì la stagionalità conta meno e il banco regge il calendario completo.</p>

<p>La Spezia e Sarzana hanno un giro discreto, con un'utenza più cittadina. Sono opzioni interessanti per chi cerca un posto in Liguria ma non vuole vivere di solo turismo.</p>

<h2>I prezzi: cosa aspettarsi</h2>

<p>In Piemonte un posteggio in un mercato grande di città capoluogo si muove tra 20 e 60 mila euro a seconda di settore e posizione. Nelle frazioni o nei piccoli Comuni si scende molto, anche a 5-10 mila per le tipo A, ma stai comprando un mercato che probabilmente sta perdendo clienti.</p>

<p>In Liguria sulla Riviera i numeri si gonfiano in alta stagione: posteggi da 40-80 mila euro sono normali nei turistici grandi. Ma chiedi sempre i fatturati invernali. Un banco che fa 100 ad agosto e 5 a febbraio non è lo stesso banco di uno che fa 60 ad agosto e 30 in inverno.</p>

<h2>Prima di comprare</h2>

<p>Vai a vedere il mercato due volte: una in alta stagione, una in bassa. Parla con i banchi vicini. Verifica che la concessione sia in regola, che non ci siano sospensioni, che il rinnovo non sia in scadenza imminente. Chiedi un atto notarile per la cessione: senza, non c'è subingresso.</p>

<p>Per orientarti sui prezzi reali nelle due regioni, sfoglia gli <a href="/annunci.html">annunci attivi su Subingresso.it</a>. Se invece vuoi una stima del posteggio che già hai, parti dal <a href="/valutatore.html">valutatore</a>. Cifre vere, non promesse.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'posteggi-mercatali-piemonte-liguria';

-- ───────────────────────────────────────────────────────────
--  5. affittare-o-vendere-posteggio-mercatale-quando-conviene
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Quando smetti, smetti. Ma "smettere" può voler dire due cose molto diverse: vendere il posteggio in modo definitivo o affittarlo a qualcun altro. Sembra una scelta di stile, in realtà cambia tutto: i soldi che entrano subito, i rischi che ti porti dietro, le tasse, la libertà di tornare indietro.</p>

<p>Non c'è una risposta universale. Però ci sono casi in cui una opzione è chiaramente meglio dell'altra. Vediamoli.</p>

<h2>Vendere: chiudi e vai via</h2>

<p>Vendere significa cessione d'azienda, atto notarile, soldi che incassi tutti in una volta (o in più tranche concordate, ma definite). Da quel momento il posteggio non è più tuo. Se l'attività cambia, se il Comune sposta il mercato, se il nuovo titolare combina disastri, sono fatti suoi.</p>

<p>È la scelta giusta se hai bisogno di liquidità subito, se non hai nessuno in famiglia che possa tenerlo in piedi, se hai un'altra attività da finanziare o se semplicemente non vuoi più sentir parlare di mercati.</p>

<p>Lo svantaggio è che non torni indietro. Una volta firmato dal notaio, quel posteggio per te vale come un albero qualsiasi. Se i mercati tornassero a tirare in modo straordinario, te lo guardi da fuori.</p>

<h2>Affittare: tieni il controllo</h2>

<p>L'affitto d'azienda (o di ramo d'azienda) ti permette di mantenere la titolarità della concessione e dare in gestione il banco a un terzo, che ti paga un canone. La concessione resta intestata a te. L'affittuario lavora, paga le tasse della sua attività, e ti gira la quota mensile o annuale concordata.</p>

<p>È la scelta giusta se non hai bisogno urgente di liquidità, se vuoi mantenere il banco "in famiglia" pensando a un futuro passaggio a figli o nipoti, o se vuoi solo una pausa di un anno o due prima di decidere.</p>

<p>I rischi sono concreti: se l'affittuario non paga, se gestisce male e accumula assenze (che ti fanno perdere la concessione), se non rispetta gli orari o le regole del Comune, sei tu il responsabile davanti all'amministrazione.</p>

<h2>Quanto si guadagna in un caso e nell'altro</h2>

<p>Vendendo, una licenza tipo A in un mercato medio porta una cifra una tantum compresa, di norma, tra il 40% e l'80% del fatturato annuo. Cifre concrete: per un banco che fattura 60 mila euro l'anno parli di una vendita tra 25 e 45 mila euro netti, attrezzatura inclusa.</p>

<p>Affittando, il canone tipico è il 25-40% del fatturato medio, da pagare ogni anno. Stesso banco da 60 mila: aspettati 15-22 mila euro di canone annuo. In tre anni hai recuperato quanto avresti incassato vendendo, e il banco è ancora tuo.</p>

<p>Sembra che affittare convenga sempre. Non è così: serve un affittuario serio. E quel rischio, statisticamente, è il problema numero uno.</p>

<h2>Le regole comunali</h2>

<p>Non tutti i Comuni accettano l'affitto d'azienda con la stessa facilità. Alcuni regolamenti la limitano nel tempo (massimo un anno, rinnovabile). Altri chiedono comunicazioni preventive. Verifica al SUAP del tuo Comune cosa puoi fare prima di mettere il banco in affitto. Una clausola sbagliata nel contratto e il Comune può negare il subingresso al tuo affittuario.</p>

<h2>Come decidere</h2>

<p>Se ti servono soldi adesso, vendi. Se non hai eredi e non vuoi più pensieri, vendi. Se vuoi lasciare la porta aperta, hai persone di fiducia da mettere lì o vuoi solo prendere fiato un anno o due, affitta. In entrambi i casi: contratto scritto, professionista che lo segue, niente accordi verbali.</p>

<p>Per pubblicare un annuncio (vendita o affitto), <a href="/vendi.html">parti da qui</a>. Per stimare il valore prima di decidere, dai un'occhiata al <a href="/valutatore.html">valutatore gratuito</a>.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'affittare-o-vendere-posteggio-mercatale-quando-conviene';

-- ───────────────────────────────────────────────────────────
--  6. come-negoziare-prezzo-posteggio-mercatale
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Il prezzo che vedi nell'annuncio non è il prezzo finale. Ma se parti con un'offerta troppo bassa fai scappare il venditore, e se accetti la richiesta iniziale paghi più del dovuto. La trattativa va impostata sapendo dove stai, non sparando numeri a caso.</p>

<h2>Prima dell'offerta: cosa devi sapere</h2>

<p>Una buona trattativa nasce prima di parlare di soldi. Le informazioni che ti servono sono quattro.</p>

<p><strong>Fatturato annuo medio</strong> degli ultimi due-tre anni. Se il venditore ti dà solo l'estate buona, è un segnale.</p>

<p><strong>Giorni di mercato fatti</strong> nell'anno. Tutto il calendario o la metà?</p>

<p><strong>Anni di concessione residui.</strong> Se sono pochi e il rinnovo è in dubbio, lo sconto è dovuto.</p>

<p><strong>Stato dell'attrezzatura.</strong> Verifica di persona, non sulle foto.</p>

<p>Con questi quattro numeri hai una base reale. Senza, stai trattando al buio.</p>

<h2>Il prezzo "giusto" non esiste, esiste un range</h2>

<p>Per le licenze tipo A il riferimento corrente è il 40-80% del fatturato annuo, attrezzatura compresa. Per le itineranti tipo B siamo molto più in basso, di solito sotto il 30% del fatturato. Dentro queste forchette pesano: zona, settore, posizione del banco nel mercato, anni di concessione, stato attrezzatura.</p>

<p>Il <a href="/valutatore.html">valutatore di Subingresso.it</a> ti dà un range orientativo partendo dai dati. Usalo come bussola, non come verdetto: il prezzo finale lo fa la trattativa, non un algoritmo.</p>

<h2>L'offerta di partenza</h2>

<p>Se la richiesta del venditore è sopra il tuo range realistico, non offrire subito metà: lo offendi e ti chiude la porta. Parti circa 12-18% sotto al prezzo a cui saresti disposto a chiudere. Se il valutatore dice 30 mila e tu sei disposto ad arrivare a 28 mila, offri 23-24 mila motivando con i dati che hai raccolto.</p>

<p>Motivare è la parola chiave. "Mi sembra alto" non porta da nessuna parte. "L'attrezzatura è da rifare almeno per 4 mila, la concessione scade tra due anni e in zona ho visto un banco simile venduto a 26 il mese scorso" è una proposta seria che il venditore deve almeno valutare.</p>

<h2>Le leve che funzionano</h2>

<p>Pagamento in un'unica soluzione vale uno sconto. Tempi rapidi sul notaio valgono uno sconto. Disponibilità a fare il subingresso senza far attendere il venditore vale uno sconto. Niente di tutto questo è scontato per chi vende: trovare un compratore serio, liquido e veloce è raro. Se sei tutte e tre le cose, fattelo riconoscere.</p>

<h2>Quando non scendere oltre</h2>

<p>Il venditore non sempre può abbassare quanto vorresti. Se ha investito nell'attrezzatura, se ha appena rinnovato la concessione per dieci anni, se ha numeri solidi e non è di fretta, sotto un certo livello non va. Riconoscerlo ti evita di perdere giorni a discutere senza risultato.</p>

<p>Se la trattativa si blocca a 2-3 mila euro di distanza, dividere a metà è quasi sempre la soluzione che chiude. Costa poco, sblocca tutto, e in genere riconosce il giusto a entrambi.</p>

<h2>Quando alzarti dal tavolo</h2>

<p>Se i numeri non tornano, alzati. Se il venditore evita le domande sul fatturato, alzati. Se ti chiede contanti fuori atto, alzati e non rispondere più. Un buon affare non vale i guai legali e fiscali che ti porti dietro per anni.</p>

<p>Per vedere i prezzi reali dei posteggi in trattativa adesso, sfoglia gli <a href="/annunci.html">annunci di Subingresso.it</a>. Confrontare cinque-sei offerte simili ti dà una calibratura che nessun consulente può darti meglio.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'come-negoziare-prezzo-posteggio-mercatale';

-- ───────────────────────────────────────────────────────────
--  7. come-valutare-posteggio-mercatale-prima-di-comprarlo
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Comprare un posteggio mercatale è una di quelle decisioni che si pagano per anni, in bene o in male. Non è come acquistare un'auto: non hai la perizia, non hai il chilometraggio, non hai il garante. Quello che hai sono parole, qualche numero che ti dà il venditore e la sensazione che ti fai andando al mercato.</p>

<p>Però una valutazione seria si può fare. Servono cinque cose, e bisogna prendersele con metodo.</p>

<h2>1. I numeri reali</h2>

<p>Fatturato medio degli ultimi tre anni, non l'estate boom. Giorni di mercato effettivamente fatti. Spese fisse annue (concessione, TOSAP, INPS, assicurazione, carburante). Margine netto stimato. Senza questi quattro dati non stai valutando, stai indovinando.</p>

<p>Il venditore deve fartali vedere su carta: ricevute, registri IVA, F24. Se ti dice "fidati, faccio quaranta a settimana" e basta, il discorso finisce lì. Non perché stia mentendo per forza, ma perché senza prove non puoi fare una valutazione.</p>

<h2>2. La concessione</h2>

<p>Chiedi e leggi il provvedimento di concessione del Comune. Verifica: anni residui, eventuali sospensioni o richiami in corso, regolarità del pagamento del canone, presenza di vincoli particolari (settori obbligatori, orari fissi, divieti). Una concessione con tre anni residui e in dubbio rinnovo vale molto meno di una appena rinnovata per dieci.</p>

<h2>3. La posizione</h2>

<p>Vai al mercato in giorno di mercato. Vai due volte. Conta i passaggi davanti al banco in mezz'ora, in due fasce orarie diverse. Guarda dove si fermano i clienti. Un banco a metà fila, dietro una colonna o in fondo al mercato vale molto meno di uno in testa o vicino alla zona dove la gente si concentra. Non è una sfumatura, è il 30-40% del valore.</p>

<h2>4. L'attrezzatura</h2>

<p>Telone, gazebo, pali, banconi, attrezzatura specifica del settore (banco frigo, espositori, casse). Non fidarti delle foto: chiedi di vederla montata. Quanto costa rifarla nuova? Se la risposta è 8-10 mila euro e il venditore te la include, vale come parte del prezzo. Se è da buttare, lo sconto è dovuto.</p>

<h2>5. Il giro di clientela</h2>

<p>Difficile da valutare sulla carta. Un'idea te la fai parlando con i banchi vicini ("come va qui?", "vendi bene?", "quanta gente passa?"). Le risposte non saranno mai precise, ma ti danno la temperatura del mercato. Se tutti i banchi vicini si lamentano di stagione fiacca da due anni, anche il banco che stai comprando va capito in quel contesto.</p>

<h2>La formula del prezzo</h2>

<p>Per orientarti: per le tipo A si parla del 40-80% del fatturato annuo, attrezzatura compresa. Per le itineranti tipo B siamo molto più bassi. Dentro la forchetta i parametri che muovono il prezzo sono zona, settore, posizione, anni di concessione, attrezzatura.</p>

<p>Il <a href="/valutatore.html">valutatore di Subingresso.it</a> ti dà una stima orientativa partendo dai dati: usalo come riferimento prima di trattare, non come prezzo finale. Una valutazione tutta tua, fatta sui numeri veri del banco specifico, vale di più.</p>

<h2>Quando rinunciare</h2>

<p>Numeri non documentati, concessione opaca, venditore che ha fretta strana, richieste di pagamenti in nero, attrezzatura "che sistemiamo dopo": questi sono allarmi. Non sono prove di malafede in automatico, ma sono motivi sufficienti per rinunciare. Un buon posteggio si vende anche con tempi normali: se qualcuno spinge per chiudere in tre giorni, c'è un perché.</p>

<p>Per confrontare prezzi reali e capire cosa offre oggi il mercato, dai un'occhiata agli <a href="/annunci.html">annunci attivi</a>.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'come-valutare-posteggio-mercatale-prima-di-comprarlo';

-- ───────────────────────────────────────────────────────────
--  8. eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Quando muore un ambulante con un posteggio attivo, gli eredi si trovano in una situazione che spesso non sanno gestire. Tra il funerale e i pensieri della famiglia c'è una concessione comunale, un'attività che corre, contributi che scadono, scadenze burocratiche con tempi precisi. Ignorare tutto questo per qualche mese significa quasi sempre perdere il posteggio.</p>

<p>Non serve diventare commercialisti. Servono però tre o quattro mosse fatte nel giusto ordine, e una di queste va fatta entro 30 giorni dal decesso.</p>

<h2>Comunicare il decesso al Comune</h2>

<p>Entro 30 giorni gli eredi devono comunicare il decesso del titolare all'ufficio commercio (o SUAP) del Comune che ha rilasciato la concessione. La comunicazione è una semplice lettera, accompagnata dall'atto di morte e da un'autocertificazione di chi ha ereditato.</p>

<p>Da quel momento la concessione resta in piedi in attesa della decisione degli eredi: continuare l'attività, vendere, affittare oppure rinunciare. Hai un tempo limite per scegliere, di solito un anno, ma alcuni Comuni accorciano a sei mesi.</p>

<h2>Le tre opzioni</h2>

<p>Continuare l'attività significa che uno degli eredi (o tutti in società) prende formalmente il posto del defunto come titolare. Serve aprire o intestare la partita IVA, iscriversi all'INPS commercianti, fare il subingresso al Comune. Funziona se chi prende il banco lo conosce già, ha tempo da dedicargli e ci si vuole investire.</p>

<p>Vendere significa fare il subingresso a un terzo: trovare un compratore, atto notarile di cessione d'azienda, comunicazione al Comune. Il prezzo si fa esattamente come per un'attività attiva, perché il valore della concessione non scende solo perché viene da successione.</p>

<p>Affittare il posteggio è la terza via: l'erede mantiene la titolarità ma dà in gestione il banco a un terzo che paga un canone. Funziona se non si vuole vendere subito ma si pensa a un futuro passaggio in famiglia (ai figli, a un nipote che ora è giovane).</p>

<h2>I costi che corrono nel frattempo</h2>

<p>Mentre la famiglia decide, alcune cose continuano a essere dovute: la tassa annuale di concessione, eventuali rate INPS pendenti, l'affitto del magazzino se c'è, la TOSAP. Sono spese che si pagano lo stesso, anche con il banco fermo. Una decisione presa entro tre-quattro mesi evita di accumulare arretrati.</p>

<h2>Le tasse di successione</h2>

<p>La licenza commerciale e la concessione di posteggio fanno parte dell'asse ereditario. La dichiarazione di successione (entro 12 mesi dal decesso) le include. Per i figli e il coniuge le aliquote sono basse e c'è una franchigia di un milione di euro a testa: nella stragrande maggioranza dei casi non si paga niente di reale, ma la dichiarazione va fatta lo stesso.</p>

<p>Affidati a un commercialista o a un notaio per la successione: la pratica costa, ma sbagliarla costa molto di più.</p>

<h2>Vendere subito o aspettare</h2>

<p>Se nessuno in famiglia è interessato a continuare, vendere conviene il prima possibile. Un posteggio fermo perde valore: la clientela si disperde, il flusso del banco vicino prende il tuo, l'attrezzatura si deteriora se non manutenuta. Sei mesi di banco chiuso possono valere il 15-20% di prezzo in meno.</p>

<p>Una volta fatta la successione, gli eredi possono cedere la concessione esattamente come avrebbe potuto fare il defunto.</p>

<p>Per pubblicare un annuncio di vendita di un posteggio ereditato, <a href="/vendi.html">parti da qui</a>. Per capire quanto vale prima di decidere, usa il <a href="/valutatore.html">valutatore</a>.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi';

-- ───────────────────────────────────────────────────────────
--  9. mercati-turistici-o-mercati-rionali-dove-conviene-banco
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Tra ambulanti gira una distinzione che si fa in fretta: i mercati turistici sono quelli pieni e redditizi, i rionali sono quelli stabili ma noiosi. È una semplificazione che nasconde troppe cose. Un banco a Bardolino può essere una fortuna o una bolla, dipende. Un mercato di quartiere a Brescia o Modena può sembrare grigio e darti il pane tutto l'anno per vent'anni.</p>

<p>La domanda giusta non è "quale dei due fa più soldi", ma quale si lega meglio alla vita che vuoi fare e ai prodotti che hai sul banco.</p>

<h2>Il mercato turistico: numeri grossi, mesi vuoti</h2>

<p>Il vantaggio di un posteggio in zona turistica è il flusso. In alta stagione vedi quattro-cinque volte le persone di un mercato di provincia, e una buona parte è disposta a comprare d'impulso. Souvenir, abbigliamento estivo, prodotti tipici, pelletteria leggera, accessori: tutto quello che si infila in valigia e va via in fretta.</p>

<p>Lo svantaggio è altrettanto chiaro. Da ottobre a Pasqua tanti di questi mercati si svuotano. Se la tua attività dipende solo da quel banco, sei fermo cinque-sei mesi all'anno. Devi avere un secondo lavoro invernale, un secondo mercato in zona non turistica, o le spalle abbastanza coperte per attraversare la bassa stagione senza dolore.</p>

<p>I prezzi di un posteggio nei mercati turistici riflettono questa cosa. Sembrano alti, ma chiedi gli incassi medi sull'intero anno, non solo agosto. Se i conti sull'anno non tornano, è un costo travestito da occasione.</p>

<h2>Il mercato rionale: la noia che paga</h2>

<p>Un mercato di quartiere in una città di 50-200 mila abitanti non emoziona nessuno guardandolo. Non c'è il colpo d'occhio, non c'è la gente in vacanza, non c'è la foto da Instagram. Però c'è una cosa che il turistico non ti dà: clientela ripetitiva. Le stesse persone tornano ogni settimana, ti conoscono, comprano per famiglia non per impulso.</p>

<p>Su questi mercati funzionano alimentari, ortofrutta, casalinghi, abbigliamento solido, calzature, biancheria, intimo. Settori "da spesa", non da souvenir. I numeri settimanali sono più piccoli, ma costanti dodici mesi su dodici. Per chi ha bisogno di stabilità (mutuo, famiglia, contributi da pagare) è di solito la scelta più sana.</p>

<h2>L'opzione che pochi considerano</h2>

<p>Il mix. Un banco in mercato turistico più un banco in un rionale fanno un'attività più solida di entrambi presi separatamente. È la formula classica di chi lavora da decenni in regioni come Veneto, Lombardia, Emilia-Romagna: tre o quattro mercati a settimana, di cui uno o due in zone con afflusso forte e gli altri stabili. È più impegnativo come logistica, ma livella i mesi.</p>

<h2>Come scegliere</h2>

<p>Prima domanda: cosa vendi? Se hai un settore turistico per vocazione (artigianato, prodotti tipici, abbigliamento estivo) ha senso puntare su mercati di flusso. Se vendi tutto l'anno articoli di consumo, il rionale è più sicuro.</p>

<p>Seconda: hai bisogno di entrate costanti o ti regge un picco e poi un crollo? Mutuo, contributi fissi, figli a scuola: serve costanza. Pochi obblighi e flessibilità: puoi giocare sul turistico.</p>

<p>Terza: hai energia e mezzi per fare due-tre mercati a settimana? Se sì, il mix è la risposta migliore.</p>

<p>Per orientarti tra le opzioni reali oggi disponibili, sfoglia gli <a href="/annunci.html">annunci di Subingresso.it</a>: il prezzo dei posteggi nei due tipi di mercato ti dice molto del valore reale, più di qualsiasi opinione.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'mercati-turistici-o-mercati-rionali-dove-conviene-banco';

-- ───────────────────────────────────────────────────────────
--  10. comprare-posteggio-lago-di-garda-turismo-stagionalita
-- ───────────────────────────────────────────────────────────
UPDATE blog_posts SET content = $CONTENT$<p>Il Lago di Garda è un sogno per chi vede solo i numeri di luglio e agosto. Sirmione, Bardolino, Lazise, Desenzano, Salò, Peschiera: nei mesi forti i banchi lavorano davvero bene. Il problema arriva in novembre, quando il termometro cala e i mercati si spengono. Comprare un posteggio in zona turistica senza un piano per i mesi morti è il modo più rapido per non arrivare alla primavera successiva.</p>

<p>Ecco cosa guardare prima di firmare e come organizzarsi dopo.</p>

<h2>La stagione vera dura quanto pensi?</h2>

<p>La stagione "alta" sul Garda non è solo agosto. Pasqua è già un picco se le date sono buone. Maggio e settembre hanno turismo straniero (tedeschi, austriaci, olandesi) che spende bene. Giugno è in crescita, luglio è solido, agosto è il massimo, prima metà di settembre regge.</p>

<p>Quindi parli di cinque mesi pieni e due laterali (aprile e fine settembre/inizio ottobre). Quattro mesi sono morti veri, nei mercati turistici puri.</p>

<p>Al contrario, mercati come Salò sabato o Desenzano martedì hanno una clientela locale che compra anche d'inverno: gli incassi calano ma non si azzerano. Sono i posteggi che reggono meglio la pressione di un anno difficile.</p>

<h2>Come si compra senza farsi male</h2>

<p>Il venditore ti darà i numeri estivi. Tu chiedi quelli invernali. Non insistere su un solo anno, chiedi tre. Se i numeri di gennaio, febbraio e novembre non sono nemmeno citati, c'è una ragione, e raramente è una buona ragione.</p>

<p>Una verifica veloce: vai al mercato in un giorno feriale di novembre o febbraio. Conta i banchi aperti rispetto a quelli del mercato in pieno. Conta i passaggi davanti al banco che ti interessa in mezz'ora. Se in inverno è la metà o meno, hai capito di che mercato si tratta.</p>

<h2>Il piano per i mesi morti</h2>

<p>Comprare un posteggio sul Garda e contare di mangiarci sopra dodici mesi su dodici è realistico solo nei pochi mercati con clientela mista. Per gli altri ti servono opzioni.</p>

<p><strong>Un secondo mercato in zona non turistica.</strong> Brescia, Verona, Mantova, Trento sono raggiungibili. Avere un settimanale in città in inverno bilancia tutto.</p>

<p><strong>Lavoro stagionale invernale.</strong> Magazzino, montaggio fiere, rifornimenti, qualsiasi cosa che porti reddito da novembre a marzo. Non è elegante ma è quello che fanno tanti.</p>

<p><strong>Vendita online o eventi.</strong> Per certi settori (artigianato, prodotti tipici, abbigliamento di nicchia) tenere un canale online o fare i mercatini di Natale aiuta a riempire i mesi morti.</p>

<h2>I prezzi reali</h2>

<p>Un posteggio in un mercato turistico forte del Garda (Bardolino, Lazise, Sirmione, Desenzano lungolago) si muove tra 35 e 80 mila euro a seconda di posizione, settore e attrezzatura. Sono numeri che si giustificano solo se sai cosa fare nei sette mesi non di alta stagione.</p>

<p>Per Salò sabato e Desenzano martedì i prezzi possono essere simili o leggermente più alti, ma tu paghi qualcosa di più stabile: un mercato che lavora dodici mesi.</p>

<h2>Quando non comprare</h2>

<p>Se non hai un piano per l'inverno, non comprare un mercato puro turistico. Se i numeri che ti danno sono solo dei mesi forti, non comprare. Se il banco nel mercato è in posizione marginale rispetto al flusso pedonale, non comprare a quel prezzo: il Garda non ti salva da una posizione brutta.</p>

<p>Per vedere quali posteggi sul Lago di Garda sono in vendita adesso e a che cifra, sfoglia gli <a href="/annunci.html">annunci di Subingresso.it</a>. Per stimare il valore di un posteggio specifico, usa il <a href="/valutatore.html">valutatore gratuito</a>.</p>$CONTENT$, updated_at = NOW() WHERE slug = 'comprare-posteggio-lago-di-garda-turismo-stagionalita';

-- ============================================================
--  Verifica esecuzione
-- ============================================================
SELECT slug, length(content) AS new_len, updated_at
FROM blog_posts
WHERE slug IN (
    'migliori-mercati-lago-di-garda-posteggi-ambulanti',
    'costi-nascosti-posteggio-mercatale',
    'vendere-la-tua-licenza-ambulante--la-guida-per-non-farti-fregare-sul-prezzo--723',
    'posteggi-mercatali-piemonte-liguria',
    'affittare-o-vendere-posteggio-mercatale-quando-conviene',
    'come-negoziare-prezzo-posteggio-mercatale',
    'come-valutare-posteggio-mercatale-prima-di-comprarlo',
    'eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi',
    'mercati-turistici-o-mercati-rionali-dove-conviene-banco',
    'comprare-posteggio-lago-di-garda-turismo-stagionalita'
)
ORDER BY updated_at DESC;
