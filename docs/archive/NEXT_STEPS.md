# 🚀 Hướng Dẫn Chạy App với Mock Auth Server

## ✅ Đã Hoàn Thành

1. ✅ Mock authentication server đã được tạo
2. ✅ Server đang chạy tại `http://localhost:3002`
3. ✅ `.env.local` đã được cập nhật để sử dụng mock server

## 📝 Bước Tiếp Theo

### 1. Restart Expo để load environment mới

Expo cần restart để load `EXPO_PUBLIC_API_BASE_URL` mới từ `.env.local`:

```bash
# Trong terminal Expo, nhấn Ctrl+C để stop
# Sau đó chạy lại:
npx expo start -c
```

Flag `-c` sẽ clear Metro cache.

### 2. Test Login trên App

Khi app khởi động lại:

1. Màn hình login sẽ hiện ra
2. Nhập thông tin test:
   - Email: `test@gmail.com`
   - Password: `123456`
3. Click **Login**
4. ✅ Sẽ login thành công!

### 3. Các Tài Khoản Test Khác

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Administrator |
| user@test.com | user123 | User |
| test@gmail.com | 123456 | User |

## 🔍 Kiểm Tra Logs

### Mock Server Logs

Cửa sổ PowerShell riêng sẽ hiển thị:

```
[Mock Auth] Login attempt: { email: 'test@gmail.com' }
[Mock Auth] ✅ Login successful: test@gmail.com
```

### App Logs

Trong Expo terminal:

```
LOG  [AuthContext] signIn starting...
LOG  [API] Sending request with API key to: /auth/login
LOG  [AuthContext] ✅ Login successful
LOG  [AuthNavigator] {"inAuth": false, "isAuthenticated": true, ...}
```

## ⚠️ Lưu Ý

### Nếu Vẫn Báo Lỗi

1. **Restart Expo**: Đảm bảo clear cache với `-c`
2. **Kiểm tra mock server**: Cửa sổ PowerShell phải còn mở
3. **Kiểm tra .env.local**: Phải có `EXPO_PUBLIC_API_BASE_URL=http://localhost:3002`

### Test với Web

```bash
# Trong Expo, nhấn 'w' để mở web
# Login sẽ hoạt động trên web browser
```

## 🎯 Tính Năng Đã Test

- ✅ Health check endpoint
- ✅ Login endpoint (POST /auth/login)
- ✅ API key validation
- ⏳ Register endpoint (chưa test)
- ⏳ Token refresh (chưa test)
- ⏳ Get current user (chưa test)

## 📊 Status

**Mock Server**: ✅ Đang chạy  
**Config**: ✅ Đã update  
**Next**: Restart Expo và test login

---

## Khi Nào Tắt Mock Server?

Khi backend production đã fix:

1. Close cửa sổ PowerShell (mock server sẽ tắt)
2. Update `.env.local`:
   ```bash
   # Comment mock server
   # EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
   
   # Uncomment production
   EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
   EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws
   ```
3. Restart Expo: `npx expo start -c`
