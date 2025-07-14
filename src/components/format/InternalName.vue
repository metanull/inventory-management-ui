<template>
  <div class="flex items-center">
    <div>
      <div class="text-sm font-medium text-gray-900">
        {{ internalName }}
      </div>
      <div v-if="backwardCompatibility" class="text-sm text-gray-500">
        Legacy ID: {{ backwardCompatibility }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    internalName: string
    backwardCompatibility?: string | null
  }

  defineProps<Props>()
</script>
