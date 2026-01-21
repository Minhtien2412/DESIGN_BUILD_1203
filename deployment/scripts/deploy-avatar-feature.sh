#!/bin/bash
# Deploy avatar upload feature to server

echo "=== Deploy Avatar Upload Feature ==="

# Step 1: Update Prisma schema
echo "Step 1: Updating Prisma schema..."
cat > /var/www/baotienweb-api/prisma/migrations/add_avatar/migration.sql << 'SQL'
-- Add avatar columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarThumbnail" VARCHAR(255);
SQL

# Run migration directly
psql "$DATABASE_URL" -f /var/www/baotienweb-api/prisma/migrations/add_avatar/migration.sql 2>/dev/null || echo "Migration already applied or skipped"

# Step 2: Update Prisma schema file
echo "Step 2: Updating schema.prisma..."
# Check if avatar already exists in schema
if ! grep -q "avatar" /var/www/baotienweb-api/prisma/schema.prisma; then
  sed -i '/name.*String?/a\  avatar                              String?\n  avatarThumbnail                     String?' /var/www/baotienweb-api/prisma/schema.prisma
  echo "Avatar fields added to schema"
else
  echo "Avatar fields already exist"
fi

# Step 3: Generate Prisma client
echo "Step 3: Generating Prisma client..."
cd /var/www/baotienweb-api
npx prisma generate

# Step 4: Create uploads directory
echo "Step 4: Creating uploads directory..."
mkdir -p /var/www/baotienweb-api/public/uploads/avatars
chmod 755 /var/www/baotienweb-api/public/uploads/avatars

# Step 5: Rebuild and restart
echo "Step 5: Rebuilding backend..."
npm run build

echo "Step 6: Restarting PM2..."
pm2 restart baotienweb-api

echo "=== Done! ==="
echo "Avatar upload endpoint: POST /api/v1/profile/avatar"
