# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2024-04-10

### Fixed
- Fixed Tailwind CSS styling issues by properly importing the compiled output.css file
- Configured Tailwind CSS build process to watch for changes and automatically rebuild styles

### Added
- N/A

### Changed
- **Major Refactor:** Split the monolithic `proxy-server.js` into a modular backend structure:
  - Created `server/config/db.js` for database connection logic.
  - Created `server/utils/tvmaze.js` for the TVMaze API fetch helper.
  - Created `server/utils/refresh.js` for show/episode update logic and helpers.
  - Created `server/routes/shows.js` for all show-related API endpoints.
  - Created `server/routes/episodes.js` for all episode-related API endpoints.
  - Created `server/routes/refresh.js` for the show refresh endpoint (`PUT /api/refresh/shows`).
  - Created `server/routes/admin.js` for administrative endpoints (`DELETE /api/admin/clear-all`).
  - Updated `proxy-server.js` (main server file) to import modules, define middleware (CORS, JSON), mount routers, and include centralized error handling.
- Updated frontend API calls in `src/App.js` to use the new backend endpoint paths (`/api/admin/clear-all`, `/api/refresh/shows`).
- Fixed backend server port configuration to prevent conflicts with the frontend development server.
- Improved separation of concerns and code organization in the backend.

### Removed
- N/A

### Fixed
- Resolved `ECONNREFUSED` errors caused by server startup conflicts (port usage) and incorrect backend structure after initial refactor attempt.
- Fixed `404 Not Found` errors for "Clear All Data" and "Refresh Shows" buttons by correcting the API paths called by the frontend.

## [1.1.0] - 2024-04-09

### Added
- Application rebranding:
  - New name "TrackTV" replacing "ShowSync"
  - New logo designed by ChatGPT with proper aspect ratio
  - Updated visual identity throughout the application
  - Consistent branding across all pages
- Show ignore functionality:
  - Toggle button to mark shows as ignored
  - Filter to show all/active/ignored shows
  - Visual indication of ignored shows in table
  - Tooltips for action buttons
  - Automatic filtering of ignored shows in Episodes view
- Pagination for Shows page with configurable items per page (10, 20, 100 lines)
- Add Show form moved to Shows page for better user experience
- Adaptive pagination controls on Shows page:
  - Stick to viewport when enough space is available
  - Move to page bottom when viewport is too small
  - Hide when content fits viewport
- Shows count display and page navigation
- Adaptive pagination controls on Episodes page:
  - Stick to viewport when enough space is available
  - Move to page bottom when viewport is too small
  - Hide when content fits viewport
- Smart positioning of pagination controls based on content and header height
- Responsive pagination layout that adapts to viewport size
- Table pagination with configurable items per page (10, 20, 100 lines)
- Navigation controls for moving between pages
- Page size selector above the episodes table
- Current page indicator and total pages display
- MongoDB integration for persistent data storage
- Custom data directory configuration at `E:/MongoDB/tv-tracker-data`
- Environment configuration files (.env and .env.example)
- Improved error handling for API responses
- Proper port configuration (React app on 3000, Proxy server on 3001)
- Clear All Data functionality
  - Added red warning button in top navigation bar
  - Confirmation dialog with clear explanation of the action
  - Visual feedback with Trash2 icon
  - Immediate UI update after clearing data
- Filter state persistence:
  - Watched/unwatched filter state saved between sessions
  - Ignored shows filter state preserved
  - Items per page preference remembered
  - States persist through page navigation and browser restarts
- Episode runtime information:
  - New column showing episode duration in minutes
  - Displays "N/A" for episodes without runtime data
  - Runtime data fetched from TVMaze API
  - Stored in MongoDB for persistence
- Items per page selector added to Shows page:
  - Matches Episodes page functionality
  - Options for 10, 20, or 100 shows per page
  - Setting persists between sessions
  - Automatically resets to first page when changed
- Shows page ignore filter persistence:
  - Filter state saved in localStorage
  - Remembers last selected state between sessions
  - Persists through page navigation and browser restarts
  - Consistent with Episodes page filter behavior
