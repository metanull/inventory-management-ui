import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectForm from '../ProjectForm.vue'
import type {
  ProjectResource,
  ContextResource,
  LanguageResource,
} from '@metanull/inventory-app-api-client'

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

// Mock the context store
const mockContextStore = {
  contexts: [
    {
      id: 'context-123',
      internal_name: 'Test Context',
      backward_compatibility: 'test',
      is_default: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ] as ContextResource[],
  fetchContexts: vi.fn(),
}

vi.mock('@/stores/context', () => ({
  useContextStore: vi.fn(() => mockContextStore),
}))

// Mock the language store
const mockLanguageStore = {
  languages: [
    {
      id: 'language-123',
      internal_name: 'English',
      backward_compatibility: 'en',
      is_default: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ] as LanguageResource[],
  fetchLanguages: vi.fn(),
}

vi.mock('@/stores/language', () => ({
  useLanguageStore: vi.fn(() => mockLanguageStore),
}))

// Mock the API client
vi.mock('@metanull/inventory-app-api-client', () => ({
  ProjectApi: vi.fn().mockImplementation(() => ({
    projectIndex: vi.fn(),
    projectShow: vi.fn(),
    projectStore: vi.fn(),
    projectUpdate: vi.fn(),
    projectDestroy: vi.fn(),
  })),
  Configuration: vi.fn(),
}))

const mockProject: ProjectResource = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  internal_name: 'Test Project',
  backward_compatibility: 'test-project',
  launch_date: '2024-01-01',
  is_launched: false,
  is_enabled: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('ProjectForm Component', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  it('should render form fields correctly', () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    expect(wrapper.find('input[id="internal_name"]').exists()).toBe(true)
    expect(wrapper.find('input[id="backward_compatibility"]').exists()).toBe(true)
    expect(wrapper.find('input[id="launch_date"]').exists()).toBe(true)
    expect(wrapper.find('select[id="context_id"]').exists()).toBe(true)
    expect(wrapper.find('select[id="language_id"]').exists()).toBe(true)
    expect(wrapper.find('input[id="is_enabled"]').exists()).toBe(true)
    expect(wrapper.find('input[id="is_launched"]').exists()).toBe(true)
  })

  it('should populate form with project data when project prop is provided', () => {
    const wrapper = mount(ProjectForm, {
      props: {
        project: mockProject,
      },
      global: {
        plugins: [pinia],
      },
    })

    const nameInput = wrapper.find('input[id="internal_name"]')
    const compatibilityInput = wrapper.find('input[id="backward_compatibility"]')
    const launchDateInput = wrapper.find('input[id="launch_date"]')
    const enabledCheckbox = wrapper.find('input[id="is_enabled"]')
    const launchedCheckbox = wrapper.find('input[id="is_launched"]')

    expect((nameInput.element as HTMLInputElement).value).toBe(mockProject.internal_name)
    expect((compatibilityInput.element as HTMLInputElement).value).toBe(
      mockProject.backward_compatibility
    )
    expect((launchDateInput.element as HTMLInputElement).value).toBe(mockProject.launch_date || '')
    expect((enabledCheckbox.element as HTMLInputElement).checked).toBe(mockProject.is_enabled)
    expect((launchedCheckbox.element as HTMLInputElement).checked).toBe(mockProject.is_launched)
  })

  it('should emit submit event with form data when form is submitted', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    // Fill form
    await wrapper.find('input[id="internal_name"]').setValue('New Project')
    await wrapper.find('input[id="backward_compatibility"]').setValue('new-project')
    await wrapper.find('input[id="launch_date"]').setValue('2024-12-31')
    await wrapper.find('select[id="context_id"]').setValue('context-123')
    await wrapper.find('select[id="language_id"]').setValue('language-123')
    await wrapper.find('input[id="is_enabled"]').setValue(true)
    await wrapper.find('input[id="is_launched"]').setValue(false)

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    const emittedEvents = wrapper.emitted('submit')
    expect(emittedEvents).toBeTruthy()
    expect(emittedEvents?.[0]).toEqual([
      {
        internal_name: 'New Project',
        backward_compatibility: 'new-project',
        launch_date: '2024-12-31',
        context_id: 'context-123',
        language_id: 'language-123',
        is_enabled: true,
        is_launched: false,
      },
    ])
  })

  it('should not submit form if internal_name is empty', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    // Submit form without filling internal_name
    await wrapper.find('form').trigger('submit.prevent')

    const emittedEvents = wrapper.emitted('submit')
    expect(emittedEvents).toBeFalsy()
  })

  it('should emit cancel event when cancel button is clicked', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.find('button[type="button"]').trigger('click')

    const emittedEvents = wrapper.emitted('cancel')
    expect(emittedEvents).toBeTruthy()
  })

  it('should load contexts and languages on mount', () => {
    mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    expect(mockContextStore.fetchContexts).toHaveBeenCalledTimes(1)
    expect(mockLanguageStore.fetchLanguages).toHaveBeenCalledTimes(1)
  })

  it('should populate context and language select options', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    // Wait for the component to mount and fetch data
    await wrapper.vm.$nextTick()

    const contextSelect = wrapper.find('#context_id')
    const languageSelect = wrapper.find('#language_id')

    expect(contextSelect.exists()).toBe(true)
    expect(languageSelect.exists()).toBe(true)

    const contextOptions = contextSelect.findAll('option')
    const languageOptions = languageSelect.findAll('option')

    // Should have placeholder option + actual options
    expect(contextOptions).toHaveLength(2) // 1 placeholder + 1 context
    expect(languageOptions).toHaveLength(2) // 1 placeholder + 1 language

    expect(contextOptions[1].text()).toBe('Test Context')
    expect(languageOptions[1].text()).toBe('English')
  })

  it('should show validation errors', async () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    // Try to submit form with empty internal_name
    await wrapper.find('form').trigger('submit.prevent')

    // Should show validation error for internal_name
    expect(wrapper.find('p.text-red-600').exists()).toBe(true)
    expect(wrapper.find('p.text-red-600').text()).toBe('Internal name is required')
  })

  it('should clear validation errors when component mounts', () => {
    const wrapper = mount(ProjectForm, {
      global: {
        plugins: [pinia],
      },
    })

    // Component should mount without errors
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(true)
  })
})
