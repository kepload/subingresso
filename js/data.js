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

// ══════════════ BADGE PROFILO ══════════════
function getProfileBadges(createdAt, activeListings) {
    const days = Math.floor((Date.now() - new Date(createdAt)) / 86400000);

    let b;
    if (days < 30)        b = { label: 'Nuovo Iscritto', icon: 'fa-seedling',    cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    else if (days < 180)  b = { label: 'In Crescita',    icon: 'fa-chart-line',  cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    else if (days < 365)  b = { label: 'Affidabile',     icon: 'fa-check-circle',cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    else                  b = { label: 'Veterano',        icon: 'fa-award',       cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' };

    const pill = (icon, label, cls) =>
        `<span class="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg border ${cls}"><i class="fas ${icon} text-[10px]"></i> ${label}</span>`;

    let html = pill(b.icon, b.label, b.cls);
    if (activeListings >= 5)
        html += ' ' + pill('fa-star', 'Top Venditore', 'bg-yellow-50 text-yellow-700 border-yellow-200');

    return html;
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
    "Toscolano": [45.68, 10.60], "Toscolano Maderno": [45.68, 10.60], "Maderno": [45.68, 10.60],
    "Gardone": [45.62, 10.55], "Gargnano": [45.70, 10.65], "Limone": [45.81, 10.79],
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
    const annuncioUrl = `annuncio.html?id=${escapeHTML(l.id)}`;
    const profiloUrl  = l.user_id ? `profilo.html?id=${escapeHTML(l.user_id)}` : null;
    const distTag = (distance !== null && distance !== Infinity)
        ? `<span class="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">a ${Math.round(distance)} km</span>`
        : '';

    // Badge venditore: usa oldest listing come proxy data iscrizione
    const _sellerBadge = (() => {
        const userListings = Array.isArray(LISTINGS) ? LISTINGS.filter(x => x.user_id === l.user_id) : [];
        const activeCount  = userListings.length;
        const oldest       = userListings.reduce((o, c) => new Date(c.created_at) < new Date(o.created_at) ? c : o, l);
        const days         = Math.floor((Date.now() - new Date(oldest.created_at)) / 86400000);
        if (activeCount >= 5) return { icon: 'fa-star',         bg: 'bg-yellow-500', label: 'Top Venditore' };
        if (days >= 365)      return { icon: 'fa-award',        bg: 'bg-indigo-500', label: 'Veterano' };
        if (days >= 180)      return { icon: 'fa-check-circle', bg: 'bg-emerald-500',label: 'Affidabile' };
        if (days >= 30)       return { icon: 'fa-chart-line',   bg: 'bg-blue-600',   label: 'In Crescita' };
        return                       { icon: 'fa-seedling',     bg: 'bg-amber-500',  label: 'Nuovo Iscritto' };
    })();

    const imgTag = (() => {
        let extra = l.dettagli_extra;
        if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch(e) { extra = null; } }
        const img = (l.img_urls && l.img_urls[0]) || (extra && extra.images && extra.images[0]);
        return img ? `<img src="${escapeHTML(img)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : '';
    })();

    return `
    <div class="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col h-full">
        <!-- cover -->
        <a href="${annuncioUrl}" class="block relative h-20 sm:h-28 bg-slate-100 overflow-hidden flex-shrink-0">
            <div class="absolute inset-0 flex items-center justify-center text-slate-300">
                <i class="fas fa-store text-2xl sm:text-4xl"></i>
            </div>
            ${imgTag}
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span class="${l.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600'} text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">${escapeHTML(l.stato)}</span>
                ${l.status && l.status !== 'active' ? `<span class="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">In Revisione</span>` : ''}
                ${distTag}
            </div>
        </a>

        <!-- body -->
        <div class="p-3 sm:p-5 flex-grow flex flex-col">
            <div class="flex items-center gap-1.5 mb-2">
                <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-lg">${escapeHTML(l.tipo)}</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">• ${escapeHTML(l.merce)}</span>
            </div>

            <a href="${annuncioUrl}" class="block mb-1.5">
                <h3 class="text-sm sm:text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">${escapeHTML(l.titolo)}</h3>
            </a>

            <div class="flex items-center gap-1.5 text-slate-400 font-bold text-[11px] sm:text-xs mb-2 sm:mb-3">
                <i class="fas fa-map-marker-alt text-blue-400 flex-shrink-0"></i>
                <span class="truncate">${escapeHTML(l.comune)}, ${escapeHTML(l.regione)}</span>
            </div>

            ${l.contatto ? `
                ${profiloUrl
                    ? `<a href="${profiloUrl}" onclick="event.stopPropagation()" class="flex items-center gap-1.5 mb-2 sm:mb-3 hover:bg-blue-50 rounded-xl px-1.5 py-1 -mx-1.5 transition w-fit max-w-full">
                        <div class="relative flex-shrink-0" title="${_sellerBadge.label}">
                            <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                ${USER_AVATARS[l.user_id]
                                    ? `<img src="${escapeHTML(USER_AVATARS[l.user_id])}" class="w-full h-full object-cover">`
                                    : `<span class="text-[9px] font-black text-blue-600">${escapeHTML(l.contatto.charAt(0).toUpperCase())}</span>`
                                }
                            </div>
                            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 ${_sellerBadge.bg} rounded-full flex items-center justify-center border-[1.5px] border-white">
                                <i class="fas ${_sellerBadge.icon} text-[5px] text-white"></i>
                            </div>
                        </div>
                        <span class="text-[11px] font-bold text-slate-400 truncate hover:text-blue-600 transition">${escapeHTML(l.contatto)}</span>
                    </a>`
                    : `<div class="flex items-center gap-1.5 mb-2 sm:mb-3">
                        <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span class="text-[9px] font-black text-blue-600">${escapeHTML(l.contatto.charAt(0).toUpperCase())}</span>
                        </div>
                        <span class="text-[11px] font-bold text-slate-400 truncate">${escapeHTML(l.contatto)}</span>
                    </div>`
                }` : ''}

            <div class="mt-auto pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Prezzo</p>
                    <p class="text-base sm:text-xl font-black text-slate-900 leading-none">${formatPrice(l)}</p>
                </div>
                <a href="${annuncioUrl}" class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <i class="fas fa-chevron-right text-xs"></i>
                </a>
            </div>
        </div>
    </div>`;
}

// ── Demo Data (Fallback — vuoto, i dati reali vengono da Supabase) ──
const LISTINGS = [];

// Cache avatar URL per user_id — popolata da annunci.js dopo il fetch profiles
const USER_AVATARS = {};
