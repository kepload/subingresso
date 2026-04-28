-- ============================================================
--  SUBINGRESSO.IT — 10 Annunci Demo / Seed
--  Eseguire nel SQL Editor di Supabase.
--  Associati all'account admin (is_admin = true).
--  ATTENZIONE: da eliminare quando arrivano annunci veri.
-- ============================================================

INSERT INTO annunci (user_id, titolo, descrizione, stato, tipo, settore, regione, provincia, comune, superficie, giorni, prezzo, contatto, status, created_at, expires_at, img_urls, dettagli_extra)
VALUES

-- 1. Milano — Abbigliamento donna, Mercato Porta Genova
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Vendo posteggio abbigliamento donna — Mercato Porta Genova, Milano',
  'Cedo causa pensionamento posteggio fisso di 12 mq al Mercato coperto di Porta Genova. Posizione centrale, primo banco davanti all ingresso principale, massima visibilita. Attivita avviata nel 2008, clientela fidelizzata e affezionata da anni. Inclusa tutta l attrezzatura: due banconi in acciaio, struttura portaabiti doppia, cassettiera, tendaggi e illuminazione. Il posteggio gira bene tutti i giorni grazie al traffico del quartiere Navigli e dei turisti. Unico motivo della vendita: vado in pensione. Solo acquirenti seri con disponibilita finanziaria reale.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'MI', 'Milano',
  12, 'Lunedì, Mercoledì, Venerdì, Sabato',
  58000, 'Carla M.',
  'active',
  now() - interval '18 days',
  now() - interval '18 days' + interval '200 days',
  '{}', '{}'
),

-- 2. Sirmione — Calzature, Mercato del Venerdì
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Posteggio calzature in vendita — Mercato di Sirmione',
  'Vendo posteggio fisso al mercato del venerdi di Sirmione, in pieno centro storico a 200 metri dalle Grotte di Catullo. Il venerdi e il giorno clou del Garda: migliaia di turisti italiani e stranieri, piu i residenti della zona. Settore calzature con 11 anni di presenza continuativa. Posizione privilegiata all angolo tra due file di banchi, visibilita da entrambi i lati. Attrezzatura completa inclusa nel prezzo: espositori scarpe, banchetto metallico, ombrellone rinforzato, cassaforte portatile. Cedo per trasferimento in altra regione. Disponibile a mostrare i documenti del posteggio e la posizione esatta prima di qualsiasi accordo.',
  'Vendita', 'Fisso', 'Calzature', 'Lombardia', 'BS', 'Sirmione',
  9, 'Venerdì',
  44000, 'Marco V.',
  'active',
  now() - interval '7 days',
  now() - interval '7 days' + interval '200 days',
  '{}', '{}'
),

-- 3. Lazise — Bigiotteria e accessori
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Vendo posteggio bigiotteria e accessori — Lazise, Lago di Garda',
  'Cedo posteggio fisso di 6 mq al mercato del lunedi di Lazise, uno dei mercati piu frequentati della sponda veronese del Garda. Settore bigiotteria, accessori moda e borse. La stagione estiva (maggio-settembre) garantisce una affluenza straordinaria con turisti da tutta Europa, soprattutto tedeschi e olandesi che comprano volentieri. I mesi invernali sono piu tranquilli ma la clientela locale e costante. Attivita avviata 8 anni fa. Cedo per motivi familiari. Disponibile a un breve periodo di affiancamento per la prima stagione. Prezzo trattabile per acquirente serio.',
  'Vendita', 'Fisso', 'Bigiotteria e accessori', 'Veneto', 'VR', 'Lazise',
  6, 'Lunedì',
  28000, 'Elena R.',
  'active',
  now() - interval '31 days',
  now() - interval '31 days' + interval '200 days',
  '{}', '{}'
),

