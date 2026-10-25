/* SVG motion player. No account data, tracking, timers for off-screen ads or dependencies. */
(() => {
 'use strict';
 if(window.SubingressoAdMotion){window.SubingressoAdMotion.scan();return;}
 const states=new Map(),cache=new Map(),bound=new WeakSet();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,forced=false,queued=false;
 const styles=document.createElement('style');styles.textContent='[data-pa-motion-host]{display:block;position:absolute;pointer-events:none;line-height:0;overflow:hidden}[data-pa-player]{display:inline-block;max-width:100%;vertical-align:top}[data-pa-player]>a{display:block;line-height:0}[data-pa-pause]{display:block;margin:4px 0 0 auto;border:0;background:transparent;color:#123b7a;font:600 12px/1.4 system-ui,sans-serif;padding:6px 4px;min-height:32px;cursor:pointer}[data-pa-pause][hidden]{display:none}[data-pa-pause]:focus-visible{outline:2px solid #123b7a;outline-offset:2px}';document.head.append(styles);
 function address(img){
  try{
   const raw=img.dataset.paMotion||(img.closest('a[data-personal-ad]')?img.src.replace(/\.(png|svg)(\?|$)/,'.animated.svg$2'):'');
   if(!raw)return null;const url=new URL(raw,document.baseURI);
   if(!['https://subingresso.it',location.origin].includes(url.origin))return null;
   if(!/^\/images\/personal-ads\/(vendi|compra|fiere)-0[1-7]-(300x250|336x280|728x90|970x250|320x100|300x600|1080x1080|1080x1920)\.animated\.svg$/.test(url.pathname))return null;
   return url.href;
  }catch(_){return null;}
 }
 function source(url){
  if(cache.has(url))return cache.get(url);
  const promise=fetch(url,{mode:'cors',credentials:'omit'}).then(async response=>{
   if(!response.ok)throw Error('SVG unavailable');
   const text=await response.text(),doc=new DOMParser().parseFromString(text,'image/svg+xml'),svg=doc.documentElement;
   if(svg.localName!=='svg'||doc.querySelector('parsererror,script,foreignObject,iframe,object,embed,a'))throw Error('Invalid SVG');
   for(const node of svg.querySelectorAll('*'))for(const attr of node.attributes){
    if(/^on/i.test(attr.name))throw Error('Unexpected handler');
    if(/^(href|xlink:href)$/i.test(attr.name)&&!/^data:image\/(jpeg|png|webp);base64,[\w+/=\s]+$/.test(attr.value))throw Error('Unexpected image');
   }
   for(const style of svg.querySelectorAll('style'))if(/@import|url\s*\(/i.test(style.textContent))throw Error('Unexpected style');
   return svg;
  }).catch(error=>{cache.delete(url);throw error;});
  cache.set(url,promise);if(cache.size>12)cache.delete(cache.keys().next().value);return promise;
 }
 function motionReduced(state){return reduced.matches&&!forced&&!state?.forced;}
 function blocked(state){const dialog=document.querySelector('dialog[open]');return paused||state.paused||motionReduced(state)||document.hidden||!state.visible||!state.img.isConnected||(dialog&&!dialog.contains(state.img));}
 function position(state){
  if(!state.host)return;const image=state.img.getBoundingClientRect(),parent=state.parent.getBoundingClientRect();
  state.host.style.left=(image.left-parent.left-state.parent.clientLeft+state.parent.scrollLeft)+'px';
  state.host.style.top=(image.top-parent.top-state.parent.clientTop+state.parent.scrollTop)+'px';
  state.host.style.width=image.width+'px';state.host.style.height=image.height+'px';
 }
 function stop(state){
  ++state.generation;state.loading=false;
  state.host?.remove();state.host=null;state.img.style.opacity=state.opacity;
  state.img.dataset.paPlaying='false';
 }
 function controls(){
  const retry=[...states.values()].some(s=>s.visible&&s.failed)&&![...states.values()].some(s=>s.host);
  document.querySelectorAll('[data-pa-motion-toggle]').forEach(button=>{
   const text=retry?'Riprova animazioni':motionReduced()||paused?'Riproduci animazioni':'Pausa animazioni';
   if(button.textContent!==text)button.textContent=text;
   button.disabled=false;button.setAttribute('aria-pressed',String(paused||motionReduced()));
   if(!bound.has(button)){bound.add(button);button.addEventListener('click',()=>{
    const retryNow=[...states.values()].some(s=>s.visible&&s.failed)&&![...states.values()].some(s=>s.host);
    if(paused||motionReduced()||retryNow){paused=false;forced=true;for(const state of states.values()){stop(state);state.failed=false;}}
    else paused=true;
    update();
   });}
  });
 }
 async function play(state){
  if(blocked(state)||state.host||state.loading||state.failed)return;
  const generation=++state.generation;state.loading=true;
  try{
   const original=await source(state.url);
   if(generation!==state.generation||blocked(state))return;
   const host=document.createElement('span');host.dataset.paMotionHost='';host.setAttribute('aria-hidden','true');
   const shadow=host.attachShadow({mode:'open'}),svg=document.importNode(original,true);
   // Explicit Play overrides the preference for this preview only; automatic
   // playback still honours reduced motion. Cached/exported SVGs stay intact.
   if(reduced.matches&&(forced||state.forced))for(const style of svg.querySelectorAll('style'))style.textContent=style.textContent.replace('@media(prefers-reduced-motion:no-preference)','@media all');
   svg.classList.add('pa-repeat');svg.setAttribute('width','100%');svg.setAttribute('height','100%');
   svg.style.cssText='display:block;width:100%;height:100%';svg.setAttribute('aria-hidden','true');
   shadow.append(svg);state.host=host;state.parent.append(host);position(state);
   state.img.style.opacity='0';state.img.dataset.paPlaying='true';
   if(state.control){state.control.hidden=false;state.control.textContent='Pausa animazione';}
  }catch(_){if(generation===state.generation){state.failed=true;update();}}
  finally{if(generation===state.generation)state.loading=false;}
 }
 function update(){
  controls();for(const state of states.values()){
   if(blocked(state))stop(state);else play(state);
   if(state.control){state.control.disabled=false;const text=state.failed?'Riprova animazione':state.paused||motionReduced(state)?'Riproduci animazione':'Pausa animazione';if(state.control.textContent!==text)state.control.textContent=text;state.control.hidden=!(state.host||state.failed||state.paused||motionReduced(state));state.control.setAttribute('aria-pressed',String(state.paused||motionReduced(state)));}
  }
 }
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){const state=states.get(entry.target);if(!state)continue;
   state.visible=entry.isIntersecting&&entry.intersectionRect.width>=Math.min(32,entry.boundingClientRect.width)&&entry.intersectionRect.height>=Math.min(32,entry.boundingClientRect.height);
   if(blocked(state))stop(state);else play(state);
  }
 },{threshold:[0,.01,.04,.1,.25,.5,1]}):null;
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const e of entries){const state=states.get(e.target);if(state)position(state);}}):null;
 function mount(img,url){
  const parent=img.parentElement;if(getComputedStyle(parent).position==='static')parent.style.position='relative';
  const state={img,parent,url,visible:false,paused:false,forced:false,generation:0,loading:false,failed:false,host:null,opacity:img.style.opacity,control:null};
  states.set(img,state);
  if(!document.querySelector('[data-pa-motion-toggle]')){
   const anchor=img.closest('a[data-personal-ad]');
   if(anchor){let player=anchor.parentElement;
    if(!player.hasAttribute('data-pa-player')){player=document.createElement('span');player.dataset.paPlayer='';anchor.before(player);player.append(anchor);}
    const control=document.createElement('button');control.type='button';control.dataset.paPause='';control.textContent='Pausa animazione';control.hidden=true;control.setAttribute('aria-pressed','false');
    control.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(state.paused||motionReduced(state)||state.failed){state.paused=false;state.forced=true;state.failed=false;stop(state);}else state.paused=true;update();});player.append(control);state.control=control;
   }
  }
  img.addEventListener('load',()=>position(state));resize?.observe(img);observer?.observe(img);
 }
 function scan(){
  queued=false;
  for(const [img,state]of states)if(!img.isConnected){stop(state);observer?.unobserve(img);resize?.unobserve(img);state.control?.remove();states.delete(img);}
  document.querySelectorAll('img[data-pa-motion],a[data-personal-ad] img').forEach(img=>{
   const url=address(img);if(!url)return;const state=states.get(img);
   if(state){if(url!==state.url){stop(state);state.url=url;state.failed=false;position(state);if(!blocked(state))play(state);}}else mount(img,url);
  });update();
 }
 function queue(){if(!queued){queued=true;queueMicrotask(scan);}}
 function start(){scan();new MutationObserver(queue).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-pa-motion','open']});}
 reduced.addEventListener?.('change',()=>{forced=false;for(const state of states.values()){state.forced=false;stop(state);}update();});document.addEventListener('visibilitychange',update);
 window.addEventListener('pagehide',()=>{for(const state of states.values())stop(state);});window.addEventListener('pageshow',update);
 window.SubingressoAdMotion={scan:queue};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
