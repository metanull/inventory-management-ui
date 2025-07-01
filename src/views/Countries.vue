<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Countries</h1>
        <p class="mt-2 text-sm text-gray-700">A list of all countries in the system.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="add-country"
          @click="showAddModal = true"
        >
          Add Country
        </button>
      </div>
    </div>

    <div class="mt-8 flow-root">
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
                    ID
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Internal Name
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                  >
                    Legacy ID
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
                <tr v-for="country in countries" :key="country.id">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {{ country.id }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ country.internal_name }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ country.backward_compatibility || 'N/A' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(country.created_at) }}
                  </td>
                  <td
                    class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                  >
                    <button
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                      @click="viewCountry(country.id)"
                    >
                      View
                    </button>
                    <button
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                      @click="editCountry(country)"
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      data-testid="delete-country"
                      @click="deleteCountryConfirm(country)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      data-testid="create-country-modal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showAddModal ? 'Add Country' : 'Edit Country' }}
          </h3>
          <form @submit.prevent="saveCountry">
            <div class="mb-4">
              <label for="id" class="label">Country ID (ISO 3166-1 alpha-3)</label>
              <input
                id="id"
                v-model="formData.id"
                type="text"
                maxlength="3"
                minlength="3"
                :disabled="showEditModal"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label for="internal_name" class="label">Internal Name</label>
              <input
                id="internal_name"
                v-model="formData.internal_name"
                type="text"
                :class="[
                  'input',
                  hasFieldError('internal_name')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : '',
                ]"
                required
              />
              <p v-if="hasFieldError('internal_name')" class="mt-1 text-sm text-red-600">
                {{ getFieldError('internal_name') }}
              </p>
            </div>
            <div class="mb-4">
              <label for="backward_compatibility" class="label">Legacy ID (Optional)</label>
              <input
                id="backward_compatibility"
                v-model="formData.backward_compatibility"
                type="text"
                maxlength="2"
                minlength="2"
                :class="[
                  'input',
                  hasFieldError('backward_compatibility')
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : '',
                ]"
              />
              <p v-if="hasFieldError('backward_compatibility')" class="mt-1 text-sm text-red-600">
                {{ getFieldError('backward_compatibility') }}
              </p>
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" class="btn btn-outline" @click="closeModals">Cancel</button>
              <button type="submit" :disabled="loading" class="btn btn-primary">
                {{ loading ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-sm text-gray-500 mb-4">
            Are you sure you want to delete "{{ countryToDelete?.internal_name }}"? This action
            cannot be undone.
          </p>
          <div class="flex justify-center space-x-3">
            <button class="btn btn-outline" @click="showDeleteModal = false">Cancel</button>
            <button
              :disabled="loading"
              class="btn bg-red-600 hover:bg-red-700 text-white"
              @click="deleteCountry()"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
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
  import { apiClient, type CountryResource } from '@/api/client'
  import { useErrorHandler } from '@/utils/errorHandler'

  const router = useRouter()
  const {
    handleError,
    handleValidationError,
    clearValidationErrors,
    hasFieldError,
    getFieldError,
  } = useErrorHandler()

  const countries = ref<CountryResource[]>([])
  const loading = ref(false)
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const countryToDelete = ref<CountryResource | null>(null)

  const formData = ref({
    id: '',
    internal_name: '',
    backward_compatibility: null as string | null,
  })

  const resetForm = () => {
    formData.value = {
      id: '',
      internal_name: '',
      backward_compatibility: null,
    }
  }

  const closeModals = () => {
    showAddModal.value = false
    showEditModal.value = false
    showDeleteModal.value = false
    resetForm()
  }

  const fetchCountries = async () => {
    try {
      loading.value = true
      const response = await apiClient.getCountries()
      countries.value = response.data
    } catch (error) {
      console.error('Error fetching countries:', error)
    } finally {
      loading.value = false
    }
  }

  const viewCountry = (id: string) => {
    router.push(`/countries/${id}`)
  }

  const editCountry = (country: CountryResource) => {
    formData.value = {
      id: country.id,
      internal_name: country.internal_name,
      backward_compatibility: country.backward_compatibility,
    }
    showEditModal.value = true
  }

  const saveCountry = async () => {
    try {
      loading.value = true
      clearValidationErrors() // Clear any previous validation errors

      if (showAddModal.value) {
        await apiClient.createCountry(formData.value)
      } else {
        // Only send allowed fields for update (exclude id and other forbidden fields)
        const updateData = {
          internal_name: formData.value.internal_name,
          backward_compatibility: formData.value.backward_compatibility,
        }
        await apiClient.updateCountry(formData.value.id, updateData)
      }
      await fetchCountries()
      closeModals()
    } catch (error) {
      // Handle validation errors specifically
      handleValidationError(error, 'Country save operation')
      console.error('Error saving country:', error)
    } finally {
      loading.value = false
    }
  }

  const deleteCountryConfirm = (country: CountryResource) => {
    countryToDelete.value = country
    showDeleteModal.value = true
  }

  const deleteCountry = async () => {
    if (!countryToDelete.value) return

    try {
      loading.value = true
      await apiClient.deleteCountry(countryToDelete.value.id)
      await fetchCountries()
      closeModals()
    } catch (error) {
      handleError(error, 'Country delete operation')
      console.error('Error deleting country:', error)
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(() => {
    fetchCountries()
  })
</script>
