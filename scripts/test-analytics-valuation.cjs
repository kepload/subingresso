'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),moduleTools=require('node:module');
const excluded=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'],customer='00000000-0000-4000-8000-000000000003';
const records=[...excluded.map(user_id=>({user_id,created_at:new Date().toISOString(),id:user_id})),{id:'anonymous',user_id:null,created_at:new Date().toISOString()},{id:'customer',user_id:customer,created_at:new Date().toISOString(),annuncio_id:'listing'}];
let handler,adminAllowed=true,registryError=false;
const client={auth:{getUser:async()=>({data:{user:{id:excluded[0]}}})},rpc:async name=>name==='analytics_excluded_account_ids'?{data:excluded,error:registryError?{}:null}:{data:[]},from:table=>{
 const q={options:{},predicates:[],select(_columns,options){this.options=options||{};return this;},eq(){return this;},maybeSingle:async()=>({data:{is_admin:adminAllowed}}),or(value){assert(value.startsWith('user_id.is.null,user_id.not.in.('));for(const id of excluded)assert(value.includes(id));this.predicates.push(r=>r.user_id===null||!excluded.includes(r.user_id));return this;},gte(){return this;},not(key){this.predicates.push(r=>r[key]!=null);return this;},order(){return this;},limit(n){this.max=n;return this;},then(resolve){let rows=records.filter(r=>this.predicates.every(fn=>fn(r)));const count=rows.length;return Promise.resolve({data:this.options.head?null:rows.slice(0,this.max||999),count,error:null}).then(resolve);}};return q;
}};
const file=path.join(__dirname,'../supabase/functions/admin-valutatore-logs/index.ts');
let source=moduleTools.stripTypeScriptTypes(fs.readFileSync(file,'utf8')).replace(/import \{ createClient \} from '[^']+';/,'const createClient=()=>testClient;');
vm.runInNewContext(source,{testClient:client,Deno:{env:{get:()=>''},serve:fn=>handler=fn},Request,Response,URL,Date,console,Set});
(async()=>{
 let response=await handler(new Request('https://example.invalid/stats',{headers:{Authorization:'Bearer simulated'}}));let body=await response.json();assert.equal(response.status,200);assert.equal(body.logs.length,2);assert(body.logs.some(r=>r.user_id===null));assert.equal(body.stats.totale_all,2);assert.equal(body.stats.registrati_30d,1);assert.equal(body.stats.pubblicato_30d,1);
 adminAllowed=false;response=await handler(new Request('https://example.invalid/stats',{headers:{Authorization:'Bearer simulated'}}));assert.equal(response.status,403);
 adminAllowed=true;registryError=true;response=await handler(new Request('https://example.invalid/stats',{headers:{Authorization:'Bearer simulated'}}));assert.equal(response.status,503);
 console.log(JSON.stringify({passed:true,checks:8,real_writes:0,anonymous_reports_preserved:true}));
})().catch(error=>{console.error(error);process.exitCode=1;});