- Enhanced show search functionality:
  - Support for both TVMaze IDs and show names
  - Search results with show details
  - Network and premiere year information
  - Interactive show selection interface
  - Automatic handling of exact ID matches
  - Improved error handling and feedback
- Year filter for show search:
  - Dynamic year dropdown based on search results
  - Filter shows by premiere year
  - Shows count for filtered results
  - Auto-updates as you type
  - Clears when closing drawer
- Show status column in Shows table:
  - Visual indicators for Running/Ended status
  - Color-coded badges for different statuses
- Enhanced search results:
  - Increased to 8 results per search
  - Added show language indicator
  - Improved layout with bullet separators
- Enhanced search results display:
  - Show status badges (Running/Ended/Unknown)
  - Network and country information
  - Premiere year and language
  - Genre list
  - Limited to 8 results for better focus
  - Clean, organized layout with bullet separators
- Unified show search experience:
  - Consistent search results display for both ID and name searches
  - Show details visible when searching by ID
  - Single-click show addition from search results
  - Removed separate Add button for cleaner interface
- Dynamic filter labels:
  - Labels now change to reflect current filter state
  - "Watched" changes to "Unwatched" when showing unwatched episodes
  - "Unignored Shows" changes to "All Shows" when showing all shows
  - Consistent behavior across Episodes and Shows pages
  - Labels match tooltip text for better clarity
- Automatic episode sorting:
  - Episodes now automatically sorted by air date and time
  - TBA episodes appear at the end of the list
  - Consistent chronological ordering in Episodes view
  - Time-based sorting within same-day episodes
- Enhanced episode status visualization:
  - Green background for watched episodes
  - Yellow background for unwatched episodes that have aired
  - Light blue background for future episodes
  - Clear visual distinction between past and upcoming episodes
  - Consistent color scheme with overall design
- Show completion status visualization:
  - Green background for fully watched shows (100% episodes watched)
  - Consistent color scheme with episode status
  - Visual feedback for show progress
  - Instant recognition of completed shows
- Shows page completed filter:
  - New filter to show only 100% watched shows
  - Toggle between all shows and completed shows
  - Visual feedback with Circle/CheckCircle icons
  - Filter state persists between sessions
  - Consistent styling with other filters
- Shows page incomplete filter:
  - New filter to show only incomplete shows (not 100% watched)
  - Toggle between all shows and incomplete shows
  - Visual feedback with Circle/CheckCircle icons
  - Filter state persists between sessions
  - Consistent styling with other filters
- Page transition animations:
  - Smooth slide animations between Episodes and Shows pages
  - Uses framer-motion library for reliable animations
  - Coordinated enter/exit animations with proper timing
  - Contained transitions that preserve layout
  - Optimized performance with tween animations
  - Proper sequencing with AnimatePresence component
- Row animations for better user experience:
  - Smooth fade and height transitions when adding/removing rows
  - 0.4 second animation duration for clear visibility
  - Consistent animations across both Episodes and Shows views
  - AnimatePresence wrapper for proper exit animations
  - Framer Motion integration for smooth transitions
- Bulk show import functionality:
  - CSV file import support
  - Flexible field mapping through header row
  - Support for show names and TVMaze IDs
  - Optional fields for show status, classification, and more
  - Example format provided in import dialog
  - Dedicated import dialog component
- Enhanced cancellation handling:
  - Backend support for client disconnections using AbortController
  - Frontend cancellation handling for search operations
  - Special 499 status code for client-initiated cancellations
  - Improved error handling to differentiate cancellations from other errors
  - Logging of search cancellations in both frontend and backend
  - Clean state management for cancelled operations
- Enhanced import functionality:
  - Interactive success/failure counts with dropdown lists
  - Visual indicators for successful and failed imports
  - Expandable lists showing all found and failed shows
  - Color-coded success (green) and failure (red) sections
  - Empty state messages when no shows are found/failed
  - Improved visual feedback during import process
  - Real-time tracking of import progress
  - Detailed view of search results and failures
- Shows table sorting functionality:
  - Clickable column headers for sorting
  - Sort by Series Name, TVMaze ID, Seasons, Episodes, Watched, Time Spent, and Status
  - Visual indicators (arrows) showing sort direction
  - Automatic re-sorting when data changes
  - Persists current sort column and direction
  - Smooth animations during re-sorting
  - Hover effects on sortable headers
