# Fonti e metodo, 27 ottobre 2026

Titolo 4, priorità rossa del piano editoriale. Confronto per chi compra; nessuna statistica di vendite concluse, quotazione media o verifica indipendente delle dichiarazioni dei venditori.

Fonte primaria: API pubblica Subingresso, tabella annunci, colonne pubbliche esplicite. Controllati stato active, is_demo false, expires_at futuro, stato Vendita, mercato settimanale e località milanese. Sei schede singole: biancheria Gorgonzola/Cernusco sul Naviglio/Melegnano/Pioltello, abbigliamento Milano e casalinghi Melegnano. Campione editoriale intenzionale, non rappresentativo. Nessun riutilizzo dei recapiti contenuti nelle descrizioni.

| ID annuncio | Dati riportati |
|---|---|
| 16e4bc11-32cf-45db-940d-550906f51952 | Milano, mercoledì, abbigliamento e accessori, 14 m², 12.000 euro; descrizione: via De Capitani e angolo |
| 07010052-3b29-4970-97d4-2afd0a2d95a3 | Gorgonzola, lunedì, biancheria e tessuti, 28 m², 5.000 euro; via Kennedy davanti alla metropolitana |
| 40880d1b-2e2c-444a-b13f-77d468d0a7c2 | Cernusco sul Naviglio, mercoledì, biancheria e tessuti, 35 m², 8.000 euro; centrale, leggermente trattabile |
| 59bbe9d6-93c1-4363-8c00-dec9af3ff27e | Melegnano, giovedì, biancheria e tessuti, 45 m², 10.000 euro; angolo davanti al supermercato |
| 95019ebc-8e45-49f2-bdab-12c66c308449 | Pioltello, sabato, biancheria e tessuti, 50 m², 20.000 euro; angolo in prima fila |
| 12e0b6a1-8de3-4804-a223-33586411901b | Melegnano, domenica, casalinghi, 40 m², 10.000 euro; nessun dettaglio ulteriore sulla posizione |

I sei URL `/annuncio?id=...` restituiscono HTTP200. Esclusi affitti, pacchetti di più mercati, schede con ambiguità tra prezzo di più posteggi e singola cifra. Nessuna deduzione di superficie o titoli amministrativi da immagini. Non convertire le cifre in rendimenti, prezzi per metro quadro o valori consigliati. Confronto limitato a ciò che è scritto; inclusioni, costi e incassi non documentati restano ignoti.

Fonte istituzionale di consultazione, senza sintesi di obblighi o scadenze: [Comune di Milano, disciplina su aree pubbliche](https://www.comune.milano.it/amministrazione/regolamenti-comunali/c-d/commercio-disciplina-su-aree-pubbliche). L'articolo rimanda al SUAP competente per il caso concreto.

Esempio economico 8.000 + 2.000 = 10.000 interamente inventato e distinto dal caso reale di Cernusco. Tre link interni a guide già pubblicate, più guida sui conti del banco. Due slot contestuali esistenti inline/closing, selezione acquisto, spazio Vetrine conservato.

Copertina originale tramite strumento integrato imagegen: scena illustrativa dichiarata IA nel testo; nessuna fotografia di un annuncio reale. Output WebP1600×900. Originale, prompt, snapshot API, schema e prove browser conservati in `Documents/articoli-subingresso/posteggi-vendita-milano-prezzi-confronto`.

Prompt copertina (integrated imagegen):

> Use case: photorealistic-natural. Create an original editorial cover photograph, landscape 16:9, for an Italian article helping street-market traders compare stalls for sale in Milan and its surrounding towns. A believable weekday outdoor market in Lombardy, with two adult traders of different backgrounds standing beside an orderly clothing and household-goods stall, reviewing a simple blank sheet on a clipboard. Natural morning light, everyday working clothes, candid respectful human atmosphere, attractive but authentic Italian urban square, subtle Milanese architecture in the distance without pretending to document a specific market. Show stall structure and walking aisle clearly, realistic proportions and hands. No visible text, no signs, no logos, no watermarks, no fake prices or money. Wide balanced composition suitable for a blog cover cropped to 1600x900. This is an illustrative scene, not a real listing.
