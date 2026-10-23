import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { vetrinaEmailPayload } from '../_shared/vetrina-email.mjs';
const service=Deno.env.get('SB_SECRET_KEY')??Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const providerKey=Deno.env.get('RESEND_API_KEY')!;
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'authorization, apikey, content-type'};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{...CORS,'Content-Type':'application/json'}});
const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:CORS});
 if(req.method!=='POST')return json({error:'Metodo non consentito.'},405);
 const auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return json({error:'Accedi come amministratore.'},401);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,service,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const internal=auth===`Bearer ${service}`;let actor:string;
  if(internal){const admins=await db.from('profiles').select('id').eq('is_admin',true).limit(2);if(admins.error||admins.data?.length!==1)return json({error:'Amministratore non identificabile.'},409);actor=admins.data[0].id;}
  else{const identity=await db.auth.getUser(auth.slice(7));if(identity.error||!identity.data?.user)return json({error:'Sessione non valida.'},401);actor=identity.data.user.id;const profile=await db.from('profiles').select('is_admin').eq('id',actor).single();if(profile.error||profile.data?.is_admin!==true)return json({error:'Accesso riservato.'},403);}
  const body=await req.json().catch(()=>null);if(!body||!['sync','sample','inspect'].includes(body.action))return json({error:'Azione non valida.'},400);
  async function provider(path:string,options:RequestInit={}){return fetch('https://api.resend.com'+path,{...options,headers:{Authorization:'Bearer '+providerKey,'Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(20000)});}
  if(body.action==='inspect'){
   if(!internal)return json({error:'Accesso riservato.'},403);
   const response=await provider('/domains');if(!response.ok)throw Error('Provider non disponibile.');const domains=await response.json(),result=[];
   for(const domain of domains.data||[]){await sleep(700);const details=await provider('/domains/'+domain.id);if(!details.ok)throw Error('Dominio non disponibile.');const value=await details.json();result.push({name:value.name,open_tracking:value.open_tracking,click_tracking:value.click_tracking});}
   return json({domains:result,method:'Marketing-only on-site measurement; provider domain tracking unchanged.'});
  }
  if(body.action==='sync'){
   const result=await db.from('vetrina_email_log').select('id,provider_id,delivery_confirmed').eq('status','sent').not('provider_id','is',null).order('created_at',{ascending:false}).limit(100);
   if(result.error)throw Error('Registro email non disponibile.');let updated=0,failed=0;
   for(const row of result.data||[]){await sleep(700);try{const response=await provider('/emails/'+encodeURIComponent(row.provider_id));if(!response.ok){failed++;continue;}const info=await response.json();const event=String(info.last_event||'unknown');const saved=await db.from('vetrina_email_log').update({provider_event:event,delivery_confirmed:row.delivery_confirmed||['delivered','opened','clicked'].includes(event)}).eq('id',row.id);if(saved.error)failed++;else updated++;}catch{failed++;}}
   if(!failed){const saved=await db.from('vetrina_analytics_settings').update({provider_synced_at:new Date().toISOString()}).eq('id',1);if(saved.error)throw Error('Aggiornamento non salvato.');}
   return json({updated,failed,complete:failed===0});
  }
  const identity=await db.auth.admin.getUserById(actor),recipient=identity.data?.user?.email;
  if(identity.error||!recipient)throw Error('Indirizzo del tuo account non disponibile.');
  const claimed=await db.rpc('claim_vetrina_email_sample',{p_user:actor});
  if(claimed.error)throw Error('Copia email non disponibile.');
  if(!claimed.data)return json({sent:false,already_sent:true,message:'Una copia è già stata richiesta nelle ultime 24 ore.'});
  const item=claimed.data,delivery=item.delivery_id,message=vetrinaEmailPayload(item,recipient,'stats');
  const prepared=await db.from('vetrina_email_log').update({subject:message.payload.subject,listing_ids:message.listing_ids,offered_tier:message.quote.tier,template_family:message.family}).eq('id',delivery).eq('status','reserved');
  if(prepared.error)throw Error('Preparazione della copia non disponibile.');
  let response;
  try{response=await provider('/emails',{method:'POST',headers:{'Idempotency-Key':'vetrina-email-sample/'+delivery},body:JSON.stringify(message.payload)});}catch{await db.from('vetrina_email_log').update({status:'unknown',error_code:'sample_network_unknown'}).eq('id',delivery);return json({sent:false,unknown:true,message:'Esito da verificare. La copia non verrà reinviata automaticamente.'},502);}
  const value=await response.json().catch(()=>null);
  if(!response.ok||!value?.id){await db.from('vetrina_email_log').update({status:response.status>=500?'unknown':'failed',error_code:'sample_provider_'+response.status}).eq('id',delivery);return json({sent:false,error:'Il servizio email non ha confermato la copia.'},502);}
  const saved=await db.from('vetrina_email_log').update({status:'sent',provider_id:value.id,sent_at:new Date().toISOString(),provider_event:'accepted'}).eq('id',delivery).eq('status','reserved');
  if(saved.error)throw Error('Copia accettata dal servizio: verifica il registro prima di riprovare.');
  return json({sent:true,delivery_id:delivery,provider_id:value.id,recipient:recipient.replace(/^(.).+(@.+)$/,'$1***$2'),message:'Copia inviata. Usa un annuncio pubblico d’esempio ed è esclusa dai risultati dei clienti.'});
 }catch(error){console.error('Admin email analytics unavailable');return json({error:(error as Error).message||'Operazione non disponibile.'},503);}
});
