window.AdminEmailAnalytics = (() => {
 'use strict';
 let owner = null, request = 0, days = 30, busy = false, watching = false;
 const el = id => document.getElementById(id), esc = s => escapeHTML(String(s ?? ''));
 const number = n => Number(n || 0).toLocaleString('it-IT');
 const money = n => new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR'}).format(Number(n || 0) / 100);
 const rate = (n, total) => total ? new Intl.NumberFormat('it-IT', {style:'percent', maximumFractionDigits:1}).format(n / total) : null;
 const kinds = {offer_open:'Apre la Vetrina', offer_close:'Chiude la proposta', tier_select:'Cambia durata', listing_select:'Sceglie gli annunci', checkout_attempt:'Prova a pagare', checkout_error:'Errore apertura pagamento', email_landing:'Arriva dall’email', checkout_cancel:'Torna da Annulla'};
 const contentIds = ['mailAnalyticsMetrics','mailDeliveryChart','mailEngagementChart','mailPaymentChart','mailSiteFunnel','mailSiteSecondary','mailTierChoices','mailTrackingSince','mailVariantRows','mailLegacyHistory','mailRecentEvents','mailSampleStatus','mailAnalyticsUpdated','mailMeasurementNote','mailRefunds'];

 function status(text) { if (el('mailAnalyticsStatus')) el('mailAnalyticsStatus').textContent = text; }
 function toggleDetails() {
  const open = el('mailAdvanced').hidden;
  el('mailAdvanced').hidden = !open;
  el('mailDetailsToggle').setAttribute('aria-expanded', String(open));
  el('mailDetailsToggle').innerHTML = (open ? 'Chiudi statistiche' : 'Statistiche complete') + ' <span aria-hidden="true">' + (open ? '−' : '+') + '</span>';
 }
 function reset() {
  contentIds.forEach(id => { if (el(id)) el(id).replaceChildren(); });
  if (!el('mailAdvanced').hidden) toggleDetails();
  el('mailAdvanced').querySelectorAll('details').forEach(node => { node.open = false; });
 }
 // The text carries the value; the decorative bar is an exact share, never a minimum stub at zero.
 function track(value, total, muted = false) {
  const width = total > 0 ? Math.min(100, Math.max(0, value / total * 100)) : 0;
  return '<span class="mail-chart-track" aria-hidden="true"><span class="mail-chart-fill"' + (muted ? ' data-tone="muted"' : '') + ' style="width:' + width + '%"></span></span>';
 }
 function bar(label, value, total, options = {}) {
  const missing = value === null;
  const formatted = missing ? '—' : number(value);
  const suffix = options.percent && !missing && total > 0 ? ' · ' + rate(value, total) : '';
  return '<div class="mail-chart-row"' + (missing ? ' data-missing="true"' : '') + '><div class="mail-chart-label"><span>' + esc(label) + '</span><strong>' + esc(formatted + suffix) + '</strong></div>' + track(missing ? 0 : value, total, options.muted) + '</div>';
 }
 function render(data, period) {
  const email = data.email, site = data.site, history = data.history;
  const metric = (label, value, sub = '') => '<div><dt>' + label + '</dt><dd>' + esc(value) + '</dd>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</div>';
  el('mailAnalyticsMetrics').innerHTML =
   metric('Inviate', number(email.sent)) +
   metric('Aperte', email.measured ? number(email.opened) : '—', email.measured ? rate(email.opened, email.measured) + ' delle misurabili' : 'Non disponibili') +
   metric('Clic', email.measured ? number(email.clicked) : '—', email.measured ? rate(email.clicked, email.measured) + ' delle misurabili' : 'Non disponibili') +
   metric('Incassi da email', money(email.revenue_cents), number(email.paid) + (email.paid === 1 ? ' acquisto' : ' acquisti'));

  const pending = Math.max(0, email.sent - email.delivered);
  el('mailDeliveryChart').innerHTML =
   '<div class="mail-chart-total"><strong>' + number(email.delivered) + '</strong><span>consegnate su ' + number(email.sent) + '</span></div>' +
   track(email.delivered, email.sent) +
   '<p class="mail-chart-foot">' + (email.sent ? rate(email.delivered, email.sent) + ' consegnate' + (pending ? ' · ' + number(pending) + ' da confermare' : '') : 'Nessun invio nel periodo.') + '</p>' +
   '<p class="mail-chart-foot">Accettate dal server del destinatario.</p>';
  el('mailEngagementChart').innerHTML =
   bar('Aperture', email.measured ? email.opened : null, email.measured, {percent:true}) +
   bar('Clic sul collegamento', email.measured ? email.clicked : null, email.measured, {percent:true}) +
   '<p class="mail-chart-foot">' + (email.measured ? 'Su ' + number(email.measured) + ' email misurabili' + (email.unmeasured ? ' · ' + number(email.unmeasured) + ' senza dati.' : '.') : email.sent ? 'Email inviate senza misurazione di aperture e clic.' : 'I risultati compariranno dopo i primi invii misurabili.') + '</p>';
  el('mailMeasurementNote').textContent = email.unmeasured
   ? number(email.unmeasured) + ' email inviate senza misurazione: aperture e clic non sono ricostruibili. La misurazione richiede il consenso informato del destinatario.'
   : 'Le aperture e i clic rilevati non certificano una lettura o una persona.';
  el('mailRefunds').textContent = 'Rimborsi sugli acquisti da email: ' + money(email.refunded_cents) + '.';

  // These are independent period totals: people and orders are labelled separately, not a conversion funnel.
  const steps = [['Aprono la proposta · utenti', site.opened], ['Provano a pagare · utenti', site.attempts], ['Pagamenti avviati · ordini', site.checkouts], ['Acquisti · ordini', site.paid]];
  const maximum = Math.max(1, ...steps.map(([, value]) => value));
  el('mailSiteFunnel').innerHTML = steps.map(([label, value]) => '<li>' + bar(label, value, maximum) + '</li>').join('');
  const secondary = [['Chiudono la proposta', site.closed], ['Ritorni da Annulla', site.cancelled], ['Non completati', site.incomplete], ['In attesa', site.pending], ['Errori apertura', site.errors], ['Incassi sul sito', money(site.revenue_cents)]];
  el('mailSiteSecondary').innerHTML = secondary.map(([label, value]) => '<span>' + esc(label) + '<strong>' + (typeof value === 'number' ? number(value) : esc(value)) + '</strong></span>').join('') +
   (site.checkouts ? '<span>Pagamenti completati<strong>' + rate(site.paid, site.checkouts) + '</strong></span>' : '');
  el('mailTierChoices').textContent = data.choices.length ? 'Durate provate: ' + data.choices.map(row => (row.tier ? row.tier.replace('d',' giorni') : 'gratuita') + ' · ' + number(row.users) + ' utenti').join('; ') + '. Un utente può provare più durate.' : 'Nessuna scelta di durata rilevata.';
  el('mailTrackingSince').textContent = 'Percorso rilevato dal ' + new Date(data.tracking_started_at).toLocaleDateString('it-IT') + '.';

  const orderStates = [['Acquistati', history.paid], ['Non completati', history.incomplete], ['In attesa', history.pending]];
  el('mailPaymentChart').innerHTML = '<div class="mail-chart-total"><strong>' + number(history.checkouts) + '</strong><span>pagamenti avviati</span></div>' +
   orderStates.map(([label,value]) => bar(label, value, history.checkouts, {muted:label !== 'Acquistati'})).join('');
  el('mailLegacyHistory').textContent = 'Un pagamento scaduto o non completato non dimostra un clic su Annulla.';
  el('mailVariantRows').innerHTML = data.variants.length ? data.variants.map(row => '<tr><td>' + (row.family === 'bundle' ? 'Pacchetto' : 'Singolo') + ' · ' + (row.variant + 1) + '</td><td>' + number(row.sent) + '</td><td>' + number(row.delivered) + '</td><td>' + (row.measured ? number(row.opened) : '—') + '</td><td>' + (row.measured ? number(row.clicked) : '—') + '</td><td>' + number(row.paid) + '</td><td>' + money(row.revenue_cents) + '</td></tr>').join('') : '<tr><td colspan="7">Nessuna campagna in questo periodo.</td></tr>';
  el('mailRecentEvents').innerHTML = data.recent.length ? data.recent.map(row => '<li><span>' + esc(row.nome || 'Venditore') + ' · ' + (kinds[row.kind] || 'Azione Vetrina') + (row.tier ? ' · ' + esc(row.tier.replace('d',' giorni')) : '') + '</span><time>' + esc(new Date(row.created_at).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})) + '</time></li>').join('') : '<li>Nessuna azione rilevata nel periodo.</li>';
  const sample = data.sample;
  el('mailSampleStatus').textContent = sample
   ? 'La tua copia: ' + (sample.delivery_confirmed ? 'consegnata' : sample.status === 'sent' ? 'accettata dal servizio' : 'esito da verificare') + ' · ' + (sample.opened ? 'apertura rilevata' : 'nessuna apertura rilevata') + ' · ' + (sample.clicked ? 'clic rilevato' : 'nessun clic rilevato') + '. È esclusa dai risultati.'
   : 'Invia una copia solo al tuo indirizzo admin. Usa un annuncio pubblico d’esempio ed è esclusa dai risultati.';
  const scope = period ? 'Ultimi ' + period + ' giorni' : 'Tutto lo storico';
  el('mailAnalyticsUpdated').textContent = scope + ' · Dati alle ' + new Date(data.checked_at).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
 }
 async function load() {
  if (!owner) return;
  const uid = owner, seq = ++request, period = days;
  el('email-vetrine').setAttribute('aria-busy', 'true');
  try {
   const result = await _supabase.rpc('admin_vetrina_conversion_stats', {p_days:period});
   if (owner !== uid || seq !== request) return;
   if (result.error || !result.data) throw Error();
   render(result.data, period);
   status('');
  } catch {
   if (owner === uid && seq === request) status('Statistiche non disponibili. Premi Aggiorna per riprovare. I dati precedenti restano visibili.');
  } finally {
   if (owner === uid && seq === request) el('email-vetrine').setAttribute('aria-busy', 'false');
  }
 }
 async function action(kind) {
  if (!owner || busy) return;
  busy = true;
  const uid = owner;
  for (const id of ['mailRefresh','mailSendSample']) el(id).disabled = true;
  status(kind === 'sample' ? 'Invio della tua copia…' : 'Aggiornamento delle consegne…');
  try {
   const {data:{session}} = await _supabase.auth.getSession();
   if (!session || session.user.id !== uid || owner !== uid) return;
   const response = await fetch(SUPABASE_URL + '/functions/v1/admin-email-analytics', {method:'POST', headers:{apikey:SUPABASE_ANON_KEY, Authorization:'Bearer ' + session.access_token, 'Content-Type':'application/json'}, body:JSON.stringify({action:kind}), signal:AbortSignal.timeout(120000)});
   const result = await response.json();
   if (owner !== uid) return;
   if (!response.ok) throw Error(result.error || 'Operazione non disponibile.');
   await load();
   if (owner !== uid) return;
   status(kind === 'sample' ? result.message : result.failed ? 'Alcune consegne non sono state aggiornate. I dati precedenti restano visibili.' : 'Consegne aggiornate.');
  } catch (error) {
   if (owner === uid) status(error.name === 'TimeoutError' ? 'Aggiornamento lento: verifica prima di riprovare.' : error.message || 'Operazione non disponibile.');
  } finally {
   busy = false;
   if (owner === uid) for (const id of ['mailRefresh','mailSendSample']) el(id).disabled = false;
  }
 }
 function start(user) {
  if (!el('email-vetrine')) return;
  if (owner !== user.id) reset();
  owner = user.id;
  el('email-vetrine').hidden = false;
  if (!watching) {
   watching = true;
   _supabase.auth.onAuthStateChange((_event, session) => {
    if (owner && session?.user?.id !== owner) {
     owner = null;
     request++;
     el('email-vetrine').hidden = true;
     el('email-vetrine').setAttribute('aria-busy', 'false');
     reset();
    }
   });
  }
  load().then(() => { if (owner === user.id && location.hash === '#email-vetrine') el('email-vetrine').scrollIntoView({block:'start'}); });
 }
 return {
  start, toggleDetails,
  setDays(value) { days = [0,7,30,90].includes(Number(value)) ? Number(value) : 30; load(); },
  refresh: () => action('sync'),
  sample: () => action('sample')
 };
})();
