import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Version « fichier unique » pour un lien de démonstration (sans service worker).
export default defineConfig({
  base: './',
  define: { 'import.meta.env.VITE_NO_PWA': JSON.stringify('1') },
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-demo', assetsInlineLimit: 100_000_000 }
});
