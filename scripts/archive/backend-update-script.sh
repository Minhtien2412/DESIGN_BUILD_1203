#!/bin/bash
# Backend Update Script
# Chạy script này trên server baotienweb.cloud

set -e

echo "🚀 Starting backend update..."

# 1. Backup database
echo "📦 Creating database backup..."
mysqldump -u root -p construction_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
echo "🗄️  Running database migration..."
mysql -u root -p construction_db << EOF
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8) NULL,
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8) NULL,
ADD COLUMN IF NOT EXISTS location_address TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_latitude, location_longitude);
EOF

# 3. Restart backend service
echo "🔄 Restarting backend service..."
cd /var/www/BE-baotienweb.cloud
npm run build
pm2 restart construction-api

echo "✅ Backend update completed!"
echo "📝 Please verify:"
echo "   - Database schema: mysql -u root -p -e 'DESCRIBE users' construction_db"
echo "   - API status: curl https://baotienweb.cloud/api/v1/health"
