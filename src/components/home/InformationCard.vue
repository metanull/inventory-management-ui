<template>
  <div class="bg-gray-50 rounded-lg shadow-md p-6">
    <div class="flex items-center mb-4">
      <div :class="iconClasses" class="h-8 w-8 mr-3">
        <slot name="icon" />
      </div>
      <h2 class="text-xl font-semibold text-gray-500">{{ title }}</h2>
    </div>
    <p class="text-gray-500 mb-4">{{ description }}</p>
    <div
      :class="pillClasses"
      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
    >
      {{ pillText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    title: string
    description: string
    mainColor: string
    pillText: string
  }>()

  const iconClasses = computed(() => `text-${props.mainColor}-400`)
  const pillClasses = computed(() => `bg-${props.mainColor}-200 text-${props.mainColor}-600`)
</script>
