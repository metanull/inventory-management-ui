<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation -->
    <div class="mb-6">
      <button
        data-testid="back-to-countries-button"
        class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        @click="router.push('/countries')"
      >
        <ArrowLeftIcon class="h-4 w-4" />
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
            <PencilIcon class="h-4 w-4" />
            Edit Country
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
            <dd class="mt-1">
              <DateDisplay
                :date="countryStore.currentCountry.created_at"
                format="medium"
                show-time
                class="text-sm text-gray-900"
              />
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd class="mt-1">
              <DateDisplay
                :date="countryStore.currentCountry.updated_at"
                format="medium"
                show-time
                class="text-sm text-gray-900"
              />
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

    <!-- Country Form Modal -->
    <CountryForm
      :is-visible="isEditModalVisible"
      :country="countryStore.currentCountry"
      @close="closeEditModal"
      @success="handleCountryUpdate"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useCountryStore } from '@/stores/country'
  import CountryForm from '@/components/_obsolete/CountryForm.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import { ArrowLeftIcon, PencilIcon } from '@heroicons/vue/24/outline'

  const router = useRouter()
  const route = useRoute()
  const countryStore = useCountryStore()

  // Modal state
  const isEditModalVisible = ref(false)

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
