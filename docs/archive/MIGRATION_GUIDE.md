# 🔄 Migration Guide - Integrating New API Services

## 📋 Overview

Tài liệu này hướng dẫn cách migrate từ mock data/old API sang new API services đã được tích hợp.

---

## Step 1: Update AuthContext (CRITICAL)

### Current: `context/AuthContext.tsx`

Hiện tại AuthContext đang dùng mock auth hoặc old API. Cần update để dùng `authApi.new.ts`.

### Changes Required:

```typescript
// OLD
import { apiFetch } from '@/services/api';

// NEW
import { login, logout, register, getCurrentUser } from '@/services/authApi.new';
import { setAuthTokens, clearAuthTokens } from '@/services/apiClient';
```

### Update signIn method:

```typescript
// OLD
const signIn = async (email: string, password: string) => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    data: { email, password },
  });
  // ... handle response
};

// NEW
const signIn = async (email: string, password: string) => {
  try {
    setLoading(true);
    const response = await login({ email, password });
    
    // Tokens already stored by authApi
    setUser(response.user);
    setIsAuthenticated(true);
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw new Error(errorInfo.message);
  } finally {
    setLoading(false);
  }
};
```

### Update signUp method:

```typescript
// NEW
const signUp = async (email: string, password: string, name?: string, role?: string) => {
  try {
    setLoading(true);
    const response = await register({
      email,
      password,
      fullName: name || 'User',
      role: role as any || 'client',
    });
    
    setUser(response.user);
    setIsAuthenticated(true);
  } catch (error) {
    const errorInfo = handleApiError(error);
    throw new Error(errorInfo.message);
  } finally {
    setLoading(false);
  }
};
```

### Update signOut method:

```typescript
// OLD
const signOut = async () => {
  await clearToken();
  setUser(null);
};

// NEW
const signOut = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await logout(refreshToken);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
    // Navigate to login
    router.replace('/(auth)/login');
  }
};
```

---

## Step 2: Replace Products Mock Data

### Current: `data/products.ts`

Hiện đang dùng static PRODUCTS array.

### Migration:

#### File: `app/(tabs)/projects/shop.tsx` (or similar)

```typescript
// OLD
import { PRODUCTS } from '@/data/products';
const products = PRODUCTS;

// NEW
import { getProducts } from '@/services/productsApi.new';
import { handleApiError } from '@/utils/errorHandler';

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadProducts();
}, []);

const loadProducts = async () => {
  setLoading(true);
  try {
    const response = await getProducts({
      page: 1,
      limit: 20,
      category: selectedCategory,
    });
    setProducts(response.data);
  } catch (error) {
    const errorInfo = handleApiError(error);
    Alert.alert('Lỗi', errorInfo.message);
  } finally {
    setLoading(false);
  }
};
```

#### Add Loading State:

```typescript
{loading ? (
  <ActivityIndicator size="large" color="#007AFF" />
) : (
  <FlatList
    data={products}
    renderItem={({ item }) => <ProductCard product={item} />}
    keyExtractor={(item) => item.id.toString()}
  />
)}
```

---

## Step 3: Update Projects Screens

### Create Projects List Screen

#### File: `app/projects/index.tsx` (or new file)

```typescript
import { getProjects } from '@/services/projectsApi.new';
import { handleApiError } from '@/utils/errorHandler';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProjects();
  }, [page]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await getProjects({
        page,
        limit: 20,
        status: 'active',
      });
      setProjects(response.data);
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert('Lỗi', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={projects}
          renderItem={({ item }) => <ProjectCard project={item} />}
          keyExtractor={(item) => item.id}
          onEndReached={() => setPage(p => p + 1)}
        />
      )}
    </Container>
  );
}
```

### Create Project Detail Screen

#### File: `app/projects/[id].tsx`

```typescript
import { getProject } from '@/services/projectsApi.new';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await getProject(id as string);
      setProject(data);
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert('Lỗi', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!project) return <Text>Project not found</Text>;

  return (
    <Container>
      <Text>{project.name}</Text>
      <Text>{project.description}</Text>
      {/* ... */}
    </Container>
  );
}
```

---

## Step 4: Add Chat to Project Detail

### Update: `app/projects/[id].tsx`

```typescript
import { useChat } from '@/hooks/useSocket';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { connected, messages, sendMessage, typingUsers } = useChat(id as string);

  return (
    <Container>
      {/* Project info */}
      
      <Section title="💬 Chat">
        <Text>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</Text>
        
        <ScrollView style={{ height: 300 }}>
          {messages.map(msg => (
            <View key={msg.id}>
              <Text>{msg.user.fullName}: {msg.content}</Text>
            </View>
          ))}
        </ScrollView>

        {typingUsers.length > 0 && (
          <Text>{typingUsers.map(u => u.fullName).join(', ')} đang gõ...</Text>
        )}

        <TextInput
          placeholder="Nhập tin nhắn..."
          onSubmitEditing={(e) => sendMessage(e.nativeEvent.text, 'text')}
        />
      </Section>
    </Container>
  );
}
```

---

