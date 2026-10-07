# Privacy di Subingresso.it — ricognizione del 7 ottobre 2026

## Risultato e stato

Preparata `PRIVACY_POLICY_BOZZA_20261007.md` sulla base del codice attuale e della struttura del database live, per consentire analisi interne utili allo sviluppo del sito e conservazione di statistiche realmente anonime a lungo termine. **La pagina pubblica `privacy.html` non è stata modificata: la bozza richiede ancora dati del titolare e allineamenti operativi. Il TODO Privacy Policy rimane aperto.**

Non sono stati eliminati o modificati dati nel database. Lo script `scripts/privacy-audit.sql` esegue una transazione in sola lettura e restituisce struttura, job di conservazione e riepiloghi di anzianità, senza dati di singoli utenti. Non seleziona i comandi dei job, che potrebbero contenere segreti.

## Conservazione proposta e dati utili allo sviluppo

Gli eventi dettagliati di navigazione e le valutazioni senza account hanno un limite proposto di 24 mesi, per confrontare due cicli annuali in un mercato stagionale. Le scadenze già esistenti degli eventi di registrazione rimangono 90 giorni senza registrazione e 395 giorni con account. Non è previsto di estenderle per il solo motivo che i dati potrebbero essere utili in futuro.

Per i confronti storici, ricavare invece un archivio statistico **effettivamente anonimo** con periodi, territori, settori, conteggi e distribuzioni di prezzi richiesti, superfici, frequenze e dati economici pertinenti del valutatore. Non includere nome, email, telefono, testo o immagini degli annunci, contenuto delle chat, token, ID di account/annuncio, provenienze complete o dettagli rari che consentano di risalire alla persona. Un UUID, un hash dell'email, un `user_id` nullo o una riga dettagliata aggregata a un singolo venditore non bastano.

Una soglia minima di gruppo, ad esempio cinque soggetti distinti, può essere una misura iniziale, ma **non è una garanzia di anonimato**: valutare anche concentrazione, combinazioni con annunci pubblici e possibilità di ricostruzione per differenza. Accorpare territori e periodi o omettere risultati quando necessario. Usare fasce e distribuzioni invece di singoli importi identificabili.

I dati di mercato possono orientare filtri, contenuti, territori da sviluppare e calibrazione del valutatore. Separare prezzi richiesti, incassi dichiarati e stime da eventuali futuri esiti reali di vendita: questi ultimi oggi non sono tracciati in modo affidabile. La bozza esclude la cessione commerciale di dati personali a compagnie e partner; i fornitori necessari al servizio restano destinatari tecnici.

## Verifiche effettuate

| Verifica live del 7 ottobre 2026 | Esito |
| --- | --- |
| Visite `page_views` | 6.904 righe; prima registrazione 2 maggio 2026; nessuna oltre i 13 mesi della policy attuale |
| Valutazioni `valutatore_logs` | 97 righe; prima registrazione 30 aprile 2026; nessuna valutazione senza account oltre i 24 mesi |
| Eventi `auth_modal_opens` | 230 righe; nessuna oltre i limiti attuali di 90/395 giorni |
| Job dal nome riferito a cleanup/retention/privacy/purge/anonimizzazione | Rilevato attivo soltanto `auth-modal-opens-cleanup`, ogni giorno alle 04:00 UTC |

La verifica dei job è limitata ai nomi e non dimostra l'assenza di altre pulizie effettuate manualmente o da servizi esterni. L'esito sui tre insiemi controllati non è una verifica completa di tutti i periodi di conservazione del sito.

Il database live conferma account, annunci, conversazioni/messaggi, pagamenti, avvisi, visite, conversioni blog ed eventi di registrazione. Le valutazioni includono anche versione e dettagli del modello, contesto di acquisizione, dispositivo e campi geografici storici. Il flusso attuale v2 in `js/pages/valutatore.js` salva una stima al termine del calcolo, anche senza account, tramite `save_valutazione_v2`; il collegamento all'account avviene tramite token. Non affermare che tutti i dati vengono salvati soltanto quando l'utente richiede un report nel profilo.

## Elementi da completare prima della pubblicazione della bozza

