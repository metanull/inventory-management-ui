---
layout: default
title: Contributing
nav_order: 5
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

### 2. Authenticating for Private GitHub Packages

This project depends on private npm packages hosted on GitHub Packages. You must authenticate with your own GitHub Personal Access Token (PAT) to install dependencies.

#### ⚙️ Project `.npmrc`

The project-level `.npmrc` contains:

```
@metanull:registry=https://npm.pkg.github.com/
```

This is safe to commit and does **not** contain any tokens.

#### 🔐 How to Authenticate

1. Generate a GitHub PAT with `read:packages` and `repo` scopes.
2. Add your token to your user-level npm config by running:
   ```powershell
   npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```
   This writes the token to your user `.npmrc` (e.g., `C:\Users\<username>\.npmrc`).

3. You can now run `npm install` and access private packages.

### 🤖 CI/CD Automation

- In CI, set the token as an environment variable (e.g., `NPM_TOKEN`) and inject it at build time.

#### 🛡️ Security Reminder

- **Never commit your token to the repository.**
- Each contributor must use their own token.

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 📋 Essential Guidelines

Before contributing, please review our development guidelines:

### [📖 Coding Guidelines](guidelines/coding-guidelines/)
- Vue.js & TypeScript standards
- Component structure and organization
- Styling with Tailwind CSS
- Quality controls and best practices
- Architecture patterns

### [🧪 Testing Guidelines](guidelines/testing/)
- Testing requirements and coverage
- Unit and component testing standards
- Code review criteria

### [🔗 API Integration Guidelines](guidelines/api-integration/)
- Backend API integration patterns
- Authentication and error handling

## 📝 Contribution Process

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Write clear, concise code following our [coding standards](guidelines/coding-guidelines/)
- Add tests for new functionality (see [testing guidelines](guidelines/testing/))
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
```

#### Option A: Using GitHub Web Interface

1. Navigate to your fork on GitHub
2. Click "Compare & pull request"
3. Provide a clear title and description
4. Reference any related issues
5. Wait for code review

#### Option B: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI
# Windows: choco install gh
# macOS: brew install gh
# Linux: sudo apt install gh

# Authenticate (one-time setup)
gh auth login

# Create PR with auto-merge and squash
gh pr create --title "feat: add new feature" --body "Description of changes" \
  --assignee @me \
  --label "enhancement" \
  --auto-merge \
  --squash
```

## ✅ Pre-Submission Checklist

Before submitting your PR, ensure you've followed our guidelines:

### Code Quality
- [ ] Code follows our [coding standards](guidelines/coding-guidelines/)
- [ ] All [quality controls](guidelines/coding-guidelines/#quality-controls) pass
- [ ] No linting errors
- [ ] TypeScript compilation successful
- [ ] Build completes without errors

### Testing
- [ ] Tests written for new functionality (see [testing guidelines](guidelines/testing/))
- [ ] All tests pass
- [ ] Test coverage meets requirements (80%+ for new code)

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] Documentation updated if needed

### Git
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Branch is up to date with main
- [ ] No merge conflicts

## 🔍 Code Review Process

### What We Look For

1. **Code Quality**
   - Follows our [coding guidelines](guidelines/coding-guidelines/)
   - Proper error handling
   - Clean, readable code structure

2. **Testing**
   - Meets our [testing requirements](guidelines/testing/)
   - Edge cases covered

3. **Performance**
   - No unnecessary re-renders
   - Efficient API calls
   - Proper loading states

4. **Accessibility**
   - Semantic HTML
   - Proper ARIA labels
   - Keyboard navigation support

## �️ Adding a New Resource

The Projects resource serves as the **reference implementation** for all future resources. Follow this comprehensive walkthrough to add a new resource (e.g., Items, Partners, Tags) to the application.

### Step 1: Plan Your Resource

Before implementing, define:
- **Resource name** (e.g., "Item", "Partner") 
- **API endpoints** available in the backend
- **Resource-specific fields** and their types
- **Status/state fields** that need toggle controls
- **Filtering criteria** for the list view
- **Search fields** for the search functionality

### Step 2: Create the Pinia Store

Create `src/stores/[resource].ts` following the pattern in `src/stores/project.ts`:

