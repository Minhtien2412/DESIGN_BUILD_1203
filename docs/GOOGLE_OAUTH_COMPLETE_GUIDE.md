# Google OAuth Integration - Complete Guide

**Created:** 2026-01-07  
**Status:** ✅ Ready for Testing  
**Client ID:** `147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com`

---

## 📋 Overview

Google OAuth đã được tích hợp hoàn toàn vào app với Client ID mới từ Google Cloud Console. Tài liệu này hướng dẫn cách test và xác nhận tính năng hoạt động đúng.

### ✅ Completed Tasks

1. **Updated Configuration Files**
   - `.env` - EXPO_PUBLIC_GOOGLE_CLIENT_ID
   - `config/env.ts` - Fallback Client ID
   - `hooks/useGoogleAuth.ts` - OAuth hook fallback

2. **Implemented OAuth Flow**
   - `hooks/useGoogleAuth.ts` - OAuth với expo-auth-session
   - `app/(auth)/login-shopee.tsx` - Google Sign-In button handler
   - `context/AuthContext.tsx` - Google authentication methods

3. **Backend Integration**
   - Endpoint: `POST https://baotienweb.cloud/api/auth/google`
   - Payload: `{ token, email, name, picture }`

---

## 🔧 OAuth Configuration

### Google Cloud Console Settings

- **Project:** original-advice-414408
- **Client Name:** session.build
- **Client ID:** 147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
- **Type:** Web application

**Authorized JavaScript origins:**
```
https://baotienweb.cloud
```

**Authorized redirect URIs:**
```
https://baotienweb.cloud/api/v1
https://baotienweb.cloud/api
```

### App Configuration

**Redirect URI (Mobile):**
```
com.thietkeresort.app://oauth2redirect/google
```

**OAuth Scopes:**
- `profile` - Basic profile info
- `email` - Email address

---

## 🚀 Quick Start Testing

### Method 1: Automated Script (Recommended)

```powershell
# Run test script
.\test-google-oauth.ps1
```

Script will:
1. ✅ Verify .env configuration
2. 📦 Install dependencies
3. 🧹 Clear Expo cache
4. 🚀 Start development server

### Method 2: Manual Testing

```bash
# 1. Clear cache and restart
npm start -- --clear

# 2. Open in browser/simulator
# Press 'w' for web, 'i' for iOS, 'a' for Android

# 3. Navigate to login screen
# Tap "Đăng nhập với Google" button

# 4. Complete OAuth flow
# Select Google account → Grant permissions → Redirect back
```

---

## 📝 Testing Checklist

### Frontend Tests

- [ ] **Button Visibility**
  - Google button visible on login screen
  - Button has correct icon (Google logo)
  - Button text: "Google"
  - Button color: #DB4437 (Google red)

- [ ] **OAuth Flow**
  - Tap button opens Google consent screen
  - Can select Google account
  - Permission dialog shows requested scopes
  - After granting, redirects back to app

- [ ] **Loading States**
  - Button shows loading indicator during OAuth
  - Form disabled while authenticating
  - No double-submit possible

- [ ] **Error Handling**
  - User cancels → Shows friendly error
  - Network failure → Shows retry option
  - Invalid token → Clear error message

### Backend Tests

- [ ] **Token Verification**
  - Backend receives Google access token
  - Backend validates token with Google API
  - User info extracted correctly

- [ ] **Account Creation/Login**
  - New user → Creates account automatically
  - Existing user → Logs in with existing account
  - User data synced properly

- [ ] **Token Response**
  - Backend returns JWT access token
  - Backend returns refresh token
  - Tokens stored securely

### Integration Tests

- [ ] **Full Flow**
  - Login → Navigate to home screen
  - User profile shows Google info
  - Avatar loads from Google picture URL
  - Email matches Google account

- [ ] **Cross-Platform**
  - Works on Web (Expo web)
  - Works on iOS Simulator
  - Works on Android Emulator
  - Works on physical devices

---

## 🔍 Testing Steps (Detailed)

### Step 1: Environment Setup

```powershell
# Verify .env file
cat .env | Select-String "GOOGLE_CLIENT_ID"

# Expected output:
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
# EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=147141134557-0qa1k33vfieq82algs5tfkctr0fou9bq.apps.googleusercontent.com
```

### Step 2: Start Development Server

```bash
# Clear cache (IMPORTANT for config changes)
npm start -- --clear

# Or with Expo CLI
npx expo start --clear
```

### Step 3: Open App

