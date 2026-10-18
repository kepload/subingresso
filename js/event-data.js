(function(root,factory){ const api=factory(); if(typeof module==='object'&&module.exports)module.exports=api; else root.EventData=api; })(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const statusLabels={pending:'In revisione',approved:'Approvato',rejected:'Da correggere',suspended:'Sospeso',draft:'Bozza',published:'Pubblicato',cancelled:'Ritirato'};
 const categories={tradizionale:'Fiera tradizionale',artigianato:'Artigianato e mostra mercato',sagra:'Sagra o festa',espositiva:'Fiera espositiva',mercatino:'Mercatino'};
 const sectors={alimentare:'Alimentare','non-alimentare':'Non alimentare',antiquariato:'Antiquariato e vintage',artigianato:'Artigianato'};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=c=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(c)/100);
 const date=d=>d?new Intl.DateTimeFormat('it-IT',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Rome'}).format(new Date(d+'T12:00:00Z')):'';
 const dates=e=>date(e.start_date)+(e.end_date!==e.start_date?' – '+date(e.end_date):'');
 const badge=s=>'<span class="ev-status" data-status="'+esc(s)+'">'+esc(statusLabels[s]||s)+'</span>';
 function split(cents){if(!Number.isSafeInteger(cents)||cents<0||cents>1000000000)throw Error('Importo non valido');const fee=Math.floor((cents*800+5000)/10000);return {total:cents,commission:fee,organizer:cents-fee};}
 function safeWebsite(url){ try {const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch(_){return '';}}
 function placesHTML(places){return '<div class="ev-list">'+(places||[]).filter(p=>p.active!==false).map(p=>'<article class="ev-card"><h3>'+esc(p.label)+'</h3><p><strong>'+esc(money(p.price_cents))+'</strong> per posteggio, per l’intero evento</p><p class="ev-muted">'+esc(p.quantity)+' posteggi previsti'+(p.width_m&&p.depth_m?' · '+esc(p.width_m)+' × '+esc(p.depth_m)+' m':'')+'</p>'+(p.description?'<p class="ev-copy">'+esc(p.description)+'</p>':'')+'</article>').join('')+'</div>';}
 function contactsHTML(p){ const website=safeWebsite(p.website);return '<div class="ev-actions">'+(p.public_email?'<a class="ev-button" href="mailto:'+esc(p.public_email)+'">Scrivi all’organizzatore</a>':'')+(p.public_phone?'<a class="ev-button" href="tel:'+esc(p.public_phone.replace(/[^\d+]/g,''))+'">'+esc(p.public_phone)+'</a>':'')+(website?'<a class="ev-button" href="'+esc(website)+'" target="_blank" rel="noopener noreferrer">Sito dell’organizzatore ↗</a>':'')+'</div>'; }
 function detailHTML(e){return '<section class="ev-panel"><div class="ev-eyebrow">'+esc(categories[e.category])+' · Evento dell’organizzatore</div><h1>'+esc(e.title)+'</h1><p><strong>'+esc(dates(e))+'</strong> · '+esc(e.city)+', '+esc(e.province)+'</p><p class="ev-muted">'+esc(e.venue)+(e.hours?' · '+esc(e.hours):'')+'</p><p class="ev-copy">'+esc(e.description)+'</p></section>'+
 '<section class="ev-panel"><h2>Partecipare con il tuo banco</h2><dl class="ev-facts"><dt>Settori ammessi</dt><dd>'+esc((e.sectors||[]).map(s=>sectors[s]).join(' · '))+'</dd>'+(e.goods?'<dt>Articoli e condizioni</dt><dd>'+esc(e.goods)+'</dd>':'')+(e.application_deadline?'<dt>Scadenza domande</dt><dd>'+esc(date(e.application_deadline))+'</dd>':'')+'</dl><p class="ev-copy">'+esc(e.participation_rules)+'</p></section>'+
 '<section class="ev-panel"><h2>Posteggi e tariffe</h2>'+placesHTML(e.places)+'<p class="ev-notice">Per partecipare, contatta l’organizzatore. Le prenotazioni e i pagamenti sul sito non sono ancora attivi. Le quantità indicano i posteggi previsti, non la disponibilità in tempo reale.</p></section>'+
 '<section class="ev-panel"><h2>'+esc(e.organization_name)+'</h2>'+(e.organization_description?'<p class="ev-copy">'+esc(e.organization_description)+'</p>':'')+contactsHTML(e)+'<p><a href="/profilo?id='+esc(e.organizer_id)+'">Vedi il profilo organizzatore →</a></p><p class="ev-muted">Informazioni fornite dall’organizzatore e pubblicate dopo revisione di Subingresso.it. Conferma condizioni e disponibilità prima di partecipare.</p></section>';}
 function cardHTML(e){return '<article class="ev-card"><div class="ev-eyebrow">'+esc(categories[e.category])+'</div><h3>'+esc(e.title)+'</h3><p>'+esc(dates(e))+' · '+esc(e.city)+'</p><p class="ev-muted">'+esc(e.organization_name)+'</p><a class="ev-button" href="/evento?id='+esc(e.id)+'">Vedi evento →</a></article>';}
 function toCalendar(e){const url='https://subingresso.it/evento?id='+encodeURIComponent(e.id);const months=[];for(let d=new Date(e.start_date+'T12:00:00Z'),end=new Date(e.end_date+'T12:00:00Z');d<=end;d.setUTCDate(d.getUTCDate()+1)){const m=d.getUTCMonth()+1;if(!months.includes(m))months.push(m);}
 const costs=(e.places||[]).map(p=>p.label+': '+money(p.price_cents)+' per posteggio per l’intero evento').join('; ');
 return {id:'organizzatore-'+e.id,managedEventId:e.id,region:e.region,province:e.province,city:e.city,name:e.title,category:e.category,months,
 lat:Number(e.latitude),lng:Number(e.longitude),venue:e.venue,organizer:e.organization_name,hours:e.hours,summary:e.description,
 sectors:e.goods||e.sectors.map(s=>sectors[s]).join(', '),merchandiseSectors:e.sectors,
 source:{url,label:'Informazioni dell’organizzatore, pubblicate dopo revisione',checkedAt:e.updated_at.slice(0,10)},
 editions:[{year:Number(e.start_date.slice(0,4)),start:e.start_date,end:e.end_date,dateType:'confirmed',sourceUrl:url}],
 participation:{type:'selected',note:e.participation_rules+' Per partecipare contatta l’organizzatore: prenotazioni online non ancora attive.',deadline:e.application_deadline||undefined,url,costs},
 contacts:{email:e.public_email,phone:e.public_phone},...(costs?{pricing:{label: 'Da '+money(Math.min(...e.places.map(p=>p.price_cents)))+' / intero evento',details:costs,period:e.start_date.slice(0,4),checkedAt:e.updated_at.slice(0,10),sourceUrl:url}}:{})};
 }
 return {esc,money,date,dates,badge,split,categories,sectors,safeWebsite,placesHTML,contactsHTML,detailHTML,cardHTML,toCalendar};
});
