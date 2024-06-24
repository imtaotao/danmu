import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { outDir: '../output' },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/components'),
    },
  },
});
