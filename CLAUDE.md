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
```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=microdocs

# Note: No tests exist yet (no test*.py files found)
```

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
