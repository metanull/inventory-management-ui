import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  GlossaryTranslationApi,
  type GlossaryTranslationResource,
  type StoreGlossaryTranslationRequest,
  type UpdateGlossaryTranslationRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useGlossaryTranslationStore = defineStore('glossaryTranslation', () => {
  const state = createPaginatedStoreState<GlossaryTranslationResource>()
  const {
    category: glossaryTranslations,
    currentEntry: currentGlossaryTranslationEntry,
    pageLinks,
    pageMeta,
    loading,
    error,
  } = state

  const glossary = ref<GlossaryTranslationResource[]>([])

  const getApi = () => new GlossaryTranslationApi(createApiConfig())

  // Actions
  const fetchGlossaryTranslations = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchGlossaryTranslations',
      () => getApi().glossaryTranslationIndex(page, perPage),
      loading,
      error,
      'Failed to fetch glossary translations'
    )
    if (res?.data) {
      glossaryTranslations.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return glossaryTranslations.value
  }

  const fetchGlossaryTranslationEntry = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchGlossaryTranslationEntry',
      () => getApi().glossaryTranslationShow(id),
      loading,
      error,
      `Failed to fetch glossary translation entry with ID: ${id}`
    )
    if (res?.data?.data) currentGlossaryTranslationEntry.value = res.data.data
  }

  const createGlossaryTranslationEntry = async (data: StoreGlossaryTranslationRequest) => {
    const res = await useApiCall(
      'createGlossaryTranslationEntry',
      () => getApi().glossaryTranslationStore(data),
      loading,
      error,
      'Failed to create glossary translation entry'
    )
    if (res?.data?.data) glossaryTranslations.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateGlossaryTranslationEntry = async (
    id: string,
    data: UpdateGlossaryTranslationRequest
  ) => {
    const res = await useApiCall(
      'updateGlossaryTranslationEntry',
      () => getApi().glossaryTranslationUpdate(id, data),
      loading,
      error,
      'Failed to update glossary translation entry'
    )
    if (res?.data?.data) {
      const idx = glossaryTranslations.value.findIndex(g => g.id === id)
      if (idx !== -1) glossaryTranslations.value[idx] = res.data.data
      if (currentGlossaryTranslationEntry.value?.id === id) {
        currentGlossaryTranslationEntry.value = res.data.data
      }
    }
    return res?.data?.data || null
  }

  const deleteGlossaryTranslationEntry = async (id: string) => {
    const res = await useApiCall(
      'deleteGlossaryTranslationEntry',
      () => getApi().glossaryTranslationDestroy(id),
      loading,
      error,
      'Failed to delete glossary translation entry'
    )
    if (res) {
      glossaryTranslations.value = glossaryTranslations.value.filter(g => g.id !== id)
      if (currentGlossaryTranslationEntry.value?.id === id) state.clearCurrent()
    }
    return !!res
  }

  return {
    ...state,
    glossary,

    // Computed
    glossaryTranslationsEntriesCount: computed(() => glossaryTranslations.value.length),

    // Actions
    fetchGlossaryTranslations,
    fetchGlossaryTranslationEntry,
    createGlossaryTranslationEntry,
    updateGlossaryTranslationEntry,
    deleteGlossaryTranslationEntry,
    findGlossaryTranslationEntryById: (id: string) =>
      glossaryTranslations.value.find(g => g.id === id),
  }
})
