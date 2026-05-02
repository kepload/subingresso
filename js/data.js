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
    "Benevento", "Molfetta", "Viareggio", "Salò", "Desenzano", "Mantova", "Sanremo", "Oristano",
    "Cuneo", "Biella", "Verbania", "Vercelli", "Merano", "Belluno", "Rovigo", "Bassano del Grappa",
    "Gorizia", "Pordenone", "La Spezia", "Savona", "Imperia", "Imola", "Siena", "Empoli", "Poggibonsi",
    "Spoleto", "Città di Castello", "Senigallia", "Macerata", "Fermo", "Ascoli Piceno",
    "Frosinone", "Rieti", "Fiumicino", "Civitavecchia", "Tivoli", "Teramo", "Chieti",
    "Campobasso", "Isernia", "Avellino", "Giugliano in Campania", "Altamura", "Cerignola",
    "Matera", "Crotone", "Vibo Valentia", "Cosenza", "Agrigento", "Caltanissetta", "Enna", "Trapani",
    "Vittoria", "Acireale", "Bagheria", "Nuoro", "Olbia", "Alghero", "Carbonia",
    "Lodi", "Lecco", "Sondrio", "Gallarate", "Sirmione", "Peschiera del Garda", "Garda",
    "Bardolino", "Lazise", "Malcesine", "Riva del Garda", "Arco", "Gardone", "Gargnano",
    "Toscolano Maderno", "Limone sul Garda", "La Spezia", "Savona"
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
    return l.stato === 'Affitto mensile' ? `€ ${p} /anno` : `€ ${p}`;
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

