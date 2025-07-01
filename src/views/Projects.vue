<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
        <p class="mt-2 text-sm text-gray-600">Manage active projects</p>
      </div>
      <button
        class="btn-primary"
        @click="showCreateModal = true"
      >
        Add Project
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="projects.length === 0" class="text-gray-500 text-center py-8">
      No projects found. Create your first project to get started.
    </div>

    <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="project in projects" :key="project.id">
          <div class="px-4 py-4 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-medium text-sm">P</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ project.internal_name }}
                </div>
                <div class="text-sm text-gray-500">
                  Status: 
                  <span :class="project.is_enabled ? 'text-green-600' : 'text-red-600'">
                    {{ project.is_enabled ? 'Active' : 'Inactive' }}
                  </span>
                  {{ project.launch_date ? ` | Launched: ${new Date(project.launch_date).toLocaleDateString()}` : '' }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <RouterLink
                :to="`/projects/${project.id}`"
                class="text-primary-600 hover:text-primary-900 text-sm font-medium"
              >
                View
              </RouterLink>
              <button
                class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                @click="editProject(project)"
              >
                Edit
              </button>
              <button
                class="text-red-600 hover:text-red-900 text-sm font-medium"
                @click.stop="deleteProject(project.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Create Project' : 'Edit Project' }}
          </h3>
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label class="label">Internal Name</label>
              <input
                v-model="form.internal_name"
                type="text"
                required
                class="input"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label class="label">Launch Date</label>
              <input
                v-model="form.launch_date"
                type="date"
                class="input"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="form.is_enabled"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">
                Project is active
              </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                class="btn-outline"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting"
              >
                {{ submitting ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { apiClient, type ProjectResource } from '@/api/client'

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const projects = ref<ProjectResource[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const editingProject = ref<ProjectResource | null>(null)

  const form = reactive({
    internal_name: '',
    launch_date: '',
    is_enabled: true,
  })

  const fetchProjects = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getProjects()
      projects.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load projects'
    } finally {
      loading.value = false
    }
  }

  const handleSubmit = async () => {
    submitting.value = true

    try {
      const projectData = {
        internal_name: form.internal_name,
        launch_date: form.launch_date || null,
        is_enabled: form.is_enabled,
      }

      if (showCreateModal.value) {
        await apiClient.createProject(projectData)
      } else if (editingProject.value) {
        await apiClient.updateProject(editingProject.value.id, projectData)
      }
      
      await fetchProjects()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to save project'
    } finally {
      submitting.value = false
    }
  }

  const editProject = (project: ProjectResource) => {
    editingProject.value = project
    form.internal_name = project.internal_name
    form.launch_date = project.launch_date || ''
    form.is_enabled = project.is_enabled
    showEditModal.value = true
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await apiClient.deleteProject(id)
      await fetchProjects()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete project'
    }
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingProject.value = null
    form.internal_name = ''
    form.launch_date = ''
    form.is_enabled = true
  }

  onMounted(() => {
    fetchProjects()
  })
</script>
