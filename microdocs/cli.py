"""Command-line interface for microdocs."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from microdocs.builder import build_documentation

templates_dir = Path(__file__).parent / "templates"

app = typer.Typer(
    name="microdocs",
    help="Transform your Markdown files into a self-contained HTML documentation site.",
    add_completion=False,
)


def get_available_templates() -> list[str]:
    """Get list of available built-in template names."""
    if not templates_dir.exists():
        return []
    return [
        d.name
        for d in templates_dir.iterdir()
        if d.is_dir() and (d / f"{d.name}.html").exists()
    ]


def resolve_template_path(template: str | None) -> Path | None:
    """
    Resolve template name or path to a full Path.

    If template is a built-in template name, resolves to the built-in path.
    Otherwise, treats it as a custom file path.
    """
    if template is None:
        return None

    # Check if it's a built-in template name
    template_path = templates_dir / template / f"{template}.html"
    if template_path.exists():
        return template_path

    # Otherwise, treat as custom path
    return Path(template)


@app.command()
def build(
    files: Annotated[
        list[Path],
        typer.Argument(
            help="Markdown files to convert (e.g., README.md CHANGELOG.md)",
            exists=True,
            file_okay=True,
            dir_okay=False,
            resolve_path=True,
        ),
    ],
    output: Annotated[
        Path,
        typer.Option(
            "--output",
            "-o",
            help="Output HTML file path",
            resolve_path=True,
        ),
    ] = Path("index.html"),
    template: Annotated[
        str | None,
        typer.Option(
            "--template",
            "-t",
            help=f"Template name or custom template file path. Available templates: {', '.join(get_available_templates())}",
        ),
    ] = None,
    repo_url: Annotated[
        str | None,
        typer.Option(
            "--repo-url",
            "-r",
            help="Repository URL to link in the navigation",
        ),
    ] = None,
    title: Annotated[
        str | None,
        typer.Option(
            "--title",
            help="Documentation title (falls back to first H1 in first file)",
        ),
    ] = None,
    footer: Annotated[
        str | None,
        typer.Option(
            "--footer",
            "-f",
            help="Custom footer text (defaults to build timestamp)",
        ),
    ] = None,
) -> None:
    """
    Build HTML documentation from Markdown files.

    Examples:
        microdocs README.md CHANGELOG.md
        microdocs README.md -o docs/index.html
        microdocs README.md -t default
        microdocs README.md -t /path/to/custom-template.html
        microdocs README.md -r https://github.com/user/repo
        microdocs README.md --title "My Project"
        microdocs README.md --footer "v1.1 2025-01-01"

    """
    build_documentation(
        input_files=files,
        output_path=output,
        template_path=resolve_template_path(template),
        repo_url=repo_url,
        title=title,
        footer=footer,
    )


def main() -> None:
    """Entry point for the CLI."""
    app()
