# Remove all features except Authentication

## What was done

- **CRITICAL: Removed all views and features from the application except Authentication**
- **CRITICAL: Preserved only the Authentication feature**
- **CRITICAL: Removed the entire custom client API, and related types, stores, tests**

## Changes Made

### Router
- Simplified router to only include `/` (Home) and `/login` routes
- Removed all other routes for items, partners, projects, tags, etc.

### Views
- Kept only `Home.vue` and `Login.vue`
- Removed all other view files (Items, Partners, Projects, Tags, Pictures, Countries, Languages, Contexts, ImageUploads, Addresses, Contacts, AvailableImages, Details, Authors, Artists, Workshops)
- Simplified `Home.vue` to show basic system status instead of dashboard with API calls

### Components
- Updated `AppHeader.vue` to remove all navigation links except Dashboard and Logout
- Removed references to `@headlessui/vue` Menu components that were used for navigation

### Stores
- Kept only `auth.ts` store
- Removed `author.ts`, `detail.ts`, `workshop.ts` stores
- Preserved auth store tests in `src/stores/__tests__/auth.test.ts`

### API
- Removed custom `client.ts` file (1410 lines) with all custom API interfaces and types
- Kept `inventory-app.json` OpenAPI specification file

### Tests
- Removed test files for deleted stores and views
- Preserved authentication tests

## Next Steps

This cleanup prepares the application for refactoring to use the `@metanull/inventory-app-api-client` package directly without custom wrappers. Only the authentication feature remains functional, ready for future feature implementation.
