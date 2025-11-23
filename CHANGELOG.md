# Changelog

## Unreleased

### Added

- **Custom footer text** - New `--footer` / `-f` CLI option
  - Allows setting custom footer text instead of automatic build timestamp
  - Example: `microdocs README.md --footer "v1.1 2025-01-01"`
  - Falls back to timestamp if not provided

### Fixed

- **TOC deep linking across sections** - Fixed table of contents links navigating to wrong section
  - Heading IDs are now prefixed with section name (e.g., `readme-deep-dive`, `guide-deep-dive`)
  - Prevents TOC links from jumping to identically-named headings in other sections
  - Added custom `slugify` function to markdown `toc` extension for ID prefixing
  - Added Playwright test to verify TOC navigation stays within correct section
- **Sticky header overlap** - Fixed headings appearing under sticky navigation when scrolling via TOC
  - Added `scroll-padding-top: 86px` to CSS for proper anchor positioning
  - Added `scroll-behavior: smooth` for smooth scrolling
  - Configured Tocbot with `headingsOffset: 86` for accurate scroll spy detection
  - Set `scrollSmooth: false` to let browser handle native scrolling behavior
- **Header title navigation** - Clicking the documentation title now returns to first section and scrolls to top
  - Uses Alpine.js to set active section and scroll to page top
  - Provides intuitive way to return to beginning of documentation

### Changed

- **Template typography** - Updated default template fonts
  - Sans-serif: Inter (modern, highly readable)
  - Heading: Zilla Slab (bold, friendly slab serif)
  - Monospace: IBM Plex Mono (professional code font)
  - Improved heading borders and link hover states
  - Enhanced code block styling with better contrast
- **Template configuration** - Simplified JavaScript initialization
  - Removed JSON config script tag entirely
  - JavaScript now reads section IDs directly from navigation DOM using `data-section-id` attributes
  - Consolidated mobile and desktop navigation into single responsive component
  - Removed duplicate `id="mobile-nav"` - now uses single `id="main-nav"` that adapts
  - Reduced HTML payload by ~3KB and eliminated code duplication

- **Markdown rendering improvements** - Enhanced markdown processing with GitHub-flavored features
  - Added `mdx-truly-sane-lists` extension for proper nested list rendering with 2-space indentation
  - Lists now render with correct `<ul>` nesting instead of flattening all items into a single list
  - Fixes CHANGELOG-style formatting where sub-items appear under bold parent items
  - Added `pymdown-extensions` for GitHub-flavored markdown support:
    - Auto-linking URLs without explicit markdown syntax
    - Strikethrough text with `~~text~~`
    - Task lists with `- [ ]` and `- [x]` checkboxes
    - Emoji support with `:emoji:` shortcodes
    - Better code fences and emphasis handling
- **Dark mode styling improvements** - Refactored template styling for better dark mode support
  - Replaced custom `--color-doc-*` CSS variables with Tailwind's standard color system
  - Now using `dark:prose-invert` for automatic dark mode typography from `@tailwindcss/typography`
  - Simplified CSS by ~70 lines while maintaining full dark mode compatibility
  - Fixed blockquotes and table headers appearing too dark in dark mode
  - All colors now use explicit `dark:` variants (e.g., `text-gray-900 dark:text-gray-100`)
  - Code block backgrounds improved: `bg-gray-50 dark:bg-gray-800`
- **Template build system** - Complete redesign using Vite
  - Templates are now built from source files in `templates_src/` to single-file outputs in `microdocs/templates/`
  - Vite automatically discovers and builds all template directories
  - CSS (Tailwind) and JavaScript are inlined into single HTML files
  - Development server with hot-reloading: `npm run dev`
  - Production builds: `npm run build`
  - Preview built templates: `npm run preview`
  - Source files (`templates_src/`) excluded from PyPI package distribution
