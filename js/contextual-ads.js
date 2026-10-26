// Shared contextual selection for server HTML and browser visits. No user profiling.
(function(root,factory){
 if(typeof module!=='undefined'&&module.exports)module.exports=factory(require('./house-ads-catalog.js'));
 else root.SubingressoContextualAds=factory(root.SubingressoHouseAds);
})(typeof window!=='undefined'?window:globalThis,function(catalog){
 'use strict';
 const rules={
  fiere:['fiera','fiere','mercatino','mercatini','sagra','sagre','calendario eventi','festa patronale','manifestazione fieristica'],
  vendita:['quanto vale','valore posteggio','valutare posteggio','pensione','chiudere attivita'],
  acquisto:['cercare posteggio','trovare posteggio','subentrare','bando','bandi'],
  mercati:['mercato','mercati','posteggio','posteggi','ambulante','ambulanti','licenza','licenze','banco','bancarelle','bolkestein','bando','bandi','concessione','concessioni','subingresso','spunta','commercio su aree pubbliche']
 };
 const slots={inline:{formats:['728x90','336x280','300x250']},closing:{formats:['728x90','336x280','300x250']}};
 const mounted=new WeakMap();
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 function hits(text,terms){const padded=' '+normalize(text)+' ';return terms.filter(term=>padded.includes(' '+term+' '));}
 function languageSignals(text){
  const value=normalize(text),signals=[],negated=[];
  const object='posteggi[oi]|licenz[ae]|banco|attivita';
  const goods=/\b(prodotti|merce|merci|casalinghi|abbigliamento|alimentari|frutta|verdura|pesce)\b/;
  const verbs={vendita:'vend(?:ere|o|i|ita|uto|uta|erlo|erla)|ced(?:ere|o|uto|uta)|cessione',acquisto:'compr(?:are|o|i|a|ato|ata|arlo|arla|arli|arle)|acquist(?:are|o|i|a|ato|ata|arlo|arla)|quanto costa|quanto costano'};
  for(const topic of ['fiere','vendita','acquisto','mercati'])for(const phrase of hits(value,rules[topic]))signals.push({topic,phrase,strength:topic==='fiere'?3:1});
  for(const [topic,verb]of Object.entries(verbs)){
   const negative=new RegExp('\\b(?:(?:non (?:voglio|vuoi|vuole|intendo|devo|posso)|senza|evitare di) (?:'+verb+'))\\b','g');
   const negativeMatches=[...value.matchAll(negative)];if(negativeMatches.length)negated.push(topic);
   const patterns=[new RegExp('\\b(?:'+verb+')(?: [a-z0-9]+){0,4} (?:'+object+')\\b','g'),new RegExp('\\b(?:'+object+')(?: [a-z0-9]+){0,3} (?:'+verb+')\\b','g')];
   for(const [index,pattern]of patterns.entries())for(const match of value.matchAll(pattern)){
    const tail=index===1?' '+value.slice(match.index+match[0].length).trim().split(' ').slice(0,3).join(' '):'';
    if(goods.test(match[0]+tail)||negativeMatches.some(n=>n.index<=match.index+match[0].length&&n.index+n[0].length>=match.index))continue;
    signals.push({topic,phrase:match[0],strength:4});
   }
   const pronoun=topic==='acquisto'?/\b(?:prima di |per )?(?:comprarl[oaie]|acquistarl[oaie])\b/g:/\b(?:prima di |per )?(?:venderl[oaie]|cederl[oaie])\b/g;
   if(new RegExp('\\b(?:'+object+')\\b').test(value))for(const match of value.matchAll(pronoun))if(!negativeMatches.length)signals.push({topic,phrase:match[0],strength:5});
  }
  const unique=new Map();for(const signal of signals)if(!negated.includes(signal.topic)){const key=signal.topic+'|'+signal.phrase,previous=unique.get(key);if(!previous||previous.strength<signal.strength)unique.set(key,signal);}
  return {signals:[...unique.values()],negated};
 }
 function analyze(post,body,override={}){
  const fields={title:normalize(post.title),slug:normalize(post.slug),intro:normalize((post.excerpt||'')+' '+(post.category||'')),body:normalize(body)};
  const evidence=[],scores={fiere:0,vendita:0,acquisto:0,mercati:0},keywords=new Set();let topics=[],basis='none',negatedTopics=[];
  for(const [source,text]of Object.entries(fields)){
   const found=languageSignals(text);if(source==='title')negatedTopics=found.negated;
   const counted=source==='body'?Object.keys(rules).flatMap(topic=>found.signals.filter(s=>s.topic===topic).sort((a,b)=>b.strength-a.strength).slice(0,5)):found.signals;
   for(const signal of counted){keywords.add(signal.phrase);evidence.push({...signal,source});scores[signal.topic]+=signal.strength*(source==='title'?8:source==='slug'?5:source==='intro'?3:1);}
   if(topics.length||source==='body')continue;
   const specific=found.signals.filter(s=>s.topic!=='mercati'&&!negatedTopics.includes(s.topic)),best=Math.max(0,...specific.map(s=>s.strength));
   if(best){topics=[...new Set(specific.filter(s=>s.strength>=best*.7).map(s=>s.topic))];basis=source;}
   else if(source==='title'&&found.signals.some(s=>s.topic==='mercati')){topics=['mercati'];basis='title';}
  }
  if(!topics.length){const max=Math.max(0,...Object.keys(scores).filter(k=>k!=='mercati'&&!negatedTopics.includes(k)).map(k=>scores[k]));topics=max?Object.keys(scores).filter(k=>k!=='mercati'&&!negatedTopics.includes(k)&&scores[k]>=max*.8):scores.mercati?['mercati']:[];if(topics.length)basis='body';}
  const sensitive=/\b(eredit[a-z]*|succession[a-z]*|muore|decesso)\b/.test(fields.title+' '+fields.slug);
  if(Array.isArray(override.topics)){topics=override.topics.filter(t=>Object.hasOwn(rules,t));basis='manual';negatedTopics=negatedTopics.filter(t=>!topics.includes(t));}
  return {topics:sensitive?[]:topics,automaticTopics:sensitive?[]:(basis==='manual'?analyze(post,body).topics:topics),keywords:[...keywords],scores,sensitive,basis,evidence,fields,negatedTopics,excludedAds:override.excludedAds||[]};
 }
 function effectiveAds(settings={}){
  return catalog.ads.map(ad=>{const rule=settings.ads?.[ad.id]?.rule;return rule?{...ad,priorityKeywords:rule.priorityKeywords||[],excludedKeywords:rule.excludedKeywords||[]}:ad;});
 }
 function explain(context,slot,format,pool=catalog.ads){
  return pool.map(ad=>{
   const fields=context.fields||{},head=(fields.title||'')+' '+(fields.slug||''),rest=(fields.intro||'')+' '+(fields.body||'');
   const priorityMatches=hits(head+' '+rest,ad.priorityKeywords||[]),excludedMatches=hits(head+' '+rest,ad.excludedKeywords||[]);
   let reason='Argomento corrispondente';
   if(!Object.hasOwn(slots,slot)||!slots[slot].formats.includes(format))reason='Formato non previsto per questo slot';
   else if(ad.kind!=='house')reason='Campagna esterna non attiva';
   else if(ad.active!==true)reason='ADS non attiva';
   else if(context.sensitive)reason='Articolo escluso dalla pubblicità';
   else if(context.excludedAds?.includes(ad.id))reason='Esclusa manualmente da questo articolo';
   else if(context.negatedTopics?.includes(ad.goal==='vendi'?'vendita':ad.goal==='compra'?'acquisto':ad.goal))reason='Intenzione negata nel titolo';
   else if(!ad.formats?.includes(format))reason='Variante grafica non disponibile';
   else if(!ad.keywords?.some(k=>context.topics.includes(k)))reason='Argomento diverso';
   else if(excludedMatches.length)reason='Parola esclusa: '+excludedMatches.join(', ');
   const eligible=reason==='Argomento corrispondente',weight=1+Math.min(8,hits(head,ad.priorityKeywords||[]).length*3+hits(rest,ad.priorityKeywords||[]).length);
   return {ad,eligible,reason:eligible&&priorityMatches.length?'Più pertinente: '+priorityMatches.join(', '):reason,priorityMatches,excludedMatches,weight:eligible?weight:0};
  });
 }
 function candidates(context,slot,format,pool=catalog.ads){
  return explain(context,slot,format,pool).filter(row=>row.eligible).map(row=>row.ad);
 }
 function select(context,slot,width=300,used=[],random=Math.random,pool=catalog.ads,rotation=null){
  if(!Object.hasOwn(slots,slot))return null;
  const preferred=width>=640?['728x90','336x280','300x250']:width>=336?['336x280','300x250']:['300x250'];
  for(const id of preferred){
   const eligible=candidates(context,slot,id,pool),fresh=eligible.filter(ad=>!used.includes(ad.id));let choices=fresh.length?fresh:eligible;
   if(rotation&&choices.length){
    // Keep the previous visit out when alternatives exist, then give every eligible ADS a turn.
    const different=choices.filter(ad=>!rotation.last.includes(ad.id));if(different.length)choices=different;
    const least=Math.min(...choices.map(ad=>rotation.counts[ad.id]||0));choices=choices.filter(ad=>(rotation.counts[ad.id]||0)===least);
   }
   if(choices.length){const ranked=explain(context,slot,id,choices),total=ranked.reduce((sum,row)=>sum+row.weight,0);let roll=Math.max(0,Math.min(.999999999,Number(random())||0))*total;let winner=ranked.at(-1);for(const row of ranked){roll-=row.weight;if(roll<0){winner=row;break;}}return {ad:winner.ad,format:catalog.formats.find(f=>f.id===id)};}
  }
  return null;
 }
 const rotationKey='_pa_rotation_v1',rotationMemory=new Map();
 function readRotation(view,slug){
  let saved;try{saved=JSON.parse(view.localStorage.getItem(rotationKey))?.[slug];}catch(_){}
  saved=saved||rotationMemory.get(slug);const counts=Object.create(null);
  for(const ad of catalog.ads){const n=saved?.counts?.[ad.id];if(Number.isSafeInteger(n)&&n>=0&&n<=1000000)counts[ad.id]=n;}
  return {counts,last:Array.isArray(saved?.last)?saved.last.filter(id=>catalog.ads.some(ad=>ad.id===id)).slice(0,2):[],at:Date.now()};
 }
 function saveRotation(view,slug,rotation){
  rotationMemory.delete(slug);rotationMemory.set(slug,rotation);if(rotationMemory.size>60)rotationMemory.delete(rotationMemory.keys().next().value);
  try{
   const parsed=JSON.parse(view.localStorage.getItem(rotationKey)||'{}'),all=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
   all[slug]=rotation;const recent=Object.entries(all).filter(([key,value])=>/^[a-z0-9-]{1,200}$/.test(key)&&value&&typeof value==='object').sort((a,b)=>(Number(b[1].at)||0)-(Number(a[1].at)||0)).slice(0,60);
   view.localStorage.setItem(rotationKey,JSON.stringify(Object.fromEntries(recent)));
  }catch(_){}
 }
 function editorialText(article){
  const clone=article.cloneNode(true);
  clone.querySelectorAll('[data-fiere-promo],[data-contextual-ad-slot],[data-pa-player],a[data-personal-ad],.not-prose,script,style,nav,aside').forEach(el=>el.remove());
  return clone.textContent;
 }
 function regionFor(post,regions){
  const title=' '+normalize((post.title||'')+' '+(post.slug||''))+' ';
  const found=Object.values(regions||{}).filter(r=>title.includes(' '+normalize(r)+' '));
  return !/\bgarda\b/.test(title)&&found.length===1?found[0]:null;
 }
 function paint(host,selection,post,region,context){
  const {ad,format}=selection,doc=host.ownerDocument;
  host.className='contextual-ad not-prose';host.dataset.contextualAdSlot=host.dataset.contextualAdSlot||'closing';
  host.dataset.adKeywords=JSON.stringify(context.keywords);host.dataset.adTopics=context.topics.join(' ');
  host.setAttribute('aria-label','Pubblicità di Subingresso.it');
  if(!host.querySelector('img')){
   host.replaceChildren();const label=doc.createElement('p');label.className='contextual-ad-label';label.textContent='Pubblicità · Subingresso.it';
   const player=doc.createElement('span');player.dataset.paPlayer='';const link=doc.createElement('a'),image=doc.createElement('img');
   link.append(image);player.append(link);host.append(label,player);
  }
  const link=host.querySelector('a'),img=link.querySelector('img'),placement='blog_'+host.dataset.contextualAdSlot;
  const query=new URLSearchParams({action:'click',ad:ad.id,format:format.id,placement});
  if(region)query.set('region',region);
  link.href='/api/personal-ads?'+query;link.dataset.personalAd=ad.id;link.dataset.paFormat=format.id;link.dataset.paPlacement=placement;
  link.setAttribute('aria-label',ad.title+' '+ad.description+' '+ad.cta);
  if(ad.goal==='fiere'){link.dataset.fiereCta='';link.dataset.regione=region||'';}else{delete link.dataset.fiereCta;delete link.dataset.regione;}
  const asset='/images/personal-ads/'+ad.id+'-'+format.id;
  const src=asset+'.svg?v='+ad.assetVersion,motion=asset+'.animated.svg?v='+ad.assetVersion;
  if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  if(img.dataset.paMotion!==motion)img.dataset.paMotion=motion;
  img.alt=ad.title+' '+ad.description+' '+ad.cta+'. Subingresso.it';img.width=format.width;img.height=format.height;img.loading='lazy';img.decoding='async';
  host.dataset.adFormat=format.id;host.dataset.adId=ad.id;
 }
 function mount(article,post,regions,settings={}){
  if(!article||mounted.has(article))return mounted.get(article)||null;
  const context=analyze(post,editorialText(article),settings.posts?.[post.slug]?.rule),pool=effectiveAds(settings),doc=article.ownerDocument,view=doc.defaultView;
  let hosts=[...article.querySelectorAll('[data-contextual-ad-slot],[data-fiere-promo]')];
  if(article.nextElementSibling?.matches('[data-contextual-ad-slot],[data-fiere-promo]'))hosts.push(article.nextElementSibling);
  if(!context.topics.length){hosts.forEach(h=>h.remove());return {context,slots:[]};}
  hosts.slice(2).forEach(host=>host.remove());
  hosts=hosts.slice(0,2).map((host,i)=>{
   const position=host.dataset.contextualAdSlot||(hosts.length===1&&host.dataset.fierePromo==='inline'?'inline':hosts.length>1&&i===0?'inline':'closing');
   if(!host.hasAttribute('data-contextual-ad-slot')){const fresh=doc.createElement('aside');host.replaceWith(fresh);host=fresh;}
   host.dataset.contextualAdSlot=position;return host;
  });
  if(!hosts.some(host=>host.dataset.contextualAdSlot==='inline')){
   const ordinary=[...article.children].filter(el=>!el.matches('.not-prose')&&!el.querySelector('[data-box-listings],#bandoAlertForm'));
   const length=ordinary.reduce((n,el)=>n+el.textContent.length,0);let chars=0,paragraphs=0,anchor=null;
   for(const el of ordinary){if(/^H[23]$/.test(el.tagName)&&paragraphs>=6&&chars>=1000&&chars<=length*.7){anchor=el;break;}chars+=el.textContent.length;if(el.tagName==='P')paragraphs++;}
   anchor=anchor||ordinary[Math.floor(ordinary.length/2)];
   if(anchor){const inline=doc.createElement('aside');inline.dataset.contextualAdSlot='inline';anchor.before(inline);hosts.push(inline);}
  }
  if(!hosts.some(host=>host.dataset.contextualAdSlot==='closing')){const closing=doc.createElement('aside');closing.dataset.contextualAdSlot='closing';article.after(closing);hosts.push(closing);}
  hosts.sort((a,b)=>Number(a.dataset.contextualAdSlot==='closing')-Number(b.dataset.contextualAdSlot==='closing'));
  const state={context,slots:hosts,selections:[],observer:null},region=regionFor(post,regions);
  mounted.set(article,state);
  const width=()=>article.getBoundingClientRect().width||300;
  // Server HTML stays stateless. Only the visitor's browser remembers turns for this article.
  const browser=typeof window!=='undefined'&&view===window;
  const rotate=()=>{
   const rotation=browser?readRotation(view,post.slug):null;state.selections=[];
   for(const host of hosts){const selection=select(context,host.dataset.contextualAdSlot,width(),state.selections.filter(Boolean).map(s=>s.ad.id),Math.random,pool,rotation);if(selection){state.selections.push(selection);if(rotation)rotation.counts[selection.ad.id]=(rotation.counts[selection.ad.id]||0)+1;paint(host,selection,post,region,context);}else{state.selections.push(null);host.remove();}}
   if(rotation){rotation.last=state.selections.filter(Boolean).map(s=>s.ad.id);saveRotation(view,post.slug,rotation);}
  };
  rotate();
  if(browser){const restored=event=>{if(!article.isConnected){view.removeEventListener('pageshow',restored);return;}if(event.persisted)rotate();};view.addEventListener('pageshow',restored);}
  // A resize changes only the format of the same creative, preserving manual pause.
  if(typeof view?.ResizeObserver==='function'){
   state.observer=new view.ResizeObserver(()=>{
    if(!article.isConnected){state.observer.disconnect();return;}
    hosts.forEach((host,i)=>{const current=state.selections[i];if(!current)return;const resized=select(context,host.dataset.contextualAdSlot,width(),[],()=>0,[current.ad]);if(resized&&resized.format.id!==current.format.id){state.selections[i]=resized;paint(host,resized,post,region,context);}});
   });state.observer.observe(article);
  }
  return state;
 }
 let freshSettings;
 async function mountFresh(article,post,regions,fallback={}){
  if(!freshSettings)freshSettings=fetch('/api/blog?contextual_rules=1',{cache:'no-store',signal:AbortSignal.timeout(2000)}).then(r=>{if(!r.ok)throw Error('Rules unavailable');return r.json();}).then(data=>data&&data.ads&&data.posts?data:fallback).catch(()=>fallback);
  const settings=await freshSettings;if(!article?.isConnected)return null;return mount(article,post,regions,settings);
 }
 return {analyze,candidates,select,mount,mountFresh,editorialText,regionFor,slots,explain,effectiveAds,normalize};
});
