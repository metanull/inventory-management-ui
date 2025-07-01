import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  // Load environment variables from .env.integration.local
  const env = loadEnv(mode, globalThis.process?.cwd?.() || '.', ['VITE_'])

  return {
    plugins: [vue()],
    test: {
      // Integration test specific configuration
      name: 'integration',
      include: ['**/integration.test.ts'],
      environment: 'jsdom',
      globals: true,
      setupFiles: [],
      // Run tests sequentially to avoid conflicts with shared test data
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      // Longer timeout for network requests
      testTimeout: 30000,
      // Load integration test environment variables
      env: {
        NODE_ENV: 'test',
        ...env,
      },
      // Detailed output for integration tests
      reporters: ['verbose'],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    envDir: './',
    envPrefix: 'VITE_',
  }
})
