# Nuoro — ricerca finale del 6 novembre 2026

Stato: **ricerca pronta per integrazione**. Nessuna pubblicazione eseguita da
questa sessione. Baseline `e622823`: 10.266 schede e 477 note economiche.
Il delta propone **49 nuove schede in 38 comuni**, **due arricchimenti espliciti**
di schede esistenti e **sei note economiche**. Ricognizione nominale dei
**53 comuni attuali**, inclusi i 15 senza nuove schede. Ricerca documentale
con limiti, non censimento certificato né attestazione di assenza di eventi.

## Perimetro e conservazione

L'ambito è ricavato da `data/italia-province.json`, sezione
`sardiniaMunicipalities`, la stessa utilizzata dal builder. `comuni.json`
contiene ancora le attribuzioni provinciali sarde storiche e da solo non basta.
Seulo rientra in Nuoro; Seui e i 22 comuni dell'Ogliastra non vi rientrano.
San Teodoro appartiene alla Gallura Nord-Est Sardegna. Nessun loro record è
incluso nel delta. Il tentativo di acquisire il PDF regionale con l'elenco
provinciale ha avuto timeout: registrato fra i tentativi, non dichiarato letto.

Il catalogo principale e le note esistenti non sono stati modificati. Gli
arricchimenti di Aritzo e Tonara mantengono nome e ID; ciascuno comprende
record iniziale, sostituzione proposta, motivo e prova primaria. L'integrazione
deve applicarli soltanto se il record iniziale coincide ancora. Nessuna
cancellazione, rinomina, modifica delle recensioni o scrittura DB.

## Fonti e lettura

Eseguite query nominali per ogni comune, conservate nei file `nominali-*.json`.
Richieste le 53 pagine regionali: 51 risposte 200, Nuoro e Orosei 404,
queste ultime non usate come prove negative. Per Orosei sono disponibili il
programma e la mappa primari di Primavera 2026. Il manifest unificato contiene
187 URL con risposta 200, originali e SHA-256; comprende anche documenti
scartati e storici, non soltanto le fonti adottate.

