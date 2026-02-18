import { ref, onMounted } from 'vue'
import { Configuration, InfoApi } from '@metanull/inventory-app-api-client'

type InfoVersionData = Awaited<ReturnType<InstanceType<typeof InfoApi>['infoVersion']>>['data']

export function useApiStatus() {
  const isApiUp = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const versionData = ref<InfoVersionData | null>(null)

  const checkApiStatus = async () => {
    loading.value = true
    error.value = null

    try {
      // Use Vite environment variables with a fallback for local development
      const baseURL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

      const config = new Configuration({ basePath: baseURL })
      const infoApi = new InfoApi(config)

      // Execute the request
      const versionResponse = await infoApi.infoVersion()

      // Update state on success
      versionData.value = versionResponse.data
      isApiUp.value = true
    } catch (e) {
      // Reset states on failure
      isApiUp.value = false
      versionData.value = null
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
    versionData,
    checkApiStatus,
  }
}
