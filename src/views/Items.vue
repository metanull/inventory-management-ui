<template>
  <ListView
    title="Items"
    description="Manage available Items, or add new ones."
    add-button-route="/items/new"
    add-button-label="Add Item"
    color="blue"
    :is-empty="filteredItems.length === 0"
    empty-title="No items found"
    :empty-message="
      searchQuery.length > 0
        ? `No items match your search: '${searchQuery}'`
        : 'Get started by creating a new item.'
    "
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Item"
    @retry="fetchItems"
  >
    <!-- Icon -->
    <template #icon>
      <ItemIcon />
    </template>

    <!-- Search Slot -->
    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search items..." />
    </template>

    <!-- Items Table Headers -->
    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Item
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

    <!-- Items Table Rows -->
    <template #rows>
      <TableRow
        v-for="item in filteredItems"
        :key="item.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="openItemDetail(item.id)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="item.internal_name"
            :backward-compatibility="item.backward_compatibility"
          >
            <template #icon>
              <ItemIcon class="h-5 w-5 text-blue-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay :date="item.created_at" />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div class="flex space-x-2" @click.stop>
            <ViewButton @click="router.push(`/items/${item.id}`)" />
            <EditButton @click="router.push(`/items/${item.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteItem(item)" />
          </div>
        </TableCell>
      </TableRow>
    </template>
  </ListView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { ItemResource } from '@metanull/inventory-app-api-client'
  import { useItemStore } from '@/stores/item'
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
  import { PuzzlePieceIcon as ItemIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const itemStore = useItemStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  // State
  const searchQuery = ref('')
  const sortKey = ref<keyof ItemResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  // Computed
  const items = computed(() => itemStore.items)

  const filteredItems = computed(() => {
    let filtered = [...items.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(
        item =>
          item.internal_name.toLowerCase().includes(query) ||
          (item.backward_compatibility && item.backward_compatibility.toLowerCase().includes(query))
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
  const handleSort = (key: keyof ItemResource): void => {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const openItemDetail = (id: string): void => {
    router.push(`/items/${id}`)
  }

  const fetchItems = async (): Promise<void> => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (items.value && items.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await itemStore.fetchItems()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch items. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  }

  // Delete item with confirmation
  const handleDeleteItem = async (itemToDelete: ItemResource) => {
    const result = await deleteStore.trigger(
      'Delete Item',
      `Are you sure you want to delete "${itemToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await itemStore.deleteItem(itemToDelete.id)
        errorStore.addMessage('info', 'Item deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Failed to delete item. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  // Lifecycle
  onMounted(async () => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (items.value && items.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await itemStore.fetchItems()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch items. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  })
</script>
