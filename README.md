# TV Show Episode Tracker

A web application to track your TV show episodes and mark them as watched.

## Development

This project was intended to test new AI tools and hence was developed entirely using AI assistance through:
- **Claude 3.5 Sonnet** (Anthropic) - Primary development agent
  - Architecture design
  - Feature implementation
  - Code generation
  - Documentation
  - Bug fixes and improvements
- **Cursor IDE** - Development environment with integrated AI capabilities
  - Code editing and navigation
  - Terminal commands
  - Git operations
  - File management

All features, from initial setup to the latest enhancements, were implemented through AI pair programming, demonstrating the capabilities of modern AI assistants in full-stack development.

## Features

- Add TV shows using:
  - Direct TVMaze ID input
  - Smart search by show name
  - Year filter for search results
  - Top 8 matching results with:
    - Show name and status badge (Running/Ended)
    - Network and country information
    - Premiere year and language
    - Genre list
- Track episodes for multiple shows
- Mark episodes as watched/unwatched
- Show management:
  - Track show status (Running/Ended)
  - Toggle show visibility in Episodes view
  - Visual indicators for ignored shows
  - Filter shows by ignored/unignored status
- Episode filtering:
  - Simple "Watched" toggle to show unwatched episodes
  - Filter by show ignored/unignored status
  - Clear visual feedback for active filters
- Data management:
  - Clear all data with one click
  - Confirmation dialog for dangerous actions
  - Immediate UI feedback
- View episode air dates and times
- Track time spent watching shows
- Responsive pagination with adaptive controls:
  - Smart page selector showing current page when closed
  - Full page list with scrolling when opened
  - Browser-native dropdown behavior for optimal performance
  - Consistent styling across all states
- Persistent data storage using MongoDB
- Responsive design with Tailwind CSS
- Configurable table pagination (10, 20, or 100 items per page)
- Navigation controls for browsing through episodes
- View show details and episode lists
- Track time spent watching shows

### Episodes View
- Filter episodes by watched/unwatched status (icon changes to Circle when showing unwatched)
- Filter shows by ignored status (icon changes to Eye when showing ignored)
- Dynamic filter icons provide clear visual feedback of current state
- Active filters highlighted in green

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

2. Start the development server:
```bash
# In the root directory
npm start
# This will start both the frontend and backend
# Frontend will run on http://localhost:3000
# Backend will run on http://localhost:3001
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding Shows
1. Click the "Add Show" button in the navigation bar
2. Enter a TVMaze Show ID or search by name
3. Select a show from the search results
4. The show and its episodes will be added to your tracker

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

## Planned Features
1. Auto-refresh for Active Shows
   - Automatically update episode data for shows that aren't marked as "Ended"
   - Fetch new episodes and air dates
   - Update show status if changed
   - Option to set refresh interval

2. Import from MyEpisodes.com
   - Support CSV import from MyEpisodes.com
   - Map fields to match database schema
   - Import watched status
   - Handle duplicate entries
   - Progress indicator during import

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