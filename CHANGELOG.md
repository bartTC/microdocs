# Changelog

## Version 0.3.0 (2025-11-13)

### Added

- **GitHub Action** for one-step documentation deployment
  - Composite action that builds and deploys documentation to GitHub Pages
  - Auto-detects repository URL from GitHub context
  - Configurable inputs: files, title, output, template, repo-url, deploy, artifact-dir
  - Deploy enabled by default for seamless GitHub Pages deployment
  - Can be used for build-only workflows with `deploy: false`
  - Uses `uvx` for zero-installation execution
  - Comprehensive documentation in ACTION.md
- **Local testing workflow** - Test action locally with `act` tool
- **Testing guide** (TESTING.md) - Complete guide for testing the action locally with `act`

### Fixed

- **Dark mode typography** - Improved readability in dark mode
  - Blockquotes now use readable light gray text instead of dark blue
  - Table borders use softer medium gray instead of harsh light colors
  - Table headers properly use light gray text for better visibility
  - All fixes properly scoped within `@utility prose` block in Tailwind CSS

### Deployment

```bash
# Using uv (recommended)
uvx microdocs@0.3 README.md CHANGELOG.md

# Using pip
pip install --upgrade microdocs
```

## Version 0.2.0 (2025-11-13)

### Fixed

- **Package distribution** - Templates are now properly included in the package
  - Moved `templates/` directory into `microdocs/templates/`
  - Fixed template path resolution in builder
  - `uvx microdocs` now works correctly without local installation

### Changed

- **Typography improvements**
  - Updated to Roboto Slab for headlines (professional serif font)
  - Roboto for body text (clean and readable)
  - IBM Plex Mono for code (excellent readability and character distinction)
- **Code formatting** - Removed decorative backticks from inline code tags for cleaner appearance
- **Output handling** - Changed from `print()` to `sys.stdout.write()` for better stream control

### Added

- **GitHub Actions workflow** for automatic deployment to GitHub Pages
  - Complete example showing how to use Microdocs in CI/CD
  - Comprehensive documentation and comments
  - Uses `uvx microdocs@latest` for zero-installation deployment
  - Step-by-step setup instructions included
  - Demonstrates best practices for deploying documentation

### Deployment

```bash
# Using uv (recommended)
uvx microdocs@0.2 README.md CHANGELOG.md

# Using pip
pip install --upgrade microdocs
```

## Version 0.1.0 (2025-11-13)

Initial release of Microdocs - a Python tool that transforms Markdown files into beautiful, self-contained HTML documentation sites.

### Features

- **Markdown to HTML conversion** with full markdown extension support
  - Tables, fenced code blocks, syntax highlighting
  - Extra features (abbreviations, definition lists)
  - Automatic heading ID generation
- **Single-page application** with tab-based navigation
  - Smooth transitions between sections
  - Sticky header with desktop and mobile layouts
  - No page reloads when switching sections
- **Automatic table of contents**
  - Generated with [tocbot](https://tscanlin.github.io/tocbot/)
  - Active heading tracking on scroll
  - Nested heading support (H1-H6)
  - Automatically hidden when no headings present
- **Beautiful UI** with Tailwind CSS and Alpine.js
  - Modern, clean design inspired by GitHub
  - Responsive mobile and desktop layouts
  - Smooth scrolling and transitions
- **Dark mode support**
  - Automatic detection of system preference
  - Manual toggle with persistent localStorage
  - Optimized syntax highlighting for both themes
- **Self-contained output**
  - Single HTML file with embedded CSS
  - No external dependencies at runtime
  - Easy to deploy anywhere
- **Customizable**
  - Custom HTML templates with Jinja2
  - Custom CSS styling
  - Optional repository link in header
  - Custom documentation title
- **Developer-friendly**
  - Clean, well-documented Python code
  - Type hints throughout
  - Comprehensive docstrings
  - Ruff linting with "ALL" rules enabled
- **Footer with attribution**
  - Build timestamp (UTC)
  - Link to Microdocs project

### Installation

```bash
# Using uv (recommended)
uvx microdocs

# Using pip
pip install microdocs
```

### Usage

```bash
# Convert markdown files to HTML
microdocs README.md CHANGELOG.md -o docs/index.html

# With custom title and repository link
microdocs README.md --title "My Docs" --repo-url https://github.com/user/repo
```
