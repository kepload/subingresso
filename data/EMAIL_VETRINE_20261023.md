# Email Vetrine — primo gruppo e testi, 23 ottobre 2026

Richiesta: iniziare a vendere Vetrine con poche email brevi e umane, varianti pertinenti, visualizzazioni effettive e pacchetti per chi ha più annunci. La finalità è aiutare a trovare prima un acquirente attraverso maggiore visibilità. Nessun tempo medio di vendita dimostrato: non presentare come statistica il confronto con le case, non garantire una vendita o un incremento di visite.

**Seguito del 23 ottobre:** autorizzato il primo giro e un limite umano. L'utente riferisce consensi richiesti via WhatsApp a molti iscritti; sono stati chiesti i nominativi per abbinarli. Nessuna iscrizione generalizzata presunta. Implementati registro, limiti e uscita dalle sole offerte: stato corrente in [VETRINA_EMAIL.md](VETRINA_EMAIL.md). Le sezioni seguenti descrivono la preparazione iniziale; i segnaposti vengono risolti dal nuovo invio dopo la verifica nominativa, senza inviare le vecchie bozze come sono.

**Esito successivo:** confermati dall'utente gli ultimi50iscritti reali, registrata la coorte senza includere i più anziani.13venditori idonei,uno escluso provider;12email effettivamente inviate e12consegne verificate,4pacchetti/8visualizzazioni. Nuovi iscritti con scelta separata facoltativa e vuota;casella preselezionata non valida come consenso, fonte Garante nel contratto. I conteggi zero e le venti bozze sotto restano lo storico preparatorio, non il registro del primo giro.

## Stato effettivo

Letture API in transazione READ ONLY il 23 ottobre 2026: 119 profili, 112 annunci reali attivi, 70 venditori attivi esclusi admin/demo. Zero acquisti Vetrina live riusciti. Nel sistema nessun campo/registro di consenso promozionale; `email_digest` e `email_stats` risultano true per tutti i 119 profili e hanno default true. Nemmeno i metadata Auth documentano un consenso. Il solo interruttore di riepiloghi/statistiche non viene trattato come consenso alle offerte.

Prima ricognizione: 61 venditori con almeno un annuncio promuovibile (14 giorni online, almeno 10 residui); 20 con più annunci promuovibili. La selezione finale, più stretta, richiede **Vendita, email confermata, 31 giorni residui, 14 online, nessuna Vetrina già attiva**, niente demo/admin e nessuna preferenza email disattivata: 53 account adatti ai testi, 17 ai pacchetti. L'idoneità commerciale non equivale all'idoneità all'invio.

Preparati localmente **20 messaggi per 20 account distinti: 8 pacchetti, 8 visualizzazioni, 4 visibilità; nove varianti, massimo 61 parole di corpo principale**. Le versioni complete comprendono saluto, un solo invito, firma e note essenziali. File privati e script solo in `C:/Users/utente/Documents/campagna-vetrine-20261023/`; nessun nome, ID destinatario, indirizzo o token nei documenti pubblici. Nessuna email inviata, nessuna automazione creata, nessuna funzione/cron/record/account modificato.

Nel registro `weekly_stats_snapshot` ci sono 69 riepiloghi il 19 ottobre. La funzione salva lo snapshot prima di verificare/inviare: **non dimostra la consegna**. Viene usato prudenzialmente come contatto recente; prima dell'invio verificare cronologia e soppressioni anche presso Resend. I job di riepilogo venditori e digest sono attivi il lunedì alle 09:00 UTC; nessuna sovrapposizione aggiuntiva introdotta.

## Primo invio proposto

- Massimo 20 destinatari con consenso promozionale documentato e ancora valido; nessun invio a tutti gli iscritti. Chi ha revocato, acquistato, venduto, ritirato o fatto scadere l'annuncio viene escluso al controllo immediatamente precedente all'invio.
- Una sola proposta per account, anche con più annunci. La variante pacchetto sostituisce quella singola. Nessun sollecito o invio ricorrente attivato da questa preparazione.
- Orientamento per eventuali campagne successive: almeno 30 giorni fra offerte; una seconda proposta soltanto con un motivo concreto aggiornato, mai ripetizione automatica. Da coordinare con il riepilogo, idealmente in sua sostituzione per quella settimana; questa scelta **non è stata applicata**. Le prime date teoriche del piano privato non sono invii programmati e non verificano il successivo cron del lunedì.
- Prima di spedire: aggiornare stati/preferenze/metriche, verificare consenso, quota residua del provider e indirizzi soppressi; completare un collegamento funzionante per disiscriversi dalle offerte. Nelle bozze è indicato `{{LINK_DISISCRIZIONE_PROMO}}`, quindi nessun messaggio è marcato come inviabile. L'attuale uscita `type=all` interrompe anche riepiloghi e promemoria: non presentarla come uscita dalle sole offerte.
- Mittente previsto `Subingresso.it <noreply@subingresso.it>`, risposte a `info@subingresso.it`. Una email individuale per account, testo semplice e HTML leggero, nessun falso mittente personale, urgenza inventata o oggetto `Re:`.
- Per un futuro invio, registrare ID provider e variante per account. Una chiave di idempotenza del provider protegge i retry per 24 ore; serve anche un registro durevole per evitare nuovi invii oltre quella finestra. Nessun retry automatico su esito ambiguo senza prima verificarlo.

