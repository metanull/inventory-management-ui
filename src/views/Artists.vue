<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Artists</h1>
      <router-link
        to="/artists/new"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Add Artist
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading artists...</p>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchArtists" />

    <!-- Empty State -->
    <div v-else-if="artists.length === 0" class="text-center py-8">
      <p class="text-gray-500">No artists found.</p>
    </div>

    <!-- Artists Grid -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="artist in artists"
        :key="artist.id"
        class="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ artist.name }}</h3>
          <div class="flex space-x-2">
            <router-link
              :to="`/artists/${artist.id}`"
              class="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <router-link
              :to="`/artists/${artist.id}/edit`"
              class="text-green-600 hover:text-green-800"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </router-link>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <p><span class="font-medium">Internal Name:</span> {{ artist.internal_name }}</p>
          <p v-if="artist.place_of_birth">
            <span class="font-medium">Birth Place:</span> {{ artist.place_of_birth }}
          </p>
          <p v-if="artist.date_of_birth">
            <span class="font-medium">Birth Date:</span> {{ artist.date_of_birth }}
          </p>
          <p v-if="artist.place_of_death">
            <span class="font-medium">Death Place:</span> {{ artist.place_of_death }}
          </p>
          <p v-if="artist.date_of_death">
            <span class="font-medium">Death Date:</span> {{ artist.date_of_death }}
          </p>
          <p v-if="artist.period_of_activity">
            <span class="font-medium">Period:</span> {{ artist.period_of_activity }}
          </p>
          <p><span class="font-medium">Created:</span> {{ formatDate(artist.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { apiClient, type ArtistResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const artists = ref<ArtistResource[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchArtists = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getArtists()
      artists.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch artists'
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(fetchArtists)
</script>
