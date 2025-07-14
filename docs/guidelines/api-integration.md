---
layout: default
title: API Integration
nav_order: 1
parent: Guidelines
---

# API Integration

The Inventory Management UI is designed to work seamlessly with the [Inventory Management API](https://github.com/metanull/inventory-app). This page documents how the frontend application integrates with the backend services.

## 🔗 API Overview

The application communicates with a RESTful API that provides the following resources:

### Core Resources

| Resource | Description | Endpoints |
|----------|-------------|-----------|
| **Items** | Inventory objects and monuments | `GET /item`, `POST /item`, `PUT /item/{id}`, `DELETE /item/{id}` |
| **Partners** | Museums, institutions, and individuals | `GET /partner`, `POST /partner`, `PUT /partner/{id}`, `DELETE /partner/{id}` |
| **Projects** | Collections with launch dates and status | `GET /project`, `POST /project`, `PUT /project/{id}`, `DELETE /project/{id}` |
| **Tags** | Categorization system for items | `GET /tag`, `POST /tag`, `PUT /tag/{id}`, `DELETE /tag/{id}` |
| **Pictures** | Image management with upload capabilities | `GET /picture`, `POST /picture`, `PUT /picture/{id}`, `DELETE /picture/{id}` |

### Reference Data

| Resource | Description | Usage |
|----------|-------------|-------|
| **Countries** | Country reference data | Used in partner and item forms |
| **Languages** | Language reference data | Used in project configuration |
| **Contexts** | Content organization contexts | Used in project and item organization |

## 🔐 Authentication

The application uses **JWT Bearer Token** authentication:

### Login Flow

```typescript
// 1. User submits credentials
const loginData = {
  email: 'user@example.com',
  password: 'password123'
}

// 2. API returns JWT token
const response = await apiClient.login(loginData)
const token = response.data.access_token

// 3. Token stored in localStorage
localStorage.setItem('token', token)

// 4. Token automatically included in subsequent requests
// via the @metanull/inventory-app-api-client library
```

### Token Management

- **Storage**: JWT tokens are stored in `localStorage`
- **Injection**: Tokens are automatically injected into API requests via the client library's built-in authentication handling
- **Expiration**: Automatic logout when tokens expire (401 responses)
- **Refresh**: Manual re-authentication required when tokens expire

## 🏗️ API Client Architecture

The application uses the `@metanull/inventory-app-api-client` TypeScript client library that provides:

### Type-Safe Interface

```typescript
export interface ItemResource {
  id: string
  internal_name: string
  backward_compatibility: string | null
  type: 'object' | 'monument'
  partner?: PartnerResource
  project?: ProjectResource
  country?: CountryResource
  tags?: TagResource[]
  created_at: string | null
  updated_at: string | null
}
```

### Standardized Methods

```typescript
// Import the client library
import { Configuration, ItemsApi, PartnersApi, ProjectsApi, TagsApi } from '@metanull/inventory-app-api-client';

// Configure the API client
const config = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  accessToken: () => localStorage.getItem('token') || ''
});

// Create API instances
const itemsApi = new ItemsApi(config);
const partnersApi = new PartnersApi(config);
const projectsApi = new ProjectsApi(config);
const tagsApi = new TagsApi(config);

// Example usage
const getItems = async () => {
  const response = await itemsApi.apiItemsGet();
  return response.data;
};
```

### Error Handling

```typescript
try {
  const response = await itemsApi.apiItemsGet();
  items.value = response.data;
} catch (error: any) {
  if (error.response?.status === 401) {
    // Redirect to login
    router.push('/login')
  } else {
    // Show user-friendly error message
    errorMessage.value = error.message || 'An error occurred'
  }
}
```

## 📡 Request/Response Patterns

### Standard API Response Format

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}
```

### Request Examples

#### Creating an Item

```typescript
// Import the client library
import { Configuration, ItemsApi, CreateItemDto } from '@metanull/inventory-app-api-client';

// Configure the API client
const config = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  accessToken: () => localStorage.getItem('token') || ''
});

// Create API instance
const itemsApi = new ItemsApi(config);

// Frontend request
const newItem: CreateItemDto = {
  internal_name: 'Ancient Vase',
  type: 'object',
  partner_id: 'partner-uuid',
  project_id: 'project-uuid'
}

const response = await itemsApi.apiItemsPost(newItem);
```

#### Updating with Relationships

```typescript
// Import the client library
import { Configuration, ItemsApi, UpdateItemDto } from '@metanull/inventory-app-api-client';

