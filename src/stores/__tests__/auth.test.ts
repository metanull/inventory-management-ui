import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '../auth'

// 1. Mock the API client BEFORE any imports that might use it
// We use a regular function because arrow functions cannot be constructors (new)
const mockApiInstance = {
  tokenAcquire: vi.fn(),
  tokenWipe: vi.fn(),
}

vi.mock('@metanull/inventory-app-api-client', () => ({
  MobileAppAuthenticationApi: vi.fn(function () {
    return mockApiInstance
  }),
  Configuration: vi.fn(function () {
    // No-op constructor
  }),
}))

// 2. Setup Spies for localStorage
const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
const getItemSpy = vi.spyOn(Storage.prototype, 'getItem')

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    // Reset all mocks to ensure test isolation
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // Default localStorage behavior for initial state
    getItemSpy.mockReturnValue(null)

    // 3. Initialize Testing Pinia
    createTestingPinia({
      createSpy: vi.fn,
      stubActions: false, // Essential: allows the store's real login/logout logic to run
      initialState: {
        auth: {
          token: null,
          loading: false,
          error: null,
        },
      },
    })

    authStore = useAuthStore()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(authStore.token).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should be authenticated when token exists', () => {
      authStore.token = 'test-token'
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockToken = 'new-auth-token'
      const mockResponse = { data: { token: mockToken, user: {} } }

      mockApiInstance.tokenAcquire.mockResolvedValueOnce(mockResponse)

      await authStore.login('test@example.com', 'password')

      // Verify API call
      expect(mockApiInstance.tokenAcquire).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password',
          device_name: 'Inventory Management UI',
          wipe_tokens: true,
        })
      )

      // Verify State updates
      expect(authStore.token).toBe(mockToken)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()

      // Verify Persistence
      expect(setItemSpy).toHaveBeenCalledWith('auth_token', mockToken)
    })

    it('should handle login error', async () => {
      const errorMessage = 'Invalid credentials'
      const mockError = {
        response: {
          data: {
            message: errorMessage,
          },
        },
      }

      mockApiInstance.tokenAcquire.mockRejectedValueOnce(mockError)

      // Based on your stderr, the store throws an error when error.value is set
      await expect(authStore.login('test@example.com', 'wrong-password')).rejects.toThrow(
        errorMessage
      )

      expect(authStore.token).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBe(errorMessage)
      expect(setItemSpy).not.toHaveBeenCalled()
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      authStore.token = 'existing-token'
    })

    it('should logout successfully', async () => {
      mockApiInstance.tokenWipe.mockResolvedValueOnce(undefined)

      await authStore.logout()

      expect(mockApiInstance.tokenWipe).toHaveBeenCalled()
      expect(authStore.token).toBeNull()
      expect(authStore.error).toBeNull()
      expect(removeItemSpy).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('Error Management', () => {
    it('should clear error', () => {
      authStore.error = 'Some error'
      authStore.clearError()
      expect(authStore.error).toBeNull()
    })
  })
})
