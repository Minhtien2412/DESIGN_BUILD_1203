# Complete Migration Guide - Staff Secret Key + Email Verification + Contacts

## 📋 Tổng quan

### Frontend Changes
1. **Staff Secret Key Validation**: Role STAFF yêu cầu mã bảo mật `Nhaxinh@123`
2. **Role UI**: Thêm button "Nhân viên" trong registration screen
3. **Secret Input**: Hiện input password khi chọn STAFF role

### Backend Changes
1. **Prisma Schema Updates**:
   - Thêm `emailVerified`, `emailVerificationCode`, `emailVerificationExpires` vào User
   - Thêm `phone`, `location` vào User (nếu chưa có)
   - Tạo model `Contact` cho friends/contacts management
   - Enum `ContactStatus`: PENDING, ACCEPTED, BLOCKED

2. **SQL Migrations**:
   - `add_new_roles.sql` - Thêm 5 roles mới
   - `add_email_verification.sql` - Thêm email verification fields
   - `add_contacts_table.sql` - Tạo contacts table

---

## 🚀 Deploy Steps trên VPS (103.200.20.100)

### Bước 1: SSH vào VPS
```bash
ssh root@103.200.20.100
```

### Bước 2: Extract uploaded file
```bash
cd /root
mkdir -p baotienweb-api-update
cd /tmp
unzip -o deploy-roles.zip -d /root/baotienweb-api-update
```

### Bước 3: Stop PM2
```bash
pm2 stop baotienweb-api
```

### Bước 4: Backup current version
```bash
cd /root/baotienweb-api
tar -czf backup-$(date +%Y%m%d%H%M%S).tar.gz dist/ prisma/
```

### Bước 5: Copy new files
```bash
cp -r /root/baotienweb-api-update/dist/* /root/baotienweb-api/dist/
cp /root/baotienweb-api-update/*.sql /root/baotienweb-api/
```

### Bước 6: Run SQL migrations (THEO THỨ TỰ)
```bash
cd /root/baotienweb-api

# 1. Add new roles
psql -U postgres -d postgres -f add_new_roles.sql

# 2. Add email verification
psql -U postgres -d postgres -f add_email_verification.sql

# 3. Add contacts table
psql -U postgres -d postgres -f add_contacts_table.sql
```

### Bước 7: Verify database changes
```bash
# Check roles enum
psql -U postgres -d postgres -c "SELECT enum_range(NULL::\"Role\");"

# Check users table columns
psql -U postgres -d postgres -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('emailVerified', 'emailVerificationCode', 'phone', 'location');"

# Check contacts table
psql -U postgres -d postgres -c "\d contacts"
```

### Bước 8: Restart PM2
```bash
pm2 restart baotienweb-api
pm2 logs baotienweb-api --lines 30
```

### Bước 9: Test API
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test auth endpoint
curl http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'
```

---

## 🧪 Testing Plan

### Frontend Tests

#### 1. Test Staff Registration (Với mã đúng)
1. Mở app → Navigate to Register
2. Fill form: Name, Email, Password
3. Chọn role: "Nhân viên"
4. Nhập staff secret: `Nhaxinh@123`
5. ✅ Expect: Icon checkmark xanh hiện, có thể submit

#### 2. Test Staff Registration (Với mã sai)
1. Chọn role "Nhân viên"
2. Nhập staff secret: `wrongpassword`
3. ✅ Expect: Icon X đỏ hiện, error message "Mã bảo mật không đúng..."

#### 3. Test Non-Staff Roles
1. Chọn role: "Khách hàng", "Nhà thầu", etc.
2. ✅ Expect: Không hiện staff secret input
3. Submit → ✅ Expect: Đăng ký thành công

### Backend Tests

#### 1. Check Database Schema
```sql
-- Verify Role enum
SELECT enum_range(NULL::"Role");
-- Expected: {CLIENT,ENGINEER,ADMIN,CONTRACTOR,ARCHITECT,DESIGNER,SUPPLIER,STAFF}

-- Verify User columns
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';
-- Expected: emailVerified, emailVerificationCode, emailVerificationExpires, phone, location

-- Verify Contacts table
\d contacts
-- Expected: id, userId, friendId, status, createdAt, updatedAt
```

#### 2. Test Staff Registration API
```bash
# With valid secret (implement này ở backend controller)
curl -X POST http://103.200.20.100:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@test.com",
    "password": "Test123456",
    "name": "Test Staff",
    "role": "STAFF",
    "staffSecretKey": "Nhaxinh@123"
  }'
# Expected: 201 Created

# With wrong secret
curl -X POST http://103.200.20.100:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff2@test.com",
    "password": "Test123456",
    "name": "Test Staff 2",
    "role": "STAFF",
    "staffSecretKey": "wrongkey"
  }'
# Expected: 403 Forbidden "Không có quyền đăng ký tài khoản Nhân viên"
```

---

## 📝 Next Steps (Future Implementation)

### 1. Email Verification Service
- Create `EmailService` với NodeMailer hoặc SendGrid
- Endpoint: `POST /auth/send-verification-email`
- Endpoint: `POST /auth/verify-email`

### 2. Contacts/Friends API
- `GET /contacts` - Lấy danh sách bạn bè
- `POST /contacts/search` - Tìm kiếm user qua email/phone
- `POST /contacts/add/:userId` - Gửi lời mời kết bạn
- `PUT /contacts/:id/accept` - Chấp nhận lời mời
- `DELETE /contacts/:id` - Xóa bạn bè / Từ chối

### 3. Phone Number Verification
- SMS OTP integration (Twilio, AWS SNS)

---

## 🔧 Rollback Instructions

### If deployment fails:

```bash
# On VPS
cd /root/baotienweb-api
pm2 stop baotienweb-api

# Restore from backup
tar -xzf backup-YYYYMMDDHHMMSS.tar.gz

# Rollback database (if needed - BE CAREFUL!)
# You may need to manually drop added columns/tables

pm2 restart baotienweb-api
```

---

## 📊 Files Changed Summary

### Frontend
- `app/(auth)/auth-3d-flip.tsx` - Added staffSecretKey state, UI for STAFF role
- No other FE changes needed (hooks/context already support role)

### Backend
- `prisma/schema.prisma` - Added Contact model, email verification fields
- `add_new_roles.sql` - SQL migration for roles
- `add_email_verification.sql` - SQL migration for email verification
- `add_contacts_table.sql` - SQL migration for contacts

### Deploy Package
- `deploy-roles.zip` (183MB) - Already uploaded to VPS:/tmp/

---

## ⚠️ Important Notes

1. **Staff Secret Key**: Hardcoded `Nhaxinh@123` - Có thể move vào `.env` sau
2. **Email Verification**: Schema đã ready, cần implement EmailService
3. **Contacts**: Table đã ready, cần implement API endpoints
4. **Migrations**: Chạy theo thứ tự: roles → email_verification → contacts
5. **Testing**: Test kỹ trên local trước khi deploy production

---

## 📞 Support

Nếu gặp vấn đề:
1. Check PM2 logs: `pm2 logs baotienweb-api`
2. Check PostgreSQL logs: `journalctl -u postgresql`
3. Verify .env file có đúng DATABASE_URL
4. Test database connection: `psql -U postgres -d postgres -c "\dt"`

