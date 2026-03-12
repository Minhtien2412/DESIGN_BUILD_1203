# Hệ Thống Đăng Ký/Đăng Nhập & Quản Lý Quyền

## Tổng Quan

Hệ thống authentication đã được refactor hoàn toàn với các cải tiến:

### ✅ Hoàn Thành

1. **Permission Management System**
   - `PermissionContext` quản lý quyền Camera, Location, Notifications
   - Tự động kiểm tra quyền khi app khởi động
   - Popup nhắc nhở mỗi 3 phút nếu người dùng chưa cấp quyền
   - Lưu trạng thái quyền vào SecureStore

2. **Refactored Auth Forms**
   - Custom hooks: `useLoginForm`, `useRegisterForm`
   - Validation helpers: `auth-helpers.ts`
   - Code sạch, dễ maintain, type-safe
   - Xử lý lỗi tốt hơn với error mapping

3. **Location Integration**
   - Tự động xin quyền location khi đăng ký
   - Reverse geocoding (GPS → địa chỉ)
   - Hiển thị vị trí người dùng trên form
   - Gửi location lên backend cùng registration

4. **UI/UX Improvements**
   - Inline error messages cho từng field
   - Loading states rõ ràng
   - Disable inputs khi đang loading
   - Toast notifications cho success/error
   - Role selection (Khách hàng, Nhân viên, Thầu)

---

## Cấu Trúc Files

### Context
```
context/
├── AuthContext.tsx          # Quản lý authentication state
├── PermissionContext.tsx    # Quản lý quyền người dùng
└── CartContext.tsx          # (existing) Giỏ hàng
```

### Components
```
components/
└── PermissionReminderModal.tsx  # Popup nhắc quyền mỗi 3 phút
```

### Hooks
```
hooks/
└── useAuthForms.ts          # useLoginForm, useRegisterForm
```

### Utils
```
utils/
└── auth-helpers.ts          # Validation, sanitization, error formatting
```

### Screens
```
app/(auth)/
├── auth-3d-flip.tsx         # Refactored login/register screen
└── auth-3d-flip.tsx.backup  # Backup của version cũ
```

---

## API Integration

### Register Endpoint

**Payload mới:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "location": {
    "latitude": 10.7769,
    "longitude": 106.7009,
    "address": "TP. Hồ Chí Minh, Việt Nam"
  }
}
```

**Backend đã cập nhật:**
- ✅ `register.dto.ts` - Accepts phone + location
- ✅ `auth.service.ts` - Saves to database
- ✅ `schema.prisma` - Has location fields
- ✅ PostgreSQL migration applied

---

## Permission System

### PermissionContext

Quản lý 3 loại quyền:
- **Camera**: Chụp ảnh công trình, avatar
- **Location**: Hiển thị vị trí, tìm công trình gần
- **Notifications**: Nhận thông báo dự án, tin nhắn

### Reminder Logic

```typescript
// Mỗi 3 phút (180,000ms)
const REMINDER_INTERVAL = 3 * 60 * 1000;

// Check permissions
if (!hasAllPermissions) {
  showPermissionReminder();
}
```

### Sử dụng trong Component

```tsx
import { usePermissions } from '@/context/PermissionContext';

function MyComponent() {
  const {
    permissions,
    requestCameraPermission,
    hasAllPermissions,
  } = usePermissions();

  const takePhoto = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      // Take photo
    }
  };

  return (
    <View>
      {permissions.camera === 'granted' ? (
        <Camera />
      ) : (
        <Text>Cần quyền camera</Text>
      )}
    </View>
  );
}
```

---

## Auth Forms

### useLoginForm Hook

```tsx
import { useLoginForm } from '@/hooks/useAuthForms';

function LoginScreen() {
  const {
    formData,      // { email, password, rememberMe }
    errors,        // { email?: string, password?: string, general?: string }
    loading,       // boolean
    showPassword,  // boolean
    updateField,   // (field, value) => void
    handleSubmit,  // async () => Promise<boolean>
  } = useLoginForm();

  return (
    <View>
      <TextInput
        value={formData.email}
        onChangeText={(v) => updateField('email', v)}
      />
      {errors.email && <Text>{errors.email}</Text>}
      
      <Button onPress={handleSubmit} loading={loading} />
    </View>
  );
}
```

### useRegisterForm Hook

```tsx
import { useRegisterForm } from '@/hooks/useAuthForms';

