
## Genova — ricerca documentale conclusa e verificata online, 20 ottobre 2026

Ripresa dal checkpoint `1ff71ed`, da questo registro e dalle **211 schede**
già pubblicate: nessun audit provinciale Genova preesistente. Conservati
ricerca, originali e backup della sessione interrotta, senza ripeterli.
Risultato: **274 manifestazioni in 47 comuni**, copertura nominativa di
tutti i **67 comuni**. **64 nuove schede, un doppione unificato**, incremento
netto63; le altre **4.829 schede** sono identiche. Catalogo totale **5.103**.

Audit: `data/fiere-genova.json`: **655 ricevute** con URL/esito/SHA256,
**384 righe** fieristiche regionali confrontate, **58 righe** di mercati
periodici esaminate (31 specialistiche incluse,27 ordinarie escluse),
18 gruppi di esclusioni, copertura comunale e15 limiti dichiarati.
**240 schede con edizioni datate**, compresi periodi complessivi;
**225 con almeno un’edizione non marcata come periodo**. Ricorrenze non espanse;
Lavagna Carmine e Zoagli Natale mantengono soltanto l’edizione **2025**.
**18 sintesi costo**, di cui17 conservate dagli overlay precedenti e
una nuova Campomorone; nessun biglietto visitatore scambiato per quota stand.

Originali, allegati PDF, locandine, ricevute e prove fuori dal repository:
`C:\Users\utente\Documents\ricerca-fiere-genova-20261019`.
Consultati registri Liguria, Comuni/SUAP, avvisi e albi raggiungibili,
Città Metropolitana, portali turistici, associazioni e organizzatori.
Lettura dei documenti originali, estrazione PDF e controllo visivo delle
tavole pertinenti; non lettura integrale di ogni albo né censimento esaustivo.
Nessuna comunicazione, candidatura, domanda o email a terzi.

Riscontri principali e loro conseguenze:

- **Genova:** [calendario comunale2026 e aggiornamento30marzo](https://www.comune.genova.it/novita/avvisi/calendario-fiere-2026),21 fiere.
  Libro Primavera **9aprile–3maggio**; Carnevale **21–22febbraio**.
  Natale/Libro Invernale: termine speciale **2ottobre23:59**, già passato;
  OPI **8–24dicembre**, domanda **8ottobre23:59**, già passata, categorie
  ammesse distinte dai normali ambulanti. Termini generali30giorni indicati
  come calcolo dalla regola, senza presentarli come nuove date di bando.
  [Choco Moments originale](https://www.chocomoments.it/festa-del-cioccolato-genova/)
  conferma **19–22febbraio**, compreso il programma del giovedì19.
- **Rapallo:** [organizzatore Chocomoments](https://www.chocomoments.it/festa-del-cioccolato-rapallo/),
  **23–25ottobre**, lungomare10–20, riscontrato nell’atto325/2026.
  Blocchi iniziali403/428 superati nel browser; scaricato realmente il
  regolamento437/**2010**, non un tariffario2026. Schede degli atti originali
  leggibili nei metadati ma senza allegati: nessuna condizione inventata.
- **Campomorone:** [modulo comunale](https://www.comune.campomorone.ge.it/novita/notizie/novita_239.html),
  Immacolata/Natale è **un solo appuntamento6dicembre**, non due fiere.
  Domande28settembre–**30ottobre**, singoli **20€**, associazioni gratuite;
  eventuale bollo16€ del tesserino separato. Originale PDF recuperato.
- **Recco:** [San Giovanni](https://www.comune.recco.ge.it/novita/comunicati_stampa/novita_2032.html)
  **24giugno**,24posteggi,11alla spunta, nessuna domanda preventiva.
  [Suffragio](https://www.comune.recco.ge.it/novita/notizie/novita_2052.html)
  **7–8settembre**, chiusura all’una del9, non tre giornate piene;
  professionali, esclusioni OPI/hobbisti e limiti alimentari espliciti.
  Focaccette6–12aprile resta periodo complessivo, non apertura quotidiana.
- **Lavagna:** Agricoltura1marzo/termine13febbraio; San Simone28ottobre/
  termine**9ottobre**, già passato. Documenti, PEC ed estintore dall’avviso.
  **Bogliasco:** calendario originale recuperato tramite download JavaScript;
  festival artigiani17–19luglio, Natale**13dicembre**, non8dicembre.
- **Santo Stefano d’Aveto:** Maddalena**30agosto**, non6settembre;
  fine widget2settembre riferita al mercato settimanale. **Montoggio:**
  Caccia**3–5luglio**, originale FIDC. **Torriglia:** ordinanze5luglio/
  11ottobre non trasformate in orari commerciali. Mele Comics17maggio,
  Favale Mestieri6settembre, Mezzanego Angeli10–11ottobre, Fontanarossa
 16–17/23–24maggio e Savignone19luglio riscontrati su originali.
- **Expo:** solo sedi effettive Rovegno, Casella, Genova Valpolcevera,
  San Colombano Certenoli e Rossiglione; programmi metropolitani letti,
  comuni aderenti non duplicati come sedi commerciali.

Limiti documentali esauriti nelle fonti accessibili: date contraddittorie
di maggio a Ne; inizio natalizio Zoagli2026 corrotto nel registro, mantenuto
solo2025; tariffa categoria2 Genova3,95/3,90 non arbitrariamente risolta;
atti Rapallo senza allegati pubblicati; bandi gestori Santa Margherita non
equivalenti a domande individuali o al calendario2027. Natale Santa Margherita
resta periodo regionale, non programma2025 proiettato. Sestri Pane e Olio
di ottobre distinto da un’idea natalizia comunale priva di data certa.
Fonti secondarie per alcune iniziative Montoggio/Uscio/Sestri/Neirone
dichiarate; Uscio originale leggibile via ricerca, download diretto403,
Chiavari vecchio avviso410 sostituito con graduatorie originali accessibili.
Tentativi reali, alternative e motivi di esclusione nell’audit; nessuna pista
documentale accessibile lasciata aperta. Chiusura della ricerca corrente
distinta dalle future verifiche periodiche di bandi, tariffe e calendari.

Riproduzione: `python scripts/build-fiere.py`; test provinciale
`scripts/test-fiere-genova.cjs` con `PLAYWRIGHT_MODULE` obbligatorio,
`FIERE_GE_BASE_URL` per il sito pubblico e `FIERE_GE_OUT` per le prove.
Cache calendario JS89/JSON61. Pubblicato **`2ce007f`**, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/976M76U7UWbNVZj21LjGjtuc5Fmu); quattro asset identici al commit,
**274 pagine HTTP200 con H1/canonical corretti**, catalogo5.103.
Suite Genova locale/online Chromium1440/320 e WebKit390 passata:274schede,
mappa,26dialog e quattro pagine senza JavaScript per formato. Build, settori,
5.103pagine/2.148sitemap e suite generale cinque formati passati.
Originali/ricevute SHA256 verificati; copia conservativa
`ricerche-fiere-20261020-004207`: **40.214 file**, zero errori,
manifest SHA256 verificato; prove finali in supplemento separato.
TO DO spuntata soltanto dopo verifica: **40 province concluse,70 da fare**.
Ricerca corrente chiusa con i limiti sopra; manutenzione futura distinta.
