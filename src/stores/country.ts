import { defineStore } from 'pinia'
import { computed } from 'vue'
import {
  CountryApi,
  type CountryResource,
  type StoreCountryRequest,
  type UpdateCountryRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useCountryStore = defineStore('country', () => {
  const state = createPaginatedStoreState<CountryResource>()
  const {
    category: countries,
    currentEntry: currentCountry,
    pageLinks,
    pageMeta,
    loading,
    error,
  } = state
  const getApi = () => new CountryApi(createApiConfig())

  // Actions
  const fetchCountries = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchCountries',
      () => getApi().countryIndex(page, perPage),
      loading,
      error,
      'Failed to fetch countries'
    )
    if (res?.data) {
      countries.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return countries.value
  }

  const fetchCountry = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchCountry',
      () => getApi().countryShow(id),
      loading,
      error,
      `Failed to fetch country with ID: ${id}`
    )
    if (res?.data?.data) currentCountry.value = res.data.data
  }

  const createCountry = async (data: StoreCountryRequest) => {
    const res = await useApiCall(
      'createCountry',
      () => getApi().countryStore(data),
      loading,
      error,
      'Failed to create country'
    )
    if (res?.data?.data) countries.value.push(res.data.data)
    return res?.data?.data || null
  }

  const updateCountry = async (id: string, data: UpdateCountryRequest) => {
    const res = await useApiCall(
      'updateCountry',
      () => getApi().countryUpdate(id, data),
      loading,
      error,
      'Failed to update country'
    )
    if (res?.data?.data) {
      const idx = countries.value.findIndex(c => c.id === id)
      if (idx !== -1) countries.value[idx] = res.data.data
      if (currentCountry.value?.id === id) currentCountry.value = res.data.data
    }
    return res?.data?.data || null
  }

  const deleteCountry = async (id: string) => {
    const res = await useApiCall(
      'deleteCountry',
      () => getApi().countryDestroy(id),
      loading,
      error,
      'Failed to delete country'
    )
    if (res) countries.value = countries.value.filter(c => c.id !== id)
    return !!res
  }

  return {
    ...state,
    // Computed
    sortedCountries: computed(() =>
      [...countries.value].sort((a, b) => a.internal_name.localeCompare(b.internal_name))
    ),
    countriesCount: computed(() => countries.value.length),
    // Actions
    fetchCountries,
    fetchCountry,
    createCountry,
    updateCountry,
    deleteCountry,
    findCountryById: (id: string) => countries.value.find(c => c.id === id),
  }
})
