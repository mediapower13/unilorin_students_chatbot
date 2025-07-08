@echo off
REM 🚀 Start Backend Server Script for Windows
REM This script helps you start the Unilorin Chatbot backend server

echo 🚀 Unilorin Chatbot Backend Startup
echo ==========================================

REM Change to backend directory
cd /d "%~dp0..\backend"

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  No .env file found
    echo 📝 Creating .env file from template...
    
    if exist ".env.template" (
        copy ".env.template" ".env" >nul
        echo ✅ Created .env file
        echo ❗ IMPORTANT: Please edit the .env file and add your API keys:
        echo    - OPENAI_API_KEY=your_openai_api_key
        echo    - PINECONE_API_KEY=your_pinecone_api_key
        echo.
        echo 🔧 Would you like to start the test server instead? (y/n)
        set /p response=
        if /i "%response%"=="y" (
            echo 🧪 Starting test server...
            python test-server.py
            goto :end
        ) else (
            echo ❌ Please configure your API keys in .env file first
            pause
            goto :end
        )
    ) else (
        echo ❌ No .env template found
        pause
        goto :end
    )
)

REM Check if we can start the real server (this is simplified for batch)
echo ✅ Found .env file
echo 🚀 Starting backend server...
echo 💡 If API keys are not configured, the server will show errors
echo 🧪 Use test-server.py for testing without API keys
echo.

python main.py

:end
pause
