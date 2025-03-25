import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/GameViewer/', // 👈 this tells Vite to build for subpath deployment
  plugins: [svelte()],
  build: {
    outDir: 'dist',
  }
});
