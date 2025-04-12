# 🗺️ Roadmap

<p align="center">
  <img src="images/roadmap.png" alt="Roadmap" width="400">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project_Status-Active-brightgreen?style=for-the-badge" alt="Project Status" />
  <img src="https://img.shields.io/badge/Version-1.1.0-orange?style=for-the-badge" alt="Version" />
</p>

---

## Overview

This document outlines the planned features and improvements for TrackTV. The roadmap is divided into short-term, medium-term, and long-term goals, with each feature assigned a priority level and status.

> **Note:** This roadmap is subject to change based on community feedback and project priorities.

---

## Roadmap

### Short-term Goals

<table>
  <tr>
    <th>Feature</th>
    <th>Description</th>
    <th>Priority</th>
    <th>Status</th>
  </tr>
  <tr>
    <td><b>Multi-User Support</b> 🚀</td>
    <td>
      <b>Foundation Implemented:</b>
      <ul>
        <li>✅ User Signup (Email/Password)</li>
        <li>✅ Email Verification Flow</li>
        <li>✅ Secure Login & JWT Sessions</li>
      </ul>
      <b>Next Steps / Remaining:</b>
      <ul>
        <li>🚧 **Separate User Data:** Critical step to associate shows, episodes, watched status, etc., with individual users. (Currently shared globally).</li>
        <li>👤 User Profiles & Preferences</li>
        <li>🔐 Authorization/Roles (Admin vs User)</li>
        <li>🎨 UI/UX improvements for user management</li>
        <li>🤝 Show Sharing (Optional Future Feature)</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-High-green?style=flat-square" alt="Priority: High" /></td>
    <td><img src="https://img.shields.io/badge/Status-Partially_Complete-blue?style=flat-square" alt="Status: Partially Complete" /></td>
  </tr>
  <tr>
    <td><b>Import/Export Features</b></td>
    <td>
      <ul>
        <li>Support CSV import from MyEpisodes.com</li>
        <li>Import from other popular tracking services</li>
        <li>Export data in various formats</li>
        <li>Backup and restore functionality</li>
        <li>Batch show adding</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-High-green?style=flat-square" alt="Priority: High" /></td>
    <td><img src="https://img.shields.io/badge/Status-In_Progress-blue?style=flat-square" alt="Status: In Progress" /></td>
  </tr>
  <tr>
    <td><b>Auto-refresh for Active Shows</b></td>
    <td>
      <ul>
        <li>Automatically update episode data for shows that aren't marked as "Ended"</li>
        <li>Fetch new episodes and air dates</li>
        <li>Update show status if changed</li>
        <li>Option to set refresh interval</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Medium-yellow?style=flat-square" alt="Priority: Medium" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
</table>

---

### Medium-term Goals

<details>
<summary><strong>Click to view Medium-term Goals</strong></summary>

<table>
  <tr>
    <th>Feature</th>
    <th>Description</th>
    <th>Priority</th>
    <th>Status</th>
  </tr>
  <tr>
    <td><b>Show Details Page</b></td>
    <td>
      <ul>
        <li>Dedicated page for each show with comprehensive information</li>
        <li>Season-by-season breakdown with collapsible sections</li>
        <li>Episode details including summaries and guest stars</li>
        <li>Show statistics and watching patterns</li>
        <li>Cast information and character details</li>
        <li>Related shows recommendations</li>
        <li>User notes and episode ratings</li>
        <li>Progress tracking visualization</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Medium-yellow?style=flat-square" alt="Priority: Medium" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
  <tr>
    <td><b>Calendar View</b></td>
    <td>
      <ul>
        <li>Visual calendar display of upcoming episode air dates</li>
        <li>Month, week, and day view options</li>
        <li>Filtering by show or status</li>
        <li>Integration with show details and episode tracking</li>
        <li>Customizable reminders or notifications (optional)</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Medium-yellow?style=flat-square" alt="Priority: Medium" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
  <tr>
    <td><b>Cross-Platform Setup Support</b></td>
    <td>
      <ul>
        <li>Linux installation script (bash)</li>
        <li>MacOS installation script (bash/zsh)</li>
        <li>Docker containerization for one-click deployment</li>
        <li>Platform-specific database path configurations</li>
        <li>Comprehensive documentation for each platform</li>
        <li>Troubleshooting guides for common platform-specific issues</li>
        <li>CI/CD pipelines for multi-platform testing</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Medium-yellow?style=flat-square" alt="Priority: Medium" /></td>
    <td><img src="https://img.shields.io/badge/Status-Ongoing-blue?style=flat-square" alt="Status: Ongoing" /></td>
  </tr>
  <tr>
    <td><b>Code Architecture Improvements</b></td>
    <td>
      <ul>
        <li>Refactor components for better modularity</li>
        <li>Implement atomic design principles</li>
        <li>Create reusable UI components library</li>
        <li>Improve state management with Redux/Context (or Zustand)</li>
        <li>Add comprehensive test coverage</li>
        <li>Implement proper TypeScript types</li>
        <li>Better error handling and logging</li>
        <li>Performance optimizations</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Type-Development-lightgrey?style=flat-square" alt="Type: Development" /></td>
    <td><img src="https://img.shields.io/badge/Status-Ongoing-blue?style=flat-square" alt="Status: Ongoing" /></td>
  </tr>
  <tr>
    <td><b>Security Enhancements</b></td>
    <td>
      <ul>
        <li>Add security headers using `helmet`</li>
        <li>Implement input validation using `joi` or `express-validator`</li>
        <li>Set up regular dependency vulnerability audits (`npm audit`, Snyk/Dependabot)</li>
        <li>Implement rate limiting</li>
        <li>Review and secure database access</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Medium-yellow?style=flat-square" alt="Priority: Medium" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
