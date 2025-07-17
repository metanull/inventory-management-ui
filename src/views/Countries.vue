<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Countries</h1>
        <p class="mt-2 text-sm text-gray-700">Manage countries available in the inventory system</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          data-testid="add-country-button"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          @click="openCreateModal"
        >
          Add Country
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="countryStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="countryStore.error" />

    <!-- Empty State -->
    <div v-else-if="countryStore.countries.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No countries found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new country.</p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="openCreateModal"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Country
        </button>
      </div>
    </div>

    <!-- Countries Table -->
    <div v-else class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Country
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Created
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr
                  v-for="country in countryStore.sortedCountries"
                  :key="country.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <ResourceNameDisplay
                      :internal-name="country.internal_name"
                      :backward-compatibility="country.backward_compatibility"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DateDisplay :date="country.created_at" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
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
  import CountryForm from '@/components/_obsolete/CountryForm.vue'
  import ErrorDisplay from '@/components/layout/app/ErrorDisplay.vue'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import ResourceNameDisplay from '@/components/format/InternalName.vue'

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
