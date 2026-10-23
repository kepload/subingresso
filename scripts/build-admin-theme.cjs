// Genera soltanto gli override cromatici: layout, contenuti e comportamento invariati.
// Eseguire dopo modifiche ai colori CSS o agli stili delle pagine.
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const root = path.resolve(__dirname, '..');
const base = fs.readFileSync(path.join(root, 'css/admin-theme-base.css'), 'utf8');
const output = [base];

function role(hex, property) {
    let value = hex.slice(1);
    if (value.length === 3 || value.length === 4) value = [...value].map(c => c + c).join('');
    const rgb = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16) / 255);
    const hi = Math.max(...rgb), lo = Math.min(...rgb), delta = hi - lo;
    const light = (hi + lo) / 2, sat = delta ? delta / (1 - Math.abs(2 * light - 1)) : 0;
    let hue = !delta ? 0 : hi === rgb[0] ? ((rgb[1] - rgb[2]) / delta) % 6 : hi === rgb[1] ? (rgb[2] - rgb[0]) / delta + 2 : (rgb[0] - rgb[1]) / delta + 4;
    hue = (hue * 60 + 360) % 360;
    const semantic = sat > .28 && !(hue >= 175 && hue < 270 && light < .26);
    const family = hue >= 75 && hue < 175 ? 'success' : hue >= 25 && hue < 75 ? 'warning' : hue < 25 || hue >= 335 ? 'danger' : 'info';
    if (/^(background|--tw-gradient)/.test(property)) {
        if (light < .65) return hex;
        return `var(--ad-${semantic ? (family === 'info' ? 'info' : family + '-bg') : light > .96 ? 'panel' : light > .87 ? 'field' : 'raised'})`;
    }
    if (property.includes('border') || property.includes('outline')) return `var(--ad-${semantic && light < .7 ? 'link' : 'line'})`;
    if (property === 'color' || property === 'caret-color' || property === 'accent-color' || /^--(?:ev-ink|ev-muted|si-muted|si-ink)$/.test(property)) {
        if (light > .83) return hex;
        return `var(--ad-${semantic ? (family === 'info' ? 'link' : family) : light < .32 ? 'ink' : light < .62 ? 'muted' : 'subtle'})`;
    }
    return hex;
}

function convert(css, label) {
    const ast = postcss.parse(css, { from: label });
    const result = postcss.root();
    // Ogni override vale solo dove il foglio originale e effettivamente caricato.
    // Evita che le regole generiche di una pagina alterino il resto del sito.
    const page = label.replace(/\.html$/, '').replace('blog-template', 'blog');
    const scope = label.startsWith('css/') ? `html.admin-dark:where(:has(link[href*="${label}"]))` : `html.admin-dark:where([data-admin-theme-page="${page}"])`;
    ast.walkRules(rule => {
        if (rule.selector.includes('organizer-theme')) return;
        const ancestors = [];
        for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
            if (parent.type === 'atrule') {
                if (!['media', 'supports', 'container'].includes(parent.name)) return;
                ancestors.unshift(parent);
            }
        }
        const declarations = [];
        rule.nodes.filter(node => node.type === 'decl').forEach(decl => {
            if (rule.selector.includes('body:not(.home-page)') && decl.prop.startsWith('background')) return;
            if (!/^(?:color|background(?:-color|-image)?|border(?:-(?:top|bottom|left|right))?(?:-color)?|outline(?:-color)?|caret-color|accent-color|--ev-(?:ink|muted)|--si-(?:ink|muted|surface))$/.test(decl.prop)) return;
            let value = decl.value.replace(/#[\da-f]{3,8}\b/gi, hex => role(hex, decl.prop));
            value = value.replace(/\bwhite\b/g, decl.prop.startsWith('background') ? 'var(--ad-panel)' : decl.prop.includes('border') ? 'var(--ad-line)' : decl.prop.includes('outline') ? 'var(--ad-link)' : '#fff');
            if (value !== decl.value) declarations.push(decl.clone({ value }));
        });
        if (!declarations.length) return;
        const selectors = rule.selectors.map(selector => selector === ':root' || selector === 'html' ? scope : scope + ' ' + selector);
        let target = result;
        ancestors.forEach(parent => { const wrapper = postcss.atRule({ name: parent.name, params: parent.params }); target.append(wrapper); target = wrapper; });
        target.append(postcss.rule({ selector: selectors.join(', '), nodes: declarations }));
    });
    if (result.nodes.length) output.push('\n/* ' + label + ' */\n' + result.toString());
}

