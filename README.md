# TrackTV

A modern TV show tracking application that helps you manage and organize your watching progress.

The name "TrackTV" reflects the app's core functionality of keeping your TV show watching progress organized and up to date. The logo, designed by ChatGPT, features a modern and clean design that represents the app's focus on TV show tracking.

## Development

### Development Environment

- **Cursor IDE** - Primary development environment with integrated AI capabilities
  - Code editing and navigation
  - Terminal commands
  - Git operations
  - File management
  - AI-powered code completion and suggestions

- **Codeium Windsurf** - Advanced UX development
  - Real-time UI preview with Cascade
  - Component-level hot reloading
  - Visual CSS editing with instant feedback
  - Responsive design testing
  - Design system integration

### AI Assistance

This project was intended to test new AI tools and hence was developed entirely using AI assistance through:

- **Claude 3.7 Sonnet** (Anthropic) - Primary development agent
  - Architecture design
  - Feature implementation
  - Code generation
  - Documentation
  - Bug fixes and improvements
  - Complex UI animations and transitions

- **OpenAI O1 Model** - Advanced debugging and optimization
  - Complex bug resolution
  - Performance optimization
  - State management improvements
  - Memory leak detection
  - Runtime analysis and suggestions
  - Code quality enhancement

- **Claude 3.5 Sonnet** (Anthropic) - Initial development
  - Core feature implementation

- **ChatGPT 4** (OpenAI) - Branding and design
  - Application name
  - Logo design
  - Visual identity

- **Gemini 2.5 Pro** - Major backend refactoring and debugging
  - Refactoring of `proxy-server.js` into a modular structure and reorganizing project
  - Large context window for understanding the entire project scope during the complex refactoring process

All features, from initial setup to the latest enhancements, were implemented through AI pair programming, demonstrating the capabilities of modern AI assistants in full-stack development.

## Features & Usage

### Show Management
![Shows Management](ReadmeScreenshots/shows.png)
- Track and manage your TV shows with comprehensive details:
  - Show status and progress tracking
  - Time spent watching statistics
  - Color-coded completion status (green for 100% watched)
  - Show management actions (ignore/delete)
  - Configurable filters and sorting options:
    - Sort by name, ID, seasons, episodes, watched count, time spent, and status
    - Filter by completion status (completed/incomplete)
    - Filter ignored/unignored shows
    - Pagination with configurable items per page (10, 20, 100)

### Episode Tracking
![Episodes View](ReadmeScreenshots/episodes.png)
- View and manage episodes in chronological order:
  - Color-coded status indicators:
    - Green: Watched episodes
    - Yellow: Unwatched episodes that have aired
    - Light blue: Future episodes
  - Detailed episode information:
    - Air date and time
    - Season and episode numbers
    - Runtime in minutes
  - Quick watch status toggle
  - Configurable filters and pagination

### Show Search & Import
![Show Search](ReadmeScreenshots/search.png)
![Show ID Search](ReadmeScreenshots/showId.png)
- Multiple ways to add shows to your collection:
  1. **Search by Name:**
     - Real-time search results with detailed information
     - Network and premiere year
     - Show status indicators
     - Genre and language details
  2. **Search by TVMaze ID:**
     - Direct ID lookup
     - Instant show details
     - One-click show addition
  3. **Bulk Import via CSV:**
     - Flexible field mapping
     - Real-time progress tracking
     - Success/failure/skipped counters
     - Detailed import summary with expandable lists
     - Smart handling of duplicate shows
     - Example CSV format:
       ```csv
       showname,ignored,status,classification,country,network,runtime,airtime,timezone
       "Show Name",0,Running,Scripted,US,NBC,60,20:00,America/New_York
       ```

### Data Management
- Persistent storage with MongoDB
- Clear All Data functionality with confirmation
- Filter state persistence:
  - Watched/unwatched filter state
  - Ignored shows filter state
  - Items per page preference
  - States persist through page navigation and browser restarts

### User Interface
- Responsive design with reusable components
- Dark mode UI
- Smooth animations and transitions
- Intuitive navigation and controls
- Consistent styling across all views

## Tech Stack

- Frontend: React
- Backend: Node.js with Express
- Database: MongoDB
- Styling: Tailwind CSS
- API: TVMaze

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/sagy101/tv-tracker.git
cd tv-tracker
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

3. Set up MongoDB:
- Install MongoDB if not already installed
- Create data directory: `E:/MongoDB/tv-tracker-data/db`
- Create logs directory: `E:/MongoDB/tv-tracker-data/logs`

