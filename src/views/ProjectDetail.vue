<template>
  <!-- Unified Project Detail View -->
  <DetailView
    :store-loading="projectStore.loading"
    :resource="isNewProject ? null : project"
    :is-creating="isNewProject"
    :is-editing="isEditing"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :status-cards="statusCardsConfig"
    :create-title="'New Project'"
    :create-subtitle="'(Creating)'"
    information-title="Project Information"
    :information-description="
      isNewProject
        ? 'Create a new project in your inventory system.'
        : 'Detailed information about this project.'
    "
    :fetch-data="fetchProject"
    @edit="startEdit"
    @save="saveEdit"
    @cancel="cancelEdit"
    @delete="handleDelete"
    @status-toggle="handleStatusToggle"
  >
    <template #information>
      <DescriptionList>
        <DescriptionRow variant="gray">
          <DescriptionTerm>Internal Name</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="isEditing || isNewProject"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ project?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow
          v-if="project?.backward_compatibility || isEditing || isNewProject"
          variant="white"
        >
          <DescriptionTerm>Legacy ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="isEditing || isNewProject"
              v-model="editForm.backward_compatibility"
              type="text"
              placeholder="Optional legacy identifier"
            />
            <DisplayText v-else>{{ project?.backward_compatibility }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow variant="gray">
          <DescriptionTerm>Launch Date</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="isEditing || isNewProject"
              v-model="editForm.launch_date"
              type="date"
            />
            <template v-else>
              <DateDisplay
                v-if="project?.launch_date"
                :date="project.launch_date"
                format="medium"
                variant="small-dark"
              />
              <DisplayText v-else variant="gray">Not scheduled</DisplayText>
            </template>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow variant="white">
          <DescriptionTerm>Default Context</DescriptionTerm>
          <DescriptionDetail>
            <GenericDropdown
              v-if="isEditing || isNewProject"
              v-model="editForm.context_id"
              :options="contexts"
              :show-no-default-option="true"
              no-default-label="No default context"
              no-default-value=""
            />
            <template v-else>
              <DisplayText v-if="project?.context">{{ project.context.internal_name }}</DisplayText>
              <DisplayText v-else variant="gray">No default context set</DisplayText>
            </template>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow variant="gray">
          <DescriptionTerm>Default Language</DescriptionTerm>
          <DescriptionDetail>
            <GenericDropdown
              v-if="isEditing || isNewProject"
              v-model="editForm.language_id"
              :options="languages"
              :show-no-default-option="true"
              no-default-label="No default language"
              no-default-value=""
            />
            <template v-else>
              <DisplayText v-if="project?.language">{{
                project.language.internal_name
              }}</DisplayText>
              <DisplayText v-else variant="gray">No default language set</DisplayText>
            </template>
          </DescriptionDetail>
        </DescriptionRow>
      </DescriptionList>
    </template>
  </DetailView>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import { useContextStore } from '@/stores/context'
  import { useLanguageStore } from '@/stores/language'
  import DateDisplay from '@/components/format/Date.vue'
  import DisplayText from '@/components/format/DisplayText.vue'
  import DetailView from '@/components/layout/detail/DetailView.vue'
  import GenericDropdown from '@/components/format/GenericDropdown.vue'
  import FormInput from '@/components/format/FormInput.vue'
  import DescriptionList from '@/components/format/description/DescriptionList.vue'
  import DescriptionRow from '@/components/format/description/DescriptionRow.vue'
  import DescriptionTerm from '@/components/format/description/DescriptionTerm.vue'
  import DescriptionDetail from '@/components/format/description/DescriptionDetail.vue'
  import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue'
  import XCircleIcon from '@/components/icons/XCircleIcon.vue'
  import RocketIcon from '@/components/icons/RocketIcon.vue'
  import PackageIcon from '@/components/icons/PackageIcon.vue'
  import ProjectIcon from '@/components/icons/ProjectIcon.vue'

  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()
  const contextStore = useContextStore()
  const languageStore = useLanguageStore()

  const project = computed(() => projectStore.currentProject)

  // Back link configuration
  const backLink = computed(() => ({
    title: 'Back to Projects',
    route: '/projects',
    icon: ProjectIcon,
    color: 'orange',
  }))

  // Dropdown options
  const contexts = computed(() => contextStore.contexts)
  const languages = computed(() => languageStore.languages)
  const defaultContext = computed(() => contextStore.defaultContext)
  const defaultLanguage = computed(() => languageStore.defaultLanguage)

  // Modal and action states
  const isEditing = ref(false)

  // Edit form data
  const editForm = ref({
    internal_name: '',
    backward_compatibility: '',
    launch_date: '',
    context_id: '',
    language_id: '',
  })

  // Track unsaved changes
  const hasUnsavedChanges = computed(() => {
    if (!isEditing.value && !isNewProject.value) return false

    // For new projects, any non-empty field indicates changes
    if (isNewProject.value) {
      return (
        editForm.value.internal_name.trim() !== '' ||
        editForm.value.backward_compatibility.trim() !== '' ||
        editForm.value.launch_date.trim() !== '' ||
        editForm.value.context_id !== '' ||
        editForm.value.language_id !== ''
      )
    }

    // For existing projects, compare with original values
    if (!project.value) return false

    let originalLaunchDate = ''
    if (project.value.launch_date) {
      originalLaunchDate = project.value.launch_date.split('T')[0]
    }

    return (
      editForm.value.internal_name !== project.value.internal_name ||
      editForm.value.backward_compatibility !== (project.value.backward_compatibility || '') ||
      editForm.value.launch_date !== originalLaunchDate ||
      editForm.value.context_id !== (project.value.context?.id || '') ||
      editForm.value.language_id !== (project.value.language?.id || '')
    )
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
    }
  })

  // Toggle enabled status
  const toggleEnabled = async () => {
    if (!project.value) return

    try {
      await projectStore.setProjectEnabled(project.value.id, !project.value.is_enabled)
    } catch (error) {
      console.error('Failed to toggle enabled status:', error)
    }
  }

  // Toggle launched status
  const toggleLaunched = async () => {
    if (!project.value) return

    try {
      await projectStore.setProjectLaunched(project.value.id, !project.value.is_launched)
    } catch (error) {
      console.error('Failed to toggle launched status:', error)
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

        // Clear the form and reset editing state before navigation
        editForm.value = {
          internal_name: '',
          backward_compatibility: '',
          launch_date: '',
          context_id: '',
          language_id: '',
        }
        isEditing.value = false

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
        description: 'Project status and availability',
        mainColor: 'green',
        statusText: project.value.is_enabled ? 'Enabled' : 'Disabled',
        toggleTitle: 'Project Status',
        isActive: project.value.is_enabled,
        loading: false,
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
        description: 'Project launch status',
        mainColor: 'blue',
        statusText: project.value.is_launched ? 'Launched' : 'Not Launched',
        toggleTitle: 'Launch Status',
        isActive: project.value.is_launched,
        loading: false,
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

  // Handle delete
  const handleDelete = async () => {
    if (project.value?.id) {
      await projectStore.deleteProject(project.value.id)
      router.push('/projects')
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (index: number) => {
    if (index === 0) {
      await toggleEnabled()
    } else if (index === 1) {
      await toggleLaunched()
    }
  }
</script>
