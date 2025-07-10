<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Edit Country' : 'Create New Country' }}
        </h3>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="id" class="block text-sm font-medium text-gray-700"
              >ID (ISO 3166-1 alpha-3 code)</label
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
              placeholder="e.g., USA, CAN, GBR"
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
              placeholder="e.g., United States, Canada, United Kingdom"
            />
            <p v-if="validationErrors.internal_name" class="mt-1 text-sm text-red-600">
              {{ validationErrors.internal_name }}
            </p>
          </div>

          <div>
            <label for="backward_compatibility" class="block text-sm font-medium text-gray-700"
              >Backward Compatibility (optional)</label
            >
            <input
              id="backward_compatibility"
              v-model="formData.backward_compatibility"
              type="text"
              maxlength="2"
              minlength="2"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., US, CA, GB"
            />
            <p v-if="validationErrors.backward_compatibility" class="mt-1 text-sm text-red-600">
              {{ validationErrors.backward_compatibility }}
            </p>
            <p class="mt-1 text-xs text-gray-500">
              Legacy 2-letter country code for compatibility (ISO 3166-1 alpha-2)
            </p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="countryStore.loading || !isFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="countryStore.loading"
                class="animate-spin h-4 w-4"
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
              {{ isEditing ? 'Update Country' : 'Create Country' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import type {
    CountryResource,
    CountryStoreRequest,
    CountryUpdateRequest,
  } from '@metanull/inventory-app-api-client'
  import { useCountryStore } from '@/stores/country'
  import { ErrorHandler } from '@/utils/errorHandler'

  // Props
  interface Props {
    isVisible: boolean
    country?: CountryResource | null
  }

  const props = withDefaults(defineProps<Props>(), {
    country: null,
  })

  // Emits
  const emit = defineEmits<{
    close: []
    success: [country: CountryResource]
  }>()

  // Store
  const countryStore = useCountryStore()

  // Form data
  const formData = ref<CountryStoreRequest>({
    id: '',
    internal_name: '',
    backward_compatibility: null,
  })

  // Validation errors
  const validationErrors = ref<Record<string, string>>({})

  // Computed
  const isEditing = computed(() => props.country !== null)

  const isFormValid = computed(() => {
    return (
      formData.value.id.trim().length === 3 &&
      formData.value.internal_name.trim().length > 0 &&
      Object.keys(validationErrors.value).length === 0
    )
  })

  // Methods
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'id':
        if (!value.trim()) return 'ID is required'
        if (value.length !== 3) return 'ID must be exactly 3 characters (ISO 3166-1 alpha-3)'
        if (!/^[A-Z]{3}$/.test(value.toUpperCase())) return 'ID must contain only uppercase letters'
        // Check for duplicate ID when creating
        if (!isEditing.value && countryStore.findCountryById(value.toUpperCase())) {
          return 'A country with this ID already exists'
        }
        return null

      case 'internal_name':
        if (!value.trim()) return 'Internal name is required'
        if (value.trim().length < 2) return 'Internal name must be at least 2 characters'
        return null

      case 'backward_compatibility':
        if (value && value.length !== 2)
          return 'Backward compatibility must be exactly 2 characters'
        if (value && !/^[A-Z]{2}$/.test(value.toUpperCase()))
          return 'Must contain only uppercase letters'
        return null

      default:
        return null
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate all fields
    const fields = ['id', 'internal_name', 'backward_compatibility'] as const
    for (const field of fields) {
      const value = formData.value[field] as string
      const error = validateField(field, value || '')
      if (error) {
        errors[field] = error
      }
    }

    validationErrors.value = errors
    return Object.keys(errors).length === 0
  }

  const resetForm = (): void => {
    formData.value = {
      id: '',
      internal_name: '',
      backward_compatibility: null,
    }
    validationErrors.value = {}
  }

  const populateForm = (country: CountryResource): void => {
    formData.value = {
      id: country.id,
      internal_name: country.internal_name,
      backward_compatibility: country.backward_compatibility || null,
    }
    validationErrors.value = {}
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    try {
      // Ensure uppercase for ID and backward compatibility
      const submitData = {
        ...formData.value,
        id: formData.value.id.toUpperCase(),
        backward_compatibility: formData.value.backward_compatibility?.toUpperCase() || null,
      }

      let result: CountryResource | null = null

      if (isEditing.value && props.country) {
        // Update existing country
        const updateData: CountryUpdateRequest = {
          internal_name: submitData.internal_name,
          backward_compatibility: submitData.backward_compatibility,
        }
        result = await countryStore.updateCountry(props.country.id, updateData)
      } else {
        // Create new country
        result = await countryStore.createCountry(submitData)
      }

      if (result) {
        emit('success', result)
        closeModal()
      }
    } catch (error) {
      ErrorHandler.handleError(error, isEditing.value ? 'updateCountry' : 'createCountry')
    }
  }

  const closeModal = (): void => {
    resetForm()
    emit('close')
  }

  // Watchers
  watch(
    () => props.isVisible,
    (newValue: boolean) => {
      if (newValue) {
        if (props.country) {
          populateForm(props.country)
        } else {
          resetForm()
        }
        // Focus the first input field
        nextTick(() => {
          const firstInput = document.getElementById('id')
          if (firstInput && !isEditing.value) {
            firstInput.focus()
          } else if (isEditing.value) {
            const nameInput = document.getElementById('internal_name')
            if (nameInput) {
              nameInput.focus()
            }
          }
        })
      }
    }
  )

  // Real-time validation
  watch(
    () => formData.value.id,
    (newValue: string) => {
      if (newValue) {
        formData.value.id = newValue.toUpperCase()
        const error = validateField('id', newValue)
        if (error) {
          validationErrors.value.id = error
        } else {
          delete validationErrors.value.id
        }
      }
    }
  )

  watch(
    () => formData.value.internal_name,
    (newValue: string) => {
      const error = validateField('internal_name', newValue)
      if (error) {
        validationErrors.value.internal_name = error
      } else {
        delete validationErrors.value.internal_name
      }
    }
  )

  watch(
    () => formData.value.backward_compatibility,
    (newValue: string | null | undefined) => {
      if (newValue) {
        formData.value.backward_compatibility = newValue.toUpperCase()
        const error = validateField('backward_compatibility', newValue)
        if (error) {
          validationErrors.value.backward_compatibility = error
        } else {
          delete validationErrors.value.backward_compatibility
        }
      } else {
        delete validationErrors.value.backward_compatibility
      }
    }
  )
</script>