// ── COORDINATE COMUNI ITALIANI (tutte le province + città principali) ──
const PROVINCE_COORDS = {
    // ── PIEMONTE ──
    "Torino": [45.0703, 7.6869], "Novara": [45.4469, 8.6215], "Alessandria": [44.9126, 8.6151],
    "Cuneo": [44.3914, 7.5494], "Asti": [44.9004, 8.2067], "Biella": [45.5624, 8.0586],
    "Verbania": [45.9221, 8.5526], "Vercelli": [45.3212, 8.4216],
    // ── VALLE D'AOSTA ──
    "Aosta": [45.7347, 7.3153],
    // ── LOMBARDIA ──
    "Milano": [45.4654, 9.1859], "Brescia": [45.5416, 10.2118], "Bergamo": [45.6950, 9.6699],
    "Monza": [45.5845, 9.2744], "Como": [45.8081, 9.0852], "Varese": [45.8192, 8.8252],
    "Pavia": [45.1847, 9.1583], "Cremona": [45.1333, 10.0227], "Mantova": [45.1564, 10.7905],
    "Lodi": [45.3143, 9.5039], "Lecco": [45.8566, 9.3960], "Sondrio": [46.1699, 9.8715],
    "Busto Arsizio": [45.6133, 8.8527], "Cinisello Balsamo": [45.5597, 9.2139],
    "Sesto San Giovanni": [45.5339, 9.2317], "Vigevano": [45.3198, 8.8596],
    "Legnano": [45.5923, 8.9148], "Gallarate": [45.6597, 8.7936],
    // ── TRENTINO-ALTO ADIGE ──
    "Trento": [46.0748, 11.1217], "Bolzano": [46.4982, 11.3548], "Merano": [46.6712, 11.1597],
    // ── VENETO ──
    "Venezia": [45.4408, 12.3155], "Verona": [45.4384, 10.9916], "Padova": [45.4064, 11.8768],
    "Vicenza": [45.5455, 11.5353], "Treviso": [45.6669, 12.2421], "Belluno": [46.1427, 12.2168],
    "Rovigo": [45.0700, 11.7901], "Bassano del Grappa": [45.7667, 11.7333],
    // ── FRIULI-VENEZIA GIULIA ──
    "Trieste": [45.6495, 13.7768], "Udine": [46.0711, 13.2346], "Gorizia": [45.9400, 13.6200],
    "Pordenone": [45.9642, 12.6611],
    // ── LIGURIA ──
    "Genova": [44.4056, 8.9463], "La Spezia": [44.1078, 9.8194], "Savona": [44.3065, 8.4810],
    "Imperia": [43.8876, 8.0270], "Sanremo": [43.8151, 7.7760],
    // ── EMILIA-ROMAGNA ──
    "Bologna": [44.4949, 11.3426], "Parma": [44.8015, 10.3279], "Modena": [44.6471, 10.9252],
    "Reggio Emilia": [44.6989, 10.6297], "Ferrara": [44.8353, 11.6198], "Ravenna": [44.4184, 12.1998],
    "Forlì": [44.2228, 12.0408], "Rimini": [44.0678, 12.5695], "Cesena": [44.1392, 12.4332],
    "Piacenza": [45.0526, 9.6930], "Carpi": [44.7834, 10.8835], "Imola": [44.3530, 11.7143],
    // ── TOSCANA ──
    "Firenze": [43.7696, 11.2558], "Prato": [43.8777, 11.1023], "Livorno": [43.5428, 10.3155],
    "Pisa": [43.7228, 10.4017], "Arezzo": [43.4634, 11.8797], "Siena": [43.3186, 11.3307],
    "Grosseto": [42.7694, 11.1128], "Lucca": [43.8430, 10.5047], "Pistoia": [43.9335, 10.9173],
    "Massa": [44.0355, 10.1401], "Carrara": [44.0770, 10.1000], "Viareggio": [43.8707, 10.2558],
    "Empoli": [43.7181, 10.9450], "Poggibonsi": [43.4672, 11.1524],
    // ── UMBRIA ──
    "Perugia": [43.1107, 12.3908], "Terni": [42.5632, 12.6474], "Foligno": [42.9525, 12.7021],
    "Spoleto": [42.7340, 12.7378], "Città di Castello": [43.4563, 12.2369],
    // ── MARCHE ──
    "Ancona": [43.6158, 13.5189], "Pesaro": [43.9100, 12.9135], "Ascoli Piceno": [42.8531, 13.5752],
    "Macerata": [43.2985, 13.4534], "Fermo": [43.1601, 13.7153], "Senigallia": [43.7146, 13.2171],
    // ── LAZIO ──
    "Roma": [41.8967, 12.4822], "Latina": [41.4676, 12.9038], "Frosinone": [41.6382, 13.3435],
    "Viterbo": [42.4177, 12.1049], "Rieti": [42.4048, 12.8562], "Fiumicino": [41.7718, 12.2385],
    "Civitavecchia": [42.0938, 11.7968], "Aprilia": [41.5898, 12.6543], "Tivoli": [41.9638, 12.7978],
    // ── ABRUZZO ──
    "L'Aquila": [42.3498, 13.3995], "Pescara": [42.4584, 14.2049], "Chieti": [42.3511, 14.1683],
    "Teramo": [42.6589, 13.7045],
    // ── MOLISE ──
    "Campobasso": [41.5603, 14.6679], "Isernia": [41.5936, 14.2336],
    // ── CAMPANIA ──
    "Napoli": [40.8518, 14.2681], "Salerno": [40.6824, 14.7681], "Caserta": [41.0761, 14.3321],
    "Benevento": [41.1297, 14.7807], "Avellino": [40.9136, 14.7913],
    "Torre del Greco": [40.7870, 14.3675], "Castellammare di Stabia": [40.6969, 14.4830],
    "Pozzuoli": [40.8228, 14.1213], "Casoria": [40.9063, 14.2929], "Giugliano in Campania": [40.9263, 14.1968],
    // ── PUGLIA ──
    "Bari": [41.1171, 16.8719], "Taranto": [40.4644, 17.2470], "Foggia": [41.4611, 15.5497],
    "Lecce": [40.3515, 18.1750], "Brindisi": [40.6326, 17.9417], "Andria": [41.2272, 16.2939],
    "Barletta": [41.3192, 16.2831], "Altamura": [40.8267, 16.5523], "Molfetta": [41.2007, 16.5984],
    "Taranto": [40.4644, 17.2470], "Cerignola": [41.2654, 15.9062],
    // ── BASILICATA ──
    "Potenza": [40.6403, 15.8056], "Matera": [40.6668, 16.6046],
    // ── CALABRIA ──
    "Reggio Calabria": [38.1096, 15.6475], "Catanzaro": [38.9097, 16.5874],
    "Cosenza": [39.3014, 16.2506], "Crotone": [39.0830, 17.1217], "Vibo Valentia": [38.6739, 16.1002],
    "Lamezia Terme": [38.9698, 16.3036],
    // ── SICILIA ──
    "Palermo": [38.1157, 13.3615], "Catania": [37.5079, 15.0830], "Messina": [38.1938, 15.5540],
    "Siracusa": [37.0755, 15.2866], "Ragusa": [36.9249, 14.7255], "Trapani": [37.9692, 12.5131],
    "Agrigento": [37.3115, 13.5765], "Caltanissetta": [37.4900, 14.0628], "Enna": [37.5652, 14.2758],
    "Marsala": [37.7993, 12.4351], "Gela": [37.0702, 14.2510], "Vittoria": [36.9550, 14.5322],
    "Bagheria": [38.0800, 13.5122], "Acireale": [37.6108, 15.1655],
    // ── SARDEGNA ──
    "Cagliari": [39.2238, 9.1217], "Sassari": [40.7268, 8.5597], "Oristano": [39.9062, 8.5920],
    "Nuoro": [40.3196, 9.3289], "Quartu Sant'Elena": [39.2424, 9.1833], "Olbia": [40.9236, 9.4992],
    "Alghero": [40.5583, 8.3192], "Carbonia": [39.1667, 8.5167],
    // ── LAGO DI GARDA ──
    "Salò": [45.6030, 10.5207], "Desenzano": [45.4722, 10.5367],
    "Toscolano Maderno": [45.6839, 10.5981], "Toscolano": [45.6839, 10.5981], "Maderno": [45.6839, 10.5981],
    "Gardone": [45.6217, 10.5539], "Gargnano": [45.7039, 10.6522], "Limone": [45.8139, 10.7922],
    "Sirmione": [45.4932, 10.6073], "Peschiera del Garda": [45.4397, 10.6889], "Garda": [45.5741, 10.7085],
    "Bardolino": [45.5491, 10.7254], "Lazise": [45.5059, 10.7326], "Malcesine": [45.7689, 10.8082],
    "Riva del Garda": [45.8861, 10.8410], "Arco": [45.9199, 10.8854]
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

function getOptimizedImageUrl(url, width = 480, quality = 64, resize = 'cover') {
    if (!url || typeof url !== 'string') return url;
    try {
        const u = new URL(url);
        const marker = '/storage/v1/object/public/';
        if (!u.pathname.includes(marker)) return url;
        u.pathname = u.pathname.replace(marker, '/storage/v1/render/image/public/');
        u.searchParams.set('width', String(width));
        u.searchParams.set('quality', String(quality));
        u.searchParams.set('resize', resize);
        return u.toString();
    } catch (_) {
        return url;
    }
}

async function prepareImageForUpload(file, maxSide = 1600, quality = 0.82) {
    if (!file || !file.type || !file.type.startsWith('image/')) return file;

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
        const w = Math.max(1, Math.round(bitmap.width * scale));
        const h = Math.max(1, Math.round(bitmap.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: true });
        ctx.drawImage(bitmap, 0, 0, w, h);
        bitmap.close?.();

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
        if (!blob || blob.size >= file.size) return file;

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
        return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
    } catch (e) {
        console.warn('Image compression skipped:', e);
        return file;
    }
}

