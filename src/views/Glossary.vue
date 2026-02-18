<template>
  <ListView
    title="Glossary"
    description="Manage glossary entries. Include notes or special instructions from the manual here. Ex. 'Always include English spelling.'"
    add-button-route="/glossary/new"
    add-button-label="Add Glossary Entry"
    color="blue"
    :is-empty="filteredGlossary.length === 0"
    empty-title="No glossary entries found"
    :empty-message="emptyMessage"
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Glossary Entry"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @retry="fetchGlossary"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <BookOpenIcon />
    </template>

    <template #search>
      <SearchControl
        v-model="searchQuery"
        placeholder="Search glossary..."
      />
    </template>

    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Glossary
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
        v-for="glossaryEntry in filteredGlossary"
        :key="glossaryEntry.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="router.push(`/glossary/${glossaryEntry.id}`)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="glossaryEntry.internal_name"
            :backward-compatibility="glossaryEntry.backward_compatibility"
          >
            <template #icon>
              <BookOpenIcon class="h-5 w-5 text-blue-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay
            :date="glossaryEntry.created_at"
            format="short"
            variant="small-dark"
          />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div
            class="flex space-x-2"
            @click.stop
          >
            <ViewButton @click="router.push(`/glossary/${glossaryEntry.id}`)" />
            <EditButton @click="router.push(`/glossary/${glossaryEntry.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteGlossary(glossaryEntry)" />
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
  import { useGlossaryStore, type GlossaryResource } from '@/stores/glossary'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'

  // Composables
  import { useRoutePagination } from '@/composables/useRoutePagination'

  // Components
  import ListView from '@/components/layout/list/ListView.vue'
  import TableRow from '@/components/format/table/TableRow.vue'
  import TableHeader from '@/components/format/table/TableHeader.vue'
  import TableCell from '@/components/format/table/TableCell.vue'
  import SearchControl from '@/components/layout/list/SearchControl.vue'
  import InternalName from '@/components/format/InternalName.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import { BookOpenIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const glossaryStore = useGlossaryStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const { category: glossary, pageLinks: links, pageMeta: meta } = storeToRefs(glossaryStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(glossaryStore.fetchGlossary)

  const searchQuery = ref('')
  const sortKey = ref<keyof GlossaryResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const emptyMessage = computed(() => {
    if (searchQuery.value.trim().length > 0) {
      return `No glossary entries match your search: '${searchQuery.value}'`
    }
    return 'Get started by creating a new glossary entry.'
  })

  function handleSort(key: keyof GlossaryResource) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredGlossary = computed(() => {
    let list = [...glossary.value]

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        entry =>
          entry.internal_name?.toLowerCase().includes(query) ||
          entry.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return list.sort((a: GlossaryResource, b: GlossaryResource) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const handleDeleteGlossary = async (entry: GlossaryResource) => {
    const result = await deleteStore.trigger(
      'Delete Glossary Entry',
      `Delete "${entry.internal_name}"?`
    )
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await glossaryStore.deleteGlossaryEntry(entry.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchGlossary = () => glossaryStore.fetchGlossary(meta.value?.current_page || 1)
</script>
