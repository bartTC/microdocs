"""Microdocs — Transform your Markdown files into a self-contained HTML documentation site."""

from __future__ import annotations

from importlib import metadata

from microdocs.cli import main

__version__ = metadata.version("microdocs")
__author__ = "Martin Mahner"
__all__ = ["__author__", "__version__", "main"]
