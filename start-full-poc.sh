#!/bin/bash

# Lithic POC - Start Full Application (Backend + Frontend)

echo "🚀 Starting Lithic Payment Card Management POC"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}📡 Starting Backend API Server...${NC}"
    
    # Check if Supabase is running
    if ! check_port 54321; then
        echo -e "${YELLOW}⚡ Starting Supabase...${NC}"
        npm run supabase:start
        sleep 3
    else
        echo -e "${GREEN}✅ Supabase already running${NC}"
    fi
    
    # Start the Node.js API server
    echo -e "${BLUE}🔧 Starting Node.js API server...${NC}"
    npm run dev &
    BACKEND_PID=$!
    
    # Wait for backend to be ready
    echo -e "${YELLOW}⏳ Waiting for API server to be ready...${NC}"
    for i in {1..30}; do
        if check_port 3000; then
            echo -e "${GREEN}✅ Backend API ready on http://localhost:3000${NC}"
            break
        fi
        sleep 1
    done
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend React App...${NC}"
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start the React development server
    echo -e "${BLUE}⚡ Starting React development server...${NC}"
    BROWSER=none npm start &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to be ready
    echo -e "${YELLOW}⏳ Waiting for React app to be ready...${NC}"
    for i in {1..60}; do
        if check_port 3001; then
            echo -e "${GREEN}✅ Frontend ready on http://localhost:3001${NC}"
            break
        fi
        sleep 1
    done
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Start backend
start_backend

# Start frontend
start_frontend

echo ""
echo -e "${GREEN}🎉 Lithic POC is now running!${NC}"
echo "================================="
echo -e "${BLUE}🔗 Access Points:${NC}"
echo -e "  • Frontend (Admin UI): ${GREEN}http://localhost:3001${NC}"
echo -e "  • Backend API:         ${GREEN}http://localhost:3000${NC}"
echo -e "  • Database Studio:     ${GREEN}http://127.0.0.1:54323${NC}"
echo -e "  • API Health Check:    ${GREEN}http://localhost:3000/health${NC}"
echo ""
echo -e "${BLUE}👤 Default Login:${NC}"
echo -e "  • Username: ${YELLOW}admin${NC}"
echo -e "  • Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${YELLOW}💡 This replaces all Postman tests with a user-friendly web interface${NC}"
echo -e "${YELLOW}💡 Create users → accounts → cards → spending profiles through the UI${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep the script running and wait for user interruption
wait