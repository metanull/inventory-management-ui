# Format Components

Format components provide consistent formatting and display elements for data presentation.

## Directory Structure

The format components are organized into the following subdirectories:

- **`src/components/format/card/`** - Card components (Card, InformationCard, NavigationCard, StatusCard)
- **`src/components/format/table/`** - Table components (TableElement, TableHeader, TableRow, TableCell)
- **`src/components/format/title/`** - Title component with multiple variants
- **`src/components/format/description/`** - Description list components (DescriptionList, DescriptionRow, DescriptionTerm, DescriptionDetail)
- **`src/components/format/`** - Other formatting components (Toggle, ToggleSmall, Date, DisplayText, FormInput, GenericDropdown, InternalName, InternalNameSmall, Uuid)

## Card Components (`format/card/`)

### Card.vue

Base card component that provides consistent styling and structure for all card types.

### Features
- **Consistent Styling**: White background with rounded corners and shadow
- **Icon Support**: Icon slot for visual indicators
- **Title Component**: Uses Title component for consistent headings
- **Extensible**: Serves as base for specialized card types

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title text |
| `description` | `string` | Card description text |
| `mainColor` | `string` | Color scheme for icon (blue, green, purple, orange, red, gray) |

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon to display in the card header |
| `default` | Main card content |

### InformationCard.vue

Extends Card component to display information with a colored status pill.

### Features
- **Status Pill**: Colored pill displaying status text
- **Color Variants**: Supports multiple color schemes
- **Consistent Layout**: Based on Card component

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title text |
| `description` | `string` | Card description text |
| `mainColor` | `string` | Color scheme (blue, green, purple, orange, red, gray) |
| `pillText` | `string` | Text to display in the status pill |

### NavigationCard.vue

Extends Card component to provide navigation with a call-to-action button.

### Features
- **Navigation Button**: Styled button with color variants
- **Router Integration**: Uses router-link for navigation
- **Consistent Layout**: Based on Card component

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title text |
| `description` | `string` | Card description text |
| `mainColor` | `string` | Color scheme (blue, green, purple, orange, red, gray) |
| `buttonText` | `string` | Text for the navigation button |
| `buttonRoute` | `string` | Route path for navigation |

### StatusCard.vue

Extends Card component to display status with a toggle component.

### Features
- **Status Toggle**: Includes Toggle component for status changes
- **Loading States**: Supports loading and disabled states
- **Consistent Layout**: Based on Card component

### Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Card title text |
| `description` | `string` | Card description text |
| `mainColor` | `string` | Color scheme (blue, green, purple, orange, red, gray) |
| `statusText` | `string` | Current status text |
| `toggleTitle` | `string` | Title for the toggle component |
| `isActive` | `boolean` | Current toggle state |
| `loading` | `boolean` | Loading state |
| `disabled` | `boolean` | Disabled state |
| `activeIconBackgroundClass` | `string` | CSS class for active icon background |
| `inactiveIconBackgroundClass` | `string` | CSS class for inactive icon background |
| `activeIconClass` | `string` | CSS class for active icon |
| `inactiveIconClass` | `string` | CSS class for inactive icon |
| `activeIconComponent` | `Component` | Vue component for active icon |
| `inactiveIconComponent` | `Component` | Vue component for inactive icon |

## Table Components (`format/table/`)

### TableElement.vue
Base table wrapper component providing consistent styling.

### TableHeader.vue
Table header component with sorting and filtering capabilities.

### TableRow.vue
Table row component with hover effects and consistent styling.

### TableCell.vue
Table cell component with proper padding and alignment.

## Title Components (`format/title/`)

### Title.vue

Versatile title component with multiple variants for different contexts.

### Features
- **Multiple Variants**: page, section, card, system, empty
- **Dynamic Headings**: Uses appropriate heading tags (h1-h6)
- **Consistent Styling**: Unified appearance across the application
- **Description Support**: Optional description text

### Props

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `string` | Title variant (page, section, card, system, empty) |
| `description` | `string` | Optional description text |

## Description Components (`format/description/`)

### DescriptionList.vue
Container component for description lists with consistent styling.

### DescriptionRow.vue
Row component for description lists with proper spacing.

### DescriptionTerm.vue
Term component for description lists with consistent labeling.

### DescriptionDetail.vue
Detail component for description lists with proper value display.

## Toggle Components

### Toggle

