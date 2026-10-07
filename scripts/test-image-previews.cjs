// No writes to Supabase: checks preview rendering and click-only original loading.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');
const { getOptimizedImageUrl, origin, marker } = require('../js/image-urls.js');
const handler = require('../api/image.js');
const originalFetch = global.fetch;
const root = path.resolve(__dirname, '..');
const storedPath = 'listings/test-owner/photo.jpg';
const photo = origin + marker + storedPath;
const avatar = origin + marker + 'avatars/test-owner/avatar.jpg';
const query = (path = storedPath, w = '480') => ({ path, w, v:'1' });

async function request(query, method = 'GET') {
    const result = { headers:{} };
    const res = {setHeader(k,v){result.headers[k]=v;},status(n){result.status=n;return this;},end(body){result.body=body;return this;}};
    await handler({ query, method }, res);
    return result;
}

async function serverChecks() {
    assert.equal(getOptimizedImageUrl(photo, 480), '/api/image?path=listings%2Ftest-owner%2Fphoto.jpg&w=480&v=1');
    assert.equal(getOptimizedImageUrl(photo + '?cache=anything', 480), getOptimizedImageUrl(photo, 480));
    assert.match(getOptimizedImageUrl(avatar, 48), /w=48/);
    for (const url of ['blob:test', 'data:image/png;base64,abc', 'https://example.invalid/photo.jpg', origin + '/storage/v1/object/public/private/owner/photo.jpg']) assert.equal(getOptimizedImageUrl(url), url);

    let fetched = [];
    global.fetch = async (...args) => { fetched.push(args); throw new Error('Unexpected request'); };
    for (const value of [query('https://example.invalid/a'), query('listings/../private/photo.jpg'), query('listings/owner/../../private/photo.jpg'), query('private/owner/photo.jpg'), query(storedPath, '5000'), {...query(),path:[storedPath]}, {...query(),url:photo}, {...query(),v:'2'}]) {
        assert.equal((await request(value)).status,400);
    }
    assert.equal((await request(query(), 'POST')).status,405);
    assert.equal(fetched.length,0);

    const source = await sharp({create:{width:1800,height:1200,channels:3,background:'#6d8b43'}}).jpeg().withMetadata({orientation:6}).toBuffer();
    global.fetch = async (url, options) => {
        fetched.push([url, options]);
        return new Response(source, { headers:{'Content-Type':'image/jpeg','Content-Length':String(source.length)} });
    };
    const preview = await request(query());
    assert.equal(preview.status,200);
    assert.equal(preview.headers['Content-Type'],'image/webp');
    assert.match(preview.headers['Cache-Control'],/s-maxage=31536000/);
    const meta = await sharp(preview.body).metadata();
    assert.equal(meta.width,320);
    assert.equal(meta.height,480);
    assert.equal(meta.exif,undefined);
    assert.equal(meta.orientation,undefined);
    assert.equal(fetched[0][0],photo);
    assert.equal(fetched[0][1].redirect,'error');
    const tinyAvatar = await request(query('avatars/test-owner/avatar.jpg','48'));
    const avatarMeta = await sharp(tinyAvatar.body).metadata();
    assert.equal(avatarMeta.width,48);
    assert.equal(avatarMeta.height,48);
    const head = await request(query(),'HEAD');
    assert.equal(head.status,200);
    assert.equal(head.body,undefined);
    assert.equal(head.headers['Content-Length'],String(preview.body.length));
    for (const [response, expected] of [
        [new Response(null,{status:404}),404],
        [new Response('text',{headers:{'Content-Type':'text/plain'}}),415],
        [new Response(source,{headers:{'Content-Type':'image/jpeg','Content-Length':String(21*1024*1024)}}),413],
        [new Response('invalid image',{headers:{'Content-Type':'image/jpeg'}}),502]
    ]) {
        global.fetch = async () => response;
        const result = await request(query());
        assert.equal(result.status,expected);
        assert.equal(result.headers['Cache-Control'],'no-store');
        assert.equal(result.headers.Location,undefined);
    }
    global.fetch = originalFetch;
    console.log('OK: strict source validation, WebP sizes, EXIF orientation and removal, cache, HEAD, upstream and decoder errors.');

    for (const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))) {
        const html = fs.readFileSync(path.join(root,file),'utf8');
        if (html.includes('js/data.js?')) assert(html.indexOf('js/image-urls.js?') < html.indexOf('js/data.js?') && html.includes('js/image-urls.js?'),file);
        for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!/\bsrc\s*=|application\/ld\+json/i.test(match[1])) new vm.Script(match[2],{filename:file});
        }
    }
    console.log('OK: shared helper order and inline JavaScript syntax.');
}

