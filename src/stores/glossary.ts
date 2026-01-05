import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  GlossaryApi,
  Configuration,
  type GlossaryResource,
  type StoreGlossaryRequest,
  type UpdateGlossaryRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useGlossaryStore = defineStore('glossary', () => {
  const glossary = ref<GlossaryResource[]>([])
  const currentGlossaryEntry = ref<GlossaryResource | null>(null)
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

    return new GlossaryApi(configuration)
  }

  // Computed properties
  const sortedGlossaryEntries = computed(() => {
    return [...glossary.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
  })

  const glossaryEntriesCount = computed(() => glossary.value.length)

  // Actions
  const fetchGlossary = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryIndex()

      if (response.data && response.data.data) {
        glossary.value = response.data.data
      } else {
        glossary.value = []
      }
    } catch (err) {
      error.value = 'Failed to fetch glossary'
      ErrorHandler.handleError(err, 'fetchGlossary')
      glossary.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchGlossaryEntry = async (id: string, include?: string): Promise<void> => {
    loading.value = true
    error.value = null
    currentGlossaryEntry.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryShow(id, include)

      if (response.data && response.data.data) {
        currentGlossaryEntry.value = response.data.data
      } else {
        throw new Error('Glossary entry not found')
      }
    } catch (err) {
      error.value = `Failed to fetch glossary entry with ID: ${id}`
      ErrorHandler.handleError(err, 'fetchGlossaryEntry')
      currentGlossaryEntry.value = null
    } finally {
      loading.value = false
    }
  }

  const createGlossaryEntry = async (
    glossaryData: StoreGlossaryRequest
  ): Promise<GlossaryResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryStore(glossaryData)

      if (response.data && response.data.data) {
        const newGlossaryEntry = response.data.data
        glossary.value.push(newGlossaryEntry)
        return newGlossaryEntry
      } else {
        throw new Error('Failed to create glossary entry')
      }
    } catch (err) {
      error.value = 'Failed to create glossary entry'
      ErrorHandler.handleError(err, 'createGlossaryEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateGlossaryEntry = async (
    id: string,
    glossaryData: UpdateGlossaryRequest
  ): Promise<GlossaryResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossaryUpdate(id, glossaryData)

      if (response.data && response.data.data) {
        const updatedGlossaryEntry = response.data.data

        // Update in glossary list
        const index = glossary.value.findIndex(glossaryEntry => glossaryEntry.id === id)
        if (index !== -1) {
          glossary.value[index] = updatedGlossaryEntry
        }

        // Update current glossary entry if it's the same
        if (currentGlossaryEntry.value && currentGlossaryEntry.value.id === id) {
          currentGlossaryEntry.value = updatedGlossaryEntry
        }

        return updatedGlossaryEntry
      } else {
        throw new Error('Failed to update glossary entry')
      }
    } catch (err) {
      error.value = 'Failed to update glossary entry'
      ErrorHandler.handleError(err, 'updateGlossaryEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteGlossaryEntry = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      await api.glossaryDestroy(id)

      // Remove from glossary list
      glossary.value = glossary.value.filter(glossaryEntry => glossaryEntry.id !== id)

      // Clear current glossary entry if it's the same
      if (currentGlossaryEntry.value && currentGlossaryEntry.value.id === id) {
        currentGlossaryEntry.value = null
      }

      return true
    } catch (err) {
      error.value = 'Failed to delete glossary entry'
      ErrorHandler.handleError(err, 'deleteGlossaryEntry')
      return false
    } finally {
      loading.value = false
    }
  }

  const findGlossaryEntryById = (id: string): GlossaryResource | undefined => {
    return glossary.value.find(glossaryEntry => glossaryEntry.id === id)
  }

  const clearCurrentGlossaryEntry = (): void => {
    currentGlossaryEntry.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    glossary,
    currentGlossaryEntry,
    loading,
    error,

    // Computed
    sortedGlossaryEntries,
    glossaryEntriesCount,

    // Actions
    fetchGlossary,
    fetchGlossaryEntry,
    createGlossaryEntry,
    updateGlossaryEntry,
    deleteGlossaryEntry,
    findGlossaryEntryById,
    clearCurrentGlossaryEntry,
    clearError,
  }
})
