# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI API VÀ GIẢI PHÁP UPLOAD/DOWNLOAD

**Ngày cập nhật:** 29/12/2025  
**Server:** https://baotienweb.cloud/api/v1  
**Trạng thái:** Đã sửa các lỗi chính + Triển khai giải pháp lâu dài

---

## 📊 TỔNG QUAN VẤN ĐỀ

### Kết quả Test Ban đầu
- ✅ **7 Features PASS:** Auth, Projects, Tasks, Notifications, Messages, Products, Users
- ❌ **7 Features FAIL (404):** Profile, Documents, Budget, Contracts, Analytics, Construction, Search

### Nguyên nhân
1. **Endpoint sai path:** Profile, Construction Progress, Timeline sử dụng endpoint không tồn tại
2. **Backend chưa implement:** Documents, Budget, Contracts, Analytics, Search chưa có API

---

## ✅ CÁC LỖI ĐÃ SỬA

### 1. Profile Endpoint
| Trước (❌) | Sau (✅) |
|-----------|---------|
| `/auth/profile` | `/users/{userId}` |
| `GET /api/auth/me` | `GET /api/v1/users/29` |

**File sửa:** `services/featureServiceWrapper.ts` → `ProfileService.getProfile()`

### 2. Construction Progress Endpoint
| Trước (❌) | Sau (✅) |
|-----------|---------|
| `/construction/progress` | `/projects/{projectId}/progress` |
| `GET /construction-progress` | `GET /projects/1/progress` |

**File sửa:** `services/featureServiceWrapper.ts` → `ConstructionProgressService.getByProject()`

### 3. Timeline Endpoint
| Trước (❌) | Sau (✅) |
|-----------|---------|
| `/timeline` | `/projects/{projectId}/timeline` |

**File sửa:** `services/featureServiceWrapper.ts` → `ConstructionProgressService.getTimeline()`

---

## 🔜 FEATURES CHƯA CÓ BACKEND (Coming Soon)

Các features sau đang sử dụng **Mock Data** và **Offline Storage**:

| Feature | Endpoint | Trạng thái | Mock Data |
|---------|----------|------------|-----------|
| Documents | `/documents` | 🔜 Q1 2026 | ✅ Có |
| Budget | `/budget` | 🔜 Q1 2026 | ✅ Có |
| Contracts | `/contracts` | 🔜 Q1 2026 | ✅ Có |
| Analytics | `/analytics/dashboard` | 🔜 Q1 2026 | ✅ Có |
| Search | `/search` | 🔜 Q1 2026 | ✅ Local search |

---

## 📂 CÁC FILE MỚI ĐƯỢC TẠO

### 1. `services/featureAvailability.ts`
Quản lý trạng thái các features:
```typescript
import { isFeatureAvailable, getFeatureStatus } from './featureAvailability';

// Kiểm tra feature
if (isFeatureAvailable('DOCUMENTS')) {
  // Gọi API
} else {
  // Hiển thị message fallback
}
```

### 2. `services/offlineStorage.ts`
Xử lý lưu trữ offline và pending uploads:
```typescript
import { OfflineDocuments, OfflineBudget, FileCache } from './offlineStorage';

// Lưu document offline
const doc = await OfflineDocuments.add({ name: 'test.pdf', type: 'pdf', size: 1000 });

// Thêm pending upload
const upload = await FileCache.addPendingUpload({
  type: 'document',
  localUri: file.uri,
  targetEndpoint: '/documents/upload',
  fileName: 'test.pdf',
  mimeType: 'application/pdf',
});
```

### 3. `services/featureServiceWrapper.ts`
Service wrapper với graceful degradation:
```typescript
import Services from './featureServiceWrapper';

// Tự động fallback về mock/offline nếu API không khả dụng
const result = await Services.Documents.getAll();
if (result.source === 'mock') {
  console.log('Đang dùng dữ liệu mẫu:', result.message);
}
```

### 4. `data/mockFeatureData.ts`
Mock data cho demo và development:
- 5 mẫu Documents
- 5 mẫu Budget Categories + 5 Transactions
- 4 mẫu Contracts
- Analytics Summary + Charts data

---

## 📤 GIẢI PHÁP LÂU DÀI: UPLOAD/DOWNLOAD

### Kiến trúc Upload với Retry và Caching

```
┌─────────────────────────────────────────────────────────────┐
│                    UPLOAD FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User chọn file                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │ FileCache.      │                                        │
│  │ addPendingUpload│  Lưu metadata + localUri              │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐     ✅ Success                        │
│  │  Try API Upload │─────────────────────────►  Done       │
│  └────────┬────────┘                                        │
│           │ ❌ Fail                                         │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Save to Offline │  Đánh dấu syncStatus: 'pending'       │
│  │    Storage      │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ SyncService     │  Retry khi có network                 │
│  │ (Background)    │  Max 3 attempts                       │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Kiến trúc Download với Caching

```
┌─────────────────────────────────────────────────────────────┐
│                   DOWNLOAD FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Request file                                               │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │ FileCache.      │     ✅ Cached & Valid                 │
│  │ getCachedFile   │─────────────────────────► Return      │
│  └────────┬────────┘                                        │
│           │ ❌ Not cached / Expired                         │
│           ▼                                                 │
│  ┌─────────────────┐     ✅ Success                        │
│  │  Download from  │─────────────────────────► Cache &     │
│  │     Server      │                           Return      │
│  └────────┬────────┘                                        │
│           │ ❌ Offline                                      │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ Return cached   │  Dù đã expired                        │
│  │ version (stale) │                                        │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Cách sử dụng trong Component

