// Conteggi aggregati: una sessione per evento, giorno e tipo di azione.
(function(){
 'use strict';
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const sent=new Set(),pending=new Set();let identity=0,session='',credentials=null;
 try{session=sessionStorage.getItem('_event_stats_session')||'';if(!uuid.test(session)){session=crypto.randomUUID();sessionStorage.setItem('_event_stats_session',session);}}catch(_){try{session=crypto.randomUUID();}catch(_){return;}}
 function source(inCalendar){
  if(inCalendar)return 'calendar';try{if(!document.referrer)return 'direct';const ref=new URL(document.referrer);if(ref.origin!==location.origin)return 'external';if(/^\/fiere(?:\/|\.html|$)/.test(ref.pathname))return 'calendar';if(/^\/profilo(?:\.html)?$/.test(ref.pathname))return 'profile';return 'site';}catch(_){return 'direct';}
 }
 async function track(id,metric,inCalendar=false){
  if(!uuid.test(id)||navigator.webdriver===true||typeof _supabase==='undefined')return;
  const key=identity+':'+id+':'+new Date().toISOString().slice(0,10)+':'+metric;if(sent.has(key)||pending.has(key))return;pending.add(key);const current=identity;
  try{
   if(window.AnalyticsIdentity&&!(await window.AnalyticsIdentity.context()).allowed)return;
   // Sessione locale: il server verifica il JWT ed esclude proprietario/amministratore.
   // La stessa lettura serve visita e clic, senza richieste auth durante l’uscita.
   if(!credentials)credentials=_supabase.auth.getSession();
   const result=await credentials;if(current!==identity)return;if(result.error){credentials=null;return;}
   const token=result.data?.session?.access_token;if(result.data?.session&&!token)return;
   // fetch keepalive conserva il clic anche quando apre mail, telefono o un altro sito.
   const response=await fetch(SUPABASE_URL+'/rest/v1/rpc/track_organizer_event',{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+(token||SUPABASE_ANON_KEY),'Content-Type':'application/json'},body:JSON.stringify({p_event_id:id,p_metric:metric,p_session:session,p_source:source(inCalendar),p_device:innerWidth<=767?'mobile':'desktop'}),keepalive:true});
   if(response.ok&&current===identity)sent.add(key);
  }catch(_){if(current===identity)credentials=null;}finally{pending.delete(key);}
 }
 function pageView(){const url=new URL(location.href);if(/^\/evento(?:\.html)?$/.test(url.pathname)&&document.querySelector('[data-event-inventory]'))track(url.searchParams.get('id')||'','view');}
 function calendarId(){const dialog=document.getElementById('fair-dialog');if(!dialog?.open)return '';return dialog.querySelector('[data-save-fair][data-fair-kind="organizer"]')?.dataset.fairId||'';}
 function init(){
  pageView();const dialog=document.getElementById('fair-dialog');if(dialog)new MutationObserver(()=>{const id=calendarId();if(id)track(id,'view',true);}).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('click',event=>{
   const link=event.target.closest('a[href]');if(!link)return;
   const calendar=!!link.closest('#fair-dialog'),id=calendar?calendarId():document.querySelector('[data-event-inventory]')?.dataset.eventInventory;if(!id)return;
   if(calendar?!link.closest('#detail-contacts'):!link.closest('main .ev-panel .ev-actions'))return;
   const href=link.getAttribute('href'),metric=href.startsWith('mailto:')?'email':href.startsWith('tel:')?'phone':link.target==='_blank'&&!calendar?'website':null;
   if(metric)track(id,metric,calendar);
  },{capture:true});
 }
 if(typeof _supabase!=='undefined')_supabase.auth.onAuthStateChange(()=>{++identity;credentials=null;sent.clear();pending.clear();setTimeout(pageView,0);});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
