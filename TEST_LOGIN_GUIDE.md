# 🎯 Test App với Mock Authentication Server

## ✅ Đã Sẵn Sàng

- ✅ Mock server đang chạy: `http://localhost:3002`
- ✅ `.env.local` đã cấu hình đúng
- ✅ Login endpoint tested: Working perfectly

## 📋 Các Bước Test

### Bước 1: Restart Expo với Clear Cache

**Quan trọng**: Phải clear cache để load environment variables mới!

```bash
# Stop Expo hiện tại (nếu đang chạy): Ctrl+C

# Restart với clear cache:
npx expo start -c
```

### Bước 2: Mở App

Chọn một trong các cách:

**Android:**
```bash
# Trong Expo terminal, nhấn: a
# Hoặc scan QR code
```

**Web (Nhanh nhất để test):**
```bash
# Trong Expo terminal, nhấn: w
# Browser sẽ mở tự động
```

**iOS:**
```bash
# Nhấn: i
# Hoặc scan QR code từ iPhone
```

### Bước 3: Test Login

Khi app mở, bạn sẽ thấy màn hình login:

**Tài khoản test:**
```
Email:    test@gmail.com
Password: 123456
```

**Hoặc admin:**
```
Email:    admin@test.com
Password: admin123
```

### Bước 4: Kiểm Tra Logs

**Expo Terminal sẽ hiển thị:**
```
LOG  [AuthContext] signIn starting...
LOG  [API] Sending request with API key to: /auth/login
LOG  [AuthContext] ✅ Login successful
LOG  [AuthNavigator] {"inAuth": false, "isAuthenticated": true, ...}
```

**Mock Server Terminal sẽ hiển thị:**
```
[Mock Auth] Login attempt: { email: 'test@gmail.com' }
[Mock Auth] ✅ Login successful: test@gmail.com
```

## ✅ Expected Results

1. ✅ Login successful (không còn lỗi JWT token)
2. ✅ Chuyển sang home screen
3. ✅ User info hiển thị đúng
4. ✅ Navigation hoạt động

## ❌ Nếu Gặp Lỗi

### "Still shows JWT token error"
```bash
# Clear Metro cache hoàn toàn:
rm -rf node_modules/.cache
npx expo start -c
```

### "Cannot connect to server"
```bash
# Kiểm tra mock server:
curl http://localhost:3002/health

# Nếu không response, restart mock server:
node mock-auth-server.js
```

### "Environment variable not updated"
```bash
# Verify .env.local:
cat .env.local | grep EXPO_PUBLIC_API_BASE_URL

# Should show:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3002

# Restart Expo:
npx expo start -c
```

## 🧪 Các Tính Năng Cần Test

### 1. Authentication ✓
- [x] Login với test@gmail.com
- [x] Login với admin@test.com  
- [ ] Register new user
- [ ] Logout
- [ ] Token persistence (close/reopen app)

### 2. Google OAuth (Mock)
- [ ] Click "Sign in with Google"
- [ ] Should work with mock endpoint

### 3. Navigation
- [ ] Bottom tabs work
- [ ] Protected routes accessible after login
- [ ] Profile shows correct user info

### 4. API Calls
- [ ] Videos endpoint (returns empty array from mock)
- [ ] Other endpoints fallback gracefully

## 📊 Test Checklist

```
[ ] 1. Expo started with -c flag
[ ] 2. App opened (web/Android/iOS)
[ ] 3. Login screen appears
[ ] 4. Enter test credentials
[ ] 5. Login successful
[ ] 6. Home screen loads
[ ] 7. User info correct
[ ] 8. Navigation works
[ ] 9. Logout works
[ ] 10. Can login again
```

## 🎯 Success Criteria

**Login Flow Hoàn Toàn Hoạt Động:**
- ✅ No JWT token errors
- ✅ Smooth authentication
- ✅ Token stored and persisted
- ✅ User session maintained
- ✅ Protected routes accessible

## 📝 Notes

- Mock server chỉ cho development
- Production backend cần fix JWT middleware
- Tất cả data là mock (không persist sau khi restart server)
- Register tạo user mới tạm thời (mất khi restart)

## 🔄 Khi Backend Production Fixed

```bash
# 1. Stop mock server (Ctrl+C trong mock server terminal)

# 2. Update .env.local:
#    Comment mock server:
#    # EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
#
#    Uncomment production:
#    EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
#    EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws

# 3. Restart Expo:
npx expo start -c
```

---

**Ready to test!** 🚀

Mở terminal mới và chạy:
```bash
npx expo start -c
```

Sau đó nhấn `w` để mở web và test login!
