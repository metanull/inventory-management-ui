---
layout: default
title: Home
nav_order: 1
---

# Museum Inventory Management UI

A modern Vue.js 3 + TypeScript application for managing museum inventory systems. Built with responsive design, comprehensive testing, and production-ready architecture for museums, institutions, and collectors to catalog, organize, and preserve cultural objects and monuments.

{: .highlight }
> This is a Vue.js 3 client application that interfaces with the [Inventory Management API](https://github.com/metanull/inventory-app) to provide a modern, responsive web interface for comprehensive inventory management of museum items.

## ✨ Features

- 🚀 **Vue.js 3** with Composition API and TypeScript
- 🎨 **Tailwind CSS** for modern, responsive design  
- 🛡️ **Type Safety** with comprehensive TypeScript integration
- 🔒 **Authentication** with JWT token management
- 📱 **Responsive Design** that works on all devices
- ✅ **Comprehensive Testing** with Vitest and Vue Test Utils
- 🔧 **Modern Tooling** with Vite, ESLint, and Prettier
- 📊 **State Management** with Pinia
- 🌐 **Routing** with Vue Router 4
- 📦 **API Client Integration** using `@metanull/inventory-app-api-client`

## 📖 Documentation

- **[Application Architecture](application-architecture)** - Comprehensive technical architecture, component patterns, and implementation details
- **[API Integration Guidelines](guidelines/api-integration)** - API client usage and integration patterns
- **[Component Documentation](components/)** - Detailed component library reference
- **[Contributing Guidelines](contributing)** - Development workflow and contribution guide

### Resource Management

The application is designed to provide full CRUD (Create, Read, Update, Delete) operations for:

#### Primary Resources (Planned)
- **Items** - Cultural objects and monuments with detailed metadata *(Planned)*
- **Partners** - Museums, institutions, and individual collectors involved in projects *(Planned)*
- **Projects** - Collections with launch dates, status tracking, and partner associations ✅ **Currently Implemented**
- **Tags** - Flexible categorization system for organizing content *(Planned)*
- **Pictures** - Image management with upload and organization capabilities *(Planned)*

#### Reference Data
- **Countries** - Geographic reference data with standardized names and codes 🔄 *Basic Implementation*
- **Languages** - Language reference data for internationalization 🔄 *Basic Implementation*
- **Contexts** - Content organization and categorization framework 🔄 *Basic Implementation*

### Current Implementation: Projects (Reference Implementation)

The **Projects** resource is fully implemented and demonstrates the complete application architecture:
- **Advanced Filtering**: All/Enabled/Launched/Visible with counts and dynamic labels
- **Real-time Search**: Across all project fields with debouncing
- **Column Sorting**: Sortable by internal name, creation date
- **Responsive Design**: Desktop tables → mobile cards
- **Inline Editing**: Three-mode system (view/edit/create) with unsaved changes protection
- **Status Management**: Toggle enabled/launched states with visual indicators
- **API Integration**: TypeScript client library with automatic error handling

## 🏗️ Architecture

The application follows modern Vue.js best practices:

- **Component-based architecture** with reusable Vue components
- **Composition API** for better code organization and reusability
- **TypeScript** for type safety and better developer experience
- **Single Page Application** with client-side routing
- **RESTful API integration** with proper error handling
- **Responsive design** that works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Access to [Inventory Management API](https://github.com/metanull/inventory-app)
- GitHub token for `@metanull/inventory-app-api-client` package access

### Installation

```bash
# Clone the repository
git clone https://github.com/metanull/inventory-management-ui.git
cd inventory-management-ui

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API configuration

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔗 Related Projects

- **[Backend API](https://github.com/metanull/inventory-app)** - Laravel REST API with SQLite/MySQL support
- **[API Documentation](https://metanull.github.io/inventory-app)** - OpenAPI specifications and integration guides

## 📚 Documentation Sections

### [Guidelines](guidelines/)
Comprehensive development guidelines covering API integration, coding standards, and testing practices.

### [Components](components/)
A catalog of reusable Vue components used throughout the application, including usage examples and API documentation.

### [Contributing](contributing)
Guidelines for contributing to the project, including development setup and workflow.

### [Development Archive](development-archive)
Historical development updates and project evolution.

### [Issues](https://github.com/metanull/inventory-management-ui/issues)
Bug reports and feature requests

### [Source Code](https://github.com/metanull/inventory-management-ui)
Complete source code and issue tracking

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/metanull/inventory-management-ui/blob/main/LICENSE) file for details.

---

*Last updated: {{ site.time | date: "%B %d, %Y" }}*
