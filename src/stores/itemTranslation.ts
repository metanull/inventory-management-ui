import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  ItemTranslationApi,
  type ItemTranslationResource,
  type StoreItemTranslationRequest,
  type UpdateItemTranslationRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useItemTranslationStore = defineStore('itemTranslation', () => {
  const state = createPaginatedStoreState<ItemTranslationResource>()
  const {
    category: itemTranslations,
    currentEntry: currentItemTranslationEntry,
    pageLinks,
    pageMeta,
    loading,
    error,
  } = state

  const allItemTranslations = ref<ItemTranslationResource[]>([])

  const item = ref<ItemTranslationResource[]>([])

  const getApi = () => new ItemTranslationApi(createApiConfig())

  // Actions
  const fetchItemTranslations = async (page: number = 1, perPage: number = 10, itemId: string) => {
    const res = await useApiCall(
      'fetchItemTranslations',
      () => getApi().itemTranslationIndex(page, perPage, itemId),
      loading,
      error,
      'Failed to fetch item translations',
      true
    )
    if (res?.data) {
      itemTranslations.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return itemTranslations.value
  }

  const fetchAllItemTranslations = async (itemId: string) => {
    const fullList: ItemTranslationResource[] = []
    let currentPage = 1
    let hasMorePages = true

    const result = await useApiCall(
      'fetchAllItemTranslations',
      async () => {
        while (hasMorePages) {
          const response = await getApi().itemTranslationIndex(currentPage, 100, itemId)
          const data = response.data.data || []
          const meta = response.data.meta
          fullList.push(...data)
          if (meta && meta.current_page < meta.last_page) currentPage++
          else hasMorePages = false
        }
        return fullList
      },
      loading,
      error,
      'Failed to fetch all translations',
      true
    )
    allItemTranslations.value = result || []
    return allItemTranslations.value
  }

  const fetchItemTranslationEntry = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchItemTranslationEntry',
      () => getApi().itemTranslationShow(id),
      loading,
      error,
      `Failed to fetch item translation entry with ID: ${id}`,
      true
    )
    if (res?.data?.data) currentItemTranslationEntry.value = res.data.data
  }

  const createItemTranslationEntry = async (data: StoreItemTranslationRequest) => {
    const res = await useApiCall(
      'createItemTranslationEntry',
      () => getApi().itemTranslationStore(data),
      loading,
      error,
      'Failed to create item translation entry'
    )
    if (res?.data?.data) itemTranslations.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateItemTranslationEntry = async (id: string, data: UpdateItemTranslationRequest) => {
    const res = await useApiCall(
      'updateItemTranslationEntry',
      () => getApi().itemTranslationUpdate(id, data),
      loading,
      error,
      'Failed to update item translation entry',
      true
    )
    if (res?.data?.data) {
      const idx = itemTranslations.value.findIndex(g => g.id === id)
      if (idx !== -1) itemTranslations.value[idx] = res.data.data
      if (currentItemTranslationEntry.value?.id === id) {
        currentItemTranslationEntry.value = res.data.data
      }
    }
    return res?.data?.data || null
  }

  const deleteItemTranslationEntry = async (id: string) => {
    const res = await useApiCall(
      'deleteItemTranslationEntry',
      () => getApi().itemTranslationDestroy(id),
      loading,
      error,
      'Failed to delete item translation entry',
      true
    )
    if (res) {
      itemTranslations.value = itemTranslations.value.filter(g => g.id !== id)
      if (currentItemTranslationEntry.value?.id === id) state.clearCurrent()
    }
    return !!res
  }

  return {
    ...state,
    item,
    allItemTranslations,

    // Computed
    itemTranslationsEntriesCount: computed(() => itemTranslations.value.length),

    // Actions
    fetchItemTranslations,
    fetchAllItemTranslations,
    fetchItemTranslationEntry,
    createItemTranslationEntry,
    updateItemTranslationEntry,
    deleteItemTranslationEntry,
    findItemTranslationEntryById: (id: string) => itemTranslations.value.find(g => g.id === id),
  }
})
