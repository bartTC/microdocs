# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Microdocs is a Python tool that transforms Markdown files (README.md and CHANGELOG.md) into a self-contained HTML documentation site. It converts markdown to HTML with syntax highlighting, tables of contents, and other extensions, then injects the content into an HTML template.

## Development Commands

### Setup
```bash
# Install dependencies (requires Python 3.11+)
uv sync

# Install with dev dependencies
uv sync --dev
```

### Running the Tool
```bash
# Basic usage - convert markdown files to HTML
microdocs README.md CHANGELOG.md

# Specify output file
microdocs README.md CHANGELOG.md -o docs/index.html

# Use custom template
microdocs README.md -t custom-template.html

# Run as Python module
python -m microdocs README.md CHANGELOG.md
```

### Code Quality
```bash
# Run linter (Ruff with "ALL" rules enabled)
ruff check .

# Auto-fix linting issues
ruff check --fix .

# Format code
ruff format .
```

### Styling (Tailwind CSS)

**IMPORTANT**: Never edit `microdocs/templates/default.css` directly - it is auto-generated!

To modify styles:
1. Edit `microdocs/templates/default.tailwind.css` (source file)
2. Run Tailwind CLI to compile: `npx @tailwindcss/cli@latest -i microdocs/templates/default.tailwind.css -o microdocs/templates/default.css --minify`
3. The compiled/minified CSS will be written to `default.css`

### Testing

**Test Organization**
- Tests are located in `microdocs/tests/`
- Tests are organized by module type:
  - `test_builder.py` - Low-level functions (markdown conversion, title extraction, etc.)
  - `test_cli.py` - CLI interface functionality
  - `test_templates.py` - Template rendering and integration

**Test Style**
- Use pytest functions, NOT TestCase classes
- Use pytest fixtures for reusable test data
- Focus on testing OUR code, not external libraries (e.g., don't test that markdown conversion works, test that our builder uses it correctly)

**Running Tests**
```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run tests with coverage
pytest --cov=microdocs

# Run tests across all Python versions (3.11-3.14)
./runtests.sh
```

**CI/CD**
- `.github/workflows/test.yml` - Runs tests on Python 3.11, 3.12, 3.13, 3.14
- `.github/workflows/lint.yml` - Runs ruff check and ruff format --check

### Release Process

When creating a new release, follow these steps **in order**:

1. **Run full test suite** - Verify everything passes before releasing
   ```bash
   pytest && ruff check . && ruff format --check .
   ```

2. **Update version** in `pyproject.toml`
   - Bump version number
   - Update development status classifier if needed (Alpha → Beta → Production/Stable)

3. **Update CHANGELOG.md**
   - Move "Unreleased" section to new version heading with date
   - Add summary of changes (Added, Changed, Fixed, etc.)
   - Include deployment instructions with new version number

4. **Commit changes**
   ```bash
   git add pyproject.toml CHANGELOG.md
   git commit -m "Release version X.Y.Z"
   ```

5. **Create git tag**
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z: brief description"
   ```

6. **Build the package**
   ```bash
   uv build
   ```

7. **Publish to PyPI**
   ```bash
   uv publish
   ```

8. **Push changes and tags**
   ```bash
   git push
   git push --tags
   ```

**Important Notes:**
- Always run tests BEFORE building and publishing
- Never build before creating git commit and tag
- Always create git tag BEFORE building
- Update CHANGELOG with actual release date
- Include deployment instructions in CHANGELOG

## Architecture

### Core Components

1. **Entry Points** (microdocs/__init__.py, __main__.py, cli.py)
   - Package exposes `main()` function that invokes the Typer CLI app
   - Registered as `microdocs` CLI command in pyproject.toml
   - CLI accepts multiple markdown files as arguments
   - Options: `--output` (default: index.html), `--template` (custom HTML template), `--repo-url`, `--title`

2. **Builder** (microdocs/builder.py)
   - Clean, well-documented module with comprehensive docstrings
   - All functions have proper type hints using modern Python syntax
   - Passes all ruff linting checks
   - No legacy/backward compatibility code
   - `build_documentation(input_files, output_path, template_path, *, repo_url, title)`: Main build function
     - Accepts list of markdown files to convert
     - Converts markdown to HTML using python-markdown with extensions: extra, codehilite, fenced_code, tables, toc
     - Extracts title from first file using parsed TOC tokens (from toc extension) or uses provided title
     - Extracts and flattens TOC for each section
     - Reads HTML template (default: templates/default.html)
     - Uses Jinja2 for template rendering with `title`, `sections`, `inlined_css`, and `repo_url` variables
     - Writes final HTML to specified output path
     - Always prints progress messages to stdout
   - `convert_markdown_to_html(md_content)`: Returns tuple of (html, markdown_instance)
     - The markdown instance provides access to parsed metadata like toc_tokens
   - `extract_title_from_markdown_instance(md)`: Extracts first H1 from parsed tree
   - `flatten_toc_tokens(tokens)`: Recursively flattens nested TOC structure
     - TOC tokens from markdown are nested (children in 'children' key)
     - Returns flat list with level/id/name for each heading
   - `convert_plain_text_to_html(text_content)`: Converts plain text to HTML with line breaks

3. **Template System** (templates/default.html)
   - Jinja2-based template rendering
   - Single-page HTML template with Tailwind CSS and Alpine.js
   - Uses CDN for:
     - Tailwind CSS (includes forms, typography, aspect-ratio, line-clamp, container-queries plugins)
     - Alpine.js 3.x for reactive UI
   - Two-column layout:
     - Main content area (left, flex-1)
     - TOC sidebar (right, fixed 16rem width, sticky)
   - Page-based navigation: sections act like pages, only one visible at a time
   - Alpine.js state: `activeSection` tracks which section is displayed
   - First section shown by default
   - Smooth transitions between sections
   - Dynamic navigation with active state highlighting
   - Table of Contents (TOC):
     - Shows all headings (H1-H6) for current section
     - Automatically indented based on heading level (0.75rem per level)
     - Sticky positioning (follows scroll)
     - Each section has its own TOC
   - Template variables:
     - `{{ title }}` - Extracted from first H1 heading in first markdown file or provided via CLI
     - `{{ sections }}` - List of sections with `id`, `name`, `html`, and `toc` attributes
     - `{{ inlined_css }}` - CSS content from companion `.css` file
     - `{{ repo_url }}` - Optional repository URL

### Important Notes

- Uses uv for dependency management
- Title extraction:
  - Automatically extracted from first H1 heading in first markdown file
  - Uses parsed TOC tokens from markdown library (not regex)
  - Falls back to "Documentation" if no H1 found
- Section IDs are generated from filenames (lowercase stem) for anchor links

### Ruff Configuration

- Target Python 3.11+
- Uses "ALL" rules with specific exclusions for common conflicts (COM812, E501, D203, D212, etc.)
- FBT (boolean trap), FIX (TODO/FIXME), and ERA001 (commented code) rules are ignored
- Test files have relaxed rules (allow assert statements, magic values)
