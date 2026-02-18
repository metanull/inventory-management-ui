<template>
  <ListView
    title="Languages"
    description="Manage languages available in the inventory system. Languages can be set as default for new items."
    add-button-route="/languages/new"
    add-button-label="Add Language"
    color="purple"
    :is-empty="filteredLanguages.length === 0"
    empty-title="No languages found"
    :empty-message="emptyMessage"
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Language"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @retry="fetchLanguages"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <LanguageIcon />
    </template>

    <template #filters>
      <FilterButton
        label="All Languages"
        :is-active="filterMode === 'all'"
        :count="languages.length"
        variant="primary"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Default"
        :is-active="filterMode === 'default'"
        :count="defaultLanguages.length"
        variant="success"
        @click="filterMode = 'default'"
      />
    </template>

    <template #search>
      <SearchControl
        v-model="searchQuery"
        placeholder="Search languages..."
      />
    </template>

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
        <TableHeader
          class="hidden sm:table-cell"
          variant="actions"
        >
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>

    <template #rows>
      <TableRow
        v-for="language in filteredLanguages"
        :key="language.id"
        class="cursor-pointer hover:bg-purple-50 transition"
        @click="router.push(`/languages/${language.id}`)"
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
          <DateDisplay
            :date="language.created_at"
            format="short"
            variant="small-dark"
          />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div
            class="flex space-x-2"
            @click.stop
          >
            <ViewButton @click="router.push(`/languages/${language.id}`)" />
            <EditButton @click="router.push(`/languages/${language.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteLanguage(language)" />
          </div>
        </TableCell>
      </TableRow>
    </template>
  </ListView>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'

  // Stores
  import { useLanguageStore } from '@/stores/language'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'

  // Composables
  import { useRoutePagination } from '@/composables/useRoutePagination'

  // Components
  import ListView from '@/components/layout/list/ListView.vue'
  import FilterButton from '@/components/layout/list/FilterButton.vue'
  import SearchControl from '@/components/layout/list/SearchControl.vue'
  import TableHeader from '@/components/format/table/TableHeader.vue'
  import TableRow from '@/components/format/table/TableRow.vue'
  import TableCell from '@/components/format/table/TableCell.vue'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import Toggle from '@/components/format/Toggle.vue'
  import InternalName from '@/components/format/InternalName.vue'
  import { LanguageIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const languageStore = useLanguageStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const {
    category: languages,
    defaultLanguages,
    pageLinks: links,
    pageMeta: meta,
  } = storeToRefs(languageStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(languageStore.fetchLanguages)

  const filterMode = ref<'all' | 'default'>('all')
  const sortKey = ref<string>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const searchQuery = ref<string>('')

  const emptyMessage = computed(() => {
    if (filterMode.value === 'all') return 'Get started by creating a new language.'
    if (filterMode.value === 'default') return 'No default languages found.'
    return `No ${filterMode.value} languages found.`
  })

  function handleSort(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredLanguages = computed(() => {
    let list = filterMode.value === 'default' ? defaultLanguages.value : languages.value

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        l =>
          l.internal_name?.toLowerCase().includes(query) ||
          l.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return [...list].sort((a: any, b: any) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const updateLanguageStatus = async (language: any, field: string, value: boolean) => {
    try {
      loadingStore.show('Updating...')
      if (field === 'is_default') {
        await languageStore.setDefaultLanguage(language.id, value)
        errorStore.addMessage('info', 'Status updated.')
      }
    } catch {
      errorStore.addMessage('error', 'Update failed.')
    } finally {
      loadingStore.hide()
    }
  }

  const handleDeleteLanguage = async (language: any) => {
    const result = await deleteStore.trigger(
      'Delete Language',
      `Delete "${language.internal_name}"?`
    )
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await languageStore.deleteLanguage(language.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchLanguages = () => languageStore.fetchLanguages(meta.value?.current_page || 1)
</script>
