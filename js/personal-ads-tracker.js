/* Misura soltanto i banner personali. Riusa sessione e login del sito. */
(() => {
 'use strict';
 if(window.__personalAdsTracker||typeof _supabase==='undefined')return;
 window.__personalAdsTracker=true;
 const automated=navigator.webdriver===true,seen=new Set(),timers=new Map(),bound=new WeakSet(),observedAnchors=new WeakMap(),observedKeys=new WeakMap(),visibility=new WeakMap();
 let owner=null,revision=0,admin=false,authReady=false;
 const storage='_pa_last_click_v1',uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
 function read(){try{const value=JSON.parse(sessionStorage.getItem(storage));return value&&uuid.test(value.id)&&Date.now()-value.at<7*86400000?value:null;}catch(_){return null;}}
 function save(value){try{value?sessionStorage.setItem(storage,JSON.stringify(value)):sessionStorage.removeItem(storage);}catch(_){}}
 // Rimuovi il riferimento dal browser prima che altre navigazioni possano propagarlo.
 const url=new URL(location.href),click=url.searchParams.get('pa');
 if(click!==null){url.searchParams.delete('pa');history.replaceState(history.state,'',url.pathname+url.search+url.hash);if(uuid.test(click))save({id:click,at:Date.now(),owner:null});}
 function sessionId(){try{const sid=sessionStorage.getItem('_session_id');return /^[a-zA-Z0-9_-]{8,80}$/.test(sid||'')?sid:null;}catch(_){return null;}}
 function placement(anchor){const code=anchor.dataset.paPlacement;return /^[a-z0-9_-]{1,80}$/.test(code||'')?code:'blog';}
 function articleSlug(){const slug=new URLSearchParams(location.search).get('post');return location.pathname==='/blog'&&/^[a-z0-9-]{1,200}$/.test(slug||'')?slug:null;}
 function baseContext(anchor){try{const value=JSON.parse(anchor.dataset.paContext||new URL(anchor.href,location.origin).searchParams.get('ctx')||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch(_){return {};}}
 function key(anchor){const ctx=baseContext(anchor);return [anchor.dataset.personalAd,anchor.dataset.paFormat,placement(anchor),articleSlug()||ctx.article_slug||'',ctx.creative_version||0].join('|');}
 function referrerType(){if(!document.referrer)return 'direct';try{const host=new URL(document.referrer).hostname.replace(/^www\./,'');if(host===location.hostname.replace(/^www\./,''))return 'internal';if(/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(host))return 'search';if(/(^|\.)(facebook\.com|instagram\.com|t\.co|x\.com|telegram\.org|t\.me|linkedin\.com|pinterest\.com)$/.test(host))return 'social';return 'other';}catch(_){return 'unknown';}}
 function context(anchor){
  const value=baseContext(anchor);
  const slug=articleSlug();if(slug)value.article_slug=slug;
  value.source=slug?'blog':location.hostname==='subingresso.it'||location.hostname==='www.subingresso.it'?'site':value.source||'external';
  value.device_class=innerWidth<=640?'phone':innerWidth<=1024?'tablet':'desktop';value.referrer_type=referrerType();
  const time=visibility.get(anchor),now=performance.now();if(time)value.visible_ms=Math.min(3600000,Math.max(0,Math.round((time.total+(time.since!==null&&!document.hidden?now-time.since:0))/100)*100));
  value.page_ms=Math.min(86400000,Math.max(0,Math.round(now/1000)*1000));value.scroll_percent=Math.min(100,Math.max(0,Math.round((scrollY+innerHeight)/Math.max(innerHeight,document.documentElement.scrollHeight)*10)*10));
  const image=anchor.querySelector('img');value.motion=image?(image.dataset.paPlaying==='true'?'animated':'static'):'unknown';return value;
 }
 function visible(anchor,on){const time=visibility.get(anchor)||{total:0,since:null};if(time.since!==null){time.total+=performance.now()-time.since;time.since=null;}if(on&&!document.hidden)time.since=performance.now();visibility.set(anchor,time);}
 function measurementTarget(anchor){return anchor.closest('[data-fiere-promo]')||anchor.querySelector('img')||anchor;}
 function decorate(anchor){
  if(!/^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$/.test(anchor.dataset.personalAd||''))return;
  if(!bound.has(anchor)){
   const target=new URL(anchor.href,location.origin),wrapped=target.pathname==='/api/personal-ads'&&target.searchParams.get('action')==='click';
   if(!wrapped){const dest={vendi:'/vendi',compra:'/annunci',fiere:'/fiere'}[anchor.dataset.personalAd.split('-')[0]];if(target.origin!==location.origin||target.pathname!==dest)return;const tracked=new URL('/api/personal-ads',location.origin);tracked.search=new URLSearchParams({action:'click',ad:anchor.dataset.personalAd,format:anchor.dataset.paFormat||'editoriale',placement:placement(anchor)});if(target.searchParams.has('regione'))tracked.searchParams.set('region',target.searchParams.get('regione'));anchor.href=tracked.href;}
   bound.add(anchor);
   for(const eventName of ['pointerdown','focus','click','auxclick'])anchor.addEventListener(eventName,()=>{const href=new URL(anchor.href),sid=sessionId();href.searchParams.set('ctx',JSON.stringify(context(anchor)));if(admin||automated)href.searchParams.set('preview','1');else{href.searchParams.delete('preview');if(sid)href.searchParams.set('sid',sid);}anchor.href=href.toString();});
  }
  const current=key(anchor);if(observedKeys.get(anchor)!==current){clearTimeout(timers.get(anchor));timers.delete(anchor);visibility.delete(anchor);observedKeys.set(anchor,current);const measured=measurementTarget(anchor);observedAnchors.set(measured,anchor);observer?.unobserve(measured);observer?.observe(measured);}
 }
 async function impression(anchor){
  const id=key(anchor),sid=sessionId();if(automated||admin||!authReady||document.hidden||seen.has(id)||!sid)return;
  seen.add(id);const rev=revision;
  try{const result=await _supabase.rpc('personal_ad_event_v2',{p_ad:anchor.dataset.personalAd,p_format:anchor.dataset.paFormat||'editoriale',p_placement:placement(anchor),p_kind:'impression',p_session:sid,p_context:context(anchor)});if(result.error||rev!==revision)seen.delete(id);}catch(_){seen.delete(id);}
 }
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries){const anchor=observedAnchors.get(entry.target);if(!anchor)continue;clearTimeout(timers.get(anchor));timers.delete(anchor);const shown=entry.isIntersecting&&entry.intersectionRatio>=.5&&!document.hidden;visible(anchor,shown);if(shown)timers.set(anchor,setTimeout(()=>{timers.delete(anchor);impression(anchor);},1000));}},{threshold:[0,.5]}):null;
 function scan(){
  const slug=new URLSearchParams(location.search).get('post'),position=/^[a-z0-9-]{1,80}$/.test(slug||'')?slug:null;
  document.querySelectorAll('[data-fiere-promo] a.bfp-button').forEach(anchor=>{
   if(anchor.dataset.personalAd)return;const banner=anchor.closest('[data-fiere-promo]'),closing=banner.dataset.fierePromo==='closing',title=banner.querySelector('.bfp-title')?.textContent.trim();
   const href=new URL(anchor.href,location.origin);if(!['/fiere','/vendi'].includes(href.pathname))return;
   anchor.dataset.personalAd=href.pathname==='/vendi'?'vendi-07':title==='Fai girare il banco.'?'fiere-03':closing?'fiere-02':'fiere-01';
   anchor.dataset.paFormat='editoriale';anchor.dataset.paPlacement=(position?position.slice(0,65):'blog')+(closing?'_fine':'_centro');
  });
  document.querySelectorAll('a[data-personal-ad]').forEach(decorate);
 }
 async function identity(){
  const rev=revision;
  try{
   const session=await _supabase.auth.getSession();if(rev!==revision)return;
   if(session.error){authReady=false;return;}
   const checked=session.data?.session?await _supabase.auth.getUser():{data:{user:null}};if(rev!==revision)return;const user=checked.data?.user;
   if(checked.error){authReady=false;return;}
   const next=user?.id||null;if(owner&&owner!==next){save(null);seen.clear();}owner=next;admin=false;
   if(user){const profile=await _supabase.from('profiles').select('is_admin,is_demo').eq('id',user.id).single();if(rev!==revision)return;if(profile.error){authReady=false;return;}admin=profile.data?.is_admin===true||profile.data?.is_demo===true;}
   if(rev!==revision)return;authReady=true;
   const last=read();if(last&&user&&!admin&&!automated){if(last.owner&&last.owner!==user.id){save(null);return;}const claimed=await _supabase.rpc('personal_ad_claim',{p_click:last.id});if(rev!==revision)return;if(!claimed.error&&claimed.data)save({...last,owner:user.id});}
   scan();if(observer)document.querySelectorAll('a[data-personal-ad]').forEach(anchor=>{const target=measurementTarget(anchor);observedAnchors.set(target,anchor);observer.unobserve(target);observer.observe(target);});
  }catch(_){authReady=false;}
 }
 _supabase.auth.onAuthStateChange((event,session)=>{const next=session?.user?.id||null;if(event==='SIGNED_OUT'||(owner&&next!==owner)){save(null);owner=null;admin=false;seen.clear();}++revision;authReady=false;setTimeout(identity,0);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){timers.forEach(clearTimeout);timers.clear();document.querySelectorAll('a[data-personal-ad]').forEach(a=>visible(a,false));}else identity();});
 window.addEventListener('pagehide',()=>{timers.forEach(clearTimeout);timers.clear();document.querySelectorAll('a[data-personal-ad]').forEach(a=>visible(a,false));});
 window.addEventListener('pageshow',event=>{if(event.persisted)identity();});
 function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-personal-ad','data-pa-format','data-pa-placement','data-pa-context']});identity();}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
