'use strict';
const {JSDOM}=require('jsdom'),createDOMPurify=require('dompurify'),engine=require('../js/contextual-ads.js'),catalog=require('./personal-ads.cjs'),service=require('./contextual-ad-rules.cjs');
const window=new JSDOM('').window,purify=createDOMPurify(window);
function validRule(scope,key,rule,revision){
 if(!Number.isSafeInteger(revision)||revision<0||!rule||Array.isArray(rule)||typeof rule!=='object')return false;
 if(scope==='ad')return !!catalog.getAd(key)&&Object.keys(rule).every(k=>['priorityKeywords','excludedKeywords'].includes(k))&&['priorityKeywords','excludedKeywords'].every(k=>Array.isArray(rule[k])&&rule[k].length<=20&&new Set(rule[k]).size===rule[k].length&&rule[k].every(s=>typeof s==='string'&&s.length>=2&&s.length<=80&&s===engine.normalize(s)));
 if(scope==='post')return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(key||'')&&key.length<=180&&Object.keys(rule).every(k=>['topics','excludedAds'].includes(k))&&(rule.topics===null||Array.isArray(rule.topics)&&rule.topics.length<=4&&rule.topics.every(k=>['fiere','vendita','acquisto','mercati'].includes(k)))&&Array.isArray(rule.excludedAds)&&rule.excludedAds.length<=20&&rule.excludedAds.every(id=>!!catalog.getAd(id));
 return false;
}
module.exports=async(req,res)=>{
 const q=req.query||{},token=(req.headers?.authorization||'').match(/^Bearer (.+)$/)?.[1];
 if(!token)return res.status(401).json({error:'Accedi con il tuo account amministratore.'});
 const saving=q.action==='context-save';if(!(saving?['POST']:q.action==='context-preview'?['GET','POST']:['GET']).includes(req.method))return res.status(405).json({error:'Metodo non consentito.'});
 try{
  const checked=await service.rpc('admin_contextual_ad_rules',{},token);
  if(!checked.ok)return res.status(checked.status===401||checked.status===403||checked.data?.code==='42501'?403:503).json({error:checked.data?.code==='42501'?'Solo amministratore.':'Regole non disponibili. Riprova.'});
  const settings=checked.data;
  if(q.action==='context-options')return res.status(200).json({settings,posts:await service.readPosts('select=slug,title&order=title.asc')});
  if(saving){
   const body=req.body||{};if(!validRule(body.scope,body.key,body.rule,body.revision))return res.status(400).json({error:'Regola non valida. Controlla parole, argomento e ADS.'});
   const r=await service.rpc('admin_save_contextual_ad_rule',{p_scope:body.scope,p_key:body.key,p_rule:body.rule,p_revision:body.revision},token);
   if(!r.ok)return res.status(r.data?.code==='40001'?409:r.data?.code==='42501'?403:r.data?.code==='22023'?400:503).json({error:r.data?.code==='40001'?'La regola è cambiata in un altro accesso. Ricarica prima di salvare.':r.data?.code==='22023'?'Regola o articolo non valido.':'Salvataggio non riuscito. Riprova.'});
   return res.status(200).json({saved:r.data});
  }
  if(q.action!=='context-preview'||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.post||'')||q.post.length>180||!Object.hasOwn(engine.slots,q.slot)||!engine.slots[q.slot].formats.includes(q.format))return res.status(400).json({error:'Articolo, slot o formato non valido.'});
  const [post]=await service.readPosts('slug=eq.'+encodeURIComponent(q.post)+'&select=slug,title,excerpt,category,content&limit=1');if(!post)return res.status(404).json({error:'Articolo non trovato.'});
  const root=window.document.createElement('div');root.innerHTML=purify.sanitize(post.content||'');
  let postRule=settings.posts?.[post.slug]||{rule:{topics:null,excludedAds:[]},revision:0};
  if(req.method==='POST'){
   if(!validRule('post',post.slug,req.body?.rule,req.body?.revision))return res.status(400).json({error:'Anteprima correzione non valida.'});
   if(req.body.revision!==postRule.revision)return res.status(409).json({error:'La regola è cambiata. Aggiorna l’anteprima prima di salvare.'});
   postRule={rule:req.body.rule,revision:postRule.revision};
  }
  const context=engine.analyze(post,engine.editorialText(root),postRule.rule),pool=engine.effectiveAds(settings);
  const rows=engine.explain(context,q.slot,q.format,pool),eligible=rows.filter(r=>r.eligible),total=eligible.reduce((n,r)=>n+r.weight,0);
  const {fields,...explanation}=context;
  return res.status(200).json({post:{slug:post.slug,title:post.title},context:explanation,postRule,settings,rows:rows.map(({ad,...row})=>({...row,id:ad.id,title:ad.title,goal:ad.goal,priorityKeywords:ad.priorityKeywords||[],excludedKeywords:ad.excludedKeywords||[],probability:total?row.weight/total:0})),selected:engine.select(context,q.slot,Number(q.format.split('x')[0]),[],Math.random,eligible.map(r=>r.ad))?.ad.id||null});
 }catch(_){return res.status(503).json({error:'Anteprima o regole non disponibili. Riprova.'});}
};
module.exports.validRule=validRule;
