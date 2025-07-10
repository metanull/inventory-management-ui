import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LanguageForm from '../LanguageForm.vue'
import type { LanguageResource } from '@metanull/inventory-app-api-client'

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

describe('LanguageForm Component', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should render the form when visible', () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    expect(wrapper.text()).toContain('Create New Language')
    expect(wrapper.find('input#id').exists()).toBe(true)
    expect(wrapper.find('input#internal_name').exists()).toBe(true)
  })

  it('should not render when not visible', () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: false,
      },
    })

    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('should show edit mode when language is provided', () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        language: mockLanguage,
      },
    })

    expect(wrapper.text()).toContain('Edit Language')
    expect(wrapper.find('input#id').attributes('disabled')).toBeDefined()
  })

  it('should populate form fields when editing', async () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
        language: mockLanguage,
      },
    })

    await wrapper.vm.$nextTick()

    const idInput = wrapper.find('input#id')
    const nameInput = wrapper.find('input#internal_name')
    const backwardInput = wrapper.find('input#backward_compatibility')
    const defaultCheckbox = wrapper.find('input#is_default')

    expect((idInput.element as HTMLInputElement).value).toBe('eng')
    expect((nameInput.element as HTMLInputElement).value).toBe('English')
    expect((backwardInput.element as HTMLInputElement).value).toBe('en')
    expect((defaultCheckbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('should emit close event when cancel is clicked', async () => {
    const wrapper = mount(LanguageForm, {
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
    const wrapper = mount(LanguageForm, {
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
    expect(wrapper.text()).toContain('Language ID is required')
    expect(wrapper.text()).toContain('Internal name is required')
  })

  it('should validate ID format', async () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    const idInput = wrapper.find('input#id')
    await idInput.setValue('EN') // Invalid: too short and uppercase

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Language ID must be exactly 3 characters')
  })

  it('should validate backward compatibility format', async () => {
    const wrapper = mount(LanguageForm, {
      global: {
        plugins: [pinia],
      },
      props: {
        isVisible: true,
      },
    })

    const idInput = wrapper.find('input#id')
    const nameInput = wrapper.find('input#internal_name')
    const backwardInput = wrapper.find('input#backward_compatibility')

    await idInput.setValue('eng')
    await nameInput.setValue('English')
    await backwardInput.setValue('E') // Invalid: too short

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Backward compatibility code must be exactly 2 characters')
  })
})
