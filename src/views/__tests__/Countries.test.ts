import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Countries from '../Countries.vue'
import { useCountryStore } from '@/stores/country'
import { createMockCountry } from '@/__tests__/test-utils'
import type { CountryResource } from '@metanull/inventory-app-api-client'
import type { Router } from 'vue-router'

// Mock console to avoid noise
let originalConsole: typeof console
beforeAll(() => {
  originalConsole = { ...console }
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

interface CountriesComponentInstance {
  countries: CountryResource[]
  filteredCountries: CountryResource[]
  searchQuery: string
  sortDirection: string
  sortKey: string
  openCountryDetail: (id: string) => void
  handleSort: (field: string) => void
  fetchCountries: () => Promise<void>
}

const mockCountries: CountryResource[] = [
  createMockCountry({ id: 'GBR', internal_name: 'United Kingdom', backward_compatibility: 'GB' }),
  createMockCountry({ id: 'USA', internal_name: 'United States', backward_compatibility: 'US' }),
  createMockCountry({ id: 'FRA', internal_name: 'France', backward_compatibility: null }),
]

describe('Countries.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/countries', component: Countries },
      ],
    })
  })

  // Factory function to create the wrapper
  const createWrapper = () => {
    return mount(Countries, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              country: {
                category: mockCountries,
                pageLinks: {},
                pageMeta: {
                  total: 3,
                  links: [
                    { url: '/?page=1', label: '1', active: true },
                    { url: null, label: 'Next', active: false },
                  ],
                },
              },
            },
          }),
          router,
        ],
      },
    })
  }

  describe('Component Logic', () => {
    it('should initialize with default values', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as CountriesComponentInstance

      expect(vm.sortKey).toBe('internal_name')
      expect(vm.sortDirection).toBe('asc')
    })

    it('should have access to store data', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as CountriesComponentInstance

      expect(vm.countries.length).toBe(3)
    })
  })

  describe('Search Functionality', () => {
    it('should search countries by internal name', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as CountriesComponentInstance

      vm.searchQuery = 'United'
      await wrapper.vm.$nextTick()

      expect(vm.filteredCountries.length).toBe(2)
      expect(vm.filteredCountries[0]?.internal_name).toContain('United')
    })

    it('should filter countries by backward_compatibility', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as CountriesComponentInstance

      vm.searchQuery = 'GB'
      await wrapper.vm.$nextTick()

      expect(vm.filteredCountries.length).toBe(1)
      expect(vm.filteredCountries[0]?.backward_compatibility).toBe('GB')
    })
  })

  describe('Store Integration', () => {
    it('should call fetchCountries on mount', async () => {
      // Trigger mount to run the setup/lifecycle hooks
      createWrapper()

      // Access the mocked store instance
      const countryStore = useCountryStore()

      await flushPromises()
      expect(countryStore.fetchCountries).toHaveBeenCalled()
    })
  })
})
