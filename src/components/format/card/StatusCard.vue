<template>
  <Card :title="title" :description="description" :main-color="mainColor">
    <template #icon>
      <slot name="icon" />
    </template>

    <!-- API Status Toggle -->
    <div class="mt-4">
      <Toggle
        :title="toggleTitle"
        :status-text="statusText"
        :is-active="isActive"
        :loading="loading"
        :disabled="disabled"
        :active-icon-background-class="activeIconBackgroundClass"
        :inactive-icon-background-class="inactiveIconBackgroundClass"
        :active-icon-class="activeIconClass"
        :inactive-icon-class="inactiveIconClass"
        :active-icon-component="activeIconComponent"
        :inactive-icon-component="inactiveIconComponent"
        @toggle="$emit('toggle')"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
  import Card from './Card.vue'
  import Toggle from '@/components/format/Toggle.vue'

  defineProps<{
    title: string
    description: string
    mainColor: string
    statusText: string
    toggleTitle: string
    isActive: boolean
    loading: boolean
    disabled?: boolean
    activeIconBackgroundClass: string
    inactiveIconBackgroundClass: string
    activeIconClass: string
    inactiveIconClass: string
    activeIconComponent: any
    inactiveIconComponent: any
  }>()

  defineEmits<{
    toggle: []
  }>()
</script>
