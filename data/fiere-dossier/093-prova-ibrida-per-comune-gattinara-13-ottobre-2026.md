
## Prova ibrida per comune — Gattinara, 13 ottobre 2026

Tre schede aggiunte: **Fiera di San Martino**, **Mercatino Rosa e Rosso di Maggio**
e **LUVA · Festa dell’Uva**. È una ricerca sul solo comune di Gattinara,
non sull’intera provincia di Vercelli. Nessun nuovo articolo di blog.

`fiere-comuni.json` conserva fonti, hash, problemi e approvazione Codex.
Il build applica questi audit al singolo comune dopo gli override provinciali,
senza modificare gli altri eventi. Codex sceglie le fonti, verifica dati e
ammissioni e decide l’inclusione. Il programma assegna gli ID delle prove,
estrae i contatti e controlla i doppioni; Qwen3.8-27B Q6 individua i passaggi
pertinenti e prepara note di poche frasi. Sei richieste locali concluse in
circa 250 secondi: tre ricerche di prove e tre note; due note conservate
integralmente, una ritoccata per ridurre le frasi e chiarire l’edizione conclusa.
Questi esiti non certificano accuratezza generale o risparmio cloud.

- [San Martino, avviso comunale](https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044):
  10 novembre 2026, 8–18; domanda entro 16 ottobre solo sportello SPID/CIE;
  nessuna spunta. Concessionari del martedì mantengono il posto. Stalli 45 m²,
  10 × 4,5 m; PagoPA entro 2 novembre, importo non pubblicato.
- [Rosa e Rosso, mercatino](https://visitgattinara.it/notizie/iscrizione-mercatinini-rosa-rosso-maggio-2026):
  30–31 maggio 2026; termine 15 maggio. Quote distinte per hobbisti,
  somministratori e associazioni, non generalizzate agli ambulanti professionali.
  Corrente non fornita e bombole vietate. Edizione conclusa e vecchi moduli 404.
- [LUVA, iscrizioni espositori](https://visitgattinara.it/notizie/luva-2026-iscrizioni-aperte):
  4–6 settembre è il periodo della festa, non una conferma delle singole
  giornate dei banchi (`periodOnly`). Termine, quote e categorie non documentati;
  vecchio modulo 404. Nuove edizioni da verificare, nessuna iscrizione aperta inferita.

**Limiti:** ricerca documentale non esaustiva, calendario regionale PDF non
recuperato integralmente e Natale 2026 non confermato nelle fonti selezionate.
Nessun posto libero, ammissione o ricavo garantiti; nessuna domanda inviata.
Codice, fonti complete, risposte locali e contabilità fuori repository:
`Documents/AI-Fiere-Gattinara-20261013`. Invio dei microtask ora diretto via API
autenticata: nessuna nuova sessione cloud per ogni richiesta locale.

Ricontrollata anche la produzione: il precedente catalogo Padova è ora online
con 2.491 schede e 95 eventi di Padova; i deployment GitHub/Vercel risultano
riusciti. La segnalazione di pubblicazione pendente del 12 ottobre è storico.
