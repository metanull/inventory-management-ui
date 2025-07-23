# Museum Inventory Management UI

**📖 Documentation**: [https://metanull.github.io/inventory-management-ui/](https://metanull.github.io/inventory-management-ui/) | **🔗 Backend API**: [metanull/inventory-app](https://github.com/metanull/inventory-app)

---

A modern Vue.js 3 + TypeScript frontend application for museum inventory management systems. Built with responsive design, comprehensive testing, and production-ready architecture.

## 🎯 Purpose

Provides museums and cultural institutions with a web-based interface to:
- **Manage Projects** with status tracking and launch control ✅ *Fully Implemented*
- **Organize Reference Data** for contexts, countries, and languages ✅ *Fully Implemented*
- **Catalog Inventory Items** with detailed metadata and media *(Planned)*
- **Handle Partner Relationships** between institutions *(Planned)*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Access to [Inventory Management API](https://github.com/metanull/inventory-app)
- GitHub token for `@metanull/inventory-app-api-client` package access

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/metanull/inventory-management-ui.git
   cd inventory-management-ui
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure VITE_API_BASE_URL in .env
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 (Composition API), TypeScript, Tailwind CSS
- **Build**: Vite with modern ESM support
- **Testing**: Vitest (comprehensive unit tests + integration tests)
- **Quality**: ESLint, Prettier, Husky pre-commit hooks
- **State**: Pinia stores with reactive data management
- **API**: TypeScript client library with automatic token management

## 📊 Current Implementation Status

| Resource | List View | Detail View | CRUD | Status Management |
|----------|-----------|-------------|------|-------------------|
| **Projects** | ✅ Full featured | ✅ Three-mode system | ✅ Complete | ✅ Toggle controls |
| **Contexts** | ✅ Full featured | ✅ Three-mode system | ✅ Complete | ✅ Default management |
| **Countries** | ✅ Full featured | ✅ Three-mode system | ✅ Complete | ❌ None |
| **Languages** | ✅ Full featured | ✅ Three-mode system | ✅ Complete | ✅ Default management |
| Items | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented |
| Partners | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented |

### Reference Data Resources (Complete Implementation)
All four core resources **Projects**, **Contexts**, **Countries**, and **Languages** now feature:
- **Consistent ListView**: Advanced filtering, real-time search, responsive design
- **DetailView System**: Three-mode operation (view/edit/create) with inline editing
- **Status Management**: Toggle controls for applicable status fields
- **Smart Caching**: Background refresh with loading optimization
- **Responsive Design**: Desktop tables → mobile-friendly layouts
- **Unsaved Changes Protection**: Automatic detection with confirmation dialogs

## 🔗 Related Resources

- **[Complete Documentation](https://metanull.github.io/inventory-management-ui/)** - Architecture, components, and guides
- **[Application Architecture](/docs/application-architecture.md)** - Technical implementation details
- **[Backend API](https://github.com/metanull/inventory-app)** - Laravel REST API with SQLite/MySQL
- **[API Documentation](https://metanull.github.io/inventory-app)** - OpenAPI specs and integration guides

## 🧪 Development

### Testing
```bash
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Coverage report
```

### Code Quality
```bash
npm run lint               # ESLint check and fix
npm run type-check         # TypeScript validation
npm run format             # Prettier formatting
npm run quality-check      # Full quality suite
```

### API Integration
The application uses `@metanull/inventory-app-api-client` for type-safe API communication. Authentication is handled via localStorage tokens with automatic request attachment.

## 📁 Project Structure

```
src/
├── components/              # Reusable Vue components
│   ├── format/             # Data display components (DisplayText, FormInput, etc.)
│   ├── global/             # App-wide overlays (LoadingOverlay, ErrorDisplay)
│   ├── icons/              # Resource-specific icons
│   └── layout/             # Layout components (ListView, DetailView)
├── stores/                 # Pinia state management
│   ├── auth.ts            # Authentication & token management
│   ├── project.ts         # Projects store with advanced features
│   ├── context.ts         # Contexts store with default management
│   ├── country.ts         # Countries store with CRUD operations
│   ├── language.ts        # Languages store with default management
│   └── [feature].ts       # Global feature stores (loading, errors, etc.)
├── views/                  # Page components
│   ├── Projects.vue       # Projects list with filtering & search
│   ├── ProjectDetail.vue  # Project detail with three-mode system
│   ├── Contexts.vue       # Contexts list with default filtering
│   ├── ContextDetail.vue  # Context detail with inline editing
│   ├── Countries.vue      # Countries list with search functionality
│   ├── CountryDetail.vue  # Country detail with form validation
│   ├── Languages.vue      # Languages list with default filtering
│   ├── LanguageDetail.vue # Language detail with three-mode system
│   └── [Resource].vue     # Future resource pages
├── router/                 # Vue Router configuration with auth guards
├── utils/                  # Utility functions and error handling
└── main.ts                # Application entry point
```

Key architectural patterns:
- **Three-mode DetailView**: `view` → `edit` → `create` pattern (implemented across all 4 resources)
- **ListView component**: Standardized list layout with search/filter/sort (used by all resources)
- **Pinia stores**: Centralized state with API client integration and smart caching
- **Component hierarchy**: `format/` → `layout/` → `views/` (increasing complexity)

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*For detailed architecture, component documentation, and contribution guidelines, visit our [documentation site](https://metanull.github.io/inventory-management-ui/).*
