# Layout Components

High-level layout components for structuring pages, sections, and application-wide elements.

## Application Layout

### AppHeader
Main application header with navigation and branding.

### AppFooter
Application footer component.

## Page Layout Components

### ListView
A comprehensive list view component that provides a standardized layout for displaying collections of items.

**Props:**
- `title: string` - Page title
- `description?: string` - Optional page description
- `addButtonRoute?: string` - Route for the add button
- `addButtonLabel?: string` - Label for the add button
- `isEmpty: boolean` - Whether the list is empty
- `emptyTitle: string` - Title for empty state
- `emptyMessage: string` - Message for empty state
- `filters?: FilterConfig[]` - Array of filter configurations
- `color?: string` - Theme color for icons and buttons

**Slots:**
- `icon` - Icon for the page header
- `filters` - Custom filter content
- `headers` - Table headers
- `rows` - Table rows
- `modals` - Modal dialogs

**Usage:**
```vue
<ListView
  title="Projects"
  description="Manage your projects"
  add-button-route="/projects/new"
  add-button-label="New Project"
  :is-empty="projects.length === 0"
  empty-title="No Projects"
  empty-message="Create your first project to get started"
  color="orange"
>
  <template #icon>
    <ProjectIcon />
  </template>
  
  <template #headers>
    <TableHeader>Name</TableHeader>
    <TableHeader>Status</TableHeader>
  </template>
  
  <template #rows>
    <TableRow v-for="project in projects" :key="project.id">
      <TableCell>{{ project.internal_name }}</TableCell>
      <TableCell>{{ project.status }}</TableCell>
    </TableRow>
  </template>
</ListView>
```

### DetailView
A comprehensive detail view component for displaying and editing individual resources.

**Props:**
- `storeLoading?: boolean` - Store's internal loading state
- `resource: Resource | null` - The resource being displayed
- `isEditing: boolean` - Whether in edit mode
- `isCreating?: boolean` - Whether creating a new resource
- `hasUnsavedChanges?: boolean` - Whether there are unsaved changes
- `createTitle?: string` - Custom title for creation mode
- `createSubtitle?: string` - Custom subtitle for creation mode
- `backLink?: BackLinkConfig` - Back navigation configuration
- `statusCards?: StatusCardConfig[]` - Status card configurations
- `informationTitle: string` - Title for the information section
- `informationDescription: string` - Description for the information section
- `fetchData: () => Promise<void>` - Function to fetch resource data

**Events:**
- `edit: []` - Emitted when edit mode is requested
- `save: []` - Emitted when save is requested
- `cancel: []` - Emitted when cancel is requested
- `delete: []` - Emitted when delete is requested
- `statusToggle: [index: number]` - Emitted when a status card is toggled
- `unsavedChanges: [hasChanges: boolean]` - Emitted when unsaved changes state changes

**Slots:**
- `information` - Main information content with field change handler

**Usage:**
```vue
<DetailView
  :resource="project"
  :is-editing="isEditing"
  :is-creating="isNewProject"
  :has-unsaved-changes="hasChanges"
  :back-link="backLink"
  :status-cards="statusCards"
  information-title="Project Information"
  information-description="Detailed project information"
  :fetch-data="fetchProject"
  @edit="startEdit"
  @save="saveChanges"
  @cancel="cancelEdit"
  @delete="deleteProject"
  @status-toggle="handleStatusToggle"
>
  <template #information="{ onFieldChange }">
    <DescriptionList>
      <DescriptionRow variant="gray">
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetail>
          <FormInput
            v-if="isEditing"
            v-model="editForm.name"
            @input="onFieldChange"
          />
          <DisplayText v-else>{{ project.name }}</DisplayText>
        </DescriptionDetail>
      </DescriptionRow>
    </DescriptionList>
  </template>
</DetailView>
```

## List Action Components

### AddButton
Button for adding new items to a list.

**Props:**
- `to: string` - Router link destination
- `label?: string` - Button label
- `color?: string` - Theme color

**Usage:**
```vue
<AddButton to="/projects/new" label="New Project" color="blue" />
```

### ViewButton
Button for viewing item details.

### EditButton
Button for editing items.

### DeleteButton
Button for deleting items.

### FilterButton
Button for filtering list items.

## Detail Action Components

### EditButton (Detail)
Edit button specifically styled for detail views.

**Events:**
- `click: []` - Emitted when button is clicked

### SaveButton
Save button for detail view forms.

**Props:**
- `disabled?: boolean` - Whether the button is disabled

**Events:**
- `click: []` - Emitted when button is clicked

### CancelButton
Cancel button for detail view forms.

**Events:**
- `click: []` - Emitted when button is clicked

### DeleteButton (Detail)
Delete button specifically styled for detail views.

**Events:**
- `click: []` - Emitted when button is clicked

**Usage:**
```vue
<div class="flex space-x-3">
  <SaveButton :disabled="!hasChanges" @click="save" />
  <CancelButton @click="cancel" />
</div>
```

## System Components

### SystemProperties
Displays system-level metadata like creation and modification timestamps.

**Props:**
- `id: string` - Resource ID
- `created-at: string` - Creation timestamp
- `updated-at: string` - Last update timestamp

**Usage:**
```vue
<SystemProperties
  :id="resource.id"
  :created-at="resource.created_at"
  :updated-at="resource.updated_at"
/>
```

## Interface Definitions

### Resource Interface
```typescript
interface Resource {
  id: string
  internal_name: string
  backward_compatibility?: string | null
  created_at: string | null
  updated_at: string | null
}
```

### BackLinkConfig Interface
```typescript
interface BackLinkConfig {
  title: string
  route: string
  icon: Component
  color?: string
}
```

### StatusCardConfig Interface
```typescript
interface StatusCardConfig {
  title: string
  description: string
  mainColor: string
  statusText: string
  toggleTitle: string
  isActive: boolean
  loading: boolean
  disabled?: boolean
  activeIconBackgroundClass: string
  inactiveIconBackgroundClass: string
  activeIconClass: string
  inactiveIconClass: string
  activeIconComponent: Component
  inactiveIconComponent: Component
}
```