```typescript
import { DocumentsService } from '../services/featureServiceWrapper';
import { FileCache } from '../services/offlineStorage';

// Upload với fallback
const handleUpload = async (file) => {
  const result = await DocumentsService.upload(file, projectId);
  
  if (result.isOffline) {
    // Show toast: "Đã lưu offline, sẽ upload khi có mạng"
    showToast(result.message);
  } else {
    // Show toast: "Upload thành công"
    showToast('Upload thành công!');
  }
};

// Download với caching
const handleDownload = async (remoteUrl, fileName) => {
  // Thử cache trước
  let cached = await FileCache.getCachedFile(remoteUrl);
  
  if (!cached) {
    cached = await FileCache.cacheFile(remoteUrl, fileName, 'application/pdf');
  }
  
  if (cached) {
    // Mở file từ cached.localUri
    openFile(cached.localUri);
  }
};
```

---

## 🔄 SYNC SERVICE

Service tự động đồng bộ data khi có network:

```typescript
import { SyncService } from '../services/offlineStorage';

// Gọi khi app start hoặc network change
const syncResults = await SyncService.syncPendingData(API_BASE_URL, authToken);

console.log(`Synced: ${syncResults.documents} documents, ${syncResults.uploads} uploads`);
if (syncResults.errors.length > 0) {
  console.log('Errors:', syncResults.errors);
}
```

### Tích hợp với Network Listener

```typescript
import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../services/offlineStorage';

// Trong App.tsx hoặc _layout.tsx
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      // Có mạng - thử sync
      SyncService.syncPendingData(API_URL, getAuthToken());
    }
  });
  
  return () => unsubscribe();
}, []);
```

---

## 📋 CHECKLIST MIGRATION CHO DEVELOPER

### Khi Backend endpoint sẵn sàng:

1. **Cập nhật `featureAvailability.ts`:**
   ```typescript
   DOCUMENTS: {
     name: 'Quản lý Tài liệu',
     status: 'available', // Đổi từ 'coming_soon'
     // ...
   }
   ```

2. **Cập nhật `featureServiceWrapper.ts`:**
   - Xóa mock data fallback (optional - có thể giữ cho offline mode)
   - Test API call thật

3. **Chạy sync để migrate offline data:**
   ```typescript
   await SyncService.syncPendingData(API_URL, token);
   ```

---

## 🛠️ CÁCH DEBUG

### Kiểm tra trạng thái features:
```typescript
import { logFeatureStatus } from '../services/featureAvailability';

logFeatureStatus();
// Output:
// 📊 FEATURE STATUS SUMMARY
// ========================
// ✅ Available (6): Authentication, Quản lý Dự án, ...
// ⚠️ Degraded (3): Hồ sơ Người dùng, Tiến độ Thi công, ...
// 🔜 Coming Soon (5): Quản lý Tài liệu, Ngân sách, ...
```

### Kiểm tra pending uploads:
```typescript
import { FileCache } from '../services/offlineStorage';

const pending = await FileCache.getPendingUploads();
console.log('Pending uploads:', pending.length);
```

### Kiểm tra cache size:
```typescript
const cacheSize = await FileCache.getCacheSize();
console.log('Cache size:', formatFileSize(cacheSize));
```

---

## 📈 ROADMAP

### Phase 1 (Đã hoàn thành) ✅
- [x] Sửa endpoint Profile, Progress, Timeline
- [x] Tạo Feature Availability system
- [x] Tạo Offline Storage service
- [x] Tạo Mock Data
- [x] Tạo Service Wrapper với fallback

### Phase 2 (Đợi Backend)
- [ ] Documents API implementation
- [ ] Budget API implementation
- [ ] Contracts API implementation
- [ ] Analytics API implementation
- [ ] Search API implementation

### Phase 3 (Enhancement)
- [ ] Push notification khi sync complete
- [ ] Background sync với expo-background-fetch
- [ ] Conflict resolution cho concurrent edits
- [ ] Data compression cho large files

---

## 📞 LIÊN HỆ HỖ TRỢ

- **Backend Team:** Yêu cầu implement các endpoint còn thiếu
- **Frontend Issues:** Kiểm tra console log cho debug info
- **API Docs:** Xem `docs/AUTH_API_DOCS.md`

---

*Báo cáo được tạo tự động bởi GitHub Copilot*
