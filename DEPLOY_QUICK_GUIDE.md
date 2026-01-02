# 🚀 Quick Deployment Guide

## Bước 1: Upload file (từ Windows)

```powershell
scp "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud\deploy-complete.zip" root@103.200.20.100:/tmp/
```

Nhập password khi được hỏi.

---

## Bước 2: Upload deploy script

```powershell
scp "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\deploy-on-vps.sh" root@103.200.20.100:/tmp/
```

---

## Bước 3: SSH vào VPS và deploy

```bash
ssh root@103.200.20.100
```

Sau khi vào VPS, chạy:

```bash
cd /tmp
chmod +x deploy-on-vps.sh
./deploy-on-vps.sh
```

**Script sẽ tự động:**
1. ✅ Stop PM2
2. ✅ Backup version hiện tại
3. ✅ Giải nén file mới
4. ✅ Copy dist và SQL files
5. ✅ Chạy 3 migrations (roles → email verification → contacts)
6. ✅ Verify database changes
7. ✅ Restart PM2
8. ✅ Show logs

---

## Manual Commands (nếu script fail)

```bash
# SSH vào VPS
ssh root@103.200.20.100

# Stop PM2
pm2 stop baotienweb-api

# Backup
cd /root/baotienweb-api
tar -czf backup-$(date +%Y%m%d).tar.gz dist/ prisma/

# Extract
cd /tmp
unzip -o deploy-complete.zip -d /root/baotienweb-api-update

# Copy files
cd /root/baotienweb-api
cp -r /root/baotienweb-api-update/dist/* ./dist/
cp /root/baotienweb-api-update/*.sql ./

# Run migrations (THEO THỨ TỰ!)
psql -U postgres -d postgres -f add_new_roles.sql
psql -U postgres -d postgres -f add_email_verification.sql
psql -U postgres -d postgres -f add_contacts_table.sql

# Verify
psql -U postgres -d postgres -c "SELECT enum_range(NULL::\"Role\");"

# Restart
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 30
```

---

## Test sau deploy

### 1. Health check
```bash
curl http://localhost:3000/health
```

### 2. Test API từ bên ngoài
```powershell
# Từ máy local Windows
Invoke-WebRequest -Uri "https://baotienweb.cloud/api/v1/health" -UseBasicParsing
```

### 3. Test đăng ký với STAFF role
```bash
curl -X POST http://103.200.20.100:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff-test@example.com",
    "password": "Test123456",
    "name": "Test Staff",
    "role": "STAFF"
  }'
```

---

## Rollback (nếu có lỗi)

```bash
cd /root/baotienweb-api
pm2 stop baotienweb-api
rm -rf dist
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
pm2 restart baotienweb-api
```

---

## Files trong deploy-complete.zip

- ✅ `dist/` - Backend build (183MB)
- ✅ `node_modules/` - Dependencies
- ✅ `package.json` - Package info
- ✅ `prisma/` - Schema
- ✅ `.env` - Environment variables
- ✅ `add_new_roles.sql` - 8 roles migration
- ✅ `add_email_verification.sql` - Email verification fields
- ✅ `add_contacts_table.sql` - Contacts/friends table

---

## Expected Database Changes

### Role enum
```
{CLIENT, ENGINEER, ADMIN, CONTRACTOR, ARCHITECT, DESIGNER, SUPPLIER, STAFF}
```

### Users table new columns
- `emailVerified` (boolean)
- `emailVerificationCode` (varchar)
- `emailVerificationExpires` (timestamp)
- `phone` (varchar) - if not exists
- `location` (jsonb) - if not exists

### New table: contacts
```
id | userId | friendId | status | createdAt | updatedAt
```

---

## Support

Nếu gặp lỗi:
- Check logs: `pm2 logs baotienweb-api`
- Check PM2 status: `pm2 status`
- Check PostgreSQL: `systemctl status postgresql`
- Verify migrations: `psql -U postgres -d postgres -c "\dt"`

