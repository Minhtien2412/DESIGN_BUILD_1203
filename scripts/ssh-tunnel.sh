#!/bin/bash

# SSH Tunnel Helper Script
# Creates SSH tunnel to VPS for local development

echo "🔌 Setting up SSH Tunnel to VPS..."
echo ""
echo "VPS: 103.200.20.100"
echo "Local Port: 5000"
echo "Remote Port: 4000"
echo ""
echo "After connection:"
echo "- API will be available at: http://localhost:5000"
echo "- Update .env: EXPO_PUBLIC_API_BASE_URL=http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop tunnel"
echo ""

# Check if tunnel is already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5000 is already in use!"
    echo "Kill existing process? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        echo "Killing process on port 5000..."
        lsof -ti:5000 | xargs kill -9 2>/dev/null
        sleep 1
    else
        echo "Exiting..."
        exit 1
    fi
fi

# Start tunnel
echo "Starting SSH tunnel..."
ssh -L 5000:127.0.0.1:4000 root@103.200.20.100 -N

echo ""
echo "Tunnel closed."
