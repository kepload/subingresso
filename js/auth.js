// ============================================================
//  Subingresso.it — Sistema di Autenticazione
//  Gestisce: login, registrazione, sessione, navbar dinamica
// ============================================================

(function () {

let _profileCache = null; // { id, nome } — evita query ripetute sulla navbar

// ── Inject modal HTML ──────────────────────────────────────
const modalHTML = `
<div id="authOverlay" class="fixed inset-0 z-[999] flex items-center justify-center p-4 hidden" style="background:rgba(15,23,42,0.65);backdrop-filter:blur(4px)">
  <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onclick="event.stopPropagation()">

    <!-- Tabs header -->
    <div class="flex border-b border-slate-100">
      <button id="tabLogin" type="button" onclick="switchAuthTab('login')"
        class="flex-1 py-5 text-sm font-black tracking-tight transition text-blue-600 border-b-2 border-blue-600">
        Accedi
      </button>
      <button id="tabRegister" type="button" onclick="switchAuthTab('register')"
        class="flex-1 py-5 text-sm font-black tracking-tight transition text-slate-400 hover:text-slate-700">
        Registrati
      </button>
      <button type="button" onclick="closeAuthModal()" class="px-5 text-slate-300 hover:text-slate-600 transition text-lg">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Error banner -->
    <div id="authError" class="hidden mx-6 mt-5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
      <i class="fas fa-exclamation-circle text-red-400 flex-shrink-0"></i>
      <span id="authErrorMsg" class="text-sm text-red-600 font-semibold"></span>
    </div>

    <!-- Success banner -->
    <div id="authSuccess" class="hidden mx-6 mt-5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-2">
      <i class="fas fa-check-circle text-emerald-500 flex-shrink-0"></i>
      <span id="authSuccessMsg" class="text-sm text-emerald-700 font-semibold"></span>
    </div>

    <!-- ── Login Form ── -->
    <form id="loginForm" class="p-6 space-y-4" onsubmit="handleLogin(event)">
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
        <input id="loginEmail" type="email" placeholder="la-tua@email.it" required autocomplete="email"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
        <div class="relative">
          <input id="loginPassword" type="password" placeholder="••••••••" required autocomplete="current-password"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
          <button type="button" onclick="togglePwd('loginPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
            <i class="fas fa-eye text-sm"></i>
          </button>
        </div>
      </div>
      <button type="submit" id="loginBtn"
        class="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] flex items-center justify-center gap-2">
        <i class="fas fa-sign-in-alt"></i> Accedi
      </button>
      <div class="flex items-center justify-between pt-1">
        <p class="text-xs text-slate-400 font-medium">
          Non hai un account?
          <button type="button" onclick="switchAuthTab('register')" class="text-blue-600 font-bold hover:underline">Registrati gratis</button>
        </p>
        <button type="button" onclick="switchAuthTab('forgot')" class="text-xs text-slate-400 hover:text-slate-600 font-semibold transition">
          Password dimenticata?
        </button>
      </div>
    </form>

    <!-- ── Forgot Password Form ── -->
    <form id="forgotForm" class="p-6 space-y-4 hidden" onsubmit="handleForgotPassword(event)">
      <div>
        <p class="text-sm font-semibold text-slate-600 mb-4">Inserisci la tua email e ti mandiamo un link per reimpostare la password.</p>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email</label>
        <input id="forgotEmail" type="email" placeholder="la-tua@email.it" required autocomplete="email"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <button type="submit" id="forgotBtn"
        class="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] flex items-center justify-center gap-2">
        <i class="fas fa-paper-plane"></i> Invia link
      </button>
      <p class="text-center text-xs text-slate-400 font-medium pt-1">
        <button type="button" onclick="switchAuthTab('login')" class="text-blue-600 font-bold hover:underline">← Torna al login</button>
      </p>
    </form>

    <!-- ── Register Form ── -->
    <form id="registerForm" class="p-6 space-y-4 hidden" onsubmit="handleRegister(event)">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Nome *</label>
          <input id="regNome" type="text" placeholder="Mario" required
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
        </div>
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Cognome *</label>
          <input id="regCognome" type="text" placeholder="Rossi" required
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
        </div>
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email *</label>
        <input id="regEmail" type="email" placeholder="la-tua@email.it" required autocomplete="email"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Telefono</label>
        <input id="regTelefono" type="tel" placeholder="347 1234567"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Password * (min. 6 caratteri)</label>
        <div class="relative">
          <input id="regPassword" type="password" placeholder="Minimo 6 caratteri" required minlength="6" autocomplete="new-password"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
          <button type="button" onclick="togglePwd('regPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
            <i class="fas fa-eye text-sm"></i>
          </button>
        </div>
      </div>
      <button type="submit" id="registerBtn"
        class="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] flex items-center justify-center gap-2">
        <i class="fas fa-user-plus"></i> Crea account
      </button>
      <p class="text-center text-xs text-slate-400 font-medium pt-1">
        Hai già un account?
        <button type="button" onclick="switchAuthTab('login')" class="text-blue-600 font-bold hover:underline">Accedi</button>
      </p>
    </form>

  </div>
</div>
`;

function initAuthModal() {
    if (document.getElementById('authOverlay')) return;
    if (!document.body) return;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('authOverlay').addEventListener('click', closeAuthModal);
}

// ── Tab switching ─────────────────────────────────────────
window.switchAuthTab = function (tab) {
    const isLogin    = tab === 'login';
    const isRegister = tab === 'register';
    const isForgot   = tab === 'forgot';
    document.getElementById('loginForm')?.classList.toggle('hidden', !isLogin);
    document.getElementById('registerForm')?.classList.toggle('hidden', !isRegister);
    document.getElementById('forgotForm')?.classList.toggle('hidden', !isForgot);
    const tabLogin    = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    if (tabLogin) tabLogin.className =
        `flex-1 py-5 text-sm font-black tracking-tight transition ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'}`;
    if (tabRegister) tabRegister.className =
        `flex-1 py-5 text-sm font-black tracking-tight transition ${isRegister ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'}`;
    _hideAuthFeedback();
};

// ── Open / Close ─────────────────────────────────────────
window.openAuthModal = function (tab) {
    initAuthModal();
    switchAuthTab(tab || 'login');
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeAuthModal = function () {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    ['loginEmail','loginPassword','regNome','regCognome','regEmail','regTelefono','regPassword','forgotEmail']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    _hideAuthFeedback();
};

// ── Feedback helpers ─────────────────────────────────────
function _showAuthError(msg) {
    const el = document.getElementById('authErrorMsg');
    const box = document.getElementById('authError');
    const succ = document.getElementById('authSuccess');
    if (el) el.textContent = msg;
    if (box) box.classList.remove('hidden');
    if (succ) succ.classList.add('hidden');
}
function _showAuthSuccess(msg) {
    const el = document.getElementById('authSuccessMsg');
    const box = document.getElementById('authSuccess');
    const err = document.getElementById('authError');
    if (el) el.textContent = msg;
    if (box) box.classList.remove('hidden');
    if (err) err.classList.add('hidden');
}
function _hideAuthFeedback() {
    const err = document.getElementById('authError');
    const succ = document.getElementById('authSuccess');
    if (err) err.classList.add('hidden');
    if (succ) succ.classList.add('hidden');
}
function _setBtnLoading(btnId, loading, defaultHTML) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<i class="fas fa-spinner fa-spin"></i> Attendi…' : defaultHTML;
}

// ── Popup visitatori (non loggati) ───────────────────────
function _injectVisitorPopup() {
    if (document.getElementById('visitorPopup')) return;
    document.body.insertAdjacentHTML('beforeend', `
    <div id="visitorPopup" class="fixed inset-0 z-[998] flex items-center justify-center p-4 hidden"
         style="background:rgba(15,23,42,0.65);backdrop-filter:blur(4px)">
      <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center relative" onclick="event.stopPropagation()">
        <button onclick="closeVisitorPopup()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
          <i class="fas fa-times"></i>
        </button>
        <div class="text-4xl mb-3">🎁</div>
        <h2 class="text-xl font-black text-slate-800 mb-2">Vendi il tuo posteggio?</h2>
        <p class="text-sm text-slate-500 mb-5 leading-relaxed">
          Iscriviti gratis e ottieni <span class="font-bold text-amber-500">10 giorni di vetrina</span> — il tuo annuncio in cima a tutti i risultati.
        </p>
        <button onclick="closeVisitorPopup(); openAuthModal('register')"
          class="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] mb-3">
          Registrati gratis →
        </button>
        <button onclick="closeVisitorPopup()" class="text-xs text-slate-400 hover:text-slate-600 transition">
          Esplora prima gli annunci
        </button>
      </div>
    </div>`);
}

function _scheduleVisitorPopup() {
    if (sessionStorage.getItem('_vp')) return;
    setTimeout(async () => {
        try {
            const { data } = await _supabase.auth.getSession();
            if (data?.session) return;
        } catch (_) {}
        sessionStorage.setItem('_vp', '1');
        _injectVisitorPopup();
        const el = document.getElementById('visitorPopup');
        if (el) { el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
    }, 8000);
}

window.closeVisitorPopup = function () {
    const el = document.getElementById('visitorPopup');
    if (el) { el.classList.add('hidden'); document.body.style.overflow = ''; }
};

// ── Popup benvenuto nuovo utente ─────────────────────────
function _injectWelcomePopup() {
    if (document.getElementById('welcomeNewPopup')) return;
    document.body.insertAdjacentHTML('beforeend', `
    <div id="welcomeNewPopup" class="fixed inset-0 z-[1001] flex items-center justify-center p-4 hidden"
         style="background:rgba(15,23,42,0.65);backdrop-filter:blur(4px)">
      <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center" onclick="event.stopPropagation()">
        <div class="text-5xl mb-3">🎉</div>
        <h2 class="text-xl font-black text-slate-800 mb-1">Benvenuto su Subingresso.it!</h2>
        <p class="text-sm text-slate-500 mb-4">Il tuo account è attivo.</p>
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <p class="text-sm font-bold text-amber-700">🎁 Hai 10 giorni di vetrina gratis</p>
          <p class="text-xs text-amber-600 mt-1">Il tuo primo annuncio sarà in cima a tutti i risultati.</p>
        </div>
        <button onclick="closeWelcomeNewPopup(); window.location.href='vendi.html'"
          class="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] mb-3">
          Pubblica il tuo primo annuncio →
        </button>
        <button onclick="closeWelcomeNewPopup()" class="text-xs text-slate-400 hover:text-slate-600 transition">
          Esplora prima gli annunci
        </button>
      </div>
    </div>`);
}

window.closeWelcomeNewPopup = function () {
    const el = document.getElementById('welcomeNewPopup');
    if (el) { el.classList.add('hidden'); document.body.style.overflow = ''; }
};

function _showWelcomeNewPopup(userId) {
    if (localStorage.getItem('_welc_' + userId)) return;
    localStorage.setItem('_welc_' + userId, '1');
    _injectWelcomePopup();
    const el = document.getElementById('welcomeNewPopup');
    if (el) { el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
}

// ── Password toggle ─────────────────────────────────────
window.togglePwd = function (id) {
    const el = document.getElementById(id);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
};

// ── Login ────────────────────────────────────────────────
window.handleLogin = async function (e) {
    e.preventDefault();
    _hideAuthFeedback();
    _setBtnLoading('loginBtn', true, '<i class="fas fa-sign-in-alt"></i> Accedi');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        _setBtnLoading('loginBtn', false, '<i class="fas fa-sign-in-alt"></i> Accedi');

        if (error) {
            _showAuthError('Email o password non corretti. Riprova.');
            return;
        }

        closeAuthModal();
        updateAuthNav();
        if (typeof window.__onLoginSuccess === 'function') {
            window.__onLoginSuccess();
            window.__onLoginSuccess = null;
        }
    } catch (err) {
        _setBtnLoading('loginBtn', false, '<i class="fas fa-sign-in-alt"></i> Accedi');
        _showAuthError('Errore di connessione. Verifica la configurazione.');
    }
};

// ── Register ─────────────────────────────────────────────
window.handleRegister = async function (e) {
    e.preventDefault();
    _hideAuthFeedback();
    _setBtnLoading('registerBtn', true, '<i class="fas fa-user-plus"></i> Crea account');

    const nome     = document.getElementById('regNome').value.trim();
    const cognome  = document.getElementById('regCognome').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const telefono = document.getElementById('regTelefono').value.trim();
    const password = document.getElementById('regPassword').value;

    try {
        const { data, error } = await _supabase.auth.signUp({
            email,
            password,
            options: { data: { nome, cognome, telefono } }
        });

        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');

        if (error) {
            _showAuthError(error.message);
            return;
        }

        if (data?.user && data?.session) {
            // Session presente = conferma email disabilitata, utente subito attivo
            await _supabase.from('profiles').upsert({ id: data.user.id, nome, cognome, telefono });
            _profileCache = { id: data.user.id, nome };
            _showAuthSuccess('Benvenuto! Account creato con successo.');
            setTimeout(() => { closeAuthModal(); updateAuthNav(); }, 1500);
        } else {
            // Se session è null la conferma email è pending
            _showAuthSuccess('Account creato! Controlla la tua email per confermare, poi accedi.');
            setTimeout(() => switchAuthTab('login'), 4000);
        }
    } catch (err) {
        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');
        _showAuthError('Errore durante la registrazione.');
    }
};

// ── Forgot Password ──────────────────────────────────────
window.handleForgotPassword = async function (e) {
    e.preventDefault();
    _hideAuthFeedback();
    _setBtnLoading('forgotBtn', true, '<i class="fas fa-paper-plane"></i> Invia link');
    const email = document.getElementById('forgotEmail').value.trim();
    try {
        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://subingresso.it/reset-password.html'
        });
        _setBtnLoading('forgotBtn', false, '<i class="fas fa-paper-plane"></i> Invia link');
        if (error) { _showAuthError('Errore. Controlla l\'email e riprova.'); return; }
        _showAuthSuccess('Link inviato! Controlla la tua email.');
    } catch (err) {
        _setBtnLoading('forgotBtn', false, '<i class="fas fa-paper-plane"></i> Invia link');
        _showAuthError('Errore di connessione. Riprova.');
    }
};

// ── Sign out ─────────────────────────────────────────────
window.signOut = async function () {
    _profileCache = null;
    try {
        await _supabase.auth.signOut();
    } catch (e) { console.error("Sign out error:", e); }
    
    // Pulizia estrema: svuota il contenuto protetto se presente e reindirizza alla home
    const dash = document.getElementById('dashContent');
    if (dash) dash.innerHTML = ''; 
    
    // Reindirizzamento universale alla home per azzerare lo stato JS
    window.location.href = 'index.html';
};

// ── Get current user ─────────────────────────────────────
window.getCurrentUser = async function () {
    try {
        const { data } = await _supabase.auth.getUser();
        return data?.user;
    } catch (e) { return null; }
};

// ── Require auth — shows modal if not logged in ──────────
window.requireAuth = function (callback) {
    _supabase.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (user) {
            callback(user);
        } else {
            window.__onLoginSuccess = () => _supabase.auth.getUser().then(({ data }) => {
                const u = data?.user;
                if (u) callback(u);
            });
            openAuthModal('login');
        }
    }).catch(() => {
        openAuthModal('login');
    });
};

