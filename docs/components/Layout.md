# Layout Components

This directory contains layout components that provide structural organization and page-level composition for the inventory management application.

## Directory Structure

The layout components are organized into the following subdirectories:

- **`src/components/layout/`** - Main layout components (DetailView, ListView, TableView, etc.)
- **`src/components/layout/description/`** - Description list components (DescriptionList, DescriptionRow, etc.)
- **`src/components/layout/table/`** - Table components (TableElement, TableHeader, TableRow, TableCell)
- **`src/components/layout/modals/`** - Modal and loading components (LoadingSpinner, DeleteConfirmationModal, UnsavedChangesModal)

This organization ensures that related components are grouped together and makes it easier to find and maintain the codebase.

## DetailView.vue

A comprehensive layout component for detail/edit pages that provides consistent structure with loading states, error handling, editing capabilities, and unsaved changes protection.

### Features

- **Loading States**: Handles initial loading, action loading overlays, and save loading states
- **Error Handling**: Displays error messages with retry functionality
- **Edit Mode**: Seamless transition between view and edit modes
- **Unsaved Changes Protection**: Browser beforeunload and navigation guard protection
- **Status Cards**: Configurable status toggle cards with loading states
- **Modal Integration**: Built-in delete confirmation and unsaved changes modals
- **Responsive Design**: Mobile-friendly layout with proper spacing

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `storeLoading` | `boolean` | `undefined` | Store's internal loading state (optional) |
| `error` | `any` | - | Error object to display |
| `resource` | `Resource \| null` | - | Resource data to display |
| `isEditing` | `boolean` | - | Whether the component is in edit mode |
| `saveLoading` | `boolean` | `undefined` | Loading state for save operations |
| `actionLoading` | `boolean` | `undefined` | Loading state for status toggles |
| `hasUnsavedChanges` | `boolean` | `undefined` | Track unsaved changes for protection |
| `backLink` | `BackLink` | `undefined` | Back navigation configuration |
| `statusCards` | `StatusCardConfig[]` | `undefined` | Status cards configuration |
| `informationTitle` | `string` | - | Title for the information section |
| `informationDescription` | `string` | - | Description for the information section |
| `showDeleteModal` | `boolean` | - | Whether to show delete confirmation modal |
| `deleteModalTitle` | `string` | - | Title for delete confirmation modal |
| `deleteModalMessage` | `string` | - | Message for delete confirmation modal |
| `deleteLoading` | `boolean` | `undefined` | Loading state for delete operation |
| `fetchData` | `() => Promise<void>` | - | Function to fetch initial data |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `retry` | - | Emitted when retry button is clicked |
| `edit` | - | Emitted when edit button is clicked |
| `delete` | - | Emitted when delete button is clicked |
| `save` | - | Emitted when save button is clicked |
| `cancel` | - | Emitted when cancel button is clicked |
| `statusToggle` | `index: number` | Emitted when status card is toggled |
| `confirmDelete` | - | Emitted when delete is confirmed |
| `cancelDelete` | - | Emitted when delete is cancelled |
| `unsavedChanges` | `hasChanges: boolean` | Emitted when unsaved changes state changes |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `information` | `onFieldChange: () => void` | Content for the information section |

### Usage

```vue
<template>
  <DetailView
    :error="error"
    :resource="resource"
    :is-editing="isEditing"
    :save-loading="saveLoading"
    :action-loading="actionLoading"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :status-cards="statusCards"
    information-title="Resource Information"
    information-description="Detailed information about this resource"
    :show-delete-modal="showDeleteModal"
    delete-modal-title="Delete Resource"
    delete-modal-message="Are you sure you want to delete this resource?"
    :delete-loading="deleteLoading"
    :fetch-data="fetchData"
    @edit="startEdit"
    @save="saveResource"
    @cancel="cancelEdit"
    @delete="showDeleteConfirmation"
    @confirm-delete="confirmDelete"
    @cancel-delete="cancelDelete"
    @status-toggle="toggleStatus"
    @unsaved-changes="handleUnsavedChanges"
  >
    <template #information="{ onFieldChange }">
      <div class="px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt class="text-sm font-medium text-gray-500">Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <input
                v-if="isEditing"
                v-model="resource.name"
                @input="onFieldChange"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <span v-else>{{ resource.name }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </template>
  </DetailView>
</template>
```

