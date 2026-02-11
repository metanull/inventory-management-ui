import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PartnerApi,
  Configuration,
  type PartnerResource,
  type StorePartnerRequest,
  type UpdatePartnerRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'
import { type PageLinks, type PageMeta } from '@/composables/usePagination'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const usePartnerStore = defineStore('partner', () => {
  const partners = ref<PartnerResource[]>([])
  const allPartners = ref<PartnerResource[]>([])
  const currentPartner = ref<PartnerResource | null>(null)
  const pageLinks = ref<PageLinks | null>(null)
  const pageMeta = ref<PageMeta | null>(null)
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

    return new PartnerApi(configuration)
  }

  // Computed properties
  const sortedPartners = computed(() => {
    return [...partners.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
  })

  const partnersCount = computed(() => partners.value.length)

  // Fetch partners by page
  const fetchPartners = async (
    page: number = 1,
    perPage: number = 10
  ): Promise<PartnerResource[]> => {
    loading.value = true
    error.value = null

    try {
      const apiClient = createApiClient()
      const response = await apiClient.partnerIndex(page, perPage)

      if (response.data && response.data.data) {
        partners.value = response.data.data
      } else {
        partners.value = []
      }

      pageLinks.value = response.data?.links ?? null
      pageMeta.value = response.data?.meta ?? null

      return partners.value
    } catch (err: unknown) {
      ErrorHandler.handleError(err, 'Failed to fetch partners')
      error.value = 'Failed to fetch partners'
      partners.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch all partners
  const fetchAllPartners = async (): Promise<PartnerResource[]> => {
    loading.value = true
    error.value = null

    const fullList: PartnerResource[] = []
    let currentPage = 1
    let hasMorePages = true

    try {
      const apiClient = createApiClient()

      while (hasMorePages) {
        const response = await apiClient.partnerIndex(currentPage, 100)
        const data = response.data.data || []
        const meta = response.data.meta

        fullList.push(...data)

        if (meta && meta.current_page < meta.last_page) {
          currentPage++
        } else {
          hasMorePages = false
        }
      }

      allPartners.value = fullList.sort((a, b) =>
        (a.internal_name || '').localeCompare(b.internal_name || '')
      )

      pageMeta.value = {
        current_page: 1,
        last_page: 1,
        // Provide a basic links array to satisfy the type
        links: [
          { url: null, label: 'pagination.previous', active: false },
          { url: null, label: '1', active: true },
          { url: null, label: 'pagination.next', active: false },
        ],
      }

      return allPartners.value
    } catch (err: unknown) {
      ErrorHandler.handleError(err, 'Failed to fetch all partners')
      error.value = 'Failed to fetch all partners'
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchPartner = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    currentPartner.value = null

    try {
      const api = createApiClient()
      const response = await api.partnerShow(id)

      if (response.data && response.data.data) {
        currentPartner.value = response.data.data
      } else {
        throw new Error('Partner not found')
      }
    } catch (err) {
      error.value = `Failed to fetch partner with ID: ${id}`
      ErrorHandler.handleError(err, 'fetchPartner')
      currentPartner.value = null
    } finally {
      loading.value = false
    }
  }

  const createPartner = async (
    partnerData: StorePartnerRequest
  ): Promise<PartnerResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.partnerStore(partnerData)

      if (response.data && response.data.data) {
        const newParter = response.data.data
        partners.value.push(newParter)
        return newParter
      } else {
        throw new Error('Failed to create partner')
      }
    } catch (err) {
      error.value = 'Failed to create partner'
      ErrorHandler.handleError(err, 'createPartner')
      return null
    } finally {
      loading.value = false
    }
  }

  const updatePartner = async (
    id: string,
    partnerData: UpdatePartnerRequest
  ): Promise<PartnerResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.partnerUpdate(id, partnerData)

      if (response.data && response.data.data) {
        const updatedPartner = response.data.data

        // Update in partners list
        const index = partners.value.findIndex(partner => partner.id === id)
        if (index !== -1) {
          partners.value[index] = updatedPartner
        }

        // Update current partner if it's the same
        if (currentPartner.value && currentPartner.value.id === id) {
          currentPartner.value = updatedPartner
        }

        return updatedPartner
      } else {
        throw new Error('Failed to update partner')
      }
    } catch (err) {
      error.value = 'Failed to update partner'
      ErrorHandler.handleError(err, 'updatePartner')
      return null
    } finally {
      loading.value = false
    }
  }

  const deletePartner = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      await api.partnerDestroy(id)

      // Remove from partners list
      partners.value = partners.value.filter(partner => partner.id !== id)

      // Clear current partner if it's the same
      if (currentPartner.value && currentPartner.value.id === id) {
        currentPartner.value = null
      }

      return true
    } catch (err) {
      error.value = 'Failed to delete partner'
      ErrorHandler.handleError(err, 'deletePartner')
      return false
    } finally {
      loading.value = false
    }
  }

  const findPartnerById = (id: string): PartnerResource | undefined => {
    return partners.value.find(partner => partner.id === id)
  }

  const clearCurrentPartner = (): void => {
    currentPartner.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    partners,
    allPartners,
    currentPartner,
    loading,
    error,
    pageLinks,
    pageMeta,

    // Computed
    sortedPartners,
    partnersCount,

    // Actions
    fetchPartners,
    fetchAllPartners,
    fetchPartner,
    createPartner,
    updatePartner,
    deletePartner,
    findPartnerById,
    clearCurrentPartner,
    clearError,
  }
})
