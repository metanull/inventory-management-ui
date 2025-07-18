<template>
  <ListView
    title="Projects"
    description="Manage projects in your inventory system. Projects can be enabled/disabled and launched/not launched."
    add-button-route="/projects/new"
    add-button-label="Add Project"
    color="orange"
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
      <ProjectIcon />
    </template>
    <!-- Filter Buttons -->
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

    <!-- Search Slot -->
    <template #search>
      <SearchControl />
    </template>

    <!-- Projects Table -->
    <!-- Projects Table -->
    <template #headers>
      <TableRow>
        <TableHeader>Project</TableHeader>
        <TableHeader>Enabled</TableHeader>
        <TableHeader>Launched</TableHeader>
        <TableHeader>Launch Date</TableHeader>
        <TableHeader>Created</TableHeader>
        <TableHeader variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>

    <template #rows>
      <TableRow v-for="project in filteredProjects" :key="project.id">
        <TableCell>
          <InternalNameSmall
            :internal-name="project.internal_name"
            :backward-compatibility="project.backward_compatibility"
          >
            <template #icon>
              <ProjectIcon class="h-5 w-5 text-gray-600" />
            </template>
          </InternalNameSmall>
        </TableCell>
        <TableCell>
          <ToggleSmall
            title="Enabled"
            :status-text="project.is_enabled ? 'Enabled' : 'Disabled'"
            :is-active="project.is_enabled"
            @toggle="updateProjectStatus(project, 'is_enabled', !project.is_enabled)"
          />
        </TableCell>
        <TableCell>
          <ToggleSmall
            title="Launched"
            :status-text="project.is_launched ? 'Launched' : 'Not launched'"
            :is-active="project.is_launched"
            @toggle="updateProjectStatus(project, 'is_launched', !project.is_launched)"
          />
        </TableCell>
        <TableCell>
          <DateDisplay
            v-if="project.launch_date"
            :date="project.launch_date"
            format="short"
            variant="small-dark"
          />
          <DisplayText v-else variant="gray">Not scheduled</DisplayText>
        </TableCell>
        <TableCell>
          <DateDisplay :date="project.created_at" format="short" variant="small-dark" />
        </TableCell>
        <TableCell>
          <div class="flex space-x-2">
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
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import { useLoadingOverlayStore } from '@/stores/loadingOverlay'
  import { useErrorDisplayStore } from '@/stores/errorDisplay'
  import { useDeleteConfirmationStore } from '@/stores/deleteConfirmation'
  import type { ProjectResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/layout/list/ViewButton.vue'
  import EditButton from '@/components/layout/list/EditButton.vue'
  import DeleteButton from '@/components/layout/list/DeleteButton.vue'
  import DateDisplay from '@/components/format/Date.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import FilterButton from '@/components/layout/list/FilterButton.vue'
  import ListView from '@/components/layout/list/ListView.vue'
  import TableHeader from '@/components/format/table/TableHeader.vue'
  import TableRow from '@/components/format/table/TableRow.vue'
  import TableCell from '@/components/format/table/TableCell.vue'
  import ToggleSmall from '@/components/format/ToggleSmall.vue'
  import InternalNameSmall from '@/components/format/InternalNameSmall.vue'
  import ProjectIcon from '@/components/icons/ProjectIcon.vue'
  import SearchControl from '@/components/layout/list/SearchControl.vue'

  const router = useRouter()

  const projectStore = useProjectStore()
  const loadingStore = useLoadingOverlayStore()
  const errorStore = useErrorDisplayStore()
  const deleteStore = useDeleteConfirmationStore()

  const projects = computed(() => projectStore.projects)
  const visibleProjects = computed(() => projectStore.visibleProjects)
  const enabledProjects = computed(() => projectStore.enabledProjects)
  const launchedProjects = computed(() => projectStore.launchedProjects)

  // Filter state - default to 'visible'
  const filterMode = ref<'visible' | 'all' | 'enabled' | 'launched'>('all')

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
      loadingStore.show()
      // Also fetch all projects for other filters
      await projectStore.fetchProjects()
      // Fetch visible projects
      await projectStore.fetchEnabledProjects()
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      errorStore.addMessage('error', 'Failed to fetch projects. Please try again.')
    } finally {
      loadingStore.hide()
    }
  })

  // Update project status
  const updateProjectStatus = async (project: ProjectResource, field: string, value: boolean) => {
    try {
      loadingStore.show('Updating...')
      if (field === 'is_enabled') {
        await projectStore.setProjectEnabled(project.id, value)
        errorStore.addMessage('info', `Project ${value ? 'enabled' : 'disabled'} successfully.`)
      } else if (field === 'is_launched') {
        await projectStore.setProjectLaunched(project.id, value)
        errorStore.addMessage('info', `Project ${value ? 'launched' : 'unlaunched'} successfully.`)
      }
    } catch (error) {
      console.error(`Failed to update project ${field}:`, error)
      errorStore.addMessage('error', `Failed to update project status. Please try again.`)
    } finally {
      loadingStore.hide()
    }
  }

  // Fetch projects function for retry
  const fetchProjects = async () => {
    try {
      loadingStore.show()
      if (filterMode.value === 'visible') {
        await projectStore.fetchEnabledProjects()
      } else {
        await projectStore.fetchProjects()
      }
      errorStore.addMessage('info', 'Projects refreshed successfully.')
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      errorStore.addMessage('error', 'Failed to refresh projects. Please try again.')
    } finally {
      loadingStore.hide()
    }
  }

  // Delete project with confirmation
  const handleDeleteProject = async (projectToDelete: ProjectResource) => {
    const result = await deleteStore.trigger(
      'Delete Project',
      `Are you sure you want to delete "${projectToDelete.internal_name}"? This action cannot be undone.`
    )

    if (result === 'delete') {
      try {
        loadingStore.show('Deleting...')
        await projectStore.deleteProject(projectToDelete.id)
        errorStore.addMessage('info', 'Project deleted successfully.')
      } catch (error) {
        console.error('Failed to delete project:', error)
        errorStore.addMessage('error', 'Failed to delete project. Please try again.')
      } finally {
        loadingStore.hide()
      }
    }
  }
</script>
