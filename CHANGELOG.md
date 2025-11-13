# Changelog

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
