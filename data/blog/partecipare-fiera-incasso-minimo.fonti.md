# Partecipare a una fiera: incasso minimo prima di pagare

Punto **8**, unico incarico della sessione nuova **Codex 1 del 14 novembre 2026**. Titolo assegnato mantenuto integralmente. Slug originale `partecipare-fiera-incasso-minimo`.

## Ambito e duplicati

Elenco dei **143 post LIVE** letto prima di scrivere e conservato nel dossier privato. Nessun calcolatore specifico per il pareggio economico dell'intera fiera, distinto dal compenso proprio desiderato. Contenuti vicini: `autorizzazione-temporanea-sagre-fiere-ambulanti` riguarda requisiti e preparazione; `quanto-deve-incassare-banco-convenire` il banco in generale; `fiere-lombardia-corrente-acqua-parcheggio` i servizi inclusi; `fiera-annullata-maltempo-rimborso-posteggio` gli eventuali rimborsi. Non modificati.

Il prospetto applica un metodo economico ai dati forniti dal lettore. Non è una rilevazione di incassi reali, una promessa di vendita, un calcolo fiscale o una previsione di cassa. Esempi tutti inventati, chiaramente dichiarati. Nessuna soglia di convenienza o tariffa universale.

## Fonti primarie

Originali scaricati **HTTP 200 il 14 novembre 2026**; URL iniziale/finale, ora, dimensione e SHA256 in `fonti-ricevute.json` nel dossier privato.

