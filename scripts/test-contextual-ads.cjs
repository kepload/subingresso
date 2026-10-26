'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=require('../js/contextual-ads.js'),catalog=require('../js/house-ads-catalog.js'),markup=require('../js/blog-markup.js'),handler=require('../api/blog.js');
const root=path.resolve(__dirname,'..'),out=process.env.CONTEXTUAL_ADS_QA_DIR||path.join(root,'.taste-skill/contextual-ads');fs.mkdirSync(out,{recursive:true});
const body=Array.from({length:10},(_,i)=>'<h2>Sezione '+i+'</h2><p>'+('Documenti, regole e indicazioni utili per il lavoro quotidiano. '.repeat(10))+'</p>').join('')+'<table><tr><th>Voce</th><th>Dettaglio</th></tr><tr><td>Documento</td><td>Originale</td></tr></table>';
const legacy='<aside class="not-prose" data-fiere-promo="inline"><h2>Vendi il banco, vendita posteggi!</h2></aside>';
const posts=[
 {slug:'fiere-lombardia',title:'Le fiere in Lombardia',content:body.replace('<h2>Sezione 6',legacy+'<h2>Sezione 6')+legacy,goal:'fiere'},
 {slug:'vendere-posteggio',title:'Vendere il proprio posteggio',content:body,goal:'vendi'},
 {slug:'comprare-licenza',title:'Comprare una licenza ambulante',content:body,goal:'compra'},
 {slug:'nessuna-corrispondenza',title:'Fotografia notturna',content:'<p>Obiettivi e immagini del cielo.</p>',goal:null},
 {slug:'eredita-licenza-successione',title:'Guida agli eredi della licenza',content:body,goal:null}
].map(p=>({...p,published_at:'2026-10-01',excerpt:p.title,category:'Guida',author:'Redazione',cover_image_url:null}));
global.fetch=async raw=>{const u=new URL(raw),slug=u.searchParams.get('slug')?.replace(/^eq\./,'');return new Response(JSON.stringify(slug?posts.filter(p=>p.slug===slug):posts));};
async function render(post){const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},send(s){this.body=s;return this;}};await handler({query:{post}},res);assert.equal(res.statusCode,200);return res.body;}
function unitTests(){
 for(const title of ['Come valutare un posteggio mercatale prima di comprarlo','Prima di acquistarlo: valuta il posteggio','Ho comprato una licenza ambulante','Quanto costa un posteggio al mercato?'])assert.deepEqual(engine.analyze({title,slug:'valutare-posteggio'},'').topics,['acquisto'],title);
 assert.deepEqual(engine.analyze({title:'Quanto vale il mio posteggio?'},'').topics,['vendita']);
 const negated=engine.analyze({title:'Non voglio vendere il mio posteggio'},'');assert(!engine.candidates(negated,'inline','300x250').some(ad=>ad.goal==='vendi'));
 const manual=engine.analyze({title:'Quanto vale il banco?'},'',{topics:['acquisto'],excludedAds:['compra-01']});assert.deepEqual(manual.topics,['acquisto']);assert(!engine.candidates(manual,'inline','300x250').some(ad=>ad.id==='compra-01'));
 const cancelled=engine.analyze({title:'Fiera annullata per maltempo'},'');assert(!engine.candidates(cancelled,'inline','300x250').some(ad=>ad.id==='fiere-01'));
 const presence=engine.analyze({title:'Presenze e graduatoria della fiera'},'');assert(engine.explain(presence,'inline','300x250').find(r=>r.ad.id==='fiere-03').weight>engine.explain(presence,'inline','300x250').find(r=>r.ad.id==='fiere-04').weight);
 const context=engine.analyze({title:'Fiere e mercatini',slug:'fiere'},'Vendere posteggi comprare licenze');assert.deepEqual(context.topics,['fiere']);
 assert.deepEqual(engine.analyze({title:'Le inferiere lavorano',slug:''},'').topics,[],'whole words only');
 assert.deepEqual(engine.analyze({title:'Vendere prodotti fatti da te al mercato'},'').topics,['mercati'],'retail is not selling a licence');
 assert.deepEqual(engine.analyze({title:'Compro un banco per vendere casalinghi'},'').topics,['acquisto']);
 assert.deepEqual(engine.analyze({title:'Bandi posteggi in Veneto'},'').topics,['acquisto']);
 assert.equal(engine.select({topics:[]},'inline',720),null);assert.equal(engine.select(context,'unknown',720),null);assert.deepEqual(engine.candidates(context,'inline','1080x1920'),[]);
 const ad=catalog.ads.find(a=>a.goal==='fiere');
 assert.equal(engine.select(context,'inline',720,[],()=>0,[{...ad,kind:'paid'}]),null);
 assert.equal(engine.select(context,'inline',720,[],()=>0,[{...ad,active:false}]),null);
 assert.equal(engine.select(context,'inline',720,[],()=>0,[{...ad,formats:['300x600']}]),null);
 assert.equal(engine.select(context,'inline',720,[],()=>0,[{...ad,formats:['300x250']}]).format.id,'300x250');
 const eligible=engine.candidates(context,'inline','728x90'),chosen=new Set();
 for(let i=0;i<eligible.length;i++)chosen.add(engine.select(context,'inline',720,[],()=>i/eligible.length).ad.id);
 assert.equal(chosen.size,6,'all six relevant creatives can win');
 for(const width of [240,272,300,336,640,720,1440]){const first=engine.select(context,'inline',width,[],()=>0),next=engine.select(context,'closing',width,[first.ad.id],()=>0);assert.notEqual(first.ad.id,next.ad.id);assert(first.ad.formats.includes(first.format.id));}
 assert(catalog.ads.every(a=>a.kind==='house'&&!('stats'in a)&&!('origin'in a)&&!('note'in a)));
}
async function audit(){
 const all=process.env.CONTEXTUAL_ADS_POSTS?JSON.parse(fs.readFileSync(process.env.CONTEXTUAL_ADS_POSTS,'utf8')):posts,results=[];
 for(const post of all){const doc=new JSDOM(markup.articleMarkup(post,post.content)).window.document,article=doc.querySelector('#blogPostContent'),before=engine.editorialText(article),tables=article.querySelectorAll('table').length,state=engine.mount(article,post,markup.regions);
  assert.equal(engine.editorialText(article),before,post.slug);assert.equal(article.querySelectorAll('table').length,tables);const slots=[...doc.querySelectorAll('[data-contextual-ad-slot]')];assert(slots.length<=2,post.slug);for(const host of slots){const ad=catalog.ads.find(a=>a.id===host.dataset.adId);assert(ad&&ad.keywords.some(k=>state.context.topics.includes(k)),post.slug);}
  engine.mount(article,post,markup.regions);assert.equal(doc.querySelectorAll('[data-contextual-ad-slot]').length,slots.length,'idempotent');
  if(/\bfier[ae]\b/i.test(post.title))assert(state.context.topics.includes('fiere'),post.slug);
  if(post.slug.startsWith('bandi-posteggi-'))assert(state.context.topics.includes('acquisto'),post.slug);
  results.push({slug:post.slug,topics:state.context.topics,keywords:state.context.keywords,slots:slots.length,ids:slots.map(h=>h.dataset.adId)});
 }fs.writeFileSync(path.join(out,'matching-audit.json'),JSON.stringify(results,null,2));return {posts:results.length,covered:results.filter(r=>r.slots).length};
}
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff':'font/woff','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/qa'){res.setHeader('Content-Type','text/html');res.end(await render(url.searchParams.get('post')||posts[0].slug));return;}
 if(url.pathname==='/slots'){const doc=new JSDOM(await render(posts[0].slug)).window.document,slots=[...doc.querySelectorAll('[data-contextual-ad-slot]')].map(el=>el.outerHTML).join('');res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anteprima slot ADS</title><link rel="stylesheet" href="/css/personal-ads.css"><link rel="stylesheet" href="/css/contextual-ads.css"><style>main{max-width:768px;padding:24px}h1{font-size:24px}</style></head><body><main><h1>Pubblicità fiere</h1><article id="sample">'+slots+'</article></main><script src="/js/house-ads-catalog.js"></script><script src="/js/contextual-ads.js"></script><script>SubingressoContextualAds.mount(document.getElementById("sample"),{title:"Fiere in Lombardia",slug:"fiere-lombardia"},{Lombardia:"Lombardia"});</script><script src="/js/personal-ads-motion.js"></script></body></html>');return;}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch(e){res.statusCode=500;res.end(e.message);}});
async function browsers(base){
 const results=[];
 for(const [type,name,width]of [[chromium,'Chromium',1440],[chromium,'Chromium',768],[chromium,'Chromium',320],[webkit,'WebKit',390]]){
  const b=await type.launch({headless:true});try{
   for(const post of posts){const p=await b.newPage({viewport:{width,height:900},reducedMotion:'no-preference'}),errors=[],writes=[];
    await p.addInitScript(()=>{Math.random=()=>.001;});p.on('pageerror',e=>errors.push(e.message));
    await p.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**',r=>{if(r.request().method()!=='GET')writes.push(r.request().url());return r.fulfill({json:r.request().url().endsWith('blog_listing_ads')?{regions:[],listings:[]}:[]});});
    await p.goto(base+'/qa?post='+post.slug);await p.locator('#blogPostContent').waitFor();
    const cards=p.locator('[data-contextual-ad-slot]');assert.equal(await cards.count(),post.goal?2:0,post.slug);
    if(post.goal){await p.waitForFunction(()=>document.querySelector('[data-contextual-ad-slot]')?.dataset.adFormat===((document.querySelector('#blogPostContent').getBoundingClientRect().width>=640)?'728x90':document.querySelector('#blogPostContent').getBoundingClientRect().width>=336?'336x280':'300x250'));
     const ids=await cards.evaluateAll(els=>els.map(el=>el.dataset.adId));assert(ids.every(id=>id.startsWith(post.goal+'-')));assert.notEqual(ids[0],ids[1]);
     for(const card of await cards.all()){await card.scrollIntoViewIfNeeded();const geom=await card.locator('img').evaluate(img=>{const r=img.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,ratio:img.width/img.height};});assert(geom.left>=0&&geom.right<=width,JSON.stringify(geom));assert(Math.abs(geom.width/geom.height-geom.ratio)<.01);}
     const first=cards.first(),img=first.locator('img');await img.scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('[data-contextual-ad-slot] img').dataset.paPlaying==='true');
     const link=await first.locator('a').getAttribute('href'),q=new URL(link,base).searchParams;assert.equal(q.get('ad'),ids[0]);assert.equal(q.get('format'),await first.getAttribute('data-ad-format'));assert.equal(q.get('placement'),'blog_inline');if(post.goal==='fiere')assert.equal(q.get('region'),'Lombardia');
     await first.locator('[data-pa-pause]').click();assert.equal(await img.getAttribute('data-pa-playing'),'false');
     if(width===1440){await p.setViewportSize({width:390,height:900});await p.waitForFunction(()=>document.querySelector('[data-contextual-ad-slot]').dataset.adFormat==='336x280');assert.equal(await first.getAttribute('data-ad-id'),ids[0]);assert.equal(await img.getAttribute('data-pa-playing'),'false','resize preserves manual pause');await p.setViewportSize({width,height:900});}
     await first.locator('[data-pa-pause]').click();await p.waitForFunction(()=>document.querySelector('[data-contextual-ad-slot] img').dataset.paPlaying==='true');
     if(post.goal==='fiere'){
      await first.locator('[data-pa-motion-host]').evaluate(host=>{const svg=host.shadowRoot.querySelector('svg');for(const a of svg.getAnimations({subtree:true})){a.pause();a.currentTime=3000;}});
      await first.screenshot({path:path.join(out,`${name}-${width}-fairs.png`)});
      if(width===1440){await p.addInitScript(()=>{Math.random=()=>.999;});await p.reload();await p.waitForFunction(()=>document.querySelector('[data-contextual-ad-slot]')?.dataset.adFormat==='728x90');assert.notEqual(await p.locator('[data-contextual-ad-slot]').first().getAttribute('data-ad-id'),ids[0],'fresh browser selection despite server HTML');}
     }
    }
    assert.deepEqual(errors,[]);assert.equal(await p.locator('#blogPostContent table').count(),post.goal||post.slug.includes('eredita')?1:0);results.push({name,width,slug:post.slug,slots:await cards.count(),errors,writes_intercepted:writes.length});await p.close();
   }
   const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**',r=>r.fulfill({json:[]}));await p.goto(base+'/qa?post=fiere-lombardia');await p.locator('[data-contextual-ad-slot]').first().scrollIntoViewIfNeeded();await p.waitForTimeout(100);assert.equal(await p.locator('[data-pa-motion-host]').count(),0);await p.close();
  }finally{await b.close();}
 }
 return results;
}
(async()=>{unitTests();const coverage=await audit();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 if(process.argv.includes('--serve')){console.log(base+'/qa?post=fiere-lombardia');return;}
 try{const results=await browsers(base);fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({coverage,results},null,2));console.log(JSON.stringify({unit:true,coverage,browser_cases:results.length,formats:true,house_only:true,random:true,content_preserved:true}));}finally{server.close();}
})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
