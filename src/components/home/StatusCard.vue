<template>
  <Card :title="title" :description="description" :main-color="mainColor">
    <template #icon>
      <slot name="icon" />
    </template>

    <div
      :class="pillClasses"
      class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
    >
      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      {{ statusText }}
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Card from './Card.vue'

  const props = defineProps<{
    title: string
    description: string
    mainColor: string
    statusText: string
  }>()

  const pillClasses = computed(() => `bg-${props.mainColor}-100 text-${props.mainColor}-800`)
</script>
