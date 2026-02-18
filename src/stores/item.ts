import { defineStore } from 'pinia'
import { computed } from 'vue'
import {
  ItemApi,
  type ItemResource,
  type StoreItemRequest,
  type UpdateItemRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useItemStore = defineStore('item', () => {
  const state = createPaginatedStoreState<ItemResource>()
  const { category: items, currentEntry: currentItem, pageLinks, pageMeta, loading, error } = state

  const getApi = () => new ItemApi(createApiConfig())

  // Actions
  const fetchItems = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchItems',
      () => getApi().itemIndex(page, perPage),
      loading,
      error,
      'Failed to fetch items'
    )
    if (res?.data) {
      items.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return items.value
  }

  const fetchItem = async (id: string, include?: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchItem',
      () => getApi().itemShow(id, include),
      loading,
      error,
      `Failed to fetch item with ID: ${id}`
    )
    if (res?.data?.data) currentItem.value = res.data.data
  }

  const createItem = async (data: StoreItemRequest) => {
    const res = await useApiCall(
      'createItem',
      () => getApi().itemStore(data),
      loading,
      error,
      'Failed to create item'
    )
    if (res?.data?.data) items.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateItem = async (id: string, data: UpdateItemRequest) => {
    const res = await useApiCall(
      'updateItem',
      () => getApi().itemUpdate(id, data),
      loading,
      error,
      'Failed to update item'
    )
    if (res?.data?.data) {
      const idx = items.value.findIndex(item => item.id === id)
      if (idx !== -1) items.value[idx] = res.data.data
      if (currentItem.value?.id === id) currentItem.value = res.data.data
    }
    return res?.data?.data || null
  }

  const deleteItem = async (id: string) => {
    const res = await useApiCall(
      'deleteItem',
      () => getApi().itemDestroy(id),
      loading,
      error,
      'Failed to delete item'
    )
    if (res) {
      items.value = items.value.filter(item => item.id !== id)
      if (currentItem.value?.id === id) state.clearCurrent()
    }
    return !!res
  }

  return {
    ...state,
    pageLinks,
    pageMeta,

    // Computed
    sortedItems: computed(() =>
      [...items.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
    ),
    itemsCount: computed(() => items.value.length),

    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    findItemById: (id: string) => items.value.find(item => item.id === id),
  }
})

export type { ItemResource }
