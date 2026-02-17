import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  PartnerApi,
  type PartnerResource,
  type StorePartnerRequest,
  type UpdatePartnerRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createBaseStoreState } from '@/utils/storeFunctions'
import { type PageLinks, type PageMeta } from '@/composables/usePagination'

export const usePartnerStore = defineStore('partner', () => {
  const state = createBaseStoreState<PartnerResource>()
  const { category: partners, currentEntry: currentPartner, loading, error } = state

  // Additional Partner-specific state
  const allPartners = ref<PartnerResource[]>([])
  const pageLinks = ref<PageLinks | null>(null)
  const pageMeta = ref<PageMeta | null>(null)

  const getApi = () => new PartnerApi(createApiConfig())

  // Computed properties
  const sortedPartners = computed(() => {
    return [...partners.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
  })

  const partnersCount = computed(() => partners.value.length)

  // Actions
  const fetchPartners = async (page: number = 1, perPage: number = 10): Promise<PartnerResource[]> => {
    const res = await useApiCall(
      'fetchPartners',
      () => getApi().partnerIndex(page, perPage),
      loading,
      error,
      'Failed to fetch partners'
    )

    if (res?.data) {
      partners.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }

    return partners.value
  }

  const fetchAllPartners = async (): Promise<PartnerResource[]> => {
    const fullList: PartnerResource[] = []
    let currentPage = 1
    let hasMorePages = true

    const res = await useApiCall(
      'fetchAllPartners',
      async () => {
        while (hasMorePages) {
          const response = await getApi().partnerIndex(currentPage, 100)
          const data = response.data.data || []
          const meta = response.data.meta

          fullList.push(...data)

          if (meta && meta.current_page < meta.last_page) {
            currentPage++
          } else {
            hasMorePages = false
          }
        }
        return fullList
      },
      loading,
      error,
      'Failed to fetch all partners'
    )

    if (res) {
      allPartners.value = [...res].sort((a, b) =>
        (a.internal_name || '').localeCompare(b.internal_name || '')
      )
    }

    return allPartners.value
  }

  const fetchPartner = async (id: string): Promise<void> => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchPartner',
      () => getApi().partnerShow(id),
      loading,
      error,
      `Failed to fetch partner with ID: ${id}`
    )
    if (res?.data?.data) currentPartner.value = res.data.data
  }

  const createPartner = async (data: StorePartnerRequest): Promise<PartnerResource | null> => {
    const res = await useApiCall(
      'createPartner',
      () => getApi().partnerStore(data),
      loading,
      error,
      'Failed to create partner'
    )
    if (res?.data?.data) partners.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updatePartner = async (id: string, data: UpdatePartnerRequest): Promise<PartnerResource | null> => {
    const res = await useApiCall(
      'updatePartner',
      () => getApi().partnerUpdate(id, data),
      loading,
      error,
      'Failed to update partner'
    )
    if (res?.data?.data) {
      const idx = partners.value.findIndex(p => p.id === id)
      if (idx !== -1) partners.value[idx] = res.data.data
      if (currentPartner.value?.id === id) currentPartner.value = res.data.data
    }
    return res?.data?.data || null
  }

  const deletePartner = async (id: string): Promise<boolean> => {
    const res = await useApiCall(
      'deletePartner',
      () => getApi().partnerDestroy(id),
      loading,
      error,
      'Failed to delete partner'
    )
    if (res) {
      partners.value = partners.value.filter(p => p.id !== id)
      if (currentPartner.value?.id === id) state.clearCurrent()
    }
    return !!res
  }

  return {
    ...state,
    allPartners,
    pageLinks,
    pageMeta,
    sortedPartners,
    partnersCount,
    fetchPartners,
    fetchAllPartners,
    fetchPartner,
    createPartner,
    updatePartner,
    deletePartner,
    findPartnerById: (id: string) => partners.value.find(p => p.id === id),
  }
})