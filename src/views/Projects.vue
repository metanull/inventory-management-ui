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
      <ProjectIcon />
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
      <TableRow
        v-for="project in filteredProjects"
        :key="project.id"
        :class="{ 'opacity-50': deleteLoading && projectToDelete?.id === project.id }"
      >
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
            :disabled="deleteLoading && projectToDelete?.id === project.id"
            @toggle="updateProjectStatus(project, 'is_enabled', !project.is_enabled)"
          />
        </TableCell>
        <TableCell>
          <ToggleSmall
            title="Launched"
            :status-text="project.is_launched ? 'Launched' : 'Not launched'"
            :is-active="project.is_launched"
            :disabled="deleteLoading && projectToDelete?.id === project.id"
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
            <DeleteButton @click="confirmDelete(project)" />
          </div>
        </TableCell>
      </TableRow>
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
  import DeleteConfirmationModal from '@/components/layout/modals/DeleteConfirmationModal.vue'
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

  // Update project status
  const updateProjectStatus = async (project: ProjectResource, field: string, value: boolean) => {
    try {
      if (field === 'is_enabled') {
        await projectStore.setProjectEnabled(project.id, value)
      } else if (field === 'is_launched') {
        await projectStore.setProjectLaunched(project.id, value)
      }
    } catch (error) {
      console.error(`Failed to update project ${field}:`, error)
    }
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