**Web:**
```
Press 'w' in terminal
Opens: http://localhost:8081
```

**iOS Simulator:**
```
Press 'i' in terminal
Requires: Xcode installed
```

**Android Emulator:**
```
Press 'a' in terminal
Requires: Android Studio + Emulator running
```

### Step 4: Navigate to Login

```
App loads → Home screen
Tap user icon → Shows login option
OR
Navigate directly to: /(auth)/login-shopee
```

### Step 5: Test Google Sign-In

1. **Tap "Google" button** (red button with Google logo)
2. **OAuth consent screen opens:**
   - Shows app name: "NhàXinh"
   - Shows requested permissions: profile, email
   - Lists Google accounts available

3. **Select Google account** to use
4. **Grant permissions** when prompted
5. **Redirect back** to app (automatically)

6. **Verify success:**
   - Alert shows: "Đăng nhập thành công"
   - Alert shows: "Chào mừng [Your Name]!"
   - Navigates to home screen (tabs)

### Step 6: Verify Backend Integration

**Check Metro logs:**
```
[Google Login] Starting OAuth flow...
[Google OAuth] Success!
Access Token: ya29.a0A...
[Google Login] OAuth success, got token
[Google Login] User: your.email@gmail.com Your Name
[Google Login] Backend authentication successful
```

**Check Network tab (if on web):**
```
POST https://baotienweb.cloud/api/auth/google
Status: 200 OK
Response: { accessToken: "...", refreshToken: "...", user: {...} }
```

---

## 🐛 Troubleshooting

### Issue 1: Button Does Nothing

**Symptoms:**
- Tap Google button → No response
- No OAuth screen appears

**Solutions:**
1. Check console for errors
2. Verify `useGoogleAuth` hook loaded correctly
3. Ensure `expo-auth-session` installed:
   ```bash
   npm install expo-auth-session expo-web-browser
   ```
4. Restart with `--clear` flag

### Issue 2: "Redirect URI Mismatch"

**Symptoms:**
- OAuth screen shows error
- Message: "redirect_uri_mismatch"

**Solutions:**
1. Verify authorized redirect URIs in Google Console
2. Check app scheme: `com.thietkeresort.app`
3. For web, ensure origin matches: `http://localhost:8081`
4. Add localhost to authorized origins (development only):
   ```
   http://localhost:8081
   http://localhost:19006
   ```

### Issue 3: "Invalid Client"

**Symptoms:**
- OAuth error: "invalid_client"

**Solutions:**
1. Verify Client ID in `.env` file (no typos)
2. Ensure Client ID is for "Web application" type
3. Check Client ID is enabled in Google Console
4. Wait 5-10 minutes after creating new Client ID

### Issue 4: Backend 401/403 Error

**Symptoms:**
- OAuth successful
- Backend returns 401 or 403

**Solutions:**
1. Verify backend `/auth/google` endpoint exists
2. Check backend has Google Client Secret configured
3. Ensure backend can validate Google tokens
4. Test backend directly:
   ```bash
   curl -X POST https://baotienweb.cloud/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"token":"TEST_TOKEN","email":"test@gmail.com"}'
   ```

### Issue 5: User Cancels Login

**Symptoms:**
- User closes OAuth screen
- App shows generic error

**Expected Behavior:**
- Should show: "Đăng nhập Google bị hủy hoặc thất bại"
- No stack trace or technical error
- Can retry immediately

**Verify:**
```typescript
// In login-shopee.tsx, check error handling:
catch (error: any) {
  setErrors({
    general: error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.',
  });
}
```

---

## 📊 Expected Results

### Success Case

**Console Logs:**
```
[Google Login] Starting OAuth flow...
[Google OAuth] Success!
Access Token: ya29.a0A...
User Info: { email: "user@gmail.com", name: "User Name", picture: "https://..." }
[Google Login] OAuth success, got token
[Google Login] User: user@gmail.com User Name
[Google Login] Backend authentication successful
```

**UI Behavior:**
1. OAuth consent screen appears (Google branding)
2. User selects account
3. App receives callback
4. Alert shows success message
5. Navigates to home screen
6. User profile shows Google info

**Network Requests:**
```
1. POST https://accounts.google.com/o/oauth2/v2/auth
   → Returns authorization code

2. POST https://www.googleapis.com/oauth2/v2/userinfo
   → Returns user profile

3. POST https://baotienweb.cloud/api/auth/google
   → Returns JWT tokens
```

### Error Case (User Cancels)

