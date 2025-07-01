# Inventory Management UI

A modern, production-ready Vue.js 3 application built with TypeScript that provides a comprehensive user interface for managing cultural heritage inventory systems. This frontend application connects to the [Inventory Management API](https://github.com/metanull/inventory-app) to manage museums, collections, artifacts, and cultural objects with full CRUD operations, bearer token authentication, and real-time data synchronization.

**🎯 Built for cultural heritage institutions to digitally catalog, organize, and preserve artifacts, monuments, and collections with modern web technologies and robust testing infrastructure.**

## 🎯 Project Overview

This application serves as the frontend interface for cultural heritage institutions to:

- **Manage Inventory Items**: Catalog and organize cultural objects and monuments
- **Partner Management**: Handle relationships with museums, institutions, and individuals  
- **Project Coordination**: Organize collections with launch dates and status tracking
- **Media Management**: Upload and manage pictures and digital assets
- **Multilingual Support**: Handle content in multiple languages with proper localization
- **Geographic Organization**: Organize content by countries and regions
- **Tagging System**: Categorize and filter items with a flexible tagging system

## 🔗 Related Repositories

- **Backend API**: [metanull/inventory-app](https://github.com/metanull/inventory-app) - Laravel-based REST API with SQLite/MySQL support
- **API Documentation**: [metanull.github.io/inventory-app](https://metanull.github.io/inventory-app) - OpenAPI specification, endpoints, and integration guides
- **Frontend Documentation**: Available in the `docs/` directory and GitHub Pages (when deployed)

The backend API provides RESTful endpoints for managing cultural heritage data with features like mobile token authentication, file uploads, multi-language support, and comprehensive relationship management between entities.

## ✨ Features

- 🚀 **Vue.js 3** with Composition API and `<script setup>` syntax
- 📱 **Responsive Design** with Tailwind CSS that works on all devices
- 🛡️ **Type Safety** with comprehensive TypeScript integration
- 🔒 **Bearer Token Authentication** with mobile device support and automatic token management
- 🧪 **Robust Testing Suite** with 22 comprehensive integration tests plus unit tests
- ⚡ **Modern Tooling** with Vite, ESLint, Prettier, and Husky git hooks
- 📊 **State Management** with Pinia for reactive data handling
- 🌐 **Client-Side Routing** with Vue Router 4 and authentication guards
- 🎨 **Accessible UI** with Headless UI components and proper ARIA support
- 📖 **Documentation Site** with Jekyll and GitHub Pages integration
- 🔧 **Cross-Platform Testing** supporting both PowerShell and Bash environments
- 🛠️ **API Integration** with automatic error handling and request/response interceptors

## 🏗️ Technology Stack

### Core Framework
- **Vue.js 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety and better developer experience
- **Vite** for fast development and optimized production builds
- **Vue Router 4** for client-side routing with guards
- **Pinia** for predictable state management

### Styling & UI
- **Tailwind CSS** for utility-first styling and consistent design
- **Headless UI Vue** for accessible, unstyled UI components
- **Heroicons Vue** for consistent iconography
- **PostCSS** with Autoprefixer for CSS processing

### Testing & Quality Assurance
- **Vitest** for unit testing with coverage reporting (80%+ required)
- **Vue Test Utils** for component testing with jsdom environment
- **Integration Tests** against live API endpoints (22 comprehensive tests)
- **Cross-Platform Support** with PowerShell and Bash testing examples
- **ESLint** with TypeScript and Vue rules for code linting
- **Prettier** for consistent code formatting
- **Husky** for git hooks and pre-commit validation
- **MSW (Mock Service Worker)** for API mocking in unit tests

### API Integration
- **Axios** HTTP client with request/response interceptors
- **Bearer Token Authentication** with `/mobile/acquire-token` endpoint
- **TypeScript interfaces** matching the OpenAPI specification exactly
- **Automatic error handling** with 401, 404, and 422 status code management
- **VueUse** for composable utilities and reactive APIs
- **Environment-based configuration** for different API endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js 22.17.0 or higher (latest LTS)
- npm 10.0.0 or higher
- Access to the [Inventory Management API](https://github.com/metanull/inventory-app)

### Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/your-org/inventory-management-ui.git
cd inventory-management-ui
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
# Copy environment template
cp .env .env.local

# Edit .env.local with your API configuration
# VITE_API_BASE_URL=http://your-api-server.com/api
# VITE_APP_TITLE=Your Inventory System
```

4. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Configuration

Create a `.env.local` file with your specific configuration:

```bash
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_APP_TITLE=Cultural Heritage Inventory

# Development Settings  
VITE_DEV_MODE=true
```

For integration testing, see the [Testing Guide](docs/TESTING.md) for additional environment variables.

## 📚 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking

### Code Quality
- `npm run lint` - Lint and automatically fix code issues
- `npm run format` - Format code with Prettier
- `npm run prepare` - Set up git hooks (runs automatically after install)

### Testing
- `npm test` - Run unit tests once
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:coverage` - Run unit tests with coverage report
- `npm run test:ui` - Run tests with interactive UI

### Integration Testing

**🎯 NEW: Comprehensive integration test suite with 22 tests covering all API endpoints!**

The application now includes robust integration testing against live API endpoints:

```bash
# Safe read-only tests (recommended first)
npm run test:integration

# Interactive guided setup with environment validation
npm run test:integration:guided  

# Full CRUD tests (⚠️ TEST DATABASE ONLY!)
npm run test:integration:destructive

# Watch mode for integration test development
npm run test:integration:watch
```

**⚠️ CRITICAL WARNING**: Integration tests in destructive mode will create, modify, and delete real data. **Only use against test databases!**

**Integration test coverage:**
- ✅ **22 comprehensive tests** covering all major API endpoints
- ✅ **Full CRUD operations** for Countries, Languages, Contexts, Partners, Items, Projects, Tags
- ✅ **Authentication flows** (login/logout with mobile token support)
- ✅ **Error handling validation** (404, 422 status codes)
- ✅ **Cross-platform compatibility** (Windows PowerShell & Unix Bash)
- ✅ **Environment variable support** for flexible configuration
- ✅ **Automatic resource cleanup** to prevent test data pollution

**Cross-platform examples:**
```powershell
# PowerShell (Windows)
$env:VITE_RUN_DESTRUCTIVE_TESTS="true"; npx vitest run --config vitest.integration.config.ts
```

```bash
# Bash (macOS/Linux)
VITE_RUN_DESTRUCTIVE_TESTS=true npx vitest run --config vitest.integration.config.ts
```

For detailed testing instructions, see the [Testing Guide](docs/TESTING.md).

## 🏛️ API Integration

This application integrates with the [Inventory Management API](https://github.com/metanull/inventory-app) which provides:

### Core Entities
- **Items**: Cultural objects and monuments with metadata
- **Partners**: Museums, institutions, and individual collectors
- **Projects**: Collections with launch dates and publication status
- **Countries**: Geographic organization and localization
- **Languages**: Multilingual content support
- **Contexts**: Content organization and categorization

### Media & Organization  
- **Pictures**: Image upload and management system
- **Tags**: Flexible categorization and filtering
- **Contextualizations**: Complex relationship management

### Authentication & Security
- **Bearer Token Authentication**: Mobile-focused JWT token system
- **Device-Specific Tokens**: Support for multiple devices per user
- **Automatic Token Management**: Seamless token injection and refresh handling
- **Role-based Access Control**: Permission management (when implemented in API)
- **Secure Token Storage**: localStorage with automatic cleanup on logout
- **Request Interceptors**: Automatic authentication header injection

For complete API documentation including authentication flows, visit: [metanull.github.io/inventory-app](https://metanull.github.io/inventory-app)

## 📁 Project Structure

```
inventory-management-ui/
├── src/
│   ├── api/                    # API client and TypeScript interfaces
│   │   ├── client.ts          # Main API client with bearer token authentication
│   │   └── __tests__/         # API integration tests (22 comprehensive tests)
│   │       └── integration.test.ts  # Live API testing suite
│   ├── components/            # Reusable Vue components
│   │   ├── layout/           # Layout-specific components
│   │   └── ui/               # Generic UI components
│   ├── router/               # Vue Router configuration and guards
│   ├── stores/               # Pinia stores for state management
│   ├── views/                # Page-level components
│   ├── utils/                # Utility functions and helpers
│   ├── style.css            # Global styles with Tailwind directives
│   └── main.ts              # Application entry point
├── docs/                     # Documentation site (Jekyll)
│   ├── TESTING.md           # Comprehensive testing guide
│   ├── integration-testing.md  # Integration testing details
│   ├── index.md             # Documentation homepage
│   └── _config.yml          # Jekyll configuration
├── scripts/                  # Development and deployment scripts
│   └── run-integration-tests.mjs  # Interactive test runner
├── .env.integration          # Integration test environment template
├── vitest.integration.config.ts   # Integration test configuration
├── public/                   # Static assets
├── tests/                    # Test configuration and setup
└── dist/                     # Production build output
```

## 🧪 Testing Strategy

This project implements a comprehensive two-tier testing strategy with both unit tests (mocked APIs) and integration tests (live API endpoints).

### Unit Tests (Mocked APIs) - Fast & Reliable
Perfect for development, CI/CD, and rapid feedback:

```bash
# Run all unit tests
npm test

# Run tests in watch mode (development)
npm run test:watch  

# Generate coverage report (80%+ required)
npm run test:coverage

# Interactive test UI
npm run test:ui
```

**Unit test features:**
- ⚡ **Fast execution** with mocked API calls
- 🧪 **Component behavior testing** with Vue Test Utils
- 📊 **Coverage requirements**: 80%+ maintained automatically
- 🔄 **CI/CD integration** runs on every commit
- 🛡️ **Type safety** with TypeScript throughout

### Integration Tests (Live API) - Production Confidence  
Comprehensive end-to-end validation against the actual [Inventory Management API](https://github.com/metanull/inventory-app):

```bash
# Quick start with guided setup
npm run test:integration:guided

# Safe read-only tests (recommended first)
npm run test:integration

# Full CRUD tests (⚠️ TEST DATABASE ONLY!)
npm run test:integration:destructive

# Development mode with watch
npm run test:integration:watch
```

**🎯 NEW: 22 Comprehensive Integration Tests**

The integration test suite now provides complete coverage of the API integration:

| API Category | Tests | Coverage |
|--------------|-------|----------|
| **Countries** | 2 tests | Full CRUD operations |
| **Languages** | 4 tests | CRUD + default/English language queries |
| **Contexts** | 2 tests | Full CRUD operations |
| **Partners** | 2 tests | Full CRUD operations |
| **Items** | 2 tests | Full CRUD operations |
| **Projects** | 3 tests | CRUD + enabled projects filter |
| **Tags** | 2 tests | Full CRUD operations |
| **Pictures** | 1 test | Read operations |
| **Image Uploads** | 1 test | Read operations |
| **Authentication** | 1 test | Login/logout flows |
| **Error Handling** | 2 tests | 404/422 status codes |

**⚠️ CRITICAL WARNING**: Integration tests in destructive mode will create, modify, and delete real data. **Only use against test databases!**

**Advanced integration test features:**
- 🔐 **Bearer token authentication** with mobile device support
- 🧹 **Automatic resource cleanup** prevents test data pollution
- 🌍 **Cross-platform support** (Windows PowerShell & Unix Bash)
- ⚙️ **Environment configuration** with `.env.integration.local`
- 📝 **Detailed logging** with success/failure indicators
- 🚦 **Sequential execution** prevents data conflicts
- 🛡️ **Safety controls** with non-destructive defaults

**Cross-platform execution examples:**
```powershell
# Windows PowerShell
$env:VITE_RUN_DESTRUCTIVE_TESTS="true"
npx vitest run --config vitest.integration.config.ts
```

```bash
# macOS/Linux Bash  
export VITE_RUN_DESTRUCTIVE_TESTS=true
npx vitest run --config vitest.integration.config.ts
```

For detailed setup instructions, troubleshooting, and best practices, see the comprehensive [Testing Guide](docs/TESTING.md).

## 🔧 Development Guidelines

### Code Quality Standards
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Vue 3 Composition API**: Use `<script setup>` syntax for all new components
- **Component Architecture**: Keep components focused and single-purpose
- **API Integration**: Use the centralized API client with proper error handling
- **Accessibility**: Follow ARIA guidelines and use semantic HTML

### Git Workflow
- Create feature branches from `main`: `git checkout -b feature/your-feature`
- Follow [Conventional Commits](https://conventionalcommits.org/) format
- Run pre-commit hooks automatically (linting, formatting, type checking)
- Ensure all CI checks pass before merging
- Use squash merging for clean commit history

### Performance Best Practices
- Lazy load routes and components where appropriate
- Use reactive state management with Pinia
- Optimize bundle size with tree-shaking
- Implement proper error boundaries
- Cache API responses when appropriate

## 📋 CI/CD Pipeline

The project includes automated GitHub Actions workflows:

### Pull Request Validation
- ✅ TypeScript type checking
- ✅ ESLint code linting  
- ✅ Prettier code formatting
- ✅ Unit test execution with coverage
- ✅ Production build verification
- ✅ Security vulnerability scanning

### Deployment Pipeline
- 🚀 Automatic deployment to staging on `develop` branch
- 🚀 Production deployment on `main` branch releases
- 📊 Performance monitoring and reporting
- 🔍 Automated security scanning with Trivy

### Code Quality Gates
- Minimum 80% test coverage required
- All ESLint rules must pass
- TypeScript compilation must succeed
- No high/critical security vulnerabilities

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository** and create a feature branch
2. **Read the documentation**: Familiarize yourself with the [Testing Guide](docs/TESTING.md)
3. **Make your changes**: Follow our code quality standards
4. **Add tests**: Include both unit and integration tests where appropriate
5. **Run the test suite**: Ensure all tests pass
   ```bash
   npm run lint && npm run type-check && npm run test
   ```
6. **Submit a pull request**: Include a detailed description of your changes

### Development Setup
```bash
# Install dependencies
npm install

# Start development with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint && npm run type-check
```

## 📖 Documentation

- **Main Documentation**: Available in the `docs/` directory
- **Testing Guide**: [docs/TESTING.md](docs/TESTING.md) - Comprehensive testing instructions
- **Integration Testing**: [docs/integration-testing.md](docs/integration-testing.md) - Live API testing setup
- **API Documentation**: [metanull.github.io/inventory-app](https://metanull.github.io/inventory-app)
- **Backend Repository**: [github.com/metanull/inventory-app](https://github.com/metanull/inventory-app)

## 🔗 Related Resources

- **Backend API**: [metanull/inventory-app](https://github.com/metanull/inventory-app)
- **API Documentation**: [metanull.github.io/inventory-app](https://metanull.github.io/inventory-app)
- **Vue.js 3 Documentation**: [vuejs.org](https://vuejs.org/)
- **TypeScript Handbook**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

- 📖 **Check Documentation**: Start with the [Testing Guide](docs/TESTING.md) for common questions
- 🔍 **Search Issues**: Look through existing GitHub issues before creating new ones
- 🐛 **Report Bugs**: Use the issue template and provide detailed reproduction steps
- 💡 **Request Features**: Describe your use case and expected behavior
- ❓ **Ask Questions**: Use GitHub Discussions for general questions

### Quick Troubleshooting
- **Build Issues**: Run `npm run type-check` to identify TypeScript errors
- **Test Failures**: Check the [Testing Guide](docs/TESTING.md) troubleshooting section
- **Integration Tests**: Ensure the API server is running and accessible
- **Environment Issues**: Verify your `.env.local` configuration

---

**Built with ❤️ for cultural heritage preservation**

*This project helps museums, institutions, and collectors digitally manage and preserve cultural artifacts for future generations.*
