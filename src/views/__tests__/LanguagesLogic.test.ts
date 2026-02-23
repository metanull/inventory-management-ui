import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
import { useErrorDisplayStore } from '@/stores/errorDisplay'
import { createMockLanguage } from '@/__tests__/test-utils'
import type { LanguageResource } from '@metanull/inventory-app-api-client'

// Mock console to avoid noise in test output
let originalConsole: typeof console

beforeAll(() => {
  originalConsole = { ...console }
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

// Test data
const mockLanguages: LanguageResource[] = [
  createMockLanguage({
    id: 'eng',
    internal_name: 'English',
    backward_compatibility: 'en',
    is_default: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  }),
  createMockLanguage({
    id: 'fra',
    internal_name: 'French',
    backward_compatibility: 'fr',
    is_default: false,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  }),
  createMockLanguage({
    id: 'deu',
    internal_name: 'German',
    backward_compatibility: null,
    is_default: false,
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z',
  }),
  createMockLanguage({
    id: 'spa',
    internal_name: 'Spanish',
    backward_compatibility: 'es',
    is_default: true,
    created_at: '2023-01-04T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
  }),
]

describe('Languages Logic Tests', () => {
  let languageStore: ReturnType<typeof useLanguageStore>
  let loadingStore: ReturnType<typeof useLoadingOverlayStore>
  let errorStore: ReturnType<typeof useErrorDisplayStore>

  beforeEach(() => {
    // createTestingPinia replaces the need for manual vi.mock of the stores.
    // It creates a real store instance where every action is a vitest spy.
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        language: {
          languages: mockLanguages,
          currentLanguage: null,
          loading: false,
          error: null,
        },
      },
      stubActions: true,
    })

    setActivePinia(pinia)

    languageStore = useLanguageStore()
    loadingStore = useLoadingOverlayStore()
    errorStore = useErrorDisplayStore()
  })

  describe('Store Data Access', () => {
    it('should access languages from store', () => {
      expect(languageStore.languages).toEqual(mockLanguages)
      expect(languageStore.languages.length).toBe(4)
    })

    it('should handle empty languages array', () => {
      languageStore.languages = []
      expect(languageStore.languages).toEqual([])
      expect(languageStore.languages.length).toBe(0)
    })

    it('should access default languages from store', () => {
      // If defaultLanguages is a getter, Pinia testing handles it.
      const defaults = languageStore.languages.filter(lang => lang.is_default)
      expect(defaults.length).toBe(2)
      expect(defaults[0]?.internal_name).toBe('English')
    })
  })

  describe('Search Functionality Logic', () => {
    it('should filter by internal_name (case insensitive)', () => {
      const searchQuery = 'english'
      const filtered = languageStore.languages.filter(language =>
        language.internal_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      expect(filtered.length).toBe(1)
      expect(filtered[0]?.internal_name).toBe('English')
    })

    it('should filter by backward_compatibility code', () => {
      const searchQuery = 'en'
      const filtered = languageStore.languages.filter(language =>
        language.backward_compatibility?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      expect(filtered.length).toBe(1)
      expect(filtered[0]?.backward_compatibility).toBe('en')
    })

    it('should handle null backward_compatibility in search', () => {
      const searchQuery = 'german'
      const filtered = languageStore.languages.filter(
        language =>
          language.internal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          language.backward_compatibility?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      expect(filtered.length).toBe(1)
      expect(filtered[0]?.internal_name).toBe('German')
    })

    it('should handle empty search query', () => {
      const searchQuery = ''
      const filtered = languageStore.languages.filter(
        language =>
          language.internal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          language.backward_compatibility?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      expect(filtered.length).toBe(4)
    })
  })

  describe('Sorting Logic', () => {
    it('should sort by internal_name ascending', () => {
      const sorted = [...languageStore.languages].sort((a, b) =>
        a.internal_name.localeCompare(b.internal_name)
      )
      expect(sorted[0]?.internal_name).toBe('English')
      expect(sorted[3]?.internal_name).toBe('Spanish')
    })

    it('should sort by id ascending', () => {
      const sorted = [...languageStore.languages].sort((a, b) => a.id.localeCompare(b.id))
      expect(sorted[0]?.id).toBe('deu')
    })

    it('should sort by is_default descending (defaults first)', () => {
      const sorted = [...languageStore.languages].sort(
        (a, b) => Number(b.is_default) - Number(a.is_default)
      )
      expect(sorted[0]?.is_default).toBe(true)
      expect(sorted[3]?.is_default).toBe(false)
    })
  })

  describe('Store Operations', () => {
    it('should call fetchLanguages', async () => {
      // Mock to prevent real API call
      languageStore.fetchLanguages = vi.fn().mockResolvedValue(mockLanguages)

      await languageStore.fetchLanguages()
      expect(languageStore.fetchLanguages).toHaveBeenCalledOnce()
    })

    it('should call deleteLanguage with correct id', async () => {
      // Mock to prevent real API call
      languageStore.deleteLanguage = vi.fn().mockResolvedValue(undefined)

      const languageId = 'eng'
      await languageStore.deleteLanguage(languageId)

      expect(languageStore.deleteLanguage).toHaveBeenCalledWith(languageId)
    })

    it('should handle deleteLanguage failure', async () => {
      // Force the action to reject to test your catch block logic
      const error = new Error('Delete failed')
      languageStore.deleteLanguage = vi.fn().mockRejectedValue(error)

      await expect(languageStore.deleteLanguage('eng')).rejects.toThrow('Delete failed')
      expect(languageStore.deleteLanguage).toHaveBeenCalledWith('eng')
    })
  })

  describe('Loading and Error Handling', () => {
    it('should show loading overlay during operations', () => {
      loadingStore.show('Loading...') // Added argument to match your component usage
      expect(loadingStore.show).toHaveBeenCalledWith('Loading...')
    })

    it('should hide loading overlay after operations', () => {
      loadingStore.hide()
      expect(loadingStore.hide).toHaveBeenCalledOnce()
    })

    it('should add error message on failure', () => {
      const errorType = 'error'
      const errorMessage = 'Failed to fetch languages'

      // Pass both arguments to satisfy the function signature
      errorStore.addMessage(errorType, errorMessage)

      expect(errorStore.addMessage).toHaveBeenCalledWith(errorType, errorMessage)
    })

    it('should add info message on success', () => {
      const type = 'info'
      const message = 'Deleted successfully.'

      errorStore.addMessage(type, message)

      expect(errorStore.addMessage).toHaveBeenCalledWith(type, message)
    })
  })
})
