import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  MobileAppAuthenticationApi,
  type AcquireTokenMobileAppAuthenticationRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall } from '@/utils/storeFunctions'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const getApi = () => new MobileAppAuthenticationApi(createApiConfig())

  const login = async (email: string, password: string) => {
    const tokenRequest: AcquireTokenMobileAppAuthenticationRequest = {
      email,
      password,
      device_name: 'Inventory Management UI',
      wipe_tokens: true,
    }

    const res = await useApiCall(
      'login',
      () => getApi().tokenAcquire(tokenRequest),
      loading,
      error,
      'Login failed'
    )

    const authToken = res?.data?.token

    if (authToken) {
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
    } else if (res) {
      error.value = 'No token received from authentication'
    }
  }

  const logout = async () => {
    // Clear local state
    await useApiCall(
      'logout',
      () => getApi().tokenWipe(),
      loading,
      error,
      'Logout error'
    )

    token.value = null
    localStorage.removeItem('auth_token')
  }

  return {
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError: () => { error.value = null }
  }
})