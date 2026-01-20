import { ref, computed, watch } from 'vue'

export type PageLinks = { first?: string | null; last?: string | null; prev?: string | null; next?: string | null }
export type MetaLink = { url?: string | null; label: string; active: boolean }
export type PageMeta = { current_page: number; last_page: number; links: MetaLink[] }

interface UsePaginationOptions {
  props: {
    links: PageLinks
    meta: PageMeta
    perPage: number
  }
  emit: {
    (e: 'change-page', url: string | null): void
    (e: 'change-page-number', page: number): void
    (e: 'update:perPage', value: number): void
    (e: 'per-page-change', perPage: number): void
  }
}

export function usePagination({ props, emit }: UsePaginationOptions) {
  const localPerPage = ref<number>(props.perPage)

  // Sync internal state with prop changes
  watch(() => props.perPage, (newVal) => {
    localPerPage.value = newVal
  })

  // Filter out "Next" and "Previous" labels from the links array
  const filteredLinks = computed(() => {
    return props.meta.links.filter(link => 
      !link.label.toLowerCase().includes('previous') && 
      !link.label.toLowerCase().includes('next')
    )
  })

  const goTo = (url?: string | null) => {
    if (url) emit('change-page', url)
  }

  const goToPage = (label: string) => {
    const pageNum = parseInt(label)
    if (!isNaN(pageNum)) {
      emit('change-page-number', pageNum)
    }
  }

  const onPerPageChange = () => {
    emit('update:perPage', localPerPage.value)
    emit('per-page-change', localPerPage.value)
  }

  const isEllipsis = (link: MetaLink): boolean => {
    return (link.url === null && link.label === '...') || link.label.includes('…')
  }

  return {
    localPerPage,
    filteredLinks,
    goTo,
    goToPage,
    onPerPageChange,
    isEllipsis
  }
}