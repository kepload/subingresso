# Qualità dei dati e controllo admin — 8 ottobre 2026

Intervento su sito, funzioni Supabase e database collegato. Backup iniziale: tag `backup/session-20261008-194348-data-quality-admin`, ramo remoto `backup/pre-data-quality-admin-20261008`. Nessun account o annuncio eliminato. Tutte le prove DB si chiudono con ROLLBACK, compresa la coda notifiche.

## Punti di raccolta verificati

| Punto | Dati e controlli |
| --- | --- |
| Registrazione/accesso | Nome/cognome, email, telefono facoltativo, password, provenienza: limiti e caratteri validati nel browser e in register-bypass. Telefono italiano canonico; nessuna rimozione delle lettere per rendere valido un recapito. Duplicati restituiscono errore, senza riscrivere password esistenti. Accesso e navbar non sovrascrivono più i recapiti del profilo. |
| Profilo | Nome/cognome, telefono e preferenze email: validazione modulo e trigger DB. Salvataggio dopo caricamento del profilo corrente, con conferma della riga effettivamente salvata. `is_admin`, date e campi riservati non modificabili dal client. Telefono leggibile dal proprietario o dalla funzione admin dedicata. |
| Pubblicazione/modifica annuncio | Stato, tipo, settore, località/provincia/regione, giorni/fiera, superficie, prezzo, descrizione, contatto, foto: controlli coerenti nei form e sul DB. Località selezionata dall’anagrafica, coerente con provincia e regione. Prezzo €101–400.000, superficie >0 e ≤10.000 m², massimo due decimali. Testi/dettagli entro limiti, massimo cinque URL immagini coerenti. Modifiche del venditore in revisione. Identità, date e contatori protetti. |
| Bozze/foto | Bozza isolata per UUID completo account, recupero e passaggio ospite/account testati. File originali conservati, massimo 20 MB. Errori storage/memoria e retry visibili, senza confermare pubblicazioni incomplete. |
| Avvisi annunci | Località/regione, coordinate, raggio e utente: scelta esplicita degli omonimi, 25/50/100/200/400 km. Regione = tutta la regione; vuoto = tutta Italia. DB ricalcola coordinate e rifiuta luoghi ignoti/ambigui. Notifiche rispettano raggio, regione e tipo; niente ripiego sul capoluogo o invio generalizzato per coordinate assenti. Esclusi proprietario, demo, scaduti e indisponibili. |
| Avvisi blog/bandi | Email, regione, provenienza, ID sessione/browser: email/regione valide, idempotenza anche in concorrenza. Invio troppo rapido restituisce errore reale. Iscrizione blog registrata dal server solo dopo una nuova iscrizione salvata; eliminato doppio conteggio client. |
| Valutatore/report | Incassi del posteggio, base giorno/anno, giornate, utile, posizione, sole, concessione: v2 ricalcolata sul server, combinazioni validate, richiesta idempotente e collegamento al proprietario. Corretti spazi ambigui negli importi. URL/referrer/UTM minimizzati dal DB. Admin vede dati dichiarati e versione; report storici senza dettagli esplicitamente distinti. |
| Chat/supporto | Partecipanti e annuncio coerenti con il venditore e un annuncio disponibile; supporto verso admin. Messaggi non vuoti, massimo 5.000 caratteri; autore, testo e data immutabili. Protezione doppio clic. |
| Segnalazioni | Motivi ammessi e dettagli ≤2.000 caratteri; autore/stato iniziale controllati sul server, gestione successiva amministrativa. |
| Preferiti/contatti | Identità e RLS. Contatti accettano incremento uno, esclusi proprietario/demo/indisponibili. Incremento libero visualizzazioni non più eseguibile direttamente dal client. |
| Visite/provenienze/conversioni | Percorsi senza query sensibili, origine minimizzata, date server, deduplica concorrente. Il client non può scrivere false iscrizioni blog o assegnare direttamente un utente al funnel. Revocati UPDATE/DELETE e privilegi distruttivi sulle tabelle eventi pubblici. |
| Pagamenti/Vetrina | Prezzi server, sconti ammessi, proprietà/scadenza, firma webhook, stato Stripe, pagamento incompleto e retry DB verificati con servizi simulati, senza addebiti. Admin distingue incassato/rimborsato/attivazioni in attesa; commissioni escluse. |
| Bandi/blog/fiere | Flussi editoriali amministrativi, fonti e periodi indicativi separati dai moduli pubblici. Bandi da approvare e chiamate cron visibili. Il cron HTTP eseguito non dimostra ricerca riuscita o consegna email; fonti/scadenze e date delle fiere richiedono verifica editoriale. |

