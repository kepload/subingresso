// ============================================================
//  Subingresso.it — Edge Function: Gestione unsubscribe email
//  Chiamata da unsubscribe.html?t=TOKEN&type=digest|stats|all
//  Imposta a false la preferenza corrispondente senza login.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const { token, type } = await req.json();
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ ok: false, error: 'Token mancante' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }
    if (!['digest', 'stats', 'all'].includes(type)) {
      return new Response(JSON.stringify({ ok: false, error: 'Type non valido' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    return new Response(JSON.stringify({ ok: true, type }), {
      status: 200, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('email-unsubscribe error:', e);
    return new Response(JSON.stringify({ ok: false, error: 'Errore interno' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