- Reusable UI components for better maintainability:
  - StatusList component for displaying success/failure lists with expandable details
  - ProgressBar component with status text, counters, and visual progress
  - Consistent styling and behavior across components
  - Improved code reusability and maintainability
  - Better user feedback during operations
- Enhanced bulk show import functionality:
  - Interactive import dialog with progress tracking
  - Real-time success/failure/skipped counters
  - Detailed import summary with expandable lists
  - Skips shows that are already in the database
  - Clear visual feedback during import process
  - Batch processing with progress indicators
  - Proper error handling and status messages
  - Smooth transition between import steps

### Changed
- Updated application name in browser tab and tooltips to "TrackTV"
- Improved animation performance by reducing duration from 500ms to 250ms for smoother transitions
- Removed Add Show form from Episodes page
- Enhanced Shows table with ignore functionality
- Improved show filtering options
- Added visual feedback for ignored shows
- Episodes list now automatically filters out ignored shows
- Relocated Add Show form from Episodes to Shows page
- Improved Shows page layout with integrated show management
- Shows page layout updated with pagination controls
- Enhanced pagination controls with adaptive positioning on both pages
- Improved viewport size detection for pagination controls
- Added minimum content height requirements for table display
- Improved table layout with better spacing
- Episodes and Shows tables now show paginated results
- Enhanced episode filtering with dropdown selection
- Added items per page configuration
- Migrated from localStorage to MongoDB for data persistence
- Updated API endpoints to work with MongoDB
- Enhanced error logging and validation
- Improved API response handling with better error messages
- Simplified filter UI in both Shows and Episodes pages
  - Replaced dropdown menus with simple toggle buttons
  - Added clear labels next to filter icons
  - Shows page: Single toggle for ignored/unignored shows
  - Episodes page: Separate toggles for watched/unwatched episodes and ignored/unignored shows
- Improved eye icon behavior for ignored shows
  - Shows circle background when show is ignored (persistent state)
  - Uses Eye icon (no line) when ignored
  - Uses EyeOff icon (with line) when not ignored
  - Hover effects for better user feedback
- Improved navigation bar styling
  - Added Clear All Data button in the top right
  - Better active state indication for navigation links
  - Consistent spacing and alignment
- Episode filter controls redesigned:
  - Single "Watched" toggle that shows unwatched episodes when active
  - Removed separate unwatched filter for cleaner UI
  - Maintained consistent visual feedback with green highlight
- Enhanced filter button visual feedback:
  - "Watched" filter: Shows Circle when active (showing unwatched), CheckCircle when inactive
  - "Ignored Shows" filter: Shows Eye when active (showing ignored), EyeOff when inactive
  - Icons change with state for clearer visual indication
  - Maintained consistent background colors for active states
- Modified Shows page ignore filter behavior:
  - Filter ON: Shows only ignored shows
  - Filter OFF: Shows only unignored shows (default)
  - Updated button text to "Ignored Shows"
  - Updated tooltips to reflect new behavior
  - Maintained consistent styling with Episodes page
- Reversed ignored shows filter behavior:
  - Default (off): Shows only unignored shows
  - Active (on): Shows all shows (both ignored and unignored)
  - Updated button text and tooltips to reflect new behavior
  - Maintained icon states (Eye/EyeOff) for consistency
- Enhanced pagination controls behavior:
  - Now requires minimum of 5 table rows before enabling sticky behavior
  - Consistent behavior across Shows and Episodes pages
  - Improved viewport height calculations
  - Better handling of small content amounts
- Reversed pagination controls behavior:
  - Now sticks to viewport bottom in large viewports (> 10 rows height)
  - Stays at page bottom in small viewports
  - Consistent behavior across Shows and Episodes pages
  - Improved visibility in all viewport sizes
- Unified Shows page layout with Episodes page:
  - Moved ignore filter next to items per page selector
  - Added button style matching Episodes page filters
  - Removed separate filter section for cleaner look
  - Consistent spacing and visual feedback
