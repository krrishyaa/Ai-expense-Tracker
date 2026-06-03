#!/bin/bash

# AI Expense Tracker - Quick Start Script

echo "🚀 AI Expense Tracker - Quick Start"
echo "=================================="
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✓ Docker and Docker Compose found"
echo ""

# Setup environment
echo "📝 Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
    echo "⚠️  Please update .env with your OpenAI API key"
    echo ""
    read -p "Press Enter to continue..."
fi

echo ""
echo "🐳 Starting Docker services..."

# Start services
docker-compose up -d

echo "✓ Services started"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "🔄 Running migrations..."

docker-compose exec backend python manage.py migrate

echo "✓ Migrations completed"
echo ""

echo "👤 Creating superuser..."

docker-compose exec backend python manage.py createsuperuser

echo ""
echo "✓ Setup complete!"
echo ""
echo "📱 Your application is ready:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:8000"
echo "   - Admin: http://localhost:8000/admin"
echo ""
echo "📚 Next steps:"
echo "   - Open http://localhost:5173 in your browser"
echo "   - Register a new account or use your admin account"
echo "   - Add your first expense!"
echo ""
echo "🛑 To stop services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
echo ""
