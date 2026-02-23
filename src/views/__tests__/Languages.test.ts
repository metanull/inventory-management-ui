import { beforeEach, describe, expect, it, vi, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Languages from '../Languages.vue'
import { useLanguageStore } from '@/stores/language'
import { createMockLanguage } from '@/__tests__/test-utils'
import type { LanguageResource } from '@metanull/inventory-app-api-client'
import type { Router } from 'vue-router'

interface LanguagesComponentInstance {
  languages: LanguageResource[]
  filteredLanguages: LanguageResource[]
  searchQuery: string
  sortDirection: string
  sortKey: string
}

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

describe('Languages.vue', () => {
  let router: Router

  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/languages', component: Languages },
      ],
    })
  })

  // Helper to mount with Testing Pinia
  const createWrapper = () => {
    return mount(Languages, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              language: {
                // Ensure this matches your store ID
                languages: mockLanguages,
                loading: false,
              },
            },
            stubActions: false, // Allows real getters/logic to run if needed
          }),
          router,
        ],
      },
    })
  }

  describe('Component Logic', () => {
    it('should initialize with default values', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as LanguagesComponentInstance

      expect(vm.sortKey).toBe('internal_name')
      expect(vm.sortDirection).toBe('asc')
      expect(vm.searchQuery).toBe('')
    })

    it('should have access to store data', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as LanguagesComponentInstance

      // Accessing the store instance created by createTestingPinia
      const store = useLanguageStore()

      expect(vm.languages.length).toBe(3)
      expect(store.languages).toHaveLength(3)
    })
  })

  describe('Search Functionality', () => {
    it('should search languages by internal name', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as LanguagesComponentInstance

      vm.searchQuery = 'English'
      await wrapper.vm.$nextTick()

      expect(vm.filteredLanguages.length).toBe(1)
      expect(vm.filteredLanguages[0]?.internal_name).toBe('English')
    })

    it('should filter languages by backward_compatibility', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as LanguagesComponentInstance

      vm.searchQuery = 'fr'
      await wrapper.vm.$nextTick()

      expect(vm.filteredLanguages.length).toBe(1)
      expect(vm.filteredLanguages[0]?.backward_compatibility).toBe('fr')
    })
  })
})
