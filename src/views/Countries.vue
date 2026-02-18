<template>
  <ListView
    title="Countries"
    description="Manage available Countries, or add new ones."
    add-button-route="/countries/new"
    add-button-label="Add Country"
    color="blue"
    :is-empty="filteredCountries.length === 0"
    empty-title="No countries found"
    :empty-message="emptyMessage"
    :show-empty-add-button="searchQuery.length === 0"
    empty-add-button-label="New Country"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @retry="fetchCountries"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <CountryIcon />
    </template>

    <template #search>
      <SearchControl
        v-model="searchQuery"
        placeholder="Search countries..."
      />
    </template>

    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Country
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
        v-for="country in filteredCountries"
        :key="country.id"
        class="cursor-pointer hover:bg-blue-50 transition"
        @click="router.push(`/countries/${country.id}`)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="country.internal_name"
            :backward-compatibility="country.backward_compatibility"
          >
            <template #icon>
              <CountryIcon class="h-5 w-5 text-blue-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay
            :date="country.created_at"
            format="short"
            variant="small-dark"
          />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div
            class="flex space-x-2"
            @click.stop
          >
            <ViewButton @click="router.push(`/countries/${country.id}`)" />
            <EditButton @click="router.push(`/countries/${country.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteCountry(country)" />
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
  import { useCountryStore } from '@/stores/country'
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
  import { GlobeAltIcon as CountryIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const countryStore = useCountryStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const { category: countries, pageLinks: links, pageMeta: meta } = storeToRefs(countryStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(countryStore.fetchCountries)

  // State
  const searchQuery = ref('')
  const sortKey = ref<string>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const emptyMessage = computed(() => {
    if (searchQuery.value.trim().length > 0) {
      return `No countries match your search: '${searchQuery.value}'`
    }
    return 'Get started by creating a new country.'
  })

  function handleSort(key: string) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredCountries = computed(() => {
    let list = [...countries.value]

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        c =>
          c.internal_name?.toLowerCase().includes(query) ||
          c.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return list.sort((a: any, b: any) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const handleDeleteCountry = async (country: any) => {
    const result = await deleteStore.trigger('Delete Country', `Delete "${country.internal_name}"?`)
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await countryStore.deleteCountry(country.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchCountries = () => countryStore.fetchCountries(meta.value?.current_page || 1)
</script>
