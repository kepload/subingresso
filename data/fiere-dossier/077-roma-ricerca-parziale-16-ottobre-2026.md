
## Roma — ricerca parziale, 16 ottobre 2026

**Provincia non completata e da non spuntare.** Ricerca nominale nei 121 comuni,
confronto integrale delle 31 righe del registro fieristico Lazio del 9 ottobre
2026: quattro fuori provincia ignorate, due rassegne ripetute raggruppate.
Integrate **99 manifestazioni in 43 comuni**, prima tre; 51 con recapiti,
11 con termine documentato, sette con sintesi dei costi. Il termine di Blue
Planet è della selezione camerale, non della generalità degli espositori.
Le tre identità iniziali e tutte le altre **3.873 schede** sono conservate.
Totale nazionale **3.972**; cache JS **49**, catalogo **40**.

Audit in `fiere-roma.json`: copertura per comune, ricevute HTTP/hash distinte
dalla verifica del contenuto, decisioni sul registro, esclusioni e limiti.
Archivio esterno: `Documents/ricerca-fiere-roma-20261016`; 235 download, inclusi
riscontri di contesto non usati nel catalogo. Nessun testo integrale delle
fonti o documento di terzi aggiunto al repository. Le ricerche nominali non
equivalgono all'accesso completo agli archivi comunali né provano l'assenza
di altre fiere. Fonte regionale dei saloni distinta dalle fiere di strada.

Informazioni operative verificate:

- **Castel San Pietro Romano Natale**: 13/20/27 dicembre, domanda **15 novembre**
  via modulo/email alla Pro Loco; artigianato **50 €/giorno**, gastronomia
  **70 €/giorno**, casetta montata ed energia fornite; IVA non specificata.
- **Segni**: fiera ambulante **24–25 ottobre**, sagra generale 22–25; domanda
  **9 ottobre ore 24**, già scaduta. Non alimentari **35 €**, alimentari
  artigianali **66 €**, stand gastronomici **300 €**, area food **165 €**,
  più suolo quando dovuto; altre tipologie distinte. Disciplinare con refuso
  2025 nell'art. 5, resto del documento e pagina 2026.
- **Bajocco Albano**: 11–13 settembre, quota **130 € + IVA** per tre giornate;
  il **1 settembre è saldo bonifico**, non domanda. Foto e selezione manufatti,
  gazebo/tavolo massimo 3 m, illuminazione propria e smontaggio ogni sera.
- **Grottaferrata**: 21–29 marzo; interno A 9 m² **1.134 € nuovi / 1.026 €**
  clienti 2025, più iscrizione **200 €**, IVA esclusa. Totali calcolati
  **1.334/1.226 € + IVA**; altre superfici/aree e food truck distinti.
  Tavole grafiche del listino lette visivamente; preadesione non vincolante.
- **Montelibretti**: San Nicola 10 maggio, domanda 24 aprile ore 12;
  Carmine 11 ottobre, storici 23 settembre ore 10 e nuovi 29 settembre ore 10.
  Termini scaduti. Spunta **80 € omnicomprensivi** in entrambe; maggio
  prenotati **30 € + 0,60 €/m² + 0,055 €/m² TARI**. Ottobre 30 € riservati
  alla categoria indicata nel bando, non tariffa universale.
- **Tivoli** 19 marzo, domanda 5 febbraio, scelta posteggi 2–6 marzo distinta;
  **Velletri Madonna delle Grazie** 3 maggio, spunta richiesta entro 3 aprile;
  **Pentecoste Valmontone** 24 maggio, richiesta entro 31 marzo.
- **Nettuno**: 2–3 e 9–10 maggio, non tutto il periodo; **Castel Gandolfo**
  mercatino lungolago 20–25 luglio, escluso il 26 della festa. Anzio raggruppa
  appuntamenti per rassegna/organizzatore, senza creare mercati giornalieri fittizi.
- **Maker Faire**: 23–25 ottobre da CCIAA, supera 17–19 nel registro;
  **Landriana primavera** 28–29 marzo, supera 27–29 regionale. **Blue Planet**
  Darsena di Fiumicino dalla CCIAA, non vecchia sede Fiera Roma.
- **Roma Natale I Municipio**: quattro aree con periodi del bando pluriennale,
  titolo annuale e aperture da confermare; nessuna candidatura dei singoli banchi
  dedotta dall'affidamento ai gestori. VGMT nella nuova sede Forte Trionfale.

**Da completare prima di chiudere la provincia:** calendari commerciali finali
dei Municipi di Roma, programma commerciale Befana distinto dalle iniziative
culturali; atti correnti Vicovaro; due formule/sedi Lariano e programmi commerciali
Tolfa/Cave. Approfondire inoltre le piste di Anguillara, Cerveteri, Montelanico,
Monterotondo, Palombara e gli altri candidati registrati nell'audit. Alcuni siti
restituiscono archivi vecchi, contenuti vuoti o soft 404: Ladispoli bando è 404
anche in Chromium; Trevignano superata la verifica browser e letto integralmente.
Allumiere: riepilogo settembre contro testo ottobre, conflitto visibile in scheda.
Carpineto e Santa Lucia Bracciano restano storici 2025; ricorrenze senza edizione
non proiettate sul 2026. Quote mancanti non gratuite, nessun posto garantito.

Build, settori e suite generale passati sui cinque formati/browser previsti.
Test dedicato `scripts/test-fiere-roma.cjs` passato localmente e in produzione
con `PLAYWRIGHT_MODULE`: computer/telefono Chromium e telefono WebKit, 99 risultati,
mappa e dodici dettagli operativi. Commit dati **1429fa3**, Vercel riuscito;
catalogo, JS e pagina online identici ai file del commit (confronto su `git show`,
non sulle terminazioni CRLF del checkout Windows). Verifica conclusa entro dieci
minuti dal push. Registro e immagini dei test nell'archivio esterno.
TO DO registrata dopo la verifica nel documento unificato
`Subingresso.it informazioni.md`: Roma non spuntata, **28 completate e 82 rimaste**.
L'unificazione concorrente `c69b400` è stata preservata; il vecchio file TO DO
resta il rinvio al documento unico. Nessun cambiamento estraneo incluso nei commit.
Nessun messaggio, email, modulo, candidatura o pagamento inviato a terzi.
