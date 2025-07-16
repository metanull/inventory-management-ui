import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import LanguageDetail from '../LanguageDetail.vue'
import { useLanguageStore } from '@/stores/language'
import type { LanguageResource } from '@metanull/inventory-app-api-client'
import DateDisplay from '@/components/format/Date.vue'

// Mock the ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
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

const mockLanguage: LanguageResource = {
  id: 'eng',
  internal_name: 'English',
  backward_compatibility: 'en',
  is_default: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('LanguageDetail View', () => {
  let router: Router
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/languages', component: { template: '<div>Languages List</div>' } },
        { path: '/languages/:id', component: LanguageDetail },
      ],
    })

    // Mock the language store fetchLanguage method to avoid API calls
    const languageStore = useLanguageStore()
    vi.spyOn(languageStore, 'fetchLanguage').mockImplementation(() => Promise.resolve(mockLanguage))
  })

  it('should render the language detail page', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.currentLanguage = mockLanguage

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('English')
    expect(wrapper.text()).toContain('eng')
    expect(wrapper.text()).toContain('Default')
  })

  it('should show loading state', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.loading = true
    store.currentLanguage = null

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading language details')
  })

  it('should show not found state when no language', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.loading = false
    store.currentLanguage = null

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Language not found')
  })

  it('should show edit and delete buttons', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.currentLanguage = mockLanguage

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Edit')
    expect(wrapper.text()).toContain('Delete')
  })

  it('should disable delete button for default language', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.currentLanguage = mockLanguage

    await wrapper.vm.$nextTick()

    const deleteButton = wrapper.find('button:has(svg):disabled')
    expect(deleteButton.exists()).toBe(true)
  })

  it('should show language information correctly', async () => {
    const wrapper = mount(LanguageDetail, {
      global: {
        plugins: [pinia, router],
        components: {
          DateDisplay,
        },
      },
    })

    const store = useLanguageStore()
    store.currentLanguage = mockLanguage

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Language Information')
    expect(wrapper.text()).toContain('eng')
    expect(wrapper.text()).toContain('English')
    expect(wrapper.text()).toContain('en')
    expect(wrapper.text()).toContain('Yes') // for Default Language
  })
})
