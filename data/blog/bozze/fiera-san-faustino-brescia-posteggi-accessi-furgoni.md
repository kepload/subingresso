# San Faustino Brescia: bozza bloccata, non pubblicare

Titolo richiesto: **Fiera di San Faustino a Brescia: mappa dei posteggi, numeri e accessi per i furgoni**.
Slug preparato: `fiera-san-faustino-brescia-posteggi-accessi-furgoni`.
Ricerca: 25 ottobre 2026. Nessun INSERT in `blog_posts`, nessun ID assegnato.

## Blocco della pubblicazione

La promessa della mappa dei posteggi e dei percorsi autorizzati dei furgoni
non è sostenibile con i documenti attualmente consultabili. L'utente richiede
espressamente di fermare la pubblicazione in questa situazione.

- Vecchia pagina comunale edizione 2026: HTTP410 nella verifica diretta.
  https://www.comune.brescia.it/aree-tematiche/fiere-e-mercati/fiera-ss-faustino-e-giovita-2026
- Planimetria ufficiale 2026: HTTP410 sia tramite fetch diretto sia tramite
  lettore web. I risultati indicizzati ne conservano titolo e testo; questa
  copia indicizzata non prova la disponibilità del PDF né la validità futura.
  https://www.comune.brescia.it/sites/default/files/2026-02/Planimetria%20generale%20ed.%202026.pdf
- Anche il vecchio PDF graduatoria definitiva 2026 restituisce HTTP410.
  https://www.comune.brescia.it/sites/default/files/2026-01/Graduatoria%20definitiva%20Fiera%20SS.%20Faustino%20e%20Giovita%202026.pdf
- Nuova pagina documenti, aggiornata 21/09/2026: HTTP200, ma soltanto guida
  alla domanda e disposizione GPL; nessuna planimetria o percorso dei furgoni.
  https://www.comune.brescia.it/it/documenti_pubblici/documenti-relativi-a-servizio-partecipazione-alla-fiera-ss-faustino-e-giovita
- Ricerca interna del nuovo Comune via endpoint AJAX: controllate notizie,
  pagine, moduli, servizi e tre pagine di risultati amministrazione per
  «faustino». Non rintracciata una planimetria sostitutiva.
- Notizia comunale del 15/10/2026, aggiornata 23/10/2026, HTTP200:
  estensione ZTL via San Faustino fino a Porta Pile e trasferimento del
  controllo elettronico, attuazione prevista gennaio2027. Quindi i percorsi
  del2026 non possono diventare istruzioni del2027 per supposizione.
  https://www.comune.brescia.it/it/news/6487895

## Informazioni confermate e limiti

Scheda comunale corrente, aggiornata 28/08/2026, HTTP200:
https://www.comune.brescia.it/it/servizi/partecipazione-alla-fiera-dei-ss-faustino-e-giovita

Fiera15febbraio; organico602posteggi,5agricoli; domanda annuale entro17dicembre
tramite Impresainungiorno, dati bollo16euro; licenza commercio aree pubbliche;
graduatoria per presenze e anzianità registro imprese; ingresso01:00–05:00
esibendo concessione. CUP dovuto, importo totale non indicato nella scheda.
Nessuna affluenza, tariffa, dimensione standard o disponibilità inventata.
Non dichiarata verificata l'apertura effettiva della pratica2027 sul portale.
Ambito: esclusivamente Comune di Brescia, Lombardia.

Anti-doppioni: elenco live110articoli, nessun titolo/slug dedicato a
San Faustino o Brescia. Nessun articolo precedente modificato.

## Materiali pronti

HTML e JSON nella stessa directory sono **bozza editoriale non pubblicata**.
Sei sezioni, paragrafi brevi, grassetti e due soli banner già esistenti:
fiere `/fiere` in mezzo e annunci `/annunci` in chiusura. Nessuna modifica UI.

Copertina originale: `images/blog/fiera-san-faustino-brescia-posteggi-accessi-furgoni.webp`.
Illustrazione IA dichiarata, non foto documentaria o mappa. Generata con
imagegen integrato; prompt integrale, originale e prove fuori repo in
`Documents/articoli-subingresso/fiera-san-faustino-brescia-posteggi-accessi-furgoni/`.

Prima della pubblicazione: ottenere una mappa primaria consultabile con
posteggi numerati e istruzioni effettive di accesso per l'edizione pertinente,
completare queste sezioni e ripetere verifica fonti/anteprima. Nessun contatto
a persone o organizzatori effettuato.

Backup preventivo remoto verificato:
`backup/session-20261025-103434-articolo-san-faustino-brescia` su `fa4bed8`.
Errore noto cleanup helper; push del backup riuscito, non ripetuto.

Search Console e verifica della sola copertina: esito corrente nel registro.
Nessun articolo pubblicato, dunque nessun nuovo URL blog in sitemap e nessuna
richiesta d'indicizzazione da dichiarare inviata.

Anteprima verificata:667parole visibili incluse promozioni e nota fonti;
sei sezioni; due link comunali e due destinazioni CTA HTTP200. SEO renderizzato
con titolo, descrizione, canonical e NewsArticle coerenti, ma nessun rilascio
dell'articolo. Chromium1440/768/320, WebKit390 e lettura senzaJS passati:
copertina1600×900, nessun overflow o errore pagina, due CTA effettive aperte.
Prima prova fermata da un'intercettazione del test che restituiva JSON al
redirect pubblicitario; corretta consentendo il percorso `preview=1`, quindi
ripetuta con esito positivo. Scritture Supabase di tracking intercettate;
nessun dato reale di prova. Nessun cambiamento al codice del sito.

Accesso Search Console effettivamente controllato: schermata loginGoogle,
nessuna credenziale Google pertinente o sessione browser debug disponibile.
Ricerca plugin aggiornata: Windsor.ai propone lettura Search Console, nessun
invio d'indicizzazione descritto. Non installato. Anche con accesso disponibile,
questa bozza non pubblicata non avrebbe un URL da inviare.
