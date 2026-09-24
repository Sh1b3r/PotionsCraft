import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        themes: resolve(__dirname, 'themes.html'),
        no: resolve(__dirname, 'no.html'),
        heroine: resolve(__dirname, 'heroine.html'),
      },
    },
  },
});
