<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Context Management</h1>
      <p class="text-gray-600">Manage contexts available in the inventory system</p>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6 flex justify-between items-center">
      <button
        :disabled="contextStore.loading"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        @click="refreshContexts"
      >
        <svg
          v-if="contextStore.loading"
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
        Add Context
      </button>
    </div>

    <!-- Contexts Table -->
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
            <tr v-if="contextStore.loading && contextStore.contexts.length === 0">
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
                  Loading contexts...
                </div>
              </td>
            </tr>
            <tr v-else-if="contextStore.contexts.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No contexts found</td>
            </tr>
            <tr
              v-for="context in contextStore.contexts"
              v-else
              :key="context.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 font-mono">
                  {{ context.id.substring(0, 8) }}...
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ context.internal_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="context.is_default"
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
                  {{ context.backward_compatibility || '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(context.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    class="text-indigo-600 hover:text-indigo-900"
                    title="View details"
                    @click="router.push(`/contexts/${context.id}`)"
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
                  </button>
                  <button
                    class="text-blue-600 hover:text-blue-900"
                    title="Edit context"
                    @click="openEditModal(context)"
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
                    v-if="!context.is_default"
                    :disabled="contextStore.loading"
                    class="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Set as default"
                    @click="setAsDefault(context)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </button>
                  <button
                    :disabled="context.is_default"
                    class="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Delete context"
                    @click="openDeleteModal(context)"
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

    <!-- Context Form Modal -->
    <ContextForm
      :is-visible="showModal"
      :context="currentEditContext"
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
            Are you sure you want to delete the context "{{ contextToDelete?.internal_name }}" ({{
              contextToDelete?.id
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
              :disabled="contextStore.loading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              @click="confirmDelete"
            >
              <svg
                v-if="contextStore.loading"
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
  import { useContextStore } from '@/stores/context'
  import ContextForm from '@/components/ContextForm.vue'
  import type { ContextResource } from '@metanull/inventory-app-api-client'

  const router = useRouter()
  const contextStore = useContextStore()

  const showModal = ref(false)
  const showDeleteModal = ref(false)
  const currentEditContext = ref<ContextResource | null>(null)
  const contextToDelete = ref<ContextResource | null>(null)

  const openCreateModal = () => {
    currentEditContext.value = null
    showModal.value = true
  }

  const openEditModal = (context: ContextResource) => {
    currentEditContext.value = context
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    currentEditContext.value = null
    contextStore.clearError()
  }

  const handleFormSuccess = () => {
    // Refresh the contexts list after successful create/update
    refreshContexts()
  }

  const openDeleteModal = (context: ContextResource) => {
    contextToDelete.value = context
    showDeleteModal.value = true
  }

  const closeDeleteModal = () => {
    showDeleteModal.value = false
    contextToDelete.value = null
    contextStore.clearError()
  }

  const confirmDelete = async () => {
    if (!contextToDelete.value) return

    try {
      await contextStore.deleteContext(contextToDelete.value.id)
      closeDeleteModal()
    } catch (error) {
      // Error is handled by the store
      console.error('Delete error:', error)
    }
  }

  const setAsDefault = async (context: ContextResource) => {
    try {
      await contextStore.setDefaultContext(context.id, true)
    } catch (error) {
      // Error is handled by the store
      console.error('Set default error:', error)
    }
  }

  const refreshContexts = async () => {
    try {
      await contextStore.fetchContexts()
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
    refreshContexts()
  })
</script>
