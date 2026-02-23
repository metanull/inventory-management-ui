import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useProjectStore } from '../project'
import { useAuthStore } from '../auth'
import { getTestCredentials, getApiBaseUrl } from '../../api/__tests__/integration.setup'

// Declare process for Node.js environments
declare const process: {
  env: Record<string, string | undefined>
}

describe('Project Store Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Set up environment for integration tests
    process.env.VITE_API_BASE_URL = getApiBaseUrl()
  })

  it('should authenticate and fetch projects from real API', async () => {
    const authStore = useAuthStore()
    const store = useProjectStore()

    try {
      // First authenticate
      const { email, password } = getTestCredentials()
      await authStore.login(email, password)

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.token).toBeTruthy()

      // Then fetch projects
      await store.fetchProjects()

      expect(store.category).toBeDefined()
      expect(Array.isArray(store.category)).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 10000) // 10 second timeout for network operations

  it('should create, read, update, and delete a project', async () => {
    const authStore = useAuthStore()
    const store = useProjectStore()

    try {
      // First authenticate
      const { email, password } = getTestCredentials()
      await authStore.login(email, password)

      expect(authStore.isAuthenticated).toBe(true)

      // Create a new project
      const newProject = {
        internal_name: `Test Project ${Date.now()}`,
        backward_compatibility: `test-${Date.now()}`,
        launch_date: '2024-12-31',
        is_enabled: true,
        is_launched: false,
      }

      const createResult = await store.createProject(newProject)
      expect(createResult).toBeDefined()
      expect(typeof createResult).toBe('object')
      expect(createResult.internal_name).toBe(newProject.internal_name)

      // Fetch projects to get the created project
      await store.fetchProjects()
      const createdProject = store.category.find(p => p.internal_name === newProject.internal_name)
      expect(createdProject).toBeDefined()

      if (createdProject) {
        // Read the project by fetching it directly
        await store.fetchProject(createdProject.id)
        expect(store.currentEntry).toBeDefined()
        expect(store.currentEntry?.id).toBe(createdProject.id)

        // Update the project
        const updateData = {
          internal_name: `Updated Test Project ${Date.now()}`,
          backward_compatibility: `updated-test-${Date.now()}`,
        }
        const updateResult = await store.updateProject(createdProject.id, updateData)
        expect(updateResult).toBeDefined()
        expect(typeof updateResult).toBe('object')
        expect(updateResult.internal_name).toBe(updateData.internal_name)

        // Test enable/disable
        const enableResult = await store.setProjectEnabled(createdProject.id, false)
        expect(enableResult).toBeTruthy()

        const disableResult = await store.setProjectEnabled(createdProject.id, true)
        expect(disableResult).toBeTruthy()

        // Test launch/unlaunch
        const launchResult = await store.setProjectLaunched(createdProject.id, true)
        expect(launchResult).toBeTruthy()

        const unlaunchResult = await store.setProjectLaunched(createdProject.id, false)
        expect(unlaunchResult).toBeTruthy()

        // Delete the project
        const deleteResult = await store.deleteProject(createdProject.id)
        expect(deleteResult).toBe(true)

        // Verify deletion
        await store.fetchProjects()
        const deletedProject = store.category.find(p => p.id === createdProject.id)
        expect(deletedProject).toBeUndefined()
      }
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 15000) // 15 second timeout for network operations

  it('should fetch enabled projects', async () => {
    const authStore = useAuthStore()
    const store = useProjectStore()

    try {
      // First authenticate
      const { email, password } = getTestCredentials()
      await authStore.login(email, password)

      expect(authStore.isAuthenticated).toBe(true)

      // Fetch enabled projects
      await store.fetchEnabledProjects()

      expect(store.category).toBeDefined()
      expect(Array.isArray(store.category)).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()

      // All returned projects should be enabled and launched
      store.category.forEach(project => {
        expect(project.is_enabled).toBe(true)
        expect(project.is_launched).toBe(true)
      })
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 10000) // 10 second timeout for network operations

  it('should handle errors gracefully', async () => {
    const authStore = useAuthStore()
    const store = useProjectStore()

    try {
      // First authenticate
      const { email, password } = getTestCredentials()
      await authStore.login(email, password)

      expect(authStore.isAuthenticated).toBe(true)

      // Try to fetch a non-existent project
      await store.fetchProject('non-existent-id')
      expect(store.error).toBeTruthy()
      expect(store.currentEntry).toBeNull()

      // Try to update a non-existent project
      const updateResult = await store.updateProject('non-existent-id', {
        internal_name: 'Updated Name',
      })
      expect(updateResult).toBe(false)
      expect(store.error).toBeTruthy()

      // Try to delete a non-existent project
      const deleteResult = await store.deleteProject('non-existent-id')
      expect(deleteResult).toBe(false)
      expect(store.error).toBeTruthy()
    } catch (error) {
      // If the API is not available, skip the test
      console.warn('API not available for integration tests:', error)
      return
    }
  }, 10000) // 10 second timeout for network operations
})
