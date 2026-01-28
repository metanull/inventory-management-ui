/**
 * Language Store - Reference Data Pattern
 *
 * Languages are reference data (small dataset used for dropdowns, lookups).
 * We load all languages once and cache them client-side.
 *
 * Key methods:
 * - ensureLoaded() - loads data if not cached, returns cached data if available
 * - refresh() - force re-fetch from API
 * - mutations (create/update/delete) update the cache in-place
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  LanguageApi,
  Configuration,
  type LanguageResource,
  type StoreLanguageRequest,
  type UpdateLanguageRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useLanguageStore = defineStore('language', () => {
  // All languages (cached)
  const languages = ref<LanguageResource[]>([])

  // Whether the full dataset has been loaded
  const isLoaded = ref(false)

  // Loading state (prevents concurrent fetches)
  const loading = ref(false)

  // Currently viewed language (for detail view)
  const currentLanguage = ref<LanguageResource | null>(null)

  // Last error message
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  const createApiClient = () => {
    let baseURL: string
    if (
      typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE_URL
    ) {
      baseURL = import.meta.env.VITE_API_BASE_URL
    } else if (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) {
      baseURL = process.env.VITE_API_BASE_URL
    } else {
      baseURL = 'http://127.0.0.1:8000/api'
    }

    const configParams: { basePath: string; accessToken?: string } = {
      basePath: baseURL,
    }

    if (authStore.token) {
      configParams.accessToken = authStore.token
    }

    const configuration = new Configuration(configParams)
    return new LanguageApi(configuration)
  }

  // Computed
  const defaultLanguage = computed(() => languages.value.find(lang => lang.is_default))
  const defaultLanguages = computed(() => languages.value.filter(lang => lang.is_default))

  // Main entry point: loads data if needed, returns cached data if available
  const ensureLoaded = async (): Promise<LanguageResource[]> => {
    // Already loaded
    if (isLoaded.value) {
      return languages.value
    }

    // Another component is already fetching - wait for it
    if (loading.value) {
      return new Promise(resolve => {
        const checkLoaded = setInterval(() => {
          if (!loading.value) {
            clearInterval(checkLoaded)
            resolve(languages.value)
          }
        }, 50)
      })
    }

    // Not loaded - fetch all
    await loadAll()
    return languages.value
  }

  // Fetches all pages in parallel
  const loadAll = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()

      // Fetch first page to get total page count
      const firstPageResponse = await apiClient.languageIndex(1, 100)
      const firstPageData = firstPageResponse.data.data || []
      const totalPages = firstPageResponse.data.meta?.last_page ?? 1

      if (totalPages === 1) {
        languages.value = sortLanguages(firstPageData)
      } else {
        // Fetch remaining pages in parallel
        const remainingPageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)

        const remainingResponses = await Promise.all(
          remainingPageNumbers.map(page => apiClient.languageIndex(page, 100))
        )

        // Combine all results
        const allLanguages = [
          ...firstPageData,
          ...remainingResponses.flatMap(response => response.data.data || []),
        ]

        languages.value = sortLanguages(allLanguages)
      }

      isLoaded.value = true
    } catch (err: unknown) {
      ErrorHandler.handleError(err, 'Failed to load languages')
      error.value = 'Failed to load languages'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Force re-fetch from API
  const refresh = async (): Promise<LanguageResource[]> => {
    isLoaded.value = false
    await loadAll()
    return languages.value
  }

  // Fetch a single language (also updates cache)
  const fetchLanguage = async (id: string): Promise<LanguageResource> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageShow(id)
      const fetchedLanguage = response.data.data

      currentLanguage.value = fetchedLanguage

      // Update in cache if exists (keeps cache in sync)
      updateInCache(fetchedLanguage)

      return fetchedLanguage
    } catch (err: unknown) {
      ErrorHandler.handleError(err, `Failed to fetch language ${id}`)
      error.value = 'Failed to fetch language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create language (adds to cache)
  const createLanguage = async (languageData: StoreLanguageRequest): Promise<LanguageResource> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageStore(languageData)
      const newLanguage = response.data.data

      // Add to cache
      languages.value = sortLanguages([...languages.value, newLanguage])

      return newLanguage
    } catch (err: unknown) {
      ErrorHandler.handleError(err, 'Failed to create language')
      error.value = 'Failed to create language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update language (updates cache)
  const updateLanguage = async (
    id: string,
    languageData: UpdateLanguageRequest
  ): Promise<LanguageResource> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageUpdate(id, languageData)
      const updatedLanguage = response.data.data

      // Update cache
      updateInCache(updatedLanguage)

      // Update current language if viewing it
      if (currentLanguage.value?.id === id) {
        currentLanguage.value = updatedLanguage
      }

      return updatedLanguage
    } catch (err: unknown) {
      ErrorHandler.handleError(err, `Failed to update language ${id}`)
      error.value = 'Failed to update language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete language (removes from cache)
  const deleteLanguage = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      await apiClient.languageDestroy(id)

      // Remove from cache
      languages.value = languages.value.filter(lang => lang.id !== id)

      // Clear current if deleted
      if (currentLanguage.value?.id === id) {
        currentLanguage.value = null
      }
    } catch (err: unknown) {
      ErrorHandler.handleError(err, `Failed to delete language ${id}`)
      error.value = 'Failed to delete language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set default language (updates all languages in cache)
  const setDefaultLanguage = async (id: string, isDefault: boolean): Promise<LanguageResource> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageSetDefault(id, { is_default: isDefault })
      const updatedLanguage = response.data.data

      // Update cache (setting one as default unsets others)
      languages.value = languages.value.map(lang => ({
        ...lang,
        is_default: lang.id === id ? isDefault : false,
      }))

      // Update current language if viewing it
      if (currentLanguage.value?.id === id) {
        currentLanguage.value = updatedLanguage
      }

      return updatedLanguage
    } catch (err: unknown) {
      ErrorHandler.handleError(err, `Failed to set default language ${id}`)
      error.value = 'Failed to set default language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch default language from API
  const getDefaultLanguage = async (): Promise<LanguageResource> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageGetDefault()
      const defaultLang = response.data.data

      // Update cache if needed
      updateInCache(defaultLang)

      return defaultLang
    } catch (err: unknown) {
      ErrorHandler.handleError(err, 'Failed to get default language')
      error.value = 'Failed to get default language'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper: update or add to cache
  const updateInCache = (language: LanguageResource): void => {
    const index = languages.value.findIndex(l => l.id === language.id)
    if (index !== -1) {
      languages.value[index] = language
    } else if (isLoaded.value) {
      // Only add if cache is loaded (avoid partial data)
      languages.value = sortLanguages([...languages.value, language])
    }
  }

  // Helper: sort alphabetically
  const sortLanguages = (list: LanguageResource[]): LanguageResource[] => {
    return [...list].sort((a, b) => (a.internal_name || '').localeCompare(b.internal_name || ''))
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentLanguage = () => {
    currentLanguage.value = null
  }

  return {
    // State
    languages,
    currentLanguage,
    loading,
    error,
    isLoaded,

    // Computed
    defaultLanguage,
    defaultLanguages,

    // Core methods (Reference Data Pattern)
    ensureLoaded,
    refresh,

    // Single item operations
    fetchLanguage,

    // Mutation operations (update cache in-place)
    createLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    getDefaultLanguage,

    // Utilities
    clearError,
    clearCurrentLanguage,
  }
})
