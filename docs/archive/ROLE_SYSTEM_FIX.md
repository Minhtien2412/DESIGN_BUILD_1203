# Role System Fix - Backend Alignment ✅

## 🔴 Vấn đề ban đầu

### Frontend có 5 roles (KHÔNG KHỚP)
```typescript
// app/(auth)/register.tsx (CŨ)
const [role, setRole] = useState<
  'client' | 'contractor' | 'company' | 'architect' | 'admin'
>('client');

const roleLabels = {
  client: 'Khách hàng',
  contractor: 'Nhà thầu',      // ❌ Backend không có
  company: 'Công ty',            // ❌ Backend không có  
  architect: 'Kiến trúc sư',     // ❌ Backend không có
  admin: 'Quản trị',
};
```

### Backend chỉ hỗ trợ 3 roles
```typescript
// services/api/authApi.ts
export interface User {
  role: 'CLIENT' | 'ENGINEER' | 'ADMIN';
}
```

**Kết quả:** User chọn `contractor`, `company`, hoặc `architect` → Backend reject hoặc map sai → Đăng ký thất bại

---

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật Frontend khớp với Backend

**File: `app/(auth)/register.tsx`**

```typescript
// Roles (MỚI - khớp backend)
const [role, setRole] = useState<'CLIENT' | 'ENGINEER' | 'ADMIN'>('CLIENT');

const roleLabels = {
  CLIENT: 'Khách hàng',
  ENGINEER: 'Kỹ sư / Nhà thầu',      // Gộp contractor + engineer
  ADMIN: 'Quản trị viên',
} as const;

// Thêm icons cho mỗi role
const roleIcons: Record<'CLIENT' | 'ENGINEER' | 'ADMIN', any> = {
  CLIENT: 'person-outline',
  ENGINEER: 'hammer-outline',
  ADMIN: 'shield-checkmark-outline',
};
```

**Role Selector UI (Updated):**
```tsx
{(['CLIENT','ENGINEER','ADMIN'] as const).map(r => (
  <TouchableOpacity style={styles.roleChip} onPress={() => setRole(r)}>
    <View style={styles.roleChipIconBadge}>
      <Ionicons name={roleIcons[r]} size={16} color={...} />
    </View>
    <Text>{roleLabels[r]}</Text>
  </TouchableOpacity>
))}
```

### 2. Thêm role vào RegisterDto

**File: `services/api/authApi.ts`**

```typescript
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'CLIENT' | 'ENGINEER' | 'ADMIN';  // ✅ ADDED
}
```

### 3. Gửi role lên backend

**File: `context/AuthContext.tsx`**

```typescript
const signUp = async (email: string, password: string, name?: string, role?: string) => {
  console.log('[AuthContext] Signing up with role:', role);
  
  const response = await authApi.register({
    email,
    password,
    name: name || email.split('@')[0],
    phone: undefined,
    role: (role as 'CLIENT' | 'ENGINEER' | 'ADMIN' | undefined) || 'CLIENT', // ✅ ADDED
  });
  
  // ... rest
};
```

---

## 📊 So sánh trước/sau

### Trước (5 roles - KHÔNG KHỚP)
```
Frontend:    client, contractor, company, architect, admin
Backend:     CLIENT, ENGINEER, ADMIN
Status:      ❌ 3/5 roles không tồn tại trên backend
```

### Sau (3 roles - KHỚP HOÀN TOÀN)
```
Frontend:    CLIENT, ENGINEER, ADMIN
Backend:     CLIENT, ENGINEER, ADMIN
Status:      ✅ 100% khớp
```

---

## 🎨 Role Mapping Logic

| Old Frontend Role | New Role | Backend Role | Icon |
|------------------|----------|--------------|------|
| client | CLIENT | CLIENT | person-outline |
| contractor | ENGINEER | ENGINEER | hammer-outline |
| company | ENGINEER | ENGINEER | hammer-outline |
| architect | ENGINEER | ENGINEER | hammer-outline |
| admin | ADMIN | ADMIN | shield-checkmark-outline |

**Giải thích:**
- **CLIENT**: Khách hàng cá nhân/doanh nghiệp cần dịch vụ thi công
- **ENGINEER**: Bao gồm tất cả vai trò liên quan đến thi công (nhà thầu, công ty thi công, kiến trúc sư, kỹ sư)
- **ADMIN**: Quản trị viên hệ thống

---

## 🧪 Test Cases

### Test 1: Đăng ký với role CLIENT
```typescript
Input:
  email: "customer@test.com"
  password: "123456"
  name: "Nguyễn Văn A"
  role: "CLIENT"

Expected Backend Request:
POST /api/v1/auth/register
{
  "email": "customer@test.com",
  "password": "123456",
  "name": "Nguyễn Văn A",
  "role": "CLIENT"  ✅
}

Expected Response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": 1,
    "email": "customer@test.com",
    "name": "Nguyễn Văn A",
    "role": "CLIENT"  ✅
  }
}
```

