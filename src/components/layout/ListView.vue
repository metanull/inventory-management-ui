<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">{{ title }}</h1>
        <p v-if="description" class="mt-2 text-sm text-gray-700">{{ description }}</p>
      </div>
      <div v-if="addButtonRoute" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <AddButton :to="addButtonRoute" :label="addButtonLabel" />
      </div>
    </div>

    <!-- Filter Buttons -->
    <div v-if="filters && filters.length > 0" class="mt-6 flex space-x-1">
      <slot name="filters" />
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="$emit('retry')" />

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">{{ emptyTitle }}</h3>
      <p class="mt-1 text-sm text-gray-500">{{ emptyMessage }}</p>
      <div v-if="showEmptyAddButton && addButtonRoute" class="mt-6">
        <AddButton :to="addButtonRoute" :label="emptyAddButtonLabel" />
      </div>
    </div>

    <!-- Content Slot -->
    <div v-else class="mt-8">
      <slot name="content" />
    </div>

    <!-- Modal Slot -->
    <slot name="modals" />
  </div>
</template>

<script setup lang="ts">
  import ErrorDisplay from '@/components/layout/ErrorDisplay.vue'
  import LoadingSpinner from '@/components/layout/LoadingSpinner.vue'
  import AddButton from '@/components/actions/list/AddButton.vue'

  defineProps<{
    title: string
    description?: string
    addButtonRoute?: string
    addButtonLabel?: string
    loading: boolean
    error: string | null
    isEmpty: boolean
    emptyTitle: string
    emptyMessage: string
    showEmptyAddButton?: boolean
    emptyAddButtonLabel?: string
    filters?: Array<{ label: string; count?: number; isActive: boolean; variant?: string }>
  }>()

  defineEmits<{
    retry: []
  }>()
</script>
