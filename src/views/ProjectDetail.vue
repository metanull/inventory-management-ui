<template>
  <!-- New Project Creation -->
  <div v-if="isNewProject && initialLoading" class="flex justify-center py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <span class="ml-2">Loading project creation form...</span>
  </div>

  <!-- New Project Creation Form -->
  <div v-else-if="isNewProject" class="relative space-y-6">
    <!-- Header for New Project -->
    <div class="bg-white shadow border-l-4 border-blue-500">
      <div class="px-4 py-5 sm:px-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              New Project
              <span class="text-sm font-normal text-blue-600 ml-2">(Creating)</span>
            </h1>
          </div>
          <div class="flex space-x-3">
            <SaveButton :loading="saveLoading" @click="saveEdit" />
            <CancelButton @click="cancelEdit" />
          </div>
        </div>
      </div>
    </div>

    <!-- Information Section for New Project -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Create a new project in your inventory system.
        </p>
      </div>
      <div class="border-t border-gray-200">
        <dl>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <input
                v-model="editForm.internal_name"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter project name"
                required
              />
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Legacy ID</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <input
                v-model="editForm.backward_compatibility"
                type="text"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Optional legacy identifier"
              />
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Launch Date</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <input
                v-model="editForm.launch_date"
                type="date"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </dd>
          </div>
          <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Default Context</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <select
                v-model="editForm.context_id"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <!-- Priority items first -->
                <template v-if="sortedContexts.priorityItems.length > 0">
                  <option
                    v-for="context in sortedContexts.priorityItems"
                    :key="context.id"
                    :value="context.id"
                    :class="
                      getDropdownOptionClasses(
                        editForm.context_id === context.id,
                        context.is_default
                      )
                    "
                  >
                    {{ context.internal_name
                    }}{{
                      getDropdownOptionLabel(editForm.context_id === context.id, context.is_default)
                    }}
                  </option>
                </template>

                <!-- No default option -->
                <option
                  value=""
                  :class="getDropdownOptionClasses(editForm.context_id === '', false, true)"
                >
                  {{ DROPDOWN_OPTION_LABELS.noDefaultContext
                  }}{{ editForm.context_id === '' ? DROPDOWN_OPTION_LABELS.current : '' }}
                </option>

                <!-- Separator -->
                <option disabled>────────────────</option>

                <!-- Remaining items -->
                <option
                  v-for="context in sortedContexts.remainingItems"
                  :key="context.id"
                  :value="context.id"
                  :class="getDropdownOptionClasses(false, context.is_default)"
                >
                  {{ context.internal_name }}{{ getDropdownOptionLabel(false, context.is_default) }}
                </option>
              </select>
            </dd>
          </div>
          <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Default Language</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <select
                v-model="editForm.language_id"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <!-- Priority items first -->
                <template v-if="sortedLanguages.priorityItems.length > 0">
                  <option
                    v-for="language in sortedLanguages.priorityItems"
                    :key="language.id"
                    :value="language.id"
                    :class="
                      getDropdownOptionClasses(
                        editForm.language_id === language.id,
                        language.is_default
                      )
                    "
                  >
                    {{ language.internal_name
                    }}{{
                      getDropdownOptionLabel(
                        editForm.language_id === language.id,
                        language.is_default
                      )
                    }}
                  </option>
                </template>

                <!-- No default option -->
                <option
                  value=""
                  :class="getDropdownOptionClasses(editForm.language_id === '', false, true)"
                >
                  {{ DROPDOWN_OPTION_LABELS.noDefaultLanguage
                  }}{{ editForm.language_id === '' ? DROPDOWN_OPTION_LABELS.current : '' }}
                </option>

                <!-- Separator -->
                <option disabled>────────────────</option>

                <!-- Remaining items -->
                <option
                  v-for="language in sortedLanguages.remainingItems"
                  :key="language.id"
                  :value="language.id"
                  :class="getDropdownOptionClasses(false, language.is_default)"
                >
                  {{ language.internal_name
                  }}{{ getDropdownOptionLabel(false, language.is_default) }}
                </option>
              </select>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>

  <!-- Existing Project Detail -->
  <DetailView
    v-else
    :store-loading="projectStore.loading"
    :error="error"
    :resource="project"
    :is-editing="isEditing"
    :save-loading="saveLoading"
    :action-loading="toggleLoading"
    :status-cards="statusCardsConfig"
    information-title="Project Information"
    information-description="Detailed information about this project."
    :show-delete-modal="showDeleteModal"
    delete-modal-title="Delete Project"
    :delete-modal-message="deleteModalMessage"
    :delete-loading="deleteLoading"
    :fetch-data="fetchProject"
    @edit="startEdit"
    @delete="confirmDelete"
    @save="saveEdit"
    @cancel="cancelEdit"
    @status-toggle="handleStatusToggle"
    @confirm-delete="deleteProject"
    @cancel-delete="cancelDelete"
  >
    <template #information>
      <dl>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Internal Name</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <input
              v-if="isEditing"
              v-model="editForm.internal_name"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            <span v-else>{{ project?.internal_name }}</span>
          </dd>
        </div>
        <div
          v-if="project?.backward_compatibility || isEditing"
          class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
        >
          <dt class="text-sm font-medium text-gray-500">Legacy ID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <input
              v-if="isEditing"
              v-model="editForm.backward_compatibility"
              type="text"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Optional legacy identifier"
            />
            <span v-else>{{ project?.backward_compatibility }}</span>
          </dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Launch Date</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <input
              v-if="isEditing"
              v-model="editForm.launch_date"
              type="date"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <template v-else>
              <DateDisplay
                v-if="project?.launch_date"
                :date="project.launch_date"
                format="medium"
                class="text-sm text-gray-900"
              />
              <span v-else class="text-gray-500">Not scheduled</span>
            </template>
          </dd>
        </div>
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Default Context</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <select
              v-if="isEditing"
              v-model="editForm.context_id"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <!-- Priority items first -->
              <template v-if="sortedContexts.priorityItems.length > 0">
                <option
                  v-for="context in sortedContexts.priorityItems"
                  :key="context.id"
                  :value="context.id"
                  :class="
                    getDropdownOptionClasses(editForm.context_id === context.id, context.is_default)
                  "
                >
                  {{ context.internal_name
                  }}{{
                    getDropdownOptionLabel(editForm.context_id === context.id, context.is_default)
                  }}
                </option>
              </template>

              <!-- No default option -->
              <option
                value=""
                :class="getDropdownOptionClasses(editForm.context_id === '', false, true)"
              >
                {{ DROPDOWN_OPTION_LABELS.noDefaultContext
                }}{{ editForm.context_id === '' ? DROPDOWN_OPTION_LABELS.current : '' }}
              </option>

              <!-- Separator -->
              <option disabled>────────────────</option>

              <!-- Remaining items -->
              <option
                v-for="context in sortedContexts.remainingItems"
                :key="context.id"
                :value="context.id"
                :class="getDropdownOptionClasses(false, context.is_default)"
              >
                {{ context.internal_name }}{{ getDropdownOptionLabel(false, context.is_default) }}
              </option>
            </select>
            <template v-else>
              <span v-if="project?.context">{{ project.context.internal_name }}</span>
              <span v-else class="text-gray-500">No default context set</span>
            </template>
          </dd>
        </div>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Default Language</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <select
              v-if="isEditing"
              v-model="editForm.language_id"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <!-- Priority items first -->
              <template v-if="sortedLanguages.priorityItems.length > 0">
                <option
                  v-for="language in sortedLanguages.priorityItems"
                  :key="language.id"
                  :value="language.id"
                  :class="
                    getDropdownOptionClasses(
                      editForm.language_id === language.id,
                      language.is_default
                    )
                  "
                >
                  {{ language.internal_name
                  }}{{
                    getDropdownOptionLabel(
                      editForm.language_id === language.id,
                      language.is_default
                    )
                  }}
                </option>
              </template>

              <!-- No default option -->
              <option
                value=""
                :class="getDropdownOptionClasses(editForm.language_id === '', false, true)"
              >
                {{ DROPDOWN_OPTION_LABELS.noDefaultLanguage
                }}{{ editForm.language_id === '' ? DROPDOWN_OPTION_LABELS.current : '' }}
              </option>

              <!-- Separator -->
              <option disabled>────────────────</option>

              <!-- Remaining items -->
              <option
                v-for="language in sortedLanguages.remainingItems"
                :key="language.id"
                :value="language.id"
                :class="getDropdownOptionClasses(false, language.is_default)"
              >
                {{ language.internal_name }}{{ getDropdownOptionLabel(false, language.is_default) }}
              </option>
            </select>
            <template v-else>
              <span v-if="project?.language">{{ project.language.internal_name }}</span>
              <span v-else class="text-gray-500">No default language set</span>
            </template>
          </dd>
        </div>
      </dl>
    </template>
  </DetailView>

  <!-- Debug fallback -->
  <div
    v-if="!isNewProject && !project"
    style="background: orange; color: white; padding: 10px; margin: 10px"
  >
    DEBUG: Not new project, no existing project - Route ID: {{ route.params.id }}
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import { useContextStore } from '@/stores/context'
  import { useLanguageStore } from '@/stores/language'
  import type { ContextResource, LanguageResource } from '@metanull/inventory-app-api-client'
  import DateDisplay from '@/components/DateDisplay.vue'
  import DetailView from '@/components/layout/DetailView.vue'
  import SaveButton from '@/components/actions/detail/SaveButton.vue'
  import CancelButton from '@/components/actions/detail/CancelButton.vue'
  import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue'
  import XCircleIcon from '@/components/icons/XCircleIcon.vue'
  import RocketIcon from '@/components/icons/RocketIcon.vue'
  import PackageIcon from '@/components/icons/PackageIcon.vue'
  import {
    getDropdownOptionClasses,
    getDropdownOptionLabel,
    DROPDOWN_OPTION_LABELS,
  } from '@/utils/dropdownStyles'

  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()
  const contextStore = useContextStore()
  const languageStore = useLanguageStore()

  const project = computed(() => projectStore.currentProject)
  const error = computed(() => projectStore.error)

  // Dropdown options
  const contexts = computed(() => contextStore.contexts)
  const languages = computed(() => languageStore.languages)
  const defaultContext = computed(() => contextStore.defaultContext)
  const defaultLanguage = computed(() => languageStore.defaultLanguage)

  // Sorted dropdown options with priority items first
  const sortedContexts = computed(() => {
    if (!contexts.value.length) return { priorityItems: [], remainingItems: [] }

    const priorityItems: ContextResource[] = []
    const remainingItems: ContextResource[] = []

    // Add current selection if it exists and is not default
    const currentContext = contexts.value.find(c => c.id === editForm.value.context_id)
    if (currentContext && !currentContext.is_default) {
      priorityItems.push(currentContext)
    }

    // Add system default if it exists and is not current
    if (defaultContext.value && defaultContext.value.id !== editForm.value.context_id) {
      priorityItems.push(defaultContext.value)
    }

    // Add remaining items
    contexts.value.forEach(context => {
      const isAlreadyInPriority = priorityItems.some(p => p.id === context.id)
      if (!isAlreadyInPriority) {
        remainingItems.push(context)
      }
    })

    return { priorityItems, remainingItems }
  })

  const sortedLanguages = computed(() => {
    if (!languages.value.length) return { priorityItems: [], remainingItems: [] }

    const priorityItems: LanguageResource[] = []
    const remainingItems: LanguageResource[] = []

    // Add current selection if it exists and is not default
    const currentLanguage = languages.value.find(l => l.id === editForm.value.language_id)
    if (currentLanguage && !currentLanguage.is_default) {
      priorityItems.push(currentLanguage)
    }

    // Add system default if it exists and is not current
    if (defaultLanguage.value && defaultLanguage.value.id !== editForm.value.language_id) {
      priorityItems.push(defaultLanguage.value)
    }

    // Add remaining items
    languages.value.forEach(language => {
      const isAlreadyInPriority = priorityItems.some(p => p.id === language.id)
      if (!isAlreadyInPriority) {
        remainingItems.push(language)
      }
    })

    return { priorityItems, remainingItems }
  })

  // Modal and action states
  const showDeleteModal = ref(false)
  const deleteLoading = ref(false)
  const toggleLoading = ref(false)
  const initialLoading = ref(false)
  const isEditing = ref(false)
  const saveLoading = ref(false)

  // Edit form data
  const editForm = ref({
    internal_name: '',
    backward_compatibility: '',
    launch_date: '',
    context_id: '',
    language_id: '',
  })

  // Check for edit mode from query parameter
  const checkEditMode = () => {
    if (route.query.edit === 'true' && project.value) {
      startEdit()
    }
  }

  // Watch for route query changes
  watch(
    () => route.query.edit,
    (newEditValue: LocationQueryValue | LocationQueryValue[]) => {
      if (newEditValue === 'true' && project.value) {
        startEdit()
      } else if (newEditValue !== 'true' && isEditing.value) {
        cancelEdit()
      }
    }
  )

  // Check if this is a new project creation
  const isNewProject = computed(
    () => route.name === 'project-new' || route.path === '/projects/new'
  )

  // Fetch project on mount
  onMounted(async () => {
    const projectId = route.params.id as string

    initialLoading.value = true
    try {
      if (isNewProject.value) {
        // For new projects, only fetch dropdown options and start in edit mode
        await Promise.all([contextStore.fetchContexts(), languageStore.fetchLanguages()])

        // Initialize edit form with defaults
        editForm.value = {
          internal_name: '',
          backward_compatibility: '',
          launch_date: '',
          context_id: defaultContext.value?.id || '',
          language_id: defaultLanguage.value?.id || '',
        }
        isEditing.value = true
      } else if (projectId) {
        // Fetch project data and dropdown options in parallel
        await Promise.all([
          projectStore.fetchProject(projectId),
          contextStore.fetchContexts(),
          languageStore.fetchLanguages(),
        ])

        // Check if we should start in edit mode after data is loaded
        checkEditMode()
      }
    } catch (error) {
      console.error('Failed to fetch project or dropdown data:', error)
    } finally {
      initialLoading.value = false
    }
  })

  // Toggle enabled status
  const toggleEnabled = async () => {
    if (!project.value) return

    toggleLoading.value = true
    try {
      await projectStore.setProjectEnabled(project.value.id, !project.value.is_enabled)
    } catch (error) {
      console.error('Failed to toggle enabled status:', error)
    } finally {
      toggleLoading.value = false
    }
  }

  // Toggle launched status
  const toggleLaunched = async () => {
    if (!project.value) return

    toggleLoading.value = true
    try {
      await projectStore.setProjectLaunched(project.value.id, !project.value.is_launched)
    } catch (error) {
      console.error('Failed to toggle launched status:', error)
    } finally {
      toggleLoading.value = false
    }
  }

  // Delete confirmation
  const confirmDelete = () => {
    showDeleteModal.value = true
  }

  const cancelDelete = () => {
    showDeleteModal.value = false
  }

  const deleteProject = async () => {
    if (!project.value) return

    deleteLoading.value = true
    try {
      await projectStore.deleteProject(project.value.id)
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      deleteLoading.value = false
    }
  }

  // Edit functionality
  const startEdit = () => {
    if (!project.value) return

    // Format launch_date for HTML date input (YYYY-MM-DD)
    let formattedLaunchDate = ''
    if (project.value.launch_date) {
      // Extract just the date part if it's in ISO format (YYYY-MM-DDTHH:mm:ss)
      formattedLaunchDate = project.value.launch_date.split('T')[0]
    }

    editForm.value = {
      internal_name: project.value.internal_name,
      backward_compatibility: project.value.backward_compatibility || '',
      launch_date: formattedLaunchDate,
      context_id: project.value.context?.id || '',
      language_id: project.value.language?.id || '',
    }
    isEditing.value = true
  }

  const cancelEdit = () => {
    if (isNewProject.value) {
      // For new projects, navigate back to projects list
      router.push('/projects')
      return
    }

    isEditing.value = false
    editForm.value = {
      internal_name: '',
      backward_compatibility: '',
      launch_date: '',
      context_id: '',
      language_id: '',
    }

    // Remove edit query parameter if present
    if (route.query.edit) {
      const query = { ...route.query }
      delete query.edit
      router.replace({ query })
    }
  }

  const saveEdit = async () => {
    saveLoading.value = true
    try {
      const projectData = {
        internal_name: editForm.value.internal_name,
        backward_compatibility: editForm.value.backward_compatibility || null,
        launch_date: editForm.value.launch_date || null,
        context_id: editForm.value.context_id || null,
        language_id: editForm.value.language_id || null,
      }

      if (isNewProject.value) {
        // Create new project
        const newProject = await projectStore.createProject(projectData)
        // Navigate to the new project's detail page
        router.replace(`/projects/${newProject.id}`)
      } else if (project.value) {
        // Update existing project
        await projectStore.updateProject(project.value.id, projectData)
        isEditing.value = false

        // Remove edit query parameter if present
        if (route.query.edit) {
          const query = { ...route.query }
          delete query.edit
          router.replace({ query })
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      saveLoading.value = false
    }
  }

  // Fetch project function for retry
  const fetchProject = async () => {
    const projectId = route.params.id as string
    if (projectId && !isNewProject.value) {
      try {
        await projectStore.fetchProject(projectId)
      } catch (error) {
        console.error('Failed to fetch project:', error)
      }
    }
  }

  // Status cards configuration
  const statusCardsConfig = computed(() => {
    if (!project.value) return []

    return [
      {
        title: 'Status',
        statusText: project.value.is_enabled ? 'Enabled' : 'Disabled',
        isActive: project.value.is_enabled,
        disabled: false,
        activeIconBackgroundClass: 'bg-green-100',
        inactiveIconBackgroundClass: 'bg-red-100',
        activeIconClass: 'text-green-600',
        inactiveIconClass: 'text-red-600',
        activeIconComponent: CheckCircleIcon,
        inactiveIconComponent: XCircleIcon,
      },
      {
        title: 'Launch Status',
        statusText: project.value.is_launched ? 'Launched' : 'Not Launched',
        isActive: project.value.is_launched,
        disabled: !project.value.is_enabled,
        activeIconBackgroundClass: 'bg-blue-100',
        inactiveIconBackgroundClass: 'bg-gray-100',
        activeIconClass: 'text-blue-600',
        inactiveIconClass: 'text-gray-600',
        activeIconComponent: RocketIcon,
        inactiveIconComponent: PackageIcon,
      },
    ]
  })

  // Delete modal message
  const deleteModalMessage = computed(() => {
    return `Are you sure you want to delete "${project.value?.internal_name}"? This action cannot be undone.`
  })

  // Handle status toggle
  const handleStatusToggle = async (index: number) => {
    if (index === 0) {
      await toggleEnabled()
    } else if (index === 1) {
      await toggleLaunched()
    }
  }
</script>
