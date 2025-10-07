#!/bin/bash

# Memora Production Deployment Script
# Usage: ./deploy.sh [--with-nginx]

set -e

echo "🚀 Starting Memora Production Deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check required variables
required_vars=("DATABASE_URL" "JWT_SECRET_KEY" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set in .env"
        exit 1
    fi
done

# Nginx is now included by default (no profile needed)
echo "🔧 Deploying with Nginx reverse proxy..."

# Pull latest images
echo "📦 Pulling latest base images..."
docker-compose -f docker-compose.prod.yml pull opensearch nginx

# Build services
echo "🔨 Building application services..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
for service in opensearch backend frontend nginx; do
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "healthy\|Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start properly"
        docker-compose -f docker-compose.prod.yml logs $service
        exit 1
    fi
done

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend API: http://localhost:${BACKEND_PORT:-8000}"
echo "   API Docs: http://localhost:${BACKEND_PORT:-8000}/docs"
echo "   OpenSearch: http://localhost:9200"
echo "   Nginx Proxy: https://localhost:${NGINX_PORT:-443}"

echo ""
echo "📊 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.prod.yml down"
echo "📈 To monitor: docker-compose -f docker-compose.prod.yml ps"