# Fonti e verifiche — due fiere nello stesso fine settimana

Priorità **16**. **Pubblicato e verificato il 14 novembre 2026.** Preparazione conclusa nella prima fase con i soli sei materiali propri; in quella fase nessuna modifica a documenti comuni, main, template o database. Pubblicazione autorizzata dal coordinatore nel secondo turno e verificata come descritto sotto.

## Ambito e controllo duplicati

Elenco LIVE di **143 articoli** recuperato il 14 novembre 2026 tramite API pubblica, prima della scrittura. Nessuno slug o titolo specifico sul confronto fra due fiere nello stesso fine settimana. Ricevute `blog-baseline.json` e `duplicati.json` nel dossier privato assegnato.

Le guide regionali già presenti descrivono eventi; `fiere-lombardia-corrente-acqua-parcheggio` confronta servizi. Questo articolo fornisce invece una scheda a due colonne con vincoli preliminari, pubblico coerente, concorrenti nello stesso perimetro, uscite e ore. Non calcola ricavi minimi, non certifica affluenza e non assegna punteggi o un vincitore automatico.

Nessuna rilevazione sul campo, impresa esaminata o vendita reale ricostruita. I numeri A/B del foglio Esempio e dell'articolo sono inventati e dichiarati. Il rapporto concorrenti/banchi descrive un campione scelto dall'utilizzatore; non è una stima di fatturato. Due eventi nelle stesse date non sono automaticamente alternative adatte alla stessa merce.

## Fonti primarie lette

Copie integrali scaricate direttamente **HTTP 200** il 14 novembre 2026; testo dei PDF estratto e letto. URL finali, orario UTC, dimensioni e SHA256 in `fonti-ricevute.json` nel dossier privato.

