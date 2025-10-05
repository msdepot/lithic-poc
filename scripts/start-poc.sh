#!/bin/bash

# Lithic POC Startup Script
# This script sets up and starts the complete Lithic POC environment

set -e

echo "🚀 Starting Lithic POC Environment"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION found. Please upgrade to Node.js 18+."
    exit 1
fi
print_status "Node.js $NODE_VERSION found"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_status "Docker is running"

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Installing via npm..."
    npm install -g supabase
    if [ $? -eq 0 ]; then
        print_status "Supabase CLI installed successfully"
    else
        print_error "Failed to install Supabase CLI. Please install manually."
        exit 1
    fi
else
    print_status "Supabase CLI found"
fi

# Setup environment
echo ""
echo "🔧 Setting Up Environment..."

if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp env.example .env
    print_warning "Please update .env file with your Supabase keys after starting Supabase"
fi

# Install dependencies
echo ""
echo "📦 Installing Dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Start Supabase
echo ""
echo "🐘 Starting Supabase..."
supabase start
if [ $? -eq 0 ]; then
    print_status "Supabase started successfully"
    echo ""
    print_info "Supabase services are now running:"
    print_info "  • Database: postgresql://postgres:postgres@localhost:54322/postgres"
    print_info "  • API: http://localhost:54321"
    print_info "  • Studio: http://localhost:54323"
    print_info "  • Inbucket (Email): http://localhost:54324"
else
    print_error "Failed to start Supabase"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test database connection
echo ""
echo "🔌 Testing Database Connection..."
npm run db:test 2>/dev/null || {
    print_info "Database test script not found, will test via API startup"
}

# Start the API server
echo ""
echo "🚀 Starting Lithic POC API Server..."
print_info "Starting server on http://localhost:3000"
print_info "Health check will be available at http://localhost:3000/health"

# Start in development mode
npm run dev &
API_PID=$!

# Wait for API to start
echo ""
echo "⏳ Waiting for API server to start..."
sleep 10

# Test API health
echo ""
echo "🏥 Testing API Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health || echo "failed")

if [[ $HEALTH_RESPONSE == *"healthy"* ]]; then
    print_status "API server is healthy and ready!"
    echo ""
    echo "🎉 LITHIC POC ENVIRONMENT READY!"
    echo "================================"
    echo ""
    print_info "📊 Access Points:"
    echo "  • API Server: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/health"
    echo "  • Supabase Studio: http://localhost:54323"
    echo "  • Email Testing: http://localhost:54324"
    echo ""
    print_info "📋 Next Steps:"
    echo "  1. Import 'Lithic_POC_Corrected_Flow.postman_collection.json' into Postman"
    echo "  2. Create environment with base_url: http://localhost:3000/api"
    echo "  3. Run the collection to create MSD Cafe and Medina family"
    echo ""
    print_info "🔑 Default Admin Credentials:"
    echo "  • Username: admin"
    echo "  • Password: admin123"
    echo ""
    print_info "🔗 Lithic Sandbox API Key: 595234f1-968e-4fad-b308-41f6e19bc93f"
    echo ""
    print_info "📚 Documentation:"
    echo "  • Complete API docs: LITHIC_POC_DOCUMENTATION.md"
    echo "  • Setup guide: SETUP_INSTRUCTIONS.md"
    echo "  • Business rules: BUSINESS_RULES.md"
    echo ""
    
    # Keep the script running
    echo "🔄 API server is running in background (PID: $API_PID)"
    echo "Press Ctrl+C to stop all services"
    
    # Trap Ctrl+C to cleanup
    trap 'echo ""; print_info "Stopping services..."; kill $API_PID 2>/dev/null; supabase stop; print_status "All services stopped"; exit 0' INT
    
    # Wait indefinitely
    wait $API_PID
    
else
    print_error "API server health check failed"
    print_info "Response: $HEALTH_RESPONSE"
    kill $API_PID 2>/dev/null
    supabase stop
    exit 1
fi
