import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    watch: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./vitest.setup.ts', './src/__tests__/test-utils.ts'],
    // Fix for Node.js crypto compatibility in tests
    pool: 'forks',
    // Additional environment setup for better Node.js compatibility
    env: {
      NODE_ENV: 'test',
    },
    // Ensure proper jsdom configuration
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
})
