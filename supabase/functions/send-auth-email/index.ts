// ============================================================
//  Subingresso.it — Auth Hook: Send Email via Resend
//  Intercetta tutte le email di autenticazione Supabase
//  e le invia tramite Resend, bypassando il rate limit built-in.
//
//  Supabase Dashboard → Authentication → Hooks → Send Email
//  → HTTP → URL: .../functions/v1/send-auth-email
//  IMPORTANTE: "Verify JWT" deve essere DISATTIVATO
// ============================================================

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const FROM            = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL        = 'https://subingresso.it';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    const { user, email_data } = await req.json();
    if (!user?.email || !email_data) return ok();

    const { token_hash, token_hash_new, redirect_to, email_action_type, site_url } = email_data;
    const base = (site_url || '').replace(/\/$/, '');

    const link = (type: string, hash: string) => {
      const u = new URL(`${base}/auth/v1/verify`);
      u.searchParams.set('token', hash);
      u.searchParams.set('type', type);
      u.searchParams.set('redirect_to', redirect_to || SITE_URL);
      u.searchParams.set('apikey', SUPABASE_ANON_KEY);
      return u.toString();
    };

    let subject = '';
    let html    = '';

    switch (email_action_type) {
      case 'signup':
        subject = 'Conferma la tua email — Subingresso.it';
        html = template({
          title:    'Benvenuto su Subingresso.it!',
          body:     'Hai creato il tuo account. Clicca qui sotto per confermare l\'email e attivarlo.',
          cta:      'Conferma email',
          ctaLink:  link('signup', token_hash),
          footer:   'Se non hai creato nessun account, ignora questa email.',
        });
        break;

      case 'recovery':
        subject = 'Reimposta la tua password — Subingresso.it';
        html = template({
          title:    'Reimposta la password',
          body:     'Hai richiesto il reset della password del tuo account su Subingresso.it.',
          cta:      'Reimposta password',
          ctaLink:  link('recovery', token_hash),
          footer:   'Se non hai richiesto il reset, ignora questa email. Il link scade in 1 ora.',
        });
        break;

      case 'invite':
        subject = 'Sei stato invitato — Subingresso.it';
        html = template({
          title:    'Sei stato invitato!',
          body:     'Sei stato invitato a unirti a Subingresso.it, la piattaforma italiana per la compravendita di posteggi mercatali.',
          cta:      'Accetta invito',
          ctaLink:  link('invite', token_hash),
          footer:   'Se non ti aspettavi questo invito, ignora questa email.',
        });
        break;

      case 'magic_link':
        subject = 'Il tuo link di accesso — Subingresso.it';
        html = template({
          title:    'Accedi a Subingresso.it',
          body:     'Hai richiesto un link per accedere al tuo account. Valido per un solo utilizzo.',
          cta:      'Accedi ora',
          ctaLink:  link('magiclink', token_hash),
          footer:   'Il link scade in 1 ora. Se non eri tu, ignora questa email.',
        });
        break;

      case 'email_change_new':
      case 'email_change_current': {
        const hash = email_action_type === 'email_change_new' ? (token_hash_new || token_hash) : token_hash;
        subject = 'Conferma cambio email — Subingresso.it';
        html = template({
          title:    'Conferma il cambio email',
          body:     'Hai richiesto di cambiare l\'email del tuo account su Subingresso.it.',
          cta:      'Conferma cambio email',
          ctaLink:  link(email_action_type, hash),
          footer:   'Se non hai richiesto questo cambio, contattaci subito a info@subingresso.it.',
        });
        break;
      }

      default:
        return ok();
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [user.email], subject, html }),
    });

    if (!res.ok) console.error('Resend error:', await res.text());

    return ok();

  } catch (e) {
    console.error('send-auth-email error:', e);
    return ok(); // ritorna sempre 200 per non bloccare il flusso auth
  }
});

const ok = () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });

function template({ title, body, cta, ctaLink, footer }: {
  title: string; body: string; cta: string; ctaLink: string; footer: string;
}) {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:28px">
          <a href="${SITE_URL}" style="text-decoration:none">
            <span style="font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.5px">Subingresso<span style="color:#2563eb">.it</span></span>
          </a>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#ffffff;border-radius:20px;padding:40px 36px;border:1px solid #e2e8f0">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3">${title}</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.7">${body}</p>
          <a href="${ctaLink}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:800;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">${cta}</a>
          <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;line-height:1.6">
            Se il bottone non funziona, copia e incolla questo link nel browser:<br>
            <a href="${ctaLink}" style="color:#2563eb;word-break:break-all">${ctaLink}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0" align="center">
          <p style="margin:0;font-size:12px;color:#94a3b8">${footer}</p>
          <p style="margin:6px 0 0;font-size:12px;color:#cbd5e1">
            <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:none">subingresso.it</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
