# Mock Authentication Server - Quick Start

## Vấn Đề Hiện Tại

Backend production (`https://api.thietkeresort.com.vn`) đang yêu cầu JWT token cho endpoint `/auth/login`, tạo ra vấn đề circular dependency (cần authenticated để authenticate).

**Lỗi**: `"Please provide a valid JWT token"` khi gọi `/auth/login`

## Giải Pháp Tạm Thời

Sử dụng mock authentication server để phát triển frontend trong khi chờ fix backend.

## Cách Sử Dụng

### 1. Chạy Mock Server

```bash
# Terminal 1: Start mock auth server
npm run mock-auth
```

Server sẽ chạy tại: `http://localhost:3002`

### 2. Cập Nhật .env.local

Thay đổi trong file `.env.local`:

```bash
# Comment out production API
# EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn

# Use mock auth server
EXPO_PUBLIC_API_BASE_URL=http://localhost:3002
EXPO_PUBLIC_WS_URL=ws://localhost:3002/ws
```

### 3. Restart Expo

```bash
# Terminal 2: Restart Expo (Ctrl+C rồi start lại)
npm start
```

## Tài Khoản Test

Mock server có sẵn 3 tài khoản:

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | admin123 | Administrator |
| user@test.com | user123 | User |
| test@gmail.com | 123456 | User |

## Tính Năng Mock Server

### Public Endpoints (Không cần JWT)
- ✅ `POST /auth/login` - Login với email/password
- ✅ `POST /auth/register` - Đăng ký user mới
- ✅ `POST /auth/social` - Google/Facebook login (mock)
- ✅ `GET /health` - Health check

### Protected Endpoints (Cần JWT)
- ✅ `GET /auth/me` - Lấy thông tin user hiện tại
- ✅ `POST /auth/refresh` - Refresh token
- ✅ `POST /auth/logout` - Logout

### API Key Required
Tất cả endpoints đều yêu cầu API key trong header:
```
X-API-Key: thietke-resort-api-key-2024
```

## Test Thử

### Test với cURL

```bash
# Login
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: thietke-resort-api-key-2024" \
  -d "{\"email\":\"test@gmail.com\",\"password\":\"123456\"}"

# Response:
# {
#   "token": "mock_token_3_1699...",
#   "user": {
#     "id": "3",
#     "email": "test@gmail.com",
#     "name": "Test User",
#     "role": "User",
#     "admin": 0,
#     "avatar": "https://i.pravatar.cc/150?img=3"
#   }
# }
```

### Test trên App

1. Mở app, màn hình login sẽ xuất hiện
2. Nhập: `test@gmail.com` / `123456`
3. Click "Login"
4. ✅ Sẽ login thành công và chuyển sang màn hình chính

## Logs

Mock server sẽ hiển thị logs cho mọi request:

```
[Mock Auth] Login attempt: { email: 'test@gmail.com' }
[Mock Auth] ✅ Login successful: test@gmail.com
```

## Khi Nào Chuyển Về Production?

Khi backend production đã sửa xong:

1. Stop mock server (Ctrl+C)
2. Uncomment trong `.env.local`:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
   EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws
   ```
3. Restart Expo

## Fix Backend Production

Backend cần exclude các auth endpoints khỏi JWT middleware:

```javascript
// Backend: routes/auth.js or middleware/auth.js
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/social',
  '/health'
];

app.use((req, res, next) => {
  // Skip JWT check for public endpoints
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  // Verify JWT for other endpoints
  // ... JWT verification logic
});
```

## Troubleshooting

### Lỗi: "Cannot find module 'express'"
```bash
npm install express cors
```

### Lỗi: "Port 3002 already in use"
Thay đổi PORT trong `mock-auth-server.js`:
```javascript
const PORT = 3003; // hoặc port khác
```

### App vẫn báo lỗi token
1. Đảm bảo đã restart Expo sau khi đổi .env.local
2. Clear Metro cache: `npx expo start -c`
3. Kiểm tra mock server đang chạy

## Lợi Ích

✅ Phát triển frontend độc lập với backend  
✅ Test nhanh các tính năng auth  
✅ Không cần internet/VPN để dev  
✅ Kiểm soát hoàn toàn test data  
✅ Logs rõ ràng cho debug  

---

**Status**: Mock server hoạt động hoàn hảo ✨  
**Next**: Chờ backend production sửa JWT middleware