## Numeri, benefici e prezzi

Visualizzazioni da `listing_stats_daily.views`, **9–22 ottobre inclusi, UTC**: quattordici giorni completi, successivi all'inizio della rilevazione del 6 ottobre. Nessun totale storico spacciato per periodo, nessun visitatore unico o messaggio dedotto dalle visite. Nota nei testi numerici: «Visualizzazioni = anteprime + aperture dell'annuncio, non persone uniche». Ricalcolare il periodo prima dell'invio.

La Vetrina offre maggiore visibilità nelle ricerche e negli articoli pertinenti del blog, secondo zona/rotazione; non significa prima posizione assoluta, pubblicazione su ogni articolo o visite garantite. Il catalogo gratuito resta disponibile.

Fonte prezzi `js/vetrina-pricing.js`, identica byte per byte all'asset di produzione il 23 ottobre. Singolo 10/30/90 giorni a 49/99/249 €. Pacchetti: 2 annunci −10%, 3–4 −15%, 5–10 −20%, stessa durata e pagamento unico. Nessun codice sconto o prezzo creato per la campagna.

| Annunci | Totale 10 giorni | Risparmio | Totale 30 giorni | Risparmio |
| --- | --- | --- | --- | --- |
| 2 | 88,20 € | 9,80 € | 178,20 € | 19,80 € |
| 3 | 124,95 € | 22,05 € | 252,45 € | 44,55 € |
| 4 | 166,60 € | 29,40 € | 336,60 € | 59,40 € |
| 5 | 196 € | 49 € | 396 € | 99 € |
| 6 | 235,20 € | 58,80 € | 475,20 € | 118,80 € |

Un solo collegamento commerciale: `https://subingresso.it/dashboard`, verificato HTTP 200. Apre l'area personale; dopo l'accesso occorre premere **Promuovi**. Non è un checkout o un collegamento che attiva direttamente la Vetrina.

## Le nove varianti

Segnaposti fra parentesi graffe: dati da verificare immediatamente prima dell'invio. Saluto «Ciao {nome},», chiusura «A presto, Subingresso.it». Nei testi numerici aggiungere la nota sulle visualizzazioni; in tutti, uscita dalle offerte e recapito.

### Visualizzazioni 1 — attenzione già raccolta

**Oggetto:** {visualizzazioni} visualizzazioni per il tuo annuncio a {comune}

Negli ultimi 14 giorni «{titolo}» ha totalizzato {visualizzazioni} visualizzazioni.

La Vetrina può aiutarti a trovare prima un acquirente: dà più spazio all'annuncio nelle ricerche e negli articoli del blog pertinenti.

Puoi partire da 10 giorni a 49 €, con un pagamento unico.

**Vedi le opzioni Vetrina**

### Visualizzazioni 2 — trovare la persona giusta

**Oggetto:** Più spazio per il tuo posteggio a {comune}

Il tuo annuncio «{titolo}» ha raccolto {visualizzazioni} visualizzazioni negli ultimi 14 giorni.

Per vendere serve incontrare la persona giusta. La Vetrina mette il posteggio in evidenza nelle ricerche e nel blog, quando è pertinente.

10 giorni costano 49 €. Nessun abbonamento.

**Vedi le opzioni Vetrina**

### Visualizzazioni 3 — un periodo più lungo

**Oggetto:** {visualizzazioni} visualizzazioni. Vuoi dare più visibilità al posteggio?

«{titolo}»: {visualizzazioni} visualizzazioni negli ultimi 14 giorni.

Se vuoi farlo notare di più mentre cerchi un acquirente, puoi metterlo in Vetrina: più spazio nelle ricerche e negli articoli pertinenti.

La formula da 30 giorni costa 99 €, senza rinnovo automatico.

**Vedi le opzioni Vetrina**

### Visibilità 1 — annuncio ancora disponibile

**Oggetto:** Il posteggio a {comune} è ancora in vendita?

Se stai ancora cercando un acquirente per «{titolo}», puoi dargli più visibilità con la Vetrina.

