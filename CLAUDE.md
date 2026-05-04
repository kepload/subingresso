# Regole Claude — Subingresso.it

- Quando l'utente dice che sta per chiudere la sessione (es. "chiudo", "a dopo", "fine sessione", "salva tutto"), aggiorna `istruzioni.md` con tutte le info utili emerse nella sessione (solo info non duplicate, super riassuntive).
- Leggi sempre `istruzioni.md` prima di iniziare a lavorare su qualsiasi task.

## 🚨 Regole anti-leak segreti (dopo incidente 4 mag 2026)

- **MAI hardcodare segreti in file versionati** (`.sql`, `.md`, `.ts`, `.js`, `.json`, ecc.). Il repo è pubblico su GitHub.
- Segreti significa: `sb_secret_*`, JWT `eyJ...service_role`, API keys (Stripe, Resend), password DB, token amministrativi.
- **PATCH SQL che richiedono una chiave**: scrivere il file come template con variabile psql (`:'service_jwt'`) e applicarlo via `psql -v service_jwt="$KEY"`. OPPURE creare il file SQL fisicamente in `/tmp/` (fuori dal repo), applicarlo, eliminarlo.
- **MAI recuperare una chiave via query DB e iniettarla in un Write/Edit** verso un path dentro il repo.
- **Pre-commit hook gitleaks attivo** in `.git/hooks/pre-commit` — se rileva un segreto blocca il commit. Non bypassare con `--no-verify` se non sei certo al 100%.
- **Push protection GitHub attiva** — secondo strato di sicurezza lato server.
- Se una chiave finisce in un commit per errore: 1) sanitizza il file, 2) dì all'utente di ruotarla su Supabase Dashboard, 3) riscrivi la history con `git filter-branch` + force-push.
