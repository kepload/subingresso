// Stato privato della chat: nessun testo o token aggiuntivo in storage.
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const PAGE = 50, SUPPORT = '__support_draft__';
    const MESSAGE_FIELDS = 'id,conversazione_id,mittente_id,testo,created_at,letto';
    const CONVERSATION_FIELDS = 'id,annuncio_id,created_at,acquirente_id,venditore_id,is_support,annuncio:annunci(id,titolo,img_urls,prezzo,stato,comune,tipo)';
    const state = {
        owner: null, user: null, epoch: 0, view: 0, booting: false, ready: false,
        conversations: new Map(), threads: new Map(), active: null, admin: false, adminId: null,
        inboxLoading: false, inboxError: '', hasMore: false, cursor: null, loadedMore: false, revision: 0,
        requests: new Set(), channel: null, typing: null, connected: false,
        refreshTimer: null, pollTimer: null, typingTimer: null, lastTyping: 0,
        seen: new Set(), readBusy: false, report: null, initialLink: false
    };
    let serial = 0, observer, authRevision = 0;
    const esc = value => escapeHTML(value);
    const context = () => ({ owner: state.owner, epoch: state.epoch });
    const current = ctx => Boolean(ctx.owner && ctx.owner === state.owner && ctx.epoch === state.epoch);
    const visible = thread => state.active === thread && document.visibilityState === 'visible' && !$('chatPanel').classList.contains('chat-mobile-hidden');
    const atBottom = () => $('messagesContainer').scrollHeight - $('messagesContainer').scrollTop - $('messagesContainer').clientHeight < 72;
    // Confronto lessicografico UTC conserva anche i microsecondi del cursore PostgreSQL.
    const stamp = value => String(value || '').replace('Z', '+00:00').replace(/(\.\d+)?\+00:00$/, (_, fraction) => '.' + (fraction || '.').slice(1).padEnd(6, '0'));
    const compare = (a, b) => stamp(a.created_at).localeCompare(stamp(b.created_at)) || String(a.id).localeCompare(String(b.id));
    const time = value => new Date(value).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const name = profile => formatFullName(profile?.nome, profile?.cognome) || 'Utente';
    const uuid = () => crypto.randomUUID();
    const stale = () => Object.assign(Error('La sessione è cambiata.'), { stale: true });

    function limited(promise, ms = 15000) {
        let timer;
        return Promise.race([promise, new Promise((_, reject) => {
            timer = setTimeout(() => reject(Object.assign(Error('La richiesta sta impiegando troppo tempo.'), { uncertain: true })), ms);
        })]).finally(() => clearTimeout(timer));
    }
    async function sessionFor(ctx) {
        const result = await limited(_supabase.auth.getSession());
        if (!current(ctx)) throw stale();
        if (result.error || result.data?.session?.user?.id !== ctx.owner || !result.data.session.access_token) {
            throw Object.assign(Error('Accedi di nuovo per continuare.'), { status: 401 });
        }
        return result.data.session.access_token;
    }
    async function request(path, options = {}, ctx = context()) {
        const token = options.token || await sessionFor(ctx);
        if (!current(ctx)) throw stale();
        const controller = new AbortController();
        state.requests.add(controller);
        const timer = setTimeout(() => controller.abort(), options.method === 'POST' ? 20000 : 15000);
        try {
            const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
                method: options.method || 'GET', signal: controller.signal,
                headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json', ...options.headers },
                ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {})
            });
            const body = response.status === 204 ? null : await response.json();
            if (!current(ctx)) throw stale();
            if (!response.ok) {
                const message = response.status === 401 ? 'Accedi di nuovo per continuare.'
                    : response.status === 403 ? 'Questa conversazione non è disponibile per il tuo account.'
                    : response.status === 429 ? 'Attendi un momento e riprova.' : 'Non siamo riusciti a completare la richiesta.';
                throw Object.assign(Error(message), { status: response.status, code: body?.code, uncertain: response.status >= 500 });
            }
            return body;
        } catch (error) {
            if (!current(ctx)) throw stale();
            if (!error.status) error.uncertain = true;
            if (error.name === 'AbortError') error.message = 'La connessione sta impiegando troppo tempo.';
            throw error;
        } finally {
            clearTimeout(timer); state.requests.delete(controller);
        }
    }
    const query = (table, params) => table + '?' + new URLSearchParams(params).toString();
    function notice(text, error = false) {
        $('chatConnectionText').textContent = text;
        $('chatConnection').dataset.error = String(error);
    }
    function connection() {
        notice(!navigator.onLine ? 'Sei offline. Potrai riprovare gli invii quando torni online.'
            : state.connected ? '' : 'Aggiornamento dei messaggi in corso…');
    }
    function unreadLabel(count) { return count > 99 ? '99+' : String(count); }
    function avatar(profile, support = false) {
        if (support) return '<span class="chat-avatar chat-support-avatar" aria-hidden="true">S</span>';
        const url = profile?.avatar_url;
        return '<span class="chat-avatar" aria-hidden="true">' + (url
            ? '<img src="' + esc(getOptimizedImageUrl(url, 96)) + '" alt="" loading="lazy" decoding="async">'
            : esc(name(profile).charAt(0).toUpperCase())) + '</span>';
    }
    function title(conv) { return conv.is_support ? (state.admin ? name(conv.other_profile) : 'Supporto Subingresso') : conv.annuncio?.titolo || 'Annuncio non disponibile'; }
    function price(listing) {
        if (!listing?.prezzo) return '';
        return '€ ' + Number(listing.prezzo).toLocaleString('it-IT') + (listing.stato === 'Affitto mensile' ? ' /anno' : '');
    }
    function ensureSupport() {
        if (state.admin || !state.adminId || [...state.conversations.values()].some(c => c.is_support && c.acquirente_id === state.owner)) {
            state.conversations.delete(SUPPORT); return;
        }
        state.conversations.set(SUPPORT, { id: SUPPORT, is_support: true, acquirente_id: state.owner,
            venditore_id: state.adminId, lastMessage: null, unread_count: 0, created_at: '' });
    }
    function renderInbox() {
        const list = $('convList'), scroll = list.scrollTop;
        const focused = list.contains(document.activeElement) ? document.activeElement.closest('[data-conversation]')?.dataset.conversation : null;
        const conversations = [...state.conversations.values()].sort((a, b) => {
            if (!state.admin && a.is_support !== b.is_support) return a.is_support ? 1 : -1;
            return compare(b.lastMessage || b, a.lastMessage || a);
        });
        list.innerHTML = conversations.map(conv => {
            const active = state.active?.id === conv.id || (conv.id === SUPPORT && state.active?.support && !state.active.id);
            const unread = Number(conv.unread_count) || 0, last = conv.lastMessage;
            const preview = last ? (last.mittente_id === state.owner ? 'Tu: ' : '') + last.testo
                : conv.is_support ? 'Hai bisogno di aiuto? Scrivici qui.' : 'Scrivi il primo messaggio.';
            const subtitle = conv.is_support ? (state.admin ? 'Richiesta di supporto' : 'Team Subingresso') : name(conv.other_profile);
            return `<button type="button" class="chat-conversation${active ? ' is-active' : ''}${unread ? ' is-unread' : ''}" data-conversation="${esc(conv.id)}" aria-current="${active ? 'true' : 'false'}">
                ${avatar(conv.other_profile, conv.is_support)}<span class="chat-conversation-copy"><span class="chat-conversation-top"><span class="chat-conversation-title">${esc(title(conv))}</span>
                ${last ? `<time datetime="${esc(last.created_at)}">${esc(new Date(last.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }))}</time>` : ''}</span>
                <span class="chat-conversation-person">${esc(subtitle)}</span><span class="chat-conversation-preview">${esc(preview)}</span></span>
                ${unread ? `<span class="chat-unread" aria-label="${unread} messaggi da leggere">${unreadLabel(unread)}</span>` : ''}</button>`;
        }).join('');
        if (!conversations.length && !state.inboxLoading) list.innerHTML = '<p class="chat-empty-list">Non hai ancora conversazioni. Puoi contattare un venditore dalla pagina del suo annuncio.</p>';
        $('inboxError').hidden = !state.inboxError;
        $('inboxErrorText').textContent = state.inboxError;
        $('chatListLoading').hidden = !state.inboxLoading || conversations.length > 0;
        $('chatLoadMoreConversations').hidden = !state.hasMore;
        $('chatLoadMoreConversations').disabled = state.inboxLoading;
        list.scrollTop = scroll;
        if (focused) list.querySelector('[data-conversation="' + CSS.escape(focused) + '"]')?.focus({ preventScroll: true });
    }
    async function loadInbox(more = false) {
        if (!state.owner || state.inboxLoading) return;
        const ctx = context(), revision = state.revision, cursor = more ? state.cursor : null;
        state.inboxLoading = true; state.inboxError = ''; renderInbox();
        try {
            const data = await request('rpc/get_chat_inbox', { method: 'POST', body: {
                p_limit: 40, p_before_at: cursor?.activity_at || null, p_before_id: cursor?.id || null
            } }, ctx);
            if (!Array.isArray(data?.items)) throw Error('Impossibile caricare le conversazioni.');
            state.admin = data.is_admin === true; state.adminId = data.support_admin_id || null;
            for (const conv of data.items) {
                const previous = state.conversations.get(conv.id);
                if (previous?.lastMessage && conv.lastMessage && compare(previous.lastMessage, conv.lastMessage) > 0) conv.lastMessage = previous.lastMessage;
                if (revision !== state.revision && previous) conv.unread_count = previous.unread_count;
                state.conversations.set(conv.id, conv);
                if (conv.lastMessage) state.seen.add(conv.lastMessage.id);
                const thread = state.threads.get(conv.id);
                if (thread) thread.conversation = conv;
            }
            // Conserva le pagine già caricate quando si aggiorna solo la prima.
            if (more || !state.loadedMore) {
                state.hasMore = data.has_more === true;
                state.cursor = data.items.at(-1) || state.cursor;
            }
            if (more) state.loadedMore = true;
            ensureSupport();
            if (revision !== state.revision) scheduleInbox();
        } catch (error) {
            if (!current(ctx)) return;
            state.inboxError = error.status === 401 ? error.message : 'Non riusciamo ad aggiornare le conversazioni. Riprova.';
        } finally {
            if (current(ctx)) { state.inboxLoading = false; renderInbox(); }
        }
    }
    function scheduleInbox() {
        clearTimeout(state.refreshTimer);
        const ctx = context();
        state.refreshTimer = setTimeout(() => { if (current(ctx)) loadInbox(); }, 250);
    }
    function makeThread(key, conversation = null) {
        if (state.threads.has(key)) return state.threads.get(key);
        const thread = { key, id: conversation?.id === SUPPORT ? null : conversation?.id || null, conversation,
            support: conversation?.is_support === true, listing: null, messages: new Map(), outbox: new Map(),
            draft: '', loaded: false, loading: false, syncing: false, olderBusy: false, hasOlder: false,
            error: '', scrollTop: null, newMessages: false, sending: false, readIds: new Set(), resolvePromise: null };
        state.threads.set(key, thread); return thread;
    }
    function saveComposer() { if (state.active) { state.active.draft = $('msgInput').value; state.active.scrollTop = $('messagesContainer').scrollTop; } }
    function selectThread(thread) {
        saveComposer(); ++state.view; stopTyping(); state.active = thread;
        $('chatEmpty').hidden = true; $('chatHeader').hidden = false; $('chatInputArea').hidden = false;
        $('messagesContainer').hidden = false;
        $('chatPanel').classList.remove('chat-mobile-hidden'); $('convPanel').classList.add('chat-mobile-hidden');
        $('msgInput').value = thread.draft; sizeComposer();
        renderHeader(thread); renderInbox(); renderMessages(thread, { initial: true }); updateComposer();
        updateHeadings();
        setupTyping(thread);
    }
    function renderHeader(thread) {
        const conv = thread.conversation, listing = conv?.annuncio || thread.listing;
        const support = thread.support;
        $('chatOtherName').textContent = conv ? title(conv) : listing?.titolo || 'Conversazione';
        if (support) $('chatHeaderMeta').textContent = state.admin ? 'Richiesta di supporto' : 'Team Subingresso';
        else {
            $('chatHeaderMeta').replaceChildren(document.createTextNode(name(conv?.other_profile || thread.otherProfile)));
            if (price(listing)) { const amount = document.createElement('span'); amount.className = 'chat-header-price'; amount.textContent = price(listing); $('chatHeaderMeta').append(document.createTextNode(' · '), amount); }
        }
        $('chatHeaderLink').href = support ? (state.admin && conv?.other_profile?.id ? '/profilo?id=' + encodeURIComponent(conv.other_profile.id) : '#')
            : listing?.id ? '/annuncio?id=' + encodeURIComponent(listing.id) : '#';
        const thumb = listing?.img_urls?.[0];
        $('chatHeaderThumb').innerHTML = support ? '<span class="chat-support-mark" aria-hidden="true">S</span>'
            : thumb ? '<img src="' + esc(getOptimizedImageUrl(thumb, 192)) + '" alt="" decoding="async">' : '<i class="fas fa-image" aria-hidden="true"></i>';
        $('chatKebabBtn').hidden = !thread.id || support;
    }
    async function openConversation(id) {
        const ctx = context(), view = ++state.view;
        if (!ctx.owner) return;
        try {
            let conv = state.conversations.get(id);
            if (!conv && id !== SUPPORT) {
                const rows = await request(query('conversazioni', { select: CONVERSATION_FIELDS, id: 'eq.' + id, limit: 1 }), {}, ctx);
                if (!current(ctx) || view !== state.view) return;
                conv = rows?.[0];
                if (!conv || (conv.acquirente_id !== ctx.owner && conv.venditore_id !== ctx.owner)) throw Error('Conversazione non disponibile.');
                const other = conv.acquirente_id === ctx.owner ? conv.venditore_id : conv.acquirente_id;
                const profiles = await request(query('profiles', { select: 'id,nome,cognome,avatar_url', id: 'eq.' + other, limit: 1 }), {}, ctx);
                if (!current(ctx) || view !== state.view) return;
                conv.other_profile = profiles?.[0] || null; state.conversations.set(id, conv);
            }
            if (!current(ctx) || view !== state.view) return;
            if (!conv) throw Error('Supporto momentaneamente non disponibile. Riprova.');
            const thread = makeThread(id, conv);
            selectThread(thread);
            if (thread.id) await loadMessages(thread);
        } catch (error) {
            if (current(ctx) && view === state.view) showToast(error.message || 'Non riusciamo ad aprire la conversazione.', 'error');
        }
    }
    async function openDraftFor(id) {
        const ctx = context(), view = ++state.view;
        try {
            const rows = await request(query('annunci', { select: 'id,titolo,img_urls,prezzo,stato,comune,tipo,user_id,status,expires_at', id: 'eq.' + id, limit: 1 }), {}, ctx);
            if (!current(ctx) || view !== state.view) return;
            const listing = rows?.[0];
            if (!listing || listing.user_id === ctx.owner || listing.status !== 'active' || (listing.expires_at && Date.parse(listing.expires_at) <= Date.now())) throw Error('Questo annuncio non è disponibile per una nuova chat.');
            const existing = [...state.conversations.values()].find(conv => conv.annuncio_id === id && conv.acquirente_id === ctx.owner);
            if (existing) return openConversation(existing.id);
            const profiles = await request(query('profiles', { select: 'id,nome,cognome,avatar_url', id: 'eq.' + listing.user_id, limit: 1 }), {}, ctx);
            if (!current(ctx) || view !== state.view) return;
            const thread = makeThread('listing:' + id);
            thread.listing = listing; thread.otherProfile = profiles?.[0] || null; thread.loaded = true;
            selectThread(thread);
        } catch (error) { if (current(ctx) && view === state.view) showToast(error.message || 'Annuncio non disponibile.', 'error'); }
    }
    function backToConversations() {
        saveComposer(); ++state.view; stopTyping(); state.active = null;
        $('convPanel').classList.remove('chat-mobile-hidden'); $('chatPanel').classList.add('chat-mobile-hidden');
        $('chatHeader').hidden = true; $('chatInputArea').hidden = true; $('messagesContainer').hidden = true;
        $('chatEmpty').hidden = false; $('chatMessageError').hidden = true; renderInbox();
        updateHeadings();
    }
    function messageParams(thread, before, after) {
        const params = { select: MESSAGE_FIELDS, conversazione_id: 'eq.' + thread.id,
            order: after ? 'created_at.asc,id.asc' : 'created_at.desc,id.desc', limit: PAGE };
        const cursor = before || after;
        if (cursor) {
            const operator = before ? 'lt' : 'gt';
            params.or = `(created_at.${operator}.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.${operator}.${cursor.id}))`;
        }
        return params;
    }
    function mergeMessage(thread, message) {
        if (message.conversazione_id !== thread.id) return;
        state.seen.add(message.id);
        const previous = thread.messages.get(message.id);
        thread.messages.set(message.id, { ...previous, ...message, letto: previous?.letto === true || message.letto === true });
        const pending = thread.outbox.get(message.id);
        if (pending) thread.outbox.delete(message.id);
    }
    function sortedMessages(thread) {
        return [...thread.messages.values()].sort(compare);
    }
    async function loadMessages(thread, older = false) {
        if (!thread.id || thread.loading || (older && thread.olderBusy)) return;
        const ctx = context();
        if (older) thread.olderBusy = true; else thread.loading = true;
        thread.error = ''; renderMessages(thread); updateComposer();
        try {
            const before = older ? sortedMessages(thread)[0] : null;
            const rows = await request(query('messaggi', messageParams(thread, before)), {}, ctx);
            if (!Array.isArray(rows)) throw Error('Messaggi non disponibili.');
            for (const message of rows) mergeMessage(thread, message);
            if (older || !thread.loaded) thread.hasOlder = rows.length === PAGE;
            const first = !thread.loaded; thread.loaded = true;
            renderMessages(thread, { initial: first, preserve: older });
        } catch (error) {
            if (!current(ctx)) return;
            thread.error = error.status === 401 ? error.message : 'Non riusciamo a caricare i messaggi. Le risposte già presenti sono conservate.';
        } finally {
            if (current(ctx)) { thread.loading = false; thread.olderBusy = false; if (thread.error) renderMessages(thread); renderMessageControls(thread); updateComposer(); }
        }
    }
    async function syncThread(thread) {
        if (!thread?.id || thread.syncing || thread.loading) return;
        if (!thread.loaded) return loadMessages(thread);
        const ctx = context(), previousSize = thread.messages.size;
        thread.syncing = true;
        try {
            let cursor = sortedMessages(thread).at(-1), rows;
            // Nessun limite di dieci messaggi persi: recupero paginato del divario.
            if (cursor) do {
                rows = await request(query('messaggi', messageParams(thread, null, cursor)), {}, ctx);
                for (const message of rows) mergeMessage(thread, message);
                if (rows.length) cursor = rows.at(-1);
                if (!current(ctx)) return;
            } while (rows.length === PAGE);
            // Riconcilia anche conferme di lettura e risposte arrivate fuori ordine.
            rows = await request(query('messaggi', messageParams(thread)), {}, ctx);
            const wasBottom = state.active === thread && atBottom();
            for (const message of rows) mergeMessage(thread, message);
            thread.error = '';
            if (thread.messages.size > previousSize && !wasBottom) thread.newMessages = true;
            renderMessages(thread, { follow: wasBottom });
            renderMessageControls(thread);
        } catch (error) {
            if (current(ctx)) { thread.error = 'Non riusciamo ad aggiornare i messaggi. Riprova.'; renderMessageControls(thread); }
        } finally { if (current(ctx)) thread.syncing = false; }
    }
    function dayLabel(value) {
        const date = new Date(value), today = new Date(), yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
        return date.toDateString() === today.toDateString() ? 'Oggi' : date.toDateString() === yesterday.toDateString() ? 'Ieri'
            : date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    function messageHTML(message, pending) {
        const mine = message.mittente_id === state.owner;
        const label = pending ? pending.status === 'sending' ? 'Invio…' : pending.uncertain ? 'Invio da verificare' : 'Non inviato'
            : mine ? message.letto ? 'Letto' : 'Inviato' : '';
        return `<article class="chat-message${mine ? ' is-mine' : ''}${pending ? ' is-pending' : ''}" data-msg-id="${esc(message.id)}">
            <div class="chat-message-content"><p class="chat-message-text" dir="auto">${esc(message.testo)}</p><div class="chat-message-meta"><time datetime="${esc(message.created_at)}">${esc(time(message.created_at))}</time>
            ${label ? `<span class="chat-delivery${message.letto && !pending ? ' is-read' : ''}">${!pending ? `<i class="fas fa-check${message.letto ? '-double' : ''}" aria-hidden="true"></i>` : ''}${esc(label)}</span>` : ''}
            ${pending?.status === 'failed' ? `<button type="button" class="chat-retry-message" data-retry-message="${esc(message.id)}">Riprova</button>` : ''}</div></div></article>`;
    }
    function renderMessages(thread, options = {}) {
        if (state.active !== thread) return;
        const container = $('messagesContainer'), wasBottom = atBottom(), oldScroll = container.scrollTop;
        const anchor = [...container.querySelectorAll('[data-msg-id]')].find(node => node.offsetTop >= oldScroll);
        const anchorId = anchor?.dataset.msgId, anchorOffset = anchor ? anchor.offsetTop - oldScroll : 0;
        const rows = [...sortedMessages(thread), ...[...thread.outbox.values()].sort((a, b) => a.serial - b.serial)];
        let day = '', segment = 0;
        const previous = new Map([...container.children].map(node => [node.dataset.chatKey, node])), desired = [];
        for (const message of rows) {
            const label = dayLabel(message.created_at);
            if (day !== label) {
                const key = 'day:' + label + ':' + segment++, heading = previous.get(key) || document.createElement('p');
                heading.className = 'chat-day'; heading.dataset.chatKey = key; heading.textContent = label; desired.push(heading); day = label;
            }
            const pending = thread.outbox.get(message.id);
            const signature = JSON.stringify([message.testo, message.created_at, message.letto, pending?.status, pending?.uncertain]);
            let node = previous.get(message.id);
            if (!node || node.dataset.signature !== signature) {
                const template = document.createElement('template'); template.innerHTML = messageHTML(message, pending);
                node = template.content.firstElementChild; node.dataset.chatKey = message.id; node.dataset.signature = signature;
            }
            desired.push(node);
        }
        if (!desired.length) container.innerHTML = (thread.loading || (!thread.loaded && thread.id)
            ? '<p class="chat-thread-placeholder" role="status">Caricamento dei messaggi…</p>'
            : thread.error ? '' : '<p class="chat-thread-placeholder">' + (thread.support ? 'Ciao! Raccontaci come possiamo aiutarti.' : 'Scrivi il primo messaggio per iniziare la conversazione.') + '</p>');
        else {
            let cursor = container.firstChild;
            for (const node of desired) { if (node === cursor) cursor = cursor.nextSibling; else container.insertBefore(node, cursor); }
            while (cursor) { const next = cursor.nextSibling; cursor.remove(); cursor = next; }
        }
        if (options.preserve && anchorId) {
            const next = container.querySelector('[data-msg-id="' + CSS.escape(anchorId) + '"]');
            container.scrollTop = next ? next.offsetTop - anchorOffset : oldScroll;
        } else if (options.initial) container.scrollTop = thread.scrollTop ?? container.scrollHeight;
        else if (options.follow || wasBottom) { container.scrollTop = container.scrollHeight; thread.newMessages = false; }
        else container.scrollTop = oldScroll;
        observer?.disconnect();
        for (const row of container.querySelectorAll('[data-msg-id]')) observer?.observe(row);
        renderMessageControls(thread);
    }
    function renderMessageControls(thread) {
        if (state.active !== thread) return;
        $('chatMessageError').hidden = !thread.error;
        $('chatMessageErrorText').textContent = thread.error;
        $('chatOlder').hidden = !thread.hasOlder;
        $('chatOlder').disabled = thread.olderBusy;
        $('chatOlder').textContent = thread.olderBusy ? 'Caricamento…' : 'Messaggi precedenti';
        $('chatNewMessages').hidden = !thread.newMessages;
    }
    function updateComposer() {
        const thread = state.active;
        $('msgInput').disabled = !thread || Boolean(thread.id && !thread.loaded);
        $('chatSend').disabled = !thread || $('msgInput').disabled || !$('msgInput').value.trim();
        $('chatComposerHint').textContent = !navigator.onLine ? 'Sei offline. Il testo resta qui.' : '';
    }
    function sizeComposer() {
        const input = $('msgInput'); input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 144) + 'px';
    }
    async function resolveConversation(thread, ctx, token) {
        if (thread.id) return thread.id;
        if (thread.resolvePromise) return thread.resolvePromise;
        thread.resolvePromise = (async () => {
            const filters = { select: CONVERSATION_FIELDS, acquirente_id: 'eq.' + ctx.owner, limit: 1,
                ...(thread.support ? { is_support: 'eq.true' } : { annuncio_id: 'eq.' + thread.listing.id }) };
            const lookup = async () => (await request(query('conversazioni', filters), { token }, ctx))?.[0];
            let conv = await lookup();
            if (!conv) {
                thread.proposedId ||= uuid();
                try {
                    const created = await request('conversazioni?select=' + encodeURIComponent(CONVERSATION_FIELDS), { token, method: 'POST',
                        headers: { Prefer: 'return=representation' }, body: { id: thread.proposedId,
                            annuncio_id: thread.support ? null : thread.listing.id, acquirente_id: ctx.owner,
                            venditore_id: thread.support ? state.adminId : thread.listing.user_id, is_support: thread.support } }, ctx);
                    conv = created?.[0];
                } catch (error) {
                    if (!current(ctx)) throw error;
                    // Concorrenza fra schede o risposta persa: recupera la stessa conversazione.
                    if (error.code === '23505' || error.uncertain) conv = await lookup();
                    if (!conv) throw error;
                }
            }
            if (!conv || !current(ctx)) throw stale();
            conv.other_profile = thread.otherProfile || thread.conversation?.other_profile || null;
            conv.annuncio ||= thread.listing;
            state.threads.delete(thread.key); state.conversations.delete(SUPPORT);
            thread.id = conv.id; thread.key = conv.id; thread.conversation = conv;
            state.threads.set(conv.id, thread); state.conversations.set(conv.id, conv); ensureSupport();
            if (state.active === thread) { renderHeader(thread); setupTyping(thread); }
            renderInbox(); return conv.id;
        })();
        try { return await thread.resolvePromise; } finally { thread.resolvePromise = null; }
    }
    async function findSent(message, token, ctx) {
        const rows = await request(query('messaggi', { select: MESSAGE_FIELDS, id: 'eq.' + message.id, limit: 1 }), { token }, ctx);
        const row = rows?.[0];
        if (row && row.conversazione_id === message.conversazione_id && row.mittente_id === ctx.owner && row.testo === message.testo) return row;
        return null;
    }
    async function flushOutbox(thread) {
        if (thread.sending) return;
        const ctx = context(); thread.sending = true;
        try {
            for (const message of thread.outbox.values()) {
                if (!current(ctx)) return;
                // Non supera un errore precedente: l'ordine della risposta resta esplicito.
                if (message.status === 'failed') break;
                try {
                    if (!navigator.onLine) throw Object.assign(Error('Sei offline.'), { uncertain: false });
                    const token = await sessionFor(ctx);
                    const id = await resolveConversation(thread, ctx, token);
                    if (!current(ctx)) return;
                    message.conversazione_id = id;
                    let saved;
                    try {
                        saved = (await request('messaggi?select=' + MESSAGE_FIELDS, { token, method: 'POST', headers: { Prefer: 'return=representation' },
                            body: { id: message.id, conversazione_id: id, mittente_id: ctx.owner, testo: message.testo } }, ctx))?.[0];
                    } catch (error) {
                        if (!current(ctx)) return;
                        if (error.code === '23505' || error.uncertain) {
                            try { saved = await findSent(message, token, ctx); } catch (_) { /* La riprova userà lo stesso ID. */ }
                        }
                        if (!saved) throw error;
                    }
                    if (!saved || saved.id !== message.id || saved.conversazione_id !== id || saved.mittente_id !== ctx.owner) throw Object.assign(Error('Invio da verificare.'), { uncertain: true });
                    if (!current(ctx)) return;
                    mergeMessage(thread, saved); updateConversation(saved, false);
                    window.SiteAnalytics?.track('message_sent', {success:true}, thread.listing?.id);
                    renderMessages(thread); renderInbox();
                } catch (error) {
                    if (!current(ctx)) return;
                    message.status = 'failed'; message.uncertain = error.uncertain === true;
                    window.SiteAnalytics?.track('technical_error', {error_code: window.SiteAnalytics.errorCode(error)});
                    for (const queued of thread.outbox.values()) if (queued.serial > message.serial) { queued.status = 'failed'; queued.uncertain = false; }
                    renderMessages(thread); $('chatAnnouncer').textContent = 'Invio non completato. Puoi riprovare dal messaggio.';
                    if (error.status === 401) notice(error.message, true);
                    break;
                }
            }
        } finally { if (current(ctx)) { thread.sending = false; updateComposer(); } }
    }
    function sendMessage(event) {
        event.preventDefault();
        const thread = state.active, text = $('msgInput').value.trim();
        if (!thread || !state.owner || $('msgInput').disabled || !text) return;
        if (!isValidFormText(text, 1, 5000, true)) { showToast('Scrivi un messaggio da 1 a 5.000 caratteri.', 'warning'); return; }
        if ([...thread.outbox.values()].some(message => message.status === 'failed')) {
            showToast('Riprova prima il messaggio che non è partito. Il nuovo testo resta qui.', 'warning'); return;
        }
        const message = { id: uuid(), conversazione_id: thread.id, mittente_id: state.owner, testo: text,
            created_at: new Date().toISOString(), letto: false, serial: ++serial, status: 'sending' };
        thread.outbox.set(message.id, message); thread.draft = ''; $('msgInput').value = ''; sizeComposer(); updateComposer();
        renderMessages(thread, { follow: true }); flushOutbox(thread);
    }
    function retryMessage(id) {
        const thread = state.active, message = thread?.outbox.get(id);
        if (!message || thread.sending) return;
        // Riparte dalla prima risposta sospesa, senza cambiare ID o destinatario.
        for (const pending of thread.outbox.values()) pending.status = 'sending';
        renderMessages(thread); flushOutbox(thread);
    }
    function updateConversation(message, incoming) {
        ++state.revision;
        const conv = state.conversations.get(message.conversazione_id);
        if (!conv) { scheduleInbox(); return; }
        if (!conv.lastMessage || compare(message, conv.lastMessage) >= 0) conv.lastMessage = message;
        if (incoming && message.mittente_id !== state.owner && !message.letto) conv.unread_count = (Number(conv.unread_count) || 0) + 1;
    }
    function receive(message, isUpdate = false) {
        if (!message?.id || !message.conversazione_id || !state.owner) return;
        const known = state.seen.has(message.id);
        state.seen.add(message.id);
        if (state.seen.size > 5000) state.seen.delete(state.seen.values().next().value);
        const thread = state.threads.get(message.conversazione_id);
        const follow = thread && state.active === thread && atBottom();
        if (thread) {
            mergeMessage(thread, message);
            if (!isUpdate && !known && message.mittente_id !== state.owner && !follow) thread.newMessages = true;
            renderMessages(thread, { follow });
        }
        updateConversation(message, !isUpdate && !known);
        renderInbox(); scheduleInbox();
        if (!isUpdate && !known && message.mittente_id !== state.owner) $('chatAnnouncer').textContent = 'Nuovo messaggio ricevuto.';
    }
    function setupRealtime() {
        const ctx = context();
        try { state.channel = _supabase.channel('chat-inbox-' + ctx.owner)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaggi' }, payload => { if (current(ctx)) receive(payload.new); })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messaggi' }, payload => { if (current(ctx)) receive(payload.new, true); })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversazioni' }, () => { if (current(ctx)) scheduleInbox(); })
            .subscribe(status => {
                if (!current(ctx)) return;
                state.connected = status === 'SUBSCRIBED'; connection();
                if (state.connected) setTimeout(() => { if (current(ctx)) refresh(); }, 0);
            }); } catch (_) { state.connected = false; connection(); }
        state.pollTimer = setInterval(() => {
            if (current(ctx) && document.visibilityState === 'visible') refresh();
        }, 10000);
    }
    async function refresh() {
        if (!state.ready || !state.owner || !navigator.onLine) { connection(); return; }
        const thread = state.active;
        await Promise.allSettled([loadInbox(), thread?.id ? syncThread(thread) : Promise.resolve()]);
    }
    function stopTyping() {
        clearTimeout(state.typingTimer); $('typingIndicator').hidden = true;
        if (state.typing) { _supabase.removeChannel(state.typing); state.typing = null; }
    }
    function setupTyping(thread) {
        stopTyping();
        if (!thread.id) return;
        const ctx = context();
        state.typing = _supabase.channel('chat-typing-' + thread.id, { config: { broadcast: { self: false } } })
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                const conv = thread.conversation, other = conv?.acquirente_id === ctx.owner ? conv?.venditore_id : conv?.acquirente_id;
                if (!current(ctx) || !visible(thread) || payload?.u !== other) return;
                $('typingIndicator').hidden = false; clearTimeout(state.typingTimer);
                state.typingTimer = setTimeout(() => { $('typingIndicator').hidden = true; }, 2500);
            }).subscribe();
    }
    function emitTyping() {
        if (!state.typing || !state.owner || !$('msgInput').value.trim() || Date.now() - state.lastTyping < 1500) return;
        state.lastTyping = Date.now();
        Promise.resolve(state.typing.send({ type: 'broadcast', event: 'typing', payload: { u: state.owner } })).catch(() => {});
    }
    async function markRead(thread) {
        if (!thread.id || !visible(thread) || !document.hasFocus() || state.readBusy || !thread.readIds.size) return;
        const ctx = context(), ids = [...thread.readIds].slice(0, 100); state.readBusy = true;
        try {
            await request(query('messaggi', { id: 'in.(' + ids.join(',') + ')', conversazione_id: 'eq.' + thread.id,
                mittente_id: 'neq.' + ctx.owner, or: '(letto.eq.false,letto.is.null)' }), { method: 'PATCH', body: { letto: true } }, ctx);
            if (!current(ctx)) return;
            for (const id of ids) { const message = thread.messages.get(id); if (message) message.letto = true; thread.readIds.delete(id); }
            scheduleInbox();
            setTimeout(() => { if (current(ctx)) scanRead(); }, 0);
        } catch (_) { /* Retry al focus/scroll: nessuna falsa conferma di lettura. */ }
        finally { if (current(ctx)) state.readBusy = false; }
    }
    function observeRead(entries) {
        const thread = state.active;
        if (!thread || !visible(thread) || !document.hasFocus()) return;
        for (const entry of entries) if (entry.isIntersecting) {
            const message = thread.messages.get(entry.target.dataset.msgId);
            if (message && message.mittente_id !== state.owner && !message.letto) thread.readIds.add(message.id);
        }
        markRead(thread);
    }
    function scanRead() {
        const thread = state.active;
        if (!thread || !visible(thread)) return;
        const box = $('messagesContainer').getBoundingClientRect();
        const entries = [...$('messagesContainer').querySelectorAll('[data-msg-id]')].map(target => {
            const rect = target.getBoundingClientRect(); return { target, isIntersecting: rect.bottom > box.top && rect.top < box.bottom };
        });
        observeRead(entries);
    }
    function clearIdentity() {
        ++state.epoch; ++state.view; state.requests.forEach(controller => controller.abort()); state.requests.clear();
        clearTimeout(state.refreshTimer); clearInterval(state.pollTimer); stopTyping(); observer?.disconnect();
        if (state.channel) _supabase.removeChannel(state.channel);
        state.channel = null; state.ready = false; state.booting = false; state.connected = false;
        state.conversations.clear(); state.threads.clear(); state.seen.clear(); state.active = null;
        state.admin = false; state.adminId = null; state.inboxLoading = false; state.inboxError = '';
        state.hasMore = false; state.cursor = null; state.loadedMore = false; state.initialLink = false; state.readBusy = false; state.report = null;
        $('convList').replaceChildren(); $('messagesContainer').replaceChildren(); $('msgInput').value = '';
        $('chatOtherName').textContent = ''; $('chatHeaderMeta').textContent = ''; $('chatHeaderThumb').replaceChildren();
        $('reportForm').reset(); $('reportModal').hidden = true;
        $('reportSubmitBtn').disabled = false; $('reportSubmitBtn').textContent = 'Invia segnalazione';
        $('chatHeader').hidden = true; $('chatInputArea').hidden = true; $('messagesContainer').hidden = true; $('chatEmpty').hidden = false;
        $('chatMessageError').hidden = true; $('chatNewMessages').hidden = true;
        $('convPanel').classList.remove('chat-mobile-hidden'); $('chatPanel').classList.add('chat-mobile-hidden');
        $('chatLayout').hidden = true;
    }
    function setIdentity(user) {
        if (state.owner !== (user?.id || null)) { clearIdentity(); state.owner = user?.id || null; state.user = user || null; }
        $('notLoggedIn').hidden = Boolean(state.owner); $('loadingState').hidden = !state.owner || state.ready;
        updateHeadings();
        if (state.owner && !state.ready && !state.booting) setTimeout(() => start(context()), 0);
    }
    async function start(ctx) {
        if (!current(ctx) || state.booting || state.ready) return;
        state.booting = true;
        try {
            const verified = await limited(_supabase.auth.getUser());
            if (!current(ctx)) return;
            if (verified.error) throw Error('Impossibile verificare l’accesso. Riprova.');
            if (verified.data?.user?.id !== ctx.owner) { setIdentity(null); return; }
            state.user = verified.data.user; state.ready = true;
            $('loadingState').hidden = true; $('chatLayout').hidden = false;
            setupRealtime(); connection(); await loadInbox();
            if (!current(ctx) || state.initialLink) return;
            state.initialLink = true;
            const params = new URLSearchParams(location.search);
            if (params.get('conv')) await openConversation(params.get('conv'));
            else if (params.get('annuncio')) await openDraftFor(params.get('annuncio'));
            else if (params.has('support') && !state.admin) {
                const support = [...state.conversations.values()].find(c => c.is_support && c.acquirente_id === state.owner);
                if (support) await openConversation(support.id);
            }
        } catch (error) {
            if (current(ctx)) {
                state.ready = false;
                $('loadingState').hidden = false; $('chatBootError').hidden = false; $('chatBootLoading').hidden = true;
            }
        } finally { if (current(ctx)) state.booting = false; }
    }
    function toggleChatMenu(event) { event?.stopPropagation(); $('chatMenu').hidden = !$('chatMenu').hidden; }
    function openReportModal() {
        const thread = state.active;
        if (!thread?.id || thread.support) return;
        state.report = { ...context(), id: thread.id }; $('chatMenu').hidden = true;
        $('reportForm').reset(); $('reportModal').hidden = false; $('reportModal').querySelector('input')?.focus();
    }
    function closeReportModal() { $('reportModal').hidden = true; state.report = null; $('chatKebabBtn').focus(); }
    async function submitReport(event) {
        event.preventDefault();
        const report = state.report, button = $('reportSubmitBtn');
        if (!report || !current(report) || button.disabled) return;
        const form = new FormData(event.target), reason = form.get('reason'), details = String(form.get('details') || '').trim();
        if (!['scam', 'harassment', 'spam', 'other'].includes(reason) || !isValidFormText(details, 0, 500, true)) { showToast('Controlla il motivo e i dettagli (massimo 500 caratteri).', 'warning'); return; }
        button.disabled = true; button.textContent = 'Invio…';
        try {
            const rows = await request('conversation_reports?select=id', { method: 'POST', headers: { Prefer: 'return=representation' }, body: {
                conversazione_id: report.id, reporter_id: report.owner, reason, details: details || null
            } }, report);
            if (!current(report)) return;
            // L'eventuale errore della notifica non annulla il report già salvato.
            try { const token = await sessionFor(report);
            fetch(SUPABASE_URL + '/functions/v1/notify-report', { method: 'POST', headers: {
                'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token
            }, body: JSON.stringify({ report_id: rows?.[0]?.id }) }).catch(() => {}); } catch (_) { /* Report conservato. */ }
            if (state.report === report) closeReportModal();
            showToast('Segnalazione ricevuta. Grazie.', 'success');
        } catch (error) {
            if (current(report)) showToast(error.code === '23505' ? 'Hai già una segnalazione aperta su questa chat.' : 'Non riusciamo a inviare la segnalazione. Riprova.', 'error');
        } finally { if (current(report)) { button.disabled = false; button.textContent = 'Invia segnalazione'; } }
    }
    function viewport() {
        const viewport = window.visualViewport;
        document.documentElement.style.setProperty('--chat-viewport-height', (viewport?.height || innerHeight) + 'px');
        updateHeadings();
    }
    function updateHeadings() {
        const detail = state.owner && state.active && matchMedia('(max-width: 767px)').matches;
        for (const [id, level] of [['chatAccessTitle', state.owner ? 'h2' : 'h1'], ['chatListTitle', state.owner && !detail ? 'h1' : 'h2'], ['chatOtherName', detail ? 'h1' : 'h2']]) {
            const before = $(id);
            if (!before || before.localName === level) continue;
            const after = document.createElement(level); after.id = id; after.className = before.className;
            after.append(...before.childNodes); before.replaceWith(after);
        }
    }
    async function init() {
        observer = new IntersectionObserver(observeRead, { root: $('messagesContainer'), threshold: 0.1 });
        $('convList').addEventListener('click', event => { const row = event.target.closest('[data-conversation]'); if (row) openConversation(row.dataset.conversation); });
        $('messagesContainer').addEventListener('click', event => { const button = event.target.closest('[data-retry-message]'); if (button) retryMessage(button.dataset.retryMessage); });
        $('messagesContainer').addEventListener('scroll', () => { if (state.active && atBottom()) { state.active.newMessages = false; renderMessageControls(state.active); } scanRead(); }, { passive: true });
        $('chatForm').addEventListener('submit', sendMessage);
        $('msgInput').addEventListener('input', () => { if (state.active) state.active.draft = $('msgInput').value; sizeComposer(); updateComposer(); emitTyping(); });
        $('msgInput').addEventListener('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !matchMedia('(pointer: coarse)').matches) { event.preventDefault(); $('chatForm').requestSubmit(); }
        });
        $('chatBack').addEventListener('click', backToConversations);
        $('chatOlder').addEventListener('click', () => { if (state.active) loadMessages(state.active, true); });
        $('chatRetryMessages').addEventListener('click', () => { if (state.active) state.active.loaded ? syncThread(state.active) : loadMessages(state.active); });
        $('chatRetryInbox').addEventListener('click', () => loadInbox());
        $('chatRefresh').addEventListener('click', refresh);
        $('chatLoadMoreConversations').addEventListener('click', () => loadInbox(true));
        $('chatNewMessages').addEventListener('click', () => { $('messagesContainer').scrollTop = $('messagesContainer').scrollHeight; if (state.active) { state.active.newMessages = false; renderMessageControls(state.active); } scanRead(); });
        $('chatRetryBoot').addEventListener('click', () => { $('chatBootError').hidden = true; $('chatBootLoading').hidden = false; start(context()); });
        $('reportForm').addEventListener('submit', submitReport);
        $('chatKebabBtn').addEventListener('click', toggleChatMenu);
        $('chatReport').addEventListener('click', openReportModal);
        document.addEventListener('click', event => { if (!event.target.closest('#chatMenu,#chatKebabBtn')) $('chatMenu').hidden = true; });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') { $('chatMenu').hidden = true; if (!$('reportModal').hidden) closeReportModal(); }
            if (event.key === 'Tab' && !$('reportModal').hidden) {
                const controls = [...$('reportModal').querySelectorAll('button,input,textarea')].filter(el => !el.disabled && el.getClientRects().length);
                const index = controls.indexOf(document.activeElement);
                if ((event.shiftKey && index <= 0) || (!event.shiftKey && index === controls.length - 1)) {
                    event.preventDefault(); (event.shiftKey ? controls.at(-1) : controls[0])?.focus();
                }
            }
        });
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { refresh(); scanRead(); } });
        window.addEventListener('focus', () => { refresh(); scanRead(); });
        window.addEventListener('online', () => { connection(); refresh(); updateComposer(); });
        window.addEventListener('offline', () => { connection(); updateComposer(); });
        window.addEventListener('beforeunload', event => {
            if ([...state.threads.values()].some(thread => thread.draft.trim() || thread.outbox.size)) { event.preventDefault(); event.returnValue = ''; }
        });
        window.addEventListener('pagehide', () => { if (state.channel) _supabase.removeChannel(state.channel); stopTyping(); state.connected = false; });
        window.addEventListener('pageshow', event => { if (event.persisted && state.owner) { if (state.channel) _supabase.removeChannel(state.channel); clearInterval(state.pollTimer); setupRealtime(); refresh(); } });
        window.visualViewport?.addEventListener('resize', viewport); window.addEventListener('resize', viewport); viewport();
        _supabase.auth.onAuthStateChange((_event, session) => { ++authRevision; setIdentity(session?.user || null); });
        const revision = authRevision;
        try {
            const result = await limited(_supabase.auth.getSession());
            if (result.error) throw result.error;
            if (revision === authRevision) setIdentity(result.data?.session?.user || null);
        } catch (_) {
            if (revision === authRevision) { $('loadingState').hidden = true; $('notLoggedIn').hidden = false; }
        }
    }
    window.closeReportModal = closeReportModal;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
