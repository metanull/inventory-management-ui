# Inventory Management UI - Copilot Instructions

## Project Overview

This is a Vue.js 3 application built with TypeScript that provides a user interface for an inventory management API. The application follows modern Vue.js best practices and uses the Composition API throughout.

## Technology Stack

### Core Framework
- **Vue.js 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety
- **Vite** for fast development and optimized builds
- **Vue Router 4** for client-side routing
- **Pinia** for state management

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **Headless UI Vue** for accessible, unstyled UI components
- **Heroicons Vue** for consistent iconography
- **PostCSS** with Autoprefixer for CSS processing

### Testing & Quality
- **Vitest** for unit testing with coverage reporting
- **Vue Test Utils** for component testing
- **ESLint** with TypeScript and Vue rules for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

### API Integration
- **Axios** for HTTP requests with interceptors for authentication
- **TypeScript interfaces** for API response types based on OpenAPI specification
- **VueUse** for composable utilities

## Project Structure

```
src/
├── api/           # API client and type definitions
├── components/    # Reusable Vue components
│   └── layout/    # Layout-specific components
├── router/        # Vue Router configuration
├── stores/        # Pinia stores for state management
├── views/         # Page-level components
├── style.css      # Global styles with Tailwind
└── main.ts        # Application entry point
```

## API Integration

The application integrates with a REST API that manages:
- **Items** (inventory objects and monuments)
- **Partners** (museums, institutions, individuals)
- **Projects** (collections with launch dates and status)
- **Tags** (categorization system)
- **Pictures** (image management with uploads)
- **Countries** and **Languages** (reference data)
- **Contexts** and **Contextualizations** (content organization)

### Authentication
- Uses bearer token authentication
- Token stored in localStorage
- Automatic token injection via Axios interceptors
- Automatic logout on 401 responses

### API Client Structure
The `apiClient` provides methods for all CRUD operations:
- `login()` / `logout()` for authentication
- `getItems()`, `createItem()`, `updateItem()`, `deleteItem()` for items
- Similar patterns for partners, projects, tags, and pictures
- TypeScript interfaces match the OpenAPI specification

## State Management

### Auth Store (`useAuthStore`)
- Manages authentication state and tokens
- Provides `login()`, `logout()`, and `isAuthenticated` computed
- Handles loading states and error messages

### Component Patterns
- Uses Composition API with `<script setup>` syntax
- Reactive state with `ref()` and `reactive()`
- Lifecycle hooks like `onMounted()` for data fetching
- Error handling with try/catch and user feedback

## Styling Guidelines

### Tailwind CSS Usage
- Utility-first approach with responsive modifiers
- Custom component classes defined in `style.css` using `@apply`
- Consistent color palette with primary (blue) and semantic colors
- Typography scale using Inter font family

### Component Classes
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline` for buttons
- `.card` for container styling
- `.input` and `.label` for form elements
- Responsive grid layouts with `grid-cols-*` classes

## Development Workflow

### Code Quality
1. **Type Safety**: All components use TypeScript with strict settings
2. **Linting**: ESLint with Vue, TypeScript, and Prettier rules
3. **Formatting**: Prettier with consistent configuration
4. **Testing**: Vitest for unit tests with coverage requirements
5. **Git Hooks**: Pre-commit linting and formatting via Husky

### CI/CD Pipeline
- **Pull Request Validation**: Type checking, linting, testing, building
- **Security Scanning**: Trivy vulnerability scanner
- **Coverage Requirements**: 80% minimum test coverage
- **Automated Comments**: Build status updates on PRs

### Environment Configuration
- `.env` files for different environments
- `VITE_API_BASE_URL` for API endpoint configuration
- `VITE_APP_TITLE` for application branding

## Key Features

### Authentication Flow
1. Login form with email/password
2. Token storage and automatic injection
3. Route guards protecting authenticated pages
4. Automatic logout on token expiration

### Data Management
- CRUD operations for all entity types
- Real-time error handling and user feedback
- Loading states with spinners
- Confirmation dialogs for destructive actions

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
- Consistent spacing and typography

## Development Guidelines

### Component Creation
- Use `<script setup>` syntax for new components
- Define TypeScript interfaces for props and emits
- Include error handling and loading states
- Follow the existing naming conventions

### API Integration
- Use the existing `apiClient` methods
- Handle errors consistently with user feedback
- Show loading states during API calls
- Cache data appropriately with reactive state

### Testing Requirements
- Unit tests for all business logic
- Component tests for user interactions
- Mock API calls in tests
- Maintain 80%+ test coverage

### Code Style
- Follow ESLint and Prettier configurations
- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep components focused and single-purpose

This application serves as a modern Vue.js frontend for inventory management, emphasizing type safety, code quality, and user experience.