## ListView.vue

A layout component for list pages that provides consistent structure with header, filters, loading states, empty states, and add button functionality.

### Features

- **Consistent Header**: Title, description, and optional icon with color themes
- **Filter Support**: Slot for custom filter components
- **Loading States**: Centralized loading spinner handling
- **Error Handling**: Error display with retry functionality
- **Empty States**: Configurable empty state with optional add button
- **Add Button**: Consistent add button with color theming
- **Responsive Design**: Mobile-friendly layout

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Page title |
| `description` | `string` | `undefined` | Page description |
| `addButtonRoute` | `string` | `undefined` | Route for add button |
| `addButtonLabel` | `string` | `undefined` | Label for add button |
| `loading` | `boolean` | - | Loading state |
| `error` | `string \| null` | - | Error message |
| `isEmpty` | `boolean` | - | Whether the list is empty |
| `emptyTitle` | `string` | - | Title for empty state |
| `emptyMessage` | `string` | - | Message for empty state |
| `showEmptyAddButton` | `boolean` | `undefined` | Whether to show add button in empty state |
| `emptyAddButtonLabel` | `string` | `undefined` | Label for empty state add button |
| `filters` | `FilterConfig[]` | `undefined` | Filter configuration (deprecated, use slot) |
| `color` | `string` | `undefined` | Color theme for icons and buttons |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `retry` | - | Emitted when retry button is clicked |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `icon` | - | Icon for the page header |
| `filters` | - | Custom filter components |
| `content` | - | Main content area |
| `modals` | - | Modal components |

### Usage

```vue
<template>
  <ListView
    title="Resources"
    description="Manage your resources"
    add-button-route="/resources/new"
    add-button-label="Add Resource"
    :loading="loading"
    :error="error"
    :is-empty="resources.length === 0"
    empty-title="No resources found"
    empty-message="Get started by creating your first resource"
    :show-empty-add-button="true"
    empty-add-button-label="Create Resource"
    color="blue"
    @retry="fetchResources"
  >
    <template #icon>
      <PackageIcon />
    </template>
    
    <template #filters>
      <FilterButton 
        v-for="filter in filters"
        :key="filter.id"
        :label="filter.label"
        :active="filter.active"
        @click="toggleFilter(filter.id)"
      />
    </template>
    
    <template #content>
      <TableView>
        <template #headers>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader variant="actions">Actions</TableHeader>
          </TableRow>
        </template>
        <template #rows>
          <TableRow v-for="resource in resources" :key="resource.id">
            <TableCell>{{ resource.name }}</TableCell>
            <TableCell>{{ resource.status }}</TableCell>
            <TableCell variant="actions">
              <ViewButton :to="`/resources/${resource.id}`" />
            </TableCell>
          </TableRow>
        </template>
      </TableView>
    </template>
  </ListView>
</template>
```

## Table Components

A set of semantic components for building consistent tables with proper styling and accessibility. These components are located in `src/components/layout/table/`.

### TableElement

A base table component that provides the structural `<table>`, `<thead>`, and `<tbody>` elements with consistent styling.

#### Features
- **Semantic HTML**: Uses proper `<table>`, `<thead>`, and `<tbody>` elements
- **Consistent Styling**: Standardized table appearance with dividers and backgrounds
- **Accessibility**: Proper table structure for screen readers
- **Flexible Content**: Supports any header and row content

#### Slots

