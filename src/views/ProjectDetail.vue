<template>
  <!-- Unified Project Detail View -->
  <DetailView
    :store-loading="projectStore.loading"
    :resource="mode === 'create' ? null : project"
    :mode="mode"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :status-cards="statusCardsConfig"
    :create-title="'New Project'"
    :create-subtitle="'(Creating)'"
    information-title="Project Information"
    :information-description="informationDescription"
    :fetch-data="fetchProject"
    @edit="enterEditMode"
    @save="saveProject"
    @cancel="cancelAction"
    @delete="deleteProject"
    @status-toggle="handleStatusToggle"
  >
    <template #information>
      <DescriptionList>
        <DescriptionRow variant="gray">
          <DescriptionTerm>Internal Name</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ project?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <DescriptionRow
          v-if="project?.backward_compatibility || mode === 'edit' || mode === 'create'"
          variant="white"
        >
          <DescriptionTerm>Legacy ID</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
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
              v-if="mode === 'edit' || mode === 'create'"
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
              v-if="mode === 'edit' || mode === 'create'"
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
              v-if="mode === 'edit' || mode === 'create'"
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
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
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

  // Types
  type Mode = 'view' | 'edit' | 'create'

  interface ProjectFormData {
    internal_name: string
    backward_compatibility: string
    launch_date: string
    context_id: string
    language_id: string
  }

  // Composables
  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()
  const contextStore = useContextStore()
  const languageStore = useLanguageStore()

  // Reactive state - Single source of truth for mode
  const mode = ref<Mode>('view')

  // Computed properties
  const project = computed(() => projectStore.currentProject)

  // Dropdown options
  const contexts = computed(() => contextStore.contexts)
  const languages = computed(() => languageStore.languages)
  const defaultContext = computed(() => contextStore.defaultContext)
  const defaultLanguage = computed(() => languageStore.defaultLanguage)

  // Information description based on mode
  const informationDescription = computed(() => {
    switch (mode.value) {
      case 'create':
        return 'Create a new project in your inventory system.'
      case 'edit':
        return 'Edit detailed information about this project.'
      default:
        return 'Detailed information about this project.'
    }
  })

  // Back link configuration
  const backLink = computed(() => ({
    title: 'Back to Projects',
    route: '/projects',
    icon: ProjectIcon,
    color: 'orange',
  }))

  // Edit form data
  const editForm = ref<ProjectFormData>({
    internal_name: '',
    backward_compatibility: '',
    launch_date: '',
    context_id: '',
    language_id: '',
  })

  // Get default form values
  const getDefaultFormValues = (): ProjectFormData => ({
    internal_name: '',
    backward_compatibility: '',
    launch_date: '',
    context_id: defaultContext.value?.id || '',
    language_id: defaultLanguage.value?.id || '',
  })

  // Get form values from project
  const getFormValuesFromProject = (): ProjectFormData => {
    if (!project.value) return getDefaultFormValues()

    // Format launch_date for HTML date input (YYYY-MM-DD)
    let formattedLaunchDate = ''
    if (project.value.launch_date) {
      formattedLaunchDate = project.value.launch_date.split('T')[0]
    }

    return {
      internal_name: project.value.internal_name,
      backward_compatibility: project.value.backward_compatibility || '',
      launch_date: formattedLaunchDate,
      context_id: project.value.context?.id || '',
      language_id: project.value.language?.id || '',
    }
  }

  // Track unsaved changes
  const hasUnsavedChanges = computed(() => {
    if (mode.value === 'view') return false

    // For create mode, any non-empty field indicates changes
    if (mode.value === 'create') {
      return (
        editForm.value.internal_name.trim() !== '' ||
        editForm.value.backward_compatibility.trim() !== '' ||
        editForm.value.launch_date.trim() !== '' ||
        editForm.value.context_id !== '' ||
        editForm.value.language_id !== ''
      )
    }

    // For edit mode, compare with original values
    if (!project.value) return false

    const originalValues = getFormValuesFromProject()
    return (
      editForm.value.internal_name !== originalValues.internal_name ||
      editForm.value.backward_compatibility !== originalValues.backward_compatibility ||
      editForm.value.launch_date !== originalValues.launch_date ||
      editForm.value.context_id !== originalValues.context_id ||
      editForm.value.language_id !== originalValues.language_id
    )
  })

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

  // Mode management functions
  const enterCreateMode = () => {
    mode.value = 'create'
    editForm.value = getDefaultFormValues()
  }

  const enterEditMode = () => {
    if (!project.value) return
    mode.value = 'edit'
    editForm.value = getFormValuesFromProject()
  }

  const enterViewMode = () => {
    mode.value = 'view'
    // Clear form data when returning to view mode
    editForm.value = getDefaultFormValues()
  }

  // Action handlers
  const saveProject = async () => {
    try {
      const projectData = {
        internal_name: editForm.value.internal_name,
        backward_compatibility: editForm.value.backward_compatibility || null,
        launch_date: editForm.value.launch_date || null,
        context_id: editForm.value.context_id || null,
        language_id: editForm.value.language_id || null,
      }

      if (mode.value === 'create') {
        // Create new project
        const newProject = await projectStore.createProject(projectData)

        // Navigate to the new project's detail page in view mode
        await router.replace(`/projects/${newProject.id}`)
        mode.value = 'view'
      } else if (mode.value === 'edit' && project.value) {
        // Update existing project
        await projectStore.updateProject(project.value.id, projectData)
        enterViewMode()

        // Remove edit query parameter if present
        if (route.query.edit) {
          const query = { ...route.query }
          delete query.edit
          await router.replace({ query })
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  }

  const cancelAction = () => {
    if (mode.value === 'create') {
      // For create mode, navigate back to projects list
      router.push('/projects')
      return
    }

    if (mode.value === 'edit') {
      enterViewMode()

      // Remove edit query parameter if present
      if (route.query.edit) {
        const query = { ...route.query }
        delete query.edit
        router.replace({ query })
      }
    }
  }

  const deleteProject = async () => {
    if (project.value?.id) {
      await projectStore.deleteProject(project.value.id)
      router.push('/projects')
    }
  }

  // Status toggle handlers
  const toggleEnabled = async () => {
    if (!project.value) return

    try {
      await projectStore.setProjectEnabled(project.value.id, !project.value.is_enabled)
    } catch (error) {
      console.error('Failed to toggle enabled status:', error)
    }
  }

  const toggleLaunched = async () => {
    if (!project.value) return

    try {
      await projectStore.setProjectLaunched(project.value.id, !project.value.is_launched)
    } catch (error) {
      console.error('Failed to toggle launched status:', error)
    }
  }

  const handleStatusToggle = async (index: number) => {
    if (index === 0) {
      await toggleEnabled()
    } else if (index === 1) {
      await toggleLaunched()
    }
  }

  // Fetch project function
  const fetchProject = async () => {
    const projectId = route.params.id as string
    if (!projectId || mode.value === 'create') return

    try {
      await projectStore.fetchProject(projectId)
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }

  // Initialize component
  const initializeComponent = async () => {
    const projectId = route.params.id as string
    const isCreateRoute = route.name === 'project-new' || route.path === '/projects/new'

    try {
      if (isCreateRoute) {
        // For create mode, only fetch dropdown options
        await Promise.all([contextStore.fetchContexts(), languageStore.fetchLanguages()])
        enterCreateMode()
      } else if (projectId) {
        // For view/edit mode, fetch project data and dropdown options
        await Promise.all([
          fetchProject(),
          contextStore.fetchContexts(),
          languageStore.fetchLanguages(),
        ])

        // Check if we should start in edit mode from query parameter
        if (route.query.edit === 'true' && project.value) {
          enterEditMode()
        } else {
          enterViewMode()
        }
      }
    } catch (error) {
      console.error('Failed to initialize component:', error)
    }
  }

  // Lifecycle
  onMounted(initializeComponent)
</script>
