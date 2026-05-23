// ============================================================
//  Subingresso.it — Sistema di Autenticazione
//  Gestisce: login, registrazione, sessione, navbar dinamica
// ============================================================

(function () {

// ── Tracking acquisizione (Ondata 1) ────────────────────────
// Al primo hit della sessione cattura referrer esterno, UTM e landing path.
// Persiste in sessionStorage per essere letto dal valutatore al completamento.
try {
    if (!sessionStorage.getItem('_acq_captured')) {
        const params = new URLSearchParams(location.search);
        const ref    = document.referrer || '';
        const refIsExternal = ref && !ref.includes('subingresso.it');

        sessionStorage.setItem('_acq_captured',     '1');
        sessionStorage.setItem('_acq_landing_path',  location.pathname + (location.search || ''));
        sessionStorage.setItem('_acq_referrer',      refIsExternal ? ref : '');
        sessionStorage.setItem('_acq_utm_source',    params.get('utm_source')   || '');
        sessionStorage.setItem('_acq_utm_medium',    params.get('utm_medium')   || '');
        sessionStorage.setItem('_acq_utm_campaign',  params.get('utm_campaign') || '');
    }
} catch (_) { /* private mode: ignora */ }

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

    <!-- Context banner (settato da openAuthModal(tab, contextMsg) per spiegare perché si è aperto il modal) -->
    <div id="authContextBanner" class="hidden mx-6 mt-5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
      <i class="fas fa-info-circle text-blue-500 flex-shrink-0 mt-0.5"></i>
      <span id="authContextMsg" class="text-sm text-blue-800 font-semibold leading-snug"></span>
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
        <input id="loginEmail" name="email" type="email" placeholder="la-tua@email.it" required autocomplete="username"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Password</label>
        <div class="relative">
          <input id="loginPassword" name="password" type="password" placeholder="••••••••" required autocomplete="current-password"
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
        <input id="forgotEmail" name="email" type="email" placeholder="la-tua@email.it" required autocomplete="username"
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
          <input id="regNome" name="given-name" type="text" placeholder="Mario" required autocomplete="given-name"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
        </div>
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Cognome *</label>
          <input id="regCognome" name="family-name" type="text" placeholder="Rossi" required autocomplete="family-name"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
        </div>
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Email *</label>
        <input id="regEmail" name="email" type="email" placeholder="la-tua@email.it" required autocomplete="username"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Telefono</label>
        <input id="regTelefono" name="tel" type="tel" placeholder="347 1234567" autocomplete="tel"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition">
      </div>
      <div aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none">
        <label>Sito web (lascia vuoto)</label>
        <input id="regWebsite" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <div>
        <label class="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">Password * (min. 6 caratteri)</label>
        <div class="relative">
          <input id="regPassword" name="password" type="password" placeholder="Minimo 6 caratteri" required minlength="6" autocomplete="new-password"
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
    // Validazione live telefono nel form di registrazione
    if (typeof setupPhoneInput === 'function') {
        setupPhoneInput(document.getElementById('regTelefono'));
    }
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
    if (isRegister) window._regFormStartedAt = Date.now();
    _hideAuthFeedback();
};

// ── Anon session + funnel tracking (auth_modal_opens) ────
// Pseudonimo, niente IP/UA. Dedup per (source, anon_session, time_bucket=minuto).
function _getAnonSession() {
    try {
        let s = sessionStorage.getItem('_amo_session');
        if (!s) {
            s = (window.crypto && crypto.randomUUID && crypto.randomUUID()) ||
                (Math.random().toString(36).slice(2) + Date.now().toString(36));
            sessionStorage.setItem('_amo_session', s);
        }
        return s;
    } catch (_) { return ''; }
}

const _AMO_VALID_SOURCES = ['popup_vetrina','blog_promo','vendi_submit','nav_accedi','salva_preferito','valutatore_create','welcome_popup','tel_reveal','direct','chat_click','whatsapp_click','call_click'];

async function _trackModalOpen(source) {
    try {
        if (!_AMO_VALID_SOURCES.includes(source)) source = 'direct';
        const anonSession = _getAnonSession();
        if (!anonSession) return;
        const d = new Date();
        const tb = `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}${String(d.getUTCHours()).padStart(2,'0')}${String(d.getUTCMinutes()).padStart(2,'0')}`;
        // Insert via PostgREST. UNIQUE violation = dedup OK (silenzioso).
        // Errori RLS o rete: silent fail — il tracking NON deve mai bloccare l'UX.
        await _supabase
            .from('auth_modal_opens')
            .insert({ source, anon_session: anonSession, time_bucket: tb });
    } catch (_) { /* silent */ }
}

// ── Open / Close ─────────────────────────────────────────
window.openAuthModal = function (tab, contextMsg, source) {
    initAuthModal();
    switchAuthTab(tab || 'login');
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Banner contestuale: spiega perché il modal si è aperto (es. "manca solo l'ultimo passo")
    const ctxBanner = document.getElementById('authContextBanner');
    const ctxMsg = document.getElementById('authContextMsg');
    if (ctxBanner && ctxMsg) {
        if (contextMsg) {
            ctxMsg.textContent = contextMsg;
            ctxBanner.classList.remove('hidden');
        } else {
            ctxBanner.classList.add('hidden');
            ctxMsg.textContent = '';
        }
    }
    // Funnel tracking: registra l'apertura (silent fail). Source 'direct' se omessa.
    _trackModalOpen(source || 'direct');
};

window.closeAuthModal = function () {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    ['loginEmail','loginPassword','regNome','regCognome','regEmail','regTelefono','regPassword','forgotEmail']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const ctxBanner = document.getElementById('authContextBanner');
    if (ctxBanner) ctxBanner.classList.add('hidden');
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
        <div class="text-4xl mb-3">🏪</div>
        <h2 class="text-xl font-black text-slate-800 mb-2">Vendi il tuo posteggio?</h2>
        <p class="text-sm text-slate-500 mb-5 leading-relaxed">
          Iscriviti <span class="font-bold text-blue-600">gratis</span> e pubblica il tuo annuncio in pochi minuti. Raggiungi chi cerca posteggi e licenze in tutta Italia.
        </p>
        <button onclick="closeVisitorPopup(); sessionStorage.setItem('_reg_src','popup_vetrina'); openAuthModal('register', undefined, 'popup_vetrina')"
          class="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] mb-3">
          Registrati gratis →
        </button>
        <button onclick="closeVisitorPopup()" class="text-xs text-slate-400 hover:text-slate-600 transition">
          Esplora prima gli annunci
        </button>
      </div>
    </div>`);
}

function _isOnVendiPage() {
    try {
        const p = (location.pathname || '').toLowerCase();
        return p === '/vendi' || p === '/vendi.html' || p.endsWith('/vendi') || p.endsWith('/vendi.html');
    } catch (_) { return false; }
}

function _isAuthModalOpen() {
    const overlay = document.getElementById('authOverlay');
    return !!(overlay && !overlay.classList.contains('hidden'));
}

function _scheduleVisitorPopup() {
    if (sessionStorage.getItem('_vp')) return;
    // Mai distrarre l'utente durante la pubblicazione di un annuncio
    if (_isOnVendiPage()) return;
    const fire = async function() {
        if (sessionStorage.getItem('_vp')) return;
        if (_isOnVendiPage()) return;
        try {
            const { data } = await _supabase.auth.getSession();
            if (data?.session) return;
        } catch (_) {}
        // Modal auth aperto = utente sta gia registrandosi/loggando: ritenta tra 3s.
        // Se si logga, onAuthStateChange chiama _suppressVisitorPopup e _vp blocca.
        // Se chiude senza loggarsi, al prossimo check il popup partira.
        if (_isAuthModalOpen()) {
            setTimeout(fire, 3000);
            return;
        }
        sessionStorage.setItem('_vp', '1');
        _injectVisitorPopup();
        const el = document.getElementById('visitorPopup');
        if (el) { el.classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
    };
    setTimeout(fire, 8000);
}

function _suppressVisitorPopup() {
    sessionStorage.setItem('_vp', '1');
    const el = document.getElementById('visitorPopup');
    if (el) {
        el.classList.add('hidden');
        document.body.style.overflow = '';
    }
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
          <p class="text-sm font-bold text-amber-700">📣 Pubblica il tuo primo annuncio</p>
          <p class="text-xs text-amber-600 mt-1">È gratis e bastano due minuti.</p>
        </div>
        <button onclick="closeWelcomeNewPopup(); window.location.href='/vendi'"
          class="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] mb-3">
          Pubblica un annuncio →
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
async function _storePasswordCredential(email, password, name = '') {
    try {
        if (!email || !password) return;
        if (!window.PasswordCredential || !navigator.credentials?.store) return;
        const cred = new PasswordCredential({
            id: email,
            password,
            name: name || email
        });
        await navigator.credentials.store(cred);
    } catch (_) {}
}

window.handleLogin = async function (e) {
    e.preventDefault();
    _hideAuthFeedback();
    _setBtnLoading('loginBtn', true, '<i class="fas fa-sign-in-alt"></i> Accedi');

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout')), 12000)
    );

    try {
        const { error } = await Promise.race([
            _supabase.auth.signInWithPassword({ email, password }),
            timeout
        ]);
        _setBtnLoading('loginBtn', false, '<i class="fas fa-sign-in-alt"></i> Accedi');

        if (error) {
            _showAuthError('Email o password non corretti. Riprova.');
            return;
        }

        await _storePasswordCredential(email, password, email);
        await _linkValutatoreSession();
        if (typeof window.processPendingSaveListing === 'function') {
            window.processPendingSaveListing().catch(() => {});
        } else if (typeof window.loadSavedListingsCache === 'function') {
            window.loadSavedListingsCache().catch(() => {});
        }
        if (_checkPostAuthIntent()) return; // redirect al report → stop
        closeAuthModal();
        updateAuthNav();
        if (typeof window.__onLoginSuccess === 'function') {
            window.__onLoginSuccess();
            window.__onLoginSuccess = null;
        }
    } catch (err) {
        _setBtnLoading('loginBtn', false, '<i class="fas fa-sign-in-alt"></i> Accedi');
        const msg = (err?.message || '').toLowerCase().includes('timeout')
            ? 'Login lento: ricarica la pagina e riprova.'
            : 'Errore di connessione. Riprova tra poco.';
        _showAuthError(msg);
    }
};

// ── Register ─────────────────────────────────────────────
window.handleRegister = async function (e) {
    e.preventDefault();
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn?.disabled) return;
    _hideAuthFeedback();
    _setBtnLoading('registerBtn', true, '<i class="fas fa-user-plus"></i> Crea account');

    // Bot trap: honeypot riempito o submit < 2.5s = bot. Finto successo per non rivelare la trappola.
    const honeypot = document.getElementById('regWebsite')?.value || '';
    const formAge  = Date.now() - (window._regFormStartedAt || 0);
    if (honeypot.trim() || formAge < 2500) {
        await new Promise(r => setTimeout(r, 1200));
        _showAuthSuccess('Benvenuto! Account creato con successo.');
        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');
        setTimeout(() => closeAuthModal(), 1500);
        return;
    }

    let nome     = document.getElementById('regNome').value.trim();
    let cognome  = document.getElementById('regCognome').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const telRaw   = document.getElementById('regTelefono').value.trim();
    const password = document.getElementById('regPassword').value;

    // Sanitize: se l'utente ha messo nome+cognome insieme nel campo nome
    // (es. nome="Gianfranco Dona", cognome="Dona") rimuovi il cognome dal nome.
    // Match per parola (case-insensitive) e solo se cognome compare in coda.
    if (nome && cognome) {
        const words = nome.split(/\s+/);
        const last = words[words.length - 1] || '';
        if (words.length > 1 && last.toLowerCase() === cognome.toLowerCase()) {
            nome = words.slice(0, -1).join(' ').trim();
        }
    }

    // Telefono opzionale, ma se compilato deve essere valido
    if (telRaw && !isValidItalianPhone(telRaw)) {
        _showAuthError('Numero non valido. Esempi: 347 1234567 · +39 347 1234567 · 06 1234567');
        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');
        return;
    }
    const telefono = telRaw ? normalizePhone(telRaw) : '';

    try {
        // Popup di benvenuto: mostrato solo per le sorgenti popup/promo.
        // Retro-compat: accetta anche il vecchio valore 'popup' nel caso fosse residuo in sessione.
        const _regSrc = sessionStorage.getItem('_reg_src');
        const _showWelcome = _regSrc === 'popup_vetrina' || _regSrc === 'blog_promo' || _regSrc === 'popup';
        await _registerBypass(email, password, nome, cognome, telefono, _showWelcome);
    } catch (err) {
        _showAuthError('Errore durante la registrazione.');
    } finally {
        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');
    }
};

// ── Register helpers ─────────────────────────────────────
async function _linkValutatoreSession() {
    const token = localStorage.getItem('_val_session');
    if (!token) return;
    try {
        await _supabase.rpc('link_valutatore_to_user', { p_session_token: token });
    } catch (_) {}
}

// Se l'utente aveva cliccato "Crea account" dal valutatore, dopo signup va alla
// dashboard sulla tab "Valutazioni" (dove troverà il report appena salvato),
// con la valutazione corrente evidenziata.
function _checkPostAuthIntent() {
    let intent = null;
    try { intent = sessionStorage.getItem('_post_auth_intent'); } catch (_) {}
    if (intent === 'valutatore_save') {
        try {
            sessionStorage.removeItem('_post_auth_intent');
            const session = localStorage.getItem('_val_session') || '';
            if (session) sessionStorage.setItem('_highlight_session', session);
        } catch (_) {}
        location.href = '/dashboard#valutazioni';
        return true;
    }
    return false;
}

async function _afterRegisterSuccess(nome, showWelcome = false) {
    _suppressVisitorPopup();
    // Aspetta il link valutatore prima di un eventuale redirect al report
    await _linkValutatoreSession();
    // Linka l'anon_session corrente al signup (tracking funnel by source).
    // Silent fail: il tracking non deve mai bloccare il flusso registrazione.
    try {
        const anonSession = sessionStorage.getItem('_amo_session');
        if (anonSession) {
            await _supabase.rpc('amo_link_signup', { p_anon_session: anonSession });
        }
    } catch (_) { /* silent */ }
    const user = await getCurrentUser();
    _profileCache = { id: user?.id, nome };
    _showAuthSuccess('Benvenuto! Account creato con successo.');
    // Salva annuncio se l'utente aveva cliccato "preferiti" da anonimo
    if (typeof window.processPendingSaveListing === 'function') {
        window.processPendingSaveListing().catch(() => {});
    }
    setTimeout(() => {
        if (_checkPostAuthIntent()) return; // redirect al report → stop
        closeAuthModal();
        updateAuthNav();
        if (showWelcome && user?.id) _showWelcomeNewPopup(user.id);
        if (typeof window.__onLoginSuccess === 'function') {
            window.__onLoginSuccess();
            window.__onLoginSuccess = null;
        }
    }, 1500);
}

async function _registerBypass(email, password, nome, cognome, telefono, showWelcome = false) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const res = await fetch(`${SUPABASE_URL}/functions/v1/register-bypass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email: cleanEmail, password, nome, cognome, telefono, website: '' }),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status === 409 || res.status >= 500) {
                const { data: si, error: siErr } = await _supabase.auth.signInWithPassword({ email: cleanEmail, password });
                if (!siErr && si?.session) {
                    await _storePasswordCredential(cleanEmail, password, `${nome || ''} ${cognome || ''}`.trim() || cleanEmail);
                    await _afterRegisterSuccess(nome, showWelcome);
                    return;
                }
                if (res.status >= 500) {
                    const recovered = await _registerWithSupabaseAuth(cleanEmail, password, nome, cognome, telefono, showWelcome);
                    if (recovered) return;
                    _showAuthError('Registrazione temporaneamente non disponibile. Riprova tra poco o accedi se hai già creato l\'account.');
                    return;
                }
            }
            _showAuthError(result.error || 'Errore durante la registrazione.');
            return;
        }
        // Account creato — ora accedi
        const { data: si, error: siErr } = await _supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (siErr || !si?.session) {
            _showAuthSuccess('Account creato! Accedi con le tue credenziali.');
            setTimeout(() => switchAuthTab('login'), 2000);
            return;
        }
        await _storePasswordCredential(cleanEmail, password, `${nome || ''} ${cognome || ''}`.trim() || cleanEmail);
        await _afterRegisterSuccess(nome, showWelcome);
    } catch (_) {
        _showAuthError('Errore durante la registrazione. Riprova.');
    }
}

