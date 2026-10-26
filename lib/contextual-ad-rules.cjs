'use strict';
const URL='https://mhfbtltgwibwmsudsuvf.supabase.co',KEY='sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
async function rpc(name,args={},token){const r=await fetch(URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+(token||KEY),'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(4500)});return {ok:r.ok,status:r.status,data:await r.json()};}
async function readRules(){const r=await rpc('contextual_ad_rules');if(!r.ok||!r.data||Array.isArray(r.data)||!r.data.ads||!r.data.posts)throw Error('Regole non disponibili');return r.data;}
async function readPosts(search){const r=await fetch(URL+'/rest/v1/blog_posts?'+search,{headers:{apikey:KEY,Authorization:'Bearer '+KEY},signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error('Articoli non disponibili');const data=await r.json();if(!Array.isArray(data))throw Error('Articoli non disponibili');return data;}
module.exports={rpc,readRules,readPosts};
