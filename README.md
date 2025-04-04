# TV Show Episode Tracker

A web application to track your TV show episodes and mark them as watched.

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

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sagy101/tv-tracker.git
cd tv-tracker
```

2. Install dependencies:
```
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