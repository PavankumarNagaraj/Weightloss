#!/bin/bash

echo "🔍 Finding processes on port 5000..."

# Kill all nodemon processes
pkill -9 -f "nodemon"

# Kill any process on port 5000
lsof -ti:5000 | xargs kill -9 2>/dev/null

# Wait a moment
sleep 1

# Check if port is free
if lsof -ti:5000 > /dev/null 2>&1; then
    echo "❌ Port 5000 is still in use"
    lsof -ti:5000 | xargs kill -9
else
    echo "✅ Port 5000 is now free!"
fi
