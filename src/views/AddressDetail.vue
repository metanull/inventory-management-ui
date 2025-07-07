<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/addresses"
          class="text-blue-600 hover:text-blue-800"
          title="Back to Addresses"
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
          {{ isEditing ? 'Edit Address' : isCreating ? 'Create Address' : 'Address Details' }}
        </h1>
      </div>
      <div v-if="!isCreating && !isEditing" class="flex space-x-2">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          @click="startEditing"
        >
          Edit
        </button>
        <button
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          @click="deleteAddress"
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
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchAddress" />

    <!-- Form -->
    <div v-else-if="isEditing || isCreating" class="bg-white p-6 rounded-lg shadow">
      <form class="space-y-4" @submit.prevent="saveAddress">
        <div>
          <label for="internal_name" class="block text-sm font-medium text-gray-700"
            >Internal Name *</label
          >
          <input
            id="internal_name"
            v-model="form.internal_name"
            type="text"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="country_id" class="block text-sm font-medium text-gray-700"
            >Country ID *</label
          >
          <select
            id="country_id"
            v-model="form.country_id"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a country</option>
            <option v-for="country in countries" :key="country.id" :value="country.id">
              {{ country.internal_name }}
            </option>
          </select>
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
          <label class="block text-sm font-medium text-gray-500">Internal Name</label>
          <p class="mt-1 text-sm text-gray-900">{{ address?.internal_name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Country ID</label>
          <p class="mt-1 text-sm text-gray-900">{{ address?.country_id }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Created</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(address?.created_at) }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Updated</label>
          <p class="mt-1 text-sm text-gray-900">{{ formatDate(address?.updated_at) }}</p>
        </div>
      </div>

      <!-- Translations -->
      <div v-if="address?.translations && address.translations.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Translations</h3>
        <div class="space-y-4">
          <div
            v-for="translation in address.translations"
            :key="translation.id"
            class="border rounded-lg p-4"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-500">Language ID</label>
                <p class="mt-1 text-sm text-gray-900">{{ translation.language_id }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500">Address</label>
                <p class="mt-1 text-sm text-gray-900">{{ translation.address }}</p>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-500">Description</label>
                <p class="mt-1 text-sm text-gray-900">{{ translation.description || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { apiClient, type AddressResource, type CountryResource } from '@/api/client'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'

  const route = useRoute()
  const router = useRouter()

  const address = ref<AddressResource | null>(null)
  const countries = ref<CountryResource[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const isEditing = ref(false)

  const addressId = computed(() => route.params.id as string)
  const isCreating = computed(() => route.name === 'address-create')

  const form = ref({
    internal_name: '',
    country_id: '',
  })

  const fetchAddress = async () => {
    if (isCreating.value) {
      loading.value = false
      return
    }

    try {
      loading.value = true
      error.value = null
      const response = await apiClient.getAddress(addressId.value)
      address.value = response.data
      form.value = {
        internal_name: response.data.internal_name,
        country_id: response.data.country_id,
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch address'
    } finally {
      loading.value = false
    }
  }

  const fetchCountries = async () => {
    try {
      const response = await apiClient.getCountries()
      countries.value = response.data
    } catch (err: any) {
      console.error('Failed to fetch countries:', err)
    }
  }

  const startEditing = () => {
    isEditing.value = true
  }

  const cancelEditing = () => {
    if (isCreating.value) {
      router.push('/addresses')
    } else {
      isEditing.value = false
      if (address.value) {
        form.value = {
          internal_name: address.value.internal_name,
          country_id: address.value.country_id,
        }
      }
    }
  }

  const saveAddress = async () => {
    try {
      saving.value = true
      error.value = null

      if (isCreating.value) {
        await apiClient.createAddress(form.value)
        router.push('/addresses')
      } else {
        const response = await apiClient.updateAddress(addressId.value, form.value)
        address.value = response.data
        isEditing.value = false
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save address'
    } finally {
      saving.value = false
    }
  }

  const deleteAddress = async () => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      await apiClient.deleteAddress(addressId.value)
      router.push('/addresses')
    } catch (err: any) {
      error.value = err.message || 'Failed to delete address'
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(() => {
    Promise.all([fetchAddress(), fetchCountries()])
  })
</script>
