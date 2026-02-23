/**
 * Integration Tests for Language Components
 */

import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Languages from '../Languages.vue'
import { useLanguageStore } from '@/stores/language'
import { createMockLanguage } from '@/__tests__/test-utils'
import type { LanguageResource } from '@metanull/inventory-app-api-client'
import type { Router } from 'vue-router'

// Component interface types for proper typing
interface LanguagesComponentInstance {
  languages: LanguageResource[]
  filteredLanguages: LanguageResource[]
  defaultLanguages: LanguageResource[]
  searchQuery: string
  sortKey: string
  sortDirection: string
  openLanguageDetail: (id: string) => void
  handleSort: (field: string) => void
}

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

const mockLanguages: LanguageResource[] = [
  createMockLanguage({
    id: 'eng',
    internal_name: 'English',
    backward_compatibility: 'en',
    is_default: true,
  }),
  createMockLanguage({
    id: 'fra',
    internal_name: 'French',
    backward_compatibility: 'fr',
    is_default: false,
  }),
  createMockLanguage({
    id: 'deu',
    internal_name: 'German',
    backward_compatibility: null,
    is_default: false,
  }),
]

describe('Language Integration Tests', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/languages', component: Languages },
        { path: '/languages/new', component: { template: '<div>New Language</div>' } },
        { path: '/languages/:id', component: { template: '<div>Language Detail</div>' } },
      ],
    })
  })

  const createWrapper = (initialStoreState = {}) => {
    return mount(Languages, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              language: {
                category: mockLanguages,
                pageLinks: {},
                pageMeta: {
                  total: 3,
                  links: [{ url: '/?page=1', label: '1', active: true }],
                },
                loading: false,
                error: null,
                ...initialStoreState,
              },
            },
          }),
          router,
        ],
      },
    })
  }

  describe('Component Integration', () => {
    it('should mount successfully', async () => {
      const wrapper = createWrapper()
      await flushPromises()
      expect(wrapper.exists()).toBe(true)

      const store = useLanguageStore()
      expect(store.fetchLanguages).toHaveBeenCalled()
    })

    it('should display languages from store', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      expect(vm.languages).toHaveLength(3)
      expect(vm.languages[0]?.internal_name).toBe('English')
    })

    it('should handle empty language list', async () => {
      const wrapper = createWrapper({ category: [], pageMeta: { total: 0, links: [] } })
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      expect(vm.languages).toHaveLength(0)
    })
  })

  describe('Search Integration', () => {
    it('should filter languages by search query', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      vm.searchQuery = 'English'
      await wrapper.vm.$nextTick()

      expect(vm.filteredLanguages).toHaveLength(1)
      expect(vm.filteredLanguages[0]?.internal_name).toBe('English')
    })

    it('should filter by backward compatibility code', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      vm.searchQuery = 'fr'
      await wrapper.vm.$nextTick()

      expect(vm.filteredLanguages).toHaveLength(1)
      expect(vm.filteredLanguages[0]?.backward_compatibility).toBe('fr')
    })
  })

  describe('Sorting Integration', () => {
    it('should sort languages by internal_name ascending', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      expect(vm.sortDirection).toBe('asc')
      expect(vm.sortKey).toBe('internal_name')
    })

    it('should toggle sort direction', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      vm.handleSort('internal_name')
      await wrapper.vm.$nextTick()
      expect(vm.sortDirection).toBe('desc')
    })
  })

  describe('Navigation Integration', () => {
    it('should navigate to language detail', async () => {
      const pushSpy = vi.spyOn(router, 'push')

      // Initialize pinia for the test
      const pinia = createTestingPinia({
        createSpy: vi.fn, // Tells pinia to use Vitest's spying
        initialState: {
          language: {
            // Provide mock data so filteredLanguages has something to render
            category: [{ id: 'eng', internal_name: 'English' }],
            pageMeta: { current_page: 1 },
          },
        },
      })

      const wrapper = mount(Languages, {
        global: {
          plugins: [router, pinia], // Provide the pinia instance here
        },
      })

      // Find the row (using the text or data-test approach from before)
      const row = wrapper.find('tr.cursor-pointer')
      await row.trigger('click')

      expect(pushSpy).toHaveBeenCalledWith('/languages/eng')
    })
  })

  describe('Default Language Integration', () => {
    it('should display default language indicators', async () => {
      const wrapper = createWrapper()
      await flushPromises()

      const vm = wrapper.vm as unknown as LanguagesComponentInstance
      const defaultLangs = vm.languages.filter(l => l.is_default)
      expect(defaultLangs).toHaveLength(1)
    })
  })

  describe('Error Handling Integration', () => {
    it('should display error state', async () => {
      const wrapper = createWrapper({ error: 'Failed to load languages' })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)

      const store = useLanguageStore()
      expect(store.error).toBe('Failed to load languages')
    })
  })

  describe('Loading State Integration', () => {
    it('should show loading state', async () => {
      const wrapper = createWrapper({ loading: true })
      await flushPromises()
      expect(wrapper.exists()).toBe(true)

      const store = useLanguageStore()
      expect(store.loading).toBe(true)
    })
  })
})
