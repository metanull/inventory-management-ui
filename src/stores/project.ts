import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  ProjectApi,
  type ProjectResource,
  type StoreProjectRequest,
  type UpdateProjectRequest,
} from '@metanull/inventory-app-api-client'
import { createApiConfig, useApiCall, createPaginatedStoreState } from '@/utils/storeFunctions'

export const useProjectStore = defineStore('project', () => {
  const state = createPaginatedStoreState<ProjectResource>()
  const { category: projects, currentEntry: currentProject, pageLinks, pageMeta, loading, error } = state

  // Project-specific state
  const allProjects = ref<ProjectResource[]>([])
  const visibleProjects = ref<ProjectResource[]>([])

  const getApi = () => new ProjectApi(createApiConfig())

  // Computed
  const enabledProjects = computed(() => projects.value.filter(p => p.is_enabled))
  const launchedProjects = computed(() => projects.value.filter(p => p.is_launched))

  // Actions
  const fetchProjects = async (page: number = 1, perPage: number = 10) => {
    const res = await useApiCall(
      'fetchProjects',
      () => getApi().projectIndex(page, perPage),
      loading,
      error,
      'Failed to fetch projects'
    )
    if (res?.data) {
      projects.value = res.data.data || []
      pageLinks.value = res.data.links || null
      pageMeta.value = res.data.meta || null
    }
    return projects.value
  }

  const fetchAllProjects = async () => {
    const fullList: ProjectResource[] = []
    let currentPage = 1
    let hasMorePages = true

    const res = await useApiCall(
      'fetchAllProjects',
      async () => {
        while (hasMorePages) {
          const response = await getApi().projectIndex(currentPage, 100)
          const data = response.data.data || []
          const meta = response.data.meta
          fullList.push(...data)
          if (meta && meta.current_page < meta.last_page) currentPage++
          else hasMorePages = false
        }
        return fullList
      },
      loading,
      error,
      'Failed to fetch all projects'
    )

    if (res) {
      allProjects.value = [...res].sort((a, b) =>
        (a.internal_name || '').localeCompare(b.internal_name || '')
      )
    }
    return allProjects.value
  }

  const fetchEnabledProjects = async () => {
    const res = await useApiCall(
      'fetchEnabledProjects',
      () => getApi().projectEnabled(),
      loading,
      error,
      'Failed to fetch enabled projects'
    )
    visibleProjects.value = res?.data?.data || []
  }

  const fetchProject = async (id: string) => {
    state.clearCurrent()
    const res = await useApiCall(
      'fetchProject',
      () => getApi().projectShow(id),
      loading,
      error,
      `Failed to fetch project ${id}`
    )
    if (res?.data?.data) currentProject.value = res.data.data
    return res?.data?.data
  }

  const createProject = async (data: StoreProjectRequest) => {
    const res = await useApiCall(
      'createProject',
      () => getApi().projectStore(data),
      loading,
      error,
      'Failed to create project'
    )
    if (res?.data?.data) {
      projects.value.push(res.data.data)
      currentProject.value = res.data.data
    }
    return res?.data?.data || null
  }

  const updateProject = async (id: string, data: UpdateProjectRequest) => {
    const res = await useApiCall(
      'updateProject',
      () => getApi().projectUpdate(id, data),
      loading,
      error,
      'Failed to update project'
    )
    if (res?.data?.data) {
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx !== -1) projects.value[idx] = res.data.data
      if (currentProject.value?.id === id) currentProject.value = res.data.data
    }
    return res?.data?.data || null
  }

  const deleteProject = async (id: string) => {
    const res = await useApiCall(
      'deleteProject',
      () => getApi().projectDestroy(id),
      loading,
      error,
      'Failed to delete project'
    )
    if (res) {
      projects.value = projects.value.filter(p => p.id !== id)
      if (currentProject.value?.id === id) state.clearCurrent()
    }
  }

  const setProjectEnabled = async (id: string, isEnabled: boolean) => {
    const res = await useApiCall(
      'setProjectEnabled',
      () => getApi().projectSetEnabled(id, { is_enabled: isEnabled }),
      loading,
      error,
      'Failed to set project enabled status'
    )
    if (res?.data?.data) {
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx !== -1) projects.value[idx] = res.data.data
      if (currentProject.value?.id === id) currentProject.value = res.data.data
    }
    return res?.data?.data || null
  }

  const setProjectLaunched = async (id: string, isLaunched: boolean) => {
    const res = await useApiCall(
      'setProjectLaunched',
      () => getApi().projectSetLaunched(id, { is_launched: isLaunched }),
      loading,
      error,
      'Failed to set project launched status'
    )
    if (res?.data?.data) {
      const idx = projects.value.findIndex(p => p.id === id)
      if (idx !== -1) projects.value[idx] = res.data.data
      if (currentProject.value?.id === id) currentProject.value = res.data.data
    }
    return res?.data?.data || null
  }

  // Helper actions
  const clearProjects = () => {
    projects.value = []
    visibleProjects.value = []
    state.clearCurrent()
  }

  return {
    ...state,
    allProjects,
    visibleProjects,
    pageLinks,
    pageMeta,
    enabledProjects,
    launchedProjects,
    getProjectById: (id: string) => projects.value.find(p => p.id === id),
    fetchProjects,
    fetchAllProjects,
    fetchEnabledProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setProjectEnabled,
    setProjectLaunched,
    enableProject: (id: string) => setProjectEnabled(id, true),
    disableProject: (id: string) => setProjectEnabled(id, false),
    launchProject: (id: string) => setProjectLaunched(id, true),
    unlaunchProject: (id: string) => setProjectLaunched(id, false),
    clearProjects,
  }
})
