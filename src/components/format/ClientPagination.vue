<template>
  <!--
    ClientPagination - Client-Side Pagination Controls

    Use ClientPagination for *reference data* that is fully loaded client-side:
    - Languages, Countries, Contexts (small, static datasets)
    - When sorting/filtering is done on cached data

    For SERVER-SIDE pagination (large datasets), use PageNavigation instead.
  -->
  <div class="flex items-center justify-between gap-4 mt-5 px-2">
    <!-- Results info -->
    <div class="text-sm text-gray-600">
      Showing <strong>{{ startItem }}</strong> to <strong>{{ endItem }}</strong> of
      <strong>{{ totalItems }}</strong> results
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center gap-3">
      <!-- Per page selector -->
      <div class="flex items-center gap-2">
        <label :for="perPageId" class="text-sm text-gray-600 whitespace-nowrap">Per page</label>
        <select
          :id="perPageId"
          :value="perPage"
          class="border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          @change="handlePerPageChange"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <!-- Page navigation buttons -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          :disabled="currentPage === 1"
          aria-label="First page"
          @click="goToPage(1)"
        >
          «
        </button>

        <button
          type="button"
          class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="goToPage(currentPage - 1)"
        >
          ‹
        </button>

        <!-- Page numbers -->
        <nav class="flex items-center gap-1" aria-label="Pagination">
          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === '...'" class="px-2 py-1 text-gray-400">...</span>
            <button
              v-else
              type="button"
              class="px-3 py-1 rounded transition-colors"
              :class="[
                page === currentPage
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700',
              ]"
              :aria-current="page === currentPage ? 'page' : undefined"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
          </template>
        </nav>

        <button
          type="button"
          class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="goToPage(currentPage + 1)"
        >
          ›
        </button>

        <button
          type="button"
          class="px-2 py-1 bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          :disabled="currentPage === totalPages"
          aria-label="Last page"
          @click="goToPage(totalPages)"
        >
          »
        </button>
      </div>

      <!-- Page info -->
      <div class="text-sm text-gray-600 border-l pl-3">
        Page <strong>{{ currentPage }}</strong> of <strong>{{ totalPages }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, useId } from 'vue'

  const props = withDefaults(
    defineProps<{
      /** Current page number (1-indexed) */
      currentPage: number
      /** Items per page */
      perPage: number
      /** Total number of items */
      totalItems: number
      /** Available per-page options */
      perPageOptions?: number[]
    }>(),
    {
      perPageOptions: () => [10, 25, 50, 100],
    }
  )

  const emit = defineEmits<{
    'update:currentPage': [page: number]
    'update:perPage': [perPage: number]
  }>()

  const perPageId = useId()

  /** Total number of pages */
  const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.perPage)))

  /** First item number on current page */
  const startItem = computed(() => {
    if (props.totalItems === 0) return 0
    return (props.currentPage - 1) * props.perPage + 1
  })

  /** Last item number on current page */
  const endItem = computed(() => Math.min(props.currentPage * props.perPage, props.totalItems))

  /**
   * Calculate which page numbers to show.
   * Shows first, last, and pages around current with ellipsis.
   */
  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = props.currentPage
    const pages: (number | '...')[] = []

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (current > 3) {
        pages.push('...')
      }

      // Pages around current
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < total - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(total)
    }

    return pages
  })

  /** Navigate to a specific page */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
      emit('update:currentPage', page)
    }
  }

  /** Handle per-page change */
  const handlePerPageChange = (event: Event) => {
    const target = event.target as globalThis.HTMLSelectElement
    const newPerPage = Number(target.value)
    emit('update:perPage', newPerPage)
    // Reset to page 1 when per-page changes
    emit('update:currentPage', 1)
  }
</script>
