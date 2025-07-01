<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <RouterLink
            to="/projects"
            class="text-primary-600 hover:text-primary-900 text-sm font-medium mb-2 inline-flex items-center"
          >
            ← Back to Projects
          </RouterLink>
          <h1 class="text-3xl font-bold text-gray-900">Project Details</h1>
        </div>
        <div class="flex space-x-3">
          <button class="btn-outline" @click="editProject">Edit Project</button>
          <button
            class="text-red-600 hover:text-red-900 px-3 py-2 text-sm font-medium"
            @click="deleteProject"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <div v-else-if="error" class="text-red-600 text-center py-8">
      {{ error }}
    </div>

    <div v-else-if="project" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ project.internal_name }}
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Project information and details</p>
      </div>
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{ project.internal_name }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Status</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span
                :class="project.is_enabled ? 'text-green-600' : 'text-red-600'"
                class="font-medium"
              >
                {{ project.is_enabled ? 'Active' : 'Inactive' }}
              </span>
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Launch Date</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {{
                project.launch_date ? new Date(project.launch_date).toLocaleDateString() : 'Not set'
              }}
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">ID</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {{ project.id }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        @click.stop
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
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
              <input v-model="form.launch_date" type="date" class="input" />
            </div>

            <div class="flex items-center">
              <input
                v-model="form.is_enabled"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900"> Project is active </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" class="btn-outline" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : 'Update' }}
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
  import { useRoute, useRouter } from 'vue-router'
  import { apiClient, type ProjectResource } from '@/api/client'

  const route = useRoute()
  const router = useRouter()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const submitting = ref(false)
  const project = ref<ProjectResource | null>(null)
  const showEditModal = ref(false)

  const form = reactive({
    internal_name: '',
    launch_date: '',
    is_enabled: true,
  })

  const fetchProject = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await apiClient.getProject(route.params.id as string)
      project.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load project'
    } finally {
      loading.value = false
    }
  }

  const editProject = () => {
    if (project.value) {
      form.internal_name = project.value.internal_name
      form.launch_date = project.value.launch_date || ''
      form.is_enabled = project.value.is_enabled
      showEditModal.value = true
    }
  }

  const handleSubmit = async () => {
    if (!project.value) return

    submitting.value = true

    try {
      const projectData = {
        internal_name: form.internal_name,
        launch_date: form.launch_date || null,
        is_enabled: form.is_enabled,
      }

      await apiClient.updateProject(project.value.id, projectData)

      await fetchProject()
      closeModal()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update project'
    } finally {
      submitting.value = false
    }
  }

  const deleteProject = async () => {
    if (!project.value) return

    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await apiClient.deleteProject(project.value.id)
      router.push('/projects')
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete project'
    }
  }

  const closeModal = () => {
    showEditModal.value = false
    form.internal_name = ''
    form.launch_date = ''
    form.is_enabled = true
  }

  onMounted(() => {
    fetchProject()
  })
</script>
