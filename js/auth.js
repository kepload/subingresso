// ============================================================
//  Subingresso.it — Sistema di Autenticazione
//  Gestisce: login, registrazione, sessione, navbar dinamica
// ============================================================

(function () {

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
      <p class="text-center text-xs text-slate-400 font-medium pt-1">
        Non hai un account?
        <button type="button" onclick="switchAuthTab('register')" class="text-blue-600 font-bold hover:underline">Registrati gratis</button>
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
    const isLogin = tab === 'login';
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    
    if (loginForm) loginForm.classList.toggle('hidden', !isLogin);
    if (registerForm) registerForm.classList.toggle('hidden', isLogin);
    if (tabLogin) tabLogin.className =
        `flex-1 py-5 text-sm font-black tracking-tight transition ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'}`;
    if (tabRegister) tabRegister.className =
        `flex-1 py-5 text-sm font-black tracking-tight transition ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'}`;
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

        if (data?.user) {
            await _supabase.from('profiles').upsert({ id: data.user.id, nome, cognome, telefono });
        }

        _showAuthSuccess('Account creato! Controlla la tua email per confermare, poi accedi.');
        setTimeout(() => switchAuthTab('login'), 4000);
    } catch (err) {
        _setBtnLoading('registerBtn', false, '<i class="fas fa-user-plus"></i> Crea account');
        _showAuthError('Errore durante la registrazione.');
    }
};

// ── Sign out ─────────────────────────────────────────────
window.signOut = async function () {
    await _supabase.auth.signOut();
    updateAuthNav();
    const protectedPages = ['dashboard.html', 'messaggi.html'];
    if (protectedPages.some(p => location.pathname.endsWith(p))) {
        location.href = 'index.html';
    }
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

    let user = null;
    try {
        const { data } = await _supabase.auth.getUser();
        user = data?.user;
    } catch (e) {}

    if (!user) {
        nav.innerHTML = `
            <button onclick="openAuthModal('login')"
                class="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all duration-300">
                Accedi
            </button>
            <button onclick="openAuthModal('register')"
                class="hidden sm:block bg-blue-600 text-white px-5 py-2.5 rounded-[14px] text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                Registrati
            </button>`;
    } else {
        let nome = user.email.split('@')[0];
        try {
            const { data: profile } = await _supabase.from('profiles').select('nome').eq('id', user.id).single();
            if (profile?.nome) nome = profile.nome;
        } catch (e) {}
        
        const initial = nome.charAt(0).toUpperCase();

        let unread = 0;
        try {
            const { data: convs } = await _supabase
                .from('conversazioni')
                .select('id')
                .or(`acquirente_id.eq.${user.id},venditore_id.eq.${user.id}`);
            if (convs && convs.length > 0) {
                const convIds = convs.map(c => c.id);
                const { count } = await _supabase
                    .from('messaggi')
                    .select('id', { count: 'exact', head: true })
                    .eq('letto', false)
                    .neq('mittente_id', user.id)
                    .in('conversazione_id', convIds);
                unread = count || 0;
            }
        } catch (_) {}

        nav.innerHTML = `
            <a href="dashboard.html"
                class="text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-50 transition-all duration-300 flex items-center gap-2">
                <div class="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-black">
                    ${initial}
                </div>
                <span>Area Personale</span>
            </a>`;
    }
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
