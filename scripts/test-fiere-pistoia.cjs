// Documentary exceptions and actual calendar UI; PLAYWRIGHT_MODULE is mandatory.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-pistoia.json');
const events = data.events.filter(e => e.province === 'Pistoia');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '80031bb:data/fiere.json'], {cwd: root, maxBuffer: 25*1024*1024}));
assert.deepEqual(data.events.filter(e => e.province !== 'Pistoia'), baseline.events);
assert.equal(events.length, 117);
assert.equal(new Set(events.map(e => e.city)).size, 19);
assert.deepEqual(audit.research.municipalities.map(c => c.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Pistoia').map(c => c.nome).sort());
assert.equal(audit.research.openLeads.length, 0);
assert(audit.research.exclusions.length >= 23 && audit.research.limits.length >= 10);
assert.equal(audit.research.municipalities.find(c => c.city === 'Chiesina Uzzanese').eventsFound, 0);
const get = (name, city) => {const found = events.filter(e => e.name === name && (!city || e.city === city)); assert.equal(found.length, 1, name); return found[0]};
const dates = (name, city) => get(name, city).editions.map(e => [e.start, e.end]);
assert.deepEqual(dates('Pistoia in Fiore'), [['2026-05-22','2026-05-23']]);
assert.deepEqual(dates('Il Mercatino del Blues'), [['2026-07-02','2026-07-05'],['2026-07-10','2026-07-11']]);
assert.deepEqual(dates('Pistoia Medioevo - Artigiani e Mercanti'), [['2026-09-19','2026-09-20']]);
assert.equal(get('Montuliveto Market & Experiences').editions.length, 18);
assert.equal(get('900 in Via Roma e dintorni').editions.length, 13);
assert(!get('900 in Via Roma e dintorni').editions.some(e => /-(07|12)-/.test(e.start)));
assert.equal(get('Mercatino di Natale - Piazza Spirito Santo').editions.length, 15);
assert.equal(get('Fiera dell’Antiquariato - La Cattedrale').editions.length, 8);
assert.equal(get('Fiera dell’Antiquariato - Centro storico').editions.length, 6);
assert.match(get('Fiera dell’Antiquariato - La Cattedrale').pricing.details, /100 €.*sabato e domenica.*TARI/);
assert.match(get('Fiera dell’Antiquariato - Centro storico').pricing.details, /40 €.*domenica.*TARI/);
assert.equal(get('Fiera di Primavera', 'Pistoia').participation.deadline, '2026-04-03');
assert.match(get('Fiera di Primavera', 'Pistoia').pricing.details, /120 €.*170 €.*190 €.*150 €.*175 €.*185 €/);
assert.deepEqual(dates('Mercatino d’Autunno - Rassegna Micologica'), [['2026-10-11','2026-10-11']]);
assert.deepEqual(dates('Mercatino d’Autunno - Rassegna della Castanicoltura'), [['2026-10-25','2026-10-25']]);
assert.deepEqual(dates('Fiera di Santa Celestina'), [['2026-09-08','2026-09-08']]);
assert.deepEqual(dates('Carnevale della Montagna - Posteggi Alimentari'), [['2026-02-15','2026-02-15']]);
assert.deepEqual(dates('Fiera d’Agosto - Street Food e Mercatini'), [['2026-08-03','2026-08-05']]);
assert.deepEqual(dates('Fiera di Casalguidi'), [['2026-09-17','2026-09-22']]);
assert.equal(get('Fiera di Casalguidi').participation.deadline, '2026-05-22');
assert.match(get('Fiera di Casalguidi').pricing.details, /70.*100.*80.*120.*90.*144/);
assert.deepEqual(dates('Naturalitas'), [['2026-04-11','2026-04-12']]);
assert.equal(get('Naturalitas').participation.deadline, '2026-02-28');
assert.match(get('Naturalitas').pricing.details, /100 €.*25 €.*80 €/);
assert.deepEqual(dates('Pescia Antiqua'), [['2026-05-24','2026-05-24'],['2026-06-28','2026-06-28'],['2026-08-02','2026-08-02'],['2026-09-27','2026-09-27'],['2026-10-25','2026-10-25']]);
assert.equal(get('Festa di Primavera','Pescia').venue, 'Piazza Santo Stefano');
assert.deepEqual(dates('Fiera di Santa Maria in Selva'), [['2026-03-28','2026-03-29']]);
assert.deepEqual(dates('Fiera del Bestiame'), [['2026-09-01','2026-09-01']]);
assert.deepEqual(dates('Sagra delle Frittelle Dolci'), [['2026-04-12','2026-04-12']]);
assert.deepEqual(dates('Senti Come Mi Brace'), [['2026-08-07','2026-08-09'],['2026-08-13','2026-08-15']]);
for (const n of ['Fiera Festa del Patrono','Fiera di Tobbiana','Fiera di Ognissanti']) assert.equal(get(n).editions.length, 0);
assert.equal(get('Mercatino di Natale - Viale Verdi').editions[0].year, 2026);
assert(!get('Mercatino di Natale - Viale Verdi').editions[0].start);
assert.equal(get('Mercatino di Natale - Via Marruota').editions[0].year, 2025);
assert.equal(get('Fiera del Disco, Fumetti, Carte Pokémon e Videogiochi').city, 'Massa e Cozzile');
assert(!events.some(e => /Pistoia in Fiera|Christmas Tradition Village|Pizza Festival|Mercatino dei Grilli/.test(e.name)));
for (const e of events) {
    assert(e.source.checkedAt && e.sourceRecordIds.includes(e.source.url));
    assert(e.participation.note.length > 80);
    for (const u of e.sourceRecordIds) assert(audit.research.sourceReceipts.some(r => r.url === u), u);
    if (e.pricing) {assert.equal(e.participation.costs, e.pricing.details); assert(e.sourceRecordIds.includes(e.pricing.sourceUrl))}
}
assert.equal(events.filter(e => e.pricing).length, 5);
const handler = require('../api/fiera');
for (const e of events) {
    const res = {setHeader(){},status(n){this.code=n;return this},send(s){this.body=s}};
    handler({query:{slug:e.id}}, res); assert.equal(res.code, 200); assert(!res.body.includes('undefined'));
}
const server = http.createServer((req,res) => {
    const u = new URL(req.url,'http://localhost');
    if (u.pathname.startsWith('/fiere/')) return handler({query:{slug:decodeURIComponent(u.pathname.slice(7))}}, {setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this},send:s=>res.end(s)});
    const file = path.join(root,u.pathname === '/fiere' ? 'fiere.html' : u.pathname);
    if (!file.startsWith(root+path.sep)) {res.writeHead(403);return res.end()}
    fs.readFile(file,(err,d) => {if(err){res.writeHead(404);return res.end()}res.setHeader('Content-Type', /\.m?js$/.test(file) ? 'application/javascript' : file.endsWith('.json') ? 'application/json' : file.endsWith('.css') ? 'text/css' : 'text/html');res.end(d)});
});
(async () => {
    assert(process.env.PLAYWRIGHT_MODULE,'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0,'127.0.0.1',r));
    const base = process.env.FIERE_PT_BASE_URL || 'http://127.0.0.1:'+server.address().port;
    try {
        for (const [engine,width] of [['chromium',1440],['chromium',320],['webkit',390]]) {
            const b = await pw[engine].launch();
            try {
                const c = await b.newContext({viewport:{width,height:900}});
                await c.route('**/*',route => {
                    const u = new URL(route.request().url());
                    if (['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname)) return route.fulfill({contentType:'application/javascript',body:''});
                    return u.origin === new URL(base).origin ? route.continue() : route.abort();
                });
                const p = await c.newPage(), errors = [];
                p.on('pageerror',e => errors.push(e.message));
                await p.goto(base+'/fiere?provincia=Pistoia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await p.waitForFunction(() => document.querySelector('#list-count').textContent === '117');
                while (await p.locator('#load-more').isVisible()) await p.locator('#load-more').click();
                assert.deepEqual(await p.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
                await p.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await p.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
                assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
                const dialogs = [...events.filter(e=>e.pricing),...['Fiera di Tobbiana','Mercatino di Natale - Viale Verdi','Mercatini di Natale - Cutigliano','Il Mercatino del Blues','Pescia Antiqua','Fiera di Casalguidi - Mercato del Lunedì','Fiera del Disco, Fumetti, Carte Pokémon e Videogiochi','Mercatino d’Autunno - Rassegna della Castanicoltura'].map(n=>get(n))];
                for (const e of dialogs) {
                    await p.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();
                    await p.waitForFunction(() => document.querySelector('#fair-dialog').open);
                    const dialog = p.locator('#fair-dialog');
                    assert((await dialog.innerText()).includes(e.name));
                    assert(await dialog.locator('a[data-fiere-source]').count());
                    if(e.pricing){assert.equal(await p.locator('#detail-costs').innerText(),e.pricing.details);assert.equal(await p.locator('#detail-costs-source').getAttribute('data-fiere-source'),e.pricing.sourceUrl)}
                    assert(await dialog.evaluate(d => d.scrollWidth <= d.clientWidth+1));
                    await p.locator('#close-detail').click();
                }
                assert.deepEqual(errors,[]); await c.close();
                const nojs = await b.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
                for(const n of ['Naturalitas','Fiera di Tobbiana','Mercatini di Natale - Cutigliano','Fiera di Casalguidi']) {
                    const e=get(n),r=await q.goto(base+'/fiere/'+e.id);
                    assert.equal(r.status(),200);assert((await q.locator('h1').innerText()).includes(e.name));
                    assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
                }
                await nojs.close();
                results.push({engine,width,events:events.length,dialogs:dialogs.length,status:'passed',base});
                console.log(engine,width,'Pistoia: 117 schede, mappa, 13 dialog e pagine senza JS OK');
            } finally {await b.close()}
        }
    } finally {
        server.close();
        if(process.env.FIERE_PT_OUT)fs.writeFileSync(process.env.FIERE_PT_OUT,JSON.stringify(results,null,2));
    }
})().catch(e=>{console.error(e);process.exitCode=1});
