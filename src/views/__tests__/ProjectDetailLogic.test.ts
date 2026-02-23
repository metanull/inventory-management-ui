import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { useProjectStore } from '@/stores/project'
import { useContextStore } from '@/stores/context'
import { useLanguageStore } from '@/stores/language'
import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
import { useErrorDisplayStore } from '@/stores/errorDisplay'
import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
import { createMockProject } from '@/__tests__/test-utils'
import type {
  ProjectResource,
  ContextResource,
  LanguageResource,
} from '@metanull/inventory-app-api-client'

// --- Mock console to suppress output during tests ---
const originalConsole = { ...console }
beforeAll(() => {
  console.error = vi.fn()
  console.warn = vi.fn()
  console.log = vi.fn()
})

afterAll(() => {
  Object.assign(console, originalConsole)
})

// --- Test Data ---
const mockProject: ProjectResource = createMockProject({
  id: '123',
  internal_name: 'Test Project',
  backward_compatibility: 'test-project',
  launch_date: '2023-12-01T00:00:00Z',
  is_enabled: true,
  is_launched: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-02-01T00:00:00Z',
  context: {
    id: 'ctx-1',
    internal_name: 'Test Context',
  } as ContextResource,
  language: {
    id: 'lang-1',
    internal_name: 'English',
  } as LanguageResource,
})

