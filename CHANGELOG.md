# Changelog

All notable changes to TrackTV will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<p align="center">
  <img src="https://img.shields.io/badge/Keep%20a%20Changelog-遵守-brightgreen.svg?style=for-the-badge" alt="Keep a Changelog" />
  <img src="https://img.shields.io/badge/Semantic%20Versioning-2.0.0-blue?style=for-the-badge" alt="Semantic Versioning" />
</p>

---

## [Unreleased]

### Added
- Initial TV Show Episode Tracker functionality.
- Bulk show import via CSV with flexible field mapping and progress tracking.
- Support for ignoring specific shows during import.
- Display success/failure status for imported shows in a summary dialog.
- Enhanced import functionality with skipped shows counter.
- Graceful cancellation support for show searches during import.
- Page transition animations between Episodes and Shows pages.
- Enhanced Actions Menu with improved styling and layout.

---

### Changed
- Increased animation duration for table row entries.
- Refactored progress bars into a reusable component.
- Extracted reusable UI components, particularly for the import dialog.
- Improved code structure by splitting duplicate components.
- Adjusted project logo aspect ratio.
- Refactored overall code structure for better modularity and readability (ongoing).

---

### Fixed
- Issues with README setup instructions.
- Various styling inconsistencies.
- Linter errors and improved code readability.
- UI refresh issues after show import.

---

### Removed
- Page transition animations (replaced with different animations).

---

### Documentation
- Added comprehensive installation, setup, and usage instructions to README.
- Included information about the development environment and AI tools used.
- Updated README styling, structure, and added screenshots.
- Fixed incorrect commands and instructions in README.
- Organized documentation images into a dedicated `docs/images` directory.
- Added initial TODO/Roadmap section (now superseded by `ROADMAP.md`).
- Updated CHANGELOG based on commit history.
- Removed obsolete `ReadmeScreenshots` directory.

---

<!-- Add previous version sections here if/when tags are created -->
<!--
## [1.0.0] - YYYY-MM-DD

<details>
<summary><strong>Click to expand</strong></summary>

### Added
- Initial release features...

</details>
-->

---

<!-- Link Definitions -->
[Unreleased]: https://github.com/sagy101/tv-tracker/compare/2b76f9766c610a2f341892af05c4e13ed2d59afc...HEAD 