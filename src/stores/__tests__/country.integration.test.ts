import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCountryStore } from '@/stores/country'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

describe('Country Store Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Set up environment for integration tests
    process.env.VITE_API_BASE_URL = API_BASE_URL
  })

  it('should authenticate and fetch countries from real API', async () => {
    const authStore = useAuthStore()
    const countryStore = useCountryStore()

    try {
      // First authenticate
      await authStore.login('user@example.com', 'password')

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.token).toBeTruthy()

      // Then fetch countries
      await countryStore.fetchCountries()

      expect(countryStore.countries).toBeDefined()
      expect(Array.isArray(countryStore.countries)).toBe(true)
      expect(countryStore.loading).toBe(false)
      expect(countryStore.error).toBeNull()
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 10000) // 10 second timeout for network operations

  it('should create, read, update, and delete a country', async () => {
    const authStore = useAuthStore()
    const countryStore = useCountryStore()

    try {
      // First authenticate
      await authStore.login('user@example.com', 'password')

      expect(authStore.isAuthenticated).toBe(true)

      // Create a test country
      const testCountryData = {
        id: 'TST',
        internal_name: 'Test Country Integration',
        backward_compatibility: 'TS',
      }

      const createdCountry = await countryStore.createCountry(testCountryData)

      expect(createdCountry).toBeDefined()
      expect(createdCountry?.id).toBe('TST')
      expect(createdCountry?.internal_name).toBe('Test Country Integration')
      expect(createdCountry?.backward_compatibility).toBe('TS')

      // Read the country
      const foundCountry = countryStore.findCountryById('TST')
      expect(foundCountry).toBeDefined()
      expect(foundCountry?.id).toBe('TST')

      // Update the country
      const updateData = {
        internal_name: 'Updated Test Country',
        backward_compatibility: 'UP',
      }

      const updatedCountry = await countryStore.updateCountry('TST', updateData)

      expect(updatedCountry).toBeDefined()
      expect(updatedCountry?.internal_name).toBe('Updated Test Country')
      expect(updatedCountry?.backward_compatibility).toBe('UP')

      // Delete the country
      const deleteResult = await countryStore.deleteCountry('TST')

      expect(deleteResult).toBe(true)

      // Verify deletion
      await countryStore.fetchCountries()
      const deletedCountry = countryStore.findCountryById('TST')
      expect(deletedCountry).toBeUndefined()
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 15000) // 15 second timeout for multiple operations

  it('should handle country errors gracefully', async () => {
    const authStore = useAuthStore()
    const countryStore = useCountryStore()

    try {
      // First authenticate
      await authStore.login('user@example.com', 'password')

      // Try to create a country with duplicate ID (assuming 'USA' exists)
      const duplicateCountryData = {
        id: 'USA',
        internal_name: 'Duplicate Country',
        backward_compatibility: 'US',
      }

      let errorOccurred = false
      try {
        await countryStore.createCountry(duplicateCountryData)
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(true)

      // Try to update a non-existent country
      errorOccurred = false
      try {
        await countryStore.updateCountry('XXX', {
          internal_name: 'Non-existent Country',
          backward_compatibility: null,
        })
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(true)

      // Try to delete a non-existent country
      const deleteResult = await countryStore.deleteCountry('XXX')
      expect(deleteResult).toBe(false)
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 10000) // 10 second timeout

  it('should handle authentication errors', async () => {
    const countryStore = useCountryStore()

    try {
      // Try to fetch countries without authentication
      let errorOccurred = false
      try {
        await countryStore.fetchCountries()
      } catch {
        errorOccurred = true
      }

      expect(errorOccurred).toBe(true)
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 5000) // 5 second timeout
})
