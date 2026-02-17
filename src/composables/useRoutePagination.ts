import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRoutePagination(fetchAction: (page: number, perPage: number) => void) {
  const route = useRoute()
  const router = useRouter()

  const currentPage = computed(() => Number(route.query.page) || 1)
  const currentPerPage = computed(() => Number(route.query.perPage) || 10)

  const handlePageChange = (page: number) => {
    router.push({ query: { ...route.query, page } })
  }

  const handlePerPageChange = (perPage: number) => {
    // Reset to page 1 when changing items per page
    router.push({ query: { ...route.query, page: 1, perPage } })
  }

  // Handles raw URL strings (e.g., res.links.next)
  const handleUrlChange = (url: string | null) => {
    if (!url) return
    try {
      const urlObj = new URL(url, window.location.origin)
      const page = urlObj.searchParams.get('page')
      if (page) handlePageChange(Number(page))
    } catch (e) {
      console.error('Invalid pagination URL', e)
    }
  }

  watch(
    () => [route.query.page, route.query.perPage],
    () => {
      fetchAction(currentPage.value, currentPerPage.value)
    },
    { immediate: true }
  )

  return {
    currentPage,
    currentPerPage,
    handlePageChange,
    handlePerPageChange,
    handleUrlChange,
  }
}
