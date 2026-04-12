/**
 * Subingresso.it — Generatore Articoli Blog "Deep Content"
 * NOTA: La chiave API è ora gestita tramite GitHub Secrets / Environment Variables.
 */

const GEMINI_API_KEY = window.ENV_GEMINI_API_KEY || ''; // Caricata dinamicamente
const _GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

async function callAI(prompt) {
    const res = await fetch(_GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateDeepArticle() {
    console.log("🚀 Inizio generazione articolo intelligente...");

    // 0. RECUPERO MEMORIA (Evita duplicati)
    const { data: existingPosts } = await _supabase.from('blog_posts').select('title').limit(20);
    const existingTitles = existingPosts ? existingPosts.map(p => p.title).join(', ') : 'Nessuno';

    // 1. SCELTA TOPIC (Analisi differenziata)
    console.log("1/5 - Analisi archivio e scelta tema unico...");
    const topic = await callAI(`Sei un analista senior del mercato ambulante e licenze in Italia.
    ARCHIVIO ARTICOLI ESISTENTI: [${existingTitles}]
    
    COMPITO: Individua un tema caldissimo di oggi che NON sia già stato trattato nell'archivio o che lo affronti da un'angolazione totalmente diversa e più approfondita.
    Esempi: Nuove sentenze del TAR, bandi specifici di grandi città, opportunità fiscali 2026.
    Restituisci solo il TITOLO TECNICO.`);

    // 2. CREAZIONE SCALETTA (Chiamata pulita)
    console.log(`2/5 - Progettazione struttura per: ${topic}`);
    const outline = await callAI(`TITOLO ARTICOLO: "${topic}"
    PROGETTAZIONE: Crea una struttura professionale in 5 punti chiave. 
    Includi analisi dei dati, riferimenti normativi (se applicabili) e una sezione di 'consigli d'oro' per massimizzare il valore del posteggio.
    Restituisci solo la scaletta puntata.`);

    // 3. SVILUPPO TECNICO (Chiamata pulita - Parte 1)
    console.log("3/5 - Sviluppo contenuto tecnico...");
    const contentPart1 = await callAI(`CONTESTO: Sei un esperto di diritto commerciale.
    ARGOMENTO: ${topic}
    SCALETTA: ${outline}
    
    COMPITO: Scrivi l'INTRODUZIONE e l'ANALISI TECNICA/NORMATIVA. 
    Sii estremamente dettagliato, cita leggi o regolamenti se necessario. 
    Usa HTML (h2, p, strong). Lunghezza minima: 600 parole.`);

    // 4. SVILUPPO STRATEGICO (Chiamata pulita - Parte 2)
    console.log("4/5 - Sviluppo contenuto strategico...");
    const contentPart2 = await callAI(`CONTESTO: Sei un consulente d'affari per ambulanti e titolari di licenze.
    ARGOMENTO: ${topic}
    SCALETTA: ${outline}
    
    COMPITO: Scrivi la parte relativa all'IMPATTO PRATICO, STRATEGIE DI GUADAGNO e CONSIGLI D'ORO.
    Includi una tabella HTML con pro e contro o stime di costi/ricavi. 
    Sii molto pratico. Lunghezza minima: 600 parole.`);

    // 5. SEO & ASSEMBLAGGIO (Chiamata pulita finale)
    console.log("5/5 - Rifinitura SEO e conversione JSON...");
    const finalPost = await callAI(`Prendi queste due parti di testo:
    PARTE 1: ${contentPart1}
    PARTE 2: ${contentPart2}
    
    COMPITO: Uniscile in un articolo armonioso. 
    1. Crea un titolo accattivante ottimizzato SEO.
    2. Crea un abstract (excerpt) di 150 caratteri che spinga al click.
    3. Genera uno slug url-friendly.
    4. Concludi con una CTA che invita a usare Subingresso.it per valutare la propria licenza.
    
    RESTITUISCI SOLO JSON: {"title": "...", "slug": "...", "excerpt": "...", "content": "..."}`);

    try {
        return JSON.parse(finalPost.replace(/```json|```/g, '').trim());
    } catch (e) {
        // Fallback se il JSON non è perfetto
        console.warn("IA non ha restituito JSON puro, provo a pulire...");
        const match = finalPost.match(/\{[\s\S]*\}/);
        return JSON.parse(match[0]);
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
