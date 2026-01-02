# 📡 Hướng dẫn sử dụng API Integration

**Ngày tạo:** 31/12/2025  
**Tác giả:** ThietKeResort Team  
**Mục đích:** Tích hợp API thực tế với fallback logic

---

## 🎯 Tổng quan

Hệ thống API Integration cung cấp:
- ✅ **API thực** từ backend (ưu tiên)
- 🔄 **Auto retry** khi API fail
- 💾 **Caching** thông minh
- 📦 **Mock data fallback** khi offline
- ⚡ **React hooks** dễ sử dụng

---

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────┐
│          Component / Screen             │
└─────────────────────────────────────────┘
                  │
                  ↓ sử dụng hooks
┌─────────────────────────────────────────┐
│       useApiIntegration.ts              │
│  (useProjects, usePerfexCustomers, etc) │
└─────────────────────────────────────────┘
                  │
                  ↓ gọi service
┌─────────────────────────────────────────┐
│         apiIntegration.ts               │
│   - ApiIntegration (Main API)           │
│   - PerfexApiIntegration (Perfex CRM)   │
│   - MainApiIntegration (Backend)        │
└─────────────────────────────────────────┘
                  │
          ┌───────┴───────┐
          ↓               ↓
    API Backend     Mock Data
```

---

## 📝 Sử dụng cơ bản

### 1. Query data (GET)

```tsx
import { useProjects } from '@/hooks/useApiIntegration';

function ProjectList() {
  const { data, loading, error, source, refetch } = useProjects({
    cache: true,  // Enable caching
    onSuccess: (projects) => {
      console.log('✅ Loaded:', projects);
    },
  });

  if (loading) return <Loader />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <ProjectCard project={item} />}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refetch} />
      }
    />
  );
}
```

**Output:**
- `data`: Dữ liệu từ API hoặc mock
- `loading`: Trạng thái đang tải
- `error`: Lỗi nếu có
- `source`: `'api'` | `'mock'` | `'cache'`
- `refetch()`: Tải lại dữ liệu

---

### 2. Mutation (POST/PUT/DELETE)

```tsx
import { useCreateProject } from '@/hooks/useApiIntegration';

