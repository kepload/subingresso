# Fonti e verifiche: dossier per vendere il banco

Ruolo **B**, mandato `quattro-articoli-20261113-1853`. Priorità effettiva **62**, ripiego esclusivo del tema 51. Un solo articolo. **Materiali pronti; pubblicazione e controlli live a cura del coordinatore.** Nessun inserimento nel database, modifica di main o modifica di articoli altrui eseguito dall'autore.

## Perché il tema 51 resta aperto

Il confronto promesso richiedeva dieci mercati lombardi con posteggi assegnati e liberi, definizioni e date comparabili. Le fonti reperite non danno questa base:

- [Regione Lombardia, Mercati su aree pubbliche](https://www.dati.lombardia.it/d/68zx-njaw): metadati e campione letti via API il 13/11/2026, HTTP 200. Ultimo aggiornamento righe indicato dal servizio: 10/11/2026. L'anagrafica MERCap contiene consistenza dei posteggi, settori, superfici e riferimenti ai bandi, senza campi che distinguano assegnati e liberi e senza data della verifica di questo stato per ciascun mercato. Lo stesso mercato è ripetuto per giorno di svolgimento.
- [Milano, dataset DS291 mercati settimanali scoperti](https://dati.comune.milano.it/dataset/ds291-economia-mercati-settimanali-scoperti): metadati e CSV scaricati HTTP 200. Copertura temporale dichiarata maggio 2024; la modifica del catalogo a maggio 2026 non trasforma i dati in un censimento attuale. Il campo `status mss` riguarda il mercato, non la situazione di ogni posteggio. Non ci sono conteggi di posti assegnati e liberi.
- [Brescia, partecipazione ai mercati cittadini](https://www.comune.brescia.it/it/servizi/partecipazione-spunta-mercati-cittadini) e [Monza, mercati settimanali](https://www.comune.monza.it/it/page/mercati-settimanali): pagine lette e archiviate HTTP 200, con informazioni sulla spunta; non provano dieci consistenze attuali comparabili. I risultati sul bando Bergamo 2026 non sono usati come censimento attuale.

Non si sottraggono dai posti teorici quelli di un bando per ricavare gli occupati, né si usano assenze giornaliere come posti senza concessionario. È un limite della base reperita in questa ricerca, non una dichiarazione che i dati non esistano altrove. Il tema 51 resta aperto al coordinatore.

## Duplicati e fonti del tema 62

Recuperati via API pubblica **135 titoli, slug ed estratti live**, HTTP 200, prima della preparazione. Nessun titolo sul dossier documentale per destinatari e sul registro delle condivisioni. La guida esistente alla verifica degli incassi è richiamata senza ripeterne il foglio; le guide generali alla vendita hanno ambito più ampio.

Fonti consultate il **13 novembre 2026**, con copie e SHA256 nel dossier privato B:

1. [Garante, principi fondamentali del trattamento](https://www.garanteprivacy.it/home/principi-fondamentali-del-trattamento), HTTP 200: minimizzazione, conservazione e sicurezza, necessità di un'idonea base giuridica e obblighi informativi. Non viene attribuita alla vendita del banco una base giuridica universale; il consenso dell'acquirente non è presentato come autorizzazione per i dati di terzi.
2. [Garante, testo del GDPR](https://www.garanteprivacy.it/il-testo-del-regolamento), pagina e PDF HTTP 200: letti artt. 5, 6, 13-14, 30 e 32. La versione arricchita con rinvii ai Considerando è aggiornata alle rettifiche 2018 ed è dichiarata informativa dal Garante; non è descritta come nuova norma del 2026. L'accesso diretto EUR-Lex ha dato errore di rete/controllo automatico; i frammenti del motore non sono utilizzati come testo completo verificato.
3. [CNR, FAQ del Responsabile protezione dati](https://www.rpd.cnr.it/wp/?page_id=932), HTTP 200: la sezione sull'oscuramento spiega che una banda colorata può lasciare il testo estraibile. Il contesto è quello dei documenti del CNR e della trasparenza: nell'articolo viene richiamato il problema tecnico, senza estendere le regole della pubblica amministrazione alla vendita privata.
4. [Garante, relazione annuale 2021, pagina stampata 50](https://www.garanteprivacy.it/documents/10160/0/Relazione%2Bannuale%2B2021.pdf/7a98bf21-9150-26ae-c5ce-eeeb4edb02b2?version=2.0), PDF HTTP 200: ulteriore riscontro tecnico dei dati recuperabili sotto etichette e barre di colore. È una fonte storica sul difetto tecnico, non una statistica sul comportamento degli ambulanti nel 2026.

Categorie di documenti, fasi della trattativa e metodo del registro sono proposte organizzative redazionali da adattare con i professionisti. Nessuna checklist legale completa, clausola contrattuale, termine di conservazione universale o certificazione privacy. Esempio «ACQ-01 / D02 / v1» interamente inventato. Nessun dato personale reale usato nei materiali.

## File gratuito definitivo

`downloads/dossier-vendita-banco-condivisioni.xlsx`: cinque fogli visibili, Istruzioni, Dossier, Condivisioni, Esempio e Fonti. Dodici categorie documentali da valutare, cinquanta righe operative vuote, esempi separati. Una riga per destinatario e documento, versione effettiva, motivo, canale, riesame, stato e chiusura manuale. Menu ID e stati, date con formato italiano, filtri, intestazioni ferme e aree di stampa.

**37 controlli passati sul file definitivo**, inclusi registro vuoto, esempi, ID, menu e date valide/non valide, compilazione su copia in memoria, struttura ZIP e stampa, assenza di formule, macro, connessioni, dati incorporati e link esterni a dati. Solo tre collegamenti a fonti ufficiali. Nessuna cache di calcolo da aggiornare. Il file originale resta invariato dopo le prove.

Limite: verifica OOXML e salvataggio/rilettura con openpyxl; non provate le finestre di convalida nell'interfaccia Microsoft Excel. Il copia-incolla può aggirare le convalide: istruzione esplicita nel file. Nessuna chiusura automatica di link, invio o garanzia di cancellazione delle copie; il registro non sostituisce quello dell'art. 30 GDPR.

SHA256 definitivo XLSX: `3d73e20f4de12ac5996dca7534a3804596a4a4ca1214aa8b202fa33069c1316c`. Ricevuta `verifica-risorsa.json` allineata allo stesso file scaricato dal browser.

## Copertina e anteprima

Copertina originale generata con skill imagegen e strumento integrato, scena inventata dichiarata nel testo. [Prompt integrale](vendere-banco-dossier-documenti-acquirenti.prompt.md). File WebP **1600×900**, SHA256 `fdd3a8723ee4d9c062e9571f2e7b929147f94c9a925ab455b79cc2263c28e01d`. Nessun documento reale di riferimento, nome o logo leggibile.

Articolo di **638 parole**, sei h2, tre punti iniziali, un download e due slot ADS `inline`/`closing`; rendering esistente senza modifica a template, CSS, servizi o schema. Regole ADS correnti lette dall'endpoint pubblico prima dell'anteprima. SSR/SEO: titolo, descrizione, canonical previsto e NewsArticle conformi; spazio Vetrine presente, offerta reale non simulata come pagante.

**Cinque percorsi PASS:** Chromium 1440/768/320 px, WebKit 390 px e Chromium senza JavaScript a 390 px. Copertina caricata, due ADS contestuali di vendita, nessun overflow o errore JavaScript. Screenshot prodotti, desktop e mobile esaminati visivamente. Download WebKit effettivo da server locale con SHA256 identico al file finale. Scritture browser intercettate; nessun invio o dato reale creato.

Primo controllo download in anteprima intercettata: WebKit ha scaricato il 404 pubblico del file ancora inedito, perché il download usciva dall'intercettazione. Risolto nel solo collaudo servendo pagina e download da HTTP locale: nessuna modifica al sito necessaria. Esito finale PASS, hash sopra verificato. Questa non è ancora una verifica del download pubblico.

Backup remoto preventivo verificato: `backup/session-20261113-185718-quattro-articoli-b-20261113`, HEAD base `2d3cc91`. Ricerca, generatori, originali, prove, ricevute, anteprime e consegna privata: `.local/lavori/articoli/quattro-articoli-20261113-1853/B/`. Ricevuta browser: `vendere-banco-dossier-documenti-acquirenti-anteprima-verificata.json`.

## Stato della consegna

**prepared: true; published: false.** Commit e branch esatti riportati in `consegna.json` e `consegna.md` nel dossier privato B. Il coordinatore integra, pubblica le risorse, inserisce il post e verifica URL, indice, sitemap, download pubblico e conservazione degli articoli precedenti. Elenco editoriale e registro comune riservati al coordinatore.
