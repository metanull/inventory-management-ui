<template>
  <div class="flex items-center justify-center">
    <button
      type="button"
      :disabled="disabled || loading"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? 'bg-indigo-600' : 'bg-gray-200',
      ]"
      :aria-pressed="isActive"
      :aria-label="`Toggle ${title.toLowerCase()}`"
      :title="`${title}: ${statusText}`"
      @click="!disabled && !loading && $emit('toggle')"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          isActive ? 'translate-x-5' : 'translate-x-0',
        ]"
      >
        <span
          :class="[
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
            isActive ? 'opacity-0' : 'opacity-100',
          ]"
          aria-hidden="true"
        >
          <XMarkIcon class="h-3 w-3 text-gray-400" />
        </span>
        <span
          :class="[
            'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out',
            isActive ? 'opacity-100' : 'opacity-0',
          ]"
          aria-hidden="true"
        >
          <CheckIcon class="h-3 w-3 text-indigo-600" />
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/solid'
  defineProps<{
    title: string
    statusText: string
    isActive: boolean
    disabled?: boolean
    loading?: boolean
  }>()

  defineEmits<{
    toggle: []
  }>()
</script>
