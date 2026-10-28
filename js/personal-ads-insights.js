/* Private ADS overview. SVG primitives adapted from tasteskill charts.js;
   UTC days, incomplete history and keyboard inspection belong to this report. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',DAY=86400000;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=n=>Number(n||0).toLocaleString('it-IT');
 const pct=(n,d)=>d?new Intl.NumberFormat('it-IT',{style:'percent',maximumFractionDigits:1}).format(n/d):'—';
 const date=value=>new Date(value).toLocaleDateString('it-IT',{day:'numeric',month:'short',timeZone:'UTC'});
 const total=(rows,key)=>rows.reduce((n,r)=>n+Number(r[key]||0),0);
 const topicNames={vendita:'Vendita posteggi',acquisto:'Acquisto posteggi',mercati:'Mercati',fiere:'Fiere'};
 let owner=null,revision=0,rules=null,rulesPromise=null,rulesVersion=0,active=null,chart=null,chartFrame=0,articleState=null,showAllArticles=false;
 function svg(tag,attrs={},parent){const node=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);if(parent)parent.append(node);return node;}
 function label(parent,value,attrs){const node=svg('text',attrs,parent);node.textContent=value;return node;}
 function renderChart(){
  if(!chart)return;
  const host=$('paViewsChart'),{stats,days,blog}=chart,rows=stats.rows,until=Date.parse(stats.updated_at);
  host.replaceChildren();if(!Number.isFinite(until)){$('paChartNote').textContent='La data del grafico non è disponibile. I totali restano consultabili.';return;}
  const since=until-days*DAY,end=Math.floor(until/DAY)*DAY;
  function series(list,field,first){
   const bins=new Map();let undated=0;
   for(const row of list){const at=/^\d{4}-\d{2}-\d{2}$/.test(row.event_day||'')?Date.parse(row.event_day+'T00:00:00Z'):NaN;if(!Number.isFinite(at)||at<Math.floor(since/DAY)*DAY||at>end){undated+=Number(row[field]||0);continue;}bins.set(at,(bins.get(at)||0)+Number(row[field]||0));}
   const known=Date.parse(first),earliest=Number.isFinite(known)?known:bins.size?Math.min(...bins.keys()):Infinity;
   return {bins,undated,first:earliest};
  }
  const ads=series(rows,'impressions',stats.started_at),visits=series(blog?.rows||[],'visits',blog?.started_at);
  const earliest=Math.min(ads.first,visits.first),start=Math.floor(Math.max(since,Number.isFinite(earliest)?earliest:since)/DAY)*DAY;
  const points=[];for(let at=start;at<=end;at+=DAY)points.push({at,ads:at+DAY<=ads.first?null:(ads.bins.get(at)||0),visits:!blog||at+DAY<=visits.first?null:(visits.bins.get(at)||0)});
  const maximum=Math.max(0,...points.flatMap(p=>[p.ads,p.visits].filter(v=>v!==null)));
  const raw=Math.max(1,maximum/3),power=10**Math.floor(Math.log10(raw)),step=([1,2,5,10].map(n=>n*power).find(n=>n>=raw)||10*power);
  const top=maximum?step*(Math.floor(maximum/step)+1):1,ticks=[];for(let n=0;n<=top;n+=step)ticks.push(n);if(!maximum&&!ticks.includes(1))ticks.push(1);
  const width=Math.max(200,host.clientWidth),height=innerWidth<=700?160:170,left=Math.max(28,String(num(top)).length*7+12),right=8,bottom=28,padTop=12;
  const x=i=>left+i*(width-left-right)/Math.max(1,points.length-1),y=v=>padTop+(height-padTop-bottom)*(1-v/top);
  const canvas=svg('svg',{viewBox:'0 0 '+width+' '+height,width:'100%',height,role:'img','aria-label':'Visite giornaliere agli articoli e impressioni ADS dal '+date(start)+' al '+date(end)+'. '+(blog?num(blog.total_visits)+' visite registrate; ':'Visite non disponibili; ')+num(total(rows,'impressions'))+' impressioni ADS nel periodo. Usa le frecce per leggere i giorni.',tabindex:'0'},host);
  for(const tick of ticks){svg('line',{x1:left,x2:width-right,y1:y(tick),y2:y(tick),stroke:'var(--pa-border)','stroke-width':'1'},canvas);label(canvas,num(tick),{x:left-8,y:y(tick)+4,'text-anchor':'end',fill:'var(--pa-muted)','font-size':12});}
  const stride=Math.max(1,Math.ceil((points.length-1)/Math.max(2,Math.min(6,Math.floor((width-left)/72)))));
  for(let i=0;i<points.length;i+=stride)label(canvas,date(points[i].at),{x:x(i),y:height-5,'text-anchor':i===0?'start':i===points.length-1?'end':'middle',fill:'var(--pa-muted)','font-size':12});
  const definitions=[{key:'visits',stroke:'var(--pa-muted)',dash:'5 4'},{key:'ads',stroke:'var(--pa-accent)'}];
  for(const def of definitions){
   let path='',previous=false;points.forEach((point,i)=>{if(point[def.key]===null){previous=false;return;}path+=(previous?'L':'M')+x(i).toFixed(1)+' '+y(point[def.key]).toFixed(1);previous=true;});
   if(!path)continue;
   svg('path',{d:path,fill:'none',stroke:def.stroke,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round','data-series':def.key,...(def.dash?{'stroke-dasharray':def.dash}:{})},canvas);
   if(points.filter(p=>p[def.key]!==null).length===1){const i=points.findIndex(p=>p[def.key]!==null);svg('circle',{cx:x(i),cy:y(points[i][def.key]),r:3,fill:def.stroke},canvas);}
  }
  const tip=document.createElement('output');tip.className='pa-chart-tip';tip.hidden=true;host.append(tip);
  const guide=svg('line',{y1:padTop,y2:height-bottom,stroke:'var(--pa-muted)',opacity:0,'stroke-width':1},canvas);
  const dots=definitions.map(def=>svg('circle',{r:4,fill:'var(--pa-surface)',stroke:def.stroke,'stroke-width':2,opacity:0},canvas));let selected=points.length-1;
  function show(index){selected=Math.max(0,Math.min(points.length-1,index));const point=points[selected];tip.textContent=date(point.at)+' · '+(point.visits===null?'Visite: dato non disponibile':num(point.visits)+' visite')+' · '+(point.ads===null?'Impressioni: storico non disponibile':num(point.ads)+' impressioni ADS');tip.hidden=false;tip.style.left=Math.max(0,Math.min(x(selected)-tip.offsetWidth/2,width-tip.offsetWidth))+'px';guide.setAttribute('x1',x(selected));guide.setAttribute('x2',x(selected));guide.setAttribute('opacity',.35);dots.forEach((dot,i)=>{const value=point[definitions[i].key];dot.setAttribute('cx',x(selected));dot.setAttribute('cy',y(value||0));dot.setAttribute('opacity',value===null?0:1);});}
  function hide(){tip.hidden=true;guide.setAttribute('opacity',0);dots.forEach(dot=>dot.setAttribute('opacity',0));}
  canvas.addEventListener('pointermove',event=>{const box=canvas.getBoundingClientRect();show(Math.round(((event.clientX-box.left)*width/box.width-left)/(width-left-right)*(points.length-1)));});
  canvas.addEventListener('pointerleave',hide);canvas.addEventListener('focus',()=>show(selected));canvas.addEventListener('blur',hide);
  canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();show(event.key==='Home'?0:event.key==='End'?points.length-1:selected+(event.key==='ArrowLeft'?-1:1));});
  $('paChartNote').textContent='Giorni UTC · estremi del periodo parziali.'+(points.some(p=>p.ads===null||blog&&p.visits===null)?' Tratti assenti: storico non disponibile.':'')+(ads.undated?' '+num(ads.undated)+' impressioni ADS senza data, incluse nel totale.':'');
 }
 function overview(stats,days,blog){
  chart={stats,days,blog};const rows=stats.rows,views=total(rows,'impressions'),clicks=total(rows,'clicks'),actions=total(rows,'converted_clicks');
  $('paOverviewViews').textContent=num(views);$('paOverviewVisits').textContent=blog?num(blog.total_visits):'—';$('paOverviewRange').textContent='Tutti gli articoli e tutti i banner · ultimi '+days+' giorni';
  $('paBlogStatus').textContent=blog?'Le visite misurano le aperture degli articoli, non la lettura completa.':'Visite agli articoli non disponibili. Le impressioni ADS restano consultabili; ricarica la pagina per riprovare.';
  $('paOverviewMetrics').innerHTML=[['Clic ADS',num(clicks),'CTR misurato: '+pct(total(rows,'measured_clicks'),views)],['Clic con risultato',num(actions),'Annuncio inviato, recapito consultato o fiera salvata']].map(([name,value,note])=>'<div><dt>'+name+'</dt><dd>'+value+'</dd><small>'+note+'</small></div>').join('');
  const ranked=new Map();for(const row of rows)ranked.set(row.ad_id,(ranked.get(row.ad_id)||0)+Number(row.clicks||0));const best=[...ranked].sort((a,b)=>b[1]-a[1])[0];
  $('paOverviewFinding').textContent=best?.[1]?'Più clic: '+best[0]+' · '+num(best[1])+'.':'';$('paOverviewFinding').hidden=!clicks;
  renderChart();
 }
 function articles(data,scope='all'){
  const blog=data.blog_stats,posts=new Map(),previous=articleState;
  function post(slug,title){if(!posts.has(slug))posts.set(slug,{slug,title:title||slug||'Senza articolo registrato',visits:blog&&slug?0:null,impressions:0,clicks:0});return posts.get(slug);}
  for(const row of blog?.rows||[])post(row.article_slug,row.article_title).visits+=Number(row.visits||0);
  for(const row of data.stats.rows){const item=post(row.article_slug||'',row.article_title);item.impressions+=Number(row.impressions||0);item.clicks+=Number(row.clicks||0);}
  const rows=[...posts.values()].filter(r=>scope==='all'||r.slug===(scope==='unknown'?'':scope)).sort((a,b)=>(b.visits??-1)-(a.visits??-1)||b.impressions-a.impressions||a.title.localeCompare(b.title,'it'));
  if(previous?.scope!==scope||previous?.data!==data)showAllArticles=false;
  articleState={data,scope,rows};renderArticles();
 }
 function renderArticles(){
  if(!articleState)return;const {data,rows}=articleState,shown=showAllArticles?rows:rows.slice(0,6);
  $('paBlogRows').innerHTML=shown.map(row=>'<tr><td>'+(row.slug?'<a href="/blog?post='+encodeURIComponent(row.slug)+'" target="_blank" rel="noopener">'+esc(row.title)+'</a>':esc(row.title))+'</td><td data-label="Visite">'+ (row.visits===null?'—':num(row.visits))+'</td><td data-label="Impressioni">'+num(row.impressions)+'</td><td data-label="Clic ADS">'+num(row.clicks)+'</td></tr>').join('')||'<tr><td colspan="4">Nessun evento registrato per questi articoli nel periodo.</td></tr>';
  $('paBlogCoverage').textContent='Mostrati '+num(shown.length)+' di '+num(rows.length)+' articoli o provenienze.'+(!data.blog_stats?' Visite non disponibili: «—» non significa zero.':' Sono inclusi anche gli articoli con visite e nessuna impressione ADS.');
  $('paBlogShowAll').hidden=rows.length<=6;$('paBlogShowAll').textContent=showAllArticles?'Mostra i primi 6':'Mostra tutti ('+num(rows.length)+')';$('paBlogExport').disabled=!rows.length;
 }
 $('paBlogShowAll').addEventListener('click',()=>{showAllArticles=!showAllArticles;renderArticles();});
 $('paBlogExport').addEventListener('click',()=>{
  if(!articleState||!owner)return;
  const quote=value=>'"'+String(value??'').replace(/^([\s]*[=+\-@])/,'\'$1').replace(/"/g,'""')+'"';
  const {data,rows}=articleState,lines=[['articolo','titolo','visite_articolo','impressioni_ads','clic_ads','dal_utc','al_utc'],...rows.map(r=>[r.slug,r.title,r.visits,r.impressions,r.clicks,data.blog_stats?.since||'',data.stats.updated_at])];
  const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(row=>row.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='articoli-e-ads-'+chart.days+'-giorni.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 function chips(values){return values.length?'<div class="pa-ad-tags">'+values.map(value=>'<span>'+esc(value)+'</span>').join('')+'</div>':'<p class="pa-muted">Nessuna parola impostata.</p>';}
 function targeting(){
  if(!active)return;const {ad}=active,host=$('paAdTargeting');
  if(!rules){host.innerHTML='<p class="pa-muted">Caricamento delle parole di abbinamento…</p>';return;}
  const rule=rules.ads?.[ad.id]?.rule||ad.targeting,excludedPosts=Object.entries(rules.posts||{}).filter(([,record])=>record.rule?.excludedAds?.includes(ad.id));
  host.innerHTML='<div><h5>Argomenti</h5>'+chips((ad.targeting?.keywords||[]).map(k=>topicNames[k]||k))+'</div><div><h5>Parole prioritarie</h5>'+chips(rule?.priorityKeywords||[])+'</div><div><h5>Parole da escludere</h5>'+chips(rule?.excludedKeywords||[])+'</div><p class="pa-muted">Gli argomenti rendono la ADS pertinente; le parole prioritarie aiutano a scegliere tra i banner in rotazione. Le parole da escludere ne impediscono l’abbinamento.'+(excludedPosts.length?' Esclusa manualmente da '+num(excludedPosts.length)+' articoli.':'')+'</p>';
 }
 async function loadRules(){
  if(rules||rulesPromise||!owner)return;
  const rev=revision,expected=owner,version=rulesVersion;
  rulesPromise=(async()=>{
   try{const checked=await _supabase.auth.getUser(),session=await _supabase.auth.getSession();if(rev!==revision||checked.data?.user?.id!==expected||session.data?.session?.user?.id!==expected)return;
    const response=await fetch('/api/personal-ads?action=context-options',{headers:{Authorization:'Bearer '+session.data.session.access_token},cache:'no-store'}),result=await response.json();if(rev!==revision||version!==rulesVersion)return;if(!response.ok||!result.settings)throw Error();rules=result.settings;targeting();
   }catch(_){if(rev===revision)$('paAdTargeting').innerHTML='<p class="pa-muted">Parole di abbinamento non disponibili. Riapri la ADS per riprovare.</p>';}
   finally{if(rev===revision)rulesPromise=null;}
  })();
  await rulesPromise;
 }
 function adDetails(data,ad,format,days){
  active={ad};const rows=data.stats.rows.filter(row=>row.ad_id===ad.id),views=total(rows,'impressions'),clicks=total(rows,'clicks'),formatRows=rows.filter(row=>row.format===format.id);
  $('paAdDescription').textContent=ad.description;$('paAdPeriod').textContent='Ultimi '+days+' giorni · tutte le misure e tutti gli articoli';
  $('paAdMetrics').innerHTML=[['Impressioni ADS',num(views)],['Clic',num(clicks)],['Tasso di clic',pct(total(rows,'measured_clicks'),views)],['Clic con risultato',num(total(rows,'converted_clicks'))]].map(([name,value])=>'<div><dt>'+name+'</dt><dd>'+value+'</dd></div>').join('');
  $('paAdFormatMetrics').textContent='Questa misura: '+num(total(formatRows,'impressions'))+' impressioni ADS · '+num(total(formatRows,'clicks'))+' clic. Destinazione: '+ad.label+'.';
  const visits=new Map();for(const row of data.blog_stats?.rows||[])visits.set(row.article_slug,(visits.get(row.article_slug)||0)+Number(row.visits||0));
  const posts=new Map();for(const row of rows){if(!row.article_slug)continue;const current=posts.get(row.article_slug)||{slug:row.article_slug,title:row.article_title||row.article_slug,views:0,clicks:0};current.views+=Number(row.impressions||0);current.clicks+=Number(row.clicks||0);posts.set(row.article_slug,current);}
  const ordered=[...posts.values()].filter(post=>post.views>0).sort((a,b)=>b.views-a.views||b.clicks-a.clicks);
  $('paAdArticles').innerHTML=ordered.length?'<ul>'+ordered.slice(0,4).map(post=>'<li><a href="/blog?post='+encodeURIComponent(post.slug)+'" target="_blank" rel="noopener">'+esc(post.title)+'</a><span>'+(data.blog_stats?num(visits.get(post.slug)||0)+' visite all’articolo':'Visite non disponibili')+'<br>'+num(post.views)+' impressioni di questa ADS · '+num(post.clicks)+' clic</span></li>').join('')+'</ul><p class="pa-muted">Le visite riguardano l’intero articolo: non sono attribuite a questa ADS.</p>'+(ordered.length>4?'<p class="pa-muted">Mostrati i 4 articoli con più impressioni su '+num(ordered.length)+'. Tutti gli articoli sono nelle statistiche dettagliate.</p>':''):'<p class="pa-muted">Nessuna impressione collegata a un articolo nel periodo. Gli abbinamenti qui sopra descrivono le regole attuali.</p>';
  const actionKey={vendi:'listings',compra:'contacts',fiere:'fairs'}[ad.goal];
  $('paAdArticles').insertAdjacentHTML('beforeend','<p class="pa-muted">'+esc(ad.action)+': '+num(total(rows,actionKey))+'. Le azioni misurate non indicano una compravendita.</p>');
  targeting();loadRules();
 }
 function clear(){++revision;owner=null;rules=null;rulesPromise=null;active=null;chart=null;articleState=null;showAllArticles=false;$('paOverviewVisits').textContent='—';$('paBlogExport').disabled=true;$('paBlogShowAll').hidden=true;cancelAnimationFrame(chartFrame);['paViewsChart','paOverviewMetrics','paOverviewFinding','paOverviewRange','paAdTargeting','paAdArticles','paAdDescription','paAdPeriod','paAdFormatMetrics','paBlogRows','paBlogCoverage','paBlogStatus'].forEach(id=>$(id).replaceChildren());$('paOverviewViews').textContent='—';$('paChartNote').textContent='';}
 window.addEventListener('personal-ads:clear',clear);
 window.addEventListener('personal-ads:ready',event=>{if(owner!==event.detail.owner){rules=null;rulesPromise=null;++revision;}owner=event.detail.owner;});
 window.addEventListener('personal-ads:rules',event=>{if(owner&&event.detail.owner===owner){++rulesVersion;rules=event.detail.settings;targeting();}});
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{cancelAnimationFrame(chartFrame);chartFrame=requestAnimationFrame(renderChart);}).observe($('paViewsChart'));
 window.PersonalAdInsights={overview,adDetails,articles};
})();
