<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Available Images</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading available images...</p>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchAvailableImages" />

    <!-- Empty State -->
    <div v-else-if="availableImages.length === 0" class="text-center py-8">
      <p class="text-gray-500">No available images found.</p>
    </div>

    <!-- Available Images Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div
        v-for="image in availableImages"
        :key="image.id"
        class="bg-white p-4 rounded-lg shadow border hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-sm font-semibold text-gray-900 truncate">
            {{ image.path || 'No path' }}
          </h3>
          <div class="flex space-x-1">
            <router-link
              :to="`/available-images/${image.id}`"
              class="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </router-link>
            <button
              class="text-green-600 hover:text-green-800"
              title="Download"
              @click="downloadImage(image.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-1 text-xs">
          <p v-if="image.comment" class="text-gray-600">
            <span class="font-medium">Comment:</span> {{ image.comment }}
          </p>
          <p><span class="font-medium">Created:</span> {{ formatDate(image.created_at) }}</p>
          <p v-if="image.updated_at">
            <span class="font-medium">Updated:</span> {{ formatDate(image.updated_at) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { apiClient, type AvailableImageResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const availableImages = ref<AvailableImageResource[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchAvailableImages = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getAvailableImages()
      availableImages.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch available images'
    } finally {
      loading.value = false
    }
  }

  const downloadImage = async (id: string) => {
    try {
      const response = await apiClient.downloadAvailableImage(id)
      // Create a downloadable link
      const blob = new Blob([response], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${id}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error('Failed to download image:', err)
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(fetchAvailableImages)
</script>
