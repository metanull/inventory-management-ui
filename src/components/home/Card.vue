<template>
  <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
    <div class="flex items-center mb-4">
      <div :class="iconClasses" class="h-8 w-8 mr-3">
        <slot name="icon" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
    </div>
    <p class="text-gray-600 mb-4">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    title: string
    description: string
    mainColor: string
  }>()

  const iconClasses = computed(() => `text-${props.mainColor}-600`)
</script>
