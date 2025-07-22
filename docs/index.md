---
layout: default
title: Home
nav_order: 1
---

# Inventory Management UI

A modern Vue.js 3 application built with TypeScript for managing cultural heritage inventory systems. This application provides a comprehensive user interface for museums, institutions, and collectors to catalog, organize, and preserve cultural objects and monuments.

{: .highlight }
> This is a Vue.js 3 client application that interfaces with the [Inventory Management API](https://github.com/metanull/inventory-app) to provide a modern, responsive web interface for comprehensive inventory management of cultural heritage items.

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

### Resource Management

The application is designed to provide full CRUD (Create, Read, Update, Delete) operations for:

#### Primary Resources (Planned)
- **Items** - Cultural objects and monuments with detailed metadata
- **Partners** - Museums, institutions, and individual collectors involved in projects
- **Projects** - Collections with launch dates, status tracking, and partner associations ✅ **Currently Implemented**
- **Tags** - Flexible categorization system for organizing content
- **Pictures** - Image management with upload and organization capabilities

#### Reference Data
- **Countries** - Geographic reference data with standardized names and codes
- **Languages** - Language reference data for internationalization  
- **Contexts** - Content organization and categorization framework

### Current Implementation: Projects

The **Projects** resource is fully implemented and demonstrates the application architecture:
- **List View** with responsive table, search, filtering by status (all/enabled/launched/visible), and sorting capabilities
- **Detail View** with comprehensive information display and inline editing
- **Status Management** with toggle controls for enabled/disabled and launched/not launched states
- **CRUD Operations** with create/edit forms and delete confirmation
- **Responsive Design** optimized for all screen sizes
- **API Integration** using the TypeScript client library with proper error handling

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
- Node.js 22.17.0 or higher (latest LTS)
- npm 10.9.2 or higher
- Access to GitHub packages (requires authentication token)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd inventory-management-ui

# Set up authentication for GitHub packages
# Add your GitHub token to your user .npmrc
npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

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

- [Inventory API](https://github.com/metanull/inventory-app) - Backend API for this application
- [API Client Library](https://github.com/metanull/inventory-app-api-client) - TypeScript client library for API integration

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

### API Client Integration

The application uses the `@metanull/inventory-app-api-client` TypeScript library for all API communications. This client:

- Provides fully typed interfaces aligned with the backend API specification
- Handles authentication, error handling, and response parsing automatically  
- Is maintained alongside the backend API to ensure compatibility
- Includes comprehensive documentation in its package
