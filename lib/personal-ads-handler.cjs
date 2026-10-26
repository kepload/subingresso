'use strict';
const {ads,formats,getAd,getFormat,placement}=require('./personal-ads.cjs');
const URL='https://mhfbtltgwibwmsudsuvf.supabase.co';
const KEY='sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SITE='https://subingresso.it';
const regions=['Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna','Friuli-Venezia Giulia','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte','Puglia','Sardegna','Sicilia','Toscana','Trentino-Alto Adige','Umbria',"Valle d'Aosta",'Veneto'];
async function rpc(name,args,token){
 const r=await fetch(URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+(token||KEY),'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(4500)});
 const data=await r.json();return {ok:r.ok,status:r.status,data};
}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');
 res.setHeader('Referrer-Policy','no-referrer');
 if(/^context-/.test(req.query?.action||''))return require('./contextual-ads-admin.cjs')(req,res);
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).end();}
 const q=req.query||{};
 if(q.action==='click'){
  const ad=getAd(q.ad),format=getFormat(q.format)||(q.format==='editoriale'?{id:'editoriale'}:null);
  if(!ad||!format)return res.status(404).json({error:'Annuncio non trovato.'});
  const dest=new globalThis.URL(ad.destination,SITE);
  if(regions.includes(q.region))dest.searchParams.set('regione',q.region);
  dest.searchParams.set('utm_source','subingresso');dest.searchParams.set('utm_medium','banner');dest.searchParams.set('utm_campaign',ad.id);
  // HEAD, prefetch, anteprime, crawler e automazioni non producono clic.
  const skip=req.method==='HEAD'||q.preview==='1'||/bot|crawler|spider|headless|playwright|facebookexternalhit|slackbot|whatsapp/i.test(req.headers?.['user-agent']||'')||/prefetch|prerender/i.test((req.headers?.purpose||'')+' '+(req.headers?.['sec-purpose']||''));
  if(!skip)try{
   const sid=/^[a-zA-Z0-9_-]{8,80}$/.test(q.sid||'')?q.sid:null;
   const r=await rpc('personal_ad_event',{p_ad:ad.id,p_format:format.id,p_placement:placement(q.placement),p_kind:'click',p_session:sid});
   if(r.ok&&/^[a-f0-9-]{36}$/.test(r.data||''))dest.searchParams.set('pa',r.data);
  }catch(_){} // Un problema delle statistiche non interrompe la destinazione.
  res.setHeader('Location',dest.toString());return res.status(303).end();
 }
 if(q.action)return res.status(400).json({error:'Operazione non valida.'});
 const token=(req.headers?.authorization||'').match(/^Bearer (.+)$/)?.[1];
 if(!token)return res.status(401).json({error:'Accedi con il tuo account amministratore.'});
 try{
  const period=[7,30,90,365].includes(Number(q.days))?Number(q.days):30;
  const r=await rpc('admin_personal_ads',{p_days:period},token);
  if(!r.ok)return res.status([401,403].includes(r.status)||r.data?.code==='42501'?403:503).json({error:[401,403].includes(r.status)||r.data?.code==='42501'?'Questa raccolta è riservata all’amministratore.':'Statistiche non disponibili. Riprova.'});
  return res.status(200).json({ads,formats,stats:r.data});
 }catch(_){return res.status(503).json({error:'Raccolta non disponibile. Riprova.'});}
};
