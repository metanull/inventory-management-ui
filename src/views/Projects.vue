<template>
  <ListView
    title="Projects"
    description="Manage projects in your inventory system. Projects can be enabled/disabled and launched/not launched."
    add-button-route="/projects/new"
    add-button-label="Add Project"
    color="orange"
    :loading="loading"
    :error="error"
    :is-empty="filteredProjects.length === 0"
    empty-title="No projects found"
    :empty-message="
      filterMode === 'all'
        ? 'Get started by creating a new project.'
        : filterMode === 'visible'
          ? 'No visible projects found. Projects are visible when they are enabled, launched, and the launch date has passed.'
          : `No ${filterMode} projects found.`
    "
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Project"
    @retry="fetchProjects"
  >
    <!-- Icon -->
    <template #icon>
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    </template>
    <!-- Filter Buttons -->
    <template #filters>
      <FilterButton
        label="Visible"
        :is-active="filterMode === 'visible'"
        :count="visibleProjects.length"
        variant="primary"
        @click="filterMode = 'visible'"
      />
      <FilterButton
        label="All Projects"
        :is-active="filterMode === 'all'"
        :count="projects.length"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Enabled"
        :is-active="filterMode === 'enabled'"
        :count="enabledProjects.length"
        variant="success"
        @click="filterMode = 'enabled'"
      />
      <FilterButton
        label="Launched"
        :is-active="filterMode === 'launched'"
        :count="launchedProjects.length"
        variant="info"
        @click="filterMode = 'launched'"
      />
    </template>

    <!-- Projects Table -->
    <template #content>
      <TableView>
        <template #headers>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Project
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Enabled
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Launched
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Launch Date
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Created
          </th>
          <th scope="col" class="relative px-6 py-3">
            <span class="sr-only">Actions</span>
          </th>
        </template>

        <template #rows>
          <tr v-for="project in filteredProjects" :key="project.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <ResourceNameDisplay
                :internal-name="project.internal_name"
                :backward-compatibility="project.backward_compatibility"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <ToggleSmall
                title="Enabled"
                :status-text="project.is_enabled ? 'Enabled' : 'Disabled'"
                :is-active="project.is_enabled"
                :disabled="true"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <ToggleSmall
                title="Launched"
                :status-text="project.is_launched ? 'Launched' : 'Not Launched'"
                :is-active="project.is_launched"
                :disabled="true"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <ToggleSmall
                v-if="project.launch_date"
                title="Launch Date"
                :status-text="formatLaunchDate(project.launch_date)"
                :is-active="isLaunchDatePassed(project.launch_date)"
                :disabled="true"
              />
              <span v-else class="text-sm text-gray-500">Not scheduled</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <DateDisplay :date="project.created_at" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <ViewButton @click="router.push(`/projects/${project.id}`)" />
                <EditButton @click="router.push(`/projects/${project.id}?edit=true`)" />
                <DeleteButton @click="confirmDelete(project)" />
              </div>
            </td>
          </tr>
        </template>
      </TableView>
    </template>

    <!-- Delete Confirmation Modal -->
    <template #modals>
      <DeleteConfirmationModal
        :show="showDeleteModal"
        title="Delete Project"
        :message="`Are you sure you want to delete &quot;${projectToDelete?.internal_name}&quot;? This action cannot be undone.`"
        :loading="deleteLoading"
        @confirm="deleteProject"
        @cancel="cancelDelete"
      />
    </template>
  </ListView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import DeleteConfirmationModal from '@/components/layout/DeleteConfirmationModal.vue'
  import type { ProjectResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/actions/table/ViewButton.vue'
  import EditButton from '@/components/actions/table/EditButton.vue'
  import DeleteButton from '@/components/actions/table/DeleteButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import ResourceNameDisplay from '@/components/format/InternalName.vue'
  import FilterButton from '@/components/actions/list/FilterButton.vue'
  import ListView from '@/components/layout/ListView.vue'
  import TableView from '@/components/layout/TableView.vue'
  import ToggleSmall from '@/components/format/ToggleSmall.vue'

  const router = useRouter()

  const projectStore = useProjectStore()

  const projects = computed(() => projectStore.projects)
  const visibleProjects = computed(() => projectStore.visibleProjects)
  const enabledProjects = computed(() => projectStore.enabledProjects)
  const launchedProjects = computed(() => projectStore.launchedProjects)
  const loading = computed(() => projectStore.loading && projects.value.length === 0)
  const error = computed(() => projectStore.error)

  // Filter state - default to 'visible'
  const filterMode = ref<'visible' | 'all' | 'enabled' | 'launched'>('visible')

  // Delete modal state
  const showDeleteModal = ref(false)
  const projectToDelete = ref<ProjectResource | null>(null)
  const deleteLoading = ref(false)

  // Helper functions for launch date handling
  const formatLaunchDate = (launchDate: string): string => {
    const date = new Date(launchDate)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isLaunchDatePassed = (launchDate: string): boolean => {
    const today = new Date()
    const launch = new Date(launchDate)
    return launch <= today
  }

  // Computed filtered projects
  const filteredProjects = computed(() => {
    switch (filterMode.value) {
      case 'visible':
        return visibleProjects.value
      case 'enabled':
        return enabledProjects.value
      case 'launched':
        return launchedProjects.value
      default:
        return projects.value
    }
  })

  // Fetch projects on mount
  onMounted(async () => {
    try {
      // Fetch visible projects first (default filter)
      await projectStore.fetchEnabledProjects()
      // Also fetch all projects for other filters
      await projectStore.fetchProjects()
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  })

  // Delete confirmation
  const confirmDelete = (project: ProjectResource) => {
    projectToDelete.value = project
    showDeleteModal.value = true
  }

  const cancelDelete = () => {
    showDeleteModal.value = false
    projectToDelete.value = null
  }

  const deleteProject = async () => {
    if (!projectToDelete.value) return

    deleteLoading.value = true
    try {
      await projectStore.deleteProject(projectToDelete.value.id)
      showDeleteModal.value = false
      projectToDelete.value = null
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      deleteLoading.value = false
    }
  }

  // Fetch projects function for retry
  const fetchProjects = async () => {
    try {
      if (filterMode.value === 'visible') {
        await projectStore.fetchEnabledProjects()
      } else {
        await projectStore.fetchProjects()
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }
</script>
