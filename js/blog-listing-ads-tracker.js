/* Solo Vetrine del blog: sessione esistente, nessun dato personale nuovo. */
(() => {
 'use strict';
 if(window.__blogListingAdsTracker||typeof _supabase==='undefined')return;
 window.__blogListingAdsTracker=true;
 const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
 const seen=new Set(),pending=new Set(),timers=new Map(),bound=new WeakSet(),visible=new Set();
 let revision=0,ready=false,excluded=false,owner=null,token=null;
 function info(anchor){
  const post=new URLSearchParams(location.search).get('post'),host=anchor.closest('[data-blog-listing-placement]');
  let sid;try{sid=sessionStorage.getItem('_session_id');}catch(_){return null;}
  if(!uuid.test(anchor.dataset.blogListingAd||'')||!/^[a-z0-9-]{1,200}$/.test(post||'')||!/^[a-zA-Z0-9_-]{8,80}$/.test(sid||''))return null;
  const placement=host?.dataset.blogListingPlacement||'blog_inline';
  if(!['blog_inline','blog_closing'].includes(placement))return null;
  return {p_listing:anchor.dataset.blogListingAd,p_post:post,p_placement:placement,p_session:sid};
 }
 function key(args,kind){return [args.p_session,args.p_listing,args.p_post,args.p_placement,kind].join('|');}
 async function event(anchor,kind){
  if(!ready||excluded||navigator.webdriver===true||!anchor.isConnected||document.hidden||anchor.dataset.blogListingOwner===owner&&owner)return;
  const args=info(anchor);if(!args)return;const id=key(args,kind);if(seen.has(id)||pending.has(id))return;
  const rev=revision;pending.add(id);
  try{
   const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/blog_listing_ad_event',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+(token||SUPABASE_ANON_KEY),'Content-Type':'application/json'},body:JSON.stringify({...args,p_kind:kind}),keepalive:true});
   if(r.ok&&rev===revision)seen.add(id);
  }catch(_){}finally{pending.delete(id);}
 }
 function cancel(anchor){clearTimeout(timers.get(anchor));timers.delete(anchor);}
 function schedule(anchor){cancel(anchor);if(ready&&!document.hidden&&visible.has(anchor)&&anchor.isConnected)timers.set(anchor,setTimeout(()=>{timers.delete(anchor);if(visible.has(anchor))event(anchor,'impression');},1000));}
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.5){visible.add(entry.target);schedule(entry.target);}else{visible.delete(entry.target);cancel(entry.target);}}},{threshold:[0,.5]}):null;
 function scan(){
  for(const anchor of visible)if(!anchor.isConnected){visible.delete(anchor);cancel(anchor);observer?.unobserve(anchor);}
  document.querySelectorAll('a[data-blog-listing-ad]').forEach(anchor=>{if(bound.has(anchor))return;bound.add(anchor);observer?.observe(anchor);anchor.addEventListener('click',()=>event(anchor,'click'));anchor.addEventListener('auxclick',e=>{if(e.button===1)event(anchor,'click');});});
 }
 async function identity(){
  const rev=++revision;ready=false;token=null;timers.forEach(clearTimeout);timers.clear();
  try{
   const session=await _supabase.auth.getSession();if(rev!==revision||session.error)return;
   const checked=session.data?.session?await _supabase.auth.getUser():{data:{user:null}};if(rev!==revision||checked.error)return;
   const user=checked.data?.user;if(user&&session.data.session.user?.id!==user.id)return;
   owner=user?.id||null;excluded=false;
   if(user){const profile=await _supabase.from('profiles').select('is_admin,is_demo').eq('id',user.id).single();if(rev!==revision||profile.error)return;excluded=profile.data?.is_admin===true||profile.data?.is_demo===true;token=session.data.session.access_token;}
   if(window.AnalyticsIdentity){const measurement=await window.AnalyticsIdentity.context();if(rev!==revision)return;excluded=excluded||!measurement.allowed;}
   if(rev!==revision)return;ready=true;scan();visible.forEach(schedule);
  }catch(_){}
 }
 _supabase.auth.onAuthStateChange(()=>{++revision;ready=false;token=null;owner=null;timers.forEach(clearTimeout);timers.clear();setTimeout(identity,0);});
 document.addEventListener('visibilitychange',()=>{timers.forEach(clearTimeout);timers.clear();if(!document.hidden)identity();});
 function start(){scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});identity();}
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
