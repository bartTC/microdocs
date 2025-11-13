"""Command-line interface for microdocs."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from microdocs.builder import build_documentation

app = typer.Typer(
    name="microdocs",
    help="Transform your Markdown files into a self-contained HTML documentation site.",
    add_completion=False,
)


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
        Path | None,
        typer.Option(
            "--template",
            "-t",
            help="Custom HTML template file",
            exists=True,
            file_okay=True,
            dir_okay=False,
            resolve_path=True,
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
) -> None:
    """
    Build HTML documentation from Markdown files.

    Examples:
        microdocs README.md CHANGELOG.md
        microdocs README.md -o docs/index.html
        microdocs README.md -r https://github.com/user/repo
        microdocs README.md --title "My Project"

    """
    build_documentation(
        input_files=files,
        output_path=output,
        template_path=template,
        repo_url=repo_url,
        title=title,
    )


def main() -> None:
    """Entry point for the CLI."""
    app()
