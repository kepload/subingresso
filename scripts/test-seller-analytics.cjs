// Interfaccia reale e Chart.js, backend simulato: nessun accesso agli account.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const source = process.env.SELLER_DASHBOARD_FILE || path.join(root, 'dashboard.html');
const html = fs.readFileSync(source, 'utf8');
const panel = html.slice(html.indexOf('<div id="sellerAnalyticsPanel"'), html.indexOf('<!-- Onboarding widget'));
const code = html.slice(html.indexOf('// Seller analytics'), html.indexOf('async function loadMyListings()'));
const fixture = `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/seller-analytics.css"><script src="/chart.js"></script>
<body><main style="max-width:1024px;margin:auto;padding:16px">${panel}</main><script>
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function isListingFeatured(){return false;} function isListingExpired(){return false;}
window.fail=false; window.delay=0;
const _supabase={rpc:async(name,args)=>{
  if(name==='dashboard_vetrina_stats')return {data:{listings:[]}};
  const days=args.p_days; await new Promise(r=>setTimeout(r,window.delay));
  if(window.fail)return {error:{message:'offline'}};
  const cutoff=new Date(Date.UTC(2026,9,18-days)).toISOString().slice(0,10);
  const daily=[{day:'2026-10-17',views:4,messages:0,call_clicks:1,whatsapp_clicks:2,chat_clicks:3,saves:5},
    {day:'2026-10-07',views:6,messages:2}, {day:'2026-08-17',messages:3}].filter(r=>r.day>=cutoff);
  const base={premium_analytics:true,photo_count:1,description_length:300,prezzo:1000,views_total:900,msg_total:20,tel_clicks_total:50,saved_total:60};
  return {data:{days,start_day:cutoff,end_day:'2026-10-17',tracking_since:'2026-10-06',listings:[
    {...base,id:'first',titolo:'Posteggio mercato Brescia',daily},
    {...base,id:'second',titolo:'Posteggio Verona',daily:[{day:'2026-10-17',views:10,messages:1}]},
    {...base,id:'empty',titolo:'Nessuna attività recente',daily:[]}]}};
}};
${code}
loadSellerAnalytics(30);
</script></body></html>`;

async function main() {
    const chartResponse = await fetch('https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js');
    assert.equal(chartResponse.ok, true, 'Chart.js disponibile');
    const chart = await chartResponse.text();
    const server = http.createServer((req, res) => {
        if (req.url === '/chart.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(chart); }
        if (req.url === '/css/seller-analytics.css') { res.setHeader('Content-Type', 'text/css'); return res.end(fs.readFileSync(path.join(root,'css/seller-analytics.css'))); }
        if (req.url === '/css/tailwind.css') { res.setHeader('Content-Type', 'text/css'); return res.end(fs.readFileSync(path.join(root, 'css/tailwind.css'))); }
        res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const [engine, name, width, timezoneId] of [[chromium, 'Chromium', 1440, 'Europe/Rome'], [chromium, 'Chromium', 320, 'Pacific/Kiritimati'], [webkit, 'WebKit', 390, 'America/Los_Angeles']]) {
            const browser = await engine.launch({ headless: true });
            try {
                const page = await browser.newPage({ viewport: { width, height: 950 }, timezoneId });
                const errors = []; page.on('pageerror', e => errors.push(e.message));
                await page.goto(base);
                const values = () => page.locator('#sellerAnalyticsSummary .leading-none').allTextContents();
                await page.waitForFunction(() => !_sellerAnalyticsState.loading);
                assert.deepEqual(await values(), ['20', '3', '1', '2']);
                await page.getByRole('button', { name: 'Ultimi 7 giorni', exact: true }).click();
                await page.waitForFunction(() => !_sellerAnalyticsState.loading);
                assert.deepEqual(await values(), ['14', '1', '1', '2']);
                assert.equal(await page.locator('#sellerStatsBtn7').getAttribute('aria-pressed'), 'true');
                await page.selectOption('#sellerAnalyticsListingSelect', 'first');
                assert.deepEqual(await values(), ['4', '0', '1', '2']);
                assert.equal(await page.locator('#sellerAnalyticsHistoryNote').isVisible(), false);
                assert.match(await page.locator('#sellerAnalyticsPeriod').innerText(), /11 ott 2026.*17 ott 2026/);
                assert.equal(await page.evaluate(() => _sellerAnalyticsChart.data.datasets[1].data.reduce((a,b)=>a+b,0)), 0);
                assert.match(await page.locator('#sellerAnalyticsActions').innerText(), /Chat aperte: 3 · Nuovi preferiti: 5/);
                await page.selectOption('#sellerAnalyticsListingSelect', 'empty');
                assert.deepEqual(await values(), ['0', '0', '0', '0']);
                await page.selectOption('#sellerAnalyticsListingSelect', 'first');
                await page.getByRole('button', { name: 'Ultimi 90 giorni', exact: true }).click();
                await page.waitForFunction(() => !_sellerAnalyticsState.loading);
                assert.deepEqual(await values(), ['10', '5', '1', '2']);
                assert.equal(await page.locator('#sellerAnalyticsHistoryNote').isVisible(), false);
                assert.equal(await page.evaluate(() => _sellerAnalyticsChart.data.datasets[0].data[0]), null);
                await page.getByText('Come leggere i numeri', { exact: true }).click();
                assert.equal(await page.locator('details').getAttribute('open'), '');
                assert.equal(await page.locator('#sellerAnalyticsHistoryNote').isVisible(), true);
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Nessun overflow ${name} ${width}`);
                await page.evaluate(() => { window.fail = true; setSellerAnalyticsDays(7); });
                await page.getByRole('button', { name: 'Riprova', exact: true }).waitFor();
                assert.equal(await page.locator('#sellerAnalyticsActions').isVisible(), false);
                await page.evaluate(() => { window.fail = false; });
                await page.getByRole('button', { name: 'Riprova', exact: true }).click();
                await page.waitForFunction(() => !_sellerAnalyticsState.loading);
                assert.deepEqual(await values(), ['4', '0', '1', '2']);
                await page.evaluate(() => { window.delay = 120; setSellerAnalyticsDays(90); window.delay = 0; setSellerAnalyticsDays(7); });
                await page.waitForTimeout(180);
                assert.equal(await page.evaluate(() => _sellerAnalyticsState.days), 7);
                assert.deepEqual(await values(), ['4', '0', '1', '2']);
                assert.deepEqual(errors, []);
                if (process.env.SELLER_SCREENSHOT_DIR) {
                    fs.mkdirSync(process.env.SELLER_SCREENSHOT_DIR, { recursive: true });
                    await page.locator('details').evaluate(el => { el.open = false; });
                    await page.screenshot({ path: path.join(process.env.SELLER_SCREENSHOT_DIR, `statistiche-${name}-${width}.png`), fullPage: true });
                }
                console.log(`OK: ${name} ${width}px ${timezoneId}: numeri, filtri, grafico reale, messaggi/clic, zero recente, storico, errori/riprova e richieste rapide.`);
            } finally { await browser.close(); }
        }
    } finally { await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
