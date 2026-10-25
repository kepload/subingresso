# Spunta nei mercati di Milano: dossier editoriale

Verifica: 25 ottobre 2026. Richiesta: articolo pratico, linguaggio semplice,
posizione favorevole agli ambulanti, ironia lieve sulla burocrazia, immagine
originale e massimo due richiami al sito.

## Fonti e limiti

- Comune di Milano, Fare Impresa, «Mercati settimanali scoperti», report
  «MSS - ubicazioni,orari,organici 21 Ottobre 2026»: dieci pagine,
  93 occorrenze mercato/giorno (14 lunedì, 14 martedì, 14 mercoledì,
  15 giovedì, 14 venerdì, 20 sabato, 2 domenica).
  https://fareimpresa.comune.milano.it/it/mercati-settimanali-scoperti
- DD 11933 del 17/12/2024: iscrizione telematica, 7 gennaio–fine febbraio,
  eccezione nuove imprese avviate dopo la finestra nello stesso anno,
  mantenimento iscrizione salvo cancellazione; necessari pratica MDA ed esito
  positivo SUAP. Non riproposta la vecchia ammissione automatica al sesto giorno.
- DD 8515 del 01/10/2025: modalità ordinarie alle 8:30 presso i primi posteggi,
  accesso e posizionamento entro 30 minuti dall’assegnazione; particolarità
  ruolino. Nessuna priorità promessa a chi arriva prima.
- DD 10132 del 11/11/2025, DD 2393 del 27/03/2026 e DD 4568 del 04/06/2026:
  passaggio al CUP telematico, ultimo avvio il 27/09/2026; assegnazione e
  pagamento entro le 10 distinti dall’apertura delle vendite. Mancato pagamento:
  decadenza assegnazione e presenza non attribuita. Nei mercati non presidiati
  obbligo di pagamento, senza attribuzione delle presenze.
- Pagine Iniziali/Variazioni e Subingressi del Comune: autorizzazione,
  carta di esercizio/attestazione, originali e adempimenti collegati all’attività.
  https://fareimpresa.comune.milano.it/it/commercio-aree-pubbliche/mss-iniziali-variazioni
  https://fareimpresa.comune.milano.it/it/commercio-aree-pubbliche/mss-subingressi

I collegamenti puntuali ai PDF sono nel corpo HTML e nel dossier locale.
Download diretto inizialmente HTTP403; accesso Chromium e download dal browser
HTTP200. Originali PDF, testo, tabelle e pagine renderizzate conservati in
`Documents/articoli-subingresso/spunta-mercati-milano-orari-documenti/`.
Prospetto estratto per celle con PyMuPDF; 93 righe controllate. Rettificate
prima della pubblicazione alcune espansioni di toponimi e il collegamento
relativo al report, trasformato in assoluto. Nomi delle sedi abbreviati senza
attribuire un civico di ritrovo: il prospetto indica l’area, non l’appuntamento
certificato. Nessuna garanzia sulla presenza degli ispettori in tutti i mercati.

Eccezioni conservate: Ciccotti (cantiere su via Ciccotti, altri tratti elencati),
orari distinti sabato Papiniano per Sant’Agostino/Bragadino–Calco e
Cantore–Bragadino, ora legale/solare su Ciccotti/Fauché/Garigliano/Tabacchi;
Ripa fino alle 18, Osoppo fino alle 17, Pagano MM1 domenicale fino alle 16.
Gli orari sono di vendita; sgombero e segmenti completi rinviati al report.

## Presentazione e pubblicazione

Sei sezioni brevi, sette elenchi apribili nativi con tabella accessibile,
funzionanti anche senza JavaScript. Due sole pubblicità editoriali:
fiere `/fiere` al centro e acquisto/affitto `/annunci` in chiusura.
Riutilizzato il sistema esistente, senza nuovi riquadri automatici.

Copertina originale generata con imagegen integrato, WebP 1600×900:
`images/blog/spunta-mercati-milano-orari-documenti.webp`.
Prompt e PNG originale nel dossier locale; didascalia esplicita sulla scena IA.

Il contenuto live risiede in `blog_posts`; HTML/JSON sono la copia editoriale.
Richiesta d’indicizzazione e inclusione nella sitemap sono operazioni distinte:
non dichiarare inviata Search Console se manca la ricevuta dell’invio.