</table>
</details>

---

### Long-term Goals

<details>
<summary><strong>Click to view Long-term Goals</strong></summary>

<table>
  <tr>
    <th>Feature</th>
    <th>Description</th>
    <th>Priority</th>
    <th>Status</th>
  </tr>
  <tr>
    <td><b>Testing Implementation</b> 🧪</td>
    <td>
      <ul>
        <li>Comprehensive testing strategy implementation (Jest, React Testing Library, Supertest, Cypress, Storybook)</li>
        <li>Frontend and backend test coverage</li>
        <li>CI/CD integration for automated testing</li>
        <li>Performance and load testing</li>
        <li>See <a href="TESTING.md">detailed testing requirements</a> for more information</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Lowest-lightgrey?style=flat-square" alt="Priority: Lowest" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
  <tr>
    <td><b>AI Show Assistant</b></td>
    <td>
      <ul>
        <li>Natural language interface for show queries</li>
        <li>Personalized show recommendations based on watching history</li>
        <li>Viewing pattern analysis and insights</li>
        <li>Watch time predictions and scheduling suggestions</li>
        <li>Show similarity analysis</li>
        <li>Mood-based recommendations</li>
        <li>Automated show categorization</li>
        <li>Viewing habit reports and statistics</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Low-lightgrey?style=flat-square" alt="Priority: Low" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
  <tr>
    <td><b>Enhanced Visual Customization & Dark Mode</b></td>
    <td>
      <ul>
        <li>Advanced dark mode with customizable color themes</li>
        <li>User-defined UI color schemes</li>
        <li>Font customization options</li>
        <li>Animated transitions and UI effects</li>
        <li>Responsive layout improvements for all devices</li>
        <li>Accessibility enhancements</li>
        <li>Custom CSS theme support</li>
        <li>Visual density controls (compact/comfortable views)</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Lowest-lightgrey?style=flat-square" alt="Priority: Lowest" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
  <tr>
    <td><b>API Documentation</b></td>
    <td>
      <ul>
        <li>Generate interactive API documentation using Swagger/OpenAPI</li>
        <li>Utilize tools like `swagger-jsdoc` and `swagger-ui-express`</li>
        <li>Maintain comprehensive JSDoc comments for backend code</li>
      </ul>
    </td>
    <td><img src="https://img.shields.io/badge/Priority-Low-lightgrey?style=flat-square" alt="Priority: Low" /></td>
    <td><img src="https://img.shields.io/badge/Status-Planned-lightgrey?style=flat-square" alt="Status: Planned" /></td>
  </tr>
</table>
</details>

---

## Community Feedback

I welcome input from my community on feature prioritization! Please submit your feature requests and feedback through:

- [GitHub Issues](https://github.com/sagy101/tv-tracker/issues)
- [GitHub Discussions](https://github.com/sagy101/tv-tracker/discussions)

---

## Milestone Progress

Progress toward my roadmap goals can be tracked on the [project board TBD](https://github.com/sagy101/tv-tracker/projects). 