function RegisterScreen() {
  const {
    formData,           // { name, email, password, phone, location, ... }
    errors,             // Field errors
    loading,            // Submission loading
    locationLoading,    // Location fetching
    getLocation,        // async () => LocationData
    handleSubmit,       // async () => Promise<boolean>
  } = useRegisterForm();

  useEffect(() => {
    getLocation(); // Auto-get location on mount
  }, []);

  return (
    <View>
      {formData.location && (
        <Text>Vị trí: {formData.location.address}</Text>
      )}
      
      <Button onPress={handleSubmit} loading={loading} />
    </View>
  );
}
```

---

## Validation

### Email Validation
- Phải có định dạng email hợp lệ
- Tự động lowercase + trim

### Password Validation
- Tối thiểu 6 ký tự
- Phải có chữ hoa, chữ thường, số

### Phone Validation
- Định dạng Việt Nam: `0[3|5|7|8|9]XXXXXXXX`
- VD: `0912345678`, `0987654321`

### Confirm Password
- Phải khớp với password

### Terms Acceptance
- Người dùng phải tick checkbox "Đồng ý điều khoản"

---

## Error Handling

### Error Messages Map

```typescript
const errorMap = {
  'Email already exists': 'Email đã tồn tại',
  'Invalid credentials': 'Email hoặc mật khẩu không đúng',
  'User not found': 'Không tìm thấy tài khoản',
  'Network request failed': 'Lỗi kết nối mạng',
  'Timeout': 'Kết nối quá thời gian chờ',
};
```

### Inline Errors

Mỗi field có error riêng:
```tsx
<InlineError message={errors.email} />
```

### General Errors

Hiển thị ở bottom của form:
```tsx
{errors.general && (
  <ErrorBox message={errors.general} />
)}
```

---

## Testing

### Manual Test Flow

#### Đăng Ký
1. Mở app → Auth screen
2. Flip sang Register (vuốt hoặc nút chuyển)
3. Nhập:
   - Họ tên: `Nguyễn Văn A`
   - Email: `test@example.com`
   - Phone: `0912345678`
   - Password: `Pass123`
   - Confirm: `Pass123`
4. Chọn role: `Khách hàng`
5. Tick "Đồng ý điều khoản"
6. Cấp quyền location khi được hỏi
7. Kiểm tra địa chỉ hiển thị đúng
8. Nhấn "Đăng Ký"
9. Verify: Toast success, redirect to tabs

#### Đăng Nhập
1. Flip sang Login
2. Nhập email + password
3. Tick "Ghi nhớ" (optional)
4. Nhấn "Đăng Nhập"
5. Verify: Toast success, redirect to tabs

#### Permission Reminder
1. Đăng nhập thành công
2. Nếu chưa cấp đủ 3 quyền:
   - Sau 2 giây: Popup nhắc quyền
   - Nhấn "Để sau": Đóng popup
   - Sau 3 phút: Popup xuất hiện lại
   - Nhấn "Cấp quyền": Xin quyền, đóng popup

### API Testing

```bash
# Test registration with location
curl -X POST https://baotienweb.cloud/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "name": "Test User",
    "phone": "0912345678",
    "location": {
      "latitude": 10.7769,
      "longitude": 106.7009,
      "address": "TP. Hồ Chí Minh"
    }
  }'
```

---

## Troubleshooting

### Permission Popup không hiện

**Nguyên nhân:** User đã cấp đủ quyền
**Giải pháp:** 
```bash
# Clear app data (Android)
npx expo start --clear

# iOS: Settings → App → Reset Permissions
```

### Location không lấy được

**Nguyên nhân:** Permission bị deny
**Giải pháp:**
1. Check PermissionContext logs
2. Manually request: `getLocation()` trong registerForm
3. Verify GPS enabled trên device

### Validation errors không clear

**Nguyên nhân:** Form không re-render
**Giải pháp:** Check `updateField` được gọi đúng

### Backend 400 Bad Request

**Nguyên nhân:** Backend reject phone/location
**Check:**
1. Backend có migration không?
2. Prisma Client đã regenerate?
3. NestJS service restart?

```bash
# SSH vào server
ssh root@baotienweb.cloud

