<template>
  <button
    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    label?: string
  }>()

  defineEmits<{
    click: []
  }>()
</script>
