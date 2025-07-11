<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Language Management</h1>
      <p class="text-gray-600">Manage languages available in the inventory system</p>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6 flex justify-between items-center">
      <button
        :disabled="languageStore.loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        @click="refreshLanguages"
      >
        <svg
          v-if="languageStore.loading"
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
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        @click="openCreateModal"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        Add Language
      </button>
    </div>

    <!-- Languages Table -->
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
                Default
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
            <tr v-if="languageStore.loading && languageStore.languages.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
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
                  Loading languages...
                </div>
              </td>
            </tr>
            <tr v-else-if="languageStore.languages.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No languages found</td>
            </tr>
            <tr
              v-for="language in languageStore.languages"
              v-else
              :key="language.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ language.id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ language.internal_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="language.is_default"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Default
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  -
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ language.backward_compatibility || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(language.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <ViewButton @click="router.push(`/languages/${language.id}`)" />
                  <EditButton @click="openEditModal(language)" />
                  <SetDefaultButton
                    v-if="!language.is_default"
                    :disabled="languageStore.loading"
                    @click="setAsDefault(language)"
                  />
                  <DeleteButton
                    :disabled="language.is_default"
                    @click="openDeleteModal(language)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Language Form Modal -->
    <LanguageForm
      :is-visible="showModal"
      :language="currentEditLanguage"
      @close="closeModal"
      @success="handleFormSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-sm text-gray-600 mb-6">
            Are you sure you want to delete the language "{{ languageToDelete?.internal_name }}" ({{
              languageToDelete?.id
            }})? This action cannot be undone.
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              :disabled="languageStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              @click="confirmDelete"
            >
              <svg
                v-if="languageStore.loading"
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
  import { useLanguageStore } from '@/stores/language'
  import LanguageForm from '@/components/LanguageForm.vue'
  import type { LanguageResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/actions/ViewButton.vue'
  import EditButton from '@/components/actions/EditButton.vue'
  import DeleteButton from '@/components/actions/DeleteButton.vue'
  import SetDefaultButton from '@/components/actions/SetDefaultButton.vue'

  const router = useRouter()
  const languageStore = useLanguageStore()

  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const currentEditLanguage = ref<LanguageResource | null>(null)
  const languageToDelete = ref<LanguageResource | null>(null)

  const openCreateModal = () => {
    currentEditLanguage.value = null
    showModal.value = true
  }

  const openEditModal = (language: LanguageResource) => {
    currentEditLanguage.value = language
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    currentEditLanguage.value = null
    languageStore.clearError()
  }

  const handleFormSuccess = () => {
    // Refresh the languages list after successful create/update
    refreshLanguages()
  }

  const openDeleteModal = (language: LanguageResource) => {
    languageToDelete.value = language
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    languageToDelete.value = null
    languageStore.clearError()
  }

  const confirmDelete = async () => {
    if (!languageToDelete.value) return

    try {
      await languageStore.deleteLanguage(languageToDelete.value.id)
      closeDeleteModal()
    } catch (error) {
      // Error is handled by the store
      console.error('Delete error:', error)
    }
  }

  const setAsDefault = async (language: LanguageResource) => {
    try {
      await languageStore.setDefaultLanguage(language.id, true)
    } catch (error) {
      // Error is handled by the store
      console.error('Set default error:', error)
    }
  }

  const refreshLanguages = async () => {
    try {
      await languageStore.fetchLanguages()
    } catch (error) {
      // Error is handled by the store
      console.error('Refresh error:', error)
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(() => {
    refreshLanguages()
  })
</script>
