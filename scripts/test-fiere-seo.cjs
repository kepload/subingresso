'use strict';
const assert = require('node:assert/strict');
const {events, isIndexable, qualityIssues, territories, fairPath} = require('../api/_fiere');
const handler = require('../api/fiera');
function render(slug, pagina) {
    const result={setHeader(){},status(code){this.code=code;return this;},send(html){this.html=html;}};
    handler({query:{slug,pagina}},result); return result;
}
const sample=events.find(e=>e.id==='sicilia-san-vito-lo-capo-cous-cous-fest');
assert(isIndexable(sample),'Documented fair must not depend on having a published application');
assert(!isIndexable({...sample,source:{url:sample.source.url}}),'Verification date required');
assert(!isIndexable({...sample,summary:'',participation:{note:'Da verificare'}}),'Thin descriptions excluded');
assert(!isIndexable({...sample,seo:{noindex:true}}),'Editorial exclusions preserved');
const serial=events.find(e=>qualityIssues(e).includes('testo descrittivo seriale da arricchire'));
assert(serial && !isIndexable(serial),'Serial descriptions excluded');
for (const area of territories) {
    const all=events.filter(e=>e.region===area.name&&isIndexable(e));
    const seen=[];
    for(let page=1;page<=Math.ceil(all.length/60);page++) {
        const result=render(area.slug,String(page));assert.equal(result.code,200);
        const canonical='https://subingresso.it/fiere/'+area.slug+(page>1?'?pagina='+page:'');
        assert(result.html.includes('rel="canonical" href="'+canonical+'"'));
        const list=result.html.match(/<ol class="territory-fairs"[^>]*>([\s\S]*?)<\/ol>/)[1];
        const ids=[...list.matchAll(/href="\/fiere\/([^"?]+)"/g)].map(m=>m[1]);
        seen.push(...ids);
        for(const id of ids) assert(all.some(e=>e.id===id),area.name+': only relevant quality fairs');
        assert(result.html.includes('Date') || result.html.includes('date'));
        assert(!result.html.includes('undefined'));
        const schema=JSON.parse(result.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
        assert.equal(schema['@type'],'BreadcrumbList');
        assert.equal(schema.itemListElement.at(-1).item,canonical);
    }
    assert.deepEqual(seen.slice().sort(),all.map(e=>e.id).sort(),'Every eligible fair appears once');
    for(const n of ['0','1.5','999','NaN']) assert.equal(render(area.slug,n).code,404);
}
for(const slug of ['novembre','lombardia-alimentare','regione-inesistente']) assert.equal(render(slug).code,404);
const detail=render(sample.id).html;
assert(detail.includes('Prima di candidarti'));
assert(detail.includes('Candidatura, eventuale prenotazione e assegnazione'));
assert(detail.includes('href="'+sample.source.url+'" data-fiere-id='));
assert(detail.includes('target="_blank" rel="noopener noreferrer"'));
assert(!detail.includes('schema.org/Event'));
assert(detail.includes('data-save-fair')&&detail.includes('data-remind-fair'));
assert(detail.indexOf('Prima di candidarti')<detail.indexOf('Salva e ricontrolla'));
// Source and catalogue data are read-only; this test creates no real applications.
console.log('SEO quality exclusions, regional pagination/completeness, canonical, schema and public application path passed.');
