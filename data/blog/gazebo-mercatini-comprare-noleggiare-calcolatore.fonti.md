# Articolo 38: fonti e criteri

Titolo: **Gazebo per mercatini: comprare o noleggiare? Il calcolatore con trasporto, zavorre e giorni di utilizzo**.

Consultazione: **24 novembre 2026**. Guide per chi usa il gazebo nei mercatini e al banco; non una recensione o un confronto di prodotti equivalenti. Il testo segue il template esistente, senza modificare servizi o schema.

## Fonti primarie

1. [Fabio & Mirko, noleggio gazebo](https://www.fabioemirko.it/noleggio-gazebi.html). Il fornitore indica un 3x3 professionale con quattro pareti a **80 euro più IVA per un giorno**. Il listino si riferisce al ritiro e alla riconsegna in sede; trasporto e installazione sono a preventivo. Serve a documentare la distinzione tra canone e servizi, senza proporre un prezzo medio. Non prova disponibilità nelle date del lettore, inclusione delle zavorre, condizioni della cauzione o costo finale.
2. [Torinoset, noleggio gazebo](https://www.torinoset.com/noleggio_gazebi.htm). La pagina indica un 3x3 bianco a **40 euro più IVA al giorno**, solo noleggio, con pareti opzionali. La configurazione differisce dalla precedente: non è corretto presentare i due importi come risparmio sullo stesso prodotto. Riscontro conservato per evitare un'unica tariffa presunta.
3. [Ecotent, gazebo pieghevoli](https://www.ecotent-gazebo.it/it/prodotti/gazebo-pieghevoli). Il produttore distingue serie, dimensioni e dotazioni, con prezzi di partenza. Il prezzo di partenza non equivale al preventivo del kit richiesto. Nessun prezzo d'acquisto reale è precompilato nel calcolatore e nessuna quotazione del produttore viene usata nell'esempio.
4. [Mastertent, serie e manuali](https://www.mastertent.com/it/gazebo-pieghevole/serie). La sezione dei manuali rimanda alle istruzioni del modello, alle tabelle di fissaggio e alle condizioni di vento. La guida non generalizza carichi, velocità o certificazioni del produttore ad altri gazebo. Il foglio non dimensiona ancoraggi: modello, terreno, pareti e condizioni effettive restano da verificare.

Le catture HTML, gli estratti di testo, gli URL finali, le date di lettura, gli HTTP 200 e gli hash delle risposte sono nel dossier privato assegnato (`fonti-ricevute.json`). Nessun contatto, richiesta di preventivo o invio a terzi.

## Verifica dei doppioni

Letti i titoli LIVE mediante GET pubblico con sole colonne `id,slug,title,category`, anche alla ripresa tecnica del 24 novembre. **158 post**, slug assente. L'unico titolo affine riguarda il registratore telematico: oggetto e modello di costo sono diversi. Ricevute private `titoli-live.json`, `titoli-live-ripresa.json`, `duplicati.json`. Nessuna scrittura al DB.

## Contratto del calcolatore

File: `downloads/calcolatore-gazebo-acquisto-noleggio.xlsx`. Fogli Guida, Confronto, Esempio, Fonti. Input del lettore inizialmente vuoti, formule visibili, nessuna macro o connessione. La cauzione rimborsabile è mostrata separatamente e non entra nel confronto dei costi.

Il lettore sceglie un periodo e inserisce eventi con durata e costi uniformi. Giorni effettivi ed addebitati sono separati. I costi iniziali comprendono gazebo, fissaggio e altri acquisti; la gestione fissa riguarda l'intero periodo. Entrambe le alternative includono trasporto e montaggio per evento, senza ricontare voci già comprese. Il costo delle zavorre noleggiate è il totale per evento, non per singolo giorno.

Con `F` costo iniziale più gestione, `V` spesa propria per evento, `N` noleggio completo per evento ed `E` eventi: acquisto `F + E × V`, noleggio `E × N`. Il costo per giorno usa soltanto i giorni effettivi. Importi calcolati arrotondati ai centesimi. Se `N > V`, la soglia è il primo intero strettamente maggiore di `F / (N − V)`; altrimenti non c'è sorpasso, oppure i costi rimangono uguali se anche `F = 0` e `N = V`.

I pacchetti vanno convertiti in tariffa equivalente sul numero di giorni fatturati, scorporando solo extra non già inclusi. Sconti, durate diverse e aumento delle spese fisse richiedono un nuovo scenario. Tutti gli importi devono usare la stessa base IVA. Il modello conta l'esborso iniziale intero; non calcola imposte, ammortamenti, finanziamento, valore di rivendita o convenienza fiscale.

**Esempio inventato, non un preventivo:** gazebo 700, zavorre 120, altri acquisti 80, gestione 100 euro. Trasporto proprio 15 e montaggio 5 per evento. Noleggio di un giorno 60, zavorre 5, trasporto 10, altri servizi 5. Cauzione ipotetica 150 separata. Dieci eventi: 1.200 contro 800 euro; venti: 1.400 contro 1.600; acquisto meno caro dal diciassettesimo evento. Questi importi non rappresentano statistiche, prove sul campo o prezzi medi.

## Copertina e controlli

Copertina originale generata con **image_gen integrato**, prompt nel file omonimo `.prompt.md`. Formato finale **WebP 1600×900**. La scena inventata è dichiarata anche nel testo pubblico. Originale e ricevuta di conversione conservati nel dossier privato.

Verificati **53 casi**, per **106 valutazioni** delle formule nei due fogli, contro aritmetica indipendente Python Decimal: input vuoti/non validi, esempi, pareggio esatto, cauzione, durate, pacchetti e centesimi. Riletto il file definitivo, comprese cache e assenza di macro o connessioni. La leggibilità delle celle è controllata tramite anteprime dei valori e stili XLSX con Pillow; non è una prova in Excel o LibreOffice.

Il collaudo della pagina usa il vero `api/blog.js` con fixture del solo articolo e richieste analytics/provider intercettate: SEO, sei sezioni, due ADS distinti, Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. In tutti e cinque i casi il download coincide con il file definitivo. Articolo di **2.791 caratteri** di testo normalizzato. Hash e risultati sono in `prepared.json` e nelle ricevute private citate. La consegna di preparazione non equivale a pubblicazione.
