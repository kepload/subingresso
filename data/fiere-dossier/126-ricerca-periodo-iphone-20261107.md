# Ricerca fiere per intervallo — prova del 7 novembre 2026

Richiesta: togliere il filtro prodotto e pubblicare una prova con date Dal/Al,
selettore a scorrimento in stile iPhone e versione precedente ripristinabile.

## Comportamento

- Dal/Al aprono un dialog: pannello dal basso sul telefono, centrato sul desktop.
  Giorno, mese e anno scorrono con inerzia e scatto alla riga; disponibili anche
  tocco, clic, rotella, trascinamento con mouse e tastiera. Un solo pulsante
  «Mostra fiere» applica le due date. Chiusura, sfondo ed Escape annullano.
- Scorciatoie Questo mese, Da oggi a 3 mesi e Da oggi a 6 mesi. Gli ultimi due
  intervalli partono da oggi e arrivano alla stessa data dopo tre/sei mesi,
  limitata all’ultimo giorno valido quando necessario. Il conteggio dei
  giorni comprende gli estremi. Cambio mese/anno limita il giorno all’ultimo
  valido; se un estremo supera l’altro, entrambi si riallineano alla data scelta.
- Un intervallo include soltanto edizioni con date pubblicate che lo
  intersecano, estremi compresi. Nessuna proiezione di vecchie edizioni su
  anni nuovi. Periodi complessivi e date di calendario conservano i loro limiti
  nelle schede. «Azzera filtri» torna all’intero catalogo.
- Lista, ordinamento, dettaglio e mappa usano lo stesso intervallo. Parametri
  condivisibili `dal=AAAA-MM-GG&al=AAAA-MM-GG`, mantenuti al ricaricamento.
  Le scelte durante il caricamento non si perdono.
- I vecchi link `mesi=` restano ricerche sui periodi abituali, indicati sotto
  le date. Una nuova scelta Dal/Al li sostituisce. Provincia, regione, ricerca
  per nome/comune e tipo di evento restano disponibili.
- Rimosso il controllo prodotto; vecchi parametri settore/articoli ignorati e
  rimossi dall’URL. Classificazioni, fonti e dati nelle schede restano conservati.
  Nessuna modifica a catalogo, database, consensi, email o promemoria.

## Backup e ripristino

Base `2a8042fd1ad4e1a355f7c984366f76548195af76`.
Tag remoto verificato `backup/session-20261107-162002-fiere-periodo-iphone`.
Archivio locale `.local/backup/fiere-prima-periodo-20261107-162002/ricerca-precedente.zip`:
HTML, JS e CSS precedenti, integrità ZIP verificata, istruzioni accanto.

Se la prova viene rifiutata, ripristinare soltanto i file della ricerca dal
backup in un nuovo commit, togliendo i riferimenti ai nuovi asset. Preservare
eventuali modifiche successive; nessun reset dell’intero repository.

## Verifiche

`scripts/test-fiere-period.cjs`: estremi inclusivi, anni bisestili, fine mese,
passaggio d’anno, date invalide/mancanti, vecchie edizioni, filtri geografici e
confronto indipendente con il catalogo reale. Browser Chromium1440/768/320,
WebKit390 e orizzontale844×390, temi chiaro/scuro, tastiera, annullo, reset,
scorciatoie, URL/ricaricamento, dettaglio coerente e assenza di overflow.
`scripts/test-fiere-entry.cjs`: ingressi SSR, fonti e accesso, chiusura/ricaricamento,
catalogo tardivo, errore/riprova, assenza JS e quattro formati/browser.

Gesti: rotella, trascinamento mouse e tastiera su Chromium e WebKit; tocco
simulato CDP su Chromium con cambio del giorno e sfondo fermo. Applicazione
immediata legge la posizione visibile prima del debounce. Nessun iPhone fisico
disponibile: WebKit e tocco simulato non attestano una prova hardware Safari.

Screenshot prima/dopo e prove in `.local/verifiche/fiere-periodo-20261107/`.
Inspector eseguito a1440/768/390: nessun overflow orizzontale; rileva anche
microtesti/gradienti/colori e overlay preesistenti del calendario e dell’accesso,
fuori da questa modifica. I nuovi controlli hanno testo minimo12px, focus,
movimento ridotto e temi condivisi. Nessun invio o account reale di prova.

Pubblicato `d1b45b45e3a5ab6ef46d37f961f3718265e6a706`, controllo
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DqazYniVmmxsu1MrejpFS45knFM8).
Quattro asset online identici ai file del commit. Ripetute online tutte le
sette combinazioni browser/formato/tema del selettore e i quattro percorsi
SSR/accesso; anche caricamento tardivo e gesti passati. Ricevute `published.json`,
`live-results.json`, `live-gestures.json` e screenshot nella cartella prove.
Catalogo, fonti e note economiche invariati rispetto al backup. Anteprima locale
chiusa. La versione online resta una prova in attesa del giudizio dell’utente.

## Correzione delle scorciatoie e delle altezze — 7 novembre, sera

Su richiesta: sostituiti weekend/tutti i periodi con un orizzonte a tre/sei
mesi; etichette esplicite «Da oggi a 3 mesi» e «Da oggi a 6 mesi». Restano tre
scorciatoie su una sola riga anche a320px. Campi Dal/Al ridotti da86 a64px
(prima82px sui telefoni più stretti), senza ridurre la leggibilità del testo.
Aggiornati versioni degli asset e testo del risultato vuoto.

Backup remoto prima della correzione:
`backup/session-20261107-195835-fiere-periodi-lunghi` → `7d07c8b`.
Prove della correzione in `.local/verifiche/fiere-periodo-20261107/periodi-lunghi/`.

Correzione pubblicata `6328cf89dc5ad857b1029d8e6f0bf3dfbc956584`,
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/4NtSeycPpiLzQu3z6JXBzvq7HEmF).
Tre asset identici online; sette combinazioni browser/formato/tema passate
localmente e online, con altezze ≤66px, tre scorciatoie sulla stessa riga,
intervalli esatti, fine mese e anni bisestili. Nessuna modifica ai dati.

## Etichetta e data su una sola riga — 7 novembre, sera

Su correzione dell’utente: Dal/Al e valore affiancati, altezza48px anziché64px.
Adattamento alla larghezza del gruppo, anche nella colonna stretta dei tablet;
testo completo senza troncamento o sovrapposizione. Nei gruppi più stretti
freccia omessa e testo13px. Rotelle e scorciatoie invariate.
Backup `backup/session-20261107-201521-fiere-date-su-riga` → `84d8c2a`.
Sette combinazioni locali Chromium/WebKit e chiaro/scuro riuscite; prove
in `.local/verifiche/fiere-periodo-20261107/date-su-riga/`.

Pubblicato `25400031f98921f61b584b6f2ae67b7d21d30258`,
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/BLsqV8YMQyoPshx2L2h6fJnK79qs).
HTML/CSS identici al commit; cinque combinazioni online Chromium1440/768/320
e WebKit390 nei due temi passate con date vuote e giorni a due cifre.
Confermati allineamento, testo completo,48px e assenza di errori pagina;
ricevuta `date-su-riga/published.json`. Modifica della mappa precedente conservata.