// ── Card Builder ──────────────────────────────────────────

function isListingFeatured(l) {
    return l && l.featured === true
        && l.featured_until
        && new Date(l.featured_until) > new Date();
}

function buildCard(l, isSmall = false, distance = null) {
    const annuncioUrl = `annuncio.html?id=${escapeHTML(l.id)}`;
    const profiloUrl  = l.user_id ? `profilo.html?id=${escapeHTML(l.user_id)}` : null;
    const distTag = (distance !== null && distance !== Infinity)
        ? `<span class="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">a ${Math.round(distance)} km</span>`
        : '';
    const featured = isListingFeatured(l);
    const isAffitto = l.stato === 'Affitto mensile';
    const statoBorder = isAffitto ? 'border-l-[3px] border-l-blue-400' : 'border-l-[3px] border-l-emerald-400';
    const statoBg = isAffitto ? 'bg-blue-100/50' : 'bg-emerald-100/50';
    const featuredBorder = featured
        ? 'shadow-[0_0_0_2px_rgb(251,191,36),0_14px_36px_rgba(245,158,11,0.28)]'
        : `border border-slate-200 shadow-sm shadow-slate-300/40 ${statoBorder}`;
    const featuredBadge = featured
        ? `<span class="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-md flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse flex-shrink-0"></span><i class="fas fa-crown text-[9px]"></i> In Evidenza</span>`
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
        
        let img = null;
        const allImgs = (l.img_urls && l.img_urls.length > 0) ? l.img_urls : (extra && extra.images && extra.images.length > 0 ? extra.images : []);
        
        if (allImgs.length > 0) {
            if (featured && allImgs.length > 1) {
                // Rotazione Dinamica Vetrina: Sceglie una foto a caso per questo render
                const randomIdx = Math.floor(Math.random() * allImgs.length);
                img = allImgs[randomIdx];
            } else {
                img = allImgs[0];
            }
        }

        const src = getOptimizedImageUrl(img, featured ? 640 : 480, featured ? 68 : 62, 'cover');
        return img ? `<img src="${escapeHTML(src)}" data-fallback-src="${escapeHTML(img)}" alt="${escapeHTML(l.titolo)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=this.dataset.fallbackSrc" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">` : '';
    })();

    return `
    <div data-listing-id="${escapeHTML(l.id)}" class="group ${featured ? 'bg-orange-100/50' : statoBg} rounded-2xl sm:rounded-3xl ${featuredBorder} overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col h-full relative">
        <!-- cover -->
        <a href="${annuncioUrl}" class="block relative h-20 sm:h-28 bg-slate-100 overflow-hidden flex-shrink-0">
            <div class="absolute inset-0 flex items-center justify-center text-slate-300">
                <i class="fas fa-store text-2xl sm:text-4xl"></i>
            </div>
            ${imgTag}
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                ${featuredBadge}
                <span class="${l.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600'} text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">${l.stato === 'Affitto mensile' ? 'Affitto' : escapeHTML(l.stato)}</span>
                ${l.status && l.status !== 'active' ? `<span class="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">In Revisione</span>` : ''}
                ${distTag}
            </div>
            <button type="button"
                    data-save-id="${escapeHTML(l.id)}"
                    data-saved="${SAVED_IDS.has(l.id) ? '1' : '0'}"
                    onclick="event.preventDefault(); event.stopPropagation(); toggleSaveListing('${escapeHTML(l.id)}', this)"
                    title="${SAVED_IDS.has(l.id) ? 'Rimuovi dai preferiti' : 'Salva nei preferiti'}"
                    class="absolute top-2.5 right-2.5 w-8 h-8 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition">
                <i class="${SAVED_IDS.has(l.id) ? 'fas fa-heart text-red-500' : 'far fa-heart text-slate-400'}"></i>
            </button>
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

            ${(l.contatto || l.user_id) ? `
                ${(() => {
                    const displayName = (l.user_id && USER_NAMES[l.user_id]) ? USER_NAMES[l.user_id] : (l.contatto || '');
                    const initial = displayName ? escapeHTML(displayName.charAt(0).toUpperCase()) : '?';
                    const nameHtml = `<span class="text-[11px] font-bold text-slate-400 truncate hover:text-blue-600 transition">${escapeHTML(displayName)}</span>`;
                    const avatarHtml = USER_AVATARS[l.user_id]
                        ? `<img src="${escapeHTML(USER_AVATARS[l.user_id])}" alt="${escapeHTML(displayName)}" class="w-full h-full object-cover">`
                        : `<span class="text-[9px] font-black text-blue-600">${initial}</span>`;
                    if (profiloUrl) {
                        return `<a href="${profiloUrl}" onclick="event.stopPropagation()" class="flex items-center gap-1.5 mb-2 sm:mb-3 hover:bg-blue-50 rounded-xl px-1.5 py-1 -mx-1.5 transition w-fit max-w-full">
                            <div class="relative flex-shrink-0" title="${_sellerBadge.label}">
                                <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">${avatarHtml}</div>
                                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 ${_sellerBadge.bg} rounded-full flex items-center justify-center border-[1.5px] border-white">
                                    <i class="fas ${_sellerBadge.icon} text-[5px] text-white"></i>
                                </div>
                            </div>
                            ${nameHtml}
                        </a>`;
                    } else {
                        return `<div class="flex items-center gap-1.5 mb-2 sm:mb-3">
                            <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span class="text-[9px] font-black text-blue-600">${initial}</span>
                            </div>
                            <span class="text-[11px] font-bold text-slate-400 truncate">${escapeHTML(displayName)}</span>
                        </div>`;
                    }
                })()}` : ''}

            <div class="mt-auto pt-3 sm:pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">${l.stato === 'Affitto mensile' ? 'Affitto' : 'Prezzo'}</p>
                    ${l.prezzo
                        ? `<p class="text-base sm:text-xl font-black text-slate-900 leading-none">€ ${l.prezzo.toLocaleString('it-IT')}<span class="text-xs font-bold text-slate-400 ml-0.5">${l.stato === 'Affitto mensile' ? '/anno' : ''}</span></p>`
                        : `<p class="text-base sm:text-xl font-black text-slate-900 leading-none">${formatPrice(l)}</p>`
                    }
                </div>
                <div class="flex items-center gap-2">
                    ${l.visualizzazioni ? `<span class="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg" title="Visualizzazioni"><i class="fas fa-eye text-[10px] text-slate-500"></i><span class="text-[11px] font-black text-slate-700">${l.visualizzazioni}</span></span>` : ''}
                    <a href="${annuncioUrl}" class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <i class="fas fa-chevron-right text-xs"></i>
                    </a>
                </div>
            </div>
            ${featured ? `<div class="mt-3 -mx-3 sm:-mx-5 -mb-3 sm:-mb-5 bg-gradient-to-r from-amber-100/60 to-orange-100/60 border-t border-amber-200/60 px-3 sm:px-5 py-2 flex items-center justify-between">
                <span class="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5"><i class="fas fa-crown text-[8px]"></i> Annuncio in Vetrina</span>
                <span class="text-[10px] text-amber-400">★★★★★</span>
            </div>` : ''}
        </div>
    </div>`;
}

