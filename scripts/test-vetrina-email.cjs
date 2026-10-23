const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {vetrinaEmailPayload}=await import('../supabase/functions/_shared/vetrina-email.mjs');
 const {recentVetrinaRecipients}=await import('../supabase/functions/_shared/email-frequency.mjs');
 const base={user_id:'fixture-user',delivery_id:'fixture-delivery',variant:0,nome:'Ada',unsub_token:'fixture-unsubscribe-token',active_count:1,period_start:'2026-10-09',period_end:'2026-10-22',listings:[{id:'fixture-listing',title:'<img src=x onerror=alert(1)>',comune:'Milano\r\nBcc:evil',views_14d:118}]};
 for(const family of ['stats','visibility','bundle'])for(const variant of [0,1,2]){
  const item={...base,variant,listings:family==='bundle'?[...base.listings,{...base.listings[0],id:'fixture-second'}]:base.listings,active_count:family==='bundle'?2:1};
  const result=vetrinaEmailPayload(item,'fixture@example.invalid',family);
  assert(!result.payload.html.includes('<img'));assert(!result.payload.html.includes('onerror='));assert(!/[\r\n]/.test(result.payload.subject));assert.equal(result.payload.reply_to,'info@subingresso.it');assert(result.payload.text.includes('type=promo'));assert(!result.payload.headers['List-Unsubscribe-Post']);
  assert(Buffer.byteLength(result.payload.html)<12000);assert(result.payload.html.includes('name="viewport"'));assert(result.payload.html.includes('role="presentation"'));assert(result.payload.text.includes('Pagamento unico. Nessun abbonamento.'));assert(result.payload.html.includes('bgcolor="#1d4ed8"'));
  assert(result.payload.text.includes(new URL(result.payload.html.match(/href="([^"]*promuovi=[^"]*)"/)[1].replace(/&amp;/g,'&')).href));
  assert(result.payload.html.includes(`Vetrina Premium · ${result.quote.days} giorni`)||result.payload.html.includes(`${result.quote.count} annunci · ${result.quote.days} giorni`));
  if(family==='bundle'){assert.equal(result.quote.total,variant===1?17820:8820);assert.equal(result.listing_ids.length,2);}else assert.equal(result.listing_ids.length,1);
 }
 const plain=vetrinaEmailPayload(base,'fixture@example.invalid').payload;
 const hostile=vetrinaEmailPayload({...base,listings:[{...base.listings[0],comune:'<svg onload=alert(1)>'}]},'fixture@example.invalid').payload;
 assert(hostile.html.includes('&lt;svg'));assert(!hostile.html.includes('<svg'));assert(hostile.subject.includes('<svg'),'subject stays plain text');
 assert(!plain.html.includes('kind=open'));assert(!plain.html.includes('kind=click'));assert(plain.html.includes('promuovi='));
 const measured=vetrinaEmailPayload({...base,tracking_enabled:true,tracking_token:'22222222-2222-2222-2222-222222222222'},'fixture@example.invalid').payload;
 assert(measured.html.includes('kind=open'));assert(measured.html.includes('kind=click'));assert(measured.html.includes('type=tracking'));assert(!measured.text.includes('kind=open'));
 assert.throws(()=>vetrinaEmailPayload({...base,variant:99},'fixture@example.invalid'));
 assert.equal(vetrinaEmailPayload({...base,listings:[{...base.listings[0],views_14d:0}]},'fixture@example.invalid').family,'visibility');
 let handler,writes=[],posts=0,claimCount=0,mode='success',permitted=true,revoked=false,claimed=false;
 const db={auth:{admin:{getUserById:async()=>({data:{user:{email:'fixture@example.invalid'}}})}},
  async rpc(name){if(name==='vetrina_email_candidate')return {data:permitted?base:null};if(name==='claim_vetrina_email'){claimCount++;if(claimed)return {data:null};claimed=true;return {data:base};}throw Error(name);},
  from(table){let value,filters={};return {select(){return this;},update(v){value=v;return this;},eq(k,v){filters[k]=v;return this;},single:async()=>({data:table==='profiles'?{email_stats:true,email_digest:true}:{revoked_at:revoked?'2026-10-23':null}}),then(resolve){if(value)writes.push({table,value,filters});return Promise.resolve({data:[],error:null}).then(resolve);}};}}
 const mockFetch=async(url,options={})=>{
  if(options.method==='POST'){posts++;assert(options.headers['Idempotency-Key'].startsWith('vetrina-email/'));const p=JSON.parse(options.body);assert(p.html.includes('type=promo'));if(mode==='timeout')throw Error('network');if(mode==='500')return new Response('{}',{status:500});if(mode==='429')return new Response('{}',{status:429});return new Response(JSON.stringify({id:'provider-fixture'}));}
  if(mode==='history403')return new Response('{}',{status:403});
  const event=mode==='bounced'?'bounced':'delivered',created_at=mode==='recent'?new Date().toISOString():new Date(Date.now()-4*86400000).toISOString();
  return new Response(JSON.stringify({has_more:false,data:[{id:'earlier',to:['fixture@example.invalid'],subject:'Le statistiche',created_at,last_event:event}]}));
 };
 const source=fs.readFileSync(path.join(root,'supabase/functions/vetrina-campaign/index.ts'),'utf8').replace(/^import .*\n/gm,'');
 new vm.Script(stripTypeScriptTypes(source)).runInNewContext({Deno:{env:{get:n=>n==='RESEND_API_KEY'?'fixture-provider':'fixture-internal'},serve:h=>handler=h},createClient:()=>db,vetrinaEmailPayload,fetch:mockFetch,Request,Response,AbortSignal,Date,Promise,JSON,Array,Error,console:{error(){}},setTimeout:fn=>{fn();return 0;}});
 const call=async(action='send',auth='fixture-internal')=>{const r=await handler(new Request('https://fixture.invalid/campaign',{method:'POST',headers:{Authorization:'Bearer '+auth,'Content-Type':'application/json'},body:JSON.stringify({action,user_id:'fixture-user',campaign:'fixture-campaign',variant:0})}));return {status:r.status,body:await r.json()};};
 assert.equal((await call('send','invalid')).status,401);assert.equal(posts,0);assert.equal(claimCount,0);
 permitted=false;assert.equal((await call('preview')).body.eligible,false);assert.equal(posts,0);permitted=true;
 for(const state of ['bounced','recent','history403']){mode=state;const r=await call();if(state==='history403')assert.equal(r.status,500);else assert.equal(r.body.sent,false);assert.equal(posts,0);assert.equal(claimCount,0);}
 mode='success';revoked=true;await call();assert.equal(posts,0);assert(writes.some(w=>w.value.status==='cancelled'));revoked=false;
 for(const [state,outcome] of [['timeout','unknown'],['500','unknown'],['429','failed'],['success','sent']]){
  claimed=false;mode=state;writes=[];const before=posts;const r=await call();assert.equal(posts,before+1);assert(writes.some(w=>w.value.status===outcome));assert.equal(r.body.sent,state==='success');
 }
 const beforeDuplicate=posts;assert.equal((await call()).body.reason,'frequency_or_eligibility');assert.equal(posts,beforeDuplicate);
 let frequencyError=false;const frequencyClient={from(){return {select(){return this;},gte(){return this;},neq:async()=>({data:[{user_id:'fixture-user'}],error:frequencyError?{message:'offline'}:null})};}};
 assert((await recentVetrinaRecipients(frequencyClient)).has('fixture-user'));frequencyError=true;await assert.rejects(()=>recentVetrinaRecipients(frequencyClient));
 for(const kind of ['weekly-seller-stats','weekly-buyer-digest']){
  let weeklyHandler,weeklyPosts=0,snapshots=0;
  const weeklyDb={auth:{admin:{getUserById:async()=>{throw Error('Suppressed weekly email attempted address lookup');}}},from(table){return {select(){return this;},eq(){return this;},in(){return this;},neq(){return this;},order(){return this;},gte(){return this;},async upsert(){snapshots++;return {error:null};},then(resolve){const data=table==='annunci'?(kind==='weekly-seller-stats'?[{id:'fixture-listing',user_id:'fixture-user',titolo:'Posteggio',visualizzazioni:10}]:Array.from({length:3},(_,i)=>({id:'listing-'+i,user_id:'other',titolo:'Posteggio'}))):table==='profiles'?[{id:'fixture-user',email_stats:true,email_digest:true,unsub_token:'fixture-token'}]:table==='alerts'?[{user_id:'fixture-user'}]:[];return Promise.resolve({data}).then(resolve);}};}};
  const weeklySource=fs.readFileSync(path.join(root,'supabase/functions',kind,'index.ts'),'utf8').replace(/^import .*\n/gm,'');
  new vm.Script(stripTypeScriptTypes(weeklySource)).runInNewContext({Deno:{env:{get:()=> 'fixture-internal'},serve:h=>weeklyHandler=h},createClient:()=>weeklyDb,recentVetrinaRecipients:async()=>new Set(['fixture-user']),fetch:async()=>{weeklyPosts++;return new Response('{}');},Request,Response,Date,Map,Set,Array,JSON,Intl,console});
  const response=await weeklyHandler(new Request('https://fixture.invalid/weekly',{method:'POST',headers:{Authorization:'Bearer fixture-internal'}}));
  assert.equal(response.status,200);assert.equal(weeklyPosts,0);if(kind==='weekly-seller-stats')assert.equal(snapshots,1,'weekly snapshot retained while promotional email replaces delivery');
 }
 console.log('PASS: nine short variants; exact bundle totals; escaping; separate opt-out; internal auth; missing consent; provider bounce/recent/history errors; revoked consent; no retry on timeout; failure logging; delivery/duplicate protection; weekly suppression with retained stats; fail-closed frequency checks. No real email sent.');
})().catch(error=>{console.error(error);process.exitCode=1;});
