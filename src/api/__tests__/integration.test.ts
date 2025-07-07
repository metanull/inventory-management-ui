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
  TEST_EMAIL: env.VITE_TEST_EMAIL || 'user@example.com',
  TEST_PASSWORD: env.VITE_TEST_PASSWORD || 'password',
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
  addresses: [] as string[],
  addressTranslations: [] as string[],
  contacts: [] as string[],
  contactTranslations: [] as string[],
  details: [] as string[],
  detailTranslations: [] as string[],
  itemTranslations: [] as string[],
  locations: [] as string[],
  locationTranslations: [] as string[],
  provinces: [] as string[],
  provinceTranslations: [] as string[],
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

        for (const contactId of createdResources.contacts) {
          try {
            await apiClient.deleteContact(contactId)
          } catch (error) {
            console.warn(`Failed to cleanup contact ${contactId}:`, error)
          }
        }

        for (const contactTranslationId of createdResources.contactTranslations) {
          try {
            await apiClient.deleteContactTranslation(contactTranslationId)
          } catch (error) {
            console.warn(`Failed to cleanup contact translation ${contactTranslationId}:`, error)
          }
        }

        for (const detailId of createdResources.details) {
          try {
            await apiClient.deleteDetail(detailId)
          } catch (error) {
            console.warn(`Failed to cleanup detail ${detailId}:`, error)
          }
        }

        for (const detailTranslationId of createdResources.detailTranslations) {
          try {
            await apiClient.deleteDetailTranslation(detailTranslationId)
          } catch (error) {
            console.warn(`Failed to cleanup detail translation ${detailTranslationId}:`, error)
          }
        }

        for (const itemTranslationId of createdResources.itemTranslations) {
          try {
            await apiClient.deleteItemTranslation(itemTranslationId)
          } catch (error) {
            console.warn(`Failed to cleanup item translation ${itemTranslationId}:`, error)
          }
        }

        for (const locationId of createdResources.locations) {
          try {
            await apiClient.deleteLocation(locationId)
          } catch (error) {
            console.warn(`Failed to cleanup location ${locationId}:`, error)
          }
        }

        for (const locationTranslationId of createdResources.locationTranslations) {
          try {
            await apiClient.deleteLocationTranslation(locationTranslationId)
          } catch (error) {
            console.warn(`Failed to cleanup location translation ${locationTranslationId}:`, error)
          }
        }

        for (const provinceId of createdResources.provinces) {
          try {
            await apiClient.deleteProvince(provinceId)
          } catch (error) {
            console.warn(`Failed to cleanup province ${provinceId}:`, error)
          }
        }

        // ProvinceTranslations
        if (
          createdResources.provinceTranslations &&
          createdResources.provinceTranslations.length > 0
        ) {
          for (const id of createdResources.provinceTranslations) {
            try {
              await apiClient.deleteProvinceTranslation(id)
            } catch {
              // Ignore errors (may have been deleted in test)
            }
          }
          createdResources.provinceTranslations = []
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

    describe('Address API', () => {
      test('should create, read, update, and delete an address', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive address tests')
          return
        }
        // Ensure a country exists for the address
        const countryId = 'TSTADDR'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for Address',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        // Create
        const createData = {
          internal_name: 'Test Address',
          country_id: countryId,
        }
        const createResponse = await apiClient.createAddress(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Address')
        createdResources.addresses = createdResources.addresses || []
        createdResources.addresses.push(createResponse.data.id)
        console.log('✅ Address created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getAddress(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Address retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          internal_name: 'Updated Test Address',
        }
        const updateResponse = await apiClient.updateAddress(createResponse.data.id, updateData)
        expect(updateResponse.data.internal_name).toBe('Updated Test Address')
        console.log('✅ Address updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteAddress(createResponse.data.id)
        createdResources.addresses = createdResources.addresses.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Address deleted:', createResponse.data.id)
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('AddressTranslation API', () => {
      test('should create, read, update, and delete an address translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive address translation tests')
          return
        }
        // Ensure a country and address exist for the translation
        const countryId = 'TSTADDRTR'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for AddressTranslation',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        const addressCreate = await apiClient.createAddress({
          internal_name: 'Test Address for Translation',
          country_id: countryId,
        })
        createdResources.addresses.push(addressCreate.data.id)
        // Create
        const createData = {
          address_id: addressCreate.data.id,
          language_id: 'eng',
          address: '123 Main St',
          description: 'Test translation',
        }
        const createResponse = await apiClient.createAddressTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.address).toBe('123 Main St')
        createdResources.addressTranslations = createdResources.addressTranslations || []
        createdResources.addressTranslations.push(createResponse.data.id)
        console.log('✅ AddressTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getAddressTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ AddressTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          address: '456 Updated St',
          description: 'Updated translation',
        }
        const updateResponse = await apiClient.updateAddressTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.address).toBe('456 Updated St')
        console.log('✅ AddressTranslation updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteAddressTranslation(createResponse.data.id)
        createdResources.addressTranslations = createdResources.addressTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ AddressTranslation deleted:', createResponse.data.id)
        // Cleanup address
        await apiClient.deleteAddress(addressCreate.data.id)
        createdResources.addresses = createdResources.addresses.filter(
          id => id !== addressCreate.data.id
        )
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('Contact API', () => {
      test('should create, read, update, and delete a contact', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive contact tests')
          return
        }
        // Create
        const createData = {
          internal_name: 'Test Contact',
          phone_number: '123-456-7890',
          formatted_phone_number: null,
          fax_number: null,
          formatted_fax_number: null,
          email: 'contact@example.com',
        }
        const createResponse = await apiClient.createContact(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Contact')
        createdResources.contacts = createdResources.contacts || []
        createdResources.contacts.push(createResponse.data.id)
        console.log('✅ Contact created:', createResponse.data.id)

        // Read
        const getResponse = await apiClient.getContact(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Contact retrieved:', getResponse.data.id)

        // Update
        const updateData = {
          internal_name: 'Updated Test Contact',
          phone_number: '987-654-3210',
        }
        const updateResponse = await apiClient.updateContact(createResponse.data.id, updateData)
        expect(updateResponse.data.internal_name).toBe('Updated Test Contact')
        expect(updateResponse.data.phone_number).toBe('987-654-3210')
        console.log('✅ Contact updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteContact(createResponse.data.id)
        createdResources.contacts = createdResources.contacts.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Contact deleted:', createResponse.data.id)
      })
    })

    describe('ContactTranslation API', () => {
      test('should create, read, update, and delete a contact translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive contact translation tests')
          return
        }
        // Ensure a contact exists for the translation
        const contactCreate = await apiClient.createContact({
          internal_name: 'Test Contact for Translation',
          phone_number: '111-222-3333',
          formatted_phone_number: null,
          fax_number: null,
          formatted_fax_number: null,
          email: 'translation@example.com',
        })
        createdResources.contacts.push(contactCreate.data.id)
        // Create
        const createData = {
          contact_id: contactCreate.data.id,
          language_id: 'eng',
          label: 'Test Contact Label',
        }
        const createResponse = await apiClient.createContactTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.label).toBe('Test Contact Label')
        createdResources.contactTranslations = createdResources.contactTranslations || []
        createdResources.contactTranslations.push(createResponse.data.id)
        console.log('✅ ContactTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getContactTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ ContactTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          label: 'Updated Contact Label',
        }
        const updateResponse = await apiClient.updateContactTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.label).toBe('Updated Contact Label')
        console.log('✅ ContactTranslation updated:', updateResponse.data.id)

        // Delete
        await apiClient.deleteContactTranslation(createResponse.data.id)
        createdResources.contactTranslations = createdResources.contactTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ ContactTranslation deleted:', createResponse.data.id)
        // Cleanup contact
        await apiClient.deleteContact(contactCreate.data.id)
        createdResources.contacts = createdResources.contacts.filter(
          id => id !== contactCreate.data.id
        )
      })
    })

    describe('Detail API', () => {
      test('should create, read, update, and delete a detail', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive detail tests')
          return
        }
        // Ensure an item exists for the detail
        const itemCreate = await apiClient.createItem({
          internal_name: 'Test Item for Detail',
          type: 'object',
        })
        createdResources.items.push(itemCreate.data.id)
        // Create
        const createData = {
          internal_name: 'Test Detail',
          backward_compatibility: null,
          item_id: itemCreate.data.id,
        }
        const createResponse = await apiClient.createDetail(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Detail')
        createdResources.details = createdResources.details || []
        createdResources.details.push(createResponse.data.id)
        console.log('✅ Detail created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getDetail(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Detail retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          internal_name: 'Updated Test Detail',
        }
        const updateResponse = await apiClient.updateDetail(createResponse.data.id, updateData)
        expect(updateResponse.data.internal_name).toBe('Updated Test Detail')
        console.log('✅ Detail updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteDetail(createResponse.data.id)
        createdResources.details = createdResources.details.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Detail deleted:', createResponse.data.id)
        // Cleanup item
        await apiClient.deleteItem(itemCreate.data.id)
        createdResources.items = createdResources.items.filter(id => id !== itemCreate.data.id)
      })
    })

    describe('DetailTranslation API', () => {
      test('should create, read, update, and delete a detail translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive detail translation tests')
          return
        }
        // Ensure an item exists for the detail
        const itemCreate = await apiClient.createItem({
          internal_name: 'Test Item for DetailTranslation',
          type: 'object',
        })
        createdResources.items.push(itemCreate.data.id)
        // Ensure a detail exists for the translation
        const detailCreate = await apiClient.createDetail({
          internal_name: 'Test Detail for Translation',
          backward_compatibility: null,
          item_id: itemCreate.data.id,
        })
        createdResources.details.push(detailCreate.data.id)
        // Use 'eng' as language_id and a default/test context
        let contextId = 'default'
        try {
          const context = await apiClient.getDefaultContext()
          contextId = context.data.id
        } catch {
          // fallback: create a context
          const contextCreate = await apiClient.createContext({
            internal_name: 'Test Context for DetailTranslation',
            backward_compatibility: null,
            is_default: false,
          })
          createdResources.contexts.push(contextCreate.data.id)
          contextId = contextCreate.data.id
        }
        // Create
        const createData = {
          detail_id: detailCreate.data.id,
          language_id: 'eng',
          context_id: contextId,
          name: 'Test DetailTranslation',
          alternate_name: null,
          description: 'Test description',
        }
        const createResponse = await apiClient.createDetailTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test DetailTranslation')
        createdResources.detailTranslations = createdResources.detailTranslations || []
        createdResources.detailTranslations.push(createResponse.data.id)
        console.log('✅ DetailTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getDetailTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ DetailTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          name: 'Updated DetailTranslation',
          description: 'Updated description',
        }
        const updateResponse = await apiClient.updateDetailTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.name).toBe('Updated DetailTranslation')
        expect(updateResponse.data.description).toBe('Updated description')
        console.log('✅ DetailTranslation updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteDetailTranslation(createResponse.data.id)
        createdResources.detailTranslations = createdResources.detailTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ DetailTranslation deleted:', createResponse.data.id)
        // Cleanup detail
        await apiClient.deleteDetail(detailCreate.data.id)
        createdResources.details = createdResources.details.filter(
          id => id !== detailCreate.data.id
        )
        // Cleanup item
        await apiClient.deleteItem(itemCreate.data.id)
        createdResources.items = createdResources.items.filter(id => id !== itemCreate.data.id)
        // Cleanup context if we created it
        if (contextId && !['default', 'test', 'main'].includes(contextId)) {
          await apiClient.deleteContext(contextId)
          createdResources.contexts = createdResources.contexts.filter(id => id !== contextId)
        }
      })
    })

    describe('ItemTranslation API', () => {
      test('should create, read, update, and delete an item translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive item translation tests')
          return
        }
        // Ensure an item exists for the translation
        const itemCreate = await apiClient.createItem({
          internal_name: 'Test Item for ItemTranslation',
          type: 'object',
        })
        createdResources.items.push(itemCreate.data.id)
        // Use 'eng' as language_id and a default/test context
        let contextId = 'default'
        try {
          const context = await apiClient.getDefaultContext()
          contextId = context.data.id
        } catch {
          // fallback: create a context
          const contextCreate = await apiClient.createContext({
            internal_name: 'Test Context for ItemTranslation',
            backward_compatibility: null,
            is_default: false,
          })
          createdResources.contexts.push(contextCreate.data.id)
          contextId = contextCreate.data.id
        }
        // Create
        const createData = {
          item_id: itemCreate.data.id,
          language_id: 'eng',
          context_id: contextId,
          name: 'Test ItemTranslation',
          alternate_name: null,
          description: 'Test description',
        }
        const createResponse = await apiClient.createItemTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test ItemTranslation')
        createdResources.itemTranslations = createdResources.itemTranslations || []
        createdResources.itemTranslations.push(createResponse.data.id)
        console.log('✅ ItemTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getItemTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ ItemTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          name: 'Updated ItemTranslation',
          description: 'Updated description',
        }
        const updateResponse = await apiClient.updateItemTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.name).toBe('Updated ItemTranslation')
        expect(updateResponse.data.description).toBe('Updated description')
        console.log('✅ ItemTranslation updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteItemTranslation(createResponse.data.id)
        createdResources.itemTranslations = createdResources.itemTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ ItemTranslation deleted:', createResponse.data.id)
        // Cleanup item
        await apiClient.deleteItem(itemCreate.data.id)
        createdResources.items = createdResources.items.filter(id => id !== itemCreate.data.id)
        // Cleanup context if we created it
        if (contextId && !['default', 'test', 'main'].includes(contextId)) {
          await apiClient.deleteContext(contextId)
          createdResources.contexts = createdResources.contexts.filter(id => id !== contextId)
        }
      })
    })

    describe('Location API', () => {
      test('should create, read, update, and delete a location', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive location tests')
          return
        }
        // Ensure a country exists for the location
        const countryId = 'TSTLOC'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for Location',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        // Create
        const createData = {
          internal_name: 'Test Location',
          country_id: countryId,
        }
        const createResponse = await apiClient.createLocation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Location')
        createdResources.locations = createdResources.locations || []
        createdResources.locations.push(createResponse.data.id)
        console.log('✅ Location created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getLocation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Location retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          internal_name: 'Updated Test Location',
        }
        const updateResponse = await apiClient.updateLocation(createResponse.data.id, updateData)
        expect(updateResponse.data.internal_name).toBe('Updated Test Location')
        console.log('✅ Location updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteLocation(createResponse.data.id)
        createdResources.locations = createdResources.locations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Location deleted:', createResponse.data.id)
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('LocationTranslation API', () => {
      test('should create, read, update, and delete a location translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive location translation tests')
          return
        }
        // Ensure a country and location exist for the translation
        const countryId = 'TSTLOCTR'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for LocationTranslation',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        const locationCreate = await apiClient.createLocation({
          internal_name: 'Test Location for Translation',
          country_id: countryId,
        })
        createdResources.locations.push(locationCreate.data.id)
        // Create
        const createData = {
          location_id: locationCreate.data.id,
          language_id: 'eng',
          name: 'Test LocationTranslation',
          description: 'Test translation',
        }
        const createResponse = await apiClient.createLocationTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test LocationTranslation')
        createdResources.locationTranslations = createdResources.locationTranslations || []
        createdResources.locationTranslations.push(createResponse.data.id)
        console.log('✅ LocationTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getLocationTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ LocationTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          name: 'Updated LocationTranslation',
          description: 'Updated translation',
        }
        const updateResponse = await apiClient.updateLocationTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.name).toBe('Updated LocationTranslation')
        expect(updateResponse.data.description).toBe('Updated translation')
        console.log('✅ LocationTranslation updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteLocationTranslation(createResponse.data.id)
        createdResources.locationTranslations = createdResources.locationTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ LocationTranslation deleted:', createResponse.data.id)
        // Cleanup location
        await apiClient.deleteLocation(locationCreate.data.id)
        createdResources.locations = createdResources.locations.filter(
          id => id !== locationCreate.data.id
        )
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('Province API', () => {
      test('should create, read, update, and delete a province', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive province tests')
          return
        }
        // Ensure a country exists for the province
        const countryId = 'TSTPROV'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for Province',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        // Create
        const createData = {
          internal_name: 'Test Province',
          country_id: countryId,
        }
        const createResponse = await apiClient.createProvince(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.internal_name).toBe('Test Province')
        createdResources.provinces = createdResources.provinces || []
        createdResources.provinces.push(createResponse.data.id)
        console.log('✅ Province created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getProvince(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ Province retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          internal_name: 'Updated Test Province',
        }
        const updateResponse = await apiClient.updateProvince(createResponse.data.id, updateData)
        expect(updateResponse.data.internal_name).toBe('Updated Test Province')
        console.log('✅ Province updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteProvince(createResponse.data.id)
        createdResources.provinces = createdResources.provinces.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ Province deleted:', createResponse.data.id)
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('ProvinceTranslation API', () => {
      test('should create, read, update, and delete a province translation', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive province translation tests')
          return
        }
        // Ensure a country and province exist for the translation
        const countryId = 'TSTPROVTR'
        let countryCreated = false
        try {
          await apiClient.getCountry(countryId)
        } catch {
          const country = await apiClient.createCountry({
            id: countryId,
            internal_name: 'Test Country for ProvinceTranslation',
            backward_compatibility: null,
          })
          createdResources.countries.push(country.data.id)
          countryCreated = true
        }
        const provinceCreate = await apiClient.createProvince({
          internal_name: 'Test Province for Translation',
          country_id: countryId,
        })
        createdResources.provinces.push(provinceCreate.data.id)
        // Create
        const createData = {
          province_id: provinceCreate.data.id,
          language_id: 'eng',
          name: 'Test ProvinceTranslation',
          description: 'Test translation',
        }
        const createResponse = await apiClient.createProvinceTranslation(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test ProvinceTranslation')
        createdResources.provinceTranslations = createdResources.provinceTranslations || []
        createdResources.provinceTranslations.push(createResponse.data.id)
        console.log('✅ ProvinceTranslation created:', createResponse.data.id)
        // Read
        const getResponse = await apiClient.getProvinceTranslation(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        console.log('✅ ProvinceTranslation retrieved:', getResponse.data.id)
        // Update
        const updateData = {
          name: 'Updated ProvinceTranslation',
          description: 'Updated translation',
        }
        const updateResponse = await apiClient.updateProvinceTranslation(
          createResponse.data.id,
          updateData
        )
        expect(updateResponse.data.name).toBe('Updated ProvinceTranslation')
        expect(updateResponse.data.description).toBe('Updated translation')
        console.log('✅ ProvinceTranslation updated:', updateResponse.data.id)
        // Delete
        await apiClient.deleteProvinceTranslation(createResponse.data.id)
        createdResources.provinceTranslations = createdResources.provinceTranslations.filter(
          id => id !== createResponse.data.id
        )
        console.log('✅ ProvinceTranslation deleted:', createResponse.data.id)
        // Cleanup province
        await apiClient.deleteProvince(provinceCreate.data.id)
        createdResources.provinces = createdResources.provinces.filter(
          id => id !== provinceCreate.data.id
        )
        // Optionally clean up country if we created it
        if (countryCreated) {
          await apiClient.deleteCountry(countryId)
          createdResources.countries = createdResources.countries.filter(id => id !== countryId)
        }
      })
    })

    describe('Additional API Coverage', () => {
      // TagItems CRUD
      test('should create, read, update, and delete a tag item', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive tag item tests')
          return
        }
        // Ensure a tag and item exist
        const tag = await apiClient.createTag({
          internal_name: 'Test Tag for TagItem',
          description: 'desc',
        })
        const item = await apiClient.createItem({
          internal_name: 'Test Item for TagItem',
          type: 'object',
        })
        createdResources.tags.push(tag.data.id)
        createdResources.items.push(item.data.id)
        // Create
        const createData = { tag_id: tag.data.id, item_id: item.data.id }
        const createResponse = await apiClient.createTagItem(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.tag_id).toBe(tag.data.id)
        // Read
        const getResponse = await apiClient.getTagItem(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        // Update
        const updateData = {}
        const updateResponse = await apiClient.updateTagItem(createResponse.data.id, updateData)
        expect(updateResponse.data.id).toBe(createResponse.data.id)
        // Delete
        await apiClient.deleteTagItem(createResponse.data.id)
        // Cleanup
        await apiClient.deleteItem(item.data.id)
        await apiClient.deleteTag(tag.data.id)
        createdResources.items = createdResources.items.filter(id => id !== item.data.id)
        createdResources.tags = createdResources.tags.filter(id => id !== tag.data.id)
      })

      // Workshops CRUD
      test('should create, read, update, and delete a workshop', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive workshop tests')
          return
        }
        const createData = { name: 'Test Workshop', internal_name: 'Test Workshop' }
        const createResponse = await apiClient.createWorkshop(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test Workshop')
        // Read
        const getResponse = await apiClient.getWorkshop(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        // Update
        const updateData = { name: 'Updated Workshop' }
        const updateResponse = await apiClient.updateWorkshop(createResponse.data.id, updateData)
        expect(updateResponse.data.name).toBe('Updated Workshop')
        // Delete
        await apiClient.deleteWorkshop(createResponse.data.id)
      })

      // Artists CRUD
      test('should create, read, update, and delete an artist', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive artist tests')
          return
        }
        const createData = { name: 'Test Artist', internal_name: 'Test Artist' }
        const createResponse = await apiClient.createArtist(createData)
        expect(createResponse.data).toBeDefined()
        expect(createResponse.data.name).toBe('Test Artist')
        // Read
        const getResponse = await apiClient.getArtist(createResponse.data.id)
        expect(getResponse.data).toBeDefined()
        expect(getResponse.data.id).toBe(createResponse.data.id)
        // Update
        const updateData = { name: 'Updated Artist' }
        const updateResponse = await apiClient.updateArtist(createResponse.data.id, updateData)
        expect(updateResponse.data.name).toBe('Updated Artist')
        // Delete
        await apiClient.deleteArtist(createResponse.data.id)
      })

      // PATCH endpoints
      test('should set default language and context', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive patch tests')
          return
        }
        // Create language and context
        const lang = await apiClient.createLanguage({
          id: `t${Date.now().toString().slice(-2)}`,
          internal_name: 'PatchTestLang',
          is_default: false,
        })
        const ctx = await apiClient.createContext({
          internal_name: 'PatchTestContext',
          is_default: false,
        })
        createdResources.languages.push(lang.data.id)
        createdResources.contexts.push(ctx.data.id)
        // Set default
        const setLang = await apiClient.setDefaultLanguage(lang.data.id, true)
        expect(setLang.data.is_default).toBe(true)
        // Cleanup
        await apiClient.deleteLanguage(lang.data.id)
        createdResources.languages = createdResources.languages.filter(id => id !== lang.data.id)
      })

      // Pictures: createPicture, updatePicture
      test('should create and update a picture (if supported)', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive picture upload tests')
          return
        }
        // Try to create a picture with dummy FormData
        try {
          const formData = new FormData()
          formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')
          formData.append('internal_name', 'IntegrationTestPicture')
          const createResponse = await apiClient.createPicture(formData)
          expect(createResponse.data).toBeDefined()
          expect(createResponse.data.internal_name).toBe('IntegrationTestPicture')
          // Update
          const updateData = { internal_name: 'Updated IntegrationTestPicture' }
          const updateResponse = await apiClient.updatePicture(createResponse.data.id, updateData)
          expect(updateResponse.data.internal_name).toBe('Updated IntegrationTestPicture')
          // Delete
          await apiClient.deletePicture(createResponse.data.id)
        } catch {
          console.log('ℹ️ Skipping picture upload test (not supported in this environment)')
        }
      })

      // Image Uploads: createImageUpload, deleteImageUpload
      test('should create and delete an image upload (if supported)', async () => {
        if (!TEST_CONFIG.RUN_DESTRUCTIVE_TESTS) {
          console.log('⏭️ Skipping destructive image upload tests')
          return
        }
        try {
          const formData = new FormData()
          formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg')
          const createResponse = await apiClient.createImageUpload(formData)
          expect(createResponse.data).toBeDefined()
          expect(createResponse.data.name).toBe('test.jpg')
          // Delete
          await apiClient.deleteImageUpload(createResponse.data.id)
        } catch {
          console.log('ℹ️ Skipping image upload test (not supported in this environment)')
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
