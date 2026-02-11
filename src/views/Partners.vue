0
<template>
  <ListView
    title="Partners"
    description="Manage available Partners, or add new ones."
    add-button-route="/partners/new"
    add-button-label="Add Partner"
    color="blue"
    :is-empty="filteredPartners.length === 0"
    empty-title="No partners found"
    :empty-message="
      searchQuery.length > 0
        ? `No partners match your search: '${searchQuery}'`
        : 'Get started by creating a new partner.'
    "
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Partner"
    @retry="fetchPartners"
  >
    <!-- Icon -->
    <template #icon>
      <PartnerIcon />
    </template>

    <!-- Search Slot -->
    <template #search>
      <SearchControl v-model="searchQuery" placeholder="Search partners..." />
    </template>

    <!-- Partners Table Headers -->
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

    <!-- Partners Table Rows -->
    <template #rows>
      <TableRow
        v-for="partner in filteredPartners"
        :key="partner.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="openPartnerDetail(partner.id)"
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
          <DateDisplay :date="partner.created_at" />
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
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import type { PartnerResource } from '@metanull/inventory-app-api-client'
  import { usePartnerStore } from '@/stores/partner'
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
  import { BuildingLibraryIcon as PartnerIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const partnerStore = usePartnerStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  // State
  const searchQuery = ref('')
  const sortKey = ref<keyof PartnerResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  // Computed
  const partners = computed(() => partnerStore.partners)

  const filteredPartners = computed(() => {
    let filtered = [...partners.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(
        partner =>
          partner.internal_name.toLowerCase().includes(query) ||
          (partner.backward_compatibility &&
            partner.backward_compatibility.toLowerCase().includes(query))
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
  const handleSort = (key: keyof PartnerResource): void => {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const openPartnerDetail = (id: string): void => {
    router.push(`/partners/${id}`)
  }

  const fetchPartners = async (): Promise<void> => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (partners.value && partners.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await partnerStore.fetchPartners()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch partners. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  }

  // Delete partner with confirmation
  const handleDeletePartner = async (partnerToDelete: PartnerResource) => {
    const result = await deleteStore.trigger(
      'Delete Partner',
      `Are you sure you want to delete "${partnerToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await partnerStore.deletePartner(partnerToDelete.id)
        errorStore.addMessage('info', 'Partner deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Failed to delete partner. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  // Lifecycle
  onMounted(async () => {
    let usedCache = false
    // If cache exists, display immediately and refresh in background
    if (partners.value && partners.value.length > 0) {
      usedCache = true
    } else {
      loadingStore.show()
    }
    try {
      // Always refresh in background
      await partnerStore.fetchPartners()
      if (usedCache) {
        errorStore.addMessage('info', 'List refreshed')
      }
    } catch {
      errorStore.addMessage('error', 'Failed to fetch partners. Please try again.')
    } finally {
      if (!usedCache) {
        loadingStore.hide()
      }
    }
  })
</script>
