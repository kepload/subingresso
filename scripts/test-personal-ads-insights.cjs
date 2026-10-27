'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const catalog=require('../lib/personal-ads.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.PERSONAL_AD_INSIGHTS_QA_DIR||path.join(root,'.local/verifiche/ads-grafico-dettagli/insights');fs.mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,[path.join(__dirname,'test-personal-ads.cjs'),'--serve'],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
const ready=new Promise((resolve,reject)=>{let buffer='';const timer=setTimeout(()=>reject(Error('Preview timeout')),30000);server.stdout.on('data',chunk=>{buffer+=chunk;const match=buffer.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});server.once('exit',code=>{clearTimeout(timer);reject(Error('Preview exit '+code));});server.stderr.on('data',chunk=>process.stderr.write(chunk));});
const stats={updated_at:'2026-10-27T21:00:00Z',started_at:'2026-10-24T10:00:00Z',rows:[
 {ad_id:'vendi-01',format:'300x250',article_slug:'vendere-posteggio',article_title:'Vendere il posteggio <img src=x onerror=window.xss=true>',event_day:'2026-10-24',impressions:10,clicks:2,measured_clicks:2,converted_clicks:1,listings:1},
 {ad_id:'vendi-01',format:'728x90',article_slug:'prezzo-posteggio',article_title:'Il prezzo del posteggio',event_day:'2026-10-26',impressions:20,clicks:3,measured_clicks:2,converted_clicks:1,listings:1},
 {ad_id:'compra-02',format:'300x250',article_slug:'prezzo-posteggio',article_title:'Il prezzo del posteggio',event_day:'2026-10-26',impressions:5,clicks:0},
 {ad_id:'fiere-01',format:'320x100',event_day:'2026-10-27',impressions:0,clicks:1},
 {ad_id:'compra-02',format:'300x250',impressions:4,clicks:0}
]};
async function run(type,name,width,base){const browser=await type.launch({headless:true});try{
 const errors=[],snapshot={ads:catalog.ads,formats:catalog.formats,stats};
 const next=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});await next.route('https://**/*',r=>r.abort());await next.addInitScript(value=>{sessionStorage.setItem('qa-baseline',JSON.stringify(value));sessionStorage.setItem('qa-periods',JSON.stringify({'7':{...value,stats:{...value.stats,rows:value.stats.rows.slice(0,1)}}}));},snapshot);
 await next.route(/\/api\/personal-ads\?action=context-options$/,route=>route.fulfill({contentType:'application/json',body:JSON.stringify({settings:{ads:{'vendi-01':{rule:{priorityKeywords:['prezzo salvato','cessione'],excludedKeywords:['parola esclusa']},revision:2}},posts:{}},posts:[]})}));
 const p=await next.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/qa');await p.locator('#paViewsChart svg').waitFor();
 assert.equal(await p.locator('#paOverviewViews').textContent(),'39');assert.deepEqual(await p.locator('#paOverviewMetrics dd').allTextContents(),['6','2']);
 assert.equal(await p.locator('#paMotionToggle,#paShowStats,#paDownloadAll,[data-pa-motion-toggle]').count(),0);
 assert.equal(await p.locator('#paResultsPanel').evaluate(el=>el.open),false);
 assert(await p.locator('#paListingTitle').isHidden());assert(await p.locator('#paContextPanel > summary').isHidden());
 assert(await p.locator('#paViewsChart').evaluate(el=>el.getBoundingClientRect().bottom<document.querySelector('.pa-library').getBoundingClientRect().top));
 assert.match(await p.locator('#paChartNote').textContent(),/4 visualizzazioni senza data/);
 await p.locator('#paViewsChart svg').focus();await p.keyboard.press('Home');assert.match(await p.locator('.pa-chart-tip').textContent(),/24 ott · 10 visualizzazioni/);await p.keyboard.press('ArrowRight');assert.match(await p.locator('.pa-chart-tip').textContent(),/25 ott · 0 visualizzazioni/);await p.keyboard.press('ArrowRight');assert.match(await p.locator('.pa-chart-tip').textContent(),/26 ott · 25 visualizzazioni/);await p.keyboard.press('End');assert.match(await p.locator('.pa-chart-tip').textContent(),/27 ott · 0 visualizzazioni/);await p.locator('#paDays').focus();
 for(const theme of ['light','dark']){await p.evaluate(theme=>{document.documentElement.classList.toggle('admin-dark',theme==='dark');document.documentElement.removeAttribute('data-pa-motion-autoplay');},theme);await p.evaluate(async()=>{await document.fonts.ready;});await p.screenshot({path:path.join(out,`${name}-${width}-${theme}.png`)});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await p.locator('[data-ad="vendi-01"]').click({position:{x:30,y:30}});await p.locator('#paAdTargeting').getByText('prezzo salvato',{exact:true}).waitFor();
 assert.deepEqual(await p.locator('#paAdMetrics dd').allTextContents(),['30','5','13,3%','2']);assert.equal(await p.locator('#paAdArticles li').count(),2);assert.equal(await p.locator('#paAdArticles img').count(),0);assert.equal(await p.evaluate(()=>!!window.xss),false);
 assert.equal(await p.locator('#paTechnical').evaluate(el=>el.open),false);assert(await p.locator('#paCopyHtml').isHidden());assert(await p.locator('#paPack').isHidden());
 assert((await p.locator('#paAdTargeting').textContent()).includes('parola esclusa'));assert(!(await p.locator('#paAdTargeting').textContent()).includes('quanto vale'));
 await p.locator('#paFormat').selectOption('300x250');assert.deepEqual(await p.locator('#paAdMetrics dd').allTextContents(),['30','5','13,3%','2']);assert.match(await p.locator('#paAdFormatMetrics').textContent(),/10 visualizzazioni · 2 clic/);
 await p.locator('#paFormat').selectOption('728x90');assert.match(await p.locator('#paAdFormatMetrics').textContent(),/20 visualizzazioni · 3 clic/);
 await p.screenshot({path:path.join(out,`${name}-${width}-ad.png`)});await p.keyboard.press('Escape');
 await p.locator('#paResultsPanel > summary').click();await p.locator('#paArticleFilter').selectOption('prezzo-posteggio');assert.equal(await p.locator('#paTotals dd').first().textContent(),'25');assert.equal(await p.locator('#paOverviewViews').textContent(),'39','overview remains the general total');
 await p.locator('[data-result-ad="vendi-01"]').click();assert.deepEqual(await p.locator('#paAdMetrics dd').allTextContents(),['30','5','13,3%','2'],'AD totals include all its articles');await p.keyboard.press('Escape');
 await p.locator('#paResultsPanel > summary').click();const reads=await p.evaluate(()=>qaStatsReads);await p.locator('#paDays').selectOption('7');assert.equal(await p.locator('#paOverviewViews').textContent(),'10');assert.equal(await p.evaluate(()=>qaStatsReads),reads,'period changes use the opening snapshot');
 await p.locator('[data-ad="compra-02"]').click({position:{x:30,y:30}});assert.deepEqual(await p.locator('#paAdMetrics dd').allTextContents(),['0','0','—','0']);await p.keyboard.press('Escape');
 // Cached settings must still reflect edits made in the page's existing rule editor.
 await p.evaluate(()=>window.dispatchEvent(new CustomEvent('personal-ads:rules',{detail:{owner:qaUser.id,settings:{ads:{'vendi-01':{rule:{priorityKeywords:['nuova parola <img src=x>'],excludedKeywords:[]}}},posts:{}}}})));
 await p.locator('[data-ad="vendi-01"]').click({position:{x:30,y:30}});assert.match(await p.locator('#paAdTargeting').textContent(),/nuova parola <img src=x>/);assert.equal(await p.locator('#paAdTargeting img').count(),0);await p.keyboard.press('Escape');
 if(name==='Chromium'&&width===1440){
  await next.unroute(/\/api\/personal-ads\?action=context-options$/);let failed=true;
  await next.route(/\/api\/personal-ads\?action=context-options$/,route=>route.fulfill({status:failed?503:200,contentType:'application/json',body:JSON.stringify(failed?{error:'Non disponibile'}:{settings:{ads:{},posts:{}},posts:[]})}));
  await p.reload();await p.locator('[data-ad="vendi-01"]').click({position:{x:30,y:30}});await p.locator('#paAdTargeting').getByText('Parole di abbinamento non disponibili. Riapri la ADS per riprovare.',{exact:true}).waitFor();
  assert(!(await p.locator('#paAdTargeting').textContent()).includes('quanto vale'));await p.keyboard.press('Escape');failed=false;await p.locator('[data-ad="vendi-01"]').click({position:{x:30,y:30}});await p.locator('#paAdTargeting').getByText('quanto vale',{exact:true}).waitFor();await p.keyboard.press('Escape');
 }
 await p.evaluate(()=>{qaUser=null;qaCallbacks.forEach(fn=>fn('SIGNED_OUT',null));});await p.locator('#paLogin').waitFor({state:'visible'});assert.equal(await p.locator('#paViewsChart').textContent(),'');assert.equal(await p.locator('#paAdTargeting').textContent(),'');assert.equal(await p.locator('#paAdArticles').textContent(),'');assert.deepEqual(errors,[]);
 await next.close();return{name,width,chart:true,utc_days:true,missing_dates:true,aggregate_ad:true,saved_tags:true,filters:true,private_state:true};
}finally{await browser.close();}}
(async()=>{try{const base=await ready,results=[];for(const [type,name,width]of [[chromium,'Chromium',1440],[chromium,'Chromium',768],[chromium,'Chromium',320],[webkit,'WebKit',390]])results.push(await run(type,name,width,base));fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{server.kill();}})().catch(e=>{console.error(e.stack);server.kill();process.exitCode=1;});
