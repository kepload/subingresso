"""Controlli browser con dati simulati: nessun annuncio reale viene moderato."""
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
NODE_CHECK = r"""
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const handler = require('./api/annuncio.js');
let headers = {}, html = '';
const res = { setHeader(k, v) { headers[k] = v; }, status() { return this; }, send(v) { html = v; } };
(async () => {
    global.fetch = () => { throw new Error('Preview must not fetch private data on server'); };
    await handler({ query: { id: 'test', anteprima: 'moderazione' } }, res);
    assert.equal(headers['Cache-Control'], 'private, no-store');
    assert.equal(headers['X-Robots-Tag'], 'noindex, nofollow');
    assert(!html.includes('__SSR_LISTING__'));
    const preview = html;
    const publicListing = {id:'public', titolo:'Public listing', status:'active'};
    global.fetch = async () => ({ ok:true, json: async () => [publicListing] });
    await handler({ query: { id: 'public' } }, res);
    assert.equal(headers['Cache-Control'], 'public, s-maxage=180, stale-while-revalidate=600');
    assert(html.includes('__SSR_LISTING__'));
    for (const file of ['dashboard.html', 'annuncio.html']) {
        for (const match of fs.readFileSync(file, 'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!/\bsrc\s*=|application\/ld\+json/i.test(match[1])) new vm.Script(match[2]);
        }
    }
    process.stdout.write(preview);
})().catch(e => { console.error(e); process.exit(1); });
"""
HTML = subprocess.run(['node', '-e', NODE_CHECK], cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8').stdout
MOCK = r"""
window.calls = []; window.decisions = []; window.toasts = []; window.authCallbacks = [];
window.mockUser = MOCK_USER;
window.fixture = {id:'test',user_id:'seller',status:'pending',titolo:'Posteggio <test>',
  descrizione:'Descrizione completa. '.repeat(80) + 'FINE DESCRIZIONE',stato:'Vendita',
  tipo:'Fiera',settore:'Abbigliamento',comune:'Brescia',provincia:'BS',regione:'Lombardia',
  superficie:30,giorni:'Lunedì',prezzo:5000,contatto:'Venditore',created_at:'2026-10-06',
  img_urls:['https://preview.test/foto-1.svg','https://preview.test/foto-2.svg','https://preview.test/foto-3.svg'],
  dettagli_extra:{nome_fiera:'Fiera completa',note_fiera:'Note da leggere',images:['originale']}};
const _supabase = {
  auth: {
    getUser:async()=>({data:{user:window.mockUser},error:null}),
    getSession:async()=>({data:{session:window.mockUser?{user:window.mockUser}:null}}),
    onAuthStateChange:cb=>{window.authCallbacks.push(cb);return {data:{subscription:{unsubscribe(){}}}}}
  },
  rpc:async(name,args)=>{window.calls.push({rpc:name,args});return {data:[{tel:'+393331234567',email:'seller@example.test'}]}},
  from(table) {
    let columns='', filters={}, patch=null;
    const query = {
      select(c){columns=c;return query},eq(k,v){filters[k]=v;return query},
      update(p){patch=p;return query},in(){return query},neq(){return query},order(){return query},limit(){return query},
      async maybeSingle(){return result()},async single(){return result()},
      then(resolve,reject){return Promise.resolve(result()).then(resolve,reject)}
    };
    function result() {
      window.calls.push({table,columns,filters,patch});
      if(table==='profiles')return {data:columns==='is_admin'?{is_admin:window.mockUser?.admin===true}:{nome:'Mario',cognome:'Rossi',created_at:'2025-01-01'}};
      if(patch){
        window.decisions.push({patch,filters});
        if(window.updateFails)return {data:null,error:{message:'Errore di prova'}};
        if(window.alreadyModerated)return {data:null,error:null};
        Object.assign(window.fixture,patch);return {data:{id:'test'},error:null};
      }
      if(columns==='id')return {data:[],count:2};
      if(columns==='dettagli_extra')return {data:{dettagli_extra:{...window.fixture.dettagli_extra,updated_field:'preserved'}}};
      return {data:{...window.fixture},error:null};
    }
    return query;
  }
};
"""


def run(browser, user, width=390):
    context = browser.new_context(viewport={'width': width, 'height': 844}, device_scale_factor=1)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def route(request):
        parsed = urlparse(request.request.url)
        path = parsed.path
        if path == '/annuncio':
            request.fulfill(body=HTML, content_type='text/html')
        elif path == '/js/supabase-config.js':
            request.fulfill(body=MOCK.replace('MOCK_USER', json.dumps(user)), content_type='text/javascript')
        elif path in ['/js/auth.js', '/js/ui-components.js']:
            request.fulfill(body="function requireAuth(cb){cb(window.mockUser)}; window.showToast=(m)=>window.toasts.push(m);", content_type='text/javascript')
        elif path.startswith('/js/') and (ROOT / path.lstrip('/')).is_file():
            request.fulfill(path=str(ROOT / path.lstrip('/')), content_type='text/javascript')
        elif path == '/css/tailwind.css':
            request.fulfill(path=str(ROOT / 'css/tailwind.css'), content_type='text/css')
        elif path.endswith('.svg'):
            request.fulfill(body='<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#dbeafe"/></svg>', content_type='image/svg+xml')
        else:
            request.fulfill(body='', content_type='text/plain')

    context.route('**/*', route)
    page.goto('https://preview.test/annuncio?id=test&anteprima=moderazione')
    if user and user['admin']:
        page.wait_for_selector('#moderationBar')
        assert page.locator('#descrizione').inner_text().endswith('FINE DESCRIZIONE')
        assert page.locator('#coverDiv img').count() == 3
        assert 'Note da leggere' in page.locator('#detailRows').inner_text()
        assert page.locator('#cTel').is_visible()
        assert not page.locator('#chatBtn').is_visible()
        assert not page.locator('#mobileCta').is_visible()
        assert page.locator('#_jsonLd').count() == 0
        assert not page.evaluate("calls.some(c=>c.rpc==='increment_views')")
        assert not page.evaluate("calls.some(c=>c.table==='annunci' && c.columns.split(',').some(x=>['tel','email','*'].includes(x.trim())))")
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for scroll in [0, 600, 100000]:
            page.evaluate('(y)=>window.scrollTo(0,y)', scroll)
            box = page.locator('#moderationApprove').bounding_box()
            assert box['height'] >= 44 and box['y'] + box['height'] <= 844
    else:
        page.wait_for_function("document.querySelector('#notFound p').textContent.includes('account admin') || document.querySelector('#notFound p').textContent.includes('riservata agli amministratori')")
        assert not page.locator('#detailLayout').is_visible()
        assert page.locator('#moderationBar').count() == 0
        assert not page.evaluate("calls.some(c=>c.table==='annunci')")
    assert not errors, errors
    return context, page, errors


with sync_playwright() as playwright:
    for engine in [playwright.chromium, playwright.webkit]:
        browser = engine.launch(headless=True)
        for user in [None, {'id': 'normal', 'admin': False}]:
            context, page, _ = run(browser, user)
            context.close()
        for width in [320, 390, 1280]:
            context, page, errors = run(browser, {'id': 'admin', 'admin': True}, width)
            page.evaluate('window.updateFails=true')
            page.locator('#moderationApprove').click()
            page.wait_for_function("toasts.includes('Errore di prova')")
            assert page.locator('#moderationApprove').is_enabled()
            page.evaluate('window.updateFails=false')
            page.locator('#moderationApprove').dblclick()
            page.wait_for_function("fixture.status==='active'")
            assert page.locator('#moderationApprove').is_disabled()
            assert page.evaluate('decisions.length') == 2  # tentativo fallito + successo
            assert page.evaluate('decisions[1].filters.status') == 'pending'
            assert not errors, errors
            context.close()
        context, page, errors = run(browser, {'id': 'admin', 'admin': True})
        page.locator('#moderationReject').click()
        page.locator('#moderationReason').select_option('altro')
        page.locator('#moderationReasonText').fill('Motivo scritto dall’admin')
        page.locator('#moderationRejectForm button[type=submit]').click()
        page.wait_for_function("fixture.status==='rejected'")
        patch = page.evaluate('decisions[0].patch')
        assert patch['dettagli_extra']['rejection_reason'] == 'Motivo scritto dall’admin'
        assert patch['dettagli_extra']['images'] == ['originale']
        assert patch['dettagli_extra']['updated_field'] == 'preserved'
        assert not errors, errors
        context.close()
        context, page, errors = run(browser, {'id': 'admin', 'admin': True})
        page.evaluate('window.alreadyModerated=true')
        page.locator('#moderationApprove').click()
        page.wait_for_function("toasts.some(t=>t.includes('già stato moderato'))")
        assert page.locator('#moderationApprove').is_enabled()
        page.evaluate("authCallbacks.forEach(cb=>cb('SIGNED_OUT',null))")
        assert not page.locator('#detailLayout').is_visible()
        assert page.locator('#moderationBar').count() == 0
        assert not errors, errors
        context.close()
        browser.close()
        print(f'{engine.name}: accesso, telefono 320/390px, desktop, foto, approvazione, rifiuto, errori e logout OK')
print('SSR privato senza dati e senza cache; SSR pubblico e sintassi inline OK')
