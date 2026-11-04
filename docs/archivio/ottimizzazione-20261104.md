# Ottimizzazione del contesto — 4 novembre 2026

Intervento autorizzato dall'utente per ridurre il carico iniziale di Codex
conservando informazioni utili, decisioni e futuro del progetto.

## Risultato misurato

| Documento d'ingresso | Prima, byte | Dopo, byte | Riduzione |
|---|---:|---:|---:|
| Subingresso.it informazioni.md | 387.852 | 6.403 | 98,35% |
| istruzioni.md | 160.350 | 5.455 | 96,60% |
| data/FIERE.md | 656.932 | 16.663 | 97,46% |
| Totale dei tre documenti | 1.205.134 | 28.521 | 97,63% |

Sono misure dei file, non token o un benchmark delle prestazioni del modello.
Si riferiscono al primo intervento `e143e28`, prima dell'annotazione di verifica.
Il risparmio effettivo dipende dai documenti necessari alla singola attività.
Lo spazio complessivo su disco non è diminuito: i dettagli restano conservati.
AGENTS passa da 8.493 a 9.215 byte per aggiornare i rimandi e prevenire la
ricrescita; le regole di autorizzazione, sicurezza e pubblicazione sono preservate.

## Informazioni conservate

- Stato corrente distinto dallo storico integrale fino al 1 novembre, salvato
  in `docs/archivio/informazioni-fino-20261101.md`.
- Manuale tecnico ripartito in **20 riferimenti**, senza tagli di contenuto.
- Dossier fiere ripartito in **117 riferimenti**, senza tagli di contenuto.
  La differenza rispetto ai 118 titoli H1/H2 deriva dal titolo H1 interno a
  una sezione, conservato insieme alla sezione anziché contato come dossier.
- **110 province uniche, 92 concluse e 18 aperte**: stati e ID numerati
  originali verificati, Pavia ancora aperta e riservata. Automazioni ferme.
  Il conteggio è lo snapshot del 1 novembre, non una nuova verifica live.
- Crescita, privacy, sicurezza, rinnovi, statistiche e catalogo editoriale
  conservati in `docs/attivita.md`, marcati come proposte da rivalidare.
- Rimossa da PRODUCT la frase che presentava il vecchio redesign come
  «richiesta corrente»; il documento ora descrive il prodotto senza riattivare
  autorizzazioni passate. Originale conservato nel backup.

Il collegamento sul Desktop non è stato modificato e mantiene lo stesso target.
Nessuna modifica a dati live, interfacce, query, invii o automazioni del sito.
Modifiche estranee a `supabase/.temp/cli-latest`, PDF e cache Python preservate.

## Integrità e ripristino

Prima delle modifiche sono state salvate copie esatte dei sei file originali in
`.local/backup/contesto-20261104/`, con hash SHA256 nel manifest privato
`.local/tmp/contesto-manifest.json`.

La concatenazione dei riferimenti in ordine numerico ricostruisce i due
documenti originali **byte per byte**; lo snapshot del registro è anch'esso
identico all'originale. Verifica completata prima del commit:

| Originale | SHA256 verificato |
|---|---|
| istruzioni.md | `d5a1ff9e8546f378ea078ad3b5852e15730e8b229f2d73f14d117667b008565f` |
| data/FIERE.md | `df90f62cfee69d91f319d88e05ead85a622d0405d87e5bec197edcb31726b4a6` |
| Subingresso.it informazioni.md | `c0067e98923383ea7406c9593ab3fecb907c55b16bc6122eaad2dccd2bdcdb90` |

Backup remoto verificato: tag
`backup/session-20261104-101810-ottimizzazione-contesto` e ramo
`backup/pre-contesto-20261104`, entrambi riferiti a HEAD precedente `37aff37`.
Per ripristinare un documento, confrontare e recuperare il singolo file da
questo riferimento o dalla copia privata; preservare il lavoro concorrente.

## Ricerca e verifiche

Nuovo helper `scripts/project-context.cjs`: sola lettura, ricerca letterale
senza distinzione di accenti/maiuscole, tutte le parole nella stessa riga,
massimo 12 risultati e 6.000 caratteri. `.local`, file nascosti e impostazioni
private esclusi; storico escluso salvo `--storico`. Nessuna dipendenza nuova.

Verificati query con accenti, caratteri speciali letterali, parole congiunte,
assenza di risultati, righe molto lunghe, limite di output, archivio opt-in e
assenza di accesso ai file privati. Verificati integrità dei testi, checklist,
rimandi locali e sintassi Node. Prove in
`.local/verifiche/contesto-20261104/`; controllo diff e scansione gitleaks
eseguiti prima del commit. Nessuna suite del sito necessaria per questi documenti
e helper non utilizzati dall'applicazione.

## Difetto del backup corretto

Lo script originale aveva già creato e pubblicato correttamente il tag remoto,
poi passava `-ErrorAction Stop` al comando nativo `git tag`: errore ripetuto per
ogni vecchio tag. La pulizia difettosa è stata interrotta; il tag remoto è stato
verificato separatamente. Non era un fallimento del salvataggio remoto.

Rimossi i parametri PowerShell dal comando Git; array esplicito anche per un
solo tag e batch da 50 per evitare migliaia di processi. Nessuna pulizia
ulteriore eseguita sui tag del progetto durante questo intervento.

Tre repository locali usa e getta con origin locali, nessun accesso produzione:

| Tag iniziali | Rimossi localmente dopo il nuovo backup | Tag locali finali | Tag remoti finali |
|---:|---:|---:|---:|
| 30 | 1 | 30 | 31 |
| 34 | 5 | 30 | 35 |
| 84 | 55 | 30 | 85 |

Tutti i casi passati; verificati anche il caso con un solo tag da rimuovere
e il passaggio tra due batch. Output inferiore a 2.000 caratteri per prova,
nessun errore ripetitivo, tutti i tag remoti precedenti conservati.

Metodo permanente e fonti ufficiali: [gestione del contesto](../CONTESTO.md).

## Verifica successiva: compatibilità dei consumatori

Il confronto con `37aff37` conferma che la riorganizzazione non ha modificato
HTML, CSS, JavaScript dell'applicazione, API, dati o configurazioni di produzione.
L'audit dei riferimenti nel codice ha individuato un consumatore da adeguare:
`scripts/backup-fiere-research.py` selezionava i vecchi documenti monolitici,
ma non le nuove sottocartelle. La copia Git conservava già tutti i riferimenti;
il backup dedicato alle ricerche ora include anche `docs/`,
`data/fiere-dossier/` e `scripts/project-context.cjs`.

Eseguito lo script su una fixture interamente privata dentro il progetto,
con Documents e directory temporanea simulate: **16 file copiati e verificati
con SHA256**, inclusi manuale separato, dossier provinciale, checklist,
archivio e helper. Nessun backup reale delle ricerche, accesso produzione,
contatto o invio. Esito in
`.local/verifiche/contesto-20261104/backup-compatibilita.json`.

Sei ricerche reali passate, tutte entro 6.000 caratteri: Benevento,
Saved Listings, get_listing_contact, Trattativa Protetta, contatori con storico,
16. Pavia. Prove `reperibilita.json` nella stessa cartella privata.

Backup remoto della verifica confermato:
`backup/session-20261104-103433-verifica-contesto-backup` su `e143e28`.
La redirezione del log PowerShell aveva interrotto l'helper dopo il push per
il trattamento di stderr nativo; il tag remoto è stato verificato separatamente.
Nessuna pulizia dei tag effettuata da quella chiamata.
