(function () {
    'use strict';
    const labels={titolo:'Titolo da controllare',descrizione:'Descrizione da completare',contatto:'Nome contatto',telefono:'Telefono non valido',email:'Email non valida',stato:'Vendita/affitto',tipo:'Tipo posteggio',settore:'Settore',prezzo:'Prezzo fuori limiti',superficie:'Superficie',giorni:'Giorni/periodo',localita:'Comune, provincia o regione',dettagli:'Dettagli annuncio',fiera:'Nome/periodo fiera',foto:'Foto incoerenti',nome_mancante:'Nome mancante',nome:'Nome non valido',telefono_facoltativo:'Telefono facoltativo non inserito',alert_localita:'Località avviso da controllare'};
    const jobNames={'scout-bandi-daily':'Ricerca bandi','admin-anomaly-check':'Controllo anomalie','engagement-reminders':'Promemoria utenti','weekly-buyer-digest':'Riepilogo acquirenti','weekly-seller-stats':'Statistiche venditori','unfeature-expired-daily':'Scadenza Vetrine','auth-modal-opens-cleanup':'Conservazione eventi registrazione'};
    let owner=null,revision=0,detailRevision=0,offset=0,kind='all',snapshot=null,timer=null,exporting=false;
    const el=id=>document.getElementById(id);
    const safe=value=>escapeHTML(String(value??''));
    const count=value=>Number.isFinite(value)&&value>=0?value.toLocaleString('it-IT'):'—';
    const euro=value=>Number.isFinite(value)?(value/100).toLocaleString('it-IT',{style:'currency',currency:'EUR'}):'—';
    const date=value=>value&&!Number.isNaN(Date.parse(value))?new Date(value).toLocaleString('it-IT'):'Non disponibile';
    const validId=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value||'');
    function card(value,title,note,tone='') {return `<div class="acr-card" data-tone="${tone}"><strong>${safe(value)}</strong><span>${safe(title)}</span><small>${safe(note)}</small></div>`;}
    function state(message,error=false){el('acrState').textContent=message;el('acrState').dataset.state=error?'error':'ready';}
    function render(data){
        if(!data?.summary||!Array.isArray(data.issues)||!Array.isArray(data.automations))throw Error('Risposta incompleta');
        const s=data.summary;
        el('acrMetrics').innerHTML=[
            card(count(s.listings_with_issues),'Annunci da controllare',`${count(s.listings_checked)} annunci attivi o in revisione`,s.listings_with_issues?'warning':''),
            card(count(s.profiles_with_issues),'Profili da controllare',`${count(s.optional_phone_missing)} senza telefono facoltativo`,s.profiles_with_issues?'warning':''),
            card(count(s.pending_listings),'Annunci da approvare',`${count(s.pending_bandi)} bandi in attesa`,s.pending_listings?'warning':''),
            card(count(s.open_reports),'Segnalazioni aperte',`${count(s.support_unread)} messaggi supporto non letti`,s.open_reports?'warning':''),
            card(count(s.expiring_listings),'In scadenza entro 14 giorni',`${count(s.expired_listings)} annunci già scaduti`),
            card(euro(s.gross_cents-s.refunded_cents),'Incassi meno rimborsi',`Incassati ${euro(s.gross_cents)} · rimborsi ${euro(s.refunded_cents)}. Commissioni escluse.`),
            card(count(s.paid_waiting),'Vetrine pagate in attesa',`${count(s.paid_activation_problem)} attivazioni da verificare`,s.paid_activation_problem?'warning':''),
            card(count(s.new_users_30d),'Nuovi utenti · 30 giorni',`${count(s.new_listings_30d)} annunci · ${count(s.valuations_30d)} valutazioni`)
        ].join('');
        el('acrTasks').innerHTML=[['#pendingReviewSection','Moderazione annunci',s.pending_listings],['#reports','Segnalazioni',s.open_reports],['/messaggi','Supporto',s.support_unread],['#acrIssues','Qualità dati',data.issues_total],['#bandoScouting','Bandi da decidere',s.pending_bandi],['#acquisitionPanel','Provenienza utenti',null]].map(([href,label,n])=>`<a href="${href}">${label}${n===null?'':` · ${count(n)}`}</a>`).join('');
        el('acrIssues').innerHTML=data.issues.length?data.issues.map(row=>{
            const action=!validId(row.id)?'':row.kind==='annuncio'?`<a href="/modifica-annuncio?id=${row.id}">Controlla</a>`:row.kind==='profilo'?`<button type="button" data-user-id="${row.id}">Dettagli</button>`:'';
            return `<div class="acr-row" data-severity="${row.severity==='info'?'info':'warning'}"><div><div class="acr-row-title">${safe(row.label||'Dato da controllare')}</div><div class="acr-row-meta">${safe(row.kind)} · ${safe(row.context)}${row.status?' · '+safe(row.status):''}</div><div class="acr-tags">${(Array.isArray(row.issues)?row.issues:[]).map(issue=>`<span>${safe(labels[issue]||issue)}</span>`).join('')}</div></div>${action}</div>`;
        }).join(''):'<p class="acr-note">Nessuna anomalia rilevata nei controlli automatici di questo gruppo.</p>';
        el('acrPageInfo').textContent=data.issues_total?`${offset+1}–${Math.min(offset+25,data.issues_total)} di ${count(data.issues_total)} record`:'0 record';
        el('acrQualitySummary').textContent=`Apri elenco · ${count(data.issues_total)} record da verificare`;
        el('acrPrevious').disabled=offset===0;el('acrNext').disabled=offset+25>=data.issues_total;
        el('acrJobs').innerHTML=data.automations.map(job=>{
            const stale=job.last_started_at&&Date.now()-Date.parse(job.last_started_at)>(job.jobname.startsWith('weekly-')?8:2)*86400000;
            const error=!job.active||job.last_status==='failed'||stale;
            const status=!job.active?'Disattivata':!job.last_started_at?'Esecuzione non disponibile':job.last_status==='succeeded'?'Chiamata pianificata eseguita':job.last_status==='failed'?'Esecuzione fallita':'Esecuzione da verificare';
            return `<div class="acr-job" data-error="${!!error}"><b>${safe(jobNames[job.jobname]||job.jobname)}</b><br>${status}${stale?' · dato non recente':''}<br>Ultima esecuzione: ${safe(date(job.last_started_at))}</div>`;
        }).join('');
        el('acrCoverage').textContent=`${count(s.locations_loaded)} località nell’anagrafica. ${count(s.bando_subscribers)} iscrizioni agli avvisi bandi. Ultimo bando trovato: ${date(s.last_candidate)}. Ultimo controllo anomalie: ${date(s.last_anomaly_check)}. ${count(s.old_valuation_model)} valutazioni storiche con modello precedente. Le email confermate automaticamente dalla registrazione immediata non provano che l’indirizzo appartenga all’utente.`;
        state(`Aggiornato il ${date(data.checked_at)}. I record storici da controllare restano conservati; nessuna correzione automatica dei dati dichiarati.`);
    }
    async function refresh(){
        if(!owner)return;
        const requestedOwner=owner,request=++revision;
        el('acrRefresh').disabled=true;state('Controllo dati e automazioni in corso…');
        try{
            const {data,error}=await _supabase.rpc('admin_control_room',{p_offset:offset,p_kind:kind});
            if(request!==revision||owner!==requestedOwner)return;
            if(error||data?.error)throw error||Error(data.error);
            render(data);snapshot=data;
        }catch(_){if(request===revision&&owner===requestedOwner)state(`Impossibile aggiornare i dati. ${snapshot?'I valori mostrati risalgono al '+date(snapshot.checked_at)+'.':'Il controllo non è disponibile.'} Premi Aggiorna per riprovare.`,true);}
        finally{if(request===revision)el('acrRefresh').disabled=false;}
    }
    async function userDetails(id){
        if(!owner||!validId(id))return;
        const requestedOwner=owner,request=++detailRevision;
        const dialog=el('acrUserDialog');el('acrUserContent').textContent='Caricamento…';dialog.showModal();
        try{
            const {data,error}=await _supabase.rpc('admin_user_details',{p_user_id:id});
            if(owner!==requestedOwner||!dialog.open||request!==detailRevision)return;
            if(error||!data)throw Error('Profilo non disponibile');
            const rows=[['Nome',`${data.nome||''} ${data.cognome||''}`.trim()||'Non inserito'],['Email',data.email||'Non disponibile'],['Telefono',data.telefono||'Non inserito (facoltativo)'],['Iscritto dal',date(data.created_at)],['Ultimo accesso',date(data.last_sign_in_at)],['Conferma email nel sistema',data.supabase_confirmed_at?`${date(data.supabase_confirmed_at)}${data.verification_mode==='bypass'?' · automatica alla registrazione':' · metodo storico non ricostruibile'}`:'Non confermata'],['Annunci / avvisi / valutazioni',`${count(data.listings)} / ${count(data.alerts)} / ${count(data.valuations)}`],['Riepiloghi email',`Acquirente: ${data.email_digest===true?'attivo':data.email_digest===false?'disattivo':'non disponibile'} · Venditore: ${data.email_stats===true?'attivo':data.email_stats===false?'disattivo':'non disponibile'}`]];
            el('acrUserContent').innerHTML='<dl>'+rows.map(([key,value])=>`<dt>${safe(key)}</dt><dd>${safe(value)}</dd>`).join('')+'</dl><p class="acr-note">La conferma tecnica di Supabase e le preferenze email non attestano identità, possesso del recapito o consenso promozionale.</p>';
        }catch(_){if(owner===requestedOwner)el('acrUserContent').textContent='Impossibile caricare il profilo. Chiudi e riprova.';}
    }
    function csv(value){let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}
    async function exportIssues(){
        if(exporting||!owner)return;exporting=true;const requestedOwner=owner,filter=kind;el('acrExport').disabled=true;
        try{
            const rows=[['Tipo','ID','Descrizione','Contesto','Stato','Da controllare','Gravità'].map(csv).join(';')];
            let next=0,total=1,expectedTotal=null;
            while(next<total){
                const {data,error}=await _supabase.rpc('admin_control_room',{p_offset:next,p_kind:filter});
                if(owner!==requestedOwner)return;
                if(error||!data||!Array.isArray(data.issues))throw Error('Esportazione non disponibile');
                total=data.issues_total;
                if(!Number.isInteger(total)||total<0||(expectedTotal!==null&&total!==expectedTotal)||(next<total&&!data.issues.length))throw Error('Elenco cambiato durante l’esportazione');
                expectedTotal=total;
                data.issues.forEach(row=>rows.push([row.kind,row.id,row.label,row.context,row.status,(row.issues||[]).map(k=>labels[k]||k).join(', '),row.severity].map(csv).join(';')));
                if(!data.issues.length)break;next+=25;
            }
            const url=URL.createObjectURL(new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}));
            const link=document.createElement('a');link.href=url;link.download='subingresso-controllo-dati-'+new Date().toISOString().slice(0,10)+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        }catch(_){state('Esportazione non riuscita. Riprova: nessun file parziale è stato scaricato.',true);}
        finally{exporting=false;el('acrExport').disabled=false;}
    }
    function stop(){owner=null;revision++;detailRevision++;clearInterval(timer);timer=null;snapshot=null;['acrMetrics','acrTasks','acrIssues','acrJobs','acrCoverage','acrUserContent'].forEach(id=>{if(el(id))el(id).textContent='';});if(el('acrUserDialog')?.open)el('acrUserDialog').close();}
    window.AdminControlRoom={start(id){stop();owner=id;offset=0;kind='all';refresh();timer=setInterval(()=>{if(document.visibilityState==='visible'&&!el('acrRefresh').disabled)refresh();},60000);},refresh,stop};
    document.addEventListener('DOMContentLoaded',()=>{
        el('acrRefresh')?.addEventListener('click',refresh);
        el('acrFilter')?.addEventListener('change',event=>{kind=event.target.value;offset=0;refresh();});
        el('acrPrevious')?.addEventListener('click',()=>{offset=Math.max(0,offset-25);refresh();});
        el('acrNext')?.addEventListener('click',()=>{offset+=25;refresh();});
        el('acrExport')?.addEventListener('click',exportIssues);
        document.addEventListener('click',event=>{const button=event.target.closest('[data-user-id],[data-admin-user-details]');if(button)userDetails(button.dataset.userId||button.dataset.adminUserDetails);if(event.target.closest('a[href="#acrIssues"]'))el('acrQualityDetails').open=true;});
        el('acrUserClose')?.addEventListener('click',()=>{detailRevision++;el('acrUserDialog').close();});
        _supabase.auth.onAuthStateChange((_event,session)=>{if(owner&&session?.user?.id!==owner){stop();el('adminPanel')?.classList.add('hidden');}});
    });
})();
