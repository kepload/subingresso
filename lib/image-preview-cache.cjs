// Disposable derivatives of public originals, retained across Vercel deployments.
const { createHash } = require('node:crypto');
const listingImageSource = require('./listing-image-source.cjs');
const { isImagePath, widths, origin, marker } = require('../js/image-urls.js');
const bucket = 'image-previews';
const MAX_BYTES = 50 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 4 * 1024 * 1024;
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800';

function previewPath(path, width) {
    return 'v1/' + createHash('sha256').update(path).digest('hex') + '/' + width + '.webp';
}

class PreviewError extends Error {
    constructor(status) { super('Image preview unavailable'); this.status = status; }
}

async function readBytes(response, maxBytes) {
    if (Number(response.headers.get('content-length')) > maxBytes) {
        await response.body?.cancel();
        throw new PreviewError(413);
    }
    const chunks = [];
    let bytes = 0;
    for await (const chunk of response.body || []) {
        bytes += chunk.length;
        if (bytes > maxBytes) throw new PreviewError(413);
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

function createHandler({ fetch: fetchImage = (...args) => fetch(...args), storageKey = () => process.env.IMAGE_PREVIEW_STORAGE_KEY } = {}) {
    // Only pending work is retained in memory; completed previews live in Storage.
    const pending = new Map();

    async function generate(path, signal) {
        const key = storageKey();
        if (!key) throw new PreviewError(503);
        const url = origin + marker + path.split('/').map(encodeURIComponent).join('/');
        const upstream = await fetchImage(url, { signal, redirect: 'error' });
        if (!upstream.ok) {
            await upstream.body?.cancel();
            throw new PreviewError(upstream.status === 404 ? 404 : 502);
        }
        const contentType = (upstream.headers.get('content-type') || '').split(';')[0];
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/heic', 'image/heif', 'image/tiff', 'image/bmp', 'image/x-ms-bmp'].includes(contentType)) {
            await upstream.body?.cancel();
            throw new PreviewError(415);
        }
        const source = await readBytes(upstream, MAX_BYTES);
        const image = await listingImageSource(source);
        const avatar = path.startsWith('avatars/');
        const previews = new Map();
        // Sequential transforms keep memory/CPU bounded for large originals.
        for (const width of widths) {
            const preview = await image.clone()
                .resize({ width, height: width, fit: avatar ? 'cover' : 'inside', withoutEnlargement: true })
                .webp({ quality: avatar ? 78 : 80, effort: 4 })
                .toBuffer();
            previews.set(width, preview);
        }
        const uploads = await Promise.allSettled([...previews].map(async ([width, preview]) => {
            const saved = await fetchImage(origin + '/storage/v1/object/' + bucket + '/' + previewPath(path, width), {
                method: 'POST', signal, redirect: 'error',
                headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'image/webp', 'Cache-Control': 'max-age=31536000', 'x-upsert': 'false' },
                body: preview
            });
            if (saved.ok) { await saved.body?.cancel(); return; }
            // Another function may have saved the same immutable derivative first.
            const error = await saved.json().catch(() => ({}));
            if (saved.status === 409 || error.error === 'Duplicate' || String(error.statusCode) === '409') return;
            throw new PreviewError(503);
        }));
        if (uploads.some(result => result.status === 'rejected')) throw new PreviewError(503);
        return previews;
    }

    return async function handler(req, res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-store');
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.setHeader('Allow', 'GET, HEAD');
            return res.status(405).end();
        }
        const { path, w, v } = req.query || {};
        const width = Number(w);
        if (!isImagePath(path) || !widths.includes(width) || v !== '1'
            || Object.keys(req.query).some(key => !['path', 'w', 'v'].includes(key))) {
            return res.status(400).end();
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000);
        try {
            const cached = await fetchImage(origin + marker + bucket + '/' + previewPath(path, width), { signal: controller.signal, redirect: 'error' });
            let preview;
            if (cached.ok) {
                if ((cached.headers.get('content-type') || '').split(';')[0] !== 'image/webp') {
                    await cached.body?.cancel();
                    throw new PreviewError(502);
                }
                preview = await readBytes(cached, MAX_PREVIEW_BYTES);
                if (preview.toString('ascii', 0, 4) !== 'RIFF' || preview.toString('ascii', 8, 12) !== 'WEBP') throw new PreviewError(502);
                res.setHeader('X-Image-Preview-Cache', 'stored');
            } else {
                // Storage uses HTTP 400 with statusCode=404 for missing public objects.
                const error = await cached.json().catch(() => ({}));
                if (cached.status !== 404 && !(cached.status === 400 && String(error.statusCode) === '404')) throw new PreviewError(503);
                if (!pending.has(path)) {
                    const work = generate(path, controller.signal).finally(() => pending.delete(path));
                    pending.set(path, work);
                }
                preview = (await pending.get(path)).get(width);
                res.setHeader('X-Image-Preview-Cache', 'generated');
            }
            res.setHeader('Content-Type', 'image/webp');
            res.setHeader('Content-Length', String(preview.length));
            res.setHeader('Cache-Control', CACHE_CONTROL);
            return res.status(200).end(req.method === 'HEAD' ? undefined : preview);
        } catch (error) {
            return res.status(controller.signal.aborted ? 504 : error.status || 502).end();
        } finally { clearTimeout(timeout); }
    };
}

module.exports = { createHandler, previewPath, bucket };
