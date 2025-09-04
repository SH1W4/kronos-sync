#!/bin/bash

echo "🚀 Starting development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker compose -f docker-compose.dev.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker compose -f docker-compose.dev.yml exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Activate virtual environment
echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

# Apply migrations
echo "🔄 Applying database migrations..."
python manage.py migrate

# Start development server
echo "🌐 Starting development server..."
python manage.py runserver 0.0.0.0:8000

# Trap SIGINT to properly shutdown services
trap 'echo "🛑 Stopping services..." && docker compose -f docker-compose.dev.yml down' SIGINT

echo "✨ Development environment is ready!"
echo ""
echo "Services:"
echo "- Kronos API: http://localhost:8000"
echo "- N8N: http://localhost:5678"
echo "- Grafana: http://localhost:3000"
echo "- Prometheus: http://localhost:9090"
echo ""
echo "Press Ctrl+C to stop all services"