| Slot | Description |
|------|-------------|
| `headers` | Table header content (should contain `<tr>` with `<th>` elements) |
| `rows` | Table body content (should contain `<tr>` with `<td>` elements) |

#### Usage

```vue
<template>
  <TableElement>
    <template #headers>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Status</TableHeader>
      </TableRow>
    </template>
    <template #rows>
      <TableRow>
        <TableCell>Project Alpha</TableCell>
        <TableCell>Active</TableCell>
      </TableRow>
    </template>
  </TableElement>
</template>

<script setup lang="ts">
import TableElement from '@/components/layout/table/TableElement.vue'
import TableRow from '@/components/layout/table/TableRow.vue'
import TableHeader from '@/components/layout/table/TableHeader.vue'
import TableCell from '@/components/layout/table/TableCell.vue'
</script>
```

### TableHeader

A component for table header cells (`<th>`) with consistent styling and variants.

#### Features
- **Consistent Styling**: Standardized header appearance
- **Action Variant**: Special styling for action columns
- **Accessibility**: Proper `<th>` element with scope attributes

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'actions'` | `'default'` | Header styling variant |

#### Usage

```vue
<template>
  <TableRow>
    <TableHeader>Project Name</TableHeader>
    <TableHeader variant="actions">
      <span class="sr-only">Actions</span>
    </TableHeader>
  </TableRow>
</template>

<script setup lang="ts">
import TableRow from '@/components/layout/table/TableRow.vue'
import TableHeader from '@/components/layout/table/TableHeader.vue'
</script>
```

### TableRow

A component for table rows (`<tr>`) with consistent styling and hover effects.

#### Features
- **Hover Effects**: Optional hover background color
- **Consistent Styling**: Standardized row appearance
- **Accessibility**: Proper `<tr>` element

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'hover'` | `'hover'` | Row styling variant |

#### Usage

```vue
<template>
  <TableRow v-for="item in items" :key="item.id">
    <TableCell>{{ item.name }}</TableCell>
    <TableCell>{{ item.status }}</TableCell>
  </TableRow>
</template>

<script setup lang="ts">
import TableRow from '@/components/layout/table/TableRow.vue'
import TableCell from '@/components/layout/table/TableCell.vue'
</script>
```

### TableCell

A component for table cells (`<td>`) with consistent styling and variants.

#### Features
- **Consistent Styling**: Standardized cell appearance with proper padding
- **Action Variant**: Special styling for action columns (right-aligned)
- **Accessibility**: Proper `<td>` element

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'actions'` | `'default'` | Cell styling variant |

#### Usage

```vue
<template>
  <TableCell>{{ project.name }}</TableCell>
  <TableCell variant="actions">
    <div class="flex justify-end space-x-2">
      <button>Edit</button>
      <button>Delete</button>
    </div>
  </TableCell>
</template>

<script setup lang="ts">
import TableCell from '@/components/layout/table/TableCell.vue'
</script>
```

### Used In
- Projects.vue (projects table)
- Can be used in other list views for consistent table presentation

## TableView.vue

A simple wrapper component that provides consistent table styling with Tailwind CSS classes and responsive design.

### Features

- **Consistent Styling**: Standardized table appearance across the application
- **Responsive Design**: Horizontal scrolling on mobile devices
- **Shadow and Borders**: Professional table appearance with shadows and borders
- **Slot-based**: Flexible header and row content through slots

### Props

None - this is a simple wrapper component.

### Events

None - this is a simple wrapper component.

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `headers` | - | Table header cells |
| `rows` | - | Table body rows |

### Usage

```vue
<template>
  <TableView>
    <template #headers>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Status</TableHeader>
        <TableHeader variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>
    
    <template #rows>
      <TableRow v-for="item in items" :key="item.id">
        <TableCell>{{ item.name }}</TableCell>
        <TableCell>{{ item.status }}</TableCell>
        <TableCell variant="actions">
          <ViewButton :to="`/items/${item.id}`" />
        </TableCell>
      </TableRow>
    </template>
  </TableView>
