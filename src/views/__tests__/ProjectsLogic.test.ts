import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useProjectStore } from '@/stores/project'
import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
import { useErrorDisplayStore } from '@/stores/errorDisplay'
import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
import { createMockProject } from '@/__tests__/test-utils'
import type { ProjectResource } from '@metanull/inventory-app-api-client'

// Mock console to avoid noise in test output
let originalConsole: typeof console

beforeAll(() => {
  originalConsole = { ...console }
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

const mockProjects: ProjectResource[] = [
  createMockProject({
    id: '1',
    internal_name: 'Active Project',
    backward_compatibility: 'active-project',
    is_enabled: true,
    is_launched: true,
    launch_date: '2023-01-01T00:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
  }),
  createMockProject({
    id: '2',
    internal_name: 'Disabled Project',
    backward_compatibility: 'disabled-project',
    is_enabled: false,
    is_launched: false,
    launch_date: '2023-06-01T00:00:00Z',
    created_at: '2023-02-01T00:00:00Z',
  }),
  createMockProject({
    id: '3',
    internal_name: 'Enabled Not Launched',
    backward_compatibility: 'enabled-not-launched',
    is_enabled: true,
    is_launched: false,
    launch_date: '2024-12-01T00:00:00Z',
    created_at: '2023-03-01T00:00:00Z',
  }),
]

/**
 * ProjectsLogic class
 * Encapsulates the business logic of the Projects component for testing.
 */
class ProjectsLogic {
  public filterMode: 'all' | 'enabled' | 'launched' | 'visible' = 'all'
  public searchQuery = ''
  public sortKey: keyof ProjectResource = 'internal_name'
  public sortDirection: 'asc' | 'desc' = 'asc'

  constructor(
    private projectStore: ReturnType<typeof useProjectStore>,
    private loadingStore: ReturnType<typeof useLoadingOverlayStore>,
    private errorStore: ReturnType<typeof useErrorDisplayStore>,
    private deleteStore: ReturnType<typeof useDeleteConfirmationStore>
  ) {}

  get projects(): ProjectResource[] {
    return this.projectStore.category
  }

  get enabledProjects(): ProjectResource[] {
    return this.projectStore.enabledProjects
  }

  get launchedProjects(): ProjectResource[] {
    return this.projectStore.launchedProjects
  }

  get visibleProjects(): ProjectResource[] {
    return this.projectStore.visibleProjects
  }

  get filteredProjects(): ProjectResource[] {
    let list: ProjectResource[]

    switch (this.filterMode) {
      case 'visible':
        list = this.visibleProjects
        break
      case 'enabled':
        list = this.enabledProjects
        break
      case 'launched':
        list = this.launchedProjects
        break
      default:
        list = this.projects
    }

    const query = this.searchQuery.trim().toLowerCase()
    if (query.length > 0) {
      list = list.filter(project => {
        const name = project.internal_name?.toLowerCase() ?? ''
        const compat = project.backward_compatibility?.toLowerCase() ?? ''
        return name.includes(query) || compat.includes(query)
      })
    }

    return [...list].sort((a, b) => {
      const key = this.sortKey
      const valA = a[key]
      const valB = b[key]

      if (valA == null && valB == null) return 0
      if (valA == null) return 1
      if (valB == null) return -1

      // We use a guard here to ensure values are comparable (strings, numbers, or booleans)
      if (valA < (valB as typeof valA)) return this.sortDirection === 'asc' ? -1 : 1
      if (valA > (valB as typeof valA)) return this.sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  handleSort(key: keyof ProjectResource) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortKey = key
      this.sortDirection = 'asc'
    }
  }

  async updateProjectStatus(
    project: ProjectResource,
    field: 'is_enabled' | 'is_launched',
    value: boolean
  ) {
    try {
      this.loadingStore.show('Updating...')

      if (field === 'is_enabled') {
        await this.projectStore.setProjectEnabled(project.id, value)
        this.errorStore.addMessage(
          'info',
          `Project ${value ? 'enabled' : 'disabled'} successfully.`
        )
      } else {
        await this.projectStore.setProjectLaunched(project.id, value)
        this.errorStore.addMessage(
          'info',
          `Project ${value ? 'launched' : 'unlaunched'} successfully.`
        )
      }
    } catch (error) {
      this.errorStore.addMessage('error', 'Failed to update project status. Please try again.')
      throw error
    } finally {
      this.loadingStore.hide()
    }
  }

  async handleDeleteProject(projectToDelete: ProjectResource) {
    const result = await this.deleteStore.trigger(
      'Delete Project',
      `Are you sure you want to delete "${projectToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        this.loadingStore.show('Deleting...')
        await this.projectStore.deleteProject(projectToDelete.id)
        this.errorStore.addMessage('info', 'Project deleted successfully.')
      } catch (error) {
        this.errorStore.addMessage('error', 'Failed to delete project. Please try again.')
        throw error
      } finally {
        this.loadingStore.hide()
      }
    }
  }

  async fetchProjects() {
    try {
      this.loadingStore.show()
      if (this.filterMode === 'visible') {
        await this.projectStore.fetchEnabledProjects()
      } else {
        await this.projectStore.fetchProjects()
      }
      this.errorStore.addMessage('info', 'Projects refreshed successfully.')
    } catch (error) {
      this.errorStore.addMessage('error', 'Failed to refresh projects. Please try again.')
      throw error
    } finally {
      this.loadingStore.hide()
    }
  }
}

describe('Projects Component Business Logic', () => {
  let projectStore: ReturnType<typeof useProjectStore>
  let loadingStore: ReturnType<typeof useLoadingOverlayStore>
  let errorStore: ReturnType<typeof useErrorDisplayStore>
  let deleteStore: ReturnType<typeof useDeleteConfirmationStore>
  let projectsLogic: ProjectsLogic

  beforeEach(() => {
    createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        project: {
          category: mockProjects,
          // TestingPinia stubs these, but we can override if logic depends on them
          enabledProjects: mockProjects.filter(p => p.is_enabled),
          launchedProjects: mockProjects.filter(p => p.is_launched),
          visibleProjects: [mockProjects[0]],
        },
      },
    })

    projectStore = useProjectStore()
    loadingStore = useLoadingOverlayStore()
    errorStore = useErrorDisplayStore()
    deleteStore = useDeleteConfirmationStore()

    projectsLogic = new ProjectsLogic(projectStore, loadingStore, errorStore, deleteStore)
  })

  describe('Project-Specific Filtering Features', () => {
    it('should show all projects when filter is set to "all"', () => {
      projectsLogic.filterMode = 'all'
      expect(projectsLogic.filteredProjects.length).toBe(3)
    })

    it('should filter to show only enabled projects', () => {
      projectsLogic.filterMode = 'enabled'
      const filtered = projectsLogic.filteredProjects
      expect(filtered.every(p => p.is_enabled)).toBe(true)
    })
  })

  describe('Project Status Updates', () => {
    it('should update project enabled status and show messages', async () => {
      const project = mockProjects[0]!

      await projectsLogic.updateProjectStatus(project, 'is_enabled', false)

      expect(loadingStore.show).toHaveBeenCalledWith('Updating...')
      expect(projectStore.setProjectEnabled).toHaveBeenCalledWith(project.id, false)
      expect(errorStore.addMessage).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('disabled')
      )
      expect(loadingStore.hide).toHaveBeenCalled()
    })

    it('should handle status update errors', async () => {
      const project = mockProjects[0]!

      vi.mocked(projectStore.setProjectEnabled).mockRejectedValue(new Error('Update failed'))

      await expect(projectsLogic.updateProjectStatus(project, 'is_enabled', false)).rejects.toThrow(
        'Update failed'
      )

      expect(errorStore.addMessage).toHaveBeenCalledWith(
        'error',
        'Failed to update project status. Please try again.'
      )
      expect(loadingStore.hide).toHaveBeenCalled()
    })
  })

  describe('Project Deletion', () => {
    it('should delete project when confirmed', async () => {
      const project = mockProjects[0]!

      vi.mocked(deleteStore.trigger).mockResolvedValue('delete')

      await projectsLogic.handleDeleteProject(project)

      expect(loadingStore.show).toHaveBeenCalledWith('Deleting...')
      expect(projectStore.deleteProject).toHaveBeenCalledWith(project.id)
      expect(errorStore.addMessage).toHaveBeenCalledWith('info', 'Project deleted successfully.')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch all projects for most filters', async () => {
      projectsLogic.filterMode = 'all'
      await projectsLogic.fetchProjects()

      expect(projectStore.fetchProjects).toHaveBeenCalled()
      expect(errorStore.addMessage).toHaveBeenCalledWith('info', expect.any(String))
    })
  })
})
