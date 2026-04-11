const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");

// Configurazione dai Secrets di GitHub
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function callAI(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function run() {
    console.log("🚀 Avvio generazione articolo giornaliero...");
    
    // 1. Recupero titoli esistenti per evitare duplicati
    const { data: existing } = await supabase.from('blog_posts').select('title').limit(20);
    const titles = existing ? existing.map(p => p.title).join(", ") : "";

    // 2. Chiamate concatenate (Deep Content)
    const topic = await callAI(`Sei un esperto di commercio ambulante in Italia. ARCHIVIO: [${titles}]. Trova un tema caldissimo di oggi NON trattato. Restituisci solo il TITOLO.`);
    const outline = await callAI(`Crea una scaletta professionale per: "${topic}". Solo punti elenco.`);
    const content = await callAI(`Scrivi un articolo tecnico di 1200 parole basato su questa scaletta: ${outline}. Usa HTML (h2, p, strong, table). Includi una tabella di costi/ricavi. Sii autorevole.`);
    const metadata = await callAI(`Per questo articolo: ${content}. Genera JSON: {"slug": "...", "excerpt": "..."}`);

    const meta = JSON.parse(metadata.replace(/```json|```/g, '').trim());

    // 3. Pubblicazione
    const { error } = await supabase.from('blog_posts').insert({
        title: topic,
        slug: meta.slug + '-' + Date.now(),
        excerpt: meta.excerpt,
        content: content,
        published_at: new Date().toISOString()
    });

    if (error) throw error;
    console.log("✅ Articolo pubblicato con successo!");
}

run().catch(console.error);
