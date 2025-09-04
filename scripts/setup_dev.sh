#!/bin/bash

echo "🚀 Setting up development environment..."

# Check requirements
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

echo "✨ Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing Node.js dependencies..."
cd kronos && npm install && cd ..

echo "🗄️ Setting up environment..."
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.template .env
    echo "⚠️ Please update the credentials in .env file!"
fi

echo "🔧 Setting up development tools..."
pip install pre-commit
pre-commit install

echo "🐳 Building Docker images..."
docker-compose build

echo "✅ Development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Update the credentials in .env file"
echo "2. Start the services: ./scripts/start_dev.sh"
echo ""
echo "Services available:"
echo "- Frontend: http://localhost:3000"
echo "- API Docs: http://localhost:8000/docs"
echo "- N8N: http://localhost:5678"
echo "- Grafana: http://localhost:3000"
