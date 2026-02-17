<template>
  <ListView
    title="Contexts"
    description="Manage contexts in your inventory system. Contexts can be set as default for the entire database."
    add-button-route="/contexts/new"
    add-button-label="Add Context"
    color="green"
    :is-empty="filteredContexts.length === 0"
    empty-title="No contexts found"
    :empty-message="emptyMessage"
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Context"
    @retry="fetchContexts"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <ContextIcon />
    </template>

    <template #filters>
      <FilterButton
        label="All Contexts"
        :is-active="filterMode === 'all'"
        :count="contexts.length"
        variant="primary"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Default"
        :is-active="filterMode === 'default'"
        :count="defaultContexts.length"
        variant="success"
        @click="filterMode = 'default'"
      />
    </template>

    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search contexts..." />
    </template>

    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Context
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
        v-for="context in filteredContexts"
        :key="context.id"
        class="cursor-pointer hover:bg-green-50 transition"
        @click="router.push(`/contexts/${context.id}`)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="context.internal_name"
            :backward-compatibility="context.backward_compatibility"
          >
            <template #icon>
              <ContextIcon class="h-5 w-5 text-green-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden md:table-cell">
          <div @click.stop>
            <Toggle
              small
              title="Default"
              :status-text="context.is_default ? 'Default' : 'Not default'"
              :is-active="context.is_default"
              @toggle="updateContextStatus(context, 'is_default', !context.is_default)"
            />
          </div>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay :date="context.created_at" format="short" variant="small-dark" />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div class="flex space-x-2" @click.stop>
            <ViewButton @click="router.push(`/contexts/${context.id}`)" />
            <EditButton @click="router.push(`/contexts/${context.id}?edit=true`)" />
            <DeleteButton @click="handleDelete(context)" />
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
  import { useContextStore } from '@/stores/context'
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
  import { CogIcon as ContextIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const contextStore = useContextStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const { contexts, defaultContexts, pageLinks: links, pageMeta: meta } = storeToRefs(contextStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(contextStore.fetchContexts)

  // Reactive state
  const filterMode = ref<'all' | 'default'>('all')
  const sortKey = ref<string>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')
  const searchQuery = ref<string>('')

  const emptyMessage = computed(() => {
    if (filterMode.value === 'all') return 'Get started by creating a new context.'
    if (filterMode.value === 'default') return 'No default context found.'
    return `No ${filterMode.value} contexts found.`
  })

  function handleSort(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredContexts = computed(() => {
    let list = filterMode.value === 'default' ? defaultContexts.value : contexts.value

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        c =>
          c.internal_name?.toLowerCase().includes(query) ||
          c.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return [...list].sort((a: any, b: any) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const updateContextStatus = async (context: any, field: string, value: boolean) => {
    try {
      loadingStore.show('Updating...')
      if (field === 'is_default') {
        await contextStore.setDefaultContext(context.id, value)
        errorStore.addMessage('info', 'Status updated.')
      }
    } catch {
      errorStore.addMessage('error', 'Update failed.')
    } finally {
      loadingStore.hide()
    }
  }

  const handleDelete = async (context: any) => {
    const result = await deleteStore.trigger('Delete Context', `Delete "${context.internal_name}"?`)
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await contextStore.deleteContext(context.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchContexts = () => contextStore.fetchContexts(meta.value?.current_page || 1)
</script>