// ── Demo Data (Fallback — vuoto, i dati reali vengono da Supabase) ──
const LISTINGS = [];

// Cache avatar URL per user_id — popolata da annunci.js dopo il fetch profiles
const USER_AVATARS = {};

// Cache nome attuale venditore — popolata da annunci.js dopo il fetch profiles
const USER_NAMES = {};

// Cache annunci salvati nei preferiti — popolata da auth.js dopo login
const SAVED_IDS = new Set();

// Toggle "Salva preferito" — chiamata dal cuoricino sulle card e dalla pagina annuncio.
// Se utente non loggato → apre modal registrazione e marca l'intent in sessionStorage.
async function toggleSaveListing(annuncioId, btnEl) {
    if (!annuncioId) return;
    if (typeof _supabase === 'undefined' || !_supabase) return;

    const { data: sess } = await _supabase.auth.getSession();
    if (!sess?.session?.user) {
        // Non loggato → memorizza intent + apre modal
        try { sessionStorage.setItem('_pending_save_listing', String(annuncioId)); } catch (_) {}
        if (typeof window.openAuthModal === 'function') window.openAuthModal('register');
        return;
    }

    const userId    = sess.session.user.id;
    const wasSaved  = SAVED_IDS.has(annuncioId);
    // Optimistic UI
    if (wasSaved) SAVED_IDS.delete(annuncioId);
    else          SAVED_IDS.add(annuncioId);
    _refreshSaveButtons(annuncioId);

    try {
        if (wasSaved) {
            const { error } = await _supabase
                .from('saved_listings')
                .delete()
                .eq('user_id', userId)
                .eq('annuncio_id', annuncioId);
            if (error) throw error;
        } else {
            const { error } = await _supabase
                .from('saved_listings')
                .insert({ user_id: userId, annuncio_id: annuncioId });
            if (error && !String(error.message || '').includes('duplicate')) throw error;
        }
    } catch (e) {
        // Revert su errore
        if (wasSaved) SAVED_IDS.add(annuncioId);
        else          SAVED_IDS.delete(annuncioId);
        _refreshSaveButtons(annuncioId);
        console.warn('[saved_listings]', e);
    }
}

