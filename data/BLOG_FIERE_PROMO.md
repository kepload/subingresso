# Pubblicità delle fiere nel blog — 18 ottobre 2026

Richiesta: analizzare gli articoli già visitati e portare lettori al calendario
con pubblicità incisive nello stile del sito, preservando la sessione su
organizzatori/eventi. Checkout separato `Documents/subingresso-blog-promo-fiere-20261018`.
Nessuna modifica a calendario, catalogo, organizzatori, prenotazioni o pagamenti.

## Dati e scelta dei punti

Lettura API Supabase del 18/10/2026 alle 19:46 UTC, soli aggregati delle visite
e contenuti pubblici. Ultimi 30 giorni: 335 visualizzazioni su 44 articoli;
7 giorni: 82; 90 giorni: 948. Non sono impression/clic di Search Console né
persone uniche del blog. Traffico contenuto, nessuna promessa di aumento ricavi.

| Articolo | Visite 30 giorni | Visitatori per articolo |
| --- | ---: | ---: |
| Bolkestein, ultime notizie 2026 | 111 | 88 |
| Quanto costa un posteggio al mercato | 45 | 42 |
| Bolkestein, guida pratica | 17 | 17 |
| Bandi Veneto | 17 | 16 |
| Spuntista | 13 | 13 |
| Tasse e contributi | 12 | 12 |
| Bandi Toscana | 12 | 10 |

Richiamo principale prima di una nuova sezione, dopo almeno sei paragrafi e
1.000 caratteri, entro il 70% del testo. Resta distante dal box annunci/form
avvisi al terzo paragrafo, senza spezzare liste, tabelle o blocchi annidati.
Segue un richiamo finale compatto. Articoli senza un punto adatto: un solo
richiamo dopo il testo. Nell'indice: dopo il gruppo dei primi cinque articoli.
La guida agli eredi non riceve questi richiami commerciali.

## Messaggi e destinazioni

- Nazionali e Lombardia: «200.000+ presenze in un giorno» e «San Faustino,
  Brescia. E tu, dove porti il banco?». Fonte visibile e apribile, esplicitamente
  stima della stampa, edizione 2026. Dato già nel catalogo, ricontrollato nel
  [resoconto di ÈliveBrescia TV](https://www.elivebrescia.tv/san-faustino-brescia-bancarelle-600-tirapicio/)
  del 15 febbraio 2026. Pubblico della fiera, nessuna conversione in incasso.
- Altre regioni esplicite nel titolo/slug: «Il prossimo grande incasso?
  Parti dalla fiera giusta». Pulsante con regione già selezionata.
- Articoli con più regioni o sul Garda: calendario nazionale. Nessuna regione
  dedotta arbitrariamente; riconoscimento solo di nomi regionali espliciti.
- Chiusura: «Il banco è pronto. La prossima fiera?». Pulsante «Trova la fiera
  giusta», sempre visibile. Blu, titoli bianchi, accento e pulsante oro.

L'esempio «5.000 euro in 2 giorni» non è una testimonianza documentata:
non viene presentato come un guadagno reale. Nessun nuovo dato sulle fiere
aggiunto o materiale di ricerca precedente alterato.

## Misura, isolamento e verifiche

`cta_fiere_click` in `blog_conversions`, con slug e regione: riusa identificativi,
guardie, RLS e deduplica esistenti. Un evento per sessione/articolo; indice
senza slug non registra questo evento. Nessuna nuova libreria o identificativo.
Il pannello esistente include il click nel totale conversioni, ma le colonne
annunci restano dedicate agli annunci; dettaglio fiere interrogabile per kind.
Patch `PATCH_BLOG_FIERE_CTA_20261018.sql`: estende soltanto il CHECK dei tipi.

Prove in `Documents/blog-promo-fiere-20261018/`: aggregati, 90 contenuti
pubblici, immagini, controlli browser e SQL. Browser su articoli veri e indice:
Chromium 1440/768/320×568 e WebKit 390; massimo due richiami, fonti, link,
contenuti e tabelle conservati, nessun overflow del nuovo riquadro, altezza
≤380px, pulsanti ≥44px, clic distinti dagli annunci e mount ripetuto idempotente.
Controllo di integrità su tutti i 90 articoli. Regressione dei box annunci:
32 casi; acquisizione e qualità dati passate. Tutte le scritture browser
simulate, nessuna iscrizione/email/annuncio/pagamento reale di prova.
SQL provato con ROLLBACK: inserimento anon/auth, deduplica, evento invalido
respinto, alert_signup protetto e righe invisibili al pubblico tramite RLS.
Prima asserzione sui privilegi SELECT troppo restrittiva: corretta verificando
le righe effettivamente visibili; nessuna modifica ai permessi.

Backup remoto `backup/session-20261018-214606-pubblicita-blog-fiere` verificato;
branch `backup/pre-blog-promo-fiere-20261018` verificato. Noto errore del cleanup
tag nello script PowerShell, creazione e invio del checkpoint riusciti.
Il miglioramento dei clic/ricavi va misurato dopo la pubblicazione.
