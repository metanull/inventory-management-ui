<template>
  <ListView
    title="Languages"
    description="Manage languages available in the inventory system. Languages can be set as default for new items."
    add-button-route="/languages/new"
    add-button-label="Add Language"
    color="purple"
    :is-empty="paginatedLanguages.length === 0"
    empty-title="No languages found"
    :empty-message="emptyMessage"
    :show-empty-add-button="filterMode === 'all' && searchQuery.length === 0"
    empty-add-button-label="New Language"
    @retry="handleRefresh"
  >
    <!-- Icon -->
    <template #icon>
      <LanguageIcon />
    </template>
    <!-- Filter Buttons -->
    <template #filters>
      <FilterButton
        label="All Languages"
        :is-active="filterMode === 'all'"
        :count="allLanguages.length"
        variant="primary"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Default"
        :is-active="filterMode === 'default'"
        :count="defaultLanguagesCount"
        variant="success"
        @click="filterMode = 'default'"
      />
    </template>

    <!-- Search Slot -->
    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search by name, ID, or legacy ID..." />
    </template>

    <!-- Languages Table -->
    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Language
        </TableHeader>
        <TableHeader
          class="hidden md:table-cell"
          sortable
          :sort-direction="sortKey === 'is_default' ? sortDirection : null"
          @sort="handleSort('is_default')"
        >
          Default
        </TableHeader>
        <TableHeader
          class="hidden lg:table-cell"
          sortable
          :sort-direction="sortKey === 'created_at' ? sortDirection : null"
          @sort="handleSort('created_at')"
        >
          Created
        </TableHeader>
        <TableHeader class="hidden sm:table-cell" variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>

    <template #rows>
      <TableRow
        v-for="language in paginatedLanguages"
        :key="language.id"
        class="cursor-pointer hover:bg-purple-50 transition"
        @click="openLanguageDetail(language.id)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="language.internal_name"
            :backward-compatibility="language.backward_compatibility"
          >
            <template #icon>
              <LanguageIcon class="h-5 w-5 text-purple-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden md:table-cell">
          <div @click.stop>
            <Toggle
              small
              title="Default"
              :status-text="language.is_default ? 'Default' : 'Not default'"
              :is-active="language.is_default"
              @toggle="updateLanguageStatus(language, 'is_default', !language.is_default)"
            />
          </div>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay :date="language.created_at" format="short" variant="small-dark" />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div class="flex space-x-2" @click.stop>
            <ViewButton @click="router.push(`/languages/${language.id}`)" />
            <EditButton @click="router.push(`/languages/${language.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteLanguage(language)" />
          </div>
        </TableCell>
      </TableRow>
    </template>
  </ListView>

  <!-- Client-Side Pagination Controls -->
  <ClientPagination
    v-if="filteredLanguages.length > 0"
    v-model:current-page="currentPage"
    v-model:per-page="perPage"
    :total-items="filteredLanguages.length"
  />
</template>

