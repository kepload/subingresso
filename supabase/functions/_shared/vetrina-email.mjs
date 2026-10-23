import '../../../js/vetrina-pricing.js';
const Pricing=globalThis.VetrinaPricing;
const SITE='https://subingresso.it';
const clean=s=>String(s||'').replace(/[\r\n\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:n%100?2:0}).format(n/100).replace(/\u00a0/g,' ');

export function vetrinaEmailPayload(item,email,family='stats') {
 if(!item.listings?.length||!item.unsub_token||!email)throw Error('Destinatario incompleto');
 const variant=item.variant;if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Variante non valida');
 const listings=item.listings.slice(0,10),listing=listings[0];
 const city=clean(listing.comune).slice(0,40),place=city?' a '+city:'';
 const views=Number(listing.views_14d);if(!Number.isSafeInteger(views)||views<0)throw Error('Metriche non valide');
 const number=views.toLocaleString('it-IT'),first=clean(item.nome).split(' ')[0];
 const greeting=/^[\p{L}][\p{L}'’-]{1,19}$/u.test(first)?'Ciao '+(first===first.toUpperCase()?first[0]+first.slice(1).toLowerCase():first)+',':'Ciao,';
 family=listings.length>1?'bundle':family==='visibility'||views===0?'visibility':'stats';
 const tier=family==='bundle'?(variant===1?'30d':'10d'):family==='stats'?(variant===2?'30d':'10d'):(variant===2?'10d':'30d');
 const quote=Pricing.quote(tier,family==='bundle'?listings.length:1),price=euro(quote.total),duration=`${quote.days} giorni`;
 let subject,heading,accent,lead,context;
 if(family==='bundle') {
  [subject,heading,accent]=[
   [`${quote.count} posteggi da vendere? Mettili in vista e risparmia`,'Più posteggi.','Meno sul totale.'],
   [`I tuoi posteggi in Vetrina, con il ${quote.discount}% di sconto`,'Fai spazio','ai tuoi posteggi.'],
   ['Vendi più posteggi? La Vetrina costa meno insieme','Più visibilità.','Meno spesa.']
  ][variant];
  lead='Più annunci, un unico pacchetto.';
  context=`Hai ${Number(item.active_count)} annunci attivi. Puoi metterne ${quote.count} in Vetrina insieme e risparmiare ${euro(quote.savings)}.`;
 } else if(family==='stats') {
  [subject,heading,accent]=[
   [`Vendi il posteggio${place}? Fallo notare`,'Il tuo posteggio,','più in vista.'],
   [`Cerchi un acquirente${place}? Fatti notare`,'Il tuo posteggio.','Fallo notare.'],
   [`Dai più visibilità al tuo posteggio${place}`,'Fai notare','il tuo posteggio.']
  ][variant];
  lead='Con la Vetrina Premium.';
  context=`Il tuo annuncio${place} ha raccolto ${number} visualizzazioni negli ultimi 14 giorni.`;
 } else {
  [subject,heading,accent]=[
   [`Vuoi vendere il posteggio${place}? Fallo notare`,'Il prossimo passo?','Farti notare.'],
   [`Il tuo posteggio${place} merita più visibilità`,'Più spazio','al tuo posteggio.'],
   ['Cerchi un acquirente? Metti il posteggio in Vetrina','Metti in luce','il tuo posteggio.']
  ][variant];
  lead='Con la Vetrina Premium.';
  context=`Stai cercando un acquirente per il tuo posteggio${place}? Puoi renderlo più visibile a chi cerca.`;
 }
 const preview=family==='bundle'?`${quote.count} annunci per ${duration} a ${price}. Risparmi il ${quote.discount}%, senza abbonamento.`:`In evidenza nelle ricerche e nel blog: ${duration} a ${price}, senza abbonamento.`;
 const benefits=['Più spazio nelle ricerche.','In evidenza anche negli articoli del blog legati al tuo annuncio.'];
 const unsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=promo`;
 const trackingUnsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=tracking`;
 const measured=item.tracking_enabled===true&&!!item.tracking_token;
 const destination=measured?`${SITE}/api/vetrina-mail?kind=click&t=${encodeURIComponent(item.tracking_token)}`:`${SITE}/dashboard?promuovi=${encodeURIComponent(listings.slice(0,quote.count).map(l=>l.id).join(','))}&durata=${quote.tier}`;
 const cta=family==='bundle'?'Scegli le tue Vetrine':'Metti in Vetrina';
 const offer=family==='bundle'?`${quote.count} annunci · ${duration}`:`Vetrina Premium · ${duration}`;
 const saving=family==='bundle'?`Invece di ${euro(quote.listTotal)}. Risparmi ${euro(quote.savings)} (${quote.discount}%).`:'';
 const note=family==='stats'?`Visualizzazioni dal ${item.period_start} al ${item.period_end} (UTC): anteprime e aperture, non persone uniche.`:'';
 const text=[greeting,`${heading} ${accent}`,lead,context,benefits.join('\n'),`${offer}: ${price}.`,saving,'Pagamento unico. Nessun abbonamento.',`${cta}: ${destination}\nAccedi e scegli prima di pagare.`,'Hai una domanda? Scrivi a info@subingresso.it.',note,`Non vuoi altre offerte sulle Vetrine? Disiscriviti: ${unsub}`,measured?`Disattiva solo la misurazione di aperture e clic: ${trackingUnsub}`:''].filter(Boolean).join('\n\n');
 const p=(s,style='')=>`<p style="margin:0;${style}">${s}</p>`;
 const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}table{border-collapse:collapse}a:focus-visible{outline:3px solid #2563eb;outline-offset:4px}::selection{background:#b9d2ff;color:#102b52}@media screen and (max-width:480px){.outer{padding:12px 8px!important}.inset{padding-left:24px!important;padding-right:24px!important}.email-title{font-size:30px!important;line-height:35px!important}.hero{padding-top:28px!important;padding-bottom:28px!important}.body-copy{font-size:17px!important;line-height:26px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#edf3fa;color:#102b52;font-family:Arial,Helvetica,sans-serif">
<div aria-hidden="true" style="display:none;font-size:1px;line-height:1px;color:#edf3fa;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(preview)}${'&#847; &zwnj; &nbsp;'.repeat(24)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf3fa"><tr><td class="outer" align="center" style="padding:28px 12px">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:600px;background-color:#ffffff">
<tr><td class="inset" style="padding:24px 32px"><a href="${SITE}" style="font-size:23px;line-height:30px;font-weight:700;color:#102b52;text-decoration:none">Subingresso<span style="color:#2563eb">.it</span></a></td></tr>
<tr><td class="inset hero" bgcolor="#102b52" style="padding:32px;background-color:#102b52;color:#ffffff"><h1 class="email-title" style="margin:0;font-size:36px;line-height:41px;letter-spacing:-1px;font-weight:700;color:#ffffff">${esc(heading)}<br><span style="color:#fbbf24">${esc(accent)}</span></h1>${p(esc(lead),'margin-top:16px;font-size:17px;line-height:26px;color:#ffffff')}</td></tr>
<tr><td class="inset" style="padding:24px 32px 20px">${p(esc(greeting),'margin-bottom:12px;font-size:18px;line-height:28px;color:#102b52')}${p(esc(context),'font-size:18px;line-height:28px;color:#102b52')}${p('<strong>'+esc(benefits[0])+'</strong><br>'+esc(benefits[1]),'margin-top:20px;font-size:16px;line-height:25px;color:#102b52')}</td></tr>
<tr><td class="inset" style="padding:0 32px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#fff1d7" style="background-color:#fff1d7"><tr><td style="padding:20px 24px">${p(esc(offer),'margin-bottom:6px;font-size:16px;line-height:24px;color:#102b52')}${p(esc(price),'font-size:34px;line-height:40px;font-weight:700;color:#102b52')}${saving?p(esc(saving),'margin-top:8px;font-size:15px;line-height:23px;color:#102b52'):''}${p('Pagamento unico. Nessun abbonamento.','margin-top:8px;font-size:14px;line-height:21px;color:#102b52')}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td align="center" bgcolor="#1d4ed8" style="background-color:#1d4ed8;border-radius:8px;mso-padding-alt:16px 24px"><a href="${esc(destination)}" style="display:block;padding:16px 24px;mso-padding-alt:0;font-size:17px;line-height:24px;font-weight:700;color:#ffffff;text-align:center;text-decoration:none;border-radius:8px">${esc(cta)}</a></td></tr></table>${p('Accedi e scegli prima di pagare.','margin-top:10px;text-align:center;font-size:14px;line-height:21px;color:#52637a')}</td></tr>
<tr><td class="inset" style="padding:0 32px 28px">${p('Hai una domanda? <a href="mailto:info@subingresso.it" style="color:#1d4ed8;text-decoration:underline">Scrivici</a>.','font-size:15px;line-height:24px;color:#102b52')}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px"><tr><td class="inset" style="padding:20px 32px 8px;font-size:12px;line-height:19px;color:#52637a">${note?p(esc(note),'margin-bottom:10px'):''}${p(`<a href="${esc(unsub)}" style="color:#52637a;text-decoration:underline">Non ricevere più offerte sulle Vetrine</a>${measured?`<br><a href="${esc(trackingUnsub)}" style="color:#52637a;text-decoration:underline">Disattiva solo la misurazione di aperture e clic</a>`:''}`)}</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>${measured?`<img src="${SITE}/api/vetrina-mail?kind=open&amp;t=${encodeURIComponent(item.tracking_token)}" width="1" height="1" alt="" style="width:1px;height:1px;border:0">`:''}</body></html>`;
 return {family,quote,listing_ids:listings.slice(0,quote.count).map(l=>l.id),payload:{from:'Subingresso.it <noreply@subingresso.it>',reply_to:'info@subingresso.it',to:[email],subject:clean(subject),text,html,
  // Link opens a confirmation form; do not advertise unsupported One-Click POST.
  headers:{'List-Unsubscribe':`<${unsub}>`},tags:[{name:'campaign',value:'vetrina'},{name:'variant',value:`${family}-${variant+1}`}]} };
}
