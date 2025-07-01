import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock the API client before importing the store
vi.mock('@/api/client', () => ({
  apiClient: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

import { useAuthStore } from '../auth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(async () => {
    // Clear all mocks first
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)

    // Setup Pinia
    setActivePinia(createPinia())

    // Import the store after setting up mocks
    const { useAuthStore } = await import('../auth')
    authStore = useAuthStore()
  })

  afterEach(() => {
    vi.resetAllMocks()
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
      const { apiClient } = (await vi.importMock('@/api/client')) as {
        apiClient: { login: ReturnType<typeof vi.fn> }
      }
      apiClient.login.mockResolvedValueOnce(mockToken)

      await authStore.login('test@example.com', 'password')

      expect(apiClient.login).toHaveBeenCalledWith(
        'test@example.com',
        'password',
        'Inventory Management UI'
      )
      expect(authStore.token).toBe(mockToken)
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockToken)
    })

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      }
      const { apiClient } = (await vi.importMock('@/api/client')) as {
        apiClient: { login: ReturnType<typeof vi.fn> }
      }
      apiClient.login.mockRejectedValueOnce(mockError)

      await expect(authStore.login('test@example.com', 'wrong-password')).rejects.toThrow()

      expect(authStore.token).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.error).toBe('Invalid credentials')
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      authStore.token = 'existing-token'
    })

    it('should logout successfully', async () => {
      const { apiClient } = (await vi.importMock('@/api/client')) as {
        apiClient: { logout: ReturnType<typeof vi.fn> }
      }
      apiClient.logout.mockResolvedValueOnce(undefined)

      await authStore.logout()

      expect(apiClient.logout).toHaveBeenCalled()
      expect(authStore.token).toBeNull()
      expect(authStore.error).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
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
