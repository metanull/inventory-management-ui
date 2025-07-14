<template>
  <Card :title="title" :description="description" :main-color="mainColor">
    <template #icon>
      <slot name="icon" />
    </template>

    <router-link
      :to="buttonRoute"
      :class="buttonClasses"
      class="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors"
    >
      {{ buttonText }}
      <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </router-link>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Card from './Card.vue'

  const props = defineProps<{
    title: string
    description: string
    mainColor: string
    buttonText: string
    buttonRoute: string
  }>()

  const buttonClasses = computed(() => `bg-${props.mainColor}-600 hover:bg-${props.mainColor}-700`)
</script>
