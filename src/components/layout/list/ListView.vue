<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <div class="flex items-center">
          <div v-if="$slots.icon" :class="iconClasses" class="h-8 w-8 mr-3">
            <slot name="icon" />
          </div>
          <Title variant="page" :description="description">
            {{ title }}
          </Title>
        </div>
      </div>
      <div v-if="addButtonRoute" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <AddButton :to="addButtonRoute" :label="addButtonLabel" :color="color" />
      </div>
    </div>

    <!-- Filter Buttons -->
    <div v-if="(filters && filters.length > 0) || $slots.filters" class="mt-6 flex space-x-1">
      <slot name="filters" />
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty" class="text-center py-12">
      <div v-if="$slots.icon" :class="iconClasses" class="mx-auto h-12 w-12 mb-4">
        <slot name="icon" />
      </div>
      <GenericIcon v-else />
      <Title variant="empty" :description="emptyMessage">
        {{ emptyTitle }}
      </Title>
    </div>

    <!-- Content Slot -->
    <div v-else class="mt-8">
      <div class="flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <TableElement>
                <template #headers>
                  <slot name="headers" />
                </template>
                <template #rows>
                  <slot name="rows" />
                </template>
              </TableElement>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Slot -->
    <slot name="modals" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import AddButton from '@/components/layout/list/AddButton.vue'
  import Title from '@/components/format/title/Title.vue'
  import TableElement from '@/components/format/table/TableElement.vue'
  import GenericIcon from '@/components/icons/GenericIcon.vue'

  const props = defineProps<{
    title: string
    description?: string
    addButtonRoute?: string
    addButtonLabel?: string
    isEmpty: boolean
    emptyTitle: string
    emptyMessage: string
    filters?: Array<{ label: string; count?: number; isActive: boolean; variant?: string }>
    color?: string
  }>()

  const iconClasses = computed(() => {
    if (!props.color) {
      return 'text-gray-600'
    }

    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      indigo: 'text-indigo-600',
      pink: 'text-pink-600',
      gray: 'text-gray-600',
    }

    return colorMap[props.color] || 'text-gray-600'
  })
</script>
