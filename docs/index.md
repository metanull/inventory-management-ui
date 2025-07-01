---
layout: default
title: Home
nav_order: 1
---

# Inventory Management UI

A modern Vue.js 3 application built with TypeScript for managing inventory items, partners, projects, and more. This application provides a user-friendly interface for the inventory management API.

{: .highlight }
> This is a Vue.js 3 client application that interfaces with the [Inventory Management API](https://github.com/your-org/inventory-app) to provide a modern, responsive web interface for inventory management.

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

### Entity Management

The application provides full CRUD (Create, Read, Update, Delete) operations for:

#### Primary Entities
- **Items** - Inventory objects and monuments with detailed metadata
- **Partners** - Museums, institutions, and individuals involved in projects
- **Projects** - Collections with launch dates, status tracking, and partner associations
- **Tags** - Flexible categorization system for organizing content
- **Pictures** - Image management with upload and organization capabilities

#### Reference Data & Context
- **Countries** - Geographic reference data with standardized names and codes
- **Languages** - Language reference data for internationalization
- **Contexts** - Content organization and categorization framework
- **ImageUploads** - Advanced file upload management for images
- **Contextualizations** - Flexible linking system between contexts and content
- **Details** - Extended information records for enhanced documentation

Each entity includes:
- List views with search, filtering, and pagination
- Detailed views with comprehensive information display
- Create/Edit modals with form validation
- Delete confirmation with safeguards
- Responsive design for all screen sizes

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
- npm 10.0.0 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
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

## 📚 Documentation

- [Contributing Guidelines](./contributing.html) - How to contribute to the project
- [Testing Guide](./TESTING.html) - Comprehensive testing documentation including unit and integration tests
- [Integration Testing](./integration-testing.html) - Detailed guide for running tests against live APIs
- [Development Blog](./blog.html) - Latest updates and changes
- [API Integration](./api-integration.html) - How the app integrates with the backend API

## 🔗 Related Projects

- [Inventory Management API](https://github.com/your-org/inventory-app) - The backend API that powers this application

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/your-org/inventory-management-ui/blob/main/LICENSE) file for details.

---

*Last updated: {{ site.time | date: "%B %d, %Y" }}*
