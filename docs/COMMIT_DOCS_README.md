# Git Commit Documentation Generator

This directory contains scripts to automatically generate documentation for Git commits on the main branch.

## Files

- `generate-commit-docs.py` - Python script (cross-platform)
- `generate-commit-docs.ps1` - PowerShell script for Windows environments
- `.github/workflows/generate-commit-docs.yml` - GitHub Actions workflow for automation

## How it Works

1. **Incremental Updates**: The script checks existing documentation in `_docs/` to determine the last processed commit
2. **Full Regeneration**: If no documentation exists or there's a mismatch, it processes all commits
3. **Markdown Generation**: Creates individual markdown files for each commit with:
   - Commit metadata (hash, date, author, message)
   - List of changed files with status indicators
   - Links to GitHub commit view
4. **Index Generation**: Creates an index file listing recent commits

## Usage

### Manual Execution (Python)

```bash
# Ensure Python 3 is available
python3 generate-commit-docs.py
```

### Manual Execution (PowerShell)

```powershell
# Run from repository root
pwsh -ExecutionPolicy Bypass -File .\docs\generate-commit-docs.ps1
```

### Automated Execution

The GitHub Actions workflow automatically runs:
- On every push to main branch
- Daily at 2 AM UTC
- Can be triggered manually from GitHub Actions tab

## Output Structure

```
_docs/
├── index.md                           # Index of all commits
├── 20250702120000-a1b2c3d-feat_add_new_feature.md
├── 20250702130000-e4f5g6h-fix_bug_in_auth.md
└── ...
```

## Generated Content

Each commit documentation includes:

- **Front Matter**: Jekyll-compatible metadata
- **Commit Details**: Hash, date, author, full message
- **File Changes**: Visual indicators for added/modified/deleted files
- **GitHub Links**: Direct links to commit and repository state

## File Naming Convention

`YYYYMMDDHHMMSS-{short_hash}-{sanitized_title}.md`

- Timestamp ensures chronological ordering
- Short hash provides unique identification
- Sanitized title improves readability

## Requirements

### Python Script
- Python 3.6+
- Git repository with main branch
- No additional dependencies

### PowerShell Script
- PowerShell 5.1+ or PowerShell Core 6+
- Git repository with main branch
- Windows or cross-platform PowerShell environment

### GitHub Actions
- Repository with Actions enabled
- Appropriate permissions for content writing
- Jekyll setup for GitHub Pages (optional)

## Configuration

Edit the scripts to customize:

- `DOCS_DIR` - Output directory name
- `BRANCH` - Git branch to process
- Repository URLs in generated links
- Markdown templates and styling

## Integration with Jekyll

The generated markdown files include Jekyll front matter and can be integrated into your documentation site by:

1. Including `_docs/` in your Jekyll site structure
2. Adding navigation links to the commit documentation
3. Customizing the layout and styling as needed

## Troubleshooting

### Common Issues

1. **PowerShell Execution Policy**: Use `-ExecutionPolicy Bypass` parameter
2. **Git Errors**: Ensure you're in a Git repository with access to main branch
3. **Missing Commits**: Check that remote is accessible and up to date

### Logs

Both scripts generate logs:
- Python: Console output and `commit-docs.log`
- PowerShell: Console output and `commit-docs.log`

### GitHub Actions Debugging

Check the Actions tab in your GitHub repository for detailed execution logs and error messages.

---

*Generated for Inventory Management UI project*
