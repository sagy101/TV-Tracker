# Development Guide

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

This document provides detailed information about the development environment, tools, and processes used in the TrackTV project.

---

## Development Environment

- **Cursor IDE** <img src="https://img.shields.io/badge/Cursor-00A0E4?style=flat-square&logo=cursor&logoColor=white" alt="Cursor IDE" align="right" /> - Primary development environment with integrated AI capabilities
  - Code editing and navigation
  - Terminal commands
  - Git operations
  - File management
  - AI-powered code completion and suggestions

- **Codeium Windsurf** <img src="https://img.shields.io/badge/Codeium-09B6A2?style=flat-square&logo=codeium&logoColor=white" alt="Codeium" align="right" /> - Advanced UX development
  - Real-time UI preview with Cascade
  - Component-level hot reloading

---

## Styling

- **Tailwind CSS** <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" align="right" /> - Utility-first CSS framework
  - Configured with PostCSS for optimal build process
  - Automatic style rebuilding on file changes
  - Compiled styles are imported from `src/output.css`

---

## AI Assistance

<details>
<summary><strong>AI Tools Used in Development</strong> (click to expand)</summary>

<p align="center">
  <img src="https://img.shields.io/badge/Claude_3.7-5849BE?style=for-the-badge&logoColor=white" alt="Claude" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/ChatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white" alt="ChatGPT" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</p>

This project was intended to test new AI tools and hence was developed entirely using AI assistance through:

- **Claude 3.7 Sonnet** (Anthropic) <img src="https://img.shields.io/badge/Anthropic-5849BE?style=flat-square&logoColor=white" alt="Anthropic" align="right" /> - Primary development agent
  - Architecture design
  - Complex UI animations and transitions

- **OpenAI O1 Model** <img src="https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI" align="right" /> - Advanced debugging and optimization
  - Complex bug resolution
  - Performance optimization
  - State management improvements
  - Memory leak detection
  - Runtime analysis and suggestions

- **Claude 3.5 Sonnet** (Anthropic) <img src="https://img.shields.io/badge/Anthropic-5849BE?style=flat-square&logoColor=white" alt="Anthropic" align="right" /> - Initial development
  - Core feature implementation
  - Good balance of coding capabilities and quick generation.

- **ChatGPT 4o** (OpenAI) <img src="https://img.shields.io/badge/ChatGPT-74aa9c?style=flat-square&logo=openai&logoColor=white" alt="ChatGPT" align="right" /> - Branding and design
  - Application name
  - Visual identity
    - Logo design
    - Github top banner

- **Gemini 2.5 Pro** <img src="https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=google&logoColor=white" alt="Gemini" align="right" /> - Major backend refactoring and debugging
  - Large context window for understanding the entire project scope during the complex refactoring processes
  - Comprehensive review of commit history to verify and update the project changelog

All features, from initial setup to the latest enhancements, were implemented through AI pair programming, demonstrating the capabilities of modern AI assistants in full-stack development.

### Additional AI Tools for Consideration

<p align="center">
  <img src="https://img.shields.io/badge/Keploy-00A0E4?style=for-the-badge&logoColor=white" alt="Keploy" />
  <img src="https://img.shields.io/badge/Pythagora-5849BE?style=for-the-badge&logoColor=white" alt="Pythagora" />
  <img src="https://img.shields.io/badge/Dependabot-412991?style=for-the-badge&logo=github&logoColor=white" alt="Dependabot" />
  <img src="https://img.shields.io/badge/CodeQL-74aa9c?style=for-the-badge&logo=github&logoColor=white" alt="CodeQL" />
  <img src="https://img.shields.io/badge/Mintlify-8E75B2?style=for-the-badge&logoColor=white" alt="Mintlify" />
  <img src="https://img.shields.io/badge/testRigor-00A0E4?style=for-the-badge&logoColor=white" alt="testRigor" />
  <img src="https://img.shields.io/badge/mabl-5849BE?style=for-the-badge&logoColor=white" alt="mabl" />
</p>

The following AI-powered tools are recommended for enhancing my development workflow:

#### Testing and Quality Assurance
- **Keploy/Functionize** - AI-powered testing platform
  - Automated test generation
  - API testing automation
  - Integration testing

- **Pythagora** - CLI tool for automated testing
  - Records server activity
  - Generates Jest tests using GPT-4
  - Automates integration testing

- **testRigor** - AI-powered end-to-end testing
  - Natural language test creation
  - Cross-browser testing
  - Mobile testing automation
  - Self-healing tests

- **mabl** - Intelligent test automation
  - AI-driven test creation
  - Automated regression testing
  - Performance monitoring
  - Visual testing

#### Code Analysis and Security
- **CodeQL** - Advanced code analysis
  - Semantic code analysis engine
  - Security vulnerability detection
  - Bug finding capabilities
  - Free for open-source repositories

#### Dependency Management
- **Dependabot** - Automated dependency management
  - Creates PRs for version updates
  - Keeps libraries up-to-date
  - Security vulnerability alerts

#### Documentation
- **Mintlify** - Documentation automation
  - AI-powered documentation generation
  - Maintains docs from code
  - Interactive documentation site
  - Out-of-the-box documentation hosting
</details>

---

## Project Structure

<details>
<summary><strong>Codebase Organization</strong> (click to expand)</summary>

<img src="https://img.shields.io/badge/Architecture-Client_Server-blue?style=for-the-badge" alt="Architecture" />

The project follows a standard React frontend with Node.js/Express backend structure:

```
tv-tracker/
├── docs/                    # Documentation files
├── models/                  # Mongoose database models
├── public/                  # Static assets for React
├── server/                  # Backend server code
│   ├── config/              # Server configuration
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
├── src/                     # React frontend code
│   ├── components/          # Reusable React components
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── services/            # API service functions
│   └── utils/               # Utility functions
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── proxy-server.js          # Main server entry point
└── tailwind.config.js       # Tailwind CSS configuration
```
</details>

---

## Development Workflow

<p align="left">
  <img src="https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
  <img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  <img src="https://img.shields.io/badge/npm-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="NPM" />
</p>

1. **Setting Up the Development Environment**
   - Clone the repository
   - Install dependencies with `npm install`
   - Set up MongoDB database
   - Configure environment variables

2. **Running the Application in Development Mode**
   - Start MongoDB server
   - Start the backend server with `npm run server`
   - Start the frontend with `npm start`
   - Access the application at http://localhost:3000

3. **Making Changes**
   - Create a feature branch from `main`
   - Implement your changes
   - Run tests
   - Commit changes with meaningful commit messages
   - Push to your fork
   - Create a pull request

4. **Code Review Process**
   - Pull requests are reviewed by maintainers
   - CI/CD pipelines verify changes
   - Once approved, changes are merged into the main branch

---

## Debugging Tips

<p align="left">
  <img src="https://img.shields.io/badge/React_DevTools-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React DevTools" />
  <img src="https://img.shields.io/badge/MongoDB_Compass-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Compass" />
</p>

- Use React Developer Tools for frontend debugging
- MongoDB Compass for database inspection
- Logging with `console.log()` or dedicated logging libraries
- Node.js debugging with `--inspect` flag

---

## Testing

<p align="left">
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/Testing_Library-E33332?style=for-the-badge&logo=testing-library&logoColor=white" alt="Testing Library" />
  <img src="https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white" alt="Cypress" />
</p>

- Unit tests with Jest
- Component tests with React Testing Library
- API tests with Supertest
- End-to-end tests with Cypress

Run tests with:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.js
``` 