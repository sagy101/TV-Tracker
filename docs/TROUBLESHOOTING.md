# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when setting up or running the TrackTV application.

## MongoDB Issues

### Connection Problems

**Symptom**: Server fails to start with MongoDB connection errors

**Solutions**:

1. **Check if MongoDB is running**:
   ```bash
   mongo --eval "db.serverStatus()"
   ```
   If this fails, MongoDB is not running properly.

2. **Start MongoDB service**:
   - Windows:
     ```bash
     net start MongoDB
     ```
   - Linux:
     ```bash
     sudo systemctl start mongod
     ```
   - macOS:
     ```bash
     brew services start mongodb-community
     ```

3. **Verify MongoDB data directory exists and has correct permissions**:
   ```bash
   ls -l E:/MongoDB/tv-tracker-data/db
   ```
   If the directory doesn't exist, create it:
   ```bash
   mkdir -p E:/MongoDB/tv-tracker-data/db
   mkdir -p E:/MongoDB/tv-tracker-data/logs
   ```

4. **Check MongoDB logs for errors**:
   Look for error messages in the MongoDB log file at `E:/MongoDB/tv-tracker-data/logs/mongodb.log`

5. **Confirm MongoDB connection string**:
   Make sure your `.env` file has the correct MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/tv-tracker
   ```

### Data Import/Export Issues

**Symptom**: Problems importing or exporting data

**Solutions**:

1. **Check CSV format**:
   Ensure your CSV file follows the expected format:
   ```csv
   showname,ignored,status,classification,country,network,runtime,airtime,timezone
   "Show Name",0,Running,Scripted,US,NBC,60,20:00,America/New_York
   ```

2. **Validate MongoDB exports**:
   If exporting data, make sure the MongoDB export command is correct:
   ```bash
   mongoexport --db tv-tracker --collection shows --out shows.json
   ```

## Node.js Issues

**Symptom**: Application fails to start or crashes unexpectedly

**Solutions**:

1. **Check Node.js version**:
   ```bash
   node --version
   ```
   Ensure you're using Node.js v14 or higher.

2. **Use nvm to switch versions if needed**:
   ```bash
   nvm use 14
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

5. **Check for conflicting dependencies**:
   ```bash
   npm ls
   ```
   Look for any dependency conflicts or errors.

## API Connection Issues

**Symptom**: Unable to fetch show data or search results

**Solutions**:

1. **Check network connectivity**:
   Ensure you have internet access and can reach the TVMaze API.

2. **Verify proxy settings**:
   If you're behind a corporate firewall, check your proxy settings.

3. **Test TVMaze API directly**:
   Try accessing the TVMaze API directly in your browser:
   ```
   https://api.tvmaze.com/shows/1
   ```

4. **Check for API rate limiting**:
   The TVMaze API has rate limits that might be causing issues.

## Frontend Issues

**Symptom**: UI doesn't render correctly or is unresponsive

**Solutions**:

1. **Clear browser cache**:
   Hard refresh your browser with Ctrl+F5 (Windows) or Cmd+Shift+R (Mac).

2. **Check browser console for errors**:
   Open browser developer tools (F12) and check the console tab.

3. **Verify React development server**:
   Ensure the React development server is running on port 3000.

4. **Check for JavaScript errors**:
   Look for any JavaScript errors in the browser console.

## Database Schema Issues

**Symptom**: Data doesn't save or appears incorrectly

**Solutions**:

1. **Check MongoDB schema**:
   Verify that your MongoDB schema matches the expected structure.

2. **Repair MongoDB database**:
   ```bash
   mongod --repair --dbpath E:/MongoDB/tv-tracker-data/db
   ```

3. **Check MongoDB indexes**:
   Ensure all required indexes are created:
   ```javascript
   db.shows.createIndex({ "name": 1 })
   db.episodes.createIndex({ "show_id": 1 })
   ```

## Performance Issues

**Symptom**: Application is slow or unresponsive

**Solutions**:

1. **Check MongoDB query performance**:
   Enable profiling to identify slow queries:
   ```javascript
   db.setProfilingLevel(2)
   ```

2. **Optimize React rendering**:
   Look for unnecessary re-renders in your React components.

3. **Increase server resources**:
   If possible, allocate more memory/CPU to the application server.

## Setup Script Issues

**Symptom**: The setup.ps1 or setup.bat script fails

**Solutions**:

1. **Run with administrator privileges**:
   Make sure to run PowerShell or Command Prompt as Administrator.

2. **Check execution policy**:
   If PowerShell script fails to run, check execution policy:
   ```powershell
   Get-ExecutionPolicy
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

3. **Manually perform setup steps**:
   If automation fails, follow the manual setup steps in the README.

## Still Having Issues?

If you've tried the solutions above and are still experiencing problems, please:

1. Open an issue on GitHub with a detailed description of your problem
2. Include information about your environment (OS, Node.js version, MongoDB version)
3. Share any error messages or logs that might help diagnose the issue
4. Describe the steps you've already taken to resolve the problem 