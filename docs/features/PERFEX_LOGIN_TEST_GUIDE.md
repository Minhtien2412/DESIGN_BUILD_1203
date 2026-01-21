# 🧪 Perfex Login Testing Guide

**Created:** 2025-12-31  
**Status:** ✅ Ready for testing  
**Features:** Quick Fill, Remember Me, Form Validation

---

## 📋 Test Checklist

### ✅ Quick Fill Feature (NEW)
- [ ] Open Perfex login screen
- [ ] Click "Quick Fill" button (orange, development only)
- [ ] Select **Staff Account** → Email/Password auto-filled
- [ ] Select **Customer Account** → Email/Password auto-filled
- [ ] Select **Admin Account** → Email/Password auto-filled
- [ ] User type automatically switches based on selection

### ✅ Remember Me Feature
- [ ] Enter email manually
- [ ] Check "Remember Me" checkbox
- [ ] Login successfully
- [ ] Sign out
- [ ] Return to login → Email auto-filled
- [ ] Uncheck "Remember Me" → Sign out → Email cleared

### ✅ Form Validation
- [ ] Empty email → Error: "Email không được để trống"
- [ ] Invalid email → Error: "Email không hợp lệ"
- [ ] Empty password → Error: "Mật khẩu không được để trống"
- [ ] Short password (< 6 chars) → Error: "Mật khẩu phải có ít nhất 6 ký tự"
- [ ] Valid form → Submit enabled

### ✅ User Type Toggle
- [ ] Switch Staff ↔ Customer → Placeholder updates
- [ ] Staff: `staff@example.com`
- [ ] Customer: `customer@example.com`

### ✅ Password Visibility
- [ ] Click eye icon → Password visible
- [ ] Click again → Password hidden

### ✅ Navigation
- [ ] "Quay lại đăng nhập chính" → Main login screen
- [ ] Successful login → Dashboard (/(tabs))
- [ ] "Test API Connection" (dev only) → Test screen

---

## 🎯 Testing Scenarios

### Scenario 1: Quick Staff Login
```
1. Open: http://localhost:8083 → Login → "Đăng nhập Perfex CRM"
2. Click "Quick Fill" → Select "Staff Account"
3. Email: staff@thietkeresort.com (auto-filled)
4. Password: Staff@123 (auto-filled)
5. User Type: Staff (auto-selected)
6. Click "Đăng nhập"
7. Expected: Navigate to dashboard
```

### Scenario 2: Quick Customer Login
```
1. Click "Quick Fill" → Select "Customer Account"
2. Email: customer@thietkeresort.com
3. Password: Customer@456
4. User Type: Customer (auto-selected)
5. Login → Success
```

### Scenario 3: Real Customer Login
```
1. Manual entry:
   - Email: contact@baotienweb.cloud
   - Password: [Ask customer for password]
   - User Type: Customer
2. Check "Remember Me"
3. Login → Success
4. Sign out → Return → Email remembered
```

### Scenario 4: Admin Quick Test
```
1. Quick Fill → "Admin Account"
2. Email: admin@thietkeresort.com
3. Password: Admin@789
4. Login → Dashboard with admin permissions
```

---

## 📊 Test Credentials

### From Quick Fill Helper

| Role | Email | Password | Type |
|------|-------|----------|------|
| **Staff** | staff@thietkeresort.com | Staff@123 | Staff |
| **Customer** | customer@thietkeresort.com | Customer@456 | Customer |
| **Admin** | admin@thietkeresort.com | Admin@789 | Staff |

### From Real API (Requires Real Password)

| Company | Email | Website | UserID |
|---------|-------|---------|--------|
| Anh Khương Q9 | contact@baotienweb.cloud | baotienweb.cloud | 1 |
| NHÀ XINH | contact@nhaxinhdesign.com | nhaxinhdesign.com | 2 |

---

## 🔧 How to Test

### Step 1: Start Server
```bash
# Server already running on port 8083 (16GB memory)
# Navigate to: http://localhost:8083
```

### Step 2: Navigate to Perfex Login
```
1. Open web browser
2. Go to: http://localhost:8083
3. Click "Đăng nhập" (if not logged in)
4. Click "Đăng nhập Perfex CRM"
```

