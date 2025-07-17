---
layout: default
title: Components
nav_order: 3
has_children: true
---

# Component Documentation

This section contains comprehensive documentation for all reusable Vue.js components in the Inventory Management UI application.

## Directory Structure

The components are organized into the following main directories:

- **`src/components/actions/`** - Action button components (currently empty, functionality moved to layout subdirectories)
- **`src/components/format/`** - Data formatting and display components
- **`src/components/icons/`** - SVG icon components
- **`src/components/layout/`** - Structural layout components
- **`src/components/_obsolete/`** - Deprecated components (marked for removal)

## Sections

### [Actions](Actions)
Action button components for common operations like save, cancel, edit, delete, add, and view functionalities. These components are now organized within the layout subdirectories.

### [Format](Format)
Data formatting components for displaying and manipulating various data types including:
- **Cards** (`format/card/`): Card, InformationCard, NavigationCard, StatusCard
- **Tables** (`format/table/`): TableElement, TableHeader, TableRow, TableCell
- **Titles** (`format/title/`): Title component with multiple variants
- **Descriptions** (`format/description/`): DescriptionList, DescriptionRow, DescriptionTerm, DescriptionDetail
- **Other formatting**: Toggle, ToggleSmall, Date, DisplayText, FormInput, GenericDropdown, InternalName, InternalNameSmall, Uuid

### [Icons](Icons)
SVG icon components providing consistent iconography throughout the application:
- CheckCircleIcon, XCircleIcon, RocketIcon, PackageIcon, ProjectIcon, IconProject, GenericIcon

### [Layout](Layout)
Structural layout components organized into specialized subdirectories:
- **App components** (`layout/app/`): AppHeader, AppFooter, ErrorDisplay
- **Detail components** (`layout/detail/`): DetailView, DetailViewHeader, SystemProperties, and action buttons
- **List components** (`layout/list/`): ListView and related action buttons
- **Modals** (`layout/modals/`): DeleteConfirmationModal, LoadingSpinner, UnsavedChangesModal

### [Generic Dropdown](GenericDropdown)
Comprehensive documentation for the reusable dropdown component with priority sorting and custom styling.

---

These components follow Vue.js 3 Composition API patterns with TypeScript, ensuring consistency, reusability, and maintainability across the entire application.
