(function(){
 'use strict';
 const root=document.querySelector('[data-event-inventory]');
 if(!root||!window.EventData||typeof _supabase==='undefined')return;
 let busy=false,request=0;
 async function refresh(){
  if(document.hidden||busy)return;busy=true;const epoch=++request;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   let query=_supabase.rpc('published_organizer_events',{p_id:root.dataset.eventInventory});if(typeof query.abortSignal==='function')query=query.abortSignal(controller.signal);
   const {data,error}=await query;
   if(epoch!==request||document.hidden)return;
   if(error)throw error;
   const event=data?.[0];
   if(!event){root.innerHTML='<h2>Partecipazione non disponibile</h2><p>L’evento non è più disponibile. Ricarica la pagina per verificarne lo stato.</p>';return;}
   const D=window.EventData;
   root.innerHTML='<h2>Posteggi e tariffe</h2>'+D.availabilityHTML(event.places)+D.placesHTML(event.places)+'<p class="ev-muted">Disponibilità basata sulle assegnazioni registrate. L’organizzatore aggiorna anche i posti assegnati fuori dal sito.</p><p class="ev-notice">Per partecipare, contatta l’organizzatore. Le prenotazioni e i pagamenti sul sito non sono ancora attivi.</p>';
  }catch(_){
   if(!root.querySelector('[data-availability-error]')){const message=document.createElement('p');message.className='ev-notice';message.dataset.availabilityError='';message.textContent='Aggiornamento non riuscito. La disponibilità mostrata potrebbe essere cambiata: ricarica la pagina o contatta l’organizzatore.';root.append(message);}
  }finally{clearTimeout(timer);busy=false;}
 }
 setInterval(refresh,30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
 window.addEventListener('focus',refresh);
 window.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
})();
