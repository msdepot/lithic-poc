#!/bin/bash

echo "🚀 Starting Lithic POC..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Next steps:"
echo "1. Make sure Supabase is running: supabase start"
echo "2. Start the application: npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
