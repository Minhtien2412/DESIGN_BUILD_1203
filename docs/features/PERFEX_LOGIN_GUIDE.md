# Perfex CRM Login Implementation Guide

## 📱 Login Screens Overview

### 1. Main App Login (Default)
**File**: `app/(auth)/login-shopee.tsx`
- Modern Shopee-style UI
- Email/Phone + Password
- Social login (Google, Facebook, Apple)
- **NEW**: Link to Perfex CRM login
- Uses: `AuthContext` → Backend API

### 2. Perfex CRM Login (New)
**File**: `app/(auth)/login-perfex.tsx`
- Professional business UI
- Email + Password only
- User type selector (Staff / Customer)
- Direct Perfex CRM integration
- Uses: `PerfexAuthContext` → Perfex API

---

## 🔄 Login Flow Architecture

```
┌─────────────────────────────────────┐
│   User Opens App                    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Default Login Screen              │
│   (login-shopee.tsx)                │
│                                     │
│   Options:                          │
│   • Email/Phone Login (App)        │
│   • Social Login                    │
│   • 🆕 Switch to Perfex Login      │
└─────────┬───────────┬───────────────┘
          │           │
          │           ▼
          │   ┌─────────────────────────┐
          │   │  Perfex CRM Login       │
          │   │  (login-perfex.tsx)     │
          │   │                         │
          │   │  • Staff Login          │
          │   │  • Customer Login       │
          │   └─────────┬───────────────┘
          │             │
          ▼             ▼
┌─────────────────────────────────────┐
│   Authentication Processing         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Success → Navigate to Dashboard   │
└─────────────────────────────────────┘
```

---

## 🎨 UI Components

### Perfex Login Screen Features

#### 1. User Type Selector
```tsx
<View style={styles.typeSelector}>
  <TouchableOpacity onPress={() => setUserType('staff')}>
    Staff (Nhân viên)
  </TouchableOpacity>
  <TouchableOpacity onPress={() => setUserType('customer')}>
    Customer (Khách hàng)
  </TouchableOpacity>
</View>
```

#### 2. Form Inputs
- Email input with validation
- Password input with show/hide toggle
- Error messages per field
- General error banner

#### 3. Action Buttons
- Primary login button with loading state
- Forgot password link
- Switch to main app login
- Test button (dev only)

---

## 🔐 Authentication Contexts

### Option A: PerfexAuthContext (Perfex Users)
```tsx
import { usePerfexAuth } from '@/context/PerfexAuthContext';

const { signIn, loading, user, isStaff, isCustomer } = usePerfexAuth();

// Login
await signIn(email, password);

// Check user type
if (isStaff()) {
  // Staff dashboard
} else if (isCustomer()) {
  // Customer dashboard
}
```

### Option B: AuthContext (Regular App Users)
```tsx
import { useAuth } from '@/context/AuthContext';

const { signIn, loading, user } = useAuth();

// Login
await signIn(email, password);
```

---

## 🚀 Usage Examples

### 1. Navigate to Perfex Login
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/(auth)/login-perfex');
```

### 2. Switch Between Login Types
```tsx
// From main login to Perfex
<TouchableOpacity onPress={() => router.push('/(auth)/login-perfex')}>
  <Text>Đăng nhập Perfex CRM</Text>
</TouchableOpacity>

// From Perfex to main login
<TouchableOpacity onPress={() => router.replace('/(auth)/login-shopee')}>
  <Text>Đăng nhập bằng tài khoản App</Text>
