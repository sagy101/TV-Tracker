<p align="center">
  <img src="docs/images/topBanner1.2.png" alt="TrackTV" width="600">
</p>

<h1 align="center">TrackTV</h1>

<p align="center">
  A modern TV show tracking application that helps you manage and organize your watching progress
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/date_fns-F75D7E?style=for-the-badge" alt="date-fns" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/v/release/sagy101/tv-tracker?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/license-GPL--3.0-blue?style=for-the-badge" alt="License: GPL-3.0" />
  <img src="https://img.shields.io/github/issues/sagy101/tv-tracker?style=for-the-badge" alt="Open Issues" />
  <img src="https://img.shields.io/github/last-commit/sagy101/tv-tracker?style=for-the-badge" alt="Last Commit" />
  <img src="https://img.shields.io/github/workflow/status/sagy101/tv-tracker/CI?style=for-the-badge" alt="Build Status" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#development">Development</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#acknowledgments">Acknowledgments</a> •
  <a href="#contact">Contact</a>
</p>

---

## Overview

<p>
  TrackTV is a comprehensive solution for TV show enthusiasts to track and organize their watching experience. With an intuitive interface, it simplifies keeping up with shows across various platforms.
</p>

<p>
  <strong>✨ AI-Powered Development:</strong> This project demonstrates modern AI tools for software development—architecture, code implementation, and design were created through AI pair programming with Claude, GPT-4, and Gemini.
</p>

<p>
  The name "TrackTV" reflects the app's core functionality, while its logo, designed by ChatGPT, features a modern design representing the app's focus on TV tracking.
</p>

---

## Key Features

<p align="center">
  <img src="docs/images/home_page.png" alt="Home Page" width="500">
</p>

<p align="center">
  <strong>Homepage</strong> - Attractive landing page showcasing key features and planned additions.
</p>

### User Authentication
- Secure user signup with email verification
- Modern Google-style login interface with smooth animations and integrated navigation.
- "Stay signed in" functionality for persistent sessions
- Real-time email validation and password strength indicators
- JWT-based session management with configurable token expiration

### Show Management
<p align="center">
  <img src="docs/images/shows.png" alt="Shows Management" width="700">
</p>

- Track and manage your TV shows with comprehensive details:
  - Show status and progress tracking
  - Time spent watching statistics
  - Color-coded completion status (green for 100% watched)
  - Show management actions (ignore/delete)
  - Configurable filters and sorting options

### Episode Tracking
<p align="center">
  <img src="docs/images/episodes.png" alt="Episodes View" width="700">
</p>
- View and manage episodes in chronological order:
  - Color-coded status indicators
  - Detailed episode information
  - Quick watch status toggle
  - Configurable filters and pagination

### User Dashboard
<p align="center">
  <img src="docs/images/dashboard.png" alt="User Dashboard" width="700">
</p>
- Personal dashboard with comprehensive overview:
  - Watch statistics and progress tracking
  - Upcoming episodes notification
  - Recently aired unwatched episodes
  - Interactive calendar with episode air dates
  - Detailed day view for selected dates
  - Show/hide ignored shows toggle
  - Quick access to watch episode functionality

### Show Detail Page
<p align="center">
  <img src="docs/images/show_detail.png" alt="Show Detail" width="700">
</p>
- Comprehensive show information and management:
  - Complete show metadata and details
  - Season and episode breakdown with collapsible sections
  - Episode watch status tracking with one-click toggle
  - Viewing statistics and progress indicators
  - "Mark season as watched" functionality
  - Cast information with character details
  - Next episode suggestion with quick watch action
  - Show ignore/unignore toggle

### Show Search & Import
<p align="center">
  <img src="docs/images/search.png" alt="Show Search" width="700">
</p>
- Multiple ways to add shows to your collection:
  - Search by name with real-time results
  - Direct TVMaze ID lookup
  - Bulk import via CSV with field mapping

### Data Management
- Persistent storage with MongoDB
- Filter state persistence across sessions
- Backup and restore capabilities

---

## Demo

Experience TrackTV without installation via my online demo:

[Live Demo TBD](https://tv-tracker-demo.herokuapp.com/) • [Demo Video TBD](https://www.youtube.com/watch?v=demo)

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- An email sending service (e.g., Mailtrap for testing, SendGrid/Gmail for production)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/sagy101/tv-tracker.git
cd tv-tracker

# Install dependencies
npm install

# Set up environment variables
# Create your local .env file by copying the example
cp .env.example .env 

# Start the development servers (in separate terminals)

# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend client
npm start
```

<details>
<summary>Click for .env variable details</summary>

*   **Edit the `.env` file** created in the previous step.
*   **REQUIRED:**
    *   `MONGODB_URI`: Your full MongoDB connection string.
    *   `EMAIL_USER`: Username for your email sending service (e.g., Mailtrap).
    *   `EMAIL_PASS`: Password for your email sending service.
    *   `JWT_SECRET`: A long, random, secure string for signing tokens. (Generate one via: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` )
