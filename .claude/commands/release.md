# Release Process

Execute the complete release workflow for httpx-whackamole:

1. **Code Quality Checks**
   - Run `uvx ruff check`
   - If errors occur, run `uvx ruff check --fix --unsafe-fixes` first
   - If still errors remain, fix them manually
   - Run `uvx ruff format` to ensure consistent formatting

2. **Test Suite**
   - Run `./runtests.sh`
   - If test errors occur, STOP and notify the user immediately
   - DO NOT proceed with release if tests fail

3. **Version Bump**
   - Ask the user whether to upgrade major, minor, or micro version
   - Provide a suggestion based on the type of changes in this release
   - Update the version in both `pyproject.toml`.

4. **Changelog Update**
   - Create a Release date section in CHANGELOG.md
   - Use the bash `date` tool to determine today's date (format: YYYY-MM-DD)
   - Update and extend the links to GitHub version comparison at the bottom of the changelog

5. **Git Operations**
   - Create a git commit with the release changes
   - Create a git tag with the new version (format: vX.Y.Z)

6. **User Actions**
   - Inform the user they must manually run:
     - `uv build`
     - `uv publish`
     - `git push` (to push commits)
     - `git push --tags` (to push the created tag)
   - Wait for user confirmation that these steps are completed

7. **GitHub Release**
   - Once user confirms manual steps are done, create a GitHub release
   - Use the `gh` CLI to create the release for the created tag
   - Include the changelog data for this version in the release notes

IMPORTANT: Stop immediately if any tests fail. Do not proceed with the release.
