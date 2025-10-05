#!/bin/bash

# Lithic POC - Start Everything Script
# Simple script to start all services

echo "🚀 Starting Lithic POC..."
echo "======================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the lithic-poc directory"
    exit 1
fi

# Step 1: Start Supabase (database + web interface)
echo ""
print_info "Starting Supabase database and web interface..."
./supabase-cli start

if [ $? -eq 0 ]; then
    print_success "Supabase started successfully"
    print_info "Database Studio: http://127.0.0.1:54323"
else
    print_error "Failed to start Supabase"
    exit 1
fi

# Step 2: Activate Node.js
echo ""
print_info "Activating Node.js environment..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if command -v node &> /dev/null; then
    print_success "Node.js $(node --version) activated"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Step 3: Wait for services to be ready
echo ""
print_info "Waiting for services to initialize..."
sleep 5

# Step 4: Start API server
echo ""
print_info "Starting Lithic POC API server..."
print_info "Press Ctrl+C to stop the server when you're done"
echo ""

# Start the API server (this will run in foreground)
npm run dev