async function _registerWithSupabaseAuth(email, password, nome, cognome, telefono, showWelcome = false) {
    try {
        const { data, error } = await _supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nome: nome || '', cognome: cognome || '', telefono: telefono || '' }
            }
        });
        if (error) return false;

        if (data?.session) {
            const userId = data.session.user.id;
            await _supabase.from('profiles').upsert({
                id: userId,
                nome: nome || '',
                cognome: cognome || '',
                telefono: telefono || ''
            });
            await _storePasswordCredential(email, password, `${nome || ''} ${cognome || ''}`.trim() || email);
            await _afterRegisterSuccess(nome, showWelcome);
            return true;
        }

        // signUp senza sessione immediata: prova comunque il login diretto
        // (succede quando Supabase ha email-confirm ON, ma il bypass non era disponibile)
        const { data: si, error: siErr } = await _supabase.auth.signInWithPassword({ email, password });
        if (!siErr && si?.session) {
            await _storePasswordCredential(email, password, `${nome || ''} ${cognome || ''}`.trim() || email);
            await _afterRegisterSuccess(nome, showWelcome);
            return true;
        }

        await _storePasswordCredential(email, password, `${nome || ''} ${cognome || ''}`.trim() || email);
        _showAuthSuccess('Account creato! Accedi con le tue credenziali.');
        setTimeout(() => switchAuthTab('login'), 2500);
        return true;
    } catch (_) {
        return false;
    }
}

