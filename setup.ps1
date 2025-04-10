# TV-Tracker Setup Script for Windows
Write-Host "TV-Tracker Setup Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Check for administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This script requires administrator privileges. Please run PowerShell as administrator." -ForegroundColor Red
    exit
}

# Create MongoDB directories
Write-Host "`n[1/5] Setting up MongoDB directories..." -ForegroundColor Green
$mongoDataDir = "E:\MongoDB\tv-tracker-data\db"
$mongoLogsDir = "E:\MongoDB\tv-tracker-data\logs"

if (-not (Test-Path $mongoDataDir)) {
    New-Item -ItemType Directory -Path $mongoDataDir -Force
    Write-Host "Created MongoDB data directory: $mongoDataDir" -ForegroundColor Yellow
}

if (-not (Test-Path $mongoLogsDir)) {
    New-Item -ItemType Directory -Path $mongoLogsDir -Force
    Write-Host "Created MongoDB logs directory: $mongoLogsDir" -ForegroundColor Yellow
}

# Check if Node.js is installed
Write-Host "`n[2/5] Checking for Node.js..." -ForegroundColor Green
$nodeInstalled = $false
try {
    $nodeVersion = node -v
    $nodeInstalled = $true
    Write-Host "Node.js $nodeVersion is installed" -ForegroundColor Yellow
    
    if ($nodeVersion -lt "v14") {
        Write-Host "Warning: Node.js version should be v14 or higher. Please consider upgrading." -ForegroundColor Red
    }
} catch {
    Write-Host "Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js v14 or higher from https://nodejs.org/" -ForegroundColor Red
    $installNode = Read-Host "Do you want to open the Node.js download page? (y/n)"
    if ($installNode -eq "y") {
        Start-Process "https://nodejs.org/en/download/"
    }
    Write-Host "After installing Node.js, please run this script again." -ForegroundColor Red
    exit
}

# Check if MongoDB is installed
Write-Host "`n[3/5] Checking for MongoDB..." -ForegroundColor Green
$mongoInstalled = $false
try {
    $mongoVersion = mongod --version
    $mongoInstalled = $true
    Write-Host "MongoDB is installed" -ForegroundColor Yellow
} catch {
    Write-Host "MongoDB is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install MongoDB v4.4 or higher from https://www.mongodb.com/try/download/community" -ForegroundColor Red
    $installMongo = Read-Host "Do you want to open the MongoDB download page? (y/n)"
    if ($installMongo -eq "y") {
        Start-Process "https://www.mongodb.com/try/download/community"
    }
    Write-Host "After installing MongoDB, please run this script again." -ForegroundColor Red
    exit
}

# Install npm dependencies
Write-Host "`n[4/5] Installing npm dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing npm dependencies. Please check the logs above." -ForegroundColor Red
    exit
}
Write-Host "Dependencies installed successfully" -ForegroundColor Yellow

# Create .env file
Write-Host "`n[5/5] Creating .env file..." -ForegroundColor Green
$envFile = ".\.env"
if (Test-Path $envFile) {
    Write-Host ".env file already exists" -ForegroundColor Yellow
} else {
    $envContent = @"
MONGODB_URI=mongodb://localhost:27017/tv-tracker
PORT=3000
MONGODB_DATA_DIR=$mongoDataDir
"@
    Set-Content -Path $envFile -Value $envContent
    Write-Host ".env file created with default configuration" -ForegroundColor Yellow
}

# Check if MongoDB service is installed and running
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($null -eq $mongoService) {
    Write-Host "`nMongoDB Windows Service is not installed." -ForegroundColor Yellow
    Write-Host "You'll need to start MongoDB manually when using the application:" -ForegroundColor Yellow
    Write-Host "mongod --dbpath $mongoDataDir --logpath $mongoLogsDir\mongodb.log" -ForegroundColor White
} else {
    if ($mongoService.Status -ne "Running") {
        Write-Host "`nStarting MongoDB service..." -ForegroundColor Green
        Start-Service -Name "MongoDB"
        Write-Host "MongoDB service started" -ForegroundColor Yellow
    } else {
        Write-Host "`nMongoDB service is already running" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "`nTo run the application:" -ForegroundColor Cyan
Write-Host "1. Start the server: npm run server" -ForegroundColor White
Write-Host "2. In a new terminal, start the client: npm start" -ForegroundColor White
Write-Host "3. Open your browser and navigate to http://localhost:3000" -ForegroundColor White
Write-Host "`nEnjoy using TV-Tracker!" -ForegroundColor Cyan 