</template>

<script setup lang="ts">
import TableView from '@/components/layout/TableView.vue'
import TableRow from '@/components/layout/table/TableRow.vue'
import TableHeader from '@/components/layout/table/TableHeader.vue'
import TableCell from '@/components/layout/table/TableCell.vue'
import ViewButton from '@/components/actions/table/ViewButton.vue'
</script>
```

## AppHeader.vue

The main application header component that provides navigation, dropdown menus, and responsive mobile navigation.

### Features

- **Brand Logo**: Configurable application title with home link
- **Navigation Menu**: Desktop navigation with dropdown support
- **Mobile Navigation**: Responsive mobile menu with hamburger toggle
- **Dropdown Menus**: Hover and click-activated dropdown menus
- **Authentication**: Logout functionality for authenticated users
- **Responsive Design**: Adaptive layout for mobile and desktop

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `appTitle` | `string` | `'Inventory Management'` | Application title/brand name |

### Events

None - navigation is handled through Vue Router and store actions.

### Usage

```vue
<template>
  <AppHeader app-title="My Application" />
</template>
```

## ErrorDisplay.vue

A comprehensive error display component that shows error notifications with different styles based on error types and provides detailed validation error information.

### Features

- **Error Type Styling**: Different colors and icons for different error types
- **Validation Errors**: Detailed display of validation errors with field names
- **Auto-dismiss**: Configurable auto-dismiss functionality
- **Teleport**: Uses Vue Teleport for proper z-index layering
- **Responsive Design**: Mobile-friendly error display
- **Accessibility**: Proper ARIA attributes and screen reader support

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `AppError` | - | Error object to display |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `retry` | - | Emitted when retry button is clicked |

### Usage

```vue
<template>
  <ErrorDisplay 
    :error="error"
    @retry="handleRetry"
  />
</template>
```

## Modal Components

A set of modal and loading components for user interactions and feedback. These components are located in `src/components/layout/modals/`.

### LoadingSpinner

A simple loading spinner component that provides consistent loading indication throughout the application.

#### Features

- **Consistent Styling**: Standardized loading spinner appearance
- **Tailwind Animation**: Uses Tailwind's built-in spin animation
- **Centered Layout**: Proper centering with padding
- **Accessible**: Semantic HTML structure

#### Props

None - this is a simple component.

#### Events

None - this is a simple component.

#### Usage

```vue
<template>
  <LoadingSpinner />
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/layout/modals/LoadingSpinner.vue'
</script>
```

### DeleteConfirmationModal

A modal component for confirming destructive actions with customizable content and loading states.

#### Features

- **Confirmation Dialog**: Standard confirmation pattern for destructive actions
- **Loading States**: Loading spinner during delete operations
- **Customizable Content**: Configurable title, message, and button text
- **Keyboard Support**: Proper focus management and keyboard navigation
- **Accessibility**: ARIA attributes and screen reader support

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | - | Whether to show the modal |
| `title` | `string` | - | Modal title |
| `message` | `string` | - | Modal message |
| `loading` | `boolean` | `undefined` | Loading state |
| `confirmText` | `string` | `'Delete'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `confirm` | - | Emitted when confirm button is clicked |
| `cancel` | - | Emitted when cancel button is clicked |

#### Usage

```vue
<template>
  <DeleteConfirmationModal
    :show="showModal"
    title="Delete Resource"
    message="Are you sure you want to delete this resource? This action cannot be undone."
    :loading="deleteLoading"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="handleDelete"
    @cancel="closeModal"
  />
</template>

<script setup lang="ts">
import DeleteConfirmationModal from '@/components/layout/modals/DeleteConfirmationModal.vue'
</script>
```

### UnsavedChangesModal

A modal component for handling unsaved changes with options to save, discard, or cancel the action.

#### Features

