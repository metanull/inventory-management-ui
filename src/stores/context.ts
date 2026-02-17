import { defineStore } from 'pinia'
import { computed } from 'vue'
import { ContextApi, type ContextResource } from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

interface ContextStoreRequest {
  internal_name: string
  backward_compatibility?: string | null
  is_default?: boolean
}

interface ContextUpdateRequest {
  internal_name: string
  backward_compatibility?: string | null
  is_default?: boolean
}

export const useContextStore = defineStore('context', () => {
  const state = createPaginatedStoreState<ContextResource>()

  // Mapping generic state to context-specific names
  const {
    category: contexts,
    currentEntry: currentContext,
    pageLinks,
    pageMeta,
    loading,
    error,
  } = state
  const getApi = () => new ContextApi(createApiConfig())

  // Computed
  const defaultContext = computed(() => contexts.value.find(c => c.is_default))
  const defaultContexts = computed(() => contexts.value.filter(c => c.is_default))
  const sortedContexts = computed(() =>
    [...contexts.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
  )

  // Actions
  const fetchContexts = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchContexts',
      () => getApi().contextIndex(page, perPage),
      loading,
      error,
      'Failed to fetch contexts'
    )
    if (res?.data) {
      contexts.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return contexts.value
  }

  const fetchContext = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchContext',
      () => getApi().contextShow(id),
      loading,
      error,
      `Failed to fetch context with ID: ${id}`
    )
    if (res?.data?.data) currentContext.value = res.data.data
    return res?.data?.data
  }

  const createContext = async (data: ContextStoreRequest) => {
    const res = await useApiCall(
      'createContext',
      () => getApi().contextStore(data),
      loading,
      error,
      'Failed to create context'
    )
    if (res?.data?.data) {
      contexts.value.push(res.data.data)
      return res.data.data
    }
    return null
  }

  const updateContext = async (id: string, data: ContextUpdateRequest) => {
    const res = await useApiCall(
      'updateContext',
      () => getApi().contextUpdate(id, data),
      loading,
      error,
      'Failed to update context'
    )
    if (res?.data?.data) {
      const updated = res.data.data
      const idx = contexts.value.findIndex(c => c.id === id)
      if (idx !== -1) contexts.value[idx] = updated
      if (currentContext.value?.id === id) currentContext.value = updated
      return updated
    }
    return null
  }

  const deleteContext = async (id: string) => {
    const res = await useApiCall(
      'deleteContext',
      () => getApi().contextDestroy(id),
      loading,
      error,
      'Failed to delete context'
    )
    if (res) {
      contexts.value = contexts.value.filter(c => c.id !== id)
      if (currentContext.value?.id === id) state.clearCurrent()
      return true
    }
    return false
  }

  // Context-Specific Actions
  const setDefaultContext = async (id: string, isDefault: boolean) => {
    const res = await useApiCall(
      'setDefaultContext',
      () => getApi().contextSetDefault(id, { is_default: isDefault }),
      loading,
      error,
      'Failed to set default context'
    )
    if (res?.data?.data) {
      const updated = res.data.data
      // Sync local state: only one can be default
      contexts.value = contexts.value.map(c => ({
        ...c,
        is_default: c.id === id ? isDefault : false,
      }))
      if (currentContext.value?.id === id) currentContext.value = updated
      return updated
    }
    return null
  }

  const getDefaultContext = async () => {
    const res = await useApiCall(
      'getDefaultContext',
      () => getApi().contextGetDefault(),
      loading,
      error,
      'Failed to get default context'
    )
    if (res?.data?.data) {
      const defaultCtx = res.data.data
      const idx = contexts.value.findIndex(c => c.id === defaultCtx.id)
      if (idx !== -1) contexts.value[idx] = defaultCtx
      else contexts.value.push(defaultCtx)
      return defaultCtx
    }
    return null
  }

  return {
    ...state,
    contexts,
    currentContext,
    defaultContext,
    defaultContexts,
    sortedContexts,
    fetchContexts,
    fetchContext,
    createContext,
    updateContext,
    deleteContext,
    setDefaultContext,
    getDefaultContext,
    findContextById: (id: string) => contexts.value.find(c => c.id === id),
    clearCurrentContext: state.clearCurrent,
  }
})
