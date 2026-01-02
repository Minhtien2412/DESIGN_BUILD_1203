#!/bin/bash
# VPS Deployment Script - Run this ON VPS after upload
# Usage: bash deploy-on-vps.sh

set -e  # Exit on error

echo "=== BƯỚC 1: BACKUP HIỆN TẠI ==="
cd /root/baotienweb-api
pm2 stop baotienweb-api || true

BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
echo "Tạo backup: $BACKUP_NAME"
tar -czf "$BACKUP_NAME" dist/ prisma/ || true

echo ""
echo "=== BƯỚC 2: GIẢI NÉN FILE MỚI ==="
cd /tmp
if [ -f "deploy-complete.zip" ]; then
    echo "Giải nén deploy-complete.zip..."
    unzip -o deploy-complete.zip -d /root/baotienweb-api-update
    echo "✓ Giải nén thành công"
else
    echo "✗ Không tìm thấy deploy-complete.zip trong /tmp/"
    exit 1
fi

echo ""
echo "=== BƯỚC 3: COPY FILES MỚI ==="
cd /root/baotienweb-api
cp -r /root/baotienweb-api-update/dist/* ./dist/
cp /root/baotienweb-api-update/*.sql ./ || true
echo "✓ Copy files thành công"

echo ""
echo "=== BƯỚC 4: CHẠY MIGRATIONS ==="

# Migration 1: Add new roles
if [ -f "add_new_roles.sql" ]; then
    echo "► Chạy add_new_roles.sql..."
    psql -U postgres -d postgres -f add_new_roles.sql
    echo "✓ Roles migration hoàn thành"
fi

# Migration 2: Add email verification
if [ -f "add_email_verification.sql" ]; then
    echo "► Chạy add_email_verification.sql..."
    psql -U postgres -d postgres -f add_email_verification.sql
    echo "✓ Email verification migration hoàn thành"
fi

# Migration 3: Add contacts table
if [ -f "add_contacts_table.sql" ]; then
    echo "► Chạy add_contacts_table.sql..."
    psql -U postgres -d postgres -f add_contacts_table.sql
    echo "✓ Contacts migration hoàn thành"
fi

echo ""
echo "=== BƯỚC 5: VERIFY DATABASE ==="
echo "Checking Role enum..."
psql -U postgres -d postgres -c "SELECT enum_range(NULL::\"Role\");"

echo ""
echo "Checking users table columns..."
psql -U postgres -d postgres -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('emailVerified', 'emailVerificationCode', 'phone', 'location');"

echo ""
echo "Checking contacts table..."
psql -U postgres -d postgres -c "\d contacts" || echo "⚠ Contacts table chưa tạo"

echo ""
echo "=== BƯỚC 6: RESTART PM2 ==="
pm2 restart baotienweb-api
sleep 2

echo ""
echo "=== BƯỚC 7: KIỂM TRA LOGS ==="
pm2 logs baotienweb-api --lines 30 --nostream

echo ""
echo "=== DEPLOYMENT HOÀN THÀNH ==="
echo "✓ Backend đã deploy xong"
echo "✓ Backup lưu tại: /root/baotienweb-api/$BACKUP_NAME"
echo ""
echo "Test API:"
echo "  curl http://localhost:3000/health"
echo ""
echo "Xem logs realtime:"
echo "  pm2 logs baotienweb-api"