- [Regione Umbria, calendario nazionale/internazionale 2026, file del 30 ottobre](https://www.regione.umbria.it/documents/18/26177470/Anno%2B2026%2Bfiere%2Bnazionali%2Be%2Binternazionali%2B%2B30%2Bottobre%2B2026/8706d977-b2dd-44dd-a31a-c4738a28a493), pagina 2: Eurochocolate a Perugia 13–22 novembre e La Terra dei Mercanti a Bastia Umbra 21–22 novembre. Esempio reale di sovrapposizione nel weekend con durate e settori diversi. Il calendario non prova disponibilità, termini ancora aperti, durata contrattuale della singola partecipazione o idoneità della merce dell'utente. Non è una classifica fra questi eventi. SHA256 PDF: `b3886301d3321f0e4cb3fe650899ed8807db18a2db298b2cbb49e107a5f300eb`.
- [Artigiano in Fiera 2026, pagina ufficiale espositori](https://pass.artigianoinfiera.it/index.html), sezione requisiti: selezione per autenticità, originalità e qualità. Usata come esempio di criterio dell'organizzatore, senza dedurne spesa dei visitatori o risultati del banco. Non utilizzate le cifre promozionali di pubblico, i finanziamenti o i prezzi del sito. SHA256 HTML: `0e134502c8d68a9c1d773328ef148851444e74202cdc4de1cdcd561cbed7cebc`.
- [Artigiano in Fiera 2026, regolamento generale con AF Awards, versione 3](https://pass.artigianoinfiera.it/pdf/AF26%20Regolamento%20Generale%20con%20AF%20Awards_IT_versione%203.pdf), collegato dalla pagina espositori al momento della consultazione: punto 7.7, apertura per l'intera manifestazione; punto 25.1(9), autorizzazione alla sosta dei veicoli nelle aree interne. Due esempi specifici di verifiche necessarie, non norme generali per tutte le fiere. La pagina promozionale indica apertura alle 10:00, il regolamento 09:45: l'articolo non riprende questi orari né risolve la discrepanza; per partecipare serve la conferma applicabile all'espositore. SHA256 PDF: `50a545394687b83c18f079c797f321d7bfa6db151de8d90050b7207c7e506715`.

I risultati di ricerca hanno proposto anche una pagina del Comune di Perugia (404 al recupero) e gli organici fiere del Comune di Milano (403). Esclusi dalle affermazioni dell'articolo; conservate le risposte nel dossier. Esaminate versioni precedenti del regolamento Artigiano, poi usata soltanto la v3 attualmente collegata dalla fonte ufficiale.

Il metodo di confronto, le domande e la scelta di non attribuire pesi numerici sono elaborazione editoriale. Non si attribuisce alle fonti un metodo di selezione del banco o una promessa di guadagno.

## Risorsa definitiva

`downloads/scheda-confronto-due-fiere.xlsx`, **19.863 byte**, sei fogli: Guida, Confronto, Prove, Logistica, Esempio, Fonti. Input operativi inizialmente vuoti; esempio inventato separato. Otto voci di uscita e cinque di ore per evento, per l'intera presenza; uscite comprensive dell'IVA da pagare, senza merce, imposte sul reddito, valore del lavoro del titolare o ricavi persi altrove. Nessuna previsione di utile.

I totali richiedono tutti i valori numerici validi; zero è distinto da assenza del dato. Conteggi interi, denominatore positivo, concorrenti non superiori ai banchi esaminati. Quattro risposte preliminari riassunte in Fermati / Da chiarire / Da valutare: sono dichiarazioni dell'utilizzatore, non una certificazione amministrativa. Le convalide possono essere aggirate da un incolla; le formule ricontrollano i numeri. Nessuna macro, connessione dati, collegamento a cartelle esterne o oggetto incorporato; soltanto tre hyperlink HTTPS espliciti alle fonti.

**352 scenari sulle formule PASS**, lettura dal file XLSX con motore `formulas` e valori attesi indipendenti: input mancanti, testo, negativi, valori oltre i limiti, totali zero, decimali ammessi, conteggi frazionari o incoerenti e passaggi fra fogli. Controllate struttura, ZIP, convalide, stampa, input vuoti e dati didattici. Cache iniziale dei risultati verificata sul file definitivo; formule conservate e ricalcolo all'apertura attivo. **Excel e LibreOffice non avviati**. Prove: `verifica-foglio.py` e `verifica-foglio.json` nel dossier.

SHA256 XLSX: `55f8998dbb7ff12ea3356fc73d1cba1f6104e19beadb318787de1da2a360d820`.

## Copertina e verifiche locali

Copertina originale generata con skill imagegen e strumento integrato, scena inventata e dichiarata nel testo. Prompt integrale nel file `.prompt.md`; originale privato conservato. WebP **1600×900**, ispezionato: cartelline con planimetrie astratte, taccuino, banchi e furgone; nessun marchio o testo leggibile. SHA256: `57f01307efdd049e94b6b136689b7c982c1ccd3bc35b2fb8fa5258ba10787d87`.

**Cinque percorsi browser locali PASS** con il vero handler SSR e il template del worktree: Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. Sei h2, tre punti iniziali, due ADS distinte inline/closing, lettura, immagine, assenza di overflow ed errori JavaScript. **Quattro download effettivi PASS**, uno per percorso con JS, identici al file definitivo per SHA256. Senza JS verificata la lettura, senza ripetere il download.

SEO, title, description, canonical e NewsArticle verificati sull'HTML SSR; indice e sitemap verificati con il nuovo post in fixture. Nessuna presenza online del nuovo post dichiarata. Scritture analytics/provider e richieste API del browser intercettate; nessun invio, account o dato reale di prova. Un server HTTP locale temporaneo ha servito il download e si è chiuso al termine. Prove: `verifica-locale.cjs`, `verifica-locale.json`, HTML e screenshot nel dossier.

Diagnostica dei test: corretta l'attesa iniziale che presumeva `naturalWidth=1600` nonostante srcset; download provato via HTTP locale reale dopo annullamento della risposta simulata; controllo senza JS eseguito dopo il primo paint e la conclusione dell'animazione CSS esistente. Nessun cambiamento ai file condivisi per questi adeguamenti del test.

## Separazione delle due fasi

La consegna iniziale riservava pubblicazione e verifiche online al secondo turno, dopo articolo 8 e autori precedenti. Il coordinatore ha autorizzato quel turno per questo stesso articolo. `prepared.json` e `prepared.md` restano ricevute immutate della prima fase; gli esiti di pubblicazione sono riportati qui sotto.

## Pubblicazione verificata il 14 novembre 2026

[Articolo pubblico](https://subingresso.it/blog?post=due-fiere-stesso-fine-settimana-scegliere), record **`027f57b8-7f82-42a6-9ef7-b869aed0c8f9`**, data DB **2026-11-14T16:52:58.024697+00:00**. **Un solo INSERT**, protetto dall'assenza dello slug; nessun UPDATE/DELETE di post. Tutti i **145 record precedenti invariati nei nove campi**, **146 totali**: confronto integrale delle righe immediatamente prima/dopo l'inserimento e alla verifica online.

Materiali preparati `c42642f85ecb73b10bdf64c9c95ef6a8d6f8348a`; merge di `origin/main` **`9c4a11ed5d35fd15106896bf148c94aedd82440f`** senza conflitti, conservando articoli 8 e 15. Commit di integrazione e push materiali **`b8abddbacf3f5972dfc98bff6480cb2353d9dcab`**. [Deploy Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/3gdSPeypQnfxKJWQcrpZYT8CuD3v), stato GitHub Vercel success verificato prima dell'INSERT. Backup remoto del secondo turno: `backup/session-20261114-174902-articolo16-pubblicazione`, dereferenziato al commit preparato. L'helper ha rimosso vecchi tag locali; i tag remoti sono conservati, nessuna ulteriore pulizia eseguita.

Schema, vincoli, trigger e duplicati LIVE controllati prima del push e di nuovo immediatamente prima dell'INSERT: nove colonne, PK UUID, slug univoco, nessun trigger applicativo. Copertina e XLSX **HTTP 200** con hash identici ai definitivi prima dell'inserimento e dopo. Contenuto HTML, metadati e due risorse invariati dalla preparazione: nessuna rigenerazione o ripetizione dei 352 scenari necessaria. Nessuna modifica a template, CSS, JavaScript, API, schema o servizi.

**Cinque percorsi online PASS**: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Testo effettivamente visibile e copertina caricata, sei sezioni, tre punti iniziali, due ADS distinte, nessun overflow o errore JavaScript. Screenshot conservati; desktop e WebKit esaminati visivamente. Senza JS, visibilità verificata dopo il primo paint e il completamento dell'animazione CSS esistente, senza alterare la pagina.

**Quattro download effettivi online PASS**, uno per percorso con JS: **19.863 byte**, SHA256 **`55f8998dbb7ff12ea3356fc73d1cba1f6104e19beadb318787de1da2a360d820`**. Lettura senza JS verificata separatamente. Scritture analytics/provider intercettate; nessun account, invio o dato reale di prova.

SSR, titolo, descrizione, canonical e NewsArticle conformi; nuovo slug presente nell'indice e nella sitemap pubblici. Gitleaks 8.21.2 eseguito esplicitamente con l'eseguibile condiviso della root principale sul lavoro pubblicato, nessun segreto; hook non modificato né bypassato.

Ricevute nel dossier: `schema-publication-baseline.json`, `schema-immediatamente-prima-insert.json`, `blog-immediatamente-prima-insert.json`, `insert-ricevuta.json`, `blog-immediatamente-dopo-insert.json`, `post-precedenti-preservati.json`, `verifica-dati-finale.json`, `deploy-materiali.json`, `asset-pubblici.json`, `verifica-online.json`, screenshot e download. Elenco aggiornato soltanto alla voce 16 e nota propria nel registro. Consegna privata `result.json`/`result.md` con commit finale e ricevute dei push.