*   **Optional / Defaults:**
    *   `EMAIL_HOST` / `EMAIL_PORT`: Defaults are set for Mailtrap (check `.env.example`).
    *   `JWT_EXPIRES_IN`: Token lifetime (defaults to `90d`).
    *   `NODE_ENV`: Set to `development` or `production`.
*   **Recommendation:** For `EMAIL_*` variables during development, using Mailtrap is recommended.
    *   See Mailtrap's Getting Started Guide: [https://help.mailtrap.io/article/10-getting-started-with-mailtrap-email-sandbox](https://help.mailtrap.io/article/10-getting-started-with-mailtrap-email-sandbox)

</details>

### Detailed Setup

For comprehensive installation instructions, including platform-specific guides and troubleshooting, please refer to my [Installation Guide TBD](docs/INSTALLATION.md).

---

## Usage

### Running the Application

1.  Ensure your MongoDB server is running.
2.  Start the backend server: `npm run server`
3.  In a new terminal, start the client: `npm start`
4.  Access the application at http://localhost:3000
5.  Sign up for a new account or log in if you already have one.

### Key Operations

- **Authentication**: Sign up, verify email, log in.
- **Adding Shows**: Search by name or TVMaze ID (requires login).
- **Tracking Episodes**: Mark episodes as watched/unwatched with a single click (requires login).
- **Filtering & Sorting**: Customize your view with powerful filtering options
- **Importing Data**: Use CSV import for bulk operations
- **Data Management**: Export, backup, and restore your tracking data

---

## Architecture

TrackTV follows a modern client-server architecture:

```
tv-tracker/
├── client/                  # React frontend (Now in root `src/`)
│   ├── components/          # UI components (includes `Auth/`)
│   ├── contexts/            # React contexts (`AuthContext`)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components (`LoginPage`)
│   ├── services/            # API client services
│   └── utils/               # Utility functions
├── server/                  # Node.js/Express backend
│   ├── config/              # Server configuration (`db.js`)
│   ├── controllers/         # Request handlers (`authController.js`)
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose data models (`User.js`)
│   ├── routes/              # API route definitions (`authRoutes.js`)
│   └── utils/               # Server utilities (`email.js`)
├── models/                  # Mongoose database models (Moved from server/models? Check structure)
├── public/                  # Static assets for React
├── src/                     # React frontend code (Consolidated)
├── .env                     # Local environment variables (!!! IMPORTANT !!!)
├── .env.example             # Example environment variables
├── CHANGELOG.md             # Project changes history
├── LICENSE                  # Project License
├── package.json             # Dependencies and scripts
├── proxy-server.js          # Main server entry point
├── README.md                # This file
└── tailwind.config.js       # Tailwind CSS configuration
```

### Technology Stack

- **Frontend**: React with Hooks, Context API (`AuthContext`), React Router, Framer Motion
- **Styling**: Tailwind CSS with responsive layouts and smooth animations
- **State Management**: React Context API, useState/useEffect hooks, useMemo for performance optimization
- **UI Components**: 
  - Interactive calendars with date-fns
  - Collapsible sections with animation
  - Custom stat cards and visualization components
  - Modal dialogs and popovers
- **Backend**: Node.js with Express, Mongoose ODM
- **Database**: MongoDB
- **Authentication**: bcryptjs (hashing), jsonwebtoken (JWT), nodemailer (emails)
- **API Integration**: TVMaze API for show data
- **Build Tools**: Webpack, Babel, ESLint, Prettier (via react-scripts)

---

## Development

For detailed information about the development environment, tools, and processes, please refer to my [Development Guide](docs/DEVELOPMENT.md). This includes:

- Development environment setup
- AI tools and assistance
- Project structure
- Development workflow
- Testing and debugging
- Code quality and security tools

---

## Roadmap

See my [Roadmap](docs/ROADMAP.md) for a comprehensive overview of planned features and enhancements.

Highlights of upcoming features:
- Advanced import/export functionality
- Auto-refresh for active shows
- AI-powered show recommendations
- Enhanced customization options
- Mobile app version

---

## Contributing

I welcome contributions from the community! Please read my [Contributing Guide](docs/CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) - see the [LICENSE](LICENSE) file for details.

### License Terms in Simple Terms:
- ✅ **Free to Use**: Anyone can use, modify, and distribute this software for non-commercial purposes
- ✅ **Open Source**: All modifications must also be open source under the same license
- ✅ **Attribution**: You must give credit to the original project
- ❌ **Commercial Use**: The software cannot be used for commercial/for-profit purposes without explicit permission
- ❌ **Liability**: The software is provided "as is" without warranty of any kind

This license ensures the project remains free and open for personal and non-profit use while protecting it from unauthorized commercial exploitation.

---

## Acknowledgments

- [TVMaze API](https://www.tvmaze.com/api) for providing comprehensive TV show data
- All [contributors](https://github.com/sagy101/tv-tracker/graphs/contributors) who have helped improve the project
- The open-source community for tools and libraries that made this project possible

---

## Contact

- GitHub: [@sagy101](https://github.com/sagy101)
- Project Link: [https://github.com/sagy101/tv-tracker](https://github.com/sagy101/tv-tracker)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/sagy101">Sagy</a>
</p>
