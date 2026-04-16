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
    const topic = await callAI(`Sei un esperto SEO per il mercato del commercio ambulante italiano.
    ARCHIVIO TITOLI GIÀ PUBBLICATI (ASSOLUTAMENTE VIETATI - non ripetere né parafrasare nessuno di questi): [${existingTitles}]

    REGOLA ASSOLUTA: l'argomento scelto deve essere COMPLETAMENTE DIVERSO da tutti i titoli in archivio. Se l'archivio contiene già articoli su "licenza", "vendere" o "prezzo", scegli un tema diverso.

    TEMI TRA CUI SCEGLIERE (preferisci quelli assenti dall'archivio): costi annui del posteggio, differenza tra mercato settimanale e giornaliero, come trovare un buon posteggio, burocrazia del subingresso step by step, errori nel contratto di affitto posteggio, come valutare un posteggio prima di comprarlo, tasse e contributi dell'ambulante, mercati più redditizi d'Italia, passaggio di licenza ambulante, consigli per il primo anno da ambulante, furgone attrezzato comprare o affittare, come aumentare il fatturato al mercato, posteggio fisso vs itinerante.

    Restituisci SOLO il titolo dell'articolo, senza spiegazioni.`);

    const STILE = `
REGOLE DI STILE (rispetta sempre):
- Tono: come se parlassi a un amico al bar. Diretto, schietto, semplice.
- Ogni <h3> introduce un sotto-argomento e deve essere seguito da MAX 2-3 paragrafi brevi (3-4 righe ciascuno).
- Usa <strong> per evidenziare concetti chiave (1-2 per paragrafo, non di più).
- Per i consigli pratici usa questo box evidenziato: <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:1rem 1.2rem;margin:1.2rem 0;border-radius:8px"><strong>💡 Consiglio pratico:</strong> testo del consiglio.</div>
- VIETATO: paragrafi di 10+ righe, elenchi puntati infiniti, linguaggio tecnico/legale.
- VIETATO ASSOLUTO: preamboli, saluti, conferme tipo "Ecco l'articolo", "Certamente". Inizia SEMPRE con il primo tag HTML.`;

    // 2. I PROBLEMI
    console.log(`2/10 - Problemi per: ${topic}`);
    const problems = await callAI(`Per l'articolo "${topic}", elenca 3 problemi concreti o paure tipiche di un venditore ambulante su questo tema (es. burocrazia, truffe, spese nascoste). Solo un elenco breve.`);

    // 3. LA SCALETTA
    console.log("3/10 - Scaletta...");
    const outline = await callAI(`Crea una scaletta per l'articolo "${topic}" con questi problemi come base: [${problems}].
    Struttura: 3 macro-sezioni, ognuna con 2 sotto-punti specifici.
    Sezione 1: "Il Problema" (cosa va storto nella realtà).
    Sezione 2: "Come Si Fa" (trucchi pratici, step concreti).
    Sezione 3: "Numeri e Tempi" (costi reali, tempi burocratici, cosa aspettarsi).
    Restituisci solo la scaletta, senza commenti.`);

    // 4. INTRO HOOK
    console.log("4/10 - Intro...");
    const intro = await callAI(`Scrivi l'introduzione dell'articolo intitolato "${topic}".
    L'intro deve: iniziare con una domanda o una situazione concreta che il lettore riconosce subito, poi spiegare in 2-3 frasi di cosa parlerà l'articolo e perché vale la pena leggerlo fino in fondo.
    Usa <p> e <strong>. MAX 3 paragrafi totali.
    ${STILE}`);

    // 5. SEZIONE 1 — IL PROBLEMA
    console.log("5/10 - Sezione 1: Il Problema...");
    const sezione1 = await callAI(`Scrivi la prima macro-sezione dell'articolo "${topic}" seguendo questa scaletta: [${outline}].
    Concentrati solo sulla parte "Il Problema": spiega cosa va storto nella realtà, con esempi concreti e situazioni che il lettore ambulante conosce bene.
    Struttura: <h2>titolo sezione</h2>, poi 2 sotto-argomenti ognuno con <h3>titolo</h3> e 2-3 paragrafi brevi.
    ${STILE}`);

    // 6. SEZIONE 2 — LA SOLUZIONE
    console.log("6/10 - Sezione 2: Come Si Fa...");
    const sezione2 = await callAI(`Scrivi la seconda macro-sezione dell'articolo "${topic}" seguendo questa scaletta: [${outline}].
    Concentrati solo sulla parte "Come Si Fa": dai consigli pratici e trucchi del mestiere step by step.
    Struttura: <h2>titolo sezione</h2>, poi 2 sotto-argomenti ognuno con <h3>titolo</h3> e 2-3 paragrafi brevi. Aggiungi almeno 1 box consiglio pratico.
    ${STILE}`);

    // 7. SEZIONE 3 — NUMERI E TEMPI
    console.log("7/10 - Sezione 3: Numeri e Tempi...");
    const sezione3 = await callAI(`Scrivi la terza macro-sezione dell'articolo "${topic}" seguendo questa scaletta: [${outline}].
    Concentrati solo sulla parte "Numeri e Tempi": costi reali, tempi burocratici, cosa aspettarsi concretamente.
    Includi una tabella HTML pratica con esempi di numeri reali (inventali verosimili se necessario).
    Struttura: <h2>titolo sezione</h2>, poi 2 sotto-argomenti con <h3> e paragrafi brevi, poi la tabella.
    ${STILE}`);

    // 8. BOX CTA SUBINGRESSO
    console.log("8/10 - CTA Subingresso.it...");
    const cta = await callAI(`Scrivi un breve paragrafo di chiusura per l'articolo "${topic}".
    Deve invitare il lettore, in modo naturale e non pubblicitario, a cercare o pubblicare annunci su Subingresso.it se vuole comprare o vendere posteggi, licenze o furgoni attrezzati.
    Usa questo box HTML: <div style="background:#f0fdf4;border:2px solid #86efac;padding:1.2rem 1.5rem;border-radius:12px;margin:2rem 0"><strong>📢 Cerchi o vendi un posteggio?</strong><br>testo invito...</div>
    VIETATO: preamboli. Inizia direttamente con il tag <div>.`);

    // 9. FAQ
    console.log("9/10 - FAQ...");
    const faq = await callAI(`Per l'articolo "${topic}", scrivi 3 domande e risposte frequenti.
    Usa <h2>Domande Frequenti</h2> come titolo, poi per ogni FAQ: <h3>domanda diretta?</h3> e <p>risposta secca in 2-3 righe.</p>
    Le domande devono essere quelle che si farebbe davvero un ambulante ("E se il comune non approva?", "Ci vogliono soldi subito?").
    ${STILE}`);

    // 10. SEO E ASSEMBLAGGIO
    console.log("10/10 - Assemblaggio SEO...");
    const fullText = intro + sezione1 + sezione2 + sezione3 + cta + faq;
    const finalRaw = await callAI(`Dato questo testo HTML di un articolo, restituisci un JSON con: title (titolo accattivante), slug (URL-friendly), excerpt (riassunto 1 frase), content (tutto il testo HTML invariato).
    TESTO: ${fullText}
    RESTITUISCI SOLO JSON VALIDO, nient'altro: {"title": "...", "slug": "...", "excerpt": "...", "content": "..."}`);


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

function titlesAreTooSimilar(a, b) {
    const normalize = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const wordsA = new Set(normalize(a).split(/\s+/).filter(w => w.length > 3));
    const wordsB = new Set(normalize(b).split(/\s+/).filter(w => w.length > 3));
    let shared = 0;
    wordsA.forEach(w => { if (wordsB.has(w)) shared++; });
    const similarity = shared / Math.max(wordsA.size, wordsB.size, 1);
    return similarity > 0.5; // più del 50% di parole in comune = troppo simile
}

// Esporta per l'uso
window.generateAndPublish = async function() {
    const post = await generateDeepArticle();
    console.log("✅ Articolo generato con successo!", post.title);

    // Controllo anti-duplicato sul titolo finale
    const { data: existing } = await _supabase.from('blog_posts').select('title').limit(30);
    if (existing) {
        const duplicate = existing.find(p => titlesAreTooSimilar(p.title, post.title));
        if (duplicate) {
            throw new Error(`Titolo troppo simile a uno già pubblicato: "${duplicate.title}". Riprova per generare un argomento diverso.`);
        }
    }

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
