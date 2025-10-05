#!/bin/bash

# Lithic POC - Stop Everything Script
# Simple script to stop all services

echo "🛑 Stopping Lithic POC..."
echo "======================"

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

# Step 1: Stop API server processes
echo ""
print_info "Stopping API server processes..."

# Kill any nodemon processes
pkill -f nodemon 2>/dev/null
if [ $? -eq 0 ]; then
    print_success "API server stopped"
else
    print_info "No API server processes found"
fi

# Kill any Node.js processes related to this project
pkill -f "lithic-poc" 2>/dev/null

# Step 2: Stop Supabase services
echo ""
print_info "Stopping Supabase services..."

if [ -f "./supabase-cli" ]; then
    ./supabase-cli stop
    if [ $? -eq 0 ]; then
        print_success "Supabase stopped successfully"
        print_info "Data is preserved in Docker volumes"
    else
        print_error "Failed to stop Supabase properly"
    fi
else
    print_error "Supabase CLI not found"
fi

# Step 3: Verify everything is stopped
echo ""
print_info "Verifying all services are stopped..."

# Check for any remaining Docker containers
CONTAINERS=$(docker ps -q --filter "label=com.supabase.cli.project=lithic-poc" 2>/dev/null)
if [ -n "$CONTAINERS" ]; then
    print_info "Stopping remaining containers..."
    docker stop $CONTAINERS
fi

# Check for any remaining Node.js processes
NODE_PROCESSES=$(ps aux | grep -E "(nodemon|lithic-poc)" | grep -v grep | wc -l)
if [ "$NODE_PROCESSES" -eq 0 ]; then
    print_success "All Node.js processes stopped"
else
    print_info "Some Node.js processes may still be running"
fi

# Final status
echo ""
print_success "Lithic POC shutdown complete!"
echo ""
print_info "📊 Status:"
print_info "  • API Server: Stopped"
print_info "  • Database: Stopped (data preserved)"
print_info "  • Supabase Studio: Stopped"
print_info "  • All Docker containers: Stopped"
echo ""
print_info "💾 Your data is safely stored in Docker volumes"
print_info "🚀 Run './start.sh' to restart everything"
