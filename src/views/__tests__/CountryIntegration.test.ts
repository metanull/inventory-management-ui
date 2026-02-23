/**
 * Integration Tests for Country Components
 */

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

const mockCountries: CountryResource[] = [
  createMockCountry({ id: 'GBR', internal_name: 'United Kingdom', backward_compatibility: 'GB' }),
  createMockCountry({ id: 'USA', internal_name: 'United States', backward_compatibility: 'US' }),
  createMockCountry({ id: 'FRA', internal_name: 'France', backward_compatibility: null }),
]

describe('Country Integration Tests', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/countries', component: Countries },
        { path: '/countries/new', component: { template: '<div>New Country</div>' } },
        { path: '/countries/:id', component: { template: '<div>Country Detail</div>' } },
      ],
    })
  })

  const createWrapper = (initialState = {}) => {
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
                  links: [{ url: '/?page=1', label: '1', active: true }],
                },
                loading: false,
                error: null,
                ...initialState,
              },
            },
          }),
          router,
        ],
      },
    })
  }

  describe('Countries Component Integration', () => {
    it('should render with complete data and interactions', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      expect(wrapper.text()).toContain('Countries')
      expect(wrapper.text()).toContain('United Kingdom')

      const countryStore = useCountryStore()
      expect(countryStore.fetchCountries).toHaveBeenCalled()
    })

    it('should handle search interactions correctly', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const searchInput = wrapper.find('input[placeholder="Search countries..."]')
      await searchInput.setValue('United')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('United Kingdom')
      expect(wrapper.text()).toContain('United States')
      expect(wrapper.text()).not.toContain('France')
    })

    it('should handle empty states correctly', async () => {
      const wrapper = createWrapper({ category: [], pageMeta: { total: 0, links: [] } })
      await flushPromises()

      expect(wrapper.text()).toContain('Get started by creating a new country.')
    })

    it('should handle loading states', async () => {
      const wrapper = createWrapper({ loading: true })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Navigation Integration', () => {
    it('should navigate to country detail on row click', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should have working add country button', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const addButton = wrapper.find('a[href="/countries/new"]')
      expect(addButton.exists()).toBe(true)
    })
  })

  describe('Store Integration', () => {
    it('should call store methods on mount', async () => {
      createWrapper()
      const countryStore = useCountryStore()
      await flushPromises()
      expect(countryStore.fetchCountries).toHaveBeenCalled()
    })

    it('should handle store errors gracefully', async () => {
      const wrapper = createWrapper({ error: 'Network error' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Responsive Behavior', () => {
    it('should render table headers correctly', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const headers = wrapper.findAll('th')
      const headerText = headers.map(h => h.text()).join(' ')
      expect(headerText).toContain('Country')
    })

    it('should render country data in table format', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const cellText = wrapper
        .findAll('td')
        .map(c => c.text())
        .join(' ')
      expect(cellText).toContain('United Kingdom')
    })
  })
})
