# 🔐 Test Accounts - Quick Reference

**Created**: December 11, 2025  
**Backend**: https://baotienweb.cloud/api/v1

---

## 📝 Test Credentials

### 👤 CLIENT Account
```
Email:    client.test@demo.com
Password: Test123456
Role:     CLIENT
User ID:  15
```

### 🔨 ENGINEER Account
```
Email:    engineer.test@demo.com
Password: Test123456
Role:     ENGINEER
User ID:  16
```

### 🛡️ ADMIN Account
```
Email:    admin.test@demo.com
Password: Test123456
Role:     ADMIN
User ID:  17
```

---

## 🚀 Quick Test Methods

### Method 1: In-App Test Button (Web)
1. Open: **http://localhost:8081**
2. Go to Login screen
3. Scroll down to see **"Test User (CLIENT)"** button (dev mode only)
4. Click to auto-login

### Method 2: PowerShell Script
```powershell
.\quick-test-login.ps1
```
- Select 1 for CLIENT
- Select 2 for ENGINEER
- Select 3 for ADMIN

### Method 3: Direct API Call
```powershell
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"client.test@demo.com","password":"Test123456"}'
```

---

## 📂 Related Files

- **`utils/testLogin.ts`** - Test login helper functions
- **`app/(auth)/login.tsx`** - Login screen with test button
- **`quick-test-login.ps1`** - PowerShell test script
- **`test-login-credentials.json`** - Last login tokens (auto-generated)
- **`test-accounts.json`** - Account details (auto-generated)

---

## ✅ Verification

Last tested: **December 11, 2025**  
Status: ✅ **All accounts working**

```
✅ CLIENT login successful (User ID: 15)
✅ ENGINEER account created (User ID: 16)  
✅ ADMIN account created (User ID: 17)
✅ Tokens received and saved
```

---

## 🔄 Reset Password

If accounts are locked or password forgotten:

```powershell
.\create-test-accounts.ps1
```

This will create fresh accounts with the same credentials (or skip if already exists).

---

## 🧪 Testing Workflow

1. **Start dev server**: `npm start`
2. **Open app**: http://localhost:8081
3. **Test login**: Click "Test User (CLIENT)" button
4. **Verify**: Should navigate to home screen with user data
5. **Check tokens**: Open `test-login-credentials.json` to see saved tokens

---

## 🐛 Troubleshooting

### Login fails with 401 Unauthorized
- ✅ Backend is running (check: https://baotienweb.cloud/api/v1/health)
- ❌ Password might be wrong
- 💡 Run `.\create-test-accounts.ps1` to reset

### Test button not showing
- Check if `__DEV__` is true (development mode)
- Test button only shows in dev builds, not production

### Backend connection issues
- Check internet connection
- Verify API base URL in `.env`: `API_BASE_URL=https://baotienweb.cloud`
- Check if backend health endpoint responds

---

## 📌 Quick Tips

- All test accounts use same password: **Test123456**
- Tokens expire after 7 days (refresh token valid for 30 days)
- Test data persists in backend database
- Use CLIENT role for most feature testing
- Use ENGINEER/ADMIN for permission-specific features

---

## 🔗 API Endpoints

```
POST /auth/login       - Login with email/password
POST /auth/register    - Create new account
POST /auth/refresh     - Refresh access token
GET  /auth/me          - Get current user profile
POST /auth/logout      - Logout (revoke tokens)
```

---

**Happy Testing! 🎉**
