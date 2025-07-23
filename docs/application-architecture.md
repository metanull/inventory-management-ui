---
layout: default
title: Application Architecture
nav_order: 2
---

# Application Architecture

## Overview

A Vue.js 3 + TypeScript application for managing inventories of items, specifically designed for museums and cultural institutions. The application provides comprehensive CRUD operations for reference data (contexts, countries, languages, projects), and museum data (items, collections, images).

## Technology Stack

- **Frontend**: Vue.js 3.5.14 with Composition API (`<script setup>`)
- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 
- **Icons**: Heroicons v2
- **State Management**: Pinia 3.0.3
- **Routing**: Vue Router 4.5.0
- **HTTP Client**: Axios 1.7.9
- **API Client**: @metanull/inventory-app-api-client v1.1.19-dev.715.1753
- **Testing**: Vitest with comprehensive unit and integration tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## Application Structure

```
src/
├── components/           # Reusable UI components
│   ├── format/          # Data formatting components
│   ├── global/          # Global overlay components  
│   ├── icons/           # Resource-specific icons
│   └── layout/          # Layout and structural components
├── composables/         # Vue composition functions
├── router/              # Vue Router configuration
├── stores/              # Pinia state management stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── views/               # Page components
```

## Authentication System

### Implementation
- **Storage**: Local Storage (`auth_token` key)
- **API Integration**: Uses `MobileAppAuthenticationApi` from the client library
- **Protection**: Route guards prevent unauthorized access
- **State Management**: Centralized in `auth.ts` Pinia store

### Features
- Token-based authentication with automatic localStorage persistence
- Route-level protection with redirect to `/login`
- Automatic token attachment to API requests
- Logout functionality with token cleanup

## Application Template & Layout

### App.vue Structure
```vue
<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <AppHeader />           <!-- Navigation and user menu -->
    <ErrorDisplay />        <!-- Global error notifications -->
    <main>
      <RouterView />        <!-- Page content -->
    </main>
    <AppFooter />           <!-- Application footer -->
    <LoadingOverlay />      <!-- Global loading spinner -->
    <DeleteConfirmation />  <!-- Delete confirmation modals -->
    <CancelChangesConfirmation /> <!-- Unsaved changes protection -->
  </div>
</template>
```

### Header Features
- Responsive navigation menu
- User authentication status display
- Resource navigation dropdown
- Mobile-friendly collapsible menu

### Footer
- Basic application information
- Consistent styling across all pages

## Navigation System

### Main Navigation
- **Home/Dashboard**: Application overview and quick access
- **Inventory**: 
  - 🛠️ _(under development)_
- **Reference Data**:
  - Projects: Museum and cultural institutions' projects
  - Contexts: Project categorization contexts
  - Countries: Geographic reference data
  - Languages: Multi-language support

### Routing Configuration
- Protected routes requiring authentication
- RESTful URL patterns (`/resources/:id`)
- Support for create operations (`/projects/new`)
- Automatic redirection for unauthenticated users

## Global Components

### Error Display (`ErrorDisplay.vue`)
- Centralized error notification system
- Pinia store integration (`errorDisplay.ts`)
- Dismissible error messages
- Consistent error formatting

### Loading Overlay (`LoadingOverlay.vue`)
- Full-screen loading indicator
- Pinia store integration (`loadingOverlay.ts`)
- Non-blocking overlay design
- Spinner animation

### Confirmation Modals
- **DeleteConfirmation**: Resource deletion confirmation
- **CancelChangesConfirmation**: Unsaved changes protection
- Modal overlay with backdrop click handling
- Keyboard navigation support

## Project Resource Implementation (Reference Implementation)

### Projects List View (`Projects.vue`)

#### Features
- **Responsive Table Layout**: Desktop table, mobile-friendly cards
- **Advanced Filtering**: 
  - All Projects, Enabled, Launched, Visible filters
  - Filter counts and dynamic labels
  - URL state preservation
