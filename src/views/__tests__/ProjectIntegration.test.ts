import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia, type TestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import Projects from '../Projects.vue'
import ProjectDetail from '../ProjectDetail.vue'
import { useProjectStore } from '@/stores/project'
import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
import { createMockProject } from '@/__tests__/test-utils'
import type {
  ProjectResource,
  ContextResource,
  LanguageResource,
} from '@metanull/inventory-app-api-client'

// --- Mock console to suppress noise ---
const originalConsole = { ...console }
beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})
afterAll(() => {
  Object.assign(console, originalConsole)
})

// --- Interfaces for Type Safety in Tests ---
interface ProjectsComponentInstance {
  projects: ProjectResource[]
  filteredProjects: ProjectResource[]
  searchQuery: string
  updateProjectStatus: (project: ProjectResource, field: string, value: boolean) => Promise<void>
}

interface ProjectDetailComponentInstance {
  mode: 'view' | 'edit' | 'create'
  editForm: { internal_name: string; context_id: string; language_id: string }
  saveProject: () => Promise<void>
  deleteProject: () => Promise<void>
}

// --- Icons Mock ---
vi.mock('@heroicons/vue/24/solid', async importOriginal => {
  const actual = await importOriginal<typeof import('@heroicons/vue/24/solid')>()
  return {
    ...actual,
  }
})

// --- Test Data ---
const mockProjects: ProjectResource[] = [
  createMockProject({ id: '1', internal_name: 'Active Project', is_enabled: true }),
  createMockProject({ id: '2', internal_name: 'Disabled Project', is_enabled: false }),
]

const mockContexts: ContextResource[] = [
  {
    id: 'ctx-1',
    internal_name: 'Test Context',
    backward_compatibility: null,
    is_default: true,
    created_at: '',
    updated_at: '',
  },
]

const mockLanguages: LanguageResource[] = [
  {
    id: 'lang-1',
    internal_name: 'English',
    backward_compatibility: null,
    is_default: true,
    created_at: '',
    updated_at: '',
  },
]

describe('Project Management Integration Tests', () => {
  let router: Router
  let pinia: TestingPinia

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
      initialState: {
        project: {
          category: mockProjects,
          visibleProjects: [mockProjects[0]],
        },
        context: {
          contexts: mockContexts,
          defaultContext: mockContexts[0],
        },
        language: {
          category: mockLanguages,
          defaultLanguage: mockLanguages[0],
        },
      },
    })

    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/projects', component: Projects },
        { path: '/projects/new', name: 'project-new', component: ProjectDetail },
        { path: '/projects/:id', component: ProjectDetail },
      ],
    })
  })

  describe('Create Workflow', () => {
    it('should navigate to and save a new project', async () => {
      await router.push('/projects/new')
      await router.isReady()

      const wrapper = mount(ProjectDetail, { global: { plugins: [pinia, router] } })
      await flushPromises()

      const projectStore = useProjectStore()
      const vm = wrapper.vm as unknown as ProjectDetailComponentInstance

      vm.editForm.internal_name = 'Integrated Test'

      // Mock the successful creation response with explicit resource type
      vi.mocked(projectStore.createProject).mockResolvedValue({
        id: 'new-99',
        internal_name: 'Integrated Test',
      } as ProjectResource)

      await vm.saveProject()

      expect(projectStore.createProject).toHaveBeenCalled()
      expect(projectStore.fetchProject).toHaveBeenCalledWith('new-99')
      expect(vm.mode).toBe('view')
    })
  })

  describe('Status Toggles', () => {
    it('should trigger store action on status change', async () => {
      await router.push('/projects')
      await router.isReady()

      const wrapper = mount(Projects, { global: { plugins: [pinia, router] } })
      await flushPromises()

      const projectStore = useProjectStore()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance

      const targetProject = mockProjects[0]!
      await vm.updateProjectStatus(targetProject, 'is_enabled', false)

      expect(projectStore.setProjectEnabled).toHaveBeenCalledWith('1', false)
    })
  })

  describe('Deletion Integration', () => {
    it('should call store delete after confirmation', async () => {
      const deleteStore = useDeleteConfirmationStore()
      const projectStore = useProjectStore()

      // Mock the confirmation dialog to return 'delete'
      vi.mocked(deleteStore.trigger).mockResolvedValue('delete')

      await router.push('/projects/1')
      await router.isReady()

      // Seed the store with the project we are viewing
      projectStore.currentEntry = mockProjects[0]

      const wrapper = mount(ProjectDetail, { global: { plugins: [pinia, router] } })
      await flushPromises()

      const vm = wrapper.vm as unknown as ProjectDetailComponentInstance
      await vm.deleteProject()

      expect(deleteStore.trigger).toHaveBeenCalled()
      expect(projectStore.deleteProject).toHaveBeenCalledWith('1')
    })
  })

  describe('Filtering', () => {
    it('should filter based on search query', async () => {
      await router.push('/projects')
      await router.isReady()

      const wrapper = mount(Projects, { global: { plugins: [pinia, router] } })
      await flushPromises()

      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      vm.searchQuery = 'Disabled'

      // Allow the computed property or watcher to react
      await wrapper.vm.$nextTick()

      expect(vm.filteredProjects.length).toBe(1)
      expect(vm.filteredProjects[0]?.id).toBe('2')
    })
  })
})
