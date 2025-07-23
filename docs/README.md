# Documentation Site

This directory contains the source files for the GitHub Pages documentation site for the Museum Inventory Management UI.

## Current Structure

```
docs/
├── _config.yml                    # Jekyll configuration
├── index.md                       # Homepage (nav_order: 1)
├── application-architecture.md    # Technical architecture (nav_order: 2)
├── guidelines/                    # Development guidelines section (nav_order: 3)
│   ├── index.md                  # Guidelines overview
│   ├── api-integration.md        # API integration guidelines
│   ├── coding-guidelines.md      # Code style and best practices
│   ├── testing.md               # Testing overview
│   ├── integration-testing.md    # Integration testing guide
│   └── generate-commit-docs.md   # Commit documentation guidelines
├── components/                    # Component documentation (nav_order: 4)
│   ├── index.md                  # Component overview
│   ├── Global.md                 # Global components (overlays, modals)
│   ├── Format.md                 # Data formatting components
│   ├── Layout.md                 # Layout and structural components
│   ├── Actions.md                # Action components
│   └── Icons.md                  # Icon components
├── contributing.md                # Contributing guidelines (nav_order: 5)
├── development-archive.md         # Development history/blog (nav_order: 6)
├── assets/                       # Static assets
│   └── css/
│       └── custom.scss           # Custom styles
├── _layouts/                     # Jekyll layout templates
│   └── default.html
├── _docs/                        # Additional documentation
├── generate-commit-docs.ps1      # PowerShell script for commit docs
├── generate-commit-docs.py       # Python script for commit docs
├── Gemfile                       # Ruby dependencies
├── Gemfile.lock                  # Ruby dependency lock file
└── README.md                     # This file
```

## Site Navigation Structure

The documentation site uses Jekyll's nav_order to create logical navigation:

1. **Home** (`index.md`) - Project overview and quick start
2. **Application Architecture** (`application-architecture.md`) - Comprehensive system overview and API mapping
3. **Guidelines** (`guidelines/`) - API integration, coding standards, and testing practices
4. **Components** (`components/`) - Complete documentation of Vue.js components with usage examples
5. **Contributing** (`contributing.md`) - Development workflow and project contribution instructions
6. **Development Archive** (`development-archive.md`) - Historical updates

## Local Development

To run the documentation site locally:

1. **Install Ruby and Bundler**:
   ```bash
   # On macOS with Homebrew
   brew install ruby
   gem install bundler
   
   # On Ubuntu/Debian
   sudo apt-get install ruby-full build-essential zlib1g-dev
   gem install bundler
   
   # On Windows (use WSL)
   wsl --install
   # Then follow Ubuntu/Debian instructions in WSL
   ```

2. **Install dependencies**:
   ```bash
   cd docs
   bundle install
   ```

3. **Start the Jekyll server**:
   ```bash
   bundle exec jekyll serve
   ```

4. **Open browser**: Navigate to http://localhost:4000

## Automated Features

### GitHub Pages Deployment

The site is automatically deployed to GitHub Pages and updated when:
- **Main branch changes**: Automatic deployment on push to main
- **Content updates**: Any changes to markdown files trigger rebuild
- **Jekyll processing**: Static site generation with Just the Docs theme

### Theme and Configuration

**Theme**: [Just the Docs](https://just-the-docs.github.io/just-the-docs/)
- Clean, responsive design optimized for technical documentation
- Built-in search functionality across all content
- Hierarchical navigation with nav_order support
- Syntax highlighting for code blocks
- Mobile-friendly responsive layout

**Key Configuration** (`_config.yml`):
- Site title: "Museum Inventory Management UI"
- Navigation structure with proper ordering
- GitHub repository integration
- Search functionality enabled
- Footer with project information

## Content Management

### Adding New Documentation

1. **Create new markdown file** in appropriate directory:
   ```bash
   # For guidelines
   docs/guidelines/new-guideline.md
   
   # For component docs  
   docs/components/NewComponent.md
   ```

2. **Add Jekyll front matter**:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   nav_order: 7                    # Choose appropriate order
   parent: Guidelines              # If it's a child page
   ---
   ```

3. **Write content** in Markdown format
4. **Commit and push** - automatic deployment handles the rest

### Updating Existing Content

- Edit any `.md` file and commit changes
- Navigation and search automatically update
- No manual regeneration required

### Documentation Standards

- Use clear, descriptive titles
- Include code examples where relevant
- Follow consistent markdown formatting
- Link between related sections
- Update nav_order when adding new top-level pages

## Site Maintenance

### Navigation Order Management

When adding new top-level pages, update `nav_order` values:
- Reserve orders 1-6 for main sections
- Use incremental values (7, 8, 9...) for additional pages
- Child pages use parent structure, don't need top-level nav_order

### Content Updates

**Regular Maintenance**:
- Keep implementation status current in index.md
- Update version numbers and dependencies when they change
- Review and update API integration docs when client library updates
- Ensure component documentation matches actual component props/events

**When Adding New Features**:
- Document new components in `components/` directory
- Update implementation status tables
- Add integration guidelines if new APIs are involved
- Update contributing guidelines if workflow changes

## Troubleshooting

### Common Issues

1. **Ruby version conflicts**: 
   - Use rbenv or RVM for version management
   - Ensure compatible Ruby version (check Gemfile)

2. **Bundle install fails**: 
   - Install build tools: `sudo apt-get install build-essential`
   - Update bundler: `gem update bundler`

3. **Jekyll build errors**: 
   - Check GitHub Actions logs for specific errors
   - Validate YAML front matter syntax
   - Ensure all referenced files exist

4. **Pages not updating**: 
   - Verify GitHub Actions workflow completed successfully
   - Check for merge conflicts in main branch
   - Clear browser cache for GitHub Pages

5. **Navigation not showing**: 
   - Verify `nav_order` is set correctly
   - Check parent/child relationships
   - Ensure proper YAML syntax in front matter

### Development Tips

- Use `bundle exec jekyll serve --livereload` for automatic page refresh
- Test locally before pushing changes
- Use Jekyll's built-in syntax checking
- Validate links work correctly both locally and on GitHub Pages

## Resources

- **Jekyll Documentation**: https://jekyllrb.com/docs/
- **Just the Docs Theme**: https://just-the-docs.github.io/just-the-docs/
- **GitHub Pages**: https://pages.github.com/
- **Markdown Guide**: https://www.markdownguide.org/

---

*This documentation site is automatically maintained and reflects the current state of the Museum Inventory Management UI project.*
