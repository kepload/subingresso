# Profili eliminati

Contatore persistente attivato il **9 novembre 2026**. Totale verificato
all'attivazione: **1**, relativo alla cancellazione gia completata e verificata
nella stessa giornata. Lo storico precedente non e ricostruibile dai registri
disponibili: questo numero non e un totale certificato dalla nascita del sito.

Fonte corrente, da leggere via accesso gestionale al database:

```sql
SELECT total, verified_before_tracking, tracking_started_at,
       last_deletion_at, earlier_history_complete
FROM account_private.profile_deletion_counter
WHERE singleton;
```

- Il trigger `count_profile_deletion` su `public.profiles` incrementa il totale
  automaticamente, nella stessa transazione di ogni cancellazione effettiva,
  anche quando il profilo e eliminato in cascata da `auth.users`.
- Un'operazione annullata non conta; ripetere la cancellazione di un profilo gia
  assente non incrementa. Non incrementare manualmente dopo aver usato il sito,
  le API admin o `delete_my_account()`.
- Si contano le righe profilo realmente eliminate, senza inferire motivi o
  distinguere categorie non registrate. Nessun ID, recapito o contenuto viene
  salvato nel contatore; e riservato al servizio e all'accesso gestionale.
- Ogni cancellazione resta subordinata alla richiesta esplicita. Il contatore
  non autorizza nuove cancellazioni, messaggi o email.

## Email dopo una cancellazione

Per ogni cancellazione autorizzata verificare sia i collegamenti all'ID sia le
iscrizioni fondate solo sull'email: avvisi regionali, riepiloghi, promozioni,
promemoria e consegne in attesa. Non usare vecchie esportazioni come lista
destinatari; i percorsi di invio devono verificare l'idoneita corrente.

Il 9 novembre il controllo dell'account appena eliminato ha trovato **zero**
iscrizioni, permessi promozionali, avvisi, promemoria e consegne collegate,
compresi gli indirizzi nelle tabelle email e nei payload dei promemoria fiere.
Anche la coda delle richieste di rete non contiene invii collegati. La candidatura
alle promozioni restituisce non idoneo. I percorsi del sito usano
Resend per invii diretti, senza sincronizzazioni con liste contatti nel codice.

Implementazione: `PATCH_PROFILE_DELETION_COUNTER_20261109.sql`.
Prove operative minime e prive di credenziali in
`.local/lavori/contatore-profili-eliminati-20261109/`.
Migrazione applicata e riletta in produzione: totale **1**. Verifiche con righe
sintetiche temporanee interamente annullate: cancellazione singola, ripetizione
su riga assente, cascata, cancellazione multipla, rollback e permessi privati.
Nessuna cancellazione di profili reali o email inviata durante queste prove.
