# 🎉 DEPLOYMENT COMPLETE - Testing Instructions

## ✅ What's Been Done

### 1. Backend Deployment ✅
- **PM2 Status**: ONLINE (PID 612302)
- **Health Endpoint**: https://baotienweb.cloud/api/v1/health ✅
- **Database**: PostgreSQL UP ✅
- **API Docs**: https://baotienweb.cloud/api/docs

### 2. Database Migrations ✅
```sql
✅ Role Enum: 8 values
   {CLIENT, ENGINEER, ADMIN, CONTRACTOR, ARCHITECT, DESIGNER, SUPPLIER, STAFF}

✅ Email Verification: 5 columns added
   - emailVerified (boolean)
   - emailVerificationCode (varchar)
   - emailVerificationExpires (timestamp)
   - phone (varchar)
   - location (jsonb)

✅ Contacts Table: Created
   - id, userId, friendId, status, createdAt, updatedAt
   - ContactStatus enum: PENDING, ACCEPTED, BLOCKED
```

### 3. Frontend Code Updated ✅
- ✅ auth-3d-flip.tsx: Staff secret key validation added
- ✅ authApi.ts: 8 UserRole types defined
- ✅ auth-helpers.ts: RegisterFormData updated
- ✅ useAuthForms.ts: Default role changed to CLIENT
- ✅ AuthContext.tsx: Role sent to backend

### 4. Test Scripts Created ✅
- ✅ `test-registration.ps1` - API testing script
- ✅ `verify-database.sh` - Database verification script
- ✅ `TEST_GUIDE.md` - Comprehensive testing guide

---

## 🚀 YOUR ACTION REQUIRED

### Step 1: Run API Tests (PowerShell)
Open **NEW PowerShell window** (NOT VS Code terminal):

```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
.\test-registration.ps1
```

**Expected Output**:
```
✓ CLIENT registration successful!
✓ ENGINEER registration successful!
✓ CONTRACTOR registration successful!
✓ STAFF registration successful!
✓ ARCHITECT registration successful!
```

---

### Step 2: Verify Database (on VPS)
SSH vào VPS và check:

```bash
ssh root@103.200.20.100

# Quick check recent users
sudo -u postgres psql -d postgres -c "SELECT id, email, role FROM users ORDER BY id DESC LIMIT 5;"

# Full verification
cd /tmp
bash verify-database.sh
```

---

### Step 3: Test Frontend Staff Secret
1. **Start Expo:**
   ```powershell
   cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
   npm start
   ```

2. **Open App** (press `a` for Android)

3. **Navigate to Register screen:**
   - Tap "Create Account"
   - Scroll để xem 8 role buttons

4. **Test Staff Secret Key:**
   - Chọn role "STAFF" (briefcase icon)
   - ✅ Input "Mã bảo mật nhân viên" PHẢI HIỆN
   - Nhập `Nhaxinh@123` → Đăng ký thành công ✅
   - Nhập sai → Báo lỗi ❌

---

## 📊 Verify Your Results

### API Tests - Expected Results:
```
✅ 5 users created successfully
✅ Each user has correct role (CLIENT, ENGINEER, etc.)
✅ Access tokens returned
✅ No database errors
```

### Database - Expected Results:
```
✅ Role enum shows 8 values
✅ Users table has new columns (emailVerified, emailVerificationCode...)
✅ Contacts table exists
✅ New test users appear in database
```

### Frontend - Expected Results:
```
✅ 8 role buttons visible
✅ Staff secret input appears for STAFF role only
✅ Validation blocks wrong secret
✅ Registration succeeds with correct secret
```

---

## 🎯 After Testing Complete

### ✅ If All Tests Pass:
**Report back with:**
```
Tất cả tests PASS ✅
- API registration: 5/5 roles work
- Database: All migrations applied
- Frontend: Staff secret validation works
```

**Next priorities:**
1. Email Verification Service (2-3 hours)
2. Contacts/Friends API (3-4 hours)
3. Progress Map Canvas (4 weeks)

---

### ❌ If Any Tests Fail:
**Report back với:**
```
Test FAILED ❌
Issue: [Mô tả lỗi]
Error message: [Copy error text]
Screenshot: [If UI issue]
```

**Troubleshooting steps:**
1. Check PM2 logs: `pm2 logs baotienweb-api`
2. Verify backend is running: `pm2 status`
3. Test API manually with curl
4. Clear app cache and restart

---

## 📝 Quick Test Checklist

Copy và paste sau khi test xong:

```
[ ] test-registration.ps1 ran successfully
[ ] All 5 roles created users in database
[ ] Database has 8 role enum values
[ ] Email verification columns exist
[ ] Contacts table created
[ ] Frontend shows 8 role buttons
[ ] Staff secret input appears for STAFF role
[ ] Staff secret validation works correctly
[ ] Can login with newly created users
```

---

## 📞 Need Help?

**If PowerShell script fails:**
- Try Git Bash with curl commands (in TEST_GUIDE.md)
- Test manually via Postman
- Check Swagger docs: https://baotienweb.cloud/api/docs

**If database queries fail:**
- Check PM2: `pm2 status`
- Check PostgreSQL: `systemctl status postgresql`
- Verify user has sudo access

**If frontend issues:**
- Clear cache: `Remove-Item .expo -Recurse -Force`
- Restart Metro: `npm start`
- Check API_URL in code points to correct server

---

## 🎊 Deployment Summary

**Backend**: ✅ DEPLOYED  
**Database**: ✅ MIGRATED  
**Frontend**: ✅ CODE READY  
**Tests**: ⏳ YOUR TURN

**Run the tests now and report results!** 🚀

---

## Files Created:
- ✅ test-registration.ps1 - API test script
- ✅ verify-database.sh - DB verification script
- ✅ TEST_GUIDE.md - Detailed testing guide
- ✅ DEPLOY_QUICK_GUIDE.md - Deployment commands
- ✅ PROGRESS_MAP_SPEC.md - Progress map technical spec
- ✅ PROGRESS_MAP_COMPONENTS.md - Component architecture

**All files are in project root directory.**
