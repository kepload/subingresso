// Behavioral checks: persistent reuse, cold functions, concurrency and failures.
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { createHandler, previewPath, bucket } = require('../lib/image-preview-cache.cjs');
const { widths, origin, marker } = require('../js/image-urls.js');

async function request(handler, path = 'listings/test-owner/photo.jpg', width = 480, method = 'GET') {
    const result = { headers: {} };
    await handler({ method, query: { path, w: String(width), v: '1' } }, {
        setHeader(k, v) { result.headers[k] = v; },
        status(n) { result.status = n; return this; },
        end(body) { result.body = body; return this; }
    });
    return result;
}

(async () => {
    const source = await sharp({ create: { width: 1800, height: 1200, channels: 3, background: '#6d8b43' } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const stored = new Map();
    let originals = 0, uploads = 0, cacheReads = 0;
    let cacheError = false, saveError = false, duplicates = false;
    const fetchImage = async (url, options = {}) => {
        assert.equal(options.redirect, 'error');
        if (options.method === 'POST') {
            assert.ok(url.startsWith(origin + '/storage/v1/object/' + bucket + '/v1/'));
            assert.equal(options.headers.Authorization, 'Bearer fixture-key');
            assert.equal(options.headers['x-upsert'], 'false');
            assert.equal(options.headers['Cache-Control'], 'max-age=31536000');
            uploads++;
            if (saveError) return Response.json({ error: 'Unavailable' }, { status: 503 });
            stored.set(url.replace('/object/', '/object/public/'), Buffer.from(options.body));
            if (duplicates) return Response.json({ error: 'Duplicate', statusCode: '409' }, { status: 400 });
            return Response.json({ Key: 'saved' });
        }
        assert.equal(options.headers, undefined, 'credentials never go to public reads');
        if (url.startsWith(origin + marker + bucket + '/')) {
            cacheReads++;
            if (cacheError) return new Response(null, { status: 503 });
            const value = stored.get(url);
            return value ? new Response(value, { headers: { 'Content-Type': 'image/webp' } })
                : Response.json({ statusCode: '404', error: 'not_found' }, { status: 400 });
        }
        originals++;
        assert.ok(url.startsWith(origin + marker + 'listings/') || url.startsWith(origin + marker + 'avatars/'));
        await new Promise(resolve => setTimeout(resolve, 10));
        return new Response(source, { headers: { 'Content-Type': 'image/jpeg' } });
    };
    const factory = () => createHandler({ fetch: fetchImage, storageKey: () => 'fixture-key' });
    const handler = factory();
    const results = await Promise.all(widths.map(width => request(handler, undefined, width)));
    assert.equal(originals, 1, 'concurrent sizes download the original once');
    assert.equal(uploads, widths.length);
    for (let i = 0; i < widths.length; i++) {
        assert.equal(results[i].status, 200);
        const meta = await sharp(results[i].body).metadata();
        assert.equal(meta.height, Math.min(widths[i], 1800));
        assert.equal(meta.exif, undefined);
        assert.equal(meta.orientation, undefined);
    }
    // New handler = a cold function/new deployment, with no shared memory.
    const restarted = factory();
    for (const width of widths) {
        const result = await request(restarted, undefined, width);
        assert.equal(result.status, 200);
        assert.equal(result.headers['X-Image-Preview-Cache'], 'stored');
        assert.deepEqual(result.body, results[widths.indexOf(width)].body);
    }
    const head = await request(factory(), undefined, 480, 'HEAD');
    assert.equal(head.body, undefined);
    assert.equal(head.headers['Content-Length'], String(results[3].body.length));
    assert.equal(originals, 1, 'cold requests and HEAD do not fetch the original');
    assert.equal(uploads, widths.length, 'saved derivatives are never overwritten');
    cacheError = true;
    const unavailable = await request(factory());
    assert.equal(unavailable.status, 503);
    assert.equal(unavailable.headers['Cache-Control'], 'no-store');
    assert.equal(originals, 1, 'cache outages must not trigger more original downloads');
    cacheError = false;
    const missingKey = createHandler({ fetch: fetchImage, storageKey: () => undefined });
    assert.equal((await request(missingKey)).status, 200, 'saved derivatives remain readable without write credentials');
    assert.equal((await request(missingKey, 'listings/test-owner/new.jpg')).status, 503);
    assert.equal(originals, 1);
    saveError = true;
    assert.equal((await request(handler, 'listings/test-owner/new.jpg')).status, 503);
    saveError = false;
    duplicates = true;
    assert.equal((await request(handler, 'listings/test-owner/new.jpg')).status, 200, 'failed pending work can be retried; duplicate writers are harmless');
    duplicates = false;
    const avatar = await request(handler, 'avatars/test-owner/avatar.png', 48);
    const avatarMeta = await sharp(avatar.body).metadata();
    assert.equal(avatarMeta.width, 48);
    assert.equal(avatarMeta.height, 48);
    assert.notEqual(previewPath('listings/a/photo.jpg', 480), previewPath('listings/b/photo.jpg', 480));
    assert.notEqual(previewPath('listings/a/photo.jpg', 480), previewPath('avatars/a/photo.jpg', 480));
    const corruptUrl = origin + marker + bucket + '/' + previewPath('listings/corrupt/photo.jpg', 480);
    stored.set(corruptUrl, Buffer.from('not a webp'));
    const beforeCorrupt = originals;
    assert.equal((await request(factory(), 'listings/corrupt/photo.jpg')).status, 502);
    assert.equal(originals, beforeCorrupt);
    console.log('OK: one original for six simultaneous sizes; byte-identical persistent reuse after cold start; HEAD, square avatars, immutable uploads, credential isolation, missing key, outages, corrupt cache, failed writes/retry and concurrent writer conflicts.');
    console.log(JSON.stringify({ fixtureCacheReads: cacheReads, originalDownloadsForFirstSixSizesAndColdReplay: 1, retainedVariants: widths.length }));
})().catch(error => { console.error(error); process.exitCode = 1; });
