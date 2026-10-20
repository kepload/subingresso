(function(){
 'use strict';
 const D=window.EventData, $=id=>document.getElementById(id);
 const state={userId:null,data:null,selected:null,placeId:null,picker:null,dirty:false,eventSnapshot:'',placeDirty:false,profileDirty:false,capacityDrafts:{},busy:false,restoring:false,locationRequest:0,epoch:0,feedbackId:null,returnFocus:null};
 let adminData=null, adminSelection=null, adminBusy=false, adminActive=false, adminIdentity=null, adminEpoch=0, adminSession=0;
 const adminView={kind:'event',search:'',status:'all',page:0};
 const adminPageSize=6;
 async function rpc(name,args){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);try{let query=_supabase.rpc(name,args);if(typeof query.abortSignal==='function')query=query.abortSignal(controller.signal);const result=await query;if(result.error)throw Error(result.error.message||'Operazione non riuscita');return result.data;}finally{clearTimeout(timer);}}
 function message(text,error=false,id=state.feedbackId||'organizerMessage'){const el=$(id);if(!el)return;el.textContent=text;el.dataset.error=String(error);el.hidden=!text;}
 function failure(error){const text=error?.message||'Connessione non disponibile. Riprova.';if(/abort|timeout|timed out/i.test(text))return 'Connessione interrotta. Ricarica per verificare il salvataggio prima di riprovare.';return /check constraint|not-null|invalid input|value too long|out of range/i.test(text)?'Controlla i campi: formato, date, quantità e lunghezze devono essere validi.':text;}
 function values(form){return Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,typeof value==='string'?value.trim():value]));}
 function fieldError(input,text){
  const id=input.form.id+'-'+input.name+'-error';let error=$(id);
  if(!error&&text){error=document.createElement('small');error.id=id;error.className='ev-field-error';error.setAttribute('aria-live','polite');(input.name==='sectors'?input.closest('fieldset'):input.parentElement).append(error);}
  if(error){error.textContent=text;error.hidden=!text;}
  const described=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));
  if(text){input.setAttribute('aria-invalid','true');described.add(id);}else{input.removeAttribute('aria-invalid');described.delete(id);}
  if(described.size)input.setAttribute('aria-describedby',[...described].join(' '));else input.removeAttribute('aria-describedby');
 }
 function clearErrors(form){for(const input of form.elements)if(input.name)fieldError(input,'');}
 function addDays(value,days){const date=new Date(value+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);}
 function isDate(input){return input.getAttribute('type')==='date';}
 function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const date=new Date(value+'T12:00:00Z');return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;}
 function updateDates(adjust=false){
  const form=$('organizerEventForm'),start=form.elements.start_date,end=form.elements.end_date,deadline=form.elements.application_deadline;
  const previous=end.value;
  const validStart=validDate(start.value)&&start.value>=start.min&&start.value<=start.max;
  if(adjust&&validStart&&(!end.value||end.value<start.value))end.value=start.value;
  if($('eventDateHint'))$('eventDateHint').textContent=previous&&previous!==end.value?'La fine è stata allineata alla nuova data di inizio. Puoi spostarla più avanti.':'Evento di un solo giorno? Lascia la stessa data di inizio e fine.';
  end.min=validStart?start.value:'2000-01-01';end.max=validStart?addDays(start.value,366):'2101-12-31';deadline.max=validStart?start.value:'2100-12-31';
  for(const input of [start,end,deadline]){const error=checkField(input);if(input.value||input.hasAttribute('aria-invalid'))fieldError(input,error);}
 }
 function checkField(input){
  const value=input.value.trim(),form=input.form,name=input.name;
  if(input.type==='checkbox')return name==='sectors'&&!form.querySelector('[name=sectors]:checked')?'Seleziona almeno un settore ammesso.':'';
  if(input.validity.badInput)return isDate(input)?'Inserisci una data completa e valida.':'Inserisci un numero valido.';
  if(input.required&&!value)return 'Compila questo campo.';
  if(!value)return '';
  if(name==='private_phone'||name==='public_phone'){const digits=value.replace(/\D/g,'');if(!/^\+?[0-9 ()-]{7,25}$/.test(value)||digits.length<7||digits.length>15)return 'Inserisci un telefono valido (7–15 cifre, prefisso internazionale facoltativo).';}
  if(input.minLength>0&&[...value].length<input.minLength)return 'Inserisci almeno '+input.minLength+' caratteri, senza contare gli spazi iniziali e finali.';
  if(input.maxLength>0&&[...value].length>input.maxLength)return 'Usa al massimo '+input.maxLength+' caratteri.';
  if(input.type==='email'&&(input.validity.typeMismatch||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))return 'Inserisci un’email completa, per esempio nome@dominio.it.';
  if(name==='website'&&(!D.safeWebsite(value)||/\s/.test(value)))return 'Inserisci un sito che inizi con https://, senza spazi o credenziali.';
  if(isDate(input)){
   if(!validDate(value))return 'Inserisci una data completa e valida.';
   if(name==='end_date'&&form.elements.start_date.value&&value<form.elements.start_date.value)return 'La data di fine non può precedere la data di inizio.';
   if(name==='end_date'&&input.max&&value>input.max)return 'La fine deve essere entro 366 giorni dalla data di inizio.';
   if(name==='application_deadline'&&form.elements.start_date.value&&value>form.elements.start_date.value)return 'La scadenza delle domande deve essere entro la data di inizio dell’evento.';
   if((input.min&&value<input.min)||(input.max&&value>input.max))return 'Scegli una data compresa tra il 2000 e il 2100.';
  }
  if(input.type==='number'){
   if(!Number.isFinite(Number(value)))return 'Inserisci un numero valido.';
   if(input.validity.rangeUnderflow||input.validity.rangeOverflow)return 'Inserisci un valore da '+input.min+' a '+input.max+'.';
   if(input.validity.stepMismatch)return name==='quantity'?'Inserisci un numero intero di posteggi.':'Usa al massimo due cifre decimali.';
  }
  return input.validity.valid?'':'Controlla il formato di questo campo.';
 }
 function validateForm(form){
  if(form.id==='organizerEventForm')updateDates();let first=null;
  for(const input of form.elements){if(!input.name||input.disabled||input.readOnly||(input.name==='sectors'&&input!==form.querySelector('[name=sectors]')))continue;const error=checkField(input);fieldError(input,error);if(error&&!first)first=input;}
  if(form.id==='organizerProfileForm'&&!['website','public_email','public_phone'].some(name=>form.elements[name].value.trim())){const input=form.elements.public_email;fieldError(input,'Indica almeno un’email pubblica, un telefono pubblico o il sito web per ricevere contatti.');if(!first)first=input;}
  if(form.id==='organizerEventForm'&&state.picker&&!state.picker.getValue()&&!first){first=form.elements.city;fieldError(first,'Seleziona il comune dall’elenco dei suggerimenti.');}
  if(first){first.focus();return false;}return true;
 }
 function bindValidation(form){
  form.noValidate=true;
  form.addEventListener('input',event=>{
   const input=event.target;if(!input.name)return;
   if(isDate(input))updateDates();
   else if(input.hasAttribute('aria-invalid')||input.name==='sectors')fieldError(input.name==='sectors'?form.querySelector('[name=sectors]'):input,checkField(input));
   if(form.id==='organizerProfileForm'&&['website','public_email','public_phone'].includes(input.name)&&['website','public_email','public_phone'].some(name=>form.elements[name].value.trim()))fieldError(form.elements.public_email,checkField(form.elements.public_email));
  });
  form.addEventListener('change',event=>{if(event.target.name==='start_date'){updateDates(true);markEventDirty();}else if(isDate(event.target))updateDates();});
 }
 function fill(form,data){for(const el of form.elements){if(!el.name||el.name==='sectors')continue;if(el.type==='checkbox')el.checked=data?.[el.name]!==false;else el.value=data?.[el.name]??'';}}
 function selectedEvent(){return state.data?.events.find(e=>e.id===state.selected);}
 function eventSignature(){return JSON.stringify([...new FormData($('organizerEventForm')).entries()]);}
 function markEventDirty(){if(!state.restoring)state.dirty=eventSignature()!==state.eventSnapshot;renderReadiness();}
 function renderReadiness(){
  const hint=$('eventSubmissionHint'),event=selectedEvent();if(!hint)return;
  hint.hidden=!event||!['draft','rejected'].includes(event.status);if(hint.hidden)return;
  if(state.dirty||state.placeDirty){hint.textContent='Hai modifiche da salvare prima di inviare l’evento.';return;}
  const form=$('organizerEventForm'),missing=[],today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(!validDate(form.elements.start_date.value)||form.elements.start_date.value<today)missing.push('una data di inizio da oggi in poi');
  if([...form.elements.participation_rules.value.trim()].length<20)missing.push('come partecipare (almeno 20 caratteri)');
  if(!event.places.some(place=>place.active))missing.push('almeno una tipologia di posteggio attiva');
  hint.textContent=missing.length?'Da completare: '+missing.join(' · ')+'.':'Pronto per l’invio. Premi «Invia evento in revisione»: sarà pubblico dopo l’approvazione.';
 }
 function mayLeave(){if(!(state.dirty||state.placeDirty||Object.keys(state.capacityDrafts).length))return true;if(!window.confirm('Ci sono modifiche non salvate. Vuoi uscire senza salvarle?'))return false;state.capacityDrafts={};return true;}
 function restoreActionFocus(){
  const target=state.returnFocus;if(!target)return;
  if(target.userId!==state.userId||!target.button.isConnected||document.activeElement!==document.body){state.returnFocus=null;return;}
  if(state.busy||state.restoring||target.button.disabled)return;state.returnFocus=null;target.button.focus({preventScroll:true});
 }
 async function action(button,fn){
  if(state.busy)return;state.busy=true;
  const workspace=$('organizerWorkspace'),wasInert=workspace.inert,previousFeedback=state.feedbackId,hadFocus=button===document.activeElement,userId=state.userId,capacityPlace=button?.closest('[data-capacity-place]')?.dataset.capacityPlace;
  state.feedbackId=capacityPlace?'eventCapacityMessage':button?.closest('#organizerProfileForm')?'organizerProfileMessage':button?.closest('#eventPlaceForm')||button?.id==='submitOrganizerEvent'?'eventPlacesMessage':button?.closest('#organizerEventForm')?'organizerEventMessage':'organizerMessage';
  const buttons=[...$('organizerApp').querySelectorAll('button')].map(el=>[el,el.disabled]);buttons.forEach(([el])=>el.disabled=true);
  workspace.inert=true;$('organizerApp').setAttribute('aria-busy','true');const old=button?.textContent;if(button)button.textContent='Attendi…';for(const id of ['organizerMessage','organizerProfileMessage','organizerEventMessage','eventPlacesMessage','eventCapacityMessage'])message('',false,id);
  try{await fn();}catch(error){message(failure(error),true);$(state.feedbackId)?.scrollIntoView({block:'nearest'});}
  finally{state.busy=false;workspace.inert=wasInert;$('organizerApp').setAttribute('aria-busy','false');buttons.forEach(([el,disabled])=>{if(el.isConnected)el.disabled=disabled;});$('organizerEventForm').querySelector('button[type=submit]').disabled=state.restoring;$('organizerProfileForm').querySelector('button[type=submit]').disabled=state.data?.profile?.status==='suspended';if(capacityPlace&&!button?.isConnected&&userId===state.userId)button=[...document.querySelectorAll('[data-capacity-place]')].find(form=>form.dataset.capacityPlace===capacityPlace)?.querySelector('button[type=submit]');if(button?.isConnected){button.textContent=old;if(hadFocus){state.returnFocus={button,userId};restoreActionFocus();}}state.feedbackId=previousFeedback;renderReadiness();}
 }
 function profileHTML(p,heading='h3'){
  const name=p?.organization_name||'Profilo organizzatore',types={impresa:'Impresa',associazione:'Associazione / Pro Loco',ente:'Comune / Ente',altro:'Organizzatore'},website=D.safeWebsite(p?.website);
  const initials=name.trim().split(/\s+/).slice(0,2).map(word=>[...word][0]).join('').toLocaleUpperCase('it-IT');
  const contacts=[p?.public_email?'<a href="mailto:'+D.esc(p.public_email)+'"><i class="fas fa-envelope" aria-hidden="true"></i>'+D.esc(p.public_email)+'</a>':'',p?.public_phone?'<a href="tel:'+D.esc(p.public_phone.replace(/[^\d+]/g,''))+'"><i class="fas fa-phone" aria-hidden="true"></i>'+D.esc(p.public_phone)+'</a>':'',website?'<a href="'+D.esc(website)+'" target="_blank" rel="noopener noreferrer"><i class="fas fa-link" aria-hidden="true"></i>'+D.esc(new URL(website).hostname.replace(/^www\./,''))+'</a>':''].filter(Boolean);
  return '<div class="organizer-profile-header"><div class="organizer-profile-avatar" aria-hidden="true">'+D.esc(initials)+'</div><div class="organizer-profile-identity"><'+heading+'>'+D.esc(name)+'</'+heading+'>'+(p?.organization_type?'<p class="organizer-profile-type">'+D.esc(types[p.organization_type]||'Organizzatore')+'</p>':'')+'<div'+(heading==='h1'?' id="organizerStatus"':'')+'>'+(p?D.badge(p.status).replace('ev-status','ev-status profile-organizer-status'):'')+'</div></div></div>'+(p?.description?'<p class="organizer-profile-bio">'+D.esc(p.description)+'</p>':'')+(contacts.length?'<div class="organizer-profile-contacts">'+contacts.join('')+'</div>':'');
 }
 function renderWorkspace(){const p=state.data.profile, approved=p?.status==='approved';
  document.title=(p?.organization_name||'Profilo organizzatore')+' — Subingresso.it';
  $('organizerProfileView').innerHTML=profileHTML(p,'h1');
  $('organizerReview').hidden=!p?.review_note;$('organizerReview').textContent=p?.review_note||'';
  if(!state.profileDirty){fill($('organizerProfileForm'),p||{organization_type:'impresa'});clearErrors($('organizerProfileForm'));$('organizerProfileDetails').open=!p||p.status==='rejected';}$('organizerProfileSummary').textContent=p?'Modifica profilo':'Compila il profilo';
  $('organizerProfileForm').querySelector('button[type=submit]').disabled=p?.status==='suspended';
  $('organizerProfileWarning').hidden=!approved;
  $('newOrganizerEvent').hidden=!approved;$('organizerEventsHint').hidden=approved;$('organizerEventsHint').textContent='Disponibili dopo l’approvazione del profilo.';
  $('organizerEvents').innerHTML=state.data.events.length?state.data.events.map(e=>'<article class="ev-card"><div class="ev-card-head"><h3>'+D.esc(e.title)+'</h3>'+D.badge(e.status)+'</div><p>'+D.esc(D.dates(e))+' · '+D.esc(e.city)+'</p><p class="ev-muted">'+e.places.filter(s=>s.active).length+' tipologie di posteggio</p>'+(e.status==='draft'?'<p class="ev-muted">Bozza non inviata. Aprila e premi «Invia evento in revisione» per richiedere l’approvazione.</p>':'')+(e.review_note?'<p class="ev-notice">'+D.esc(e.review_note)+'</p>':'')+'<div class="ev-actions">'+(approved?'<button type="button" data-event-edit="'+D.esc(e.id)+'">'+(['draft','rejected'].includes(e.status)?'Completa e invia':'Modifica / Gestisci')+'</button>':'')+(e.status==='published'&&approved?'<a class="ev-button" href="/evento?id='+D.esc(e.id)+'">Vedi evento pubblico</a>':'')+(e.status!=='cancelled'?'<button type="button" class="ev-danger" data-event-cancel="'+D.esc(e.id)+'">Ritira evento</button>':'')+'</div></article>').join(''):'<p class="ev-empty">Non hai ancora creato eventi.</p>';
  if(state.selected&&approved){const e=selectedEvent();if(e)fillEvent(e);else $('eventEditor').hidden=true;}else $('eventEditor').hidden=true;
 }
 async function loadWorkspace(){const epoch=++state.epoch;const {data:{user},error}=await _supabase.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw Error('Impossibile verificare l’accesso. Riprova.');if(epoch!==state.epoch)return;
   if(state.userId!==user?.id){state.data=null;state.selected=null;state.dirty=false;state.placeDirty=false;state.profileDirty=false;state.capacityDrafts={};}
  state.userId=user?.id||null;$('organizerLoading').hidden=true;$('organizerLogin').hidden=!!user;$('organizerWorkspace').hidden=true;if(!user)return;
  const data=await rpc('organizer_workspace');if(epoch!==state.epoch||state.userId!==user.id)return;state.data=data;renderWorkspace();$('organizerWorkspace').hidden=false;
  window.dispatchEvent(new CustomEvent('organizer-workspace',{detail:{userId:state.userId,profile:data.profile,events:data.events}}));
  const url=new URL(location.href);if(url.searchParams.get('modifica')==='1'){$('organizerProfileDetails').open=true;url.searchParams.delete('modifica');history.replaceState(null,'',url.pathname+url.search+url.hash);$('organizerProfileForm').elements.organization_name.focus();}
 }
 function initPicker(){if(state.picker)return;for(const region of REGIONI){const option=document.createElement('option');option.value=option.textContent=region;$('eventRegion').append(option);}state.picker=createComunePicker({comuneInput:$('eventCity'),regioneSelect:$('eventRegion'),provinciaInput:$('eventProvince'),suggestionsEl:$('eventCities'),statusEl:$('eventCityStatus')});}
 function fillEvent(e){initPicker();message('',false,'organizerEventMessage');message('',false,'eventPlacesMessage');clearErrors($('organizerEventForm'));fill($('organizerEventForm'),e||{category:'mercatino'});updateDates();for(const input of $('organizerEventForm').querySelectorAll('[name=sectors]'))input.checked=(e?.sectors||[]).includes(input.value);
  state.eventSnapshot=eventSignature();
  const request=++state.locationRequest,form=$('organizerEventForm'),save=form.querySelector('button[type=submit]');state.restoring=true;save.disabled=true;form.setAttribute('aria-busy','true');
  state.picker.setValue(e?.city||'',e?.region||'').catch(()=>{}).finally(()=>{if(request!==state.locationRequest)return;state.restoring=false;markEventDirty();form.setAttribute('aria-busy','false');save.disabled=state.busy;restoreActionFocus();});
  $('eventEditorTitle').textContent=e?'Gestisci: '+e.title:'Nuovo evento';$('eventEditor').hidden=false;$('eventPlacesEditor').hidden=!e;state.dirty=false;resetPlace();
  $('eventPublicationNotice').hidden=!e||!['published','pending'].includes(e.status);renderCapacity(e);
  renderReadiness();
  if(e){$('eventPlacesList').innerHTML=e.places.length?e.places.map(p=>'<article class="ev-card"><div class="ev-card-head"><h3>'+D.esc(p.label)+'</h3>'+(!p.active?'<span class="ev-status">Non attivo</span>':'')+'</div><p>'+p.quantity+' posteggi · '+D.esc(D.money(p.price_cents))+' ciascuno / intero evento</p><button type="button" data-place-edit="'+D.esc(p.id)+'">Modifica tipologia</button></article>').join(''):'<p class="ev-empty">Aggiungi almeno una tipologia di posteggio.</p>';$('submitOrganizerEvent').hidden=!['draft','rejected'].includes(e.status);}
 }
 function resetPlace(){state.placeId=null;state.placeDirty=false;$('eventPlaceForm').reset();clearErrors($('eventPlaceForm'));$('placeFormTitle').textContent='Aggiungi una tipologia di posteggio';$('placeDetails').open=false;renderReadiness();}
 function renderCapacity(e){
  const root=$('eventCapacity');if(!root)return;root.hidden=!e;
  if(!e)return;
  $('eventCapacitySummary').innerHTML=D.availabilityHTML(e.places);
  $('eventCapacityForms').innerHTML=e.places.filter(p=>p.active).map(p=>{const draft=state.capacityDrafts[p.id];return '<form class="ev-card" data-capacity-place="'+D.esc(p.id)+'" data-revision="'+D.esc(draft?.revision??p.capacity_revision??1)+'"><h4>'+D.esc(p.label)+'</h4>'+D.availabilityHTML([p])+'<p class="ev-muted">'+D.esc(p.confirmed??0)+' prenotati sul sito · '+D.esc(p.held??0)+' in pagamento</p><div class="ev-grid"><label>Numero massimo di posti<input name="capacity" type="number" min="1" max="10000" step="1" required value="'+D.esc(draft?.capacity??p.quantity)+'"></label><label>Posti assegnati fuori dal sito<input name="external_reserved" type="number" min="0" max="'+D.esc(draft?.capacity??p.quantity)+'" step="1" required value="'+D.esc(draft?.external_reserved??p.external_reserved??0)+'"></label></div><div class="ev-actions"><button type="submit">Aggiorna disponibilità</button></div></form>';}).join('');
 }
 async function initOwner(){
   $('eventCapacityForms')?.addEventListener('input',event=>{const form=event.target.form;if(!form)return;if(event.target.name==='capacity')form.elements.external_reserved.max=event.target.value;state.capacityDrafts[form.dataset.capacityPlace]={capacity:form.elements.capacity.value,external_reserved:form.elements.external_reserved.value,revision:Number(form.dataset.revision)};});
   $('eventCapacityForms')?.addEventListener('submit',event=>{event.preventDefault();const form=event.target;if(!form.reportValidity())return;if(state.dirty||state.placeDirty){message('Salva prima le modifiche dell’evento e dei posteggi.',true,'eventCapacityMessage');return;}action(event.submitter,async()=>{try{await rpc('set_event_capacity',{p_place_id:form.dataset.capacityPlace,p_quantity:Number(form.elements.capacity.value),p_external_reserved:Number(form.elements.external_reserved.value),p_revision:Number(form.dataset.revision)});delete state.capacityDrafts[form.dataset.capacityPlace];await loadWorkspace();message('Disponibilità aggiornata. Il sito mostra subito i posti liberi e Sold out quando sono esauriti.',false,'eventCapacityMessage');}catch(error){message(failure(error),true,'eventCapacityMessage');}});});
  for(const id of ['organizerProfileForm','organizerEventForm','eventPlaceForm'])bindValidation($(id));
  try{sessionStorage.setItem('_vp','1');}catch(_){}
  $('organizerSignIn').addEventListener('click',()=>openAuthModal('login','Accedi o registrati per creare il tuo profilo organizzatore.','nav_accedi'));
  $('newOrganizerEvent').addEventListener('click',()=>{if(!mayLeave())return;state.selected=null;fillEvent(null);$('eventEditorTitle').focus();$('eventEditor').scrollIntoView({block:'start',behavior:'smooth'});});
  $('closeEventEditor').addEventListener('click',()=>{if(!mayLeave())return;state.selected=null;state.dirty=false;state.placeDirty=false;$('eventEditor').hidden=true;});
  $('organizerProfileForm').addEventListener('input',()=>state.profileDirty=true);
  $('organizerEventForm').addEventListener('input',markEventDirty);$('organizerEventForm').addEventListener('change',markEventDirty);
  $('eventPlaceForm').addEventListener('input',()=>{state.placeDirty=true;renderReadiness();});
  $('organizerProfileForm').addEventListener('submit',event=>{event.preventDefault();if(!validateForm(event.target)||!mayLeave())return;const data=values(event.target);action(event.submitter,async()=>{await rpc('save_organizer_profile',{p_data:data,p_revision:state.data.profile?.revision??null});state.profileDirty=false;state.dirty=false;state.placeDirty=false;state.selected=null;await loadWorkspace();message('Profilo inviato. L’amministratore lo controllerà prima di renderlo pubblico.');});});
  $('organizerEventForm').addEventListener('submit',event=>{event.preventDefault();if(!validateForm(event.target))return;if(state.placeDirty&&!window.confirm('La tipologia di posteggio ha modifiche non salvate. Continuare senza salvarle?'))return;const location=state.picker.getValue(),data=values(event.target);data.region=location.regione;data.province=location.provincia;data.city=location.comune;data.sectors=new FormData(event.target).getAll('sectors');action(event.submitter,async()=>{const saved=await rpc('save_organizer_event',{p_id:state.selected,p_data:data,p_revision:selectedEvent()?.revision??null});state.selected=saved.id;state.dirty=false;state.placeDirty=false;await loadWorkspace();message('Bozza salvata. Aggiungi o controlla i posteggi, poi invia l’evento in revisione.');$('eventPlacesEditor').scrollIntoView({block:'nearest',behavior:'smooth'});});});
  $('eventPlaceForm').addEventListener('submit',event=>{event.preventDefault();if(!validateForm(event.target))return;if(state.dirty){message('Salva prima le modifiche ai dati dell’evento.',true,'eventPlacesMessage');return;}const data=values(event.target);data.price_cents=Math.round(Number(data.price)*100);data.quantity=Number(data.quantity);data.active=event.target.elements.active.checked;action(event.submitter,async()=>{await rpc('save_event_place',{p_event_id:state.selected,p_id:state.placeId,p_data:data,p_revision:selectedEvent().revision});state.placeDirty=false;await loadWorkspace();message('Posteggi salvati. L’evento è in bozza: invialo in revisione quando è pronto.');});});
  $('resetPlaceForm').addEventListener('click',()=>{if(state.placeDirty&&!window.confirm('Abbandonare le modifiche alla tipologia?'))return;resetPlace();$('placeDetails').open=true;});
  $('submitOrganizerEvent').addEventListener('click',event=>{if(state.dirty||state.placeDirty){message('Salva le modifiche prima di inviare l’evento.',true,'eventPlacesMessage');return;}const form=$('organizerEventForm'),today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());if(!validateForm(form))return;if(form.elements.start_date.value<today){fieldError(form.elements.start_date,'La data di inizio è già passata. Scegli una data da oggi in poi.');form.elements.start_date.focus();return;}if([...form.elements.participation_rules.value.trim()].length<20){fieldError(form.elements.participation_rules,'Descrivi come partecipare in almeno 20 caratteri, poi salva la bozza.');form.elements.participation_rules.focus();return;}if(!selectedEvent().places.some(place=>place.active)){message('Aggiungi almeno una tipologia di posteggio prima di inviare.',true,'eventPlacesMessage');$('placeDetails').open=true;$('eventPlaceForm').elements.label.focus();return;}action(event.target,async()=>{await rpc('submit_organizer_event',{p_id:state.selected,p_revision:selectedEvent().revision});await loadWorkspace();message('Evento inviato. Sarà visibile nel calendario dopo l’approvazione dell’amministratore.');});});
  $('organizerApp').addEventListener('click',event=>{const edit=event.target.closest('[data-event-edit]'),cancel=event.target.closest('[data-event-cancel]'),place=event.target.closest('[data-place-edit]');if(edit){if(!mayLeave())return;state.selected=edit.dataset.eventEdit;fillEvent(selectedEvent());$('eventEditorTitle').focus();$('eventEditor').scrollIntoView({block:'start',behavior:'smooth'});}if(cancel){if(!mayLeave())return;if(!window.confirm('Ritirare l’evento? Non sarà più visibile al pubblico e resterà conservato nella tua area.'))return;action(cancel,async()=>{const e=state.data.events.find(e=>e.id===cancel.dataset.eventCancel);await rpc('cancel_organizer_event',{p_id:e.id,p_revision:e.revision});state.dirty=false;state.placeDirty=false;await loadWorkspace();message('Evento ritirato. Puoi modificarlo e inviarlo nuovamente in revisione.');});}if(place){if(state.placeDirty&&!window.confirm('Abbandonare le modifiche alla tipologia?'))return;const p=selectedEvent().places.find(p=>p.id===place.dataset.placeEdit);state.placeId=p.id;fill($('eventPlaceForm'),{...p,price:(p.price_cents/100).toFixed(2)});$('placeFormTitle').textContent='Modifica: '+p.label;$('placeDetails').open=true;state.placeDirty=false;$('placeDetails').scrollIntoView({block:'nearest',behavior:'smooth'});}});
  window.addEventListener('beforeunload',event=>{if(state.dirty||state.placeDirty||state.profileDirty||Object.keys(state.capacityDrafts).length){event.preventDefault();event.returnValue='';}});
  _supabase.auth.onAuthStateChange((_event,session)=>{if(session?.user?.id!==state.userId){++state.epoch;state.data=null;window.dispatchEvent(new Event('organizer-session-reset'));$('organizerWorkspace').hidden=true;setTimeout(()=>loadWorkspace().catch(error=>message(failure(error),true)),0);}});
  try{await loadWorkspace();}catch(error){$('organizerLoading').hidden=true;message(failure(error),true);const retry=document.createElement('button');retry.type='button';retry.textContent='Riprova';retry.addEventListener('click',()=>action(retry,loadWorkspace));$('organizerLoading').after(retry);}
 }
 function organizerReviewHTML(p){const website=D.safeWebsite(p.website);return '<h3>'+D.esc(p.organization_name)+'</h3>'+D.badge(p.status)+'<dl class="ev-facts">'+[['Tipo',p.organization_type],['Referente privato',p.contact_name],['Telefono privato',p.private_phone],['Email pubblica',p.public_email],['Telefono pubblico',p.public_phone]].map(([k,v])=>'<dt>'+D.esc(k)+'</dt><dd>'+D.esc(v||'—')+'</dd>').join('')+'</dl><p class="ev-copy">'+D.esc(p.description)+'</p>'+(website?'<p><a href="'+D.esc(website)+'" target="_blank" rel="noopener noreferrer">Sito web dell’organizzatore ↗</a></p>':'')+(p.review_note?'<p class="ev-notice">Ultima nota: '+D.esc(p.review_note)+'</p>':'');}
 function closeReview(){if(adminBusy)return;$('eventReviewDialog').close();adminSelection=null;}
 function openReview(kind,id){const item=kind==='organizer'?adminData.organizers.find(p=>p.user_id===id):adminData.events.find(e=>e.id===id);if(!item)return;adminSelection={kind,item};$('eventReviewTitle').textContent=kind==='organizer'?'Revisione organizzatore':'Revisione evento';
  if(kind==='organizer')$('eventReviewBody').innerHTML=organizerReviewHTML(item);else{const p=adminData.organizers.find(p=>p.user_id===item.organizer_id);$('eventReviewBody').innerHTML=D.badge(item.status)+D.detailHTML({...item,organization_description:p?.description,...{website:p?.website,public_email:p?.public_email,public_phone:p?.public_phone}})+'<details><summary>Profilo e contatti del referente</summary>'+organizerReviewHTML(p)+'</details>';}
  if(kind==='event'&&item.status==='draft')$('eventReviewBody').insertAdjacentHTML('afterbegin','<p class="ev-notice">Questa è una bozza non ancora inviata. L’organizzatore deve aprirla nella propria area e premere «Invia evento in revisione». Solo dopo potrai approvarla.</p>');$('eventReviewNote').value='';message('',false,'eventReviewMessage');$('eventApprove').hidden=kind==='event'&&item.status!=='pending';$('eventApprove').disabled=kind==='event'&&item.organizer_status!=='approved';$('eventReject').hidden=kind==='organizer'&&item.status==='suspended';$('eventSuspend').hidden=kind!=='organizer'||item.status!=='approved';$('eventReviewDialog').showModal();
 }
 function adminCard(item,kind){const id=kind==='organizer'?item.user_id:item.id,draft=kind==='event'&&item.status==='draft';return '<article class="ea-row"><div><h3>'+D.esc(kind==='organizer'?item.organization_name:item.title)+'</h3>'+(kind==='event'?'<p>'+D.esc(D.dates(item))+' · '+D.esc(item.city)+' · '+D.esc(item.organization_name)+'</p>':'<p>'+D.esc(item.organization_type||'Organizzatore')+'</p>')+'</div>'+D.badge(item.status)+'<button type="button" data-admin-kind="'+kind+'" data-admin-id="'+D.esc(id)+'" aria-label="'+D.esc((draft?'Vedi bozza: ':'Apri revisione: ')+(kind==='organizer'?item.organization_name:item.title))+'">'+(draft?'Vedi bozza':'Apri revisione')+'</button></article>';}
 const adminNormalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it');
 function renderAdmin(){
  if(!adminData)return;
  const organizer=adminView.kind==='organizer',query=adminNormalize(adminView.search).trim();
  const rows=(organizer?adminData.organizers:adminData.events).filter(item=>(adminView.status==='all'||item.status===adminView.status)&&(!query||adminNormalize([item.title,item.organization_name,item.city,item.province,item.region].filter(Boolean).join(' ')).includes(query)));
  const rank={pending:0,rejected:1,draft:2,published:3,approved:3,suspended:4,cancelled:5};
  rows.sort((a,b)=>(rank[a.status]??6)-(rank[b.status]??6)||String(a.start_date||'').localeCompare(String(b.start_date||''))||String(a.organization_name||a.title).localeCompare(String(b.organization_name||b.title),'it'));
  adminView.page=Math.min(adminView.page,Math.max(0,Math.ceil(rows.length/adminPageSize)-1));
  const offset=adminView.page*adminPageSize;
  for(const kind of ['event','organizer']){
   const active=kind===adminView.kind,tab=$(kind==='event'?'adminEventTab':'adminOrganizerTab');
   tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
   $(kind==='event'?'adminEventDetails':'adminOrganizerDetails').hidden=!active;
   $(kind==='event'?'adminEventQueue':'adminOrganizerQueue').innerHTML=active?(rows.slice(offset,offset+adminPageSize).map(item=>adminCard(item,kind)).join('')||'<p class="ev-empty">'+(adminView.search||adminView.status!=='all'?'Nessun risultato. Prova a cambiare ricerca o stato.':organizer?'Nessun organizzatore.':'Nessun evento creato.')+'</p>'):'';
  }
  $('eventAdminPageInfo').textContent=rows.length?(offset+1)+'–'+Math.min(offset+adminPageSize,rows.length)+' di '+rows.length:'0 risultati';
  $('eventAdminPrevious').disabled=offset===0;$('eventAdminNext').disabled=offset+adminPageSize>=rows.length;
 }
 function selectAdminTab(kind,focus=false){
  adminView.kind=kind;adminView.page=0;
  // Conserva la ricerca; azzera solo uno stato incompatibile con la nuova scheda.
  const invalid=kind==='organizer'?['draft','published','cancelled']:['approved','suspended'];
  if(invalid.includes(adminView.status))adminView.status='all';
  for(const option of $('eventAdminFilter').options)option.hidden=invalid.includes(option.value);
  $('eventAdminFilter').value=adminView.status;renderAdmin();
  if(focus)$(kind==='event'?'adminEventTab':'adminOrganizerTab').focus();
 }
 function stopAdmin(){
  adminActive=false;adminIdentity=null;adminEpoch++;adminSession++;adminData=null;adminSelection=null;adminBusy=false;
  const root=$('eventAdminPanel');if(root){root.hidden=true;delete root.dataset.started;root.setAttribute('aria-busy','false');}
  for(const id of ['adminOrganizerQueue','adminEventQueue','eventReviewBody','eventAdminSummary','eventAdminPageInfo'])$(id)?.replaceChildren();
  for(const id of ['adminOrganizerCount','adminEventCount'])if($(id))$(id).textContent='0';
  Object.assign(adminView,{kind:'event',search:'',status:'all',page:0});
  if($('eventAdminWorkspace'))$('eventAdminWorkspace').open=false;
  if($('eventAdminSearch'))$('eventAdminSearch').value='';if($('eventAdminFilter'))$('eventAdminFilter').value='all';
  if($('eventReviewDialog')?.open)$('eventReviewDialog').close();if($('eventReviewNote'))$('eventReviewNote').value='';
  for(const button of $('eventReviewDialog')?.querySelectorAll('button')||[])button.disabled=false;
  message('',false,'eventAdminMessage');message('',false,'eventReviewMessage');
 }
 async function loadAdmin(){
  if(!adminActive)return;const epoch=++adminEpoch,session=adminSession,root=$('eventAdminPanel');root.setAttribute('aria-busy','true');message('',false,'eventAdminMessage');
  try{
   const data=await rpc('admin_event_workspace');if(!adminActive||epoch!==adminEpoch||session!==adminSession)return;
   if(!Array.isArray(data?.organizers)||!Array.isArray(data?.events))throw Error('Dati non disponibili. Riprova.');
   const firstLoad=!adminData;adminData=data;
   const pending=data.organizers.filter(p=>p.status==='pending').length,events=data.events.filter(e=>e.status==='pending').length,drafts=data.events.filter(e=>e.status==='draft').length;
   $('eventAdminSummary').textContent=pending+(pending===1?' profilo e ':' profili e ')+events+(events===1?' evento in revisione':' eventi in revisione')+(drafts?' · '+drafts+(drafts===1?' bozza non inviata':' bozze non inviate'):'');
   $('adminOrganizerCount').textContent=String(data.organizers.length);$('adminEventCount').textContent=String(data.events.length);
   if(firstLoad)selectAdminTab(pending&&!events?'organizer':'event');else renderAdmin();
  }catch(error){if(adminActive&&epoch===adminEpoch&&session===adminSession){message(failure(error),true,'eventAdminMessage');if(!adminData)$('eventAdminSummary').textContent='Caricamento non riuscito · apri per riprovare';}}
  finally{if(epoch===adminEpoch&&session===adminSession)root.setAttribute('aria-busy','false');}
 }
 async function review(actionName,button){
  if(!adminActive||adminBusy||!adminSelection)return;const {kind,item}=adminSelection,session=adminSession;adminBusy=true;
  const buttons=[...$('eventReviewDialog').querySelectorAll('button')].map(el=>[el,el.disabled]);buttons.forEach(([el])=>el.disabled=true);
  try{await rpc(kind==='organizer'?'review_organizer':'review_organizer_event',{p_id:kind==='organizer'?item.user_id:item.id,p_action:actionName,p_note:$('eventReviewNote').value,p_revision:item.revision});if(!adminActive||session!==adminSession)return;$('eventReviewDialog').close();adminSelection=null;await loadAdmin();if(adminActive&&session===adminSession)message('Revisione salvata.',false,'eventAdminMessage');}
  catch(error){if(adminActive&&session===adminSession)message(failure(error),true,'eventReviewMessage');}
  finally{if(session===adminSession){adminBusy=false;buttons.forEach(([el,disabled])=>el.disabled=disabled);}}
 }
 function startAdmin(userId){
  const root=$('eventAdminPanel');if(!root||root.dataset.started)return;root.dataset.started='true';root.hidden=false;adminActive=true;adminIdentity=userId||null;adminSession++;
  if(!root.dataset.bound){
   root.dataset.bound='true';$('eventAdminRefresh').addEventListener('click',()=>loadAdmin());
   root.addEventListener('click',event=>{const button=event.target.closest('[data-admin-id]');if(adminActive&&button)openReview(button.dataset.adminKind,button.dataset.adminId);});
   root.addEventListener('click',event=>{const tab=event.target.closest('[data-admin-tab]');if(adminActive&&tab)selectAdminTab(tab.dataset.adminTab);});
   root.querySelector('[role=tablist]').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    selectAdminTab(event.key==='Home'?'event':event.key==='End'?'organizer':adminView.kind==='event'?'organizer':'event',true);
   });
   $('eventAdminSearch').addEventListener('input',event=>{adminView.search=event.target.value;adminView.page=0;renderAdmin();});
   $('eventAdminFilter').addEventListener('change',event=>{adminView.status=event.target.value;adminView.page=0;renderAdmin();});
   $('eventAdminPrevious').addEventListener('click',()=>{adminView.page--;renderAdmin();});
   $('eventAdminNext').addEventListener('click',()=>{adminView.page++;renderAdmin();});
   $('eventReviewClose').addEventListener('click',closeReview);$('eventReviewDialog').addEventListener('cancel',event=>{event.preventDefault();closeReview();});
   $('eventApprove').addEventListener('click',event=>{if(adminSelection)review(adminSelection.kind==='organizer'?'approved':'published',event.target);});
   $('eventReject').addEventListener('click',event=>review('rejected',event.target));$('eventSuspend').addEventListener('click',event=>review('suspended',event.target));
   _supabase.auth.onAuthStateChange((_event,session)=>{if(adminActive&&(!session?.user?.id||(adminIdentity&&session.user.id!==adminIdentity)))stopAdmin();});
  }
  if(adminIdentity)loadAdmin();else{const session=adminSession;_supabase.auth.getUser().then(({data})=>{if(!adminActive||session!==adminSession)return;adminIdentity=data.user?.id||null;if(adminIdentity)loadAdmin();else stopAdmin();}).catch(()=>{if(adminActive&&session===adminSession)stopAdmin();});}
 }
 async function loadPublicProfile(userId){const el=$('publicOrganizer');if(!el)return;try{const [p,events]=await Promise.all([rpc('published_organizer_profile',{p_id:userId}),rpc('published_organizer_events',{p_organizer_id:userId})]);if(!p){el.hidden=true;return;}document.title=p.organization_name+' ? Organizzatore ? Subingresso.it';if($('profileName'))$('profileName').textContent=p.organization_name;if($('profileListingCount'))$('profileListingCount').textContent=events.length+(events.length===1?' evento pubblicato':' eventi pubblicati');const meta=$('metaDescProfilo');if(meta)meta.content=p.organization_name+': profilo organizzatore, eventi, date e informazioni per partecipare con il tuo banco.';el.innerHTML='<div class="ev-panel"><p class="ev-eyebrow">Organizzatore di eventi</p><h2>'+D.esc(p.organization_name)+'</h2><p class="ev-copy">'+D.esc(p.description)+'</p>'+D.contactsHTML(p)+'</div><section class="ev-panel"><h2>Eventi pubblicati</h2><div class="ev-list">'+(events.map(D.cardHTML).join('')||'<p class="ev-muted">Nessun evento pubblicato al momento.</p>')+'</div></section>';el.hidden=false;}catch(_){el.hidden=false;el.textContent='Le informazioni organizzatore non sono disponibili. Ricarica la pagina per riprovare.';}}
 window.EventOrganizers={startAdmin,stopAdmin,loadPublicProfile,profileHTML};
 if($('organizerApp')){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initOwner);else initOwner();}
})();
