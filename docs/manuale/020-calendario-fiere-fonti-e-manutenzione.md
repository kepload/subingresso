

## Calendario fiere — fonti e manutenzione

- Ricerca e prove provinciali complete: `data/FIERE.md`, audit
  `data/fiere-*.json` e dossier privati `Documents/ricerca-fiere-*`.
  Checklist e decisioni dell'utente: `Subingresso.it informazioni.md`.
  Non replicare qui i resoconti di ogni provincia o conteggi/versioni di cataloghi passati.
- Ripartire dai dati e dall'ultimo commit effettivi; preservare ID, fonti,
  province estranee e modifiche concorrenti. Non rigenerare da snapshot vecchi.
- Build `scripts/build-fiere.py`, catalogo `data/fiere-fonti.json` e test pertinenti
  indicati nel dossier. Verificare build ripetibile, fonti, semantica delle date,
  filtri, dettaglio e stato online prima di dichiarare conclusa una ricerca.
- Date confermate, periodi indicativi, storico e annullamenti restano distinti;
  non inventare disponibilità, costi, contatti o condizioni per gli espositori.
  Ricerca provinciale conclusa con limiti espliciti e manutenzione futura sono
  stati differenti. Non contattare organizzatori o inviare domande senza richiesta.
- Pagine autonome, affinità, affluenza e filtri sono descritti nel contratto
  fiere; organizzatori e offerte commerciali in `data/ORGANIZZATORI_EVENTI.md`.

Le descrizioni tecniche superate sono recuperabili nella versione Git
precedente alla pulizia documentale del 23 ottobre (commit `da20655`).
