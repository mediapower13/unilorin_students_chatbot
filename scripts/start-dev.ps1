# PowerShell script to start both frontend and backend
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Starting Unilorin Chatbot Development Environment..." -ForegroundColor Green
Write-Host "=" * 50

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Set-Location backend
pip install -r requirements.txt
Set-Location ..

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Start backend in a new window
Write-Host "Starting Flask backend..." -ForegroundColor Blue
Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "backend" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "Starting Next.js frontend..." -ForegroundColor Blue
Write-Host ""
Write-Host "Services will be available at:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Health:   http://localhost:3000/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend when done." -ForegroundColor Yellow

npm run dev
