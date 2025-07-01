---
layout: default
title: Documentation Site
nav_order: 7
---

# Documentation Site

This directory contains the source files for the GitHub Pages documentation site for the Inventory Management UI.

## Structure

```
docs/
├── _config.yml           # Jekyll configuration
├── _posts/              # Blog posts (auto-generated)
├── Gemfile              # Ruby dependencies
├── index.md             # Home page
├── contributing.md      # Contributing guidelines
├── blog.md             # Blog index page
├── api-integration.md  # API integration documentation
└── README.md           # This file
```

## Local Development

To run the documentation site locally:

1. Install Ruby and Bundler:
   ```bash
   # On macOS with Homebrew
   brew install ruby
   gem install bundler
   
   # On Ubuntu/Debian
   sudo apt-get install ruby-full build-essential zlib1g-dev
   gem install bundler
   ```

2. Install dependencies:
   ```bash
   cd docs
   bundle install
   ```

3. Start the Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```

4. Open http://localhost:4000 in your browser

## Automated Features

### Blog Post Generation

The site automatically generates daily blog posts from Git commit history:

- **Trigger**: Runs daily at 00:00 UTC via GitHub Actions
- **Source**: Git commits from the last 30 days
- **Format**: Organized by date with commit details
- **Emojis**: Conventional commit types get appropriate emojis

### GitHub Pages Deployment

The site is automatically deployed to GitHub Pages:

- **Trigger**: On push to main branch or daily schedule
- **Build**: Jekyll builds the static site
- **Deploy**: GitHub Actions deploys to GitHub Pages

## Customization

### Theme

The site uses the [Just the Docs](https://just-the-docs.github.io/just-the-docs/) theme, which provides:

- Clean, responsive design
- Built-in search functionality
- Navigation structure
- Syntax highlighting
- Mobile-friendly layout

### Configuration

Key settings in `_config.yml`:

- **Site title and description**
- **Navigation links**
- **GitHub repository links**
- **Search configuration**
- **Footer content**

### Adding Pages

To add new documentation pages:

1. Create a new `.md` file in the `docs/` directory
2. Add front matter with title and navigation order:
   ```yaml
   ---
   layout: default
   title: Your Page Title
   nav_order: 7
   ---
   ```
3. Write your content in Markdown
4. Commit and push - the page will appear automatically

## Maintenance

### Updating Dependencies

To update Ruby gems:

```bash
cd docs
bundle update
```

### Modifying Blog Generation

The blog post generation script is located at `scripts/generate-blog-posts.js`. Modify this file to change:

- Commit history depth
- Blog post format
- Emoji mappings
- Content structure

### Theme Customization

To customize the theme:

1. Override theme defaults in `_config.yml`
2. Add custom CSS in `assets/css/custom.css`
3. Modify layouts in `_layouts/` directory (if needed)

## Troubleshooting

### Common Issues

1. **Ruby version conflicts**: Use a Ruby version manager like rbenv or RVM
2. **Bundle install fails**: Make sure you have build tools installed
3. **Jekyll build errors**: Check the GitHub Actions logs for details
4. **Pages not updating**: Verify the GitHub Actions workflow is running

### Support

For help with:
- Jekyll: https://jekyllrb.com/docs/
- Just the Docs theme: https://just-the-docs.github.io/just-the-docs/
- GitHub Pages: https://pages.github.com/

---

*This documentation site is automatically maintained and updated.*
