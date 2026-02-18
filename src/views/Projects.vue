<template>
  <ListView
    title="Projects"
    description="Manage projects in your inventory system. Projects can be enabled/disabled and launched/not launched."
    add-button-route="/projects/new"
    add-button-label="Add Project"
    color="orange"
    :is-empty="filteredProjects.length === 0"
    empty-title="No projects found"
    :empty-message="emptyMessage"
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Project"
    :links="links"
    :meta="meta"
    :per-page="currentPerPage"
    @retry="fetchProjects"
    @change-page-number="handlePageChange"
    @per-page-change="handlePerPageChange"
    @change-page="handleUrlChange"
  >
    <template #icon>
      <ProjectIcon />
    </template>

    <template #filters>
      <FilterButton
        label="All Projects"
        :is-active="filterMode === 'all'"
        :count="projects.length"
        variant="primary"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Enabled"
        :is-active="filterMode === 'enabled'"
        :count="enabledProjects.length"
        variant="info"
        @click="filterMode = 'enabled'"
      />
      <FilterButton
        label="Launched"
        :is-active="filterMode === 'launched'"
        :count="launchedProjects.length"
        variant="info"
        @click="filterMode = 'launched'"
      />
      <FilterButton
        label="Visible"
        :is-active="filterMode === 'visible'"
        :count="visibleProjects.length"
        variant="success"
        @click="filterMode = 'visible'"
      />
    </template>

    <template #search>
      <SearchControl
        v-model="searchQuery"
        placeholder="Search projects..."
      />
    </template>

    <template #headers>
      <TableRow>
        <TableHeader
          sortable
          :sort-direction="sortKey === 'internal_name' ? sortDirection : null"
          @sort="handleSort('internal_name')"
        >
          Project
        </TableHeader>
        <TableHeader
          class="hidden md:table-cell"
          sortable
          :sort-direction="sortKey === 'is_enabled' ? sortDirection : null"
          @sort="handleSort('is_enabled')"
        >
          Enabled
        </TableHeader>
        <TableHeader
          class="hidden md:table-cell"
          sortable
          :sort-direction="sortKey === 'is_launched' ? sortDirection : null"
          @sort="handleSort('is_launched')"
        >
          Launched
        </TableHeader>
        <TableHeader
          class="hidden lg:table-cell"
          sortable
          :sort-direction="sortKey === 'launch_date' ? sortDirection : null"
          @sort="handleSort('launch_date')"
        >
          Launch Date
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
        v-for="project in filteredProjects"
        :key="project.id"
        class="cursor-pointer hover:bg-orange-50 transition"
        @click="router.push(`/projects/${project.id}`)"
      >
        <TableCell>
          <InternalName
            small
            :internal-name="project.internal_name"
            :backward-compatibility="project.backward_compatibility"
          >
            <template #icon>
              <ProjectIcon class="h-5 w-5 text-orange-600" />
            </template>
          </InternalName>
        </TableCell>
        <TableCell class="hidden md:table-cell">
          <div @click.stop>
            <Toggle
              small
              title="Enabled"
              :status-text="project.is_enabled ? 'Enabled' : 'Disabled'"
              :is-active="project.is_enabled"
              @toggle="updateProjectStatus(project, 'is_enabled', !project.is_enabled)"
            />
          </div>
        </TableCell>
        <TableCell class="hidden md:table-cell">
          <div @click.stop>
            <Toggle
              small
              title="Launched"
              :status-text="project.is_launched ? 'Launched' : 'Not launched'"
              :is-active="project.is_launched"
              @toggle="updateProjectStatus(project, 'is_launched', !project.is_launched)"
            />
          </div>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay
            v-if="project.launch_date"
            :date="project.launch_date"
            format="short"
            variant="small-dark"
          />
          <DisplayText
            v-else
            variant="gray"
          >
            Not scheduled
          </DisplayText>
        </TableCell>
        <TableCell class="hidden lg:table-cell">
          <DateDisplay
            :date="project.created_at"
            format="short"
            variant="small-dark"
          />
        </TableCell>
        <TableCell class="hidden sm:table-cell">
          <div
            class="flex space-x-2"
            @click.stop
          >
            <ViewButton @click="router.push(`/projects/${project.id}`)" />
            <EditButton @click="router.push(`/projects/${project.id}?edit=true`)" />
            <DeleteButton @click="handleDeleteProject(project)" />
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
  import { useProjectStore, type ProjectResource } from '@/stores/project'
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
  import Toggle from '@/components/format/Toggle.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import FilterButton from '@/components/layout/list/FilterButton.vue'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import { FolderIcon as ProjectIcon } from '@heroicons/vue/24/solid'

  const router = useRouter()
  const projectStore = useProjectStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const {
    category: projects,
    visibleProjects,
    enabledProjects,
    launchedProjects,
    pageLinks: links,
    pageMeta: meta,
  } = storeToRefs(projectStore)

  const { currentPerPage, handlePageChange, handlePerPageChange, handleUrlChange } =
    useRoutePagination(projectStore.fetchProjects)

  const searchQuery = ref('')
  const filterMode = ref<'visible' | 'all' | 'enabled' | 'launched'>('all')
  const sortKey = ref<keyof ProjectResource>('internal_name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const emptyMessage = computed(() => {
    if (searchQuery.value.trim().length > 0) {
      return `No projects match your search: '${searchQuery.value}'`
    }
    if (filterMode.value === 'visible') {
      return 'No visible projects found. Projects are visible when they are enabled, launched, and the launch date has passed.'
    }
    if (filterMode.value !== 'all') {
      return `No ${filterMode.value} projects found.`
    }
    return 'Get started by creating a new project.'
  })

  function handleSort(key: keyof ProjectResource) {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDirection.value = 'asc'
    }
  }

  const filteredProjects = computed(() => {
    let list: ProjectResource[]
    switch (filterMode.value) {
      case 'visible':
        list = visibleProjects.value
        break
      case 'enabled':
        list = enabledProjects.value
        break
      case 'launched':
        list = launchedProjects.value
        break
      default:
        list = projects.value
    }

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
      list = list.filter(
        p =>
          p.internal_name?.toLowerCase().includes(query) ||
          p.backward_compatibility?.toLowerCase().includes(query)
      )
    }

    return [...list].sort((a: ProjectResource, b: ProjectResource) => {
      const valA = a[sortKey.value] ?? ''
      const valB = b[sortKey.value] ?? ''
      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return valA < valB ? -1 * modifier : valA > valB ? 1 * modifier : 0
    })
  })

  const updateProjectStatus = async (project: ProjectResource, field: string, value: boolean) => {
    try {
      loadingStore.show('Updating...')
      if (field === 'is_enabled') {
        await projectStore.setProjectEnabled(project.id, value)
      } else if (field === 'is_launched') {
        await projectStore.setProjectLaunched(project.id, value)
      }
      errorStore.addMessage('info', 'Status updated.')
    } catch {
      errorStore.addMessage('error', 'Update failed.')
    } finally {
      loadingStore.hide()
    }
  }

  const handleDeleteProject = async (project: ProjectResource) => {
    const result = await deleteStore.trigger('Delete Project', `Delete "${project.internal_name}"?`)
    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await projectStore.deleteProject(project.id)
        errorStore.addMessage('info', 'Deleted successfully.')
      } catch {
        errorStore.addMessage('error', 'Delete failed.')
      } finally {
        loadingStore.hide()
      }
    }
  }

  const fetchProjects = () => projectStore.fetchProjects(meta.value?.current_page || 1)
</script>
