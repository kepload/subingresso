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
 const title=clean(listing.title).slice(0,85),city=clean(listing.comune),place=city?' a '+city:'';
 const views=Number(listing.views_14d);if(!Number.isSafeInteger(views)||views<0)throw Error('Metriche non valide');
 const number=views.toLocaleString('it-IT');
 const first=clean(item.nome).split(' ')[0];
 const greeting=/^[\p{L}][\p{L}'’-]{1,19}$/u.test(first)?'Ciao '+(first===first.toUpperCase()?first[0]+first.slice(1).toLowerCase():first)+',':'Ciao,';
 family=listings.length>1?'bundle':family==='visibility'||views===0?'visibility':'stats';
 let subject,paragraphs,tier;
 if(family==='bundle') {
  tier=variant===1?'30d':'10d';const q=Pricing.quote(tier,listings.length);
  const price=`${q.count} annunci in Vetrina per ${q.days} giorni: ${euro(q.total)} invece di ${euro(q.listTotal)}. Risparmi ${euro(q.savings)} (${q.discount}%).`;
  const all=q.count===Number(item.active_count);
  [subject,paragraphs]=[
   [`${item.active_count} annunci: puoi promuoverne più di uno risparmiando`,[`Hai ${item.active_count} annunci attivi su Subingresso.it. Se vuoi dare più visibilità a ${q.count} posteggi insieme, puoi usare il pacchetto Vetrine.`,price,'Un solo pagamento, nessun abbonamento. Gli annunci avranno più spazio nelle ricerche e negli articoli pertinenti.']],
   ['Più posteggi da vendere? C’è il pacchetto Vetrine',[`Quando vendi più posteggi, ogni annuncio deve trovare il suo acquirente. Per i tuoi ${item.active_count} annunci attivi puoi scegliere un pacchetto Vetrine.`,price,'Puoi selezionare gli annunci dalla tua area personale. Il pagamento è unico, senza rinnovo automatico.']],
   ['Il pacchetto Vetrine per i tuoi annunci',[`${all?`Per dare più spazio ai tuoi ${q.count} annunci attivi`:`Per dare più spazio a ${q.count} dei tuoi ${item.active_count} annunci attivi`}, puoi attivare più Vetrine con uno sconto sul totale.`,price,'I posteggi vengono messi in evidenza nelle ricerche e nel blog, negli articoli pertinenti. Nessun abbonamento.']]
  ][variant];
 } else if(family==='stats') {
  tier=variant===2?'30d':'10d';
  [subject,paragraphs]=[
   [`${number} visualizzazioni per il tuo annuncio${place}`,[`Negli ultimi 14 giorni «${title}» ha totalizzato ${number} visualizzazioni.`, 'La Vetrina può aiutarti a trovare prima un acquirente: dà più spazio all’annuncio nelle ricerche e negli articoli del blog pertinenti.',`Puoi partire da 10 giorni a ${euro(Pricing.plans['10d'].cents)}, con un pagamento unico.`]],
   [`Più spazio per il tuo posteggio${place}`,[`Il tuo annuncio «${title}» ha raccolto ${number} visualizzazioni negli ultimi 14 giorni.`,'Per vendere serve incontrare la persona giusta. La Vetrina mette il posteggio in evidenza nelle ricerche e nel blog, quando è pertinente.',`10 giorni costano ${euro(Pricing.plans['10d'].cents)}. Nessun abbonamento.`]],
   [`${number} visualizzazioni. Vuoi dare più visibilità al posteggio?`,[`«${title}»: ${number} visualizzazioni negli ultimi 14 giorni.`,'Se vuoi farlo notare di più mentre cerchi un acquirente, puoi metterlo in Vetrina: più spazio nelle ricerche e negli articoli pertinenti.',`La formula da 30 giorni costa ${euro(Pricing.plans['30d'].cents)}, senza rinnovo automatico.`]]
  ][variant];
 } else {
  tier=variant===2?'10d':'30d';
  [subject,paragraphs]=[
   [`Il posteggio${place} è ancora in vendita?`,[`Se stai ancora cercando un acquirente per «${title}», puoi dargli più visibilità con la Vetrina.`,'Vendere un posteggio può richiedere tempo: farsi trovare da chi cerca nella tua zona è un passo utile.',`30 giorni a ${euro(Pricing.plans['30d'].cents)}, con un pagamento unico. L’annuncio resta gratuito anche se non la attivi.`]],
   [`Un mese di visibilità in più${place}`,[`Per «${title}» puoi scegliere la Vetrina da 30 giorni: ${euro(Pricing.plans['30d'].cents)}, senza abbonamento.`,'Il posteggio avrà più spazio nelle ricerche e negli articoli del blog pertinenti, così chi sta cercando può notarlo più facilmente.','Puoi attivarla dalla tua area personale, con il pulsante Promuovi.']],
   ['Vuoi dare una spinta alla vendita del posteggio?',[`Per il tuo posteggio${place}, la Vetrina è un modo per farti trovare più facilmente da chi cerca un’attività da rilevare.`,'L’annuncio viene messo in evidenza nelle ricerche e negli articoli pertinenti del blog.',`Puoi provarla per 10 giorni a ${euro(Pricing.plans['10d'].cents)}, senza rinnovo automatico.`]]
  ][variant];
 }
 const quote=Pricing.quote(tier,family==='bundle'?listings.length:1);
 const unsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=promo`;
 const trackingUnsub=`${SITE}/unsubscribe?t=${encodeURIComponent(item.unsub_token)}&type=tracking`;
 const measured=item.tracking_enabled===true&&!!item.tracking_token;
 const destination=measured?`${SITE}/api/vetrina-mail?kind=click&t=${encodeURIComponent(item.tracking_token)}`
  :`${SITE}/dashboard?promuovi=${encodeURIComponent(listings.slice(0,quote.count).map(l=>l.id).join(','))}&durata=${quote.tier}`;
 const cta=family==='bundle'?'Vedi i pacchetti nella tua area':'Vedi le opzioni Vetrina';
 const note=family==='stats'?`Visualizzazioni dal ${item.period_start} al ${item.period_end} (UTC): anteprime + aperture, non persone uniche.`:'';
 const text=[greeting,...paragraphs,`${cta}: ${destination}\nAccedi per vedere la proposta.`,'A presto,\nSubingresso.it',note,'Per una mano: info@subingresso.it.',`Non vuoi altre offerte sulle Vetrine? Disiscriviti: ${unsub}`,measured?`Disattiva solo la misurazione di aperture e clic: ${trackingUnsub}`:''].filter(Boolean).join('\n\n');
 const html=`<div lang="it" style="font:16px/1.6 Arial,sans-serif;color:#17212f;max-width:560px;margin:auto;padding:20px"><p>${esc(greeting)}</p>${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<p><a href="${esc(destination)}" style="color:#1d4ed8">${esc(cta)}</a><br><small>Accedi per vedere la proposta.</small></p><p>A presto,<br>Subingresso.it</p>${note?`<p style="font-size:12px;color:#475569">${esc(note)}</p>`:''}<p style="font-size:12px;color:#475569">Per una mano: <a href="mailto:info@subingresso.it">info@subingresso.it</a>.<br><a href="${esc(unsub)}">Non ricevere più offerte sulle Vetrine</a>${measured?`<br><a href="${esc(trackingUnsub)}">Disattiva solo la misurazione di aperture e clic</a>`:''}</p>${measured?`<img src="${SITE}/api/vetrina-mail?kind=open&amp;t=${encodeURIComponent(item.tracking_token)}" width="1" height="1" alt="" style="width:1px;height:1px;border:0">`:''}</div>`;
 return {family,quote,listing_ids:listings.slice(0,quote.count).map(l=>l.id),payload:{from:'Subingresso.it <noreply@subingresso.it>',reply_to:'info@subingresso.it',to:[email],subject:clean(subject),text,html,
  // Link opens a confirmation form; do not advertise unsupported One-Click POST.
  headers:{'List-Unsubscribe':`<${unsub}>`},tags:[{name:'campaign',value:'vetrina'},{name:'variant',value:`${family}-${variant+1}`}]} };
}
