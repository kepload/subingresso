// Original files stay untouched. Only local previews of HEIF/TIFF are decoded.
(function (root) {
    'use strict';
    const MAX_BYTES = 50 * 1024 * 1024;
    const MAX_PIXELS = 60000000;
    const previews = new WeakMap();
    const pending = new WeakMap();
    const scripts = new Map();

    function mime(header) {
        const b = new Uint8Array(header);
        const text = (start, end) => String.fromCharCode(...b.slice(start, end));
        if (b[0] === 255 && b[1] === 216 && b[2] === 255) return 'image/jpeg';
        if (text(0, 8) === '\x89PNG\r\n\x1a\n') return 'image/png';
        if (/^GIF8[79]a$/.test(text(0, 6))) return 'image/gif';
        if (text(0, 4) === 'RIFF' && text(8, 12) === 'WEBP') return 'image/webp';
        if (text(0, 2) === 'BM') return 'image/bmp';
        if (text(0, 4) === 'II*\x00' || text(0, 4) === 'MM\x00*') return 'image/tiff';
        if (text(4, 8) === 'ftyp') {
            const brands = [];
            for (let i = 8; i + 4 <= b.length; i += 4) if (i !== 12) brands.push(text(i, i + 4));
            if (brands.some(brand => ['avif', 'avis'].includes(brand))) return 'image/avif';
            if (brands.some(brand => ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand))) return 'image/heic';
        }
        return null;
    }

    function dimensions(width, height) {
        if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > MAX_PIXELS) {
            throw new Error('Questa foto è troppo grande da aprire. Scegli una versione più piccola.');
        }
    }

    async function heifRgba(heif, image, width, height) {
        const decoded = await heif.heif_js_decode_image2(image.handle, heif.heif_colorspace.heif_colorspace_RGB, heif.heif_chroma.heif_chroma_interleaved_RGBA);
        try {
            const channel = decoded?.channels?.find(item => item.id === heif.heif_channel.heif_channel_interleaved);
            if (!channel || decoded.code || channel.width !== width || channel.height !== height) throw new Error('Foto non leggibile');
            const rgba = new Uint8ClampedArray(width * height * 4);
            for (let row = 0; row < height; row++) rgba.set(channel.data.subarray(row * channel.stride, row * channel.stride + width * 4), row * width * 4);
            return rgba;
        } finally { if (decoded?.image) heif.heif_image_release(decoded.image); }
    }

    function loadScript(src) {
        if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => { script.remove(); scripts.delete(src); reject(new Error('Non riesco ad aprire questa foto. Riprova.')); };
            document.head.appendChild(script);
        }));
        return scripts.get(src);
    }

    function needsPreview(file) { return /^image\/(heic|heif|tiff|avif)$/.test(file.type); }

    async function checkNative(file) {
        const url = URL.createObjectURL(file);
        try {
            const image = new Image();
            image.src = url;
            await image.decode();
            dimensions(image.naturalWidth, image.naturalHeight);
        } finally { URL.revokeObjectURL(url); }
    }

    async function decodePreview(file, type) {
        const bytes = await file.arrayBuffer();
        let width, height, rgba;
        if (type === 'image/avif') {
            const { default: decode } = await import('/js/vendor/avif-2.1.1/decode.js');
            const image = await decode(bytes);
            width = image.width; height = image.height; rgba = image.data;
            dimensions(width, height);
        } else if (type === 'image/heic' || type === 'image/heif') {
            await loadScript('/js/vendor/libheif-1.23.5.js?v=1');
            const heif = await (typeof root.libheif === 'function' ? (root.__listingHeif ||= root.libheif()) : root.libheif);
            const decoder = new heif.HeifDecoder();
            let images = [];
            try {
                images = decoder.decode(new Uint8Array(bytes));
                const image = images[0];
                if (!image) throw new Error('Foto non leggibile');
                width = image.get_width(); height = image.get_height();
                dimensions(width, height);
                rgba = await heifRgba(heif, image, width, height);
            } finally {
                images.forEach(image => image.free());
                if (decoder.decoder) heif.heif_context_free(decoder.decoder);
            }
        } else {
            await loadScript('/js/vendor/pako-1.0.11.js?v=1');
            await loadScript('/js/vendor/utif-3.1.0.js?v=1');
            const page = root.UTIF.decode(bytes)[0];
            if (!page) throw new Error('Foto non leggibile');
            width = page.t256?.[0]; height = page.t257?.[0];
            dimensions(width, height);
            root.UTIF.decodeImage(bytes, page);
            rgba = root.UTIF.toRGBA8(page);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
        const small = document.createElement('canvas');
        const scale = Math.min(1, 1280 / Math.max(width, height));
        small.width = Math.max(1, Math.round(width * scale)); small.height = Math.max(1, Math.round(height * scale));
        small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height);
        canvas.width = canvas.height = 0;
        return new Promise((resolve, reject) => small.toBlob(blob => {
            small.width = small.height = 0;
            if (blob) resolve(blob); else reject(new Error('Foto non leggibile'));
        }, 'image/png'));
    }

    async function prepare(file) {
        if (file.size > MAX_BYTES) throw new Error('Questa foto supera 50 MB. Scegli una versione più leggera.');
        const type = mime(await file.slice(0, 80).arrayBuffer());
        if (!type) throw new Error('Questo file non è una foto compatibile. Scegli un’altra immagine.');
        const normalized = file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });
        if (needsPreview(normalized) && !previews.has(file)) {
            if (!pending.has(file)) pending.set(file, decodePreview(file, type).then(blob => {
                previews.set(file, blob); previews.set(normalized, blob);
            }).catch(() => { throw new Error('Non riesco ad aprire questa foto. Prova con un’altra immagine.'); }).finally(() => pending.delete(file)));
            await pending.get(file);
        } else if (!needsPreview(normalized)) {
            try { await checkNative(normalized); }
            catch (_) { throw new Error('Non riesco ad aprire questa foto. Prova con un’altra immagine.'); }
        }
        return normalized;
    }

    const api = { MAX_BYTES, MAX_PIXELS, mime, dimensions, heifRgba, prepare, needsPreview, previewSource: file => previews.get(file) || file };
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ListingPhotos = api;
})(typeof window === 'object' ? window : globalThis);
