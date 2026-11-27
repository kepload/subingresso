# Valutatore 2.7 — 27 novembre 2026

Revisione finale richiesta dall’utente: maggiore peso alla resa giornaliera,
anche con stagioni brevi. Riferimenti commerciali, non dati di vendite concluse.
La precedente taratura resta in [storico](../docs/manuale/015-valutatore-v2-6-22-ottobre-2026.md).

## Riferimenti e curva

A 50 giornate, non alimentare, concessione stabile, utile ignoto, banco in linea
e merce riparata: passaggio laterale, zona interna e residenti danno 3.000 euro
a 100/giorno e 10.000 a 200/giorno; passaggio principale, zona turistica e
clientela mista danno rispettivamente 5.000 e 15.000.

Nodi giornalieri `[0,100,200,340,400,580,1000]`; valori deboli
`[1000,3000,10000,20400,24000,40000,74000]`, forti
`[1000,5000,15000,28250,33500,50000,95000]`.
PCHIP monotona del rapporto `(valore-1000)/incasso`, con rapporto iniziale zero:
evita sorpassi fra le curve e mantiene la coerenza a incasso annuo costante.
I raccordi, soprattutto oltre 580/giorno, sono ipotesi da validare.

Qualità fra 0 e 1: passaggio laterale/regolare/principale = 0/0,5/1, peso 0,8;
clientela mista in zona turistica +0,2; angolo +0,1. Interpolazione fra curva
debole e forte, senza deduzioni sulla nazionalità della clientela.

Fattore giornate fino a 50: `(giornate/50)^p`. Esponente 1 fino a 100/giorno,
0,75 a 200 e 0,20 da 400, con raccordi lineari. Oltre 50: `1+ln(giornate/50)`.
Il fattore modifica solo il valore oltre 1.000. Alimentare ×1,3; sole davanti
×0,95, variabile ×0,98, riparato/ignoto ×1; scadenza ignota ×0,85.

Margine noto: sulla componente oltre 1.000, minore fra ×1,5 e media geometrica
con cinque annualità del margine oltre 1.000. Tetto intero: due volte gli
incassi annui e, se noto, cinque volte il margine annuo, minimo commerciale
1.000. Fascia ±25% con margine, ±35% senza; +5 punti per risposta ignota su
clientela/passaggio/sole, +5 per prevalenza turisti, +10 per scadenza ignota;
massimo ±55%. Anche l’estremo superiore rispetta il tetto.

Canone: minore fra 18% del valore e 30% del margine annuo. Sotto 3.000,
sostegno graduale ereditato dalla v2.6, limitato dal 70% del margine e 18%
del tetto; soglia commerciale 500/anno. Senza margine dichiarato, ipotesi 20%
degli incassi per il canone. Mensile equivalente su dodici mesi.

Nessun prezzo automatico né log con concessione temporanea, meno di tre anni
residui, margine annuo dichiarato ≤200, incasso >1.000/giorno o >250.000/anno.
Giornate 1–366, settimanale massimo 53; i richiami restano
[neutri](VALUTATORE_AVVISI.md). Nessuna deduzione automatica di intento offensivo.

## Regressioni concordate

Le altre caratteristiche sono quelle dei sei esempi conservati nei test.

| Caso | Incasso/giorno | Giornate | Stima |
|---|---:|---:|---:|
| 1 | 390 | 26 | 20.084 |
| 2, alimentare | 200 | 26 | 9.359 |
| 3 | 340 | 52 | 23.608 |
| 4 | 100 | 300 | 9.755 |
| 5 | 340 | 300 | 54.534 |
| 6 | 580 | 52 | 40.719 |

## Implementazione e controlli

`js/valuation.js` è la facade corrente; `js/valuation-legacy.js` conserva
integralmente i modelli 2.0–2.6. Valutatore, report e dashboard caricano entrambi
nell’ordine corretto. I report storici continuano a usare versione e importi
originali; nessuna rivalutazione dei log esistenti.

`PATCH_VALUTATORE_V27.sql` aggiunge la RPC `save_valutazione_v27` e due funzioni
pure private in `data_quality`. Il server valida e ricalcola gli importi;
conservati limite 30/ora, lock, idempotenza, contesto ripulito e proprietà.
Claim esteso alla 2.7 e contatore admin aggiornato. Nessuna sostituzione delle
RPC storiche, nessun cambiamento a trigger email, utenti o annunci.

- `node scripts/test-valutatore.cjs`: 41.472 scenari storici.
- `node scripts/test-valutatore-v27.cjs`: 101.147 combinazioni, 143.854 controlli,
  quattro ancore, sei esempi, monotonia, continuità e versioni precedenti.
- `node scripts/test-valutatore-v27-db.cjs`: genera in `.local/` 5.598 confronti
  JS/SQL e una transazione per RPC, input ostili, idempotenza, rate limit,
  permessi, RLS e claim 2.0–2.7. Tutto con ROLLBACK; nessun dato test persistente.
- Prove browser e ricevute: `.local/verifiche/valutatore-v27/` nel worktree
  `valutatore-v27-20261127`; regressioni avvisi nella cartella vicina
  `avviso-estremi/`. Nessuna scrittura reale di prova o creazione account.
  Passati 268 controlli su Chromium 1440/320 e WebKit 390, nei due temi;
  altri 240 controlli degli avvisi su dieci configurazioni. Verificati i sei
  esempi, quattro ancore, casi senza prezzo, errore/retry e report 1.0–2.7.

Il test generale `test-data-quality.cjs` incontra un errore preesistente nella
fixture profilo (`_currentUser` assente), riprodotto sul codice di origin/main.
Non riguarda il modello o i report, verificati separatamente.

Pubblicato `65c6b3f`, Vercel `dpl_FyMsMT9yzPJorrDRaXcvmMrXyrbj` READY e alias
`subingresso.it`. Sei asset conformi e 60 controlli online su quattro
configurazioni browser PASS. Database aggiornato, 115 log storici identici e
otto funzioni storiche invariate; nessun dato test conservato. Gitleaks sul
commit passato, eseguito esplicitamente con il binario disponibile nella root.
