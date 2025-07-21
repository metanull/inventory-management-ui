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

    <!-- Empty State -->
    <div v-if="countryStore.countries.length === 0" class="text-center py-12">
      <GlobeAltIcon class="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No countries found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new country.</p>
      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="openCreateModal"
        >
          <PlusIcon class="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { CountryResource } from '@metanull/inventory-app-api-client'
  import { useCountryStore } from '@/stores/country'
  import CountryForm from '@/components/_obsolete/CountryForm.vue'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import ResourceNameDisplay from '@/components/format/InternalName.vue'
  import { GlobeAltIcon, PlusIcon } from '@heroicons/vue/24/outline'

  const router = useRouter()
  const countryStore = useCountryStore()

  // Modal state
  const isFormModalVisible = ref(false)
  const selectedCountry = ref<CountryResource | null>(null)

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

  const viewCountryDetail = (id: string): void => {
    router.push(`/countries/${id}`)
  }

  // Lifecycle
  onMounted(async () => {
    await refreshCountries()
  })
</script>
