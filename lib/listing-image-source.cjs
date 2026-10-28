const sharp = require('sharp');
const { mime, dimensions, heifRgba, MAX_PIXELS } = require('../js/listing-photos.js');

// Decode unusual phone/desktop formats for derivatives, preserving the stored original.
module.exports = async function listingImageSource(source) {
    const type = mime(source.subarray(0, 80));
    if (type === 'image/heic') {
        const heif = await require('libheif-js/wasm-bundle');
        const decoder = new heif.HeifDecoder();
        let images = [];
        try {
            images = decoder.decode(source);
            const image = images[0];
            if (!image) throw new Error('Invalid HEIF');
            const width = image.get_width(), height = image.get_height();
            dimensions(width, height);
            const rgba = await heifRgba(heif, image, width, height);
            return sharp(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength), { raw: { width, height, channels: 4 } });
        } finally {
            images.forEach(image => image.free());
            if (decoder.decoder) heif.heif_context_free(decoder.decoder);
        }
    }
    if (type === 'image/bmp') {
        if (source.length < 54) throw new Error('Invalid BMP');
        dimensions(source.readInt32LE(18), Math.abs(source.readInt32LE(22)));
        const { data, width, height } = require('bmp-js').decode(source);
        // bmp-js emits ABGR. sharp expects RGBA.
        for (let i = 0; i < data.length; i += 4) {
            const blue = data[i + 1], green = data[i + 2], red = data[i + 3];
            data[i] = red; data[i + 1] = green; data[i + 2] = blue; data[i + 3] = 255;
        }
        return sharp(data, { raw: { width, height, channels: 4 } });
    }
    return sharp(source, { limitInputPixels: MAX_PIXELS, animated: false }).rotate();
};