- [Camera di commercio di Torino: Come costruire il preventivo economico](https://www.to.camcom.it/51-come-costruire-il-preventivo-economico). Fonte didattica per costi fissi/variabili, equilibrio economico e distinzione dal reddito netto. Nessuna rilevazione sulle fiere. SHA256 HTML `cd6ce0ff49e3fc2a3b70921ca91f46ed92790a0b45a4b519ca82b312fc1744c0`.
- [Progetti d'impresa, Città metropolitana di Bologna: Vademecum per futuri imprenditori](https://www.bo.camcom.gov.it/sites/default/files/promozione-interna/sportello-genesi/Progetti_d_impresa_Vademecum_per_futuri_imprenditori.pdf#page=43), ospitato dalla Camera di commercio. Edizione **settembre 2020**, pagina PDF **43**, stampata **33**: margine di contribuzione percentuale e pareggio a fatturato. Consultazione aggiornata della fonte didattica, senza presentarla come indagine del 2026. SHA256 PDF `21dbc4c1ed9457365810900020ec9c73acc572b46ffc52754491d915f5421167`.
- [Comune di Brescia: Partecipazione alla Fiera dei SS. Faustino e Giovita](https://www.comune.brescia.it/it/servizi/partecipazione-alla-fiera-dei-ss-faustino-e-giovita). Pagina aggiornata il **28 agosto 2026**: indica il CUP nei costi. Citata soltanto come esempio locale di voce da verificare; nessun importo ripreso, nessuna estrapolazione nazionale. SHA256 HTML `2eebd8b2831eeea8d0b1daf1bebfdde06f15d01cde6a0d5128964027e7a4e67c`.

## Metodo e limiti

Si sceglie un unico evento, da uno a 31 giorni. Le voci dei costi coprono l'intero evento; quota, pratiche, viaggio/mezzo, parcheggi/pedaggi, pernotti/pasti aggiuntivi, aiuti pagati, servizi, quota documentata di costi generali e altri costi. Zero indica assenza verificata. Tutte le voci sono richieste, evitando che una cella vuota venga interpretata come zero.

- Margine sulle vendite = (vendite di riferimento − merce venduta − altri variabili dello stesso periodo) / vendite di riferimento.
- Costi da coprire = somma delle nove voci dell'evento, senza merce e altri variabili già nel margine.
- Vendite di pareggio = costi / margine; obiettivo con compenso = (costi + compenso proprio desiderato) / margine.
- Acquisti necessari = obiettivo / vendita media, arrotondato per eccesso; sono transazioni, non visitatori. Obiettivo giornaliero = obiettivo / giorni, media indicativa.
- Residuo delle vendite previste = previsione vendite × margine − costi; differenza rispetto al compenso = residuo − compenso desiderato.

Il modello assume incidenza dei variabili, prezzi e assortimento coerenti nello scenario. Il compenso proprio precede imposte e contributi, che il file non calcola. Vendite, costi e vendita media richiedono base IVA coerente, da verificare con il commercialista; la soglia non è automaticamente il totale lordo del registratore. Merce venduta distinta dagli acquisti di scorte; scarti/commissioni, servizi e costo del mezzo senza doppio conteggio. Residuo diverso da reddito netto e da liquidità. Investimenti, scorte iniziali, anticipi e scadenze richiedono un piano separato. Il lavoro proprio/familiare e l'attività alternativa rinunciata vanno valutati: non viene dedotta una convenienza automatica.

Esempio interamente inventato: costi 160 + 70 + 20 + 50 = **300 euro**; vendite di riferimento 1.000, merce 600, altri variabili zero → margine **40%**; pareggio **750 euro**, compenso desiderato **120** → obiettivo **1.050**; vendita media 15 → **70 acquisti**. Con previsione 900, residuo **60**, differenza dal compenso **−60**. Se il margine scende al 30%, l'obiettivo diventa **1.400**. Non sono risultati osservati.

## Risorsa e verifiche

`downloads/calcolo-incasso-minimo-fiera.xlsx`: cinque fogli Istruzioni, Calcolo, Esempio, Documenti, Fonti. Calcolo vuoto, esempio dichiarato; celle gialle per input, verdi per risultati. Margine non positivo e dati mancanti/testuali/negativi/booleani bloccano i risultati. Giorni interi 1–31, vendite di riferimento e vendita media positive. Vendite previste ammesse a zero. Descrizione evento e periodo/merce/base IVA obbligatorie.

**264 scenari PASS, 2.376 confronti**: formule definitive lette dal file con `formulas.ExcelModel` e confrontate con aritmetica Python indipendente. Entrambi i fogli, ogni input numerico mancante/testuale/numero come testo/negativo/booleano, descrizioni assenti o invalide, margine nullo/negativo/100%, più giorni e limiti, previsione nulla, compenso nullo, costi nulli, centesimi, transazioni arrotondate e 25 scenari numerici indipendenti per foglio. Controllate le cache iniziali, l'archivio ZIP, le convalide e l'assenza di macro, connessioni e workbook esterni. Non avviati Excel o LibreOffice; il motore usato è dichiarato.

Pareggio e obiettivo arrotondati per eccesso al centesimo; stabilizzazione numerica prima dell'arrotondamento per evitare centesimi aggiuntivi dovuti alla rappresentazione binaria. La media giornaliera è esposta a due decimali. Controllo esplicito dei testi oltre a ISNUMBER per escludere i numeri incollati come testo anche nel motore di verifica.

SHA256 definitivo XLSX: `7d9a8b33f1941c9df407181776bdb0319f3bae3f0c48b5a727eb740af26f02b7`.

Copertina originale IA, WebP **1600×900**, controllata visivamente, scena inventata dichiarata; prompt esatto in `.prompt.md`. SHA256 `d2408b375c5e9fd590a52e88ec014c4c25fc5f2b86cc9f7097f95ec2da18f387`.

Dossier privato: `.local/lavori/articoli/ripresa-codex1-20261114-1710/articolo-08/` nella root principale. Checkpoint JSON/Markdown e registro operazioni prima/dopo le operazioni remote; ricevute, fonti, script e screenshot nello stesso dossier. Nessun invio, dato reale di prova o intervento su template, CSS, JS, API e servizi condivisi.

## Anteprima verificata

Verificatore adattato dal modello `netto-vendita-banco-20261113` e dal suo successivo adattamento per l'articolo 7, senza eseguire vecchi modi mutativi. **Cinque percorsi PASS**: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Sei h2, tre punti iniziali, **655 parole** visibili, due ADS distinti, canonical/titolo/descrizione/NewsArticle e spazio Vetrine conformi. Nessun overflow o errore JavaScript; download effettivo WebKit tramite server locale con SHA256 identico. Scritture analytics e provider intercettati; schermate desktop/320 e copertina esaminate.

Lettura senza JS verificata nell'effettiva visibilità di corpo, titolo e articolo, con copertina caricata. Un'attesa iniziale basata su un solo intervallo e poi su requestAnimationFrame non ha certificato la fine dell'animazione nella fixture: sostituita nel solo verificatore con osservazioni separate dal processo di test. Controllo isolato su articolo precedente e nuova anteprima riuscito; nessuna modifica agli stili o al contenuto per ottenere il risultato. Ricevute diagnostiche conservate nel dossier.

## Pubblicazione verificata il 14 novembre 2026

Materiali commit `7d340ffbe9fc856741fed6db36ac7e41a9f7e75e`, push dal worktree esclusivo con main remoto ancora sulla base attesa. Hook pre-commit e gitleaks effettivamente eseguiti, nessun rilievo. Deploy Vercel **success**, [ricevuta](https://vercel.com/kycykuardit-9234s-projects/subingresso/FFf7ZFJXJqtKSqaaeRLqGL1SYmCf). Copertina e XLSX pubblici HTTP 200 con SHA256 uguali ai definitivi prima dell'inserimento e alla verifica successiva.

Schema, vincoli, trigger e duplicati LIVE riletti subito prima dell'INSERT: nove colonne, PK id, slug univoco, nessun trigger applicativo. **Un solo INSERT**, nessun UPDATE/DELETE. Record `2417ae73-9a74-4ef8-a341-8b87b65f3888`, `published_at` **2026-11-14 16:29:25.474059+00:00** (**17:29:25 in Italia**). [Articolo pubblico](https://subingresso.it/blog?post=partecipare-fiera-incasso-minimo).

**Cinque percorsi browser online PASS**: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Download effettivo WebKit identico al definitivo; nessun overflow o errore JavaScript. Lettura senza JS visibile, copertina caricata; titolo/descrizione/canonical/NewsArticle conformi. Indice e sitemap contengono il nuovo slug; collegamenti interni rispondono HTTP 200. Scritture analytics e provider intercettati. Tutti i **143 post precedenti invariati nei nove campi**, **144 totali**. Nessun invio o dato reale di prova.

Ricevute principali: `push-materials.json`, `deploy-materiali.json`, `schema-prima-inserimento.json`, `prima-inserimento.json`, `pubblicazione.json`, `integrita-dopo-inserimento.json`, `asset-pubblici.json`, `asset-finali.json`, `verifica-pubblica.json`, `verifica-formule.json`, file `*-anteprima-verificata.json` e `*-online-verificato.json`. Memoria ed elenco aggiornati soltanto per il punto 8; consegna finale `result.json`/`result.md` nel dossier privato.
