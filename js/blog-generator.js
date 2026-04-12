/**
 * Subingresso.it — Generatore Articoli Blog "Deep Content"
 * NOTA: La chiave API è ora gestita tramite GitHub Secrets / Environment Variables.
 */

const GEMINI_API_KEY = window.ENV_GEMINI_API_KEY || ''; // Caricata dinamicamente
const _GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

async function callAI(prompt) {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY mancante o non valida.");
    
    const res = await fetch(_GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
    });
    
    const data = await res.json();
    
    if (data.error) {
        console.error("Errore API Gemini:", data.error);
        throw new Error(`Errore Google AI: ${data.error.message}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        console.error("Risposta API inattesa:", data);
        throw new Error("L'IA non ha restituito testo. Riprova tra un istante.");
    }
    return text;
}

async function generateDeepArticle() {
    console.log("🚀 Inizio generazione articolo intelligente...");

    // 0. RECUPERO TITOLI ESISTENTI
    let existingTitles = 'Nessuno';
    try {
        const { data: existingPosts } = await _supabase.from('blog_posts').select('title').limit(20);
        if (existingPosts && existingPosts.length > 0) {
            existingTitles = existingPosts.map(p => p.title).join(', ');
        }
    } catch (e) { console.warn("Errore recupero archivio:", e); }

    // 1. SCELTA TOPIC
    console.log("1/5 - Scelta tema...");
    const topic = await callAI(`Sei un esperto di commercio ambulante. ARCHIVIO: [${existingTitles}]. Individua un nuovo tema tecnico/normativo caldissimo per il blog. Restituisci solo il TITOLO.`);

    // 2. SCALETTA
    console.log(`2/5 - Scaletta per: ${topic}`);
    const outline = await callAI(`Crea una scaletta professionale in 5 punti per l'articolo: "${topic}".`);

    // 3. PARTE 1
    console.log("3/5 - Sviluppo Parte 1...");
    const contentPart1 = await callAI(`Scrivi la prima parte (Intro + Analisi tecnica) dell'articolo: "${topic}". Usa HTML (h2, p, strong). Sii professionale.`);

    // 4. PARTE 2
    console.log("4/5 - Sviluppo Parte 2...");
    const contentPart2 = await callAI(`Completa l'articolo: "${topic}" con consigli pratici e una tabella HTML di esempio. Usa HTML.`);

    // 5. SEO & ASSEMBLAGGIO
    console.log("5/5 - Rifinitura...");
    const finalRaw = await callAI(`Prendi questo testo ed estrai un JSON pulito con questi campi: title, slug, excerpt, content.
    TESTO: ${contentPart1} ${contentPart2}
    RESTITUISCI SOLO JSON: {"title": "...", "slug": "...", "excerpt": "...", "content": "..."}`);

    try {
        // Pulizia aggressiva del JSON
        const cleanJson = finalRaw.replace(/```json|```/g, '').trim();
        const match = cleanJson.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("JSON non trovato nella risposta");
        return JSON.parse(match[0]);
    } catch (e) {
        console.error("Errore parsing JSON IA:", e, finalRaw);
        // Fallback manuale se l'IA impazzisce col JSON
        return {
            title: topic,
            slug: topic.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            excerpt: "Nuova guida tecnica per operatori su aree pubbliche.",
            content: contentPart1 + contentPart2
        };
    }
}

// Esporta per l'uso
window.generateAndPublish = async function() {
    const post = await generateDeepArticle();
    console.log("✅ Articolo generato con successo!", post.title);
    
    // Pubblica su Supabase
    const { data, error } = await _supabase.from('blog_posts').insert({
        title: post.title,
        slug: post.slug + '-' + Math.floor(Math.random()*1000),
        excerpt: post.excerpt,
        content: post.content,
        published_at: new Date().toISOString()
    });

    if (error) {
        console.error("Errore pubblicazione:", error);
        throw error;
    } else {
        console.log("Articolo pubblicato!");
        if (typeof loadAdminBlog === 'function') loadAdminBlog();
        alert("Articolo 'Deep Content' pubblicato con successo!");
    }
};
