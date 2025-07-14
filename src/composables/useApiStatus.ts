import { ref, onMounted } from 'vue'
import { Configuration, ContextApi } from '@metanull/inventory-app-api-client'

export function useApiStatus() {
  const isApiUp = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const checkApiStatus = async () => {
    loading.value = true
    error.value = null

    try {
      // Support both Vite (import.meta.env) and Node (process.env) for baseURL
      let baseURL: string
      if (
        typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE_URL
      ) {
        baseURL = import.meta.env.VITE_API_BASE_URL
      } else {
        baseURL = 'http://127.0.0.1:8000/api'
      }

      const config = new Configuration({ basePath: baseURL })
      const contextApi = new ContextApi(config)
      // Simple health check by trying to fetch contexts (should work even without auth)
      await contextApi.contextIndex()

      isApiUp.value = true
    } catch (e) {
      isApiUp.value = false
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    checkApiStatus()
  })

  return {
    isApiUp,
    loading,
    error,
    checkApiStatus,
  }
}