- **Search Functionality**: Real-time search across project fields
- **Column Sorting**: Sortable by internal name, creation date
- **Status Management**: Toggle enabled/launched status inline
- **Bulk Operations**: Multi-select with bulk actions
- **Empty States**: Contextual messages based on active filter
- **Loading States**: Skeleton loaders and loading indicators

#### UI Components Used
- `ListView`: Base layout component
- `FilterButton`: Status filter controls
- `SearchControl`: Search input with debouncing
- `TableHeader`: Sortable column headers
- `Toggle`: Status toggle switches
- Action buttons (View/Edit/Delete)

### Project Detail View (`ProjectDetail.vue`)

#### Three-Mode System
1. **View Mode**: Read-only display with action buttons
2. **Edit Mode**: Inline editing with save/cancel
3. **Create Mode**: New project creation form

#### Features
- **Status Cards**: Visual status indicators (enabled/launched/visible)
- **Inline Editing**: Field-by-field editing without navigation
- **Unsaved Changes Protection**: Automatic detection and confirmation
- **Form Validation**: Real-time validation with error display
- **Responsive Layout**: Mobile-optimized forms and actions
- **Navigation Integration**: Back navigation with state preservation

#### Form Fields
- Internal Name (required)
- Legacy ID (backward compatibility)
- Status toggles (enabled/launched)
- Launch date management
- Metadata (created/updated timestamps)

## Reference Data Resources (Context, Country, Language)

### Current Implementation State
All three resources use **legacy table-based layouts** that need refactoring to match the Projects implementation.

### Current Problems
1. **Inconsistent UI**: Different layout patterns from Projects
2. **Limited Functionality**: Basic CRUD without advanced features
3. **Poor Mobile Support**: Table-only layouts
4. **No Search/Filter**: Missing search and filtering capabilities
5. **Modal-Based Editing**: Pop-up forms instead of inline editing
6. **Inconsistent State Management**: Different patterns from Projects

### Required Refactoring (Per Resource)

#### Context Resources (`Contexts.vue` → `ContextDetail.vue`)
**Current State**: Table layout with modal creation/editing
**Required Changes**:
1. Migrate to `ListView` component with FilterButton integration
2. Implement three-mode DetailView (view/edit/create)
3. Add search functionality for context names
4. Implement default context filtering
5. Add responsive mobile layout
6. Remove modal-based editing in favor of inline editing
7. Add unsaved changes protection
8. Implement consistent error handling

#### Country Resources (`Countries.vue` → `CountryDetail.vue`)
**Current State**: Basic table with modal forms
**Required Changes**:
1. Migrate to `ListView` component
2. Implement DetailView with three-mode system
3. Add search functionality for country names
4. Implement ISO code validation
5. Add responsive mobile layout
6. Remove modal-based editing
7. Add comprehensive form validation
8. Implement consistent state management patterns

#### Language Resources (`Languages.vue` → `LanguageDetail.vue`)
**Current State**: Table layout with basic operations
**Required Changes**:
1. Migrate to `ListView` component
2. Implement DetailView with three-mode system  
3. Add default language filtering and management
4. Add search functionality for language names
5. Implement responsive mobile layout
6. Remove modal-based editing
7. Add unsaved changes protection
8. Implement proper error handling

## API Integration & Client Library

### API Client Configuration
```typescript
// Base configuration pattern used across all stores
const createApiClient = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
  const configuration = new Configuration({
    basePath: baseURL,
    accessToken: authStore.token
  })
  return new ResourceApi(configuration)
}
```

### API-to-Application Feature Mapping

#### Authentication API (`MobileAppAuthenticationApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `tokenAcquire()` | Login functionality in auth store |
| `tokenRefresh()` | **Not implemented** - Manual token management |
| `tokenRevoke()` | Logout functionality |

