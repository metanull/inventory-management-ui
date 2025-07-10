// Integration test setup
// This file is loaded before integration tests run

/// <reference lib="dom" />

// Export to make this file a module
export {}

// Mock localStorage for Node.js environment
if (typeof globalThis.localStorage === 'undefined') {
  const localStorageMock = {
    storage: new Map<string, string>(),
    getItem(key: string) {
      return this.storage.get(key) || null
    },
    setItem(key: string, value: string) {
      this.storage.set(key, value)
    },
    removeItem(key: string) {
      this.storage.delete(key)
    },
    clear() {
      this.storage.clear()
    },
    get length() {
      return this.storage.size
    },
    key(index: number) {
      const keys = Array.from(this.storage.keys())
      return keys[index] || null
    },
  }

  globalThis.localStorage = localStorageMock as any
}

// Set test environment variables
globalThis.process = globalThis.process || {}
globalThis.process.env = globalThis.process.env || {}

// Set default API base URL for integration tests
if (!globalThis.process.env.VITE_API_BASE_URL) {
  globalThis.process.env.VITE_API_BASE_URL = 'http://127.0.0.1:8000/api'
}

console.log('Integration test setup complete')
console.log('API Base URL:', globalThis.process.env.VITE_API_BASE_URL)
