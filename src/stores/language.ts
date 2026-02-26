import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  LanguageApi,
  type LanguageResource,
  type StoreLanguageRequest,
  type UpdateLanguageRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useLanguageStore = defineStore('language', () => {
  const state = createPaginatedStoreState<LanguageResource>()

  const languages = state.category
  const currentLanguage = state.currentEntry

  // Additional Language-specific state
  const allLanguages = ref<LanguageResource[]>([])

  const getApi = () => new LanguageApi(createApiConfig())

  // Computed
  const defaultLanguage = computed(() => languages.value.find(lang => lang.is_default))
  const defaultLanguages = computed(() => languages.value.filter(lang => lang.is_default))

  // Actions
  const fetchLanguages = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchLanguages',
      () => getApi().languageIndex(page, perPage),
      state.loading,
      state.error,
      'Failed to fetch languages',
      true
    )
    if (res?.data) {
      languages.value = res.data.data || []
      state.pageLinks.value = res.data.links || null
      state.pageMeta.value = res.data.meta || null
    }
    return languages.value
  }

  const fetchLanguage = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchLanguage',
      () => getApi().languageShow(id),
      state.loading,
      state.error,
      `Failed to fetch language ${id}`,
      true
    )
    if (res?.data?.data) currentLanguage.value = res.data.data
    return res?.data?.data
  }

  const fetchAllLanguages = async () => {
    const fullList: LanguageResource[] = []
    let currentPage = 1
    let hasMorePages = true

    const res = await useApiCall(
      'fetchAllLanguages',
      async () => {
        while (hasMorePages) {
          const response = await getApi().languageIndex(currentPage, 100)
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
      state.loading,
      state.error,
      'Failed to fetch all languages',
      true
    )

    if (res) {
      allLanguages.value = [...res].sort((a, b) =>
        (a.internal_name || '').localeCompare(b.internal_name || '')
      )
    }
    return allLanguages.value
  }

  const createLanguage = async (data: StoreLanguageRequest) => {
    const res = await useApiCall(
      'createLanguage',
      () => getApi().languageStore(data),
      state.loading,
      state.error,
      'Failed to create language',
      true
    )
    if (res?.data?.data) languages.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateLanguage = async (id: string, data: UpdateLanguageRequest) => {
    const res = await useApiCall(
      'updateLanguage',
      () => getApi().languageUpdate(id, data),
      state.loading,
      state.error,
      `Failed to update language ${id}`
    )
    if (res?.data?.data) {
      const idx = languages.value.findIndex(l => l.id === id)
      if (idx !== -1) languages.value[idx] = res.data.data
      if (currentLanguage.value?.id === id) currentLanguage.value = res.data.data
    }
    return res?.data?.data || null
  }

  const deleteLanguage = async (id: string) => {
    const res = await useApiCall(
      'deleteLanguage',
      () => getApi().languageDestroy(id),
      state.loading,
      state.error,
      `Failed to delete language ${id}`,
      true
    )
    if (res) {
      languages.value = languages.value.filter(l => l.id !== id)
      if (currentLanguage.value?.id === id) state.clearCurrent()
      return true
    }
    return false
  }

  const setDefaultLanguage = async (id: string, isDefault: boolean) => {
    const res = await useApiCall(
      'setDefaultLanguage',
      () => getApi().languageSetDefault(id, { is_default: isDefault }),
      state.loading,
      state.error,
      `Failed to set default language ${id}`,
      true
    )
    if (res?.data?.data) {
      languages.value = languages.value.map(lang => ({
        ...lang,
        is_default: lang.id === id ? isDefault : false,
      }))
      if (currentLanguage.value?.id === id) currentLanguage.value = res.data.data
    }
    return res?.data?.data || null
  }

  const getDefaultLanguage = async () => {
    const res = await useApiCall(
      'getDefaultLanguage',
      () => getApi().languageGetDefault(),
      state.loading,
      state.error,
      'Failed to get default language',
      true
    )
    if (res?.data?.data) {
      const defaultLang = res.data.data
      const idx = languages.value.findIndex(l => l.id === defaultLang.id)
      if (idx !== -1) {
        languages.value[idx] = defaultLang
      } else {
        languages.value.push(defaultLang)
      }
      return defaultLang
    }
    return null
  }

  return {
    ...state,
    languages,
    currentLanguage,
    allLanguages,
    defaultLanguage,
    defaultLanguages,
    fetchLanguages,
    fetchLanguage,
    fetchAllLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    getDefaultLanguage,
    clearCurrentLanguage: state.clearCurrent,
  }
})

export type { LanguageResource }
