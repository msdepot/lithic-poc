#!/bin/bash

echo "🛑 Stopping Lithic POC..."

# Stop Docker Compose
docker-compose down

echo "✅ All services stopped"
