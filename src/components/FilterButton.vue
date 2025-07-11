<template>
  <button
    :class="[
      isActive ? activeClasses : inactiveClasses,
      'px-3 py-2 font-medium text-sm rounded-md',
    ]"
    @click="$emit('click')"
  >
    {{ label }}
    <span v-if="count !== undefined" class="ml-1">({{ count }})</span>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    label: string
    isActive: boolean
    count?: number
    variant?: 'primary' | 'success' | 'info'
  }>()

  defineEmits<{
    click: []
  }>()

  const activeClasses = computed(() => {
    switch (props.variant) {
      case 'success':
        return 'bg-green-100 text-green-700'
      case 'info':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-indigo-100 text-indigo-700'
    }
  })

  const inactiveClasses = 'text-gray-500 hover:text-gray-700'
</script>
