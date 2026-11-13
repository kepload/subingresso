# Fonti e verifiche: netto della vendita del banco

Priorità **42**, sviluppata e **pubblicata il 13 novembre 2026** in una nuova sessione pulita. Un solo articolo.

## Scelta del tema e duplicati

Il punto 14 rimane aperto: ricerche e offerta non comparabili, settore non tracciato. I punti 32/33 risultano già pubblicati e non vengono modificati.

Prima valutato il successivo tema alto libero, **41**, rapporto domande/posteggi nelle fiere lombarde. Il vecchio PDF definitivo Brescia 2026 e il provvisorio 2025 restituiscono **410** alle richieste dirette; Rescaldina 122/2025 restituisce **403**, anche se il motore web ne mostra il testo. La determina Grosio 54/2026 è scaricabile **200** e indica 100 posteggi e domande inferiori ai posti, senza il numero preciso delle domande. Il provvisorio e il definitivo Brescia indicizzati inoltre ripartiscono diversamente commercianti e agricoli. Non si ricostruisce un confronto quantitativo da frammenti o categorie diverse: il punto 41 resta aperto, senza affermare che le fonti siano introvabili ovunque. Ricevute e documento Grosio in `.local/lavori/articoli/fiere-domande-posteggi-20261113/`.

Scelto il **42**, successivo alto libero. Letti **134 articoli live** prima della preparazione: nessuno tratta il netto della cessione; i due articoli fiscali più vicini riguardano imposte della gestione e canone pubblico. Baseline integrale e valutazione dei duplicati nel dossier privato di questa sessione.

## Fonti primarie

Tre pagine Normattiva scaricate **HTTP 200**, testo effettivo letto nella versione vigente al **13 novembre 2026**, con copie originali e SHA256 privati:

- [DPR 917/1986, art. 86](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=86&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=0&atto.codiceRedazionale=086U0917&atto.dataPubblicazioneGazzetta=1986-12-31), commi 2/4: differenza fiscalmente rilevante, costi, avviamento e periodo di tassazione. Il testo corrente comprende modifiche del 2026. Nessuna formula di plusvalenza, aliquota personale, opzione o rateazione fiscale attribuita automaticamente al lettore.
- [DPR 633/1972, art. 2](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=2&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=0&atto.codiceRedazionale=072U0633&atto.dataPubblicazioneGazzetta=1972-11-11), comma 3 lettera b: esclusione IVA delle cessioni di azienda/ramo; non estesa alla vendita separata di qualsiasi bene.
- [DPR 131/1986, art. 23](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=23&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=0&atto.codiceRedazionale=086U0131&atto.dataPubblicazioneGazzetta=1986-04-30), comma 4: natura dei beni e ripartizione del corrispettivo per il registro. Nessuna aliquota unica o riparto legale delle spese inventato.

La pagina FiscoOggi sulla competenza restituisce 403 alle richieste dirette ed è esclusa dai materiali finali. Fonti e prove in `fonti-ricevute.json` nel dossier. Le date di ultimo aggiornamento dell'intero atto non sono presentate come data di modifica del singolo articolo. Il prospetto è una proposta redazionale di pianificazione, non un calcolo fiscale; importi, soggetto venditore, regime, perimetro e calendario vanno esaminati dal professionista.

## Foglio gratuito

`downloads/prospetto-netto-vendita-banco.xlsx`: cinque fogli, Istruzioni, Confronto, Esempio, Documenti e Fonti. Due offerte vuote, sette uscite da compilare, zero solo dopo verifica. Caparra inclusa nel prezzo, non sommata due volte. Distinti netto finale comprensivo delle rate future, incassi previsti entro l'atto e ricavato entro l'atto dopo aver riservato tutte le uscite. Quest'ultimo non è il saldo bancario attuale; comprende anche spese già pagate. Debiti già dedotti dal prezzo non si contano di nuovo.

Imposte inserite manualmente dal commercialista, nessuna aliquota o plusvalenza automatica. I risultati dipendenti restano vuoti se mancano input, ci sono testi o negativi, oppure le componenti del prezzo non coincidono. Esempio interamente inventato: prezzo 30.000, uscite 8.000, netto 22.000, rate future 10.000, ricavato entro l'atto dopo riserve 12.000. Anche i 4.000 euro di imposte dell'esempio sono fittizi.

**56 scenari superati**: formule effettive lette dal file finale e valutate con `formulas.ExcelModel`, confronto con aritmetica Python indipendente. Controllati input vuoti, zeri, testo, negativi, decimali, caparra duplicata, componenti incoerenti e uscite superiori al prezzo. Verificati esempio, cache iniziali, ZIP, convalide e impostazioni stampa; nessuna macro o connessione dati. Tre collegamenti ufficiali, nessun invio. SHA256 finale: `c1dc050bc3695557e13cde271975caecec36ef0de1908f34403f23b251921834`.

## Copertina e anteprima

Copertina originale con skill imagegen e strumento integrato; scena inventata dichiarata nell'articolo. [Prompt integrale](vendere-banco-netto-imposte-spese.prompt.md). File `images/blog/vendere-banco-netto-imposte-spese.webp`, 1600×900, SHA256 `f2de7b0dd2d206dc5d685899c8725390af068736de605f1464c70c0421be21ae`.

Articolo di circa 476 parole, sei sezioni brevi e tre risposte iniziali. Due slot ADS contestuali esistenti e spazio Vetrine conservati; nessuna modifica ai template. Anteprima con rendering corrente: **Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript PASS**. Titolo, descrizione, canonical, NewsArticle, copertina, download, due ADS per venditori e assenza di overflow/errori JavaScript verificati. Screenshot desktop/mobile esaminati visivamente. Regole ADS correnti lette dall'API; scritture browser intercettate.

Backup remoto preventivo verificato: `backup/session-20261113-020301-articolo-fiere-domande-41`, HEAD `3da23e6`. Baseline, generatori, test, ricevute, originali, HTML e screenshot privati: `.local/lavori/articoli/netto-vendita-banco-20261113/`. Modifiche estranee preservate.

## Pubblicazione verificata

Materiali nel commit `d691d07`, push su main e deploy Vercel **success**, identificativo `Aujx4X2hi2pwQh67jcG4hSHKxUdR`. Copertina e XLSX online **HTTP 200**, SHA256 identici ai file locali. Prima dell'inserimento riletti schema, trigger e record correnti; vincolo UNIQUE sullo slug, nessun trigger applicativo. Eseguito un solo INSERT, nessun aggiornamento di post precedenti.

[Articolo pubblico](https://subingresso.it/blog?post=vendere-banco-netto-imposte-spese), ID `f5b2f38e-508e-48ed-a407-971900953163`, pubblicato alle **01:12:22 UTC**. I **134 record precedenti sono invariati** in tutti i nove campi della tabella verificata, **135 totali**. Nessun invio o intervento sui servizi.

Pagina HTTP 200, titolo, descrizione, canonical e NewsArticle verificati; presenza nell'indice e nella sitemap confermata. Collegamenti a pubblicazione annunci e ricerca HTTP 200. **Cinque percorsi online PASS**: Chromium 1440/768/320, WebKit 390 e Chromium senza JavaScript. Copertina caricata, due ADS contestuali per venditori, nessun overflow o errore JavaScript; download effettivo in WebKit identico all'XLSX locale. Scritture browser intercettate. Prima misura senza JS interrotta durante caricamento del layout; controllo ripetuto dopo rete e font pronti, senza modificare il sito: larghezza documento 390 su viewport 390, esito finale PASS.

La ricevuta strutturale dell'XLSX è stata riallineata e nuovamente verificata dopo l'aggiunta delle cache dei risultati: struttura, formule, anteprima, file distribuito e download hanno tutti SHA256 finale `c1dc050bc3695557e13cde271975caecec36ef0de1908f34403f23b251921834`. Il vecchio hash resta soltanto come riferimento esplicito alla fase precedente alle cache. Ricevute finali `esito-finale.json`, `vendere-banco-netto-imposte-spese-esito.json` e `vendere-banco-netto-imposte-spese-online-verificato.json` nel dossier privato.