#### Project API (`ProjectApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `projectIndex()` | Projects list view data loading |
| `projectStore()` | Create new project functionality |
| `projectShow()` | Project detail view data loading |
| `projectUpdate()` | Project editing and saving |
| `projectDestroy()` | Project deletion with confirmation |
| `projectSetEnabled()` | Toggle project enabled status |
| `projectSetLaunched()` | Toggle project launched status |
| **Missing**: `projectBulkOperations()` | **Not implemented** - Bulk project operations |
| **Missing**: `projectExport()` | **Not implemented** - Project data export |

#### Context API (`ContextApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `contextIndex()` | Context list loading |
| `contextStore()` | Create context via modal form |
| `contextShow()` | **Limited usage** - Not in detail view |
| `contextUpdate()` | Update context via modal form |
| `contextDestroy()` | Delete context with confirmation |
| `contextSetDefault()` | Set default context functionality |
| **Missing**: Advanced filtering | **Not implemented** - Only basic default filter |

#### Country API (`CountryApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `countryIndex()` | Country list loading |
| `countryStore()` | Create country via modal form |
| `countryShow()` | **Limited usage** - Not in detail view |
| `countryUpdate()` | Update country via modal form |
| `countryDestroy()` | Delete country with confirmation |
| **Missing**: ISO code validation | **Not implemented** - Client-side validation |
| **Missing**: Geographic filtering | **Not implemented** - No advanced filtering |

#### Language API (`LanguageApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `languageIndex()` | Language list loading |
| `languageStore()` | Create language via modal form |
| `languageShow()` | **Limited usage** - Not in detail view |
| `languageUpdate()` | Update language via modal form |
| `languageDestroy()` | Delete language with confirmation |
| `languageSetDefault()` | Set default language functionality |
| **Missing**: Locale validation | **Not implemented** - Advanced locale handling |

#### System Information API (`InfoApi`)
| API Feature | Application Usage |
|-------------|------------------|
| `infoSystem()` | API status monitoring in composables |
| `infoHealth()` | **Not implemented** - Health check integration |
| `infoVersion()` | **Not implemented** - Version display |

#### Partner API (`PartnerApi`) 
| API Status | Application Status |
|------------|-------------------|
| ✅ Available in client | ❌ **Not implemented** - Planned resource |

#### Item API (`ItemApi`)
| API Status | Application Status |
|------------|-------------------|
| ✅ Available in client | ❌ **Not implemented** - Core inventory feature |

#### Tag API (`TagApi`)
| API Status | Application Status |
|------------|-------------------|
| ✅ Available in client | ❌ **Not implemented** - Metadata management |

#### Picture API (`PictureApi`)
| API Status | Application Status |
|------------|-------------------|
| ✅ Available in client | ❌ **Not implemented** - Media management |

## Component Architecture

### Layout Components

#### ListView Component
**Purpose**: Standardized list view layout for resource collections
**Features**:
- Responsive design (table → cards on mobile)
- Integrated search functionality
- Filter button integration
- Empty state handling
- Loading state management
- Action button placement
- Add button integration

#### DetailView Component  
**Purpose**: Standardized detail view for individual resources
**Features**:
- Three-mode system (view/edit/create)
- Status card integration
- Unsaved changes detection
- Form validation integration
- Responsive layout
- Navigation integration
- Action button management

### Format Components
- `DisplayText`: Consistent text display with formatting
- `FormInput`: Standardized form inputs with validation
- `DescriptionList`: Key-value pair display layout
- `DateDisplay`: Consistent date formatting
- `UuidDisplay`: UUID formatting with copy functionality
- `Toggle`: Status toggle switches with variants

### Global Components
- `StatusCard`: Resource status indicators
- `SearchControl`: Debounced search input
- `FilterButton`: Resource filtering controls
- Action buttons (View/Edit/Delete/Save/Cancel)

## State Management (Pinia Stores)

