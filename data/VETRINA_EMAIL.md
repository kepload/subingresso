# Invio Vetrine e frequenza — 23 ottobre 2026

L'utente autorizza il primo giro e chiede una frequenza moderata. Riferisce consensi chiesti via WhatsApp a molti degli iscritti che ha portato sul sito. È stata chiesta l'identificazione dei destinatari consenzienti: «molti» non viene registrato come consenso di tutti gli account o dei venti selezionati. Il materiale privato contiene una lista leggibile di nomi/email per facilitare l'abbinamento.

**Chiarimento conclusivo del 23 ottobre:** l'utente conferma che tutti gli ultimi cinquanta iscritti hanno acconsentito alle promozioni, mentre contatterà separatamente quelli più anziani. Coorte congelata alle11:31:13UTC sui cinquanta profili reali non admin/demo più recenti, ordinati per created_at e ID; prima iscrizione01/09, ultima23/10. Registrati50consensi con questa attestazione, data originaria sconosciuta. Trovati13venditori idonei;uno escluso per problemi nel provider. **Inviate12email, tutte12delivered verificati su Resend:4pacchetti e8testi con visualizzazioni.** Zero duplicati, consensi o invii fuori coorte; nessun nuovo cron. ID e ricevute soltanto nei registri privati.

## Stato corrente

Migrazioni campagne e scelta alla registrazione applicate; cinque Edge pubblicate, compresa `register-bypass`. Cinquanta permessi WhatsApp, dodici proposte inviate e consegnate, nessun nuovo cron. Uscita pubblicata3908a16: pagina eJS3 identici ai blob Git online, HTTP200; invio anonimo401, token finti404. Nuovo modulo Auth23/20sorgenti e informativa pubblicati e463617:16asset/pagine identici ai blobGit,quattroSSR conAuth23. Modulo reale online Chrome320/Safari390 passato;nessuna registrazione inviata, scritture di sfondo intercettate nel browser di prova. Backend rifiuta400 un tipo di consenso errato prima di creare account. I precedenti audit con zero permessi/invii e12o16email totali nel giorno sono fotografie della preparazione, superate dall'esito sopra. Nessuna disiscrizione reale o account di prova persistente.

## Nuove iscrizioni e consenso esplicito

Aggiornamento successivo23/10: richiesta esplicita di due caselle18px
preselezionate; termini obbligatori con link /termini e *, telefono obbligatorio.
Offerte facoltative:«Acconsento a ricevere offerte personalizzate»,testo13px.
Spazi del modulo ridotti,CTA subito visibile anche490x580/320x568.
Auth27 ripristina questi default anche alla chiusura; versione solo offerte
`vetrina-email-20261023`, mai consenso alla misura. Il paragrafo seguente
documenta la scelta precedente, superata dalla richiesta corrente.

L'utente ha chiesto la casella preselezionata. È stata spiegata e implementata la scelta separata, facoltativa e **inizialmente vuota**: una casella già spuntata non dimostra consenso. Fonte verificata: [Garante, consenso e caselle già spuntate](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/8981258). Nessun blocco all'account per chi rifiuta.

`regPromoOptIn` riguarda soltanto offerte via email sulle Vetrine, massimo una proposta ogni30giorni, con link privacy e uscita da ogni email. Bypass e fallback Auth trasmettono la scelta effettiva e `vetrina-email-20261023`. Il server rifiuta tipi diversi dal booleano e versioni mancanti/errate quando la scelta è positiva; i client precedenti che non inviano il campo creano account senza consenso. Chiusura del modulo azzera la scelta; durante l'invio è bloccata, su errore viene conservata. Modulo scorrevole entro l'altezza del telefono, senza modificare il resto della pagina.

`PATCH_SIGNUP_PROMO_OPTIN_20261023.sql` aggiunge solo un AFTER INSERT su profiles, senza cambiare trigger annunci o auth esistenti. Legge i metadati della nuova iscrizione; solo booleano JSON true e versione corrente registrano fonte explicit_site_optin, testo/versione e timestamp server. Nessun backfill, nessuna riattivazione da UPDATE o riscrittura di revoche. Se il salvataggio del consenso fallisce, il marketing resta disabilitato e l'account gratuito continua a funzionare.

Test nuovi: booleano vero/falso/assente/stringa, versione, registrazione di account già esistente, revoca e isolamento; nuove Auth/profile fixture in transazione ROLLBACK, nessun account persistente. Chrome1440/320 e Safari390: entrambe le scelte nei due percorsi, invio in corso, errore, reset, scorrimento e pulsante raggiungibile. Regressione bandi passata nei treformati: aggiornata solo la fixture obsoleta, che non caricava BlogMarkup e cercava un commento rimosso. Dati/avvisi bandi reali invariati.

