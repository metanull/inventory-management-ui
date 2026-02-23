import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ProjectDetail from '../ProjectDetail.vue'

import { useProjectStore } from '@/stores/project'
import { useContextStore } from '@/stores/context'
import { useLanguageStore } from '@/stores/language'
import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
import { useErrorDisplayStore } from '@/stores/errorDisplay'

// ... Keep your Icon Mocks here ...

describe('ProjectDetail Component', () => {
  let router: Router

  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/projects', name: 'Projects', component: { template: '<div></div>' } },
        { path: '/projects/new', name: 'ProjectCreate', component: { template: '<div></div>' } },
        { path: '/projects/:id', name: 'ProjectDetail', component: { template: '<div></div>' } },
      ],
    })
  })

  interface StoreMocks {
    project: ReturnType<typeof useProjectStore>
    context: ReturnType<typeof useContextStore>
    language: ReturnType<typeof useLanguageStore>
    loading: ReturnType<typeof useLoadingOverlayStore>
    error: ReturnType<typeof useErrorDisplayStore>
  }

  // Improved helper: setup actions BEFORE mounting
  const createWrapper = (setupMocks?: (stores: StoreMocks) => void) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    })

    // Access stores to configure them before mount
    const stores = {
      project: useProjectStore(pinia),
      context: useContextStore(pinia),
      language: useLanguageStore(pinia),
      loading: useLoadingOverlayStore(pinia),
      error: useErrorDisplayStore(pinia),
    }

    // Default successful mocks so the component doesn't crash on mount
    stores.project.fetchProject = vi.fn().mockResolvedValue({})
    stores.context.fetchContexts = vi.fn().mockResolvedValue([])
    stores.language.fetchLanguages = vi.fn().mockResolvedValue([])

    // Apply specific test mocks
    if (setupMocks) setupMocks(stores)

    const wrapper = mount(ProjectDetail, {
      global: {
        plugins: [router, pinia],
      },
    })

    return { wrapper, ...stores }
  }

  describe('Component Mounting', () => {
    it('should mount correctly for existing project view', async () => {
      router.push('/projects/1')
      await router.isReady()

      const mockProject = { id: '1', internal_name: 'Test Project' }
      const { project } = createWrapper(s => {
        s.project.fetchProject = vi.fn().mockResolvedValue(mockProject)
      })

      await flushPromises()
      expect(project.fetchProject).toHaveBeenCalledWith('1')
    })
  })

  describe('Data Loading', () => {
    it('should load contexts and languages on mount', async () => {
      router.push('/projects/new')
      await router.isReady()

      const { context, language } = createWrapper()
      await flushPromises()

      expect(context.fetchContexts).toHaveBeenCalled()
      expect(language.fetchLanguages).toHaveBeenCalled()
    })

    it('should handle project fetch errors gracefully', async () => {
      router.push('/projects/1')
      await router.isReady()

      const { error } = createWrapper(s => {
        s.project.fetchProject = vi.fn().mockRejectedValue(new Error('Failed'))
      })

      await flushPromises()

      expect(error.addMessage).toHaveBeenCalledWith(
        'error',
        'Failed to load project. Please try again.'
      )
    })
  })

  describe('Loading States', () => {
    it('should show loading overlay during data fetching', async () => {
      router.push('/projects/1')
      await router.isReady()

      const { loading } = createWrapper()

      // Check immediate call on mount
      expect(loading.show).toHaveBeenCalled()

      await flushPromises()
      expect(loading.hide).toHaveBeenCalled()
    })
  })
})
