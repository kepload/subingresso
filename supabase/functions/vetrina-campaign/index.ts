import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { vetrinaEmailPayload } from '../_shared/vetrina-email.mjs';
const key=Deno.env.get('SB_SECRET_KEY')??Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resend=Deno.env.get('RESEND_API_KEY');
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function providerHistory() {
 const emails:any[]=[];let cursor='',complete=false;
 for(let page=0;page<8;page++) {
  if(page)await sleep(700);
  const response=await fetch('https://api.resend.com/emails?limit=100'+(cursor?'&after='+encodeURIComponent(cursor):''),{headers:{Authorization:'Bearer '+resend},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('provider_history_http_'+response.status);
  const body=await response.json();if(!Array.isArray(body.data))throw Error('provider_history_invalid');
  emails.push(...body.data);
  const oldest=Date.parse(body.data.at(-1)?.created_at||'');
  if(!body.has_more||!body.data.length||oldest<Date.now()-30*86400000){complete=true;break;}
  cursor=body.data.at(-1).id;
 }
 if(!complete)throw Error('provider_history_incomplete');
 return emails;
}
function historyFor(emails:any[],email:string) {
 const relevant=emails.filter(e=>(Array.isArray(e.to)?e.to:[e.to]).some((v:string)=>String(v).toLowerCase()===email.toLowerCase()));
 const bad=relevant.some(e=>['bounced','complained','suppressed','failed'].includes(String(e.last_event).replace(/^email\./,'')));
 const recent=relevant.some(e=>Date.parse(e.created_at)>Date.now()-72*3600000&&!/password|accesso|conferma.*email|codice|recuper/i.test(e.subject||''));
 return {bad,recent,last_event:relevant[0]?.last_event||null};
}
Deno.serve(async req=>{
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.get('authorization')!==`Bearer ${key}`)return json({error:'Unauthorized'},401);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try {
  const body=await req.json();const action=body.action||'preview';
  if(!['preview','audit','send','verify'].includes(action))return json({error:'Invalid action'},400);
  if(action==='verify') {
   const {data,error}=await db.from('vetrina_email_log').select('id,provider_id,status').eq('campaign',body.campaign).eq('status','sent');
   if(error)throw Error('delivery_log_unavailable');
   const outcomes=[];
   for(const row of data||[]) {
    await sleep(700);
    const response=await fetch('https://api.resend.com/emails/'+encodeURIComponent(row.provider_id),{headers:{Authorization:'Bearer '+resend},signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error('provider_verify_http_'+response.status);
    const info=await response.json();const event=String(info.last_event||'unknown');
    const stored=await db.from('vetrina_email_log').update({provider_event:event}).eq('id',row.id);
    if(stored.error)throw Error('delivery_update_failed');
    outcomes.push({delivery_id:row.id,event});
   }
   return json({outcomes});
  }
  if(action==='audit') {
   if(!Array.isArray(body.user_ids)||body.user_ids.length>20)return json({error:'At most 20 recipients'},400);
   const history=await providerHistory();const users=[];
   for(const id of body.user_ids) {
    const identity=await db.auth.admin.getUserById(id);const email=identity.data?.user?.email;
    const eligibility=await db.rpc('vetrina_email_candidate',{p_user_id:id});
    if(identity.error||eligibility.error)throw Error('recipient_check_failed');
    users.push({user_id:id,eligible:!!eligibility.data,...(email?historyFor(history,email):{bad:true,recent:false})});
   }
   return json({history_complete:true,provider_sent_today:history.filter(e=>Date.parse(e.created_at)>=Date.parse(new Date().toISOString().slice(0,10)+'T00:00:00Z')).length,users});
  }
  if(!body.user_id)return json({error:'Missing user'},400);
  if(action==='preview') {
   const candidate=await db.rpc('vetrina_email_candidate',{p_user_id:body.user_id});
   if(candidate.error)throw Error('eligibility_check_failed');
   if(!candidate.data)return json({eligible:false});
   // No address or unsubscribe token escapes the service.
   const email=vetrinaEmailPayload({...candidate.data,variant:body.variant??0},'preview@example.invalid',body.family);
   return json({eligible:true,family:email.family,quote:email.quote,subject:email.payload.subject,listing_ids:email.listing_ids});
  }
  if(!resend)throw Error('provider_not_configured');
  const identity=await db.auth.admin.getUserById(body.user_id);const email=identity.data?.user?.email;
  if(identity.error||!email)return json({sent:false,reason:'recipient_unavailable'});
  const history=await providerHistory();const checks=historyFor(history,email);
  if(checks.bad||checks.recent)return json({sent:false,reason:checks.bad?'provider_suppression':'recent_email'});
  // Leave at least 20 of the known 100/day allowance for service messages.
  const today=Date.parse(new Date().toISOString().slice(0,10)+'T00:00:00Z');
  if(history.filter(e=>Date.parse(e.created_at)>=today).length>=80)return json({sent:false,reason:'daily_service_reserve'});
  const claimed=await db.rpc('claim_vetrina_email',{p_user_id:body.user_id,p_campaign:body.campaign,p_variant:body.variant??0});
  if(claimed.error)throw Error('claim_failed');if(!claimed.data)return json({sent:false,reason:'frequency_or_eligibility'});
  const item=claimed.data,delivery=item.delivery_id;
  async function finish(status:string,values:Record<string,unknown>={}) {
   const result=await db.from('vetrina_email_log').update({status,...values}).eq('id',delivery).eq('status','reserved');
   if(result.error)throw Error('delivery_log_update_failed');
  }
  const permission=await db.from('vetrina_email_permissions').select('revoked_at').eq('user_id',body.user_id).single();
  const profile=await db.from('profiles').select('email_digest,email_stats').eq('id',body.user_id).single();
  if(permission.error||profile.error||permission.data?.revoked_at||!profile.data?.email_digest||!profile.data?.email_stats){await finish('cancelled',{error_code:'preferences_changed'});return json({sent:false,reason:'preferences_changed'});}
  let message;
  try{message=vetrinaEmailPayload(item,email,body.family);}catch{await finish('failed',{error_code:'render_failed'});return json({sent:false,reason:'render_failed'},500);}
  const stored=await db.from('vetrina_email_log').update({subject:message.payload.subject,listing_ids:message.listing_ids}).eq('id',delivery).eq('status','reserved');
  if(stored.error)throw Error('delivery_prepare_failed');
  // Do not retry ambiguous network outcomes. Reserved/unknown remain protected for 30d.
  let response;
  try{response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+resend,'Content-Type':'application/json','Idempotency-Key':'vetrina-email/'+delivery},body:JSON.stringify(message.payload),signal:AbortSignal.timeout(20000)});}
  catch{await finish('unknown',{error_code:'network_unknown'});return json({sent:false,reason:'outcome_unknown',delivery_id:delivery});}
  if(!response.ok){await finish(response.status>=500?'unknown':'failed',{error_code:'provider_http_'+response.status});return json({sent:false,reason:'provider_http_'+response.status,delivery_id:delivery});}
  const result=await response.json().catch(()=>null);
  if(!result?.id){await finish('unknown',{error_code:'provider_response_unknown'});return json({sent:false,reason:'outcome_unknown',delivery_id:delivery});}
  await finish('sent',{provider_id:result.id,sent_at:new Date().toISOString(),provider_event:'accepted'});
  return json({sent:true,delivery_id:delivery,provider_id:result.id,family:message.family,quote:message.quote});
 }catch(error){console.error('vetrina-campaign',String((error as Error).message));return json({error:String((error as Error).message)},500);}
});
