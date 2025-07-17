<template>
  <div
    v-if="cancelChangesStore.visible"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="cancelChangesStore.stay()"
      ></div>

      <div
        class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
      >
        <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div
              class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10"
            >
              <ExclamationTriangleIcon class="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 id="modal-title" class="text-base font-semibold leading-6 text-gray-900">
                {{ cancelChangesStore.title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  {{ cancelChangesStore.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            @click="cancelChangesStore.leave()"
          >
            Leave
          </button>
          <button
            ref="stayButton"
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            @click="cancelChangesStore.stay()"
            @keydown.enter="cancelChangesStore.stay()"
            @keydown.escape="cancelChangesStore.stay()"
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCancelChangesConfirmationStore } from '@/stores/cancelChangesConfirmation'
  import ExclamationTriangleIcon from '@/components/icons/ExclamationTriangleIcon.vue'
  import { ref, watch, nextTick } from 'vue'

  const cancelChangesStore = useCancelChangesConfirmationStore()
  const stayButton = ref<HTMLElement>()

  // Focus the stay button when the modal becomes visible
  watch(
    () => cancelChangesStore.visible,
    (visible: boolean) => {
      if (visible) {
        nextTick(() => {
          stayButton.value?.focus()
        })
      }
    }
  )
</script>
