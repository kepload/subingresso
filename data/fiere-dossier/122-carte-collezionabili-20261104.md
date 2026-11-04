# Nuove fiere di carte collezionabili — 4 novembre 2026

Ricerca mirata richiesta dall’utente, separata dal censimento provinciale.
Automazioni ferme; nessuna modifica alle caselle delle province.

## Aggiunte

| Fiera | Luogo | Edizione documentata | Fonte organizzatore |
|---|---|---|---|
| Card Expo Italia | Corte Franca (BS), Number One | 26–27 settembre 2026, conclusa | https://cardexpoitalia.com/ |
| Florence Cards Show | Firenze, Hilton Garden Inn Novoli | 7–8 novembre 2026 | https://www.fumettiedintorni.it/florence-cards-show-novembre-2026/ |
| TCG Nexus Convention | Roma, Marriott Park Hotel | 5–6 dicembre 2026 | https://tcgnexus.it/ |

Card Expo: prima edizione esplicitamente conclusa sul sito; prossima data
in lavorazione, senza proiettarla al 2027. Carte Pokémon, One Piece, Magic,
Yu-Gi-Oh! e altri TCG documentati. Nessun badge di notorietà o numero di
visitatori attribuito dalla viralità riferita dall’utente.

Florence: locandina originale dell’organizzatore letta visivamente, con
7–8 novembre, sede, marchi e stand espositori. Anno dalla pagina pubblicata
il 9 ottobre 2026. Immagine ufficiale:
https://www.fumettiedintorni.it/wp-content/uploads/WhatsApp-Image-2026-10-03-at-19.49.25.jpeg
L’immagine ritagliata 1080x540 non mostra le date: usato l’originale completo.
I 10 euro della locandina sono ingresso del pubblico, non quota stand.

TCG Nexus: date e sede dalla home ufficiale, area commerciale e Pokémon/
carte sportive espliciti. I 6.000 visitatori attesi non sono una rilevazione;
non aggiunti all’affluenza documentata. I prezzi dei pass non sono quote stand.

CardFest Napoli: già presente con date 11–12 settembre 2026 e fonte
Mostra d’Oltremare. Riscontro anche sul sito https://cardfest.it/;
nessun duplicato o modifica alla scheda precedente.
Collect IT verificato sul sito ufficiale: home già orientata al 2027,
nessuna nuova data/località ricavata dalla sola pubblicità del circuito.

## Esito e limiti

Tre aggiunte nei rispettivi audit Brescia/Firenze/Roma, catalogo 9.587.
Tutte le 9.584 schede precedenti confrontate campo per campo e invariate;
build ripetibile. Condizioni per gli espositori da chiedere agli organizzatori;
nessuna disponibilità o quota commerciale inventata. Non è un censimento
completo dei card show italiani e non avvia un monitoraggio automatico.
ID e date ammessi alle recensioni sincronizzati: 9.587.

Anteprime: voto medio /5 e conteggio da riepiloghi pubblici reali, richieste
in gruppi di massimo 50; nessun autore o testo restituito. Con zero contributi
«Scrivi la prima recensione», in errore collegamento «Recensioni» ancora
utilizzabile. Pubblicazione aggiorna il riepilogo. Scheda dettagliata invariata.

Verifiche: API con fixture isolate, SQL aggregati/permessi/privacy in ROLLBACK,
impronta delle recensioni esistenti identica prima/dopo installazione RPC.
Test anteprime Chromium 1440/768/320 e WebKit 390, tema chiaro/scuro,
ricerca Pokémon, apertura recensioni e overflow. Regressioni recensioni
1440/820/320 e WebKit 390; pagine fiere e accesso fonti.
Prove private in `.local/verifiche/anteprime-tcg/`.

Conservata l’identità visiva esistente. Detector grafico: segnala soprattutto
stili preesistenti; 14px dei metadati e focus con angolo 3px sono coerenti
con i controlli compatti già presenti. Nessun ridisegno o nuova immagine UI.

Pubblicato `92d69a8`, stato Vercel success/Ready. Quattro asset online
identici ai sorgenti; tre pagine autonome 200 con date canoniche; API
riepiloghi anonima 200, conteggi zero reali sulle tre nuove fiere.
Ulteriore verifica senza fixture su produzione Chromium 1440/320 e WebKit
390: SDK reale, filtri, riepiloghi, apertura diretta recensioni, nessun
errore browser o overflow. Nessun account, recensione o invio reale di test.

Inspector generale eseguito ai tre formati: segnala proprietà già presenti
nel calendario (titolo nascosto, dimensioni compatte, bordi, sfumature,
assenza di foto e animazioni). Nessun ridisegno fuori richiesta per adeguare
il calendario alle regole delle pagine promozionali. Revisione visiva delle
anteprime chiara/scura passata; contrasto link scuro verificato sul colore
finale, dopo la transizione. Il test conserva il riferimento esplicito al
catalogo precedente `31f225d`, così resta ripetibile dopo il commit.

Affinamento successivo: focus e scorrimento alle recensioni dopo l’apertura
del dialogo, nel frame seguente. Evita che Safari riporti la vista al pulsante
di chiusura. Test esplicito di intestazione in viewport e focus della sezione
in tutti e quattro i formati/browser.
