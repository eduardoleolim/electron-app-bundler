import sveltePlugin from 'esbuild-svelte';
import { sveltePreprocess } from 'svelte-preprocess';

/**
 * @type {import('esbuild').BuildOptions}
 */
const config = {
  plugins: [
    sveltePlugin({
      preprocess: sveltePreprocess() // Necessary for TypeScript
    })
  ]
};

export default config;
