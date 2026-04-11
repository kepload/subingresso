// ============================================================
//  Subingresso.it — Dati condivisi tra le pagine
// ============================================================

const STALL_DATA = {
    "Sardegna": 41, "Sicilia": 62, "Calabria": 38, "Basilicata": 25,
    "Puglia": 112, "Campania": 210, "Molise": 15, "Abruzzo": 45,
    "Lazio": 280, "Toscana": 123, "Umbria": 35, "Marche": 55,
    "Emilia-Romagna": 189, "Liguria": 76, "Piemonte": 156,
    "Valle d'Aosta": 12, "Lombardia": 342,
    "Trentino-Alto Adige": 60, "Veneto": 210,
    "Friuli-Venezia Giulia": 48
};

// ── ANNUNCI (Reali + Storici) ──
const LISTINGS = [
    {
        id: 101,
        regione: "Emilia-Romagna", provincia: "Ferrara", comune: "Ferrara",
        titolo: "Posteggio Mercato del Venerdì – Ferrara Centro (Listone)",
        tipo: "Mercato settimanale", merce: "Abbigliamento / Generico",
        superficie: 40, giorni: "Venerdì",
        prezzo: 17000, stato: "Vendita",
        descrizione: "Ampio posteggio di 8x5 mt situato in posizione centrale sul 'Listone' di Ferrara. Ottima visibilità e passaggio costante. Possibilità di affitto con prova prima dell'acquisto definitivo.",
        data: "2026-04-05", contatto: "Roberto F.", tel: "333 *** ****"
    },
    {
        id: 102,
        regione: "Piemonte", provincia: "Torino", comune: "Torino",
        titolo: "Licenza Piazza Benefica – Mercato prestigioso",
        tipo: "Mercato settimanale", merce: "Abbigliamento / Calzature",
        superficie: 12, giorni: "Martedì",
        prezzo: 5000, stato: "Vendita",
        descrizione: "Vendesi licenza per il rinomato mercato di Piazza Benefica a Torino. Posteggio angolare con ottima clientela fidelizzata. Prezzo competitivo per realizzo immediato.",
        data: "2026-04-03", contatto: "Marco G.", tel: "340 *** ****"
    },
    {
        id: 103,
        regione: "Piemonte", provincia: "Torino", comune: "Moncalieri",
        titolo: "Licenza Ambulante Moncalieri – Settore non alimentare",
        tipo: "Mercato settimanale", merce: "Generico",
        superficie: 15, giorni: "Venerdì",
        prezzo: 9500, stato: "Vendita",
        descrizione: "Cessione autorizzazione per i mercati di Moncalieri. Documentazione DURC in regola, voltura immediata. Ottima occasione per avvio attività.",
        data: "2026-04-01", contatto: "Elena V.", tel: "329 *** ****"
    },
    {
        id: 104,
        regione: "Emilia-Romagna", provincia: "Rimini", comune: "Rimini",
        titolo: "Licenza Itinerante Abbigliamento – Costa Romagnola",
        tipo: "Mercato settimanale", merce: "Abbigliamento",
        superficie: 18, giorni: "Vari",
        prezzo: 15000, stato: "Vendita",
        descrizione: "Licenza itinerante per mercati stagionali e annuali sulla costa riminese. Inclusa autorizzazione per fiere locali. Alta redditività estiva.",
        data: "2026-03-30", contatto: "Paolo S.", tel: "347 *** ****"
    },
    {
        id: 105,
        regione: "Lazio", provincia: "Roma", comune: "Roma",
        titolo: "Posteggio Piazza Ankara – Roma Centro",
        tipo: "Mercato settimanale", merce: "Generico",
        superficie: 14, giorni: "Martedì",
        prezzo: 4500, stato: "Vendita",
        descrizione: "Posteggio centrale situato a Piazza Ankara (Roma). Disponibile anche per affitto mensile a €100/mese. Posizione di forte passaggio.",
        data: "2026-03-28", contatto: "Claudio R.", tel: "320 *** ****"
    },
    {
        id: 1, scaduto: true,
        regione: "Lazio", provincia: "Roma", comune: "Roma",
        titolo: "Concessione Mercato di Porta Portese – fila centrale, fronte strada",
        tipo: "Mercato settimanale", merce: "Hobbistica / Antiquariato",
        superficie: 16, giorni: "Domenica",
        prezzo: 28000, stato: "Vendita",
        descrizione: "Posteggio di 16 mq in posizione privilegiata al Mercato di Porta Portese. Fila centrale con doppio fronte, massima visibilità. La licenza è stabile e il canone annuo al Comune è di €1.840. Prezzo ribassato per realizzo immediato.",
        data: "2025-11-28", contatto: "Giulio M.", tel: "338 *** ****"
    },
    {
        id: 2, scaduto: true,
        regione: "Piemonte", provincia: "Torino", comune: "Torino",
        titolo: "Posteggio Mercato di Porta Palazzo – settore ortofrutticolo",
        tipo: "Mercato quotidiano", merce: "Frutta e Verdura",
        superficie: 10, giorni: "Lunedì – Sabato",
        prezzo: 22000, stato: "Vendita",
        descrizione: "Posteggio da 10 mq a Porta Palazzo. Settore ortofrutticolo, zona con ottima affluenza quotidiana. Canone annuo al Comune: €720. Cessione completa di licenza e avviamento tramite atto notarile.",
        data: "2025-11-25", contatto: "Stefano B.", tel: "320 *** ****"
    },
    {
        id: 3, scaduto: true,
        regione: "Lombardia", provincia: "Milano", comune: "Milano",
        titolo: "Subentro Mercato Viale Papiniano – abbigliamento, posizione angolare",
        tipo: "Mercato settimanale", merce: "Abbigliamento",
        superficie: 12, giorni: "Martedì, Sabato",
        prezzo: 18500, stato: "Vendita",
        descrizione: "Posteggio angolare da 12 mq al Mercato di Viale Papiniano. Posizione di testa con doppia visibilità. Canone annuo: €1.260. Ottimo per abbigliamento o pelletteria.",
        data: "2025-11-22", contatto: "Federica L.", tel: "347 *** ****"
    },
    {
        id: 4, scaduto: true,
        regione: "Toscana", provincia: "Firenze", comune: "Firenze",
        titolo: "Posteggio Mercato di Sant'Ambrogio – alimentare e gastronomia",
        tipo: "Mercato quotidiano", merce: "Alimentare",
        superficie: 9, giorni: "Lunedì – Sabato",
        prezzo: 16000, stato: "Vendita",
        descrizione: "Posteggio da 9 mq nel Mercato di Sant'Ambrogio. Settore gastronomia tipica. Clientela abituale e stabile. Canone annuo: €980. Ottima opportunità d'ingresso nel settore alimentare.",
        data: "2025-11-20", contatto: "Francesca T.", tel: "335 *** ****"
    },
    {
        id: 5, scaduto: true,
        regione: "Emilia-Romagna", provincia: "Bologna", comune: "Bologna",
        titolo: "Concessione Mercato delle Erbe – banco gastronomia tipica",
        tipo: "Mercato quotidiano", merce: "Alimentare",
        superficie: 8, giorni: "Lunedì – Sabato",
        prezzo: 14000, stato: "Vendita",
        descrizione: "Posteggio da 8 mq al Mercato delle Erbe. Specializzato in gastronomia emiliana. Canone annuo: €840. Si cede ramo d'azienda con attrezzature incluse.",
        data: "2025-11-18", contatto: "Laura C.", tel: "349 *** ****"
    },
    {
        id: 6, scaduto: true,
        regione: "Campania", provincia: "Napoli", comune: "Napoli",
        titolo: "Posteggio Mercato di Antignano – abbigliamento, mercato del venerdì",
        tipo: "Mercato settimanale", merce: "Abbigliamento",
        superficie: 14, giorni: "Venerdì",
        prezzo: 9500, stato: "Vendita",
        descrizione: "Posteggio da 14 mq al Mercato di Antignano (Vomero). Settore abbigliamento donna, clientela fidelizzata. Canone annuo al Comune: €610.",
        data: "2025-11-15", contatto: "Ciro E.", tel: "328 *** ****"
    }
];

