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
- User authentication system (Signup/Login) using email and password.
- Email verification process using 5-digit codes sent via email (using Mailtrap for development testing).
- Password strength indicator during signup.
- Secure password hashing using bcryptjs.
- JSON Web Token (JWT) for session management.
- Global authentication state management using React Context API.
- Basic route protection for authenticated pages.
- Initial TV Show Episode Tracker functionality.
- Bulk show import via CSV with flexible field mapping and progress tracking.
- Support for ignoring specific shows during import.
- Display success/failure status for imported shows in a summary dialog.
- Enhanced import functionality with skipped shows counter.
- Graceful cancellation support for show searches during import.
- Page transition animations between Episodes and Shows pages.
- Enhanced Actions Menu with improved styling and layout.
- Public-facing Home Page showcasing key features and planned additions.
- Automatic page adjustment on Shows and Episodes pages when filters reduce the total number of pages below the current page.
- User-specific show ignore status with smooth toggle transitions.
- Authentication token integration in all API requests.

---

### Changed
- Increased animation duration for table row entries.
- Refactored progress bars into a reusable component.
- Extracted reusable UI components, particularly for the import dialog.
- Improved code structure by splitting duplicate components.
- Adjusted project logo aspect ratio.
- Refactored overall code structure for better modularity and readability (ongoing).
- Modified Login Page layout: Integrated "Home" button into the main navigation bar (conditional display), removed fixed elements, fixed scrolling issues.
- Improved styling for "Technology Stack" section on the Home Page.
- Migrated show ignored status from global to user-specific while maintaining backward compatibility.
- Improved filtered shows animation transition to prevent showing all shows during filter changes.

---

### Fixed
- Issues with README setup instructions.
- Various styling inconsistencies.
- Linter errors and improved code readability.
- UI refresh issues after show import.
- Runtime errors on Shows and Episodes pages due to undefined props during initial render.
- Filter logic for ignored shows on the Episodes page.

---

### Security
- Implemented secure password hashing and JWT for authentication.
- Added requirement for essential security-related environment variables (JWT_SECRET).

---

### Removed
- Page transition animations (replaced with different animations).
- Unnecessary duplicated files and components from the `server/src` directory.

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
- Updated README, ROADMAP, and CHANGELOG to reflect authentication features.
- Updated `ROADMAP.md` with authentication details and password reset feature.
- Updated `TESTING.md` with specific authentication testing requirements.
- Updated `README.md` with Home Page details and screenshot.
- Updated `CHANGELOG.md` with recent feature additions and layout changes.

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