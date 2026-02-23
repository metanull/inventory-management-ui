import { h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import type { Pinia } from 'pinia'

// Components
import ProjectDetail from '../ProjectDetail.vue'

// Stores
import { useProjectStore, type ProjectResource } from '@/stores/project'
import { useContextStore } from '@/stores/context'
import { useLanguageStore } from '@/stores/language'
import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
import { createMockProject } from '@/__tests__/test-utils'

// Mock icons to prevent rendering issues with SVG components
vi.mock('@heroicons/vue/24/solid', () => ({
  CheckCircleIcon: { render: () => h('div', { 'data-testid': 'check-circle-icon' }) },
  XCircleIcon: { render: () => h('div', { 'data-testid': 'x-circle-icon' }) },
  RocketLaunchIcon: { render: () => h('div', { 'data-testid': 'rocket-launch-icon' }) },
  ArchiveBoxIcon: { render: () => h('div', { 'data-testid': 'archive-box-icon' }) },
  FolderIcon: { render: () => h('div', { 'data-testid': 'folder-icon' }) },
  ArrowLeftIcon: { render: () => h('div', { 'data-testid': 'arrow-left-icon' }) },
  PencilIcon: { render: () => h('div', { 'data-testid': 'pencil-icon' }) },
  CheckIcon: { render: () => h('div', { 'data-testid': 'check-icon' }) },
  XMarkIcon: { render: () => h('div', { 'data-testid': 'x-mark-icon' }) },
  PlusIcon: { render: () => h('div', { 'data-testid': 'plus-icon' }) },
  TrashIcon: { render: () => h('div', { 'data-testid': 'trash-icon' }) },
  EyeIcon: { render: () => h('div', { 'data-testid': 'eye-icon' }) },
}))

describe('ProjectDetail Integration Tests', () => {
  let router: Router
  let pinia: Pinia
  let mockProjectStore: ReturnType<typeof useProjectStore>
  let mockContextStore: ReturnType<typeof useContextStore>
  let mockLanguageStore: ReturnType<typeof useLanguageStore>
  let mockLoadingStore: ReturnType<typeof useLoadingOverlayStore>

  // Define global mounting options to reuse across tests
  const getMountOptions = () => ({
    global: {
      plugins: [pinia, router],
      stubs: {
        // Fixes "Invalid vnode type": these components are likely auto-imported in the source
        // but need explicit stubs or definitions in the Vitest environment.
        Title: { template: '<div class="stub-title"><slot /></div>' },
        SystemProperties: { template: '<div class="stub-system-props" />' },
        // DetailView: false ensures the actual component renders so we can see its slots
        DetailView: false,
      },
    },
  })

  beforeEach(async () => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    })

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/projects', name: 'Projects', component: { template: '<div>Projects</div>' } },
        {
          path: '/projects/new',
          name: 'ProjectCreate',
          component: { template: '<div>Create</div>' },
        },
        // Component must be registered in the route for onBeforeRouteLeave to work
        { path: '/projects/:id', name: 'ProjectDetail', component: ProjectDetail },
      ],
    })

    mockProjectStore = useProjectStore()
    mockContextStore = useContextStore()
    mockLanguageStore = useLanguageStore()
    mockLoadingStore = useLoadingOverlayStore()

    vi.mocked(mockProjectStore.fetchProject).mockResolvedValue(
      createMockProject({
        id: 'test-1',
        internal_name: 'Test Project',
      })
    )
    vi.mocked(mockContextStore.fetchContexts).mockResolvedValue([])
    vi.mocked(mockLanguageStore.fetchLanguages).mockResolvedValue([])

    vi.clearAllMocks()
  })

  describe('Component Mounting and Data Loading', () => {
    it('should mount correctly for existing project view', async () => {
      const mockProject = createMockProject({
        id: 'test-project-1',
        internal_name: 'Test Project',
      })

      vi.mocked(mockProjectStore.fetchProject).mockResolvedValue(mockProject)

      mockProjectStore.currentProject = mockProject

      await router.push('/projects/test-project-1')
      await router.isReady()

      const wrapper = mount({ template: '<router-view />' }, getMountOptions())

      await flushPromises()
      expect(wrapper.text()).toContain('Test Project')
    })
  })

  describe('Loading States and Error Handling', () => {
    it('should show loading overlay during data fetching', async () => {
      vi.mocked(mockProjectStore.fetchProject).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({} as ProjectResource), 50))
      )

      await router.push('/projects/test-project-1')
      await router.isReady()

      mount({ template: '<router-view />' }, getMountOptions())

      expect(mockLoadingStore.show).toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 60))
      await flushPromises()

      expect(mockLoadingStore.hide).toHaveBeenCalled()
    })
  })

  describe('Navigation and Route Handling', () => {
    it('should clear project data on component unmount', async () => {
      await router.push('/projects/test-project-1')
      await router.isReady()

      const wrapper = mount({ template: '<router-view />' }, getMountOptions())

      await flushPromises()
      wrapper.unmount()

      expect(mockProjectStore.clearProjects).toHaveBeenCalled()
    })
  })
})
