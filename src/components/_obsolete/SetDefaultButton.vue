<template>
  <button
    :class="[
      'text-green-600 hover:text-green-900',
      disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-green-900',
    ]"
    :title="tooltip || 'Set as default'"
    :disabled="disabled"
    @click="!disabled && $emit('click')"
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
</template>

<script setup lang="ts">
  defineProps<{
    disabled?: boolean
    tooltip?: string
  }>()

  defineEmits<{
    click: []
  }>()
</script>
