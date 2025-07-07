<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/available-images"
          class="text-blue-600 hover:text-blue-800"
          title="Back to Available Images"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Available Image' : 'Available Image Details' }}
        </h1>
      </div>
      <div v-if="!isEditing" class="flex space-x-2">
        <button
          class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          @click="downloadImage"
        >
          Download
        </button>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          @click="startEditing"
        >
          Edit
        </button>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          @click="deleteAvailableImage"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchAvailableImage" />

    <!-- Form -->
    <div v-else-if="isEditing" class="bg-white p-6 rounded-lg shadow">
      <form class="space-y-4" @submit.prevent="saveAvailableImage">
        <div>
          <label for="comment" class="block text-sm font-medium text-gray-700">Comment</label>
          <textarea
            id="comment"
            v-model="form.comment"
            rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a comment about this image..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>

    <!-- View Mode -->
    <div v-else class="bg-white p-6 rounded-lg shadow space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-500">Path</label>
          <p class="mt-1 text-sm text-gray-900">{{ availableImage?.path || 'N/A' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Comment</label>
          <p class="mt-1 text-sm text-gray-900">{{ availableImage?.comment || 'N/A' }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Created</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(availableImage?.created_at) }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Updated</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(availableImage?.updated_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { apiClient, type AvailableImageResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const route = useRoute()
  const router = useRouter()

  const availableImage = ref<AvailableImageResource | null>(null)
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const isEditing = ref(false)

  const imageId = computed(() => route.params.id as string)

  const form = ref({
    comment: '',
  })

  const fetchAvailableImage = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getAvailableImage(imageId.value)
      availableImage.value = response.data
      form.value = {
        comment: response.data.comment || '',
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch available image'
    } finally {
      loading.value = false
    }
  }

  const startEditing = () => {
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
    if (availableImage.value) {
      form.value = {
        comment: availableImage.value.comment || '',
      }
    }
  }

  const saveAvailableImage = async () => {
    try {
      saving.value = true
      error.value = null

      const response = await apiClient.updateAvailableImage(imageId.value, form.value)
      availableImage.value = response.data
      isEditing.value = false
    } catch (err: any) {
      error.value = err.message || 'Failed to save available image'
    } finally {
      saving.value = false
    }
  }

  const deleteAvailableImage = async () => {
    if (!confirm('Are you sure you want to delete this available image?')) return

    try {
      await apiClient.deleteAvailableImage(imageId.value)
      router.push('/available-images')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete available image'
    }
  }

  const downloadImage = async () => {
    try {
      const response = await apiClient.downloadAvailableImage(imageId.value)
      // Create a downloadable link
      const blob = new Blob([response], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${imageId.value}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      error.value = err.message || 'Failed to download image'
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(fetchAvailableImage)
</script>
