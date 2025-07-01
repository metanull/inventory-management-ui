---
layout: default
title: Contributing Guidelines
nav_order: 2
---

# Contributing Guidelines

We welcome contributions to the Inventory Management UI! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/inventory-management-ui.git
cd inventory-management-ui

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL-OWNER/inventory-management-ui.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 📝 Contribution Process

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clear, concise code following our coding standards
- Add tests for new functionality
- Update documentation as needed
- Follow the existing project structure

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples of good commit messages
git commit -m "feat: add tag management to item detail view"
git commit -m "fix: resolve routing issue with detail views"
git commit -m "docs: update API integration documentation"
git commit -m "test: add unit tests for auth store"
```

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
# - Provide a clear title and description
# - Reference any related issues
# - Wait for code review
```

## 🏗️ Coding Guidelines

### Vue.js & TypeScript Standards

- **Use `<script setup>` syntax** for all new components
- **TypeScript strict mode** - all code must be properly typed
- **Composition API** over Options API for new components
- **Single File Components** with proper separation of concerns

```vue
<!-- Good: Proper SFC structure -->
<template>
  <div class="component-container">
    <!-- Template content -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ApiResponse } from '@/api/client'

// Proper TypeScript typing
const loading = ref<boolean>(false)
const data = ref<ApiResponse | null>(null)

onMounted(() => {
  // Component logic
})
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Code Organization

- **Keep components focused** - one responsibility per component
- **Use composables** for reusable logic
- **Proper naming** - PascalCase for components, camelCase for functions
- **Type safety** - define interfaces for all API responses and props

### Styling Guidelines

- **Tailwind CSS** for styling - use utility classes
- **Responsive design** - mobile-first approach
- **Consistent spacing** - use Tailwind's spacing scale
- **Accessibility** - ensure components are accessible

```vue
<!-- Good: Proper Tailwind usage -->
<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      Component Title
    </h2>
    <p class="text-sm text-gray-600">
      Component description
    </p>
  </div>
</template>
```

## ✅ Quality Controls

Before submitting a pull request, ensure all quality controls pass:

### 1. Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

### 2. Testing Requirements

- **Write tests** for all new functionality
- **Update existing tests** when modifying code
- **Minimum 80% test coverage** for new code

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### 3. Build Verification

```bash
# Ensure the application builds successfully
npm run build

# Test the production build
npm run preview
```

### 4. Security & Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities if found
npm audit fix

# Update dependencies (if needed)
npm update
```

### 5. Git Hygiene

```bash
# Ensure your branch is up to date
git fetch upstream
git rebase upstream/main

# Squash commits if needed
git rebase -i HEAD~n
```

## 🧪 Testing Guidelines

### Unit Tests

- **Test business logic** thoroughly
- **Mock external dependencies** (API calls, etc.)
- **Use descriptive test names**

```typescript
// Good: Descriptive test structure
describe('AuthStore', () => {
  describe('login', () => {
    it('should set user data when login succeeds', async () => {
      // Test implementation
    })

    it('should handle login errors gracefully', async () => {
      // Test implementation
    })
  })
})
```

### Component Tests

- **Test user interactions**
- **Verify component behavior**
- **Mock router and stores**

```typescript
// Good: Component test example
describe('ItemDetail.vue', () => {
  it('should display item information correctly', async () => {
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router, pinia]
      }
    })
    
    expect(wrapper.text()).toContain('Expected Item Name')
  })
})
```

## 🔍 Code Review Process

### What We Look For

1. **Code Quality**
   - Follows TypeScript best practices
   - Proper error handling
   - Clean, readable code structure

2. **Testing**
   - Adequate test coverage
   - Tests pass consistently
   - Edge cases covered

3. **Performance**
   - No unnecessary re-renders
   - Efficient API calls
   - Proper loading states

4. **Accessibility**
   - Semantic HTML
   - Proper ARIA labels
   - Keyboard navigation support

5. **Documentation**
   - Code is self-documenting
   - Complex logic is commented
   - README updated if needed

### Review Checklist

Before submitting your PR, review this checklist:

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Test coverage meets requirements
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Build completes without errors
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

## 🚫 Common Pitfalls

### Avoid These Mistakes

1. **Not following TypeScript strict mode**
2. **Missing tests for new functionality**
3. **Using `any` type instead of proper typing**
4. **Not handling loading and error states**
5. **Ignoring accessibility requirements**
6. **Not updating documentation**
7. **Committing without linting**

## �️ Application Architecture

### Entity Management

The application manages several core entities:

#### Primary Entities
- **Items** - Inventory objects and monuments
- **Partners** - Museums, institutions, and individuals
- **Projects** - Collections with launch dates and status
- **Tags** - Categorization system
- **Pictures** - Image management

#### Reference Data
- **Countries** - Geographic reference data with names and codes
- **Languages** - Language reference data with names and codes
- **Contexts** - Content organization and categorization
- **ImageUploads** - File upload management for images

#### Content Management
- **Contextualizations** - Links between contexts and content
- **Details** - Detailed information records
- **AvailableImages** - Available image resources

### Adding New Entities

When adding new entities to the application:

1. **API Client** - Add interfaces and CRUD methods to `src/api/client.ts`
2. **Views** - Create list and detail views in `src/views/`
3. **Routes** - Add routes to `src/router/index.ts`
4. **Navigation** - Update `src/components/layout/AppHeader.vue`
5. **Tests** - Add comprehensive tests for new functionality
6. **Documentation** - Update this guide and API documentation

### Entity View Pattern

Each entity follows a consistent pattern:

```
src/views/
├── EntityName.vue          # List view with CRUD operations
├── EntityNameDetail.vue    # Detail view for single entity
└── __tests__/
    ├── EntityName.test.ts  # Tests for list view
    └── EntityNameDetail.test.ts # Tests for detail view
```

## �🎯 Areas for Contribution

We especially welcome contributions in these areas:

- **New features** - enhance existing functionality
- **Bug fixes** - help us improve stability
- **Performance improvements** - optimize the application
- **Accessibility** - make the app more inclusive
- **Documentation** - improve guides and examples
- **Testing** - increase test coverage
- **UI/UX improvements** - enhance user experience
- **Entity enhancements** - improve CRUD operations for all entities
- **File upload improvements** - enhance image upload functionality

## 📞 Getting Help

- **GitHub Issues** - for bugs and feature requests
- **GitHub Discussions** - for questions and general discussion
- **Code Review** - maintainers will provide feedback on PRs

## 🏆 Recognition

Contributors will be recognized in:
- The project's README
- Release notes for significant contributions
- GitHub's contributor list

Thank you for contributing to the Inventory Management UI! 🎉

---

*Last updated: {{ site.time | date: "%B %d, %Y" }}*
