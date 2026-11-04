
## 💡 Strategia Monetizzazione — proposte storiche, non funzioni attive

- **NON puntare al volume annunci** ma **lead gen finanziaria verticale**.
- **Tier 1**: microcredito (PerMicro, Banca Etica).
- **Tier 2**: prestiti consumer (Cofidis/Findomestic/Compass/Younited).
- **Tier 3**: broker creditizi OAM (Auxilia, Credipass, BPIfutura) — ingresso più rapido.
- Modelli CPL EUR 15-50 o CPA 1-5%.
- **Ipotesi storica di raccolta progressiva dei contatti**: superata per la registrazione dalla richiesta del 23 ottobre (telefono obbligatorio). Non rimuovere il campo per applicare questa vecchia proposta.
- **Espansione futura** a edicole, autoscuole, compro oro (TAM affine, no leader verticale).
- **Plateau utenti realistico**: 10-20k registrati, 2.500-6.000 MAU.
- **Costi infra a regime**: anno 1 €0-20/mese (free), anno 2-3 €20-40/mese (Resend Pro), plateau €30-50/mese.
- **Stack ottimizzato futuro** (>2k utenti): Cloudflare Pages (sostituisce Vercel) + Cloudflare R2 (sostituisce Supabase Storage) + Brevo (sostituisce Resend).

### Subingresso Protetto / Trattativa Protetta (idea futura)

Obiettivo: aggiungere un servizio di tutela/accompagnamento alla compravendita di posteggi mercatali e licenze ambulanti. Subingresso non deve restare solo un portale annunci: deve diventare il posto dove trovi posteggi, confronti prezzi reali/storico venduti, riduci il rischio prima di comprare e puoi chiudere con supporto documentale/professionale.

Nomi possibili: **Subingresso Protetto**, **Trattativa Protetta**, **Controllo Documenti**. Evitare promesse forti tipo "garanzia totale", "licenza sicura al 100%" o "tutela legale garantita". Copy prudente: "Analizziamo i documenti con supporto AI e revisione umana per evidenziare anomalie, documenti mancanti e punti da verificare prima di procedere."

**Uso AI / ChatGPT**: usarlo come motore di pre-verifica documentale, NON come consulente legale automatico. Puo' leggere autorizzazione/licenza, visura, dati posteggio, regolamento mercato, bozze accordo; trovare incongruenze tra annuncio e documenti; indicare documenti mancanti; preparare domande da fare al venditore; generare checklist notaio/SUAP; produrre mini-report per acquirente/venditore. Serve comunque revisione umana/professionale prima di vendere il servizio come tutela. Per consulenza legale personalizzata serve coinvolgimento appropriato di un professionista autorizzato. Formula corretta: **pre-controllo documentale assistito da AI + revisione umana**.

**Privacy documenti**: non caricare documenti sensibili nel ChatGPT personale. Usare almeno ChatGPT Business/Enterprise o API con impostazioni business, DPA/privacy adeguati e accessi controllati. I documenti devono restare privati e non pubblici.

**Flusso consigliato**:
1. Acquirente clicca "Avvia trattativa protetta" / "Controlla documenti".
2. Paga una quota piccola di avvio/interesse serio.
3. Subingresso contatta il venditore e spiega la procedura.
4. Se il venditore accetta, carica documenti o concorda incontro.
5. AI fa pre-check e report grezzo.
6. Persona/consulente/professionista rivede il report.
7. Acquirente riceve esito: ok / attenzione / sconsigliato / documenti mancanti.
8. Se le parti procedono, upsell ad accompagnamento fino a notaio/SUAP.

Se il venditore non collabora: non incassare subito il pacchetto grosso; rimborsare quota iniziale o convertirla in credito; registrare internamente che il venditore non e' disponibile alla verifica. Regola: soldi grandi solo dopo consenso del venditore e disponibilita' documenti.

