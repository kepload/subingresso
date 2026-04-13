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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    console.log("🚀 Avvio generazione articolo PREMIUM (Multi-step)...");
    
    // 1. Recupero titoli esistenti
    const { data: existing, error: fetchError } = await supabase.from('blog_posts').select('title').limit(30);
    if (fetchError) {
        console.error("Errore recupero blog_posts: Assicurati che la tabella esista!", fetchError.message);
        throw fetchError;
    }
    const titles = existing ? existing.map(p => p.title).join(", ") : "Nessuno";

    // STEP 1: Scelta argomento
    console.log("Step 1: Ricerca Keyword...");
    const plan = await callAI(`Sei un esperto SEO e di commercio ambulante. ARCHIVIO: [${titles}]. 
    Trova un argomento tecnico/normativo NON trattato. 
    Restituisci solo JSON: {"topic": "...", "keywords": ["kw1", "kw2"]}`);
    const planObj = cleanJSON(plan);

    // STEP 2: Scaletta
    console.log(`Step 2: Scaletta per ${planObj.topic}...`);
    const outline = await callAI(`Crea una scaletta dettagliata in 6 capitoli per l'articolo: "${planObj.topic}". 
    Focus su queste keywords: ${planObj.keywords.join(", ")}.`);

    // STEP 3: Scrittura Parte 1 (Intro e primi 2 capitoli)
    console.log("Step 3: Scrittura Parte 1...");
    const part1 = await callAI(`Scrivi la prima parte (Intro + primi 2 capitoli) dell'articolo basato su questa scaletta: ${outline}. 
    Usa HTML (h2, p, strong). Non concludere l'articolo.
    IMPORTANTE: Scrivi in modo MOLTO SEMPLICE e CHIARO. Il tuo pubblico sono venditori ambulanti (spesso anziani o stranieri). Niente burocratese o paroloni legali complessi. Usa un tono amichevole e molto pratico.`);

    // STEP 4: Scrittura Parte 2 (Capitoli centrali + Tabella)
    console.log("Step 4: Scrittura Parte 2...");
    const part2 = await callAI(`Continua l'articolo dopo questo testo: [${part1.slice(-200)}]. 
    Scrivi i capitoli 3, 4 e 5 della scaletta: ${outline}. 
    Includi una tabella HTML dettagliata (table, tr, td) con dati o costi d'esempio. Usa HTML.
    IMPORTANTE: Mantieni un linguaggio FACILISSIMO DA CAPIRE. Niente termini difficili. Fai esempi concreti legati alla vita del mercato (furgoni, posteggi, spunta).`);

    // STEP 5: Scrittura Parte 3 (Conclusioni + FAQ)
    console.log("Step 5: Scrittura Parte 3...");
    const part3 = await callAI(`Concludi l'articolo dopo questo testo: [${part2.slice(-200)}]. 
    Scrivi il capitolo 6 della scaletta: ${outline}. 
    Aggiungi una sezione FAQ con 4 domande e risposte frequenti usando HTML.
    IMPORTANTE: Rispondi alle FAQ in modo super diretto, come se parlassi a un amico al bar. Usa parole semplici.`);

    // STEP 6: Internal Linking Review
    console.log("Step 6: Revisione Link Interni...");
    const fullContent = part1 + part2 + part3;
    const finalContent = await callAI(`Analizza questo articolo: [${fullContent.slice(0, 1000)}...]. 
    Se pertinente, inserisci un link HTML naturale verso uno di questi articoli esistenti: [${titles}]. 
    Restituisci l'intero articolo aggiornato.`);

    // STEP 7: Metadata
    console.log("Step 7: Metadati SEO...");
    const metadata = await callAI(`Genera JSON per l'articolo "${planObj.topic}": {"slug": "...", "excerpt": "..."}`);
    const meta = cleanJSON(metadata);

    // 3. Pubblicazione
    const { error } = await supabase.from('blog_posts').insert({
        title: planObj.topic,
        slug: (meta.slug || planObj.topic.toLowerCase().replace(/ /g, '-')) + '-' + Date.now(),
        excerpt: meta.excerpt,
        content: finalContent,
        published_at: new Date().toISOString()
    });

    if (error) throw error;
    console.log("✅ Articolo PREMIUM pubblicato con successo!");
}

run().catch(console.error);
