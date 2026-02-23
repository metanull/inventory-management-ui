import { beforeEach, describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
import Projects from '../Projects.vue'
import { useProjectStore } from '@/stores/project'
import { createMockProject } from '@/__tests__/test-utils'
import type { ProjectResource } from '@metanull/inventory-app-api-client'
import type { Router } from 'vue-router'

// Mock console to avoid noise
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

interface ProjectsComponentInstance {
  projects: ProjectResource[]
  filteredProjects: ProjectResource[]
  filterMode: 'all' | 'enabled' | 'disabled' | 'launched' // Refined from string
  searchQuery: string
  sortDirection: 'asc' | 'desc'
  sortKey: string
  handleSort: (field: string) => void
  openProjectDetail: (id: string) => void
  updateProjectStatus: (project: ProjectResource, field: string, val: boolean) => Promise<void>
  handleDeleteProject: (project: ProjectResource) => Promise<void>
  fetchProjects: () => Promise<void>
}

const mockProjects: ProjectResource[] = [
  createMockProject({
    id: '1',
    internal_name: 'Active Project',
    is_enabled: true,
    is_launched: true,
  }),
  createMockProject({
    id: '2',
    internal_name: 'Disabled Project',
    is_enabled: false,
    is_launched: false,
  }),
  createMockProject({
    id: '3',
    internal_name: 'Enabled Not Launched',
    is_enabled: true,
    is_launched: false,
  }),
]

describe('Projects.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/projects', component: Projects },
        { path: '/projects/:id', component: { template: '<div>Detail</div>' } },
      ],
    })
  })

  const createWrapper = (initialState: Record<string, unknown> = {}): VueWrapper => {
    return mount(Projects, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              project: {
                category: mockProjects,
                pageLinks: {},
                pageMeta: {
                  total: 3,
                  links: [{ url: '/?page=1', label: '1', active: true }],
                },
                ...initialState,
              },
            },
          }),
          router,
        ],
      },
    })
  }

  describe('Component Logic', () => {
    it('should initialize with default values', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      expect(vm.filterMode).toBe('all')
      expect(vm.sortKey).toBe('internal_name')
    })

    it('should have access to store data', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      expect(vm.projects.length).toBe(3)
    })
  })

  describe('Filter Functionality', () => {
    it('should filter projects when "Enabled" filter is selected', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      vm.filterMode = 'enabled'
      await wrapper.vm.$nextTick()
      expect(vm.filteredProjects.every((p: ProjectResource) => p.is_enabled)).toBe(true)
    })
  })

  describe('Search Functionality', () => {
    it('should search projects by internal name', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      vm.searchQuery = 'Active'
      await wrapper.vm.$nextTick()
      expect(vm.filteredProjects).toHaveLength(1)
      expect(vm.filteredProjects[0]!.internal_name).toBe('Active Project')
    })
  })

  describe('Sorting Functionality', () => {
    it('should toggle sort direction when clicking same header', async () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm as unknown as ProjectsComponentInstance
      await vm.handleSort('internal_name')
      expect(vm.sortDirection).toBe('desc')
    })
  })

  describe('Data Fetching', () => {
    it('should fetch projects on mount', async () => {
      createWrapper()
      const store = useProjectStore()
      await flushPromises()
      expect(store.fetchProjects).toHaveBeenCalled()
    })
  })

  describe('Navigation Actions', () => {
    it('should navigate to project detail when row is clicked', async () => {
      const wrapper = createWrapper()
      const pushSpy = vi.spyOn(router, 'push')

      const targetRow = wrapper
        .findAllComponents({ name: 'TableRow' })
        .find((w: VueWrapper) => w.text().includes('Active Project'))

      if (!targetRow) {
        throw new Error('Could not find TableRow containing "Active Project"')
      }

      await targetRow.trigger('click')

      expect(pushSpy).toHaveBeenCalledWith('/projects/1')
    })
  })
})
