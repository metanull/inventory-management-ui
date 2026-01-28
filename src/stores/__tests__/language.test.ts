import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLanguageStore } from '../language'
import type { LanguageResource } from '@metanull/inventory-app-api-client'

/**
 * Language Store Tests - Reference Data Pattern
 *
 * These tests verify the Reference Data pattern implementation:
 * 1. ensureLoaded() - Main entry point, returns cached data or fetches all
 * 2. loadAll() - Internal method that fetches all pages in parallel
 * 3. Mutations update the cache in-place
 */

// Mock the ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  ErrorHandler: {
    handleError: vi.fn(),
  },
}))

// Mock the auth store
vi.mock('../auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock the API client
const mockLanguageApi = {
  languageIndex: vi.fn(),
  languageShow: vi.fn(),
  languageStore: vi.fn(),
  languageUpdate: vi.fn(),
  languageDestroy: vi.fn(),
  languageSetDefault: vi.fn(),
  languageGetDefault: vi.fn(),
}

vi.mock('@metanull/inventory-app-api-client', () => ({
  LanguageApi: vi.fn(function (this: object) {
    return mockLanguageApi
  }),
  Configuration: vi.fn(),
}))

const mockLanguages: LanguageResource[] = [
  {
    id: 'eng',
    internal_name: 'English',
    backward_compatibility: 'en',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fra',
    internal_name: 'French',
    backward_compatibility: 'fr',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('Language Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const store = useLanguageStore()

    expect(store.languages).toEqual([])
    expect(store.currentLanguage).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isLoaded).toBe(false)
  })

  it('should compute default language correctly', () => {
    const store = useLanguageStore()

    // Initially no default language
    expect(store.defaultLanguage).toBeUndefined()

    // Add languages with one being default
    store.languages = mockLanguages
    expect(store.defaultLanguage?.id).toBe('eng')
  })

  it('should clear error', () => {
    const store = useLanguageStore()

    store.error = 'Some error'
    store.clearError()

    expect(store.error).toBeNull()
  })

  it('should clear current language', () => {
    const store = useLanguageStore()

    store.currentLanguage = mockLanguages[0]
    store.clearCurrentLanguage()

    expect(store.currentLanguage).toBeNull()
  })

  describe('ensureLoaded - Reference Data Pattern', () => {
    it('should fetch all languages on first call', async () => {
      const store = useLanguageStore()

      // Mock single page response
      mockLanguageApi.languageIndex.mockResolvedValue({
        data: {
          data: mockLanguages,
          meta: { current_page: 1, last_page: 1 },
        },
      })

      const result = await store.ensureLoaded()

      expect(mockLanguageApi.languageIndex).toHaveBeenCalledWith(1, 100)
      expect(result).toHaveLength(2)
      expect(store.isLoaded).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('should return cached data on subsequent calls', async () => {
      const store = useLanguageStore()

      // Mock single page response
      mockLanguageApi.languageIndex.mockResolvedValue({
        data: {
          data: mockLanguages,
          meta: { current_page: 1, last_page: 1 },
        },
      })

      // First call - should fetch
      await store.ensureLoaded()
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledTimes(1)

      // Second call - should return cached data
      const result = await store.ensureLoaded()
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledTimes(1) // Not called again
      expect(result).toHaveLength(2)
    })

    it('should fetch multiple pages in parallel', async () => {
      const store = useLanguageStore()

      const page1Languages = [mockLanguages[0]]
      const page2Languages = [mockLanguages[1]]

      // Mock multi-page response
      mockLanguageApi.languageIndex
        .mockResolvedValueOnce({
          data: {
            data: page1Languages,
            meta: { current_page: 1, last_page: 2 },
          },
        })
        .mockResolvedValueOnce({
          data: {
            data: page2Languages,
            meta: { current_page: 2, last_page: 2 },
          },
        })

      await store.ensureLoaded()

      // Should have called for both pages
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledTimes(2)
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledWith(1, 100)
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledWith(2, 100)

      // Should have all languages combined and sorted
      expect(store.languages).toHaveLength(2)
    })

    it('should handle fetch error', async () => {
      const store = useLanguageStore()
      const error = new Error('Network error')

      mockLanguageApi.languageIndex.mockRejectedValue(error)

      await expect(store.ensureLoaded()).rejects.toThrow('Network error')

      expect(store.loading).toBe(false)
      expect(store.error).toBe('Failed to load languages')
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('refresh', () => {
    it('should force re-fetch even if data is cached', async () => {
      const store = useLanguageStore()

      mockLanguageApi.languageIndex.mockResolvedValue({
        data: {
          data: mockLanguages,
          meta: { current_page: 1, last_page: 1 },
        },
      })

      // First load
      await store.ensureLoaded()
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledTimes(1)

      // Refresh should fetch again
      await store.refresh()
      expect(mockLanguageApi.languageIndex).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle fetchLanguage success', async () => {
    const store = useLanguageStore()
    const language = mockLanguages[0]

    mockLanguageApi.languageShow.mockResolvedValue({
      data: { data: language },
    })

    const result = await store.fetchLanguage('eng')

    expect(mockLanguageApi.languageShow).toHaveBeenCalledWith('eng')
    expect(store.currentLanguage).toEqual(language)
    expect(result).toEqual(language)
  })

  describe('Mutations - Cache Update In-Place', () => {
    it('should handle createLanguage success and update cache', async () => {
      const store = useLanguageStore()
      const newLanguage: LanguageResource = {
        id: 'spa',
        internal_name: 'Spanish',
        backward_compatibility: 'es',
        is_default: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }
      const createData = {
        id: 'spa',
        internal_name: 'Spanish',
        backward_compatibility: 'es',
        is_default: false,
      }

      mockLanguageApi.languageStore.mockResolvedValue({
        data: { data: newLanguage },
      })

      const result = await store.createLanguage(createData)

      expect(mockLanguageApi.languageStore).toHaveBeenCalledWith(createData)
      expect(store.languages).toHaveLength(1)
      expect(store.languages[0]).toEqual(newLanguage)
      expect(result).toEqual(newLanguage)
    })

    it('should handle updateLanguage success and update cache', async () => {
      const store = useLanguageStore()
      store.languages = [...mockLanguages]

      const updatedLanguage = { ...mockLanguages[0], internal_name: 'Updated English' }
      const updateData = {
        internal_name: 'Updated English',
        backward_compatibility: 'en',
        is_default: true,
      }

      mockLanguageApi.languageUpdate.mockResolvedValue({
        data: { data: updatedLanguage },
      })

      const result = await store.updateLanguage('eng', updateData)

      expect(mockLanguageApi.languageUpdate).toHaveBeenCalledWith('eng', updateData)
      expect(store.languages[0]).toEqual(updatedLanguage)
      expect(result).toEqual(updatedLanguage)
    })

    it('should handle deleteLanguage success and update cache', async () => {
      const store = useLanguageStore()
      store.languages = [...mockLanguages]

      mockLanguageApi.languageDestroy.mockResolvedValue({})

      await store.deleteLanguage('fra')

      expect(mockLanguageApi.languageDestroy).toHaveBeenCalledWith('fra')
      expect(store.languages).toHaveLength(1)
      expect(store.languages[0].id).toBe('eng')
    })

    it('should handle setDefaultLanguage success and update all languages in cache', async () => {
      const store = useLanguageStore()
      store.languages = [...mockLanguages]
      store.currentLanguage = mockLanguages[1] // 'fra' language

      const updatedLanguage = { ...mockLanguages[1], is_default: true }

      mockLanguageApi.languageSetDefault.mockResolvedValue({
        data: { data: updatedLanguage },
      })

      const result = await store.setDefaultLanguage('fra', true)

      expect(mockLanguageApi.languageSetDefault).toHaveBeenCalledWith('fra', { is_default: true })

      // Check that the target language is now default
      expect(store.languages.find(lang => lang.id === 'fra')?.is_default).toBe(true)

      // Check that other languages are no longer default
      expect(store.languages.find(lang => lang.id === 'eng')?.is_default).toBe(false)

      // Check that current language is updated if it matches
      expect(store.currentLanguage?.is_default).toBe(true)

      expect(result).toEqual(updatedLanguage)
    })

    it('should handle setDefaultLanguage error', async () => {
      const store = useLanguageStore()
      const errorMessage = 'Failed to set default'

      mockLanguageApi.languageSetDefault.mockRejectedValue(new Error(errorMessage))

      await expect(store.setDefaultLanguage('fra', true)).rejects.toThrow(errorMessage)
      expect(store.error).toBe('Failed to set default language')
    })
  })

  describe('getDefaultLanguage', () => {
    it('should handle getDefaultLanguage success and update cache', async () => {
      const store = useLanguageStore()
      const defaultLanguage = mockLanguages[0] // English is the default

      mockLanguageApi.languageGetDefault.mockResolvedValue({
        data: { data: defaultLanguage },
      })

      // Set isLoaded to true to allow cache update
      store.languages = []
      // @ts-expect-error - accessing internal state for testing
      store.isLoaded = true

      const result = await store.getDefaultLanguage()

      expect(mockLanguageApi.languageGetDefault).toHaveBeenCalled()
      expect(result).toEqual(defaultLanguage)
      expect(store.languages).toHaveLength(1)
      expect(store.languages[0]).toEqual(defaultLanguage)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle getDefaultLanguage error', async () => {
      const store = useLanguageStore()
      const errorMessage = 'Failed to get default'

      mockLanguageApi.languageGetDefault.mockRejectedValue(new Error(errorMessage))

      await expect(store.getDefaultLanguage()).rejects.toThrow(errorMessage)
      expect(store.error).toBe('Failed to get default language')
    })
  })
})
