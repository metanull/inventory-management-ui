**CRITICAL: Awlays use PowerShell syntax when using `run_in_terminal`**
**CRITICAL: This is a Vue.js 3 application with Typescript**
**CRITICAL: This is a windows system, the console is powershell. Command must be executed using powershell compatible functions and syntax OR through a WSL console**
**CRITICAL: docs/ contains a distinct Ruby application based on Jekyll. Always use wsl when interacting with Ruby.**
**CRITICAL: API specifications are in `E:\inventory\inventory-management-ui\src\api\inventory-app.json`**
**CRITICAL: My application MUST porovide a UI to manage all Resources in the API specification**
**CRITICAL: When creating a pull-request (pr), if on the main branch, always first create a dedicated branch for the pr, then create the pr from that branch**
**CRITICAL: before a commit, always run `npm run format` and `npm run lint` to ensure code quality**
**CRITICAL: when creating a branch for a pull request, always use the `feature/` or `fix/` prefix, depending on the type of change**
**CRITICAL: when using `gh pr create` always escape the `--assignee @me` like this: `--assignee "@me"` and never use `--label`**
**CRITICAL: when using `gh pr create` always make the pr auto-merge in squash mode**
**CRITICAL: when using `gh pr create` never use --merge --squash (as it is not supported), first create the pr, then make the pr 'auto-merge' in a second instruction**
**CRITICAL: after setting the pull request to auto-merge, always return to the main branch**
- Use Vue.js 3
  - Use TypeScript for type safety
  - Use the Composition API with `<script setup>` syntax
  - Use Vite for fast development and optimized builds
  - Use Vue Router 4 for client-side routing
  - Use Pinia for state management
  - Use Tailwind CSS for utility-first styling
  - Use Headless UI Vue for accessible, unstyled UI components
  - Use Heroicons Vue for consistent iconography
  - Use PostCSS with Autoprefixer for CSS processing
- Testing and quality
  - Use Vitest for unit testing with coverage reporting
  - Use Vue Test Utils for component testing
  - Use ESLint with TypeScript and Vue rules for code linting
  - Use Prettier for code formatting
  - Generate tests for components
  - Generate tests for features
  - Generate tests for types
- API Integration
  - OpenAPI specification is available at `https://metanull.github.com/inventory-app/api.json`
    - The npm script 'inventory-app:fetch' fetches the OpenAPI specification and stores it in `src/api/inventory-app.json`
    - The npm script 'inventory-app:diff' compares the local OpenAPI specification with the remote one and shows the differences
    - Use the OpenAPI specification to understand the API endpoints and their parameters
    - Use the OpenAPI specification to generate types for API responses
    - Use the OpenAPI specification to generate API client methods
    - Use the OpenAPI specification to ensure API client methods are up to date
    - Use the OpenAPI specification to generate documentation for API endpoints
    - Use the OpenAPI specification to generate tests for API client methods
  - Use Axios for API HTTP requests with interceptors for authentication
  - Handle errors consistently with user feedback
  - Show loading states during API calls
  - Cache data appropriately with reactive state
  - Use TypeScript interfaces for API response types based on OpenAPI specification
    - TypeScript interfaces match the OpenAPI specification
    - OpenAPI specification is used to generate types
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
