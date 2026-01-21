#!/bin/bash
# Verify database changes after deployment
# Run this on VPS: bash verify-database.sh

echo "=== VERIFYING DATABASE CHANGES ==="
echo ""

echo "1. Checking Role enum (should have 8 values):"
sudo -u postgres psql -d postgres -c "SELECT enum_range(NULL::\"Role\");" 2>/dev/null || echo "Error: Cannot connect to database"

echo ""
echo "2. Checking email verification columns in users table:"
sudo -u postgres psql -d postgres -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('emailVerified', 'emailVerificationCode', 'emailVerificationExpires', 'phone', 'location') ORDER BY column_name;" 2>/dev/null

echo ""
echo "3. Checking contacts table structure:"
sudo -u postgres psql -d postgres -c "\d contacts" 2>/dev/null

echo ""
echo "4. Recent registered users (last 10):"
sudo -u postgres psql -d postgres -c "SELECT id, email, name, role, \"createdAt\" FROM users ORDER BY id DESC LIMIT 10;" 2>/dev/null

echo ""
echo "5. User count by role:"
sudo -u postgres psql -d postgres -c "SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;" 2>/dev/null

echo ""
echo "=== VERIFICATION COMPLETE ==="
