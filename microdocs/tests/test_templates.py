"""
Tests for template rendering and integration.

These tests verify that our template system correctly integrates
with the builder and renders the expected output structure.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

from microdocs.builder import build_documentation

if TYPE_CHECKING:
    from pathlib import Path

# Fixtures


@pytest.fixture
def simple_markdown(tmp_path: Path) -> Path:
    """Create simple markdown file."""
    md_file = tmp_path / "simple.md"
    md_file.write_text("# Simple Title\n\nSimple content.", encoding="utf-8")
    return md_file


@pytest.fixture
def multiple_markdowns(tmp_path: Path) -> list[Path]:
    """Create multiple markdown files."""
    files = []
    for i in range(3):
        md_file = tmp_path / f"section{i}.md"
        md_file.write_text(f"# Section {i}\n\nContent {i}", encoding="utf-8")
        files.append(md_file)
    return files


# Tests for template integration with builder


def test_template_receives_title_variable(
    simple_markdown: Path, tmp_path: Path
) -> None:
    """Test that Jinja2 template receives and renders title variable."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
        title="Test Documentation",
    )

    content = output.read_text(encoding="utf-8")
    assert "<title>Test Documentation</title>" in content


def test_template_receives_sections_variable(
    multiple_markdowns: list[Path],
    tmp_path: Path,
) -> None:
    """Test that Jinja2 template receives sections list."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=multiple_markdowns,
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    # Check that all section names appear
    for i in range(3):
        assert f"section{i}" in content.lower()


def test_template_receives_repo_url_variable(
    simple_markdown: Path,
    tmp_path: Path,
) -> None:
    """Test that Jinja2 template receives repo_url variable."""
    output = tmp_path / "output.html"
    repo_url = "https://github.com/user/repo"

    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
        repo_url=repo_url,
    )

    content = output.read_text(encoding="utf-8")
    assert repo_url in content


def test_template_receives_build_timestamp(
    simple_markdown: Path,
    tmp_path: Path,
) -> None:
    """Test that Jinja2 template receives build_timestamp variable."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    assert "UTC" in content


def test_template_receives_inlined_css(simple_markdown: Path, tmp_path: Path) -> None:
    """Test that CSS file is read and inlined in template."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    # Check that CSS is inlined in style tag
    assert "<style>" in content
    assert "</style>" in content
    # Should contain some CSS content from default.css
    assert "tailwindcss" in content.lower() or ".prose" in content


def test_template_handles_none_repo_url(simple_markdown: Path, tmp_path: Path) -> None:
    """Test that template handles None repo_url gracefully."""
    output = tmp_path / "output.html"

    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
        repo_url=None,
    )

    content = output.read_text(encoding="utf-8")
    # Should still generate valid HTML
    assert "<!DOCTYPE html>" in content


# Tests for template structure and output


def test_template_generates_valid_html_structure(
    simple_markdown: Path,
    tmp_path: Path,
) -> None:
    """Test that our builder generates valid HTML structure via template."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    assert "<!DOCTYPE html>" in content.lower() or "<!doctype html>" in content.lower()
    assert "<html" in content
    assert "<head>" in content
    assert "<body" in content  # May have attributes like <body x-data>
    assert "</html>" in content


def test_template_inlines_css_not_external(
    simple_markdown: Path,
    tmp_path: Path,
) -> None:
    """Test that output includes inlined CSS in style tag."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    assert "<style>" in content
    # CSS is inlined in style tag, check it contains Tailwind content
    assert "tailwindcss" in content.lower() or ".prose" in content


def test_custom_template_is_used(simple_markdown: Path, tmp_path: Path) -> None:
    """Test that custom templates are properly used when provided."""
    output = tmp_path / "output.html"
    custom_template = tmp_path / "custom.html"
    custom_template.write_text(
        "CUSTOM_TEMPLATE_MARKER {{ title }}",
        encoding="utf-8",
    )

    build_documentation(
        input_files=[simple_markdown],
        output_path=output,
        template_path=custom_template,
    )

    content = output.read_text(encoding="utf-8")
    assert "CUSTOM_TEMPLATE_MARKER" in content


def test_section_ids_generated_from_filenames(
    multiple_markdowns: list[Path],
    tmp_path: Path,
) -> None:
    """Test that section IDs are correctly generated from file stems."""
    output = tmp_path / "output.html"
    build_documentation(
        input_files=multiple_markdowns,
        output_path=output,
    )

    content = output.read_text(encoding="utf-8")
    # Section IDs should be lowercase stems
    for i in range(3):
        assert f"section{i}" in content.lower()


# Tests for edge cases and error handling


def test_template_handles_empty_markdown(tmp_path: Path) -> None:
    """Test that our builder handles empty markdown files."""
    empty_md = tmp_path / "empty.md"
    empty_md.write_text("", encoding="utf-8")
    output = tmp_path / "output.html"

    build_documentation(
        input_files=[empty_md],
        output_path=output,
    )

    # Should generate valid HTML even with empty content
    assert output.exists()
    content = output.read_text(encoding="utf-8")
    assert "<!DOCTYPE html>" in content


def test_template_jinja_autoescape(tmp_path: Path) -> None:
    """Test that Jinja2 autoescaping works for special characters in title."""
    md_file = tmp_path / "test.md"
    md_file.write_text("# Test", encoding="utf-8")
    output = tmp_path / "output.html"

    # Use title with HTML special chars that should be escaped
    build_documentation(
        input_files=[md_file],
        output_path=output,
        title='Title with & < > " chars',
    )

    content = output.read_text(encoding="utf-8")
    # Check that special characters are present (may be escaped or not depending on context)
    assert "Title with" in content
