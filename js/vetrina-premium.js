// One selection and one checkout for up to ten listings. No persistent cart.
window.VetrinaPremium = (() => {
    const $ = id => document.getElementById(id);
    const money = cents => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:2,useGrouping:'always'}).format(cents/100);
    const esc = text => escapeHTML(String(text ?? ''));
    let selected = new Set(), listings = [], tier = '30d', sequence = 0, busy = false, loaded = false;
    let owner = null, returnFocus = null, oldOverflow = '', target = null, lastTrigger = null;
    let source = 'dashboard', offerOptions = {};
    const track = (kind, extra = {}) => window.VetrinaJourney?.record(kind,{source,tier,count:selected.size,...extra});
    const current = () => typeof _currentUser !== 'undefined' ? _currentUser?.id : null;
    const valid = seq => seq === sequence && owner === current() && !$('vetrinaModal').classList.contains('hidden');

    function update() {
        const count = selected.size;
        const q = VetrinaPricing.quote(tier,Math.max(1,count));
        ['10d','30d','90d'].forEach(key => {
            const p = VetrinaPricing.plans[key];
            const planQuote = VetrinaPricing.quote(key,Math.max(1,count));
            $('tier'+key).setAttribute('aria-pressed',String(key===tier));
            $('tier'+key).disabled = busy;
            $('tier'+key).classList.toggle('has-cents',planQuote.unit%100!==0);
            $('premiumPrice'+key).textContent = planQuote.unit%100 ? money(planQuote.unit) : money(planQuote.unit).replace(',00','');
            $('premiumDaily'+key).textContent = money(planQuote.unit/p.days)+' / giorno';
        });
        $('premiumCount').textContent = count ? `${count} ${count===1?'annuncio selezionato':'annunci selezionati'}` : 'Seleziona i tuoi annunci';
        $('premiumTotal').textContent = money(count ? q.total : 0);
        $('premiumSubtotal').textContent = money(count ? q.listTotal : 0);
        $('premiumSaving').textContent = count>1 ? `−${q.discount}% · risparmi ${money(q.savings)}` : 'Nessuno sconto applicato';
        $('premiumSaving').classList.toggle('has-saving',count>1);
        $('premiumFooterSaving').textContent = count>1 ? `Pacchetto −${q.discount}% · risparmi ${money(q.savings)}` : count ? `${q.days} giorni di promozione` : '';
        $('premiumPerListing').textContent = count ? `${money(q.unit)} per annuncio · ${q.days} giorni ciascuno` : 'Da 1 a 10 annunci, stessa durata per tutti';
        $('premiumNext').textContent = count===1 && listings.length>1 ? 'Aggiungi un secondo annuncio e risparmia il 10%.'
            : count===2 && listings.length>2 ? 'Con 3 annunci, lo sconto passa al 15%.'
            : count>=3 && count<5 && listings.length>count ? 'Con 5 annunci, lo sconto passa al 20%.'
            : count>=5 ? 'Sconto massimo del pacchetto: 20%.' : 'Scegli gli annunci da promuovere insieme.';
        $('vetrinaCheckoutButton').disabled = busy || !loaded || !count || owner !== current();
        $('vetrinaCheckoutButton').textContent = busy ? 'Apertura pagamento…' : count>1 ? `Promuovi ${count} annunci · ${money(q.total)}` : count ? `Attiva Premium · ${money(q.total)}` : 'Seleziona almeno un annuncio';
        $('premiumListings').querySelectorAll('input').forEach(input => { input.disabled = busy || (!input.checked && count>=10); });
    }

    function selectTier(value) {
        if (!Object.hasOwn(VetrinaPricing.plans,value) || busy) return;
        tier = value; $('vetrinaLoadingMsg').textContent = ''; update();
        track('tier_select');
    }

    async function open(listing, options = {}) {
        if (!current()) { showToast('Accedi per promuovere i tuoi annunci.','info'); return; }
        if (!$('vetrinaModal').classList.contains('hidden')) close();
        returnFocus = document.activeElement;
        // Safari does not focus buttons on pointer clicks. Keep the actual opener.
        if (returnFocus === document.body && lastTrigger?.isConnected) returnFocus = lastTrigger;
        oldOverflow = document.body.style.overflow;
        owner = current(); target = listing?.id || null; listings = []; selected = new Set();
        offerOptions=options;source=['dashboard','email','account','analytics'].includes(options.source)?options.source:'dashboard';
        tier = Object.hasOwn(VetrinaPricing.plans,options.tier)?options.tier:'30d'; busy = false; loaded = false;
        $('vetrinaModal').classList.remove('hidden'); document.body.style.overflow = 'hidden';
        $('premiumListings').innerHTML = '<p class="premium-state" role="status">Caricamento dei tuoi annunci…</p>';
        $('vetrinaLoadingMsg').textContent = ''; $('vetrinaLoadingMsg').classList.remove('is-error');
        $('vetrinaModal').querySelector('[role="dialog"]').focus();
        $('vetrinaModal').querySelector('.premium-body').scrollTop = 0;
        update(); const seq = ++sequence;
        track('offer_open');
        try {
            const columns = 'id,user_id,titolo,status,comune,regione,img_urls,featured,featured_until,expires_at';
            let rows = [], offset = 0;
            for (;;) {
                const {data,error} = await _supabase.from('annunci').select(columns).eq('user_id',owner)
                    .eq('status','active').order('created_at',{ascending:false}).range(offset,offset+999);
                if (!valid(seq)) return;
                if (error) throw new Error('load');
                rows.push(...(data || []));
                if (!data || data.length<1000) break;
                offset += 1000;
            }
            listings = rows.filter(a => a.user_id===owner && a.status==='active' && (!a.expires_at || Date.parse(a.expires_at)>Date.now()));
            if (target && listings.some(a => a.id===target)) selected.add(target);
            if(Array.isArray(options.listingIds))for(const id of options.listingIds){if(selected.size<10&&listings.some(a=>a.id===id))selected.add(id);}
            if (!target && listings.length===1) selected.add(listings[0].id);
            if (target && !selected.size) $('vetrinaLoadingMsg').textContent = 'L’annuncio scelto non è più attivo. Seleziona un altro annuncio.';
            loaded = true;
            $('premiumListings').innerHTML = listings.length ? listings.map(a => {
                let src = Array.isArray(a.img_urls) ? a.img_urls[0] : null;
                try { if (!src || !/^https?:$/.test(new URL(src).protocol)) src=null; } catch { src=null; }
                if (src && typeof getOptimizedImageUrl === 'function') src=getOptimizedImageUrl(src,96);
                return `<label class="premium-listing"><input type="checkbox" value="${esc(a.id)}" ${selected.has(a.id)?'checked':''}><span class="premium-listing-image">${src?`<img src="${esc(src)}" alt="" width="48" height="48" loading="lazy">`:'<span aria-hidden="true">P</span>'}</span><span class="premium-listing-copy"><strong>${esc(a.titolo || 'Annuncio')}</strong><small>${esc([a.comune,a.regione].filter(Boolean).join(' · '))}${a.featured && Date.parse(a.featured_until)>Date.now()?' · Già in Vetrina: aggiungi giorni':''}</small></span></label>`;
            }).join('') : '<div class="premium-state"><p>Non hai annunci attivi da promuovere.</p><a href="/vendi">Pubblica un annuncio</a></div>';
            update();
        } catch {
            if (!valid(seq)) return;
            $('premiumListings').innerHTML = '<div class="premium-state" role="alert"><p>Non siamo riusciti a caricare i tuoi annunci.</p><button type="button" onclick="VetrinaPremium.retry()">Riprova</button></div>';
            update();
        }
    }

    function close() {
        if(!$('vetrinaModal').classList.contains('hidden'))track('offer_close');
        sequence++; busy = false; loaded = false; selected.clear(); listings=[];
        $('vetrinaModal').classList.add('hidden'); document.body.style.overflow = oldOverflow;
        if (returnFocus?.isConnected) returnFocus.focus();
    }

    async function checkout() {
        if (!loaded || busy || !selected.size || owner!==current()) return;
        const seq = sequence, userId = owner, ids = [...selected], q = VetrinaPricing.quote(tier,ids.length);
        busy = true; update(); $('vetrinaLoadingMsg').classList.remove('is-error'); $('vetrinaLoadingMsg').textContent = 'Preparazione del pagamento sicuro…';
        let redirecting = false;
        track('checkout_attempt');
        try {
            const {data:{session}} = await _supabase.auth.getSession();
            if (!valid(seq)) return;
            if (!session || session.user.id!==userId) throw new Error('Sessione scaduta. Accedi di nuovo prima di pagare.');
            const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
                method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token},
                body:JSON.stringify({annuncio_ids:ids,tier,expected_amount_cents:q.total}),signal:AbortSignal.timeout(20000)
            });
            const result = await response.json();
            if (!valid(seq)) return;
            if (!response.ok) throw new Error(result.error || 'Pagamento non disponibile. Riprova.');
            const url = new URL(result.url);
            if (url.protocol!=='https:' || url.hostname!=='checkout.stripe.com') throw new Error('Indirizzo di pagamento non disponibile.');
            redirecting = true; window.location.assign(url.href);
        } catch(error) {
            if (!valid(seq)) return;
            track('checkout_error');
            $('vetrinaLoadingMsg').classList.add('is-error');
            $('vetrinaLoadingMsg').textContent = error.name==='TimeoutError' ? 'Il pagamento tarda ad aprirsi. Riprova tra poco.' : error.message || 'Pagamento non disponibile. Riprova.';
        } finally {
            if (valid(seq) && !redirecting) { busy=false; update(); }
        }
    }

    document.addEventListener('click',event => {
        if (!event.target.closest('#vetrinaModal')) lastTrigger=event.target.closest('button,a');
    },true);
    document.addEventListener('change',event => {
        if (!event.target.matches('#premiumListings input[type="checkbox"]')) return;
        const input=event.target;
        if (busy || !listings.some(a => a.id===input.value)) return;
        if (input.checked && selected.size<10) selected.add(input.value);
        else { selected.delete(input.value); input.checked=false; }
        $('vetrinaLoadingMsg').textContent=''; update();
        track('listing_select');
    });
    document.addEventListener('keydown',event => {
        const modal=$('vetrinaModal'); if (!modal || modal.classList.contains('hidden')) return;
        if (event.key==='Escape') { event.preventDefault(); close(); return; }
        if (event.key!=='Tab') return;
        const controls=[...modal.querySelectorAll('button:not(:disabled),input:not(:disabled),a[href],summary')].filter(el=>el.getClientRects().length);
        const first=controls[0],last=controls.at(-1); if (!first) return;
        if (event.shiftKey && (document.activeElement===first || !controls.includes(document.activeElement))) { event.preventDefault();last.focus(); }
        else if (!event.shiftKey && (document.activeElement===last || !controls.includes(document.activeElement))) { event.preventDefault();first.focus(); }
    });
    document.addEventListener('DOMContentLoaded',() => {
        _supabase.auth.onAuthStateChange((_event,session) => {
            if (owner && session?.user?.id!==owner && !$('vetrinaModal').classList.contains('hidden')) close();
        });
    });
    return {open,close,checkout,selectTier,retry:()=>open(target?{id:target}:null,offerOptions)};
})();
