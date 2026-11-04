# Matera — ricerca documentale, 4 novembre 2026

**55 schede in 20 comuni**, ricognizione nominale dei **31 comuni**; catalogo
da 9.474 a **9.529**. Le 9.474 schede precedenti e i 418 riscontri economici
precedenti sono conservati identici; tre nuove sintesi di costo.
31 schede con date puntuali documentate, due con soli periodi dell’avviso
natalizio, 22 senza edizione annuale. Le edizioni 2025 restano storiche.
Ricerca documentale accessibile conclusa con limiti, non censimento certificato.
Undici comuni senza schede non sono dichiarati privi di eventi.

Audit: `data/fiere-matera.json`. Originali, estrazioni, ricevute SHA256,
selezione ed errori: `.local/ricerche/fiere-matera-20261104`.
Prove: `.local/verifiche/fiere-matera-20261104`. Le acquisizioni tecniche
non equivalgono a letture integrali o a fonti indipendenti: 35 riferimenti
utilizzati; per PDF lunghi lettura delle sezioni pertinenti e campioni visivi.

Riscontri e limiti principali:

- **Colobraro, Asparagus 2–3 maggio 2026:** dieci casette 2×2 m;
  candidatura 22 aprile, selezione e merci ordinarie da mercato escluse.
  Contributo **80 €**, istruttoria **20 € se dovuta**; canone menzionato
  senza totale inequivoco. Nessun preventivo completo o IVA dedotti.
- **Matera:** Scambi 25–26 aprile alla Camera di Commercio e 14–15 novembre
  in Piazza Vittorio Veneto, da schede originali del Circolo nel portale
  Matera Welcome. Nessun mercato continuo agosto–novembre.
  Due aree Bruna distinte: Piccianello 29 giugno–3 luglio e Rosselli fino
  al 5 luglio, da ordinanza riprodotta dalla stampa; originale collegato
  senza PDF recuperabile. Non esteso l’intero periodo della festa al mercato.
- **Natale Matera:** avviso per organizzatori scaduto 2 novembre 2026,
  periodo 4 dicembre–7 gennaio, interruzione del centro 29 dicembre–2 gennaio
  esclusa Via Don Minzoni. Non è una domanda per singoli banchi né programma
  quotidiano definitivo. Artigianato locale: istruttoria 2025 preliminare,
  senza promuovere proposte e sovrapposizioni a date confermate.
- **Policoro:** Expo fragola 25–26 aprile 2026 a Policoro, senza duplicazione
  a Scanzano. Ponte 15–17 maggio da graduatoria; Carmine e Medici mantengono
  il solo periodo presumibile del bando. Un’istanza SUAP può indicare le tre
  feste. Notte Heraclea 12 settembre: otto operatori food e due non alimentari,
  domanda 8 settembre ore 12, mezzi mobili e assegnazione cronologica.
- **Pisticci:** regolamento, 40 posteggi del centro e 66 di Marconia,
  consistenze distinte da disponibilità. Scambi Marconia: undici intervalli
  da settembre 2026 ad agosto 2027, fonte giornalistica qualificata;
  nessun mercato continuativo tra primo e ultimo appuntamento.
- **Nova Siri:** sette fiere e quattro mercati tematici/stagionali da
  regolamento. Periodi, località, categorie e termini distinti; nessuna
  edizione annuale calcolata. Segnalata discordanza 15/16 aprile per il mercato
  turistico; istanze fiere separate per manifestazione e località.
- **Grottole:** San Luca 13–14 ottobre 2026 da ordinanza 67 del 6 ottobre,
  distinta dal precedente 2025. **Gorgoglione:** programma Estate 2025
  resta 2025 anche se aggiornato nel 2026. **Garaguso:** programma ARA del
  7 novembre 2026 con area food, artigianato, animali e laboratori.
- **Rotondella:** Albicocca 4–5 luglio 2026 distinta dall’offerta gratuita
  degli stand **2025**; Pastizz 5 e 19 agosto sono due appuntamenti.
  Natale: elenco guida 20/22/23 dicembre e locandina 21/22/23 con riferimenti
  precedenti; conservato soltanto il mese. **Valsinni:** Stippa Vutt
  7 dicembre 2025, elenco e locandina discordanti sull’orario 20/19.
- **Montalbano:** esenzione CUP dei tre mercati serali **2025**, senza
  trasferirla al 2026. **Ferrandina:** “gratuito” nella pagina generale del
  servizio non certifica il banco gratuito. **Accettura:** solo periodo
  storico; data 2026 di aggregatori IA non promossa a conferma.

Fonti protette, TLS non valido, gusci JavaScript, materiale sociale e archivi
non integralmente consultabili limitano la copertura. Vecchie fiere di Anglona,
mercatino di Aliano 2017, nundine storiche e riti senza componente commerciale
non sono nuovi eventi confermati. Notorietà e affluenza non stimate.
Nuovi bandi, programmi, tariffe e rinvii restano manutenzione futura.
Nessun contatto, invio o candidatura; Pavia riservata e automazioni ferme.

Pubblicato il commit `820892d3e02de658150ede9089e60bef3e735ea2`:
Vercel produzione **Ready**, deployment `dpl_GNGxnL27FtKhtdh61m5GTVswtfyk`
(`subingresso-7d7hi99ig-kycykuardit-9234s-projects.vercel.app`).
Su `https://subingresso.it` cinque asset identici byte per byte al commit,
tutte le 55 pagine HTTP 200 con titolo, canonical, fonte e costi presenti.
Tutti i 55 dialoghi, elenco/mappa, tre costi e sette pagine senza JavaScript
superati anche online in Chromium 1440/320 e WebKit 390. Ulteriore controllo
con asset reali: font locale Jakarta, icone e impaginazione regolari nei tre
formati; richieste diverse da GET/HEAD e analytics bloccati nei test, perciò
il caricamento separato degli eventi organizzatori non è stato verificato.
Prove `published.json`, `browser-live.json`, `real-assets.json`, deployment
e schermate nella cartella privata delle verifiche. Casella 85 chiusa solo
dopo queste prove: **93 province concluse, 17 aperte su 110**.

Primo push rifiutato da GitHub per errore interno del server; remoto verificato
ancora al commit precedente, secondo push ordinario riuscito e SHA remoto
confermato. Nessun force push. Prima asserzione del controllo font troppo
specifica per il vecchio nome Google: verificato il font locale effettivo
`Subingresso Jakarta`, caricato correttamente; nessuna modifica al sito.

Verifiche locali superate: build ripetibile, settori, SEO, 9.529 pagine SSR
e 4.897 voci sitemap; 50 schede Matera indicizzabili e cinque escluse per
documentazione preliminare/storica. Suite generale nei cinque formati;
per Matera tutti i 55 dialoghi, tre costi, elenco/mappa e sette pagine senza
JavaScript per ciascuno dei formati Chromium 1440/320 e WebKit 390.
96 ricevute tecniche, 93 originali SHA256 verificati; nessuna equivalenza
con 93 documenti letti integralmente. Gitleaks staged superato.
