'use strict';
const crypto=require('node:crypto');
const {getAd,getFormat}=require('./personal-ads.cjs');
const context=require('./personal-ad-context.cjs');
const SID=/^[a-zA-Z0-9_-]{8,80}$/,UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const origins=new Set(['https://subingresso.it','https://www.subingresso.it']);
function blocked(req){
 const h=req.headers||{};
 return !origins.has(h.origin)||h['sec-fetch-site']&& !['same-origin','same-site'].includes(h['sec-fetch-site'])||
  /(?:^|;\s*)si_internal_analytics=1(?:;|$)/.test(h.cookie||'')||
  /bot|crawler|spider|headless|playwright|facebookexternalhit|slackbot|whatsapp|googleother|inspectiontool|curl|wget|python|node-fetch|undici|go-http-client|lighthouse|pagespeed|scrapy/i.test(h['user-agent']||'')||
  /prefetch|prerender/i.test((h.purpose||'')+' '+(h['sec-purpose']||''));
}
function body(req){
 if(Number(req.headers?.['content-length'])>16000)throw Error('body');
 let value=req.body;
 if(typeof value==='string'){
  if(value.length>16000)throw Error('body');
  value=/application\/x-www-form-urlencoded/i.test(req.headers?.['content-type']||'')?Object.fromEntries(new URLSearchParams(value)):JSON.parse(value);
 }
 if(!value||typeof value!=='object'||Array.isArray(value)||JSON.stringify(value).length>16000)throw Error('body');
 return value;
}
function signingKey(){const key=process.env.PERSONAL_ADS_EVENT_KEY;if(typeof key!=='string'||key.length<64)throw Error('configuration');return key;}
function mac(value){return crypto.createHmac('sha256',signingKey()).update(value).digest('hex');}
function equal(a,b){return typeof a==='string'&&typeof b==='string'&&/^[a-f0-9]{64}$/.test(a)&&/^[a-f0-9]{64}$/.test(b)&&crypto.timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));}
function binding(q){return {ad:q.ad,format:q.format,placement:q.placement,session:q.sid,article:q.context.article_slug||'',version:q.context.creative_version||0};}
function ticket(data){const encoded=Buffer.from(JSON.stringify(data)).toString('base64url');return encoded+'.'+mac('ticket:'+encoded);}
function readTicket(value){
 if(typeof value!=='string'||value.length>2500)return null;
 const [encoded,signature,...extra]=value.split('.');if(extra.length||!equal(signature,mac('ticket:'+encoded)))return null;
 try{const data=JSON.parse(Buffer.from(encoded,'base64url').toString());return Number.isSafeInteger(data.until)&&data.until>Date.now()&&data.until<=Date.now()+86401000&&UUID.test(data.impression||'')?data:null;}catch(_){return null;}
}
function input(q,req){
 if(!getAd(q.ad)||!getFormat(q.format)&&q.format!=='editoriale'||!SID.test(q.sid||'')||!/^[a-z0-9_-]{1,80}$/.test(q.placement||''))return null;
 return {...q,context:context(q,req.headers)};
}
async function record(req,q,kind,rpc){
 if(blocked(req)||q.preview==='1')return null;
 const item=input(q,req);if(!item)return null;
 let impression=null;
 if(kind==='click'){
  const receipt=readTicket(q.ticket);if(!receipt)return null;
  if(JSON.stringify(receipt.binding)!==JSON.stringify(binding(item)))return null;
  impression=receipt.impression;
 }else if(!Number.isInteger(item.context.visible_ms)||item.context.visible_ms<1000||!Number.isInteger(item.context.page_ms)||item.context.page_ms<1000||!['phone','tablet','desktop'].includes(item.context.device_class))return null;
 const payload=JSON.stringify({ad:item.ad,format:item.format,placement:item.placement,session:item.sid,kind,context:item.context,impression,at:Date.now()});
 const bearer=(req.headers?.authorization||'').match(/^Bearer (\S+)$/)?.[1];
 const result=await rpc('personal_ad_event_v3',{p_payload:payload,p_signature:mac('event:'+payload)},bearer);
 if(!result.ok)throw Error('Event storage unavailable');
 if(!UUID.test(result.data||''))return null;
 if(kind==='click')return {id:result.data};
 const until=Date.now()+86400000;
 return {ticket:ticket({binding:binding(item),impression:result.data,until}),until};
}
module.exports={blocked,body,record};
