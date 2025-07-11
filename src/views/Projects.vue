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
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

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
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ project.internal_name }}
                        </div>
                        <div v-if="project.backward_compatibility" class="text-sm text-gray-500">
                          Legacy ID: {{ project.backward_compatibility }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ project.launch_date ? formatDate(project.launch_date) : 'Not scheduled' }}
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
                    {{ formatDate(project.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <ViewButton @click="router.push(`/projects/${project.id}`)" />
                      <EditButton @click="router.push(`/projects/${project.id}/edit`)" />
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
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-10 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
          >&#8203;</span
        >
        <div
          class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  class="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 id="modal-title" class="text-lg leading-6 font-medium text-gray-900">
                  Delete Project
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete "{{ projectToDelete?.internal_name }}"? This
                    action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              :disabled="deleteLoading"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="deleteProject"
            >
              <svg
                v-if="deleteLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Delete
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="cancelDelete"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'
  import type { ProjectResource } from '@metanull/inventory-app-api-client'
  import ViewButton from '@/components/actions/ViewButton.vue'
  import EditButton from '@/components/actions/EditButton.vue'
  import DeleteButton from '@/components/actions/DeleteButton.vue'

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

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

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
