import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@tiptap')) return 'editor';
          if (id.includes('recharts')) return 'charts';
          if (id.includes('framer-motion')) return 'animations';
        },
      },
    },
  },
});