### Test 2: Đăng ký với role ENGINEER
```typescript
Input:
  email: "engineer@test.com"
  password: "123456"
  name: "Trần Văn B"
  role: "ENGINEER"

Expected Backend Request:
POST /api/v1/auth/register
{
  "email": "engineer@test.com",
  "password": "123456",
  "name": "Trần Văn B",
  "role": "ENGINEER"  ✅
}

Expected Response:
{
  "user": {
    "role": "ENGINEER"  ✅
  }
}
```

### Test 3: Đăng ký với role ADMIN
```typescript
Input:
  email: "admin@test.com"
  password: "123456"
  name: "Lê Văn C"
  role: "ADMIN"

Expected Backend Request:
POST /api/v1/auth/register
{
  "email": "admin@test.com",
  "password": "123456",
  "name": "Lê Văn C",
  "role": "ADMIN"  ✅
}

Expected Response:
{
  "user": {
    "role": "ADMIN"  ✅
  }
}
```

### Test 4: Default role (nếu không chọn)
```typescript
Input:
  email: "user@test.com"
  password: "123456"
  name: "User Test"
  role: undefined

Expected:
  role fallback to "CLIENT"  ✅
```

---

## 🎯 Benefits

### 1. Type Safety
```typescript
// TypeScript sẽ báo lỗi nếu dùng role không hợp lệ
setRole('contractor');  // ❌ Error: Type '"contractor"' is not assignable
setRole('CLIENT');      // ✅ OK
setRole('ENGINEER');    // ✅ OK
setRole('ADMIN');       // ✅ OK
```

### 2. Backend Compatibility
- ✅ 100% roles từ frontend đều hợp lệ với backend
- ✅ Không còn risk đăng ký thất bại vì role không tồn tại
- ✅ Response từ backend map chính xác với frontend

### 3. User Experience
- ✅ Rõ ràng hơn: "Kỹ sư / Nhà thầu" thay vì chia nhỏ thành contractor, company, architect
- ✅ Icons trực quan cho mỗi role
- ✅ UI hiện đại với role chips có icon badges

### 4. Maintainability
- ✅ Single source of truth (backend defines roles)
- ✅ Easier to add new roles (chỉ cần update backend)
- ✅ Less confusion trong team

---

## 📝 Files Changed

1. ✅ **app/(auth)/register.tsx** (3 edits)
   - Role state type: `'client' | 'contractor' | ...` → `'CLIENT' | 'ENGINEER' | 'ADMIN'`
   - Role labels: Gộp lại thành 3 roles
   - Added role icons: person-outline, hammer-outline, shield-checkmark-outline
   - UI: Show icons in role chips

2. ✅ **services/api/authApi.ts** (1 edit)
   - RegisterDto: Added `role?: 'CLIENT' | 'ENGINEER' | 'ADMIN'`

3. ✅ **context/AuthContext.tsx** (1 edit)
   - signUp: Pass role to backend với fallback 'CLIENT'
   - Added console.log để track role

---

## 🚀 Deployment Checklist

- [x] Frontend roles khớp với backend
- [x] Role được gửi lên backend trong register request
- [x] Default role là 'CLIENT' nếu user không chọn
- [x] TypeScript compilation: No errors
- [x] UI có icons cho mỗi role
- [x] Role labels rõ ràng tiếng Việt

### Ready to Test:
```bash
# Khởi động app
npx expo start --clear

# Test flow:
1. Mở register screen
2. Nhập email, password, name
3. Chọn role (CLIENT / ENGINEER / ADMIN)
4. Nhấn Đăng ký
5. Check network request có field "role" ✅
6. Check backend response trả về user.role ✅
```

---

## 🔮 Future Enhancements

### Nếu cần thêm roles:

**Option 1: Thêm vào backend trước**
```typescript
// Backend (Nest.js)
export enum UserRole {
  CLIENT = 'CLIENT',
  ENGINEER = 'ENGINEER',
  CONTRACTOR = 'CONTRACTOR',  // NEW
  ARCHITECT = 'ARCHITECT',    // NEW
  ADMIN = 'ADMIN'
}
```

**Option 2: Sub-roles trong profile**
```typescript
// Giữ 3 main roles (CLIENT, ENGINEER, ADMIN)
// Thêm specialization field
interface User {
  role: 'CLIENT' | 'ENGINEER' | 'ADMIN';
  specialization?: 'CONTRACTOR' | 'ARCHITECT' | 'STRUCTURAL' | 'INTERIOR';
}
```

---

## ✅ Summary

**Status:** ✅ FIXED - Roles đã khớp 100% với backend

**Changes:**
- Frontend: 5 roles → 3 roles (CLIENT, ENGINEER, ADMIN)
- RegisterDto: Added role field
- AuthContext: Pass role to backend
- UI: Added icons for each role

**Testing:** Ready for manual testing on web/device

**Next Steps:**
1. Test đăng ký với 3 roles
2. Verify backend nhận đúng role
3. Check user profile sau đăng nhập có role chính xác

---

**Date:** December 11, 2025  
**Issue:** Frontend có 5 roles, backend chỉ 3 roles  
**Resolution:** Align frontend với backend (3 roles)  
**Verified:** ✅ TypeScript compiles, no errors
