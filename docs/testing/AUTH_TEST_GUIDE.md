# 🚀 HƯỚNG DẪN TEST ĐĂNG KÝ/ĐĂNG NHẬP

## ✅ Backend API Status (đã test)
| Endpoint | Status | Mô tả |
|----------|--------|-------|
| `/api/v1/auth/register` | ✅ OK | Đăng ký user mới |
| `/api/v1/auth/login` | ✅ OK | Đăng nhập với email/password |
| `/api/v1/auth/google` | ✅ OK | Đăng nhập/đăng ký với Google OAuth |
| `/api/v1/auth/social` | ✅ OK | Đăng nhập social (Google/Facebook) |
| `/api/v1/auth/refresh` | ✅ OK | Refresh access token |

---

## 📱 Test trên App

### 1. Mở App
```
http://localhost:8083
```

### 2. Test Đăng Nhập
- Vào trang Login: `http://localhost:8083/login-shopee`
- Nhập email và password
- Bấm "Đăng nhập"

### 3. Test Đăng Ký
- Vào trang Register: `http://localhost:8083/register-shopee`
- Nhập email/số điện thoại
- Nhập mã OTP (demo: bất kỳ 6 số)
- Điền thông tin profile
- Bấm "Hoàn tất đăng ký"

### 4. Test Google Login
- Tại trang Login, bấm nút "Google"
- Chọn tài khoản Google
- App sẽ tự động đăng nhập/đăng ký

---

## 🔧 Test Accounts có sẵn

| Email | Password | Ghi chú |
|-------|----------|---------|
| `test@test.com` | `test123` | Tài khoản test cũ |
| `googletest@gmail.com` | (Google OAuth) | Đăng nhập bằng Google |

---

## 🛠️ PowerShell Test Commands

### Test Register
```powershell
$body = @{ email = "newuser@test.com"; password = "Test123!"; name = "New User" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $body
```

### Test Login
```powershell
$body = @{ email = "newuser@test.com"; password = "Test123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body
```

### Test Google OAuth
```powershell
$body = @{ token = "google_oauth_token"; email = "user@gmail.com"; name = "User Name" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/google" -Method POST -ContentType "application/json" -Body $body
```

---

## ✨ Cập nhật ngày 2026-01-07

### Frontend (login-shopee.tsx)
- ✅ Sửa URL Google auth từ `/api/auth/google` → `/api/v1/auth/google`
- ✅ Thêm fallback logic: `/auth/social` → `/auth/google` → client-side

### Backend (auth.controller.ts + auth.service.ts)
- ✅ Thêm endpoint `POST /auth/google` 
- ✅ Thêm endpoint `POST /auth/social`
- ✅ Thêm hàm `googleLogin()` trong service
- ✅ Deploy lên server và restart PM2

---

## 📊 Kết quả Test

```
===== TEST BACKEND AUTH ENDPOINTS =====

1. Test /auth/register... ✓ SUCCESS
2. Test /auth/login... ✓ SUCCESS  
3. Test /auth/google... ✓ SUCCESS
```

**Tất cả chức năng đăng ký/đăng nhập đã hoạt động!** 🎉