L'[organizzatore ASPEN / Camera di Commercio](https://www.cuoredellasardegna.it/autunnoinbarbagia/it/index.html)
pubblica il calendario 2026. La [descrizione del circuito](https://www.cuoredellasardegna.it/autunnoinbarbagia/it/idea/index.html)
documenta le produzioni e l'acquisto nelle corti. Scaricati e letti i programmi
e le mappe collegati disponibili: **39 PDF di Autunno 2026**. Il programma
Bitti è una scansione con estrazione quasi vuota; la mappa 2026, leggibile,
documenta espressamente mercatino, vendita e prodotti. Per le tappe ancora
prive di programma collegato si adotta il calendario, senza inventare
programma operativo o disponibilità. Le descrizioni generali del circuito
non diventano un'autorizzazione a partecipare.

Ulteriori fonti primarie: pagine comunali e regionali, Distretto Rurale
Barbagia quale partner dell'evento di Sarule, regolamenti e modulistica.
Gli aggregatori servono per individuare piste e discrepanze; non sono le
fonti delle nuove schede. L'audit associa ogni scheda alle prove effettive.

## Date, omonimie e duplicati

- **Aritzo, 24–25 ottobre 2026:** la tappa coincide con la Sagra della
  Castagna e della Nocciola già presente. Arricchito il record esistente,
  senza creare una seconda scheda per lo stesso evento.
- **Tonara:** la Sagra del Torrone del **6 aprile 2026** è distinta dalla
  tappa autunnale del **10–11 ottobre**. L'arricchimento limita la prima ad
  aprile; il 9 ottobre è concerto, non apertura delle corti.
- **Oliena:** il programma definitivo inaugura le corti l'**11 settembre** e
  prosegue fino al **13**. Il 10 è convegno e mostre; la homepage riassume
  12–13, il titolo comunale 11–13 e il PDF dell'avviso 12–14. Conservato
  **11–13** dal programma delle corti, documentando il conflitto.
- **Dorgali e Orani:** programmi 25–27 settembre comprensivi di anticipazioni;
  il circuito delle corti apre il **26–27**. Queste sono le date delle schede.
- **Lollove:** frazione di **Nuoro**, con scheda distinta per Carreras de
  Lollobe del **10–11 ottobre**. Mastros in Nùgoro è il **14–15 novembre**.
- **Gadoni e Oniferi:** homepage ufficiale 2026 **28–29 novembre**, contro
  29–30 nelle pagine paese. Adottata la homepage; il programma dettagliato
  non era collegato. Non nascosta la discordanza.
- **Fonni:** **6–8 dicembre** dal calendario ufficiale consultato. Non adottata
  l'estensione 4–8 suggerita da aggregatori senza programma primario selezionato.
- **Carapigna di Aritzo:** il contenitore è 14–16 agosto; il testo comunale
  colloca la sagra con gli artigiani al **15 agosto 2026**, unica data adottata.
- **Shopping sotto le Stelle, Dorgali:** **8 e 13 dicembre 2025**, due edizioni
  giornaliere distinte, senza inventare un mercato continuativo 8–13.
- **Cosas Bonas de Silanos:** **14 dicembre 2025**, esplicitamente storico.
  Le otto schede con solo periodo regionale non ricevono edizioni 2026.

## Partecipazione e note economiche

Le sei note riguardano nuovi ID: nessuna sovrascrive una nota precedente.
Cinque sono riferite al 2026, una al 2025. Importi di visitatori, degustazioni,
navette e ingressi non sono quote per gli espositori.

| Manifestazione | Dato documentato | Limite |
|---|---|---|
| Nuoro, Mastros | 50 € per gli altri partecipanti; 100 € somministrazione; entrambi includono 30 € di segreteria | Su area pubblica si aggiunge CUP non quantificato; energia autonoma, eventuale cauzione mastelli separata |
| Lollove, Carreras | Stesse quote 50/100 €, comprendenti 30 € di segreteria | Procedura distinta, CUP aggiuntivo e termine 25 agosto 2026 già trascorso |
| Tiana | Residenti gratuiti; esterni in casa privata 50 €; esterni suolo pubblico 100 € fino a 30 m² per tutta la manifestazione | Accordi con privati e altri eventuali oneri non quantificati; ristoro riservato ai residenti |
| Ollolai | 30 € contributo; CUP 0,60 €/giorno al m² o lineare in Piazza Marconi/Via Mazzini, 0,57 € altrove, coefficiente 1 | Confermare unità e metri autorizzati; due giorni; nessun banco ipotetico calcolato |
| Olzai | Hobbisti/occasionali locali 25 €, esterni 50 €; ristoro locali 50 €, esterni non ammessi | Quote organizzative dopo accoglimento, non costo complessivo |
| Dorgali, Natale 2025 | 50 € diritti istruttoria SUAPE per i punti street food ammessi | Diritto amministrativo, non prezzo del banco, non trasferibile al 2026 |

Fonti economiche e operative:

- [Nuoro: riapertura delle sole adesioni in spazi privati e disciplinare 2026](https://www.comune.nuoro.it/it/novita/page/mastros-in-nugoro-2026-riapertura-dei-termini-per-le-domande-di-partecipazione-in-sede-privata).
  Suolo pubblico chiuso il 1° ottobre; riapertura privati conclusa il 21 ottobre
  alle 10. [Elenco ammessi](https://www.comune.nuoro.it/it/novita/page/autunno-in-barbagia-2026-mastros-in-nugoro-pubblicazione-dell-elenco-degli-ammessi)
  integrato il 4 novembre: non prova posti disponibili. Domande individuali
  online, anche se più soggetti condividono una corte.
- [Nuoro: delibera e disciplinari distinti di Lollove e Mastros](https://www.comune.nuoro.it/it/documenti/autunno-in-barbagia-2026-approvazione-dei-disciplinari-di-partecipazione-e-organizzazione-degli-eventi-carreras-de-lollobe-e-mastros-in-nugoro).
  Il rimborso per mancata ammissione esclude i 30 € di segreteria; rinuncia
  e mancata partecipazione non danno rimborso secondo il disciplinare.
- [Tiana: disciplinare 2026](https://comune.tiana.nu.it/notizie/3660030/cortes-apertas-2026).
  Domande 8–17 ottobre; pagamento dopo accettazione entro 4 novembre,
  termini trascorsi. Ambulanti vietati nelle strade del centro storico;
  nessuna libera spunta dedotta dal fatto che esistano spazi pubblici.
- [Ollolai: avviso, disciplinare e allegato A 2026](https://comune.ollolai.nu.it/novita/avvisi/autunno-in-barbagia-impara-s-arte-nella-terra-di-ospitone).
  Il disciplinare 2024 è espressamente richiamato per il 2026. Il nuovo
  allegato limita i ristori in Piazza Marconi e impone apertura sabato e
  domenica. Termine 25 ottobre, già trascorso; priorità ai locali, offerta
  esterna non concorrenziale, tesserino per hobbisti.
- [Olzai: disciplinare corrente 2026](https://www.comune.olzai.nu.it/index.php/tzente/articoli/1660).
  Sostituisce nella ricerca la vecchia pista 2024. Termine 12 ottobre già
  trascorso: pagina ore 12, PDF ore 14. La frase sul versamento «entro
  48 ore dalla data del 24 ottobre» non è reinterpretata come scadenza certa.
- [Dorgali: regolamento Natale 2025](https://www.comune.dorgali.nu.it/uploads/allegati/Allegato_A_-_Regolamento_mercatini_di_Natale_2025.pdf).
  Domanda entro 28 novembre 2025, già trascorso; criterio cronologico per
  spazio conteso, pulizia e allestimenti a carico degli espositori.

Altri approfondimenti pratici:

- [Oliena, avviso 2026](https://www.comune.oliena.nu.it/index.php/tzente/articoli/172):
  operatori ed espositori locali, moduli distinti per corti e ristori, termine
  17 agosto già trascorso e F40 per attività fuori sede. Nessuna quota certa
  ricavata, nessuna gratuità dedotta.
- [Onifai, seconda edizione Natale](https://www.comune.onifai.nu.it/it/novita/page/seconda-edizione-dei-mercatini-di-natale):
  19 dicembre 2026; modulo DOC originale scaricato con impronta. Estratte le
  stringhe leggibili dello stream Word, senza ricostruire l'impaginazione:
  manifestazione di interesse entro **13 novembre 2026**, gazebo bianco di
  proprietà, prodotti da dichiarare; consegna a mano o PEC. Nessun importo
  o posto residuo accertato. Questo termine è ancora futuro al controllo.
- [Macomer, graduatoria della rassegna ovini](https://comune.macomer.nu.it/notizie/3566197/rassegna-ovini-8-10-maggio-2026):
  8–10 maggio 2026, aree interne ed esterne già assegnate. Non confondere con
  disponibilità aperta. Il vecchio avviso editori 2021, pur ripubblicato in una
  pagina aggiornata, non è una procedura della Mostra del Libro 2026.

## Risultati non selezionati e limiti

L'audit distingue per ogni comune fonti consultate, query, risultati,
esclusioni e nuovi ID. Esempi: Loculi ha una scheda di Primavera con anno
2023 nell'intestazione e 2022 nel testo; Posada una mappa con espositori ma
senza anno/giorno univoci; Bolotana segnalazioni della Seada nella stampa,
senza data primaria selezionata; Noragugume atti su mercatini 2024, senza
calendario primario adottato. Queste piste rimangono conservate, senza
fabbricare nuove date. Per Galtellì i ticket cena non sono tariffe espositore.

Esclusi mercati settimanali, sole celebrazioni religiose, pariglie, spettacoli
o festival culturali senza prova commerciale. Le sagre con ristoro interno
non danno automaticamente accesso a venditori esterni. Nessun contatto a
terzi, invio di domanda, dato di affluenza o notorietà. Non esauriti albi,
social, rettifiche non indicizzate e allegati di ogni manifestazione.

## File, prove e verifica riproducibile

- `data/fiere-nuoro-finale-delta.json`: 49 nuove schede e due `existingUpdates`.
- `data/fiere-nuoro-finale-costi.json`: sei note, tutti ID nuovi.
- `data/fiere-nuoro-finale-ricognizione.json`: 53 comuni e prove individuali.
- `scripts/verify-fiere-nuoro.py`: builder effettivo in fixture privata.
- Prove originali, SHA-256, estrazioni e query sotto
  `.local/ricerche/nuoro-finale-20261106`; `manifest.json` unifica i download
  riusciti e i singoli manifest conservano anche errori e 404.
- Esito e fixture: `.local/verifiche/nuoro-finale-20261106/checks.json`.

Esecuzione: `python -B scripts/verify-fiere-nuoro.py`. Prima verifica la
riproduzione esatta della baseline, poi applica solo aggiunte e sostituzioni
esplicite nella fixture. Risultato **10.315 schede**, **477 note originarie
preservate più sei**, tutti gli altri record e il loro ordine conservati.
Conservati integralmente anche **358 record delle altre province sarde**.
Il secondo build è identico byte per byte. Controllate date commerciali,
edizioni storiche, periodi senza anno, assenza di duplicati, ID e confini.

Il test generale storico non è stato modificato o usato per mascherare fixture
non aggiornate (omonimia Crocifisso e date Brescia, limiti già noti
nell'incarico). Integrazione, sync degli ID recensioni, push, deploy e verifica
live restano al coordinatore. Nessuna checklist condivisa spuntata qui.
