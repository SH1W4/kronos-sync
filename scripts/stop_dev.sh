#!/bin/bash

echo "🛑 Stopping development services..."

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose down

# Kill development servers
echo "💫 Stopping development servers..."
pkill -f "uvicorn app.main:app"
pkill -f "npm run dev"

echo "✅ All services stopped!"
