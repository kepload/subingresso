// Area acquisti privata. Nessuna cache persistente di ordini o ricevute.
window.VetrinaAccount = (() => {
    let days = 30, offset = 0, status = 'all', request = 0, data = null, charts = [], listings = [], authWatcher = false;
    const el = id => document.getElementById(id);
    const esc = value => escapeHTML(String(value ?? ''));
    const number = value => Number(value || 0).toLocaleString('it-IT');
    const money = (cents, currency = 'eur') => new Intl.NumberFormat('it-IT', { style:'currency', currency:currency.toUpperCase() }).format(Number(cents || 0) / 100);
    const date = value => value ? new Date(value).toLocaleDateString('it-IT', { day:'2-digit',month:'short',year:'numeric' }) : 'Non disponibile';
    const labels = { succeeded:'Pagato',pending:'In attesa di pagamento',failed:'Pagamento non completato',refunded:'Rimborsato' };
    const destroyCharts = () => { charts.forEach(chart => chart.destroy()); charts = []; };
    const field = (name, value) => `<div><dt>${name}</dt><dd>${esc(value)}</dd></div>`;
    const empty = text => `<div class="v-account-empty">${text}</div>`;

    async function load() {
        if (!_currentUser || !el('vetrinaAccountOrders')) return;
        const userId = _currentUser.id, seq = ++request;
        destroyCharts(); data = null;
        el('vetrinaAccountSummary').innerHTML = '';
        el('vetrinaAccountCampaigns').innerHTML = empty('Caricamento delle tue Vetrine…');
        el('vetrinaAccountOrders').innerHTML = empty('Caricamento degli ordini…');
        el('vetrinaAccountPages').innerHTML = '';
        try {
            const result = await _supabase.rpc('dashboard_vetrina_account', { p_days:days,p_offset:offset,p_status:status });
            if (seq !== request || _currentUser?.id !== userId) return;
            if (result.error || !result.data || result.data.error) throw new Error('load');
            data = result.data;
            if (offset && !data.orders.length && data.total) { offset = Math.floor((data.total - 1) / 50) * 50; return load(); }
            render();
        } catch {
            if (seq !== request || _currentUser?.id !== userId) return;
            el('vetrinaAccountCampaigns').innerHTML = '';
            el('vetrinaAccountOrders').innerHTML = '<div class="v-account-error" role="alert">Non siamo riusciti a caricare i tuoi acquisti. <button type="button" onclick="VetrinaAccount.load()">Riprova</button></div>';
        }
    }

    function render() {
        const summary = data.summary || {}, campaigns = data.campaigns || [];
        el('vetrinaAccountSummary').innerHTML = [
            ['Vetrine attive', number(campaigns.filter(c => c.active).length)],
            ['Ordini pagati', number(summary.paid_orders)],
            ['Totale pagato', money(summary.spent_cents)],
            ['Totale rimborsato', money(summary.refunded_cents)],
        ].map(([label,value]) => `<div><span>${label}</span><strong>${esc(value)}</strong></div>`).join('');
        el('vetrinaAccountCampaigns').innerHTML = campaigns.length ? campaigns.map((c,index) => {
            const state = c.active ? 'active' : c.waiting_days ? 'waiting' : 'ended';
            const label = c.active ? 'Attiva' : c.waiting_days ? 'In attesa di approvazione' : 'Conclusa / non attiva';
            return `<article class="v-account-campaign" id="vetrina-campaign-${esc(c.id)}">
                <div class="v-account-campaign-header"><div><h4>${esc(c.title || 'Annuncio non disponibile')}</h4>
                <p>${c.active ? `Promozione fino al ${esc(date(c.featured_until))} · ${Math.max(1,Math.ceil((new Date(c.featured_until) - Date.now()) / 86400000))} giorni rimanenti`
                    : c.waiting_days ? `${number(c.waiting_days)} giorni acquistati. La durata parte dall’approvazione.` : 'Lo storico e i risultati rilevati restano consultabili.'}</p></div><span class="v-account-pill ${state}">${label}</span></div>
                <div class="v-account-metrics">${[['Apparizioni',c.impressions],['Visite',c.detail_views],['Azioni di contatto',c.contact_actions]].map(([l,v]) => `<div><span>${l}</span><strong>${number(v)}</strong></div>`).join('')}</div>
                ${(c.daily || []).length ? `<div class="v-account-chart"><canvas id="vetrina-chart-${index}" role="img" aria-label="Andamento giornaliero delle apparizioni, visite e azioni di contatto"></canvas></div>` : '<p>Nessun evento rilevato nel periodo selezionato.</p>'}
                <div class="v-account-actions">${c.available ? `<a href="/annuncio?id=${encodeURIComponent(c.id)}">Vedi annuncio</a>` : '<span class="v-account-note">Annuncio rimosso: acquisti conservati.</span>'}
                ${c.available && c.status === 'active' ? `<button type="button" data-listing="${esc(c.id)}" onclick="VetrinaAccount.promote(this.dataset.listing)">${c.active ? 'Estendi la Vetrina' : 'Riattiva la Vetrina'}</button>` : ''}</div></article>`;
        }).join('') : empty('Non hai ancora acquistato una Vetrina. Promuovi un annuncio e segui qui i suoi risultati Premium.');
        el('vetrinaAccountOrders').innerHTML = data.orders.length ? data.orders.map(p => {
            const duration = { '10d':10,'30d':30,'90d':90 }[p.tier];
            const campaign = campaigns.find(c => c.id === p.listing_id_snapshot);
            let delivery = p.status === 'pending' ? 'Acquisto non confermato: nessuna Vetrina attivata.'
                : p.status === 'failed' ? 'Il pagamento non è stato completato.'
                : p.status === 'refunded' ? 'Pagamento rimborsato. I dettagli restano nello storico.'
                : !p.activated_at ? 'Giorni conservati in attesa di approvazione. Se l’annuncio è stato rifiutato o rimosso, contatta il supporto.'
                : p.promotion_starts_at && new Date(p.promotion_starts_at) > new Date() ? 'Rinnovo programmato dopo la Vetrina in corso.'
                : p.promotion_ends_at && new Date(p.promotion_ends_at) <= new Date() ? 'Periodo acquistato concluso.'
                : p.promotion_ends_at ? 'Periodo acquistato in corso.' : 'Acquisto precedente: date del periodo non disponibili.';
            return `<article class="v-account-order"><div class="v-account-order-header"><div><p class="v-account-order-id">Ordine ${esc(p.id)}</p><h4>${esc(p.listing_title || 'Annuncio non più disponibile')}</h4></div><span class="v-account-pill ${esc(p.status)}">${esc(labels[p.status] || 'In verifica')}${p.is_test ? ' · TEST' : ''}</span></div>
                <dl>${field('Vetrina',duration ? `${duration} giorni` : p.tier)}${field('Importo',money(p.amount_cents,p.currency))}${field('Ordine creato',date(p.created_at))}${field('Pagamento confermato',date(p.paid_at))}
                    ${field('Inizio promozione',date(p.promotion_starts_at))}${field('Fine promozione',date(p.promotion_ends_at))}${p.refunded_cents ? field('Importo rimborsato',money(p.refunded_cents,p.currency)) : ''}</dl>
                <p>${delivery}</p>${p.is_test ? '<p>Transazione di prova, esclusa dai totali economici.</p>' : ''}
                <div class="v-account-actions">${p.has_receipt ? `<button type="button" data-order="${esc(p.id)}" onclick="VetrinaAccount.receipt(this.dataset.order,this)"><i class="fas fa-receipt" aria-hidden="true"></i> Ricevuta Stripe</button>` : ''}
                ${campaign ? `<button type="button" data-listing="${esc(campaign.id)}" onclick="VetrinaAccount.results(this.dataset.listing)">Vedi risultati Premium</button>` : ''}
                <a href="/messaggi?support=1">Assistenza ordine</a></div>
                <details><summary>Registro dell’ordine</summary><ol>${(p.history || []).map(h => `<li>${esc(date(h.at))} · ${esc({created:'Ordine registrato',imported:'Ordine precedente conservato',activation:'Durata attivata',refund:'Rimborso registrato',payment:labels[h.status] || 'Stato aggiornato'}[h.kind] || 'Aggiornamento')}${h.kind === 'refund' ? ` · ${esc(money(h.refunded_cents,p.currency))}` : ''}</li>`).join('')}</ol></details></article>`;
        }).join('') : empty(status === 'all' ? 'Non ci sono ancora ordini nel tuo account.' : 'Nessun ordine con questo stato.');
        const total = Number(data.total || 0);
        el('vetrinaAccountPages').innerHTML = total > 50 ? `<button type="button" class="v-account-secondary" onclick="VetrinaAccount.page(-1)" ${offset === 0 ? 'disabled' : ''}>Precedenti</button><span>${Math.floor(offset / 50) + 1} / ${Math.ceil(total / 50)}</span><button type="button" class="v-account-secondary" onclick="VetrinaAccount.page(1)" ${offset + 50 >= total ? 'disabled' : ''}>Successivi</button>` : '';
        if (typeof Chart === 'function') campaigns.forEach((c,index) => {
            const canvas = el(`vetrina-chart-${index}`);
            if (!canvas) return;
            const rows = new Map(c.daily.map(row => [row.day,row])), dates = [];
            const today = new Date(); today.setUTCHours(0,0,0,0);
            for (let n = days - 1; n >= 0; n--) dates.push(new Date(today.getTime() - n * 86400000).toISOString().slice(0,10));
            charts.push(new Chart(canvas, { type:'line',data:{labels:dates.map(d => new Date(d+'T12:00:00Z').toLocaleDateString('it-IT',{day:'numeric',month:'short'})),datasets:[
                ['Apparizioni','impressions','#d97706'],['Visite','detail_views','#2563eb'],['Azioni','contact_actions','#059669'],
            ].map(([label,key,color]) => ({ label,data:dates.map(d => Number(rows.get(d)?.[key] || 0)),borderColor:color,backgroundColor:color,borderWidth:2,pointRadius:0,tension:0.2 }))},options:{ responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}},scales:{y:{beginAtZero:true,ticks:{precision:0}}} } }));
        });
    }

    async function promote(id) {
        if (!_currentUser) return;
        const userId = _currentUser.id;
        try {
            const result = await _supabase.from('annunci').select('id,titolo,status,featured,featured_until,expires_at').eq('user_id',userId).eq('id',id).maybeSingle();
            if (_currentUser?.id !== userId) return;
            if (result.error) throw new Error('query');
            if (!result.data || result.data.status !== 'active' || isListingExpired(result.data)) { showToast('La Vetrina richiede un annuncio attivo. Gestisci prima il tuo annuncio.','info'); return; }
            openVetrinaModal(result.data);
        } catch { showToast('Annuncio non disponibile. Riprova tra poco.','error'); }
    }
    async function chooseListing() {
        if (!_currentUser) return;
        const userId = _currentUser.id;
        try {
            const result = await _supabase.from('annunci').select('id,titolo,status,expires_at').eq('user_id',userId).eq('status','active').order('created_at',{ascending:false});
            if (_currentUser?.id !== userId) return;
            if (result.error) throw new Error('query');
            listings = (result.data || []).filter(l => !isListingExpired(l));
            let chooser = el('vetrinaAccountChooser');
            if (!chooser) { chooser = document.createElement('div'); chooser.id = 'vetrinaAccountChooser'; el('vetrinaAccountSummary').after(chooser); }
            chooser.innerHTML = `<div class="v-account-campaign"><h4>Scegli l’annuncio da promuovere</h4>${listings.length ? listings.map(l => `<div class="v-account-actions"><button type="button" data-listing="${esc(l.id)}" onclick="VetrinaAccount.promote(this.dataset.listing)">${esc(l.titolo || 'Annuncio')}</button></div>`).join('') : '<p>Pubblica o riattiva un annuncio per acquistare una Vetrina.</p><a class="v-account-secondary" href="/vendi">Pubblica un annuncio</a>'}<button type="button" class="v-account-secondary" onclick="document.getElementById('vetrinaAccountChooser').remove()">Chiudi</button></div>`;
            chooser.scrollIntoView({behavior:'smooth',block:'center'});
        } catch { showToast('Non siamo riusciti a caricare gli annunci. Riprova.','error'); }
    }

    async function receipt(id, button) {
        const userId = _currentUser?.id;
        // Apertura nel gesto dell'utente per evitare blocchi popup dopo il fetch.
        const popup = window.open('about:blank','_blank');
        if (popup) popup.opener = null;
        button.disabled = true;
        try {
            const { data: { session } } = await _supabase.auth.getSession();
            if (!session || session.user.id !== userId) throw new Error('Accedi di nuovo per vedere la ricevuta.');
            const response = await fetch(`${SUPABASE_URL}/functions/v1/payment-receipt`, { method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_ANON_KEY,Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({order_id:id}),signal:AbortSignal.timeout(15000) });
            const result = await response.json();
            if (_currentUser?.id !== userId) throw new Error('La sessione è cambiata.');
            if (!response.ok) throw new Error(result.error || 'Ricevuta non disponibile.');
            const url = new URL(result.url);
            if (url.protocol !== 'https:' || !['pay.stripe.com','receipt.stripe.com'].includes(url.hostname)) throw new Error('Ricevuta non disponibile.');
            if (popup) popup.location.href = url.href;
            else window.location.href = url.href;
        } catch (error) { if (popup) popup.close(); showToast(error.message || 'Riprova tra poco.','error'); }
        finally { button.disabled = false; }
    }
    const csv = value => {
        let text = String(value ?? '');
        if (/^[\s\uFEFF]*[=+@-]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g,'""') + '"';
    };
    async function exportOrders(button) {
        if (!_currentUser) return;
        const userId = _currentUser.id;
        button.disabled = true;
        try {
            const orders = [];
            for (let start = 0; ; start += 50) {
                const result = await _supabase.rpc('dashboard_vetrina_account',{p_days:days,p_offset:start,p_status:'all'});
                if (result.error || !result.data || _currentUser?.id !== userId) throw new Error('export');
                orders.push(...result.data.orders);
                if (start + 50 >= result.data.total || !result.data.orders.length) break;
            }
            const rows = [['Ordine','Annuncio','Giorni','Importo','Valuta','Stato','Rimborso','Creato','Pagato','Inizio','Fine','Test'],...orders.map(p => [p.id,p.listing_title,{'10d':10,'30d':30,'90d':90}[p.tier],(p.amount_cents/100).toFixed(2),p.currency,labels[p.status] || p.status,(p.refunded_cents/100).toFixed(2),p.created_at,p.paid_at,p.promotion_starts_at,p.promotion_ends_at,p.is_test?'Si':'No'])];
            const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(csv).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
            const link = document.createElement('a'); link.href = url; link.download = 'subingresso-ordini-vetrine.csv'; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
        } catch { showToast('Esportazione non riuscita. Riprova.','error'); }
        finally { button.disabled = false; }
    }
    function fillProfile(user) {
        if (!authWatcher && typeof _supabase.auth.onAuthStateChange === 'function') {
            authWatcher = true;
            _supabase.auth.onAuthStateChange((event,session) => {
                if (event === 'SIGNED_OUT' || (session?.user && session.user.id !== user.id)) {
                    request++; data = null; listings = []; destroyCharts();
                    ['vetrinaAccountOrders','vetrinaAccountCampaigns','vetrinaAccountSummary','vetrinaAccountPages'].forEach(id => { if (el(id)) el(id).innerHTML = ''; });
                    el('vetrinaAccountChooser')?.remove();
                    if (event === 'SIGNED_OUT') _currentUser = null;
                    else window.location.reload();
                }
            });
        }
        el('profileMemberSince').textContent = date(user.created_at);
        el('profileEmailStatus').textContent = user.email_confirmed_at ? 'Confermata' : 'Da confermare';
        el('profileLoginMethod').textContent = (user.app_metadata?.providers || ['email']).map(p => p === 'email' ? 'Email e password' : p.charAt(0).toUpperCase()+p.slice(1)).join(', ');
        el('profilePublicLink').href = '/profilo?id=' + encodeURIComponent(user.id);
    }
    async function resetPassword(button) {
        if (!_currentUser?.email) return;
        button.disabled = true;
        try {
            const result = await _supabase.auth.resetPasswordForEmail(_currentUser.email,{redirectTo:'https://subingresso.it/reset-password'});
            if (result.error) throw new Error('reset');
            el('profileSecurityMessage').textContent = 'Link inviato alla tua email. Controlla anche la cartella spam.';
        } catch { el('profileSecurityMessage').textContent = 'Invio non riuscito. Attendi un minuto e riprova.'; button.disabled = false; }
    }
    return { load,receipt,exportOrders,chooseListing,promote,fillProfile,resetPassword,
        setDays(value) { days = [7,30,90].includes(Number(value)) ? Number(value) : 30; load(); },
        setStatus(value) { status = ['all','succeeded','pending','failed','refunded'].includes(value) ? value : 'all'; offset = 0; load(); },
        page(delta) { offset = Math.max(0,offset + delta * 50); load(); },
        results(id) { el('vetrina-campaign-'+id)?.scrollIntoView({behavior:'smooth',block:'center'}); },
    };
})();