- **Unsaved Changes Protection**: Prevents accidental data loss
- **Multiple Actions**: Save, discard, or cancel options
- **Loading States**: Loading spinner during save operations
- **Keyboard Support**: Proper focus management and keyboard navigation
- **Accessibility**: ARIA attributes and screen reader support

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | - | Whether to show the modal |
| `loading` | `boolean` | `undefined` | Loading state for save operation |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `save` | - | Emitted when save button is clicked |
| `discard` | - | Emitted when discard button is clicked |
| `cancel` | - | Emitted when cancel button is clicked |

#### Usage

```vue
<template>
  <UnsavedChangesModal
    :show="showUnsavedChangesModal"
    :loading="saveLoading"
    @save="handleSave"
    @discard="handleDiscard"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import UnsavedChangesModal from '@/components/layout/modals/UnsavedChangesModal.vue'
</script>
```

### Used In
- DetailView.vue (loading states and modal dialogs)
- ListView.vue (loading states)
- Projects.vue (delete confirmation)
- Can be used in any component requiring loading indication or modal dialogs

## Description List Components

A set of semantic components for building consistent description lists (dl, dt, dd elements) with proper styling and accessibility. These components are located in `src/components/layout/description/`.

### DescriptionList

A wrapper component for description lists that provides consistent styling and semantic structure.

#### Features
- **Semantic HTML**: Uses proper `<dl>` element
- **Accessibility**: Proper markup for screen readers
- **Consistent Styling**: Standardized appearance across views
- **Flexible Content**: Supports any description row content

#### Usage

```vue
<template>
  <DescriptionList>
    <DescriptionRow variant="gray">
      <DescriptionTerm>Name</DescriptionTerm>
      <DescriptionDetail>Project Alpha</DescriptionDetail>
    </DescriptionRow>
  </DescriptionList>
</template>

<script setup lang="ts">
import DescriptionList from '@/components/layout/description/DescriptionList.vue'
import DescriptionRow from '@/components/layout/description/DescriptionRow.vue'
import DescriptionTerm from '@/components/layout/description/DescriptionTerm.vue'
import DescriptionDetail from '@/components/layout/description/DescriptionDetail.vue'
</script>
```

### DescriptionRow

A row component for description lists with alternating background colors and proper spacing.

#### Features
- **Alternating Colors**: Gray and white variants for visual separation
- **Responsive Grid**: Proper grid layout on different screen sizes
- **Consistent Padding**: Standardized spacing throughout
- **Accessibility**: Proper semantic structure

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'gray' \| 'white'` | `'gray'` | Background color variant |

#### Usage

```vue
<template>
  <DescriptionRow variant="gray">
    <DescriptionTerm>Internal Name</DescriptionTerm>
    <DescriptionDetail>{{ project.internal_name }}</DescriptionDetail>
  </DescriptionRow>
  
  <DescriptionRow variant="white">
    <DescriptionTerm>Status</DescriptionTerm>
    <DescriptionDetail>{{ project.status }}</DescriptionDetail>
  </DescriptionRow>
</template>
```

### DescriptionTerm

A component for description terms (labels) with consistent styling.

#### Features
- **Consistent Typography**: Standardized font weight and color
- **Responsive Design**: Proper sizing across screen sizes
- **Accessibility**: Semantic `<dt>` element
- **Alignment**: Proper alignment with description details

#### Usage

```vue
<template>
  <DescriptionTerm>Launch Date</DescriptionTerm>
</template>
```

### DescriptionDetail

A component for description details (content) with flexible content support.

#### Features
- **Flexible Content**: Supports any child content
- **Consistent Styling**: Standardized appearance
- **Responsive Grid**: Proper column spanning
- **Accessibility**: Semantic `<dd>` element

#### Usage

```vue
<template>
  <DescriptionDetail>
    <FormInput v-if="isEditing" v-model="editForm.name" />
    <DisplayText v-else>{{ project.name }}</DisplayText>
  </DescriptionDetail>