Inspector del campo effettivo estratto dal modulo, stesso CSS e font,1440/320/390:0FAIL/0WARN. Esclusi soltanto no-title/hero-void perché è l'anteprima di un singolo campo, non una schermata completa. Prima prova helper12px segnalata;portata a14px e ripetuti controlli/screenshot. Il primo helper di anteprima aveva un confronto path Windows non normalizzato:risolto,nessun difetto corrispondente in produzione. Screenshot dell'intero modulo Chrome/Safari esaminati;collegamento Informativa privacy mantenuto intero. Backup tag remoto `backup/session-20261023-133102-consensi-ultimi50` e ramo `backup/pre-consensi-nuovi-20261023` verificati prima delle modifiche.

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

Template `supabase/functions/_shared/vetrina-email.mjs`, rifatto il23/10 su richiesta
dell'utente: nove varianti con oggetti orientati alla vendita e al vantaggio,
testi brevi, nessun titolo annuncio lungo nel corpo. Logo testuale, fascia blu
con titolo/oro Vetrina, prezzo separato e pulsante pieno «Metti in Vetrina»
o «Scegli le tue Vetrine». Un'anteprima inbox anticipa durata/prezzo e assenza
di abbonamento. HTML email a tabelle con stili inline, larghezza600px e
adattamento320px, font Arial/Helvetica; grafica completa senza immagini remote.
L'eventuale pixel resta soltanto nel percorso di misura autorizzata.
Testo alternativo allineato; saluto vero e reply-to info@subingresso.it.
Pacchetto quando ci sono più annunci idonei, listino condiviso
`js/vetrina-pricing.js`: totale, risparmio e durata devono corrispondere
al link proposto. Il pulsante apre la scelta in dashboard; nessun addebito
avviato dalla mail. Nessuna promessa di vendita garantita, acquirente già
trovato, scarsità o tempo medio inventato. Preferenza permanente: semplice,
umano e leggibile, vantaggio/prezzo/azione immediati; evitare oggetti da report.
Questa revisione non autorizza reinvii o nuove campagne. Anteprime e verifiche
in `Documents/email-vetrine-design-20261023/`, contratto di superficie in
`.impeccable/surfaces/vetrina-email.md`. Screenshot browser, nessuna consegna
di prova a caselle reali e nessuna attestazione di test in Outlook/Gmail nativi.

Pubblicazione della revisione: committed `ed33799`, `vetrina-campaign` versione4
e `admin-email-analytics` versione3 ACTIVE. Riscaricate quattro sorgenti
(due entrypoint, template e listino): identiche ai file revisionati. Entrambi
gli endpoint senza autenticazione rispondono401. Registro invii identico:
12messaggi clienti e1copia test già esistenti; nessun nuovo invio o reinvio.
Suite campagna e regressione conversioni passate; nove modelli verificati
su Chrome860/320 eSafari390, fallback inline compreso. Review indipendente
`ship`; font/misure email motivati, nessuna nuova identità grafica.

L'uscita è `/unsubscribe?t=...&type=promo`: apre il modulo esistente e attende conferma, poi revoca soltanto le offerte. Digest, statistiche e avvisi restano invariati. Feedback facoltativo compatibile con il nuovo tipo. L'header `List-Unsubscribe` punta al modulo; non viene dichiarato un supporto One-Click POST che non esiste. Le uscite generali `all` conservano le proprie funzionalità; i flag periodici disattivati impediscono comunque nuove offerte.

## Verifiche e conservazione

`scripts/test-vetrina-email.cjs`: nove varianti, somme pacchetti, escaping, autenticazione interna, assenza consenso, revoca durante preparazione, errori/bounce/recenza provider, timeout senza retry, registrazione e duplicati simulati, sostituzione dei settimanali conservando snapshot, frequenza che si blocca se il registro non è leggibile. Nessun invio reale nei test.

`scripts/verify-vetrina-email.sql` eseguito nella stessa transazione della migrazione e **ROLLBACK**: separazione consensi, periodo UTC, blocco duplicati, riapertura dopo 30 giorni, tetti 24 ore/campagna, opt-out idempotente senza toccare altre preferenze, permessi solo servizio. Fixture temporanee annullate. `scripts/test-email-unsubscribe.cjs` aggiornato: Chrome1440/320 e Safari390, nessuna disiscrizione reale.

Applicazione: 119 profili, 133 annunci, 21 quote pagamento; nessuna scrittura su queste tabelle, nessun trigger annunci cambiato. Nuove tabelle inizialmente vuote. Copia remota `backup/session-20261023-125704-invio-email-vetrine` e ramo `backup/pre-invio-email-vetrine-20261023` verificati; helper interrotto dopo push riuscito per stderr PowerShell, errore noto.

File privati in `Documents/campagna-vetrine-20261023/`: coorte cinquanta, tredici candidati, storico provider, runner `invio-operativo.py`, lista confermata, ricevute e consegne. Nessuna credenziale esportata o salvata in questi artefatti; nessuna PII nei file versionati. I vecchi documenti con zero invii fotografano la preparazione iniziale; il controllo finale è `verifica-coorte-e-invii-finale.json` e il resoconto `risultati-invio.md`.

L'uso futuro resta limitato alle persone con presupposto valido e alle autorizzazioni di invio effettivamente date. Non aggiungere cron, importare contatti o trasformare la segnalazione generica WhatsApp in un opt-in di massa.
