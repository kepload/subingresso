(function () {
 'use strict';
 const root=document.getElementById('organizerAnalytics');if(!root)return;
 const $=id=>document.getElementById(id),esc=window.EventData.esc;
 const number=value=>new Intl.NumberFormat('it-IT',{useGrouping:'always',maximumFractionDigits:0}).format(Number(value)||0);
 const date=value=>new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(value));
 const sum=(rows,key)=>rows.reduce((total,row)=>total+(Number(row[key])||0),0);
 const ratio=(n,d)=>d?Math.max(0,Math.min(100,n/d*100)):0;
 const percent=(n,d)=>Math.round(ratio(n,d));
 let owner=null,events=[],days=30,selected='',metric='views',sort='views',data=null,epoch=0,controller=null,plot=null,loadedAt=null;
 function clearPlot(){plot?.destroy();plot=null;}
 function reset(){++epoch;controller?.abort();clearPlot();owner=null;data=null;loadedAt=null;events=[];selected='';root.hidden=true;$('oaContent').hidden=true;$('oaContent').innerHTML='';$('oaMessage').hidden=true;$('oaExport').disabled=true;}
 function delta(value,previous,complete){
  if(!complete)return '<span class="oa-delta">Storico in raccolta</span>';
  if(!previous)return '<span class="oa-delta">'+(value?'Prime attività nel periodo':'Come il periodo precedente')+'</span>';
  const change=Math.round((value-previous)/previous*100);
  return '<span class="oa-delta" data-direction="'+(change>0?'up':change<0?'down':'equal')+'">'+(change>0?'+':'')+change+'% <span>vs periodo precedente</span></span>';
 }
 function card(label,value,detail=''){
  return '<article class="oa-stat"><div class="oa-stat-top">'+label+'</div><strong>'+value+'</strong>'+detail+'</article>';
 }
 function activeEvents(){
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome'}).format(new Date(data.to));
  return data.events.filter(row=>data.profile_status==='approved'&&row.status==='published'&&row.end_date>=today);
 }
 function chart(){
  const rows=data.daily,total=sum(rows,metric),start=data.started_at.slice(0,10),measured=rows.filter(row=>row.day>=start);
  const peak=measured.reduce((best,row)=>!best||Number(row[metric])>Number(best[metric])?row:best,null);
  const label=metric==='views'?'Visite':'Clic sui contatti';
  return '<section class="oa-block oa-chart-block" aria-labelledby="oaChartTitle"><div class="oa-block-top"><div><h3 id="oaChartTitle">Interesse nel tempo</h3><p>'+(total&&peak?'Picco di '+number(peak[metric])+' '+(metric==='views'?'visite':'clic')+' il '+esc(date(peak.day+'T12:00:00Z')):'Attività giornaliera')+'</p></div><div class="oa-segments" role="group" aria-label="Dato del grafico"><button type="button" data-oa-metric="views" aria-pressed="'+(metric==='views')+'">Visite</button><button type="button" data-oa-metric="contacts" aria-pressed="'+(metric==='contacts')+'">Contatti</button></div></div><div id="oaPlot" class="oa-chart" aria-label="'+label+' giornalieri: '+number(total)+' nel periodo"></div>'+(!total?'<p class="oa-chart-empty">'+(measured.length?'Nessuna attività rilevata nel periodo.':'La rilevazione inizia da oggi.')+'</p>':'')+'<details class="oa-chart-data"><summary>Valori giornalieri</summary><div class="oa-scroll" tabindex="0" role="region" aria-label="Dati giornalieri"><table><caption class="oa-sr">Visite e contatti per giorno</caption><thead><tr><th scope="col">Giorno</th><th scope="col">Visite</th><th scope="col">Contatti</th></tr></thead><tbody>'+rows.map(row=>'<tr><th scope="row">'+esc(date(row.day+'T12:00:00Z'))+'</th><td>'+(row.day>=start?number(row.views):'—')+'</td><td>'+(row.day>=start?number(row.contacts):'—')+'</td></tr>').join('')+'</tbody></table></div></details></section>';
 }
 function drawChart(){
  clearPlot();if(!data||!$('oaPlot'))return;
  const rows=data.daily,values=rows.map(row=>row.day>=data.started_at.slice(0,10)?Number(row[metric])||0:null);
  const maximum=Math.max(0,...values.filter(value=>value!==null));
  // Counts use round integer ticks, with a full step of headroom above the peak.
  const raw=Math.max(1,maximum/3),magnitude=10**Math.floor(Math.log10(raw));
  const step=[1,2,5,10].map(n=>n*magnitude).find(n=>n>=raw),top=(Math.floor(maximum/step)+1)*step;
  const ticks=Array.from({length:Math.round(top/step)+1},(_,i)=>i*step);
  const element=$('oaPlot');
  plot=window.OrganizerCharts.line(element,{labels:rows.map(row=>date(row.day+'T12:00:00Z')),series:[{name:metric==='views'?'Visite':'Clic sui contatti',values}],format:number,yTicks:ticks,height:()=>element.clientHeight,ariaLabel:element.getAttribute('aria-label')});
 }
 function bars(items,total){
  return items.map(item=>'<div class="oa-bar-row"><div><span>'+esc(item.label)+'</span><strong>'+number(item.value)+'<small>'+percent(item.value,total)+'%</small></strong></div><div class="oa-bar-track" aria-hidden="true"><span style="width:'+ratio(item.value,total)+'%"></span></div></div>').join('');
 }
 function inventory(){
  const rows=activeEvents(),capacity=sum(rows,'capacity'),external=sum(rows,'external_reserved'),confirmed=sum(rows,'confirmed'),held=sum(rows,'held'),available=sum(rows,'available'),occupied=external+confirmed;
  const places=capacity>0&&capacity<=80?'<div class="oa-seat-map" aria-hidden="true">'+Array.from({length:capacity},(_,i)=>'<span'+(i<occupied?' data-assigned':i<occupied+held?' data-held':'')+'></span>').join('')+'</div><p class="oa-map-label">Un quadrato, un posteggio</p>':'';
  return '<section class="oa-block oa-capacity-block" aria-labelledby="oaCapacityTitle"><div class="oa-block-top"><div><h3 id="oaCapacityTitle">Posteggi della fiera</h3><p>'+number(rows.length)+' '+(rows.length===1?'evento attivo':'eventi attivi')+'</p></div></div><div class="oa-capacity-answer"><strong>'+number(available)+'</strong><span>liberi su '+number(capacity)+'</span><small>'+percent(occupied,capacity)+'% assegnati</small></div><div class="oa-capacity-track" role="img" aria-label="'+number(occupied)+' assegnati, '+number(held)+' in pagamento e '+number(available)+' liberi su '+number(capacity)+' posti"><span style="width:'+ratio(occupied,capacity)+'%"></span><span class="oa-held" style="width:'+ratio(held,capacity)+'%"></span></div>'+places+'<dl class="oa-inventory"><dt><i class="oa-dot" aria-hidden="true"></i>Assegnati fuori dal sito</dt><dd>'+number(external)+'</dd><dt><i class="oa-dot" aria-hidden="true"></i>Confermati online</dt><dd>'+number(confirmed)+'</dd><dt><i class="oa-dot" data-tone="held" aria-hidden="true"></i>In pagamento</dt><dd>'+number(held)+'</dd><dt><i class="oa-dot" data-tone="free" aria-hidden="true"></i>Posti liberi</dt><dd>'+number(available)+'</dd></dl>'+(!capacity?'<p class="oa-footnote">Nessun evento attivo con posteggi.</p>':'')+'<a class="oa-manage" href="#organizerEvents">Gestisci i tuoi eventi →</a></section>';
 }
 function eventTable(){
  const rows=[...data.events].sort((a,b)=>(Number(b[sort])||0)-(Number(a[sort])||0)||a.title.localeCompare(b.title,'it'));
  if(!rows.length)return '<section class="oa-block oa-event-block"><h3>Risultati per evento</h3><p class="oa-footnote">I risultati compariranno qui quando avrai creato il primo evento.</p></section>';
  const maximum=Math.max(0,...rows.map(row=>Number(row.views)||0));
  return '<section class="oa-block oa-event-block"><div class="oa-block-top"><h3>Risultati per evento</h3><label class="oa-sort">Ordina per<select id="oaSort"><option value="views"'+(sort==='views'?' selected':'')+'>Visite</option><option value="contacts"'+(sort==='contacts'?' selected':'')+'>Contatti</option><option value="saved"'+(sort==='saved'?' selected':'')+'>Salvataggi</option></select></label></div><div class="oa-scroll" tabindex="0" role="region" aria-label="Risultati per evento"><table><caption class="oa-sr">Attività nel periodo e situazione attuale per evento</caption><thead><tr><th scope="col">Evento</th><th scope="col">Visite</th><th scope="col">Contatti</th><th scope="col">Salvati ora</th><th scope="col">Posti assegnati</th></tr></thead><tbody>'+rows.map(row=>'<tr><th scope="row"><button type="button" class="oa-event-link" data-oa-event="'+esc(row.id)+'">'+esc(row.title)+'</button><span>'+esc(row.city)+' · '+esc(window.EventData.date(row.start_date))+'</span>'+window.EventData.badge(row.status)+'</th><td data-label="Visite">'+number(row.views)+'<div class="oa-event-bar" aria-hidden="true"><i style="width:'+ratio(row.views,maximum)+'%"></i></div></td><td data-label="Contatti">'+number(row.contacts)+'</td><td data-label="Salvati ora">'+number(row.saved)+'</td><td data-label="Posti assegnati"><strong>'+number(Number(row.external_reserved)+Number(row.confirmed))+' / '+number(row.capacity)+'</strong><span>'+number(row.available)+' liberi</span></td></tr>').join('')+'</tbody></table></div></section>';
 }
 function agenda(){
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Rome'}).format(new Date(data.to)),rows=activeEvents().sort((a,b)=>a.start_date.localeCompare(b.start_date));
  return '<section class="oa-block oa-agenda-block"><h3>Prossimi appuntamenti</h3><div class="oa-agenda">'+(rows.slice(0,3).map(row=>'<article><div class="oa-date-tile"><strong>'+esc(row.start_date.slice(8))+'</strong><span>'+esc(new Intl.DateTimeFormat('it-IT',{month:'short',timeZone:'UTC'}).format(new Date(row.start_date+'T12:00:00Z')))+'</span></div><div><a href="/evento?id='+esc(row.id)+'">'+esc(row.title)+'</a><p>'+esc(row.city)+' · '+(row.start_date<=today?'In corso':'tra '+Math.round((new Date(row.start_date+'T12:00:00Z')-new Date(today+'T12:00:00Z'))/86400000)+' giorni')+'</p>'+(row.application_deadline?'<small>Domande '+(row.application_deadline<today?'chiuse il ':'entro il ')+esc(window.EventData.date(row.application_deadline))+'</small>':'')+'</div></article>').join('')||'<p class="oa-footnote">Nessun evento pubblicato in programma.</p>')+'</div>'+'<a class="oa-manage" href="#organizerEvents">Tutti i tuoi eventi</a>'+'</section>';
 }
 function definitions(){
  return '<details class="oa-definitions"><summary>Come leggere queste statistiche</summary><p>Visite e clic sono rilevati dal '+esc(window.EventData.date(data.started_at.slice(0,10)))+'. Una sessione può contare una visita e un clic per tipo di contatto, evento e giorno. Le tue visite e quelle dell’amministratore autenticato sono escluse. I clic non dimostrano l’invio di una domanda, una telefonata o una partecipazione.</p><p>Il periodo comprende oggi e i '+(days-1)+' giorni precedenti, in UTC. Il confronto usa gli stessi giorni e la stessa ora del periodo precedente; appare quando entrambi i periodi sono interamente misurati. I giorni precedenti alla rilevazione sono indicati con un trattino.</p><p>Salvataggi e avvisi sono conteggi attuali, al netto delle rimozioni. L’occupazione riguarda gli eventi pubblicati non conclusi: somma i posti assegnati fuori dal sito e quelli confermati online, esclude i blocchi di pagamento e le tipologie disattivate. I quadrati rappresentano il totale dei posteggi, non la loro posizione fisica. La tabella include anche gli eventi conclusi o in bozza. La provenienza è la pagina precedente disponibile nel browser; il dispositivo è stimato dalla finestra al momento della visita.</p><p>Le prenotazioni e i pagamenti eventi sono ancora disattivati. Le assegnazioni esterne non indicano incassi verificati. Nessun dato personale dei visitatori è mostrato.</p></details>';
 }
 function render(){
  if(!data)return;clearPlot();
  const t=data.totals,rows=data.events,saved=sum(rows,'saved'),reminders=sum(rows,'reminders'),complete=new Date(data.started_at)<=new Date(data.previous_from);
  $('oaRange').textContent=date(data.from)+' – '+date(data.to)+' '+new Date(data.to).getUTCFullYear()+' · UTC'+(loadedAt?' · aggiornato '+new Intl.DateTimeFormat('it-IT',{hour:'2-digit',minute:'2-digit'}).format(loadedAt):'');
  const kpis='<div class="oa-kpis">'+card('Visite agli eventi',number(t.views),delta(t.views,t.previous_views,complete))+card('Clic sui contatti',number(t.contacts),delta(t.contacts,t.previous_contacts,complete))+card('Salvataggi attuali',number(saved),'<span class="oa-delta">Ancora nei preferiti</span>')+card('Avvisi richiesti',number(reminders),'<span class="oa-delta">Tra i salvataggi attuali</span>')+'</div>';
  const sources='<section class="oa-block"><h3>Da dove arrivano le visite</h3>'+bars([{key:'calendar',label:'Calendario fiere'},{key:'profile',label:'Profilo organizzatore'},{key:'site',label:'Altre pagine del sito'},{key:'external',label:'Siti e motori di ricerca'},{key:'direct',label:'Accesso diretto'}].map(source=>({label:source.label,value:data.sources.find(row=>row.source===source.key)?.views||0})),t.views)+'<div class="oa-device-line"><span>Mobile <strong>'+number(data.devices.find(row=>row.device==='mobile')?.views)+'</strong></span><span>Computer <strong>'+number(data.devices.find(row=>row.device==='desktop')?.views)+'</strong></span></div></section>';
  const contacts='<section class="oa-block"><h3>Come ti contattano</h3>'+bars([{label:'Email',value:t.email},{label:'Telefono',value:t.phone},{label:'Sito web',value:t.website}],t.contacts)+'<p class="oa-footnote oa-contact-rate">'+(t.views?(t.contacts/t.views*100).toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})+' clic ogni 100 visite':'In attesa delle prime visite')+'</p></section>';
  $('oaContent').innerHTML=kpis+'<div class="oa-lead">'+chart()+inventory()+'</div><div class="oa-secondary">'+sources+'<div class="oa-secondary-stack">'+contacts+agenda()+'</div></div>'+eventTable()+definitions();
  $('oaContent').hidden=false;$('oaExport').disabled=false;drawChart();
 }
 async function refresh(){
  if(!owner)return;const userId=owner,request=++epoch;controller?.abort();controller=new AbortController();const currentController=controller,timer=setTimeout(()=>currentController.abort(),15000);
  const previousData=data;data=null;root.setAttribute('aria-busy','true');$('oaExport').disabled=true;$('oaMessage').hidden=false;$('oaMessage').dataset.error='false';
  $('oaMessage').textContent='Aggiornamento delle statistiche…';
  if(!previousData){clearPlot();$('oaRange').textContent='';$('oaContent').hidden=false;$('oaContent').innerHTML='<div class="oa-skeleton" aria-hidden="true">'+Array.from({length:4},()=>'<div><span></span><strong></strong></div>').join('')+'</div>';}
  try{
   let query=_supabase.rpc('organizer_analytics',{p_days:days,p_event_id:selected||null});if(typeof query.abortSignal==='function')query=query.abortSignal(currentController.signal);
   const response=await Promise.race([query,new Promise((_,reject)=>currentController.signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}))]);
   if(request!==epoch||owner!==userId)return;if(response.error)throw response.error;
   if(!response.data?.totals||!Array.isArray(response.data.events)||!response.data.daily?.length||!response.data.started_at)throw Error('Dati non disponibili');
   data=response.data;loadedAt=new Date();$('oaMessage').hidden=true;render();
  }catch(error){
   if(request!==epoch||owner!==userId)return;
   data=null;clearPlot();$('oaContent').hidden=true;$('oaContent').innerHTML='';$('oaRange').textContent='';$('oaMessage').dataset.error='true';$('oaMessage').innerHTML='Statistiche non disponibili. <button type="button" data-oa-retry>Riprova</button>';
  }finally{clearTimeout(timer);if(request===epoch)root.setAttribute('aria-busy','false');}
 }
 function csv(){
  if(!data)return;const safe=value=>'"'+String(value??'').replace(/^[\s]*[=+\-@]|^[\t\r\n]/,match=>"'"+match).replace(/"/g,'""')+'"';
  const lines=[['Periodo',data.from,data.to],['Evento','Stato','Comune','Visite nel periodo','Clic nel periodo','Salvati ora','Avvisi richiesti ora','Capacità attuale','Assegnati esterni','Confermati online','In pagamento','Liberi ora'],...data.events.map(row=>[row.title,row.status,row.city,row.views,row.contacts,row.saved,row.reminders,row.capacity,row.external_reserved,row.confirmed,row.held,row.available]),[],['Giorno UTC','Visite','Clic'],...data.daily.map(row=>[row.day,row.day>=data.started_at.slice(0,10)?row.views:'',row.day>=data.started_at.slice(0,10)?row.contacts:''])];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(row=>row.map(safe).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='statistiche-eventi-'+new Date(data.to).toISOString().slice(0,10)+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 root.addEventListener('click',event=>{
  const tab=event.target.closest('[data-oa-days]'),toggle=event.target.closest('[data-oa-metric]'),eventButton=event.target.closest('[data-oa-event]');
  if(tab){days=Number(tab.dataset.oaDays);root.querySelectorAll('[data-oa-days]').forEach(button=>button.setAttribute('aria-pressed',String(button===tab)));refresh();}
  if(toggle){metric=toggle.dataset.oaMetric;render();root.querySelector('[data-oa-metric="'+metric+'"]').focus({preventScroll:true});}
  if(eventButton){selected=eventButton.dataset.oaEvent;$('oaEvent').value=selected;$('oaEvent').focus({preventScroll:true});refresh();root.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  if(event.target.closest('[data-oa-retry]'))refresh();
 });
 $('oaEvent').addEventListener('change',event=>{selected=event.target.value;refresh();});
 root.addEventListener('change',event=>{if(event.target.id==='oaSort'){sort=event.target.value;render();$('oaSort').focus({preventScroll:true});}});
 $('oaRefresh').addEventListener('click',refresh);$('oaExport').addEventListener('click',csv);
 window.addEventListener('organizer-workspace',event=>{
  const detail=event.detail;if(!detail?.userId){reset();return;}
  if(owner!==detail.userId){reset();owner=detail.userId;days=30;metric='views';sort='views';root.querySelectorAll('[data-oa-days]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.oaDays==='30')));}
  events=detail.events||[];if(selected&&!events.some(row=>row.id===selected))selected='';
  $('oaEvent').innerHTML='<option value="">Tutti gli eventi</option>'+events.map(row=>'<option value="'+esc(row.id)+'">'+esc(row.title)+'</option>').join('');$('oaEvent').value=selected;root.hidden=!detail.profile;
  if(detail.profile)refresh();
 });
 window.addEventListener('organizer-session-reset',reset);
})();
