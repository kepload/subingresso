
## Fermo — ricerca documentale del 25 ottobre 2026

Ricerca documentale accessibile attuale conclusa con limiti espliciti: **86
manifestazioni in 31 comuni**, ricognizione nominale dei **40 comuni provinciali**.
Riprese le 23 schede pubblicate, senza audit autonomo al checkpoint `2fb6934`:
**23 ID conservati, 63 aggiunte, 7.104 schede esterne identiche**. Catalogo
risultante **7.190 schede**, **6.989 con dati edizione**. Nessun’altra provincia lavorata; nessun contatto,
invio o candidatura a terzi.

Audit `data/fiere-fermo.json`: **45 righe** regionali fiere riconciliate in 44
schede (due righe Campofilone conservate nello stesso ID), **60 righe** mercati
ordinari vagliate e separate dalle rassegne tematiche, **una riga specializzata**
ABC. **858 ricevute tecniche**, **16 gruppi di piste chiuse**, **13 esclusioni**
e **25 limiti**: acquisizioni e tentativi, non 858 documenti letti integralmente.
95 righe turistiche Fermo riconciliate con pagine originali e pieghevoli;
67 righe Porto Sant’Elpidio raggruppate senza moltiplicare le manifestazioni.
Nove comuni senza scheda non sono dichiarati privi di eventi. Non dichiarata
lettura integrale degli albi storici. Nuove edizioni e documenti non pubblicati
restano manutenzione futura distinta dalla ricerca corrente conclusa.

**Pubblicata e verificata online:** dati `cef401b`, deploy `21f5dff`, Vercel
riuscito. Cinque asset identici ai blob Git e **86 pagine HTTP200** con H1,
canonical, note e costi corretti, verifica completata in **33 secondi**. Test
provinciale passato anche online nei tre formati con tutti gli 86 dialoghi;
sito reale con script/icone attivi, metodo di scrittura bloccato per evitare
dati di prova, verificato nei tre formati. TO DO spuntata dopo queste verifiche:
**65 province concluse, 45 rimanenti su 110**. Nessun altro lavoro avviato.

Verifiche locali passate sul catalogo finale: isolamento dei 23 ID e delle 7.104
schede esterne, settori, **7.190 pagine/3.124 voci sitemap**, suite generale in
cinque formati. Test provinciale con `PLAYWRIGHT_MODULE`: Chromium 1440/320 e
WebKit 390, elenco/mappa e tutti gli 86 dialoghi per formato, otto pagine senza
JavaScript per formato. Controlli specifici su giorni dei banchi, storico, fonti,
quote e termini; gitleaks passato senza bypass. Cache JS118/JSON86.

Elementi operativi e limiti principali:

- Amandola Diamanti a Tavola: modulo originale 2026 recuperato anche dal
  pulsante comunale tramite `PLAYWRIGHT_MODULE`. Banchi solo **31 ottobre,
  1, 7 e 8 novembre**, domanda/pagamento **28 ottobre**. Quote **50–200 €**
  secondo categoria e giorni; zero euro soltanto per artigiani/hobbisti in
  specifiche vie, non per tutta la mostra. Tesserino e prodotti ammessi espliciti.
- Montefalcone Sapori: regolamento originale, due giorni obbligatori,
  **40–80 € per il fine settimana** secondo settore e metratura. Allaccio incluso,
  attrezzature escluse, IVA non precisata. Veregra: bando originale di sei pagine
  letto con OCR/confronto visivo; Children **14–16 giugno, 150 € + IVA**,
  Festival **18–21 giugno, 600 € + IVA**, pacchetto **700 € + IVA**. Termini scaduti.
- San Crispino: avviso comunale, spunta **25 ottobre 7:45**, **150 €**, truck
  alimentari **200 €**; otto posti sono snapshot del 22 ottobre. Porto San Giorgio
  Autunno **22 novembre**, spunta **7**, documenti entro **18 novembre**;
  pagamento prorogato al 31 ottobre con refuso 2025, distinto dalla domanda.
