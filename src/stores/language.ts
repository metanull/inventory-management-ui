import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  LanguageApi,
  Configuration,
  type LanguageResource,
  type LanguageStoreRequest,
  type LanguageUpdateRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useLanguageStore = defineStore('language', () => {
  const languages = ref<LanguageResource[]>([])
  const currentLanguage = ref<LanguageResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const authStore = useAuthStore()

  // Create API client instance with configuration
  const createApiClient = () => {
    // Support both Vite (import.meta.env) and Node (process.env) for baseURL
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

    // Create configuration for the API client
    const configuration = new Configuration(configParams)

    return new LanguageApi(configuration)
  }

  const defaultLanguage = computed(() => languages.value.find(lang => lang.is_default))

  // Fetch all languages
  const fetchLanguages = async () => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageIndex()
      languages.value = response.data.data || []
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch languages'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch a single language by ID
  const fetchLanguage = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageShow(id)
      currentLanguage.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to fetch language'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create a new language
  const createLanguage = async (languageData: LanguageStoreRequest) => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageStore(languageData)
      const newLanguage = response.data.data

      // Add to local languages array
      languages.value.push(newLanguage)

      return newLanguage
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create language'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update an existing language
  const updateLanguage = async (id: string, languageData: LanguageUpdateRequest) => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.languageUpdate(id, languageData)
      const updatedLanguage = response.data.data

      // Update in local languages array
      const index = languages.value.findIndex(lang => lang.id === id)
      if (index !== -1) {
        languages.value[index] = updatedLanguage
      }

      // Update current language if it matches
      if (currentLanguage.value?.id === id) {
        currentLanguage.value = updatedLanguage
      }

      return updatedLanguage
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update language'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a language
  const deleteLanguage = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      await apiClient.languageDestroy(id)

      // Remove from local languages array
      languages.value = languages.value.filter(lang => lang.id !== id)

      // Clear current language if it matches
      if (currentLanguage.value?.id === id) {
        currentLanguage.value = null
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete language'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentLanguage = () => {
    currentLanguage.value = null
  }

  return {
    languages,
    currentLanguage,
    loading,
    error,
    defaultLanguage,
    fetchLanguages,
    fetchLanguage,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    clearError,
    clearCurrentLanguage,
  }
})