const TIPI = ["Mercato settimanale", "Mercato quotidiano", "Fiera"];
const MERCI = [
    "Abbigliamento", "Alimentare", "Artigianato", "Calzature",
    "Casalinghi / Ferramenta", "Fiori e Piante", "Frutta e Verdura",
    "Hobbistica / Antiquariato", "Pelletteria / Cuoio", "Tessuti",
    "Giocattoli", "Elettronica", "Altro"
];
const REGIONI = Object.keys(STALL_DATA).sort();

// ── Comuni italiani per autocomplete ──
const COMUNI_IT = ["Roma","Milano","Napoli","Torino","Palermo","Genova","Bologna","Firenze","Bari","Catania","Venezia","Verona"].sort();

// ══════════════ FUZZY SEARCH ══════════════
function fuzzyScore(target, query) {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return 100;
    return 0;
}

// ── COORDINATE PROVINCE (Semplificate per calcolo vicinanza) ──
const PROVINCE_COORDS = {
    "Roma": [41.89, 12.49], "Milano": [45.46, 9.19], "Napoli": [40.85, 14.26], "Torino": [45.07, 7.68],
    "Palermo": [38.11, 13.36], "Genova": [44.40, 8.94], "Bologna": [44.49, 11.34], "Firenze": [43.76, 11.25],
    "Bari": [41.11, 16.87], "Catania": [37.50, 15.08], "Venezia": [45.44, 12.31], "Verona": [45.43, 10.99],
    "Brescia": [45.54, 10.21], "Bergamo": [45.69, 9.67], "Salò": [45.60, 10.52], "Desenzano": [45.47, 10.53],
    "Padova": [45.40, 11.87], "Trieste": [45.64, 13.77], "Modena": [44.64, 10.92], "Parma": [44.80, 10.32],
    "Rimini": [44.05, 12.56], "Ancona": [43.61, 13.51], "Perugia": [43.11, 12.38], "L'Aquila": [42.34, 13.39],
    "Pescara": [42.46, 14.21], "Campobasso": [41.56, 14.65], "Potenza": [40.64, 15.80], "Catanzaro": [38.90, 16.58],
    "Cagliari": [39.22, 9.11], "Sassari": [40.72, 8.56], "Trento": [46.06, 11.12], "Bolzano": [46.49, 11.35],
    "Aosta": [45.73, 7.31]
};