**Console Logs:**
```
[Google Login] Starting OAuth flow...
[Google OAuth] User cancelled login
[Google Login] Error: Đăng nhập Google bị hủy hoặc thất bại
```

**UI Behavior:**
1. OAuth screen appears
2. User taps "Cancel" or back button
3. Screen closes
4. Error message shows in red box
5. Can retry immediately

---

## 🔐 Security Checklist

- [ ] **Client ID not hardcoded** - Uses environment variables
- [ ] **Tokens not logged in production** - Debug logs only
- [ ] **HTTPS only** - All production endpoints use HTTPS
- [ ] **Token validation** - Backend validates Google tokens
- [ ] **Redirect URI validation** - Only authorized URIs accepted
- [ ] **Scope limitation** - Only request needed scopes (profile, email)
- [ ] **Token expiry** - Tokens have reasonable expiration time
- [ ] **Refresh tokens** - Backend issues refresh tokens
- [ ] **Error messages** - No sensitive info in error messages

---

## 📱 Platform-Specific Testing

### Web (Expo Web)

```bash
# Start web
npm run web

# Or
npx expo start --web
```

**Expected:**
- Opens in browser at `http://localhost:8081`
- OAuth opens in popup window
- Redirects back to same tab after auth

**Test:**
1. Click Google button
2. Popup opens with Google consent
3. After auth, popup closes
4. Main tab receives token
5. Login completes

### iOS Simulator

```bash
# Start iOS simulator
npm start
# Press 'i'
```

**Expected:**
- OAuth opens in Safari View Controller
- Native iOS UI/UX
- Smooth transition back to app

**Test:**
1. Tap Google button
2. Safari overlay appears
3. Complete auth in Safari
4. Auto-closes Safari
5. App receives callback

### Android Emulator

```bash
# Start Android emulator
npm start
# Press 'a'
```

**Expected:**
- OAuth opens in Chrome Custom Tab
- Native Android UI
- Material Design transitions

**Test:**
1. Tap Google button
2. Chrome Custom Tab opens
3. Complete auth in Chrome
4. Custom Tab closes
5. App receives callback

### Physical Devices

**iOS Device:**
```bash
# Build development client
eas build --profile development --platform ios

# Install on device (TestFlight or direct)
# Run: npx expo start --dev-client
```

**Android Device:**
```bash
# Build development client
eas build --profile development --platform android

# Install APK on device
# Run: npx expo start --dev-client
```

---

## 📈 Success Metrics

### Functional Metrics
- ✅ OAuth flow completes successfully
- ✅ User redirected back to app
- ✅ Backend receives and validates token
- ✅ JWT tokens issued and stored
- ✅ User logged in and navigated to home

### Performance Metrics
- ⏱️ OAuth initiation: < 500ms
- ⏱️ Google consent screen: < 2s to load
- ⏱️ Backend validation: < 1s
- ⏱️ Total flow: < 10s (ideal), < 30s (acceptable)

### Error Rate Metrics
- 🎯 Success rate: > 95%
- ⚠️ User cancel rate: < 10%
- ❌ Technical error rate: < 1%

---

## 🔄 Next Steps

### After Successful Testing

1. **Monitor Analytics**
   - Track Google login success rate
   - Monitor error types and frequency
   - Analyze user drop-off points

2. **Add Features**
   - Account linking (Google + email/password)
   - Profile picture sync
   - Auto-update email if changed

3. **Optimize UX**
   - Show Google profile picture immediately
   - Pre-fill forms with Google data
   - Remember last login method

4. **Production Deployment**
   - Test with production backend
   - Verify production redirect URIs
   - Monitor production error logs

### If Testing Fails

1. **Review Logs**
   - Check Metro bundler logs
   - Check browser console (if web)
   - Check backend logs

2. **Verify Configuration**
   - Double-check Client ID
   - Verify redirect URIs
   - Ensure scopes correct

3. **Test Backend Separately**
   - Use Postman/curl to test `/auth/google`
   - Verify endpoint accepts Google tokens
   - Check backend logs for errors

4. **Get Help**
   - Check Google OAuth documentation
   - Review expo-auth-session docs
   - Post issue with full error logs

---

## 📚 References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Project Documentation](./docs/)

---

## 📝 Test Results Log

**Date:** _____________  
**Tester:** _____________  
**Platform:** [ ] Web [ ] iOS [ ] Android  
**Result:** [ ] Pass [ ] Fail  

**Notes:**
```
[Record any issues, errors, or observations here]
```

---

**Last Updated:** 2026-01-07  
**Next Review:** After initial testing
