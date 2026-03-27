// CJS compatibility entrypoint:
// Historically `require('recht')` returned the `Recht` class directly.
const mod = require('./dist/index.cjs')
module.exports = mod && (mod.default || mod.Recht) ? (mod.default || mod.Recht) : mod

