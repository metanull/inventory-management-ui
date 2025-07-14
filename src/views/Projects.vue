<template>
  <ListView
    title="Projects"
    description="Manage projects in your inventory system. Projects can be enabled/disabled and launched/not launched."
    add-button-route="/projects/new"
    add-button-label="Add Project"
    :loading="loading"
    :error="error"
    :is-empty="filteredProjects.length === 0"
    empty-title="No projects found"
    :empty-message="
      filterMode === 'all'
        ? 'Get started by creating a new project.'
        : `No ${filterMode} projects found.`
    "
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Project"
    @retry="fetchProjects"
  >
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
            Launch Date
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Status
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <DateDisplay v-if="project.launch_date" :date="project.launch_date" />
              <span v-else>Not scheduled</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex space-x-2">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    project.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ project.is_enabled ? 'Enabled' : 'Disabled' }}
                </span>
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    project.is_launched ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ project.is_launched ? 'Launched' : 'Not Launched' }}
                </span>
              </div>
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
  import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'
  import type { ProjectResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/actions/table/ViewButton.vue'
  import EditButton from '@/components/actions/table/EditButton.vue'
  import DeleteButton from '@/components/actions/table/DeleteButton.vue'
  import DateDisplay from '@/components/DateDisplay.vue'
  import ResourceNameDisplay from '@/components/ResourceNameDisplay.vue'
  import FilterButton from '@/components/FilterButton.vue'
  import ListView from '@/components/layout/ListView.vue'
  import TableView from '@/components/layout/TableView.vue'

  const router = useRouter()

  const projectStore = useProjectStore()

  const projects = computed(() => projectStore.projects)
  const enabledProjects = computed(() => projectStore.enabledProjects)
  const launchedProjects = computed(() => projectStore.launchedProjects)
  const loading = computed(() => projectStore.loading)
  const error = computed(() => projectStore.error)

  // Filter state
  const filterMode = ref<'all' | 'enabled' | 'launched'>('all')

  // Delete modal state
  const showDeleteModal = ref(false)
  const projectToDelete = ref<ProjectResource | null>(null)
  const deleteLoading = ref(false)

  // Computed filtered projects
  const filteredProjects = computed(() => {
    switch (filterMode.value) {
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
      await projectStore.fetchProjects()
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }
</script>