async function browserChecks() {
    const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const source = await sharp({create:{width:1800,height:1200,channels:3,background:'#6d8b43'}}).jpeg().toBuffer();
    const preview = await sharp(source).resize(480).webp().toBuffer();
    const server = http.createServer((req,res) => {
        const pathname = new URL(req.url,'http://localhost').pathname;
        if (pathname === '/fixture') {res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><body></body></html>');return;}
        if (pathname === '/api/image') {res.setHeader('Content-Type','image/webp');res.end(preview);return;}
        const full = path.resolve(root, '.'+pathname);
        if (!full.startsWith(root+path.sep)) {res.writeHead(403).end();return;}
        fs.readFile(full,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(data);});
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const [engine,name,mobile] of [[chromium,'Chrome',false],[webkit,'Safari',true]]) {
            const browser = await engine.launch({headless:true});
            try {
                const context = await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile});
                let originals = 0;
                await context.route(origin+'/**',route=>{originals++;return route.fulfill({contentType:'image/jpeg',body:source});});
                const page = await context.newPage();
                const errors=[];
                page.on('pageerror',error=>errors.push(error.message));
                await page.goto(base+'/fixture');
                await page.setContent('<div id="coverDiv" style="height:240px;position:relative"></div><div id="cards"></div>');
                await page.addScriptTag({url:base+'/js/image-urls.js'});
                await page.addScriptTag({url:base+'/js/data.js'});
                assert.deepEqual(errors,[], 'loading shared scripts');
                let detail = fs.readFileSync(path.join(root,'js/pages/annuncio-detail.js'),'utf8');
                detail = detail.replace(/^document\.addEventListener\('DOMContentLoaded'.*$/gm,'');
                await page.addScriptTag({content:detail});
                await page.evaluate(({photo,avatar})=>{
                    _listingPhotos=[photo,photo.replace('photo.jpg','second.jpg')];
                    _currentListing={titolo:'Foto di prova'};
                    document.getElementById('coverDiv').innerHTML=_listingPhotos.map((url,i)=>listingPhotoLink(url,'Foto di prova',i,true)).join('');
                    USER_AVATARS['test-owner']=avatar;
                    document.getElementById('cards').innerHTML=buildCard({id:'test',user_id:'test-owner',titolo:'Prova',img_urls:[photo],stato:'Vendita',tipo:'Mercato',comune:'Brescia',regione:'Lombardia',prezzo:1000});
                },{photo,avatar});
                await page.waitForFunction(()=>document.querySelector('#coverDiv img').naturalWidth>0);
                assert.equal(originals,0,'no original should download before clicking');
                assert.match(await page.locator('#cards img').last().getAttribute('src'),/w=48/);
                await page.locator('#coverDiv a').first().click();
                await page.waitForFunction(()=>document.getElementById('listingPhotoStatus').textContent==='Foto originale');
                assert.equal(originals,1);
                assert.equal(await page.locator('#listingPhotoOriginal').getAttribute('src'),photo);
                assert.equal(await page.locator('#listingPhotoCounter').textContent(),'1 / 2');
                await page.locator('#listingPhotoNext').click();
                await page.waitForFunction(()=>document.getElementById('listingPhotoStatus').textContent==='Foto originale');
                assert.equal(originals,2);
                await page.keyboard.press('Escape');
                await page.waitForFunction(()=>!document.getElementById('listingPhotoDialog').open);
                assert.equal(await page.locator('#listingPhotoDialog').evaluate(el=>el.open),false);
                await page.waitForFunction(()=>!document.getElementById('listingPhotoOriginal').hasAttribute('src'));
                assert.equal(await page.locator('#listingPhotoOriginal').getAttribute('src'),null);
                assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
                await page.locator('#coverDiv a').first().focus();
                await page.keyboard.press('Enter');
                await page.waitForFunction(()=>document.getElementById('listingPhotoDialog').open);
                assert(await page.locator('#listingPhotoDialog').evaluate(el=>el.open));
                await page.getByRole('button',{name:'Chiudi foto'}).click();
                assert.deepEqual(errors,[]);
                console.log(`OK: ${name} ${mobile?'mobile':'desktop'}, lightweight cards/avatar, click-only originals, next photo, keyboard, closing and scroll restoration.`);
            } finally { await browser.close(); }
        }
    } finally { await new Promise(resolve=>server.close(resolve)); }
}

serverChecks().then(browserChecks).catch(error=>{global.fetch=originalFetch;console.error(error);process.exitCode=1;});
