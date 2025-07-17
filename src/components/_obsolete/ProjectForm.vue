<template>
  <form class="space-y-6" @submit.prevent="submitForm">
    <div>
      <label for="internal_name" class="block text-sm font-medium text-gray-700">
        Internal Name <span class="text-red-500">*</span>
      </label>
      <input
        id="internal_name"
        v-model="formData.internal_name"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :class="{
          'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500':
            errors.internal_name,
        }"
        placeholder="Enter project internal name"
      />
      <p v-if="errors.internal_name" class="mt-2 text-sm text-red-600">
        {{ errors.internal_name }}
      </p>
    </div>

    <div>
      <label for="backward_compatibility" class="block text-sm font-medium text-gray-700">
        Legacy ID
      </label>
      <input
        id="backward_compatibility"
        v-model="formData.backward_compatibility"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :class="{
          'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500':
            errors.backward_compatibility,
        }"
        placeholder="Enter legacy ID (optional)"
      />
      <p v-if="errors.backward_compatibility" class="mt-2 text-sm text-red-600">
        {{ errors.backward_compatibility }}
      </p>
      <p class="mt-1 text-sm text-gray-500">
        Legacy ID when this project corresponds to a legacy project from the MWNF3 database
      </p>
    </div>

    <div>
      <label for="launch_date" class="block text-sm font-medium text-gray-700"> Launch Date </label>
      <input
        id="launch_date"
        v-model="formData.launch_date"
        type="date"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :class="{
          'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500':
            errors.launch_date,
        }"
      />
      <p v-if="errors.launch_date" class="mt-2 text-sm text-red-600">
        {{ errors.launch_date }}
      </p>
      <p class="mt-1 text-sm text-gray-500">The date when the project is planned to be launched</p>
    </div>

    <div>
      <label for="context_id" class="block text-sm font-medium text-gray-700">
        Default Context
      </label>
      <select
        id="context_id"
        v-model="formData.context_id"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :class="{
          'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500': errors.context_id,
        }"
      >
        <option value="">Select a context (optional)</option>
        <option v-for="context in contexts" :key="context.id" :value="context.id">
          {{ context.internal_name }}
        </option>
      </select>
      <p v-if="errors.context_id" class="mt-2 text-sm text-red-600">
        {{ errors.context_id }}
      </p>
      <p class="mt-1 text-sm text-gray-500">The default context used within the project</p>
    </div>

    <div>
      <label for="language_id" class="block text-sm font-medium text-gray-700">
        Default Language
      </label>
      <select
        id="language_id"
        v-model="formData.language_id"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :class="{
          'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500': errors.language_id,
        }"
      >
        <option value="">Select a language (optional)</option>
        <option v-for="language in languages" :key="language.id" :value="language.id">
          {{ language.internal_name }}
        </option>
      </select>
      <p v-if="errors.language_id" class="mt-2 text-sm text-red-600">
        {{ errors.language_id }}
      </p>
      <p class="mt-1 text-sm text-gray-500">The default language used within the project</p>
    </div>

    <div class="flex items-center">
      <input
        id="is_launched"
        v-model="formData.is_launched"
        type="checkbox"
        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label for="is_launched" class="ml-2 block text-sm text-gray-700">
        Project is launched
      </label>
    </div>

    <div class="flex items-center">
      <input
        id="is_enabled"
        v-model="formData.is_enabled"
        type="checkbox"
        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label for="is_enabled" class="ml-2 block text-sm text-gray-700">
        Project is enabled (active)
      </label>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
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
        {{ isEdit ? 'Update Project' : 'Create Project' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed, onMounted } from 'vue'
  import type { ProjectStoreRequest } from '@metanull/inventory-app-api-client'
  import { useContextStore } from '@/stores/context'
  import { useLanguageStore } from '@/stores/language'

  interface Props {
    project?: {
      id: string
      internal_name: string
      backward_compatibility?: string | null
      launch_date?: string | null
      is_launched: boolean
      is_enabled: boolean
      context_id?: string | null
      language_id?: string | null
    }
    loading?: boolean
  }

  interface Emits {
    submit: [data: ProjectStoreRequest]
    cancel: []
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
  })

  const emit = defineEmits<Emits>()

  const contextStore = useContextStore()
  const languageStore = useLanguageStore()

  const contexts = computed(() => contextStore.contexts)
  const languages = computed(() => languageStore.languages)

  const isEdit = computed(() => !!props.project)

  // Form data
  const formData = reactive<ProjectStoreRequest>({
    internal_name: '',
    backward_compatibility: null,
    launch_date: null,
    is_launched: false,
    is_enabled: true,
    context_id: null,
    language_id: null,
  })

  // Form errors
  const errors = ref<Record<string, string>>({})

  // Load existing project data when editing
  watch(
    () => props.project,
    (project: typeof props.project) => {
      if (project) {
        formData.internal_name = project.internal_name
        formData.backward_compatibility = project.backward_compatibility || null
        formData.launch_date = project.launch_date || null
        formData.is_launched = project.is_launched
        formData.is_enabled = project.is_enabled
        formData.context_id = project.context_id || null
        formData.language_id = project.language_id || null
      }
    },
    { immediate: true }
  )

  // Form validation
  const validateForm = () => {
    errors.value = {}

    if (!formData.internal_name.trim()) {
      errors.value.internal_name = 'Internal name is required'
    }

    if (formData.backward_compatibility === '') {
      formData.backward_compatibility = null
    }

    if (formData.launch_date === '') {
      formData.launch_date = null
    }

    if (formData.context_id === '') {
      formData.context_id = null
    }

    if (formData.language_id === '') {
      formData.language_id = null
    }

    return Object.keys(errors.value).length === 0
  }

  // Form submission
  const submitForm = () => {
    if (validateForm()) {
      emit('submit', { ...formData })
    }
  }

  // Load contexts and languages on mount
  onMounted(async () => {
    try {
      await Promise.all([contextStore.fetchContexts(), languageStore.fetchLanguages()])
    } catch (error) {
      console.error('Failed to load contexts or languages:', error)
    }
  })
</script>
