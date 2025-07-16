# Action Components

Action components provide consistent buttons and interactive elements for the inventory management UI.

## SaveButton

A reusable save button component with loading state and consistent styling.

### Features
- **Loading State**: Shows spinner animation when processing
- **Disabled State**: Prevents interactions when disabled
- **Consistent Styling**: Green button with hover and focus states
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Icon Support**: Check icon when idle, spinner when loading

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show loading spinner |
| `label` | `string` | `'Save'` | Button text label |

### Events

| Event | Description |
|-------|-------------|
| `click` | Emitted when button is clicked (only if not disabled or loading) |

### Usage

```vue
<template>
  <SaveButton 
    :loading="saveInProgress" 
    :disabled="!hasChanges"
    @click="handleSave"
  />
</template>

<script setup lang="ts">
import SaveButton from '@/components/actions/detail/SaveButton.vue'

const saveInProgress = ref(false)
const hasChanges = ref(true)

const handleSave = async () => {
  saveInProgress.value = true
  // Save logic here
  saveInProgress.value = false
}
</script>
```

### Used In
- ProjectDetail.vue (edit mode)
- All detail views for saving changes

## CancelButton

A reusable cancel button component with consistent styling.

### Features
- **Consistent Styling**: Gray button with hover and focus states
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Icon Support**: X icon for cancel action

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `label` | `string` | `'Cancel'` | Button text label |

### Events

| Event | Description |
|-------|-------------|
| `click` | Emitted when button is clicked |

### Usage

```vue
<template>
  <CancelButton @click="handleCancel" />
</template>

<script setup lang="ts">
import CancelButton from '@/components/actions/detail/CancelButton.vue'

const handleCancel = () => {
  // Cancel logic here
}
</script>
```

### Used In
- ProjectDetail.vue (edit mode)
- All detail views for canceling changes

## EditButton

A reusable edit button component with consistent styling.

### Features
- **Consistent Styling**: Blue button with hover and focus states
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Icon Support**: Edit icon

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `label` | `string` | `'Edit'` | Button text label |

### Events

| Event | Description |
|-------|-------------|
| `click` | Emitted when button is clicked |

### Usage

```vue
<template>
  <EditButton @click="startEdit" />
</template>

<script setup lang="ts">
import EditButton from '@/components/actions/detail/EditButton.vue'

const startEdit = () => {
  // Edit logic here
}
</script>
```

### Used In
- ProjectDetail.vue (view mode)
- All detail views for entering edit mode

## DeleteButton

A reusable delete button component with loading state and consistent styling.

### Features
- **Loading State**: Shows spinner animation when processing
- **Disabled State**: Prevents interactions when disabled
- **Consistent Styling**: Red button with hover and focus states
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Icon Support**: Trash icon when idle, spinner when loading

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether to show loading spinner |
| `label` | `string` | `'Delete'` | Button text label |

### Events

| Event | Description |
|-------|-------------|
| `click` | Emitted when button is clicked (only if not disabled or loading) |

### Usage

```vue
<template>
  <DeleteButton 
    :loading="deleteInProgress" 
    @click="handleDelete"
  />
</template>

<script setup lang="ts">
import DeleteButton from '@/components/actions/detail/DeleteButton.vue'

const deleteInProgress = ref(false)

const handleDelete = async () => {
  deleteInProgress.value = true
  // Delete logic here
  deleteInProgress.value = false
}
</script>
```

### Used In
- ProjectDetail.vue (view mode)
- All detail views for deleting resources

## List Action Components

### AddButton

A reusable add button component for list views.

### Features
- **Consistent Styling**: Green button with plus icon
- **Accessibility**: Proper ARIA attributes
- **Router Integration**: Can navigate to add/create routes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Add'` | Button text label |
| `to` | `string` | `undefined` | Router path to navigate to |

### Usage

```vue
<template>
  <AddButton label="Add Project" to="/projects/new" />
</template>

<script setup lang="ts">
import AddButton from '@/components/actions/list/AddButton.vue'
</script>
```

### Used In
- Projects.vue (list view)
- All list views for adding new resources

## Table Action Components

### ViewButton

A small button for viewing/navigating to detail views from table rows.

### Features
- **Compact Design**: Small size for table cells
- **Consistent Styling**: Blue button with eye icon
- **Router Integration**: Navigates to detail views

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` | `required` | Router path to navigate to |

### Usage

```vue
<template>
  <ViewButton :to="`/projects/${project.id}`" />
</template>

<script setup lang="ts">
import ViewButton from '@/components/actions/table/ViewButton.vue'
</script>
```

### Used In
- Projects.vue (table view)
- All table views for viewing resource details

## Design Principles

1. **Consistency**: All action buttons follow the same design patterns
2. **Accessibility**: Proper ARIA labels and keyboard navigation
3. **Loading States**: Visual feedback for async operations
4. **Color Coding**: Semantic colors (green for save, red for delete, blue for edit)
5. **Icon Integration**: Meaningful icons for better UX
6. **TypeScript Support**: Fully typed props and events
