<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation -->
    <div class="mb-6">
      <button
        class="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        @click="router.push('/contexts')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Contexts
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="contextStore.loading" class="flex justify-center items-center py-8">
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
        <span class="text-gray-600">Loading context details...</span>
      </div>
    </div>

    <!-- Context Detail -->
    <div v-else-if="contextStore.currentContext" class="space-y-6">
      <!-- Header with actions -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {{ contextStore.currentContext.internal_name }}
            <span
              v-if="contextStore.currentContext.is_default"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              Default
            </span>
          </h1>
          <p class="text-lg text-gray-600 mt-1">
            Context ID:
            <code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{{
              contextStore.currentContext.id
            }}</code>
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            @click="editContext"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
            Edit
          </button>
          <button
            v-if="contextStore.currentContext && !contextStore.currentContext.is_default"
            :disabled="contextStore.loading"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            @click="setAsDefault"
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
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            Set as Default
          </button>
          <button
            :disabled="contextStore.currentContext && contextStore.currentContext.is_default"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            @click="deleteContext"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- Context Information Card -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Context Information</h2>
        </div>
        <div class="px-6 py-4">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Context ID</dt>
              <dd
                class="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded break-all"
              >
                <UuidDisplay :uuid="contextStore.currentContext.id" format="long" />
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ contextStore.currentContext.internal_name }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Backward Compatibility</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{
                  contextStore.currentContext.backward_compatibility
                    ? contextStore.currentContext.backward_compatibility
                    : '-'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Default Context</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <span
                  v-if="contextStore.currentContext.is_default"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Yes
                </span>
                <span v-else class="text-gray-500">No</span>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Created At</dt>
              <dd class="mt-1">
                <DateDisplay
                  :date="contextStore.currentContext.created_at"
                  format="medium"
                  show-time
                  class="text-sm text-gray-900"
                />
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Updated At</dt>
              <dd class="mt-1">
                <DateDisplay
                  :date="contextStore.currentContext.updated_at"
                  format="medium"
                  show-time
                  class="text-sm text-gray-900"
                />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-8">
      <div class="max-w-md mx-auto">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Context not found</h3>
        <p class="mt-1 text-sm text-gray-500">
          The context you're looking for doesn't exist or has been deleted.
        </p>
        <div class="mt-6">
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            @click="router.push('/contexts')"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Contexts
          </button>
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
            Are you sure you want to delete the context "{{
              contextStore.currentContext?.internal_name
            }}" (<UuidDisplay :uuid="contextStore.currentContext?.id" format="short" />)? This
            action cannot be undone.
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
              @click="showDeleteModal = false"
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
  import { useRoute, useRouter } from 'vue-router'
  import { useContextStore } from '@/stores/context'
  import DateDisplay from '@/components/DateDisplay.vue'
  import UuidDisplay from '@/components/UuidDisplay.vue'

  const route = useRoute()
  const router = useRouter()
  const contextStore = useContextStore()

  const showDeleteModal = ref(false)

  const editContext = () => {
    // Navigate back to contexts list with edit mode
    router.push({
      path: '/contexts',
      query: { edit: contextStore.currentContext?.id },
    })
  }

  const deleteContext = () => {
    showDeleteModal.value = true
  }

  const confirmDelete = async () => {
    if (!contextStore.currentContext) return

    try {
      await contextStore.deleteContext(contextStore.currentContext.id)
      showDeleteModal.value = false
      router.push('/contexts')
    } catch (error) {
      // Error is handled by the store/ErrorHandler
      console.error('Delete error:', error)
    }
  }

  const setAsDefault = async () => {
    if (!contextStore.currentContext) return

    try {
      await contextStore.setDefaultContext(contextStore.currentContext.id, true)
    } catch (error) {
      // Error is handled by the store/ErrorHandler
      console.error('Set default error:', error)
    }
  }

  onMounted(async () => {
    const contextId = route.params.id as string
    if (contextId) {
      try {
        await contextStore.fetchContext(contextId)
      } catch (error) {
        // Error is handled by the store/ErrorHandler
        console.error('Failed to fetch context:', error)
      }
    }
  })
</script>
