const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

// Configurazione dai Secrets di GitHub
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funzione di attesa per rispettare i limiti API (2 RPM)
const wait = (ms) => new Promise(res => setTimeout(ms, res));

async function callAI(prompt) {
    console.log("...attendo 45 secondi prima della prossima chiamata API...");
    await wait(45000); // Pausa di 45 secondi tra ogni richiesta
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function run() {
    console.log("🚀 Avvio generazione articolo giornaliero (MODALITÀ SLOW ATTIVA)...");
    
    // 1. Recupero titoli esistenti
    const { data: existing } = await supabase.from('blog_posts').select('title').limit(20);
    const titles = existing ? existing.map(p => p.title).join(", ") : "";

    // 2. Chiamate concatenate con pause pesanti
    console.log("Step 1: Scelta argomento...");
    const topic = await callAI(`Sei un esperto di commercio ambulante in Italia. ARCHIVIO: [${titles}]. Trova un tema tecnico o normativo NON trattato. Restituisci solo il TITOLO.`);
    
    console.log("Step 2: Creazione scaletta...");
    const outline = await callAI(`Crea una scaletta professionale per: "${topic}". Solo punti elenco.`);
    
    console.log("Step 3: Scrittura contenuto Deep (1200 parole)...");
    const content = await callAI(`Scrivi un articolo tecnico di oltre 1200 parole basato su questa scaletta: ${outline}. Usa HTML (h2, p, strong, table). Sii estremamente autorevole e includi consigli pratici.`);
    
    console.log("Step 4: Generazione metadati SEO...");
    const metadata = await callAI(`Per questo articolo: ${content}. Genera un JSON pulito: {"slug": "...", "excerpt": "..."}`);

    const meta = JSON.parse(metadata.replace(/```json|```/g, '').trim());

    // 3. Pubblicazione
    const { error } = await supabase.from('blog_posts').insert({
        title: topic,
        slug: (meta.slug || topic.toLowerCase().replace(/ /g, '-')) + '-' + Date.now(),
        excerpt: meta.excerpt || "",
        content: content,
        published_at: new Date().toISOString()
    });

    if (error) throw error;
    console.log("✅ Articolo pubblicato con successo!");
}

run().catch(console.error);
