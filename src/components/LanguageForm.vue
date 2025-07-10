<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Edit Language' : 'Create New Language' }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="id" class="block text-sm font-medium text-gray-700"
              >ID (ISO 639-1 code)</label
            >
            <input
              id="id"
              v-model="formData.id"
              :disabled="isEditing"
              type="text"
              maxlength="3"
              minlength="3"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="e.g., eng, fra, spa"
            />
            <p v-if="validationErrors.id" class="mt-1 text-sm text-red-600">
              {{ validationErrors.id }}
            </p>
          </div>

          <div>
            <label for="internal_name" class="block text-sm font-medium text-gray-700"
              >Internal Name</label
            >
            <input
              id="internal_name"
              v-model="formData.internal_name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., English, French, Spanish"
            />
            <p v-if="validationErrors.internal_name" class="mt-1 text-sm text-red-600">
              {{ validationErrors.internal_name }}
            </p>
          </div>

          <div>
            <label for="backward_compatibility" class="block text-sm font-medium text-gray-700"
              >Backward Compatibility (2 chars, optional)</label
            >
            <input
              id="backward_compatibility"
              v-model="formData.backward_compatibility"
              type="text"
              maxlength="2"
              minlength="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., en, fr, es"
            />
            <p v-if="validationErrors.backward_compatibility" class="mt-1 text-sm text-red-600">
              {{ validationErrors.backward_compatibility }}
            </p>
          </div>

          <div class="flex items-center">
            <input
              id="is_default"
              v-model="formData.is_default"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="is_default" class="ml-2 block text-sm text-gray-900">
              Set as default language
            </label>
            <p v-if="validationErrors.is_default" class="mt-1 text-sm text-red-600">
              {{ validationErrors.is_default }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
              @click="handleCancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
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
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue'
  import { useLanguageStore } from '@/stores/language'
  import { useErrorHandler } from '@/utils/errorHandler'
  import type { LanguageResource } from '@metanull/inventory-app-api-client'

  interface Props {
    isVisible: boolean
    language?: LanguageResource | null
  }

  interface Emits {
    close: []
    success: []
  }

  const props = withDefaults(defineProps<Props>(), {
    language: null,
  })

  const emit = defineEmits<Emits>()

  const languageStore = useLanguageStore()
  const { clearValidationErrors, getFieldError } = useErrorHandler()

  const isSubmitting = ref(false)

  const formData = reactive({
    id: '',
    internal_name: '',
    backward_compatibility: '',
    is_default: false,
  })

  const validationErrors = reactive({
    id: '',
    internal_name: '',
    backward_compatibility: '',
    is_default: '',
  })

  const isEditing = computed(() => !!props.language)

  // Define functions before they're used
  const clearFormErrors = () => {
    validationErrors.id = ''
    validationErrors.internal_name = ''
    validationErrors.backward_compatibility = ''
    validationErrors.is_default = ''
  }

  const resetForm = () => {
    formData.id = ''
    formData.internal_name = ''
    formData.backward_compatibility = ''
    formData.is_default = false
    clearFormErrors()
  }

  // Watch for language prop changes to populate form
  watch(
    () => props.language,
    (newLanguage: LanguageResource | null) => {
      if (newLanguage) {
        formData.id = newLanguage.id
        formData.internal_name = newLanguage.internal_name
        formData.backward_compatibility = newLanguage.backward_compatibility || ''
        formData.is_default = newLanguage.is_default
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )

  // Watch for prop visibility changes to clear errors
  watch(
    () => props.isVisible,
    (visible: boolean) => {
      if (visible) {
        clearValidationErrors()
        clearFormErrors()
      }
    }
  )

  const validateForm = (): boolean => {
    clearFormErrors()
    let isValid = true

    // Validate ID
    if (!formData.id.trim()) {
      validationErrors.id = 'Language ID is required'
      isValid = false
    } else if (formData.id.length !== 3) {
      validationErrors.id = 'Language ID must be exactly 3 characters'
      isValid = false
    } else if (!/^[a-z]{3}$/.test(formData.id)) {
      validationErrors.id = 'Language ID must contain only lowercase letters'
      isValid = false
    }

    // Validate internal name
    if (!formData.internal_name.trim()) {
      validationErrors.internal_name = 'Internal name is required'
      isValid = false
    } else if (formData.internal_name.length > 100) {
      validationErrors.internal_name = 'Internal name must be 100 characters or less'
      isValid = false
    }

    // Validate backward compatibility (optional)
    if (formData.backward_compatibility && formData.backward_compatibility.length !== 2) {
      validationErrors.backward_compatibility =
        'Backward compatibility code must be exactly 2 characters'
      isValid = false
    } else if (
      formData.backward_compatibility &&
      !/^[a-z]{2}$/.test(formData.backward_compatibility)
    ) {
      validationErrors.backward_compatibility =
        'Backward compatibility code must contain only lowercase letters'
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    isSubmitting.value = true
    clearValidationErrors()

    try {
      const requestData = {
        internal_name: formData.internal_name,
        backward_compatibility: formData.backward_compatibility || null,
        is_default: formData.is_default,
      }

      if (isEditing.value) {
        await languageStore.updateLanguage(formData.id, requestData)
      } else {
        await languageStore.createLanguage({
          id: formData.id,
          ...requestData,
        })
      }

      emit('success')
      emit('close')
    } catch (error) {
      // Check for validation errors from the API
      const fieldErrors = ['id', 'internal_name', 'backward_compatibility', 'is_default']
      fieldErrors.forEach(field => {
        const fieldError = getFieldError(field)
        if (fieldError) {
          validationErrors[field as keyof typeof validationErrors] = fieldError
        }
      })

      console.error('Form submission error:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleCancel = () => {
    clearValidationErrors()
    emit('close')
  }
</script>
