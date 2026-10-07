// Shared by the browser and SSR: previews always point to the same cached URL.
(function (root) {
    const origin = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
    const marker = '/storage/v1/object/public/';
    const widths = [48, 96, 192, 480, 768, 1280];

    function isImagePath(path) {
        return typeof path === 'string' && /^(avatars|listings)\/[^/]+\/.+/.test(path)
            && !/[\\\x00-\x1f]/.test(path)
            && !path.split('/').some(part => part === '..' || part === '.' || part === '');
    }

    function isWebImageUrl(url) {
        try { return typeof url === 'string' && ['https:', 'http:'].includes(new URL(url).protocol); }
        catch (_) { return false; }
    }

    function getOptimizedImageUrl(url, width = 480) {
        if (!url || typeof url !== 'string') return url;
        try {
            const source = new URL(url);
            if (source.origin !== origin || !source.pathname.startsWith(marker)) return url;
            const path = decodeURIComponent(source.pathname.slice(marker.length));
            if (!isImagePath(path)) return url;
            const size = widths.find(value => value >= Number(width)) || widths[widths.length - 1];
            return '/api/image?path=' + encodeURIComponent(path) + '&w=' + size + '&v=1';
        } catch (_) { return url; }
    }

    const helpers = { getOptimizedImageUrl, isImagePath, isWebImageUrl, widths, origin, marker };
    if (typeof module === 'object' && module.exports) module.exports = helpers;
    else root.getOptimizedImageUrl = getOptimizedImageUrl;
})(typeof window === 'object' ? window : globalThis);
