// Verifica in produzione solo dati pubblici; nessun login o aggiornamento degli annunci.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SEARCH_LIVE_BASE || 'https://subingresso.it';
const target = '035383af-dbc8-4805-9570-b94008d8f8cd';
(async () => {
    for (const [engine,name,mobile] of [[chromium,'Chrome',false],[chromium,'Chrome',true],[webkit,'Safari',false],[webkit,'Safari',true]]) {
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
            assert.equal(await page.locator('script[src="js/location-search.js?v=8"]').count(),1,'correzione pubblicata');
            const checkNearby = async () => {
                await page.locator('#subtitle').filter({hasText:'Rivoltella (Desenzano del Garda) (BS) · raggio 100 km'}).waitFor();
                await page.waitForFunction(() => document.querySelector('#resultsGrid').style.opacity !== '0');
                assert.equal(await page.locator('#radiusKm').inputValue(),'100');
                assert.equal(await page.locator('#sortBy option:checked').textContent(),'Più vicini');
                const result = await page.evaluate(() => {
                    const origin=LocationSearch.coordinates(locationSearch.selected);
                    const actual=[...document.querySelectorAll('[data-listing-id]')].map(el=> {
                        const row=LISTINGS.find(row=>row.id===el.dataset.listingId);
                        const coords=LocationSearch.listingCoordinateCandidates(row.comune,row.regione,row.provincia);
                        return {id:row.id,comune:row.comune,expired:isListingExpired(row),distance:coords.length?Math.min(...coords.map(c=>getDistanceKM(...origin,...c))):null};
                    });
                    const expected=LISTINGS.filter(row=> {
                        const coords=LocationSearch.listingCoordinateCandidates(row.comune,row.regione,row.provincia);
                        return coords.length?Math.min(...coords.map(c=>getDistanceKM(...origin,...c)))<=100:LocationSearch.listingMatchesLocation(row.comune,row.regione,row.provincia,locationSearch.selected);
                    }).map(row=>row.id);
                    return {actual,expected};
                });
                assert.deepEqual(result.actual.map(row=>row.id).sort(),result.expected.sort(),'tutti gli annunci entro 100 km');
                assert(result.actual.every((row,index)=>!row.expired||result.actual.slice(index).every(other=>other.expired)), 'scaduti visibili in fondo');
                for (const expired of [false,true]) {
                    const distances=result.actual.filter(row=>row.expired===expired&&row.distance!==null).map(row=>row.distance);
                    assert.deepEqual(distances,distances.slice().sort((a,b)=>a-b),'dal più vicino al più lontano in ciascun gruppo');
                }
                assert(result.actual.some(row=>row.comune==='Moniga del Garda'),'include anche i comuni vicini');
                assert(result.actual.findIndex(row=>row.id===target)<result.actual.findIndex(row=>row.distance>1),'il vecchio annuncio locale precede i dintorni');
                console.log('LIVE RADIUS: '+result.actual.length+' annunci, 100 km, distanze crescenti per gruppo e scaduti in fondo.');
                return result.actual;
            };
            let proximity;
            for (const [i,query] of ['Rivoltella','Rivoltela','Rivolttella','Rivotlella','abbigliament rivoltela','rivol'].entries()) {
                if (i) await page.goto(base,{waitUntil:'domcontentloaded'});
                await page.locator('#searchInput').fill(query);
                await page.locator('#searchInput').press('Enter');
                await page.waitForURL('**/annunci?*',{timeout:30000});
                await page.locator('[data-listing-id="'+target+'"]').waitFor({timeout:30000});
                assert.equal(new URL(page.url()).searchParams.get('q'),query);
                assert.equal(new URL(page.url()).searchParams.has('comune'),false);
                if (i<4) proximity=await checkNearby();
            }
            await page.locator('#searchBar').fill('Rivoltella');
            await page.locator('#searchBarWrapper button').click();
            await page.locator('[data-listing-id="'+target+'"]').waitFor();
            proximity=await checkNearby();
            await page.locator('#searchBar').fill('Rivoltella');
            const chosen=page.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'});
            await (mobile?chosen.tap():chosen.click());
            await page.selectOption('#radiusKm','50');
            await page.locator('#subtitle').filter({hasText:'raggio 50 km'}).waitFor();
            await page.locator('[data-listing-id="'+target+'"]').waitFor();

            if (name==='Chrome' && !mobile) {
                const result = await page.evaluate(async () => {
                    clearFilters();
                    document.getElementById('radiusKm').value='100';
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
                fs.writeFileSync(path.join(process.env.TEMP || '.', 'subingresso-search-live-report.json'),JSON.stringify({verifiedAt:new Date().toISOString(),publicListings:result.count,searches:result.count*2,radiusKm:100,proximity,failures:result.failures},null,2));
            }
            assert.deepEqual(errors,[]);
            console.log('LIVE OK '+name+' '+(mobile?'mobile':'desktop')+': Rivoltella con Invio, Cerca, refusi, prefissi, frasi e suggerimento scelto.');
        } finally { await browser.close(); }
    }
})().catch(error=>{console.error(error);process.exitCode=1;});
