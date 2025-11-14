# API Integration Guide - Mobile App

## 📚 Tổng quan

Tài liệu này hướng dẫn cách sử dụng các API services đã được tích hợp từ backend ThietKeResort API v2.0 vào ứng dụng Expo Router.

**Backend API Documentation**: Xem file `FRONTEND-INTEGRATION-GUIDE.md` trong thư mục `c:\\Users\\Minhtien\\Downloads\\thietkeresort\\`

---

## 🏗️ Cấu trúc Services

```
services/
├── apiClient.ts          # Axios client với auto-refresh token
├── authApi.new.ts        # Authentication APIs
├── projectsApi.new.ts    # Projects APIs  
├── productsApi.new.ts    # Products APIs
├── paymentsApi.new.ts    # Payments APIs
└── socket.new.ts         # Socket.IO real-time

hooks/
└── useSocket.ts          # React hooks cho Socket.IO

components/
└── protected-route.tsx   # Protected route wrapper

utils/
└── errorHandler.ts       # Error handling utilities
```

---

## 🔐 Authentication

### 1. Đăng ký User mới

```typescript
import { register } from '@/services/authApi.new';

async function handleRegister() {
  try {
    const response = await register({
      email: 'user@example.com',
      password: 'password123',
      fullName: 'Nguyen Van A',
      role: 'client', // client | contractor | company | architect
      phone: '0123456789',
    });

    console.log('User registered:', response.user);
    console.log('Access token:', response.accessToken);
    // Tokens are automatically stored in SecureStore
  } catch (error) {
    console.error('Registration failed:', error);
  }
}
```

### 2. Đăng nhập

```typescript
import { login } from '@/services/authApi.new';

async function handleLogin() {
  try {
    const response = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    console.log('Logged in:', response.user);
    // Tokens stored automatically
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### 3. Đăng xuất

```typescript
import { logout } from '@/services/authApi.new';
import { getRefreshToken } from '@/services/apiClient';

async function handleLogout() {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await logout(refreshToken);
    }
    // Tokens cleared automatically
    // Redirect to login screen
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

### 4. Auto-refresh Token

Token được tự động refresh khi expired. Không cần gọi thủ công.

```typescript
// apiClient.ts tự động xử lý:
// - Detect 401 Unauthorized
// - Call /auth/refresh
// - Update tokens
// - Retry original request
```

---

## 📦 Projects API

### 1. Lấy danh sách Projects

```typescript
import { getProjects } from '@/services/projectsApi.new';

async function loadProjects() {
  try {
    const response = await getProjects({
      page: 1,
      limit: 20,
      status: 'active', // active | completed | cancelled | pending
      search: 'resort',
    });

    console.log('Projects:', response.data);
    console.log('Total:', response.pagination.total);
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}
```

### 2. Lấy chi tiết Project

```typescript
import { getProject } from '@/services/projectsApi.new';

async function loadProjectDetail(projectId: string) {
  try {
    const project = await getProject(projectId);
    
    console.log('Project:', project.name);
    console.log('Owner:', project.owner.fullName);
    console.log('Members:', project.members);
  } catch (error) {
    console.error('Failed to load project:', error);
  }
}
```

### 3. Tạo Project mới

```typescript
import { createProject } from '@/services/projectsApi.new';

async function handleCreateProject() {
  try {
    const project = await createProject({
      name: 'Resort ABC',
      description: 'Dự án resort tại Đà Nẵng',
      budget: 10000000000,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      category: 'resort-design',
      location: 'Đà Nẵng',
    });

    console.log('Project created:', project.id);
  } catch (error) {
    console.error('Failed to create project:', error);
  }
}
```

### 4. Cập nhật Project

```typescript
import { updateProject } from '@/services/projectsApi.new';

async function handleUpdateProject(projectId: string) {
  try {
    const project = await updateProject(projectId, {
      status: 'completed',
      progress: 100,
    });

    console.log('Project updated:', project.id);
  } catch (error) {
    console.error('Failed to update project:', error);
  }
}
```

### 5. Xóa Project

```typescript
import { deleteProject } from '@/services/projectsApi.new';

async function handleDeleteProject(projectId: string) {
  try {
    await deleteProject(projectId);
    console.log('Project deleted');
  } catch (error) {
    console.error('Failed to delete project:', error);
  }
}
```