// Aggiorna tutti i bottoni "salva" di un annuncio sulla pagina corrente
function _refreshSaveButtons(annuncioId) {
    const saved = SAVED_IDS.has(annuncioId);
    document.querySelectorAll(`[data-save-id="${annuncioId}"]`).forEach(el => {
        const icon = el.querySelector('i');
        el.setAttribute('data-saved', saved ? '1' : '0');
        el.setAttribute('title', saved ? 'Rimuovi dai preferiti' : 'Salva nei preferiti');
        if (icon) {
            icon.className = saved ? 'fas fa-heart text-red-500' : 'far fa-heart text-slate-400';
        }
    });
}

// Carica gli ID dei preferiti dell'utente loggato e popola SAVED_IDS.
// Chiamata da auth.js dopo login + da pagine che mostrano card.
async function loadSavedListingsCache() {
    if (typeof _supabase === 'undefined' || !_supabase) return;
    try {
        const { data: sess } = await _supabase.auth.getSession();
        if (!sess?.session?.user) { SAVED_IDS.clear(); return; }
        const { data, error } = await _supabase
            .from('saved_listings')
            .select('annuncio_id')
            .eq('user_id', sess.session.user.id);
        if (error) return;
        SAVED_IDS.clear();
        (data || []).forEach(r => SAVED_IDS.add(r.annuncio_id));
        // Aggiorna i bottoni già renderizzati
        document.querySelectorAll('[data-save-id]').forEach(el => {
            const id = el.getAttribute('data-save-id');
            if (id) _refreshSaveButtons(id);
        });
    } catch (_) {}
}

