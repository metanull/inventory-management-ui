<template>
  <div class="flex items-center gap-3 mt-5">
    <div class="flex items-center gap-1">
      <button
        class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!links.first || meta.current_page === 1"
        @click="goTo(links.first)"
        aria-label="First page"
      > « </button>

      <button
        class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!links.prev"
        @click="goTo(links.prev)"
        aria-label="Previous page"
      > ‹ </button>

      <nav class="flex items-center gap-1" aria-label="Pagination">
        <template v-for="(link, index) in filteredLinks" :key="index">
          <span v-if="isEllipsis(link)" class="px-2 py-1 text-gray-400"> {{link.label}} </span>

          <button
            v-else
            type="button"
            class="px-3 py-1 rounded transition-colors"
            :class="[
              link.active 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-100 text-gray-700'
            ]"
            :aria-current="link.active ? 'page' : undefined"
            @click="goToPage(link.label)"
          >
            {{ link.label }}
          </button>
        </template>
      </nav>

      <button
        class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!links.next"
        @click="goTo(links.next)"
        aria-label="Next page"
      > › </button>

      <button
        class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="!links.last || meta.current_page === meta.last_page"
        @click="goTo(links.last)"
        aria-label="Last page"
      > » </button>
    </div>

    <div class="flex items-center gap-2 border-l pl-4">
      <label :for="jumpPageId" class="text-sm text-gray-600 whitespace-nowrap">Go to</label>
      <input
        :id="jumpPageId"
        type="number"
        min="1"
        :max="meta.last_page"
        class="w-12 border rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        @keydown.enter="(e) => goToPage((e.target as HTMLInputElement).value)"
        placeholder="#"
      />
    </div>

    <div class="ml-auto flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label :for="perPageId" class="text-sm text-gray-600 whitespace-nowrap">Per page</label>
        <select
          :id="perPageId"
          class="border rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          v-model.number="localPerPage"
          @change="onPerPageChange"
        >
          <option v-for="per in perPageOptions" :key="per" :value="per">
            {{ per }}
          </option>
        </select>
      </div>

      <div class="text-sm text-gray-600 border-l pl-4">
        Page <strong>{{ meta.current_page }}</strong> of <strong>{{ meta.last_page }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { usePagination, type PageLinks, type PageMeta } from '@/composables/usePagination'

const props = withDefaults(defineProps<{
  links: PageLinks
  meta: PageMeta
  perPage?: number
  perPageOptions?: number[]
}>(), {
  perPage: 10,
  perPageOptions: () => [10, 25, 50, 100]
})

const emit = defineEmits<{
  (e: 'change-page', url: string | null): void
  (e: 'change-page-number', page: number): void
  (e: 'update:perPage', value: number): void
  (e: 'per-page-change', perPage: number): void
}>()

const perPageId = useId()
const jumpPageId = useId()

// Use the composable
const { 
  localPerPage, 
  filteredLinks, 
  goTo, 
  goToPage, 
  onPerPageChange, 
  isEllipsis 
} = usePagination({ props, emit })
</script>