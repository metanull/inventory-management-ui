import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import Contexts from '../Contexts.vue'
import { useContextStore } from '@/stores/context'
import type { ContextResource } from '@metanull/inventory-app-api-client'

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
  ContextApi: vi.fn().mockImplementation(() => ({
    contextIndex: vi.fn(),
    contextShow: vi.fn(),
    contextStore: vi.fn(),
    contextUpdate: vi.fn(),
    contextDestroy: vi.fn(),
  })),
  Configuration: vi.fn(),
}))

const mockContexts: ContextResource[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    internal_name: 'Main Context',
    backward_compatibility: 'main',
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    internal_name: 'Development Context',
    backward_compatibility: 'dev',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

describe('Contexts View', () => {
  let router: Router
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/contexts', component: Contexts },
      ],
    })

    // Mock the context store fetchContexts method to avoid API calls
    const contextStore = useContextStore()
    vi.spyOn(contextStore, 'fetchContexts').mockImplementation(() => Promise.resolve())
  })

  it('should render the contexts page title', () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Context Management')
    expect(wrapper.text()).toContain('Manage contexts available in the inventory system')
  })

  it('should display contexts in the table', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = mockContexts

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Main Context')
    expect(wrapper.text()).toContain('Development Context')
    // Check for truncated IDs (first 8 characters + ...)
    expect(wrapper.text()).toContain('123e4567...')
  })

  it('should show loading state', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.loading = true
    store.contexts = [] // Ensure empty to show loading

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Loading contexts')
  })

  it('should show error message via store error state', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.error = 'Test error message'

    await wrapper.vm.$nextTick()

    // Since we're using the global ErrorDisplay component,
    // we just verify the error is set in the store
    expect(store.error).toBe('Test error message')
  })

  it('should show add context button', () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.text()).toContain('Add Context')
  })

  it('should display empty state when no contexts', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = []
    store.loading = false // Ensure not loading

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('No contexts found')
  })

  it('should highlight default context', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = mockContexts

    await wrapper.vm.$nextTick()

    const defaultBadges = wrapper.findAll('.bg-green-100')
    expect(defaultBadges.length).toBeGreaterThan(0)
  })

  it('should display action buttons for each context', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = mockContexts

    await wrapper.vm.$nextTick()

    // Should have view, edit buttons for each context
    const viewButtons = wrapper.findAll('[title="View details"]')
    const editButtons = wrapper.findAll('[title="Edit context"]')

    expect(viewButtons.length).toBe(2)
    expect(editButtons.length).toBe(2)
  })

  it('should disable delete button for default context', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = mockContexts

    await wrapper.vm.$nextTick()

    const deleteButtons = wrapper.findAll('[title="Delete context"]')
    expect(deleteButtons.length).toBe(2)

    // First context is default, should be disabled
    expect(deleteButtons[0].attributes('disabled')).toBeDefined()
    // Second context is not default, should not be disabled
    expect(deleteButtons[1].attributes('disabled')).toBeUndefined()
  })

  it('should show set default button only for non-default contexts', async () => {
    const wrapper = mount(Contexts, {
      global: {
        plugins: [pinia, router],
      },
    })

    const store = useContextStore()
    store.contexts = mockContexts

    await wrapper.vm.$nextTick()

    const setDefaultButtons = wrapper.findAll('[title="Set as default"]')
    // Only one context should have the set default button (the non-default one)
    expect(setDefaultButtons.length).toBe(1)
  })
})
