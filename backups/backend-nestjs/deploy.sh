#!/bin/bash

# Deployment script for baotienweb.cloud
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to baotienweb.cloud..."

# Configuration
SERVER="baotienweb.cloud"
USER="root"
REMOTE_DIR="/var/www/construction-map-backend"
APP_NAME="construction-map-api"
WS_APP_NAME="construction-map-ws"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Building application locally...${NC}"
npm run build

echo -e "${YELLOW}📤 Uploading files to server...${NC}"
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.env' \
  ./ ${USER}@${SERVER}:${REMOTE_DIR}/

echo -e "${YELLOW}🔧 Installing dependencies on server...${NC}"
ssh ${USER}@${SERVER} << EOF
  cd ${REMOTE_DIR}
  
  # Install dependencies
  npm install --production
  
  # Copy env file if not exists
  if [ ! -f .env ]; then
    echo "⚠️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with actual credentials!"
  fi
  
  # Build
  npm run build
  
  # Run migrations
  npm run migration:run || true
EOF

echo -e "${YELLOW}🔄 Restarting PM2 processes...${NC}"
ssh ${USER}@${SERVER} << EOF
  cd ${REMOTE_DIR}
  
  # Stop old processes
  pm2 delete ${APP_NAME} || true
  pm2 delete ${WS_APP_NAME} || true
  
  # Start API server
  pm2 start dist/main.js \
    --name ${APP_NAME} \
    --instances 2 \
    --exec-mode cluster \
    --env production
  
  # Save PM2 state
  pm2 save
EOF

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Next steps:"
echo "1. SSH to server: ssh ${USER}@${SERVER}"
echo "2. Configure .env file: nano ${REMOTE_DIR}/.env"
echo "3. Restart PM2: pm2 restart ${APP_NAME}"
echo "4. View logs: pm2 logs ${APP_NAME}"
echo ""
echo "API URL: https://api.baotienweb.cloud/api/construction-map/health"
echo "WebSocket URL: wss://api.baotienweb.cloud/construction-map"
