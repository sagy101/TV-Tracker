# Contributing to TrackTV

<p align="center">
  <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=for-the-badge" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge" alt="Code Style" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</p>

Thank you for considering contributing to TrackTV! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Development Environment](#development-environment)
  - [Finding Issues to Work On](#finding-issues-to-work-on)
- [Contribution Workflow](#contribution-workflow)
  - [Branch Naming Convention](#branch-naming-convention)
  - [Commit Message Guidelines](#commit-message-guidelines)
  - [Pull Request Process](#pull-request-process)
  - [Code Review Process](#code-review-process)
- [Development Guidelines](#development-guidelines)
  - [Code Style](#code-style)
  - [Testing](#testing)
  - [Documentation](#documentation)
- [Release Process](#release-process)
- [Issue Reporting](#issue-reporting)
- [Communication](#communication)

---

## Code of Conduct

I am committed to providing a welcoming and inclusive experience for everyone. By participating in this project, you agree to abide by my Code of Conduct.

In short: Be respectful, considerate, and constructive in all interactions. Harassment, discrimination, and disruptive behavior are not tolerated.

---

## Getting Started

### Development Environment

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/tv-tracker.git`
3. Add the upstream repository: `git remote add upstream https://github.com/sagy101/tv-tracker.git`
4. Install dependencies: `npm install`
5. Set up your development environment following the instructions in [DEVELOPMENT.md](./DEVELOPMENT.md)

### Finding Issues to Work On

- Check the [Issues](https://github.com/sagy101/tv-tracker/issues) tab for open tasks
- Look for issues labeled `good first issue` if you're new to the project
- Issues labeled `help wanted` are actively seeking contributors
- Comment on an issue to express your interest before starting work

---

## Contribution Workflow

### Branch Naming Convention

Use the following format for branch names:

- `feature/short-description` - For new features
- `bugfix/issue-description` - For bug fixes
- `docs/what-changed` - For documentation updates
- `refactor/component-name` - For code refactoring
- `test/what-tested` - For adding or updating tests

Example: `feature/import-export`

<details>
<summary><strong>Commit Message Guidelines</strong> (click to expand)</summary>

I follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code functionality (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, etc.

Examples:
- `feat(import): add CSV import functionality`
- `fix(episodes): fix episode sorting issue`
- `docs(readme): update installation instructions`
</details>

### Pull Request Process

1. Update your local repository: `git fetch upstream`
2. Create a new branch from the latest main: `git checkout -b feature/amazing-feature upstream/main`
3. Make your changes, committing regularly with meaningful messages
4. Push your changes to your fork: `git push origin feature/amazing-feature`
5. Create a Pull Request via the GitHub interface
6. Update your PR based on feedback until it's approved and merged

### Code Review Process

All submissions require review before being merged. The review process includes:

1. Automated checks (CI/CD, linting, tests)
2. Code review by at least one maintainer
3. Possible request for changes or additional information
4. Approval and merge by a maintainer

---

## Development Guidelines

<details>
<summary><strong>Code Style</strong> (click to expand)</summary>

<p align="left">
  <img src="https://img.shields.io/badge/eslint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E" alt="Prettier" />
</p>

- Use ESLint and Prettier for code formatting
- Run `npm run lint` before submitting your PR
- Follow existing code patterns and practices
- Use meaningful variable and function names
- Write clear, concise comments for complex logic
- Use React functional components with hooks
- Follow the project structure established in existing files
</details>

### Testing

- Write tests for new features and bug fixes
- Maintain or improve test coverage
- Run existing tests to ensure your changes don't break anything: `npm test`
- Write both unit and integration tests when applicable

### Documentation

- Update documentation to reflect your changes
- Add JSDoc comments to functions and components
- Update the README.md if necessary
- Create or update [documentation](./docs) for major features

---

## Release Process

1. Maintainers will periodically create releases from the main branch
2. Version numbers follow [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)
3. A changelog is maintained via [CHANGELOG.md](../CHANGELOG.md)
4. Release notes detail new features, bug fixes, and breaking changes

---

## Issue Reporting

When reporting issues, please use the provided issue templates and include:

- A clear, descriptive title
- Detailed steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots or recordings (if applicable)
- Environment information (OS, browser, application version)
- Any additional context that might help

---

## Communication

<p align="left">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  <img src="https://img.shields.io/badge/GitHub_Discussions-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Discussions" />
</p>

- [GitHub Issues](https://github.com/sagy101/tv-tracker/issues) for bug reports and feature requests
- [GitHub Discussions](https://github.com/sagy101/tv-tracker/discussions) for questions and community interaction
- For sensitive issues, contact the maintainers directly

---

Thank you for contributing to TrackTV! Your time and expertise help make this project better for everyone. 