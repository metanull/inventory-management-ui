<template>
  <div>
    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Projects</h1>
        <p class="mt-2 text-sm text-gray-700">
          Manage projects in your inventory system. Projects can be enabled/disabled and
          launched/not launched.
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <router-link
          to="/projects/new"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Project
        </router-link>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="mt-6 flex space-x-1">
      <button
        :class="[
          filterMode === 'all'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:text-gray-700',
          'px-3 py-2 font-medium text-sm rounded-md',
        ]"
        @click="filterMode = 'all'"
      >
        All Projects ({{ projects.length }})
      </button>
      <button
        :class="[
          filterMode === 'enabled'
            ? 'bg-green-100 text-green-700'
            : 'text-gray-500 hover:text-gray-700',
          'px-3 py-2 font-medium text-sm rounded-md',
        ]"
        @click="filterMode = 'enabled'"
      >
        Enabled ({{ enabledProjects.length }})
      </button>
      <button
        :class="[
          filterMode === 'launched'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-500 hover:text-gray-700',
          'px-3 py-2 font-medium text-sm rounded-md',
        ]"
        @click="filterMode = 'launched'"
      >
        Launched ({{ launchedProjects.length }})
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchProjects" />

    <!-- Empty State -->
    <div v-else-if="filteredProjects.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{
          filterMode === 'all'
            ? 'Get started by creating a new project.'
            : `No ${filterMode} projects found.`
        }}
      </p>
      <div v-if="filterMode === 'all'" class="mt-6">
        <router-link
          to="/projects/new"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            class="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Project
        </router-link>
      </div>
    </div>

    <!-- Projects Table -->
    <div v-else class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
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
                          project.is_enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800',
                        ]"
                      >
                        {{ project.is_enabled ? 'Enabled' : 'Disabled' }}
                      </span>
                      <span
                        :class="[
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          project.is_launched
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800',
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      title="Delete Project"
      :message="`Are you sure you want to delete &quot;${projectToDelete?.internal_name}&quot;? This action cannot be undone.`"
      :loading="deleteLoading"
      @confirm="deleteProject"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'
  import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue'
  import LoadingSpinner from '@/components/LoadingSpinner.vue'
  import type { ProjectResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/actions/ViewButton.vue'
  import EditButton from '@/components/actions/EditButton.vue'
  import DeleteButton from '@/components/actions/DeleteButton.vue'
  import DateDisplay from '@/components/DateDisplay.vue'
  import ResourceNameDisplay from '@/components/ResourceNameDisplay.vue'

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
