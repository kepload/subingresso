// ============================================================
//  Subingresso.it — Configurazione Supabase
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';

// Inizializzazione client reale
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
