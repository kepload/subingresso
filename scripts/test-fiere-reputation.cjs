// Evidence, expiry, preservation and real interactions for reputation badges.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/fiere.json'), 'utf8'));
const research = JSON.parse(fs.readFileSync(path.join(root, 'data/fiere-rinomatezza.json'), 'utf8'));
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const today = '2026-10-16';
const levels = Object.keys(api.REPUTATIONS);
for (const [id, rating] of Object.entries(research.events)) {
    const event = catalog.events.find(e => e.id === id);
    assert(event, id);
    assert.deepEqual(event.reputation, rating);
    assert.equal(api.reputationLevel(event, today), rating.level);
    assert.equal(api.reputationLevel(event, '2028-10-16'), 'unknown');
}
const debut = catalog.events.find(e => e.id === 'liguria-genova-tipicamente-zena-edizione-inaugurale');
assert.equal(api.reputationLevel({ name: 'Antica Fiera Nazionale', stallCount: 1000 }, today), 'unknown');
assert.equal(api.reputationLevel({ reputation: { ...debut.reputation, evidence: [] } }, today), 'unknown');
assert.equal(api.reputationLevel({ reputation: { ...debut.reputation, evidence: [null] } }, today), 'unknown');
assert.equal(api.reputationLevel({ reputation: { ...debut.reputation, level: 'toString' } }, today), 'unknown');
assert.equal(api.reputationLevel({ reputation: { ...debut.reputation, checkedAt: '2027-01-01' } }, today), 'unknown');
assert.equal(api.reputationLevel(debut, debut.reputation.reviewAfter), 'recente');
assert.equal(api.reputationLevel(debut, '2027-10-17'), 'unknown');
// A low administrative counter, a seasonal sub-edition or a new venue must
// not silently become a debut badge for an older or combined event.
for (const id of ['lombardia-monza-monzacon', 'lombardia-iseo-natale-con-gusto',
    'lombardia-monza-mi-fido-di-te-2026-sesta-edizione',
    'liguria-genova-nuova-fiera-primavera', 'lombardia-gonzaga-mercatino-di-marzaglia-a-gonzaga']) {
    const event = catalog.events.find(e => e.id === id);
    assert(event, id);
    assert.notEqual(api.reputationLevel(event, today), 'recente', id);
}
for (const level of levels) {
    const state = { reputation: level, months: [], query: '' };
    assert.deepEqual(api.filterEvents(catalog.events, state), catalog.events.filter(e => api.reputationLevel(e) === level));
    assert(api.filterEvents(catalog.events, state).length > 0, level);
    const combined = { ...state, province: 'Genova', months: [5] };
    assert.deepEqual(api.filterEvents(catalog.events, combined), catalog.events.filter(e => api.reputationLevel(e) === level && e.province === 'Genova' && e.months.includes(5)));
}
// Content comparison against the committed catalogue catches unrelated data loss.
if (!process.env.FIERE_TEST_BASE_URL) {
    const previous = JSON.parse(execFileSync('git', ['show', 'HEAD:data/fiere.json'], { cwd: root, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 }));
    const withoutRatings = data => ({ ...data, events: data.events.map(({ reputation, ...event }) => event) });
    assert.deepEqual(withoutRatings(catalog), withoutRatings(previous));
}
// Invalid editorial entries must fail before they can be published.
execFileSync('python', ['-c', `
import importlib.util, copy, json
from pathlib import Path
spec=importlib.util.spec_from_file_location('build',Path('scripts/build-fiere.py'))
b=importlib.util.module_from_spec(spec); spec.loader.exec_module(b)
ratings=json.loads(Path('data/fiere-rinomatezza.json').read_text(encoding='utf-8'))['events']
for rating in ratings.values(): b.validate_reputation(rating)
# Regional calendars can document years of history without giving edition counts
# or a foundation date. Keep those distinct and enforce the same ten-year floor.
years=copy.deepcopy(next(r for r in ratings.values() if r['level']=='consolidata'))
years['evidence']=[dict(kind='history',label='Calendario ufficiale: anni di storicita',url='https://example.org/calendar',year=2026,historyYears=10)]
b.validate_reputation(years)
for value in [0,3,9,'10',None]:
    invalid=copy.deepcopy(years); invalid['evidence'][0]['historyYears']=value
    try: b.validate_reputation(invalid)
    except (AssertionError,ValueError): pass
    else: raise AssertionError('Insufficient history years accepted')
sample=copy.deepcopy(next(iter(ratings.values())))
bad=[]
for patch in [{'evidence':[]},{'level':'rinomata'},{'reviewAfter':'2026-01-01'},{'checkedAt':'2027-01-01'},{'level':'recente'}]:
    bad.append(dict(sample,**patch))
bad.append(dict(sample,evidence=[dict(sample['evidence'][0],url='javascript:alert(1)')]))
for rating in bad:
    try: b.validate_reputation(rating)
    except (AssertionError,ValueError): pass
    else: raise AssertionError('Unsupported rating accepted')
`], { cwd: root, stdio: 'pipe' });

