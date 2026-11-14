import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: { environment: 'jsdom' },
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // In dev, /api calls go to Express. Same-origin means auth cookies work without CORS headaches.
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