// Funzione per calcolare la distanza in KM tra due coordinate
function getDistanceKM(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raggio terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Trova coordinate di una città (anche approssimata)
function getCityCoords(cityName) {
    const city = cityName.trim();
    if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city];
    
    // Fallback: cerca se il nome è contenuto in una delle chiavi
    for (let key in PROVINCE_COORDS) {
        if (city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())) {
            return PROVINCE_COORDS[key];
        }
    }
    return null;
}

// ── Utility ──
function formatPrice(listing) {
    if (listing.stato === "Affitto mensile") {
        return `€\u00a0${listing.prezzo.toLocaleString("it-IT")}<span class="text-sm font-semibold text-slate-400">/mese</span>`;
    }
    return `€\u00a0${listing.prezzo.toLocaleString("it-IT")}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function buildCard(l, link = true, dist = null) {
    const tag  = link ? "a" : "div";
    const href = link ? `href="annuncio.html?id=${l.id}"` : "";
    
    // Logica colore label
    let labelText = l.stato;
    let labelClass = l.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-violet-500';
    
    if (l.scaduto) {
        labelText = "ANNUNCIO SCADUTO";
        labelClass = "bg-red-600 animate-pulse";
    }

    return `
    <${tag} ${href} class="block bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/60 transition-all duration-300 overflow-hidden group cursor-pointer ${l.scaduto ? 'opacity-80 grayscale-[0.3]' : ''}">
        <div class="h-44 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center relative">
            <i class="fas fa-store text-blue-200 text-5xl"></i>
            <span class="absolute top-3 left-3 ${labelClass} text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow uppercase tracking-tighter">${labelText}</span>
            ${dist ? `<span class="absolute top-3 right-3 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow italic"><i class="fas fa-location-arrow mr-1"></i>a ${Math.round(dist)} km</span>` : ''}
            ${l.scaduto ? '<div class="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>' : ''}
        </div>
        <div class="p-5 space-y-3">
            <div>
                <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">${l.tipo} · ${l.regione}</p>
                <h3 class="font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition text-sm">${l.titolo}</h3>
            </div>
            <div class="flex flex-wrap gap-3 text-xs text-slate-400 font-semibold">
                <span><i class="fas fa-ruler-combined mr-1 text-slate-300"></i>${l.superficie} m²</span>
                <span><i class="fas fa-calendar-alt mr-1 text-slate-300"></i>${l.giorni}</span>
                <span><i class="fas fa-tag mr-1 text-slate-300"></i>${l.merce}</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-slate-50">
                <span class="text-xl font-black text-slate-900">${formatPrice(l)}</span>
                <span class="text-xs text-slate-400">${formatDate(l.data)}</span>
            </div>
        </div>
    </${tag}>`;
}
