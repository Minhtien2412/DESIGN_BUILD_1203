# 📡 API INTEGRATION GUIDE - Backend baotienweb.cloud

**Cập nhật:** 22/12/2025  
**Backend URL:** `https://baotienweb.cloud/api/v1`  
**WebSocket URL:** `wss://baotienweb.cloud/ws`

---

## 📋 TỔNG QUAN

### Services đã implement theo BACKEND_API_SPECS.md

| Service | File | Status | Endpoints |
|---------|------|--------|-----------|
| **Profile API** | `services/profileApi.ts` | ✅ Done | 4 endpoints |
| **Projects API** | `services/projects.ts` | ✅ Updated | 6 endpoints |
| **Services/Booking** | `services/servicesApi.ts` | ✅ New | 7 endpoints |
| **Notifications** | `services/notifications-api.ts` | ✅ Ready | 6 endpoints |
| **Users** | `services/userApi.ts` | ✅ Updated | 5 endpoints |
| **File Upload** | `services/fileUpload.ts` | ✅ Ready | 4 endpoints |

---

## 🔐 PROFILE API

**File:** `services/profileApi.ts`

### Endpoints

```typescript
// GET /profile - Lấy thông tin profile
import { getProfile } from '@/services/profileApi';
const { data } = await getProfile();

// PATCH /profile - Cập nhật profile
import { updateProfile } from '@/services/profileApi';
const result = await updateProfile({
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  address: '123 Nguyễn Huệ, Q1',
  bio: 'Kỹ sư xây dựng',
  dateOfBirth: '1990-05-15',
  gender: 'male'
});

// POST /profile/avatar - Upload avatar
import { uploadAvatar } from '@/services/profileApi';
const result = await uploadAvatar(imageUri);
// Returns: { avatar_url, thumbnail_url, uploaded_at }

// DELETE /profile/avatar - Xóa avatar
import { deleteAvatar } from '@/services/profileApi';
await deleteAvatar();
```

### Hook Usage

```typescript
import { useProfile } from '@/hooks/useProfile';

function ProfileScreen() {
  const {
    user,
    loading,
    uploading,
    error,
    refresh,
    updateProfile,
    uploadAvatar,
    takePhotoAndUpload,
    deleteAvatar,
    getDisplayAvatarUrl,
  } = useProfile();

  // Upload avatar từ gallery
  const handleUpload = async () => {
    const url = await uploadAvatar();
    if (url) console.log('New avatar:', url);
  };

  // Chụp ảnh và upload
  const handleTakePhoto = async () => {
    const url = await takePhotoAndUpload();
  };

  return (
    <Image source={{ uri: getDisplayAvatarUrl() }} />
  );
}
```

### Validation

```typescript
import { 
  isValidVietnamesePhone, 
  isValidDateOfBirth, 
  isValidName 
} from '@/services/profileApi';

// Vietnamese phone: 0901234567
isValidVietnamesePhone('0901234567'); // true

// User must be 18+
isValidDateOfBirth('1990-05-15'); // true

// Name: min 2 chars, Vietnamese chars allowed
isValidName('Nguyễn Văn A'); // true
```

---

## 📁 PROJECTS API

**File:** `services/projects.ts`

### Endpoints

```typescript
import { 
  fetchProjects,
  getProjectDetails,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectStats,
} from '@/services/projects';

// GET /projects - Danh sách với filter
const { data, pagination } = await fetchProjects({
  status: 'in_progress',
  project_type: 'villa',
  search: 'biệt thự',
  page: 1,
  limit: 20,
  sort_by: 'created_at',
  sort_order: 'desc',
});

// GET /projects/:id - Chi tiết
const project = await getProjectDetails(123);

// POST /projects - Tạo mới
const newProject = await createProject({
  name: 'Xây dựng biệt thự 3 tầng',
  project_type: 'villa',
  budget: 500000000,
  start_date: '2025-01-15',
  location: 'Quận 9, TPHCM',
});

// PATCH /projects/:id - Cập nhật (partial update)
const updated = await updateProject(123, {
  status: 'in_progress',
  budget: 550000000,
});

// DELETE /projects/:id - Soft delete
await deleteProject(123);
```

### Project Status Enum

```typescript
type ProjectStatus = 
  | 'planning'      // Đang lên kế hoạch
  | 'design'        // Đang thiết kế
  | 'bidding'       // Đang đấu thầu
  | 'in_progress'   // Đang thi công
  | 'paused'        // Tạm dừng
  | 'completed'     // Hoàn thành
  | 'cancelled';    // Đã hủy
```

---

## 🛒 SERVICES BOOKING API

**File:** `services/servicesApi.ts`

### Endpoints

```typescript
import {
  getServices,
  getServiceById,
  getServiceDetails,
  getServiceCategories,
  createBooking,
  getUserBookings,
  cancelBooking,
} from '@/services/servicesApi';

// GET /services - Danh sách dịch vụ (public)
const { data, meta } = await getServices({
  category: 'design',
  sortBy: 'rating',
  page: 1,
  limit: 20,
});

// GET /services/:id/details - Chi tiết với reviews
const { data: service } = await getServiceDetails(123);

// GET /services/categories - Danh mục
const { data: categories } = await getServiceCategories();

// POST /services/bookings - Đặt dịch vụ (auth required)
const booking = await createBooking({
  serviceId: 123,
  startDate: '2025-12-20',
  endDate: '2026-01-20',
  notes: 'Cần thiết kế nhà 3 tầng, 120m²',
});

// GET /services/bookings - Lịch sử đặt
const { data: bookings } = await getUserBookings({ status: 'PENDING' });

// PATCH /services/bookings/:id/cancel - Hủy đơn
await cancelBooking(bookingId);
```