const server = http.createServer((req, res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[path.extname(file)] || 'text/plain');
    if (['js/supabase-config.js', 'js/page-view-tracker.js', 'js/auth.js'].includes(file)) return res.end('');
    fs.readFile(full, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function run(engine, label, viewport, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport, hasTouch: viewport.width < 720 });
        const origin = new URL(base).origin;
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            if (url.origin !== origin || /\/js\/(?:supabase-config|auth|page-view-tracker)\.js$/.test(url.pathname)) return route.fulfill({ status: 200, body: '' });
            return route.continue();
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        const count = expected => page.waitForFunction(n => document.querySelector('#list-count').textContent === String(n), expected);
        await page.goto(base + '/fiere?rinomatezza=rinomata');
        await page.waitForSelector('.fiere-province');
        await count(catalog.events.filter(e => api.reputationLevel(e) === 'rinomata').length);
        assert.equal(await page.locator('#reputation-filter').inputValue(), 'rinomata');
        for (const level of levels) {
            await page.selectOption('#reputation-filter', level);
            const expected = catalog.events.filter(e => api.reputationLevel(e) === level);
            await count(expected.length);
            assert.equal(new URL(page.url()).searchParams.get('rinomatezza'), level);
            const cards = page.locator('.fiere-card');
            assert.equal(await cards.count(), Math.min(12, expected.length));
            assert.equal(await cards.locator('.fiere-reputation[data-reputation="' + level + '"]').count(), level === 'unknown' ? 0 : await cards.count());
            if (level === 'unknown') assert.equal(await cards.locator('.fiere-card-reputation').count(), 0);
            const markerCount = await page.locator('.fiere-marker').evaluateAll(markers => markers.reduce((total, marker) => total + marker.dataset.events.split(',').length, 0));
            assert.equal(markerCount, expected.length);
            const opener = cards.first().locator(level === 'unknown' ? '.fiere-card-button' : '.fiere-reputation');
            await opener.focus(); await page.keyboard.press('Enter');
            await page.waitForSelector('#fair-dialog[open]');
            if (level === 'unknown') {
                assert.equal(await page.locator('#detail-reputation-badge [data-reputation]').count(), 0);
                assert.equal(await page.locator('#detail-reputation-badge').isVisible(), false);
            } else {
                assert.equal(await page.locator('#detail-reputation-badge [data-reputation]').getAttribute('data-reputation'), level);
                assert.equal(await page.locator('#detail-reputation-badge').isVisible(), true);
            }
            const id = await cards.first().getAttribute('data-event-id');
            const event = expected.find(e => e.id === id);
            assert.equal(await page.locator('#fair-dialog #detail-reputation-reason, #fair-dialog #detail-reputation-sources, #fair-dialog .fiere-reputation-help').count(), 0);
            assert.equal((await page.locator('#detail-reputation-badge').textContent()).trim(), level === 'unknown' ? '' : api.REPUTATIONS[level].icon + api.REPUTATIONS[level].label);
            if (level === 'rinomata' || level === 'recente') {
                await page.locator('#fair-dialog').screenshot({ path: path.join(os.tmpdir(), 'fiere-rinomatezza-' + label + '-' + level + '.png') });
            }
            await page.keyboard.press('Escape');
            await page.locator('#reset-filters').click();
            await count(catalog.events.length);
        }
        await page.selectOption('#reputation-filter', 'recente');
        await page.selectOption('#province-filter', 'Genova');
        await count(1);
        await page.reload(); await count(1);
        assert.equal(await page.locator('#reputation-filter').inputValue(), 'recente');
        await page.locator('.fiere-marker').first().click();
        await page.waitForSelector('#map-popup:not([hidden]) .fiere-reputation[data-reputation="recente"]');
        await page.locator('.fiere-popup-event').first().click();
        await page.waitForSelector('#fair-dialog[open]');
        await page.keyboard.press('Escape');
        await page.locator('#reset-filters').click(); await count(catalog.events.length);
        assert.equal(await page.locator('#reputation-filter').inputValue(), '');
        assert.equal(new URL(page.url()).searchParams.get('rinomatezza'), null);
        await page.goto(base + '/fiere?rinomatezza=toString'); await count(catalog.events.length);
        assert.equal(await page.locator('#reputation-filter').inputValue(), '');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.locator('.fiere-reputation-legend summary').click();
        assert((await page.locator('#reputation-coverage').innerText()).includes(Object.keys(research.events).length + ' di ' + catalog.events.length));
        await page.screenshot({ path: path.join(os.tmpdir(), 'fiere-rinomatezza-' + label + '.png'), fullPage: false });
        assert.deepEqual(errors, []);
        console.log(label + ': badges, evidence, filter combinations, map, URL, keyboard, reset and overflow passed');
    } finally { await browser.close(); }
}
(async () => {
    const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    let base = process.env.FIERE_TEST_BASE_URL;
    if (!base) { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = 'http://127.0.0.1:' + server.address().port; }
    try {
        await run(pw.chromium, 'desktop', { width: 1440, height: 1100 }, base);
        await run(pw.chromium, 'phone', { width: 390, height: 844 }, base);
        await run(pw.webkit, 'webkit', { width: 390, height: 844 }, base);
        console.log('Reputation integrity and catalogue preservation passed.');
    } finally { if (server.listening) await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; if (server.listening) server.close(); });
