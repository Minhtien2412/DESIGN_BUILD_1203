#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before npm install on EAS build servers

set -e

echo "🔧 EAS Build Pre-Install Hook"
echo "================================"

# Set npm registry with timeout
echo "📦 Configuring npm registry..."
npm config set registry https://registry.npmjs.org/
npm config set fetch-timeout 60000
npm config set fetch-retries 5

# Clear npm cache to avoid corruption
echo "🧹 Clearing npm cache..."
npm cache clean --force || true

echo "✅ Pre-install configuration complete!"