<script setup lang="ts">
  /**
   * Reference Data Pattern: Languages are loaded once via ensureLoaded() and cached.
   * All filtering, sorting, and pagination happens client-side on the cached array.
   */
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useLanguageStore } from '@/stores/language'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import type { LanguageResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import FilterButton from '@/components/layout/list/FilterButton.vue'
  import ListView from '@/components/layout/list/ListView.vue'
  import TableHeader from '@/components/format/table/TableHeader.vue'
  import TableRow from '@/components/format/table/TableRow.vue'
  import TableCell from '@/components/format/table/TableCell.vue'
  import Toggle from '@/components/format/Toggle.vue'
  import InternalName from '@/components/format/InternalName.vue'
  import ClientPagination from '@/components/format/ClientPagination.vue'
  import { LanguageIcon } from '@heroicons/vue/24/solid'
  import SearchControl from '@/components/layout/list/SearchControl.vue'

  const router = useRouter()

  const languageStore = useLanguageStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  // All languages from the store (Reference Data - cached)
  const allLanguages = computed(() => languageStore.languages)

  const defaultLanguagesCount = computed(
    () => languageStore.languages.filter(l => l.is_default).length
  )

  const filterMode = ref<'all' | 'default'>('all')
  const searchQuery = ref<string>('')
  const sortKey = ref<'internal_name' | 'is_default' | 'created_at'>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const currentPage = ref(1)
  const perPage = ref(10)

  // Client-side filtering on cached data
  const filteredLanguages = computed(() => {
    let list = allLanguages.value

    // Filter by mode (all vs default)
    if (filterMode.value === 'default') {
      list = list.filter(lang => lang.is_default)
    }

    // Filter by search query (ID, name, or legacy ID)
    const query = searchQuery.value.trim().toLowerCase()
    if (query.length > 0) {
      list = list.filter(language => {
        const id = language.id?.toLowerCase() ?? ''
        const name = language.internal_name?.toLowerCase() ?? ''
        const legacyId = language.backward_compatibility?.toLowerCase() ?? ''
        return id.includes(query) || name.includes(query) || legacyId.includes(query)
      })
    }

    return list
  })

  // Client-side sorting
  const sortedLanguages = computed(() => {
    const list = [...filteredLanguages.value]

    return list.sort((a, b) => {
      let valA: unknown
      let valB: unknown

      switch (sortKey.value) {
        case 'internal_name':
          valA = a.internal_name ?? ''
          valB = b.internal_name ?? ''
          break
        case 'is_default':
          // Sort booleans: true first when ascending
          valA = a.is_default ? 1 : 0
          valB = b.is_default ? 1 : 0
          break
        case 'created_at':
          valA = a.created_at ?? ''
          valB = b.created_at ?? ''
          break
        default:
          valA = (a as Record<string, unknown>)[sortKey.value]
          valB = (b as Record<string, unknown>)[sortKey.value]
      }

      if (valA == null && valB == null) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  })

  // Client-side pagination
  const paginatedLanguages = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    const end = start + perPage.value
    return sortedLanguages.value.slice(start, end)
  })

  const emptyMessage = computed(() => {
    if (searchQuery.value.trim().length > 0) {
      return `No languages found matching "${searchQuery.value}".`
    }
    if (filterMode.value === 'default') {
      return 'No default languages found. Mark a language as default to make it the fallback choice.'
    }
    return 'Get started by creating a new language.'
  })

  // Reset to page 1 when filters change
  watch([searchQuery, filterMode], () => {
    currentPage.value = 1
  })

  // Load all languages on mount using ensureLoaded() (returns cached data if available)
  onMounted(async () => {
    if (!languageStore.isLoaded) {
      loadingStore.show()
    }

    try {
      await languageStore.ensureLoaded()
    } catch {
      errorStore.addMessage('error', 'Failed to load languages. Please try again.')
    } finally {
      loadingStore.hide()
    }
  })

  function handleSort(key: 'internal_name' | 'is_default' | 'created_at') {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  function openLanguageDetail(languageId: string | number) {
    router.push(`/languages/${languageId}`)
  }

  const updateLanguageStatus = async (
    language: LanguageResource,
    field: string,
    value: boolean
  ) => {
    try {
      loadingStore.show('Updating...')
      if (field === 'is_default') {
        await languageStore.setDefaultLanguage(language.id, value)
        errorStore.addMessage(
          'info',
          `Language ${value ? 'set as default' : 'removed from default'} successfully.`
        )
      }
    } catch {
      errorStore.addMessage('error', 'Failed to update language status. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  // Force refresh from API (bypasses cache)
  const handleRefresh = async () => {
    try {
      loadingStore.show()
      await languageStore.refresh()
      errorStore.addMessage('info', 'Languages refreshed successfully.')
    } catch {
      errorStore.addMessage('error', 'Failed to refresh languages. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  const handleDeleteLanguage = async (languageToDelete: LanguageResource) => {
    const result = await deleteStore.trigger(
      'Delete Language',
      `Are you sure you want to delete "${languageToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await languageStore.deleteLanguage(languageToDelete.id)
        errorStore.addMessage('info', 'Language deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Failed to delete language. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  defineExpose({
    allLanguages,
    filteredLanguages,
    sortedLanguages,
    paginatedLanguages,
    filterMode,
    searchQuery,
    sortKey,
    sortDirection,
    currentPage,
    perPage,
    openLanguageDetail,
    updateLanguageStatus,
    handleDeleteLanguage,
    handleSort,
    handleRefresh,
  })
</script>
