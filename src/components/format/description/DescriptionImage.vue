<template>
  <div class="border-t border-gray-200 py-4">
    <div v-if="fullImageUrl" class="mb-4">
      <img :src="fullImageUrl" :alt="altText ?? ''" class="max-w-full h-auto" />
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    imageUrl?: string
    altText: string | null
  }

  const props = withDefaults(defineProps<Props>(), {
    imageUrl: '',
    altText: '',
  })

  const fullImageUrl = computed(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
    return props.imageUrl ? `${baseUrl}/${props.imageUrl}` : ''
  })
</script>
