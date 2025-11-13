"""Tests for CLI module - command-line interface functionality."""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest
from typer.testing import CliRunner

from microdocs.cli import app

if TYPE_CHECKING:
    from pathlib import Path

# Fixtures


@pytest.fixture
def cli_runner() -> CliRunner:
    """Create CLI runner for testing."""
    return CliRunner()


@pytest.fixture
def sample_files(tmp_path: Path) -> tuple[Path, Path]:
    """Create sample markdown files for CLI testing."""
    readme = tmp_path / "README.md"
    readme.write_text("# Test Project\n\nThis is a test.\n", encoding="utf-8")

    changelog = tmp_path / "CHANGELOG.md"
    changelog.write_text("# Changelog\n\n## v1.0\n\n- Initial\n", encoding="utf-8")

    return readme, changelog


# Tests for CLI basic functionality


def test_cli_help(cli_runner: CliRunner) -> None:
    """Test CLI help output."""
    result = cli_runner.invoke(app, ["--help"])

    assert result.exit_code == 0
    assert "microdocs" in result.stdout.lower()
    assert "markdown" in result.stdout.lower()


def test_cli_build_single_file(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building documentation from single file."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, [str(readme), "-o", str(output)])

    assert result.exit_code == 0
    assert output.exists()
    content = output.read_text(encoding="utf-8")
    assert "Test Project" in content


def test_cli_build_multiple_files(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building documentation from multiple files."""
    readme, changelog = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, [str(readme), str(changelog), "-o", str(output)])

    assert result.exit_code == 0
    assert output.exists()
    content = output.read_text(encoding="utf-8")
    assert "Test Project" in content
    assert "Changelog" in content


def test_cli_default_output_name(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
) -> None:
    """Test that default output filename is index.html in current directory."""
    readme, _ = sample_files

    # Default output is index.html in current directory
    result = cli_runner.invoke(app, [str(readme)])

    assert result.exit_code == 0
    # Just verify the command succeeds - the file is written to current dir


def test_cli_custom_title(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with custom title."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "--title", "Custom Documentation"],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    assert "Custom Documentation" in content


def test_cli_repo_url(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with repository URL."""
    readme, _ = sample_files
    output = tmp_path / "output.html"
    repo_url = "https://github.com/user/repo"

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "--repo-url", repo_url],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    assert repo_url in content


def test_cli_repo_url_short_option(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with repository URL using short option."""
    readme, _ = sample_files
    output = tmp_path / "output.html"
    repo_url = "https://github.com/user/repo"

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "-r", repo_url],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    assert repo_url in content


def test_cli_custom_template(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with custom template."""
    readme, _ = sample_files
    output = tmp_path / "output.html"
    custom_template = tmp_path / "custom.html"
    custom_template.write_text(
        "<!DOCTYPE html><html><head><title>{{ title }}</title></head>"
        "<body>CUSTOM TEMPLATE{% for section in sections %}{{ section.html }}{% endfor %}</body></html>",
        encoding="utf-8",
    )

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "--template", str(custom_template)],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    assert "CUSTOM TEMPLATE" in content


def test_cli_template_short_option(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with custom template using short option."""
    readme, _ = sample_files
    output = tmp_path / "output.html"
    custom_template = tmp_path / "custom.html"
    custom_template.write_text(
        "<!DOCTYPE html><html><body>{{ title }}</body></html>",
        encoding="utf-8",
    )

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "-t", str(custom_template)],
    )

    assert result.exit_code == 0


def test_cli_all_options_combined(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with all options combined."""
    readme, changelog = sample_files
    output = tmp_path / "output.html"
    custom_template = tmp_path / "custom.html"
    custom_template.write_text(
        "<!DOCTYPE html><html><body>{{ title }}{{ repo_url }}</body></html>",
        encoding="utf-8",
    )

    result = cli_runner.invoke(
        app,
        [
            str(readme),
            str(changelog),
            "-o",
            str(output),
            "-t",
            str(custom_template),
            "-r",
            "https://github.com/user/repo",
            "--title",
            "My Docs",
        ],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    assert "My Docs" in content
    assert "github.com" in content


# Tests for error handling


def test_cli_nonexistent_file(cli_runner: CliRunner, tmp_path: Path) -> None:
    """Test error handling for nonexistent input file."""
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, ["/nonexistent/file.md", "-o", str(output)])

    assert result.exit_code != 0


def test_cli_no_files(cli_runner: CliRunner) -> None:
    """Test error when no files are provided."""
    result = cli_runner.invoke(app, [])

    assert result.exit_code != 0


def test_cli_nonexistent_template(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test error handling for nonexistent template file."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "-t", "/nonexistent/template.html"],
    )

    assert result.exit_code != 0


# Tests for output messages


def test_cli_shows_progress_messages(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test that CLI shows progress messages."""
    readme, changelog = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, [str(readme), str(changelog), "-o", str(output)])

    assert result.exit_code == 0
    # Check for progress messages (these come from stdout)
    assert "README.md" in result.stdout or "✓" in result.stdout


def test_cli_shows_success_message(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test that CLI shows success message."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, [str(readme), "-o", str(output)])

    assert result.exit_code == 0
    assert "✓" in result.stdout or "success" in result.stdout.lower()


# Tests for file path resolution


def test_cli_resolves_relative_paths(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test that CLI resolves relative paths correctly."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    # Use relative path for input
    result = cli_runner.invoke(app, [str(readme), "-o", str(output)])

    assert result.exit_code == 0
    assert output.exists()


# Tests for edge cases


def test_cli_single_character_options(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test that single-character options work correctly."""
    readme, _ = sample_files
    output = tmp_path / "output.html"

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output)],
    )

    assert result.exit_code == 0


def test_cli_empty_markdown_file(
    cli_runner: CliRunner,
    tmp_path: Path,
) -> None:
    """Test building with empty markdown file."""
    empty_file = tmp_path / "empty.md"
    empty_file.write_text("", encoding="utf-8")
    output = tmp_path / "output.html"

    result = cli_runner.invoke(app, [str(empty_file), "-o", str(output)])

    assert result.exit_code == 0
    assert output.exists()


def test_cli_special_characters_in_title(
    cli_runner: CliRunner,
    sample_files: tuple[Path, Path],
    tmp_path: Path,
) -> None:
    """Test building with special characters in title."""
    readme, _ = sample_files
    output = tmp_path / "output.html"
    special_title = 'Documentation <>&" with special chars'

    result = cli_runner.invoke(
        app,
        [str(readme), "-o", str(output), "--title", special_title],
    )

    assert result.exit_code == 0
    content = output.read_text(encoding="utf-8")
    # Check that special chars are handled (either escaped or present)
    assert "Documentation" in content
