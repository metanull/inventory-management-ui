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

  const iconClasses = computed(() => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400',
      red: 'text-red-400',
      gray: 'text-gray-400',
    }
    return colorMap[props.mainColor] || 'text-blue-400'
  })

  const pillClasses = computed(() => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-200 text-blue-600',
      green: 'bg-green-200 text-green-600',
      purple: 'bg-purple-200 text-purple-600',
      orange: 'bg-orange-200 text-orange-600',
      red: 'bg-red-200 text-red-600',
      gray: 'bg-gray-200 text-gray-600',
    }
    return colorMap[props.mainColor] || 'bg-blue-200 text-blue-600'
  })
</script>