1. **Titolare:** ottenere dall'utente nome/ragione sociale, indirizzo pubblico di contatto, email privacy confermata e partita IVA se presente. Il sito pubblica già `info@subingresso.it` nei contatti, ma non è stata confermata come recapito privacy. Non ricavare l'identità legale da nomi di cartelle, account o repository.
2. **Analisi facoltative:** la bozza prevede consenso e preferenze modificabili, che oggi non esistono. `page-view-tracker.js` crea `_visitor_id` persistente senza scadenza e inserisce visite subito; `blog-tracker.js` riutilizza gli ID; `auth.js` raccoglie provenienze, registra eventi e li collega al signup; il valutatore salva il contesto anche senza consenso. Prima di usare il testo occorre bloccare queste analisi prima della scelta, registrare e rispettare consenso/rifiuto/revoca, introdurre una scadenza di 24 mesi per il visitor ID e minimizzare referrer/URL per non conservare token o query personali. Le stime necessarie al servizio e le bozze devono funzionare anche rifiutando le analisi. I conteggi delle azioni sul marketplace richiedono una valutazione separata quando non usano identificativi del dispositivo.
3. **Email:** `profiles.email_digest` e `email_stats` e il solo opt-out non dimostrano un consenso promozionale. I reminder di invito alla pubblicazione e gli eventuali inviti alla Vetrina vanno distinti da recupero password, notifiche e avvisi specificamente richiesti. Prima della pubblicazione, verificare i flussi effettivi, interrompere gli invii promozionali senza presupposto valido o raccogliere un consenso separato, facoltativo e documentato. La sola registrazione gratuita non dimostra i presupposti del soft spam. Non cambiare le automazioni email senza verificare il relativo playbook.
4. **Scadenze:** prima di pubblicare i limiti, predisporre una procedura concreta per rispettarli anche su esportazioni e copie operative, manuale o automatica, e documentare chi la esegue e quando. Implementare gli aggregati anonimi prima di rimuovere il dettaglio. Mancano nel repository procedure generali per visite, conversioni blog, valutazioni, messaggi, annunci ritirati e account inattivi. La bozza propone un riesame degli account dopo 36 mesi, non un'automazione già esistente. **Nessuna cancellazione di utenti o annunci è autorizzata da questo audit**: AGENTS.md richiede l'ok esplicito per tali operazioni. I dati finora controllati non hanno superato le scadenze, quindi non occorre eliminarli per questa ricognizione.
5. **Fornitori e backup:** verificare nei servizi usati gli accordi applicabili, la regione effettiva del progetto Supabase, log, backup, tempi di sovrascrittura e meccanismi dei trasferimenti. Non promettere archiviazione esclusivamente UE o tempi Resend non verificati. Stripe era assente dalla policy attuale, mentre gestisce i pagamenti della Vetrina. Le pagine caricano anche Google Fonts, cdnjs e jsDelivr.
6. **Documentare il legittimo interesse:** per le analisi di mercato da annunci/valutazioni, descrivere obiettivo concreto, dati necessari, alternative anonime, ragionevoli aspettative degli utenti, accessi, rischi e garanzie. L'informativa da sola non è la valutazione di bilanciamento. Assicurare una procedura di opposizione e di risposta ai diritti. Aggiungere nei punti di raccolta, inclusi registrazione e valutatore, un richiamo facilmente accessibile all'informativa aggiornata.

Questi punti rendono concreto il testo proposto: pubblicare la bozza senza implementarli produrrebbe nuove descrizioni non corrispondenti al sito. Non è necessario introdurre un consenso generico per tutte le funzioni né chiedere agli utenti di autorizzare qualsiasi uso futuro.

## Fonti consultate

- [GDPR, Regolamento (UE) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj/ita): finalità, minimizzazione, conservazione, basi giuridiche, trasparenza, diritti e trasferimenti.
- [Principi del trattamento, Garante](https://www.garanteprivacy.it/home/principi-fondamentali-del-trattamento): responsabilità del titolare e consenso specifico/documentabile.
- [FAQ cookie, Garante](https://www.garanteprivacy.it/faq/cookie): regole per cookie e strumenti analoghi, consenso e condizioni per analytics assimilabili ai tecnici. Gli UUID e l'uso di servizi di prima parte non costituiscono da soli un'esenzione.
- [Provvedimento Garante del 14 maggio 2026](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10262105): email promozionali, art. 130 e condizioni del soft spam.
- [Linee guida EDPB 2/2019](https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines-art_6-1-b-adopted_after_public_consultation_en.pdf): il miglioramento del servizio non è automaticamente necessario all'esecuzione del contratto.
- [Diritti degli interessati, Garante](https://www.garanteprivacy.it/Regolamentoue/diritti-degli-interessati): termini di risposta alle richieste.
- [Articolo 2220 del Codice civile, testo richiamato nella Gazzetta Ufficiale del 4 maggio 2026](https://www.gazzettaufficiale.it/eli/gu/2026/05/04/101/sg/pdf): conservazione delle scritture cui si applica l'obbligo contabile.
- Accordi di trattamento [Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum), [Vercel](https://vercel.com/legal/dpa), [Resend](https://resend.com/legal/dpa) e [informativa Stripe](https://stripe.com/it/privacy).

La bozza è una proposta specifica per il progetto; non costituisce una certificazione della conformità del servizio. Le durate vanno confermate alla luce dei trattamenti effettivi e dei relativi obblighi.
