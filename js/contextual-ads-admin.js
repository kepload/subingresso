/* Admin-only preview and reviewed corrections. No account data in persistent storage. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id),engine=window.SubingressoContextualAds;
 const labels={fiere:'Fiere',vendita:'Vendita posteggi',acquisto:'Acquisto posteggi',mercati:'Mercati in generale'};
 let owner=null,ads=[],settings={ads:{},posts:{}},postRecord=null,current=null,revision=0,request=0,adRevision=0,postDirty=false,loaded=false,busy=false;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function status(message,error=false){$('paContextStatus').textContent=message;$('paContextStatus').dataset.error=String(error);}
 function publishRules(){window.dispatchEvent(new CustomEvent('personal-ads:rules',{detail:{owner,settings}}));}
 function clear(){revision++;request++;owner=null;ads=[];settings={ads:{},posts:{}};postRecord=null;current=null;adRevision=0;postDirty=false;loaded=false;busy=false;$('paContextResult').hidden=true;$('paContextPreview').replaceChildren();$('paContextRows').replaceChildren();for(const id of ['paContextKeywords','paContextFinding','paContextBasis','paContextChosen','paContextDraft'])$(id).textContent='';for(const id of ['paContextSavePost','paContextResetPost','paContextSaveAd'])$(id).disabled=false;$('paContextArticle').removeAttribute('href');$('paContextPost').innerHTML='<option value="">Scegli un articolo</option>';$('paContextAd').replaceChildren();$('paContextPriority').value='';$('paContextExcluded').value='';$('paContextPanel').open=false;$('paContextAdPanel').open=false;status('');}
 async function call(action,params={},body){
  const rev=revision,expected=owner,checked=await _supabase.auth.getUser();if(rev!==revision||!expected||checked.data?.user?.id!==expected)throw Error('Accesso cambiato. Riapri la raccolta.');
  const session=await _supabase.auth.getSession();if(rev!==revision||session.data?.session?.user?.id!==expected)throw Error('Sessione cambiata. Riapri la raccolta.');
  const response=await fetch('/api/personal-ads?'+new URLSearchParams({action,...params}),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+session.data.session.access_token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'}),data=await response.json();
  if(rev!==revision||owner!==expected)throw Error('Accesso cambiato.');if(!response.ok){if(response.status===401||response.status===403)clear();throw Error(data.error||'Operazione non riuscita. Riprova.');}return data;
 }
 function adFields(){const ad=ads.find(a=>a.id===$('paContextAd').value);if(!ad)return;const record=settings.ads?.[ad.id],rule=record?.rule||ad.targeting;adRevision=record?.revision||0;$('paContextPriority').value=(rule.priorityKeywords||[]).join('\n');$('paContextExcluded').value=(rule.excludedKeywords||[]).join('\n');}
 async function options(){
  const rev=revision;status('Caricamento articoli e regole…');const result=await call('context-options');if(rev!==revision)return;
  settings=result.settings;publishRules();const selected=$('paContextPost').value;$('paContextPost').innerHTML='<option value="">Scegli un articolo</option>'+result.posts.map(p=>'<option value="'+esc(p.slug)+'">'+esc(p.title)+'</option>').join('');if(result.posts.some(p=>p.slug===selected))$('paContextPost').value=selected;
  $('paContextAd').innerHTML=ads.map(ad=>'<option value="'+ad.id+'">'+ad.id+' · '+esc(ad.title)+'</option>').join('');adFields();loaded=true;status('Scegli un articolo per vedere gli abbinamenti.');
 }
 function draft(){const value=$('paContextTopic').value;return {topics:value==='auto'?null:value==='none'?[]:value==='custom'?postRecord.rule.topics:[value],excludedAds:[...$('paContextRows').querySelectorAll('input:checked')].map(el=>el.value)};}
 function render(result,keepDraft){
  current=result;settings=result.settings;publishRules();if(!keepDraft){postDirty=false;postRecord=result.postRule;const topics=postRecord.rule.topics,multiple=Array.isArray(topics)&&topics.length>1;$('paContextTopicCustom').hidden=!multiple;$('paContextTopicCustom').textContent=multiple?topics.map(t=>labels[t]).join(' / '):'Argomenti salvati';$('paContextTopic').value=topics===null?'auto':!topics.length?'none':topics.length===1?topics[0]:'custom';}
  const eligible=result.rows.filter(r=>r.eligible);$('paContextResult').hidden=false;
  $('paContextFinding').textContent=(result.context.topics.map(t=>labels[t]).join(' / ')||'Nessuna ADS')+' · '+eligible.length+' disponibili';
  const basis={title:'Riconosciuto nel titolo',slug:'Riconosciuto nello slug',intro:'Riconosciuto nell’introduzione',body:'Riconosciuto nel testo',manual:'Correzione manuale',none:'Nessun argomento riconosciuto'};
  $('paContextBasis').textContent=result.context.sensitive?'Guida esclusa dalla pubblicità, secondo la regola del sito.':basis[result.context.basis];
  $('paContextArticle').href='/blog?post='+encodeURIComponent(result.post.slug);
  $('paContextKeywords').textContent=result.context.keywords.length?result.context.keywords.join(', '):'Nessuna parola riconosciuta.';
  const excluded=result.postRule.rule.excludedAds||[];
  $('paContextRows').innerHTML=result.rows.map(row=>'<tr><td>'+esc(row.id)+'<small>'+esc(row.title)+'</small></td><td>'+(row.eligible?'Disponibile':'Esclusa')+'<small>'+esc(row.reason)+'</small></td><td><input type="checkbox" value="'+row.id+'" aria-label="Escludi '+esc(row.id)+' da questo articolo"'+(excluded.includes(row.id)?' checked':'')+'></td></tr>').join('');
  const ad=ads.find(a=>a.id===result.selected),format=$('paContextFormat').value;$('paContextPreview').replaceChildren();
  if(ad){const img=document.createElement('img'),dimensions=format.split('x').map(Number);img.src='/images/personal-ads/'+ad.id+'-'+format+'.svg?v='+ad.assetVersion;img.dataset.paMotion=img.src.replace('.svg?','.animated.svg?');img.width=dimensions[0];img.height=dimensions[1];img.alt=ad.title+' '+ad.description;$('paContextPreview').append(img);$('paContextChosen').textContent='Esempio estratto: '+ad.id+' · '+ad.title;}
  else $('paContextChosen').textContent='Lo slot rimane senza pubblicità.';
 }
 async function preview(keepDraft=false){
  const seq=++request,rev=revision;if(!$('paContextPost').value){$('paContextResult').hidden=true;current=null;postRecord=null;return;}
  $('paContextSavePost').disabled=true;$('paContextResetPost').disabled=true;
  if(current&&current.post.slug!==$('paContextPost').value){$('paContextResult').hidden=true;current=null;postRecord=null;}
  status('Preparazione anteprima…');
  try{const result=await call('context-preview',{post:$('paContextPost').value,slot:$('paContextSlot').value,format:$('paContextFormat').value},keepDraft&&postRecord?{rule:draft(),revision:postRecord.revision}:undefined);if(seq!==request||rev!==revision)return;render(result,keepDraft);if(!busy){$('paContextSavePost').disabled=false;$('paContextResetPost').disabled=false;}status(keepDraft?'Anteprima della correzione: salva per applicarla ai visitatori.':'Anteprima aggiornata.');$('paContextDraft').textContent=keepDraft?'Modifiche non salvate.':'';}
  catch(error){if(seq===request&&rev===revision)status(error.message,true);}
 }
 function terms(id){const values=[...new Set($(id).value.split(/[\n,;]+/).map(engine.normalize).filter(Boolean))];if(values.length>20||values.some(s=>s.length<2||s.length>80))throw Error('Usa al massimo 20 parole o frasi da 2 a 80 caratteri per campo.');return values;}
 async function save(scope,reset=false){
  if(busy||!owner)return;const rev=revision;
  try{
   let key,rule,version;
   if(scope==='post'){if(!postRecord||!current||current.post.slug!==$('paContextPost').value)return;key=current.post.slug;rule=reset?{topics:null,excludedAds:[]}:draft();version=postRecord.revision;}
   else{key=$('paContextAd').value;rule={priorityKeywords:terms('paContextPriority'),excludedKeywords:terms('paContextExcluded')};version=adRevision;}
   busy=true;request++;for(const id of ['paContextSavePost','paContextResetPost','paContextSaveAd'])$(id).disabled=true;
   status('Salvataggio…');const result=await call('context-save',{}, {scope,key,rule,revision:version});if(rev!==revision)return;
   if(scope==='ad'){settings.ads[key]=result.saved;if($('paContextAd').value===key)adRevision=result.saved.revision;}else{settings.posts[key]=result.saved;if(current?.post.slug===key)postRecord=result.saved;}
   publishRules();if($('paContextPost').value)await preview();status(scope==='ad'?'Parole ADS salvate per tutti gli articoli.':'Correzione salvata. I nuovi caricamenti usano la regola.');$('paContextDraft').textContent='';
  }catch(error){if(rev===revision)status(error.message,true);}
  finally{if(rev===revision){busy=false;for(const id of ['paContextSavePost','paContextResetPost','paContextSaveAd'])$(id).disabled=false;}}
 }
 window.addEventListener('personal-ads:clear',clear);
 window.addEventListener('personal-ads:ready',event=>{if(owner!==event.detail.owner){clear();owner=event.detail.owner;}ads=event.detail.ads;if(!loaded&&innerWidth<700)$('paContextFormat').value='300x250';if($('paContextPanel').open&&!loaded)options().catch(e=>status(e.message,true));});
 $('paContextPanel').addEventListener('toggle',()=>{if($('paContextPanel').open&&owner&&!loaded)options().catch(e=>status(e.message,true));});
 $('paContextRefresh').addEventListener('click',async()=>{try{if(!loaded)await options();else await preview();}catch(e){status(e.message,true);}});
 $('paContextPost').addEventListener('change',()=>{postDirty=false;preview();});for(const id of ['paContextSlot','paContextFormat'])$(id).addEventListener('change',()=>preview(postDirty));
 $('paContextTopic').addEventListener('change',()=>{postDirty=true;preview(true);});$('paContextRows').addEventListener('change',()=>{postDirty=true;preview(true);});
 $('paContextSavePost').addEventListener('click',()=>save('post'));$('paContextResetPost').addEventListener('click',()=>save('post',true));$('paContextSaveAd').addEventListener('click',()=>save('ad'));
 $('paContextAd').addEventListener('change',adFields);$('paContextResetAd').addEventListener('click',()=>{const ad=ads.find(a=>a.id===$('paContextAd').value);if(ad){$('paContextPriority').value=(ad.targeting.priorityKeywords||[]).join('\n');$('paContextExcluded').value=(ad.targeting.excludedKeywords||[]).join('\n');status('Parole iniziali caricate nei campi. Salva per applicarle.');}});
 $('paContextReloadAd').addEventListener('click',async()=>{const rev=revision,key=$('paContextAd').value;try{const result=await call('context-options');if(rev!==revision||$('paContextAd').value!==key)return;settings=result.settings;publishRules();adFields();status('Parole salvate ricaricate.');}catch(e){if(rev===revision)status(e.message,true);}});
})();
