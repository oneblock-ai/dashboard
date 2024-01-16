const config = require('./shell/vue.config');

// Excludes the following plugins if there's no .env file.
let defaultExcludes = 'epinio, rancher-components, oneblock';

if (process.env.RANCHER_ENV === 'oneblock') {
  defaultExcludes = defaultExcludes.replace(', oneblock', '');
}
const excludes = process.env.EXCLUDES_PKG || defaultExcludes;

module.exports = config(__dirname, {
  excludes: excludes.replace(/\s/g, '').split(','),
  // excludes: ['fleet', 'example']
});
