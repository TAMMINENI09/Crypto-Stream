#!/bin/bash
set -e

echo "🚀 Installing required tools..."
npm install -g @bufbuild/protoc-gen-es @bufbuild/protoc-gen-connect-es

echo "📦 Generating protobuf files..."

# Create output directories if they don't exist
mkdir -p frontend/src/gen
mkdir -p backend/src/gen

# Generate for frontend
echo "🔧 Generating frontend files..."
npx protoc \
  --plugin=protoc-gen-es=node_modules/.bin/protoc-gen-es \
  --es_out frontend/src/gen \
  --es_opt target=ts \
  --plugin=protoc-gen-connect-es=node_modules/.bin/protoc-gen-connect-es \
  --connect-es_out frontend/src/gen \
  --connect-es_opt target=ts \
  -I . \
  proto/price.proto

# Generate for backend
echo "🔧 Generating backend files..."
npx protoc \
  --plugin=protoc-gen-es=node_modules/.bin/protoc-gen-es \
  --es_out backend/src/gen \
  --es_opt target=ts \
  --plugin=protoc-gen-connect-es=node_modules/.bin/protoc-gen-connect-es \
  --connect-es_out backend/src/gen \
  --connect-es_opt target=ts \
  -I . \
  proto/price.proto

echo "✅ Done! Protobuf files have been generated."
