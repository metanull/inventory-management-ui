<template>
  <div class="bg-white shadow" :class="{ 'border-l-4 border-blue-500': isEditing }">
    <div class="px-4 py-5 sm:px-6">
      <div class="flex items-center justify-between">
        <div>
          <!-- Back Navigation Link -->
          <div v-if="backLink" class="mb-2">
            <router-link
              :to="backLink.route"
              :class="backLinkClasses"
              class="inline-flex items-center text-sm font-medium transition-colors hover:underline"
            >
              <component :is="backLink.icon" class="w-4 h-4 mr-1" />
              {{ backLink.title }}
            </router-link>
          </div>

          <h1 class="text-2xl font-bold text-gray-900">
            {{ internalName }}
            <span v-if="isCreating" class="text-sm font-normal text-blue-600 ml-2">(Creating)</span>
            <span v-else-if="isEditing" class="text-sm font-normal text-blue-600 ml-2"
              >(Editing)</span
            >
          </h1>
          <p v-if="backwardCompatibility" class="text-sm text-gray-500">
            Legacy ID: {{ backwardCompatibility }}
          </p>
        </div>
        <div class="flex space-x-3">
          <template v-if="!isEditing && !isCreating">
            <EditButton @click="$emit('edit')" />
            <DeleteButton @click="$emit('delete')" />
          </template>
          <template v-else>
            <SaveButton :loading="saveLoading" :disabled="saveDisabled" @click="$emit('save')" />
            <CancelButton @click="$emit('cancel')" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import EditButton from '@/components/layout/detail/EditButton.vue'
  import DeleteButton from '@/components/layout/detail/DeleteButton.vue'
  import SaveButton from '@/components/layout/detail/SaveButton.vue'
  import CancelButton from '@/components/layout/detail/CancelButton.vue'

  interface BackLink {
    title: string
    route: string
    icon: any
    color?: string
  }

  const props = defineProps<{
    internalName: string
    backwardCompatibility?: string | null
    isEditing: boolean
    isCreating?: boolean
    saveLoading?: boolean
    saveDisabled?: boolean
    backLink?: BackLink
  }>()

  defineEmits<{
    edit: []
    delete: []
    save: []
    cancel: []
  }>()

  const backLinkClasses = computed(() => {
    if (!props.backLink?.color) return 'text-gray-600 hover:text-gray-800'

    const colorMap: Record<string, string> = {
      blue: 'text-blue-600 hover:text-blue-800',
      green: 'text-green-600 hover:text-green-800',
      purple: 'text-purple-600 hover:text-purple-800',
      orange: 'text-orange-600 hover:text-orange-800',
      red: 'text-red-600 hover:text-red-800',
      gray: 'text-gray-600 hover:text-gray-800',
    }
    return colorMap[props.backLink.color] || 'text-gray-600 hover:text-gray-800'
  })
</script>