A comprehensive toggle switch component with status display and dynamic icons.

### Features
- **Visual Status Display**: Shows current state with title and status text
- **Dynamic Icons**: Different icons for active/inactive states
- **Loading State**: Shows "Updating..." message during operations
- **Disabled State**: Prevents interactions when disabled
- **Hide Switch Option**: Can display as status-only (no toggle)
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Animated Transition**: Smooth toggle animations

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `required` | Title text displayed above status |
| `statusText` | `string` | `required` | Current status text |
| `isActive` | `boolean` | `required` | Current toggle state |
| `disabled` | `boolean` | `false` | Whether the toggle is disabled |
| `loading` | `boolean` | `false` | Whether to show loading state |
| `hideSwitch` | `boolean` | `false` | Whether to hide the toggle switch |
| `activeIconBackgroundClass` | `string` | `required` | CSS class for active icon background |
| `inactiveIconBackgroundClass` | `string` | `required` | CSS class for inactive icon background |
| `activeIconClass` | `string` | `required` | CSS class for active icon |
| `inactiveIconClass` | `string` | `required` | CSS class for inactive icon |
| `activeIconComponent` | `Component` | `required` | Vue component for active icon |
| `inactiveIconComponent` | `Component` | `required` | Vue component for inactive icon |

### Events

| Event | Description |
|-------|-------------|
| `toggle` | Emitted when toggle is clicked (only if not disabled or loading) |

### Usage

```vue
<template>
  <Toggle
    title="Project Status"
    :status-text="project.is_enabled ? 'Enabled' : 'Disabled'"
    :is-active="project.is_enabled"
    :loading="updating"
    active-icon-background-class="bg-green-100"
    inactive-icon-background-class="bg-red-100"
    active-icon-class="text-green-600"
    inactive-icon-class="text-red-600"
    :active-icon-component="CheckCircleIcon"
    :inactive-icon-component="XCircleIcon"
    @toggle="toggleStatus"
  />
</template>

<script setup lang="ts">
import Toggle from '@/components/format/Toggle.vue'
import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue'
import XCircleIcon from '@/components/icons/XCircleIcon.vue'

const updating = ref(false)
const project = ref({ is_enabled: true })

const toggleStatus = async () => {
  updating.value = true
  // Toggle logic here
  updating.value = false
}
</script>
```

### Used In
- ProjectDetail.vue (status cards)
- Home.vue (status cards)

## ToggleSmall

A compact version of the Toggle component for smaller spaces.

### Features
- **Compact Design**: Smaller size for tight spaces
- **Same Functionality**: All Toggle features in smaller form factor
- **Consistent Styling**: Matches main Toggle component

### Props
Same as Toggle component but with smaller dimensions.

### Usage

```vue
<template>
  <ToggleSmall
    title="Launch Status"
    :status-text="project.is_launched ? 'Launched' : 'Not Launched'"
    :is-active="project.is_launched"
    :loading="updating"
    active-icon-background-class="bg-blue-100"
    inactive-icon-background-class="bg-gray-100"
    active-icon-class="text-blue-600"
    inactive-icon-class="text-gray-600"
    :active-icon-component="RocketIcon"
    :inactive-icon-component="PackageIcon"
    @toggle="toggleLaunch"
  />
</template>

<script setup lang="ts">
import ToggleSmall from '@/components/format/ToggleSmall.vue'
import RocketIcon from '@/components/icons/RocketIcon.vue'
import PackageIcon from '@/components/icons/PackageIcon.vue'
</script>
```

### Used In
- ProjectDetail.vue (secondary status cards)
- Compact status displays

## Date

A component for consistent date formatting and display.

### Features
- **Multiple Formats**: Support for different date display formats
- **Timezone Handling**: Proper timezone conversion
- **Null/Empty Handling**: Graceful handling of missing dates
- **Accessibility**: Proper semantic markup

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `string \| Date` | `required` | Date to format |
| `format` | `string` | `'medium'` | Format type ('short', 'medium', 'long') |
| `showTime` | `boolean` | `false` | Whether to include time |

### Usage

```vue
<template>
  <Date 
    :date="project.launch_date" 
    format="medium"
    class="text-sm text-gray-900"
  />
</template>

<script setup lang="ts">
import Date from '@/components/format/Date.vue'
</script>
```

### Used In
- ProjectDetail.vue (launch date display)
- All date displays throughout the application

