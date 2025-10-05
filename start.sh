#!/bin/bash

echo "🚀 Starting Lithic POC..."
echo ""

# Check if Supabase is running
echo "📊 Checking Supabase..."
if ! supabase status &> /dev/null; then
    echo "⚠️  Supabase not running. Starting Supabase..."
    cd backend
    supabase start
    cd ..
    echo "✅ Supabase started"
else
    echo "✅ Supabase is running"
fi

echo ""
echo "🔧 Starting Backend Server..."
cd backend
npm install &> /dev/null
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo ""
echo "🎨 Starting Frontend..."
cd frontend
npm install &> /dev/null
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Lithic POC is starting!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:3001"
echo "📍 Supabase Studio: http://127.0.0.1:54323"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
