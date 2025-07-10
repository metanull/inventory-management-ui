<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Language Management</h1>
      <p class="text-gray-600">Manage languages available in the inventory system</p>
    </div>

    <!-- Error Display -->
    <div v-if="languageStore.error" class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm text-red-800">{{ languageStore.error }}</p>
        </div>
        <button class="text-red-400 hover:text-red-600" @click="languageStore.clearError">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
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
                  <button
                    class="text-blue-600 hover:text-blue-900"
                    @click="openEditModal(language)"
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
                    :disabled="language.is_default"
                    class="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    @click="openDeleteModal(language)"
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? 'Edit Language' : 'Create New Language' }}
          </h3>

          <form class="space-y-4" @submit.prevent="submitForm">
            <div>
              <label for="id" class="block text-sm font-medium text-gray-700"
                >ID (ISO 639-1 code)</label
              >
              <input
                id="id"
                v-model="formData.id"
                :disabled="isEditing"
                type="text"
                maxlength="3"
                minlength="3"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="e.g., eng, fra, spa"
              />
            </div>

            <div>
              <label for="internal_name" class="block text-sm font-medium text-gray-700"
                >Internal Name</label
              >
              <input
                id="internal_name"
                v-model="formData.internal_name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., English, French, Spanish"
              />
            </div>

            <div>
              <label for="backward_compatibility" class="block text-sm font-medium text-gray-700"
                >Backward Compatibility (2 chars, optional)</label
              >
              <input
                id="backward_compatibility"
                v-model="formData.backward_compatibility"
                type="text"
                maxlength="2"
                minlength="2"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., en, fr, es"
              />
            </div>

            <div class="flex items-center">
              <input
                id="is_default"
                v-model="formData.is_default"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="is_default" class="ml-2 block text-sm text-gray-900">
                Set as default language
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="languageStore.loading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                {{ isEditing ? 'Update' : 'Create' }}
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
  import { ref, onMounted, reactive } from 'vue'
  import { useLanguageStore } from '@/stores/language'
  import type { LanguageResource } from '@metanull/inventory-app-api-client'

  const languageStore = useLanguageStore()

  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const isEditing = ref(false)
  const languageToDelete = ref<LanguageResource | null>(null)

  const formData = reactive({
    id: '',
    internal_name: '',
    backward_compatibility: '',
    is_default: false,
  })

  const resetForm = () => {
    formData.id = ''
    formData.internal_name = ''
    formData.backward_compatibility = ''
    formData.is_default = false
  }

  const openCreateModal = () => {
    resetForm()
    isEditing.value = false
    showModal.value = true
  }

  const openEditModal = (language: LanguageResource) => {
    formData.id = language.id
    formData.internal_name = language.internal_name
    formData.backward_compatibility = language.backward_compatibility || ''
    formData.is_default = language.is_default
    isEditing.value = true
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    resetForm()
    languageStore.clearError()
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

  const submitForm = async () => {
    try {
      const requestData = {
        internal_name: formData.internal_name,
        backward_compatibility: formData.backward_compatibility || null,
        is_default: formData.is_default,
      }

      if (isEditing.value) {
        await languageStore.updateLanguage(formData.id, requestData)
      } else {
        await languageStore.createLanguage({
          id: formData.id,
          ...requestData,
        })
      }

      closeModal()
    } catch (error) {
      // Error is handled by the store
      console.error('Form submission error:', error)
    }
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
