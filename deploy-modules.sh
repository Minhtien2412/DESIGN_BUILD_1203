#!/bin/bash
# Deploy script for new BE modules
# Usage: ./deploy-modules.sh

SERVER="root@103.200.20.100"
REMOTE_PATH="/var/www/baotienweb-api"
LOCAL_PATH="./BE-baotienweb.cloud"

echo "=== Deploying new modules to $SERVER ==="

# 1. Upload new modules
echo "📦 Uploading construction-map module..."
scp -r "$LOCAL_PATH/src/construction-map" "$SERVER:$REMOTE_PATH/src/"

echo "📦 Uploading labor module..."
scp -r "$LOCAL_PATH/src/labor" "$SERVER:$REMOTE_PATH/src/"

# 2. Upload updated app.module.ts
echo "📦 Uploading updated app.module.ts..."
scp "$LOCAL_PATH/src/app.module.ts" "$SERVER:$REMOTE_PATH/src/"

# 3. Rebuild on server
echo "🔨 Building on server..."
ssh $SERVER "cd $REMOTE_PATH && npm run build"

# 4. Restart PM2
echo "🔄 Restarting PM2 service..."
ssh $SERVER "pm2 restart baotienweb-api"

# 5. Health check
echo "🏥 Running health check..."
sleep 3
curl -s "https://baotienweb.cloud/api/v1/health" | jq

echo "✅ Deployment complete!"
