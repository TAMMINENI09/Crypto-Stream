#!/bin/bash
set -e

echo "🚀 Starting Crypto Stream..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install --recursive
fi

# Generate protobuf files
echo "🔧 Generating protobuf files..."
npx buf generate

# Kill any existing processes on our ports
echo "🧹 Cleaning up old processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🖥️  Starting backend server..."
cd backend
pnpm tsx src/server.ts &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Handle cleanup on exit
cleanup() {
    echo "\n🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo "👋 Goodbye!"
    exit 0
}

trap cleanup INT TERM
wait
