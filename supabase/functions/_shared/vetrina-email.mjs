import '../../../js/vetrina-pricing.js';
const Pricing=globalThis.VetrinaPricing;
const SITE='https://subingresso.it';
const clean=s=>String(s||'').replace(/[\r\n\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Copy approved by the owner. The 90% claim is owner-supplied campaign copy,
// not a statistic calculated from platform data. Giacomo did not buy a Vetrina.
export const VETRINA_EMAIL_COPIES=Object.freeze([
 {id:1,subject:'Il plateatico sta per scadere! Vendi il posteggio!',paragraphs:[
  'Vendere quel posteggio ti libera un giorno. Puoi usarlo per un mercato dove guadagni di più.',
  'Con la Vetrina metti il tuo annuncio in evidenza, così chi cerca un posteggio può notarlo più facilmente.'
 ],cta:'Metti in evidenza il mio annuncio'},
 {id:2,subject:'Quel mercato rende poco? Fai spazio a uno migliore',paragraphs:[
  'Sveglia presto, furgone, banco da montare. E a fine giornata resta poco.',
  'Se vuoi cambiare mercato, vendi il vecchio posteggio. La Vetrina fa vedere di più il tuo annuncio a chi cerca.'
 ],price:true,cta:'Fai vedere il mio posteggio'},
 {id:3,subject:'Il tuo annuncio è finito in fondo alla lista!',paragraphs:[
  'Arrivano altri annunci e il tuo diventa più difficile da trovare.',
  'Con la Vetrina lo rimetti in evidenza nelle ricerche. Così dai al tuo posteggio più possibilità di essere visto da chi vuole comprare.'
 ],cta:'Rimetti in evidenza il mio annuncio'},
 {id:4,subject:'Chi compra è nel nostro blog!!',paragraphs:[
  'Il 90% degli ambulanti ha bisogno di cambiare almeno 1 mercato perchè lavora poco!!',
  'Con la Vetrina il tuo annuncio può comparire anche negli articoli collegati alla tua zona e al tuo posteggio. Non perdere più tempo!'
 ],cta:'Fai vedere il mio annuncio anche nel blog'},
 {id:5,subject:'Giacomo ha venduto il suo posteggio a Milano',paragraphs:[
  'Giacomo ha trovato un compratore grazie al suo annuncio su Subingresso.it.',
  'Stai cercando anche tu di vendere? Con la Vetrina puoi mettere il tuo posteggio in evidenza nelle ricerche e negli articoli del blog collegati al tuo annuncio.'
 ],cta:'Metti in evidenza il mio posteggio'},
 {id:6,subject:'Prima di abbassare il prezzo, fatti vedere',paragraphs:[
  'Il posteggio è in vendita, ma nessuno chiama?',
  'Prima di abbassare ancora il prezzo, prova a far vedere di più l’annuncio. La Vetrina lo mette in evidenza nelle ricerche, dove chi cerca può notarlo più facilmente.'
 ],cta:'Dai più spazio al mio annuncio'},
 {id:7,subject:'Vuoi un giorno libero? Parti da quel posteggio',paragraphs:[
  'Un giorno per riposare, stare in famiglia o fare un altro mercato.',
  'Se vuoi vendere un posteggio, aiutalo a farsi notare. Con la Vetrina il tuo annuncio viene messo in evidenza davanti a chi sta cercando.'
 ],cta:'Metti in evidenza il mio posteggio'},
 {id:8,subject:'Hai trovato un mercato migliore, ma devi ancora vendere?',paragraphs:[
  'Vuoi cambiare, ma hai ancora il vecchio posteggio da vendere.',
  'Con la Vetrina fai vedere di più il tuo annuncio nelle ricerche e negli articoli del blog collegati. Può aiutarti a trovare prima una persona interessata.'
 ],cta:'Fai vedere il posteggio che vendo'},
 {id:9,subject:'Hai più posteggi da vendere? Falli vedere insieme',paragraphs:[
  'Chi cerca un posteggio potrebbe essere interessato a uno dei tuoi.',
  'Puoi mettere più annunci in Vetrina nello stesso momento. Ognuno viene messo in evidenza, così dai più spazio a tutti i posteggi che vuoi vendere.'
 ],bundleOnly:true,cta:'Metti in evidenza i miei posteggi'},
 {id:10,subject:'Vuoi smettere con quel mercato? Fai sapere che vendi',paragraphs:[
  'Hai deciso di lasciare quel posteggio. Adesso serve qualcuno che lo compri.',
  'La Vetrina è la promozione che mette il tuo annuncio in evidenza su Subingresso.it e negli articoli del blog collegati.'
 ],price:true,cta:'Promuovi il mio annuncio'},
 {id:11,subject:'Nessuno chiama? Prima di abbassare il prezzo, fatti vedere!',paragraphs:[
  'Chi vuole comprare deve prima vedere il tuo posteggio. Con la Vetrina metti l’annuncio in evidenza nelle ricerche.'
 ],cta:'Fai vedere il mio posteggio'},
 {id:12,subject:'Abbassi ancora il prezzo? Fai vedere il posteggio!',paragraphs:[
  'Prima di chiedere meno, fatti vedere di più. La Vetrina mette il tuo annuncio in evidenza davanti a chi cerca un posteggio.'
 ],cta:'Metti in evidenza il mio annuncio'}
].map(copy=>Object.freeze({...copy,paragraphs:Object.freeze(copy.paragraphs)})));

export function vetrinaEmailCopy(id) {
 const copy=VETRINA_EMAIL_COPIES.find(copy=>copy.id===id);
 if(!copy)throw Error('Testo email non valido');
 return copy;
}

function defaultCopy(item,family,variant) {
 if(family==='bundle')return 9;
 if(family==='stats')return [6,11,12][variant];
 const pool=[1,2,3,4,5,7,8,10];
 // Stable selection for existing callers, without widening the stored 0–2 variant.
 const seed=Array.from(String(item.user_id||item.listings[0].id)).reduce((n,c)=>(n*31+c.codePointAt(0))>>>0,0);
 return pool[(seed+variant)%pool.length];
}

export function vetrinaEmailPayload(item,email,family='stats',copyId) {
 if(!item.listings?.length||!item.unsub_token||!email)throw Error('Destinatario incompleto');
 const variant=item.variant;if(!Number.isInteger(variant)||variant<0||variant>2)throw Error('Variante non valida');
 const listings=item.listings.slice(0,10),views=Number(listings[0].views_14d);
 if(!Number.isSafeInteger(views)||views<0)throw Error('Metriche non valide');
 const first=clean(item.nome).split(' ')[0];
 const greeting=/^[\p{L}][\p{L}'’-]{1,19}$/u.test(first)?'Ciao '+(first===first.toUpperCase()?first[0]+first.slice(1).toLowerCase():first)+',':'Ciao,';
 family=listings.length>1?'bundle':family==='visibility'||views===0?'visibility':'stats';
 const copy=vetrinaEmailCopy(copyId??defaultCopy(item,family,variant));
 if(copy.bundleOnly&&family!=='bundle')throw Error('Questo testo richiede più posteggi');
 const tier=family==='bundle'?(variant===1?'30d':'10d'):family==='stats'?(variant===2?'30d':'10d'):(variant===2?'10d':'30d');
 const quote=Pricing.quote(tier,family==='bundle'?listings.length:1);
 const subject=copy.subject,preview=copy.paragraphs[0],price=copy.price?'A partire da solo 49 euro!':'';
 const unsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=promo`;
 const trackingUnsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=tracking`;
 const measured=item.tracking_enabled===true&&!!item.tracking_token;
 const destination=measured?`${SITE}/api/vetrina-mail?kind=click&t=${encodeURIComponent(item.tracking_token)}`:`${SITE}/dashboard?promuovi=${encodeURIComponent(listings.slice(0,quote.count).map(l=>l.id).join(','))}&durata=${quote.tier}`;
 const text=[greeting,subject,...copy.paragraphs,price,`${copy.cta}: ${destination}\nAccedi e scegli prima di pagare.`,'Pagamento unico. Nessun abbonamento.','Hai una domanda? Scrivi a info@subingresso.it.',`Non vuoi altre offerte sulle Vetrine? Disiscriviti: ${unsub}`,measured?`Disattiva solo la misurazione di aperture e clic: ${trackingUnsub}`:''].filter(Boolean).join('\n\n');
 const p=(s,style='')=>`<p style="margin:0;${style}">${s}</p>`;
 const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}table{border-collapse:collapse}a:focus-visible{outline:3px solid #2563eb;outline-offset:4px}::selection{background:#b9d2ff;color:#102b52}@media screen and (max-width:480px){.outer{padding:12px 8px!important}.inset{padding-left:24px!important;padding-right:24px!important}.email-title{font-size:28px!important;line-height:33px!important}}</style></head>
<body style="margin:0;padding:0;background-color:#edf3fa;color:#102b52;font-family:Arial,Helvetica,sans-serif">
<div aria-hidden="true" style="display:none;font-size:1px;line-height:1px;color:#edf3fa;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(preview)}${'&#847; &zwnj; &nbsp;'.repeat(24)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf3fa"><tr><td class="outer" align="center" style="padding:28px 12px">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:600px;background-color:#ffffff">
<tr><td class="inset" style="padding:20px 32px"><a href="${SITE}" aria-label="Subingresso.it" style="display:inline-block;font-size:22px;line-height:32px;font-weight:700;color:#102b52;text-decoration:none"><span aria-hidden="true" style="font-size:32px;line-height:32px;color:#2563eb;padding-right:10px">S</span>Subingresso<span style="color:#2563eb">.it</span></a></td></tr>
<tr><td class="inset" bgcolor="#102b52" style="padding:28px 32px;background-color:#102b52;color:#ffffff"><h1 class="email-title" style="margin:0;font-size:32px;line-height:38px;letter-spacing:-0.6px;font-weight:700;color:#ffffff">${esc(subject)}</h1></td></tr>
<tr><td class="inset" style="padding:24px 32px 20px">${p(esc(greeting),'margin-bottom:12px;font-size:17px;line-height:26px;color:#102b52')}${copy.paragraphs.map((paragraph,index)=>p(esc(paragraph),`margin-top:${index?12:0}px;font-size:17px;line-height:26px;color:#102b52`)).join('')}${price?p('<strong>'+esc(price)+'</strong>','margin-top:16px;font-size:17px;line-height:26px;color:#102b52'):''}</td></tr>
<tr><td class="inset" style="padding:0 32px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#1d4ed8" style="background-color:#1d4ed8;border-radius:8px;mso-padding-alt:16px 20px"><a data-email-cta href="${esc(destination)}" style="display:block;padding:16px 20px;mso-padding-alt:0;font-size:17px;line-height:24px;font-weight:700;color:#ffffff;text-align:center;text-decoration:none;border-radius:8px">${esc(copy.cta)}</a></td></tr></table>${p('Accedi e scegli prima di pagare.','margin-top:10px;text-align:center;font-size:14px;line-height:21px;color:#52637a')}${p('Pagamento unico. Nessun abbonamento.','margin-top:4px;text-align:center;font-size:14px;line-height:21px;color:#52637a')}</td></tr>
<tr><td class="inset" style="padding:0 32px 24px">${p('Hai una domanda? <a href="mailto:info@subingresso.it" style="color:#1d4ed8;text-decoration:underline">Scrivici</a>.','font-size:15px;line-height:24px;color:#102b52')}</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px"><tr><td class="inset" style="padding:20px 32px 8px;font-size:12px;line-height:19px;color:#52637a">${p(`<a href="${esc(unsub)}" style="color:#52637a;text-decoration:underline">Non ricevere più offerte sulle Vetrine</a>${measured?`<br><a href="${esc(trackingUnsub)}" style="color:#52637a;text-decoration:underline">Disattiva solo la misurazione di aperture e clic</a>`:''}`)}</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>${measured?`<img src="${SITE}/api/vetrina-mail?kind=open&amp;t=${encodeURIComponent(item.tracking_token)}" width="1" height="1" alt="" style="width:1px;height:1px;border:0">`:''}</body></html>`;
 return {family,quote,copy_id:copy.id,listing_ids:listings.slice(0,quote.count).map(l=>l.id),payload:{from:'Subingresso.it <noreply@subingresso.it>',reply_to:'info@subingresso.it',to:[email],subject:clean(subject),text,html,
  // Link opens a confirmation form; do not advertise unsupported One-Click POST.
  headers:{'List-Unsubscribe':`<${unsub}>`},tags:[{name:'campaign',value:'vetrina'},{name:'variant',value:`${family}-${variant+1}`},{name:'copy',value:`approved-${copy.id}`}]} };
}