-- 4. Torri del Benaco — Tessuti e merceria
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Posteggio tessuti e merceria in vendita — Torri del Benaco',
  'Vendo posteggio fisso di 8 mq al mercato del giovedi di Torri del Benaco. Settore tessuti, stoffe, filati e merceria. Clientela locale molto affezionata, composta principalmente da signore che tornano ogni settimana da anni. Il posteggio e presente nel mercato dal 2009 e ha una reputazione consolidata. Posizione centrale nella piazza del mercato, ottima visibilita. Inclusa attrezzatura completa: banconi, portarotoli, teli, struttura e pesi. Cedo per pensionamento, non per problemi con il posteggio o con i colleghi del mercato. Disponibile a cedere anche lo stock di merce residua a prezzo di costo concordato a parte.',
  'Vendita', 'Fisso', 'Tessuti e merceria', 'Veneto', 'VR', 'Torri del Benaco',
  8, 'Giovedì',
  19000, 'Giovanna F.',
  'active',
  now() - interval '45 days',
  now() - interval '45 days' + interval '200 days',
  '{}', '{}'
),

-- 5. Desenzano del Garda — Abbigliamento uomo/donna
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Posteggio abbigliamento 15 mq — Grande Mercato di Desenzano del Garda',
  'Vendo posteggio fisso di 15 mq al mercato del martedi di Desenzano, uno dei mercati piu grandi della provincia di Brescia. Centinaia di banchi, migliaia di visitatori ogni settimana, mix di residenti e turisti. Il posteggio e in zona centrale con ottimo passaggio pedonale. Settore abbigliamento uomo e donna, 12 anni di attivita continuativa senza interruzioni. Ottimo giro di affari sia in estate con il turismo lacustre che in inverno con i residenti. Attrezzatura completa: appendiabiti, banconi, ombrellone, impianto luci. Cedo perche sto aprendo un negozio fisso. Documentazione in ordine. Trattativa riservata.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Desenzano del Garda',
  15, 'Martedì',
  38000, 'Roberto A.',
  'active',
  now() - interval '12 days',
  now() - interval '12 days' + interval '200 days',
  '{}', '{}'
),

-- 6. Verona — Frutta e verdura, Mercato rionale
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Cedo posteggio ortofrutta — Mercato rionale Porta Vescovo, Verona',
  'Vendo posteggio ortofrutta di 10 mq al mercato rionale di Porta Vescovo, quartiere residenziale consolidato di Verona. Tre giorni a settimana: martedi, giovedi e sabato. Clientela locale fidelizzata, molti acquirenti fissi che vengono da anni. Zona con alta densita abitativa e poca concorrenza. Attivita avviata nel 2015, nessun problema burocratico, concessione regolare e rinnovata. Incluse due bilance certificate, cassettame in plastica, ombrellone rinforzato e struttura frigo portatile. Cedo per pensionamento anticipato per motivi di salute. Preferisco cedere a chi vuole continuare nel settore e mantenere la clientela che ho costruito.',
  'Vendita', 'Fisso', 'Frutta e verdura', 'Veneto', 'VR', 'Verona',
  10, 'Martedì, Giovedì, Sabato',
  23000, 'Luigi B.',
  'active',
  now() - interval '22 days',
  now() - interval '22 days' + interval '200 days',
  '{}', '{}'
),

-- 7. Bergamo — Pelletteria e borse
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Vendo posteggio pelletteria e borse — Bergamo, mercato weekend',
  'Cedo posteggio fisso di 7 mq nel mercato del weekend in zona Bergamo, percorso turistico con altissima affluenza. Settore pelletteria: borse, cinture, portafogli e accessori in pelle. I weekend in questa zona registrano passaggi di turisti italiani e stranieri, soprattutto nelle stagioni di mezzo. Presente da 7 anni con posizione stabile e clientela turistica affezionata. Il posteggio lavora prevalentemente sabato e domenica: ottimo per chi vuole combinare con un altra attivita durante la settimana. Inclusi espositori in metallo, bacheche porta-borse, valigia porta-campionario. Cedo per cambio settore commerciale. Prezzo fermo, situazione documentale pulita.',
  'Vendita', 'Fisso', 'Pelletteria e borse', 'Lombardia', 'BG', 'Bergamo',
  7, 'Sabato, Domenica',
  32000, 'Stefania C.',
  'active',
  now() - interval '38 days',
  now() - interval '38 days' + interval '200 days',
  '{}', '{}'
),

