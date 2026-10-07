// Generate disposable WebP previews. Supabase retains the untouched originals.
const sharp = require('sharp');
const { isImagePath, widths, origin, marker } = require('../js/image-urls.js');
const MAX_BYTES = 20 * 1024 * 1024;

module.exports = async function handler(req, res) {
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
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const url = origin + marker + path.split('/').map(encodeURIComponent).join('/');
        const upstream = await fetch(url, { signal: controller.signal, redirect: 'error' });
        if (!upstream.ok) return res.status(upstream.status === 404 ? 404 : 502).end();
        const contentType = (upstream.headers.get('content-type') || '').split(';')[0];
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/heic', 'image/heif'].includes(contentType)) {
            await upstream.body.cancel();
            return res.status(415).end();
        }
        if (Number(upstream.headers.get('content-length')) > MAX_BYTES) {
            await upstream.body.cancel();
            return res.status(413).end();
        }
        const chunks = [];
        let bytes = 0;
        for await (const chunk of upstream.body) {
            bytes += chunk.length;
            if (bytes > MAX_BYTES) { controller.abort(); return res.status(413).end(); }
            chunks.push(chunk);
        }
        const avatar = path.startsWith('avatars/');
        const preview = await sharp(Buffer.concat(chunks), { limitInputPixels: 60000000, animated: false })
            .rotate()
            .resize({ width, height: width, fit: avatar ? 'cover' : 'inside', withoutEnlargement: true })
            .webp({ quality: avatar ? 78 : 80, effort: 4 })
            .toBuffer();
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Content-Length', String(preview.length));
        // Versioned object paths allow a long CDN cache without changing originals.
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800');
        return res.status(200).end(req.method === 'HEAD' ? undefined : preview);
    } catch (_) {
        return res.status(controller.signal.aborted ? 504 : 502).end();
    } finally { clearTimeout(timeout); }
};
