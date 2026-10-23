# Regole comuni — Subingresso.it (Claude e Codex)

Questa è l'unica fonte delle regole operative del progetto. `CLAUDE.md` importa
questo file per compatibilità con Claude; non mantenere un secondo riepilogo.
Le richieste correnti dell'utente prevalgono sulle preferenze storiche.

## Comunicazione e ambito

- Risposte italiane, brevi e semplici; spiegare il risultato per l'utente.
  Dashboard con pochi numeri utili e dettagli apribili.
- Agire nel perimetro richiesto. Vecchi TODO, cron e autorizzazioni di altre
  attività non autorizzano nuovi interventi, invii o contatti a terzi.
- Annunci, utenti e relativi dati non si eliminano, neppure con soft delete,
  senza richiesta esplicita. Wizard `vendi.html`, trigger annunci e schema
  email/Resend si modificano solo se necessari al lavoro autorizzato.
- Dati e statistiche devono essere veri e descritti correttamente: non
  inventare consensi, date, vendite, copertura, consegne o promesse commerciali.
  L'eccezione richiesta per i contatori dimostrativi della home è documentata
  nel registro: non convertirli né presentarli come dati reali di propria iniziativa.

## Letture mirate e memoria

Non leggere integralmente manuale, registro o dossier fiere
all'avvio di ogni attività. Dopo queste regole, cercare con `rg` il tema e
leggere soltanto codice, sezioni e contratti pertinenti.

| Serve capire | Fonte da consultare quando pertinente |
|---|---|
| Architettura, flussi, bug e motivazioni tecniche | `istruzioni.md` |
| Decisioni dell'utente, attività aperte e pubblicazioni | `Subingresso.it informazioni.md` |
| Fiere, fonti, copertura e limiti provinciali | `data/FIERE.md`, audit `data/fiere-*.json` e checklist nel registro |
| Organizzatori ed eventi | `data/ORGANIZZATORI_EVENTI.md` |
| Vetrine e pacchetti | `data/VETRINE_PREMIUM.md`, `data/SELLER_PREMIUM_ANALYTICS.md` |
| Offerte email, consensi e misura | `data/VETRINA_EMAIL.md`, `data/EMAIL_CONVERSION_ANALYTICS.md` |
| Tema, immagini, luoghi e fiere salvate | Rispettivi contratti `data/THEME_PREFERENCES.md`, `data/IMAGE_PREVIEWS.md`, `data/LOCALITA.md`, `data/FIERE_SALVATE.md` |
| Annunci preferiti | Sezione «Saved Listings» del manuale e helper in `js/data.js` |
| Interfaccia e prodotto | `DESIGN.md`, `PRODUCT.md` |

Codice e configurazioni effettive descrivono l'implementazione. Schema e servizi
live vanno verificati prima di interventi che li coinvolgono. Date, numeri e
versioni nei registri sono snapshot, non prova dello stato corrente.
Aggiornare il documento interessato quando cambiano una regola o un contratto;
registrare gli esiti significativi in poche righe, senza copiarli in tutti i file.
A fine sessione, se l'utente chiede di salvare/chiudere, conservare solo novità
utili e non duplicate. Le regole comuni si aggiornano soltanto qui.

## Prima di modificare e workflow Git

- Root attuale: `C:\Users\utente\Desktop\Ardit\subingresso.it`.
  Repo pubblico `https://github.com/kepload/subingresso`, sito `https://subingresso.it`.
  Controllare stato, diff e ultimi commit; preservare modifiche e checkout altrui.
- Prima della prima modifica della sessione eseguire dalla root
  `.\scripts\session-backup.ps1 -Reason "descrizione-corta"` e verificare il tag
  su origin. Non serve per sola analisi. L'helper può fallire nella pulizia dei
  vecchi tag dopo un push riuscito: distinguere errore cleanup e backup remoto.
- Prima di modifiche estese (almeno 10 file) o configurazioni centrali creare
  anche un ramo remoto `backup/pre-...`. Non ripristinare né cancellare lavoro
  corrente automaticamente per risolvere conflitti.
- Dopo il lavoro autorizzato: verifiche pertinenti, commit e push su origin;
  includere solo i file dell'intervento. Mai `git add .` con modifiche estranee.
  Su Vercel il push avvia il deploy: dichiarare pubblicato soltanto dopo verifica.
- Non aggiungere segreti o file oltre 50 MB, non bypassare gitleaks/pre-commit
  o push protection. Non riscrivere la history o fare force push senza richiesta.

## Segreti e isolamento dei dati

- Nessuna credenziale in file versionati, output o report. Secret Supabase,
  Stripe, Resend, Gemini e password restano negli environment o archivi privati.
  Leggere `.claude/settings.local.json` solo quando serve davvero una credenziale;
  non stamparla. La chiave frontend pubblicabile è pubblica per design.
- SQL con credenziali: template `:'service_jwt'` e variabile psql, oppure file
  temporaneo fuori repo. Mai recuperare una chiave per scriverla in un file del repo.
  In caso di esposizione, sanitizzare e segnalare la rotazione necessaria.
- `annunci`/`profiles`: colonne esplicite; telefono/email sono protetti, niente
  `select('*')` autenticato né join PostgREST `profiles(...)` da annunci/chat.
  Recapiti propri tramite RPC previste (`get_listing_contact`, `get_my_profile`);
  accessi admin tramite RPC autorizzate. Nuove colonne richiedono grant coerenti.
- Cache di nome, telefono, preferiti e bozze legate all'utente verificato;
  logout/cambio identità puliscono lo stato. Ignorare risposte tardive di altri utenti.
- Testo utente nel DOM con `escapeHTML()`; contenuto blog con DOMPurify.
  Verificare RLS e permessi quando cambiano query o schema; non alterare dati
  storici per ipotesi e non eseguire test che inviano email o creano dati reali.

## Implementazione e verifiche

- Stack: HTML, JavaScript vanilla, Tailwind precompilato, API Vercel e Supabase.
  Cercare tutti i consumatori, inclusi template SSR, prima di cambiare helper o asset.
- Windows PowerShell 5.1: comandi separati, controllo degli exit code, niente
  `&&`/`||`. Evitare `2>&1` sui programmi nativi; scrivere UTF-8 esplicito.
  Commit con testi complessi: file temporaneo e `git commit -F`.
- Tailwind: controllare che la classe esista; nuove utility richiedono rebuild
  con `npx.cmd tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`.
  Controllare ordine e specificità degli stili. Dopo modifiche aggiornare tutti
  i riferimenti `?v=`, anche in SSR e import dei worker. Le versioni effettive
  sono nei sorgenti: non mantenere elenchi congelati delle versioni "correnti".
- Patch puntuali: evitare riscritture regex ampie e caratteri invisibili.
  Enum JS e vincoli DB allineati; date/aggregazioni con confini UTC coerenti.
  Supabase JS: RPC con `await` e `try/catch`, non `.rpc(...).catch(...)`.
- Prima di toccare pubblicazione, trigger, pagamenti, email o SSR leggere la
  relativa sezione del manuale e il contratto aggiornato. Conservare giorni già
  acquistati, compatibilità dei report storici, deduplica, consensi e isolamento.
- Eseguire verifiche proporzionate al cambiamento; per UI controllare i formati
  pertinenti e per SQL preferire fixture in transazione con ROLLBACK. Per soli
  documenti verificare contenuti, rimandi e diff senza lanciare test del sito.