-- 8. Peschiera del Garda — Oggettistica e casalinghi
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Posteggio oggettistica e casalinghi in vendita — Peschiera del Garda',
  'Vendo posteggio fisso di 10 mq al mercato del mercoledi di Peschiera del Garda. Settore oggettistica, casalinghi e articoli da regalo. Peschiera e una delle mete piu frequentate del Garda Veronese, con turismo tutto l anno grazie al Gardaland e alle strutture ricettive. Clientela mista: residenti della zona e vacanzieri. Attivita avviata 6 anni fa con inserimento progressivo nel mercato locale. Posizione nella zona centrale del mercato, tra due incroci di file. Inclusi banconi metallici, ombrellone rinforzato, espositori girevoli. Cedo per motivi di salute. Disponibile breve periodo di accompagnamento per chi non conosce il mercato.',
  'Vendita', 'Fisso', 'Oggettistica', 'Veneto', 'VR', 'Peschiera del Garda',
  10, 'Mercoledì',
  17500, 'Antonio P.',
  'active',
  now() - interval '55 days',
  now() - interval '55 days' + interval '200 days',
  '{}', '{}'
),

-- 9. Como — Abbigliamento bambino
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Vendo posteggio abbigliamento bambino — Mercato di Camerlata, Como',
  'Cedo posteggio fisso di 8 mq al mercato di Camerlata, quartiere residenziale di Como con alta densita di famiglie con bambini. Due giorni a settimana: lunedi e giovedi. Settore abbigliamento bambino 0-14 anni. 10 anni di presenza continuativa nello stesso posteggio, clientela di mamme e nonni fidelizzata che torna ogni stagione per i cambi di taglia. Il mercato di Camerlata e frequentato quasi esclusivamente da residenti locali: clientela seria e acquirente. Tutta l attrezzatura inclusa: appendiabiti per bambini, scaffali, bancone, tendaggio. Possibile presa in carico del stock di merce residua a prezzo concordato. Solo acquirenti seri.',
  'Vendita', 'Fisso', 'Abbigliamento bambino', 'Lombardia', 'CO', 'Como',
  8, 'Lunedì, Giovedì',
  25000, 'Mirella G.',
  'active',
  now() - interval '9 days',
  now() - interval '9 days' + interval '200 days',
  '{}', '{}'
),

-- 10. Brescia — Abbigliamento donna, Affitto annuale
(
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),
  'Affitto posteggio abbigliamento donna — Mercato Via Triumplina, Brescia',
  'Affitto posteggio fisso di 9 mq al mercato di Via Triumplina, Brescia. Due giorni a settimana: martedi e sabato. Settore abbigliamento donna. Zona residenziale consolidata del quartiere Triumplina, clientela locale affezionata e stabile. Cerco subentro serio per periodo minimo 2 anni con opzione di rinnovo. Tutta l attrezzatura e inclusa: bancone, struttura portaabiti, ombrellone. Il posteggio e funzionante e in regola, nessun arretrato con il Comune. Ideale per chi vuole iniziare senza l investimento iniziale di un acquisto, o per chi cerca un secondo posteggio da aggiungere. Disponibile a incontrarsi sul mercato per mostrare la posizione.',
  'Affitto', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Brescia',
  9, 'Martedì, Sabato',
  2400, 'Federico N.',
  'active',
  now() - interval '14 days',
  now() - interval '14 days' + interval '200 days',
  '{}', '{}'
);

-- ── Verifica: mostra gli annunci appena inseriti ──
SELECT id, titolo, comune, prezzo, stato, status, created_at
FROM annunci
ORDER BY created_at DESC
LIMIT 15;
