<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Contexts</h1>
        <p class="mt-2 text-sm text-gray-700">Manage contexts for organizing content.</p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          type="button"
          class="btn btn-primary"
          data-testid="add-context"
          @click="showAddModal = true"
        >
          Add Context
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
                    Default
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
                <tr v-for="context in contexts" :key="context.id">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {{ context.internal_name }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ context.backward_compatibility || 'N/A' }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span
                      v-if="context.is_default"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      Default
                    </span>
                    <button
                      v-else
                      class="text-indigo-600 hover:text-indigo-900 text-xs"
                      @click="setDefaultContext(context)"
                    >
                      Set as Default
                    </button>
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(context.created_at) }}
                  </td>
                  <td
                    class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                  >
                    <button
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                      @click="viewContext(context.id)"
                    >
                      View
                    </button>
                    <button
                      class="text-indigo-600 hover:text-indigo-900 mr-4"
                      @click="editContext(context)"
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      :disabled="context.is_default"
                      data-testid="delete-context"
                      @click="deleteContextConfirm(context)"
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
      data-testid="create-context-modal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showAddModal ? 'Add Context' : 'Edit Context' }}
          </h3>
          <form @submit.prevent="saveContext">
            <div class="mb-4">
              <label for="internal_name" class="label">Internal Name</label>
              <input
                id="internal_name"
                v-model="formData.internal_name"
                type="text"
                class="input"
                required
              />
            </div>
            <div class="mb-4">
              <label for="backward_compatibility" class="label">Legacy ID (Optional)</label>
              <input
                id="backward_compatibility"
                v-model="formData.backward_compatibility"
                type="text"
                class="input"
              />
            </div>
            <div class="mb-4">
              <label class="flex items-center">
                <input
                  v-model="formData.is_default"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">Set as default context</span>
              </label>
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
            Are you sure you want to delete "{{ contextToDelete?.internal_name }}"? This action
            cannot be undone.
          </p>
          <div class="flex justify-center space-x-3">
            <button class="btn btn-outline" @click="showDeleteModal = false">Cancel</button>
            <button
              :disabled="loading"
              class="btn bg-red-600 hover:bg-red-700 text-white"
              @click="deleteContext()"
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
  import { apiClient, type ContextResource } from '@/api/client'
  import { useErrorHandler } from '@/utils/errorHandler'

  const router = useRouter()
  const { handleError, handleValidationError, clearValidationErrors } = useErrorHandler()

  const contexts = ref<ContextResource[]>([])
  const loading = ref(false)
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const contextToDelete = ref<ContextResource | null>(null)

  const formData = ref({
    id: '',
    internal_name: '',
    backward_compatibility: null as string | null,
    is_default: false,
  })

  const resetForm = () => {
    formData.value = {
      id: '',
      internal_name: '',
      backward_compatibility: null,
      is_default: false,
    }
  }

  const closeModals = () => {
    showAddModal.value = false
    showEditModal.value = false
    showDeleteModal.value = false
    resetForm()
  }

  const fetchContexts = async () => {
    try {
      loading.value = true
      const response = await apiClient.getContexts()
      contexts.value = response.data
    } catch (error) {
      console.error('Error fetching contexts:', error)
    } finally {
      loading.value = false
    }
  }

  const viewContext = (id: string) => {
    router.push(`/contexts/${id}`)
  }

  const editContext = (context: ContextResource) => {
    formData.value = {
      id: context.id,
      internal_name: context.internal_name,
      backward_compatibility: context.backward_compatibility,
      is_default: context.is_default,
    }
    showEditModal.value = true
  }

  const saveContext = async () => {
    try {
      loading.value = true
      clearValidationErrors() // Clear any previous validation errors

      if (showAddModal.value) {
        await apiClient.createContext(formData.value)
      } else {
        // Only send allowed fields for update (exclude id and other forbidden fields)
        const updateData = {
          internal_name: formData.value.internal_name,
          backward_compatibility: formData.value.backward_compatibility,
          is_default: formData.value.is_default,
        }
        await apiClient.updateContext(formData.value.id, updateData)
      }
      await fetchContexts()
      closeModals()
    } catch (error) {
      // Handle validation errors specifically
      handleValidationError(error, 'Context save operation')
      console.error('Error saving context:', error)
    } finally {
      loading.value = false
    }
  }

  const setDefaultContext = async (context: ContextResource) => {
    try {
      loading.value = true
      await apiClient.setDefaultContext(context.id, true)
      await fetchContexts()
    } catch (error) {
      console.error('Error setting default context:', error)
    } finally {
      loading.value = false
    }
  }

  const deleteContextConfirm = (context: ContextResource) => {
    contextToDelete.value = context
    showDeleteModal.value = true
  }

  const deleteContext = async () => {
    if (!contextToDelete.value) return

    try {
      loading.value = true
      await apiClient.deleteContext(contextToDelete.value.id)
      await fetchContexts()
      closeModals()
    } catch (error) {
      handleError(error, 'Context delete operation')
      console.error('Error deleting context:', error)
    } finally {
      loading.value = false
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  onMounted(() => {
    fetchContexts()
  })
</script>
