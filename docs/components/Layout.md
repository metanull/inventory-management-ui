# Layout Components

This directory contains layout components that provide structural organization and page-level composition for the inventory management application.

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
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </template>
        <template #rows>
          <tr v-for="resource in resources" :key="resource.id">
            <td>{{ resource.name }}</td>
            <td>{{ resource.status }}</td>
            <td>
              <ViewButton :to="`/resources/${resource.id}`" />
            </td>
          </tr>
        </template>
      </TableView>
    </template>
  </ListView>
</template>
```

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
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Status
      </th>
      <th class="relative px-6 py-3">
        <span class="sr-only">Actions</span>
      </th>
    </template>
    
    <template #rows>
      <tr v-for="item in items" :key="item.id">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {{ item.name }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {{ item.status }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <ViewButton :to="`/items/${item.id}`" />
        </td>
      </tr>
    </template>
  </TableView>
</template>
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

## LoadingSpinner.vue

A simple loading spinner component that provides consistent loading indication throughout the application.

### Features

- **Consistent Styling**: Standardized loading spinner appearance
- **Tailwind Animation**: Uses Tailwind's built-in spin animation
- **Centered Layout**: Proper centering with padding
- **Accessible**: Semantic HTML structure

### Props

None - this is a simple component.

### Events

None - this is a simple component.

### Usage

```vue
<template>
  <LoadingSpinner />
</template>
```

## DeleteConfirmationModal.vue

A modal component for confirming destructive actions with customizable content and loading states.

### Features

- **Confirmation Dialog**: Standard confirmation pattern for destructive actions
- **Loading States**: Loading spinner during delete operations
- **Customizable Content**: Configurable title, message, and button text
- **Keyboard Support**: Proper focus management and keyboard navigation
- **Accessibility**: ARIA attributes and screen reader support

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | - | Whether to show the modal |
| `title` | `string` | - | Modal title |
| `message` | `string` | - | Modal message |
| `loading` | `boolean` | `undefined` | Loading state |
| `confirmText` | `string` | `'Delete'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `confirm` | - | Emitted when confirm button is clicked |
| `cancel` | - | Emitted when cancel button is clicked |

### Usage

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
```

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
