#!/bin/bash

echo "🚀 Starting development services..."

# Activate Python virtual environment
source venv/bin/activate

# Start services with Docker Compose
echo "🐳 Starting Docker services..."
docker-compose up -d

# Start backend development server
echo "🔧 Starting backend server..."
cd src && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Start frontend development server
echo "💻 Starting frontend development server..."
cd kronos && npm run dev &

echo "✅ Development environment is running!"
echo ""
echo "Services available at:"
echo "- Frontend: http://localhost:3000"
echo "- API Docs: http://localhost:8000/docs"
echo "- N8N: http://localhost:5678"
echo "- Grafana: http://localhost:3000"
echo ""
echo "To stop the services, run: ./scripts/stop_dev.sh"