</template>
```

### Complete Table Example

```vue
<template>
  <TableView>
    <template #headers>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Status</TableHeader>
        <TableHeader>Created</TableHeader>
        <TableHeader variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>
    
    <template #rows>
      <TableRow v-for="item in items" :key="item.id">
        <TableCell>{{ item.name }}</TableCell>
        <TableCell>
          <ToggleSmall 
            :title="item.status" 
            :is-active="item.is_active"
            :disabled="true"
          />
        </TableCell>
        <TableCell>
          <DateDisplay :date="item.created_at" />
        </TableCell>
        <TableCell variant="actions">
          <div class="flex justify-end space-x-2">
            <ViewButton @click="viewItem(item)" />
            <EditButton @click="editItem(item)" />
            <DeleteButton @click="deleteItem(item)" />
          </div>
        </TableCell>
      </TableRow>
    </template>
  </TableView>
</template>

<script setup lang="ts">
import TableView from '@/components/layout/TableView.vue'
import TableHeader from '@/components/layout/table/TableHeader.vue'
import TableRow from '@/components/layout/table/TableRow.vue'
import TableCell from '@/components/layout/table/TableCell.vue'
import ToggleSmall from '@/components/format/ToggleSmall.vue'
import DateDisplay from '@/components/format/Date.vue'
import ViewButton from '@/components/actions/table/ViewButton.vue'
import EditButton from '@/components/actions/table/EditButton.vue'
import DeleteButton from '@/components/actions/table/DeleteButton.vue'
</script>
```

### Used In
- Projects.vue (projects table)
- Can be used in other list views for consistent table presentation

### Complete Example

```vue
<template>
  <DescriptionList>
    <DescriptionRow variant="gray">
      <DescriptionTerm>Internal Name</DescriptionTerm>
      <DescriptionDetail>
        <FormInput
          v-if="isEditing"
          v-model="editForm.internal_name"
          type="text"
          :required="true"
        />
        <DisplayText v-else>{{ project?.internal_name }}</DisplayText>
      </DescriptionDetail>
    </DescriptionRow>
    
    <DescriptionRow variant="white">
      <DescriptionTerm>Launch Date</DescriptionTerm>
      <DescriptionDetail>
        <FormInput
          v-if="isEditing"
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
  </DescriptionList>
</template>
```

### Used In
- ProjectDetail.vue (project information display)
- Can be used in other detail views for consistent information display

## Table Components

A set of semantic components for building consistent table elements (th, td) with proper styling and accessibility.

### TableHeader

A component for table headers with consistent styling and semantic structure.

#### Features
- **Semantic HTML**: Uses proper `<th>` element with scope attribute
- **Accessibility**: Proper scope and semantic markup for screen readers
- **Consistent Styling**: Standardized header appearance across tables
- **Variant Support**: Different styling for regular headers and action columns

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scope` | `'col' \| 'row'` | `'col'` | Scope attribute for accessibility |
| `variant` | `'default' \| 'actions'` | `'default'` | Styling variant |

#### Usage

```vue
<template>
  <TableView>
    <template #headers>
      <TableHeader>Project</TableHeader>
      <TableHeader>Status</TableHeader>
      <TableHeader>Created</TableHeader>
      <TableHeader variant="actions">
        <span class="sr-only">Actions</span>
      </TableHeader>
    </template>
  </TableView>
</template>

<script setup lang="ts">
import TableHeader from '@/components/table/TableHeader.vue'
import TableView from '@/components/layout/TableView.vue'
</script>
```

### TableRow

A row component for table rows with hover effects and consistent styling.

