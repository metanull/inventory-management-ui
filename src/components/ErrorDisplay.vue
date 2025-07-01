<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 transform translate-y-[-100%]"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform translate-y-[-100%]"
    >
      <div
        v-if="errorState.isVisible && errorState.errors.length > 0"
        class="fixed top-0 left-0 right-0 z-50 pointer-events-none"
        role="alert"
        aria-live="assertive"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div class="space-y-2 pointer-events-auto">
            <div
              v-for="(error, index) in errorState.errors"
              :key="`error-${index}`"
              :class="['rounded-lg shadow-lg flex items-start p-4', getErrorClasses(error)]"
            >
              <!-- Error Icon -->
              <div class="flex-shrink-0 mr-3">
                <ExclamationTriangleIcon
                  v-if="(error.status ?? 0) >= 400 && (error.status ?? 0) < 500"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
                <XCircleIcon
                  v-else-if="(error.status ?? 0) >= 500"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
                <ExclamationCircleIcon v-else class="h-5 w-5" aria-hidden="true" />
              </div>

              <!-- Error Content -->
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium">
                  {{ getErrorTitle(error) }}
                </h3>
                <div class="mt-1 text-sm opacity-90">
                  {{ error.message }}
                </div>

                <!-- Validation Errors Details -->
                <div
                  v-if="error.code === 'VALIDATION_ERROR' && getValidationErrors(error).length > 0"
                  class="mt-2 text-xs opacity-80"
                >
                  <ul class="list-disc list-inside space-y-1">
                    <li
                      v-for="validationError in getValidationErrors(error)"
                      :key="`validation-${validationError.field}`"
                    >
                      <span class="font-medium">{{ formatFieldName(validationError.field) }}:</span>
                      {{ validationError.message }}
                    </li>
                  </ul>
                </div>

                <!-- Error Code (for debugging) -->
                <div v-if="isDevelopment && error.code" class="mt-1 text-xs font-mono opacity-60">
                  Code: {{ error.code }}{{ error.status ? ` (${error.status})` : '' }}
                </div>
              </div>

              <!-- Close Button -->
              <div class="flex-shrink-0 ml-3">
                <button
                  type="button"
                  :class="[
                    'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                    getCloseButtonClasses(error),
                  ]"
                  @click="clearError(index)"
                >
                  <span class="sr-only">Dismiss</span>
                  <XMarkIcon class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    ExclamationTriangleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
  } from '@heroicons/vue/24/outline'
  import { useErrorHandler } from '@/utils/errorHandler'
  import type { ApiError, ValidationError } from '@/utils/errorHandler'

  const { errorState, clearError } = useErrorHandler()

  const isDevelopment = computed(() => {
    return import.meta.env.DEV
  })

  function getErrorClasses(error: ApiError): string {
    const status = error.status || 0

    if (status === 401 || status === 403) {
      return 'bg-red-50 border border-red-200 text-red-800'
    } else if (status >= 400 && status < 500) {
      return 'bg-yellow-50 border border-yellow-200 text-yellow-800'
    } else if (status >= 500) {
      return 'bg-red-50 border border-red-200 text-red-800'
    } else if (error.code === 'NETWORK_ERROR') {
      return 'bg-gray-50 border border-gray-200 text-gray-800'
    } else {
      return 'bg-blue-50 border border-blue-200 text-blue-800'
    }
  }

  function getCloseButtonClasses(error: ApiError): string {
    const status = error.status || 0

    if (status === 401 || status === 403 || status >= 500) {
      return 'text-red-400 hover:text-red-600 focus:ring-red-600'
    } else if (status >= 400 && status < 500) {
      return 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-600'
    } else if (error.code === 'NETWORK_ERROR') {
      return 'text-gray-400 hover:text-gray-600 focus:ring-gray-600'
    } else {
      return 'text-blue-400 hover:text-blue-600 focus:ring-blue-600'
    }
  }

  function getErrorTitle(error: ApiError): string {
    const status = error.status || 0

    if (status === 401) return 'Authentication Required'
    if (status === 403) return 'Permission Denied'
    if (status === 404) return 'Not Found'
    if (status === 422) return 'Validation Error'
    if (status === 429) return 'Rate Limited'
    if (status >= 500) return 'Server Error'
    if (error.code === 'NETWORK_ERROR') return 'Network Error'

    return 'Error'
  }

  function formatFieldName(fieldName: string): string {
    if (fieldName === 'general') return 'General'

    // Convert snake_case to Title Case
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function getValidationErrors(error: ApiError): ValidationError[] {
    if (!error.details?.validationErrors) return []
    const validationErrors = error.details.validationErrors
    if (Array.isArray(validationErrors)) {
      return validationErrors as ValidationError[]
    }
    return []
  }
</script>
