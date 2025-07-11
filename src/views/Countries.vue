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

    <!-- Countries Table -->
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Internal Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Backward Compatibility
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="countryStore.loading && countryStore.countries.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                <div class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                  Loading countries...
                </div>
              </td>
            </tr>
            <tr v-else-if="countryStore.countries.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                <div class="py-8">
                  <svg
                    class="mx-auto h-12 w-12 text-gray-400 mb-4"
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
                  <h3 class="text-sm font-medium text-gray-900 mb-2">No countries found</h3>
                  <p class="text-sm text-gray-500 mb-4">Get started by creating a new country.</p>
                  <button
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    @click="openCreateModal"
                  >
                    <svg
                      class="-ml-1 mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
              </td>
            </tr>
            <tr
              v-for="country in countryStore.sortedCountries"
              v-else
              :key="country.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ country.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ country.internal_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ country.backward_compatibility || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <DateDisplay :date="country.created_at" class="text-sm text-gray-900" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <ViewButton
                    data-testid="view-details-button"
                    @click="viewCountryDetail(country.id)"
                  />
                  <EditButton @click="openEditModal(country)" />
                  <DeleteButton @click="openDeleteModal(country)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
  import ViewButton from '@/components/actions/ViewButton.vue'
  import EditButton from '@/components/actions/EditButton.vue'
  import DeleteButton from '@/components/actions/DeleteButton.vue'
  import DateDisplay from '@/components/DateDisplay.vue'

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

  // Lifecycle
  onMounted(async () => {
    await refreshCountries()
  })
</script>
