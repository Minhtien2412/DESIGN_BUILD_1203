# AuthContext Migration Complete ✅

**Date:** 2025-02-10  
**Status:** Successfully migrated from old API to new Backend API v2.0

---

## Summary

`context/AuthContext.tsx` has been **fully refactored** to use the new API services layer (`services/authApi.new.ts` + `services/apiClient.ts`) instead of the old `services/api.ts`.

### Compilation Status
✅ **Zero TypeScript errors**  
✅ All imports resolved  
✅ All methods refactored  
✅ Error handling improved with Vietnamese messages

---

## Changes Made

### 1. Updated Imports

**Removed:**
```typescript
import { apiFetch, clearToken as clearApiToken, setAuthToken } from '@/services/api';
```

**Added:**
```typescript
import { login, logout, register, getCurrentUser } from '@/services/authApi.new';
import { getAccessToken, getRefreshToken, clearAuthTokens } from '@/services/apiClient';
import { handleApiError } from '@/utils/errorHandler';
import { router } from 'expo-router';
```

### 2. Removed Helper Functions

Deleted `setToken()` and `clearToken()` helper functions since token management is now handled by `apiClient.ts` automatically.

### 3. Refactored loadSession()

**Before:**
```typescript
const response = await apiFetch('/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After:**
```typescript
const userData = await getCurrentUser();
setUser(userData.user);
```

### 4. Refactored signIn()

**Before:**
```typescript
const response = await apiFetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
await setToken(response.token);
```

**After:**
```typescript
const response = await login({ email, password });
// Tokens automatically stored by apiClient
setUser(response.user);
```

### 5. Refactored signUp()

**Before:**
```typescript
const response = await apiFetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name, phone })
});
await setToken(response.token);
```

**After:**
```typescript
const response = await register({
  email,
  password,
  fullName: name, // Mapped to backend field name
  phoneNumber: phone
});
// Tokens automatically stored
setUser(response.user);
```

### 6. Refactored signOut()

**Before:**
```typescript
await apiFetch('/auth/logout', { method: 'POST' });
await clearToken();
```

**After:**
```typescript
const refreshToken = await getRefreshToken();
if (refreshToken) {
  await logout(refreshToken);
}
await clearAuthTokens();
router.replace('/(auth)/login');
```

### 7. Refactored refreshUser()

**Before:**
```typescript
const response = await apiFetch('/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**After:**
```typescript
const userData = await getCurrentUser();
setUser(userData.user);
```

### 8. Social Auth Methods Stubbed

All social authentication methods (`signInWithGoogle`, `signInWithFacebook`, etc.) have been **stubbed** with error messages:

```typescript
const signInWithGoogle = async () => {
  throw new Error('Google Sign-In chưa được implement trong backend API v2.0');
};
```

**Reason:** Backend API v2.0 (from `FRONTEND-INTEGRATION-GUIDE.md`) does not include OAuth endpoints for Google/Facebook.

---

## Error Handling Improvements

All methods now use `handleApiError(error)` from `utils/errorHandler.ts`:

```typescript
catch (error) {
  const message = handleApiError(error);
  Alert.alert('Lỗi', message);
  throw error;
}
```

This provides **consistent Vietnamese error messages** throughout the app.

---

## Auto-Refresh Token Mechanism

The new `apiClient.ts` handles token refresh automatically:

1. **401 Unauthorized** detected in response interceptor
2. Calls `refreshAccessToken()` from `authApi.new.ts`
3. Retries original request with new token
4. If refresh fails, clears tokens and navigates to login

No manual token refresh needed in AuthContext anymore.

---

## Navigation Integration

Added automatic navigation to login screen on logout:

```typescript
router.replace('/(auth)/login');
```

Uses `expo-router` for type-safe navigation.

---

## Breaking Changes

### For Components Using AuthContext

✅ **No breaking changes** - All exported methods maintain the same signatures:
- `signIn(email, password)`
- `signUp(email, password, name?, phone?)`
- `signOut()`
- `refreshUser()`

### For Social Auth Users

⚠️ **Breaking:** Social authentication methods now throw errors:
- `signInWithGoogle()`
- `signInWithFacebook()`
- `signInWithApple()`

These must be re-implemented when backend adds OAuth support.

---

## Testing Checklist

### Manual Testing Required

- [ ] **Register new user**
  - Open demo screen at `app/demo/api-example.tsx`
  - Click "Test Register" button
  - Verify user created in backend

- [ ] **Login with credentials**
  - Use registered email/password
  - Verify user state updates
  - Check tokens stored in SecureStore

- [ ] **Auto token refresh**
  - Wait for access token to expire (~15 minutes)
  - Make any authenticated API call
  - Verify request auto-retries with new token

- [ ] **Logout**
  - Click logout button
  - Verify tokens cleared
  - Verify redirect to login screen

- [ ] **Session persistence**
  - Login successfully
  - Close app completely
  - Reopen app
  - Verify user still logged in (loadSession works)

### Automated Testing (Future)

Consider adding Jest tests for:
- `loadSession()` with valid/invalid tokens
- `signIn()` success/failure cases
- `signUp()` validation
- `signOut()` cleanup
- Error handling for network failures

---

## Files Modified

### Primary File
- ✅ `context/AuthContext.tsx` - **~300 lines changed**

### Dependencies (Created Earlier)
- `services/authApi.new.ts` - Auth API wrapper
- `services/apiClient.ts` - Axios client with interceptors
- `utils/errorHandler.ts` - Vietnamese error messages
- `config/env.ts` - API base URL configuration

---

## Next Steps

### Immediate (Testing Phase)

1. **Test authentication flow end-to-end**
   ```bash
   npm start
   # Navigate to app/demo/api-example.tsx
   # Test Register → Login → Logout
   ```

2. **Verify with real backend**
   - Ensure backend API is running at https://api.thietkeresort.com.vn
   - Check network tab in React Native Debugger
   - Verify request/response shapes match

3. **Test on Android emulator**
   - Verify localhost fix works (10.0.2.2)
   - Test token persistence across app restarts

### Future Improvements

1. **Add biometric authentication**
   - Use `expo-local-authentication`
   - Store tokens only after biometric verification

2. **Implement OAuth when backend ready**
   - Google Sign-In with `@react-native-google-signin/google-signin`
   - Facebook Login with `expo-auth-session`
   - Replace current stub methods

3. **Add user profile caching**
   - Cache user data in AsyncStorage
   - Reduce `/auth/me` calls

4. **Add offline support**
   - Queue auth actions when offline
   - Sync when connection restored

---

## Troubleshooting

### Issue: "Network request failed"

**Cause:** Backend API not reachable or CORS issue

**Solution:**
1. Check backend is running: `curl https://api.thietkeresort.com.vn/health`
2. For local testing, update `API_BASE_URL` in `config/env.ts`
3. On Android emulator, ensure using `10.0.2.2` instead of `localhost`

### Issue: "Token expired" errors

**Cause:** Access token expired and refresh failed

**Solution:**
1. Check refresh token is valid (15 days max)
2. Verify `apiClient.ts` interceptor is working
3. Check backend `/auth/refresh` endpoint

### Issue: "User not found after login"

**Cause:** Backend returns different user shape than expected

**Solution:**
1. Check backend response in network logs
2. Update `User` type in `types/auth.ts`
3. Map fields in `authApi.new.ts` if needed

---

## Documentation References

For complete API integration details, see:

- **API_INTEGRATION.md** - Comprehensive API guide (~500 lines)
- **API_INTEGRATION_SUMMARY.md** - Quick reference
- **MIGRATION_GUIDE.md** - Step-by-step migration
- **API_README.md** - Package overview

---

## Conclusion

AuthContext migration is **complete and ready for testing**. All authentication flows now use the new Backend API v2.0 with:

✅ Auto-refresh token mechanism  
✅ Vietnamese error messages  
✅ Type-safe API calls  
✅ Improved error handling  
✅ Automatic navigation on logout  
✅ Zero TypeScript errors  

**Status:** Ready for QA testing phase. 🚀
