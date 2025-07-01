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
    // Explicitly exclude integration tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.integration.test.ts',
      '**/integration.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Exclude integration tests from coverage as well
      exclude: [
        'node_modules/**',
        'dist/**',
        'scripts/**',
        'docs/**',
        '.github/**',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/*.integration.test.ts',
        '**/integration.test.ts',
        'src/__tests__/**',
        '**/__tests__/**',
        '**/test-utils.ts',
      ],
      // Only include src files for coverage
      include: ['src/**/*.{ts,vue}'],
      // Exclude specific files that don't need coverage
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
    },
    setupFiles: ['./vitest.setup.ts', './src/__tests__/test-utils.ts'],
  },
})
