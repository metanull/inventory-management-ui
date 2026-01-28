import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  GlossaryTranslationApi,
  Configuration,
  type GlossaryTranslationResource,
  type StoreGlossaryTranslationRequest,
  type UpdateGlossaryTranslationRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useGlossaryTranslationStore = defineStore('glossaryTranslation', () => {
  const glossary = ref<GlossaryTranslationResource[]>([])
  const currentGlossaryTranslationEntry = ref<GlossaryTranslationResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const glossaryTranslations = ref<GlossaryTranslationResource[]>([])

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

    return new GlossaryTranslationApi(configuration)
  }

  const glossaryTranslationsEntriesCount = computed(() => glossaryTranslations.value.length)

  // Actions
  const fetchGlossaryTranslations = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryTranslationIndex()

      if (response.data && response.data.data) {
        glossaryTranslations.value = response.data.data
      } else {
        glossaryTranslations.value = []
      }
    } catch (err) {
      error.value = 'Failed to fetch glossary translations'
      ErrorHandler.handleError(err, 'fetchGlossaryTranslations')
      glossaryTranslations.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchGlossaryTranslationEntry = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    currentGlossaryTranslationEntry.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryTranslationShow(id)

      if (response.data && response.data.data) {
        currentGlossaryTranslationEntry.value = response.data.data
      } else {
        throw new Error('Glossary translation entry not found')
      }
    } catch (err) {
      error.value = `Failed to fetch glossary translation entry with ID: ${id}`
      ErrorHandler.handleError(err, 'fetchGlossaryTranslationEntry')
      currentGlossaryTranslationEntry.value = null
    } finally {
      loading.value = false
    }
  }

  const createGlossaryTranslationEntry = async (
    glossaryTranslationData: StoreGlossaryTranslationRequest
  ): Promise<GlossaryTranslationResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryTranslationStore(glossaryTranslationData)

      if (response.data && response.data.data) {
        const newGlossaryTranslationEntry = response.data.data
        glossaryTranslations.value.push(newGlossaryTranslationEntry)
        console.log('Created Glossary Translation Entry:', newGlossaryTranslationEntry)
        return newGlossaryTranslationEntry
      } else {
        throw new Error('Failed to create glossary translation entry')
      }
    } catch (err) {
      error.value = 'Failed to create glossary translation entry'
      ErrorHandler.handleError(err, 'createGlossaryTranslationEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateGlossaryTranslationEntry = async (
    id: string,
    glossaryTranslationData: UpdateGlossaryTranslationRequest
  ): Promise<GlossaryTranslationResource | null> => {
    loading.value = true
    error.value = null
    try {
      const api = createApiClient()
      const response = await api.glossaryTranslationUpdate(id, glossaryTranslationData)

      if (response.data && response.data.data) {
        const updatedGlossaryTranslationEntry = response.data.data

        // Update in glossary list
        const index = glossaryTranslations.value.findIndex(
          glossaryTranslationEntry => glossaryTranslationEntry.id === id
        )
        if (index !== -1) {
          glossary.value[index] = updatedGlossaryTranslationEntry
        }

        // Update current glossary entry if it's the same
        if (currentGlossaryTranslationEntry.value && currentGlossaryTranslationEntry.value.id === id) {
          currentGlossaryTranslationEntry.value = updatedGlossaryTranslationEntry
        }

        return updatedGlossaryTranslationEntry
      } else {
        throw new Error('Failed to update glossary translation entry')
      }
    } catch (err) {
      error.value = 'Failed to update glossary translation entry'
      ErrorHandler.handleError(err, 'updateGlossaryTranslationEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteGlossaryTranslationEntry = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      await api.glossaryTranslationDestroy(id)

      // Remove from glossary list
      glossaryTranslations.value = glossaryTranslations.value.filter(
        glossaryTranslationEntry => glossaryTranslationEntry.id !== id
      )

      // Clear current glossary entry if it's the same
      if (currentGlossaryTranslationEntry.value && currentGlossaryTranslationEntry.value.id === id) {
        currentGlossaryTranslationEntry.value = null
      }

      return true
    } catch (err) {
      error.value = 'Failed to delete glossary translation entry'
      ErrorHandler.handleError(err, 'deleteGlossaryTranslationEntry')
      return false
    } finally {
      loading.value = false
    }
  }

  const findGlossaryTranslationEntryById = (id: string): GlossaryTranslationResource | undefined => {
    return glossaryTranslations.value.find(glossaryTranslationEntry => glossaryTranslationEntry.id === id)
  }

  const clearCurrentGlossaryTranslationEntry = (): void => {
    currentGlossaryTranslationEntry.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    glossary,
    currentGlossaryTranslationEntry,
    loading,
    error,

    // Computed
    glossaryTranslationsEntriesCount,

    // Actions
    fetchGlossaryTranslations,
    fetchGlossaryTranslationEntry,
    createGlossaryTranslationEntry,
    updateGlossaryTranslationEntry,
    deleteGlossaryTranslationEntry,
    findGlossaryTranslationEntryById,
    clearCurrentGlossaryTranslationEntry,
    clearError,
  }
})
