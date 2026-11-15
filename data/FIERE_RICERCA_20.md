# Ricerca operativa delle fiere, in gruppi da 20

Metodo richiesto dall'utente il **15 novembre 2026** per questa ricerca e le
future sessioni. Non riattiva i precedenti cicli provinciali o altre automazioni.

## Perimetro e continuità

- Ogni sessione controlla **20 fiere identificate prima dell'avvio**, con gli ID
  effettivi di `data/fiere.json`. Un evento con più date resta una sola fiera.
- Prima di scegliere il gruppo leggere
  `.local/ricerche/fiere-20/registro.json`: evitare gli ID già assegnati o
  controllati, salvo richiesta di riesame. Lo stato aggiornato di ciascuna
  sessione è nel suo `stato.json`; il registro comune riporta l'ultima verifica
  del coordinatore. Registrare anche risultati incompleti. Scelta delle fiere
  conforme alle indicazioni correnti dell'utente; i gruppi di prova non sono
  campioni statisticamente rappresentativi.
- Assegnazioni disgiunte e una cartella privata esclusiva per sessione:
  `.local/ricerche/fiere-20/<gruppo>/<sessione>/`. Nessuna sostituzione silenziosa
  delle fiere più difficili con altre più facili.
- L'autorizzazione alla ricerca comprende dossier e prove locali; **non**
  comprende aggiornamento del catalogo, build, importazioni, database, sito,
  deploy, contatti a terzi o invio di domande. Eventuali integrazioni sono
  un incarico distinto. Il coordinatore può aggiornare la memoria documentale.
- Ogni nuovo gruppo richiede una nuova richiesta dell'utente. Niente loop,
  rinnovi automatici, nuove sessioni aggiuntive o riprese dalle vecchie quote.

## Cinque informazioni da verificare

1. **Categorie ammesse:** ambulanti professionali, artigiani, produttori,
   hobbisti, OPI/creatori, associazioni; requisiti, selezione e aree separate.
2. **Composizione effettiva:** numeri documentati di partecipanti per categoria,
   distinguendoli da capienza, posti previsti e massimo di hobbisti ammessi.
3. **Accesso al posteggio:** concessione specifica, assegnazione per edizione,
   domanda/graduatoria o ammissione dell'organizzatore. Distinguere il titolo
   per esercitare dalla concessione del singolo posteggio. Le modalità possono
   coesistere nella stessa fiera o cambiare fra aree.
4. **Spunta:** prevista, esclusa o non verificata; domanda preventiva e relativo
   termine, titoli richiesti, graduatoria, luogo e orario, se documentati.
   Ammissione alla procedura e disponibilità effettiva del posto sono distinte.
5. **Costo:** categoria e area, dimensioni, durata, quota/canone, IVA, bollo,
   diritti e servizi obbligatori separati. Un costo parziale non è il totale;
   la tariffa dell'hobbista non è quella dell'ambulante. Niente importi calcolati
   usando dimensioni o condizioni ipotetiche, né prezzo del biglietto visitatore.

## Fonti e procedura

- Partire dalla scheda e dalle prove già raccolte, poi recuperare le fonti
  pubbliche aggiornate. Una nota precedente è una pista, non una nuova verifica.
- Preferire Comune/SUAP/Polizia locale e organizzatore competente: bandi,
  regolamenti, moduli, disposizioni, graduatorie, planimetrie e tariffari.
  Calendari turistici, stampa, social e testimonianze servono come piste;
  eventuali dichiarazioni restano attribuite, senza trasformarle in conferme.
- Cercare anche: posteggi temporaneamente liberi, assegnazione giornaliera,
  concessione, subingresso, operatori non professionali, hobbisti, OPI.
- Raggruppare le letture per autorità/documento comune, verificando che ogni
  fiera e ogni area rientrino davvero nell'ambito del documento. Non trasferire
  le regole a tutti gli eventi dello stesso Comune o organizzatore.
- Leggere anno e oggetto dentro i documenti. Controllare rettifiche e disposizioni
  successive; un dato storico non conferma l'edizione successiva. Un regolamento
  generale utilizzabile va distinto dall'avviso specifico dell'edizione.
- Per PDF scansionati e tabelle verificare visivamente anche intestazioni,
  colonne, note e unità. Non trattare errori OCR o snippet di ricerca come prove.
- Per ogni affermazione salvare URL, ente, titolo, data di consultazione,
  edizione/area interessata, passaggio pertinente e pagina/articolo/paragrafo.
  Conservare una copia del documento o un estratto fedele, quando recuperabile;
  indicare esplicitamente copie non disponibili, errori e accessi falliti.
- Un secondo controllo confronta affermazione e prova. Registrare le ricerche
  mirate senza esito. Per una fiera irrisolta consultare la fonte iniziale e
  provare almeno due ricerche complementari, senza inventare una risposta.

## Regole di conferma

- Stati per ciascuno dei cinque campi: `confermato`, `parziale`,
  `non_verificato`, `contraddittorio`, `storico`. Il valore negativo deve avere
  una prova esplicita, come quello positivo.
- **Non trovato non significa no.** Nessuna menzione della spunta non prova
  che sia vietata; nessuna menzione degli hobbisti non prova che siano esclusi.
- Hobbisti ammessi non significa maggioranza di hobbisti; posti in concessione
  non significa spunta esclusa; quota pagata non significa posto garantito.
- Non classificare una fiera come seria, scadente o redditizia sulla base di
  prezzo, nome, foto, anzianità o assenza/presenza di hobbisti. Nessun punteggio
  sintetico o stima di affluenza, vendite, guadagni o probabilità di posto.
- Distinguere regole ufficiali, composizione realmente documentata e dichiarazioni
  dell'organizzatore. "Misto" può indicare alimentare/non alimentare: non usarlo
  automaticamente per descrivere professionisti/hobbisti.
- Il criterio è pubblicare eventualmente solo affermazioni documentate, non
  promettere copertura completa o certezza commerciale al 100%.

## Consegna di ciascuna sessione

- `assegnazione.json`: venti ID e snapshot delle sole schede assegnate, immutabile.
- `risultati.json`: venti record con `eventId`, `name`, `city`, `province`,
  `edition`, `areasReviewed`, `checkedAt`, `fields`, `sources`, `searches`,
  `limitations`. I cinque oggetti in `fields` sono `eligibility`, `composition`,
  `access`, `spunta`, `costs`; ognuno ha `status`, `value`, `sourceRefs`, `scope`
  e `limitations`. `sources` usa ID locali univoci e URL, ente/titolo, data,
  passaggio, localizzatore e percorso della prova, se salvata.
- `rapporto.md`: tabella delle venti fiere e schede documentali leggibili,
  conferme e lacune, errori/contrasti, conteggi per campo e tempo impiegato.
- `stato.json`: stato, ID controllati, numero completati e blocchi; aggiornare
  progressivamente. `completato` significa venti fiere controllate e documentate,
  anche con campi irrisolti; non significa venti schede interamente confermate.
- Cartella `prove/` riservata alla propria sessione. Nessun dato personale da
  graduatorie da copiare nel rapporto: bastano regole e conteggi pertinenti.
- Prima della chiusura verificare 20 ID univoci, cinque campi per record,
  riferimenti validi, prova di ogni sì/no e nessun trasferimento di anno/area.
  Il coordinatore verifica inoltre separazione dei gruppi e integrità del sito.

Registro e stato effettivo sono privati sotto `.local/ricerche/fiere-20/`;
non inserire i dossier nel catalogo finché l'utente non lo richiede.
