// Anteprima privata: il server invia solo il template, Supabase applica le RLS.
window.ListingModeration = (() => {
    let authorizedUserId = null;
    let currentListing = null;
    let busy = false;

    function showUnavailable(message) {
        document.getElementById('detailLayout')?.classList.add('hidden');
        document.getElementById('mobileCta')?.classList.remove('visible');
        document.getElementById('moderationBar')?.remove();
        document.getElementById('moderationNotice')?.remove();
        document.getElementById('moderationRejectDialog')?.remove();
        const notFound = document.getElementById('notFound');
        if (!notFound) return;
        notFound.classList.remove('hidden');
        const text = notFound.querySelector('p');
        if (text) text.textContent = message;
        const link = notFound.querySelector('a');
        if (link) { link.href = '/dashboard'; link.textContent = 'Torna alla dashboard'; }
    }

    async function authorize() {
        const { data, error } = await _supabase.auth.getUser();
        if (error || !data?.user) {
            showUnavailable('Accedi con il tuo account admin per vedere l’anteprima.');
            return false;
        }
        const { data: profile, error: profileError } = await _supabase.from('profiles')
            .select('is_admin').eq('id', data.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.is_admin !== true) {
            showUnavailable('Questa anteprima è riservata agli amministratori.');
            return false;
        }
        authorizedUserId = data.user.id;
        return true;
    }

    function setBusy(value) {
        busy = value;
        document.querySelectorAll('[data-moderation-action]').forEach(button => {
            button.disabled = value || currentListing?.status !== 'pending';
        });
        document.getElementById('moderationBar')?.setAttribute('aria-busy', String(value));
    }

    async function decide(status, reason) {
        if (busy || !currentListing || currentListing.status !== 'pending') return;
        setBusy(true);
        try {
            if (!await authorize()) return;
            const patch = { status };
            if (status === 'rejected') {
                // Legge i dettagli aggiornati per conservare foto e altri dati.
                const { data, error } = await _supabase.from('annunci')
                    .select('dettagli_extra').eq('id', currentListing.id).eq('status', 'pending').maybeSingle();
                if (error) throw error;
                if (!data) throw new Error('L’annuncio è già stato moderato. Aggiorna la pagina.');
                let extra = data.dettagli_extra;
                if (typeof extra === 'string') extra = JSON.parse(extra);
                patch.dettagli_extra = { ...(extra && typeof extra === 'object' && !Array.isArray(extra) ? extra : {}), rejection_reason: reason };
            }
            // Il filtro evita di sovrascrivere una decisione presa in un'altra scheda.
            const { data, error } = await _supabase.from('annunci').update(patch)
                .eq('id', currentListing.id).eq('status', 'pending').select('id').maybeSingle();
            if (error) throw error;
            if (!data) throw new Error('L’annuncio è già stato moderato o non hai il permesso. Aggiorna la pagina.');
            currentListing.status = status;
            document.getElementById('moderationRejectDialog')?.close();
            const message = status === 'active'
                ? 'Annuncio approvato. Ora è visibile agli utenti.'
                : 'Annuncio rifiutato. Il venditore riceverà il motivo via email.';
            document.getElementById('moderationStatus').textContent = message;
            document.getElementById('moderationNotice').textContent = message;
            showToast(message, status === 'active' ? 'success' : 'info');
        } catch (error) {
            showToast(error.message || 'Operazione non riuscita. Riprova.', 'error');
        } finally {
            setBusy(false);
        }
    }

    function mount(listing) {
        if (!authorizedUserId) return;
        currentListing = listing;
        document.getElementById('mobileCta')?.classList.remove('visible');
        document.getElementById('relatedSection')?.classList.add('hidden');
        ['saveBtn', 'saveBtnMobile'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.style.display = 'none';
        });
        // In revisione le azioni commerciali lasciano spazio alla moderazione.
        ['chatBtn', 'whatsappBtn', 'contactBtn'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.style.display = 'none';
        });
        document.getElementById('contactInfo')?.classList.remove('hidden');
        if (listing.email) {
            const email = document.createElement('p');
            email.style.cssText = 'font-size:13px;overflow-wrap:anywhere';
            email.textContent = listing.email;
            document.getElementById('contactInfo')?.appendChild(email);
        }
        const style = document.createElement('style');
        style.textContent = `
            #moderationBar { position:fixed; bottom:0; left:0; right:0; z-index:60; background:white; border-top:1px solid #e2e8f0; box-shadow:0 -4px 20px #0f172a12; padding:12px 16px calc(12px + env(safe-area-inset-bottom)); }
            .moderation-inner { max-width:72rem; margin:auto; }
            #moderationStatus { font-size:12px; color:#64748b; font-weight:700; margin:0 0 8px; }
            .moderation-actions { display:flex; gap:10px; }
            .moderation-button { flex:1; min-height:48px; border-radius:14px; padding:12px; font-weight:800; font-size:14px; border:1px solid #e2e8f0; background:white; color:#dc2626; cursor:pointer; }
            .moderation-button.approve { background:#2563eb; border-color:#2563eb; color:white; }
            .moderation-button:disabled { opacity:.5; cursor:default; }
            #moderationNotice { background:#fffbeb; border:1px solid #fcd34d; color:#92400e; border-radius:16px; padding:16px; margin-bottom:24px; font-size:13px; font-weight:700; }
            #mainContent { padding-bottom:calc(150px + env(safe-area-inset-bottom)); }
            #moderationRejectDialog { width:calc(100% - 32px); max-width:440px; max-height:calc(100dvh - 32px); overflow:auto; border:0; border-radius:24px; padding:24px; color:#0f172a; }
            #moderationRejectDialog::backdrop { background:#0f172ab8; }
            #moderationRejectDialog label { display:block; font-size:14px; font-weight:700; margin-bottom:8px; }
            #moderationRejectDialog select, #moderationRejectDialog textarea { width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:12px; margin-bottom:16px; font-size:16px; background:white; }
        `;
        document.head.appendChild(style);
        const notice = document.createElement('div');
        notice.id = 'moderationNotice';
        notice.textContent = 'Anteprima admin · Annuncio in attesa di approvazione, non visibile agli altri utenti.';
        document.getElementById('detailLayout').before(notice);
        const bar = document.createElement('div');
        bar.id = 'moderationBar';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'Moderazione annuncio');
        bar.innerHTML = `<div class="moderation-inner">
            <p id="moderationStatus" role="status"><a href="/dashboard" style="color:#2563eb">← Dashboard</a> · Revisione annuncio</p>
            <div class="moderation-actions">
                <button type="button" id="moderationReject" data-moderation-action class="moderation-button">Rifiuta</button>
                <button type="button" id="moderationApprove" data-moderation-action class="moderation-button approve">Approva</button>
            </div></div>`;
        document.body.appendChild(bar);
        const dialog = document.createElement('dialog');
        dialog.id = 'moderationRejectDialog';
        dialog.setAttribute('aria-labelledby', 'moderationRejectTitle');
        dialog.innerHTML = `<form id="moderationRejectForm">
            <h2 id="moderationRejectTitle" style="font-size:20px;font-weight:900;margin-bottom:12px">Rifiuta annuncio</h2>
            <p style="font-size:13px;color:#64748b;margin-bottom:20px">Indica il motivo: verrà comunicato al venditore.</p>
            <label for="moderationReason">Motivo del rifiuto</label>
            <select id="moderationReason" required>
                <option value="">Seleziona un motivo</option>
                <option>Descrizione insufficiente — l’annuncio è troppo vago o la descrizione è troppo breve.</option>
                <option>Dati mancanti — mancano informazioni essenziali come prezzo, comune o tipo di licenza.</option>
                <option>Fuori categoria — l’annuncio non riguarda posteggi mercatali o licenze ambulanti.</option>
                <option>Contenuto non appropriato o fuorviante.</option>
                <option>Annuncio duplicato — hai già un annuncio simile attivo.</option>
                <option value="altro">Altro motivo</option>
            </select>
            <div id="moderationCustomReason" hidden>
                <label for="moderationReasonText">Spiega il motivo</label>
                <textarea id="moderationReasonText" rows="3" maxlength="1000"></textarea>
            </div>
            <div class="moderation-actions">
                <button type="button" id="moderationCancel" class="moderation-button" style="color:#64748b">Annulla</button>
                <button type="submit" data-moderation-action class="moderation-button">Conferma rifiuto</button>
            </div></form>`;
        document.body.appendChild(dialog);
        document.getElementById('moderationApprove').addEventListener('click', () => decide('active'));
        document.getElementById('moderationReject').addEventListener('click', () => dialog.showModal());
        document.getElementById('moderationCancel').addEventListener('click', () => { if (!busy) dialog.close(); });
        dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
        document.getElementById('moderationReason').addEventListener('change', event => {
            const custom = event.target.value === 'altro';
            document.getElementById('moderationCustomReason').hidden = !custom;
            document.getElementById('moderationReasonText').required = custom;
        });
        document.getElementById('moderationRejectForm').addEventListener('submit', event => {
            event.preventDefault();
            const value = document.getElementById('moderationReason').value;
            const reason = value === 'altro' ? document.getElementById('moderationReasonText').value.trim() : value;
            if (!reason) { showToast('Scrivi il motivo del rifiuto.', 'warning'); return; }
            decide('rejected', reason);
        });
        if (listing.status !== 'pending') {
            const text = 'Questo annuncio è già stato moderato. Torna alla dashboard.';
            notice.textContent = text;
            document.getElementById('moderationStatus').textContent = text;
        }
        // Il ritorno alla dashboard resta disponibile anche dopo la decisione.
        const back = document.createElement('a');
        back.href = '/dashboard';
        back.className = 'inline-block text-blue-600 font-bold mb-4';
        back.textContent = '← Torna alla dashboard';
        notice.before(back);
        if (listing.video_url && /^https:\/\//i.test(listing.video_url)) {
            const video = document.createElement('video');
            video.controls = true;
            video.preload = 'metadata';
            video.src = listing.video_url;
            video.style.cssText = 'width:100%;border-radius:24px;background:#0f172a';
            document.getElementById('coverDiv')?.after(video);
        }
        setBusy(false);
        _supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || (session?.user && session.user.id !== authorizedUserId)) {
                authorizedUserId = null;
                currentListing = null;
                showUnavailable('Accedi con il tuo account admin per vedere l’anteprima.');
            }
        });
    }

    return { authorize, showUnavailable, mount };
})();
