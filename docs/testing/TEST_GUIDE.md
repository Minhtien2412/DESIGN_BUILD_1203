# 🧪 Testing Guide - Registration API & Database Verification

## ✅ Deployment Status
- ✅ Backend deployed to VPS: 103.200.20.100
- ✅ PM2 running: baotienweb-api (online)
- ✅ Database migrations: 3/3 completed
- ✅ Role enum: 8 roles added
- ✅ Email verification: columns added
- ✅ Contacts table: created

---

## 📋 Test Plan Overview

### Phase 1: API Testing ⚡ (15 minutes)
1. Test registration với 5 roles khác nhau
2. Verify response có đúng format
3. Check database có user mới

### Phase 2: Frontend Testing 📱 (10 minutes)
4. Test Staff secret key validation
5. Test login với users vừa tạo
6. Verify UI hiển thị đúng role

### Phase 3: Database Verification 🗄️ (5 minutes)
7. Verify role enum có 8 values
8. Check email verification columns
9. Check contacts table structure

---

## 🚀 Phase 1: Run API Tests

### Method 1: PowerShell Script (Recommended)
```powershell
# Mở PowerShell mới (không dùng terminal trong VS Code)
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
.\test-registration.ps1
```

### Method 2: Manual cURL (từ Git Bash hoặc WSL)
```bash
# Test CLIENT role
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client-manual-001@example.com",
    "password": "Test123456",
    "name": "Manual Test Client",
    "role": "CLIENT"
  }'

# Test ENGINEER role
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "engineer-manual-001@example.com",
    "password": "Test123456",
    "name": "Manual Test Engineer",
    "role": "ENGINEER"
  }'

# Test CONTRACTOR role
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor-manual-001@example.com",
    "password": "Test123456",
    "name": "Manual Test Contractor",
    "role": "CONTRACTOR"
  }'

# Test STAFF role (backend accepts, frontend validates secret)
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff-manual-001@example.com",
    "password": "Test123456",
    "name": "Manual Test Staff",
    "role": "STAFF"
  }'

# Test ARCHITECT role
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "architect-manual-001@example.com",
    "password": "Test123456",
    "name": "Manual Test Architect",
    "role": "ARCHITECT"
  }'
```

### Expected Response Format:
```json
{
  "user": {
    "id": 123,
    "email": "test@example.com",
    "name": "Test User",
    "role": "CLIENT",
    "emailVerified": false,
    "createdAt": "2025-12-24T...",
    "updatedAt": "2025-12-24T..."
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## 📱 Phase 2: Frontend Testing

### Step 1: Start Expo Dev Server
```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
npm start
```

### Step 2: Open App on Android/iOS
- Press `a` for Android
- Press `i` for iOS
- Scan QR code on physical device

### Step 3: Navigate to Registration
1. Mở app
2. Tap "Create Account" hoặc "Đăng ký"
3. Xem 8 role buttons hiển thị

### Step 4: Test Staff Secret Key
1. Chọn role "STAFF" (icon briefcase)
2. **Input "Mã bảo mật nhân viên" phải hiện**
3. Nhập sai secret → Báo lỗi "Mã bảo mật không đúng"
4. Nhập đúng secret `Nhaxinh@123` → Cho phép đăng ký

### Step 5: Test Registration Flow
```
CLIENT → Đăng ký thành công ✅
ENGINEER → Đăng ký thành công ✅
CONTRACTOR → Đăng ký thành công ✅
STAFF (với secret đúng) → Đăng ký thành công ✅
STAFF (với secret sai) → Báo lỗi ❌
```

---

## 🗄️ Phase 3: Database Verification

### Method 1: Run Verification Script (on VPS)
```bash
# SSH vào VPS
ssh root@103.200.20.100

# Copy và run script
cd /tmp
bash verify-database.sh
```

### Method 2: Manual SQL Queries (on VPS)
```bash
ssh root@103.200.20.100

# 1. Check Role enum
sudo -u postgres psql -d postgres -c "SELECT enum_range(NULL::\"Role\");"

# Expected: {CLIENT,ENGINEER,ADMIN,CONTRACTOR,ARCHITECT,DESIGNER,SUPPLIER,STAFF}

# 2. Check recent users
sudo -u postgres psql -d postgres -c "SELECT id, email, name, role, \"createdAt\" FROM users ORDER BY id DESC LIMIT 10;"

# 3. Count users by role
sudo -u postgres psql -d postgres -c "SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC;"

