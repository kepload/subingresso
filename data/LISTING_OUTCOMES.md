# Esito degli annunci — 24 ottobre 2026

Il proprietario usa «Venduto o affittato?» sui propri annunci attivi, anche
scaduti. Tre passaggi compatti: esito, importo facoltativo, canale obbligatorio.
«Nessuna delle due» termina al primo passaggio, registra la risposta e lascia
l'annuncio disponibile: nessuna cancellazione o falso venduto.

- Esiti: `sold`, `rented`, `neither`. Canali: Subingresso.it, Facebook,
  un altro sito di annunci, passaparola/conoscenze, altro. Nessun testo libero,
  documento o dato dell'acquirente. Nessuna opzione preselezionata.
- Vendita: prezzo totale 100–500.000 €. Affitto: canone **annuo** 120–120.000 €,
  coerente con l'unità già usata dal sito. Vuoto è mancante, mai zero.
  Client e server rifiutano fuori intervallo, numeri non finiti e più di due
  decimali. Sono limiti operativi ampi, non un listino né prova di autenticità.
- Anche negli intervalli, il prezzo è `review` se manca un riferimento utile,
  l'esito cambia il tipo originario di offerta oppure il prezzo finale è sotto
  il 20% o sopra il 300% di quello richiesto. Questi casi sono conservati
  separatamente ed esclusi dalla vista dei prezzi utilizzabili. I restanti
  sono `plausible`, sempre dichiarati e non verificati. Non si addestra né si
  modifica automaticamente il valutatore.
- `reported_at` è il momento server della **dichiarazione**, non la data
  dell'atto o dell'affitto. Non si inventa una data di conclusione né si
  ricostruiscono esiti per i vecchi annunci chiusi. La fonte è dichiarata:
  «Subingresso» non equivale a un'attribuzione misurata o certificata.
- Tabella privata `listing_outcomes`, una risposta corrente per annuncio;
  nessun grant a client anonimi/autenticati. RPC `get_my_listing_outcomes`
  restituisce soltanto ID ed esito dei propri annunci, senza prezzi o canali.
  `record_listing_outcome` autentica e verifica proprietà, stato, demo, enum,
  prezzi e unità; blocca la riga per serializzare invii concorrenti. Stesso
  invio su esito già chiuso: idempotente; altre modifiche del chiuso rifiutate.
- `sold` resta lo stato tecnico di annuncio concluso per compatibilità con
  filtri, contatti e autorizzazioni esistenti. La dashboard del proprietario
  distingue Venduto/Affittato dal nuovo esito; senza dichiarazione mostra
  Concluso. La guardia aggiuntiva `zz_require_listing_outcome` impedisce agli
  utenti di chiudere direttamente via UPDATE senza una risposta scritta dalla
  RPC nella stessa transazione. Funzioni/trigger esistenti conservati.
- Vista privata `listing_outcome_prices`: solo prezzi plausibili dichiarati,
  di annunci chiusi non demo e ancora dello stesso proprietario. Esclusi
  anomalie, importi mancanti, esiti negativi e vecchi stati sold senza risposta.
  Vendite totali e canoni annuali hanno unità distinte: mai sommarli insieme.
  Non è un archivio pubblico; nessuna nuova pubblicazione dei prezzi finali.
- Dialog nativo, focus contenuto/ripristinato, tastiera, errori locali,
  annullamento senza scritture; salvataggio unico con stato d'attesa. Nessuna
  risposta in storage; cambio account chiude e invalida risposte pendenti.
  Un errore di rete conserva le risposte per riprovare.

Applicazione: `PATCH_LISTING_OUTCOMES_20261024.sql`. Prove SQL in transazione
con ROLLBACK e browser con API simulate; nessun messaggio, annuncio o esito
cliente di prova persistente. Prove e pubblicazione effettive:
`Documents/esiti-annunci-20261024/risultati.md`.
