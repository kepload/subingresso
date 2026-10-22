// Reuse stored WebP derivatives before reading the untouched public original.
const { createHandler } = require('../lib/image-preview-cache.cjs');
module.exports = createHandler();
