# Perfex CRM Login - Quick Start

## 🚀 Cách Sử Dụng

### 1. Mở App và Chọn Login Type

```
App Launch
    ↓
Login Screen (Shopee Style)
    ↓
Click: "Đăng nhập Perfex CRM" 🔵
    ↓
Perfex Login Screen
```

### 2. Chọn User Type

**Staff (Nhân viên)**
- Dành cho nhân viên công ty
- Truy cập đầy đủ CRM features
- Quản lý dự án, khách hàng, tasks

**Customer (Khách hàng)**
- Dành cho khách hàng
- Xem dự án của mình
- Theo dõi tiến độ, hóa đơn

### 3. Nhập Thông Tin

```
Email: [staff@example.com]
Password: [••••••••]

[Quên mật khẩu?]

[    Đăng nhập    ]
```

---

## 📱 UI Preview

### Main Login Screen
```
┌──────────────────────────────────────┐
│          🏪 SHOPEE STYLE            │
│                                      │
│   ┌────────────────────────────┐   │
│   │  Email / Phone             │   │
│   └────────────────────────────┘   │
│                                      │
│   ┌────────────────────────────┐   │
│   │  Password                  │   │
│   └────────────────────────────┘   │
│                                      │
│   [  Đăng nhập  ]                   │
│                                      │
│   ──────── HOẶC ────────            │
│                                      │
│   🔵 Đăng nhập Perfex CRM →        │ ← NEW!
│                                      │
└──────────────────────────────────────┘
```

### Perfex CRM Login Screen
```
┌──────────────────────────────────────┐
│    🏢    PERFEX CRM                 │
│   Đăng nhập hệ thống quản lý        │
│                                      │
│  ┌──────────────────────────────┐  │
│  │                               │  │
│  │  ┌──────────┬──────────┐    │  │
│  │  │👔 Nhân viên│👥 Khách hàng│  │  │
│  │  └──────────┴──────────┘    │  │
│  │                               │  │
│  │  Email                        │  │
│  │  ┌─────────────────────────┐│  │
│  │  │ staff@example.com       ││  │
│  │  └─────────────────────────┘│  │
│  │                               │  │
│  │  Mật khẩu                     │  │
│  │  ┌─────────────────────────┐│  │
│  │  │ ••••••••••              ││  │
│  │  └─────────────────────────┘│  │
│  │                               │  │
│  │        Quên mật khẩu?         │  │
│  │                               │  │
│  │  [    Đăng nhập    ]         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                      │
│  ← Đăng nhập bằng tài khoản App    │
│                                      │
└──────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Perfex Login
- Primary: `#03a9f4` (Blue)
- Gradient: Blue → Cyan
- Surface: White
- Accent: Orange `#ff9800`

### Main Login
- Primary: `#EE4D2D` (Shopee Orange)
- Gradient: Orange tones
- Modern & Vibrant

---

## ⚡ Quick Test

### 1. Start Dev Server
```bash
npm start
```

### 2. Open in Browser
```
http://localhost:8083
```

### 3. Navigate
```
Login → "Đăng nhập Perfex CRM" → Enter credentials
```

### 4. Test with Mock Data
```typescript
// Staff
Email: staff@thietkeresort.com
Password: password123

// Customer  
Email: customer@company.com
Password: password123
```

---

## 🔧 Code Snippets

### Navigate to Perfex Login
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/(auth)/login-perfex');
```

### Use Perfex Auth
```tsx
import { usePerfexAuth } from '@/context/PerfexAuthContext';

const { signIn, loading, user, isStaff } = usePerfexAuth();

const handleLogin = async () => {
  await signIn(email, password);
  
  if (isStaff()) {
    router.replace('/crm');
  } else {
    router.replace('/(tabs)');
  }
};
```

---

## 📋 Features Checklist

- [x] Perfex login screen UI
- [x] User type selector (Staff/Customer)
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Password show/hide
- [x] Forgot password link
- [x] Switch to main login
- [x] Test button (dev)
- [x] Responsive design
- [x] Gradient background
- [x] Icon support
- [ ] Remember me
- [ ] Biometric auth

---

## 📱 Screen Routes

```
/(auth)/login-shopee     ← Main (Default)
           ↓
/(auth)/login-perfex     ← Perfex (New)
           ↓
/(tabs)                  ← Success
```

---

## 🎯 User Flows

### Flow 1: First Time User
```
1. Open app
2. See main login
3. Notice "Perfex CRM" option
4. Click to switch
5. Choose user type
6. Enter credentials
7. Login success → Dashboard
```

### Flow 2: Returning User
```
1. Open app
2. Auto-filled email (if remembered)
3. Enter password
4. Login → Dashboard
```

### Flow 3: Forgot Password
```
1. Perfex login screen
2. Click "Quên mật khẩu?"
3. Enter email
4. Receive reset link
5. Set new password
6. Login again
```

---

## 🔥 Pro Tips

### 1. Dev Mode
- Test button appears only in `__DEV__`
- Quick access to test screen
- Mock data pre-filled

### 2. Fast Switch
- Swipe gesture to switch login types
- Back button returns to main login
- Smooth animations

### 3. Keyboard Handling
- Auto-scroll on focus
- Return key advances fields
- Dismiss on outside tap

---

## 🐛 Troubleshooting

### Issue: Can't see Perfex option
**Solution**: Check if `login-perfex.tsx` exists in `app/(auth)/`

### Issue: Login fails
**Solution**: 
1. Check network connection
2. Verify Perfex API token in `.env.local`
3. Test with `.\test-perfex-token.ps1`

### Issue: Wrong dashboard after login
**Solution**: Check user role mapping in PerfexAuthContext

---

## 📞 Support

For issues or questions:
1. Check [PERFEX_LOGIN_GUIDE.md](./PERFEX_LOGIN_GUIDE.md)
2. Check [PERFEX_CRM_AUTH_GUIDE.md](./PERFEX_CRM_AUTH_GUIDE.md)
3. Test with `/test-perfex-auth`
4. Check console logs

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
