# General instructions

**CRITICAL: Never modify `copilot-instructions.md`.**

# Project and environment setup instructions

- This is a Vue.js 3 application with Typescript
- This is a windows system
  - The console is powershell.
    - **CRITICAL: Awlays use PowerShell syntax when using `run_in_terminal`**
  - The `docs/` directory contains a **distinct** `Ruby` application based on `Jekyll`.
    - **CRITICAL: Always use `wsl` when interacting with Ruby or Jekyll.**

# Interacting with GIT and GitHub

- **CRITICAL: Never commit or push to the `main` branch**
  - **CRITICAL: If current branch is `main`, create and checkout a dedicated branch for the new feature or fixes.**
  - **CRITICAL: Use `feature/` or `fix/` prefix for the branch name.**
- Create commit messages and pull request descriptions in Markdown format.
   **CRITICAL: Always save the commit message or pr description in a temporary file named `temp_{BRIEF}.md`. Let `gh` or `git`commands use that file as input to avoid escaping issues.**
   - **CRITICAL: Never commit that file.**
- When committing changes to git:
  - **CRITICAL: Always fix all typescript errors and warnings.**
  - **CRITICAL: Always fix all linting errors and warnings.**
  - **CRITICAL: Always fix all formatting errors and warnings.**
  - **CRITICAL: Always fix all errors and warnings.**
- To create a pull request:
  - **CRITICAL: Always use `gh pr create`.**
  - **CRITICAL: Always escape the `--assignee @me` like this: `--assignee "@me"`.**
  - **CRITICAL: Never use `--label`.**
  - **CRITICAL: Always make the pr _auto-merge_ in _squash_ mode.**
    - **CRITICAL: Never append `--merge` or `--squash` to `gh pr create`, as it is not supported.**
      - **CRITICAL: First create the pr, then make the pr 'auto-merge' in a second instruction.**

# Code

- **CRITICAL: Use Vue.js version 3 with TypeScript.**
  - Use the Composition API with `<script setup>` syntax
  - Use Vite for fast development and optimized builds
  - Use Vue Router 4 for client-side routing
  - Use Pinia for state management
  - Use Tailwind CSS for utility-first styling
- **CRITICAL: Always fix all typescript errors and warnings before committing.**
  - Run `npm run type-check` to check for typescript errors (it calls `vue tsc`).
  - **CRITICAL: Always declare variables with proper TypeScript type.**
  - **CRITICAL: Never use the `Any` type.**
  - **CRITICAL: Never leave unused variables.**
- **CRITICAL: Always fix all linting errors and warnings before committing.**
  - Run `npm run lint` to check and fix linting errors (it calls `eslint --fix`).
- **CRITICAL: Always fix all formatting errors and warnings before committing.**
  - Run `npm run format` to check and fix formatting errors (it calls `Prettier`).
- **CRITICAL: Always fix all errors and warnings in tests before committing.**
  - Run `npm test` to run tests (it calls `vitest run`).
- Git hooks are in place using Husky.
  - It automaticaly rejects pushes that do not pass type checking, linting, testing, and building
  - Coverage requirements of 0% minimum test coverage
- Prefer composition over inheritance
- Do not duplicate code, create reusable components where appropriate.
  - **CRITICAL: Keep components focused and single-purpose.**
- Maintain distinct `.env` files for distinct environments.

# API Integration

- **CRITICAL: Use local storage to store user's API token.**
- **CRITICAL: Always use the latest version of the `@metanull/inventory-app-api-client` package.**
  - The API provider is `https://metanull.github.com/inventory-app`
  - The API provider maintains a typescript-axios client library as a npm package `@metanull/inventory-app-api-client`
      - The Package is private, authentication with a GitHub token to install the package
        - The authentication token is stored in user's .npmrc file.
      - The Package is hosted on github packages, project's `.npmrc` is configured with `@metanull:registry=https://npm.pkg.github.com/`.
- Handle errors consistently with user feedback
- Show loading states during API calls
  - Prefer overlay spinners for full-screen loading
- Cache data appropriately with reactive state

# Layout, Reusability, Consistency

- Keep layout consistent by using the same approaches in different pages:
  - Each resource has a List page and a Detail page
  - List pages show a table with actions
  - Detail pages show a single record and support inline editing
    - Inline editing also supports creating new records
  - Keep layout consistent by using components
- **CRITICAL: Use the Partners.vue and PartnerDetail.vue as examples for layouts and logic of other pages.**
- Responsive Design
  - Mobile-first approach with Tailwind breakpoints
  - Adaptive layouts for different screen sizes
  - Touch-friendly interface elements
  - Consistent spacing and typography