**Come convincere il venditore**: non dire "carica documenti per noi". Messaggio migliore: "Un acquirente serio ha richiesto una trattativa protetta per il tuo posteggio. I documenti non saranno pubblici: servono solo al controllo riservato prima dell'eventuale accordo." Benefici: meno perditempo, acquirente piu' serio, piu' fiducia, trattativa piu' veloce, badge "documenti disponibili/verifica completata", nessun costo iniziale nella fase base.

**Prezzi indicativi basati sui dati attuali dashboard (26 giugno 2026)**: 60 annunci totali, 50 attivi, 41 utenti, valore annunci EUR 388.900, 44 vendite + 6 affitti capitalizzati x8, media vendita posteggi circa EUR 7.293, mediana circa EUR 5.000, media fiere circa EUR 4.875, 5% mediana circa EUR 250. Conclusione: prodotto base NON deve costare troppo perche' molti affari sono piccoli.

Prezzi consigliati:
- Avvio richiesta trattativa protetta: EUR 29-49, massimo EUR 99, rimborsabile/convertibile se venditore non collabora.
- Pre-check AI automatico: EUR 49-99.
- Controllo documenti assistito da AI + revisione umana: EUR 199-349, ideale iniziale EUR 249/299.
- Trattativa protetta con chiamata e coordinamento parti: EUR 499-790.
- Accompagnamento offline fino a notaio/SUAP: da EUR 1.200.
- Caso complesso o valore alto: EUR 2.000-4.000+.

Regola per fascia valore: sotto EUR 7.500 tutela max EUR 249-399; EUR 7.500-20.000 tutela EUR 499-990; EUR 20.000-50.000 tutela EUR 1.200-2.000; sopra EUR 50.000 tutela EUR 2.000-4.000+. Prodotto core da testare per primo: **Controllo documenti assistito da AI e revisione umana a EUR 249/299**.

**Versione offline premium**: consulente raggiunge le parti, controlla documenti, coordina venditore/acquirente, accompagna all'atto dal notaio, segue pratica SUAP/subingresso, tutela entrambe le parti senza sostituirsi a notaio/avvocato. Non lanciare subito nazionale: pilot Lombardia + Emilia-Romagna + Veneto con piccola rete di consulenti/professionisti partner.

**Posteggi venduti / storico prezzi**: collegato alla tutela. Spingere i venditori a usare "Segna come venduto" invece di eliminare. Motivo: storico prezzi, fiducia, protezione compratori, dati proprietari difficili da copiare. Solo `sold` deve diventare archivio pubblico; `deleted` resta nascosto. Sezione possibile: "Posteggi venduti", "Storico prezzi posteggi mercatali", "Prezzi reali dei posteggi mercatali". Sui venduti mostrare titolo, comune/regione, tipo mercato/fiera, settore, prezzo richiesto (non finale se non confermato), superficie, giorni mercato, data pubblicazione, data venduto. Nascondere telefono, WhatsApp, chat, email, contatti venditore.

**Posizionamento**: non vendere Subingresso solo come "portale annunci". Posizionamento migliore: **"Il mercato trasparente dei posteggi mercatali"** oppure **"Compra e vendi posteggi mercatali con prezzi piu' chiari"**. Differenza competitor: annunci verticali, storico prezzi, dati di mercato, controllo documenti, trattativa piu' sicura. Parola chiave: **trasparenza**.

