# Informazioni Operative

## Sessione 29 Aprile 2026

- Registrazione: decisione prodotto = gli utenti devono poter entrare subito anche senza email verificata. La verifica email diventa non bloccante e va recuperata piu' avanti.
- `register-bypass`: deve creare/abilitare l'utente con `email_confirm: true`, salvare la mail in `pending_email_verifications`, creare/aggiornare `profiles`, e non bloccare mai la registrazione per errori di tracking verifica.
- Edge Functions modificate in repo ma NON deployate automaticamente da Vercel: `register-bypass` e `admin-recent-users` vanno deployate su Supabase manualmente/CLI.
- Deploy CLI tentato: `supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`, bloccato per mancanza `SUPABASE_ACCESS_TOKEN`.
- Ruota welcome: deve apparire subito dopo registrazione partita dal popup (`sessionStorage._reg_src='popup'`). Il profilo riceve `welcome_lottery_eligible=true`; registrazione normale invece `false`.
- Admin utenti recenti: non usare solo `auth.users.email_confirmed_at` per dire "Confermata", perche' il bypass lo valorizza per permettere login. Usare `email_verified=false` se esiste riga non verificata in `pending_email_verifications`.
- Commit principali: `455d053 Allow immediate signup access`, `055a123 Recover from signup function errors`, `e6a1f68 Show pending email verification in admin`.
