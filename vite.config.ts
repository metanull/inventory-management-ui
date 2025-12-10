import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
    // proxy: {
    //   '/api': {
    //     target: 'http://127.0.0.1:8000',
    //     changeOrigin: true,
    //     // rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // }
  },
  preview: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
})
