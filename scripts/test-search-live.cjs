// Verifica in produzione solo dati pubblici; nessun login o aggiornamento degli annunci.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SEARCH_LIVE_BASE || 'https://subingresso.it';
const target = '035383af-dbc8-4805-9570-b94008d8f8cd';
const before = process.argv.includes('--before');
(async () => {
    for (const [engine,name,mobile] of before ? [[chromium,'Chrome',false]] : [[chromium,'Chrome',false],[chromium,'Chrome',true],[webkit,'Safari',false],[webkit,'Safari',true]]) {
        const browser = await engine.launch({ headless:true });
        try {
            const context = await browser.newContext({ viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile });
            await context.route('**/*', route => ['GET','HEAD','OPTIONS'].includes(route.request().method()) ? route.continue() : route.fulfill({contentType:'application/json',body:'[]'}));
            await context.route('**/js/auth.js*', route => route.fulfill({contentType:'text/javascript',body:'window.getCurrentUser=async()=>null;window.updateAuthNav=()=>{};window.openAuthModal=()=>{};'}));
            const page = await context.newPage();
            const errors=[];
            page.on('pageerror',error=>errors.push(error.message));
            await page.goto(base,{waitUntil:'domcontentloaded',timeout:45000});
            await page.evaluate(()=>locationSearch.ready);
            if (before) {
                await page.locator('#searchInput').fill('Rivoltella');
                await page.locator('#searchInput').press('Enter');
                await page.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'}).waitFor();
                assert.equal(new URL(page.url()).pathname,'/');
                console.log('BUG REPRODUCED: Rivoltella + Invio lascia la home senza cercare.');
                continue;
            }
            assert.equal(await page.locator('script[src="js/location-search.js?v=4"]').count(),1,'correzione pubblicata');
            for (const [i,query] of ['Rivoltella','Rivoltela','Rivolttella','Rivotlella','abbigliament rivoltela','rivol'].entries()) {
                if (i) await page.goto(base,{waitUntil:'domcontentloaded'});
                await page.locator('#searchInput').fill(query);
                await page.locator('#searchInput').press('Enter');
                await page.waitForURL('**/annunci?*',{timeout:30000});
                await page.locator('[data-listing-id="'+target+'"]').waitFor({timeout:30000});
                assert.equal(new URL(page.url()).searchParams.get('q'),query);
                assert.equal(new URL(page.url()).searchParams.has('comune'),false);
            }
            await page.locator('#searchBar').fill('Rivoltella');
            await page.locator('#searchBarWrapper button').click();
            await page.locator('#subtitle').filter({hasText:'Risultati per "Rivoltella"'}).waitFor();
            await page.locator('[data-listing-id="'+target+'"]').waitFor();
            await page.locator('#searchBar').fill('Rivoltella');
            const chosen=page.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'});
            await (mobile?chosen.tap():chosen.click());
            await page.selectOption('#radiusKm','50');
            await page.locator('#subtitle').filter({hasText:'e dintorni'}).waitFor();
            await page.locator('[data-listing-id="'+target+'"]').waitFor();

            if (name==='Chrome' && !mobile) {
                const result = await page.evaluate(async () => {
                    clearFilters();
                    await new Promise(resolve=>setTimeout(resolve,200));
                    const rows=LISTINGS.filter(row=>row.status==='active').map(row=>({id:row.id,comune:row.comune,titolo:row.titolo}));
                    const failures=[];
                    for(const row of rows) for(const query of [row.comune,row.titolo]) {
                        sBar.value=query;
                        await applyFilters();
                        await new Promise(resolve=>setTimeout(resolve,180));
                        if(!document.querySelector('[data-listing-id="'+row.id+'"]')) failures.push({id:row.id,query});
                    }
                    return {count:rows.length,failures};
                });
                assert.deepEqual(result.failures,[]);
                console.log('LIVE ALL LISTINGS: '+result.count+' annunci trovati ciascuno per luogo e titolo.');
                fs.writeFileSync(path.join(process.env.TEMP || '.', 'subingresso-search-live-report.json'),JSON.stringify({verifiedAt:new Date().toISOString(),publicListings:result.count,searches:result.count*2,failures:result.failures},null,2));
            }
            assert.deepEqual(errors,[]);
            console.log('LIVE OK '+name+' '+(mobile?'mobile':'desktop')+': Rivoltella con Invio, Cerca, refusi, prefissi, frasi e suggerimento scelto.');
        } finally { await browser.close(); }
    }
})().catch(error=>{console.error(error);process.exitCode=1;});
