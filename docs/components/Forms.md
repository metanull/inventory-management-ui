# Form Components

This directory contains form-related components that provide consistent form inputs, validation, and user interactions throughout the inventory management application.

## Overview

Form components are designed to provide reusable, accessible, and consistent form elements that integrate seamlessly with the application's validation and styling patterns.

## GenericDropdown.vue

A highly reusable dropdown component with priority sorting, custom styling, and consistent behavior across the application.

### Features

- **Priority Sorting**: Automatically sorts options with priority items (default, current selection) at the top
- **Custom Highlighting**: Highlights current selection and default options
- **Consistent Styling**: Uses shared dropdown styles from utils
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Flexible Options**: Supports complex option objects with custom display formatting
- **Separator Lines**: Visual separation between priority and regular options

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` | - | Array of option objects |
| `modelValue` | `string` | - | Current selected value (v-model) |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `displayFormatter` | `(option: DropdownOption) => string` | `undefined` | Custom function to format option display |
| `disabled` | `boolean` | `false` | Whether the dropdown is disabled |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when selection changes (v-model) |
| `change` | `option: DropdownOption` | Emitted when option is selected |

### Types

```typescript
interface DropdownOption {
  id: string
  internal_name: string
  is_default?: boolean
  [key: string]: any
}
```

### Usage

```vue
<template>
  <div class="space-y-4">
    <!-- Basic usage -->
    <GenericDropdown
      v-model="selectedLanguage"
      :options="languages"
      placeholder="Select a language"
    />

    <!-- With custom display formatter -->
    <GenericDropdown
      v-model="selectedCountry"
      :options="countries"
      :display-formatter="(option) => `${option.internal_name} (${option.code})`"
      placeholder="Select a country"
    />

    <!-- Disabled state -->
    <GenericDropdown
      v-model="selectedContext"
      :options="contexts"
      :disabled="loading"
      placeholder="Select a context"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GenericDropdown from '@/components/form/GenericDropdown.vue'

const selectedLanguage = ref('')
const selectedCountry = ref('')
const selectedContext = ref('')

const languages = ref([
  { id: 'en', internal_name: 'English', is_default: true },
  { id: 'es', internal_name: 'Spanish', is_default: false },
  { id: 'fr', internal_name: 'French', is_default: false }
])

const countries = ref([
  { id: 'US', internal_name: 'United States', code: 'US', is_default: true },
  { id: 'CA', internal_name: 'Canada', code: 'CA', is_default: false },
  { id: 'MX', internal_name: 'Mexico', code: 'MX', is_default: false }
])
</script>
```

## ContextForm.vue

A modal form component for creating and editing context entries with validation and submission handling.

### Features

- **Modal Interface**: Overlay modal with proper focus management
- **Validation**: Client-side validation with error display
- **Edit Mode**: Handles both create and edit operations
- **API Integration**: Handles form submission with loading states
- **Accessibility**: Proper form labels and error associations

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | - | Whether the modal is visible |
| `isEditing` | `boolean` | `false` | Whether in edit mode |
| `initialData` | `ContextData` | `undefined` | Initial data for editing |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when modal should be closed |
| `submit` | `ContextData` | Emitted when form is submitted |

### Usage

```vue
<template>
  <div>
    <button @click="showCreateForm = true">Create Context</button>
    
    <ContextForm
      :is-visible="showCreateForm"
      :is-editing="false"
      @close="showCreateForm = false"
      @submit="handleCreateContext"
    />
    
    <ContextForm
      :is-visible="showEditForm"
      :is-editing="true"
      :initial-data="selectedContext"
      @close="showEditForm = false"
      @submit="handleUpdateContext"
    />
  </div>
