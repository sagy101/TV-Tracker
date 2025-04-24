# Development Guide

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/date_fns-F75D7E?style=for-the-badge" alt="date-fns" />
</p>

This document provides detailed information about the development environment, tools, and processes used in the TrackTV project.

---

## Development Environment

- **Cursor IDE** <img src="https://img.shields.io/badge/Cursor-00A0E4?style=flat-square&logo=cursor&logoColor=white" alt="Cursor IDE" align="right" /> - Desktop-based development environment with integrated AI capabilities
  - Code editing and navigation
  - Integrated terminal
  - Git operations
  - Local file management
  - AI-powered code completion and suggestions

- **Firebase Studio** <img src="https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase Studio" align="right" /> - Agentic, cloud-based development environment (formerly Project IDX)
  - Accessible directly in the browser
  - Integrated AI agents for assistance
  - Tools to prototype, build, test, and publish full-stack apps
  - Unified platform for the development lifecycle

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
├── models/                  # Mongoose database models (User.js, Show.js, Episode.js)
├── public/                  # Static assets for React
├── server/                  # Backend server code
│   ├── config/              # Server configuration (db.js)
│   ├── controllers/         # Request handlers (authController.js, showController.js, etc.)
│   ├── routes/              # API routes (authRoutes.js, showRoutes.js, etc.)
│   └── utils/               # Utility functions (email.js)
├── src/                     # React frontend code
│   ├── components/          # Reusable React components (Auth/, ActionsMenu/, etc.)
│   ├── contexts/            # React context providers (AuthContext.js)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components (LoginPage.jsx, Shows.jsx, Episodes.jsx)
│   ├── services/            # API service functions (Optional)
│   └── utils/               # Utility functions
├── .env                     # Local environment variables (!!! IMPORTANT !!!)
├── .env.example             # Example environment variables
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
   - **Windows Automated Setup:**
     - Use `setup.bat` (Command Prompt) or `setup.ps1` (PowerShell, recommended) located in the project root. Run as Administrator.
     - These scripts handle Node.js (via nvm-windows), local MongoDB installation, dependency installation (`npm install`), and `.env` file creation (with `MONGODB_URI` defaulted to local instance).
     - After running the script, you can edit `.env` to switch `MONGODB_URI` to your MongoDB Atlas cluster if preferred.
     - The `MONGODB_DATA_DIR` and `MONGODB_LOG_DIR` variables in `.env` are used by these scripts to configure the *local* MongoDB instance via `mongod.cfg`. They are not needed if connecting to Atlas.
   - **Manual Setup (All Platforms):**
     - Clone the repository.
     - Install Node.js and npm/yarn.
     - **Choose Database:** Decide whether to use a local MongoDB instance or MongoDB Atlas (cloud).
       - If local: Install MongoDB (v4.4+) and ensure it's running.
       - If Atlas: Create a cluster and get the connection string.
     - Install dependencies with `npm install`.
     - Create `.env` from `.env.example`.
     - Configure `MONGODB_URI` in `.env` for your chosen database (local or Atlas).
     - Configure other required `.env` variables (Email, JWT Secret).

2. **Running the Application in Development Mode**
   - Ensure your target database is accessible (local MongoDB server running OR Atlas connection configured).
   - Start the backend server: `npm run server`
   - Start the frontend: `npm start`
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

### Technology Stack

- **Frontend**: React with Hooks, Context API (`AuthContext`), React Router, Framer Motion for animations
- **Styling**: Tailwind CSS with modern form designs and responsive layouts
- **Backend**: Node.js with Express, Mongoose ODM
- **Database**: MongoDB
- **Authentication**: 
  - bcryptjs for secure password hashing
  - JWT with configurable expiration times (short for regular sessions, long for "Remember Me")
  - Dual storage strategy (localStorage/sessionStorage) based on session preferences
  - Email validation and verification
- **State Management**:
  - React Context API for global state
  - useState/useEffect hooks for component-level state
  - useMemo for performance optimization of derived data
  - useCallback for optimized event handling
- **Date Management**: 
  - date-fns for calendar implementation
  - Date parsing, formatting, and manipulation
  - Date range calculations for upcoming/recent episodes
- **API Integration**: TVMaze API for show data
- **Build Tools**: Webpack, Babel, ESLint, Prettier (via react-scripts) 

## Authentication Implementation Details

### Stay Signed In Functionality

The application implements a "Stay signed in" feature using a dual-storage approach:

1. **Frontend Storage Strategy:**
   - When "Stay signed in" is checked:
     - Auth token stored in `localStorage` (persists between browser sessions)
   - When not checked:
     - Auth token stored in `sessionStorage` (cleared when browser tab closes)

2. **Backend Token Expiration:**
   - Uses environment variables for configurable token lifetimes:
     - `JWT_EXPIRES_IN`: Default token lifetime (24h) for regular sessions
     - `JWT_REMEMBER_ME_EXPIRES_IN`: Extended token lifetime (30d) for "Remember Me" sessions
   - Token type is determined by the `rememberMe` parameter sent during login

3. **Implementation:**
   - `AuthContext.js`: Manages token storage selection and authentication state
   - `LoginForm.jsx`: Handles the checkbox UI and sends preference to the backend
   - `authController.js`: Adjusts JWT expiration time based on login preference

This approach provides a balance between security and convenience, allowing users to choose their preferred login persistence behavior.

### Form Animations

The authentication system uses Framer Motion to create smooth transitions between the sign-in and create account forms:

1. **Slide Animation:**
   - Signing in → Creating account: Current form slides out left while new form slides in from right
   - Creating account → Signing in: Current form slides out right while new form slides in from left
   - Uses spring physics for natural movement (`stiffness: 350, damping: 30`)

2. **Fade Animation:**
   - Page title and form elements fade in/out during transitions
   - "Already have an account?" / "Don't have an account?" text smoothly transitions

3. **Implementation:**
   - Uses `AnimatePresence` to handle unmounting animations
   - Custom animation variants defined in `LoginPage.jsx`
   - Dynamically adjusts container size based on active form

4. **Performance Considerations:**
   - Animations are kept short (0.2-0.25s) for responsiveness
   - Containers properly sized to prevent unnecessary layout shifts

This creates a polished, app-like experience that guides users smoothly between authentication states. 

## Recent Updates (as of [Current Date])

*   **Major Mobile UI Overhaul:**
    *   Implemented fully responsive navigation using a hamburger menu on smaller screens.
    *   Refactored Episodes, Shows, and Show Detail pages to use card-based layouts on mobile for better readability.
    *   Improved dashboard layout density and calendar display on mobile devices.
    *   Adjusted HomePage layout and trending shows display for mobile.
*   **API Refactoring:**
    *   Centralized all frontend API calls into `src/api.js`.
    *   Configured API base URL using `NEXT_PUBLIC_API_URL` environment variable for deployment flexibility.
    *   Improved API response handling and error management.