- Updated pagination dropdown behavior in Shows and Episodes pages:
  - Shows only current page when closed
  - When clicked, displays all available pages with scrolling
  - Uses browser's native select behavior for better performance and consistency
  - Maintains the same styling and width across all states
- Improved show search experience:
  - Moved Add Show button to top navigation bar
  - Enhanced search drawer with clearer instructions
  - Wider drawer for better readability
  - Better visual distinction between ID and name search
  - Clearer guidance for selecting shows from search results
- Improved search drawer animation for better user experience
  - Added slide-in transition when opening 
  - Improved opacity transitions for overlay
  - Better transition timing with 300ms duration
- Removed page transition animations for simpler navigation
- Increased row animation duration from 0.2 to 0.4 seconds for better visibility
- Refactored import dialog into separate component for better maintainability
- Enhanced Shows table with sorting functionality:
  - Added clickable column headers with sort indicators
  - Improved table header styling with hover effects
  - Added visual feedback for sortable columns
  - Optimized sorting performance for large datasets
  - Maintained consistent styling with existing UI
- Improved import workflow:
  - Fixed dialog chain behavior when canceling import operations
  - Reduced Import Search Results dialog height for better UX
  - Enhanced progress display with detailed status messages
  - Added success/fail counters to progress bars
  - Better visual organization of import dialogs

### Fixed
- Fixed show deletion functionality
- Fixed show ignore toggle functionality
- Fixed Add Show form submission handling
- Pagination controls position in small viewports for both pages
- Pagination visibility based on content height
- Table container spacing and margins
- Port conflict between React app and proxy server
- JSON parsing errors in API responses
- MongoDB connection and configuration issues
- Eye icon state now properly persists when show is ignored
- Icon background and style now correctly reflect show's ignored status
- Watched filter now correctly shows watched episodes when selected
- Filter UI improved for better clarity:
  - Separate buttons for Watched and Unwatched
  - Better visual feedback with background colors
  - Clearer button labels
  - Consistent spacing and alignment
- Episodes page now correctly hides ignored shows by default
- Ignored shows filter behavior improved:
  - Shows are hidden by default unless explicitly showing ignored
  - Filter state persists between page navigation
  - Immediate update when shows are ignored/unignored
- Improved pagination controls behavior:
  - Now correctly positions at page bottom in small viewports
  - Better handling of different content-to-viewport ratios
  - Fixed z-index issues with sticky controls
  - More reliable positioning logic for all viewport sizes
- Show search functionality:
  - Added node-fetch package for server-side API calls
  - Fixed JSON parsing errors in search results
  - Improved error handling for TVMaze API responses
  - Resolved search by ID and name functionality
- Improved animation handling between page transitions:
  - Fixed layout shifts during page transitions
  - Ensured header/navigation bar remains stable during transitions
  - Implemented proper animation sequencing with AnimatePresence
  - Contained animations within viewport bounds
  - Added overflow handling to prevent content spilling

## [1.0.1] - 2024-03-XX

### Added
- Support for custom MongoDB data directory configuration
- Environment variable for MongoDB data directory path
- Detailed instructions for configuring custom data paths on different operating systems

### Changed
- Updated MongoDB installation instructions to include data directory configuration
- Enhanced environment configuration documentation
- Improved cross-platform compatibility for data storage

## [1.0.0] - 2024-03-XX

### Added
- MongoDB integration for data persistence
- Database models for Shows and Episodes
- Environment configuration with `.env` file
- Express server with MongoDB connection
- API endpoints for CRUD operations
- Real-time data synchronization
- Comprehensive installation instructions
- Database schema documentation

### Changed
- Migrated from localStorage to MongoDB for data storage
- Updated frontend components to work with MongoDB
- Modified show and episode management to use database IDs
- Enhanced error handling for database operations
- Updated README with MongoDB setup instructions

### Removed
- localStorage-based data persistence
- Client-side data storage logic

## [0.1.0] - 2024-03-XX

### Added
- Initial release with basic TV show tracking functionality
- TVMaze API integration
- Show and episode management
- Watch status tracking
- Basic statistics
- Responsive UI with TailwindCSS
- localStorage-based data persistence 