# Microdocs

**Transform your Markdown files into a self-contained HTML documentation site.**

Microdocs is a Python tool that converts Markdown files (like README.md and CHANGELOG.md) into a beautiful, single-page HTML documentation site with navigation, table of contents, and syntax highlighting.

> **✨ Zero Configuration Required** - Just point it at your Markdown files and get a beautiful documentation site. No config files, no setup, no dependencies to install.

## Features

- **Simple & Fast** - Convert multiple Markdown files to HTML with a single command
- **Self-Contained** - Generates a single HTML file with all styles embedded (only tocbot loaded from CDN)
- **Beautiful UI** - Modern, clean design with Tailwind CSS and Alpine.js
- **Smart Navigation** - Single-page app with tab-based navigation between sections
- **Automatic Table of Contents** - Generated with [tocbot](https://tscanlin.github.io/tocbot/) with active heading tracking
- **Dark Mode** - Automatic system preference detection with manual toggle
- **Syntax Highlighting** - Code blocks with Pygments highlighting for both light and dark themes
- **Responsive Design** - Optimized layouts for mobile and desktop
- **Zero Configuration** - Works out of the box with sensible defaults
- **Customizable** - Use your own HTML templates and CSS styles

## Examples

See Microdocs in action with these live documentation sites:

- **Microdocs Documentation** - [barttc.github.io/microdocs](https://barttc.github.io/microdocs/)
- **Tailwhip Documentation** - [barttc.github.io/tailwhip](https://barttc.github.io/tailwhip/)

Both sites are generated from Markdown files using Microdocs with the default template.

## Installation

### Using uv (recommended)

```bash
uvx microdocs
```

### Using pip

```bash
pip install microdocs
```

## Quick Start

Convert your README and CHANGELOG to HTML:

```bash
uvx microdocs README.md CHANGELOG.md
```

This creates `index.html` in your current directory. Open it in your browser!

## Usage Examples

### Basic Usage

```bash
# Convert a single file
uvx microdocs README.md

# Convert multiple files
uvx microdocs README.md CHANGELOG.md CONTRIBUTING.md

# Specify output file
uvx microdocs README.md -o docs/index.html

# Set custom title
uvx microdocs README.md --title "My Project Docs"

# Add repository link
uvx microdocs README.md --repo-url https://github.com/user/repo
```

### Advanced Usage

```bash
# Use custom template
uvx microdocs README.md -t custom-template.html

# Combine options
uvx microdocs README.md CHANGELOG.md \
  -o dist/index.html \
  --title "My Project" \
  --repo-url https://github.com/user/repo \
  -t templates/custom.html
```

## GitHub Actions

Automatically deploy your documentation to GitHub Pages:

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: |
      README.md
      CHANGELOG.md
    title: 'My Project'
```

**[See full GitHub Actions documentation →](ACTION.md)**

## Template System

Microdocs uses Jinja2 templates. The default template includes:

- **Responsive Layout** - Two-column design with main content and TOC sidebar
- **Page Navigation** - Tab-like navigation between sections
- **Sticky TOC** - Table of contents that follows you as you scroll
- **Dark Mode Ready** - Styles work well in light and dark themes

### Template Variables

Your custom templates have access to:

- `{{ title }}` - Document title
- `{{ sections }}` - List of sections with:
  - `id` - Section identifier (from filename)
  - `name` - Section display name
  - `html` - Converted HTML content
- `{{ inlined_css }}` - CSS content from companion `.css` file
- `{{ repo_url }}` - Repository URL (if provided)
- `{{ build_timestamp }}` - Build timestamp in UTC format

### Creating Custom Templates

1. Create an HTML file with Jinja2 template syntax
2. Optionally create a companion CSS file (same name with `.css` extension)
3. Use it with the `--template` option

Example minimal template:

```html
<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
    <style>{{ inlined_css }}</style>
</head>
<body>
    <h1>{{ title }}</h1>
    {% for section in sections %}
        <section id="{{ section.id }}">
            <h2>{{ section.name }}</h2>
            {{ section.html|safe }}
        </section>
    {% endfor %}
</body>
</html>
```

## File Support

- **Markdown files** (`.md`, `.markdown`) - Full markdown processing with extensions
- **Plain text files** - Displayed with preserved formatting
