// Real decoding in the browser and in the preview service, with no remote writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const bmp = require('bmp-js');
const formats = require('../js/listing-photos.js');
const { createHandler } = require('../lib/image-preview-cache.cjs');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function request(handler, name) {
    const result = {};
    await handler({ method: 'GET', query: { path: 'listings/fixture/' + name, w: '480', v: '1' } }, {
        setHeader() {}, status(status) { result.status = status; return this; }, end(body) { result.body = body; }
    });
    return result;
}

(async () => {
    const photo = sharp({ create: { width: 64, height: 48, channels: 3, background: '#2469ad' } });
    const fixtures = [];
    for (const format of ['jpeg', 'png', 'webp', 'avif', 'gif', 'tiff']) fixtures.push({ name: 'foto.' + format, type: 'image/' + format, bytes: await photo.clone().toFormat(format).toBuffer() });
    const data = Buffer.alloc(64 * 48 * 4);
    for (let i = 0; i < data.length; i += 4) { data[i + 1] = 173; data[i + 2] = 105; data[i + 3] = 36; }
    fixtures.push({ name: 'foto.bmp', type: 'image/bmp', bytes: bmp.encode({ data, width: 64, height: 48 }).data });
    if (process.env.HEIC_TEST_FILE) {
        const bytes = fs.readFileSync(process.env.HEIC_TEST_FILE);
        fixtures.push({ name: 'foto.heic', type: 'image/heic', bytes }, { name: 'foto.heif', type: 'image/heif', bytes });
    }
    for (const fixture of fixtures) {
        const originalHash = hash(fixture.bytes);
        const handler = createHandler({ storageKey: () => 'fixture-only', fetch: async (url, options = {}) => {
            if (options.method === 'POST') return Response.json({ Key: 'saved' });
            if (url.includes('/image-previews/')) return new Response(null, { status: 404 });
            return new Response(fixture.bytes, { headers: { 'Content-Type': fixture.type } });
        } });
        const result = await request(handler, fixture.name);
        assert.equal(result.status, 200, fixture.name + ': server preview');
        assert.equal((await sharp(result.body).metadata()).format, 'webp');
        assert.equal(hash(fixture.bytes), originalHash, 'original stays untouched');
        if (fixture.type === 'image/bmp') {
            const { data: pixel } = await sharp(result.body).raw().toBuffer({ resolveWithObject: true });
            assert(Math.abs(pixel[0] - 36) < 6 && Math.abs(pixel[2] - 173) < 6, 'BMP channel order');
        }
    }
    const png = fixtures.find(item => item.type === 'image/png').bytes;
    for (const size of [50 * 1024 * 1024, 50 * 1024 * 1024 + 1]) {
        const bytes = Buffer.alloc(size); png.copy(bytes);
        for (const contentLength of [true, false]) {
            const handler = createHandler({ storageKey: () => 'fixture-only', fetch: async (url, options = {}) => {
                if (options.method === 'POST') return Response.json({ Key: 'saved' });
                if (url.includes('/image-previews/')) return new Response(null, { status: 404 });
                return new Response(bytes, { headers: { 'Content-Type': 'image/png', ...(contentLength ? { 'Content-Length': String(size) } : {}) } });
            } });
            assert.equal((await request(handler, 'grande.png')).status, size > formats.MAX_BYTES ? 413 : 200, 'stream/header limit');
        }
    }
    console.log('OK: server decodes ' + fixtures.map(item => item.name).join(', ') + '; original hashes, BMP colors, 50 MiB accepted and 50 MiB + 1 rejected with/without Content-Length.');

    const server = http.createServer((req, res) => {
        const name = new URL(req.url, 'http://localhost').pathname;
        if (name === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><script src="/js/listing-photos.js?v=1"></script>'); return; }
        const full = path.resolve(root, '.' + name);
        if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) { res.writeHead(404).end(); return; }
        res.setHeader('Content-Type', full.endsWith('.wasm') ? 'application/wasm' : 'text/javascript'); fs.createReadStream(full).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const name of ['chromium', 'webkit']) {
            const browser = await playwright[name].launch({ headless: true });
            try {
                const page = await browser.newPage();
                const errors = []; page.on('pageerror', error => errors.push(error.message));
                await page.goto('http://127.0.0.1:' + server.address().port);
                for (const fixture of fixtures) {
                    console.log('Decode ' + name + ': ' + fixture.name);
                    const result = await page.evaluate(async fixture => {
                        const bytes = Uint8Array.from(atob(fixture.base64), char => char.charCodeAt(0));
                        // Also exercise missing/unreliable MIME types from phone pickers.
                        const file = new File([bytes], fixture.name, { type: '' });
                        const prepared = await ListingPhotos.prepare(file);
                        const preserved = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await prepared.arrayBuffer()))).map(n => n.toString(16).padStart(2, '0')).join('');
                        const preview = ListingPhotos.previewSource(prepared);
                        const url = URL.createObjectURL(preview), image = new Image();
                        try { image.src = url; await image.decode(); return { type: prepared.type, preserved, width: image.naturalWidth, height: image.naturalHeight }; }
                        finally { URL.revokeObjectURL(url); }
                    }, { name: fixture.name, base64: fixture.bytes.toString('base64') });
                    assert.equal(result.preserved, hash(fixture.bytes), fixture.name + ': exact original');
                    assert(result.width > 0 && result.height > 0, fixture.name + ': visible preview');
                }
                assert(await page.evaluate(async base64 => {
                    const png = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
                    const bytes = new Uint8Array(ListingPhotos.MAX_BYTES); bytes.set(png);
                    const original = new File([bytes], 'grande.png', { type: 'image/png' });
                    if (await ListingPhotos.prepare(original) !== original) return false;
                    try { await ListingPhotos.prepare(new File([bytes, 'x'], 'troppo-grande.png', { type: 'image/png' })); return false; }
                    catch (error) { if (!error.message.includes('50 MB')) return false; }
                    for (const [data, type] of [['<svg/>', 'image/svg+xml'], ['file falso', 'image/jpeg'], ['%PDF-1.7', 'image/png']]) {
                        try { await ListingPhotos.prepare(new File([data], 'falsa.jpg', { type })); return false; } catch (_) {}
                    }
                    return true;
                }, png.toString('base64')), name + ': real file limit and invalid files');
                assert.deepEqual(errors, []);
                console.log('OK: ' + name + ' shows every format, normalizes empty MIME, preserves all original bytes, accepts 50 MiB and rejects oversized/invalid files.');
            } finally { await browser.close(); }
        }
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