---

## 🛍️ Products API

### 1. Lấy danh sách Products

```typescript
import { getProducts } from '@/services/productsApi.new';

async function loadProducts() {
  try {
    const response = await getProducts({
      page: 1,
      limit: 20,
      category: 'resort-design',
      search: 'villa',
      minPrice: 100000000,
      maxPrice: 1000000000,
      sortBy: 'price',
      sortOrder: 'desc',
    });

    console.log('Products:', response.data);
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}
```

### 2. Lấy chi tiết Product

```typescript
import { getProduct } from '@/services/productsApi.new';

async function loadProductDetail(productId: string) {
  try {
    const product = await getProduct(productId);
    
    console.log('Product:', product.name);
    console.log('Price:', product.price);
    console.log('Images:', product.images);
  } catch (error) {
    console.error('Failed to load product:', error);
  }
}
```

---

## 💳 Payments API

### 1. Lấy danh sách Payments

```typescript
import { getPayments } from '@/services/paymentsApi.new';

async function loadPayments() {
  try {
    const response = await getPayments({
      page: 1,
      limit: 20,
      status: 'completed',
      projectId: 'proj_123',
    });

    console.log('Payments:', response.data);
  } catch (error) {
    console.error('Failed to load payments:', error);
  }
}
```

### 2. Tạo Payment mới

```typescript
import { createPayment } from '@/services/paymentsApi.new';

async function handleCreatePayment() {
  try {
    const payment = await createPayment({
      projectId: 'proj_123',
      amount: 50000000,
      method: 'bank_transfer',
      description: 'Thanh toán đợt 1',
    });

    console.log('Payment created:', payment.id);
  } catch (error) {
    console.error('Failed to create payment:', error);
  }
}
```

---

## 🔌 Socket.IO Real-time

### 1. Chat trong Project

```typescript
import { useChat } from '@/hooks/useSocket';

function ChatScreen({ projectId }: { projectId: string }) {
  const {
    connected,
    messages,
    sendMessage,
    typingUsers,
    startTyping,
    stopTyping,
  } = useChat(projectId);

  const handleSend = (text: string) => {
    sendMessage(text, 'text');
  };

  const handleInputChange = (text: string) => {
    if (text.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <View>
      <Text>Connected: {connected ? 'Yes' : 'No'}</Text>
      
      {/* Render messages */}
      {messages.map(msg => (
        <View key={msg.id}>
          <Text>{msg.user.fullName}: {msg.content}</Text>
        </View>
      ))}

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <Text>
          {typingUsers.map(u => u.fullName).join(', ')} đang gõ...
        </Text>
      )}

      {/* Input */}
      <TextInput
        onChangeText={handleInputChange}
        onSubmitEditing={() => handleSend(inputValue)}
      />
    </View>
  );
}
```

### 2. Notifications

```typescript
import { useNotifications } from '@/hooks/useSocket';

function NotificationsScreen() {
  const { connected, notifications, unreadCount } = useNotifications();

  useEffect(() => {
    // Show toast when new notification arrives
    if (notifications.length > 0) {
      const latest = notifications[0];
      Alert.alert(latest.title, latest.message);
    }
  }, [notifications]);

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      
      {notifications.map(notif => (
        <View key={notif.id}>
          <Text>{notif.title}</Text>
          <Text>{notif.message}</Text>
        </View>
      ))}
    </View>
  );
}
```

### 3. Project Updates

```typescript
import { useProjectUpdates } from '@/hooks/useSocket';

function ProjectDetailScreen({ projectId }: { projectId: string }) {
  const { connected, updates } = useProjectUpdates(projectId);

  useEffect(() => {
    if (updates.length > 0) {
      const latest = updates[0];
      console.log('Project update:', latest.type, latest.data);
      
      // Refresh project data
      // ...
    }
  }, [updates]);

  return (
    <View>
      {/* Project content */}
    </View>
  );
}
```

---

## 🛡️ Protected Routes

### Sử dụng Protected Route

```typescript
import ProtectedRoute from '@/components/protected-route';

export default function AdminScreen() {
  return (
    <ProtectedRoute roles={['admin', 'architect']}>
      <View>
        <Text>Admin Dashboard</Text>
        {/* Admin content */}
      </View>
    </ProtectedRoute>
  );
}
```