### Outreach partner (priorizzato per fase trazione)
- **Subito (Tier 1, zero attrito)**: registrazione su **Awin Italia** + **Adtraction** (network affiliate aggregano Cofidis/Younited/Hype/CrediPass). Outreach LinkedIn a **broker creditizi OAM** (Auxilia Finance, Credipass, BPIfutura) — affamati di lead, no soglia volume. Email a fornitori italiani (**Gazebo Italiano, GAM, Bilance Vetrino**) per partnership tipo Amazon-affiliate ma diretta (5-10% margine vs 3% Amazon, no cookie 24h). **Banca Etica** sì (brand-aligned, accetta volumi piccoli come content partnership).
- **Aspettare 60-90gg (Tier 2, hanno CRM "rifiutato")**: **Cofidis Business** (`02 366 16 334`, programma "Diventa Partner" con 25k+ partner), **PerMicro** (`permicro.it/membership`), **Banche grandi** (Sella, BPM). **Se rifiutano oggi con 3-4k pageviews chiudono la porta per 2-3 anni**. Soglia di credibilità minima: ~10k pageviews/mese + 1 case study lead venduto via network affiliate.
- **6+ mesi**: associazioni di categoria (ANA-UGL, Confimprese ambulanti, Federconfcommercio) — lente ma cumulative SEO/backlinks.
- **Annunciambulanti.it riassessment** (8 mag 2026): fatturato stimato **€1-3.5k/mese** (NON €100-500 come prima stima): hanno AdSense (caricato JS, non visibile in static fetch), vetrine paywall progressivo nel form di vendita, Amazon affiliate 4-prodotti (gazebo/pesi/luci LED/tavoli alluminio). **Zero partner finanziari diretti** → first-mover totale per Subingresso nel verticale.

### Espansione multi-vertical (architettura proposta, anno 2+)
- **TAM aggregato 10 verticali italiani** (tabacchi 50k, posteggi 150k, autoscuole 7k, balneari 10k, distributori 22k, farmacie 20k, edicole 12k, compro-oro 10k, taxi 30k, bar/ristoranti 330k): **~25-40k cessioni/anno, GMV €2.5-9 miliardi/anno**. SOM realistico Subingresso a 5 anni = **€100-700k ARR** (mediana €300-500k). NON VC fundable, sì angel/exit M&A €1-5M.
- **Top picks da aggredire (in ordine)**: **Tabacchi** (TAM 10x, asset €100-500k = vetrine €99-399 plausibili, zero competitor verticale) → **Stabilimenti balneari** (timing Bolkestein 2027) → **Autoscuole** (clean play, no competitor).
- **Architettura tecnica**: path-based `/posteggi/*` `/tabacchi/*` ecc., NO subdomain (frammenta SEO). Single-table inheritance: `annunci` aggiunge `vertical text` enum + `vertical_fields jsonb` (validazione lato app). Tabella `vertical_pricing(vertical, tier, days, price_cents)` per pricing differenziato. Codice in `js/verticals/<slug>.js` registry con config (wizardSteps, cardFields, filters, brandColor, blogCategory). Costo nuovo verticale = **3-5 giorni dev + 20 articoli SEO**. Account/chat/vetrine/lead-gen restano cross-vertical.
- **Migrazione SEO-safe**: tieni `/annunci`, `/blog`, `/vendi`, `/annuncio` come alias di `/posteggi/*` per 12-18 mesi prima di 301-redirect. Niente perdita autorità.

### Filoni editoriali identificati (da SC, 9 mag 2026)
- **"quanto costa un posteggio al mercato"** — query informazionale top-volume, 0 clic su 4 impressioni → atterra su `quanto-vale-un-posteggio-mercatale` (titolo correlato ma non perfetto). Articolo dedicato `quanto-costa-un-posteggio-al-mercato` con H1 IDENTICO + CTA al valutatore = quick win.
- **"mercati settimanali [città]"** — Modena impressioni raddoppiate (2→4) ma nessuna pagina dedicata. Pattern replicabile su top 10 città mercatali (Modena, Brescia, Bergamo, Milano, Bologna, Torino, Verona, Padova, Firenze, Napoli).
- **"mercati ambulanti [regione]"** — Piemonte CTR 40% confermato. Replicare per Lombardia, Veneto, Emilia-Romagna, Toscana, Lazio. Intent diverso dai bandi-* (informational vs concorso pubblico).