### Store Pattern
All stores follow consistent patterns:
- Reactive state with `ref()`
- Computed properties for derived state
- Async actions with error handling
- Loading state management
- Centralized API client configuration

### Store Implementations

#### Project Store (`project.ts`)
**Status**: ✅ **Complete Implementation**
- Full CRUD operations
- Status management (enabled/launched/visible)
- Caching and reactive updates
- Error handling and loading states
- Computed filtered lists

#### Auth Store (`auth.ts`)
**Status**: ✅ **Complete Implementation**
- Token management with localStorage
- Authentication state tracking
- API client configuration
- Login/logout functionality

#### Context Store (`context.ts`)
**Status**: 🔄 **Basic Implementation - Needs Enhancement**
- Basic CRUD operations
- Default context management
- **Missing**: Advanced filtering, caching, reactive updates

#### Country Store (`country.ts`)
**Status**: 🔄 **Basic Implementation - Needs Enhancement**
- Basic CRUD operations
- **Missing**: ISO code validation, geographic filtering, caching

#### Language Store (`language.ts`)
**Status**: 🔄 **Basic Implementation - Needs Enhancement**
- Basic CRUD operations
- Default language management
- **Missing**: Locale validation, advanced filtering, caching

### Global Feature Stores
- `errorDisplay.ts`: Centralized error notification management
- `loadingOverlay.ts`: Global loading state management
- `deleteConfirmation.ts`: Delete confirmation modal state
- `cancelChangesConfirmation.ts`: Unsaved changes protection

## Git Commit History Summary

### Migration to External API Client (feature/migrate-to-external-api-client)

#### Initial Setup & Authentication (c05beb7 → ea3ff89)
- Setup GitHub packages authentication for `@metanull/inventory-app-api-client`
- Replaced custom auth client with official API client library
- Removed all non-authentication features to establish clean baseline

#### Core Resource Implementation (6e0c8b1 → e800942)
- Implemented Language API CRUD operations with TypeScript
- Added Country API features with Vue 3 + Pinia integration  
- Implemented Context API with CRUD operations and default management
- Added Project API integration with comprehensive CRUD and translation management

#### UI Architecture Refactoring (a7eceb0 → 50c2243)
- Replaced grid/tile layouts with consistent table-based layouts
- Implemented responsive navigation with Reference Data dropdown
- Created reusable StatusCard and action button components
- Developed comprehensive UI refactor for better UX and maintainability

#### Advanced Component Development (edca074 → abc452e)
- Created reusable list view components and refactored Projects view
- Implemented reusable UI components with improved loading states
- Added comprehensive detail view sections with better field visibility
- Integrated consistent ResourceNameDisplay across all list views

#### Layout Standardization (7851fa6 → 8948954)
- Moved DetailLayout to layout folder, renamed to DetailView
- Removed ProjectEditForm.vue in favor of inline editing
- Fixed new project creation blank page issues
- Resolved component refactoring side effects

#### Documentation & Code Quality (c291592 → 1a1c49b)
- Updated API references to use @metanull/inventory-app-api-client
- Reorganized component files for consistency
- Implemented API status monitoring with StatusCard integration
- Added unsaved changes tracking for detail views

#### Advanced Features Implementation (0f8f80c → a2e6d42)
- Enhanced Projects view with cached list for faster loading
- Added 'back' navigation feature on DetailView
- Improved ListView and Projects UI consistency
- Updated API client to v1.1.19-dev.715.1753 with alignment improvements

#### Interactive Features & Testing (2940d2f → 663d8c6)
- Replaced Status column with three separate toggle columns
- Created ToggleSmall component for table display
- Added reusable GenericDropdown component
- Comprehensive component documentation for GitHub Pages

#### Advanced UI Components (524e9f8 → 57de204)
- Reorganized layout components and added reusable components
- Fixed DetailView component creation mode and navigation issues
- Migrated DetailViewHeader into DetailView
- Implemented centralized global features with Pinia stores