</TouchableOpacity>
```

### 3. Handle Login Success
```tsx
const handleLogin = async () => {
  try {
    await signIn(email, password);
    
    // Navigate based on user role
    if (user?.role === 'admin') {
      router.replace('/(tabs)/admin');
    } else {
      router.replace('/(tabs)');
    }
  } catch (error) {
    // Show error
  }
};
```

---

## 🧪 Testing

### Test Perfex Login

1. **Navigate to Login**
   ```
   http://localhost:8083 → Login → "Đăng nhập Perfex CRM"
   ```

2. **Test Credentials**
   ```
   Staff Login:
   Email: staff@example.com
   Password: (from Perfex CRM)

   Customer Login:
   Email: customer@example.com
   Password: (from Perfex CRM)
   ```

3. **Test Screen** (Dev Only)
   - Click "Test Perfex Auth" button
   - Navigate to `/test-perfex-auth`
   - View user info, role, permissions

### PowerShell API Test
```powershell
# Test if Perfex API is accessible
.\test-perfex-token.ps1
```

---

## 📊 User Data Structure

### Perfex User Object
```typescript
interface PerfexAuthUser {
  id: string;
  contactId: string | null;
  customerId: string | null;
  staffId: string | null;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  phone?: string;
  company?: string;
  profileImage?: string;
  active: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  role: 'admin' | 'staff' | 'customer';
}
```

### Helper Functions
```typescript
// Check user type
const isStaff = () => user?.isStaff === true;
const isAdmin = () => user?.isAdmin === true;
const isCustomer = () => user?.role === 'customer';

// Get IDs
const getCustomerId = () => user?.customerId;
const getContactId = () => user?.contactId;
const getStaffId = () => user?.staffId;
```

---

## 🔧 Configuration

### Environment Variables (.env.local)
```bash
# Perfex CRM Configuration
PERFEX_CRM_URL=https://thietkeresort.com.vn/perfex_crm
PERFEX_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
PERFEX_API_USER=nhaxinhd
PERFEX_API_NAME=thietkeresort
```

### API Service (services/perfexAuth.ts)
```typescript
const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL,
  apiKey: ENV.PERFEX_API_TOKEN,
  apiVersion: '/api',
  timeout: 30000,
};
```

---

## 🎯 Navigation Routes

### Auth Routes
```
/(auth)/login              → Redirect to login-shopee
/(auth)/login-shopee       → Main app login (default)
/(auth)/login-perfex       → Perfex CRM login (new)
/(auth)/register           → Registration
/(auth)/forgot-password    → Password recovery
```

### Protected Routes
After successful login, redirect to:
```
/(tabs)                    → Main dashboard
/(tabs)/admin              → Admin panel (if admin)
/crm                       → CRM dashboard (Perfex users)
/test-perfex-auth          → Test screen (dev only)
```

---

## 🐛 Error Handling

### Common Errors

#### 1. Invalid Credentials
```typescript
{
  general: 'Email hoặc mật khẩu không chính xác'
}
```

#### 2. Network Error
```typescript
{
  general: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
}
```

#### 3. Validation Errors
```typescript
{
  email: 'Email không hợp lệ',
  password: 'Mật khẩu phải có ít nhất 6 ký tự'
}
```

### Error Display
```tsx
{errors.general && (
  <View style={styles.generalError}>
    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
    <Text style={styles.generalErrorText}>{errors.general}</Text>
  </View>
)}
```

---

## 🔒 Security Features

### 1. Password Security
- Minimum 6 characters
- Hidden by default (show/hide toggle)
- Never stored in plain text

### 2. Token Management
- JWT tokens stored in SecureStore
- Auto-refresh on expiry
- Logout on token invalidation

### 3. API Security
- HTTPS only
- Token-based authentication
- Request timeout (30s)

---

## 📝 Next Steps

### Immediate Tasks
- [x] Create Perfex login screen
- [x] Add switch option in main login
- [x] Integrate with PerfexAuthContext
- [ ] Add loading states
- [ ] Add success animations
- [ ] Test with real Perfex credentials

### Future Enhancements
- [ ] Biometric authentication (Face ID / Touch ID)
- [ ] Remember me functionality
- [ ] Auto-login for returning users
- [ ] Password strength indicator
- [ ] Account recovery flow
- [ ] Multi-factor authentication (2FA)

---

## 📚 Related Documentation

- [PERFEX_CRM_AUTH_GUIDE.md](./PERFEX_CRM_AUTH_GUIDE.md) - API authentication guide
- [context/PerfexAuthContext.tsx](./context/PerfexAuthContext.tsx) - Auth context implementation
- [services/perfexAuth.ts](./services/perfexAuth.ts) - Auth service
- [app/test-perfex-auth.tsx](./app/test-perfex-auth.tsx) - Test screen

---

**Created**: December 31, 2025  
**Status**: ✅ Implemented & Ready for Testing  
**Author**: ThietKeResort Team