## Date

A component for displaying dates with consistent formatting across the application.

### Features
- **Multiple Formats**: Support for short, medium, long, and full date formats
- **Optional Time**: Can include time display
- **Variant Styling**: Different styling variants for different contexts
- **Localization**: Uses browser's locale for date formatting
- **Tooltip**: Shows full date/time on hover
- **Error Handling**: Graceful handling of invalid dates

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `date` | `string \| null \| undefined` | `required` | Date string to format |
| `format` | `'short' \| 'medium' \| 'long' \| 'full'` | `'medium'` | Date format style |
| `className` | `string` | `undefined` | Additional CSS classes |
| `showTime` | `boolean` | `false` | Whether to show time |
| `variant` | `'default' \| 'small-dark'` | `'default'` | Styling variant |

### Usage

```vue
<template>
  <!-- Basic date display -->
  <DateDisplay :date="project.created_at" />
  
  <!-- With time -->
  <DateDisplay :date="project.updated_at" :show-time="true" />
  
  <!-- Different format -->
  <DateDisplay :date="project.launch_date" format="short" />
  
  <!-- With variant styling -->
  <DateDisplay 
    :date="project.launch_date" 
    format="medium" 
    variant="small-dark" 
  />
</template>

<script setup lang="ts">
import DateDisplay from '@/components/format/Date.vue'
</script>
```

### Used In
- Projects.vue (created date column)
- ProjectDetail.vue (launch date display)
- All date displays throughout the application

## DisplayText

A reusable component for displaying text with consistent styling and semantic variants.

### Features
- **Semantic Variants**: Different styling for different types of text content
- **Consistent Styling**: Standardized text appearance across the application
- **Accessibility**: Proper semantic markup
- **Slot Support**: Flexible content insertion
- **TypeScript Support**: Fully typed props

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'gray' \| 'muted'` | `'default'` | Text styling variant |

### Variants

- **`default`**: Standard text with no additional styling
- **`gray`/`muted`**: Gray text (text-gray-500) for secondary information, placeholders, and muted content

### Usage

```vue
<template>
  <!-- Default text -->
  <DisplayText>{{ project.internal_name }}</DisplayText>
  
  <!-- Gray/muted text for placeholders -->
  <DisplayText variant="gray">No default context set</DisplayText>
  
  <!-- Muted text for secondary information -->
  <DisplayText variant="muted">Not scheduled</DisplayText>
</template>

<script setup lang="ts">
import DisplayText from '@/components/format/DisplayText.vue'
</script>
```

### Used In
- ProjectDetail.vue (text content display, placeholder text)
- Projects.vue (placeholder text in tables)
- Replaces repetitive `<span class="text-sm text-gray-500">` patterns

## InternalName

A component for displaying internal names with consistent formatting.

### Features
- **Consistent Styling**: Standard formatting for internal names
- **Truncation**: Handles long names gracefully
- **Accessibility**: Proper semantic markup

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `required` | Internal name to display |
| `truncate` | `boolean` | `false` | Whether to truncate long names |

### Usage

```vue
<template>
  <InternalName :name="project.internal_name" />
</template>

<script setup lang="ts">
import InternalName from '@/components/format/InternalName.vue'
</script>
```

### Used In
- ProjectDetail.vue (internal name display)
- All internal name displays

## Uuid

A component for displaying UUIDs with consistent formatting.

### Features
- **Consistent Styling**: Standard formatting for UUIDs
- **Copy Functionality**: Click to copy UUID
- **Truncation**: Shows first and last parts of UUID
- **Accessibility**: Proper semantic markup

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `uuid` | `string` | `required` | UUID to display |
| `truncate` | `boolean` | `true` | Whether to truncate UUID display |

### Usage

```vue
<template>
  <Uuid :uuid="project.id" />
</template>

<script setup lang="ts">
import Uuid from '@/components/format/Uuid.vue'
</script>
```

### Used In
- ProjectDetail.vue (ID display)
- All UUID displays throughout the application

## Design Principles

1. **Consistency**: All format components follow the same design patterns
2. **Accessibility**: Proper semantic markup and ARIA attributes
3. **Flexibility**: Components adapt to different contexts and data types
4. **Visual Feedback**: Clear indication of states and interactions
5. **TypeScript Support**: Fully typed props and events
6. **Responsive Design**: Components work on different screen sizes
