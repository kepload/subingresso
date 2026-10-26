// Functional email/cancel intent is consumed before page tracking; no persistent IDs.
(function(){
 'use strict';
 const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
 const url=new URL(location.href),param=name=>url.searchParams.get(name);
 const intent={mail:UUID.test(param('ve')||'')?param('ve'):null,flow:UUID.test(param('vf')||'')?param('vf'):null,
  ids:(param('promuovi')||'').split(',').filter(id=>UUID.test(id)).slice(0,10),tier:['10d','30d','90d'].includes(param('durata'))?param('durata'):null,cancel:param('vetrina')==='annullata'};
 let owner=null,epoch=0,mail=null,consumed=false,bound=false;
 if(['ve','vf','promuovi','durata'].some(k=>url.searchParams.has(k))){for(const key of ['ve','vf','promuovi','durata'])url.searchParams.delete(key);history.replaceState(history.state,'',url.pathname+url.search+url.hash);}
 const hasIntent=()=>!!(intent.mail||intent.flow||intent.ids.length);
 function setOwner(id){if(id!==owner){epoch++;owner=id;mail=null;}}
 async function record(kind,options={}){
  if(!owner||typeof _supabase==='undefined')return null;
  if(['offer_open','offer_close','tier_select','checkout_attempt','checkout_error','checkout_cancel'].includes(kind))window.SiteAnalytics?.track('vetrina_action',{action:kind,tier:options.tier||'free'});
  const expected=owner,version=epoch;
  try{
   const {data:{session}}=await _supabase.auth.getSession();
   if(!session||session.user.id!==expected||owner!==expected||epoch!==version)return null;
   const response=await fetch(SUPABASE_URL+'/rest/v1/rpc/record_vetrina_funnel_event',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({p_id:crypto.randomUUID(),p_kind:kind,p_source:options.source||'dashboard',p_tier:options.tier||null,p_count:Number.isInteger(options.count)?options.count:null,p_mail_token:options.mailToken||mail,p_flow:options.flow||null}),signal:AbortSignal.timeout(6000)});
   if(!response.ok||owner!==expected||epoch!==version)return null;return await response.json();
  }catch{return null;}
 }
 async function start(user){
  setOwner(user?.id||null);if(!owner||consumed)return;consumed=true;
  const version=epoch;
  if(intent.flow)await record('checkout_cancel',{flow:intent.flow});
  let context=null;
  if(intent.mail){const result=await record('email_landing',{mailToken:intent.mail,source:'email'});context=result?.context;if(context?.tracked)mail=intent.mail;}
  if(epoch!==version||!owner)return;
  const ids=context?.listing_ids||intent.ids,tier=context?.tier||intent.tier;
  if(ids?.length&&window.VetrinaPremium){await VetrinaPremium.open({id:ids[0]},{listingIds:ids,tier,source:context?.tracked?'email':'dashboard'});}
 }
 function reloadWithIntent(){const next=new URL('/dashboard',location.origin);if(intent.mail)next.searchParams.set('ve',intent.mail);if(intent.flow)next.searchParams.set('vf',intent.flow);if(intent.ids.length)next.searchParams.set('promuovi',intent.ids.join(','));if(intent.tier)next.searchParams.set('durata',intent.tier);if(intent.cancel)next.searchParams.set('vetrina','annullata');location.assign(next.href);}
 function bind(){if(bound||typeof _supabase==='undefined')return;bound=true;_supabase.auth.getSession().then(({data:{session}})=>{if(!owner)setOwner(session?.user?.id||null);}).catch(()=>{});_supabase.auth.onAuthStateChange((_event,session)=>{const before=owner;setOwner(session?.user?.id||null);if(before&&!session){intent.mail=null;intent.flow=null;intent.ids=[];consumed=true;}});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
 window.VetrinaJourney={record,start,hasIntent,reloadWithIntent};
})();
