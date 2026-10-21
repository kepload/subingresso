// The control-room feature was retired at the owner's request on 22 October 2026.
// Keep the dashboard bootable without its module; moderation and event management remain.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const local=fs.readFileSync(path.join(__dirname,'../dashboard.html'),'utf8');
 const html=process.env.EVENT_USE_PUBLISHED?await fetch('https://subingresso.it/dashboard',{cache:'no-store'}).then(response=>{assert.equal(response.status,200);return response.text();}):local;
 assert.equal(html.replace(/\r\n/g,'\n'),local.replace(/\r\n/g,'\n'));
 assert.doesNotMatch(html,/adminControlRoom|AdminControlRoom|admin-control-room\.(?:js|css)|acrUserDialog|Il sito sotto controllo/);
 for(const id of ['adminPanel','eventAdminPanel','adminEventDetails','admStatAnnunci'])assert(html.includes('id="'+id+'"'),id+' preserved');
 assert(html.includes('EventOrganizers.startAdmin(user.id)'));
 let parsed=0;
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc=|application\/ld\+json/.test(match[1])||!match[2].trim())continue;
  new vm.Script(match[2],{filename:'dashboard-inline-'+(++parsed)+'.js'});
 }
 assert(parsed>0);
 console.log('OK: dashboard senza riepilogo e chiamate automatiche; avvio admin, moderazione e gestione fiere conservati; script validi.');
})().catch(error=>{console.error(error);process.exitCode=1;});