#### Features
- **Hover Effects**: Optional hover background color on row hover
- **Consistent Styling**: Standardized row appearance
- **Accessibility**: Proper semantic `<tr>` element
- **Flexibility**: Supports any table cell content

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'hover'` | `'hover'` | Row styling variant |

#### Usage

```vue
<template>
  <TableRow v-for="item in items" :key="item.id">
    <TableCell>{{ item.name }}</TableCell>
    <TableCell>{{ item.value }}</TableCell>
    <TableCell variant="actions">
      <button>Edit</button>
    </TableCell>
  </TableRow>
</template>
```

### TableCell

A component for table cells with consistent styling and variant support.

#### Features
- **Semantic HTML**: Uses proper `<td>` element
- **Consistent Styling**: Standardized cell appearance with proper padding
- **Variant Support**: Different styling for regular cells and action columns
- **Flexible Content**: Supports any child content

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'actions'` | `'default'` | Styling variant |

#### Usage

```vue
<template>
  <tr>
    <TableCell>
      <ResourceNameDisplay :internal-name="project.internal_name" />
    </TableCell>
    <TableCell>
      <ToggleSmall :is-active="project.is_enabled" />
    </TableCell>
    <TableCell>
      <DateDisplay :date="project.created_at" />
    </TableCell>
    <TableCell variant="actions">
      <div class="flex justify-end space-x-2">
        <ViewButton @click="viewProject(project)" />
        <EditButton @click="editProject(project)" />
        <DeleteButton @click="deleteProject(project)" />
      </div>
    </TableCell>
  </tr>
</template>

<script setup lang="ts">
import TableCell from '@/components/table/TableCell.vue'
import ResourceNameDisplay from '@/components/format/InternalName.vue'
import ToggleSmall from '@/components/format/ToggleSmall.vue'
import DateDisplay from '@/components/format/Date.vue'
import ViewButton from '@/components/actions/table/ViewButton.vue'
import EditButton from '@/components/actions/table/EditButton.vue'
import DeleteButton from '@/components/actions/table/DeleteButton.vue'
</script>
```

### Complete Table Example

```vue
<template>
  <TableView>
    <template #headers>
      <TableRow>
        <TableHeader>Name</TableHeader>
        <TableHeader>Status</TableHeader>
        <TableHeader>Created</TableHeader>
        <TableHeader variant="actions">
          <span class="sr-only">Actions</span>
        </TableHeader>
      </TableRow>
    </template>
    
    <template #rows>
      <TableRow v-for="item in items" :key="item.id" class="hover:bg-gray-50">
        <TableCell>
          <ResourceNameDisplay :internal-name="item.internal_name" />
        </TableCell>
        <TableCell>
          <ToggleSmall
            :is-active="item.is_enabled"
            :status-text="item.is_enabled ? 'Enabled' : 'Disabled'"
            :disabled="true"
          />
        </TableCell>
        <TableCell>
          <DateDisplay :date="item.created_at" variant="small-dark" />
        </TableCell>
        <TableCell variant="actions">
          <div class="flex justify-end space-x-2">
            <ViewButton @click="viewItem(item)" />
            <EditButton @click="editItem(item)" />
            <DeleteButton @click="deleteItem(item)" />
          </div>
        </TableCell>
      </TableRow>
    </template>
  </TableView>
</template>
```

### Used In
- Projects.vue (projects table display)
- Can be used in other list views for consistent table styling

## Design Principles

### Consistency
- All layout components follow the same prop patterns and naming conventions
- Consistent color theming through the `color` prop
- Standardized loading states and error handling

### Accessibility
- Proper ARIA attributes and roles
- Screen reader support
- Keyboard navigation support
- Focus management

### Responsive Design
- Mobile-first approach
- Proper breakpoints for different screen sizes
- Touch-friendly interactions

### Performance
- Efficient rendering with proper v-if conditions
- Minimal re-renders through computed properties
- Lazy loading where appropriate

### Error Handling
- Consistent error display patterns
- Retry functionality for failed operations
- Graceful degradation for missing data

### User Experience
- Clear loading states
- Helpful empty states
- Confirmation dialogs for destructive actions
- Unsaved changes protection