// Auto-salva l'annuncio in sessionStorage dopo registrazione/login completati.
// Chiamata da auth.js al termine del flusso post-auth.
async function processPendingSaveListing() {
    let pending = null;
    try { pending = sessionStorage.getItem('_pending_save_listing'); } catch (_) {}
    if (!pending) return;
    try { sessionStorage.removeItem('_pending_save_listing'); } catch (_) {}
    await loadSavedListingsCache();
    if (!SAVED_IDS.has(pending)) {
        await toggleSaveListing(pending, null);
    }
}

window.toggleSaveListing       = toggleSaveListing;
window.loadSavedListingsCache  = loadSavedListingsCache;
window.processPendingSaveListing = processPendingSaveListing;

// ── Tracking visualizzazioni anteprima card (shared tra tutte le pagine) ──
const _viewedPreviews = new Set();
function observeCardViews() {
    const cards = document.querySelectorAll('[data-listing-id]');
    if (!cards.length) return;

    function _trackCard(card) {
        const id = card.dataset.listingId;
        if (!id || _viewedPreviews.has(id)) return;
        const r = card.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
            _viewedPreviews.add(id);
            (async () => {
                const { error } = await _supabase.rpc('increment_views', { listing_id: id, amount: 1 });
                if (error) console.warn('[views +1]', error);
            })();
        }
    }

    requestAnimationFrame(() => cards.forEach(_trackCard));

    function _onScroll() {
        let pending = false;
        cards.forEach(card => {
            if (!_viewedPreviews.has(card.dataset.listingId)) {
                _trackCard(card);
                pending = true;
            }
        });
        if (!pending) window.removeEventListener('scroll', _onScroll);
    }
    window.addEventListener('scroll', _onScroll, { passive: true });
}

