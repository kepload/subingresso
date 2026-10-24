/* La raccolta arriva soltanto dall'API autorizzata. Nessun catalogo privato nel documento iniziale. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),site='https://subingresso.it';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=n=>Number(n||0).toLocaleString('it-IT'),money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(Number(n||0)/100);
 const percent=(n,d)=>d?new Intl.NumberFormat('it-IT',{style:'percent',maximumFractionDigits:1}).format(n/d):'—';
 const keys=['impressions','clicks','measured_clicks','converted_clicks','signups','listings','contacts','fairs','paid_orders','revenue_cents','refunded_cents'];
 let owner=null,revision=0,request=0,data=null,selected=null,goal='all',toastTimer,downloadController=null,downloadBusy=false;
 const sum=rows=>rows.reduce((a,r)=>{keys.forEach(k=>a[k]+=Number(r[k]||0));return a;},Object.fromEntries(keys.map(k=>[k,0])));
 function status(message,sticky=false){clearTimeout(toastTimer);$('paStatus').textContent=message;$('paStatus').hidden=false;if(!sticky)toastTimer=setTimeout(()=>$('paStatus').hidden=true,5000);}
 function clear(message){++revision;++request;owner=null;data=null;selected=null;downloadController?.abort();downloadBusy=false;$('paApp').hidden=true;$('paGate').hidden=false;$('paGateText').textContent=message;$('paLogin').hidden=true;$('paRetryGate').hidden=true;['paTotals','paList','paStatsRows','paAdMetrics','paPreviewFrame'].forEach(id=>$(id).replaceChildren());$('paCode').value='';$('paStatus').hidden=true;}
 function asset(ad,format,type){return '/images/personal-ads/'+ad.id+'-'+format.id+'.'+type;}
 function placement(){const value=$('paPlacement').value.trim();return /^[a-z0-9_-]{1,80}$/.test(value)?value:null;}
 function clickUrl(ad,format,position){return site+'/api/personal-ads?'+new URLSearchParams({action:'click',ad:ad.id,format:format.id,placement:position}).toString();}
 function embed(ad,format,position){return '<a href="'+esc(clickUrl(ad,format,position))+'" data-personal-ad="'+ad.id+'" data-pa-format="'+format.id+'" data-pa-placement="'+position+'" aria-label="'+esc(ad.title)+'"><img src="'+site+asset(ad,format,'png')+'" alt="'+esc(ad.title+' '+ad.cta+'. Subingresso.it')+'" width="'+format.width+'" height="'+format.height+'" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto"></a>';}
 function selectedAd(){return data?.ads.find(ad=>ad.id===selected);}
 function selectedFormat(){return data?.formats.find(f=>f.id===$('paFormat').value)||data?.formats[0];}
 function renderMetrics(){
  const totals=sum(data.stats.rows);
  $('paTotals').innerHTML=[['Impressioni',num(totals.impressions)],['Clic',num(totals.clicks)],['Conversioni',num(totals.converted_clicks)],['Incassi Vetrina',money(totals.revenue_cents)]].map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+value+'</dd></div>').join('');
  const rows=data.ads.map(ad=>({...ad,...sum(data.stats.rows.filter(r=>r.ad_id===ad.id))}));
  const converting=rows.filter(r=>r.converted_clicks>0).sort((a,b)=>b.converted_clicks-a.converted_clicks||b.clicks-a.clicks);
  const clicking=rows.filter(r=>r.clicks>0).sort((a,b)=>b.clicks-a.clicks);
  $('paFinding').textContent=converting.length?'Più conversioni rilevate: '+converting[0].id+' · '+num(converting[0].converted_clicks)+'. Confronta il dettaglio prima di scegliere.':clicking.length?'Più clic rilevati: '+clicking[0].id+' · '+num(clicking[0].clicks)+'. Nessuna conversione rilevata nel periodo.':'Le prime statistiche compariranno quando i banner verranno visti e cliccati. Le anteprime qui non producono eventi.';
  $('paStatsRows').innerHTML=data.stats.rows.length?data.stats.rows.map(r=>'<tr><td>'+esc(r.ad_id)+'<br><span class="pa-muted">'+esc(r.placement)+'</span></td><td>'+esc(r.format)+'</td>'+[num(r.impressions),num(r.clicks),percent(r.measured_clicks,r.impressions),num(r.converted_clicks),num(r.signups),num(r.listings),num(r.contacts),num(r.fairs),num(r.paid_orders),money(r.revenue_cents)].map(v=>'<td>'+v+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="12">Nessun dato raccolto per questo periodo. Nessun risultato storico è stato inventato.</td></tr>';
  $('paUpdated').textContent='Aggiornato '+new Date(data.stats.updated_at).toLocaleString('it-IT')+'. '+(data.stats.started_at?'Primi dati: '+new Date(data.stats.started_at).toLocaleDateString('it-IT')+'.':'Misurazione pronta; nessun evento ancora raccolto.');
 }
 function visibleAds(){const query=$('paSearch').value.trim().toLocaleLowerCase('it');return data.ads.filter(ad=>(goal==='all'||ad.goal===goal)&&(!query||(ad.title+' '+ad.description+' '+ad.id).toLocaleLowerCase('it').includes(query)));}
 function renderList(){
  const rows=visibleAds();$('paCount').textContent=rows.length+' di '+data.ads.length;
  if(rows.length&&!rows.some(ad=>ad.id===selected))selected=rows[0].id;
  $('paEditor').hidden=!rows.length;
  $('paList').innerHTML=rows.length?rows.map(ad=>{const stats=sum(data.stats.rows.filter(r=>r.ad_id===ad.id));return '<button type="button" class="pa-choice" data-ad="'+ad.id+'" aria-pressed="'+(ad.id===selected)+'"><img src="'+asset(ad,data.formats[0],'png')+'" alt="" width="64" height="54" loading="lazy"><span><strong>'+esc(ad.title)+'</strong><small>'+esc(ad.id)+' · <span class="pa-row-number">'+num(stats.clicks)+' clic</span> · '+num(stats.converted_clicks)+' conversioni</small></span></button>';}).join(''):'<p style="padding:16px">Nessuna ADS corrisponde alla ricerca. Prova un’altra parola o scegli Tutte.</p>';
  if(rows.length)renderEditor();
 }
 function renderEditor(){
  const ad=selectedAd(),format=selectedFormat();if(!ad||!format)return;
  if(!$('paPreview')){const img=document.createElement('img');img.id='paPreview';$('paPreviewFrame').append(img);}
  $('paAdTitle').textContent=ad.title;$('paAdOrigin').textContent=ad.id+' · '+ad.label+' · '+ad.origin;
  $('paPreview').src=asset(ad,format,'png');$('paPreview').alt=ad.title+' '+ad.description+' '+ad.cta;
  $('paPreview').width=format.width;$('paPreview').height=format.height;
  $('paDimensions').textContent=format.width+' × '+format.height+' px · anteprima adattata allo spazio';
  $('paAdNote').hidden=!ad.note;$('paAdNote').textContent=ad.note||'';
  const metrics=sum(data.stats.rows.filter(r=>r.ad_id===ad.id&&r.format===format.id));
  $('paAdMetrics').innerHTML=[['Clic · questa misura',num(metrics.clicks)],['CTR misurato',percent(metrics.measured_clicks,metrics.impressions)],['Conversioni / clic',percent(metrics.converted_clicks,metrics.clicks)],[ad.action,num(metrics[{vendi:'listings',compra:'contacts',fiere:'fairs'}[ad.goal]])]].map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+value+'</dd></div>').join('');
  for(const type of ['png','svg']){const link=$(type==='png'?'paPng':'paSvg');link.href=asset(ad,format,type);link.download=ad.id+'-'+format.id+'.'+type;}
  const position=placement();$('paCode').value=position?embed(ad,format,position):'Usa un nome posizione composto da lettere minuscole, numeri, trattini o underscore.';
  $('paCopyHtml').disabled=!position;$('paCopyLink').disabled=!position;
  $('paDestination').href=ad.destination;
 }
 async function load(){
  const seq=++request,rev=revision;$('paRefresh').disabled=true;$('paRetryGate').hidden=true;
  try{
   const checked=await _supabase.auth.getUser();if(seq!==request||rev!==revision)return;
   const user=checked.data?.user;
   if(!user){clear(checked.error?'Accesso da verificare. Accedi o riprova.':'Accedi con il tuo account amministratore per aprire la raccolta.');$('paLogin').hidden=false;$('paRetryGate').hidden=false;return;}
   const session=await _supabase.auth.getSession();if(seq!==request||rev!==revision)return;
   if(session.data?.session?.user?.id!==user.id)throw Error('La sessione è cambiata. Riprova.');
   const response=await fetch('/api/personal-ads?days='+$('paDays').value,{headers:{Authorization:'Bearer '+session.data.session.access_token},cache:'no-store'});
   const result=await response.json();if(seq!==request||rev!==revision)return;
   if(!response.ok){if(response.status===401||response.status===403){clear(result.error);$('paLogin').hidden=response.status!==401;return;}throw Error(result.error||'Raccolta non disponibile. Riprova.');}
   owner=user.id;data=result;selected=selected||data.ads[0]?.id;
   const current=$('paFormat').value;$('paFormat').innerHTML=data.formats.map(f=>'<option value="'+f.id+'">'+f.id+' · '+esc(f.label)+'</option>').join('');if(data.formats.some(f=>f.id===current))$('paFormat').value=current;
   $('paApp').hidden=false;$('paGate').hidden=true;renderMetrics();renderList();
  }catch(error){if(seq!==request||rev!==revision)return;if(data)status(error.message+' I dati visualizzati restano quelli dell’ultimo aggiornamento.',true);else{$('paGateText').textContent=error.message;$('paRetryGate').hidden=false;}}
  finally{if(seq===request)$('paRefresh').disabled=false;}
 }
 async function copy(value){try{await navigator.clipboard.writeText(value);status('Copiato.');}catch(_){$('paCode').value=value;const details=$('paCode').closest('details');details.open=true;$('paCode').focus();$('paCode').select();status('Selezione pronta: copia il testo con il comando del dispositivo.');}}
 function download(blob,name){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
 function exportCsv(){
  const columns=['ad_id','format','placement',...keys],quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  const body=[columns.join(';'),...data.stats.rows.map(r=>columns.map(c=>quote(r[c])).join(';'))].join('\r\n');
  download(new Blob(['\ufeff'+body],{type:'text/csv;charset=utf-8'}),'ads-risultati-'+$('paDays').value+'-giorni.csv');
 }
 // ZIP "store": nessuna dipendenza esterna, nomi UTF-8, CRC verificabile.
 const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 function crc(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
 function zip(files){
  const encoder=new TextEncoder(),body=[],central=[];let offset=0,centralSize=0;
  const record=(size,values)=>{const bytes=new Uint8Array(size),view=new DataView(bytes.buffer);for(const [at,value,width]of values)width===2?view.setUint16(at,value,true):view.setUint32(at,value,true);return bytes;};
  for(const file of files){const name=encoder.encode(file.name),bytes=typeof file.body==='string'?encoder.encode(file.body):file.body,checksum=crc(bytes);
   const local=record(30,[[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,checksum,4],[18,bytes.length,4],[22,bytes.length,4],[26,name.length,2]]);
   const entry=record(46,[[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,checksum,4],[20,bytes.length,4],[24,bytes.length,4],[28,name.length,2],[42,offset,4]]);
   body.push(local,name,bytes);central.push(entry,name);offset+=local.length+name.length+bytes.length;centralSize+=entry.length+name.length;
  }
  const end=record(22,[[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,centralSize,4],[16,offset,4]]);
  return new Blob([...body,...central,end],{type:'application/zip'});
 }
 async function pack(all){
  if(downloadBusy||!data)return;const position=placement();if(!position)return status('Correggi il nome della posizione prima di scaricare il pacchetto.');
  const rev=revision,ads=all?data.ads:[selectedAd()],formats=data.formats,files=[],jobs=[];downloadController=new AbortController();downloadBusy=true;
  $('paDownloadAll').disabled=true;$('paPack').disabled=true;let completed=0;
  for(const ad of ads)for(const format of formats)for(const type of ['png','svg'])jobs.push({ad,format,type});
  status('Preparo il pacchetto: 0 / '+jobs.length+' file…',true);
  try{
   async function worker(){while(jobs.length){const item=jobs.shift(),r=await fetch(asset(item.ad,item.format,item.type),{signal:downloadController.signal});if(!r.ok)throw Error('Un’immagine non è disponibile. Riprova il download.');const body=new Uint8Array(await r.arrayBuffer());if(rev!==revision)throw Error('Sessione cambiata.');files.push({name:item.ad.id+'/'+item.ad.id+'-'+item.format.id+'.'+item.type,body});status('Preparo il pacchetto: '+(++completed)+' / '+(ads.length*formats.length*2)+' file…',true);}}
   await Promise.all([worker(),worker(),worker(),worker()]);if(rev!==revision)return;
   for(const ad of ads){files.push({name:ad.id+'/codici-blog.txt',body:formats.map(f=>f.id+'\n'+embed(ad,f,position)).join('\n\n')});files.push({name:ad.id+'/link-tracciati.txt',body:formats.map(f=>f.id+'\n'+clickUrl(ad,f,position)).join('\n\n')});}
   files.push({name:'LEGGIMI.txt',body:'Subingresso.it — ADS personali\n'+ads.length+' messaggi, '+formats.length+' misure, PNG + SVG.\nPosizione: '+position+'\nIncolla codici-blog.txt nella modalità HTML di un articolo. Il tracciamento delle impressioni funziona nel blog di Subingresso.it. Altrove usa i link tracciati: i soli file scaricati non misurano le visualizzazioni.\nNessuna promessa di incassi o vendite. Le conversioni misurano azioni sul sito, non la compravendita di un posteggio.\n'});
   download(zip(files),all?'subingresso-20-ads.zip':ads[0].id+'-8-formati.zip');status('Pacchetto pronto: '+ads.length+' ADS in '+formats.length+' formati, PNG e SVG.');
  }catch(error){downloadController?.abort();if(rev===revision)status(error.name==='AbortError'?'Download interrotto. Riprova.':error.message,true);}
  finally{if(rev===revision){downloadBusy=false;$('paDownloadAll').disabled=false;$('paPack').disabled=false;}}
 }
 $('paFilters').addEventListener('click',event=>{const button=event.target.closest('[data-goal]');if(!button||!data)return;goal=button.dataset.goal;document.querySelectorAll('[data-goal]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderList();});
 $('paList').addEventListener('click',event=>{const button=event.target.closest('[data-ad]');if(!button)return;selected=button.dataset.ad;renderList();$('paList').querySelector('[data-ad="'+selected+'"]').focus({preventScroll:true});});
 $('paSearch').addEventListener('input',()=>{if(data)renderList();});$('paFormat').addEventListener('change',renderEditor);$('paPlacement').addEventListener('input',()=>{if(data)renderEditor();});
 $('paRefresh').addEventListener('click',load);$('paDays').addEventListener('change',load);$('paRetryGate').addEventListener('click',load);
 $('paLogin').addEventListener('click',()=>{window.__onLoginSuccess=load;window.openAuthModal('login');});
 $('paCopyHtml').addEventListener('click',()=>copy($('paCode').value));$('paCopyLink').addEventListener('click',()=>{const p=placement();if(p)copy(clickUrl(selectedAd(),selectedFormat(),p));});
 $('paPack').addEventListener('click',()=>pack(false));$('paDownloadAll').addEventListener('click',()=>pack(true));$('paExport').addEventListener('click',exportCsv);
 _supabase.auth.onAuthStateChange((event,session)=>{const next=session?.user?.id||null;if(event!=='TOKEN_REFRESHED'||(owner&&next!==owner)){clear(event==='SIGNED_OUT'?'Accedi con il tuo account amministratore.':'Verifica dell’accesso amministratore…');$('paLogin').hidden=!!next;setTimeout(load,0);}});
 window.addEventListener('pagehide',()=>downloadController?.abort());load();
})();
