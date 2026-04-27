-- =================================================================
-- REWRITE BLOG POSTS READABLE BATCH 2 — Subingresso.it — 20260427
-- Obiettivo: articoli piu corti, piu umani, molto leggibili
-- =================================================================

-- Articolo 1: aprire-partita-iva-ambulante-2026
UPDATE public.blog_posts
SET
  title = 'Aprire Partita IVA da Ambulante: Guida Pratica 2026',
  excerpt = 'Vuoi iniziare a vendere al mercato? Aprire la Partita IVA è il primo passo. Vediamo insieme come fare, in modo semplice e senza mal di testa.',
  content = E'<h2>Vuoi diventare un venditore ambulante?</h2>
<p>Aprire la Partita IVA sembra una montagna da scalare, ma non lo è se si va per gradi. Non è solo un obbligo fiscale, è l''atto di nascita della tua impresa. Vediamo i passaggi chiave per partire con il piede giusto.</p>

<h2>1. Prima di tutto: cosa vuoi vendere?</h2>
<p>Sembra banale, ma è la scelta più importante. Vuoi vendere <strong>prodotti alimentari o non alimentari?</strong> Le regole cambiano parecchio.</p>
<ul>
    <li><strong>Alimentari:</strong> Servono requisiti in più, come l''HACCP per l''igiene e la Notifica Sanitaria. La burocrazia è un po'' più attenta.</li>
    <li><strong>Non alimentari</strong> (abbigliamento, casalinghi, etc.): Il percorso è generalmente più snello.</li>
</ul>
<p>Questa scelta determina il tuo Codice ATECO, cioè l''etichetta ufficiale della tua attività.</p>

<h2>2. I passaggi burocratici (in breve)</h2>
<p>Per fortuna oggi esiste la <strong>Comunicazione Unica (ComUnica)</strong>. È una pratica telematica, di solito gestita dal commercialista, che ti permette di fare quasi tutto in un colpo solo:</p>
<ul>
    <li>Aprire la Partita IVA all''<strong>Agenzia delle Entrate</strong>.</li>
    <li>Iscriverti al <strong>Registro Imprese</strong> della Camera di Commercio.</li>
    <li>Aprire la tua posizione <strong>INPS Commercianti</strong> (per i contributi).</li>
    <li>Fare la <strong>SCIA</strong> (Segnalazione Certificata di Inizio Attività) al SUAP del Comune.</li>
</ul>
<p><strong>Ricorda:</strong> la Partita IVA da sola non basta per mettere il banco al mercato. Devi avere l''autorizzazione per il commercio su aree pubbliche!</p>

<h2>3. Lavorare su un posteggio fisso o da itinerante?</h2>
<p>Se compri un''attività esistente, farai il <strong>subingresso</strong> nel posteggio. Se parti da zero, puoi iniziare come <strong>itinerante</strong> o fare la "spunta" nei mercati (cioè occupare i posti liberi del giorno). Ogni Comune ha le sue regole, informati sempre al SUAP locale.</p>
<p>Sei pronto a iniziare la tua avventura o vuoi cedere la tua attuale attività? <a href="/vendi.html">Pubblica il tuo annuncio di vendita su Subingresso.it</a>. Se invece cerchi un''occasione pronta, <a href="/annunci.html">esplora le attività già avviate in vendita</a>.</p>'
WHERE slug = 'aprire-partita-iva-ambulante-2026';

-- Articolo 2: codici-ateco-ambulanti-2025
UPDATE public.blog_posts
SET
  title = 'Codice ATECO per Ambulanti: Quale Scegliere (e Perché)',
  excerpt = 'Il Codice ATECO non è solo un numero. Scegliere quello giusto è fondamentale, soprattutto con il regime forfettario. Ecco una guida rapida.',
  content = E'<p>Quando apri la Partita IVA, devi scegliere un <strong>Codice ATECO</strong>. Pensa a questo codice come all''etichetta che descrive ufficialmente la tua attività. Sembra una cosa da commercialisti, ma scegliere quello giusto ha conseguenze molto pratiche.</p>

<h2>A cosa serve il Codice ATECO?</h2>
<p>Questo codice comunica allo Stato cosa fai. Da esso dipendono:</p>
<ul>
    <li>L''inquadramento della tua attività (commercio, artigianato, etc.).</li>
    <li>Le statistiche nazionali (ok, questo ti interessa poco).</li>
    <li><strong>Il coefficiente di redditività</strong> se sei in regime forfettario. E questo ti interessa molto!</li>
</ul>

<h2>I codici più usati dagli ambulanti</h2>
<p>I codici principali per chi lavora nei mercati appartengono alla categoria <strong>47.8</strong>. Ecco i più comuni:</p>
<ul>
    <li><code>47.82.01</code>: Commercio ambulante di abbigliamento, biancheria e calzature.</li>
    <li><code>47.81.01</code>: Commercio ambulante di prodotti alimentari e bevande.</li>
    <li><code>47.89.01</code>: Commercio ambulante di altri prodotti (casalinghi, fiori, cosmetici, etc.).</li>
