import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, type AuthorResource } from '@/api/client'

export const useAuthorStore = defineStore('author', () => {
  const authors = ref<AuthorResource[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAuthors() {
    loading.value = true
    error.value = null
    try {
      const res = await apiClient.getAuthors()
      authors.value = res.data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch authors.'
    } finally {
      loading.value = false
    }
  }

  async function createAuthor(data: Partial<AuthorResource>) {
    return apiClient.createAuthor(data)
  }

  async function updateAuthor(id: string, data: Partial<AuthorResource>) {
    return apiClient.updateAuthor(id, data)
  }

  async function deleteAuthor(id: string) {
    return apiClient.deleteAuthor(id)
  }

  return { authors, loading, error, fetchAuthors, createAuthor, updateAuthor, deleteAuthor }
})
