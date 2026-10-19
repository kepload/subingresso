import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runFairReminders } from '../_shared/fair-reminder-mail.mjs';

const URL = Deno.env.get('SUPABASE_URL')!;
const SECRET = Deno.env.get('SB_SECRET_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

Deno.serve(async request => {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'POST') return json({ error: 'Metodo non consentito.' }, 405);
    try {
        const body = await request.json();
        if (!SECRET) return json({ error: 'Servizio non configurato.' }, 503);
        const client = createClient(URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
        if (body.action === 'unsubscribe') {
            if (typeof body.token !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.token)) return json({ error: 'Token non valido.' }, 400);
            const result = await client.rpc('stop_fair_reminders', { p_token: body.token });
            if (result.error) return json({ error: 'Impossibile disattivare il promemoria.' }, 503);
            return json({ ok: true });
        }
        if (request.headers.get('authorization') !== 'Bearer ' + SECRET) return json({ error: 'Unauthorized' }, 401);
        const result = await runFairReminders(client, {
            apiKey: Deno.env.get('RESEND_API_KEY'), dryRun: body.dry_run === true,
            pause: (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
        });
        return json({ ok: true, ...result });
    } catch (_) { return json({ error: 'Promemoria momentaneamente non disponibili.' }, 503); }
});
