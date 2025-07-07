import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, type DetailResource } from '@/api/client'

export const useDetailStore = defineStore('detail', () => {
  const details = ref<DetailResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDetails() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.getDetails()
      details.value = res.data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch details.'
    } finally {
      loading.value = false
    }
  }

  async function createDetail(data: Partial<DetailResource>) {
    return apiClient.createDetail(data)
  }

  async function updateDetail(id: string, data: Partial<DetailResource>) {
    return apiClient.updateDetail(id, data)
  }

  async function deleteDetail(id: string) {
    return apiClient.deleteDetail(id)
  }

  return { details, loading, error, fetchDetails, createDetail, updateDetail, deleteDetail }
})