## Problemi corretti

- In modifica `15000.50` poteva diventare `1500050`: resta €15.000,50.
- Telefoni con lettere mescolate alle cifre accettati dopo pulizia: respinti senza reinterpretazione.
- Grant di tabella prevalente sulle restrizioni per colonna: revocata lettura generale dei telefoni profili. Introdotta lettura privata `get_my_profile` e lettura admin dedicata.
- Funzione utenti/email admin invocabile anonimamente e TRUNCATE pubblico: revocati e testati.
- Avvisi con distanza fissa e coordinate approssimate: filtro server sulla stessa anagrafica geografica.
- Riferimenti a `pending_email_verifications`, tabella inesistente: eliminati, senza inventare stati email.
- Elenchi/conteggi tagliati dal limite di righe: directory utenti paginata e conteggi SQL completi. Campione valutazioni dichiarato. Esportazione incompleta/incoerente restituisce errore.
- Risposte sovrapposte/cambio account: il nuovo pannello scarta risposte obsolete e svuota dati riservati al cambio sessione.
- Pagine di servizio senza validatori: tutte le pagine con auth caricano data.js.

## Riepilogo admin e stato storico

In testa al profilo admin: otto indicatori, collegamenti alle attività, elenco filtrabile/paginato delle anomalie, CSV completo, stato chiamate pianificate e dettagli utenti con recapiti/preferenze. Aggiornamento ogni minuto a pagina visibile; errori e data dell’ultimo aggiornamento espliciti. Telefono facoltativo assente indicato come informazione.

Ultima verifica in sola lettura:

| Controllo | Risultato |
| --- | --- |
| Profili reali controllati | 104; nessuna anomalia nei controlli eseguiti, 2 telefoni facoltativi assenti |
| Annunci attivi/in revisione | 100; 93 con almeno un dato da verificare |
| Località/provincia da completare o verificare | 93 |
| Descrizioni sotto il nuovo minimo | 15 |
| Settori storici diversi dalle scelte attuali | 5 |
| Prezzi fuori dai limiti attuali | 3 |
| Titoli fuori dai limiti attuali | 2 |
| Annunci disponibili / scaduti | 89 / 11 |
| Iscrizioni avvisi bandi | 32 |
| Anagrafica geografica | 63.182 nomi canonici unici dai dataset già nel progetto |
| Email admin anonime / telefono generale / TRUNCATE anonimo | Tutti negati |
| Annunci di prova persistenti | 0 |

Le anomalie si sovrappongono e non vanno sommate come annunci distinti. Nessuna provincia o dichiarazione storica inventata per nascondere i problemi. Nei nomi ambigui le coordinate restano sconosciute.

## Verifiche ripetibili

- `node scripts/test-data-quality.cjs`: sintassi/dipendenze, numeri/email/telefoni/testo, registrazione server, directory oltre 2.000 utenti e risposte incomplete.
- `scripts/test-data-quality.sql`: transazione con rollback, ruoli/accessi, decimali, date/statistiche, raggio/regione/tipo destinatari, chat, deduplica eventi e admin.
- `scripts/data-quality-audit.sql`: riepilogo DB in sola lettura senza recapiti personali.
- `scripts/test-vendi.cjs`: wizard, bozze/account, foto/errori/retry, località e modifica decimali.
- `scripts/test-listing-search.cjs`: Chromium/WebKit desktop/mobile, ricerca e avvisi, località invalida, regione/tutta Italia, doppio invio, errore/retry.
- `scripts/test-admin-control-room.cjs`: Chromium/WebKit a 1440/390/320 px, riepilogo, escaping, dialog, paginazione, CSV, errori, concorrenza e cambio account.
- Regressioni: `test-valutatore.cjs` (10.368 scenari), `verify-acquisition.cjs`, `test-vetrina.cjs`.

Formato e coerenza non dimostrano verità: possesso di telefono/email, redditività, validità/trasferibilità delle concessioni richiedono prove o verifica umana. La conferma email automatica dell’accesso immediato è tecnica; i metodi storici non sono ricostruiti per ipotesi. Preferenze email di servizio non equivalgono a consenso promozionale. Gli eventi browser restano indicatori perché un bot può inventare nuove sessioni. Le stime non sono prezzi di vendite concluse. Informativa/consenso restano nel separato audit privacy del 7 ottobre.
