<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            {{ isNewProject ? 'Create New Project' : 'Edit Project' }}
          </h1>
          <p class="mt-2 text-sm text-gray-700">
            {{
              isNewProject
                ? 'Add a new project to your inventory system.'
                : 'Update the project information.'
            }}
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <router-link
            to="/projects"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Projects
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !isNewProject" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error && !isNewProject" :error="error" @retry="fetchProject" />

    <!-- Form -->
    <div v-else class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <ProjectForm
          :project="formProject"
          :loading="submitLoading"
          @submit="submitForm"
          @cancel="cancelForm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import ProjectForm from '@/components/ProjectForm.vue'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'
  import type { ProjectStoreRequest } from '@metanull/inventory-app-api-client'

  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()

  const loading = computed(() => projectStore.loading)
  const error = computed(() => projectStore.error)
  const submitLoading = ref(false)

  const isNewProject = computed(() => route.name === 'project-new')
  const isEditMode = computed(() => route.name === 'project-edit')

  // Form project data for the component
  const formProject = computed(() => {
    if (isNewProject.value) {
      return undefined
    }

    const currentProject = projectStore.currentProject
    if (!currentProject) return undefined

    return {
      id: currentProject.id,
      internal_name: currentProject.internal_name,
      backward_compatibility: currentProject.backward_compatibility,
      launch_date: currentProject.launch_date,
      is_launched: currentProject.is_launched,
      is_enabled: currentProject.is_enabled,
      context_id: currentProject.context?.id || null,
      language_id: currentProject.language?.id || null,
    }
  })

  // Fetch project on mount for edit mode
  onMounted(async () => {
    if (!isNewProject.value) {
      const projectId = route.params.id as string
      if (projectId) {
        try {
          await projectStore.fetchProject(projectId)
        } catch (error) {
          console.error('Failed to fetch project:', error)
        }
      }
    }
  })

  // Form submission
  const submitForm = async (formData: ProjectStoreRequest) => {
    submitLoading.value = true

    try {
      if (isNewProject.value) {
        // Create new project
        const newProject = await projectStore.createProject(formData)
        router.push(`/projects/${newProject.id}`)
      } else {
        // Update existing project
        const projectId = route.params.id as string
        await projectStore.updateProject(projectId, formData)

        if (isEditMode.value) {
          router.push(`/projects/${projectId}`)
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      submitLoading.value = false
    }
  }

  // Form cancellation
  const cancelForm = () => {
    if (isNewProject.value) {
      router.push('/projects')
    } else {
      const projectId = route.params.id as string
      router.push(`/projects/${projectId}`)
    }
  }

  // Fetch project function for retry
  const fetchProject = async () => {
    if (!isNewProject.value) {
      const projectId = route.params.id as string
      if (projectId) {
        try {
          await projectStore.fetchProject(projectId)
        } catch (error) {
          console.error('Failed to fetch project:', error)
        }
      }
    }
  }
</script>
