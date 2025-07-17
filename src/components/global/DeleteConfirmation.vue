<template>
  <div
    v-if="deleteStore.visible"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="deleteStore.cancel()"
      ></div>

      <div
        class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
      >
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <ExclamationTriangleIcon class="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 id="modal-title" class="text-base font-semibold leading-6 text-gray-900">
                {{ deleteStore.title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ deleteStore.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            @click="deleteStore.confirmDelete()"
          >
            Delete
          </button>
          <button
            ref="cancelButton"
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            @click="deleteStore.cancel()"
            @keydown.enter="deleteStore.cancel()"
            @keydown.escape="deleteStore.cancel()"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import ExclamationTriangleIcon from '@/components/icons/ExclamationTriangleIcon.vue'
  import { ref, watch, nextTick } from 'vue'

  const deleteStore = useDeleteConfirmationStore()
  const cancelButton = ref<HTMLElement>()

  // Focus the cancel button when the modal becomes visible
  watch(
    () => deleteStore.visible,
    (visible: boolean) => {
      if (visible) {
        nextTick(() => {
          cancelButton.value?.focus()
        })
      }
    }
  )
</script>
