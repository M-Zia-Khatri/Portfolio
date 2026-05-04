import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'], // ✅ correct usage
      },
    }),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    __DEV__: JSON.stringify(!isProd),
  },

  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: !isProd,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
  },
});
