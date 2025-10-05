#!/bin/bash

# Setup Supabase database for Lithic POC

echo "🚀 Setting up Supabase database..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Initialize Supabase if not already initialized
if [ ! -d "supabase" ]; then
    echo "📦 Initializing Supabase project..."
    supabase init
fi

# Start Supabase
echo "🔄 Starting Supabase..."
supabase start

# Wait for Supabase to be ready
sleep 5

# Run migrations
echo "📊 Running database migrations..."
supabase db reset

echo "✅ Database setup complete!"
echo ""
echo "🌐 Supabase Studio: http://127.0.0.1:54323"
echo "🔗 API URL: http://127.0.0.1:54321"
