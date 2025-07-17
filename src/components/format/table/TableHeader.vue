<template>
  <th :scope="scope" :class="computedClasses">
    <slot />
  </th>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    scope?: 'col' | 'row'
    variant?: 'default' | 'actions'
  }

  const props = withDefaults(defineProps<Props>(), {
    scope: 'col',
    variant: 'default',
  })

  const computedClasses = computed(() => {
    const baseClasses = 'px-6 py-3'

    switch (props.variant) {
      case 'actions':
        return `${baseClasses} relative`
      case 'default':
      default:
        return `${baseClasses} text-left text-xs font-medium text-gray-500 uppercase tracking-wide`
    }
  })
</script>
