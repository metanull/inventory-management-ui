import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, type WorkshopResource } from '@/api/client'

export const useWorkshopStore = defineStore('workshop', () => {
  const workshops = ref<WorkshopResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchWorkshops() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.getWorkshops()
      workshops.value = res.data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch workshops.'
    } finally {
      loading.value = false
    }
  }

  async function createWorkshop(data: Partial<WorkshopResource>) {
    return apiClient.createWorkshop(data)
  }

  async function updateWorkshop(id: string, data: Partial<WorkshopResource>) {
    return apiClient.updateWorkshop(id, data)
  }

  async function deleteWorkshop(id: string) {
    return apiClient.deleteWorkshop(id)
  }

  return {
    workshops,
    loading,
    error,
    fetchWorkshops,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
  }
})
