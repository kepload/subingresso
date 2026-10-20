const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const catalog = require('../data/fiere.json');
const research = require('../data/fiere-affinita.json');
const old = JSON.parse(execFileSync('git', ['show', 'HEAD:data/fiere.json'], { cwd: root, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 }));
const today = '2026-10-17';
const get = id => catalog.events.find(e => e.id === id);
const assess = (id, article) => api.articleAffinity(get(id), article, today);
const byId = new Map();
for (const profile of research.profiles) for (const id of profile.eventIds) { assert(!byId.has(id)); const { eventIds, ...value } = profile; byId.set(id, value); }
assert.equal(byId.size, 18);
assert.equal(Object.keys(api.ARTICLE_TYPES).length, 35);
assert.deepEqual(Object.keys(catalog).sort(), Object.keys(old).sort());
for (const key of Object.keys(catalog).filter(key => key !== 'events')) assert.deepEqual(catalog[key], old[key]);
assert.equal(catalog.events.length, old.events.length);
const before = new Map(old.events.map(e => [e.id, e]));
for (const event of catalog.events) {
    const expected = structuredClone(before.get(event.id)); assert(expected, event.id);
    if (byId.has(event.id)) {
        expected.articleResearch = byId.get(event.id);
        expected.merchandiseSectors = Object.keys(api.SECTORS).filter(key => new Set([...expected.merchandiseSectors, ...expected.articleResearch.sectors]).has(key));
        assert(api.articleResearch(event, today));
        assert.equal(api.articleResearch(event, '2028-01-01'), null);
        for (const [key, item] of Object.entries(expected.articleResearch.articles)) assert.equal(api.articleTypes(event, today).includes(key), item.role !== 'unknown' || api.ARTICLE_TYPES[key].pattern.test(event.sectors || ''));
    }
    assert.deepEqual(event, expected, 'Only reviewed additions and their macro categories may change: ' + event.id);
}
assert.equal(assess('emilia-romagna-forli-vintage-la-moda-che-vive-due-volte', 'abbigliamento').score, 6);
assert.equal(assess('emilia-romagna-forli-vintage-la-moda-che-vive-due-volte', 'abbigliamento-vintage').score, 9);
assert.equal(assess('emilia-romagna-forli-vintage-la-moda-che-vive-due-volte', 'street-food').score, 7);
assert.equal(assess('emilia-romagna-forli-vintage-la-moda-che-vive-due-volte', 'street-food').condition, 'Area Retro-Gusto');
assert.equal(assess('umbria-perugia-eurochocolate', 'cioccolato').score, 9);
assert.equal(assess('umbria-perugia-eurochocolate', 'dolciumi').score, 6);
assert.equal(assess('friuli-venezia-giulia-trieste-olio-capitale', 'olio').score, 9);
assert.equal(assess('friuli-venezia-giulia-trieste-olio-capitale', 'agricoli').score, 6);
assert.equal(assess('friuli-venezia-giulia-pordenone-ortogiardino', 'piante').score, 8);
assert.equal(assess('friuli-venezia-giulia-pordenone-ortogiardino', 'tipici').score, null, 'Cucinare must not be merged into Ortogiardino');
assert.equal(assess('lombardia-cernobbio-orticolario', 'piante').score, 9);
assert.equal(assess('emilia-romagna-crevalcore-mercato-straordinario-della-versilia', 'intimo').score, 9);
assert.equal(assess('piemonte-torino-salone-internazionale-del-libro-di-torino', 'libri').score, 9);
assert.equal(assess('veneto-cerea-expo-elettronica-cerea', 'vintage').condition, 'Elettronica vintage');
assert.equal(api.articleAffinity({ name: 'Fiera delle scarpe', sectors: 'Merci varie', source: { url: 'https://example.org' } }, 'calzature', today).score, null);
assert.equal(api.articleAffinity({ name: 'Fiera del libro', sectors: 'Libri', source: { url: 'https://example.org' } }, 'libri', today).score, 8);
assert.equal(api.articleAffinity({ name: 'Fiera generica', sectors: 'Libri', source: { url: 'https://example.org' } }, 'libri', today).score, 6);
const shoes = api.filterEvents(catalog.events, { articles: ['calzature'], months: [], query: '' });
assert(new Set(shoes.map(e => api.articleAffinity(e, 'calzature', today).score)).size >= 3, 'Variation must come from different evidence');
const counts = {};
for (const event of catalog.events) for (const key of Object.keys(api.ARTICLE_TYPES)) {
    const value = api.articleAffinity(event, key, today), score = value.score ?? 'unknown'; counts[score] = (counts[score] || 0) + 1;
    if (value.score === 9) { assert.equal(value.method, 'reviewed'); assert(value.sources?.length); }
    if (value.score !== null && value.score < 6) assert.equal(value.evidence, 'excluded');
}
// Invalid IDs, sources, roles, dates and unknown fair IDs must not be publishable.
execFileSync('python', ['-c', `
import importlib.util,json,copy
from pathlib import Path
s=importlib.util.spec_from_file_location('build',Path('scripts/build-fiere.py')); b=importlib.util.module_from_spec(s); s.loader.exec_module(b)
data=json.loads(Path('data/fiere-affinita.json').read_text(encoding='utf-8'))
for p in data['profiles']:b.validate_article_research(p)
p=copy.deepcopy(data['profiles'][0])
bad=[dict(p,reviewAfter='2025-01-01'),dict(p,checkedAt='2027-01-01'),dict(p,sources=[]),dict(p,retail='true'),dict(p,articles={'unknown':{'role':'core','reason':'bad ID'}}),dict(p,articles={'abbigliamento':{'role':'excluded','reason':'Unsupported negative'}})]
for item in bad:
 try:b.validate_article_research(item)
 except (AssertionError,ValueError):pass
 else:raise AssertionError('Invalid article research accepted')
`], { cwd: root, stdio: 'pipe' });
console.log('18 reviewed fairs, 35 articles, precise variants, expiry, evidence-only scores, preservation and build validation passed:', JSON.stringify(counts));
const handler = require('../api/fiera');
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/fiere/')) return handler({ query: { slug: decodeURIComponent(url.pathname.slice(7)) } }, { setHeader: (k,v) => res.setHeader(k,v), status(c) { res.statusCode=c; return this; }, send: text => res.end(text) });
    const file = path.resolve(root, (url.pathname === '/fiere' ? '/fiere.html' : url.pathname).slice(1));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({ '.html':'text/html;charset=utf-8', '.js':'application/javascript;charset=utf-8', '.mjs':'application/javascript;charset=utf-8', '.css':'text/css', '.json':'application/json' })[path.extname(file)] || 'text/plain');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function run(engine, name, width, height, base) {
    const browser = await engine.launch({ headless:true });
    try {
        const context = await browser.newContext({ viewport:{width,height},hasTouch:width<720 });
        await context.route('**/*', route => { const url=new URL(route.request().url()); if(['/js/auth.js','/js/supabase-config.js','/js/page-view-tracker.js'].includes(url.pathname)) return route.fulfill({body:'',contentType:'application/javascript'}); return url.origin===new URL(base).origin?route.continue():route.abort(); });
        const page = await context.newPage(), errors=[]; page.on('pageerror', error=>errors.push(error.message));
        for (const [article,query,id,score,condition] of [
            ['abbigliamento','la moda che vive due volte','emilia-romagna-forli-vintage-la-moda-che-vive-due-volte','6','Vintage o remake'],
            ['abbigliamento-vintage','la moda che vive due volte','emilia-romagna-forli-vintage-la-moda-che-vive-due-volte','9',''],
            ['cioccolato','eurochocolate','umbria-perugia-eurochocolate','9',''],
            ['agricoli','olio capitale','friuli-venezia-giulia-trieste-olio-capitale','6','Olio e settore oleario'],
            ['olio','olio capitale','friuli-venezia-giulia-trieste-olio-capitale','9',''],
            ['intimo','crevalcore','emilia-romagna-crevalcore-mercato-straordinario-della-versilia','9','']
        ]) {
            await page.goto(base+'/fiere?articoli='+article+'&q='+encodeURIComponent(query));
            const card=page.locator('.fiere-card[data-event-id="'+id+'"]'),badge=card.locator('.fiere-fit-badge');
            await badge.waitFor(); assert.equal(await badge.getAttribute('data-score'),score);
            await badge.click(); assert(await page.locator('#article-fit-dialog').isVisible());
            if(condition)assert((await page.locator('#fit-items').innerText()).includes(condition));
            assert((await page.locator('#fit-items').innerText()).includes('fonti dell’organizzatore'));
            assert.equal(await page.locator('#fit-items .fiere-fit-sources a').count(), get(id).articleResearch.sources.length);
            await page.keyboard.press('Escape'); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        }
        await page.goto(base+'/fiere/umbria-perugia-eurochocolate');
        assert((await page.locator('main').innerText()).includes('Articoli verificati'));
        assert(await page.locator('main a[data-fiere-source="https://www.eurochocolate.com/perugia2026/"]').count()>0);
        await page.goto(base+'/fiere?articoli=abbigliamento,abbigliamento-vintage&q='+encodeURIComponent('la moda che vive due volte'));
        await page.waitForSelector('.fiere-fit-badge[data-score="9"]');
        await page.locator('.fiere-fit-badge').first().click();
        assert.deepEqual(await page.locator('#fit-items .fiere-fit-value').allTextContents(),['6/10','9/10']);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
        if(process.env.FIERE_RESEARCH_OUTPUT){fs.mkdirSync(process.env.FIERE_RESEARCH_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.FIERE_RESEARCH_OUTPUT,name+'-'+width+'-vintage.png')});}
        assert.deepEqual(errors,[]);
        console.log(name+' '+width+'x'+height+': variants 6/9, conditions, new selections, primary sources, standalone provenance, multi-select and compact layout passed.');
    } finally {await browser.close();}
}
(async()=>{const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=process.env.FIERE_TEST_BASE_URL||'http://127.0.0.1:'+server.address().port;try{for(const[engine,width,height]of[['chromium',1440,1000],['chromium',820,1000],['chromium',320,568],['webkit',390,844]])await run(pw[engine],engine,width,height,base);}finally{server.close();}})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
