# Home Components

Home components provide the building blocks for the application dashboard and home page.

## Card

A versatile base card component that serves as the foundation for other home components.

### Features
- **Flexible Layout**: Supports icon, title, description, and custom content
- **Consistent Styling**: Unified card appearance across the application
- **Color Theming**: Supports different color schemes
- **Hover Effects**: Subtle shadow animation on hover
- **Slot Support**: Icon and default content slots

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `required` | Card title text |
| `description` | `string` | `required` | Card description text |
| `mainColor` | `string` | `required` | Color theme ('blue', 'green', 'purple', 'orange', 'red', 'gray') |

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon to display next to the title |
| `default` | Main content area of the card |

### Usage

```vue
<template>
  <Card 
    title="Projects"
    description="Manage your inventory projects"
    main-color="blue"
  >
    <template #icon>
      <PackageIcon />
    </template>
    
    <div class="space-y-2">
      <p>Total Projects: {{ projectCount }}</p>
      <button class="btn-primary">View All</button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/home/Card.vue'
import PackageIcon from '@/components/icons/PackageIcon.vue'
</script>
```

### Used In
- All other home components (NavigationCard, StatusCard, InformationCard)
- Home.vue dashboard

## NavigationCard

A navigation-focused card component with built-in routing.

### Features
- **Router Integration**: Built-in navigation with Vue Router
- **Consistent Button Styling**: Themed buttons matching card color
- **Action Arrow**: Visual indicator for navigation
- **Accessible Navigation**: Proper link semantics

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `required` | Card title text |
| `description` | `string` | `required` | Card description text |
| `mainColor` | `string` | `required` | Color theme |
| `buttonText` | `string` | `required` | Navigation button text |
| `buttonRoute` | `string` | `required` | Vue Router route path |

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon to display next to the title |

### Usage

```vue
<template>
  <NavigationCard
    title="Projects"
    description="Manage your inventory projects and their configurations"
    main-color="blue"
    button-text="View Projects"
    button-route="/projects"
  >
    <template #icon>
      <PackageIcon />
    </template>
  </NavigationCard>
</template>

<script setup lang="ts">
import NavigationCard from '@/components/home/NavigationCard.vue'
import PackageIcon from '@/components/icons/PackageIcon.vue'
</script>
```

### Used In
- Home.vue (main navigation cards)

## StatusCard

A status-focused card component with toggle functionality.

### Features
- **Status Display**: Shows current system status
- **Toggle Integration**: Built-in Toggle component
- **Dynamic Icons**: Status-based icon switching
- **Loading States**: Visual feedback for status changes
- **Accessibility**: Proper ARIA attributes

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `required` | Card title text |
| `description` | `string` | `required` | Card description text |
| `mainColor` | `string` | `required` | Color theme |
| `statusText` | `string` | `required` | Current status text |
| `toggleTitle` | `string` | `required` | Toggle component title |
| `isActive` | `boolean` | `required` | Current toggle state |
| `loading` | `boolean` | `required` | Loading state |
| `disabled` | `boolean` | `false` | Whether toggle is disabled |
| `activeIconBackgroundClass` | `string` | `required` | CSS class for active icon background |
| `inactiveIconBackgroundClass` | `string` | `required` | CSS class for inactive icon background |
| `activeIconClass` | `string` | `required` | CSS class for active icon |
| `inactiveIconClass` | `string` | `required` | CSS class for inactive icon |
| `activeIconComponent` | `Component` | `required` | Vue component for active icon |
| `inactiveIconComponent` | `Component` | `required` | Vue component for inactive icon |

### Events

| Event | Description |
|-------|-------------|
| `toggle` | Emitted when toggle is activated |

### Usage

```vue
<template>
  <StatusCard
    title="API Status"
    description="Current API connection status"
    main-color="green"
    :status-text="apiStatus ? 'Connected' : 'Disconnected'"
    toggle-title="API Connection"
    :is-active="apiStatus"
    :loading="updating"
    active-icon-background-class="bg-green-100"
    inactive-icon-background-class="bg-red-100"
    active-icon-class="text-green-600"
    inactive-icon-class="text-red-600"
    :active-icon-component="CheckCircleIcon"
    :inactive-icon-component="XCircleIcon"
    @toggle="toggleApiStatus"
  >
    <template #icon>
      <ServerIcon />
    </template>
  </StatusCard>
</template>

<script setup lang="ts">
import StatusCard from '@/components/home/StatusCard.vue'
import CheckCircleIcon from '@/components/icons/CheckCircleIcon.vue'
import XCircleIcon from '@/components/icons/XCircleIcon.vue'
import ServerIcon from '@/components/icons/ServerIcon.vue'
</script>
```

### Used In
- Home.vue (status monitoring cards)

## InformationCard

A information-focused card component for displaying data and statistics.

### Features
- **Data Display**: Optimized for showing statistics and information
- **Flexible Content**: Supports various data types and formats
- **Consistent Styling**: Matches other home components
- **Accessibility**: Proper semantic markup

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `required` | Card title text |
| `description` | `string` | `required` | Card description text |
| `mainColor` | `string` | `required` | Color theme |

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Icon to display next to the title |
| `default` | Main content area for information display |

### Usage

```vue
<template>
  <InformationCard
    title="System Statistics"
    description="Overview of system metrics and performance"
    main-color="purple"
  >
    <template #icon>
      <ChartIcon />
    </template>
    
    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-600">Total Users:</span>
        <span class="font-semibold">{{ userCount }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">Active Projects:</span>
        <span class="font-semibold">{{ activeProjects }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-600">System Load:</span>
        <span class="font-semibold text-green-600">{{ systemLoad }}%</span>
      </div>
    </div>
  </InformationCard>
</template>

<script setup lang="ts">
import InformationCard from '@/components/home/InformationCard.vue'
import ChartIcon from '@/components/icons/ChartIcon.vue'
</script>
```

### Used In
- Home.vue (information and statistics displays)

## Design Principles

1. **Modularity**: Cards are composable and can be combined
2. **Consistency**: All cards share the same base styling and behavior
3. **Accessibility**: Proper semantic markup and ARIA attributes
4. **Theming**: Consistent color system across all cards
5. **Responsive Design**: Cards adapt to different screen sizes
6. **Performance**: Optimized for fast rendering and interactions

## Color Themes

The home components support the following color themes:
- **blue**: Primary actions and navigation
- **green**: Success states and positive actions
- **purple**: Information and statistics
- **orange**: Warnings and alerts
- **red**: Errors and destructive actions
- **gray**: Neutral and secondary content
