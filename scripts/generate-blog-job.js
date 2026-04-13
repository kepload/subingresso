const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

// Configurazione dai Secrets di GitHub
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funzione di attesa per rispettare i limiti API (2 RPM)
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function callAI(prompt) {
    console.log(`...attendo 45 secondi prima della prossima chiamata API (limite sicurezza)...`);
    await wait(45000);
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "Sei un copywriter e assistente tecnico. Rispondi SEMPRE E SOLO con il contenuto richiesto. È SEVERAMENTE VIETATO usare convenevoli, saluti, conferme o frasi introduttive come 'Certamente', 'Ecco a te', 'Ecco l'articolo'. Inizia direttamente con l'output richiesto (es. i tag HTML o il JSON)."
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text) throw new Error("Risposta vuota dall'IA");
        return text;
    } catch (err) {
        console.error("Errore chiamata Gemini:", err.message);
        throw err;
    }
}

function cleanJSON(text) {
    try {
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Impossibile estrarre JSON dalla risposta: " + text.slice(0, 100));
    }
}

async function run() {
    console.log("🚀 Avvio generazione articolo PREMIUM (Mega-Redazione)...");
    
    // 1. Recupero titoli esistenti
    const { data: existing, error: fetchError } = await supabase.from('blog_posts').select('title').limit(30);
    if (fetchError) {
        console.error("Errore recupero blog_posts: Assicurati che la tabella esista!", fetchError.message);
        throw fetchError;
    }
    const titles = existing ? existing.map(p => p.title).join(", ") : "Nessuno";

    // STEP 1: Scelta Intento Popolare
    console.log("Step 1: Ricerca Intento...");
    const plan = await callAI(`Sei un esperto SEO per venditori ambulanti. ARCHIVIO: [${titles}]. 
    Scegli un "Intento di Ricerca Popolare e Pratico". La gente cerca: "Come vendere la licenza in fiera", "Quanto costa un furgone negozio usato?", "Passaggio di proprietà posteggio: errori da evitare".
    Restituisci SOLO JSON: {"topic": "...", "keywords": ["kw1", "kw2"]}. Scegli un tema molto concreto e pratico.`);
    const planObj = cleanJSON(plan);

    // STEP 2: I Problemi
    console.log(`Step 2: Ricerca Problemi per ${planObj.topic}...`);
    const problems = await callAI(`Per l'articolo intitolato "${planObj.topic}", elenca 3 problemi concreti, paure o fregature che un venditore ambulante rischia di affrontare su questo tema (es. costi nascosti, tempi biblici in Comune, truffe). Sii breve.`);

    // STEP 3: Scaletta Pratica
    console.log("Step 3: Scaletta...");
    const outline = await callAI(`Crea una scaletta in 3 Macro-Sezioni per l'articolo "${planObj.topic}", basata su questi problemi: [${problems}]. 
    Focus: 1) Il Problema reale, 2) Le Soluzioni e i trucchi del mestiere, 3) Costi e Tempi. Niente micro-capitoli.`);

    // STEP 4: Scrittura Parte 1
    console.log("Step 4: Scrittura Parte 1...");
    const part1 = await callAI(`Scrivi l'Introduzione e la Prima Sezione della scaletta: ${outline}. 
    Usa HTML (h2, p, strong). Non concludere l'articolo.
    IMPORTANTE: Scrivi in modo MOLTO SEMPLICE, schietto e diretto. Il tuo pubblico sono venditori ambulanti (spesso anziani o stranieri). Niente burocratese.
    ATTENZIONE: Sviluppa paragrafi lunghi e fluidi. Niente liste della spesa, niente testo frammentato.
    DIVIETO ASSOLUTO: Non inserire mai preamboli o saluti iniziali (es. "Certo, ecco l'articolo"). Inizia SUBITO con l'HTML.`);

    // STEP 5: Scrittura Parte 2 (Costi e Trucchi)
    console.log("Step 5: Scrittura Parte 2...");
    const part2 = await callAI(`Continua l'articolo dopo questo testo: [${part1.slice(-200)}]. 
    Scrivi le ultime due Sezioni (Soluzioni/Trucchi e Costi/Tempi) della scaletta: ${outline}. 
    Includi una tabella HTML molto pratica (es. stima costi, documenti necessari).
    IMPORTANTE: Mantieni un linguaggio FACILISSIMO e schietto. Fai esempi da mercato. Paragrafi corposi, evita i micro-paragrafi.
    DIVIETO ASSOLUTO: Non inserire convenevoli. Inizia direttamente con i nuovi tag HTML.`);

    // STEP 6: FAQ
    console.log("Step 6: FAQ...");
    const part3 = await callAI(`Per l'articolo "${planObj.topic}", scrivi una sezione conclusiva "FAQ Rapide" con 3 domande e risposte.
    Usa HTML (h3, p). Fai domande secche che un ambulante ti farebbe al bar ("Ma il comune può bloccarmi?") e rispondi in 2 righe in modo chiarissimo.
    DIVIETO ASSOLUTO: Non inserire frasi introduttive. Inizia subito con <h3>.`);

    // STEP 7: Internal Linking & Conversion
    console.log("Step 7: Conversion & Link...");
    const fullContent = part1 + part2 + part3;
    const finalContent = await callAI(`Analizza questo articolo: [${fullContent.slice(0, 1000)}...]. 
    Fai 2 cose:
    1. Inserisci un link HTML naturale verso uno di questi articoli (se pertinente): [${titles}].
    2. ALLA FINE dell'articolo, aggiungi una "Call To Action" potente: dì al lettore che se vuole comprare o vendere una licenza, un posteggio o un furgone senza impazzire, deve cercare o mettere un annuncio gratis su Subingresso.it.
    Restituisci l'intero articolo HTML aggiornato.`);

    // STEP 8: Metadata
    console.log("Step 8: Metadati SEO...");
    const metadata = await callAI(`Genera JSON per l'articolo "${planObj.topic}": {"slug": "...", "excerpt": "..."}.
    L'excerpt deve essere super pratico e invogliare l'ambulante a leggere (max 150 caratteri).`);
    const meta = cleanJSON(metadata);

    // Pubblicazione
    const { error } = await supabase.from('blog_posts').insert({
        title: planObj.topic,
        slug: (meta.slug || planObj.topic.toLowerCase().replace(/ /g, '-')) + '-' + Date.now(),
        excerpt: meta.excerpt,
        content: finalContent,
        published_at: new Date().toISOString()
    });

    if (error) throw error;
    console.log("✅ Articolo PREMIUM (Mega-Redazione) pubblicato con successo!");
}

run().catch(console.error);
