/**
 * Integration Tests for API Client
 *
 * These tests run against a live API server and perform actual HTTP requests.
 * They are designed to test the complete integration between the frontend
 * and backend APIs.
 *
 * IMPORTANT:
 * - These tests require a running API server
 * - They will create, modify, and delete real data
 * - Run these tests against a development/test database only
 * - Tests run sequentially to avoid conflicts
 *
 * To run these tests:
 * npm run test:integration
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { apiClient } from '../client'

// Test configuration
interface ProcessEnv {
  VITE_RUN_DESTRUCTIVE_TESTS?: string
  VITE_API_BASE_URL?: string
  VITE_TEST_EMAIL?: string
  VITE_TEST_PASSWORD?: string
  CI?: string
  NODE_ENV?: string
}

const env = (globalThis as { process?: { env?: ProcessEnv } }).process?.env || {}

const TEST_CONFIG = {
  // Skip integration tests in CI unless explicitly enabled
  SKIP_IN_CI: env.CI === 'true' && env.VITE_RUN_DESTRUCTIVE_TESTS !== 'true',
  // Set to true to run destructive tests (create/update/delete)
  RUN_DESTRUCTIVE_TESTS: env.VITE_RUN_DESTRUCTIVE_TESTS === 'true',
  // API base URL - should point to test environment
  API_BASE_URL: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  // Test user credentials
  TEST_EMAIL: env.VITE_TEST_EMAIL || 'test@example.com',
  TEST_PASSWORD: env.VITE_TEST_PASSWORD || 'password123',
}

// Store created resources for cleanup
const createdResources = {
  countries: [] as string[],
  languages: [] as string[],
  contexts: [] as string[],
  partners: [] as string[],
  items: [] as string[],
  projects: [] as string[],
  tags: [] as string[],
  pictures: [] as string[],
  imageUploads: [] as string[],
}

// Only run integration tests if not in CI environment
if (!TEST_CONFIG.SKIP_IN_CI) {
  describe('API Integration Tests', () => {
    beforeAll(async () => {
      // Skip setup if running in CI
      if (TEST_CONFIG.SKIP_IN_CI) {
        console.log('🚫 Skipping integration tests in CI environment')
        return
      }

      // Authenticate first if credentials are provided
      if (TEST_CONFIG.TEST_EMAIL && TEST_CONFIG.TEST_PASSWORD) {
        try {
          const token = await apiClient.login(
            TEST_CONFIG.TEST_EMAIL,
            TEST_CONFIG.TEST_PASSWORD,
            'integration-test'
          )
          console.log('✅ Authentication successful')

          // Set the token for subsequent requests
          apiClient.setAuthToken(token)
        } catch (error) {
          console.error('❌ Authentication failed:', error)
          throw new Error(
            'Authentication failed. Please check your credentials and ensure the API server is running.'
          )
        }
      }

      // Check if API is accessible by trying to get countries
      try {
        await apiClient.getCountries()
        console.log('✅ API server is accessible')
      } catch (error) {
        console.error('❌ API server is not accessible:', error)
        throw new Error(
          'API server is not accessible. Please ensure the API server is running and authentication is working.'
        )
      }
    })

    // Re-authenticate before each test to ensure we have a valid token
    beforeEach(async () => {
      if (TEST_CONFIG.TEST_EMAIL && TEST_CONFIG.TEST_PASSWORD) {
        // Only re-authenticate if we don't have a token
        if (!apiClient.getAuthToken()) {
          const token = await apiClient.login(
            TEST_CONFIG.TEST_EMAIL,
            TEST_CONFIG.TEST_PASSWORD,
            'integration-test'
          )
          apiClient.setAuthToken(token)
        }
      }
    })

    afterAll(async () => {
      // Cleanup created resources if destructive tests were run
      if (TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
        console.log('🧹 Cleaning up created test resources...')

        // Clean up in reverse order to handle dependencies
        for (const pictureId of createdResources.pictures) {
          try {
            await apiClient.deletePicture(pictureId)
          } catch (error) {
            console.warn(`Failed to cleanup picture ${pictureId}:`, error)
          }
        }

        for (const itemId of createdResources.items) {
          try {
            await apiClient.deleteItem(itemId)
          } catch (error) {
            console.warn(`Failed to cleanup item ${itemId}:`, error)
          }
        }

        for (const tagId of createdResources.tags) {
          try {
            await apiClient.deleteTag(tagId)
          } catch (error) {
            console.warn(`Failed to cleanup tag ${tagId}:`, error)
          }
        }

        for (const projectId of createdResources.projects) {
          try {
            await apiClient.deleteProject(projectId)
          } catch (error) {
            console.warn(`Failed to cleanup project ${projectId}:`, error)
          }
        }

        for (const partnerId of createdResources.partners) {
          try {
            await apiClient.deletePartner(partnerId)
          } catch (error) {
            console.warn(`Failed to cleanup partner ${partnerId}:`, error)
          }
        }

        for (const contextId of createdResources.contexts) {
          try {
            await apiClient.deleteContext(contextId)
          } catch (error) {
            console.warn(`Failed to cleanup context ${contextId}:`, error)
          }
        }

        for (const languageId of createdResources.languages) {
          try {
            await apiClient.deleteLanguage(languageId)
          } catch (error) {
            console.warn(`Failed to cleanup language ${languageId}:`, error)
          }
        }

        for (const countryId of createdResources.countries) {
          try {
            await apiClient.deleteCountry(countryId)
          } catch (error) {
            console.warn(`Failed to cleanup country ${countryId}:`, error)
          }
        }

        console.log('✅ Cleanup completed')
      }
    })

    describe('Countries API', () => {
      test('should get all countries', async () => {
        const response = await apiClient.getCountries()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} countries`)
      })

      test('should create, read, update, and delete a country', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive country tests')
          return
        }

        // Create
        const createData = {
          id: 'TST',
          internal_name: 'Test Country',
          backward_compatibility: null,
        }

        const createResponse = await apiClient.createCountry(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.id).toBe('TST')
        expect(createResponse.data.internal_name).toBe('Test Country')
        createdResources.countries.push(createResponse.data.id)
        console.log('✅ Country created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getCountry('TST')
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe('TST')
        console.log('✅ Country retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Country',
          backward_compatibility: 'TC',
        }

        const updateResponse = await apiClient.updateCountry('TST', updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Country')
        expect(updateResponse.data.backward_compatibility).toBe('TC')
        console.log('✅ Country updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteCountry('TST')
        createdResources.countries = createdResources.countries.filter(id => id !== 'TST')
        console.log('✅ Country deleted: TST')

        // Verify deletion
        try {
          await apiClient.getCountry('TST')
          throw new Error('Country should have been deleted')
        } catch (error: unknown) {
          expect((error as { response?: { status?: number } }).response?.status).toBe(404)
          console.log('✅ Country deletion verified')
        }
      })
    })

    describe('Languages API', () => {
      test('should get all languages', async () => {
        const response = await apiClient.getLanguages()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} languages`)
      })

      test('should create, read, update, and delete a language', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive language tests')
          return
        }

        // Generate unique 3-character ID to avoid conflicts with existing test data
        const uniqueId = `t${Date.now().toString().slice(-2)}`

        // Create
        const createData = {
          id: uniqueId,
          internal_name: 'Test Language',
          backward_compatibility: null,
          is_default: false,
        }

        const createResponse = await apiClient.createLanguage(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.id).toBe(uniqueId)
        expect(createResponse.data.internal_name).toBe('Test Language')
        createdResources.languages.push(createResponse.data.id)
        console.log('✅ Language created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getLanguage(uniqueId)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(uniqueId)
        console.log('✅ Language retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Language',
          backward_compatibility: 'tl',
          is_default: false,
        }

        const updateResponse = await apiClient.updateLanguage(uniqueId, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Language')
        console.log('✅ Language updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteLanguage(uniqueId)
        createdResources.languages = createdResources.languages.filter(id => id !== uniqueId)
        console.log('✅ Language deleted:', uniqueId)
      })

      test('should get default language', async () => {
        try {
          const response = await apiClient.getDefaultLanguage()
          expect(response.data).toBeDefined()
          expect(response.data.is_default).toBe(true)
          console.log('✅ Default language retrieved:', response.data.id)
        } catch (error: unknown) {
          if ((error as { response?: { status?: number } }).response?.status === 404) {
            console.log('ℹ️ No default language found')
          } else {
            throw error
          }
        }
      })

      test('should get English language', async () => {
        try {
          const response = await apiClient.getEnglishLanguage()
          expect(response.data).toBeDefined()
          console.log('✅ English language retrieved:', response.data.id)
        } catch (error: unknown) {
          if ((error as { response?: { status?: number } }).response?.status === 404) {
            console.log('ℹ️ No English language found')
          } else {
            throw error
          }
        }
      })
    })

    describe('Contexts API', () => {
      test('should get all contexts', async () => {
        const response = await apiClient.getContexts()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} contexts`)
      })

      test('should create, read, update, and delete a context', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive context tests')
          return
        }

        // Create
        const createData = {
          internal_name: 'Test Context',
          backward_compatibility: null,
          is_default: false,
        }

        const createResponse = await apiClient.createContext(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Context')
        createdResources.contexts.push(createResponse.data.id)
        console.log('✅ Context created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getContext(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Context retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Context',
          backward_compatibility: 'tc',
          is_default: false,
        }

        const updateResponse = await apiClient.updateContext(createResponse.data.id, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Context')
        console.log('✅ Context updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteContext(createResponse.data.id)
        createdResources.contexts = createdResources.contexts.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Context deleted:', createResponse.data.id)
      })
    })

    describe('Partners API', () => {
      test('should get all partners', async () => {
        const response = await apiClient.getPartners()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} partners`)
      })

      test('should create, read, update, and delete a partner', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive partner tests')
          return
        }

        // Create
        const createData = {
          internal_name: 'Test Museum',
          type: 'museum' as const,
        }

        const createResponse = await apiClient.createPartner(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Museum')
        expect(createResponse.data.type).toBe('museum')
        createdResources.partners.push(createResponse.data.id)
        console.log('✅ Partner created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getPartner(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Partner retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Museum',
          type: 'institution' as const,
        }

        const updateResponse = await apiClient.updatePartner(createResponse.data.id, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Museum')
        expect(updateResponse.data.type).toBe('institution')
        console.log('✅ Partner updated:', updateResponse.data.id)

        // Delete
        await apiClient.deletePartner(createResponse.data.id)
        createdResources.partners = createdResources.partners.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Partner deleted:', createResponse.data.id)
      })
    })

    describe('Items API', () => {
      test('should get all items', async () => {
        const response = await apiClient.getItems()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} items`)
      })

      test('should create, read, update, and delete an item', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive item tests')
          return
        }

        // Create
        const createData = {
          internal_name: 'Test Artifact',
          type: 'object' as const,
        }

        const createResponse = await apiClient.createItem(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Artifact')
        expect(createResponse.data.type).toBe('object')
        createdResources.items.push(createResponse.data.id)
        console.log('✅ Item created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getItem(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Item retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Artifact',
          type: 'monument' as const,
        }

        const updateResponse = await apiClient.updateItem(createResponse.data.id, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Artifact')
        expect(updateResponse.data.type).toBe('monument')
        console.log('✅ Item updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteItem(createResponse.data.id)
        createdResources.items = createdResources.items.filter(id => id !== createResponse.data.id)
        console.log('✅ Item deleted:', createResponse.data.id)
      })
    })

    describe('Projects API', () => {
      test('should get all projects', async () => {
        const response = await apiClient.getProjects()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} projects`)
      })

      test('should get enabled projects', async () => {
        const response = await apiClient.getEnabledProjects()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} enabled projects`)
      })

      test('should create, read, update, and delete a project', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive project tests')
          return
        }

        // Create
        const createData = {
          internal_name: 'Test Project',
          is_enabled: true,
        }

        const createResponse = await apiClient.createProject(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Project')
        expect(createResponse.data.is_enabled).toBe(true)
        createdResources.projects.push(createResponse.data.id)
        console.log('✅ Project created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getProject(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Project retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Project',
          is_enabled: false,
        }

        const updateResponse = await apiClient.updateProject(createResponse.data.id, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Project')
        expect(updateResponse.data.is_enabled).toBe(false)
        console.log('✅ Project updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteProject(createResponse.data.id)
        createdResources.projects = createdResources.projects.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Project deleted:', createResponse.data.id)
      })
    })

    describe('Tags API', () => {
      test('should get all tags', async () => {
        const response = await apiClient.getTags()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} tags`)
      })

      test('should create, read, update, and delete a tag', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive tag tests')
          return
        }

        // Create
        const createData = {
          internal_name: 'Test Tag',
          description: 'A test tag for integration testing',
        }

        const createResponse = await apiClient.createTag(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Tag')
        expect(createResponse.data.description).toBe('A test tag for integration testing')
        createdResources.tags.push(createResponse.data.id)
        console.log('✅ Tag created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getTag(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Tag retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Tag',
          description: 'An updated test tag for integration testing',
        }

        const updateResponse = await apiClient.updateTag(createResponse.data.id, updateData)
        expect(updateResponse.data).toBeDefined()
        expect(updateResponse.data.internal_name).toBe('Updated Test Tag')
        expect(updateResponse.data.description).toBe('An updated test tag for integration testing')
        console.log('✅ Tag updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteTag(createResponse.data.id)
        createdResources.tags = createdResources.tags.filter(id => id !== createResponse.data.id)
        console.log('✅ Tag deleted:', createResponse.data.id)
      })
    })

    describe('Pictures API', () => {
      test('should get all pictures', async () => {
        const response = await apiClient.getPictures()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} pictures`)
      })

      // Note: Picture creation requires file upload, which is complex for integration tests
      // We can add this later if needed with actual file handling
    })

    describe('Image Uploads API', () => {
      test('should get all image uploads', async () => {
        const response = await apiClient.getImageUploads()
        expect(response).toBeDefined()
        expect(response.data).toBeInstanceOf(Array)
        console.log(`📊 Found ${response.data.length} image uploads`)
      })

      // Note: Image upload creation requires file upload, which is complex for integration tests
      // We can add this later if needed with actual file handling
    })

    describe('Authentication API', () => {
      test('should handle logout', async () => {
        if (TEST_CONFIG.TEST_EMAIL && TEST_CONFIG.TEST_PASSWORD) {
          await apiClient.logout()
          console.log('✅ Logout successful')

          // Re-authenticate for remaining tests
          await apiClient.login(
            TEST_CONFIG.TEST_EMAIL,
            TEST_CONFIG.TEST_PASSWORD,
            'integration-test'
          )
          console.log('✅ Re-authentication successful')
        } else {
          console.log('⏭️ Skipping logout test (no credentials provided)')
        }
      })
    })

    describe('Error Handling', () => {
      test('should handle 404 errors gracefully', async () => {
        try {
          await apiClient.getCountry('NONEXISTENT')
          throw new Error('Should have thrown 404 error')
        } catch (error: unknown) {
          expect((error as { response?: { status?: number } }).response?.status).toBe(404)
          console.log('✅ 404 error handled correctly')
        }
      })

      test('should handle validation errors gracefully', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping validation error test')
          return
        }

        try {
          // Try to create country with invalid data
          await apiClient.createCountry({
            id: '', // Invalid: empty ID
            internal_name: '',
            backward_compatibility: null,
          })
          throw new Error('Should have thrown validation error')
        } catch (error: unknown) {
          const axiosError = error as {
            response?: { status?: number; data?: { errors?: unknown } }
          }
          expect(axiosError.response?.status).toBe(422)
          expect(axiosError.response?.data?.errors).toBeDefined()
          console.log('✅ Validation error handled correctly')
        }
      })
    })
  })
} else {
  describe.skip('API Integration Tests', () => {
    test.skip('Integration tests are disabled in CI environment', () => {
      console.log('🚫 Integration tests skipped in CI environment')
    })
  })
}