// ── Update navbar ────────────────────────────────────────
window.updateAuthNav = async function () {
    const nav = document.getElementById('authNav');
    if (!nav) return;

    // Fase 1: legge dal localStorage — nessuna rete, istantaneo
    let session = null;
    try {
        const { data } = await _supabase.auth.getSession();
        session = data?.session;
    } catch (e) {}

    if (!session?.user) {
        nav.innerHTML = `
            <button onclick="openAuthModal('login')"
                class="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all duration-300">
                Accedi
            </button>`;
        _scheduleVisitorPopup();
        return;
    }

    // Fase 2: utente loggato — mostra icone subito, poi aggiorna badge in background
    const user = session.user;
    const msgIconId = 'navMsgIcon_' + Date.now();
    nav.innerHTML = `
        <a href="messaggi.html" title="Messaggi"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 flex items-center justify-center shrink-0">
            <i class="fas fa-comment-alt text-sm"></i>
            <span id="${msgIconId}"></span>
        </a>
        <a href="dashboard.html" title="Area personale"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 flex items-center justify-center shrink-0">
            <i class="fas fa-user text-sm text-slate-500"></i>
        </a>`;

    // Cache profilo in background (per usi successivi, non blocca la nav)
    if (!(_profileCache && _profileCache.id === user.id)) {
        _supabase.from('profiles').select('nome').eq('id', user.id).single().then(({ data: profile }) => {
            if (profile?.nome) {
                _profileCache = { id: user.id, nome: profile.nome };
            } else {
                const meta = user.user_metadata || {};
                if (meta.nome) {
                    _supabase.from('profiles')
                        .upsert({ id: user.id, nome: meta.nome || '', cognome: meta.cognome || '', telefono: meta.telefono || '', vetrina_welcome_days: 10 })
                        .then(() => { _profileCache = { id: user.id, nome: meta.nome }; });
                    _showWelcomeNewPopup(user.id);
                }
            }
        }).catch(() => {});
    }

    // Badge messaggi non letti in background
    (async () => {
        try {
            const { data: convs } = await _supabase
                .from('conversazioni')
                .select('id')
                .or(`acquirente_id.eq.${user.id},venditore_id.eq.${user.id}`);
            if (!convs || convs.length === 0) return;
            const convIds = convs.map(c => c.id);
            const { count } = await _supabase
                .from('messaggi')
                .select('id', { count: 'exact', head: true })
                .eq('letto', false)
                .neq('mittente_id', user.id)
                .in('conversazione_id', convIds);
            const unread = count || 0;
            if (unread > 0) {
                const badgeEl = document.getElementById(msgIconId);
                if (badgeEl) badgeEl.outerHTML = `<span class="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">${unread > 9 ? '9+' : unread}</span>`;
            }
        } catch (_) {}
    })();
};

// ── Init ─────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initAuthModal();
        updateAuthNav();
    });
} else {
    initAuthModal();
    updateAuthNav();
}

try {
    _supabase.auth.onAuthStateChange(() => {
        updateAuthNav();
    });
} catch (e) {}

})();
