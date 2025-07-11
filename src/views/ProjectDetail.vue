<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <ErrorDisplay v-else-if="error" :error="error" @retry="fetchProject" />

    <!-- Project Details -->
    <div v-else-if="project" class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow" :class="{ 'border-l-4 border-blue-500': isEditing }">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ project.internal_name }}
                <span v-if="isEditing" class="text-sm font-normal text-blue-600 ml-2"
                  >(Editing)</span
                >
              </h1>
              <p v-if="project.backward_compatibility" class="text-sm text-gray-500">
                Legacy ID: {{ project.backward_compatibility }}
              </p>
            </div>
            <div class="flex space-x-3">
              <template v-if="!isEditing">
                <button
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  @click="startEdit"
                >
                  Edit
                </button>
                <button
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  @click="confirmDelete"
                >
                  Delete
                </button>
              </template>
              <template v-else>
                <button
                  :disabled="saveLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="saveEdit"
                >
                  <svg
                    v-if="saveLoading"
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Save
                </button>
                <button
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  @click="cancelEdit"
                >
                  Cancel
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Cards -->
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
        :class="{ 'opacity-50 pointer-events-none': isEditing }"
      >
        <!-- Enabled Status Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    project.is_enabled ? 'bg-green-100' : 'bg-red-100',
                  ]"
                >
                  <svg
                    :class="['w-5 h-5', project.is_enabled ? 'text-green-600' : 'text-red-600']"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      v-if="project.is_enabled"
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                    <path
                      v-else
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Status</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ project.is_enabled ? 'Enabled' : 'Disabled' }}
                  </dd>
                </dl>
              </div>
              <div class="ml-5 flex-shrink-0">
                <button
                  :disabled="toggleLoading || isEditing"
                  :class="[
                    'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    project.is_enabled
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : 'text-green-700 bg-green-100 hover:bg-green-200',
                  ]"
                  @click="toggleEnabled"
                >
                  {{ project.is_enabled ? 'Disable' : 'Enable' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Launch Status Card -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    project.is_launched ? 'bg-blue-100' : 'bg-gray-100',
                  ]"
                >
                  <svg
                    :class="['w-5 h-5', project.is_launched ? 'text-blue-600' : 'text-gray-600']"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Launch Status</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ project.is_launched ? 'Launched' : 'Not Launched' }}
                  </dd>
                </dl>
              </div>
              <div class="ml-5 flex-shrink-0">
                <button
                  :disabled="toggleLoading || isEditing"
                  :class="[
                    'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
                    project.is_launched
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      : 'text-blue-700 bg-blue-100 hover:bg-blue-200',
                  ]"
                  @click="toggleLaunched"
                >
                  {{ project.is_launched ? 'Mark as Not Launched' : 'Launch' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Information -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about this project.
          </p>
        </div>
        <div class="border-t border-gray-200">
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
                <span v-else>{{ project.internal_name }}</span>
              </dd>
            </div>
            <div
              v-if="project.backward_compatibility || isEditing"
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
                <span v-else>{{ project.backward_compatibility }}</span>
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
                    v-if="project.launch_date"
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
                        getDropdownOptionClasses(
                          editForm.context_id === context.id,
                          context.is_default
                        )
                      "
                    >
                      {{ context.internal_name
                      }}{{
                        getDropdownOptionLabel(
                          editForm.context_id === context.id,
                          context.is_default
                        )
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
                    {{ context.internal_name
                    }}{{ getDropdownOptionLabel(false, context.is_default) }}
                  </option>
                </select>
                <template v-else>
                  <span v-if="project.context">{{ project.context.internal_name }}</span>
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
                    {{ language.internal_name
                    }}{{ getDropdownOptionLabel(false, language.is_default) }}
                  </option>
                </select>
                <template v-else>
                  <span v-if="project.language">{{ project.language.internal_name }}</span>
                  <span v-else class="text-gray-500">No default language set</span>
                </template>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- System Properties -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-base leading-6 font-medium text-gray-700">System Properties</h3>
          <p class="mt-1 max-w-2xl text-xs text-gray-400">
            Internal system data managed by the API.
          </p>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">ID</dt>
              <dd class="mt-1 sm:mt-0 sm:col-span-2">
                <UuidDisplay :uuid="project.id" format="long" class="text-xs text-gray-600" />
              </dd>
            </div>
            <div class="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">Created</dt>
              <dd class="mt-1 sm:mt-0 sm:col-span-2">
                <DateDisplay
                  :date="project.created_at"
                  format="medium"
                  show-time
                  class="text-xs text-gray-600"
                />
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Last Updated
              </dt>
              <dd class="mt-1 sm:mt-0 sm:col-span-2">
                <DateDisplay
                  :date="project.updated_at"
                  format="medium"
                  show-time
                  class="text-xs text-gray-600"
                />
              </dd>
            </div>
          </dl>
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
                    Are you sure you want to delete "{{ project?.internal_name }}"? This action
                    cannot be undone.
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
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
  import { useProjectStore } from '@/stores/project'
  import { useContextStore } from '@/stores/context'
  import { useLanguageStore } from '@/stores/language'
  import ErrorDisplay from '@/components/ErrorDisplay.vue'
  import DateDisplay from '@/components/DateDisplay.vue'
  import UuidDisplay from '@/components/UuidDisplay.vue'
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
  const loading = computed(() => projectStore.loading)
  const error = computed(() => projectStore.error)

  // Dropdown options
  const contexts = computed(() => contextStore.contexts)
  const languages = computed(() => languageStore.languages)
  const defaultContext = computed(() => contextStore.defaultContext)
  const defaultLanguage = computed(() => languageStore.defaultLanguage)

  // Sorted dropdown options with priority items first
  const sortedContexts = computed(() => {
    if (!contexts.value.length) return []

    const priorityItems = []
    const remainingItems = []

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
    if (!languages.value.length) return []

    const priorityItems = []
    const remainingItems = []

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

  // Fetch project on mount
  onMounted(async () => {
    const projectId = route.params.id as string
    if (projectId) {
      try {
        // Fetch project data and dropdown options in parallel
        await Promise.all([
          projectStore.fetchProject(projectId),
          contextStore.fetchContexts(),
          languageStore.fetchLanguages(),
        ])

        // Check if we should start in edit mode after data is loaded
        checkEditMode()
      } catch (error) {
        console.error('Failed to fetch project or dropdown data:', error)
      }
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
    if (!project.value) return

    saveLoading.value = true
    try {
      await projectStore.updateProject(project.value.id, {
        internal_name: editForm.value.internal_name,
        backward_compatibility: editForm.value.backward_compatibility || null,
        launch_date: editForm.value.launch_date || null,
        context_id: editForm.value.context_id || null,
        language_id: editForm.value.language_id || null,
      })
      isEditing.value = false

      // Remove edit query parameter if present
      if (route.query.edit) {
        const query = { ...route.query }
        delete query.edit
        router.replace({ query })
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
    if (projectId) {
      try {
        await projectStore.fetchProject(projectId)
      } catch (error) {
        console.error('Failed to fetch project:', error)
      }
    }
  }
</script>
