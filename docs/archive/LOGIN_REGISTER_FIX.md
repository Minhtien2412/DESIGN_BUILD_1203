# Login/Register Fix - API URL Configuration

## Vấn đề phát hiện

**Lỗi**: Không thể đăng ký/đăng nhập trong app

**Nguyên nhân**: API URL trong config sai!
- ❌ Config cũ: `https://api.thietkeresort.com.vn`
- ✅ Backend thực tế: `https://baotienweb.cloud/api/v1`

## Files đã sửa

### 1. `app.config.ts`
```typescript
// BEFORE
const PROD_API_URL = 'https://api.thietkeresort.com.vn';
const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || DEV_API_URL;

// AFTER
const PROD_API_URL = 'https://baotienweb.cloud/api/v1';
const ENV_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || PROD_API_URL;
```

### 2. `config/env.ts`
```typescript
// BEFORE
API_BASE_URL: extra.API_URL || extra.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn',
WS_URL: extra.EXPO_PUBLIC_WS_URL || 'wss://api.thietkeresort.com.vn/ws',

// AFTER
API_BASE_URL: extra.API_URL || extra.EXPO_PUBLIC_API_BASE_URL || 'https://baotienweb.cloud/api/v1',
WS_URL: extra.EXPO_PUBLIC_WS_URL || 'wss://baotienweb.cloud/ws',
```

## Verification - Backend APIs hoạt động 100%

### Login Test ✅
```bash
POST https://baotienweb.cloud/api/v1/auth/login
Body: {"email":"client.test@demo.com","password":"Test123456"}
Response: 200 OK
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 15,
    "email": "client.test@demo.com",
    "name": "Client Demo",
    "role": "CLIENT"
  }
}
```

### Register Test ✅
```bash
POST https://baotienweb.cloud/api/v1/auth/register
Body: {"email":"testuser2333@demo.com","password":"Test123456","name":"Test User","role":"CLIENT"}
Response: 200 OK
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 19,
    "email": "testuser2333@demo.com",
    "name": "Test User",
    "role": "CLIENT"
  }
}
```

## Test Accounts Available

| Email | Password | Role | User ID |
|-------|----------|------|---------|
| client.test@demo.com | Test123456 | CLIENT | 15 |
| engineer.test@demo.com | Test123456 | ENGINEER | 16 |
| admin.test@demo.com | Test123456 | ADMIN | 17 |

## Next Steps

1. **Restart Expo dev server** để load config mới:
   ```bash
   # Stop current server (Ctrl+C)
   # Clear cache and restart
   npx expo start --clear
   ```

2. **Test login trong app**:
   - Mở app
   - Nhập: `client.test@demo.com` / `Test123456`
   - Nhấn "Đăng nhập"
   - Should redirect to main app

3. **Test register**:
   - Tap "Đăng ký"
   - Nhập email mới, password, tên
   - Chọn role (CLIENT/ENGINEER/ADMIN)
   - Should create account và login

## Technical Notes

### API Structure
- **Base URL**: `https://baotienweb.cloud/api/v1`
- **Auth endpoints**:
  - POST `/auth/login` - Login with email/password
  - POST `/auth/register` - Register new account
  - GET `/auth/profile` - Get current user profile
  - POST `/auth/refresh` - Refresh access token

### Token Management
- **Access Token**: Expires in 15 minutes, stored in SecureStore
- **Refresh Token**: Expires in 7 days, used to get new access token
- **Storage**: Uses `utils/storage.ts` wrapper (web: localStorage, native: SecureStore)

### Auth Flow
1. User enters credentials → `AuthContext.signIn()`
2. Call `authApi.login()` → POST `/auth/login`
3. Backend validates → returns tokens + user
4. Store tokens in SecureStore
5. Update AuthContext state
6. Navigate to `/(tabs)`

## Related Files

- `context/AuthContext.tsx` - Auth state management
- `services/api/authApi.ts` - Auth API client
- `app/(auth)/login.tsx` - Login screen
- `app/(auth)/register.tsx` - Register screen
- `utils/storage.ts` - Secure storage wrapper

## Status

✅ **FIXED** - API URLs corrected, login/register should work after restarting Expo

---
*Fixed on: December 11, 2025*
