# Annunci negli articoli del blog

18 ottobre 2026. Preferenza utente: mostrare le Vetrine agli utenti che leggono gli articoli pertinenti, con rotazione fra più annunci e ripiego sui gratuiti quando mancano promozioni.

## Ordine della selezione

1. La geografia deriva da **titolo e slug dell'articolo pubblicato**, senza leggere corpo, link, altre pubblicità o posizione del visitatore. Tutti i tipi di articolo: bandi, fiere, guide e compravendita.
2. Un articolo regionale ammette annunci delle regioni individuate. Più regioni restano distinte; il Garda comprende Lombardia, Veneto e Trentino-Alto Adige. Salento e Costa degli Dei hanno i rispettivi contesti regionali. Se non c'è una regione esplicita, si cercano comuni nell'anagrafica esistente con indizi geografici; omonimi tra regioni e nomi comuni come «licenza» non vengono risolti per ipotesi. Senza contesto affidabile l'articolo è generico.
3. Nel contesto scelto, **Vetrine attive prima dei gratuiti**. Nei casi riconoscibili, città, alimentare/non alimentare e affitto danno ulteriore pertinenza fra annunci con pari priorità. I settori usano le etichette effettive di `vendi.html`, non valori di macrosettore inventati.
4. A parità di pertinenza, sorteggio nuovo a ogni richiesta, senza duplicati nei tre spazi. Partecipano **tutti** gli annunci idonei, compresi quelli vecchi; nessun limite preliminare ai 24 più recenti. La probabilità è uguale fra annunci di pari priorità, non il conteggio esatto di impressioni: non è una coda con turni garantiti e non scorre automaticamente mentre si legge.
5. Articolo generico: tutte le Vetrine idonee possono partecipare. Senza Vetrine si estraggono annunci gratuiti. Una regione senza Vetrine usa i gratuiti locali, senza sostituirli con promozioni fuori zona. Un solo annuncio idoneo produce un solo spazio; nessun inventario produce uno stato vuoto pertinente.

Esempi: Lombardia → Vetrine lombarde e poi gratuiti lombardi; Piemonte/Liguria → entrambe le regioni; Garda → tre regioni; guida generale ai prezzi → rotazione nazionale. Per il Comune di Licenza serve un'indicazione regionale esplicita: il nome da solo è troppo ambiguo nel lessico del sito. La classificazione prudente non pretende di interpretare qualunque titolo futuro; verificare il contesto restituito quando si pubblicano guide con nuovi territori o nomi ambigui.

## Implementazione e sicurezza

- `PATCH_BLOG_LISTING_ADS_20261018.sql`: RPC di sola lettura `public.blog_listing_ads(p_slug,p_limit=3)`, helper privato di normalizzazione e indice sui nomi geografici. Nessun annuncio, pagamento, trigger o record geografico modificato. Metodo RPC POST e funzione VOLATILE: la scelta non viene congelata nella cache HTML del blog.
- Solo annunci `active`, non demo e non scaduti. La promozione deve avere `featured=true` e `featured_until>now()`; una promozione terminata può apparire come annuncio gratuito se l'annuncio è ancora valido. Annunci in revisione/rifiutati esclusi.
- SECURITY DEFINER con `search_path` vuoto e riferimenti qualificati. Proiezione esplicita di campi già pubblici; mai tel/email, e di `dettagli_extra` escono solo le immagini. Helper e anagrafica restano privati. Massimo tre risultati, anche con limiti client più grandi; slug assente, non valido, non esistente o articolo futuro: nessun annuncio.
- `blog-template.html`: tre anteprime compatte conservate, badge/foto Vetrina, prezzo/affitto annuale, link e osservazione impressioni conservati. Click associato alla regione effettiva del riquadro anche fuori dai bandi. Risposte tardive non sovrascrivono la pagina corrente; il ripristino dalla cache del browser rilegge le promozioni. Errori temporanei non mostrano vecchi annunci; una richiesta successiva recupera normalmente.

## Verifiche del 18 ottobre

Problemi precedenti verificati: pool limitato ai 24 più recenti, geografia solo nei bandi, scaduti non esclusi dal box e fallback regionale collegato sempre al form bandi.

- SQL di produzione eseguito su tabelle temporanee e annullato: **60 Vetrine simultanee, 100 gratuiti recenti, 800 selezioni/2.400 spazi**; copertura di tutte le 60 Vetrine, nessun duplicato, esclusioni, riempimento misto/gratuito/vuoto, regioni/città/zone multiple, tema, casi limite e proiezione senza dati privati. Nessun record reale promosso per simulare acquisti. Script `scripts/test-blog-ads-db.cjs`.
- Ricognizione dei **90 articoli pubblicati**, 48 con contesto regionale, 42 generici; contesti confrontati prima/dopo l'ottimizzazione dell'indice. Passata da circa21,4s a2,2s la verifica complessiva dei 90 contesti, inclusi rete/creazione indice; non è un benchmark di una singola pagina.
- Permessi anon/authenticated, helper privato e indice valido verificati sul DB; nove chiamate pubbliche reali alla RPC hanno verificato geografia, scadenze, limiti e campi restituiti. Stato rilevato:104 annunci idonei e **zero Vetrine attive**. La promozione simultanea è quindi verificata con fixture, non dichiarata come traffico pagante reale.
- `scripts/test-blog-ads.cjs`: otto scenari, Chromium1440/768/320×568 e WebKit390; layout compatto con testo seguente visibile, badge, foto, titoli ostili, prezzi, link/click, vuoti regionali/generici/bandi, errore/ripresa, cache e risposte fuori ordine. Backend e scritture intercettati; nessuna email, annuncio, acquisto o statistica reale generata dalle prove.
- Prove, SQL temporaneo, riscontri e screenshot: `Documents/blog-ads-20261018/`. Pubblicazione e confronto HTML registrati nel file informazioni dopo il rilascio. Checkout separato; dati e codice fiere non coinvolti.

Esecuzione: `PLAYWRIGHT_MODULE` per il browser, `BLOG_ADS_QA_DIR` per gli artefatti, `BLOG_ADS_TEMPLATE_FILE` per HTML pubblicato. Test DB: `SUPABASE_ACCESS_TOKEN` in ambiente oppure `BLOG_ADS_SETTINGS` verso impostazioni locali; credenziale mai nei file versionati o nell'output. La funzione DB va applicata **prima** del template che la chiama.