</template>
```

## CountryForm.vue

A modal form component for creating and editing country entries with validation and submission handling.

### Features

- **Modal Interface**: Overlay modal with proper focus management
- **ISO Code validation**: Validates ISO 3166-1 alpha-3 country codes
- **Validation**: Client-side validation with error display
- **Edit Mode**: Handles both create and edit operations
- **API Integration**: Handles form submission with loading states

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | - | Whether the modal is visible |
| `isEditing` | `boolean` | `false` | Whether in edit mode |
| `initialData` | `CountryData` | `undefined` | Initial data for editing |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when modal should be closed |
| `submit` | `CountryData` | Emitted when form is submitted |

### Usage

```vue
<template>
  <div>
    <button @click="showCreateForm = true">Create Country</button>
    
    <CountryForm
      :is-visible="showCreateForm"
      :is-editing="false"
      @close="showCreateForm = false"
      @submit="handleCreateCountry"
    />
    
    <CountryForm
      :is-visible="showEditForm"
      :is-editing="true"
      :initial-data="selectedCountry"
      @close="showEditForm = false"
      @submit="handleUpdateCountry"
    />
  </div>
</template>
```

## LanguageForm.vue

A modal form component for creating and editing language entries with validation and submission handling.

### Features

- **Modal Interface**: Overlay modal with proper focus management
- **Language Code Validation**: Validates ISO 639 language codes
- **Validation**: Client-side validation with error display
- **Edit Mode**: Handles both create and edit operations
- **API Integration**: Handles form submission with loading states

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | - | Whether the modal is visible |
| `isEditing` | `boolean` | `false` | Whether in edit mode |
| `initialData` | `LanguageData` | `undefined` | Initial data for editing |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when modal should be closed |
| `submit` | `LanguageData` | Emitted when form is submitted |

### Usage

```vue
<template>
  <div>
    <button @click="showCreateForm = true">Create Language</button>
    
    <LanguageForm
      :is-visible="showCreateForm"
      :is-editing="false"
      @close="showCreateForm = false"
      @submit="handleCreateLanguage"
    />
    
    <LanguageForm
      :is-visible="showEditForm"
      :is-editing="true"
      :initial-data="selectedLanguage"
      @close="showEditForm = false"
      @submit="handleUpdateLanguage"
    />
  </div>
</template>
```

## ProjectForm.vue

A modal form component for creating and editing project entries with validation and submission handling.

### Features

- **Modal Interface**: Overlay modal with proper focus management
- **Complex Validation**: Multiple field validation with detailed error messages
- **Edit Mode**: Handles both create and edit operations
- **API Integration**: Handles form submission with loading states
- **Dependency Management**: Handles related data like contexts and languages

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | - | Whether the modal is visible |
| `isEditing` | `boolean` | `false` | Whether in edit mode |
| `initialData` | `ProjectData` | `undefined` | Initial data for editing |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | - | Emitted when modal should be closed |
| `submit` | `ProjectData` | Emitted when form is submitted |

### Usage

```vue
<template>
  <div>
    <button @click="showCreateForm = true">Create Project</button>
    
    <ProjectForm
      :is-visible="showCreateForm"
      :is-editing="false"
      @close="showCreateForm = false"
      @submit="handleCreateProject"
    />
    
    <ProjectForm
      :is-visible="showEditForm"
      :is-editing="true"
      :initial-data="selectedProject"
      @close="showEditForm = false"
      @submit="handleUpdateProject"
    />
  </div>
</template>
```

## Common Form Patterns

### Form Validation

All form components follow a consistent validation pattern:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="field" class="block text-sm font-medium text-gray-700">
        Field Name
      </label>
      <input
        id="field"
        v-model="formData.field"
        type="text"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        :class="{ 'border-red-500': validationErrors.field }"
      />
      <p v-if="validationErrors.field" class="mt-1 text-sm text-red-600">
        {{ validationErrors.field }}
      </p>
    </div>
  </form>
</template>
```

### Modal Structure

All form modals follow a consistent structure:

