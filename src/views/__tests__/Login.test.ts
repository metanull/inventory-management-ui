import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../Login.vue'
import { useAuthStore } from '../../stores/auth'

// Create a test router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
  ],
})

const mockPush = vi.fn()

// Mock useRouter
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

// Mock the auth store methods
const mockLogin = vi.fn()
const mockClearError = vi.fn()

vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: mockLogin,
    clearError: mockClearError,
    loading: false,
    error: '',
    isAuthenticated: false,
  })),
}))

describe('Login.vue', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockPush.mockClear()
    await router.push('/login')
  })

  const createWrapper = (authStoreOverrides = {}) => {
    const mockStore = {
      login: mockLogin,
      clearError: mockClearError,
      loading: false,
      error: '',
      isAuthenticated: false,
      ...authStoreOverrides,
    }

    vi.mocked(useAuthStore).mockReturnValue(mockStore as ReturnType<typeof useAuthStore>)

    return mount(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
          router,
        ],
      },
    })
  }

  describe('Rendering', () => {
    it('renders login form correctly', () => {
      const wrapper = createWrapper()

      expect(wrapper.find('h2').text()).toBe('Sign in to your account')
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('shows email and password inputs with correct attributes', () => {
      const wrapper = createWrapper()

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      expect(emailInput.attributes('placeholder')).toBe('Email address')
      expect(passwordInput.attributes('placeholder')).toBe('Password')
    })
  })

  describe('Form Interaction', () => {
    it('calls login when form is submitted with valid data', async () => {
      const wrapper = createWrapper()

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      // Mock successful login
      mockLogin.mockResolvedValueOnce(undefined)

      // Submit the form
      await form.trigger('submit.prevent')

      // Wait for the async login to complete and for Vue to update
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('handles login error gracefully', async () => {
      const wrapper = createWrapper()

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const form = wrapper.find('form')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('wrong-password')

      const loginError = new Error('Login failed')
      mockLogin.mockRejectedValueOnce(loginError)

      await form.trigger('submit.prevent')
      await nextTick()

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrong-password')
    })
  })

  describe('Error Handling', () => {
    it('clears error on component mount', () => {
      createWrapper()
      expect(mockClearError).toHaveBeenCalled()
    })
  })
})
