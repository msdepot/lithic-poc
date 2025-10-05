#!/bin/bash

echo "🚀 Lithic POC Setup"
echo "==================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker found"
echo ""

# Start PostgreSQL with Docker Compose
echo "📦 Starting PostgreSQL database..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the application: npm run dev"
echo "   2. Open browser: http://localhost:3000"
echo ""
echo "🗄️  Database is running on: localhost:54322"
echo ""