for (const file of fs.readdirSync(path.join(root, 'css')).sort()) {
    // Preferenze contiene gia entrambe le varianti, compresa la base chiara organizzatori.
    if (!file.endsWith('.css') || /^(admin-theme|tailwind|theme-preferences)/.test(file)) continue;
    convert(fs.readFileSync(path.join(root, 'css', file), 'utf8'), 'css/' + file);
}
for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html')).sort()) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) convert(match[1], file);
}
// Finiture contestuali: il colore d'inchiostro e anche usato come sfondo nel tema chiaro.
output.push(`
html.admin-dark body, html.admin-dark body[class] { background: var(--ad-canvas); background-image: none; color: var(--ad-ink); }
html.admin-dark body:not(.home-page):not(.organizer-theme):has(> header, > #nav-placeholder) { background-image: none; }
html.admin-dark .home-page { --si-ink: var(--ad-ink); --si-muted: var(--ad-muted); --si-surface: var(--ad-panel); }
html.admin-dark body.home-page { background: var(--ad-canvas); color: var(--ad-ink); }
html.admin-dark :is(.home-button, .home-search button, .home-tool:first-child) { background: var(--ad-raised); color: var(--ad-ink); }
html.admin-dark :is(.home-button, .home-search button):hover { background: var(--ad-hover); }
html.admin-dark .home-search { background: #17385c; }
html.admin-dark .home-search-field { background: var(--ad-field); color: var(--ad-ink); }
html.admin-dark .home-search-field input { background: transparent; }
html.admin-dark .home-shortcuts a, html.admin-dark .home-city i { color: var(--ad-link); }
html.admin-dark :is(.home-stats-section, .home-sell-section) { background: linear-gradient(to bottom, var(--ad-canvas), var(--ad-panel)); }
html.admin-dark .home-listings { background: var(--ad-panel); }
html.admin-dark :is(#previewGrid, #resultsGrid) [data-listing-id] { background: var(--ad-field); }
html.admin-dark .home-tool { background: var(--ad-panel); }
html.admin-dark .home-tool:first-child { background: #17385c; }
html.admin-dark :is(.site-header, body > header, .site-footer) { background: var(--ad-field); color: var(--ad-ink); border-color: var(--ad-line); }
html.admin-dark :is(.site-wordmark, .site-header .site-nav) { color: var(--ad-ink); }
html.admin-dark :is(.site-wordmark > span, .site-header nav a[aria-current=page]) { color: var(--ad-link); }
html.admin-dark .site-header .site-nav a:hover { color: #fff; }
html.admin-dark :is(.site-header .site-publish, #authNav > a) { background: var(--ad-raised); color: var(--ad-ink); }
html.admin-dark :is(.site-header .site-publish, #authNav > a):hover { background: var(--ad-hover); color: #fff; }
html.admin-dark #authNav > a > i { color: inherit; }
html.admin-dark .site-footer :is(h4, a, p, ul) { color: var(--ad-muted); }
html.admin-dark .site-footer a:hover { color: #fff; }
html.admin-dark .seller-listing-count[data-count-level="3"] { color: #a8d1ff; }
html.admin-dark .surface-fade-down { background-image: linear-gradient(to bottom, var(--ad-field), var(--ad-canvas)); }
html.admin-dark :is(.listing-card-cover--place > .listing-card-place, .listing-detail-cover--place > .listing-detail-place) { color: var(--ad-muted); }
html.admin-dark [data-listing-id] > a:first-child > div[class*="top-3"] > span.bg-emerald-500 { background: #087b61; color: #fff; }
html.admin-dark :is(.sf-dialog, .ev-dialog, #authOverlay > div, .profile-dialog) { color-scheme: dark; background: var(--ad-panel); color: var(--ad-ink); }
html.admin-dark :is(.sf-dialog header, .ev-dialog-top, #authOverlay > div > div:first-child) { background: var(--ad-panel); }
html.admin-dark .ev { --ev-ink: var(--ad-ink); --ev-muted: var(--ad-muted); }
html.admin-dark :is(.ev-primary, .profile-organizer-primary) { background: var(--ad-link); color: var(--ad-field); }
html.admin-dark :is(.ev-primary, .profile-organizer-primary):hover { background: var(--ad-link-hover); }
html.admin-dark .fiera-page :is(a, summary) { color: var(--ad-link); }
html.admin-dark .fiera-page main > section { background: var(--ad-panel); border-color: var(--ad-line); }
html.admin-dark .fiera-page :is(.muted, .eyebrow, details) { color: var(--ad-muted); }
html.admin-dark .fiera-page .notice { background: var(--ad-warning-bg); color: var(--ad-warning); }
html.admin-dark :is(.leaflet-popup-content-wrapper, .leaflet-popup-tip, .leaflet-control-layers) { background: var(--ad-panel); color: var(--ad-ink); }
html.admin-dark .leaflet-container a { color: var(--ad-link); }
html.admin-dark .leaflet-bar a { background: var(--ad-field); color: var(--ad-ink); border-color: var(--ad-line); }
html.admin-dark .leaflet-control-attribution { background: var(--ad-field); color: var(--ad-muted); }
html.admin-dark :is(.comune-suggestions, .comune-option, .comune-group, .comune-empty) { background-color: var(--ad-panel); color: var(--ad-ink); color-scheme: dark; }
html.admin-dark .comune-option:is(:hover, .active, [aria-selected=true]) { background-color: var(--ad-raised); }
html.admin-dark .comune-option mark { background: var(--ad-info); color: var(--ad-link); }
html.admin-dark .sf-error { color: var(--ad-danger) !important; background: var(--ad-danger-bg); }
`);
fs.writeFileSync(path.join(root, 'css/admin-theme.css'), '/* Generato da scripts/build-admin-theme.cjs; modificare la base o il generatore. */\n' + output.join('\n') + '\n');
console.log('Tema admin generato: ' + Buffer.byteLength(output.join('\n')) + ' byte.');
