/* eslint-disable @typescript-eslint/no-require-imports */
const postcss = require('esbuild-postcss');

/** @type {import("esbuild").BuildOptions} */
module.exports = {
  plugins: [postcss()]
};