</ul>
<p><strong>Attenzione:</strong> le classificazioni vengono aggiornate (come con ATECO 2025). Il tuo commercialista saprà indicarti il codice più preciso e aggiornato per la tua merce.</p>

<h2>Perché è così importante nel Regime Forfettario?</h2>
<p>Nel forfettario, il guadagno su cui paghi le tasse non è quello reale, ma una percentuale del tuo fatturato stabilita a forfait. Questa percentuale (il <strong>coefficiente di redditività</strong>) cambia in base al Codice ATECO.</p>
<p>Usare un codice sbagliato significa pagare tasse su una base di calcolo errata. <strong>Non è una furbizia, è un rischio.</strong></p>

<h2>Quando devi controllare il tuo codice?</h2>
<p>È un buon momento per verificare il tuo ATECO se:</p>
<ul>
    <li>Stai aprendo ora la Partita IVA.</li>
    <li>Stai acquistando un''attività in subingresso.</li>
    <li>Hai cambiato in modo significativo la merce che vendi.</li>
</ul>
<p>Chiedere al commercialista o alla tua associazione di categoria ti costa poco e può salvarti da problemi futuri. Se stai valutando un''attività in vendita, chiedi sempre quale codice ATECO utilizza: è un indizio importante sulla sua storia e sulla sua regolarità.</p>
<p>Pronto a trovare l''attività giusta per te? <a href="/annunci.html">Guarda gli annunci di posteggi in vendita</a>. Se invece è ora di cedere la tua, <a href="/vendi.html">pubblica un annuncio chiaro e completo</a>.</p>'
WHERE slug = 'codici-ateco-ambulanti-2025';

-- Articolo 3: spuntista-mercato-come-funziona
UPDATE public.blog_posts
SET
  title = 'Lo Spuntista al Mercato: Come Iniziare a Lavorare',
  excerpt = 'La "spunta" è un ottimo modo per entrare nel mondo dei mercati senza un posteggio fisso. Scopri come funziona, cosa serve e i trucchi del mestiere.',
  content = E'<p>Hai mai sentito parlare dello "spuntista"? È una figura fondamentale nei mercati, una vera e propria porta d''ingresso per chi vuole iniziare questo mestiere. Vediamo di cosa si tratta in modo semplice e pratico.</p>

<h2>Chi è e cosa fa lo spuntista?</h2>
<p>In breve, lo spuntista è un operatore ambulante che ha l''autorizzazione per vendere, ma <strong>non ha un posteggio fisso</strong>. Ogni mattina si presenta al mercato e, se un titolare di posteggio è assente, può prendere il suo posto per quella giornata.</p>
<p>Il posto viene assegnato in base a una <strong>graduatoria</strong> gestita dal Comune, che di solito si basa sul numero di presenze accumulate. Più ti presenti, più sali in graduatoria.</p>

<h2>Perché iniziare come spuntista è una buona idea?</h2>
<p>Fare la spunta è come andare a scuola di commercio ambulante. Ti permette di:</p>
<ul>
    <li><strong>Capire quali mercati "girano"</strong> e quali no per la tua merce.</li>
    <li><strong>Farti conoscere</strong> dai colleghi e dai clienti.</li>
    <li><strong>Guadagnare esperienza</strong> senza fare subito il grande investimento di comprare un posteggio.</li>
    <li><strong>Accumulare presenze</strong> che possono darti un punteggio più alto in futuri bandi comunali.</li>
</ul>

<h2>Cosa serve per fare la spunta?</h2>
<p>Non si improvvisa. Devi essere in regola come qualsiasi altro ambulante. Ti serviranno:</p>
<ul>
    <li>L''<strong>autorizzazione</strong> per il commercio su aree pubbliche.</li>
    <li>L''iscrizione in <strong>Camera di Commercio</strong> e la <strong>Partita IVA</strong>.</li>
    <li>Essere in regola con i <strong>contributi (DURC)</strong>.</li>
    <li>Tanta <strong>pazienza e flessibilità</strong>: a volte lavorerai, altre tornerai a casa a mani vuote.</li>
</ul>

<h2>Dalla spunta al posteggio fisso</h2>
<p>Molti ambulanti usano la spunta per studiare il terreno. Dopo qualche mese, capirai qual è il mercato giusto per te. A quel punto, sarai pronto per cercare un posteggio in vendita in quella zona, sapendo già cosa aspettarti.</p>
<p>È il modo più intelligente per investire i tuoi soldi: prima provi, poi compri.</p>
<p>Se senti che è arrivato il momento di avere un posto tutto tuo, <a href="/annunci.html">cerca tra gli annunci di attività in vendita</a>. Se invece hai già un''attività e vuoi cederla a qualcuno con la voglia di iniziare, <a href="/vendi.html">metti in vendita il tuo posteggio</a>.</p>'
WHERE slug = 'spuntista-mercato-come-funziona';
