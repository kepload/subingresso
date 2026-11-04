
## Ricerca approfondita Como — 14 ottobre 2026

83 manifestazioni in 31 comuni, rispetto alle 16 precedenti. Ricerca nominale
nei 147 comuni attuali: le 148 chiavi dell’anagrafica includono Ronago e
Uggiate-Trevano, accorpati nell’audit a Uggiate con Ronago. La scheda usa la
chiave geografica storica Uggiate-Trevano, conservando le coordinate nazionali.
Dati, copertura, esclusioni, fonti e hash in `fiere-como.json`; archivio locale
`C:\Users\utente\Documents\ricerca-fiere-como-20261014`.

Confrontate tutte le 65 righe CO/2026 del registro Lombardia hs8z-dcey,
scaricati e letti i 65 programmi, tutti con testo estraibile. Verificati
registro fiere locali (nessuna riga CO), 14 righe fieristiche 2026, calendari
comunali e turistici, organizzatori, bandi e moduli; 389 recuperi HTTP di
pagine/documenti, 365 con risposta 200, che da sola non prova contenuto utile.
Il programma grafico Masigott è stato letto visivamente; bandi Cantù scaricati
dal browser tramite `PLAYWRIGHT_MODULE`. 74 schede hanno almeno una data
precisa, incluse nove con solo storico 2025; cinque hanno periodi, due edizioni
testuali e tre sole ricorrenze. Questi conteggi possono sovrapporsi. Contatti
in 32 schede e 11 termini assoluti; solo Uggiate ha un termine futuro.

Fonti operative e correzioni:

- [Uggiate con Ronago](https://comune.uggiateconronago.co.it/notizie/3659763/mercatino-natale-2026-aperte-adesioni):
  13 dicembre, termine 27 novembre; 50 postazioni dichiarate 3×3 m, non
  disponibilità residua. PDF via email al protocollo, PagoPA, hobbisti 10 €,
  espositori 20 €, associazioni gratuite. Il modulo contiene importi in lettere
  discordanti e una dichiarazione che non contempla chiaramente P.IVA:
  entrambi i limiti sono nella scheda. Rinvio al 20 dicembre solo per maltempo.
- [Cantù, bandi 2026](https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html):
  Crocifisso 18 ottobre, termine 19 agosto; Santi 30 ottobre–2 novembre,
  termine 30 settembre e un posteggio dolciumi in piazzale XXVI Aprile.
  Spunta delle fiere la mattina in ordine di arrivo, senza garanzia. Requisiti
  e bollo distinti dai costi dello spettacolo viaggiante. Apollonia, San Rocco,
  Sant’Antonio, Giubiana e Santa Rita mantengono i propri termini trascorsi.
- [Anzano San Michele](https://www.procedimenti.servizirl.it/sagre/public/programma/26229):
  bancarelle il 27 settembre; il 26 solo danza e gastronomia.
  [Alzate](https://www.procedimenti.servizirl.it/sagre/public/programma/26997):
  commercio 5–8 settembre; moduli zootecnici non trasferiti agli ambulanti.
  [Griante](https://www.procedimenti.servizirl.it/sagre/public/programma/23964):
  manifesto conferma lunedì 16 novembre, 8–16, alimentare e non alimentare.
- [MOMA](https://www.mostrartigianato.com/): 24–25 e 30 ottobre–1 novembre,
  senza giorni intermedi. Selezione espositori e preventivo; ingresso gratuito
  per il pubblico non significa stand gratuito. Como Fun primavera segue AEFI
  18–19 aprile, rispetto al dato regionale 28–29 marzo. Saloni distinti dalle
  concessioni ambulanti e senza spunta automatica.
- [Cernobbio](https://www.comune.cernobbio.co.it/vivere_il_comune/eventi/evento_524.html):
  Lombardia Eventi in 13 giornate, I Bélee in otto; Asso Promo Arte, Campagna
  Amica e Giochi dei nonni hanno invece solo calendario 2025, anche se le
  pagine sono state aggiornate nel 2026. Rassegne hobbistiche, profili da verificare.
- [Domaso](https://www.northlakecomo.net/1340-Eventi-Tradizionale-mercatino-estivo-serale-a-Domaso):
  giovedì estivi, 20 agosto annullato. [Dongo](https://www.northlakecomo.net/1372-Eventi-Mercatino-estivo-a-Dongo):
  mercoledì e tre giornate straordinarie 24–26 luglio. Periodi delle ricorrenze
  mantenuti come tali, senza generare date dal giorno settimanale.
- [Mozzate](https://www.comune.mozzate.co.it/novita/notizie/novita_177.html):
  autori 18 ottobre, termine 9 ottobre trascorso; rinvio al 25 solo per maltempo.
  [Masigott](https://www.comune.erba.co.it/it/eventi/729146): programma 15–18
  ottobre rispetto al 19 regionale; presenza agricoltori solo domenica 18,
  senza inventare giorni dei banchi o ammissioni professionali.
- [Villa Guardia](https://comune.villaguardia.co.it/it/eventi/l-isola-che-c-e):
  L’Isola che c’è 19–20 settembre, fonte comunale e aree/espositori documentati
  dal sito organizzatore; iscrizione volontari distinta dalle candidature stand.

Ricerca documentale nelle fonti accessibili, non censimento esaustivo né
verifica di disponibilità. Como: recuperati calendari maggio–agosto;
avviso casette 2025 con opzione 2026 non conferma un nuovo mercatino.
Menaggio ha estremi discordanti e resta testuale. Natale Carimate, Villa
Guardia, Fino Mornasco, Pianello, Nesso e Faggeto conservano solo il 2025;
Asso 5 dicembre e Sormano 7 dicembre usano le nuove fonti 2026. Gite fuori
provincia, omonimi, spettacoli senza mercato, pasti organizzativi e sagre
senza opportunità commerciale documentata esclusi. Rovello Porro ha solo
segnalazione AI non corroborata; Turate restituisce 410 sulla pagina 2026;
Appiano, Gravedona e altre segnalazioni prive di riscontri sufficienti restano
nell’audit. Nessuna domanda, messaggio o email inviati a terzi.

Validazione locale: build, settori, regressioni dati e calendario in Chromium
1440/820/390/320 e WebKit 390 passati. Dieci schede operative su computer e
telefono senza errori o overflow. Conservati tutti i 16 ID di Como e le altre
2.853 schede, identiche. Commit `68c72cd`: Vercel riuscito, 2.936 schede
online di cui 83 di Como; SHA-256 del catalogo online identico al commit
(`f32b9f301390c525ccddd49865baa3e34427c56881cd941bcb1590098e7c3208`).
Verificati in produzione dieci dettagli a 1440 e 390 pixel, tutti i settori,
elenco completo e assenza di errori/overflow. TO DO spuntata solo dopo questi
riscontri: 19 province completate, 91 rimaste su 110. Nessun’altra provincia
avviata e nessuna comunicazione a terzi.
