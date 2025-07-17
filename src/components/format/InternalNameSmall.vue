<template>
  <div class="flex items-center">
    <div class="flex-shrink-0 h-10 w-10">
      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
        <slot name="icon">
          <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </slot>
      </div>
    </div>
    <div class="ml-4">
      <div class="text-sm font-medium text-gray-900">
        {{ internalName }}
      </div>
      <div v-if="backwardCompatibility" class="text-xs text-gray-500">
        Legacy: {{ backwardCompatibility }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    internalName: string
    backwardCompatibility?: string | null
  }>()
</script>
