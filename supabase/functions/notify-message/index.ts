// ============================================================
//  Subingresso.it — Edge Function: notifica email nuovo messaggio
//  Trigger: Database Webhook su INSERT nella tabella `messaggi`
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY          = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL              = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                = 'https://subingresso.it';

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await req.json();

    // Accetta solo INSERT su messaggi
    if (payload.type !== 'INSERT' || payload.table !== 'messaggi') {
      return new Response('Ignored', { status: 200 });
    }

    const msg = payload.record as {
      id: string;
      conversazione_id: string;
      mittente_id: string;
      testo: string;
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Recupera la conversazione per trovare il destinatario
    const { data: conv } = await supabase
      .from('conversazioni')
      .select('acquirente_id, venditore_id, annuncio:annunci(titolo)')
      .eq('id', msg.conversazione_id)
      .single();

    if (!conv) return new Response('Conv not found', { status: 200 });

    const recipientId = msg.mittente_id === conv.acquirente_id
      ? conv.venditore_id
      : conv.acquirente_id;

    // 2. Email del destinatario (da auth.users via service role)
    const { data: { user: recipient } } = await supabase.auth.admin.getUserById(recipientId);
    if (!recipient?.email) return new Response('No recipient email', { status: 200 });

    // 3. Nome mittente da profiles
    const { data: sender } = await supabase
      .from('profiles')
      .select('nome, cognome')
      .eq('id', msg.mittente_id)
      .single();
    const senderName = sender
      ? `${sender.nome || ''} ${sender.cognome || ''}`.trim() || 'Un utente'
      : 'Un utente';

    const annuncioTitolo = (conv.annuncio as any)?.titolo || 'un annuncio';
    const testoPreview   = msg.testo.length > 200 ? msg.testo.slice(0, 200) + '…' : msg.testo;

    const senderNameSafe   = escapeHTML(senderName);
    const annuncioTitoloSafe = escapeHTML(annuncioTitolo);
    const testoPreviewSafe = escapeHTML(testoPreview);

    // 4. Invia email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   recipient.email,
        subject: `💬 Nuovo messaggio da ${senderName} — Subingresso.it`,
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
            <div style="background:#2563eb;padding:28px 32px;">
              <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
            </div>
            <div style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#0f172a;">Hai un nuovo messaggio</h2>
              <p style="margin:0 0 20px;color:#64748b;font-size:14px;">
                <strong style="color:#0f172a;">${senderNameSafe}</strong> ti ha scritto riguardo a <em>${annuncioTitoloSafe}</em>:
              </p>
              <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                <p style="margin:0;color:#334155;font-size:15px;line-height:1.6;">${testoPreviewSafe}</p>
              </div>
              <a href="${SITE_URL}/messaggi.html"
                 style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                Rispondi ora →
              </a>
            </div>
            <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Subingresso.it · La piattaforma italiana per la compravendita di concessioni mercatali<br>
                <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a> ·
                <a href="${SITE_URL}/termini.html" style="color:#94a3b8;">Termini</a>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', res.status, err);
      return new Response('Email error', { status: 500 });
    }

    console.log(`Email inviata a ${recipient.email} per messaggio di ${senderName}`);
    return new Response('OK', { status: 200 });

  } catch (e) {
    console.error('Errore edge function:', e);
    return new Response('Internal error', { status: 500 });
  }
});
