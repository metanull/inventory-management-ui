import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Setup crypto polyfill before Vue plugin initialization
if (typeof globalThis.crypto === 'undefined') {
  try {
    const { webcrypto } = eval('require')('node:crypto')
    globalThis.crypto = webcrypto
  } catch {
    // Fallback crypto implementation
    globalThis.crypto = {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256)
        }
        return array
      },
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
      subtle: {} as SubtleCrypto,
    } as Crypto
  }
}

// Add crypto.hash function for Vite Vue plugin compatibility
if (!('hash' in globalThis.crypto)) {
  try {
    const crypto = eval('require')('node:crypto')
    Object.assign(globalThis.crypto, {
      hash: (algorithm: string, data: string | ArrayBuffer) => {
        return crypto.createHash(algorithm).update(data).digest('hex')
      },
    })
  } catch {
    Object.assign(globalThis.crypto, {
      hash: () => 'mock-hash-' + Math.random().toString(36).substring(2),
    })
  }
}

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
    setupFiles: ['./src/__tests__/test-utils.ts'],
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
