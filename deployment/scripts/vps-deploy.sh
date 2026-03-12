#!/bin/bash
# Deploy script - runs on VPS after code upload
set -e

BACKEND_DIR="/var/www/baotienweb-api"
echo "=== DEPLOYING TO $BACKEND_DIR ==="
cd "$BACKEND_DIR"

# Backup
echo "[1] Backup..."
cp -r src "src_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true

# Extract
echo "[2] Extract..."
rm -rf /tmp/backend-extract
mkdir -p /tmp/backend-extract
cd /tmp/backend-extract
unzip -o /tmp/backend-deploy.zip

# Handle nested paths from Windows Compress-Archive
if [ -d "BE-baotienweb.cloud" ]; then
  cp -r BE-baotienweb.cloud/* "$BACKEND_DIR/"
elif [ -d "src" ]; then
  cp -r * "$BACKEND_DIR/"
else
  # Try finding src directory
  NESTED=$(find . -name "src" -type d | head -1)
  if [ -n "$NESTED" ]; then
    PARENT=$(dirname "$NESTED")
    cp -r "$PARENT"/* "$BACKEND_DIR/"
  else
    echo "WARNING: Could not find src in archive"
    ls -la
  fi
fi
cd "$BACKEND_DIR"
rm -rf /tmp/backend-deploy.zip /tmp/backend-extract

# NPM Install
echo "[3] npm install..."
npm install --legacy-peer-deps 2>&1 | tail -3

# Migration SQL
echo "[4] Run migration SQL..."
MIGRATION_SQL="prisma/migrations/manual/add_modules_phase1_5.sql"
if [ -f "$MIGRATION_SQL" ]; then
  DB_URL=$(grep "^DATABASE_URL" .env | sed 's/DATABASE_URL=//;s/"//g;s/^[[:space:]]*//;s/[[:space:]]*$//')
  if [ -n "$DB_URL" ]; then
    echo "Applying migration..."
    psql "$DB_URL" -f "$MIGRATION_SQL" 2>&1 | grep -E "(CREATE|ALTER|ERROR|NOTICE)" | head -50 || true
    echo "Migration applied"
  else
    echo "WARNING: no DATABASE_URL"
  fi
else
  echo "No migration SQL found"
fi

# Prisma generate
echo "[5] prisma generate..."
npx prisma generate

# Prisma migrate deploy
echo "[6] prisma migrate deploy..."
npx prisma migrate deploy 2>&1 || echo "Note: some migrations may already be applied"

# Build
echo "[7] Build..."
npm run build 2>&1 | tail -5
if [ ! -f "dist/main.js" ]; then
  echo "ERROR: Build failed"
  exit 1
fi

# Restart PM2
echo "[8] Restart PM2..."
pm2 restart baotienweb-api || pm2 start dist/main.js --name baotienweb-api

echo ""
echo "=== DEPLOYMENT DONE ==="
sleep 3
pm2 status
curl -s http://localhost:3000/health 2>/dev/null || echo "Health check pending..."
