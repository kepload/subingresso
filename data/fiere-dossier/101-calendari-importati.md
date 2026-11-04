
## Calendari importati

- [Lombardia — Sagre e fiere su area pubblica](https://www.dati.lombardia.it/Commercio/Sagre-e-fiere-su-area-pubblica/hs8z-dcey),
  dataset CC0 1.0, API filtrata per anno 2026 e tipo Fiera. Importate 227 righe;
  esclusi concerti, pasti privati e voci senza indicazione di fiera/mercato.
  Ogni scheda conserva il collegamento al programma regionale.
- [Piemonte — Sagre e fiere mercato 2026](https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=-1&qualifica=-1&scelta=2),
  375 righe importate dopo la risoluzione dei comuni. Le edizioni ricorrenti
  vengono raggruppate. Importati contatti pubblici degli uffici/organizzatori.
- [Marche — Calendario fiere 2026 aggiornato](https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf),
  aggiornamento di giugno: 218 righe importate. Le righe PDF con colonne o
  continuazioni ambigue sono escluse, non ricostruite per ipotesi. Collegamento
  alla pagina del PDF in ogni scheda.
- [Liguria — Fiere su area pubblica 2026](https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html),
  XLS aggiornato a settembre: 1.083 righe, 736 importate dopo la risoluzione dei
  comuni. Selezionate fiere, mercatini e manifestazioni con settori commerciali;
  escluse le sole feste gastronomiche/spettacoli senza queste indicazioni. Luogo,
  organizzatore e caselle email degli uffici/associazioni dove pubblicati. I periodi
  superiori a sette giorni sono conservativamente indicati come periodi complessivi,
  con giornate di vendita da verificare. Dieci righe con comuni non risolti escluse;
  altre quattro di Montalto Carpasio senza coordinate nell'anagrafica del sito escluse.
- [Veneto — Sagre e fiere con somministrazione 2026](https://www.regione.veneto.it/web/attivita-produttive/somministrazione-alimenti-e-bevande-nelle-sagre-e-nelle-fiere),
  XLSX aggiornato l'8 ottobre: 1.589 righe di manifestazioni, 163 importate.
  Richiesta menzione esplicita di mercati, bancarelle, ambulanti o espositori;
  non basta la ristorazione temporanea. Setteville non compare nell'anagrafica
  geografica del sito: quattro righe escluse, senza usare coordinate ipotizzate.
  Escluse anche due righe di Lusiana Conco prive di coordinate nell'anagrafica.
  Date alternative, ricorrenze e sequenze come «5-8/12» restano etichette: il
  trattino da solo non prova un intervallo continuo. I settori sono categorie
  fattuali estratte dal programma, non una copia del testo promozionale.
- [Emilia-Romagna — Fiere su aree pubbliche](https://wwwservizi.regione.emilia-romagna.it/sagre/default.asp),
  116 schede restituite dalla ricerca il 9 ottobre, 115 importate. La ricerca
  attuale privilegia gli appuntamenti successivi alla consultazione; non è un
  import completo dell'intero anno. Date giornaliere dalla scheda di dettaglio,
  luoghi, settori (incluse restrizioni) e organico dei posteggi. Esclusa la Fiera
  di luglio di Castello d'Argile, con data di ottobre e nota che indica luglio.
  Per Argenta importate le sole indicazioni sulle domeniche di dicembre: il
  periodo natalizio complessivo non viene trasformato in giorni di vendita.
  Orari malformati presenti nella fonte, come «23:90», non pubblicati.

`fiere-importate.json` conserva data del download, SHA-256 delle sei fonti/snapshot,
conteggi, righe PDF escluse e comuni non risolti. Questi conteggi sono righe
di fonte, non manifestazioni uniche: il build raggruppa le ricorrenze e integra
le schede editoriali della stessa fiera. I documenti originali non sono inclusi
nel repository. Le informazioni importate sono dati fattuali, non copie dei
testi delle pagine. Le fonti delle singole date restano consultabili nel popup.
