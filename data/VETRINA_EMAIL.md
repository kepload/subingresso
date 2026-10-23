# Invio Vetrine e frequenza — 23 ottobre 2026

L'utente autorizza il primo giro e chiede una frequenza moderata. Riferisce consensi chiesti via WhatsApp a molti degli iscritti che ha portato sul sito. È stata chiesta l'identificazione dei destinatari consenzienti: «molti» non viene registrato come consenso di tutti gli account o dei venti selezionati. Il materiale privato contiene una lista leggibile di nomi/email per facilitare l'abbinamento.

## Stato corrente

Migrazione applicata e quattro Edge pubblicate: `vetrina-campaign`, `email-unsubscribe`, `weekly-seller-stats`, `weekly-buyer-digest`. Zero permessi positivi registrati, zero proposte inviate, nessun nuovo cron. Frontend pubblicato3908a16: pagina uscita e JS3 identici byte per byte ai blob Git online, entrambe HTTP200. Invio senza chiave401; token finti promo/digest404; nessuna revoca reale di prova. La prima verifica confrontava i terminatori locali CRLF dello script: confronto corretto sui byte Git/produzione LF e passato. Resend interrogato in sola lettura: storico completo del periodo necessario, 12 email totali oggi, 20 account controllati; un account escluso per problemi del provider e nessun contatto recente nelle ultime 72 ore fra i venti. Questi numeri fotografano il controllo, non sono quote permanenti o prove di consegna di una nuova campagna.

## Limiti applicati

- Massimo 20 proposte per campagna e nelle ultime 24 ore, con lock database globale per impedire elusioni concorrenti.
- Almeno 30 giorni fra proposte allo stesso account. Anche prenotazioni, fallimenti ed esiti incerti contano prudenzialmente; stesso account/campagna non viene mai reinviato automaticamente.
- Almeno 72 ore dall'ultimo riepilogo/digest/reminder/alert registrato; confronto anche con lo storico reale Resend, escludendo i messaggi di accesso/recupero password dal controllo sulle periodiche.
- Il messaggio Vetrina sostituisce il digest/statistiche nei successivi 7 giorni. Gli snapshot venditore vengono conservati anche quando l'email salta. Gli avvisi specificamente richiesti e le email necessarie all'account conservano il proprio funzionamento.
- Il runner manuale distanzia le operazioni di 15 secondi. Non avvia campagne future; la richiesta riguarda il primo giro, la cadenza è un limite, non una pianificazione ricorrente.
- Stop promozionali se lo storico del provider non è verificabile o compaiono bounce/reclami/soppressioni/fallimenti. Soglia prudenziale di 80 email provider nel giorno UTC per lasciare margine ai servizi sull'assetto 100/giorno noto al progetto; il limite campagne resta 20 anche con un piano superiore.

Le restrizioni sono indipendenti dalla variazione dei testi: le varianti servono a rendere pertinente la proposta, non ad aggirare i filtri. Nessun numero di invii o intervallo garantisce assenza di blocchi.

## Dati e destinatari

Tabelle nuove `vetrina_email_permissions`, `vetrina_email_log`, con RLS attiva e accesso soltanto `service_role`. Nessuna lettura/scrittura client; RPC `vetrina_email_candidate`, `claim_vetrina_email`, `stop_vetrina_offers` revocate a PUBLIC/anon/authenticated.

I consensi sono registrati soltanto dopo un abbinamento nominativo confermato: fonte `whatsapp_user_attestation`, nota che descrive l'attestazione, `recorded_at` attuale; la data originaria `consented_at` resta nulla se sconosciuta. Non memorizzare contenuti privati delle chat. Un opt-out senza precedente consenso è conservato con fonte `unsubscribe_request` e revoca, senza inventare un sì. Il runner non sovrascrive consensi/revoche esistenti con `upsert`.

