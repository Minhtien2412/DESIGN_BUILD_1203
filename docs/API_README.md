# 🎯 API Integration - Complete Package

## 📦 Tổng quan

Package này bao gồm tất cả các services, hooks, và utilities cần thiết để tích hợp backend API vào ứng dụng Expo Router.

**Backend API**: ThietKeResort API v2.0  
**Base URL**: `https://api.thietkeresort.com.vn`  
**Documentation**: `FRONTEND-INTEGRATION-GUIDE.md`

---

## 📁 Files Đã Tạo

### Services (6 files)

| File | Mô tả | Status |
|------|-------|--------|
| `services/apiClient.ts` | Axios client với auto-refresh token | ✅ |
| `services/authApi.new.ts` | Authentication APIs | ✅ |
| `services/projectsApi.new.ts` | Projects CRUD APIs | ✅ |
| `services/productsApi.new.ts` | Products APIs | ✅ |
| `services/paymentsApi.new.ts` | Payments APIs | ✅ |
| `services/socket.new.ts` | Socket.IO real-time | ✅ |

### Hooks (1 file)

| File | Mô tả | Status |
|------|-------|--------|
| `hooks/useSocket.ts` | React hooks cho Socket.IO | ✅ |

### Components (1 file)

| File | Mô tả | Status |
|------|-------|--------|
| `components/protected-route.tsx` | Protected route wrapper | ✅ |

### Documentation (4 files)

| File | Mô tả |
|------|-------|
| `API_INTEGRATION.md` | Hướng dẫn chi tiết đầy đủ |
| `API_INTEGRATION_SUMMARY.md` | Quick reference |
| `MIGRATION_GUIDE.md` | Migration guide |
| `API_README.md` | File này |

### Example (1 file)

| File | Mô tả |
|------|-------|
| `app/demo/api-example.tsx` | Demo screen với examples |

---

## 🚀 Quick Start

### 1. Cài đặt Dependencies

```bash
# Đã có sẵn trong package.json:
# - axios
# - socket.io-client
# - expo-secure-store

npm install
```

### 2. Cấu hình Environment

```typescript
// config/env.ts
const ENV = {
  API_BASE_URL: 'https://api.thietkeresort.com.vn',
  WS_URL: 'wss://api.thietkeresort.com.vn',
};
```

### 3. Test API

```bash
# Start app
npm start

# Navigate to demo screen
# app/demo/api-example.tsx
```

---

## 📖 Tài liệu

### 1. [API_INTEGRATION.md](./API_INTEGRATION.md)
**Đầy đủ nhất** - Hướng dẫn chi tiết từng API với code examples

**Nội dung**:
- Authentication flow
- Projects CRUD operations
- Products listing
- Payments integration
- Socket.IO real-time
- Protected routes
- Error handling
- Troubleshooting

### 2. [API_INTEGRATION_SUMMARY.md](./API_INTEGRATION_SUMMARY.md)
**Quick reference** - Tóm tắt ngắn gọn

**Nội dung**:
- Files checklist
- Quick usage examples
- Todo list
- Common issues

### 3. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
**Migration steps** - Hướng dẫn migrate code hiện tại

**Nội dung**:
- Update AuthContext
- Replace mock data
- Add real-time features
- Testing checklist
- Cleanup steps

### 4. [FRONTEND-INTEGRATION-GUIDE.md](../thietkeresort/FRONTEND-INTEGRATION-GUIDE.md)
**Backend docs** - Tài liệu từ backend team

---

## 🔥 Features

### ✅ Authentication
- Register với email/password
- Login/Logout
- Auto-refresh token khi expired
- Token storage trong SecureStore
- Password reset (nếu backend hỗ trợ)

### ✅ Projects Management
- List projects với pagination
- Create/Update/Delete projects
- Add/Remove members
- Get project details
- Milestones & tasks

### ✅ Products Catalog
- List products với filters
- Search products
- Product details
- Featured products
- Related products

### ✅ Payments
- Create payments
- List payments history
- Payment status tracking
- Cancel payment
- Request refund

### ✅ Real-time Features
- **Chat**: Send/receive messages, typing indicators
- **Notifications**: Real-time push notifications
- **Project Updates**: Live project status updates
- Auto-reconnect khi mất kết nối

### ✅ Error Handling
- Vietnamese error messages
- Retry logic cho transient errors
- User-friendly error display
- Error logging

### ✅ Security
- Token-based authentication
- Auto-refresh expired tokens
- Protected routes với role-based access
- Secure token storage

---

## 💻 Code Examples

### Authentication

```typescript
import { login, logout } from '@/services/authApi.new';

// Login
const response = await login({ email, password });
console.log('User:', response.user);

// Logout
await logout(refreshToken);
```

### Projects

```typescript
import { getProjects, createProject } from '@/services/projectsApi.new';

// Get projects
const projects = await getProjects({ page: 1, limit: 20 });

// Create project
const project = await createProject({
  name: 'Resort ABC',
  description: '...',
  budget: 10000000000,
  startDate: '2025-01-01',
  endDate: '2025-12-31',
});
```