### Step 3: Use Quick Fill
```
1. Click orange "Quick Fill" button
2. Select account type
3. Review auto-filled credentials
4. Click "Đăng nhập"
```

### Step 4: Test Remember Me
```
1. Check "Nhớ tài khoản này"
2. Login successfully
3. Sign out from dashboard
4. Return to login → Email preserved
```

### Step 5: Test Validation
```
1. Leave email empty → Submit → Error shown
2. Enter invalid email → Error shown
3. Enter short password → Error shown
4. Fix all errors → Submit enabled
```

---

## 🎨 UI Features to Verify

### ✅ Visual Elements
- [ ] Gradient background (blue/cyan)
- [ ] Perfex CRM logo centered
- [ ] "Quick Fill" button (orange, dev only)
- [ ] User type toggle (Staff/Customer)
- [ ] Email input with mail icon
- [ ] Password input with lock icon
- [ ] Eye icon for password visibility
- [ ] Remember Me checkbox
- [ ] Login button with loading state
- [ ] Switch to main login link
- [ ] Test API link (dev only)

### ✅ Interactions
- [ ] Smooth keyboard dismissal on scroll
- [ ] Input focus highlights
- [ ] Loading spinner during login
- [ ] Error messages appear/disappear
- [ ] Modal animation for Quick Fill

---

## 🐛 Known Issues

### Staff API Endpoint
```
❌ /api/staff → 404 Not Found
✅ /api/customers → Works (2 customers)
✅ /api/projects → Works (1 project)
```

**Solution:** Use customer credentials for testing until staff endpoint is fixed.

### Development Only Features
The following features only appear in development mode (`__DEV__ = true`):
- Quick Fill button
- Test API Connection link

---

## 📝 Test Results Template

```markdown
### Test Results - [Date]

**Tester:** [Your Name]  
**Environment:** Web / iOS / Android  
**Server:** http://localhost:8083

#### Quick Fill Tests
- [ ] Staff Account: ✅/❌
- [ ] Customer Account: ✅/❌
- [ ] Admin Account: ✅/❌

#### Remember Me Tests
- [ ] Save email: ✅/❌
- [ ] Auto-fill on return: ✅/❌
- [ ] Clear on uncheck: ✅/❌

#### Form Validation Tests
- [ ] Empty email error: ✅/❌
- [ ] Invalid email error: ✅/❌
- [ ] Password length error: ✅/❌
- [ ] Success submission: ✅/❌

#### Navigation Tests
- [ ] Back to main login: ✅/❌
- [ ] Redirect to dashboard: ✅/❌
- [ ] Test API screen: ✅/❌

#### Issues Found
1. [Describe issue]
2. [Describe issue]
```

---

## 🚀 Next Steps After Testing

### If Tests Pass ✅
1. Test with real Perfex CRM credentials
2. Add biometric authentication
3. Add password reset flow
4. Add social login integration

### If Tests Fail ❌
1. Check console logs for errors
2. Verify PerfexAuthContext working
3. Check network requests in DevTools
4. Review form validation logic

---

## 🛠️ Debugging Tips

### Check Login Flow
```bash
# Open browser console (F12)
# Look for these logs:
[PerfexLogin] Email: ...
[PerfexLogin] Password: [hidden]
[PerfexLogin] UserType: staff/customer
[PerfexAuth] signIn called
[PerfexAuth] Success/Error
```

### Check Storage
```javascript
// In browser console:
localStorage.getItem('perfex_last_email')
localStorage.getItem('perfex_last_usertype')
```

### Check API Calls
```bash
# Network tab → Filter: Fetch/XHR
# Look for: /api/customers, /api/projects
# Headers: authtoken = eyJ0eXAi...
```

---

## 📞 Support

**Questions?** Check these files:
- `PERFEX_CRM_AUTH_GUIDE.md` - API authentication details
- `PERFEX_LOGIN_GUIDE.md` - Implementation guide
- `PERFEX_LOGIN_QUICKSTART.md` - Quick start guide
- `constants/testCredentials.ts` - Test credential definitions
- `components/dev/DevLoginHelper.tsx` - Quick Fill component

**Need Help?** Contact ThietKeResort Team

---

**Last Updated:** 2025-12-31  
**Version:** 1.0.0  
**Status:** Ready for testing ✅
