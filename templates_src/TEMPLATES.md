# Template Development Guide

This guide explains how to create and customize templates for Microdocs.

## Template Structure

Templates are built using Vite, which compiles HTML, CSS (Tailwind), and JavaScript into single-file outputs.

### Directory Structure

```
templates_src/{template_name}/
├── {template_name}.html    # HTML template with Jinja2 markup
├── {template_name}.css     # Tailwind CSS source
└── {template_name}.js      # JavaScript source

↓ (build with `npm run build`)

microdocs/templates/{template_name}/
└── {template_name}.html    # Single file with all CSS/JS inlined
```

**Important:**
- Source files are in `templates_src/` at the project root
- Built templates are in `microdocs/templates/` (distributed with the package)
- Never edit files in `microdocs/templates/` directly - they are auto-generated!
- The build process automatically discovers all template directories

## Development Workflow

### Prerequisites

```bash
# Install Node.js dependencies
npm install
```

### Commands

```bash
# Start dev server with hot-reloading
npm run dev

# Build all templates for production
npm run build

# Preview built templates
npm run preview
```

## Creating a New Template

Let's create a minimal template called "simple" as an example.

### Step 1: Create Template Directory

```bash
mkdir -p templates_src/simple
```

### Step 2: Create HTML Template (`templates_src/simple/simple.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title }}</title>
    <script type="module" src="./simple.js"></script>
    <link rel="stylesheet" href="./simple.css">
  </head>
  <body>
    <header>
      <h1>{{ title }}</h1>
    </header>

    <main>
      {% for section in sections %}
      <section id="{{ section.id }}">
        <h2>{{ section.name }}</h2>
        <article>
          {{ section.html|safe }}
        </article>
      </section>
      {% endfor %}
    </main>

    <footer>
      <p>Built on {{ build_timestamp }}</p>
    </footer>
  </body>
</html>
```

### Step 3: Create CSS (`templates_src/simple/simple.css`)

```css
@import "../node_modules/tailwindcss/dist/lib.d.mts";

body {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

header {
  border-bottom: 2px solid #333;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 3rem;
}

footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #ccc;
  color: #666;
  font-size: 0.875rem;
}
```

### Step 4: Create JavaScript (`templates_src/simple/simple.js`)

```javascript
// Simple template doesn't need much JavaScript
console.log('Simple template loaded');

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
```

### Step 5: Build the Template

```bash
npm run build
```

This will create `microdocs/templates/simple/simple.html` with all CSS and JS inlined.

### Step 6: Use the Template

```bash
# Template name is automatically inferred from directory
microdocs README.md -t simple -o output.html

# Or use the full path
microdocs README.md -t templates/simple/simple.html -o output.html
```

## Available Jinja2 Variables

Templates have access to the following variables:

| Variable | Type | Description |
|----------|------|-------------|
| `title` | string | Document title (from first H1 or CLI `--title`) |
| `sections` | list | List of sections with `id`, `name`, and `html` attributes |
| `repo_url` | string | Optional repository URL (from CLI `--repo-url`) |
| `build_timestamp` | string | Build timestamp in UTC format |

### Section Object Structure

```python
{
  "id": "readme",           # Lowercase filename stem
  "name": "README",         # Original filename stem
  "html": "<h1>...</h1>"   # Converted HTML content
}
```

## Contributing Templates_

If you create a useful template, consider contributing it to the project!

1. Create your template in `templates_src/`
2. Test thoroughly with various content
3. Document any special features
4. Submit a pull request

Templates should:
- Be responsive
- Support dark mode (optional but recommended)
- Be accessible (semantic HTML, ARIA labels)
- Have minimal dependencies
