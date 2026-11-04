
## Teramo — ricerca provinciale del 26 ottobre 2026

Audit `data/fiere-teramo.json`: **80 manifestazioni in 32 comuni**, rispetto
alle due schede iniziali, i cui ID sono conservati. Ricognizione nominale dei
**47 comuni**, compresi quelli senza nuova scheda e Cortino, che condivide
Piano Roseto senza duplicazione. Le **7.293 schede delle altre province sono
identiche** al checkpoint `a2d44a2`. Catalogo risultante: **7.373 manifestazioni,
7.179 con dati di edizione**.

Riprese le schede pubblicate e gli audit trasversali; al checkpoint non esisteva
un audit autonomo Teramo. Confrontati calendario regionale originale (nove righe,
nessuna Teramo), 125 schede UNPLI, 56 voci dell'archivio FIVA, portali comunali,
SUAP, albi e organizzatori. Quattordici portali JavaScript consultati anche con
Playwright. **953 ricevute tecniche** conservano URL, esito e hash; non equivalgono
a 953 documenti letti integralmente. Originali e tavole visuali sono nel dossier
esterno `ricerca-fiere-teramo-20261026`, senza pubblicare PDF con nominativi.

Avvisi operativi: **Nereto San Martino 14–15 novembre**, domanda entro 2 novembre,
10 € istruttoria distinta da posteggio e canone; **Sant'Egidio Natale 6 dicembre**,
domanda entro 6 novembre, scelta 26 novembre, 42 € per 8×4 m e bollo separato,
senza presumere la ripartizione quota/canone; **Sant'Omero Immacolata 8 dicembre**,
domanda in bollo entro 7 novembre ore 14. La domanda non garantisce il posto.
Castelli: gratuità della mostra ceramica riservata a operatori con sede legale
locale e iscrizione all'Albo artigiani di Teramo, salvi oneri amministrativi.
Le selezioni di gestori Teramo/Giulianova sono distinte dai singoli espositori.

Originali recuperati anche con percorsi alternativi: Castelli tramite comando
pubblico di download dopo risposta GET con errore; Torricella tramite undici
pagine dell'indice e determina originale 138/2026; Castel Castagna tramite
regolamento 16/2022 in trasparenza. Ricorrenze e avvisi annuali restano distinti:
Assunta 14–15 agosto nel regolamento contro 15–16 nel testo secondario 2026;
Pineto con PDF estivo originale 404 e numerazione discordante, Isola e altre
fiere senza nuovo avviso preciso hanno etichette indicative, senza date inventate.

Cronaca secondaria dichiarata per dettagli non recuperati dagli originali,
fra cui Roseto estate, Atri mercato, Arsita e Mosciano Palme. VisitAtri con
errore TLS/502 non usato come prova; sito Pro Loco Colledara non risolutivo.
Locandine natalizie e FIVA lette visivamente; date 2025 non rinnovate al 2026.
Presepi, pasti, rievocazioni, solidarietà e scambi per bambini senza prova di
vendita esterna esclusi. Ingresso pubblico gratuito non significa banco gratuito.

Audit con **28 piste chiuse, 27 gruppi di esclusioni e 11 limiti**. Indici dinamici,
archivi limitati e documenti non pubblicati non certificano assenza di eventi.
Ricerca documentale attuale conclusa con questi limiti; future verifiche di
nuovi bandi, modifiche e calendari separate, senza garanzia di esaustività.
Nessun contatto, invio, email o candidatura a terzi.

Backup remoti verificati: `backup/session-20261026-081654-fiere-teramo` e
`backup/pre-fiere-teramo-20261026`. Cache JS121/JSON89. Test provinciale
`scripts/test-fiere-teramo.cjs`, browser tramite `PLAYWRIGHT_MODULE`.
Dati pubblicati nel commit `0b7cd50`, Vercel riuscito. Quattro asset online
identici ai blob Git; tutte le 80 pagine HTTP200, H1 e canonical verificati.
Build riproducibile, settori, suite generale nei cinque formati, 7.373 pagine
SSR e 3.219 voci sitemap passati. Test provinciale locale e online: elenco,
mappa, tutti gli 80 dettagli e pagine senza JavaScript nei tre formati.
Sito reale senza sostituzione degli script verificato negli stessi formati;
nessun errore JavaScript o overflow. Verificati SHA256 di 941 originali.
Prove e schermate nel dossier esterno citato. TO DO spuntata dopo questi
controlli: **68 province concluse / 42 rimanenti**. Nuove edizioni e bandi
restano manutenzione futura, distinta dalla ricerca attuale conclusa.
