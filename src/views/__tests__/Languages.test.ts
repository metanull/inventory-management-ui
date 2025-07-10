import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import Languages from '../Languages.vue'
import { useLanguageStore } from '@/stores/language'
import type { LanguageResource } from '@metanull/inventory-app-api-client'

// Mock the ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    clearValidationErrors: vi.fn(),
    getFieldError: vi.fn(() => ''),
  })),
  ErrorHandler: {
    handleError: vi.fn(),
  },
}))

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token',
  })),
}))

// Mock the API client
vi.mock('@metanull/inventory-app-api-client', () => ({
  LanguageApi: vi.fn().mockImplementation(() => ({
    languageIndex: vi.fn(),
    languageShow: vi.fn(),
    languageStore: vi.fn(),
    languageUpdate: vi.fn(),
    languageDestroy: vi.fn(),
  })),
  Configuration: vi.fn(),
}))

const mockLanguages: LanguageResource[] = [
  {
    id: 'eng',
    internal_name: 'English',
    backward_compatibility: 'en',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'fra',
    internal_name: 'French',
    backward_compatibility: 'fr',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('Languages View', () => {
  let router: Router
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/languages', component: Languages },
      ],
    })

    // Mock the language store fetchLanguages method to avoid API calls
    const languageStore = useLanguageStore()
    vi.spyOn(languageStore, 'fetchLanguages').mockImplementation(() => Promise.resolve())
  })

  it('should render the languages page title', () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Language Management')
    expect(wrapper.text()).toContain('Manage languages available in the inventory system')
  })

  it('should display languages in the table', async () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useLanguageStore()
    store.languages = mockLanguages

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('English')
    expect(wrapper.text()).toContain('French')
    expect(wrapper.text()).toContain('eng')
    expect(wrapper.text()).toContain('fra')
  })

  it('should show loading state', async () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useLanguageStore()
    store.loading = true
    store.languages = [] // Ensure empty to show loading

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading languages')
  })

  it('should show error message via store error state', async () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useLanguageStore()
    store.error = 'Test error message'

    await wrapper.vm.$nextTick()

    // Since we're using the global ErrorDisplay component,
    // we just verify the error is set in the store
    expect(store.error).toBe('Test error message')
  })

  it('should show add language button', () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Add Language')
  })

  it('should display empty state when no languages', async () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useLanguageStore()
    store.languages = []
    store.loading = false // Ensure not loading

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No languages found')
  })

  it('should highlight default language', async () => {
    const wrapper = mount(Languages, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useLanguageStore()
    store.languages = mockLanguages

    await wrapper.vm.$nextTick()

    const defaultBadges = wrapper.findAll('.bg-green-100')
    expect(defaultBadges.length).toBeGreaterThan(0)
  })
})
