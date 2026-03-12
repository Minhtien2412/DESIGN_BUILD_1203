#!/bin/bash
# ===========================================
# DEPLOY SCRIPT FOR STRAPI CMS & BACKEND
# VPS: baotienweb.cloud (103.200.20.100)
# ===========================================

set -e

echo "=============================================="
echo "🚀 DEPLOYING STRAPI CMS + BACKEND TO VPS"
echo "=============================================="

# Variables
VPS_HOST="root@103.200.20.100"
STRAPI_REMOTE_PATH="/var/www/strapi-cms"
BACKEND_REMOTE_PATH="/var/www/baotienweb-backend"

# ==================== BACKEND DEPLOYMENT ====================
echo ""
echo "📦 Step 1: Deploying Backend Updates..."
echo "----------------------------------------"

# Sync backend changes
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='uploads' \
  BE-baotienweb.cloud/ $VPS_HOST:$BACKEND_REMOTE_PATH/

echo "✅ Backend files synced"

# Run migration and restart on VPS
ssh $VPS_HOST << 'EOF'
cd /var/www/baotienweb-backend
echo "📦 Installing dependencies..."
npm ci --only=production
echo "🔄 Running Prisma migration..."
npx prisma migrate deploy
echo "🔨 Building..."
npm run build
echo "🔄 Restarting backend..."
pm2 restart baotienweb-api || pm2 start dist/main.js --name baotienweb-api
pm2 save
echo "✅ Backend deployed!"
EOF

# ==================== STRAPI CMS DEPLOYMENT ====================
echo ""
echo "📦 Step 2: Deploying Strapi CMS..."
echo "-----------------------------------"

# Sync Strapi files
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.cache' \
  --exclude='build' \
  --exclude='dist' \
  --exclude='.tmp' \
  --exclude='.git' \
  --exclude='.env' \
  strapi-cms/ $VPS_HOST:$STRAPI_REMOTE_PATH/

echo "✅ Strapi files synced"

# Setup and start Strapi on VPS
ssh $VPS_HOST << 'EOF'
cd /var/www/strapi-cms

# Create .env if not exists
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
HOST=0.0.0.0
PORT=1337
APP_KEYS=strapi-key-1,strapi-key-2,strapi-key-3,strapi-key-4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
BACKEND_API_URL=https://baotienweb.cloud/api/v1
BACKEND_API_TOKEN=strapi-sync-token-secret-change-this
ENVEOF
  echo "✅ Created .env file"
fi

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building Strapi..."
npm run build

echo "🔄 Starting/Restarting Strapi..."
pm2 restart strapi-cms || pm2 start npm --name "strapi-cms" -- run start
pm2 save

echo "✅ Strapi CMS deployed!"
EOF

# ==================== NGINX CONFIGURATION ====================
echo ""
echo "🌐 Step 3: Configuring Nginx..."
echo "--------------------------------"

ssh $VPS_HOST << 'EOF'
# Create Nginx config for Strapi
cat > /etc/nginx/sites-available/strapi-cms << 'NGINXEOF'
server {
    listen 80;
    server_name cms.baotienweb.cloud;

    location / {
        proxy_pass http://127.0.0.1:1337;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
        proxy_max_temp_file_size 0;
        proxy_connect_timeout 900;
        proxy_send_timeout 900;
        proxy_read_timeout 900;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_temp_file_write_size 256k;
    }
}
NGINXEOF

# Enable site if not already
ln -sf /etc/nginx/sites-available/strapi-cms /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx
echo "✅ Nginx configured"

# SSL with Certbot (optional)
if ! [ -f /etc/letsencrypt/live/cms.baotienweb.cloud/fullchain.pem ]; then
  echo "🔐 Setting up SSL..."
  certbot --nginx -d cms.baotienweb.cloud --non-interactive --agree-tos -m admin@baotienweb.cloud || echo "⚠️ SSL setup failed, please run manually"
fi
EOF

echo ""
echo "=============================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "📍 Strapi CMS: https://cms.baotienweb.cloud/admin"
echo "📍 Backend API: https://baotienweb.cloud/api/v1"
echo ""
echo "📋 Post-deployment checklist:"
echo "   1. Create Strapi admin user (first access)"
echo "   2. Configure API tokens in Strapi"
echo "   3. Test sync endpoints"
echo ""