// Configure the API client (typically done once in your app)
const config = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  accessToken: () => localStorage.getItem('token') || ''
});

// Create API instance
const itemsApi = new ItemsApi(config);

// Update item with new partner
const updatedItem: UpdateItemDto = {
  internal_name: 'Updated Name',
  partner_id: 'new-partner-uuid'
}

const response = await itemsApi.apiItemsIdPut(itemId, updatedItem);
```

#### Tag Management

```typescript
// Import the client library
import { Configuration, TagsApi } from '@metanull/inventory-app-api-client';

// Configure the API client
const config = new Configuration({
  basePath: import.meta.env.VITE_API_BASE_URL,
  accessToken: () => localStorage.getItem('token') || ''
});

// Create API instance
const tagsApi = new TagsApi(config);

// Add tag to item
await tagsApi.apiItemsItemIdTagsTagIdPost(itemId, tagId);

// Remove tag from item
await tagsApi.apiItemsItemIdTagsTagIdDelete(itemId, tagId);

// Get all tags for item
const response = await tagsApi.apiItemsItemIdTagsGet(itemId);
const tags = response.data;
```

## 🔄 State Management Integration

The API client integrates with Pinia stores for state management:

### Auth Store

```typescript
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  
  const login = async (credentials: LoginCredentials) => {
    // Import the client library
    import { Configuration, AuthApi, AcquireTokenRequest } from '@metanull/inventory-app-api-client';
    
    // Create API instance for authentication
    const authApi = new AuthApi(new Configuration({
      basePath: import.meta.env.VITE_API_BASE_URL
    }));
    
    // Prepare token request
    const tokenRequest: AcquireTokenRequest = {
      email: credentials.email,
      password: credentials.password,
      device_name: 'web-app',
      wipe_tokens: false
    };
    
    // Acquire token
    const response = await authApi.apiMobileAcquireTokenPost(tokenRequest);
    token.value = response.data.access_token;
    localStorage.setItem('token', token.value);
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }
  
  return { token, user, login, logout, isAuthenticated }
})
```

## 🌐 Environment Configuration

API integration is configured through environment variables:

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=Inventory Management UI
```

### Environment-Specific Configurations

- **Development**: `http://localhost:8000/api`
- **Staging**: `https://staging-api.example.com/api`
- **Production**: `https://api.example.com/api`

## 🚦 Loading States & Error Handling

### Loading States

```vue
<template>
  <div v-if="loading" class="text-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  </div>
  
  <div v-else-if="error" class="text-red-600 text-center py-8">
    {{ error }}
  </div>
  
  <div v-else>
    <!-- Content -->
  </div>
</template>
```

### Error Handling Patterns

```typescript
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Using the client library
    const response = await itemsApi.apiItemsGet();
    data.value = response.data;
  } catch (err: any) {
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false
  }
}
```

## 🔍 Development & Testing

### API Mocking

For testing, API calls are mocked using Vitest:

```typescript
// Test setup
vi.mock('@metanull/inventory-app-api-client', () => {
  const mockItemsApi = {
    apiItemsGet: vi.fn(),
    apiItemsPost: vi.fn(),
    apiItemsIdPut: vi.fn(),
    apiItemsIdDelete: vi.fn()
  };
  
  return {
    ItemsApi: vi.fn(() => mockItemsApi),
    Configuration: vi.fn(),
    MockItemsApi: mockItemsApi  // Expose for easy access in tests
  };
});

// Import the mock
import { MockItemsApi } from '@metanull/inventory-app-api-client';

// Test usage
MockItemsApi.apiItemsGet.mockResolvedValue({
  data: [mockItem1, mockItem2]
});
```

### Local Development

For local development without the API:

1. **Mock API Server**: Use tools like JSON Server or MSW
2. **Proxy Configuration**: Configure Vite proxy to backend
3. **Environment Variables**: Point to local API instance

## API Specification Management

### Fetching the API Specification
To fetch the latest API specification from the Inventory API, run:

```bash
npm run inventory-app:fetch
```

This will download the specification and store it in `src/api/inventory-app.json`.

### Comparing API Specification Changes
To compare the local API specification with the latest version online, run:

```bash
npm run inventory-app:diff
```

This will display the differences between the local and remote versions.

## 📚 Related Documentation

- [Backend API Documentation](https://metanull.github.io/inventory-app)

---

*For more detailed API documentation, see the [Backend API Repository](https://github.com/metanull/inventory-app).*

*Last updated: {{ site.time | date: "%B %d, %Y" }}*
