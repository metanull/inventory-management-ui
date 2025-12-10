import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  GlossarySpellingApi,
  Configuration,
  type GlossarySpellingResource,
  type StoreGlossarySpellingRequest,
  type UpdateGlossarySpellingRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useGlossarySpellingStore = defineStore('glossarySpelling', () => {
  const glossary = ref<GlossarySpellingResource[]>([])
  const currentGlossarySpellingEntry = ref<GlossarySpellingResource | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const glossarySpellings = ref<GlossarySpellingResource[]>([])

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

    return new GlossarySpellingApi(configuration)
  }

  // Computed properties
  const sortedGlossarySpellingEntries = computed(() => {
    return [...glossarySpellings.value].sort((a, b) => a.spelling.localeCompare(b.spelling))
  })

  const glossarySpellingsEntriesCount = computed(() => glossarySpellings.value.length)

  // Actions
  const fetchGlossarySpellings = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossarySpellingIndex()

      if (response.data && response.data.data) {
        glossarySpellings.value = response.data.data
      } else {
        glossarySpellings.value = []
      }
    } catch (err) {
      error.value = 'Failed to fetch glossary spellings'
      ErrorHandler.handleError(err, 'fetchGlossarySpellings')
      glossarySpellings.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchGlossarySpellingEntry = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    currentGlossarySpellingEntry.value = null

    try {
      const api = createApiClient()
      const response = await api.glossarySpellingShow(id)

      if (response.data && response.data.data) {
        currentGlossarySpellingEntry.value = response.data.data
      } else {
        throw new Error('Glossary spelling entry not found')
      }
    } catch (err) {
      error.value = `Failed to fetch glossary spelling entry with ID: ${id}`
      ErrorHandler.handleError(err, 'fetchGlossarySpellingEntry')
      currentGlossarySpellingEntry.value = null
    } finally {
      loading.value = false
    }
  }

  const createGlossarySpellingEntry = async (
    glossarySpellingData: StoreGlossarySpellingRequest
  ): Promise<GlossarySpellingResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossarySpellingStore(glossarySpellingData)

      if (response.data && response.data.data) {
        const newGlossarySpellingEntry = response.data.data
        glossarySpellings.value.push(newGlossarySpellingEntry)
        return newGlossarySpellingEntry
      } else {
        throw new Error('Failed to create glossary spelling entry')
      }
    } catch (err) {
      error.value = 'Failed to create glossary spelling entry'
      ErrorHandler.handleError(err, 'createGlossarySpellingEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateGlossarySpellingEntry = async (
    id: string,
    glossarySpellingData: UpdateGlossarySpellingRequest
  ): Promise<GlossarySpellingResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.glossarySpellingUpdate(id, glossarySpellingData)

      if (response.data && response.data.data) {
        const updatedGlossarySpellingEntry = response.data.data

        // Update in glossary list
        const index = glossarySpellings.value.findIndex(glossarySpellingEntry => glossarySpellingEntry.id === id)
        if (index !== -1) {
          glossary.value[index] = updatedGlossarySpellingEntry
        }

        // Update current glossary entry if it's the same
        if (currentGlossarySpellingEntry.value && currentGlossarySpellingEntry.value.id === id) {
          currentGlossarySpellingEntry.value = updatedGlossarySpellingEntry
        }

        return updatedGlossarySpellingEntry
      } else {
        throw new Error('Failed to update glossary spelling entry')
      }
    } catch (err) {
      error.value = 'Failed to update glossary spelling entry'
      ErrorHandler.handleError(err, 'updateGlossarySpellingEntry')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteGlossarySpellingEntry = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      await api.glossarySpellingDestroy(id)

      // Remove from glossary list
      glossarySpellings.value = glossarySpellings.value.filter(glossarySpellingEntry => glossarySpellingEntry.id !== id)

      // Clear current glossary entry if it's the same
      if (currentGlossarySpellingEntry.value && currentGlossarySpellingEntry.value.id === id) {
        currentGlossarySpellingEntry.value = null
      }

      return true
    } catch (err) {
      error.value = 'Failed to delete glossary spelling entry'
      ErrorHandler.handleError(err, 'deleteGlossarySpellingEntry')
      return false
    } finally {
      loading.value = false
    }
  }

  const findGlossarySpellingEntryById = (id: string): GlossarySpellingResource | undefined => {
    return glossarySpellings.value.find(glossarySpellingEntry => glossarySpellingEntry.id === id)
  }

  const clearCurrentGlossarySpellingEntry = (): void => {
    currentGlossarySpellingEntry.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    glossary,
    currentGlossarySpellingEntry,
    loading,
    error,

    // Computed
    sortedGlossarySpellingEntries,
    glossarySpellingsEntriesCount,

    // Actions
    fetchGlossarySpellings,
    fetchGlossarySpellingEntry,
    createGlossarySpellingEntry,
    updateGlossarySpellingEntry,
    deleteGlossarySpellingEntry,
    findGlossarySpellingEntryById,
    clearCurrentGlossarySpellingEntry,
    clearError,
  }
})