### Tạo Unauthorized screen

```typescript
// app/unauthorized.tsx
import { UnauthorizedScreen } from '@/components/protected-route';

export default UnauthorizedScreen;
```

---

## ❌ Error Handling

### 1. Sử dụng Error Handler

```typescript
import { handleApiError } from '@/utils/errorHandler';

async function fetchData() {
  try {
    const data = await getProjects();
    return data;
  } catch (error) {
    const errorInfo = handleApiError(error);
    
    // Show user-friendly error
    Alert.alert('Lỗi', errorInfo.message);
    
    // Log for debugging
    console.error('Error code:', errorInfo.code);
    console.error('Status:', errorInfo.status);
    
    // Retry if error is retryable
    if (errorInfo.isRetryable) {
      setTimeout(() => fetchData(), 3000);
    }
  }
}
```

### 2. Common Error Codes

```typescript
import { ERROR_CODES, getErrorMessage } from '@/utils/errorHandler';

// Get error message by code
const message = getErrorMessage('EMAIL_EXISTS');
// => "Email này đã được đăng ký"
```

---

## 🧪 Testing

### Test với Mock Data

Trong development, có thể switch giữa real API và mock data:

```typescript
// config/env.ts
const ENV = {
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:4000'  // Local dev server
    : 'https://api.thietkeresort.com.vn', // Production
};
```

### Test Authentication Flow

1. Register new user
2. Login with credentials
3. Access protected endpoints
4. Logout

```bash
# Start metro bundler
npm start

# Test on Android
npm run android

# Test on Web
npm run web
```

---

## 🔧 Troubleshooting

### 1. Token không tự động refresh

**Nguyên nhân**: Refresh token expired hoặc invalid

**Giải pháp**:
- Check console logs cho errors
- Clear app data và login lại
- Verify token expiry time ở backend

### 2. Socket không kết nối

**Nguyên nhân**: 
- Access token missing
- WebSocket URL incorrect
- Network issue

**Giải pháp**:
```typescript
import socketManager from '@/services/socket.new';

// Check connection status
console.log('Connected:', socketManager.isConnected());

// Manually connect
await socketManager.connect();
```

### 3. API timeout

**Nguyên nhân**: Network slow hoặc server không response

**Giải pháp**:
```typescript
// Increase timeout in apiClient.ts
const API_TIMEOUT = 60000; // 60 seconds
```

### 4. Android localhost không access được

**Nguyên nhân**: Android emulator không thể reach localhost

**Giải pháp**: Đã tự động xử lý trong `apiClient.ts` và `socket.new.ts`
- `localhost` → `10.0.2.2`
- `127.0.0.1` → `10.0.2.2`

---

## 📝 Best Practices

### 1. Always use try-catch

```typescript
try {
  const data = await apiCall();
} catch (error) {
  handleApiError(error);
}
```

### 2. Show loading states

```typescript
const [loading, setLoading] = useState(false);

async function loadData() {
  setLoading(true);
  try {
    const data = await getProjects();
    setProjects(data);
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
}
```

### 3. Clean up subscriptions

```typescript
useEffect(() => {
  socketManager.onNewMessage(handleMessage);

  return () => {
    socketManager.offNewMessage(handleMessage);
  };
}, []);
```

### 4. Type safety

Sử dụng TypeScript interfaces từ services:

```typescript
import type { Project } from '@/services/projectsApi.new';
import type { Product } from '@/services/productsApi.new';

const [projects, setProjects] = useState<Project[]>([]);
```

---

## 🚀 Next Steps

1. ✅ Tích hợp AuthContext với authApi.new.ts
2. ✅ Replace mock data trong screens với real API calls
3. ✅ Test Socket.IO chat functionality
4. ✅ Implement payment flow với paymentsApi.new.ts
5. ✅ Add error boundaries cho better UX

---

## 📞 Support

- **Backend API Docs**: `FRONTEND-INTEGRATION-GUIDE.md`
- **Backend URL**: `https://api.thietkeresort.com.vn`
- **WebSocket URL**: `wss://api.thietkeresort.com.vn`

---

**Last Updated**: 2025-11-13  
**Version**: 1.0.0  
**Status**: ✅ Ready for Integration
