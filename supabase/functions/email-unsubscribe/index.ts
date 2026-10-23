// ============================================================
//  Subingresso.it — Edge Function: Gestione unsubscribe email
//  Chiamata da unsubscribe.html?t=TOKEN&type=digest|stats|all
//  Imposta a false la preferenza corrispondente senza login.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization',
};

const REASONS = new Set(['too_many', 'not_relevant', 'not_using', 'already_found', 'other']);

async function completed(supabase: any, type: string, reason: unknown, extra: Record<string, unknown> = {}) {
  let feedbackSaved = false;
  // Optional feedback must never prevent an otherwise successful unsubscribe.
  if (typeof reason === 'string' && REASONS.has(reason)) {
    try {
      const saved = await supabase.from('email_unsubscribe_feedback').insert({ email_type: type, reason });
      feedbackSaved = !saved.error;
      if (saved.error) console.warn('Optional unsubscribe feedback not saved');
    } catch (_) { console.warn('Optional unsubscribe feedback unavailable'); }
  }
  return new Response(JSON.stringify({ ok: true, type, ...extra, feedback_saved: feedbackSaved }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return new Response(null, {status: 405, headers: {...CORS, Allow: 'POST, OPTIONS'}});

  try {
    const { token, type, reason } = await req.json();
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Token mancante' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
    if (!['digest', 'stats', 'all', 'bando_alert', 'promo', 'tracking'].includes(type)) {
      return new Response(JSON.stringify({ ok: false, error: 'Type non valido' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY);

    if (type === 'promo' || type === 'tracking') {
      const stopped = await supabase.rpc(type==='promo'?'stop_vetrina_offers':'stop_vetrina_email_tracking', {p_token:token});
      if (stopped.error) return new Response(JSON.stringify({ok:false,error:'Riprova per completare la disiscrizione.'}), {status:503,headers:{...CORS,'Content-Type':'application/json'}});
      if (stopped.data !== true) return new Response(JSON.stringify({ok:false,error:'Token non valido'}), {status:404,headers:{...CORS,'Content-Type':'application/json'}});
      return completed(supabase,type,reason);
    }

    // bando_alert: token vive su bando_alerts, l'unsub e' un DELETE della singola riga.
    if (type === 'bando_alert') {
      const { data, error } = await supabase
        .from('bando_alerts')
        .delete()
        .eq('unsub_token', token)
        .select('id, regione');
      if (error || !data || data.length === 0) {
        return new Response(JSON.stringify({ ok: false, error: 'Token non valido' }), {
          status: 404, headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
      return completed(supabase, type, reason, {regione: data[0].regione});
    }

    // digest/stats/all: token vive su profiles, flip flag email_*.
    const updates: Record<string, boolean> = {};
    if (type === 'digest' || type === 'all') updates.email_digest = false;
    if (type === 'stats'  || type === 'all') updates.email_stats  = false;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('unsub_token', token)
      .select('id');

    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: 'Token non valido' }), {
        status: 404, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'all') {
      const stopped = await supabase.rpc('stop_fair_reminders', { p_user_id: data[0].id });
      if (stopped.error) return new Response(JSON.stringify({ ok: false, error: 'Riprova per completare la disattivazione dei promemoria.' }), {
        status: 503, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    return completed(supabase, type, reason);
  } catch (e) {
    console.error('email-unsubscribe error:', e);
    return new Response(JSON.stringify({ ok: false, error: 'Errore interno' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
