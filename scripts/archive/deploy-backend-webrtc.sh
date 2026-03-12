#!/bin/bash

# =============================================
# Deploy Backend WebRTC Fixes to VPS
# =============================================

set -e  # Exit on any error

echo "🚀 Deploying Backend WebRTC fixes to baotienweb.cloud..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="baotienweb.cloud"
VPS_USER="root"
PROJECT_PATH="/var/www/baotienweb.cloud/BE-baotienweb.cloud"
PM2_APP_NAME="baotienweb-api"

echo ""
echo "${YELLOW}📋 Pre-deployment checks...${NC}"

# Check if we can connect to VPS
echo "Testing SSH connection..."
if ! ssh -q ${VPS_USER}@${VPS_HOST} exit; then
    echo "${RED}❌ Cannot connect to VPS. Check your SSH config.${NC}"
    exit 1
fi
echo "${GREEN}✅ SSH connection OK${NC}"

echo ""
echo "${YELLOW}📦 Step 1: Uploading code changes...${NC}"

# Upload modified files
echo "Uploading call.service.ts..."
scp BE-baotienweb.cloud/src/call/call.service.ts ${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/src/call/

echo "Uploading call.gateway.ts..."
scp BE-baotienweb.cloud/src/call/call.gateway.ts ${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/src/call/

echo "${GREEN}✅ Files uploaded${NC}"

echo ""
echo "${YELLOW}🔧 Step 2: Building on VPS...${NC}"

# SSH and run build
ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'
set -e

cd /var/www/baotienweb.cloud/BE-baotienweb.cloud

echo "📦 Installing dependencies (if needed)..."
npm install --production=false

echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build complete"
ENDSSH

echo "${GREEN}✅ Build successful${NC}"

echo ""
echo "${YELLOW}🔄 Step 3: Restarting PM2...${NC}"

ssh ${VPS_USER}@${VPS_HOST} << ENDSSH
set -e

echo "Restarting ${PM2_APP_NAME}..."
pm2 restart ${PM2_APP_NAME}

echo "Waiting for app to start..."
sleep 3

echo "PM2 status:"
pm2 status ${PM2_APP_NAME}

echo ""
echo "Recent logs:"
pm2 logs ${PM2_APP_NAME} --lines 20 --nostream
ENDSSH

echo "${GREEN}✅ PM2 restarted${NC}"

echo ""
echo "${YELLOW}🧪 Step 4: Health check...${NC}"

# Wait a bit for service to fully start
sleep 2

# Check if API is responding
echo "Testing API endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${VPS_HOST}/api/health || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
    echo "${GREEN}✅ API is responding (HTTP $HTTP_CODE)${NC}"
else
    echo "${RED}⚠️  API might not be responding (HTTP $HTTP_CODE)${NC}"
    echo "Check logs with: ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${PM2_APP_NAME}'"
fi

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}🎉 Deployment Complete!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test WebSocket connection:"
echo "   wscat -c wss://${VPS_HOST}/call"
echo ""
echo "2. Test signaling flow:"
echo "   - Build development build: npx expo run:android"
echo "   - Install on 2 devices"
echo "   - Test video call between users"
echo ""
echo "3. Monitor logs:"
echo "   ssh ${VPS_USER}@${VPS_HOST} 'pm2 logs ${PM2_APP_NAME}'"
echo ""
echo "4. If issues occur:"
echo "   ssh ${VPS_USER}@${VPS_HOST}"
echo "   cd ${PROJECT_PATH}"
echo "   pm2 restart ${PM2_APP_NAME}"
echo ""
