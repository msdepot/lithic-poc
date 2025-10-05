#!/bin/bash

echo "Lithic POC Startup Script"
echo "========================"
echo ""
echo "Starting backend and frontend servers..."
echo ""

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
echo "Starting backend server on port 3001..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait