# Articolo 36: stock usato al chilo o al pezzo

Lettura: 24 novembre 2026. Autore: Redazione Subingresso. Preparazione locale; nessuna pubblicazione o scrittura DB autorizzata in questa fase.

## Fonti primarie

1. **JANVS, Wholesale vintage clothing by the kilo**: <https://janvs.it/pages/vintage-clothing-by-the-kilo>. Consultata direttamente via web e GET HTTP 200. Passaggi pertinenti, parafrasati: al chilo si paga il peso; marche, taglie e colori variano; parte del contenuto può richiedere lavoro o restare esclusa dalla vendita; le box a pezzo e i pack sono formati distinti. La stima del numero di pezzi dipende dal peso effettivo dei capi. Limite: descrive le offerte di questo fornitore, non uno standard di settore. Prezzi, tempi e soglie pubblicati non vengono ripresi nell'articolo.
2. **Skull Wholesale, Abbigliamento usato ingrosso**: <https://skullwholesale.com/it-it/pages/abbigliamento-usato-ingrosso>. Consultata direttamente via web e GET HTTP 200. Passaggi pertinenti, parafrasati: box vendute per quantità e mix venduti per peso; composizione, categoria e grado vanno verificati nella singola scheda. Le taglie e le marche possono variare. Limite: dichiarazioni commerciali sui propri prodotti; nessuna garanzia generale o valutazione indipendente del fornitore. La pagina presenta indicazioni di spedizione diverse fra testata e corpo; nessun tempo di consegna è usato.
3. **Indetexx, Second Hand Clothing Bales: A Complete Guide for B2B Buyers**: <https://www.indetexx.com/second-hand-clothing-bales-a-complete-guide-for-b2b-buyers/>. Consultata direttamente via web e GET HTTP 200. Passaggi pertinenti, parafrasati: distinguere capi pronti, da pulire, da riparare e non adatti; confrontare costi complessivi, lavoro e capi vendibili; una dicitura di grado o un campione non garantiscono la resa di una fornitura. Limite: guida di un esportatore, non ricerca statistica né riferimento normativo italiano. Usata solo come riscontro operativo, senza dati numerici o indicazioni su importazioni.

Nel dossier privato dell'articolo sono conservati HTML, testo estratto e `fonti-ricevute.json`, con data, URL finale, HTTP e SHA-256. Le fonti documentano i formati di vendita; controlli e formule sono elaborazione redazionale esplicita.

## Perimetro e dati

- Controllo duplicati: letti LIVE 154 titoli pubblici, con sole colonne id, slug, title, category. Nessun titolo sul confronto del costo per capo vendibile degli stock usati. Nessuna credenziale privata usata e nessuna scrittura DB.
- Tutti gli importi e le quantità dell'esempio sono inventati a scopo didattico: non listini, frequenze, scarti medi, risultati di acquisto o vendite osservate.
- Nessuna affermazione normativa su commercio dell'usato, rifiuti, igienizzazione, IVA o regimi fiscali. La scheda non certifica idoneità alla vendita e non calcola imposte o utile.
- Formula redazionale: (quantità fatturata × prezzo unitario + costi aggiuntivi + ore × valore orario) / (capi pronti + capi recuperabili). I capi recuperabili richiedono l'inclusione dei relativi costi; esclusi e rinviati non entrano nel denominatore.
- Per il confronto usare importi sulla stessa base; il criterio fiscale applicabile va concordato con il commercialista. Non vengono suggerite aliquote o deduzioni.
- Copertina originale generata con lo strumento image_gen integrato, scena inventata dichiarata nel testo. Prompt nel file `.prompt.md`; ricevuta privata e hash finale nella consegna.

## Risorsa e verifiche

`downloads/confronto-stock-usato-costo-vendibile.xlsx`: confronto a due colonne, istruzioni, esempio inventato e controlli del lotto. Celle di input vuote, risultati subordinati a dati numerici validi, conteggi interi coerenti e almeno un capo vendibile. Zero ammesso per costi assenti e ore; quantità e prezzi devono essere positivi. Non richiede macro, connessioni o invio di dati.

Le ricevute private documentano verifica delle formule effettive del file definitivo con motore Excel indipendente e riferimento aritmetico separato, controlli di leggibilità, handler SSR reale con fixture del solo post, SEO, due ADS distinti, browser Chromium 1440/768/320, WebKit 390, lettura senza JavaScript e hash dei download. Gli esiti sono dichiarati esclusivamente nelle ricevute dopo l'esecuzione.