const mockContexts: ContextResource[] = [
  {
    id: 'ctx-1',
    internal_name: 'Test Context',
    backward_compatibility: null,
    is_default: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]

const mockLanguages: LanguageResource[] = [
  {
    id: 'lang-1',
    internal_name: 'English',
    backward_compatibility: null,
    is_default: true,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]

interface ProjectFormData {
  internal_name: string
  backward_compatibility: string
  launch_date: string
  context_id: string
  language_id: string
}

/**
 * Business logic class simulating the component behavior
 */
class ProjectDetailLogic {
  public mode: 'view' | 'edit' | 'create' = 'view'
  public editForm: ProjectFormData = {
    internal_name: '',
    backward_compatibility: '',
    launch_date: '',
    context_id: '',
    language_id: '',
  }

  constructor(
    private projectStore: ReturnType<typeof useProjectStore>,
    private contextStore: ReturnType<typeof useContextStore>,
    private languageStore: ReturnType<typeof useLanguageStore>,
    private loadingStore: ReturnType<typeof useLoadingOverlayStore>,
    private errorStore: ReturnType<typeof useErrorDisplayStore>,
    private deleteStore: ReturnType<typeof useDeleteConfirmationStore>
  ) {}

  get project() {
    return this.projectStore.currentEntry
  }
  get contexts() {
    return this.contextStore.contexts
  }
  get languages() {
    return this.languageStore.category
  }
  get defaultContext() {
    return this.contextStore.defaultContext
  }
  get defaultLanguage() {
    return this.languageStore.defaultLanguage
  }

  get hasUnsavedChanges(): boolean {
    if (this.mode === 'view') return false
    if (this.mode === 'create') {
      const defaults = this.getDefaultFormValues()
      return JSON.stringify(this.editForm) !== JSON.stringify(defaults)
    }
    if (!this.project) return false
    const original = this.getFormValuesFromProject()
    return JSON.stringify(this.editForm) !== JSON.stringify(original)
  }

  get statusCardsConfig() {
    if (!this.project) return []
    return [
      {
        title: 'Status',
        statusText: this.project.is_enabled ? 'Enabled' : 'Disabled',
        isActive: this.project.is_enabled,
        disabled: false,
      },
      {
        title: 'Launch Status',
        statusText: this.project.is_launched ? 'Launched' : 'Not Launched',
        isActive: this.project.is_launched,
        disabled: !this.project.is_enabled,
      },
    ]
  }

  private getDefaultFormValues(): ProjectFormData {
    return {
      internal_name: '',
      backward_compatibility: '',
      launch_date: '',
      context_id: this.defaultContext?.id || '',
      language_id: this.defaultLanguage?.id || '',
    }
  }

  private getFormValuesFromProject(): ProjectFormData {
    if (!this.project) return this.getDefaultFormValues()
    return {
      internal_name: this.project.internal_name,
      backward_compatibility: this.project.backward_compatibility || '',
      launch_date: this.project.launch_date?.split('T')[0] || '',
      context_id: this.project.context?.id || '',
      language_id: this.project.language?.id || '',
    }
  }

  enterCreateMode() {
    this.mode = 'create'
    this.editForm = this.getDefaultFormValues()
  }

  enterEditMode() {
    if (this.project) {
      this.mode = 'edit'
      this.editForm = this.getFormValuesFromProject()
    }
  }

  enterViewMode() {
    this.mode = 'view'
    this.editForm = this.getDefaultFormValues()
  }

  async saveProject() {
    this.loadingStore.show('Saving...')
    try {
      const projectData = {
        ...this.editForm,
        backward_compatibility: this.editForm.backward_compatibility || null,
        launch_date: this.editForm.launch_date || null,
      }

      if (this.mode === 'create') {
        const newProject = await this.projectStore.createProject(projectData)

        // FIX: Guard against null before accessing 'id'
        if (!newProject?.id) {
          throw new Error('Project creation failed: No ID returned.')
        }

        await this.projectStore.fetchProject(newProject.id)
        this.enterViewMode()
        return { success: true, projectId: newProject.id }
      }

      if (this.mode === 'edit' && this.project) {
        await this.projectStore.updateProject(this.project.id, projectData)
        this.enterViewMode()
        return { success: true, projectId: this.project.id }
      }

      return { success: false }
    } catch (error) {
      this.errorStore.addMessage('error', 'Failed to save project.')
      throw error
    } finally {
      this.loadingStore.hide()
    }
  }

  async handleStatusToggle(index: number) {
    if (!this.project) return
    this.loadingStore.show('Updating...')
    try {
      if (index === 0) {
        await this.projectStore.setProjectEnabled(this.project.id, !this.project.is_enabled)
      } else if (index === 1) {
        await this.projectStore.setProjectLaunched(this.project.id, !this.project.is_launched)
      }
    } finally {
      this.loadingStore.hide()
    }
  }

  async deleteProject() {
    if (!this.project?.id) return { navigateToList: false }
    const result = await this.deleteStore.trigger('Delete Project', 'Confirm?')
    if (result === 'delete') {
      await this.projectStore.deleteProject(this.project.id)
      return { navigateToList: true }
    }
    return { navigateToList: false }
  }

  async initializeComponent(projectId?: string, isCreateRoute?: boolean) {
    if (isCreateRoute) {
      this.projectStore.clearProjects()
      await Promise.all([this.contextStore.fetchContexts(), this.languageStore.fetchLanguages()])
      this.enterCreateMode()
    } else if (projectId) {
      await Promise.all([
        this.projectStore.fetchProject(projectId),
        this.contextStore.fetchContexts(),
        this.languageStore.fetchLanguages(),
      ])
      this.enterViewMode()
    }
  }
}

// --- Test Suite ---
describe('ProjectDetail Component Business Logic', () => {
  let projectDetailLogic: ProjectDetailLogic

  // Strongly typed store instances
  let projectStore: ReturnType<typeof useProjectStore>
  let contextStore: ReturnType<typeof useContextStore>
  let languageStore: ReturnType<typeof useLanguageStore>
  let loadingStore: ReturnType<typeof useLoadingOverlayStore>
  let errorStore: ReturnType<typeof useErrorDisplayStore>
  let deleteStore: ReturnType<typeof useDeleteConfirmationStore>

  beforeEach(() => {
    // Initialize Pinia and set as active instance
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    })
    setActivePinia(pinia)

    // Access typed stores from active Pinia
    projectStore = useProjectStore()
    contextStore = useContextStore()
    languageStore = useLanguageStore()
    loadingStore = useLoadingOverlayStore()
    errorStore = useErrorDisplayStore()
    deleteStore = useDeleteConfirmationStore()

    // Setup Initial Mock State
    projectStore.currentEntry = mockProject
    contextStore.contexts = mockContexts
    Object.defineProperty(contextStore, 'defaultContext', { get: () => mockContexts[0] })
    languageStore.category = mockLanguages
    Object.defineProperty(languageStore, 'defaultLanguage', { get: () => mockLanguages[0] })

    // Instantiate logic with strictly typed stores
    projectDetailLogic = new ProjectDetailLogic(
      projectStore,
      contextStore,
      languageStore,
      loadingStore,
      errorStore,
      deleteStore
    )
  })

  describe('Mode Management', () => {
    it('should initialize in view mode', () => {
      expect(projectDetailLogic.mode).toBe('view')
    })

    it('should transition to create mode with default form values', () => {
      projectDetailLogic.enterCreateMode()
      expect(projectDetailLogic.mode).toBe('create')
      expect(projectDetailLogic.editForm.context_id).toBe('ctx-1')
    })

    it('should transition to edit mode with project data', () => {
      projectDetailLogic.enterEditMode()
      expect(projectDetailLogic.mode).toBe('edit')
      expect(projectDetailLogic.editForm.internal_name).toBe('Test Project')
      expect(projectDetailLogic.editForm.launch_date).toBe('2023-12-01')
    })
  })

  describe('Unsaved Changes Detection', () => {
    it('should detect changes in edit mode', () => {
      projectDetailLogic.enterEditMode()
      expect(projectDetailLogic.hasUnsavedChanges).toBe(false)
      projectDetailLogic.editForm.internal_name = 'Modified Project'
      expect(projectDetailLogic.hasUnsavedChanges).toBe(true)
    })
  })

  describe('Save Operations', () => {
    it('should create new project successfully', async () => {
      const newProject = { ...mockProject, id: 'new-123' }

      // vi.mocked provides type safety for mock implementations
      vi.mocked(projectStore.createProject).mockResolvedValue(newProject)
      vi.mocked(projectStore.fetchProject).mockResolvedValue(newProject)

      projectDetailLogic.enterCreateMode()
      projectDetailLogic.editForm.internal_name = 'New Project'

      const result = await projectDetailLogic.saveProject()

      expect(result.success).toBe(true)
      expect(projectStore.createProject).toHaveBeenCalled()
      expect(projectStore.fetchProject).toHaveBeenCalledWith('new-123')
      expect(projectDetailLogic.mode).toBe('view')
    })

    it('should handle save error', async () => {
      vi.mocked(projectStore.updateProject).mockRejectedValue(new Error('Update failed'))
      projectDetailLogic.enterEditMode()

      await expect(projectDetailLogic.saveProject()).rejects.toThrow('Update failed')
      expect(errorStore.addMessage).toHaveBeenCalledWith('error', expect.any(String))
    })
  })

  describe('Status Operations', () => {
    it('should toggle enabled status', async () => {
      await projectDetailLogic.handleStatusToggle(0)
      expect(projectStore.setProjectEnabled).toHaveBeenCalledWith('123', false)
    })
  })

  describe('Delete Operations', () => {
    it('should delete project when confirmed', async () => {
      vi.mocked(deleteStore.trigger).mockResolvedValue('delete')
      const result = await projectDetailLogic.deleteProject()

      expect(projectStore.deleteProject).toHaveBeenCalledWith('123')
      expect(result.navigateToList).toBe(true)
    })
  })

  describe('Initialization', () => {
    it('should initialize for create mode', async () => {
      await projectDetailLogic.initializeComponent(undefined, true)
      expect(projectStore.clearProjects).toHaveBeenCalled()
      expect(projectDetailLogic.mode).toBe('create')
    })
  })
})
