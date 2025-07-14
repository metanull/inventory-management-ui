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
    - The provider maintains a typescript-axios client library as a npm package `@metanull/inventory-app-api-client`
    - **CRITICAL: Use the typescript-axios client library `@metanull/inventory-app-api-client` for API integration**
      - The Package is private, so you need to authenticate with a GitHub token to install the package
      - The Package is hosted on github packages, so you need to configure your `.npmrc` file to authenticate with the GitHub registry
      - The API is under development, always check for newer versions of the library
      - The library is generated from the OpenAPI specification
  - Handle errors consistently with user feedback
  - Show loading states during API calls
    - Prefer overlay spinners for full-screen loading
  - Cache data appropriately with reactive state
- Testing and quality
  - Use Vitest for unit testing with coverage reporting
  - Use Vue Test Utils for component testing
  - Use ESLint with TypeScript and Vue rules for code linting
  - Use Prettier for code formatting
  - Generate tests for components
  - Generate tests for features
  - Generate tests for types
- Layout
  - Keep layout consistent by using the same approaches in different pages:
    - Each resource has a List page and a Detail page
    - List pages show a table with actions
    - Detail pages show a single record and support inline editing
      - Inline editing also supports creating new records
  - Keep layout consistent by using components
  - **CRITICAL: Use the Partners.vue and PartnersDetial.vue as examples for layouts and logic of other pages.**
- Code style
  - Follow ESLint and Prettier configurations
  - Use TypeScript strict mode
  - Prefer composition over inheritance
  - Keep components focused and single-purpose
- CI/CD pipeline
  - Git hooks are in place using Husky.
    - Automated quality checks rejects push that do not pass type checking, linting, testing, and building
    - Coverage requirements of 0% minimum test coverage
- Environment configuration
  - `.env` files for different environments
- Responsive Design
  - Mobile-first approach with Tailwind breakpoints
  - Adaptive layouts for different screen sizes
  - Touch-friendly interface elements
  - Consistent spacing and typography
