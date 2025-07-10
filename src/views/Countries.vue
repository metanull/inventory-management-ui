<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Country Management</h1>
      <p class="text-gray-600">Manage countries available in the inventory system</p>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6 flex justify-between items-center">
      <button
        :disabled="countryStore.loading"
        data-testid="refresh-button"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        @click="refreshCountries"
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
        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
        Refresh
      </button>

      <button
        data-testid="add-country-button"
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        @click="openCreateModal"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        Add Country
      </button>
    </div>

    <!-- Error Display -->
    <ErrorDisplay />

    <!-- Countries Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="country in countryStore.sortedCountries"
        :key="country.id"
        class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">
              {{ country.internal_name }}
            </h3>
            <p class="text-sm text-gray-600 mb-2">ID: {{ country.id }}</p>
            <p v-if="country.backward_compatibility" class="text-xs text-gray-500">
              Legacy: {{ country.backward_compatibility }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
              title="Edit Country"
              @click="openEditModal(country)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
            </button>
            <button
              class="p-2 text-red-600 hover:bg-red-50 rounded-md"
              title="Delete Country"
              @click="openDeleteModal(country)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <button
            data-testid="view-details-button"
            class="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
            @click="viewCountryDetail(country.id)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              ></path>
            </svg>
            View Details
          </button>
          <span class="text-xs text-gray-500">
            {{ formatDate(country.created_at) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!countryStore.loading && countryStore.countries.length === 0"
      class="text-center py-12"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No countries found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new country.</p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          @click="openCreateModal"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Country
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="countryStore.loading" class="flex justify-center items-center py-12">
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
        <span class="text-gray-600">Loading countries...</span>
      </div>
    </div>

    <!-- Country Form Modal -->
    <CountryForm
      :is-visible="isFormModalVisible"
      :country="selectedCountry"
      @close="closeFormModal"
      @success="handleCountrySuccess"
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
            Are you sure you want to delete the country "{{ countryToDelete?.internal_name }}"? This
            action cannot be undone.
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
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { CountryResource } from '@metanull/inventory-app-api-client'
  import { useCountryStore } from '@/stores/country'
  import CountryForm from '@/components/CountryForm.vue'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const router = useRouter()
  const countryStore = useCountryStore()

  // Modal state
  const isFormModalVisible = ref(false)
  const isDeleteModalVisible = ref(false)
  const selectedCountry = ref<CountryResource | null>(null)
  const countryToDelete = ref<CountryResource | null>(null)

  // Methods
  const refreshCountries = async (): Promise<void> => {
    await countryStore.fetchCountries()
  }

  const openCreateModal = (): void => {
    selectedCountry.value = null
    isFormModalVisible.value = true
  }

  const openEditModal = (country: CountryResource): void => {
    selectedCountry.value = country
    isFormModalVisible.value = true
  }

  const closeFormModal = (): void => {
    isFormModalVisible.value = false
    selectedCountry.value = null
  }

  const handleCountrySuccess = async (): Promise<void> => {
    // Refresh the list to ensure we have the latest data
    await refreshCountries()
  }

  const openDeleteModal = (country: CountryResource): void => {
    countryToDelete.value = country
    isDeleteModalVisible.value = true
  }

  const closeDeleteModal = (): void => {
    isDeleteModalVisible.value = false
    countryToDelete.value = null
  }

  const confirmDelete = async (): Promise<void> => {
    if (countryToDelete.value) {
      const success = await countryStore.deleteCountry(countryToDelete.value.id)
      if (success) {
        closeDeleteModal()
      }
    }
  }

  const viewCountryDetail = (id: string): void => {
    router.push(`/countries/${id}`)
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid Date'
    }
  }

  // Lifecycle
  onMounted(async () => {
    await refreshCountries()
  })
</script>
