#!/bin/bash

echo "🚀 Setting up development environment for Studio Tattoo Project..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✨ Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "📦 Installing Node.js dependencies..."
npm install

echo "🗄️ Setting up database..."
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "⚠️ Please update the credentials in .env file!"
fi

echo "🔧 Setting up development tools..."
pre-commit install

echo "✅ Development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Update the credentials in .env file"
echo "2. Start PostgreSQL service"
echo "3. Run migrations: python manage.py migrate"
echo "4. Start the development server: python manage.py runserver"
echo ""
echo "For more information, check the README.md file."