```vue
<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
  >
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ isEditing ? 'Edit Item' : 'Create New Item' }}
        </h3>
        
        <form @submit.prevent="handleSubmit">
          <!-- Form fields -->
          
          <div class="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isEditing ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
```

### Error Handling

Consistent error handling across all form components:

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

const isSubmitting = ref(false)
const validationErrors = reactive({})

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Clear previous errors
    Object.keys(validationErrors).forEach(key => {
      delete validationErrors[key]
    })
    
    // Perform validation
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      Object.assign(validationErrors, errors)
      return
    }
    
    // Submit form
    await submitForm()
    emit('submit', formData)
    emit('close')
    
  } catch (error) {
    console.error('Form submission error:', error)
    // Handle API errors
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## FormInput.vue

A reusable input component with consistent styling and v-model support for form inputs.

### Features

- **Consistent Styling**: Standardized appearance across all input fields
- **v-model Support**: Seamless two-way data binding
- **Input Type Support**: Supports all HTML input types (text, email, date, password, etc.)
- **Accessibility**: Proper attributes and semantic markup
- **Validation States**: Visual feedback for required fields
- **Disabled State**: Proper disabled styling and behavior
- **Placeholder Support**: Helpful placeholder text

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | - | Input value (v-model) |
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `disabled` | `boolean` | `false` | Whether the input is disabled |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when input value changes (v-model) |

### Usage

```vue
<template>
  <div class="space-y-4">
    <!-- Basic text input -->
    <FormInput
      v-model="formData.name"
      type="text"
      placeholder="Enter project name"
      :required="true"
    />
    
    <!-- Email input -->
    <FormInput
      v-model="formData.email"
      type="email"
      placeholder="Enter email address"
    />
    
    <!-- Date input -->
    <FormInput
      v-model="formData.launchDate"
      type="date"
    />
    
    <!-- Password input -->
    <FormInput
      v-model="formData.password"
      type="password"
      placeholder="Enter password"
      :required="true"
    />
    
    <!-- Disabled input -->
    <FormInput
      v-model="formData.id"
      type="text"
      :disabled="true"
      placeholder="Auto-generated ID"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormInput from '@/components/form/FormInput.vue'

const formData = ref({
  name: '',
  email: '',
  launchDate: '',
  password: '',
  id: 'auto-generated-id'
})
</script>
```

### Used In
- ProjectDetail.vue (project creation and editing forms)
- Any form that needs consistent input styling
- Replaces repetitive input element markup

### Integration with Description Lists

FormInput components work seamlessly with the Description List components:

```vue
<template>
  <DescriptionList>
    <DescriptionRow variant="gray">
      <DescriptionTerm>Internal Name</DescriptionTerm>
      <DescriptionDetail>
        <FormInput
          v-model="editForm.internal_name"
          type="text"
          placeholder="Enter project name"
          :required="true"
        />
      </DescriptionDetail>
    </DescriptionRow>
    
    <DescriptionRow variant="white">
      <DescriptionTerm>Launch Date</DescriptionTerm>
      <DescriptionDetail>
        <FormInput
          v-model="editForm.launch_date"
          type="date"
        />
      </DescriptionDetail>
    </DescriptionRow>
  </DescriptionList>
</template>
```

## Design Principles

### Consistency
- All form components follow the same prop patterns and naming conventions
- Consistent validation and error handling
- Standardized modal structure and behavior

### Accessibility
- Proper form labels and associations
- ARIA attributes for screen readers
- Keyboard navigation support
- Error message associations

### User Experience
- Clear validation feedback
- Loading states during submission
- Proper focus management
- Intuitive form flow

### Reusability
- Generic dropdown component for consistent select inputs
- Shared validation patterns
- Consistent styling and behavior

### Performance
- Efficient form validation
- Minimal re-renders
- Optimized component updates

### Error Handling
- Clear error messages
- Field-specific validation
- Graceful error recovery
- User-friendly error presentation
