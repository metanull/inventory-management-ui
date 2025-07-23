# Museum Inventory Management UI

**📖 Documentation**: [https://metanull.github.io/inventory-management-ui/](https://metanull.github.io/inventory-management-ui/) | **🔗 Backend API**: [metanull/inventory-app](https://github.com/metanull/inventory-app)

---

A modern Vue.js 3 + TypeScript frontend application for museum inventory management systems. Built with responsive design, comprehensive testing, and production-ready architecture.

## 🎯 Purpose

Provides museums and cultural institutions with a web-based interface to:
- **Manage Projects** with status tracking and launch control ✅ *Currently Implemented*
- **Catalog Inventory Items** with detailed metadata and media *(Planned)*
- **Organize Reference Data** for contexts, countries, and languages
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
| Contexts | 🔄 Basic table | ❌ Modal only | 🔄 Basic | 🔄 Default only |
| Countries | 🔄 Basic table | ❌ Modal only | 🔄 Basic | ❌ None |
| Languages | 🔄 Basic table | ❌ Modal only | 🔄 Basic | 🔄 Default only |
| Items | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented |
| Partners | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented | ❌ Not implemented |

### Projects (Reference Implementation)
The **Projects** resource demonstrates the complete application architecture:
- **Advanced Filtering**: All/Enabled/Launched/Visible with counts
- **Real-time Search**: Across all project fields
- **Responsive Design**: Desktop tables → mobile cards
- **Inline Editing**: Three-mode system (view/edit/create)
- **Status Management**: Toggle enabled/launched states
- **Unsaved Changes Protection**: Automatic detection with confirmation

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
│   ├── project.ts         # Projects store (reference implementation)
│   └── [resource].ts      # Other resource stores
├── views/                  # Page components
│   ├── Projects.vue       # Projects list (reference implementation)
│   ├── ProjectDetail.vue  # Project detail (reference implementation)
│   └── [Resource].vue     # Other resource pages
├── router/                 # Vue Router configuration with auth guards
├── utils/                  # Utility functions and error handling
└── main.ts                # Application entry point
```

Key architectural patterns:
- **Three-mode DetailView**: `view` → `edit` → `create` pattern (see ProjectDetail.vue)
- **ListView component**: Standardized list layout with search/filter/sort
- **Pinia stores**: Centralized state with API client integration
- **Component hierarchy**: `format/` → `layout/` → `views/` (increasing complexity)

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*For detailed architecture, component documentation, and contribution guidelines, visit our [documentation site](https://metanull.github.io/inventory-management-ui/).*
