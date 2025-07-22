<template>
  <div class="flex items-center">
    <div v-if="small" class="flex-shrink-0 h-10 w-10 hidden sm:flex">
      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <slot name="icon">
          <RectangleGroupIcon class="h-5 w-5 text-gray-600" />
        </slot>
      </div>
    </div>
    <div :class="small ? 'ml-4' : ''">
      <div class="text-sm font-medium text-gray-900">
        {{ internalName }}
      </div>
      <div
        v-if="backwardCompatibility"
        :class="small ? 'text-xs text-gray-500' : 'text-sm text-gray-500'"
      >
        {{ small ? 'Legacy:' : 'Legacy ID:' }} {{ backwardCompatibility }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RectangleGroupIcon } from '@heroicons/vue/24/outline'

  interface Props {
    internalName: string
    backwardCompatibility?: string | null
    small?: boolean
  }

  defineProps<Props>()
</script>
