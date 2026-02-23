import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCountryStore } from '@/stores/country'
import type { CountryResource, StoreCountryRequest } from '@metanull/inventory-app-api-client'

// Mock the API client
const mockCountryApi = {
  countryIndex: vi.fn(),
  countryShow: vi.fn(),
  countryStore: vi.fn(),
  countryUpdate: vi.fn(),
  countryDestroy: vi.fn(),
}

vi.mock('@metanull/inventory-app-api-client', () => ({
  CountryApi: vi.fn(function (this: object) {
    return mockCountryApi
  }),
  Configuration: vi.fn(),
}))

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
    isAuthenticated: true,
  })),
}))

// Mock the error handler
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    handleError: vi.fn(),
  },
}))

const mockCountryData: CountryResource = {
  id: 'USA',
  internal_name: 'United States',
  backward_compatibility: 'US',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockCountriesResponse = {
  data: {
    data: [
      mockCountryData,
      {
        id: 'CAN',
        internal_name: 'Canada',
        backward_compatibility: 'CA',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ],
  },
}

describe('Country Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Mock console.error to keep the test output clean when errors are expected
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = useCountryStore()
      expect(store.category).toEqual([])
      expect(store.currentEntry).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.countriesCount).toBe(0)
    })
  })

  describe('fetchCountries', () => {
    it('should fetch countries successfully', async () => {
      const store = useCountryStore()
      mockCountryApi.countryIndex.mockResolvedValue(mockCountriesResponse)

      await store.fetchCountries()

      expect(mockCountryApi.countryIndex).toHaveBeenCalledOnce()
      expect(store.category).toEqual(mockCountriesResponse.data.data)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch countries error', async () => {
      const store = useCountryStore()
      mockCountryApi.countryIndex.mockRejectedValue(new Error('Network error'))

      await expect(store.fetchCountries()).rejects.toThrow()

      expect(store.category).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to fetch countries')
    })
  })

  describe('fetchCountry', () => {
    it('should fetch a single country successfully', async () => {
      const store = useCountryStore()
      const countryResponse = { data: { data: mockCountryData } }
      mockCountryApi.countryShow.mockResolvedValue(countryResponse)

      const result = await store.fetchCountry('USA')

      expect(mockCountryApi.countryShow).toHaveBeenCalledWith('USA')
      expect(store.currentEntry).toEqual(mockCountryData)
      expect(result).toEqual(mockCountryData)
    })

    it('should handle fetch country error', async () => {
      const store = useCountryStore()
      mockCountryApi.countryShow.mockRejectedValue(new Error('Country not found'))

      await expect(store.fetchCountry('INVALID')).rejects.toThrow()

      expect(store.currentEntry).toBeNull()
      expect(store.error).toBe('Failed to fetch country with ID: INVALID')
    })
  })

  describe('createCountry', () => {
    it('should create a country successfully', async () => {
      const store = useCountryStore()
      const newCountryData: StoreCountryRequest = {
        id: 'GBR',
        internal_name: 'United Kingdom',
      }
      const response = { data: { data: { ...mockCountryData, id: 'GBR' } } }
      mockCountryApi.countryStore.mockResolvedValue(response)

      await store.createCountry(newCountryData)

      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle create country error', async () => {
      const store = useCountryStore()
      mockCountryApi.countryStore.mockRejectedValue(new Error('Validation error'))

      await expect(store.createCountry({ id: 'GBR', internal_name: 'UK' })).rejects.toThrow()

      expect(store.error).toBe('Failed to create country')
    })
  })

  describe('updateCountry', () => {
    it('should handle update country error', async () => {
      const store = useCountryStore()
      mockCountryApi.countryUpdate.mockRejectedValue(new Error('Update failed'))

      await expect(store.updateCountry('USA', { internal_name: 'New Name' })).rejects.toThrow()

      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to update country')
    })
  })

  describe('deleteCountry', () => {
    it('should handle delete country error', async () => {
      const store = useCountryStore()
      mockCountryApi.countryDestroy.mockRejectedValue(new Error('Delete failed'))

      await expect(store.deleteCountry('USA')).rejects.toThrow()

      expect(store.error).toBe('Failed to delete country')
    })
  })

  describe('Computed Properties', () => {
    it('should sort countries alphabetically', () => {
      const store = useCountryStore()
      store.category.push(
        { id: 'USA', internal_name: 'United States' } as CountryResource,
        { id: 'CAN', internal_name: 'Canada' } as CountryResource
      )

      expect(store.sortedCountries[0]?.internal_name).toBe('Canada')
      expect(store.sortedCountries[1]?.internal_name).toBe('United States')
    })
  })
})
