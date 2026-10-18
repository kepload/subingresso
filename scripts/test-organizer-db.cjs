const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 let sql=fs.readFileSync(path.join(__dirname,'verify-organizer-events.sql'),'utf8');
 if(process.argv.includes('--with-migration')){
  const migration=fs.readFileSync(path.join(root,'PATCH_EVENTI_ORGANIZZATORI_20261018.sql'),'utf8').replace(/COMMIT;\s*$/,'');
  sql=migration+'\n'+sql.replace('BEGIN;','');
 }
 const settings=process.env.SUPABASE_ACCESS_TOKEN?null:JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8'));
 const token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token,'Token di gestione non disponibile');
 const r=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const data=await r.json();if(!r.ok)throw Error(JSON.stringify(data));assert(data.some(row=>row.result?.passed),'Risultato mancante');
 if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.EVENT_QA_DIR,'database-result.json'),JSON.stringify({at:new Date().toISOString(),result:data},null,2));}
 console.log('OK: approvazioni profilo/evento, isolamento utenti, permessi, privacy, revisioni, sospensione, prenotazioni disattivate, quota 8%, idempotenza, posti e scadenze. Tutto annullato con ROLLBACK.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
