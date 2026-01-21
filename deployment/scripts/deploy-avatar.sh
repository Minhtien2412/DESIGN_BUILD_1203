#!/bin/bash
# Deploy avatar upload feature
cd /var/www/baotienweb-api

# Regenerate Prisma
echo "=== Regenerating Prisma Client ==="
rm -rf node_modules/.prisma
npx prisma generate

# Build
echo "=== Building NestJS ==="
rm -rf dist
npm run build

# Restart PM2
echo "=== Restarting PM2 ==="
pm2 restart baotienweb-api
pm2 status

echo "=== Done ==="