Vendere un posteggio può richiedere tempo: farsi trovare da chi cerca nella tua zona è un passo utile.

30 giorni a 99 €, con un pagamento unico. L'annuncio resta gratuito anche se non la attivi.

**Vedi le opzioni Vetrina**

### Visibilità 2 — trenta giorni

**Oggetto:** Un mese di visibilità in più a {comune}

Per «{titolo}» puoi scegliere la Vetrina da 30 giorni: 99 €, senza abbonamento.

Il posteggio avrà più spazio nelle ricerche e negli articoli del blog pertinenti, così chi sta cercando può notarlo più facilmente.

Puoi attivarla dalla tua area personale, con il pulsante Promuovi.

**Vedi le opzioni Vetrina**

### Visibilità 3 — cominciare con dieci giorni

**Oggetto:** Vuoi dare una spinta alla vendita del posteggio?

Per il tuo posteggio a {comune}, la Vetrina è un modo per farti trovare più facilmente da chi cerca un'attività da rilevare.

L'annuncio viene messo in evidenza nelle ricerche e negli articoli pertinenti del blog.

Puoi provarla per 10 giorni a 49 €, senza rinnovo automatico.

**Vedi le opzioni Vetrina**

### Pacchetto 1 — risparmio su più posteggi

**Oggetto:** {annunci_attivi} annunci: puoi promuoverne più di uno risparmiando

Hai {annunci_attivi} annunci attivi su Subingresso.it. Se vuoi dare più visibilità a {numero} posteggi insieme, puoi usare il pacchetto Vetrine.

{numero} annunci in Vetrina per 10 giorni: {totale} invece di {listino}. Risparmi {risparmio} ({sconto}%).

Un solo pagamento, nessun abbonamento. Gli annunci avranno più spazio nelle ricerche e negli articoli pertinenti.

**Vedi i pacchetti nella tua area**

### Pacchetto 2 — un mese per più annunci

**Oggetto:** Più posteggi da vendere? C'è il pacchetto Vetrine

Quando vendi più posteggi, ogni annuncio deve trovare il suo acquirente. Per i tuoi {annunci_attivi} annunci attivi puoi scegliere un pacchetto Vetrine.

{numero} annunci in Vetrina per 30 giorni: {totale} invece di {listino}. Risparmi {risparmio} ({sconto}%).

Puoi selezionare gli annunci dalla tua area personale. Il pagamento è unico, senza rinnovo automatico.

**Vedi i pacchetti nella tua area**

### Pacchetto 3 — prezzo complessivo chiaro

**Oggetto:** Il pacchetto Vetrine per i tuoi annunci

Per dare più spazio ai tuoi {numero} annunci attivi, puoi attivare più Vetrine con uno sconto sul totale.

{numero} annunci in Vetrina per 10 giorni: {totale} invece di {listino}. Risparmi {risparmio} ({sconto}%).

I posteggi vengono messi in evidenza nelle ricerche e nel blog, negli articoli pertinenti. Nessun abbonamento.

**Vedi i pacchetti nella tua area**

Se si propone soltanto una parte degli annunci, scrivere «{numero} dei tuoi {annunci_attivi} annunci». Non dichiarare che tutti gli annunci sono in vendita o promuovibili quando non lo sono.

## Verifiche e fonti

Script privato di preparazione eseguito con query READ ONLY; controlli su venti account distinti, appartenenza e stato degli annunci, numeri nei quattordici giorni completi, prezzi/somme/risparmi dal listino condiviso e lunghezza dei testi. Nessun accesso alla chiave Resend, nessun indirizzo email o token di disiscrizione esportato. Asset prezzi online identico al locale; area personale HTTP 200. Copia preventiva remota `backup/session-20261023-124003-email-vetrine-mirate` verificata; helper con errore cleanup già noto, creazione/push del backup riusciti.

Restano da conoscere eventuali consensi raccolti fuori dal sito: domanda inviata all'utente. Non si sostituisce questa informazione con l'accettazione delle condizioni o con la preferenza alle statistiche. Riferimento locale: `PRIVACY_DATA_AUDIT_20261007.md`, punto 3 Email.

- [Garante, provvedimento 14 maggio 2026](https://www.garanteprivacy.it/web/guest/home/docweb/-/docweb-display/docweb/10262105): comunicazioni promozionali e presupposti del consenso/eccezione per vendite analoghe. Nessuna vendita live riuscita dimostrata nel progetto; non viene assunto il soft spam.
- [Resend, invio email](https://resend.com/docs/api-reference/emails/send-email): destinatario, risposta, testo/HTML e campagna.
- [Resend, chiavi di idempotenza](https://resend.com/docs/dashboard/emails/idempotency-keys): prevenzione dei retry duplicati per 24 ore.
