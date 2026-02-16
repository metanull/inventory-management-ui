import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  GlossaryApi,
  type GlossaryResource,
  type StoreGlossaryRequest,
  type UpdateGlossaryRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createBaseStoreState } from '@/utils/storeFunctions'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

export const useGlossaryStore = defineStore('glossary', () => {
  const state = createBaseStoreState<GlossaryResource>()
  const { category: glossary, currentEntry: currentGlossaryEntry, loading, error } = state
  const getApi = () => new GlossaryApi(createApiConfig())

  const fetchGlossary = async () => {
    const res = await useApiCall(
      'fetchGlossary',
      () => getApi().glossaryIndex(),
      loading,
      error,
      'Failed to fetch glossary'
    )
    glossary.value = res?.data?.data || []
  }

  const fetchGlossaryEntry = async (id: string, include?: string) => {
    currentGlossaryEntry.value = null
    const res = await useApiCall(
      'fetchGlossaryEntry',
      () => getApi().glossaryShow(id, include),
      loading,
      error,
      `Failed to fetch entry ${id}`
    )
    if (res?.data?.data) currentGlossaryEntry.value = res.data.data
  }

  const createGlossaryEntry = async (data: StoreGlossaryRequest) => {
    const res = await useApiCall(
      'createGlossaryEntry',
      () => getApi().glossaryStore(data),
      loading,
      error,
      'Failed to create entry'
    )
    if (res?.data?.data) {
      glossary.value.push(res.data.data)
      return res.data.data
    }
    return null
  }

  const updateGlossaryEntry = async (id: string, data: UpdateGlossaryRequest) => {
    const res = await useApiCall(
      'updateGlossaryEntry',
      () => getApi().glossaryUpdate(id, data),
      loading,
      error,
      'Failed to update entry'
    )
    if (res?.data?.data) {
      const updated = res.data.data
      const index = glossary.value.findIndex(g => g.id === id)
      if (index !== -1) glossary.value[index] = updated
      if (currentGlossaryEntry.value?.id === id) currentGlossaryEntry.value = updated
      return updated
    }
    return null
  }

  const deleteGlossaryEntry = async (id: string) => {
    const res = await useApiCall(
      'deleteGlossaryEntry',
      () => getApi().glossaryDestroy(id),
      loading,
      error,
      'Failed to delete entry'
    )
    if (res) {
      glossary.value = glossary.value.filter(g => g.id !== id)
      if (currentGlossaryEntry.value?.id === id) currentGlossaryEntry.value = null
      return true
    }
    return false
  }

  return {
    ...state,
    // Computed
    sortedGlossaryEntries: computed(() =>
      [...glossary.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
    ),
    glossaryEntriesCount: computed(() => glossary.value.length),
    // Actions
    fetchGlossary,
    fetchGlossaryEntry,
    createGlossaryEntry,
    updateGlossaryEntry,
    deleteGlossaryEntry,
    findGlossaryEntryById: (id: string) => glossary.value.find(g => g.id === id),
    clearCurrentGlossaryEntry: () => {
      currentGlossaryEntry.value = null
    },
  }
})
