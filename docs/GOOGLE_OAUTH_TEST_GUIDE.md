# Google OAuth Test Guide
**Date:** January 7, 2026  
**Client ID:** 147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com  
**Status:** ✅ Configured and Ready

---

## 📋 OAuth Configuration Summary

### Google Cloud Console Settings
```
Project: original-advice-414408
Client ID: 147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
Client Name: session.build
```

### Authorized Origins
- `https://baotienweb.cloud`

### Authorized Redirect URIs
- `https://baotienweb.cloud/api/v1`
- `https://baotienweb.cloud/api`

---

## 🔧 Updated Files

### 1. `.env`
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
```

### 2. `config/env.ts`
```typescript
GOOGLE_CLIENT_ID: extra.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com',
```

### 3. `hooks/useGoogleAuth.ts`
```typescript
const googleClientId = ENV.GOOGLE_CLIENT_ID || '147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com';
```

---

## 🧪 Testing Instructions

### Step 1: Restart Development Server
```bash
# Stop current server (Ctrl+C)

# Clear cache
npm start -- --clear

# Or with Expo
npx expo start --clear
```

### Step 2: Test Google Sign In Flow

#### A. Via Login Screen
1. Navigate to login screen (`/auth/login`)
2. Look for "Đăng nhập với Google" button
3. Tap the button
4. Should redirect to Google OAuth consent screen
5. Select your Google account
6. Grant permissions
7. Should redirect back to app with success

#### B. Via Register Screen
1. Navigate to register screen (`/auth/register`)
2. Look for "Đăng ký với Google" button
3. Follow same flow as login

#### C. Programmatic Test (Debug)
```typescript
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

