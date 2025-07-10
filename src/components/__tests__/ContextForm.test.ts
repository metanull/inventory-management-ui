import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ContextForm from '../ContextForm.vue'
import type { ContextResource } from '@metanull/inventory-app-api-client'

// Mock the ErrorHandler
vi.mock('@/utils/errorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    clearValidationErrors: vi.fn(),
    getFieldError: vi.fn(),
  })),
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

const mockContext: ContextResource = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  internal_name: 'Main Context',
  backward_compatibility: 'main',
  is_default: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ContextForm Component', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should render the form when visible', () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    expect(wrapper.text()).toContain('Create New Context')
    expect(wrapper.find('input#internal_name').exists()).toBe(true)
    expect(wrapper.find('input#backward_compatibility').exists()).toBe(true)
    expect(wrapper.find('input#is_default').exists()).toBe(true)
  })

  it('should not render when not visible', () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: false,
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should show edit mode when context is provided', () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        context: mockContext,
      },
    })

    expect(wrapper.text()).toContain('Edit Context')
  })

  it('should populate form fields when editing', async () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        context: mockContext,
      },
    })

    await wrapper.vm.$nextTick()

    const nameInput = wrapper.find('input#internal_name')
    const backwardInput = wrapper.find('input#backward_compatibility')
    const defaultCheckbox = wrapper.find('input#is_default')

    expect((nameInput.element as HTMLInputElement).value).toBe('Main Context')
    expect((backwardInput.element as HTMLInputElement).value).toBe('main')
    expect((defaultCheckbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('should emit close event when cancel is clicked', async () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    const cancelButton = wrapper.find('button[type="button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should validate required fields', async () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    // Should show validation errors for required fields
    expect(wrapper.text()).toContain('Internal name is required')
  })

  it('should validate internal name length', async () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    const nameInput = wrapper.find('input#internal_name')
    // Create a string longer than 255 characters
    await nameInput.setValue('x'.repeat(256))

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Internal name must be 255 characters or less')
  })

  it('should clear form when switching from edit to create mode', async () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        context: mockContext,
      },
    })

    await wrapper.vm.$nextTick()

    // Verify form is populated
    const nameInput = wrapper.find('input#internal_name')
    expect((nameInput.element as HTMLInputElement).value).toBe('Main Context')

    // Switch to create mode
    await wrapper.setProps({ context: null })
    await wrapper.vm.$nextTick()

    // Verify form is cleared
    expect((nameInput.element as HTMLInputElement).value).toBe('')
  })

  it('should show set default button only in edit mode when not default', () => {
    const nonDefaultContext = { ...mockContext, is_default: false }

    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        context: nonDefaultContext,
      },
    })

    expect(wrapper.text()).toContain('Set as Default')
  })

  it('should not show set default button when context is already default', () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        context: mockContext, // is_default: true
      },
    })

    expect(wrapper.text()).not.toContain('Set as Default')
  })

  it('should not show set default button in create mode', () => {
    const wrapper = mount(ContextForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    expect(wrapper.text()).not.toContain('Set as Default')
  })
})
