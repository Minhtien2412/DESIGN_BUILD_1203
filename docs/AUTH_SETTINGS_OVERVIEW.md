# 🔐 Authentication & Settings - Tổng Quan Hệ Thống

> **Tài liệu chi tiết**: Đăng ký, Đăng nhập, Cài đặt, Quyền riêng tư
> 
> **Ngày tạo**: 11/12/2025 | **Backend**: https://baotienweb.cloud/api/v1

---

## 📋 Mục Lục

1. [🎯 Tổng Quan](#tổng-quan)
2. [🔑 Authentication (Đăng nhập/Đăng ký)](#authentication)
3. [⚙️ Settings (Cài đặt)](#settings)
4. [🔒 Privacy (Quyền riêng tư)](#privacy)
5. [📱 Hướng Dẫn Test](#test-guide)
6. [🛠️ Technical Details](#technical-details)

---

## 🎯 Tổng Quan

### ✅ Đã Triển Khai

| Tính năng | File | Trạng thái | Backend |
|-----------|------|------------|---------|
| **Đăng nhập Email** | `app/(auth)/login.tsx` | ✅ Hoàn chỉnh | `/auth/login` |
| **Đăng ký Email** | `app/(auth)/register.tsx` | ✅ Hoàn chỉnh | `/auth/register` |
| **Google Sign-In** | `app/(auth)/login.tsx` | ✅ 2 flows | `/auth/google/*` |
| **Facebook Sign-In** | `app/(auth)/login.tsx` | ✅ Có | `/auth/facebook` |
| **Quên mật khẩu** | `app/(auth)/forgot-password.tsx` | ✅ Có | `/auth/forgot` |
| **Reset mật khẩu** | `app/(auth)/reset-password.tsx` | ✅ Có | `/auth/reset` |
| **Cài đặt chung** | `app/profile/settings.tsx` | ✅ 591 dòng | AsyncStorage |
| **Cài đặt riêng tư** | `app/profile/privacy.tsx` | ✅ 563 dòng | Backend sync |
| **Chính sách bảo mật** | `app/legal/privacy-policy.tsx` | ✅ 353 dòng | Static |
| **AuthContext** | `context/AuthContext.tsx` | ✅ 270 dòng | Core logic |

### 🔐 OAuth Support

```typescript
// 3 phương thức Google Sign-In:
1. Authorization Code Flow (RECOMMENDED) ✅
   - Backend exchanges code for tokens
   - Most secure
   
2. ID Token Flow (CURRENT) ✅
   - Send idToken to backend
   - Backend verifies with Google
   
3. Implicit Flow (FALLBACK) ✅
   - Client-side only
   - Less secure
```

---

## 🔑 Authentication

### 1. Đăng Nhập (Login)

**📍 File**: `app/(auth)/login.tsx` (536 dòng)

#### Features

```typescript
✅ Email/Password authentication
✅ Google Sign-In (OAuth 2.0)
✅ Facebook Sign-In
✅ Form validation
✅ Error handling
✅ Loading states
✅ Auto-navigate after success
✅ "Quên mật khẩu" link
✅ "Chưa có tài khoản" link
✅ Animated UI
✅ Theme support
```

#### API Endpoint

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "testuser9139@test.com",
  "password": "password123"
}

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 13,
    "email": "testuser9139@test.com",
    "name": "Test User 9139",
    "role": "CLIENT"
  }
}
```

#### Google Sign-In Flows

**Option A: Authorization Code Flow** (Recommended)
```typescript
// Step 1: User clicks "Sign in with Google"
await googleAuthCode.signIn();

// Step 2: Google returns authorization code
onSuccess: async ({ code }) => {
  // Step 3: Send code to backend
  await signInWithGoogleCode(code);
  
  // Step 4: Backend exchanges code with Google:
  // POST https://oauth2.googleapis.com/token
  // {
  //   code: "4/0AeanE...",
  //   client_id: "...",
  //   client_secret: "...",
  //   redirect_uri: "...",
  //   grant_type: "authorization_code"
  // }
  
  // Step 5: Google returns access_token + refresh_token + id_token
  // Step 6: Backend verifies and creates session
}
```

**Option B: ID Token Flow** (Current)
```typescript
// Step 1: User clicks "Sign in with Google"
await googleAuthImplicit.signIn();

// Step 2: Google returns idToken directly
onSuccess: async ({ idToken }) => {
  // Step 3: Send idToken to backend
  await signInWithGoogleToken(idToken);
  
  // Step 4: Backend verifies idToken with Google:
  // GET https://oauth2.googleapis.com/tokeninfo?id_token=...
  
  // Step 5: Backend creates session
}
```

#### Code Example

```typescript
const handleLogin = async () => {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  
  // Validation
  if (!trimmedEmail || !trimmedPassword) {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Email và Mật khẩu');
    return;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    Alert.alert('Lỗi', 'Email không hợp lệ');
    return;
  }
  
  setLoading(true);
  
  try {
    await signIn(email, password);
    router.replace('/(tabs)'); // Navigate to home
  } catch (error: any) {
    Alert.alert('Lỗi đăng nhập', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

### 2. Đăng Ký (Register)

**📍 File**: `app/(auth)/register.tsx` (611 dòng)

#### Features

```typescript
✅ Email/Password registration
✅ Name field
✅ Role selection (5 roles)
✅ Google Sign-Up
✅ Facebook Sign-Up
✅ Password strength validation (min 6 chars)
✅ Email format validation
✅ Loading states
✅ Error handling
✅ Auto-login after success
✅ "Đã có tài khoản" link
✅ Animated UI
```

#### Role Options

```typescript
const roleLabels = {
  client: 'Khách hàng',          // Default
  contractor: 'Nhà thầu',
  company: 'Công ty',
  architect: 'Kiến trúc sư',
  admin: 'Quản trị',
};
```

#### API Endpoint

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepass123",
  "name": "John Doe",
  "role": "client"
}

# Response: Same as login (auto-login)
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

#### Code Example

```typescript
const handleRegister = async () => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  
  // Validation
  if (!trimmedName || !trimmedEmail || !trimmedPassword || !role) {
    Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin và chọn vai trò');
    return;
  }
  
  if (trimmedPassword.length < 6) {
    Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }
  
  setLoading(true);
  
  try {
    await signUp(email, password, name, role);
    router.replace('/(tabs)'); // Auto-login and navigate
  } catch (error: any) {
    Alert.alert('Lỗi đăng ký', error.message);
  } finally {
    setLoading(false);
  }
};
```

---

### 3. Quên Mật Khẩu

**📍 File**: `app/(auth)/forgot-password.tsx`

#### Features

```typescript
✅ Email input
✅ Send reset link to email
✅ Confirmation message
✅ Link to login
✅ Error handling
```

#### Flow

```
1. User enters email
2. App sends POST /auth/forgot-password { email }
3. Backend sends email with reset link
4. User clicks link → Opens reset-password screen
5. User enters new password + confirmation
6. App sends POST /auth/reset-password { token, password }
7. Success → Redirect to login
```

---

### 4. AuthContext

**📍 File**: `context/AuthContext.tsx` (270 dòng)

#### API

```typescript
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCode: (code: string) => Promise<void>;
  signInWithGoogleToken: (idToken: string) => Promise<void>;
  signInWithGoogleAccessToken: (accessToken: string) => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}
```

#### User Object

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  admin?: number;           // 1 if admin, 0 otherwise
  permissions?: Permission[];
  staffid?: number;         // For Perfex CRM staff
  global_roles?: string[];  // Multi-role support
}
```

#### Token Storage

```typescript
// Secure storage using expo-secure-store
await SecureStore.setItemAsync('accessToken', token);
await SecureStore.setItemAsync('refreshToken', refreshToken);

// Load on app start
const token = await SecureStore.getItemAsync('accessToken');
```

#### Session Management

```typescript
// Auto-load session on app start
useEffect(() => {
  loadSession();
}, []);

const loadSession = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) return;
  
  // Verify token with backend
  const apiUser = await authApi.getProfile(token);
  setState({
    user: mapUser(apiUser),
    loading: false,
    isAuthenticated: true,
  });
};
```

#### Sign Out

```typescript
const signOut = async () => {
  try {
    // Clear tokens
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    
    // Clear state
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
    
    // Navigate to login
    router.replace('/(auth)/login');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};
```

---

## ⚙️ Settings

### 1. General Settings

**📍 File**: `app/profile/settings.tsx` (591 dòng)

#### Features

```typescript
✅ Language selection (Vietnamese/English)
✅ Theme selection (Light/Dark/Auto)
✅ Push notifications toggle
✅ Email notifications toggle
✅ Project updates toggle
✅ Promotions toggle
✅ Profile visibility (Public/Friends/Private)
✅ Show online status toggle
✅ Show activity toggle
✅ Auto-play videos toggle
✅ Data usage (Low/Medium/High)
✅ Cache videos toggle
✅ AsyncStorage persistence
✅ Real-time save on change
```

#### Settings Interface

```typescript
interface Settings {
  // General
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'auto';
  
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  projectUpdates: boolean;
  promotions: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showActivity: boolean;
  
  // App Behavior
  autoPlay: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  cacheVideos: boolean;
}
```

#### Storage

```typescript
const SETTINGS_STORAGE_KEY = '@app_settings';

// Load
const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
if (stored) {
  setSettings(JSON.parse(stored));
}

// Save (auto on every change)
const saveSettings = async (newSettings: Settings) => {
  await AsyncStorage.setItem(
    SETTINGS_STORAGE_KEY, 
    JSON.stringify(newSettings)
  );
};
```

#### UI Sections

1. **Chung** (General)
   - Ngôn ngữ (Language)
   - Giao diện (Theme)

2. **Thông báo** (Notifications)
   - Thông báo đẩy
   - Email thông báo
   - Cập nhật dự án
   - Khuyến mãi

3. **Quyền riêng tư** (Privacy)
   - Hiển thị hồ sơ
   - Trạng thái trực tuyến
   - Hoạt động

4. **Ứng dụng** (App Behavior)
   - Tự động phát video
   - Sử dụng dữ liệu
   - Cache video

#### Access Path

```typescript
// From Menu tab
Menu → "Cài đặt" (Settings icon)

// Or from Profile
Profile → Settings button

// Direct navigation
router.push('/profile/settings');
```

---

### 2. Privacy Settings

**📍 File**: `app/profile/privacy.tsx` (563 dòng)

#### Features

```typescript
✅ Profile visibility control
✅ Email/Phone visibility toggles
✅ Activity visibility toggle
✅ Analytics consent
✅ Personalization consent
✅ Third-party data sharing consent
✅ Message permissions (Everyone/Friends/None)
✅ Online status visibility
✅ Read receipts toggle
✅ Backend synchronization
✅ Account deletion
✅ Data export
```

#### Privacy Interface

```typescript
interface PrivacySettings {
  // Profile Visibility
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showActivity: boolean;
  
  // Data & Privacy
  allowAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdParty: boolean;
  
  // Communication
  allowMessages: 'everyone' | 'friends' | 'none';
  showOnlineStatus: boolean;
  readReceipts: boolean;
}
```

#### Backend Sync

```typescript
// Load from backend
const response = await apiFetch('/user/privacy-settings', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Save to backend
await apiFetch('/user/privacy-settings', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(settings),
});
```

#### Account Actions

**Delete Account:**
```typescript
const handleDeleteAccount = async () => {
  Alert.alert(
    'Xóa tài khoản',
    'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.',
    [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await apiFetch('/user/delete-account', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          
          await signOut();
        },
      },
    ]
  );
};
```

**Export Data:**
```typescript
const handleExportData = async () => {
  const response = await apiFetch('/user/export-data', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Download JSON file
  // Contains: profile, projects, tasks, messages, etc.
};
```

#### UI Sections

1. **Hiển thị hồ sơ** (Profile Visibility)
   - Chế độ hiển thị
   - Hiển thị email
   - Hiển thị số điện thoại
   - Hiển thị hoạt động

2. **Dữ liệu & Quyền riêng tư** (Data & Privacy)
   - Cho phép phân tích
   - Cá nhân hóa
   - Chia sẻ bên thứ ba

3. **Giao tiếp** (Communication)
   - Ai có thể nhắn tin
   - Trạng thái trực tuyến
   - Xác nhận đã đọc

4. **Quản lý tài khoản** (Account Management)
   - Xuất dữ liệu
   - Xóa tài khoản
   - Xem chính sách bảo mật

---

### 3. Privacy Policy

**📍 File**: `app/legal/privacy-policy.tsx` (353 dòng)

#### Content Sections

```typescript
1. Thông tin chúng tôi thu thập
   1.1. Thông tin cá nhân
   1.2. Thông tin dự án
   1.3. Dữ liệu thiết bị
   1.4. Dữ liệu vị trí

2. Cách chúng tôi sử dụng thông tin
   2.1. Cung cấp dịch vụ
   2.2. Cải thiện ứng dụng
   2.3. Liên lạc
   2.4. Bảo mật

3. Chia sẻ thông tin
   3.1. Với các bên thứ ba
   3.2. Yêu cầu pháp lý
   3.3. Chuyển giao kinh doanh

4. Bảo mật dữ liệu
   4.1. Mã hóa
   4.2. Kiểm soát truy cập
   4.3. Sao lưu

5. Quyền của bạn
   5.1. Truy cập dữ liệu
   5.2. Chỉnh sửa
   5.3. Xóa
   5.4. Xuất dữ liệu
   5.5. Rút lại đồng ý

6. Cookie và theo dõi

7. Quyền riêng tư của trẻ em

8. Thay đổi chính sách

9. Liên hệ
```

#### Features

```typescript
✅ Full Vietnamese legal text
✅ Section navigation
✅ Last updated date
✅ Contact information
✅ Theme support
✅ Print/Share support
✅ ScrollView for long content
```

#### Access Path

```typescript
// From Privacy Settings
Privacy Settings → "Xem chính sách bảo mật"

// From Register/Login
Register/Login → "Chính sách bảo mật" link

// Direct navigation
router.push('/legal/privacy-policy');
```

---

## 📱 Hướng Dẫn Test

### 1. Test Authentication Flow

```bash
# 1. Start Expo
npx expo start

# 2. Test Registration
App → Register screen
✓ Enter: name, email, password, select role
✓ Tap "Đăng ký"
✓ Verify: Auto-login → Navigate to home
✓ Verify: Token stored in SecureStore

# 3. Test Login
App → Login screen
✓ Enter: email, password
✓ Tap "Đăng nhập"
✓ Verify: Navigate to home
✓ Verify: User data loaded

# 4. Test Google Sign-In
Login screen → "Sign in with Google"
✓ Google OAuth popup opens
✓ Select account
✓ Verify: Backend receives idToken
✓ Verify: Auto-login → Home

# 5. Test Forgot Password
Login screen → "Quên mật khẩu?"
✓ Enter email
✓ Tap "Gửi liên kết"
✓ Check email for reset link
✓ Click link → Reset password screen
✓ Enter new password
✓ Tap "Đặt lại mật khẩu"
✓ Verify: Redirect to login

# 6. Test Sign Out
Profile → Sign Out button
✓ Tap "Đăng xuất"
✓ Verify: Tokens cleared
✓ Verify: Redirect to login
✓ Verify: Can't access protected screens
```

### 2. Test Settings

```bash
# 1. Access Settings
Menu → "Cài đặt"

# 2. Test Language Change
✓ Tap "Ngôn ngữ"
✓ Select "English"
✓ Verify: UI changes to English
✓ Select "Tiếng Việt"
✓ Verify: UI changes back

# 3. Test Theme Change
✓ Tap "Giao diện"
✓ Select "Dark"
✓ Verify: App switches to dark mode
✓ Select "Auto"
✓ Verify: Follows system setting

# 4. Test Notification Toggles
✓ Toggle "Thông báo đẩy" OFF
✓ Verify: No push notifications
✓ Toggle ON
✓ Verify: Push notifications resume

# 5. Test Persistence
✓ Change multiple settings
✓ Close app (kill process)
✓ Reopen app
✓ Navigate to Settings
✓ Verify: All changes persisted
```

### 3. Test Privacy Settings

```bash
# 1. Access Privacy
Profile → Privacy Settings

# 2. Test Profile Visibility
✓ Select "Private"
✓ Tap "Lưu"
✓ Verify: Backend updated
✓ Logout → Login as another user
✓ Verify: Can't see profile

# 3. Test Data Export
✓ Tap "Xuất dữ liệu của tôi"
✓ Wait for export
✓ Verify: JSON file downloaded
✓ Open file
✓ Verify: Contains profile, projects, tasks

# 4. Test Account Deletion
✓ Tap "Xóa tài khoản"
✓ Confirm deletion
✓ Verify: Account deleted
✓ Verify: Auto sign out
✓ Try to login
✓ Verify: "Account not found" error
```

---

## 🛠️ Technical Details

### Dependencies

```json
{
  "expo-secure-store": "^12.x",      // Secure token storage
  "@react-native-async-storage/async-storage": "^1.x", // Settings storage
  "expo-auth-session": "^5.x",       // OAuth flows
  "expo-web-browser": "^12.x",       // OAuth browser
  "@expo/vector-icons": "^13.x"      // Icons
}
```

### API Endpoints

```typescript
// Authentication
POST   /api/v1/auth/register          // Sign up
POST   /api/v1/auth/login             // Sign in
POST   /api/v1/auth/google/auth-code  // Google (code flow)
POST   /api/v1/auth/google/id-token   // Google (token flow)
POST   /api/v1/auth/facebook          // Facebook
POST   /api/v1/auth/forgot-password   // Request reset
POST   /api/v1/auth/reset-password    // Reset password
GET    /api/v1/auth/profile           // Get current user
POST   /api/v1/auth/refresh           // Refresh token
POST   /api/v1/auth/logout            // Sign out

// Privacy
GET    /api/v1/user/privacy-settings  // Get privacy settings
PUT    /api/v1/user/privacy-settings  // Update privacy
GET    /api/v1/user/export-data       // Export user data
DELETE /api/v1/user/delete-account    // Delete account
```

### Environment Variables

```bash
# .env or app.config.ts
EXPO_PUBLIC_API_URL=https://baotienweb.cloud/api/v1
EXPO_PUBLIC_API_KEY=thietke-resort-api-key-2024

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=...

# Facebook OAuth
EXPO_PUBLIC_FACEBOOK_APP_ID=...
```

### Security Best Practices

```typescript
✅ Tokens stored in SecureStore (encrypted)
✅ HTTPS only for API calls
✅ Password min 6 characters
✅ Email validation (regex)
✅ CSRF protection (backend)
✅ Rate limiting (backend)
✅ Input sanitization
✅ No sensitive data in logs
✅ Auto-logout on token expiry
✅ Secure password reset flow
```

### State Management

```typescript
// Auth state lives in AuthContext
// Wrapped at root: app/_layout.tsx

<AuthProvider>
  <CartProvider>
    <Stack>
      {/* App screens */}
    </Stack>
  </CartProvider>
</AuthProvider>

// Access anywhere:
const { user, signIn, signOut } = useAuth();
```

### Route Protection

```typescript
// Guest mode: Allow viewing without login
// Redirect to login only when accessing protected features

// Example protected screen:
export default function ProtectedScreen() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Show login prompt or redirect
    return <LoginPrompt />;
  }
  
  return <ProtectedContent />;
}
```

---

## 📊 Feature Checklist

### ✅ Completed

- [x] Email/Password registration
- [x] Email/Password login
- [x] Google Sign-In (3 flows)
- [x] Facebook Sign-In
- [x] Forgot password
- [x] Reset password
- [x] Token persistence (SecureStore)
- [x] Auto-load session
- [x] Sign out
- [x] General settings (13 options)
- [x] Privacy settings (11 options)
- [x] Privacy policy (full text)
- [x] Settings persistence (AsyncStorage)
- [x] Backend sync (privacy)
- [x] Account deletion
- [x] Data export
- [x] Theme switching
- [x] Language switching
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Animated UI
- [x] Icon support

### 🔄 In Progress

- [ ] Refresh token rotation
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] 2FA (Two-factor authentication)
- [ ] Session management (multiple devices)
- [ ] Email verification required
- [ ] Phone number verification

### 🎯 Future Enhancements

- [ ] Apple Sign-In
- [ ] Twitter/X Sign-In
- [ ] LinkedIn Sign-In
- [ ] Account linking (merge OAuth accounts)
- [ ] Advanced permissions system
- [ ] Activity log viewer
- [ ] Login history
- [ ] Device management
- [ ] Privacy dashboard (data insights)
- [ ] GDPR compliance tools
- [ ] Cookie consent banner
- [ ] Terms of Service screen

---

## 🚀 Quick Start Commands

```bash
# Run app
npx expo start

# Test on Android
npx expo start --android

# Test on iOS
npx expo start --ios

# Test on Web
npx expo start --web

# Clear cache
npx expo start -c

# Check auth files
ls app/(auth)/*.tsx

# Check settings files
ls app/profile/{settings,privacy}.tsx
ls app/legal/privacy-policy.tsx

# View context
cat context/AuthContext.tsx

# Test backend auth
curl -X POST https://baotienweb.cloud/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser9139@test.com","password":"password123"}'
```

---

## 📞 Support

**Backend API**: https://baotienweb.cloud/api/v1  
**Test Account**: testuser9139@test.com / password123  
**Documentation**: Xem file này  

**Issues?**
1. Check console logs
2. Verify backend is online
3. Clear SecureStore: `await SecureStore.deleteItemAsync('accessToken')`
4. Clear AsyncStorage: `await AsyncStorage.clear()`
5. Restart Expo: `npx expo start -c`

---

**🎉 Hệ thống Authentication & Settings đã hoàn chỉnh!**