function TestComponent() {
  const { signInWithGoogle, loading } = useGoogleAuth();
  
  const handleTest = async () => {
    try {
      const result = await signInWithGoogle();
      console.log('✅ Success:', result);
      // Expected output:
      // {
      //   token: "google_access_token",
      //   email: "user@gmail.com",
      //   name: "User Name",
      //   picture: "https://..."
      // }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
  
  return (
    <Button onPress={handleTest} disabled={loading}>
      Test Google Sign In
    </Button>
  );
}
```

---

## 🔍 Expected Behavior

### Success Flow
1. **User taps Google button** → Shows "Đang xử lý..."
2. **Opens Google OAuth** → Browser/WebView with Google consent screen
3. **User selects account** → Grants permissions
4. **Redirect back** → App receives access token
5. **Backend validation** → POST `/auth/google` with token
6. **Success** → User logged in, redirected to home

### Error Scenarios

#### Error 1: Invalid Client ID
```
Error: redirect_uri_mismatch
Solution: Check authorized URIs in Google Console match exactly
```

#### Error 2: Token Exchange Failed
```
Error: Không nhận được access token từ Google
Solution: Check Client ID is correct in .env
```

#### Error 3: Backend Validation Failed
```
Error: POST /auth/google returns 401
Solution: Ensure backend has correct Google Client Secret
```

---

## 📊 Test Checklist

### Frontend Tests
- [ ] Google button visible on login screen
- [ ] Google button visible on register screen
- [ ] Button shows loading state when tapped
- [ ] OAuth popup/redirect works
- [ ] Can select Google account
- [ ] Can grant permissions
- [ ] Redirect back to app works
- [ ] Success message shows
- [ ] User data populated correctly
- [ ] Token stored in AsyncStorage

### Backend Tests
- [ ] POST `/auth/google` endpoint exists
- [ ] Accepts `{ token: "..." }` payload
- [ ] Validates token with Google API
- [ ] Creates/updates user in database
- [ ] Returns JWT access token
- [ ] Returns refresh token
- [ ] Returns user profile

### Integration Tests
- [ ] First-time user: Creates new account
- [ ] Existing user: Logs in with existing account
- [ ] Email matches: Links to existing email account
- [ ] Profile picture synced from Google
- [ ] Name synced from Google
- [ ] Can logout and login again
- [ ] Token refresh works

---

## 🐛 Troubleshooting

### Issue 1: "redirect_uri_mismatch"
**Cause:** Redirect URI in request doesn't match authorized URIs  
**Fix:**
1. Check Google Console authorized redirect URIs
2. Should include: `https://baotienweb.cloud/api/v1`
3. Should include: `https://baotienweb.cloud/api`
4. Verify no trailing slashes

### Issue 2: "Đăng nhập Google bị hủy"
**Cause:** User cancelled OAuth flow or popup closed  
**Fix:** Normal behavior - user chose not to continue

### Issue 3: "Không thể lấy thông tin người dùng"
**Cause:** Access token invalid or expired  
**Fix:**
1. Check token is passed correctly
2. Verify scopes include 'profile' and 'email'
3. Check network connectivity

### Issue 4: Backend returns 401
**Cause:** Backend cannot verify Google token  
**Fix:**
1. Ensure backend has GOOGLE_CLIENT_SECRET env var
2. Check backend logs for specific error
3. Verify token is being sent in correct format

### Issue 5: "expo-auth-session not available"
**Cause:** Running in Expo Go without proper setup  
**Fix:**
1. Ensure `expo-auth-session` is installed: `npm install expo-auth-session`
2. Ensure `expo-web-browser` is installed: `npm install expo-web-browser`
3. Try clearing cache: `npx expo start --clear`

---

## 📱 Test on Different Platforms

### Web (Expo)
```bash
npm start
# Press 'w' for web
# Navigate to http://localhost:8081
# Test Google login
```

### iOS Simulator
```bash
npm start
# Press 'i' for iOS
# Test on simulator
```

### Android Emulator
```bash
npm start
# Press 'a' for Android
# Test on emulator
```

### Physical Device (Expo Go)
```bash
npm start
# Scan QR code with Expo Go app
# Test on real device
```

---

## 🔒 Security Checklist

- [x] Client ID stored in .env (not committed)
- [x] Client Secret only in backend (never in frontend)
- [x] HTTPS only for redirect URIs
- [x] Token validation on backend
- [x] Scopes limited to necessary permissions (profile, email)
- [ ] Rate limiting on OAuth endpoint (backend)
- [ ] CSRF protection (backend)
- [ ] Token expiration handling

---

## 📝 Test Results Log

### Test 1: Login Screen Button
**Date:** ___________  
**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________

### Test 2: OAuth Redirect
**Date:** ___________  
**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________

### Test 3: Account Selection
**Date:** ___________  
**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________

### Test 4: Backend Integration
**Date:** ___________  
**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________

### Test 5: User Profile Sync
**Date:** ___________  
**Result:** ⬜ Pass / ⬜ Fail  
**Notes:** ___________

---

## 🚀 Next Steps After Testing

1. **If Tests Pass:**
   - ✅ Mark OAuth as production-ready
   - ✅ Update user documentation
   - ✅ Enable in production build
   - ✅ Monitor error logs

2. **If Tests Fail:**
   - ❌ Check error logs
   - ❌ Review troubleshooting section
   - ❌ Test with different Google accounts
   - ❌ Verify backend configuration

3. **Production Deployment:**
   - Add production redirect URIs
   - Configure production Client ID
   - Set up monitoring/analytics
   - Test with real users

---

## 📞 Support Resources

### Documentation
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Native Google Sign In](https://github.com/react-native-google-signin/google-signin)

### Internal Docs
- `docs/GOOGLE_OAUTH_QUICK_START.md` (if exists)
- `docs/AUTH_FLOW.md` (if exists)
- Backend API documentation

### Debugging Commands
```bash
# Check env variables loaded
npx expo config

# View logs
npx expo start --clear

# Android logs
adb logcat | grep -i google

# iOS logs  
xcrun simctl spawn booted log stream --level debug
```

---

**Status:** ✅ Configuration Complete - Ready for Testing  
**Last Updated:** January 7, 2026  
**Configuration Valid Until:** OAuth tokens expire or Client ID rotated
