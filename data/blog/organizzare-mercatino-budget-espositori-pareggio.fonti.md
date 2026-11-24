# Articolo 28: fonti e limiti

Ricerca e lettura: 24 novembre 2026. Solo preparazione, nessuna pubblicazione o scrittura DB. Titolo e slug verificati contro 152 post LIVE con SELECT pubblica delle sole colonne id, slug, title, category; ricevuta privata `titoli-live.json`. Non risultano articoli sul calcolo del pareggio per l'organizzatore. I titoli sui costi del posteggio e sui mercatini natalizi riguardano invece il partecipante.

## 1. Camera di commercio di Torino

- URL: https://www.to.camcom.it/book/export/html/6019
- Documento: “Mettersi in proprio: il progetto imprenditoriale”, capitolo 5.1, sezioni Costi fissi e variabili / Il punto di pareggio / Dal reddito operativo al reddito netto.
- Passaggio pertinente, in sintesi: i costi fissi non variano col volume; il margine unitario è prezzo meno costo variabile; quantità di pareggio = costi fissi / margine unitario. Il modello ha ipotesi semplificatrici. Le imposte sul reddito richiedono un esame professionale separato.
- Uso: formula, distinzione costi e limiti del modello. Applicazione agli espositori e arrotondamento per eccesso sono elaborazioni didattiche della redazione.
- Limite: guida metodologica pubblicata nel 2015, ricontrollata oggi. Non usata per normativa o aliquote fiscali attuali, né per tariffe di mercatini. Non dimostra adesioni future, cassa o utile netto.

## 2. Comune di Brescia

- Pagina ufficiale: https://www.comune.brescia.it/it/documenti_pubblici/indirizzi-per-la-realizzazione-di-spettacoli-e-manifestazioni-sul-territorio-comunale
- Allegato: https://www.comune.brescia.it/s3/906/allegati/docpubbl/3-indirizzi-per-la-realizzazione-di-spettacoli-e-manifestazioni-sul-territorio-comunale.pdf
- Passaggio pertinente, in sintesi: il punto 4 dell'allegato tratta autorizzazioni e, quando dovute, somme per tariffe, canoni e rimborsi. Le esenzioni seguono le disposizioni applicabili.
- Uso: motivo per chiedere al proprio Comune quali costi si applicano; nessuna gratuità presunta.
- Limite: pagina aggiornata il 20 aprile 2026; allegato deliberazione 639 del 18 luglio 2008, tuttora collegato dalla pagina. Non è un tariffario 2026 né una disciplina nazionale dei mercatini. Nessuna cifra, scadenza o procedura specifica viene trasposta dall'allegato al testo.

## Risorsa e cifre

`downloads/budget-mercatino-espositori.xlsx`: budget per un'edizione, stessa quota e stesso costo variabile per ciascun espositore pagante. Input iniziali vuoti; zero esplicito per voci assenti verificate. Gli sponsor sono entrate esterne certe, non prestiti o versamenti propri. La capienza è quella utilizzabile dai paganti, già al netto dei posti gratuiti, i cui costi restano fra i fissi. I costi che aumentano a scaglioni richiedono una nuova stima per ciascuno scenario.

Soglia = arrotondamento superiore di max(0, costi fissi con riserva meno entrate esterne certe) / (quota meno costo variabile). Un margine nullo o negativo blocca il modello e richiede di rivedere la quota. Saldi = numero paganti × margine + entrate esterne certe − costi fissi con riserva. Risultati prima delle imposte sul reddito, con criterio IVA coerente scelto con il professionista. Nessuna formula fiscale.

Esempio interamente inventato: 1.500 euro di costi fissi inclusa riserva, sponsor 300, quota 35, costo variabile 10, capienza 40, adesioni previste 30. Soglia 48; saldo a capienza −200; saldo previsto −450. Con 48 posti paganti il saldo è zero. Non sono tariffe, dati commerciali o risultati sul campo.

Copertina originale generata con image_gen: scena inventata. Prompt nel file omonimo `.prompt.md`. Sorgenti, ricevute HTTP, hash, test delle formule e collaudo locale nel dossier privato assegnato; nessun dato personale pubblico.