```typescript
// src/stores/item.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ItemsApi, type Item, type ItemRequest } from '@metanull/inventory-app-api-client'
import { useApiClient } from '@/composables/useApiClient'

export const useItemStore = defineStore('item', () => {
  // State
  const items = ref<Item[]>([])
  const currentItem = ref<Item | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // API client
  const { getApiClient } = useApiClient()
  
  // Computed
  const enabledItems = computed(() => 
    items.value.filter(item => item.is_enabled)
  )
  
  // Actions
  const fetchItems = async () => {
    loading.value = true
    error.value = null
    try {
      const api = new ItemsApi(getApiClient())
      const response = await api.getItems()
      items.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch items'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchItem = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const api = new ItemsApi(getApiClient())
      const response = await api.getItem(id)
      currentItem.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch item'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const createItem = async (itemData: ItemRequest) => {
    // Implementation following project.ts pattern
  }

  const updateItem = async (id: number, itemData: ItemRequest) => {
    // Implementation following project.ts pattern
  }

  const deleteItem = async (id: number) => {
    // Implementation following project.ts pattern
  }

  return {
    // State
    items,
    currentItem,
    loading,
    error,
    // Computed
    enabledItems,
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem
  }
})
```

### Step 3: Create the List View

Create `src/views/Items.vue` following the pattern in `src/views/Projects.vue`:

```vue
<template>
  <ListView
    title="Items"
    description="Manage cultural objects and monuments in your inventory system."
    add-button-route="/items/new"
    add-button-label="Add Item"
    color="blue"
    :is-empty="filteredItems.length === 0"
    empty-title="No items found"
    :empty-message="emptyMessage"
    :show-empty-add-button="filterMode === 'all'"
    empty-add-button-label="New Item"
    @retry="fetchItems"
  >
    <template #icon>
      <ItemIcon />
    </template>
    
    <template #filters>
      <FilterButton
        label="All Items"
        :is-active="filterMode === 'all'"
        :count="items.length"
        variant="primary"
        @click="filterMode = 'all'"
      />
      <FilterButton
        label="Enabled"
        :is-active="filterMode === 'enabled'"
        :count="enabledItems.length"
        variant="info"
        @click="filterMode = 'enabled'"
      />
      <!-- Add more filters as needed -->
    </template>

    <!-- Search Control -->
    <SearchControl
      v-model="searchQuery"
      placeholder="Search items by name, description..."
    />

    <!-- Data Table -->
    <DataTable>
      <DataTableHead>
        <TableHeader
          v-for="column in columns"
          :key="column.key"
          :column="column"
          :sort-key="sortKey"
          :sort-direction="sortDirection"
          @sort="handleSort"
        />
        <th class="w-32">Actions</th>
      </DataTableHead>
      <DataTableBody>
        <DataTableRow
          v-for="item in sortedAndFilteredItems"
          :key="item.id"
          @click="navigateToDetail(item.id)"
        >
          <DataTableCell class="font-medium">
            <InternalNameDisplay
              :internal-name="item.internal_name"
              :backward-compatibility="item.backward_compatibility"
            />
          </DataTableCell>
          <!-- Add more cells for your resource's specific fields -->
          <DataTableCell>
            <div class="flex gap-1">
              <ViewButton @click.stop="navigateToDetail(item.id)" />
              <EditButton @click.stop="navigateToEdit(item.id)" />
              <DeleteButton @click.stop="handleDelete(item)" />
            </div>
          </DataTableCell>
        </DataTableRow>
      </DataTableBody>
    </DataTable>
  </ListView>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/item'
// Import all necessary components...

// Setup store and router
const itemStore = useItemStore()
const router = useRouter()

// Reactive state
const searchQuery = ref('')
const filterMode = ref<'all' | 'enabled'>('all')
const sortKey = ref<string>('internal_name')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed properties
const { items, enabledItems, loading } = storeToRefs(itemStore)

const filteredItems = computed(() => {
  let filtered = items.value
  
  // Apply filters
  if (filterMode.value === 'enabled') {
    filtered = enabledItems.value
  }
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.internal_name.toLowerCase().includes(query) ||
      item.backward_compatibility?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Methods following Projects.vue pattern...
const fetchItems = () => itemStore.fetchItems()

onMounted(() => {
  fetchItems()
})
</script>
```

### Step 4: Create the Detail View

Create `src/views/ItemDetail.vue` following the pattern in `src/views/ProjectDetail.vue`:

```vue
<template>
  <DetailView
    :store-loading="itemStore.loading"
    :resource="mode === 'create' ? null : item"
    :mode="mode"
    :save-disabled="!hasUnsavedChanges"
    :has-unsaved-changes="hasUnsavedChanges"
    :back-link="backLink"
    :status-cards="statusCardsConfig"
    :create-title="'New Item'"
    :create-subtitle="'(Creating)'"
    information-title="Item Information"
    :information-description="informationDescription"
    :fetch-data="fetchItem"
    @edit="enterEditMode"
    @save="saveItem"
    @cancel="cancelAction"
    @delete="deleteItem"
    @status-toggle="handleStatusToggle"
  >
    <template #resource-icon>
      <ItemIcon class="h-6 w-6 text-blue-600" />
    </template>
    
    <template #information>
      <DescriptionList>
        <!-- Follow the pattern from ProjectDetail.vue -->
        <DescriptionRow variant="gray">
          <DescriptionTerm>Internal Name</DescriptionTerm>
          <DescriptionDetail>
            <FormInput
              v-if="mode === 'edit' || mode === 'create'"
              v-model="editForm.internal_name"
              type="text"
            />
            <DisplayText v-else>{{ item?.internal_name }}</DisplayText>
          </DescriptionDetail>
        </DescriptionRow>
        <!-- Add more fields specific to your resource -->
      </DescriptionList>
    </template>
  </DetailView>
</template>

<script setup lang="ts">
// Follow the exact pattern from ProjectDetail.vue
// adapting the logic for your specific resource
</script>
```

