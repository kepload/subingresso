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

- **Testo corrente, revisione esplicita dell'utente:** «5.000 € in 2 giorni?
  Punta alla fiera giusta». Supporto: «La cassa non si riempie da sola.
  Scegli dove portare il banco». Domanda provocatoria rivolta agli ambulanti,
  non testimonianza attribuita a San Faustino o previsione personale.
- Titolo in righe controllate; importo/valuta e «in 2 giorni?» restano interi.
  «Punta alla» / «fiera giusta» sono gruppi indivisibili nei formati stretti.
- Regione esplicita nel titolo/slug: pulsante con regione già selezionata.
- Articoli con più regioni o sul Garda: calendario nazionale. Nessuna regione
  dedotta arbitrariamente; riconoscimento solo di nomi regionali espliciti.
- Chiusura: «Il prossimo incasso? Non lasciarlo agli altri». Supporto:
  «Scegli la prossima piazza. Il banco ce lo metti tu». Pulsante «Trova la
  fiera giusta», sempre visibile. Blu, titoli bianchi, importo e pulsante oro.

Preferenza esplicita: pubblicità più aggressive; gli importi possono essere
una provocazione in forma di domanda, senza trasformarli in un guadagno
garantito. Sostituito il precedente banner delle 200.000 presenze: il dato
e la fonte restano nell'archivio storico delle fiere. Nessun nuovo dato sulle
fiere aggiunto o materiale di ricerca precedente alterato.

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

## Pubblicazione verificata

Prima versione, prima della revisione del testo richiesta sotto.

Commit `ec8d0a1811ef6677ea6577925a47ebfcdd3354b0`, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/EmvLaMzre4XobEPiJLMEPm6r843S).
Template, CSS e due JS online identici al commit (confronto e SHA256).
Indice e tre articoli principali HTTP200 con nuovi asset. Stessa suite di32
casi passata sull'HTML pubblicato; servizi di scrittura sempre intercettati.
Dodici verifiche di destinazione sul calendario reale: Veneto, Lombardia,
Trentino-Alto Adige e Valle d'Aosta su Chromium1440/320 e WebKit390; regione
correttamente selezionata e risultati pertinenti. Nessuna scrittura di prova.
CHECK DB pubblicato verificato: conserva i tre tipi precedenti e aggiunge
`cta_fiere_click`; zero eventi di prova residui. Integrità di90 contenuti
verificata anche sull'HTML online. Scansione segreti superata al commit.
Prove `online/assets.json`, `online/browser.json`, `online/all-posts.json`,
`online/destinations.json`, `database-verified.json` e `deploy.json` nella
cartella di verifica indicata sopra.

## Revisione aggressiva e righe — 18 ottobre 2026

Richiesta successiva dalla schermata: eliminare gli a capo con parole isolate
e rendere la pubblicità più aggressiva, usando i 5.000 euro come provocazione.
Testi correnti sopra; CSS e JS dedicati v2. Tracciamento, destinazioni e
posizionamenti conservati; nessun intervento su DB o funzioni organizzatori.
Stesso checkout isolato, aggiornato prima al commit organizzatori `7984e1a`.

Verifiche locali:32 casi su articoli veri/indice Chromium1440/768/320×568 e
WebKit390, integrità90 articoli, collegamenti/click e riquadri ≤380px. Audit
aggiuntivo di36 riquadri:9 larghezze320/375/390/520/600/768/894/1024/1440 in
Chromium e WebKit, frasi indivisibili, niente overflow. Immagine a894px
confrontata con la schermata dell'utente; ispezionata anche320px. Prove in
`Documents/blog-promo-fiere-20261018/copy-aggressivo/` e script esterno
`copy-aggressivo-layout.cjs`. Backup remoto
`backup/session-20261018-220619-fiere-copy-aggressivo` verificato; lo script
si è fermato sullo stderr nativo di git in PowerShell dopo il push riuscito.
Pubblicazione della revisione da verificare.
