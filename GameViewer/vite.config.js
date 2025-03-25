import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/GameViewer/', // important for Netlify subpath
  plugins: [svelte()],
  build: {
    outDir: 'dist',
  }
});