Il server ricontrolla: account non admin/demo, email confermata, preferenze periodiche non disattivate, consenso presente e non revocato, annuncio proprio attivo Vendita, almeno 14 giorni online e 31 residui, nessuna Vetrina già attiva. Massimo dieci annunci in un pacchetto. Le visite riguardano gli ultimi quattordici giorni completi UTC da `listing_stats_daily`; nulla ricavato dai vecchi totali storici. Valori presentati come visualizzazioni, con anteprime/aperture esplicite, mai persone uniche.

## Invio e disiscrizione

`vetrina-campaign` accetta solo POST con Bearer interno. Azione predefinita `preview`, non invio. `audit` controlla al massimo venti ID, lo storico Resend e le esclusioni. `send` prende una prenotazione atomica, ricontrolla le revoche/preferenze, invia un solo messaggio con chiave di idempotenza stabile e registra l'ID provider. `verify` legge l'esito dal provider; accettato e consegnato restano distinti. In caso di timeout/esito ambiguo nessun retry automatico: stato `unknown` o prenotazione conservata, verifica manuale prima di qualsiasi altra azione.

Template `supabase/functions/_shared/vetrina-email.mjs`: nove varianti basate sui testi preparati, HTML semplice e testo, saluto senza falso mittente personale; reply-to info@subingresso.it. Pacchetto quando ci sono più annunci idonei, listino condiviso `js/vetrina-pricing.js`; nessun addebito avviato dalla mail, link commerciale alla dashboard e istruzione Promuovi. Nessuna promessa di vendita garantita o tempo medio non dimostrato.

L'uscita è `/unsubscribe?t=...&type=promo`: apre il modulo esistente e attende conferma, poi revoca soltanto le offerte. Digest, statistiche e avvisi restano invariati. Feedback facoltativo compatibile con il nuovo tipo. L'header `List-Unsubscribe` punta al modulo; non viene dichiarato un supporto One-Click POST che non esiste. Le uscite generali `all` conservano le proprie funzionalità; i flag periodici disattivati impediscono comunque nuove offerte.

## Verifiche e conservazione

`scripts/test-vetrina-email.cjs`: nove varianti, somme pacchetti, escaping, autenticazione interna, assenza consenso, revoca durante preparazione, errori/bounce/recenza provider, timeout senza retry, registrazione e duplicati simulati, sostituzione dei settimanali conservando snapshot, frequenza che si blocca se il registro non è leggibile. Nessun invio reale nei test.

`scripts/verify-vetrina-email.sql` eseguito nella stessa transazione della migrazione e **ROLLBACK**: separazione consensi, periodo UTC, blocco duplicati, riapertura dopo 30 giorni, tetti 24 ore/campagna, opt-out idempotente senza toccare altre preferenze, permessi solo servizio. Fixture temporanee annullate. `scripts/test-email-unsubscribe.cjs` aggiornato: Chrome1440/320 e Safari390, nessuna disiscrizione reale.

Applicazione: 119 profili, 133 annunci, 21 quote pagamento; nessuna scrittura su queste tabelle, nessun trigger annunci cambiato. Nuove tabelle inizialmente vuote. Copia remota `backup/session-20261023-125704-invio-email-vetrine` e ramo `backup/pre-invio-email-vetrine-20261023` verificati; helper interrotto dopo push riuscito per stderr PowerShell, errore noto.

File privati in `Documents/campagna-vetrine-20261023/`: lista proposte e storico provider, script manuale `invio-operativo.py`, conferme nominative in `consensi-confermati.json` inizialmente `[]`, ricevute solo dopo invio. Nessuna credenziale esportata o salvata in questi artefatti; nessuna PII nei file versionati. Il vecchio `verifica.json` fotografa la preparazione iniziale, non sostituisce i registri operativi.

L'uso futuro resta limitato alle persone con presupposto valido e alle autorizzazioni di invio effettivamente date. Non aggiungere cron, importare contatti o trasformare la segnalazione generica WhatsApp in un opt-in di massa.
