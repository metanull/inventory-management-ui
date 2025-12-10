<template>
  <ListView
    title="Glossary"
    description="Manage glossary entries. Include notes or special instructions from the manual here. Ex. 'Always include English spelling.'"
    add-button-route="/glossary/new"
    add-button-label="Add Glossary Entry"
    color="blue"
    :is-empty="filteredGlossary.length === 0"
    empty-title="No glossary entries found."
    :empty-message="
      searchQuery.length > 0
        ? `No glossary entries match your search: '${searchQuery}'`
        : 'Get started by creating a new glossary entry.'
    "
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Glossary Entry"
    @retry="fetchGlossary"
  >
    <!-- Icon -->
    <template #icon>
      <BookOpenIcon />
    </template>

    <!-- Search Slot -->
    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search glossary..." />
    </template>

    <!-- Glossary Table Headers -->
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
        <TableHeader class="hidden sm:table-cell" variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>

    <!-- Glossary Table Rows -->
    <template #rows>
      <TableRow
        v-for="glossaryEntry in filteredGlossary"
        :key="glossaryEntry.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="openGlossaryDetail(glossaryEntry.id)"
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
          <DateDisplay :date="glossaryEntry.created_at" />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div class="flex space-x-2" @click.stop>
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
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { GlossaryResource } from '@metanull/inventory-app-api-client'
  import { useGlossaryStore } from '@/stores/glossary'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
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

  // State
  const searchQuery = ref('')
  const sortKey = ref<keyof GlossaryResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  // Computed
  const glossary = computed(() => glossaryStore.glossary)
  const filteredGlossary = computed(() => {
    let filtered = [...glossary.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(
        glossaryEntry =>
          glossaryEntry.internal_name.toLowerCase().startsWith(query) ||
          (glossaryEntry.backward_compatibility &&
            glossaryEntry.backward_compatibility.toLowerCase().startsWith(query))
      )
    }

    // Apply sorting - inline logic like Projects.vue
    return [...filtered].sort((a, b) => {
      const key = sortKey.value
      let valA: unknown
      let valB: unknown
      if (key === 'internal_name') {
        valA = a.internal_name ?? ''
        valB = b.internal_name ?? ''
      } else {
        valA = (a as any)[key]
        valB = (b as any)[key]
      }
      if (valA == null && valB == null) return 0
      if (valA == null) return 1
      if (valB == null) return -1
      if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  })

  // Methods
  const handleSort = (key: keyof GlossaryResource): void => {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const openGlossaryDetail = (id: string): void => {
    router.push(`/glossary/${id}`)
  }

  const fetchGlossary = async (): Promise<void> => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (glossary.value && glossary.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await glossaryStore.fetchGlossary()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch glossary. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  }

  // Delete glossary entry with confirmation
  const handleDeleteGlossary = async (glossaryEntryToDelete: GlossaryResource) => {
    const result = await deleteStore.trigger(
      'Delete Glossary Entry',
      `Are you sure you want to delete "${glossaryEntryToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await glossaryStore.deleteGlossaryEntry(glossaryEntryToDelete.id)
        errorStore.addMessage('info', 'Glossary entry deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Failed to delete glossary entry. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  // Lifecycle
  onMounted(async () => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (glossary.value && glossary.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await glossaryStore.fetchGlossary()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch glossary. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  })
</script>