### Step 5: Create the Icon Component

Create `src/components/icons/ItemIcon.vue`:

```vue
<template>
  <CubeIcon v-bind="$attrs" />
</template>

<script setup lang="ts">
import { CubeIcon } from '@heroicons/vue/24/outline'
</script>
```

### Step 6: Add Routes

Update `src/router/index.ts`:

```typescript
{
  path: '/items',
  name: 'Items',
  component: () => import('@/views/Items.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/items/new',
  name: 'ItemCreate',
  component: () => import('@/views/ItemDetail.vue'),
  props: { mode: 'create' },
  meta: { requiresAuth: true }
},
{
  path: '/items/:id',
  name: 'ItemDetail',
  component: () => import('@/views/ItemDetail.vue'),
  props: route => ({ id: parseInt(route.params.id), mode: 'view' }),
  meta: { requiresAuth: true }
},
{
  path: '/items/:id/edit',
  name: 'ItemEdit',
  component: () => import('@/views/ItemDetail.vue'),
  props: route => ({ id: parseInt(route.params.id), mode: 'edit' }),
  meta: { requiresAuth: true }
}
```

### Step 7: Add Navigation

Update the main navigation to include your new resource:

```vue
<!-- In your navigation component -->
<RouterLink
  to="/items"
  class="nav-link"
>
  <ItemIcon class="h-5 w-5" />
  Items
</RouterLink>
```

### Step 8: Create Tests

Create comprehensive tests following the patterns in:
- `src/stores/__tests__/project.test.ts` for store tests
- `src/views/__tests__/Projects.test.ts` for list view tests  
- `src/views/__tests__/ProjectDetail.test.ts` for detail view tests

### Step 9: Update Documentation

1. Update this documentation to include your new resource
2. Add your resource to the API integration documentation
3. Update the main README.md to reflect the new capability

### Key Patterns to Follow

1. **Consistent naming**: Use singular form for stores and detail views, plural for list views
2. **Color theming**: Each resource should have its own color (Projects=orange, Items=blue, etc.)
3. **State management**: Use Pinia stores with the same pattern for loading, error, and CRUD operations
4. **Component reuse**: Leverage the existing layout components (ListView, DetailView, etc.)
5. **API integration**: Use the TypeScript client library consistently
6. **Responsive design**: Ensure all views work on mobile, tablet, and desktop
7. **Error handling**: Implement proper error states and user feedback
8. **Testing**: Maintain high test coverage for all new code

This architecture ensures consistency across all resources while allowing for resource-specific customizations where needed.

## 🎯 Areas for Contribution

We especially welcome contributions in these areas:

### New Resource Implementation
- **Items** - Cultural objects and monuments with detailed metadata
- **Partners** - Museums, institutions, and individual collectors  
- **Tags** - Flexible categorization system for organizing content
- **Pictures** - Image management with upload and organization capabilities

### Core Features
- **Bug fixes** - help us improve stability
- **Performance improvements** - optimize the application  
- **Accessibility** - make the app more inclusive
- **Documentation** - improve guides and examples
- **Testing** - increase test coverage
- **UI/UX improvements** - enhance user experience

### Advanced Features
- **File upload improvements** - enhance image upload functionality for Pictures resource
- **Search enhancements** - improve search capabilities across all resources
- **Filtering improvements** - add more sophisticated filtering options
- **Export/Import functionality** - data exchange capabilities
- **Bulk operations** - batch editing and management tools
- **Advanced reporting** - analytics and insights features

## 📞 Getting Help

- **GitHub Issues** - for bugs and feature requests
- **GitHub Discussions** - for questions and general discussion
- **Code Review** - maintainers will provide feedback on PRs

For technical questions about our development practices, please refer to our [guidelines section](guidelines/).

## 🏆 Recognition

Contributors will be recognized in:
- The project's README
- Release notes for significant contributions
- GitHub's contributor list

Thank you for contributing to the Inventory Management UI! 🎉

---

*Last updated: {{ site.time | date: "%B %d, %Y" }}*
