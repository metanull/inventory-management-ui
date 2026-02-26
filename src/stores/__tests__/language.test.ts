import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLanguageStore } from '../language'
import type { LanguageResource } from '@metanull/inventory-app-api-client'

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

    expect(store.category).toEqual([])
    expect(store.currentEntry).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should compute default language correctly', () => {
    const store = useLanguageStore()

    // Initially no default language
    expect(store.defaultLanguage).toBeUndefined()

    // Add languages with one being default
    store.category = mockLanguages
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

    store.currentEntry = mockLanguages[0]
    store.clearCurrent()

    expect(store.currentEntry).toBeNull()
  })

  it('should handle fetchLanguages success', async () => {
    const store = useLanguageStore()

    mockLanguageApi.languageIndex.mockResolvedValue({
      data: { data: mockLanguages },
    })

    await store.fetchLanguages()

    expect(mockLanguageApi.languageIndex).toHaveBeenCalled()
    expect(store.category).toEqual(mockLanguages)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should handle fetchLanguages error', async () => {
    const store = useLanguageStore()
    const error = new Error('Network error')

    mockLanguageApi.languageIndex.mockRejectedValue(error)

    try {
      await store.fetchLanguages()
    } catch (e) {
      expect(e).toBe(error)
    }

    expect(store.error).toBe('Failed to fetch languages')
    expect(store.category).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('should handle fetchLanguage success', async () => {
    const store = useLanguageStore()
    const language = mockLanguages[0]

    mockLanguageApi.languageShow.mockResolvedValue({
      data: { data: language },
    })

    const result = await store.fetchLanguage('eng')

    expect(mockLanguageApi.languageShow).toHaveBeenCalledWith('eng')
    expect(store.currentEntry).toEqual(language)
    expect(result).toEqual(language)
  })

  it('should handle createLanguage success', async () => {
    const store = useLanguageStore()
    const newLanguage = {
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
    expect(store.category).toHaveLength(1)
    expect(store.category[0]).toEqual(newLanguage)
    expect(result).toEqual(newLanguage)
  })

  it('should handle updateLanguage success', async () => {
    const store = useLanguageStore()
    store.category = [...mockLanguages]

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
    expect(store.category[0]).toEqual(updatedLanguage)
    expect(result).toEqual(updatedLanguage)
  })

  it('should handle deleteLanguage success', async () => {
    const store = useLanguageStore()
    store.category = [...mockLanguages]

    mockLanguageApi.languageDestroy.mockResolvedValue({})

    await store.deleteLanguage('fra')

    expect(mockLanguageApi.languageDestroy).toHaveBeenCalledWith('fra')
    expect(store.category).toHaveLength(1)
    expect(store.category[0]?.id).toBe('eng')
  })

  it('should handle setDefaultLanguage success', async () => {
    const store = useLanguageStore()
    store.category = [...mockLanguages]
    store.currentEntry = mockLanguages[1] // 'fra' language

    const updatedLanguage = { ...mockLanguages[1], is_default: true }

    mockLanguageApi.languageSetDefault.mockResolvedValue({
      data: { data: updatedLanguage },
    })

    const result = await store.setDefaultLanguage('fra', true)

    expect(mockLanguageApi.languageSetDefault).toHaveBeenCalledWith('fra', { is_default: true })

    // Check that the target language is now default
    expect(store.category.find(lang => lang.id === 'fra')?.is_default).toBe(true)

    // Check that other languages are no longer default
    expect(store.category.find(lang => lang.id === 'eng')?.is_default).toBe(false)

    // Check that current language is updated if it matches
    expect(store.currentEntry?.is_default).toBe(true)

    expect(result).toEqual(updatedLanguage)
  })

  it('should handle setDefaultLanguage error', async () => {
    const store = useLanguageStore()
    const langCode = 'fra'
    const errorMessage = 'Failed to set default'

    mockLanguageApi.languageSetDefault.mockRejectedValue(new Error(errorMessage))

    await expect(store.setDefaultLanguage(langCode, true)).rejects.toThrow(errorMessage)
    expect(store.error).toBe(`Failed to set default language ${langCode}`)
  })

  it('should handle getDefaultLanguage success', async () => {
    const store = useLanguageStore()
    const defaultLanguage = mockLanguages[0] // English is the default

    mockLanguageApi.languageGetDefault.mockResolvedValue({
      data: { data: defaultLanguage },
    })

    // Initially empty languages array
    store.category = []

    const result = await store.getDefaultLanguage()

    expect(mockLanguageApi.languageGetDefault).toHaveBeenCalled()
    expect(result).toEqual(defaultLanguage)
    expect(store.category).toHaveLength(1)
    expect(store.category[0]).toEqual(defaultLanguage)
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
