import { Configuration } from '@metanull/inventory-app-api-client'
import { useAuthStore } from '@/stores/auth'
import { ErrorHandler } from '@/utils/errorHandler'
import { ref } from 'vue'

export const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL
  }
  return 'http://127.0.0.1:8000/api'
}

export const createApiConfig = () => {
  const authStore = useAuthStore()
  return new Configuration({
    basePath: getBaseUrl(),
    accessToken: authStore.token || undefined,
  })
}

export async function useApiCall<T>(
  actionName: string,
  apiCall: () => Promise<T>,
  loadingRef: { value: boolean },
  errorRef: { value: string | null },
  errorMessage: string
): Promise<T | null> {
  loadingRef.value = true
  errorRef.value = null
  try {
    return await apiCall()
  } catch (err) {
    errorRef.value = errorMessage
    ErrorHandler.handleError(err, actionName)
    return null
  } finally {
    loadingRef.value = false
  }
}

export function createBaseStoreState<T extends { id: string }>() {
  const category = ref<T[]>([])
  const currentEntry = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const clearError = () => {
    error.value = null
  }
  const clearCurrent = () => {
    currentEntry.value = null
  }

  return { category, currentEntry, loading, error, clearError, clearCurrent }
}