## Step 5: Add Real-time Notifications

### Create Notifications Screen

#### File: `app/(tabs)/notifications.tsx`

```typescript
import { useNotifications } from '@/hooks/useSocket';

export default function NotificationsScreen() {
  const { connected, notifications, unreadCount } = useNotifications();

  return (
    <Container>
      <Text>Unread: {unreadCount}</Text>
      
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.read && styles.unread]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </Container>
  );
}
```

---

## Step 6: Update Checkout with Payments API

### Update: `app/checkout/index.tsx` (or similar)

```typescript
import { createPayment } from '@/services/paymentsApi.new';

export default function CheckoutScreen() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const payment = await createPayment({
        projectId: 'proj_123', // Get from context or state
        amount: totalAmount,
        method: selectedPaymentMethod,
        description: `Thanh toán đơn hàng ${orderId}`,
      });

      Alert.alert('Thành công', 'Thanh toán đã được tạo');
      // Navigate to success screen
      router.push(`/checkout/success?paymentId=${payment.id}`);
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert('Lỗi', errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Checkout form */}
      
      <Button
        title="Thanh toán"
        onPress={handlePayment}
        loading={loading}
      />
    </Container>
  );
}
```

---

## Step 7: Add Protected Routes

### Wrap Admin Screens

#### Example: `app/admin/dashboard.tsx`

```typescript
import ProtectedRoute from '@/components/protected-route';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']}>
      <Container>
        <Text>Admin Dashboard</Text>
        {/* Admin content */}
      </Container>
    </ProtectedRoute>
  );
}
```

### Create Unauthorized Screen

#### File: `app/unauthorized.tsx`

```typescript
import { UnauthorizedScreen } from '@/components/protected-route';

export default UnauthorizedScreen;
```

---

## Step 8: Environment Configuration

### Update: `config/env.ts`

Make sure ENV is properly configured:

```typescript
export const ENV: EnvConfig = {
  // Production
  API_BASE_URL: 'https://api.thietkeresort.com.vn',
  WS_URL: 'wss://api.thietkeresort.com.vn',
  
  // Development (uncomment for local testing)
  // API_BASE_URL: 'http://localhost:4000',
  // WS_URL: 'ws://localhost:4000',
};
```

### Update: `app.config.ts`

```typescript
extra: {
  API_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.thietkeresort.com.vn',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://api.thietkeresort.com.vn',
}
```

---

## Step 9: Testing

### 1. Test Authentication

```bash
# Navigate to login screen
# Try logging in with real credentials
# Check if tokens are stored
# Try accessing protected routes
```

### 2. Test Projects

```bash
# Load projects list
# Check pagination
# View project details
# Try creating a project (if user has permission)
```

### 3. Test Socket.IO

```bash
# Open chat in a project
# Send messages
# Check if typing indicators work
# Check if notifications arrive
```

### 4. Test Error Handling

```bash
# Trigger 401 error (expired token)
# Check if auto-refresh works
# Trigger 403 error (forbidden)
# Check error messages in Vietnamese
```

---

## Step 10: Cleanup

### Remove Old Files (Optional)

Once migration is complete and tested:

```bash
# Backup first!
# Then remove old API files if not needed:
- services/api-old.ts (if exists)
- services/auth-old.ts (if exists)
```

### Rename New Files

```bash
# Rename .new.ts files to .ts
mv services/authApi.new.ts services/authApi.ts
mv services/projectsApi.new.ts services/projectsApi.ts
mv services/productsApi.new.ts services/productsApi.ts
mv services/paymentsApi.new.ts services/paymentsApi.ts
mv services/socket.new.ts services/socket.ts
```

---

## 📝 Checklist

- [ ] ✅ Update AuthContext with authApi.new.ts
- [ ] ✅ Replace mock products with productsApi.new.ts
- [ ] ✅ Create/update projects screens with projectsApi.new.ts
- [ ] ✅ Add chat functionality with useChat hook
- [ ] ✅ Add real-time notifications with useNotifications hook
- [ ] ✅ Update checkout with paymentsApi.new.ts
- [ ] ✅ Wrap admin screens with ProtectedRoute
- [ ] ✅ Create unauthorized screen
- [ ] ✅ Test all flows
- [ ] ✅ Remove old files
- [ ] ✅ Rename .new.ts files

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"

**Solution**: Check API_BASE_URL in config/env.ts

### Issue: "Token refresh failed"

**Solution**: 
1. Clear app storage
2. Login again
3. Check if refresh token endpoint is working

### Issue: "Socket not connecting"

**Solution**:
1. Check WS_URL in config/env.ts
2. Verify access token is valid
3. Check network connection

---

## 📚 Resources

- `API_INTEGRATION.md` - Full API documentation
- `API_INTEGRATION_SUMMARY.md` - Quick reference
- `FRONTEND-INTEGRATION-GUIDE.md` - Backend API docs
- `app/demo/api-example.tsx` - Example usage

---

**Last Updated**: 2025-11-13  
**Status**: ✅ Ready for Migration  
**Estimated Time**: 2-4 hours
