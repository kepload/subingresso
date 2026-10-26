/* Raccolta admin separata: nessuna impressione o clic di prova. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=n=>Number(n||0).toLocaleString('it-IT'),ratio=(n,d)=>d?new Intl.NumberFormat('it-IT',{style:'percent',maximumFractionDigits:1}).format(n/d):'—';
 let owner=null,revision=0,request=0,previewRequest=0,data=null;
 function clear(){owner=null;++revision;++request;++previewRequest;data=null;for(const id of ['paListingInventory','paListingRows','paListingPreview'])$(id).replaceChildren();$('paListingPost').innerHTML='<option value="">Scegli un articolo</option>';$('paListingStatus').textContent='';$('paListingPreviewStatus').textContent='';$('paListingCount').textContent='';$('paListingExport').disabled=true;}
 async function api(action,extra,rev){
  const checked=await _supabase.auth.getUser();if(rev!==revision||checked.error||checked.data?.user?.id!==owner){if(rev===revision)clear();throw Error('La sessione è cambiata. Accedi di nuovo.');}
  const session=await _supabase.auth.getSession();if(rev!==revision||session.error||session.data?.session?.user?.id!==owner){if(rev===revision)clear();throw Error('Accesso da verificare. Riprova.');}
  const r=await fetch('/api/personal-ads?'+new URLSearchParams({action,...extra}),{headers:{Authorization:'Bearer '+session.data.session.access_token},cache:'no-store'}),result=await r.json();
  if(!r.ok){if((r.status===401||r.status===403)&&rev===revision)clear();throw Error(result.error||'Vetrine non disponibili. Riprova.');}return result;
 }
 function row(ad,metrics){
  const src=Array.isArray(ad.img_urls)?ad.img_urls.find(s=>typeof s==='string'&&/^https:\/\//i.test(s)):null;
  const location=[ad.comune,ad.regione].filter(Boolean).join(', '),title=ad.titolo||'Posteggio non più disponibile';
  return '<article class="pa-listing-row"><span class="pa-listing-thumb" aria-hidden="true">'+(src?'<img src="'+esc(src)+'" alt="" width="56" height="56" loading="lazy" onerror="this.hidden=true">':'')+'</span><div><a href="/annuncio?id='+encodeURIComponent(ad.id)+'" target="_blank" rel="noopener">'+esc(title)+'</a><small>'+esc(location)+(ad.active===undefined?'':ad.active?' · Vetrina attiva':' · Vetrina terminata o annuncio non attivo')+'</small></div><div class="pa-listing-values">'+(metrics?'<strong>'+number(metrics.clicks)+' clic</strong><small>'+number(metrics.impressions)+' impressioni</small>':'<small>Anteprima</small>')+'</div></article>';
 }
 function render(){
  const stats=data.stats,totals=stats.rows.reduce((a,r)=>({clicks:a.clicks+Number(r.clicks),impressions:a.impressions+Number(r.impressions)}),{clicks:0,impressions:0});
  const active=stats.listings.filter(a=>a.active).length;
  $('paListingCount').textContent='· '+number(active)+' attive';
  $('paListingStatus').textContent=(active?number(active)+' Vetrine attive. ':'Nessuna Vetrina Premium attiva: gli spazi restano nascosti nel blog. ')+number(totals.clicks)+' clic · '+number(totals.impressions)+' impressioni negli ultimi '+data.days+' giorni.';
  const all=[...stats.listings];for(const r of stats.rows)if(!all.some(a=>a.id===r.listing_id))all.push({id:r.listing_id,active:false});
  $('paListingInventory').innerHTML=all.map(ad=>row(ad,stats.rows.filter(r=>r.listing_id===ad.id).reduce((a,r)=>({clicks:a.clicks+Number(r.clicks),impressions:a.impressions+Number(r.impressions)}),{clicks:0,impressions:0}))).join('');
  $('paListingRows').innerHTML=stats.rows.length?stats.rows.map(r=>{const ad=all.find(a=>a.id===r.listing_id),post=data.posts.find(p=>p.slug===r.post_slug);return '<tr><td>'+esc(ad?.titolo||'Posteggio non più disponibile')+'<br><a href="/blog?post='+encodeURIComponent(r.post_slug)+'" target="_blank" rel="noopener">'+esc(post?.title||r.post_slug)+'</a></td><td>'+(r.placement==='blog_closing'?'In chiusura':'Nel testo')+'</td><td>'+number(r.impressions)+'</td><td>'+number(r.clicks)+'</td><td>'+ratio(r.measured_clicks,r.impressions)+'</td></tr>';}).join(''):'<tr><td colspan="5">Nessun evento misurato nel periodo.</td></tr>';
  const selected=$('paListingPost').value;$('paListingPost').innerHTML='<option value="">Scegli un articolo</option>'+data.posts.map(p=>'<option value="'+esc(p.slug)+'">'+esc(p.title)+'</option>').join('');if(data.posts.some(p=>p.slug===selected))$('paListingPost').value=selected;
  $('paListingExport').disabled=false;
 }
 async function load(){
  if(!owner)return;const seq=++request,rev=revision;$('paListingRefresh').disabled=true;$('paListingStatus').textContent='Aggiornamento delle Vetrine…';
  const days=$('paListingDays').value;
  try{const result=await api('listing-stats',{days},rev);if(rev!==revision||seq!==request)return;if(!Array.isArray(result.stats?.listings)||!Array.isArray(result.stats?.rows)||!Array.isArray(result.posts))throw Error('Risposta Vetrine non valida. Riprova.');data={...result,days};render();}
  catch(e){if(rev===revision&&seq===request)$('paListingStatus').textContent=e.message+(data?' I risultati mostrati sono quelli dell’ultimo aggiornamento.':'');}
  finally{if(seq===request)$('paListingRefresh').disabled=false;}
 }
 async function preview(){
  const post=$('paListingPost').value,seq=++previewRequest,rev=revision;$('paListingPreview').replaceChildren();
  if(!post){$('paListingPreviewStatus').textContent='Scegli un articolo per vedere le Vetrine pertinenti.';return;}
  $('paListingPreviewStatus').textContent='Preparo l’anteprima…';
  try{const result=await api('listing-preview',{post},rev);if(rev!==revision||seq!==previewRequest)return;
   const s=result.selection;if(!Array.isArray(s?.listings)||!Array.isArray(s?.regions))throw Error('Anteprima non valida. Riprova.');
   $('paListingPreviewStatus').textContent=(result.placement==='blog_closing'?'In chiusura':'Nel testo')+' · '+(s.regions.length?s.regions.join(', '):'Articolo nazionale')+'. '+(s.listings.length?'Selezione casuale tra Vetrine pertinenti.':'Nessuna Vetrina Premium pertinente: lo spazio rimane nascosto.');
   $('paListingPreview').innerHTML=s.listings.map(ad=>row(ad,null)).join('');
  }catch(e){if(rev===revision&&seq===previewRequest)$('paListingPreviewStatus').textContent=e.message;}
 }
 function csv(){if(!data)return;const cols=['listing_id','post_slug','placement','impressions','clicks','measured_clicks'],quote=v=>'"'+String(v??'').replaceAll('"','""')+'"',blob=new Blob(['\ufeff'+[cols.join(';'),...data.stats.rows.map(r=>cols.map(c=>quote(r[c])).join(';'))].join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vetrine-blog-'+data.days+'-giorni.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 window.addEventListener('personal-ads:ready',e=>{if(owner!==e.detail.owner){clear();owner=e.detail.owner;}load();});window.addEventListener('personal-ads:clear',clear);
 $('paListingRefresh').addEventListener('click',load);$('paListingDays').addEventListener('change',load);$('paListingPreviewButton').addEventListener('click',preview);$('paListingPost').addEventListener('change',()=>{++previewRequest;$('paListingPreview').replaceChildren();$('paListingPreviewStatus').textContent='';});$('paListingExport').addEventListener('click',csv);
})();