- **Template CLI** - Enhanced template selection
  - `--template` now accepts both template names (e.g., `default`) and file paths
  - Template names automatically resolve to built-in templates
  - Available templates listed in help text
  - Example: `microdocs README.md -t default` or `microdocs README.md -t /path/to/custom.html`
- **Template structure** - Reorganized for better maintainability
  - Source: `templates_src/{name}/{name}.html`, `{name}.css`, `{name}.js`
  - Output: `microdocs/templates/{name}/{name}.html` (single file)
  - Removed legacy CSS file inlining (`inlined_css` template variable removed)
  - Builder no longer looks for companion `.css` files
- **Pre-commit hooks** - Removed djhtml hook (Django template formatter) as it's no longer needed
- **Documentation** - Comprehensive template development guide
  - New `templates_src/TEMPLATES.md` with complete guide for creating custom templates
  - Updated CLAUDE.md with Vite workflow instructions
  - Updated README.md with simplified template usage section

### Added

- **Playwright testing infrastructure** for end-to-end template testing
  - `playwright/build-test-template.js` - Script to build and test templates with real content
  - `playwright/fixtures/` - Sample markdown files for testing
  - `playwright/playwright.config.js` - Playwright configuration
  - Playwright dependencies added to `package.json`
  - Test results directories added to `.gitignore`
- **Vite configuration** (`vite.config.js`)
  - Auto-discovers template directories
  - Configures single-file builds with viteSingleFile plugin
  - Removes module attributes from inlined scripts
  - Minifies output with Terser
- **Package build configuration** - Excluded development files from PyPI distribution
  - Excludes: `playwright/`, `templates_src/`, `node_modules/`, config files
- **Image Row Detection** - Automatically detects and styles paragraphs containing only linked images
  - Applies `.image-row` class to paragraphs containing only linked images or SVGs
  - Supports multiple images per link (e.g. for complex badges)
  - Ensures proper alignment and spacing for badge rows

### Removed

- **Template tests** - Removed `microdocs/tests/test_templates.py`
  - 16 tests for template variable presence and CSS inlining removed
  - Template testing now handled by Playwright for more realistic E2E testing
- **Legacy template file** - Removed `microdocs/templates/default.css`
  - CSS now inlined during Vite build process

## Version 1.1.0 (2025-01-13)

### Added

- **Internal link rewriting** - Automatically converts markdown file links to section navigation
  - Links to files that are included as sections (e.g., `[CHANGELOG](CHANGELOG.md)`) are rewritten to section anchors (`#changelog`)
  - Preserves external links and links to files that aren't sections
  - Centralized hash link monitoring with Alpine.js integration
  - Clicking any hash link now properly triggers section switching without page reloads
  - Added 4 tests for link rewriting functionality in `test_builder.py`

## Version 1.0.0 (2025-11-13)

🎉 **First stable release!** Microdocs is now production-ready with comprehensive test coverage, CI/CD workflows, and a stable API.

### Added

- **Comprehensive test suite** with 57 tests covering all functionality
  - `test_builder.py` - Tests for low-level conversion and building functions (25 tests)
  - `test_cli.py` - Tests for CLI interface functionality (19 tests)
  - `test_templates.py` - Tests for template rendering and integration (13 tests)
  - Uses pytest functions with fixtures following best practices
  - All tests pass linting with ruff
- **Continuous Integration workflows**
  - `.github/workflows/test.yml` - Runs tests across Python 3.11, 3.12, 3.13, 3.14
  - `.github/workflows/lint.yml` - Runs ruff check and format verification
- **Testing infrastructure**
  - `runtests.sh` - Executable script to run tests across all Python versions
  - Comprehensive testing documentation in CLAUDE.md
- **README badges** - Added PyPI version, test status, Python version support, and license badges

### Changed

- **Development status** upgraded from Beta to Production/Stable
- **Enhanced PyPI classifiers** with better categorization for documentation and text processing

### Deployment

```bash
# Using uv (recommended)
uvx microdocs@1.0 README.md CHANGELOG.md

# Using pip
pip install --upgrade microdocs
```

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