### Real-time Chat

```typescript
import { useChat } from '@/hooks/useSocket';

const { connected, messages, sendMessage } = useChat(projectId);

// Send message
sendMessage('Hello!', 'text');
```

### Protected Routes

```typescript
import ProtectedRoute from '@/components/protected-route';

<ProtectedRoute roles={['admin']}>
  <AdminScreen />
</ProtectedRoute>
```

---

## 🧪 Testing

### Demo Screen

Navigate to: `app/demo/api-example.tsx`

Test các tính năng:
- ✅ Login/Logout
- ✅ Get Projects
- ✅ Create Project
- ✅ Get Products
- ✅ Create Payment
- ✅ Chat example
- ✅ Notifications example

### Manual Testing

```bash
# 1. Start app
npm start

# 2. Open in Android/iOS/Web
a / i / w

# 3. Navigate to demo screen
# Test each API button

# 4. Check console logs for responses
```

---

## 📋 Migration Checklist

### Phase 1: Core Setup ✅
- [x] API Client với auto-refresh
- [x] Auth API service
- [x] Error handling
- [x] Environment config

### Phase 2: API Services ✅
- [x] Projects API
- [x] Products API
- [x] Payments API
- [x] Socket.IO integration

### Phase 3: React Integration ✅
- [x] useSocket hooks
- [x] Protected routes
- [x] Example screens
- [x] Documentation

### Phase 4: App Integration (TODO)
- [ ] Update AuthContext
- [ ] Replace mock data
- [ ] Add chat to projects
- [ ] Add notifications screen
- [ ] Update checkout flow
- [ ] Test end-to-end

---

## 🛠️ Architecture

```
┌─────────────────────────────────────────────┐
│          React Components / Screens         │
│  (app/*, components/*)                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          Hooks & Context                    │
│  (useSocket, useAuth, AuthContext)          │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          API Services Layer                 │
│  (authApi, projectsApi, productsApi, ...)   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          API Client (Axios)                 │
│  (apiClient.ts - interceptors, retry)       │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│          Backend API                        │
│  https://api.thietkeresort.com.vn           │
└─────────────────────────────────────────────┘
```

---

## 🐛 Common Issues

### 1. API Timeout

**Giải pháp**: Increase timeout trong `apiClient.ts`
```typescript
const API_TIMEOUT = 60000; // 60s
```

### 2. Token Refresh Failed

**Giải pháp**: Clear storage và login lại
```typescript
import { clearAuthTokens } from '@/services/apiClient';
await clearAuthTokens();
```

### 3. Socket Not Connecting

**Giải pháp**: Check WS_URL và access token
```typescript
import socketManager from '@/services/socket.new';
console.log('Connected:', socketManager.isConnected());
```

### 4. Android Localhost Issues

**Giải pháp**: Đã tự động xử lý (localhost → 10.0.2.2)

---

## 🔗 Dependencies

```json
{
  "axios": "^1.12.2",
  "socket.io-client": "^4.8.1",
  "expo-secure-store": "~13.0.2"
}
```

---

## 📞 Support

- **Documentation**: Xem các file .md trong thư mục này
- **Backend API**: https://api.thietkeresort.com.vn
- **Example Code**: `app/demo/api-example.tsx`
- **Issues**: Check console logs và error messages

---

## 🎓 Learning Path

### Beginner
1. Đọc `API_INTEGRATION_SUMMARY.md`
2. Chạy demo screen `app/demo/api-example.tsx`
3. Test từng API button

### Intermediate
1. Đọc `API_INTEGRATION.md` đầy đủ
2. Implement 1-2 screens với real API
3. Test error handling

### Advanced
1. Đọc `MIGRATION_GUIDE.md`
2. Migrate toàn bộ app sang new APIs
3. Implement Socket.IO features
4. Add protected routes

---

## ✨ Next Steps

### Immediate
1. Test demo screen
2. Read documentation
3. Update AuthContext

### Short-term (1-2 days)
1. Replace mock data
2. Add chat to projects
3. Add notifications

### Long-term (1 week)
1. Full migration
2. Production testing
3. Performance optimization

---

## 📊 Status

| Component | Status | Priority |
|-----------|--------|----------|
| API Client | ✅ Done | Critical |
| Auth API | ✅ Done | Critical |
| Projects API | ✅ Done | High |
| Products API | ✅ Done | High |
| Payments API | ✅ Done | Medium |
| Socket.IO | ✅ Done | Medium |
| Documentation | ✅ Done | High |
| Migration | 🔄 Pending | Critical |
| Testing | 🔄 Pending | High |

---

## 👥 Contributors

- **Backend Team**: API development & documentation
- **Frontend Team**: API integration & React hooks
- **Documentation**: Integration guides & examples

---

**Created**: 2025-11-13  
**Version**: 1.0.0  
**Status**: ✅ Ready for Integration  
**License**: Proprietary - ThietKeResort Project
