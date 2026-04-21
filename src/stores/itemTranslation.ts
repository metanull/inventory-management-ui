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

  const item = ref<ItemTranslationResource[]>([])

  const getApi = () => new ItemTranslationApi(createApiConfig())

  // Actions
  const fetchItemTranslations = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchItemTranslations',
      () => getApi().itemTranslationIndex(page, perPage),
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

  const updateItemTranslationEntry = async (
    id: string,
    data: UpdateItemTranslationRequest
  ) => {
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

    // Computed
    itemTranslationsEntriesCount: computed(() => itemTranslations.value.length),

    // Actions
    fetchItemTranslations,
    fetchItemTranslationEntry,
    createItemTranslationEntry,
    updateItemTranslationEntry,
    deleteItemTranslationEntry,
    findItemTranslationEntryById: (id: string) =>
      itemTranslations.value.find(g => g.id === id),
  }
})
