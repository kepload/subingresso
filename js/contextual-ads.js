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
 function intentHits(text,topic){
  const normalized=normalize(text),result=hits(text,rules[topic]);
  if(topic!=='vendita'&&topic!=='acquisto')return result;
  const verb=topic==='vendita'?'vendere|vendo|vendi|vendita|cedere|cedo|cessione':'comprare|compro|compra|acquistare|acquisto';
  const object='posteggio|posteggi|licenza|licenze|banco|attivita';
  const forward=new RegExp('\\b(?:'+verb+')(?: [a-z0-9]+){0,4} (?:'+object+')\\b','g');
  const reverse=new RegExp('\\b(?:'+object+')(?: [a-z0-9]+){0,3} (?:'+verb+')\\b','g');
  for(const [pattern,isReverse]of [[forward,false],[reverse,true]])for(const match of normalized.matchAll(pattern)){
   // Selling goods at a stall is not selling the stall or its licence.
   const checked=match[0]+(isReverse?' '+normalized.slice(match.index+match[0].length).trim().split(' ').slice(0,3).join(' '):'');
   if(!/\b(prodotti|merce|merci|casalinghi|abbigliamento|alimentari|frutta|verdura|pesce)\b/.test(checked))result.push(match[0]);
  }
  return [...new Set(result)];
 }
 function analyze(post,body){
  const title=(post.title||'')+' '+(post.slug||''),excerpt=(post.excerpt||'')+' '+(post.category||'');
  const scores={},keywords=new Set(),titleTopics=[];
  for(const [topic,terms]of Object.entries(rules)){
   const head=intentHits(title,topic),intro=intentHits(excerpt,topic),text=intentHits(body,topic);
   [...head,...intro,...text].forEach(word=>keywords.add(word));
   scores[topic]=head.length*8+intro.length*3+Math.min(text.length,5);
   if(topic!=='mercati'&&head.length)titleTopics.push(topic);
  }
  const specific=Object.keys(rules).filter(k=>k!=='mercati'),max=Math.max(...specific.map(k=>scores[k]));
  const topics=titleTopics.length?titleTopics:hits(title,rules.mercati).length?['mercati']:max>0?specific.filter(k=>scores[k]>=max*.8):scores.mercati?['mercati']:[];
  const sensitive=/\b(eredit[a-z]*|succession[a-z]*|muore|decesso)\b/.test(normalize(title));
  return {topics:sensitive?[]:topics,keywords:[...keywords],scores,sensitive};
 }
 function candidates(context,slot,format,pool=catalog.ads){
  if(!slots[slot]||!slots[slot].formats.includes(format))return [];
  // Paid/user campaigns remain ineligible until a separate serving policy exists.
  return pool.filter(ad=>ad.kind==='house'&&ad.active===true&&ad.formats?.includes(format)&&ad.keywords?.some(k=>context.topics.includes(k)));
 }
 function select(context,slot,width=300,used=[],random=Math.random,pool=catalog.ads){
  if(!slots[slot])return null;
  const preferred=width>=640?['728x90','336x280','300x250']:width>=336?['336x280','300x250']:['300x250'];
  for(const id of preferred){
   const eligible=candidates(context,slot,id,pool),fresh=eligible.filter(ad=>!used.includes(ad.id)),choices=fresh.length?fresh:eligible;
   if(choices.length){const roll=Math.max(0,Math.min(.999999999,Number(random())||0));return {ad:choices[Math.floor(roll*choices.length)],format:catalog.formats.find(f=>f.id===id)};}
  }
  return null;
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
 function mount(article,post,regions){
  if(!article||mounted.has(article))return mounted.get(article)||null;
  const context=analyze(post,editorialText(article)),doc=article.ownerDocument,view=doc.defaultView;
  let hosts=[...article.querySelectorAll('[data-contextual-ad-slot],[data-fiere-promo]')];
  if(article.nextElementSibling?.matches('[data-contextual-ad-slot],[data-fiere-promo]'))hosts.push(article.nextElementSibling);
  if(!context.topics.length){hosts.forEach(h=>h.remove());return {context,slots:[]};}
  hosts.slice(2).forEach(host=>host.remove());
  hosts=hosts.slice(0,2).map((host,i)=>{
   const position=host.dataset.contextualAdSlot||(hosts.length===1&&host.dataset.fierePromo==='inline'?'inline':hosts.length>1&&i===0?'inline':'closing');
   if(!host.hasAttribute('data-contextual-ad-slot')){const fresh=doc.createElement('aside');host.replaceWith(fresh);host=fresh;}
   host.dataset.contextualAdSlot=position;return host;
  });
  if(!hosts.length){
   const ordinary=[...article.children].filter(el=>!el.matches('.not-prose')&&!el.querySelector('[data-box-listings],#bandoAlertForm'));
   const length=ordinary.reduce((n,el)=>n+el.textContent.length,0);let chars=0,paragraphs=0,anchor=null;
   for(const el of ordinary){if(/^H[23]$/.test(el.tagName)&&paragraphs>=6&&chars>=1000&&chars<=length*.7){anchor=el;break;}chars+=el.textContent.length;if(el.tagName==='P')paragraphs++;}
   if(anchor){const inline=doc.createElement('aside');inline.dataset.contextualAdSlot='inline';anchor.before(inline);hosts.push(inline);}
   const closing=doc.createElement('aside');closing.dataset.contextualAdSlot='closing';article.after(closing);hosts.push(closing);
  }
  const state={context,slots:hosts,selections:[],observer:null},region=regionFor(post,regions);
  mounted.set(article,state);
  const width=()=>article.getBoundingClientRect().width||300;
  for(const host of hosts){const selection=select(context,host.dataset.contextualAdSlot,width(),state.selections.map(s=>s.ad.id));if(selection){state.selections.push(selection);paint(host,selection,post,region,context);}else host.remove();}
  // A resize changes only the format of the same creative, preserving manual pause.
  if(typeof view?.ResizeObserver==='function'){
   state.observer=new view.ResizeObserver(()=>{
    if(!article.isConnected){state.observer.disconnect();return;}
    hosts.forEach((host,i)=>{const current=state.selections[i];if(!current)return;const resized=select(context,host.dataset.contextualAdSlot,width(),[],()=>0,[current.ad]);if(resized&&resized.format.id!==current.format.id){state.selections[i]=resized;paint(host,resized,post,region,context);}});
   });state.observer.observe(article);
  }
  return state;
 }
 return {analyze,candidates,select,mount,editorialText,regionFor,slots};
});
