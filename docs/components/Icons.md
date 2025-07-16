# Icon Components

This directory contains SVG icon components that provide consistent iconography throughout the inventory management application.

## Overview

All icon components are simple Vue components that render SVG elements using the `currentColor` property for color inheritance. They are designed to be flexible and work with any color scheme through CSS classes.

## CheckCircleIcon.vue

A filled circle icon with a checkmark, typically used to indicate success states, completion, or positive status.

### Features

- **Success Indication**: Perfect for completed tasks, successful operations, or positive status
- **Filled Design**: Solid circle with checkmark for high visibility
- **Color Inheritance**: Uses `currentColor` for easy theming
- **Accessibility**: Semantic SVG structure

### Props

None - this is a simple SVG component.

### Events

None - this is a simple SVG component.

### Usage

```vue
<template>
  <!-- Success state -->
  <div class="flex items-center text-green-600">
    <CheckCircleIcon class="h-5 w-5 mr-2" />
    <span>Operation completed successfully</span>
  </div>

  <!-- Status indicator -->
  <div class="flex items-center">
    <CheckCircleIcon class="h-4 w-4 text-green-500 mr-1" />
    <span class="text-sm text-gray-700">Active</span>
  </div>

  <!-- Large success icon -->
  <div class="text-center">
    <CheckCircleIcon class="h-12 w-12 text-green-500 mx-auto mb-4" />
    <h3 class="text-lg font-medium text-green-800">Success!</h3>
  </div>
</template>
```

## XCircleIcon.vue

A filled circle icon with an X, typically used to indicate error states, failure, or negative status.

### Features

- **Error Indication**: Perfect for failed operations, errors, or negative status
- **Filled Design**: Solid circle with X for high visibility
- **Color Inheritance**: Uses `currentColor` for easy theming
- **Accessibility**: Semantic SVG structure

### Props

None - this is a simple SVG component.

### Events

None - this is a simple SVG component.

### Usage

```vue
<template>
  <!-- Error state -->
  <div class="flex items-center text-red-600">
    <XCircleIcon class="h-5 w-5 mr-2" />
    <span>Operation failed</span>
  </div>

  <!-- Status indicator -->
  <div class="flex items-center">
    <XCircleIcon class="h-4 w-4 text-red-500 mr-1" />
    <span class="text-sm text-gray-700">Inactive</span>
  </div>

  <!-- Large error icon -->
  <div class="text-center">
    <XCircleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
    <h3 class="text-lg font-medium text-red-800">Error!</h3>
  </div>
</template>
```

## PackageIcon.vue

An outline icon representing a package or box, typically used for inventory items, products, or shipping-related features.

### Features

- **Inventory Context**: Perfect for representing packages, products, or inventory items
- **Outline Design**: Clean outline style that works well in various contexts
- **Color Inheritance**: Uses `currentColor` for easy theming
- **Accessibility**: Semantic SVG structure

### Props

None - this is a simple SVG component.

### Events

None - this is a simple SVG component.

### Usage

```vue
<template>
  <!-- Navigation item -->
  <div class="flex items-center text-gray-600">
    <PackageIcon class="h-5 w-5 mr-3" />
    <span>Inventory</span>
  </div>

  <!-- Card header -->
  <div class="flex items-center mb-4">
    <div class="bg-blue-100 rounded-full p-2 mr-3">
      <PackageIcon class="h-6 w-6 text-blue-600" />
    </div>
    <h2 class="text-lg font-semibold">Package Management</h2>
  </div>

  <!-- Status card -->
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex items-center">
      <PackageIcon class="h-8 w-8 text-indigo-600 mr-3" />
      <div>
        <h3 class="font-medium text-gray-900">Total Packages</h3>
        <p class="text-2xl font-bold text-indigo-600">1,234</p>
      </div>
    </div>
  </div>
</template>
```

## RocketIcon.vue

An outline icon representing a rocket, typically used for launches, deployments, or performance-related features.

### Features

- **Performance Context**: Perfect for representing speed, launches, or performance metrics
- **Outline Design**: Clean outline style that works well in various contexts
- **Color Inheritance**: Uses `currentColor` for easy theming
- **Accessibility**: Semantic SVG structure

### Props

None - this is a simple SVG component.

### Events

None - this is a simple SVG component.

### Usage