4. Configure environment:
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
# Default configuration:
MONGODB_URI=mongodb://localhost:27017/tv-tracker
PORT=3001
MONGODB_DATA_DIR=E:/MongoDB/tv-tracker-data/db
```

## Running the Application

1. Start MongoDB:
```bash
# Using Windows Service (recommended)
net start MongoDB

# OR using command line
mongod --config mongod.cfg
```

2. Start the server (in first terminal):
```bash
# In the root directory
npn server start
# This will start the backend server on http://localhost:3001
```

3. Start the React client (in second terminal):
```bash
# In the root directory
npm start
# This will start the frontend on http://localhost:3000
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding Shows
1. Click the "Add Show" button in the navigation bar
2. Either:
   - Enter a TVMaze Show ID for direct import
   - Search by show name and select from results
   - Import multiple shows using CSV file:
     ```csv
     showname,ignored,status,classification,country,network,runtime,airtime,timezone
     "Show Name",0,Running,Scripted,US,NBC,60,20:00,America/New_York
     ```
3. For CSV imports:
   - Progress is shown in real-time
   - Already imported shows are automatically skipped
   - Summary dialog shows success/failure/skipped counts
   - Expandable lists show details of processed shows

### Managing Shows
- Toggle show visibility using the eye icon
- Filter shows using the status toggles
- Configure items per page using the dropdown
- Use pagination controls to navigate through shows

### Tracking Episodes
- Mark episodes as watched/unwatched by clicking the checkbox
- Filter episodes using the watch status toggle
- View episode details including air dates and runtime
- Track your watching progress and time spent

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Guidelines

- Follow the existing code style and conventions
- Use meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Add appropriate documentation for new features
- Update the CHANGELOG.md file with your changes
- Test your changes thoroughly before submitting a PR

## Troubleshooting

### Common Issues

1. MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.serverStatus()"

# Verify MongoDB data directory exists and has correct permissions
ls -l E:/MongoDB/tv-tracker-data/db
```
```

2. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use nvm to switch versions if needed
nvm use 14
```

## Roadmap

1. Multi-User Support
   - User authentication and authorization system
   - Individual user profiles and preferences
   - Show sharing between users
   - Social features like show recommendations
   - Watch history privacy settings
   - User roles (admin, regular user)
   - User-specific view customization

2. Show Details Page
   - Dedicated page for each show with comprehensive information
   - Season-by-season breakdown with collapsible sections
   - Episode details including summaries and guest stars
   - Show statistics and watching patterns
   - Cast information and character details
   - Related shows recommendations
   - User notes and episode ratings
   - Progress tracking visualization

3. Code Architecture Improvements
   - Refactor components for better modularity
   - Implement atomic design principles
   - Create reusable UI components library
   - Improve state management with Redux/Context
   - Add comprehensive test coverage
   - Implement proper TypeScript types
   - Better error handling and logging
   - Performance optimizations

4. AI Show Assistant
   - Natural language interface for show queries
   - Personalized show recommendations based on watching history
   - Viewing pattern analysis and insights
   - Watch time predictions and scheduling suggestions
   - Show similarity analysis
   - Mood-based recommendations
   - Automated show categorization
   - Viewing habit reports and statistics

5. Auto-refresh for Active Shows
   - Automatically update episode data for shows that aren't marked as "Ended"
   - Fetch new episodes and air dates
   - Update show status if changed
   - Option to set refresh interval

6. Import/Export Features
   - Support CSV import from MyEpisodes.com
   - Import from other popular tracking services
   - Export data in various formats
   - Backup and restore functionality
   - Batch show adding
   - Cross-platform sync

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TVMaze API](https://www.tvmaze.com/api) for providing TV show data
- [Create React App](https://create-react-app.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/)

## Contact

Project Link: [https://github.com/sagy101/tv-tracker](https://github.com/sagy101/tv-tracker)

## Support

If you find this project helpful, please give it a ⭐️!

## Code Architecture

The application follows a standard client-server architecture:

*   **Frontend (React):** Handles user interface, state management, and interaction. Makes API calls to the backend.
*   **Backend (Node.js/Express):** Acts as a proxy to the TVMaze API and manages the database persistence layer.
    *   **Configuration (`server/config`):** Handles setup like database connections (`db.js`).
    *   **Routes (`server/routes`):** Defines API endpoints for different resources (shows, episodes, admin, refresh) using Express Router.
    *   **Utilities (`server/utils`):** Contains helper functions, such as fetching data from TVMaze (`tvmaze.js`) and data refresh logic (`refresh.js`).
    *   **Models (`models`):** Mongoose schemas defining the structure for Shows and Episodes in the database.
    *   **Server Entry Point (`proxy-server.js`):** Initializes the Express app, connects middleware, mounts routers, and starts the server.
