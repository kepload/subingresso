const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of fs.readdirSync(root).filter(f=>f.endsWith('.html'))){const html=read(f);if(/src="\/?js\/auth.js/.test(html))assert(/src="\/?js\/data.js/.test(html),f+': validazione condivisa mancante');for(const [tag,source]of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(!tag.includes('application/ld+json'))new vm.Script(source,{filename:f});}
for(const f of ['js/data.js','js/auth.js','js/admin-control-room.js','js/pages/annunci.js','js/blog-tracker.js'])new vm.Script(read(f),{filename:f});
const data=read('js/data.js'),validation=data.slice(data.indexOf('function italianPhoneDigits'),data.indexOf('// UX helper:'));
const context={};vm.createContext(context);vm.runInContext(validation,context);
const shared={};vm.createContext(shared);vm.runInContext(stripTypeScriptTypes(read('supabase/functions/_shared/input.ts')).replace(/export /g,''),shared);
const phones=[['347 1234567','347 1234567'],['+39 3471234567','347 1234567'],['0039 3471234567','347 1234567'],['393471234567','347 1234567'],['06 1234567','061234567'],['+39061234567','061234567'],['02123456','02123456'],['012345','012345'],['test3471234567',''],['3471234567abc',''],['1234567890',''],['+44 3471234567',''],['+393471234567+',''],['3471234567 / 3331234567',''],['000000000',''],['','']];
for(const[raw,expected]of phones){assert.equal(context.normalizePhone(raw),expected,raw);assert.equal(shared.phone(raw)||'',expected,raw);assert.equal(context.isValidItalianPhone(raw),!!expected,raw);}
for(const[raw,expected]of [['15.000',15000],['15.000,50',15000.5],['15000.50',15000.5],['12,50',12.5],['0',0]])assert.equal(context.parseFormNumber(raw,true),expected,raw);
for(const raw of ['12abc','Infinity','NaN','1e5','-24','1.234.56','1,234','1 2','15 000','1.2.3'])assert(Number.isNaN(context.parseFormNumber(raw,true)),raw);
for(const raw of ['user@example.it','name+tag@example.it','name.surname@example.com']){assert(context.isValidFormEmail(raw));assert(shared.email(raw));}
for(const raw of ['.name@example.it','name..surname@example.it','name.@example.it','name@-domain.it','name@domain-.it','name@example','name@example.it\nBcc:x@example.it',{},'x'.repeat(65)+'@example.it']){assert(!context.isValidFormEmail(raw),String(raw));assert(!shared.email(raw),String(raw));}
assert(context.isValidFormText('Descrizione\ncon più righe',1,100,true));assert(!context.isValidFormText('Nome\nCognome',1,100));assert(!context.isValidFormText('   ',1,100));
function edge(name,client){let handler;const c={...shared,validEmail:shared.email,createClient:()=>client,Deno:{env:{get:()=>''},serve:fn=>handler=fn},Response,console:{error(){},warn(){}},fetch:async()=>new Response('{}')};vm.createContext(c);const source=read(`supabase/functions/${name}/index.ts`).replace(/^import .*;\r?\n/gm,'');vm.runInContext(stripTypeScriptTypes(source),c);return handler;}
(async()=>{
 let creates=0,updates=0;
 const register=edge('register-bypass',{auth:{admin:{createUser:async()=>{creates++;return{error:{message:'already registered'}};},updateUserById:async()=>{updates++;}}}});
 const base={email:'valid@example.it',password:'valid123',nome:'Mario',cognome:'Rossi',telefono:'3471234567'};
 for(const patch of [{email:'bad'},{nome:{}},{telefono:'test3471234567'},{password:'123'},{password:'x'.repeat(129)},{nome:'x'.repeat(101)}])assert.equal((await register(new Request('https://example.test',{method:'POST',body:JSON.stringify({...base,...patch})}))).status,400);
 assert.equal(creates,0);assert.equal((await register(new Request('https://example.test',{method:'POST',body:JSON.stringify(base)}))).status,409);assert.equal(updates,0,'Nessuna password di account esistente deve essere riscritta');
 const directory={};vm.createContext(directory);vm.runInContext(stripTypeScriptTypes(read('supabase/functions/_shared/user-directory.ts')).replace(/export /g,''),directory);
 const paged={rpc:async(_name,{p_offset,p_limit})=>({data:{total:2051,users:Array.from({length:Math.min(p_limit,2051-p_offset)},(_,i)=>({id:'user-'+(p_offset+i)}))}})};
 assert.equal((await directory.userDirectory(paged)).length,2051);
 await assert.rejects(()=>directory.userDirectory({rpc:async()=>({data:{total:2051,users:[]}})}));
 let calls=0;await assert.rejects(()=>directory.userDirectory({rpc:async()=>({data:{total:2+calls++,users:[{id:'same'}]}})}));
 const dashboard=read('dashboard.html'),report={PosteggioValuation:require('../js/valuation.js'),escapeHTML:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;')};vm.createContext(report);
 vm.runInContext(dashboard.slice(dashboard.indexOf('function _fmtEur'),dashboard.indexOf('async function loadAdminValutatoreLogs')),report);
 const rendered=report._renderValutatoreRow({algoritmo_version:'2.0',dettagli_calcolo:{input:{incasso:500,baseIncasso:'giorno',giornate:50,sole:'frontale',concessione:'stabile'}}});
 assert(rendered.includes('a giornata'));assert(rendered.includes('Sole davanti'));assert(rendered.includes('50'));assert(report._renderValutatoreRow({}).includes('Dettagli non disponibili'));
 let warning='';const profileContext={_profileReady:false,showToast:message=>warning=message};vm.createContext(profileContext);
 const start=dashboard.indexOf('async function saveProfile('),end=dashboard.indexOf('\nasync function ',start+10);
 vm.runInContext(dashboard.slice(start,end),profileContext);await profileContext.saveProfile({preventDefault(){}});assert(warning.includes('Ricarica'));
 console.log('OK: sintassi, numeri, telefoni, email, testo e registrazione server');
})().catch(e=>{console.error(e);process.exitCode=1;});