```vue
<template>
  <!-- Performance metric -->
  <div class="flex items-center text-purple-600">
    <RocketIcon class="h-5 w-5 mr-2" />
    <span>Performance</span>
  </div>

  <!-- Launch button -->
  <button class="bg-green-600 text-white px-4 py-2 rounded-md flex items-center">
    <RocketIcon class="h-4 w-4 mr-2" />
    <span>Launch</span>
  </button>

  <!-- Status card -->
  <div class="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-4 text-white">
    <div class="flex items-center">
      <RocketIcon class="h-8 w-8 mr-3" />
      <div>
        <h3 class="font-medium">Deployment Speed</h3>
        <p class="text-2xl font-bold">2.3s</p>
      </div>
    </div>
  </div>
</template>
```

## Common Usage Patterns

### Status Indicators

Use icons to show different states:

```vue
<template>
  <div class="flex items-center space-x-4">
    <!-- Active status -->
    <div class="flex items-center text-green-600">
      <CheckCircleIcon class="h-4 w-4 mr-1" />
      <span class="text-sm">Active</span>
    </div>
    
    <!-- Inactive status -->
    <div class="flex items-center text-red-600">
      <XCircleIcon class="h-4 w-4 mr-1" />
      <span class="text-sm">Inactive</span>
    </div>
  </div>
</template>
```

### Navigation Items

Use icons in navigation menus:

```vue
<template>
  <nav class="space-y-2">
    <RouterLink 
      to="/inventory" 
      class="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
    >
      <PackageIcon class="h-5 w-5 mr-3" />
      <span>Inventory</span>
    </RouterLink>
    
    <RouterLink 
      to="/performance" 
      class="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
    >
      <RocketIcon class="h-5 w-5 mr-3" />
      <span>Performance</span>
    </RouterLink>
  </nav>
</template>
```

### Alert Messages

Use icons in alert/notification components:

```vue
<template>
  <div class="space-y-4">
    <!-- Success alert -->
    <div class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex items-center">
        <CheckCircleIcon class="h-5 w-5 text-green-600 mr-2" />
        <span class="text-green-800">Operation completed successfully</span>
      </div>
    </div>
    
    <!-- Error alert -->
    <div class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex items-center">
        <XCircleIcon class="h-5 w-5 text-red-600 mr-2" />
        <span class="text-red-800">An error occurred</span>
      </div>
    </div>
  </div>
</template>
```

### Cards and Widgets

Use icons to enhance card components:

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Inventory card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="bg-blue-100 rounded-full p-3 mr-4">
          <PackageIcon class="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Total Items</h3>
          <p class="text-3xl font-bold text-blue-600">2,468</p>
        </div>
      </div>
    </div>
    
    <!-- Performance card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="bg-purple-100 rounded-full p-3 mr-4">
          <RocketIcon class="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Avg Response</h3>
          <p class="text-3xl font-bold text-purple-600">1.2s</p>
        </div>
      </div>
    </div>
    
    <!-- Success rate card -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center">
        <div class="bg-green-100 rounded-full p-3 mr-4">
          <CheckCircleIcon class="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Success Rate</h3>
          <p class="text-3xl font-bold text-green-600">99.8%</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

### Button Icons

Use icons in buttons for better visual hierarchy:

```vue
<template>
  <div class="flex space-x-3">
    <!-- Primary action -->
    <button class="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
      <PackageIcon class="h-4 w-4 mr-2" />
      <span>Create Package</span>
    </button>
    
    <!-- Secondary action -->
    <button class="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
      <RocketIcon class="h-4 w-4 mr-2" />
      <span>Deploy</span>
    </button>
  </div>
</template>
```

## Design Principles

### Consistency
- All icons use `currentColor` for color inheritance
- Consistent sizing through CSS classes
- Standardized SVG attributes and structure

### Accessibility
- Semantic SVG structure with proper viewBox
- Compatible with screen readers
- Proper contrast when used with text

### Flexibility
- Color can be controlled through parent element's text color
- Size can be controlled through CSS classes
- Works with any color scheme or theme

### Performance
- Lightweight SVG components
- No external dependencies
- Efficient rendering

### Usage Guidelines
- Use appropriate icons for their intended context
- Maintain consistent sizing within the same component
- Consider color contrast and accessibility
- Provide alternative text when used without accompanying text