# 4. Verify email verification columns
sudo -u postgres psql -d postgres -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('emailVerified', 'emailVerificationCode', 'emailVerificationExpires');"

# 5. Check contacts table
sudo -u postgres psql -d postgres -c "\d contacts"
```

---

## ✅ Success Criteria

### API Tests Pass If:
- ✅ All 5 roles can register successfully
- ✅ Response contains user object with correct role
- ✅ Access token and refresh token returned
- ✅ No 500 errors or database errors

### Frontend Tests Pass If:
- ✅ 8 role buttons hiển thị (CLIENT, ENGINEER, CONTRACTOR, ARCHITECT, DESIGNER, SUPPLIER, STAFF, ADMIN)
- ✅ Staff secret input chỉ hiện khi chọn STAFF role
- ✅ Validation chặn đăng ký nếu staff secret sai
- ✅ Đăng ký thành công với secret đúng
- ✅ UI không bị crash

### Database Verification Pass If:
- ✅ Role enum có đúng 8 values
- ✅ Users table có columns: emailVerified, emailVerificationCode, emailVerificationExpires, phone, location
- ✅ Contacts table tồn tại với đủ columns
- ✅ New users xuất hiện trong database với đúng role

---

## 🐛 Troubleshooting

### Issue 1: "Connection refused" khi test API
**Cause**: Backend không chạy hoặc PM2 stopped  
**Fix**:
```bash
ssh root@103.200.20.100
pm2 status
pm2 restart baotienweb-api
```

### Issue 2: "Role enum value invalid"
**Cause**: Migration chưa chạy hoặc Prisma client cũ  
**Fix**:
```bash
# On VPS
cd /root/baotienweb-api
sudo -u postgres psql -d postgres -f add_new_roles.sql
pm2 restart baotienweb-api
```

### Issue 3: Staff secret input không hiện trên app
**Cause**: Frontend code chưa deploy hoặc cache cũ  
**Fix**:
```powershell
# Clear Expo cache
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
Remove-Item -Path ".expo" -Recurse -Force
Remove-Item -Path "node_modules\.cache" -Recurse -Force
npm start
```

### Issue 4: "Email already exists"
**Cause**: Email đã được dùng trong test trước  
**Fix**: Đổi email khác hoặc dùng timestamp:
```
test-$(Get-Date -Format 'HHmmss')@example.com
```

---

## 📊 Test Results Template

Copy template này để track results:

```
=== API REGISTRATION TEST RESULTS ===
Date: 2025-12-24
Tester: [Your Name]

✅ CLIENT registration: PASS / FAIL
✅ ENGINEER registration: PASS / FAIL
✅ CONTRACTOR registration: PASS / FAIL
✅ STAFF registration: PASS / FAIL
✅ ARCHITECT registration: PASS / FAIL

=== FRONTEND TEST RESULTS ===
✅ 8 role buttons visible: YES / NO
✅ Staff secret input shows for STAFF role: YES / NO
✅ Staff secret validation works: YES / NO
✅ Registration flow completes: YES / NO

=== DATABASE VERIFICATION RESULTS ===
✅ Role enum has 8 values: YES / NO
✅ Email verification columns exist: YES / NO
✅ Contacts table exists: YES / NO
✅ New users in database: COUNT = ___

=== OVERALL STATUS ===
✅ DEPLOYMENT SUCCESSFUL
⚠️ DEPLOYMENT NEEDS FIXES (list issues below)
```

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅:
1. **Email Verification Implementation**
   - Create EmailService (NodeMailer/SendGrid)
   - Implement send-verification-email endpoint
   - Implement verify-email endpoint

2. **Contacts/Friends API Implementation**
   - Create ContactsController
   - Implement search, add, accept, remove endpoints
   - Add friend request notifications

3. **Progress Map Feature (4-week project)**
   - Setup React Flow canvas
   - Create custom nodes and edges
   - Implement drag-drop interactions

### If Tests Fail ❌:
1. Document all failures
2. Check PM2 logs: `pm2 logs baotienweb-api --lines 50`
3. Check database connection
4. Verify migrations ran successfully
5. Report issues with error messages

---

## 📞 Support

Nếu gặp lỗi hoặc cần hỗ trợ:
1. Check PM2 logs trước
2. Verify database status
3. Check API endpoint với Swagger: https://baotienweb.cloud/api/docs
4. Test với Postman nếu cURL không work

---

**Happy Testing! 🚀**
