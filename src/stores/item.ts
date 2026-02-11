import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  ItemApi,
  Configuration,
  type ItemResource,
  type StoreItemRequest,
  type UpdateItemRequest,
} from '@metanull/inventory-app-api-client'
import { useAuthStore } from './auth'
import { ErrorHandler } from '@/utils/errorHandler'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useItemStore = defineStore('item', () => {
  const items = ref<ItemResource[]>([])
  const currentItem = ref<ItemResource | null>(null)
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

    return new ItemApi(configuration)
  }

  // Computed properties
  const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
  })

  const itemsCount = computed(() => items.value.length)

  // Actions
  const fetchItems = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.itemIndex()

      if (response.data && response.data.data) {
        items.value = response.data.data
      } else {
        items.value = []
      }
    } catch (err) {
      error.value = 'Failed to fetch items'
      ErrorHandler.handleError(err, 'fetchItems')
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchItem = async (id: string, include?: string): Promise<void> => {
    loading.value = true
    error.value = null
    currentItem.value = null

    try {
      const api = createApiClient()
      const response = await api.itemShow(id, include)

      if (response.data && response.data.data) {
        currentItem.value = response.data.data
      } else {
        throw new Error('Item not found')
      }
    } catch (err) {
      error.value = `Failed to fetch item with ID: ${id}`
      ErrorHandler.handleError(err, 'fetchItem')
      currentItem.value = null
    } finally {
      loading.value = false
    }
  }

  const createItem = async (itemData: StoreItemRequest): Promise<ItemResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.itemStore(itemData)

      if (response.data && response.data.data) {
        const newItem = response.data.data
        items.value.push(newItem)
        return newItem
      } else {
        throw new Error('Failed to create item')
      }
    } catch (err) {
      error.value = 'Failed to create item'
      ErrorHandler.handleError(err, 'createItem')
      return null
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (
    id: string,
    itemData: UpdateItemRequest
  ): Promise<ItemResource | null> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      const response = await api.itemUpdate(id, itemData)

      if (response.data && response.data.data) {
        const updatedItem = response.data.data

        // Update in items list
        const index = items.value.findIndex(item => item.id === id)
        if (index !== -1) {
          items.value[index] = updatedItem
        }

        // Update current item if it's the same
        if (currentItem.value && currentItem.value.id === id) {
          currentItem.value = updatedItem
        }

        return updatedItem
      } else {
        throw new Error('Failed to update item')
      }
    } catch (err) {
      error.value = 'Failed to update item'
      ErrorHandler.handleError(err, 'updateItem')
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const api = createApiClient()
      await api.itemDestroy(id)

      // Remove from items list
      items.value = items.value.filter(item => item.id !== id)

      // Clear current item if it's the same
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = null
      }

      return true
    } catch (err) {
      error.value = 'Failed to delete item'
      ErrorHandler.handleError(err, 'deleteItem')
      return false
    } finally {
      loading.value = false
    }
  }

  const findItemById = (id: string): ItemResource | undefined => {
    return items.value.find(item => item.id === id)
  }

  const clearCurrentItem = (): void => {
    currentItem.value = null
  }

  const clearError = (): void => {
    error.value = null
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,

    // Computed
    sortedItems,
    itemsCount,

    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    findItemById,
    clearCurrentItem,
    clearError,
  }
})
