'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const g=require('./search-console.cjs');
const ok=data=>({ok:true,status:200,json:async()=>data});
const row=(keys=[],clicks=5,impressions=100,position=7)=>({keys,clicks,impressions,ctr:clicks/impressions,position});

test('finestre inclusive identiche, anno bisestile e fuso Pacifico',()=>{
  assert.deepEqual(g.ranges('2024-03-01',2),{current:{startDate:'2024-02-29',endDate:'2024-03-01'},previous:{startDate:'2024-02-27',endDate:'2024-02-28'}});
  assert.equal(g.pacificToday(new Date('2026-10-30T01:00:00Z')),'2026-10-29');
  for(const value of ['2026-02-30','2026-01-00','2026-1-1','x']) assert.throws(()=>g.day(value));
  for(const n of [0,-1,91,1.5,NaN]) assert.throws(()=>g.ranges('2026-10-27',n));
});
test('argomenti, proprietà e credenziali non arbitrarie',()=>{
  assert.equal(g.args(['report','--days','14']).options.days,'14');
  for(const argv of [['report','--days','0'],['report','--days','1.5'],['report','--token','secret'],['status','--days','1'],['setup','--property'],['report','--days','1','--days','2']]) assert.throws(()=>g.args(argv));
  assert.throws(()=>g.validateProperty('https://attacker.example/'));
  assert.throws(()=>g.validateCredentials({type:'service_account',client_email:'a@b.iam.gserviceaccount.com',private_key:'not-a-key'}));
});
test('classificazione URL canonici e legacy',()=>{
  for(const url of ['https://subingresso.it/blog?post=prezzi','https://subingresso.it/blog/prezzi']) assert.equal(g.segment(url),'blog');
  assert.equal(g.segment('https://subingresso.it/annuncio?id=x'),'posteggi');
  assert.equal(g.segment('https://subingresso.it/annunci/milano'),'posteggi');
  assert.equal(g.segment('https://subingresso.it/fiere/lombardia'),'fiere');
  assert.equal(g.segment('https://subingresso.it/valutatore'),'valutatore');
  assert.equal(g.segment('https://evil.example/blog'),'altro');
  for(const section of ['blog','posteggi','fiere','valutatore']) {
    const pattern=new RegExp(g.sectionFilters(section)[0].expression);
    assert.equal(pattern.test('https://evil.example/blog'),false);
  }
  assert.equal(new RegExp(g.sectionFilters('blog')[0].expression).test('https://subingresso.it/blogger'),false);
});
test('token JWT readonly: firma valida, endpoint fisso, nessun segreto nei log',async()=>{
  const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
  const c={type:'service_account',client_email:'test@project.iam.gserviceaccount.com',private_key:privateKey.export({type:'pkcs8',format:'pem'}),token_uri:'https://evil.example'};
  await g.accessToken(c,async(url,options)=>{
    assert.equal(url,'https://oauth2.googleapis.com/token');assert.equal(options.redirect,'error');
    const assertion=new URLSearchParams(options.body).get('assertion'); const [header,payload,signature]=assertion.split('.');
    const claims=JSON.parse(Buffer.from(payload,'base64url'));
    assert.equal(claims.scope,'https://www.googleapis.com/auth/webmasters.readonly');
    assert.equal(claims.exp-claims.iat,3600);assert.equal(claims.aud,url);
    assert(crypto.verify('RSA-SHA256',Buffer.from(header+'.'+payload),publicKey,Buffer.from(signature,'base64url')));
    return ok({access_token:'synthetic-test-token'});
  });
});
test('paginazione, filtri Italia, dati finali e limite esplicito',async()=>{
  const many=Array.from({length:25000},(_,i)=>row(['q'+i]));let calls=0;
  const report=await g.query('fake','sc-domain:subingresso.it',{startDate:'2026-10-01',endDate:'2026-10-02'},['query'],[],async(url,options)=>{
    assert(url.startsWith('https://www.googleapis.com/webmasters/v3/sites/'));
    const body=JSON.parse(options.body);assert.equal(body.startRow,calls*25000);assert.equal(body.dataState,'final');
    assert.equal(body.dimensionFilterGroups[0].filters[0].expression,'ita');calls++;
    return ok({rows:calls===1?many:[row(['last'])]});
  });
  assert.equal(report.rows.length,25001);assert.equal(report.capped,false);assert.equal(calls,2);
  const capped=await g.query('fake','sc-domain:subingresso.it',{},['query'],[],async()=>ok({rows:many}));
  assert.equal(capped.capped,true);assert.equal(capped.rows.length,50000);
});
test('errori remoti non rivelano risposte o token, null distinto da zero',async()=>{
  for(const status of [400,401,403,404,429,500]) await assert.rejects(g.jsonRequest('https://www.googleapis.com',{},async()=>({ok:false,status,json:async()=>({secret:'do-not-print'})})),e=>!e.message.includes('do-not-print'));
  await assert.rejects(g.jsonRequest('https://www.googleapis.com',{},async()=>{throw Error('secret');}),e=>!e.message.includes('secret'));
  assert.equal(g.metrics({rows:[]}),null);assert.equal(g.change(null,row()),null);
  assert.equal(g.change(row([],3),row([],0)).clicksPercent,null);
  await assert.rejects(g.query('fake','sc-domain:subingresso.it',{},['query'],[],async()=>ok({rows:[{keys:['x'],clicks:-1}]})));
});
test('report completo, totali indipendenti, precedenti assenti non inventati',async()=>{
  const {privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
  const c={client_email:'test@project.iam.gserviceaccount.com',private_key:privateKey.export({type:'pkcs8',format:'pem'}),property:'sc-domain:subingresso.it'};
  let calls=0;
  const report=await g.collect(c,{end:'2024-03-01',days:2},async(url,options)=>{
    calls++;if(url.includes('oauth2')) return ok({access_token:'fake'});
    const b=JSON.parse(options.body);const previous=b.startDate==='2024-02-27';
    if(b.dimensions.length===0) return ok({rows:[row([],previous?3:5)]});
    return ok({rows:[row(b.dimensions.map(d=>d==='date'?(previous?'2024-02-27':'2024-02-29'):d==='page'?'https://subingresso.it/blog?post=test':d==='device'?'MOBILE':previous?'previous-query':'current|query<script>'))]});
  });
  assert.equal(calls,21);assert.equal(report.total.current.clicks,5);assert.equal(report.total.change.clicks,2);
  assert.equal(report.queries.previousOnly.length,1);assert.equal(report.queries.comparison[0].previous,null);
  assert.equal(report.pages.comparison[0].section,'blog');assert.deepEqual(report.observedDays.current,['2024-02-29']);
  const md=g.markdown(report);assert(!md.includes('<script>'));assert(md.includes('current\\|queryscript'));
  assert(!JSON.stringify(report).includes('PRIVATE KEY'));assert(!JSON.stringify(report).includes('access_token'));
  const home=path.resolve(__dirname,'../.local/verifiche/search-console-20261030',crypto.randomUUID());
  const folder=g.writeReport(report,home);
  const first=JSON.parse(fs.readFileSync(path.join(home,'latest.json'),'utf8'));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(folder,'report.json'),'utf8')),report);
  assert.equal(path.resolve(home,first.report),path.join(folder,'report.json'));
  // Un rapporto non scrivibile non deve sostituire quello precedente.
  assert.throws(()=>g.writeReport({...report,queries:null},home));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(home,'latest.json'),'utf8')),first);
  const again=g.writeReport({...report,generatedAt:'2026-10-30T22:00:00.000Z'},home);
  assert.notEqual(again,folder);assert(fs.existsSync(path.join(folder,'report.md')));
});
test('cifratura DPAPI utente Windows: andata e ritorno senza file', {skip:process.platform!=='win32'},()=>{
  const sample=JSON.stringify({synthetic:'private-value-'+crypto.randomUUID()});const encrypted=g.vault('protect',sample);
  assert(!encrypted.includes(sample));assert.equal(g.vault('unprotect',encrypted),sample);
  assert.throws(()=>g.vault('unprotect','not-an-encrypted-value'));
});
