# Fonti e limiti | articolo 66

Consultazione diretta: **28 novembre 2026**. Dossier privato: `.local/lavori/articoli/20261128-codex1-cinque-0800/articolo-66/` nella root comune. Le ricevute conservano data UTC, URL, stato HTTP, byte e SHA-256; sono salvati anche HTML e corpi leggibili. Nessuna comunicazione inviata ai produttori e nessuna consulenza ricevuta.

## Fetra, carrello 3100

URL: https://www.fetra-italia.it/carrelli_pieghevole/carrello_interamente_in_acciaio-3100

Passaggio pertinente: «Barra di spinta tubolare pieghevole, con traversa larga». La scheda tecnica indica portata totale 150 kg, superficie utile 740 × 480 mm e freni sulle ruote girevoli. La pagina di categoria è stata letta prima di raggiungere la scheda del modello.

Uso nel testo: sola maniglia pieghevole, come caratteristica documentata. Limite: la portata del 3100 non dimostra compatibilità con una rampa, pavimentazione esterna o qualsiasi carico. Nessuna raccomandazione d'acquisto e nessun prezzo assunto. L'apertura via strumento web della scheda ha dato errore; il recupero HTTP diretto ha restituito il corpo completo leggibile, archiviato e controllato, non una challenge.

## WM System, WM PC

URL: https://wmsystem.com/prodotto/wm-pc/

Passaggio pertinente: «Per diminuire l’angolo di inclinazione della rampa» la pagina presenta un kit di allungamento opzionale. La gamma dichiara portate da 600 a 1800 kg, dipendenti dalla versione; gli accessori hanno limiti propri. La FAQ richiede identificazione del veicolo, altezza della porta e tipo/peso della merce; l'installazione è indirizzata a carrozzeria/officina.

Uso nel testo: la pendenza dipende dall'installazione e dalla configurazione. **La pagina non fornisce una pendenza massima numerica unica per tutte le WM PC**: l'articolo non la inventa, non converte la lunghezza in autorizzazione d'uso e rimanda a verifica di compatibilità e istruzioni effettive. Nessuna costruzione di rampe, prova rischiosa o autonomia operativa dedotta dalle promesse commerciali.

## Sortimo, ripiano estraibile multifunzionale

URL: https://www.mysortimo.it/it/prodotti/allestimentofurgoni/ripiano-estraibile-multifunzionale

Passaggio pertinente: «La portata massima consentita è di 200 kg». La descrizione riguarda una slitta estraibile fino a due terzi, con sistema ProSafe e bloccaggio in posizione chiusa.

Uso nel testo: portata dichiarata del dispositivo, distinta dalla portata residua del furgone. Limite: la scheda non documenta un banco mercatale completo o il suo montaggio, né una riduzione di minuti misurata. Nessun peso dell'allestimento o del veicolo usato come portata del ripiano.

## Controllo aggiuntivo, non usato come prescrizione

URL: https://www.altec.de/en/verladeschienen/aos-leichte-rutschfeste-auffahrrampe

La tabella AOS distingue esplicitamente kg per coppia, kg per pezzo, peso proprio, dislivelli e versioni. La nota delle portate considera un interasse di 1000 mm. È un controllo incrociato della necessità di leggere le condizioni del modello, non una fonte per estendere quei valori alla WM PC o ai carrelli. Non compare nel testo pubblico o nel calcolo.

## Metodo editoriale e foglio

- Titolo, slug e download corrispondono all'incarico. Confrontati i titoli live tramite lettura pubblica della tabella `blog_posts` e l'elenco della coordinatrice: 174 titoli; nessuno slug omonimo o tema equivalente. Ricerche e decisione in `duplicati.json`.
- Nessun test cronometrato, intervista, vendita o risparmio sul campo è stato svolto. Il testo propone un protocollo futuro al lettore. L'esempio numerico è esplicitamente inventato; il foglio Esempio è separato dai dati operativi vuoti.
- Le medie usano le frequenze comuni dei percorsi. Tempi trascorsi, montaggio, carico/scarico, operatori e minuti-persona sono distinti. Gli operatori medi sono ponderati sul tempo, anche tra ripetizioni.
- Valore del tempo e spese provengono soltanto dagli input. Nessuna aliquota, tariffa del lavoro, prezzo di listino o ricavo aggiuntivo è presunto. Il recupero è una stima economica condizionata, non un incasso o risparmio osservato.
- Copertina generata effettivamente con image_gen.imagegen, scena inventata. Prompt effettivo nel file `.prompt.md`; originale, ricevuta e hash nel dossier. Esportazione WebP 1600 × 900.
- Verifica delle formule effettive con `formulas` e riferimento indipendente Python Decimal, casi validi/non validi/vuoti/limite, cache rilette. Anteprime dalle celle, cache e stili reali con Pillow: **non equivalgono a una prova in Excel o LibreOffice**. Ricevute definitive nel dossier.
- Prova del vero `api/blog.js` con fixture isolata del solo post, senza scritture: metadati, canonical, JSON-LD, copertina, due ADS e download. Browser Chromium 1440/768/320, WebKit 390 e Chromium senza JavaScript. Nessuna pubblicazione effettuata da questa sessione.