// ── Forgot Password ──────────────────────────────────────
window.handleForgotPassword = async function (e) {
    e.preventDefault();
    _hideAuthFeedback();
    _setBtnLoading('forgotBtn', true, '<i class="fas fa-paper-plane"></i> Invia link');
    const email = document.getElementById('forgotEmail').value.trim();
    try {
        const { error } = await _supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://subingresso.it/reset-password'
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

    // SECURITY: pulizia di TUTTE le cache profilo per evitare leak cross-user su
    // device condivisi. Include sia chiavi legacy (non scope-ate) sia chiavi
    // scope-ate per user_id (`_vc_nome_u_<id>`, `_profile_nome_u_<id>`, ecc.).
    try {
        // Chiavi legacy globali (pre-fix)
        ['_vc_nome','_vc_tel','_profile_nome','_profile_tel','subingresso_draft_v1']
            .forEach(k => localStorage.removeItem(k));
        // Tutte le chiavi scope-ate per user_id e tutta la cache di sessione vendi
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k) continue;
            if (k.startsWith('_vc_nome_u_') || k.startsWith('_vc_tel_u_') ||
                k.startsWith('_profile_nome_u_') || k.startsWith('_profile_tel_u_')) {
                toRemove.push(k);
            }
        }
        toRemove.forEach(k => localStorage.removeItem(k));
        sessionStorage.removeItem('_last_prefill_user');
    } catch (e) { console.warn('signOut cache cleanup failed:', e); }

    // Pulizia estrema: svuota il contenuto protetto se presente e reindirizza alla home
    const dash = document.getElementById('dashContent');
    if (dash) dash.innerHTML = '';

    // Reindirizzamento universale alla home per azzerare lo stato JS
    window.location.href = '/';
};

