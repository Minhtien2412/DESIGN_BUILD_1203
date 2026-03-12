# 🎯 API Integration Summary - Quick Reference

## ✅ Đã Hoàn Thành

### 1. API Client Layer
- ✅ **File**: `services/apiClient.ts`
- ✅ Axios với auto-refresh token
- ✅ Request/Response interceptors
- ✅ Error handling với ApiError class
- ✅ Retry logic cho rate limiting
- ✅ Android emulator localhost fix (10.0.2.2)

### 2. Authentication API
- ✅ **File**: `services/authApi.new.ts`
- ✅ register(data) - Đăng ký user mới
- ✅ login(data) - Đăng nhập
- ✅ logout(refreshToken) - Đăng xuất
- ✅ refreshAccessToken(refreshToken) - Refresh token
- ✅ getCurrentUser() - Lấy profile
- ✅ updateProfile(data) - Cập nhật profile

### 3. Projects API
- ✅ **File**: `services/projectsApi.new.ts`
- ✅ getProjects(params) - Danh sách projects
- ✅ getProject(id) - Chi tiết project
- ✅ createProject(data) - Tạo project
- ✅ updateProject(id, data) - Cập nhật project
- ✅ deleteProject(id) - Xóa project
- ✅ addProjectMember() - Thêm member
- ✅ removeProjectMember() - Xóa member

### 4. Products API
- ✅ **File**: `services/productsApi.new.ts`
- ✅ getProducts(params) - Danh sách products
- ✅ getProduct(id) - Chi tiết product
- ✅ searchProducts(query) - Tìm kiếm products
- ✅ getFeaturedProducts() - Products nổi bật
- ✅ getRelatedProducts(id) - Products liên quan

### 5. Payments API
- ✅ **File**: `services/paymentsApi.new.ts`
- ✅ getPayments(params) - Danh sách payments
- ✅ getPayment(id) - Chi tiết payment
- ✅ createPayment(data) - Tạo payment
- ✅ updatePaymentStatus(id, data) - Update status (Admin)
- ✅ cancelPayment(id) - Hủy payment
- ✅ requestRefund(id) - Yêu cầu hoàn tiền

### 6. Socket.IO Real-time
- ✅ **File**: `services/socket.new.ts`
- ✅ Chat real-time (join, send, receive messages)
- ✅ Typing indicators
- ✅ Notifications
- ✅ Project updates
- ✅ Auto-reconnect

### 7. React Hooks
- ✅ **File**: `hooks/useSocket.ts`
- ✅ useSocket() - Base socket connection
- ✅ useChat(projectId) - Chat trong project
- ✅ useNotifications() - Real-time notifications
- ✅ useProjectUpdates(projectId) - Project updates

### 8. Protected Routes
- ✅ **File**: `components/protected-route.tsx`
- ✅ ProtectedRoute component
- ✅ Role-based authorization
- ✅ Unauthorized screen
- ✅ Loading state

### 9. Error Handling
- ✅ **File**: `utils/errorHandler.ts` (đã có sẵn, enhanced)
- ✅ handleApiError(error) - Handle errors
- ✅ getErrorMessage(code) - Error messages
- ✅ isRetryableError(error) - Check retryable
- ✅ Vietnamese error messages

### 10. Documentation
- ✅ **File**: `API_INTEGRATION.md`
- ✅ Hướng dẫn chi tiết từng API
- ✅ Code examples đầy đủ
- ✅ Troubleshooting guide
- ✅ Best practices

---

## 🚀 Cách Sử Dụng Nhanh

### Authentication

```typescript
import { login, logout } from '@/services/authApi.new';

// Login
const response = await login({ email, password });

// Logout
await logout(refreshToken);
```

### Projects

```typescript
import { getProjects, createProject } from '@/services/projectsApi.new';

// Get projects
const projects = await getProjects({ page: 1, limit: 20 });

// Create project
const project = await createProject({ name, description, budget, ... });
```

### Products

```typescript
import { getProducts, getProduct } from '@/services/productsApi.new';

// Get products
const products = await getProducts({ category: 'resort-design' });

// Get product detail
const product = await getProduct(productId);
```

### Chat

```typescript
import { useChat } from '@/hooks/useSocket';

const { messages, sendMessage, typingUsers } = useChat(projectId);

sendMessage('Hello!', 'text');
```

### Protected Route

```typescript
import ProtectedRoute from '@/components/protected-route';

<ProtectedRoute roles={['admin', 'architect']}>
  <AdminScreen />
</ProtectedRoute>
```

---

## 📝 Todo - Cần Làm Tiếp

### 1. Tích hợp AuthContext
- [ ] Update `context/AuthContext.tsx` để sử dụng `authApi.new.ts`
- [ ] Replace mock authentication với real API
- [ ] Test login/logout flow

### 2. Replace Mock Data
- [ ] Update screens để dùng real API thay mock data
- [ ] Products: `data/products.ts` → `productsApi.new.ts`
- [ ] Projects: Mock → `projectsApi.new.ts`

### 3. Test Socket.IO
- [ ] Test chat functionality
- [ ] Test notifications
- [ ] Test typing indicators

### 4. Payment Integration
- [ ] Tích hợp `paymentsApi.new.ts` vào checkout flow
- [ ] Test payment creation
- [ ] Test payment status updates

### 5. Error Boundaries
- [ ] Add ErrorBoundary components
- [ ] Better error UI/UX
- [ ] Toast notifications cho errors

---

## 🔍 Files Tham Khảo

| File | Mô tả |
|------|-------|
| `API_INTEGRATION.md` | Hướng dẫn chi tiết đầy đủ |
| `FRONTEND-INTEGRATION-GUIDE.md` | Backend API documentation |
| `services/apiClient.ts` | Axios client core |
| `services/authApi.new.ts` | Auth APIs |
| `services/projectsApi.new.ts` | Projects APIs |
| `services/productsApi.new.ts` | Products APIs |
| `services/paymentsApi.new.ts` | Payments APIs |
| `services/socket.new.ts` | Socket.IO client |
| `hooks/useSocket.ts` | Socket React hooks |
| `components/protected-route.tsx` | Protected routes |

---

## ⚙️ Environment Setup

```typescript
// config/env.ts
const ENV = {
  API_BASE_URL: 'https://api.thietkeresort.com.vn',
  WS_URL: 'wss://api.thietkeresort.com.vn',
};

// Development
API_BASE_URL: 'http://localhost:4000'
// Android emulator tự động chuyển thành: http://10.0.2.2:4000
```

---

## 🐛 Troubleshooting

### Token không refresh
```typescript
// Clear tokens và login lại
import { clearAuthTokens } from '@/services/apiClient';
await clearAuthTokens();
```

### Socket không connect
```typescript
import socketManager from '@/services/socket.new';
console.log('Connected:', socketManager.isConnected());
await socketManager.connect();
```

### API timeout
```typescript
// apiClient.ts
const API_TIMEOUT = 60000; // Increase to 60s
```

---

## 📞 Support

- **Documentation**: `API_INTEGRATION.md`
- **Backend API**: `https://api.thietkeresort.com.vn`
- **Backend Docs**: `FRONTEND-INTEGRATION-GUIDE.md`

---

**Last Updated**: 2025-11-13  
**Status**: ✅ Completed  
**Next**: Tích hợp vào AuthContext và screens
