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
                !m.name.includes('-tts') &&
                !m.name.includes('-vision') &&
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
            { name: 'models/gemini-2.5-flash' },
            { name: 'models/gemini-2.0-flash' },
            { name: 'models/gemini-1.5-flash' },
            { name: 'models/gemini-pro' }
        ];
    }
    
    // Ordina per preferenza
    const prefs = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'];
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
                    system_instruction: { parts: [{ text: "Sei un copywriter e assistente tecnico. Rispondi SEMPRE E SOLO con il contenuto richiesto. È SEVERAMENTE VIETATO usare convenevoli, saluti, conferme o frasi introduttive come 'Certamente', 'Ecco a te', 'Ecco l'articolo'. Inizia direttamente con l'output richiesto (es. i tag HTML o il JSON)." }] },
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
                })
            });
            
            const data = await res.json();
            
            if (data.error) {
                lastError = new Error(`Errore Google AI (${targetModel}): ${data.error.message}`);
                console.warn(`[WARN] ${targetModel} ha fallito (${data.error.code}): ${data.error.message}. Provo un altro modello...`);
                continue; // Prova sempre il prossimo modello per QUALSIASI errore (quota, tts, overload, not found)
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                lastError = new Error("L'IA non ha restituito testo.");
                continue;
            }
            return text; // Trovato modello funzionante, ritorna il testo
            
        } catch (e) {
            lastError = e;
            console.warn(`[WARN] Eccezione con ${targetModel}: ${e.message}. Provo un altro modello...`);
            continue;
        }
    }
    
    throw lastError || new Error("Nessun modello Gemini disponibile al momento. Riprova più tardi.");
}

async function generateDeepArticle() {
    console.log("🚀 Inizio generazione Redazione Pratica...");

    // 0. RECUPERO TITOLI ESISTENTI
    let existingTitles = 'Nessuno';
    try {
        const { data: existingPosts } = await _supabase.from('blog_posts').select('title').limit(20);
        if (existingPosts && existingPosts.length > 0) {
            existingTitles = existingPosts.map(p => p.title).join(', ');
        }
    } catch (e) { console.warn("Errore recupero archivio:", e); }

    // 1. L'ANALISTA SEO E L'INTENTO
    console.log("1/7 - Studio dell'Intento di Ricerca...");
    const topic = await callAI(`Sei un esperto SEO per il mercato del commercio ambulante. ARCHIVIO: [${existingTitles}]. 
    Scegli un "Intento di Ricerca Popolare e Pratico". La gente cerca cose terra-terra: "Come vendere la licenza senza farsi fregare", "Quanto costa un posteggio fisso?", "Subingresso licenza: quanto tempo ci vuole?".
    Restituisci SOLO un TITOLO acchiappa-click basato su un problema reale degli ambulanti. Non fare titoli accademici o legali.`);

    // 2. I PROBLEMI
    console.log(`2/7 - Ricerca dei Problemi per: ${topic}`);
    const problems = await callAI(`Per l'articolo intitolato "${topic}", elenca 3 problemi concreti o paure che un venditore ambulante ha riguardo a questo argomento (es. burocrazia lenta, truffe, spese nascoste). Restituisci solo un breve elenco.`);

    // 3. LA SCALETTA PRATICA
    console.log("3/7 - Creazione Scaletta Pratica...");
    const outline = await callAI(`Crea una scaletta in 3 Macro-Sezioni per l'articolo "${topic}", basandoti su questi problemi: [${problems}]. 
    Le sezioni devono essere: 1) Il Problema, 2) La Soluzione Pratica (i "trucchi del mestiere"), 3) Quanto costa/Quanto tempo serve. Non fare micro-capitoli.`);

    // 4. PARTE 1 (IL PROBLEMA E I TRUCCHI)
    console.log("4/7 - Scrittura Prima Parte...");
    const contentPart1 = await callAI(`Scrivi l'Introduzione e le prime due Sezioni della scaletta: ${outline}.
    Usa HTML (h2, p, strong).
    IMPORTANTE: Scrivi "come se parlassi a un amico al bar", con tono diretto, schietto e molto semplice. Usa un linguaggio facilissimo da capire. Rivolgiti a venditori ambulanti.
    ATTENZIONE: Sviluppa paragrafi lunghi e discorsivi, niente liste infinite di puntini, niente blocchetti da 10 righe.
    DIVIETO ASSOLUTO: Non inserire mai preamboli, saluti o conferme (es. "Certo, ecco l'articolo", "Ecco a te la prima parte"). Inizia SUBITO a scrivere il contenuto HTML e basta.`);

    // 5. PARTE 2 (COSTI, TEMPI E TABELLA)
    console.log("5/7 - Scrittura Seconda Parte...");
    const contentPart2 = await callAI(`Completa l'articolo: "${topic}" sviluppando l'ultima Sezione (Costi/Tempi/Soluzione Finale) dalla scaletta: ${outline}.
    Includi una tabella HTML di esempio molto pratica.
    IMPORTANTE: Alla fine del testo, fai capire al lettore che se vuole comprare o vendere posteggi/licenze/furgoni, il posto migliore e più sicuro è inserire un annuncio o cercare su "Subingresso.it".
    Usa HTML. Linguaggio facile, schietto e diretto.
    DIVIETO ASSOLUTO: Non inserire MAI testi del tipo "Ecco la seconda parte", "Certamente, continuo l'articolo". Inizia direttamente con i tag HTML della nuova sezione.`);

    // 6. FAQ SECCHE
    console.log("6/7 - FAQ...");
    const faq = await callAI(`Per l'articolo "${topic}", scrivi 3 Domande e Risposte Frequenti.
    Usa HTML (h3, p). Fai domande secche ("E se il comune mi blocca?", "Posso vendere solo il furgone?") e risposte direttissime, senza giri di parole.
    DIVIETO ASSOLUTO: Non inserire convenevoli o introduzioni (es. "Ecco le FAQ richieste"). Inizia subito con il tag <h3> della prima domanda.`);

    // 7. SEO E ASSEMBLAGGIO
    console.log("7/7 - Rifinitura SEO...");
    const fullText = contentPart1 + contentPart2 + faq;
    const finalRaw = await callAI(`Prendi questo testo ed estrai un JSON pulito con questi campi: title, slug, excerpt, content.
    TESTO: ${fullText}
    RESTITUISCI SOLO JSON: {"title": "...", "slug": "...", "excerpt": "...", "content": "..."}`);

    try {
        const cleanJson = finalRaw.replace(/```json|```/g, '').trim();
        const match = cleanJson.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("JSON non trovato nella risposta");
        return JSON.parse(match[0]);
    } catch (e) {
        console.error("Errore parsing JSON IA:", e, finalRaw);
        return {
            title: topic,
            slug: topic.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            excerpt: "Guida pratica per operatori su aree pubbliche: problemi reali e soluzioni veloci.",
            content: fullText
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
