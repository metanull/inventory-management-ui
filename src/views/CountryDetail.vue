<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation -->
    <div class="mb-6">
      <button
        data-testid="back-to-countries-button"
        class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        @click="router.push('/countries')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Countries
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="countryStore.loading" class="flex justify-center items-center py-8">
      <div class="flex items-center gap-2">
        <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-gray-600">Loading country details...</span>
      </div>
    </div>

    <!-- Country Detail -->
    <div v-else-if="countryStore.currentCountry" class="space-y-6">
      <!-- Header with actions -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {{ countryStore.currentCountry.internal_name }}
            <span class="text-lg text-gray-500 font-normal">
              ({{ countryStore.currentCountry.id }})
            </span>
          </h1>
          <p class="text-gray-600 mt-2">Country details and information</p>
        </div>

        <div class="flex gap-3">
          <button
            data-testid="edit-country-button"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            @click="openEditModal"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
            Edit Country
          </button>

          <button
            data-testid="delete-country-button"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            @click="openDeleteModal"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Delete Country
          </button>
        </div>
      </div>

      <!-- Country Information -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Country Information</h2>

        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Country ID</dt>
            <dd class="mt-1 text-sm text-gray-900 font-mono">
              {{ countryStore.currentCountry.id }}
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ countryStore.currentCountry.internal_name }}
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Backward Compatibility</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <span v-if="countryStore.currentCountry.backward_compatibility" class="font-mono">
                {{ countryStore.currentCountry.backward_compatibility }}
              </span>
              <span v-else class="text-gray-400 italic">Not set</span>
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Created At</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ formatDateTime(countryStore.currentCountry.created_at) }}
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {{ formatDateTime(countryStore.currentCountry.updated_at) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- ISO Standards Information -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-lg font-medium text-blue-900 mb-4 flex items-center gap-2">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          ISO Standards
        </h2>

        <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-blue-700">ISO 3166-1 alpha-3</dt>
            <dd class="mt-1 text-sm text-blue-900 font-mono">
              {{ countryStore.currentCountry.id }}
            </dd>
            <dd class="text-xs text-blue-600">Current country code (3 letters)</dd>
          </div>

          <div v-if="countryStore.currentCountry.backward_compatibility">
            <dt class="text-sm font-medium text-blue-700">ISO 3166-1 alpha-2</dt>
            <dd class="mt-1 text-sm text-blue-900 font-mono">
              {{ countryStore.currentCountry.backward_compatibility }}
            </dd>
            <dd class="text-xs text-blue-600">Legacy country code (2 letters)</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="countryStore.error" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Country not found</h3>
      <p class="mt-1 text-sm text-gray-500">The requested country could not be loaded.</p>
      <div class="mt-6">
        <button
          data-testid="back-to-countries-button"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          @click="router.push('/countries')"
        >
          Back to Countries
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <ErrorDisplay />

    <!-- Country Form Modal -->
    <CountryForm
      :is-visible="isEditModalVisible"
      :country="countryStore.currentCountry"
      @close="closeEditModal"
      @success="handleCountryUpdate"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalVisible"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <svg
            class="mx-auto mb-4 h-12 w-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Country</h3>
          <p class="text-sm text-gray-500 mb-4">
            Are you sure you want to delete the country "{{
              countryStore.currentCountry?.internal_name
            }}"? This action cannot be undone.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              data-testid="cancel-delete-button"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              data-testid="confirm-delete-button"
              type="button"
              :disabled="countryStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              @click="confirmDelete"
            >
              <svg
                v-if="countryStore.loading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useCountryStore } from '@/stores/country'
  import CountryForm from '@/components/CountryForm.vue'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const router = useRouter()
  const route = useRoute()
  const countryStore = useCountryStore()

  // Modal state
  const isEditModalVisible = ref(false)
  const isDeleteModalVisible = ref(false)

  // Methods
  const openEditModal = (): void => {
    isEditModalVisible.value = true
  }

  const closeEditModal = (): void => {
    isEditModalVisible.value = false
  }

  const handleCountryUpdate = async (): Promise<void> => {
    // The country was updated, refresh the current country data
    const countryId = route.params.id as string
    await countryStore.fetchCountry(countryId)
  }

  const openDeleteModal = (): void => {
    isDeleteModalVisible.value = true
  }

  const closeDeleteModal = (): void => {
    isDeleteModalVisible.value = false
  }

  const confirmDelete = async (): Promise<void> => {
    if (countryStore.currentCountry) {
      const success = await countryStore.deleteCountry(countryStore.currentCountry.id)
      if (success) {
        // Navigate back to countries list after successful deletion
        router.push('/countries')
      }
    }
  }

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const loadCountry = async (): Promise<void> => {
    const countryId = route.params.id as string
    if (countryId) {
      await countryStore.fetchCountry(countryId)
    }
  }

  // Watchers
  watch(
    () => route.params.id,
    () => {
      loadCountry()
    }
  )

  // Lifecycle
  onMounted(() => {
    loadCountry()
  })
</script>
