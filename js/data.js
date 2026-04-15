// ============================================================
//  Subingresso.it — Dati condivisi tra le pagine
// ============================================================

const STALL_DATA = {
    "Sardegna": 41, "Sicilia": 42, "Calabria": 43, "Puglia": 44, "Basilicata": 45,
    "Campania": 46, "Molise": 47, "Abruzzo": 48, "Lazio": 49, "Marche": 50,
    "Umbria": 51, "Toscana": 52, "Emilia-Romagna": 53, "Liguria": 54,
    "Piemonte": 55, "Valle d'Aosta": 56, "Lombardia": 57, "Trentino-Alto Adige": 58,
    "Veneto": 59, "Friuli-Venezia Giulia": 60
};

const REGIONI = Object.keys(STALL_DATA);

const MERCI = [
    "Alimentari", "Ortofrutta", "Abbigliamento", "Calzature", 
    "Fiori e Piante", "Casalinghi", "Somministrazione", "Produttori", "Altro"
];

const COMUNI_IT = [
    "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania",
    "Venezia", "Verona", "Messina", "Padova", "Trieste", "Taranto", "Brescia", "Parma", "Prato", "Modena",
    "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia", "Rimini",
    "Salerno", "Ferrara", "Sassari", "Latina", "Monza", "Siracusa", "Pescara", "Bergamo", "Forlì", "Trento",
    "Vicenza", "Terni", "Bolzano", "Novara", "Piacenza", "Ancona", "Andria", "Arezzo", "Udine", "Cesena",
    "Lecce", "L'Aquila", "Alessandria", "Barletta", "Pesaro", "Pistoia", "Catanzaro", "Pisa", "Lucca",
    "Brindisi", "Pozzuoli", "Torre del Greco", "Como", "Treviso", "Marsala", "Grosseto", "Busto Arsizio",
    "Varese", "Sesto San Giovanni", "Casoria", "Caserta", "Gela", "Asti", "Cinisello Balsamo", "Ragusa",
    "Lamezia Terme", "Quartu Sant'Elena", "Castellammare di Stabia", "Altamura", "Pavia", "Massa", "Cremona",
    "Carpi", "Aprilia", "Viterbo", "Potenza", "Carrara", "Foligno", "Vigevano", "Legnano", "Fiumicino",
    "Benevento", "Molfetta", "Viareggio", "Salò", "Desenzano", "Mantova", "Sanremo", "Oristano"
];

// ── Funzioni Utility ──────────────────────────────────────

function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatPrice(l) {
    if (!l.prezzo) return 'Trattativa riservata';
    const p = l.prezzo.toLocaleString('it-IT');
    return l.stato === 'Affitto mensile' ? `€ ${p} /mese` : `€ ${p}`;
}

// ══════════════ FUZZY SEARCH (Levenshtein) ══════════════
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[b.length][a.length];
}

function fuzzyScore(target, query) {
    if (!target || !query) return 0;
    const t = String(target).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const q = String(query).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (t.includes(q)) return 100;
    
    const distance = levenshtein(t, q);
    const maxLength = Math.max(t.length, q.length);
    const score = Math.round((1 - distance / maxLength) * 100);
    
    return score > 60 ? score : 0;
}

// ── COORDINATE PROVINCE (Semplificate) ──
const PROVINCE_COORDS = {
    "Roma": [41.89, 12.49], "Milano": [45.46, 9.19], "Napoli": [40.85, 14.26], "Torino": [45.07, 7.68],
    "Palermo": [38.11, 13.36], "Genova": [44.40, 8.94], "Bologna": [44.49, 11.34], "Firenze": [43.76, 11.25],
    "Bari": [41.11, 16.87], "Catania": [37.50, 15.08], "Venezia": [45.44, 12.31], "Verona": [45.43, 10.99],
    "Brescia": [45.54, 10.21], "Bergamo": [45.69, 9.67], "Salò": [45.60, 10.52], "Desenzano": [45.47, 10.53],
    "Aosta": [45.73, 7.31]
};

function getDistanceKM(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getCityCoords(cityName) {
    if (!cityName) return null;
    const city = cityName.trim();
    if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city];
    
    let bestMatch = null;
    let maxScore = 0;
    for (let key in PROVINCE_COORDS) {
        const score = fuzzyScore(key, city);
        if (score > maxScore) { maxScore = score; bestMatch = key; }
    }
    return maxScore > 75 ? PROVINCE_COORDS[bestMatch] : null;
}

function normalizeText(t) {
    if (!t) return "";
    return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// ── Card Builder ──────────────────────────────────────────

function buildCard(l, isSmall = false, distance = null) {
    const href = `href="annuncio.html?id=${escapeHTML(l.id)}"`;
    const distTag = (distance !== null && distance !== Infinity) 
        ? `<span class="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">a ${Math.round(distance)} km</span>`
        : '';

    return `
    <a ${href} class="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col h-full">
        <!-- cover -->
        <div class="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center text-slate-300">
                <i class="fas fa-store text-5xl"></i>
            </div>
            ${(() => {
                let extra = l.dettagli_extra;
                if (typeof extra === 'string') {
                    try { extra = JSON.parse(extra); } catch(e) { extra = null; }
                }
                const img = (l.img_urls && l.img_urls[0]) || (extra && extra.images && extra.images[0]);
                return img ? `<img src="${escapeHTML(img)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : '';
            })()}
            
            <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                <span class="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">${escapeHTML(l.stato)}</span>
                ${l.status && l.status !== 'active' ? `<span class="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">In Revisione</span>` : ''}
                ${distTag}
            </div>
        </div>

        <!-- body -->
        <div class="p-5 flex-grow flex flex-col">
            <div class="flex items-center gap-2 mb-3">
                <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg">${escapeHTML(l.tipo)}</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">• ${escapeHTML(l.merce)}</span>
            </div>
            
            <h3 class="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">${escapeHTML(l.titolo)}</h3>
            
            <div class="flex items-center gap-2 text-slate-400 font-bold text-xs mb-4">
                <i class="fas fa-map-marker-alt text-blue-400"></i>
                <span class="truncate">${escapeHTML(l.comune)}, ${escapeHTML(l.regione)}</span>
            </div>

            <div class="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Prezzo</p>
                    <p class="text-xl font-black text-slate-900 leading-none">${formatPrice(l)}</p>
                </div>
                <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <i class="fas fa-chevron-right text-xs"></i>
                </div>
            </div>
        </div>
    </a>`;
}

// ── Demo Data (Fallback) ──────────────────────────────────
const LISTINGS = [
    {
        id: 1,
        titolo: "Posteggio Mercato Storico",
        comune: "Salò",
        provincia: "BS",
        regione: "Lombardia",
        tipo: "Mercato settimanale",
        merce: "Alimentari",
        prezzo: 12000,
        superficie: 32,
        giorni: "Sabato",
        stato: "Vendita",
        contatto: "Marco",
        data: "2025-01-10",
        descrizione: "Ottima posizione fronte lago, alta affluenza."
    }
];