- Fermo Forum: Elettronica, Tipicità, ABC, Esotika. Tipicità **12–14 marzo 2027**,
  candidatura entro **31 gennaio**, stand **700/1.500 € + IVA 22%** per il 2027,
  non il 2026. ABC **23–24 marzo 2027**, fiera professionale; Esotika preventivo
  personalizzato, nessuna quota universale. Sei sintesi di costo provinciali.
- Regolamento Fermo e programmi originali confrontati: Santa Maria e San Savino
  hanno orari/organici discordanti, non ricostruiti per ipotesi. Natale **8 dicembre
  8–20** nel programma annuale, registro 14–24 e regolamento 7–24 dichiarati.
  Termini del contributo distinti dalle domande. Arte e Sapori Lido **2 giugno**
  nel programma contro 6 nell’indice; adulti Antiquariato dalle 17, ore 14 solo
  bambini; Gran Bazar a Lido San Tommaso, metadato turistico diverso.
- San Serafino rinviato al **18 ottobre** da stampa locale, nuove istruzioni di
  spunta non recuperate; San Giuseppe con giorno discordante resta testuale.
  Falerone: graduatoria originale recuperata, notizie recenti **HTTP410** anche
  con URL alternativi e Chromium; nessun costo/orario inventato dagli snippet.
- Pedaso Mercatino Cozze: PDF originale quattro pagine, ordinanza settoriale 51,
  registro generale 61, **12–15 agosto 2026**; residui 2023/2025 dichiarati e orari
  della viabilità non usati come apertura dei banchi. Monte Rinaldo mercato solo
  **18 ottobre dalle 10**, festa 17–18: programma completo e locandina recuperati
  sulla stampa. Torre San Patrizio mercatino solo **8 novembre dalle 15**.
- Porto San Giorgio: Meraviglie solo **23 agosto dalle 16**, distinto dalla festa
  regionale di luglio. Botteghe Creative al Castello e Tesori in Strada lungomare
  nella Notte Rosa distinti per sede/durata. Merry Xmas e Tesori **20 dicembre
  2025**, Fermo Magica 2025/2026 e ultimo PSE 3 gennaio sono storici, non Natale 2026.
- Altidona Fornaciai: galleria comunale originale recuperata dal componente Vue,
  festa **24–26 luglio**. Mercatino sull’originale secondario letto via `web.open`
  dopo HTTP403 diretto, incluso come periodo per dettaglio giornaliero non uniforme.
  Quota e accesso espositori non recuperati; vecchia pagina specifica ancora 2023.
- Esclusi mercati ordinari, bambini/baratto, Soffitte private, mostre senza mercato,
  raccolte fondi e sagre senza prova di banchi esterni. Smerillo: locandina originale
  recuperata dall’endpoint pubblico, festa **18 ottobre**, nessun mercatino provato.
  Kodama senza fonte organizzatore recuperabile; vecchi Natali non proiettati.

Backup remoto verificato: tag `backup/session-20261025-151108-fiere-fermo`
e ramo `backup/pre-fiere-fermo-20261025`. Errore cleanup del helper successivo
al push distinto dal backup remoto riuscito. Originali e prove nel dossier privato
`Documents/ricerca-fiere-fermo-20261025`; nessun allegato nominativo di operatori
o credenziale copiato nel repository pubblico.
Backup separato del solo dossier Fermo, originali e prove, verificato SHA256:
`Documents/backup-subingresso/fermo-20261025-151338`, **2.964 file,
261.336.412 byte**, zero errori. Manifest
`f2397ffea0d4dc97cfc518051ff141bc4c4d8be676b68de007aa59e1872b3655`;
ricevuta `backup-verified.json` nel dossier privato. Nessun nuovo backup o
intervento sulle altre province.
