# «Lavoro qui da trent’anni»: quanto conta davvero l’anzianità nei nuovi bandi?

Richiesta del 24 ottobre 2026: articolo semplice, professionale e schierato
con gli ambulanti, con ironia lieve sulla burocrazia. Testo HTML omonimo:
587 parole, sei sezioni brevi, risposta iniziale e calcolo concreto.
Due richiami: calendario fiere a metà e inserimento annuncio in chiusura.

I due aside marcati `data-fiere-promo` costituiscono i richiami editoriali.
Il renderer li riconosce e sopprime per questa pagina riquadri automatici e
banner del calcolatore, prima e dopo JavaScript. Gli articoli già pubblicati
non contenevano questi marcatori alla verifica iniziale: restano invariati.
Nessuna modifica ai criteri, ai pagamenti o alla durata delle Vetrine.

Seguito del 24 ottobre: i richiami iniziali erano semplici blockquote con link,
troppo simili ai paragrafi per essere riconosciuti come pubblicità. Sostituiti
con due banner blu e pulsanti oro usando il componente esistente
`blog-fiere-promo`: «Trova la prossima fiera» a metà, «Pubblica il tuo annuncio»
in chiusura. Nessuna modifica a font, CSS, testo informativo, data o metadati.
Il contenuto fuori dai due richiami resta identico. Prove e confronto in
`Documents/articoli-subingresso/anzianita-ambulanti-nuovi-bandi/pubblicita-visibili`.

## Fonti verificate

- [MIMIT, comunicato del 10 giugno 2026](https://www.mimit.gov.it/it/notizie-stampa/commercio-adottate-le-linee-guida-ambulanti): griglia dei punteggi e contesto del decreto. L'annuncio precede la pubblicazione in Gazzetta, verificata separatamente.
- [Decreto 5 giugno 2026, Allegato A](https://www.gazzettaufficiale.it/atto/serie_generale/caricaArticolo?art.codiceRedazionale=26A03428&art.dataPubblicazioneGazzetta=2026-07-14&art.flagTipoArticolo=1&art.idArticolo=1&art.idGruppo=0&art.idSottoArticolo=1&art.idSottoArticolo1=10&art.progressivo=0&art.versione=1): punti 7a/7b, 9.1a e 11. Anzianità dell'azienda distinta da permanenza sul posteggio; titolarità alla domanda per i 15 punti fissi; ultimo cessionario per l'anzianità aziendale; spunta distinta e anzianità d'impresa a parità di punteggio.
- [Allegato 1, GU n.161 del 14 luglio 2026](https://www.gazzettaufficiale.it/do/atto/serie_generale/caricaPdf?art.codiceRedazionale=26A03428&art.dataPubblicazioneGazzetta=2026-07-14&art.num=1&art.tiposerie=SG&cdimg=26A0342800200010110001&dgu=2026-07-14): calcolo proporzionale e riduzione del 30% per settore analogo. Esempio originale 30/40×35=26,25, con identico settore.
- [Quadro normativo Regione Lombardia](https://www.regione.lombardia.it/attivita-produttive-imprese/commercio/commercio-ambulante-mercati-e-sagre/quadro-normativo-su-commercio-ambulante), aggiornamento 9 ottobre 2026: richiamo corrente al decreto del 2026.

Commenti sul rispetto del lavoro e sulla burocrazia sono giudizi editoriali.
Nessuna promessa di assegnazione, rinnovo, guadagno o durata universale dei
titoli esistenti. Verificare gli atti applicabili al singolo posteggio.

## Copertina e verifiche

Immagine originale con strumento integrato imagegen; persona e scena inventate,
dichiarazione IA nel testo. File pubblico `images/blog/anzianita-ambulanti-nuovi-bandi.webp`,
1600×900, 196.316 byte. Originale PNG e prompt integrale conservati in
`C:/Users/utente/Documents/articoli-subingresso/anzianita-ambulanti-nuovi-bandi/`.
Prompt: fotografia editoriale realistica di un ambulante esperto al banco
di abbigliamento, mercato italiano al mattino, cartellina di documenti,
espressione ferma e dignitosa; nessun testo o simbolo politico.

Prove e ricevute nella stessa cartella privata. Browser Chromium1440/320,
WebKit390 e lettura senza JS; copertina, titolo, meta, canonical, due soli
richiami, fonti, link e assenza di overflow. Suite esistente del blog usata
per verificare conservazione degli altri articoli, hydration e pagine di errore.

## Google Search Console

Pubblicato con commit `fc08dcc`, Vercel `51C72LTGaxda1s2WhYXpmFBTPkXw`
success e asset pubblici identici ai blob Git. Inserita solo la riga
`ec5d37f1-cdf8-45d5-9269-6e3282ab913b`; 91 articoli precedenti conservati
identici, 92 totali. Browser online nei quattro casi e indice/sitemap passati.

Nessuna richiesta di indicizzazione inviata. Apertura del browser verso Search
Console respinta dal controllo automatico con messaggio `blocked by policy`;
nessuna motivazione ulteriore fornita. Nessuna credenziale Google/GSC
disponibile negli environment pertinenti. Ricerca plugin: integrazione
Windsor.ai non collegata, Search Console in sola lettura; non risolve l'invio.

Resta richiesta manuale tramite Controllo URL dell'indirizzo pubblico e
«Richiedi indicizzazione». La presenza nella sitemap non prova l'invio
né l'indicizzazione. [Istruzioni ufficiali Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=it).
