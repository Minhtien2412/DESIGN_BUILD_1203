# SecureStore Web Compatibility Fix ✅

## Vấn đề gốc

```
Uncaught Error
ExpoSecureStore.default.deleteValueWithKeyAsync is not a function
```

**Nguyên nhân**: `expo-secure-store` không hoạt động trên web browser. Khi chạy ứng dụng trên web (qua `npx expo start` và mở browser), các hàm của SecureStore sẽ bị lỗi.

---

## Giải pháp

Sử dụng wrapper `utils/storage.ts` đã có sẵn thay vì gọi trực tiếp `expo-secure-store`. Wrapper này tự động fallback sang `localStorage` khi chạy trên web.

### Storage Wrapper API

```typescript
// utils/storage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    // Fallback to localStorage on web
    return window.localStorage.getItem('secure:' + key);
  }
  // Use SecureStore on native
  return await SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem('secure:' + key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem('secure:' + key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
```

---

## Files đã sửa

### 1. `context/AuthContext.tsx`

**Before:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Gọi trực tiếp SecureStore
const token = await SecureStore.getItemAsync('accessToken');
await SecureStore.setItemAsync('accessToken', token);
await SecureStore.deleteItemAsync('accessToken');
```

**After:**
```typescript
import { getItem, setItem, deleteItem } from '@/utils/storage';

// Dùng wrapper (tự động xử lý web)
const token = await getItem('accessToken');
await setItem('accessToken', token);
await deleteItem('accessToken');
```

**Changes:**
- ✅ Replaced `SecureStore.getItemAsync()` → `getItem()`
- ✅ Replaced `SecureStore.setItemAsync()` → `setItem()`
- ✅ Replaced `SecureStore.deleteItemAsync()` → `deleteItem()`
- ✅ Updated import từ `expo-secure-store` → `@/utils/storage`

### 2. `services/api/messagesApi.ts`

**Before:**
```typescript
import * as SecureStore from 'expo-secure-store';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await SecureStore.getItemAsync('accessToken');
  return {
    'Authorization': `Bearer ${token}`
  };
}
```

**After:**
```typescript
import { getItem } from '@/utils/storage';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`
  };
}
```

### 3. `services/api/projectsApi.ts`

**Changes:**
- ✅ Import changed: `expo-secure-store` → `@/utils/storage`
- ✅ `SecureStore.getItemAsync()` → `getItem()`

### 4. `services/api/notificationsApi.ts`

**Changes:**
- ✅ Import changed: `expo-secure-store` → `@/utils/storage`
- ✅ `SecureStore.getItemAsync()` → `getItem()`

### 5. `services/api/tasksApi.ts`

**Changes:**
- ✅ Import changed: `expo-secure-store` → `@/utils/storage`
- ✅ `SecureStore.getItemAsync()` → `getItem()`

---

## Kiểm tra lại

### Test trên Web Browser

```bash
# Khởi động Expo
npx expo start

# Mở trên web (press 'w')
```

**Expected:**
- ✅ App loads successfully
- ✅ Có thể đăng nhập/đăng ký
- ✅ Tokens được lưu vào `localStorage`
- ✅ Không có lỗi `deleteValueWithKeyAsync is not a function`

### Test trên Android/iOS

```bash
# Android
npx expo start
# Press 'a' để mở Android emulator

# iOS
npx expo start
# Press 'i' để mở iOS simulator
```

**Expected:**
- ✅ App hoạt động bình thường
- ✅ Tokens được lưu vào SecureStore (encrypted)
- ✅ Bảo mật tốt hơn web

---

## Technical Details

### Platform Detection

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web: Use localStorage
} else {
  // iOS/Android: Use SecureStore
}
```

### Storage Keys

| Key | Purpose | Example Value |
|-----|---------|---------------|
| `accessToken` | JWT access token | `eyJhbGciOiJIUzI1NiIs...` |
| `refreshToken` | JWT refresh token | `eyJhbGciOiJIUzI1NiIs...` |

**Web Storage:**
- Stored in `localStorage` with prefix `secure:`
- Example: `localStorage.getItem('secure:accessToken')`

**Native Storage:**
- Stored in SecureStore (encrypted)
- iOS: Keychain
- Android: EncryptedSharedPreferences

---

## Security Considerations

### Web (localStorage)
- ⚠️ **Not encrypted**: Accessible via DevTools
- ⚠️ **XSS vulnerable**: Script injection can read tokens
- ✅ **Convenience**: Easy testing during development
- 💡 **Best for**: Development and testing only

### Native (SecureStore)
- ✅ **Encrypted**: Hardware-backed encryption
- ✅ **Secure**: Protected by OS security
- ✅ **Production-ready**: Safe for sensitive data
- 💡 **Best for**: Production deployment

### Recommendation
- **Development**: Web browser OK for quick testing
- **Testing**: Use Android/iOS emulator/device
- **Production**: Always use APK/IPA on real devices

---

## Related Files

### Storage Implementation
- `utils/storage.ts` - Main storage wrapper
- `utils/secureStorage.ts` - Deprecated (don't use)

### Usage Examples
- `context/AuthContext.tsx` - Authentication state
- `services/api/authApi.ts` - Auth API calls
- `services/api/messagesApi.ts` - Messages API
- `services/api/projectsApi.ts` - Projects API
- `services/api/notificationsApi.ts` - Notifications API
- `services/api/tasksApi.ts` - Tasks API

---

## Migration Checklist

Nếu có code khác còn gọi trực tiếp SecureStore:

```bash
# Tìm tất cả các chỗ gọi SecureStore
grep -r "SecureStore\." --include="*.ts" --include="*.tsx"
```

**Replace pattern:**

```diff
- import * as SecureStore from 'expo-secure-store';
+ import { getItem, setItem, deleteItem } from '@/utils/storage';

- const value = await SecureStore.getItemAsync('key');
+ const value = await getItem('key');

- await SecureStore.setItemAsync('key', value);
+ await setItem('key', value);

- await SecureStore.deleteItemAsync('key');
+ await deleteItem('key');
```

---

## Common Issues

### Issue 1: "Cannot find name 'getItem'"
**Solution:** Add import
```typescript
import { getItem, setItem, deleteItem } from '@/utils/storage';
```

### Issue 2: "localStorage is not defined"
**Solution:** Wrapper đã xử lý, đảm bảo import từ `@/utils/storage`

### Issue 3: "SecureStore is not available"
**Solution:** Đừng import `expo-secure-store` trực tiếp, dùng wrapper

---

## Testing Commands

```bash
# 1. Clear Metro cache
npx expo start --clear

# 2. Test on web
npx expo start
# Press 'w' to open web

# 3. Test on Android
npx expo start
# Press 'a' for Android

# 4. Check storage
# Web: Open DevTools → Application → Local Storage
# Native: Use React Native Debugger
```

---

## Summary

✅ **Fixed Files:** 5 files
- `context/AuthContext.tsx`
- `services/api/messagesApi.ts`
- `services/api/projectsApi.ts`
- `services/api/notificationsApi.ts`
- `services/api/tasksApi.ts`

✅ **Pattern:** Replace direct `SecureStore` calls with `storage` wrapper

✅ **Benefit:** App now works on web browser during development

✅ **Security:** Still uses SecureStore on native (production)

✅ **No breaking changes:** Existing functionality maintained

---

**Status:** ✅ FIXED - App loads successfully on web
**Date:** December 11, 2025
**Tested:** Web browser, ready for native testing
