#!/bin/bash

# Timeline API Deployment Script
# Usage: ./deploy-timeline.sh

echo "🚀 Deploying Timeline API Module..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build project
echo -e "${YELLOW}📦 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Optional: Deploy to server
read -p "Deploy to baotienweb.cloud? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo -e "${YELLOW}📤 Deploying to server...${NC}"
  
  # Upload files
  scp -r src/timeline root@baotienweb.cloud:/var/www/baotienweb-api/src/
  scp src/app.module.ts root@baotienweb.cloud:/var/www/baotienweb-api/src/
  
  # SSH and restart
  ssh root@baotienweb.cloud << 'ENDSSH'
    cd /var/www/baotienweb-api
    npm install
    npm run build
    pm2 restart baotienweb-api
    echo "✅ Server restarted"
ENDSSH

  echo -e "${GREEN}✅ Deployment complete!${NC}"
  echo ""
  echo "🧪 Test endpoint:"
  echo "curl https://baotienweb.cloud/api/v1/timeline/projects/1"
fi

echo ""
echo -e "${GREEN}🎉 Timeline API is ready!${NC}"
echo ""
echo "📋 API Endpoints:"
echo "  GET    /timeline/projects/:id"
echo "  POST   /timeline/phases"
echo "  PATCH  /timeline/phases/:id"
echo "  DELETE /timeline/phases/:id"
echo "  PATCH  /timeline/phases/:id/progress"
