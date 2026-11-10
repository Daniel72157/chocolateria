import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { proxy: { '/api': 'http://localhost:3001', '/sitemap.xml': 'http://localhost:3001' } },
  preview: { proxy: { '/api': 'http://localhost:3001', '/sitemap.xml': 'http://localhost:3001' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'], data: ['@tanstack/react-query', '@supabase/supabase-js', 'zustand'] },
      },
    },
  },
});