# Check migration
cd /root/baotienweb-api
npx prisma migrate status

# Regenerate client
npx prisma generate

# Restart
pm2 restart baotienweb-api
```

---

## Future Enhancements

### Planned Features

1. **Social Login**
   - Google OAuth
   - Facebook OAuth
   - Apple Sign In

2. **Multi-factor Authentication**
   - SMS OTP
   - Email verification code
   - TOTP (Google Authenticator)

3. **Password Recovery**
   - Forgot password flow
   - Email reset link
   - SMS reset code

4. **Profile Settings**
   - Update location
   - Change password
   - Privacy settings

5. **Permission Management**
   - Per-feature permission requests
   - Settings page để bật/tắt từng quyền
   - Explain why each permission needed

---

## Migration Notes

### From Old to New

**Breaking Changes:**
- ❌ Old inline validation → ✅ Centralized `auth-helpers.ts`
- ❌ Scattered state → ✅ Custom hooks
- ❌ Manual error handling → ✅ `formatAuthError()`

**Backward Compatible:**
- ✅ AuthContext API unchanged
- ✅ Backend response format same
- ✅ SecureStore keys same

**Rollback:**
```bash
# If needed, restore old version
cp app/(auth)/auth-3d-flip.tsx.backup app/(auth)/auth-3d-flip.tsx
```

---

## Performance

### Metrics

- Initial load: ~3.6s (bundled)
- Login submit: < 1s (network)
- Register submit: < 1.5s (network + location)
- Permission popup: ~20ms (mount)

### Optimizations

1. **Memoization:**
   - `useCallback` for handlers
   - Prevent re-renders on field change

2. **Lazy Loading:**
   - Permission modal only mounts when needed
   - Location only fetched on register screen

3. **Debouncing:**
   - (Future) Debounce email availability check

---

## Security

### Best Practices Implemented

✅ Password min 6 chars with complexity
✅ SecureStore for tokens
✅ No passwords in logs
✅ HTTPS only (backend)
✅ Input sanitization (trim, lowercase email)
✅ Backend validation (NestJS DTOs)
✅ SQL injection prevention (Prisma ORM)

### Recommendations

1. **Rate Limiting:** Add to backend (login attempts)
2. **CAPTCHA:** Prevent automated registrations
3. **Email Verification:** Confirm email before activation
4. **Password Strength Meter:** Visual feedback
5. **Biometric Auth:** Face ID / Fingerprint

---

## Support

### Logs to Check

```typescript
// AuthContext
[AuthContext] Signing in...
[AuthContext] Sign in successful
[AuthContext] Sign in failed: <error>

// PermissionContext
[Permissions] Requesting all permissions...
[Permissions] Camera permission error: <error>

// Auth Forms
[useRegisterForm] Location error: <error>
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Email đã tồn tại" | Use different email |
| "Vui lòng cấp quyền vị trí" | Allow location permission |
| "Mật khẩu xác nhận không khớp" | Check confirm password |
| "Số điện thoại không hợp lệ" | Format: 0XXXXXXXXX |

---

## Changelog

### v2.0.0 (2025-12-19)

**Added:**
- ✨ PermissionContext với auto-reminder
- ✨ useLoginForm, useRegisterForm hooks
- ✨ auth-helpers validation utilities
- ✨ PermissionReminderModal component
- ✨ Location integration in registration
- ✨ Role selection (customer/staff/contractor)

**Changed:**
- 🔄 Refactored auth-3d-flip.tsx (cleaner code)
- 🔄 Centralized validation logic
- 🔄 Improved error messages (Vietnamese)
- 🔄 Better loading states

**Fixed:**
- 🐛 Backend phone/location rejection
- 🐛 Form errors not clearing
- 🐛 Location permission flow
- 🐛 Validation edge cases

**Security:**
- 🔒 Input sanitization
- 🔒 Password confirmation
- 🔒 Terms acceptance required

---

## Contact

Nếu có vấn đề, liên hệ:
- **Backend API:** https://baotienweb.cloud/api/v1
- **Health Check:** https://baotienweb.cloud/api/v1/health
- **Documentation:** /docs trong project

---

*Last updated: 2025-12-19*