### Hook Usage

```typescript
import { useServicesBooking } from '@/hooks/useServicesBooking';

function ServicesScreen() {
  const {
    services,
    categories,
    bookings,
    loadingServices,
    loadServices,
    loadCategories,
    createServiceBooking,
    cancelServiceBooking,
    formatServicePrice,
    getStatusText,
  } = useServicesBooking();

  useEffect(() => {
    loadServices();
    loadCategories();
  }, []);

  const handleBook = async () => {
    const success = await createServiceBooking({
      serviceId: 1,
      startDate: '2025-12-20',
      endDate: '2026-01-20',
    });
  };
}
```

---

## 🔔 NOTIFICATIONS API

**File:** `services/notifications-api.ts`

### Endpoints

```typescript
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
} from '@/services/notifications-api';

// GET /notifications
const { data, meta } = await getNotifications({
  page: 1,
  limit: 20,
  isRead: false,
  type: 'PUSH',
  priority: 'HIGH',
});

// GET /notifications/unread-count
const { count } = await getUnreadCount();

// PATCH /notifications/:id/read
await markNotificationRead(123);

// PATCH /notifications/read-all
const { count: markedCount } = await markAllNotificationsRead();

// PATCH /notifications/:id/archive
await archiveNotification(123);
```

### Notification Types

```typescript
type NotificationType = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
```

---

## 📤 FILE UPLOAD API

**File:** `services/fileUpload.ts`

### Functions

```typescript
import {
  uploadAvatar,
  pickAndUploadDocument,
  captureAndUploadConstructionPhoto,
  uploadMultipleFiles,
} from '@/services/fileUpload';

// Upload avatar
const result = await uploadAvatar(imageUri);

// Upload document (PDF, DOC, Excel)
const doc = await pickAndUploadDocument(projectId);

// Capture construction photo with GPS
const photo = await captureAndUploadConstructionPhoto(projectId, {
  location: 'Tầng 2',
  description: 'Hoàn thành đổ bê tông',
  tags: ['bê tông', 'tầng 2'],
});
```

---

## 🔑 AUTHENTICATION

### API Key

```typescript
import { setApiKey, getApiKey } from '@/services/api';

// Set API key (from env or login response)
setApiKey('your-api-key');
```

### Auth Token

```typescript
import { setToken, clearToken } from '@/services/api';

// After login
setToken(accessToken);

// After logout
clearToken();
```

### Refresh Token

```typescript
import { setRefreshToken } from '@/services/api';

// Store refresh token
setRefreshToken(refreshToken);
```

---

## ⚠️ ERROR HANDLING

### API Error Class

```typescript
import { ApiError, apiFetch } from '@/services/api';

try {
  const data = await apiFetch('/profile');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.status);      // 400, 401, 404, etc.
    console.log('Code:', error.code);          // VALIDATION_ERROR, UNAUTHORIZED, etc.
    console.log('Message:', error.message);
    console.log('Details:', error.data);       // { field: ['error message'] }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `FILE_TOO_LARGE` | 413 | File > 5MB |
| `INVALID_FILE` | 400 | Wrong file type |

---

## 📦 BARREL EXPORTS

### From `services/index.ts`

```typescript
// Import all services
import {
  apiFetch,
  ApiError,
  setToken,
  // Profile
  getProfile,
  updateProfile,
  uploadAvatar,
  // Projects
  fetchProjects,
  createProject,
  // Services
  getServices,
  createBooking,
  // Notifications
  getNotifications,
  markNotificationRead,
} from '@/services';
```

---

## 🧪 TESTING

### Test API Connection

```bash
# Check health
curl https://baotienweb.cloud/api/v1/health

# Test auth (get profile)
curl -H "Authorization: Bearer $TOKEN" \
  https://baotienweb.cloud/api/v1/profile
```

### Verify in App

```typescript
import { apiFetch } from '@/services/api';

// Health check
const health = await apiFetch('/health');
console.log('API Status:', health);
```

---

## 📝 CHECKLIST

### Profile API
- [x] GET /profile
- [x] PATCH /profile
- [x] POST /profile/avatar
- [x] DELETE /profile/avatar

### Projects API
- [x] GET /projects
- [x] GET /projects/:id
- [x] POST /projects
- [x] PATCH /projects/:id
- [x] DELETE /projects/:id
- [x] GET /projects/stats

### Services API
- [x] GET /services
- [x] GET /services/:id
- [x] GET /services/:id/details
- [x] GET /services/categories
- [x] POST /services/bookings
- [x] GET /services/bookings
- [x] PATCH /services/bookings/:id/cancel

### Notifications API
- [x] GET /notifications
- [x] GET /notifications/unread-count
- [x] PATCH /notifications/:id/read
- [x] PATCH /notifications/read-all
- [x] PATCH /notifications/:id/archive

---

## 🔗 RELATED DOCS

- [BACKEND_API_SPECS.md](./BACKEND_API_SPECS.md) - Backend specification
- [AUTH_API_DOCS.md](./AUTH_API_DOCS.md) - Authentication endpoints
- [HOMEPAGE_AUDIT_REPORT.md](./HOMEPAGE_AUDIT_REPORT.md) - Frontend audit

---

*Generated: 22/12/2025*
