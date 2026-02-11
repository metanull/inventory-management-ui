<template>
  <div :class="rowClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      size?: 'default' | 'small'
    }>(),
    {
      size: 'default',
    }
  )

  const rowClasses = computed(() => [
    'px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6',
    props.size === 'small' ? 'py-4' : 'py-5',
    'odd:bg-gray-50 even:bg-white',
  ])
</script>
