import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      // Solo la lógica que se prueba sin navegador ni base de datos (pantallas y rutas quedan fuera).
      include: [
        'src/lib/format.ts', 'src/lib/video.ts', 'src/lib/cart-helpers.ts',
        'server/lib/money.ts', 'server/lib/orders.ts', 'server/lib/whatsapp.ts',
        'server/middleware/cache.ts', 'server/middleware/validate.ts', 'shared/schemas.ts',
      ],
    },
  },
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