// ── Toast notifications ───────────────────────────────────
function showToast(message, type = 'info') {
    let container = document.getElementById('_toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = '_toastContainer';
        container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:340px;width:calc(100vw - 48px)';
        document.body.appendChild(container);
    }

    const cfg = {
        success: { bg: 'bg-emerald-600', icon: 'fa-check-circle' },
        error:   { bg: 'bg-red-600',     icon: 'fa-times-circle' },
        warning: { bg: 'bg-amber-500',   icon: 'fa-exclamation-triangle' },
        info:    { bg: 'bg-blue-600',    icon: 'fa-info-circle' },
    };
    const { bg, icon } = cfg[type] || cfg.info;

    const toast = document.createElement('div');
    toast.className = `${bg} text-white px-4 py-3 rounded-2xl shadow-lg flex items-start gap-3 text-sm font-semibold leading-snug`;
    toast.style.cssText = 'opacity:0;transform:translateY(12px);transition:opacity 0.22s,transform 0.22s';
    toast.innerHTML = `<i class="fas ${icon} mt-0.5 flex-shrink-0"></i><span>${escapeHTML(String(message))}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 250);
    }, 4000);
}

// ── Phone normalizer ─────────────────────────────────────
// Gestisce: +39, 0039, spazi, trattini, punti, parentesi, slash.
// Restituisce il numero pulito pronto per salvare e mostrare.
function normalizePhone(raw) {
    if (!raw) return '';
    let n = raw.trim();
    // Rimuovi caratteri non utili mantenendo + iniziale
    n = n.replace(/[\s\-\.\(\)\/]/g, '');
    // Rimuovi prefisso internazionale italiano
    // +3906... (fisso Roma) → 06...
    if (n.startsWith('+390')) n = '0' + n.slice(4);
    // +393... (mobile) → 3...
    else if (n.startsWith('+39')) n = n.slice(3);
    // 00390... → 0...
    else if (n.startsWith('00390')) n = '0' + n.slice(5);
    // 0039... → strip prefix
    else if (n.startsWith('0039')) n = n.slice(4);
    // 39XXXXXXXXXX (12 cifre, 39 iniziale) → togli il 39
    else if (/^39\d{10}$/.test(n)) n = n.slice(2);
    // Formatta numero mobile (3XX XXXXXXX) con spazio per leggibilità
    if (/^3\d{9}$/.test(n)) n = n.slice(0, 3) + ' ' + n.slice(3);
    return n;
}

// Controlla che il telefono abbia almeno 6 cifre e max 13 (fissi + mobili IT)
function isValidPhone(tel) {
    const digits = tel.replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 13;
}
