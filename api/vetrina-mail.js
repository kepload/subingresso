// A message-specific token can record a hit, never read account details.
const DB='https://mhfbtltgwibwmsudsuvf.supabase.co';
const KEY='sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const PIXEL=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('Referrer-Policy','no-referrer');
 if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).end();}
 const token=typeof req.query?.t==='string'?req.query.t:'';
 const kind=req.query?.kind==='open'?'open':'click';
 const valid=UUID.test(token);
 if(req.method==='GET'&&valid&&!/prefetch|prerender/i.test(String(req.headers?.purpose||'')+' '+String(req.headers?.['sec-purpose']||''))){
  try{await fetch(DB+'/rest/v1/rpc/record_vetrina_mail_hit',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({p_token:token,p_kind:kind}),signal:AbortSignal.timeout(2500)});}catch{/* A tracking issue must not block a customer from reaching the site. */}
 }
 if(kind==='open'){res.setHeader('Content-Type','image/gif');return res.status(200).end(req.method==='HEAD'?undefined:PIXEL);}
 res.setHeader('Location','/dashboard'+(valid?'?ve='+encodeURIComponent(token):''));return res.status(303).end();
};
