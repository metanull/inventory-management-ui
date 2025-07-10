**CRITICAL: Never modify `copilot-instructions.md`.**
**CRITICAL: This is a Vue.js 3 application with Typescript**
**CRITICAL: This is a windows system, the console is powershell. Command must be executed using powershell compatible functions and syntax OR through a WSL console**
**CRITICAL: Awlays use PowerShell syntax when using `run_in_terminal`**
**CRITICAL: docs/ contains a distinct Ruby application based on Jekyll. Always use wsl when interacting with Ruby.**
**CRITICAL: When creating a pull-request (pr), if on the main branch, always first create a dedicated branch for the pr, then create the pr from that branch**
**CRITICAL: when creating a branch for a pull request, always use the `feature/` or `fix/` prefix, depending on the type of change**
**CRITICAL: when making a git commit, or a pull request, always store the message in a temporary markdown file (temp_*.md); and let use git use that file as an input to avoid escaping issues.**
**CRITICAL: when using `gh pr create` always escape the `--assignee @me` like this: `--assignee "@me"` and never use `--label`**
**CRITICAL: when using `gh pr create` always make the pr auto-merge in squash mode**
**CRITICAL: when using `gh pr create` never use --merge --squash (as it is not supported), first create the pr, then make the pr 'auto-merge' in a second instruction**

- Use Vue.js 3
  - Use TypeScript for type safety
  - Use the Composition API with `<script setup>` syntax
  - Use Vite for fast development and optimized builds
  - Use Vue Router 4 for client-side routing
  - Use Pinia for state management
  - Use Tailwind CSS for utility-first styling
- API Integration
  - The API is a RESTful JSON API
  - The API provider is `https://metanull.github.com/inventory-app`
    - The provider maintains OpenAPI specifications at `https://metanull.github.com/inventory-app/api.json`
    - The provider maintains a typescript-axios client library as a npm package `@metanull/inventory-app-api-client`
      - Always use the latest version of `@metanull/inventory-app-api-client` unless a specific version is required for compatibility.
    - We have a npm script 'inventory-app:fetch' that can download the OpenAPI in our projects' `src/api/inventory-app.json` file.
  - **CRITICAL: Use the typescript-axios client library `@metanull/inventory-app-api-client` for API integration**
    - The Package is private, so you need to authenticate with a GitHub token to install the package
    - The Package is hosted on github packages, so you need to configure your `.npmrc` file to authenticate with the GitHub registry
    - The API is under development, always check for newer versions of the library
      - The library is generated from the OpenAPI specification
  - Use OpenAPI specification to:
    - Use the OpenAPI specification to understand the API endpoints and their parameters
    - Use the OpenAPI specification to understand the API types, methods, requests and responses.
  - Use Axios for API HTTP requests with interceptors for authentication
  - Handle errors consistently with user feedback
  - Show loading states during API calls
  - Cache data appropriately with reactive state
  - Uses bearer token authentication
    - API method for obtaining a JWT token is `POST /api/mobile/acquire-token`
      - it requires `email` ('user@example.com'), `password` ('password'), `device_name` ('testing') and `wipe_tokens` (true) in the request body
    - Token stored in localStorage
    - Automatic token injection via Axios interceptors
    - Automatic logout on 401 responses
  - Data Management
    - CRUD operations for all entity types that supports it
    - Real-time error handling and user feedback
    - Loading states with spinners
    - Confirmation dialogs for destructive actions
- Testing and quality
  - Use Vitest for unit testing with coverage reporting
  - Use Vue Test Utils for component testing
  - Use ESLint with TypeScript and Vue rules for code linting
  - Use Prettier for code formatting
  - Generate tests for components
  - Generate tests for features
  - Generate tests for types
- Error handling with try/catch and user feedback
- Code style
  - Follow ESLint and Prettier configurations
  - Use TypeScript strict mode
  - Prefer composition over inheritance
  - Keep components focused and single-purpose
- CI/CD pipeline
  - Pull request validation with type checking, linting, testing, and building
  - Security scanning with Trivy vulnerability scanner
  - Coverage requirements of 0% minimum test coverage
  - Automated comments for build status updates on PRs
  - Husky for pre-commit hooks
- Environment configuration
  - `.env` files for different environments
  - `VITE_API_BASE_URL` for API endpoint configuration
  - `VITE_APP_TITLE` for application branding
- Responsive Design
  - Mobile-first approach with Tailwind breakpoints
  - Adaptive layouts for different screen sizes
  - Touch-friendly interface elements
  - Consistent spacing and typography
