import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  GlossarySpellingApi,
  type GlossarySpellingResource,
  type StoreGlossarySpellingRequest,
  type UpdateGlossarySpellingRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useGlossarySpellingStore = defineStore('glossarySpelling', () => {
  const state = createPaginatedStoreState<GlossarySpellingResource>()
  const {
    category: glossarySpellings,
    currentEntry: currentGlossarySpellingEntry,
    pageLinks,
    pageMeta,
    loading,
    error,
  } = state

  const glossary = ref<GlossarySpellingResource[]>([])

  const getApi = () => new GlossarySpellingApi(createApiConfig())

  // Actions
  const fetchGlossarySpellings = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchGlossarySpellings',
      () => getApi().glossarySpellingIndex(page, perPage),
      loading,
      error,
      'Failed to fetch glossary spellings'
    )
    if (res?.data) {
      glossarySpellings.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return glossarySpellings.value
  }

  const fetchGlossarySpellingEntry = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchGlossarySpellingEntry',
      () => getApi().glossarySpellingShow(id),
      loading,
      error,
      `Failed to fetch glossary spelling entry with ID: ${id}`
    )
    if (res?.data?.data) currentGlossarySpellingEntry.value = res.data.data
  }

  const createGlossarySpellingEntry = async (data: StoreGlossarySpellingRequest) => {
    const res = await useApiCall(
      'createGlossarySpellingEntry',
      () => getApi().glossarySpellingStore(data),
      loading,
      error,
      'Failed to create glossary spelling entry'
    )
    if (res?.data?.data) glossarySpellings.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateGlossarySpellingEntry = async (id: string, data: UpdateGlossarySpellingRequest) => {
    const res = await useApiCall(
      'updateGlossarySpellingEntry',
      () => getApi().glossarySpellingUpdate(id, data),
      loading,
      error,
      'Failed to update glossary spelling entry'
    )
    if (res?.data?.data) {
      const idx = glossarySpellings.value.findIndex(g => g.id === id)
      if (idx !== -1) glossarySpellings.value[idx] = res.data.data
      if (currentGlossarySpellingEntry.value?.id === id) {
        currentGlossarySpellingEntry.value = res.data.data
      }
    }
    return res?.data?.data || null
  }

  const deleteGlossarySpellingEntry = async (id: string) => {
    const res = await useApiCall(
      'deleteGlossarySpellingEntry',
      () => getApi().glossarySpellingDestroy(id),
      loading,
      error,
      'Failed to delete glossary spelling entry'
    )
    if (res) {
      glossarySpellings.value = glossarySpellings.value.filter(g => g.id !== id)
      if (currentGlossarySpellingEntry.value?.id === id) state.clearCurrent()
    }
    return !!res
  }

  return {
    ...state,
    glossary,

    // Computed
    sortedGlossarySpellingEntries: computed(() =>
      [...glossarySpellings.value].sort((a, b) => a.spelling.localeCompare(b.spelling))
    ),
    glossarySpellingsEntriesCount: computed(() => glossarySpellings.value.length),

    // Actions
    fetchGlossarySpellings,
    fetchGlossarySpellingEntry,
    createGlossarySpellingEntry,
    updateGlossarySpellingEntry,
    deleteGlossarySpellingEntry,
    findGlossarySpellingEntryById: (id: string) => glossarySpellings.value.find(g => g.id === id),
  }
})
