# Museum Inventory Management UI

[![Node.js](https://img.shields.io/badge/Node.js-24-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org/en/download/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=fff)](https://vuejs.org/)
[![api-client](https://img.shields.io/badge/metanull-api_client-ffffff.svg?logo=nodedotjs)](https://github.com/metanull/inventory-app/releases)
[![LICENSE](https://img.shields.io/badge/license-MIT-428f7e.svg?logo=open%20source%20initiative&logoColor=white&labelColor=555555)](https://github.com/metanull/inventory-app/blob/main/LICENSE)

---

[![Deploy](https://github.com/metanull/inventory-management-ui/actions/workflows/deploy.yml/badge.svg)](https://github.com/metanull/inventory-management-ui/actions/workflows/deploy.yml)
[![Build](https://github.com/metanull/inventory-management-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/metanull/inventory-management-ui/actions/workflows/build.yml)
[![CodeQL](https://github.com/metanull/inventory-management-ui/actions/workflows/codeql.yml/badge.svg)](https://github.com/metanull/inventory-management-ui/actions/workflows/codeql.yml)

## 🎯 Purpose

Provides museums with a web-based interface to:
- **Manage Projects** with status tracking and launch control
- **Organize Reference Data** for contexts, countries, and languages
- **Catalog Inventory Items** with detailed metadata and media
- **Manage Collections** of items

## 🚀 Quick Start

### Prerequisites
- Node.js LTS (24)
- Access to the api-client npm package [@metanull/inventory-app-api-client](https://github.com/metanull/inventory-app/releases)

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/metanull/inventory-management-ui.git
   cd inventory-management-ui
   npm install
   ```

2. **Setup the environment**
   ```bash
   cp .env.example .env
   # Configure VITE_API_BASE_URL in .env
   ```

3. **Setup github package authentication**
   1. Option 1: using `npm`
      1. Generate a github TOKEN with `package:read` permission
      2. Run `npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN`
   2. Option 2: using `.npmrc`
      1. Create a `.npmrc` file at the root of this project (copying `.npmrc.example`)
      2. Add your token to the file
      3. **SECURITY WARNING:**: Never push `.npmrc` to the source control!
   

4. **Run the development server**
   ```bash
   npm run dev
   ```

### Development

#### Testing
```bash
npm test                    # Unit tests
```

#### Code Quality
```bash
npm run lint               # ESLint check and fix
npm run type-check         # TypeScript validation
npm run format             # Prettier formatting
```

### API Integration
The application uses the `@metanull/inventory-app-api-client` npm package for type-safe API communication. Authentication is handled via localStorage tokens with automatic request attachment.

## 📁 Project Structure

```
.github/
├── workflows/              # Workflows' definitions
src/
├── components/             # Reusable Vue components
│   ├── format/             # Data display components (DisplayText, FormInput, etc.)
│   ├── global/             # App-wide overlays (LoadingOverlay, ErrorDisplay)
│   ├── icons/              # Resource-specific icons
│   └── layout/             # Layout components (ListView, DetailView)
├── stores/                 # Pinia centralized state management
│   ├── auth.ts             # Authentication & token management
│   ├── {Entity}.ts         # The pinia stores for {Entity}
├── views/                  # Page components
│   ├── {Entity}.vue        # {Entity} list page with filtering & search
│   ├── {Entity}Detail.vue  # {Entity} detail page with three modes (create/edit/view)
├── router/                 # Vue Router configuration with auth guards
├── utils/                  # Utility functions and error handling
└── main.ts                # Application entry point
```

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
