import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    try {
      const authToken = await apiClient.login(email, password, 'Inventory Management UI')
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      await apiClient.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      localStorage.removeItem('auth_token')
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
  }
})
