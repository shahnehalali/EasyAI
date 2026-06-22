import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Consume the screenshot-feedback plugin's React package straight from
      // source; Vite transpiles its TS/TSX. (The plugin lives at the repo root.)
      '@ritjira/feedback-react': path.resolve(__dirname, '../plugins/screenshot-feedback/react/src/index.ts'),
      // The plugin source is outside client/, so its bare imports must be pinned
      // to the client's installed copies for both dev and production builds.
      'html-to-image': path.resolve(__dirname, 'node_modules/html-to-image'),
      'react-konva': path.resolve(__dirname, 'node_modules/react-konva'),
      konva: path.resolve(__dirname, 'node_modules/konva'),
    },
  },
  // The plugin source is a sibling of client/, so allow Vite to read above the root.
  server: {
    port: 5173,
    fs: { allow: [path.resolve(__dirname, '..')] },
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  optimizeDeps: { include: ['konva', 'react-konva', 'html-to-image'] },
});
