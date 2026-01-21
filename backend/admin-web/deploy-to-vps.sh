#!/bin/bash

# Script deploy admin web lên VPS baotienweb.cloud
# Sử dụng: ./deploy-to-vps.sh

set -e

echo "🚀 Starting deployment to baotienweb.cloud..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="baotienweb.cloud"
VPS_USER="root"
VPS_PATH="/var/www/admin-web"
APP_NAME="admin-web"
PORT=3000

echo -e "${YELLOW}📦 Step 1: Building production...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed!${NC}"

echo -e "${YELLOW}📤 Step 2: Uploading files to VPS...${NC}"
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next/cache' \
  --exclude '.env.local' \
  --exclude 'deploy-to-vps.sh' \
  ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Files uploaded!${NC}"

echo -e "${YELLOW}🔧 Step 3: Installing dependencies on VPS...${NC}"
ssh ${VPS_USER}@${VPS_HOST} << EOF
    set -e
    cd ${VPS_PATH}
    
    echo "Installing production dependencies..."
    npm install --production --prefer-offline
    
    echo "Restarting PM2 process..."
    if pm2 describe ${APP_NAME} > /dev/null 2>&1; then
        pm2 restart ${APP_NAME}
    else
        pm2 start npm --name "${APP_NAME}" -- start
    fi
    
    pm2 save
    
    echo "PM2 status:"
    pm2 list
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed on VPS!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📊 Application Status:"
echo "  - Name: ${APP_NAME}"
echo "  - Port: ${PORT}"
echo "  - URL:  https://${VPS_HOST}"
echo ""
echo "📝 Useful commands:"
echo "  - View logs:    ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${APP_NAME}'"
echo "  - Restart app:  ssh ${VPS_USER}@${VPS_HOST} 'pm2 restart ${APP_NAME}'"
echo "  - Stop app:     ssh ${VPS_USER}@${VPS_HOST} 'pm2 stop ${APP_NAME}'"
echo ""
