# TrackTV

A modern TV show tracking application that helps you manage and organize your watching progress.

The name "TrackTV" reflects the app's core functionality of keeping your TV show watching progress organized and up to date. The logo, designed by ChatGPT, features a modern and clean design that represents the app's focus on TV show tracking.

## Development

This project was intended to test new AI tools and hence was developed entirely using AI assistance through:
- **Claude 3.7 Sonnet** (Anthropic) - Primary development agent
  - Architecture design
  - Feature implementation
  - Code generation
  - Documentation
  - Bug fixes and improvements
  - Complex UI animations and transitions
- **Claude 3.5 Sonnet** (Anthropic) - Initial development
  - Core feature implementation
- **ChatGPT 4** (OpenAI) - Branding and design
  - Application name
  - Logo design
  - Visual identity
- **Cursor IDE** - Development environment with integrated AI capabilities
  - Code editing and navigation
  - Terminal commands
  - Git operations
  - File management

All features, from initial setup to the latest enhancements, were implemented through AI pair programming, demonstrating the capabilities of modern AI assistants in full-stack development.

## Features

- Track your watched episodes across multiple TV shows
- Import shows by name or TVMaze ID
- Enhanced bulk import functionality:
  - Import shows from CSV files with flexible field mapping
  - Real-time progress tracking with success/failure/skipped counters
  - Detailed import summary with expandable lists
  - Smart handling of duplicate shows
  - Batch processing with rate limiting
  - Clear visual feedback throughout the process
- Filter and sort shows and episodes:
  - Sort shows by name, ID, seasons, episodes, watched count, time spent, and status
  - Filter by watched/unwatched episodes
  - Filter by show completion status
  - Filter ignored/unignored shows
- Pagination with configurable items per page
- Show statistics:
  - Total episodes watched
  - Time spent watching
  - Progress tracking
- Data persistence with MongoDB
- Responsive design with reusable components
- Dark mode UI

## Screenshots

### Episodes View
![Episodes View](ReadmeScreenshots/episodes.png)
The Episodes view displays your TV show episodes in chronological order. It features:
- Color-coded episode status (green for watched, yellow for unwatched aired, blue for upcoming)
- Air date and time information
- Episode details including season, number, and runtime
- Quick watch status toggle
- Configurable filters and pagination

### Shows Management
![Shows Management](ReadmeScreenshots/shows.png)
The Shows page provides a comprehensive overview of your TV shows:
- Show details including status and progress
- Time spent watching statistics
- Show management actions (ignore/delete)
- Color-coded completion status
- Configurable filters and sorting options

### Show Search
![Show Search](ReadmeScreenshots/search.png)
The search interface allows you to find shows easily:
- Real-time search results
- Detailed show information
- Network and premiere year
- Show status indicators
- Genre and language details

### Show ID Search
![Show ID Search](ReadmeScreenshots/showId.png)
Direct ID search provides a quick way to add shows:
- Support for TVMaze ID lookup
- Instant show details
- One-click show addition
- Clear error handling

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

2. Start the proxy server (in first terminal):
```bash
# In the root directory
node proxy-server.js
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

2. Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

3. Node.js Version Issues
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

## Known Issues

1. Page Transition Animation
   - When navigating from Episodes to Shows page, there's occasionally a brief content shift before the animation completes. This will be addressed in a future update.

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