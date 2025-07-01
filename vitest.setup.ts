/**
 * Vitest global setup file
 * This runs before any tests and ensures crypto polyfill is available
 */

// Setup crypto polyfill for CI environments
if (typeof globalThis.crypto === 'undefined' || !('hash' in globalThis.crypto)) {
  try {
    // Try to use Node.js crypto with dynamic import to avoid bundler issues

    const crypto = eval('require')('node:crypto')

    // Set up basic crypto if it doesn't exist
    if (typeof globalThis.crypto === 'undefined') {
      globalThis.crypto = {
        ...crypto.webcrypto,
        getRandomValues: (array: Uint8Array) => {
          const values = crypto.randomBytes(array.length)
          array.set(values)
          return array
        },
        randomUUID: crypto.randomUUID,
        subtle: crypto.webcrypto?.subtle || ({} as SubtleCrypto),
      } as Crypto
    }

    // Add the hash function that Vite Vue plugin expects
    if (!('hash' in globalThis.crypto)) {
      Object.defineProperty(globalThis.crypto, 'hash', {
        value: (algorithm: string, data: string | ArrayBuffer | Uint8Array) => {
          return crypto.createHash(algorithm).update(data).digest('hex')
        },
        writable: false,
        enumerable: true,
        configurable: false,
      })
    }

    console.log('✅ Crypto polyfill setup complete')
  } catch {
    console.warn('⚠️ Failed to setup Node.js crypto, using fallback')

    // Fallback implementation for environments without Node.js crypto
    if (typeof globalThis.crypto === 'undefined') {
      globalThis.crypto = {} as Crypto
    }

    Object.assign(globalThis.crypto, {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256)
        }
        return array
      },
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2),
      subtle: {} as SubtleCrypto,
      hash: (_algorithm: string, data: string | ArrayBuffer | Uint8Array) => {
        // Simple deterministic hash fallback
        const str = typeof data === 'string' ? data : data.toString()
        let hash = 0
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i)
          hash = (hash << 5) - hash + char
          hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16)
      },
    })

    console.log('✅ Fallback crypto polyfill setup complete')
  }
}

export {}