// ── Get current user ─────────────────────────────────────
window.getCurrentUser = async function () {
    try {
        const { data } = await _supabase.auth.getUser();
        return data?.user;
    } catch (e) { return null; }
};

// ── Require auth — shows modal if not logged in ──────────
window.requireAuth = function (callback, source) {
    const _src = source || 'direct';
    _supabase.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (user) {
            callback(user);
        } else {
            window.__onLoginSuccess = () => _supabase.auth.getUser().then(({ data }) => {
                const u = data?.user;
                if (u) callback(u);
            });
            openAuthModal('login', undefined, _src);
        }
    }).catch(() => {
        openAuthModal('login', undefined, _src);
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
            <button onclick="openAuthModal('login', undefined, 'nav_accedi')"
                class="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all duration-300">
                Accedi
            </button>`;
        _scheduleVisitorPopup();
        return;
    }

    // Fase 2: utente loggato — mostra icone subito, poi aggiorna badge in background
    _suppressVisitorPopup();
    // Carica cache preferiti per il rendering dei cuoricini sulle card
    if (typeof window.loadSavedListingsCache === 'function') {
        window.loadSavedListingsCache().catch(() => {});
    }
    const user = session.user;
    const msgIconId = 'navMsgIcon_' + Date.now();
    nav.innerHTML = `
        <a href="/messaggi" title="Messaggi"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 flex items-center justify-center shrink-0">
            <i class="fas fa-comment-alt text-sm"></i>
            <span id="${msgIconId}"></span>
        </a>
        <a href="/dashboard" title="Area personale"
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
                    sessionStorage.removeItem('_reg_src');
                    _supabase.from('profiles')
                        .upsert({ id: user.id, nome: meta.nome || '', cognome: meta.cognome || '', telefono: meta.telefono || '' })
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
    _supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) _suppressVisitorPopup();
        updateAuthNav();
    });
} catch (e) {}

})();
