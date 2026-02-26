<template>
  <ListView
    title="Partners"
    description="Manage available Partners, or add new ones."
    add-button-route="/partners/new"
    add-button-label="Add Partner"
    color="blue"
    :is-empty="filteredPartners.length === 0"
    empty-title="No partners found"
    :empty-message="emptyMessage"
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Partner"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @retry="fetchPartners"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <PartnerIcon />
    </template>

    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search partners..." />
    </template>

    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Partner
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
        v-for="partner in filteredPartners"
        :key="partner.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="router.push(`/partners/${partner.id}`)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="partner.internal_name"
            :backward-compatibility="partner.backward_compatibility"
          >
            <template #icon>
              <PartnerIcon class="h-5 w-5 text-blue-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay :date="partner.created_at" format="short" variant="small-dark" />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div class="flex space-x-2" @click.stop>
            <ViewButton @click="router.push(`/partners/${partner.id}`)" />
            <EditButton @click="router.push(`/partners/${partner.id}?edit=true`)" />
            <DeleteButton @click="handleDeletePartner(partner)" />
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
  import { usePartnerStore, type PartnerResource } from '@/stores/partner'
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
  import { BuildingLibraryIcon as PartnerIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const partnerStore = usePartnerStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const { category: partners, pageLinks: links, pageMeta: meta } = storeToRefs(partnerStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(partnerStore.fetchPartners)

  const searchQuery = ref('')
  const sortKey = ref<keyof PartnerResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const emptyMessage = computed(() => {
    if (searchQuery.value.trim().length > 0) {
      return `No partners match your search: '${searchQuery.value}'`
    }
    return 'Get started by creating a new partner.'
  })

  function handleSort(key: keyof PartnerResource) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredPartners = computed(() => {
    let list = [...partners.value]

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        p =>
          p.internal_name?.toLowerCase().includes(query) ||
          p.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return list.sort((a: PartnerResource, b: PartnerResource) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const handleDeletePartner = async (partner: PartnerResource) => {
    const result = await deleteStore.trigger('Delete Partner', `Delete "${partner.internal_name}"?`)
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await partnerStore.deletePartner(partner.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchPartners = () => partnerStore.fetchPartners(meta.value?.current_page || 1)
</script>
