# Microdocs GitHub Action

Deploy beautiful documentation to GitHub Pages with a single step.

> **Note**: This action is currently in active development. Use `@main` to get the latest features. Once stable, versioned releases (`@v1`) will be available.

## Quick Start

Deploy your documentation to GitHub Pages with a single action:

```yaml
---
name: Deploy Documentation

"on":
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - name: Build and deploy documentation
        uses: bartTC/microdocs@main
        with:
          files: |
            README.md
            CHANGELOG.md
          title: 'My Project'
```

**That's it!**

- The action automatically deploys to GitHub Pages by default
- Repository URL is automatically set from your GitHub context
- Just enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and push to main

## Setup Instructions

1. Create `.github/workflows/deploy-docs.yml` with the example above
2. Enable GitHub Pages:
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
3. Push to main - your docs will deploy automatically!

Your documentation will be available at `https://<username>.github.io/<repository>/`

## Inputs

| Input          | Required | Default          | Description                                                 |
|----------------|----------|------------------|-------------------------------------------------------------|
| `files`        | Yes      | -                | Markdown files to process (one per line or space-separated) |
| `title`        | No       | Auto-detected    | Documentation title (extracted from first H1)               |
| `output`       | No       | `index.html`     | Output HTML file path                                       |
| `template`     | No       | Default template | Path to custom HTML template                                |
| `repo-url`     | No       | Auto-detected    | Repository URL (defaults to current GitHub repo)            |
| `deploy`       | No       | `true`           | Automatically deploy to GitHub Pages                        |
| `artifact-dir` | No       | `dist`           | Directory for deployment artifacts                          |

## Usage Examples

### Basic Deployment (Most Common)

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: |
      README.md
      CHANGELOG.md
    title: 'My Project'
```

### Multiple Files

You can specify files as a multiline list or space-separated:

```yaml
# Multiline (recommended)
files: |
  README.md
  CHANGELOG.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md

# Or space-separated
files: 'README.md CHANGELOG.md CONTRIBUTING.md'
```

### Build Only (No Deployment)

To just build the documentation without deploying:

```yaml
- name: Build documentation
  uses: bartTC/microdocs@main
  with:
    files: 'README.md CHANGELOG.md'
    title: 'My Project Documentation'
    output: 'docs/index.html'
    deploy: false
```

### Custom Template

Use your own HTML template:

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: |
      README.md
      CHANGELOG.md
    template: 'templates/custom.html'
```

### Custom Repository URL

Override the automatic repository URL:

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: 'README.md'
    repo-url: 'https://github.com/myorg/myrepo'
```

### Different Output Directory

Change where the HTML file is generated:

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: 'README.md CHANGELOG.md'
    output: 'public/docs.html'
```

### Custom Artifact Directory

Change the directory used for deployment artifacts:

```yaml
- name: Build and deploy documentation
  uses: bartTC/microdocs@main
  with:
    files: 'README.md'
    artifact-dir: '_site'
```

## Complete Workflow Example

Here's a complete workflow with all options:

```yaml
---
name: Deploy Documentation

"on":
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build and deploy documentation
        uses: bartTC/microdocs@main
        with:
          files: |
            README.md
            CHANGELOG.md
            CONTRIBUTING.md
          title: 'My Awesome Project'
          template: 'templates/custom.html'
          output: 'docs/index.html'
```

## How It Works

The action performs these steps:

1. **Installs uv** - Fast Python package installer
2. **Builds documentation** - Converts Markdown files to HTML using microdocs
3. **Prepares artifacts** (if deploy is true) - Copies the generated HTML to the artifact directory
4. **Configures GitHub Pages** (if deploy is true) - Sets up GitHub Pages deployment
5. **Uploads artifacts** (if deploy is true) - Uploads the HTML to GitHub Pages
6. **Deploys** (if deploy is true) - Publishes to GitHub Pages

## Requirements

- **Repository**: Must be a GitHub repository
- **Branch**: Typically deployed from `main` or `master`
- **Permissions**: The workflow needs `pages: write` and `id-token: write` permissions
- **GitHub Pages**: Must be enabled in repository settings with source set to "GitHub Actions"

## Troubleshooting

### "pages build and deployment" failing

Make sure you've enabled GitHub Pages in your repository settings:
1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

### Permission denied errors

Ensure your workflow has the correct permissions:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Files not found

Make sure the file paths are relative to your repository root:

```yaml
# ✅ Correct
files: 'README.md'

# ❌ Wrong
files: '/README.md'
```

### Custom template not found

Ensure the template path is relative to your repository root and the file exists:

```yaml
# ✅ Correct
template: 'templates/custom.html'
```

## More Information

- [Microdocs Documentation](https://github.com/bartTC/microdocs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
