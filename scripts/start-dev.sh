#!/bin/bash

# Get the directory where the script is located and navigate to parent
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Start the Flask backend in the background
echo "Starting Flask backend..."
cd backend
python main.py &
FLASK_PID=$!
cd ..

# Wait a moment for Flask to start
sleep 3

# Start the Next.js frontend
echo "Starting Next.js frontend..."
npm run dev &
NEXTJS_PID=$!

# Function to cleanup processes when script exits
cleanup() {
    echo "Shutting down..."
    kill $FLASK_PID $NEXTJS_PID 2>/dev/null
    exit
}

# Trap cleanup function on script exit
trap cleanup EXIT

# Wait for user to press Ctrl+C
echo "Both services are running. Press Ctrl+C to stop."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
wait
