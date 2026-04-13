/**
 * Subingresso.it — Generatore Articoli Blog "Deep Content"
 */

async function callAI(prompt) {
    const apiKey = window.ENV_GEMINI_API_KEY || '';
    if (!apiKey) throw new Error("GEMINI_API_KEY mancante o non valida.");
    
    let validModelsList = [];
    try {
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        
        if (modelsData.error) {
             throw new Error(`Errore permessi API Key: ${modelsData.error.message}`);
        }
        
        if (modelsData.models) {
            validModelsList = modelsData.models.filter(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes('generateContent') && 
                m.name.includes('gemini') && 
                m.name !== 'models/gemini-pro'
            );
        }
    } catch (err) {
        if (err.message.includes('permessi') || err.message.includes('nessun modello')) {
            throw err; // Rilancia errori critici
        }
        console.warn("Impossibile caricare lista modelli, uso default.", err);
    }
    
    if (validModelsList.length === 0) {
        validModelsList = [
            { name: 'models/gemini-1.5-flash' },
            { name: 'models/gemini-2.0-flash' }
        ];
    } else {
        // Forza l'inserimento del modello gratuito e veloce nel caso l'API non lo elenchi
        const ensureModels = ['models/gemini-1.5-flash'];
        ensureModels.forEach(m => {
            if (!validModelsList.find(v => v.name === m)) {
                validModelsList.push({ name: m, supportedGenerationMethods: ['generateContent'] });
            }
        });
    }
    
    // Ordina per preferenza: prima i modelli più leggeri/veloci e meno soggetti a limiti
    const prefs = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.5-pro', 'gemini-2.5-flash'];
    validModelsList.sort((a, b) => {
        let idxA = prefs.findIndex(p => a.name.includes(p));
        let idxB = prefs.findIndex(p => b.name.includes(p));
        if (idxA === -1) idxA = 99;
        if (idxB === -1) idxB = 99;
        return idxA - idxB;
    });

    let lastError = null;

    for (const modelObj of validModelsList) {
        const targetModel = modelObj.name.replace('models/', '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
                })
            });
            
            const data = await res.json();
            
            if (data.error) {
                lastError = new Error(`Errore Google AI (${targetModel}): ${data.error.message}`);
                // Se è sovraccarico o la quota è superata (o a zero per quel modello), passa al prossimo
                const isOverloaded = data.error.message.toLowerCase().includes('high demand') || data.error.code === 503;
                const isQuota = data.error.code === 429 || data.error.message.toLowerCase().includes('quota');
                
                if (isOverloaded || isQuota) {
                    console.warn(`[WARN] ${targetModel} inaccessibile (${data.error.code}). Provo un altro modello...`);
                    continue; 
                }
                throw lastError; // Se è un altro errore, fermati
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                lastError = new Error("L'IA non ha restituito testo.");
                continue;
            }
            return text; // Trovato modello funzionante, ritorna il testo
            
        } catch (e) {
            lastError = e;
            if (e.message.toLowerCase().includes('high demand') || e.message.toLowerCase().includes('quota')) {
                continue;
            }
            throw e;
        }
    }
    
    throw lastError || new Error("Nessun modello Gemini disponibile al momento. Riprova più tardi.");
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
