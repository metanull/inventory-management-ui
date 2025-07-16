# GenericDropdown Component

A reusable dropdown component for the inventory management UI that provides consistent styling, sorting, and highlighting functionality.

## Features

- **Priority Items**: Automatically sorts items to show current selection at the top, followed by system default (if different from current)
- **Configurable "No Default" Option**: Optional empty option for when no default is selected
- **Consistent Separator**: Always shows a separator line between priority items (and "no default" option) and remaining items
- **Custom Sorting**: Accepts a custom sort function or uses alphabetical sorting by default
- **Custom Highlighting**: Supports custom highlight functions for special styling
- **Consistent Styling**: Uses the same styles as the existing dropdown utilities
- **Accessibility**: Properly labeled with ARIA attributes

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The currently selected value |
| `options` | `GenericDropdownOption[]` | `[]` | Array of dropdown options |
| `disabled` | `boolean` | `false` | Whether the dropdown is disabled |
| `showNoDefaultOption` | `boolean` | `true` | Whether to show a "no default" option |
| `noDefaultValue` | `string` | `''` | The value for the "no default" option |
| `noDefaultLabel` | `string` | `'No default'` | The label for the "no default" option |
| `sortFunction` | `function` | `undefined` | Custom sort function for options |
| `highlightFunction` | `function` | `undefined` | Custom highlight function for options |

## Interface

```typescript
interface GenericDropdownOption {
  id: string
  internal_name: string
  is_default?: boolean
}
```

## Basic Usage

```vue
<template>
  <GenericDropdown
    v-model="selectedValue"
    :options="contextOptions"
    :show-no-default-option="true"
    no-default-label="No context selected"
    no-default-value=""
  />
</template>

<script setup lang="ts">
import GenericDropdown from '@/components/form/GenericDropdown.vue'

const selectedValue = ref('')
const contextOptions = ref([
  { id: '1', internal_name: 'Production', is_default: true },
  { id: '2', internal_name: 'Development' },
  { id: '3', internal_name: 'Staging' }
])
</script>
```

## Advanced Usage with Custom Sort

```vue
<template>
  <GenericDropdown
    v-model="selectedLanguage"
    :options="languageOptions"
    :sort-function="customSort"
    no-default-label="No language selected"
  />
</template>

<script setup lang="ts">
import GenericDropdown from '@/components/form/GenericDropdown.vue'

const selectedLanguage = ref('')
const languageOptions = ref([
  { id: '1', internal_name: 'English', is_default: true },
  { id: '2', internal_name: 'Spanish' },
  { id: '3', internal_name: 'French' }
])

// Custom sort function (reverse alphabetical)
const customSort = (options: GenericDropdownOption[]) => {
  return options.sort((a, b) => b.internal_name.localeCompare(a.internal_name))
}
</script>
```

## Usage in ProjectDetail.vue

The component is already integrated in `ProjectDetail.vue` for both context and language dropdowns:

```vue
<GenericDropdown
  v-model="editForm.context_id"
  :options="contexts"
  :show-no-default-option="true"
  no-default-label="No default context"
  no-default-value=""
/>

<GenericDropdown
  v-model="editForm.language_id"
  :options="languages"
  :show-no-default-option="true"
  no-default-label="No default language"
  no-default-value=""
/>
```

## Features in Action

1. **Priority Sorting**: Current selection always appears first, followed by system default (if different from current)
2. **Consistent Separator**: Visual separator between priority items (including "no default" option) and remaining items
3. **Proper Handling of Default Values**: When current selection is the system default, it still appears in the priority section
4. **Consistent Styling**: Uses the same classes as the original dropdown utilities
5. **Accessibility**: Proper ARIA labels and keyboard navigation support

## Recent Bug Fixes

### Fixed Priority Item Ordering Issue
Previously, when the current selection was the system default, it was not being added to the priority items. This caused:
- Inconsistent ordering (default value appearing in remaining items instead of priority)
- Missing separator line between priority and remaining items

**Fixed by:**
- Current selection is now always added to priority items regardless of whether it's the system default
- System default is only added to priority items if it's different from the current selection
- Separator line consistently appears when there are priority items OR when the "no default" option is shown

## Future Enhancements

- Support for grouped options
- Multi-select functionality
- Search/filter capability
- Custom option templates
- Loading states
- Error states