function CreateProjectForm() {
  const { mutate, loading, error, success } = useCreateProject({
    onSuccess: (project) => {
      Alert.alert('Success', `Đã tạo: ${project.name}`);
      router.push(`/projects/${project.id}`);
    },
  });

  const handleSubmit = async (formData) => {
    const result = await mutate(formData);
    if (result) {
      console.log('Created:', result);
    }
  };

  return (
    <View>
      <Button onPress={handleSubmit} loading={loading}>
        Tạo dự án
      </Button>
      {error && <Text>{error.message}</Text>}
      {success && <Text>✅ Thành công!</Text>}
    </View>
  );
}
```

---

### 3. Hiển thị trạng thái dữ liệu

```tsx
function DataSourceBadge({ source }) {
  return (
    <View style={styles.badge}>
      {source === 'api' && <Text>🟢 Live data</Text>}
      {source === 'cache' && <Text>🟡 Cached</Text>}
      {source === 'mock' && <Text>🔴 Offline</Text>}
    </View>
  );
}
```

---

## 🔧 Các hooks có sẵn

### Main API Hooks

| Hook | Mô tả | Endpoint |
|------|-------|----------|
| `useProjects()` | Danh sách dự án | GET /projects |
| `useProject(id)` | Chi tiết dự án | GET /projects/:id |
| `useProjectTasks(id)` | Tasks của dự án | GET /projects/:id/tasks |
| `useCreateProject()` | Tạo dự án mới | POST /projects |
| `useUpdateProject()` | Cập nhật dự án | PUT /projects/:id |
| `useDeleteProject()` | Xóa dự án | DELETE /projects/:id |

### Perfex CRM Hooks

| Hook | Mô tả | Endpoint |
|------|-------|----------|
| `usePerfexCustomers()` | Danh sách khách hàng | GET /api/customers |
| `usePerfexProjects()` | Danh sách dự án CRM | GET /api/projects |
| `usePerfexProject(id)` | Chi tiết dự án CRM | GET /api/projects/:id |

### Utility Hooks

| Hook | Mô tả |
|------|-------|
| `useClearCache()` | Xóa cache |
| `useIsCached(key)` | Kiểm tra cache |

---

## ⚙️ Cấu hình

### Trong service:

```typescript
// services/apiIntegration.ts
const INTEGRATION_CONFIG = {
  enableMockFallback: true,      // Bật mock fallback
  cacheTimeout: 5 * 60 * 1000,   // Cache 5 phút
  retryAttempts: 2,              // Retry 2 lần
  retryDelay: 1000,              // Delay 1 giây
  logRequests: ENV.ENV === 'development',
};
```

### Trong hook:

```typescript
useProjects({
  enabled: true,              // Bật/tắt auto-fetch
  cache: true,                // Bật caching
  refetchInterval: 60000,     // Auto refetch sau 1 phút
  onSuccess: (data) => {},    // Callback thành công
  onError: (err) => {},       // Callback lỗi
});
```

---

## 📊 Ví dụ thực tế

### Ví dụ 1: Danh sách dự án với auto-refresh

```tsx
function ProjectDashboard() {
  const { data, loading, source } = useProjects({
    refetchInterval: 30000, // Refresh mỗi 30 giây
    cache: true,
  });

  return (
    <View>
      {/* Badge hiển thị nguồn dữ liệu */}
      <DataSourceBadge source={source} />
      
      {/* Danh sách */}
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <ProjectCard project={item} />
          )}
        />
      )}
    </View>
  );
}
```

### Ví dụ 2: Form tạo dự án

```tsx
function CreateProject() {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  
  const { mutate, loading } = useCreateProject({
    onSuccess: () => {
      Alert.alert('Success', 'Đã tạo dự án!');
      router.back();
    },
  });

  const handleCreate = async () => {
    if (!name || !budget) {
      Alert.alert('Error', 'Vui lòng điền đầy đủ');
      return;
    }

    await mutate({
      name,
      budget: parseFloat(budget),
      startDate: new Date().toISOString(),
    });
  };

  return (
    <View>
      <Input value={name} onChangeText={setName} />
      <Input value={budget} onChangeText={setBudget} />
      <Button onPress={handleCreate} loading={loading}>
        Tạo
      </Button>
    </View>
  );
}
```

### Ví dụ 3: Perfex Customers

```tsx
function CustomerList() {
  const { data: customers, loading, source } = usePerfexCustomers();

  return (
    <View>
      {/* Hiển thị khi offline */}
      {source === 'mock' && (
        <Banner type="warning">
          Đang offline. Hiển thị dữ liệu demo.
        </Banner>
      )}

      <FlatList
        data={customers}
        renderItem={({ item }) => (
          <View>
            <Text>{item.company}</Text>
            <Text>{item.phonenumber}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

## 🔄 Flow xử lý

### Query Flow (GET)

```
1. Check cache
   ├── ✅ Hit → Return cached data
   └── ❌ Miss → Continue

2. Call API (với retry)
   ├── Attempt 1
   ├── Attempt 2 (nếu fail)
   └── Attempt 3 (nếu fail)

3. Handle result
   ├── ✅ Success → Cache + Return
   └── ❌ Fail → Try mock fallback
       ├── ✅ Mock available → Return mock
       └── ❌ No mock → Throw error
```

### Mutation Flow (POST/PUT/DELETE)

```
1. Call API (no cache check)
   ├── Attempt 1
   ├── Attempt 2 (nếu fail)
   └── Attempt 3 (nếu fail)

2. Handle result
   ├── ✅ Success → Clear related cache + Return
   └── ❌ Fail → Try mock fallback
       ├── ✅ Mock available → Return mock
       └── ❌ No mock → Throw error
```

---

## 💾 Cache Management

### Xóa cache:

```tsx
const clearCache = useClearCache();

// Xóa tất cả
clearCache();

// Xóa theo pattern
clearCache('projects');  // Xóa cache liên quan đến projects
clearCache('customers'); // Xóa cache liên quan đến customers
```

### Kiểm tra cache:

```tsx
const isCached = useIsCached('GET:/projects');

if (isCached) {
  console.log('Data is cached');
}
```

---

## ⚠️ Xử lý lỗi

### Error handling trong component:

```tsx
const { data, loading, error } = useProjects();

if (error) {
  return (
    <View>
      <Text>{error.message}</Text>
      {error.code === 'NETWORK_ERROR' && (
        <Text>Không có kết nối internet</Text>
      )}
      {error.code === 'TIMEOUT' && (
        <Text>Timeout. Vui lòng thử lại.</Text>
      )}
    </View>
  );
}
```

### Error codes:

| Code | Mô tả |
|------|-------|
| `NETWORK_ERROR` | Lỗi kết nối |
| `TIMEOUT` | Request timeout |
| `API_ERROR` | Lỗi từ API |
| `PARSE_ERROR` | Lỗi parse response |

---

## 🚀 Best Practices

### ✅ DO

```tsx
// 1. Sử dụng cache cho GET requests
useProjects({ cache: true });

// 2. Hiển thị source indicator
{source === 'mock' && <Badge>Offline</Badge>}

// 3. Handle loading state
{loading && <Loader />}

// 4. Provide retry option
{error && <Button onPress={refetch}>Retry</Button>}

// 5. Clear cache sau mutation
const { mutate } = useCreateProject({
  onSuccess: () => {
    clearCache('projects');
  },
});
```

### ❌ DON'T

```tsx
// 1. Không cache POST/PUT/DELETE
useCreateProject({ cache: true }); // ❌

// 2. Không quên handle error
const { data } = useProjects(); // ❌ thiếu error handling

// 3. Không gọi API quá thường xuyên
useProjects({ refetchInterval: 1000 }); // ❌ quá nhanh

// 4. Không ignore source
// Luôn thông báo user khi dùng mock data
```

---

## 📱 Testing

### Test với mock data:

```typescript
// Trong test file
import { ApiIntegration } from '@/services/apiIntegration';

// Mock API response
ApiIntegration.call = jest.fn().mockResolvedValue({
  success: true,
  data: mockProjects,
  source: 'mock',
  timestamp: Date.now(),
});

// Test component
const { getByText } = render(<ProjectList />);
expect(getByText('Mock Project')).toBeTruthy();
```

---

## 🔧 Troubleshooting

### Issue 1: Data không cập nhật

```tsx
// Solution: Xóa cache hoặc tắt cache
clearCache();
// hoặc
useProjects({ cache: false });
```

### Issue 2: API call nhiều lần

```tsx
// Solution: Kiểm tra enabled flag
useProjects({ enabled: Boolean(userId) });
```

### Issue 3: Mock data không hoạt động

```typescript
// Kiểm tra config
const INTEGRATION_CONFIG = {
  enableMockFallback: true, // Đảm bảo = true
};
```

---

## 📞 Support

**Files liên quan:**
- `services/apiIntegration.ts` - Core service
- `hooks/useApiIntegration.ts` - React hooks
- `components/examples/ApiIntegrationExamples.tsx` - Examples

**Liên hệ:** ThietKeResort Team

---

**Last Updated:** 2025-12-31  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
