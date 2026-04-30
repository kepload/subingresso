# Informazioni Operative

## Sessione 29 Aprile 2026

- Registrazione: decisione prodotto = gli utenti devono poter entrare subito anche senza email verificata. La verifica email diventa non bloccante e va recuperata piu' avanti.
- `register-bypass`: deve creare/abilitare l'utente con `email_confirm: true`, salvare la mail in `pending_email_verifications`, creare/aggiornare `profiles`, e non bloccare mai la registrazione per errori di tracking verifica.
- Edge Functions modificate in repo ma NON deployate automaticamente da Vercel: `register-bypass` e `admin-recent-users` vanno deployate su Supabase manualmente/CLI.
- Deploy CLI tentato: `supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`, bloccato per mancanza `SUPABASE_ACCESS_TOKEN`.
- Ruota welcome: deve apparire subito dopo registrazione partita dal popup (`sessionStorage._reg_src='popup'`). Il profilo riceve `welcome_lottery_eligible=true`; registrazione normale invece `false`.
- Admin utenti recenti: non usare solo `auth.users.email_confirmed_at` per dire "Confermata", perche' il bypass lo valorizza per permettere login. Usare `email_verified=false` se esiste riga non verificata in `pending_email_verifications`.
- Commit principali: `455d053 Allow immediate signup access`, `055a123 Recover from signup function errors`, `e6a1f68 Show pending email verification in admin`.

## Sessione 30 Aprile 2026

- Verificato end-to-end il flusso utente con Chrome headless e Supabase reale: registrazione nuovo utente, ripresa pubblicazione da `vendi.html`, creazione annuncio `status='pending'`, cleanup account/annuncio via `delete_my_account()`.
- Corretto flusso pubblicazione: se l'utente clicca "Pubblica" da anonimo, dopo registrazione/login il submit riprende automaticamente e precompila nome/telefono dal profilo. Commit: `19df5cf Harden registration and listing flow`.
- `register-bypass` in repo e' stato reso piu' robusto: email normalizzata, client Supabase service_role senza sessione persistente, profilo/log verifica non fatali. In produzione pero' la function rispondeva ancora 500 finche' non viene deployata.
- Aggiunta Edge Function `grant-welcome-vetrina`: applica la vetrina welcome solo con JWT valido e annuncio di proprieta'. Il frontend la chiama solo se `localStorage._welcome_vetrina_won_<userId>='1'`, evitando chiamate/RPC inutili nel percorso normale.
- Deploy Supabase non eseguito: serve `SUPABASE_ACCESS_TOKEN`. Comandi utili:
  - `npx.cmd supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`
  - `npx.cmd supabase functions deploy grant-welcome-vetrina --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`
- Migliorato supporto Password Manager Chrome/Google: campi auth con `name`/`autocomplete` corretti e chiamata a `navigator.credentials.store()` dopo login/registrazione riusciti. Commit: `619a778 Improve password manager support`.
- Migliorato feedback del bottone finale in `vendi.html`: al click mostra subito "Verifica in corso...", poi "Pubblicazione in corso..."; se manca login o validazione fallisce, il bottone si riattiva. Commit: `385bb5e Improve listing submit feedback`.
- Stato SEO da ricordare: Search Console mostra sitemap riuscita con 44 URL, ma solo 2 pagine indicizzate e 21 "Rilevata, ma attualmente non indicizzata". Priorita' futura: pagine regionali/landing long-tail e backlink settoriali/locali.