#### Single Mode State Pattern (98fcc74 → 929a2a1)
- Implemented single mode state pattern for ProjectDetail and DetailView
- Added comprehensive Global components documentation
- Enhanced unsaved changes protection logic
- Centralized modal overlay components

#### Search & Filter Features (83b1d30 → 544a68c)
- Added search functionality to list views with SearchControl component
- Implemented Projects list view search functionality
- Made ListView filter bar adaptive for mobile devices
- Added comprehensive test suites for format components

#### Icon Standardization & Testing (1eb4427 → eb06da8)
- Replaced custom icons with HeroIcons throughout application
- Implemented comprehensive test suites for ListView and DetailView components
- Fixed event warnings for backgroundClick in confirmation modals
- Made table rows open ProjectDetail.vue with proper ToggleSmall behavior

#### Code Quality & Documentation (3d50f81 → cde10c2)
- Refactored Toggle and InternalName components for consistency
- Eliminated code duplication in Toggle component
- Enhanced DetailView components with comprehensive store initialization
- Achieved comprehensive linting compliance
- Updated comprehensive documentation reflecting current project state

## Comparison: Projects vs Reference Data Resources

### Implementation Maturity

| Feature | Projects | Context | Country | Language |
|---------|----------|---------|---------|----------|
| **Layout Component** | ✅ ListView/DetailView | ❌ Custom table | ❌ Custom table | ❌ Custom table |
| **Three-Mode System** | ✅ View/Edit/Create | ❌ Modal-based | ❌ Modal-based | ❌ Modal-based |
| **Search Functionality** | ✅ Real-time search | ❌ No search | ❌ No search | ❌ No search |
| **Advanced Filtering** | ✅ 4 filter types | 🔄 Basic default filter | ❌ No filtering | 🔄 Basic default filter |
| **Responsive Design** | ✅ Mobile optimized | ❌ Table only | ❌ Table only | ❌ Table only |
| **Inline Editing** | ✅ Full inline editing | ❌ Modal forms | ❌ Modal forms | ❌ Modal forms |
| **Unsaved Changes** | ✅ Protection enabled | ❌ No protection | ❌ No protection | ❌ No protection |
| **Status Management** | ✅ Toggle controls | 🔄 Default only | ❌ No status | 🔄 Default only |
| **Loading States** | ✅ Comprehensive | 🔄 Basic spinner | 🔄 Basic spinner | 🔄 Basic spinner |
| **Error Handling** | ✅ Centralized | 🔄 Basic errors | 🔄 Basic errors | 🔄 Basic errors |
| **State Management** | ✅ Advanced Pinia | 🔄 Basic store | 🔄 Basic store | 🔄 Basic store |
| **Testing Coverage** | ✅ Comprehensive | ❌ Minimal | ❌ Minimal | ❌ Minimal |

### Refactoring Requirements Summary

#### High Priority Refactoring
1. **Layout Migration**: Replace custom tables with ListView/DetailView components
2. **Mode System**: Implement three-mode (view/edit/create) pattern
3. **Responsive Design**: Add mobile-optimized layouts
4. **Search Integration**: Add SearchControl components
5. **Inline Editing**: Remove modal forms, implement inline editing

#### Medium Priority Enhancements
1. **Advanced Filtering**: Context/Language default filters, Country geographic filters
2. **State Management**: Upgrade stores to match Project store patterns
3. **Loading States**: Implement comprehensive loading and error states
4. **Form Validation**: Add real-time validation and error display

#### Long-Term Improvements
1. **Testing Coverage**: Comprehensive unit and integration tests
2. **Performance**: Implement caching and reactive updates
3. **Accessibility**: ARIA labels and keyboard navigation
4. **Internationalization**: Multi-language support integration

---

*Generated on: July 23, 2025*  
*Branch: feature/migrate-to-external-api-client*  
*API Client Version: @metanull/inventory-app-api-client@1.1.19-dev.715.1753*
