# Development Guide

This document provides detailed information about the development environment, tools, and processes used in the TrackTV project.

## Development Environment

- **Cursor IDE** - Primary development environment with integrated AI capabilities
  - Code editing and navigation
  - Terminal commands
  - Git operations
  - File management
  - AI-powered code completion and suggestions

- **Codeium Windsurf** - Advanced UX development
  - Real-time UI preview with Cascade
  - Component-level hot reloading

## Styling

- **Tailwind CSS** - Utility-first CSS framework
  - Configured with PostCSS for optimal build process
  - Automatic style rebuilding on file changes
  - Compiled styles are imported from `src/output.css`

## AI Assistance

This project was intended to test new AI tools and hence was developed entirely using AI assistance through:

- **Claude 3.7 Sonnet** (Anthropic) - Primary development agent
  - Architecture design
  - Complex UI animations and transitions

- **OpenAI O1 Model** - Advanced debugging and optimization
  - Complex bug resolution
  - Performance optimization
  - State management improvements
  - Memory leak detection
  - Runtime analysis and suggestions

- **Claude 3.5 Sonnet** (Anthropic) - Initial development
  - Core feature implementation
  - Good balace of good coding and quick generation.

- **ChatGPT 4** (OpenAI) - Branding and design
  - Application name
  - Logo design
  - Visual identity

- **Gemini 2.5 Pro** - Major backend refactoring and debugging
  - Refactoring of `proxy-server.js` into a modular structure and reorganizing project
  - Large context window for understanding the entire project scope during the complex refactoring process

All features, from initial setup to the latest enhancements, were implemented through AI pair programming, demonstrating the capabilities of modern AI assistants in full-stack development.

## Project Structure

The project follows a standard React frontend with Node.js/Express backend structure:

```
tv-tracker/
├── docs/                    # Documentation files
├── models/                  # Mongoose database models
├── public/                  # Static assets for React
├── ReadmeScreenshots/       # Screenshots for documentation
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

## Development Workflow

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

## Debugging Tips

- Use React Developer Tools for frontend debugging
- MongoDB Compass for database inspection
- Logging with `console.log()` or dedicated logging libraries
- Node.js debugging with `--inspect` flag

## Testing

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