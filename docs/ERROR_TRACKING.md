# 🔧 Error Tracking & Fix Plan
## App Restructuring - Issue Resolution

**Ngày tạo:** 2025-12-23  
**Cập nhật:** 2025-12-23  
**Trạng thái:** 🟡 Đang xử lý (6/11 đã fix)  
**Phiên bản:** SDK 54 / Expo Go

---

## 📋 Tổng quan lỗi

| # | Mức độ | Loại | Mô tả | File | Trạng thái |
|---|--------|------|-------|------|------------|
| 1 | 🔴 Critical | Runtime | Camera.requestCameraPermissionsAsync undefined | PermissionContext.tsx | ✅ Fixed |
| 2 | 🔴 Critical | API | /api/v1/favorites - 404 Not Found | FavoritesContext.tsx | ⏳ BE cần tạo |
| 3 | 🔴 Critical | API | /api/v1/profile/update - 404 (POST instead of PATCH) | ProfileScreen | ✅ Fixed |
| 4 | 🟠 High | API | isAvailable param not supported by BE | services/products.ts | ✅ Fixed |
| 5 | 🟡 Warning | Layout | VirtualizedList nested in ScrollView | app/(tabs)/index.tsx | ⏳ Pending |
| 6 | 🟡 Warning | Icon | "blueprint" invalid Ionicons name | constants/app-routes.ts | ✅ Fixed |
| 7 | 🟡 Warning | Deprecated | expo-av deprecated (SDK 54) | VideoPlayer components | ⏳ Pending |
| 8 | 🟡 Warning | Deprecated | ImagePicker.MediaTypeOptions deprecated | Multiple files (11) | ✅ Fixed |
| 9 | ⚪ Info | Expo Go | expo-notifications not supported | Expected in Expo Go | ℹ️ Known |
| 10 | ⚪ Info | Expo Go | WebRTC not available | Expected in Expo Go | ℹ️ Known |
| 11 | ⚪ Info | Config | OPENAI_API_KEY not set | config/env.ts | ℹ️ Optional |

---

## ✅ Đã sửa xong (6 issues)

### Issue #1: Camera Permission API - ✅ FIXED
### Issue #3: Profile Update Endpoint - ✅ FIXED  
### Issue #4: Products isAvailable Param - ✅ FIXED
### Issue #6: Invalid Icon Name - ✅ FIXED
### Issue #8: ImagePicker MediaTypeOptions - ✅ FIXED (11 files updated)

**Files updated for Issue #8:**
- services/media-upload.ts
- hooks/useProfile.ts  
- hooks/useFileUpload.ts
- components/social/PostComposer.tsx
- components/rating/RatingReviewScreen.tsx
- components/projects/LocationCheckIn.tsx
- components/ui/create-project-form.tsx
- components/messages/FilePicker.tsx
- components/chat/ChatRoom.tsx
- components/chat/AttachmentPicker.tsx

---

## ⏳ Còn lại (3 issues cần xử lý)

---

## 🔴 1. Camera Permission API Error

### Vấn đề
```
ERROR  [Permissions] Failed to request initial permissions: 
[TypeError: Camera.requestCameraPermissionsAsync is not a function (it is undefined)]
```

### Nguyên nhân
Expo Camera SDK 54 đổi API. `requestCameraPermissionsAsync` không còn tồn tại.

### File ảnh hưởng
- `context/PermissionContext.tsx` (line 144)

### Giải pháp
```typescript
// OLD (broken)
Camera.requestCameraPermissionsAsync()

// NEW (correct)
Camera.requestCameraPermissionsAsync 
  ? Camera.requestCameraPermissionsAsync()
  : Camera.getCameraPermissionsAsync() // fallback
```

### Cập nhật đề xuất
```typescript
// Safe permission request with fallback
const requestCameraPermission = async () => {
  try {
    // Try new API first
    if (typeof Camera.requestCameraPermissionsAsync === 'function') {
      return await Camera.requestCameraPermissionsAsync();
    }
    // Fallback to older API
    if (typeof Camera.getCameraPermissionsAsync === 'function') {
      return await Camera.getCameraPermissionsAsync();
    }
    console.warn('[Permissions] Camera API not available');
    return { status: 'undetermined' };
  } catch (e) {
    console.error('[Permissions] Camera permission error:', e);
    return { status: 'denied' };
  }
};
```

---

## 🔴 2. /favorites Endpoint Missing (BE)

### Vấn đề
```
ERROR  [FavoritesContext] Failed to load from API: 
{"message": "Cannot GET /api/v1/favorites", "status": 404}
```

### Nguyên nhân
Backend chưa có endpoint `/favorites`.

### File ảnh hưởng
- `context/FavoritesContext.tsx`
- `services/favorites.ts` (nếu có)

### Giải pháp BE
Cần tạo FavoritesModule trong NestJS:

```
BE-baotienweb.cloud/src/favorites/
├── favorites.module.ts
├── favorites.controller.ts
├── favorites.service.ts
└── dto/
    ├── add-favorite.dto.ts
    └── favorite-response.dto.ts
```

### Giải pháp FE (tạm thời)
```typescript
// Fallback to local storage when API fails
try {
  const data = await apiFetch('/favorites');
  return data;
} catch (err) {
  if (err.status === 404) {
    console.log('[Favorites] API not available, using local storage');
    return await loadFromLocalStorage();
  }
  throw err;
}
```

---

## 🔴 3. Profile Update - Wrong HTTP Method

### Vấn đề
```
ERROR  Update profile error: 
{"message": "Cannot POST /api/v1/profile/update", "status": 404}
```

### Nguyên nhân
- FE gọi `POST /profile/update`
- BE expect `PATCH /profile` (không có `/update`)

### File ảnh hưởng
- `app/profile/info.tsx` hoặc tương tự
- `services/profile.ts`

### BE Controller (đã kiểm tra)
```typescript
@Patch()  // PATCH /api/v1/profile
async updateProfile(@Body() dto: UpdateProfileDto) { ... }
```

### Giải pháp FE
```typescript
// OLD (wrong)
await apiFetch('/profile/update', { method: 'POST', data });

// NEW (correct)
await apiFetch('/profile', { method: 'PATCH', data });
```

---

## 🟠 4. isAvailable Parameter Not Supported

### Vấn đề
```
ERROR  [getMyProducts] API error: 
{"message": ["property isAvailable should not exist"], "status": 400}
```

### Nguyên nhân
BE không hỗ trợ `isAvailable` trong FilterProductsDto.

### File ảnh hưởng
- `services/products.ts` (line 34)

### Giải pháp
```typescript
// OLD
if (filters?.isAvailable !== undefined) 
  params.append('isAvailable', filters.isAvailable.toString());

// NEW - Remove or map to supported field
// Option 1: Remove completely
// if (filters?.isAvailable !== undefined) 
//   params.append('isAvailable', filters.isAvailable.toString());

// Option 2: Map to status if available === true means APPROVED
if (filters?.isAvailable === true && !filters?.status) {
  params.append('status', 'APPROVED');
}
```

### Cập nhật Type
```typescript
// types/products.ts
interface FilterProductsDto {
  // Remove isAvailable or mark as optional FE-only
  // isAvailable?: boolean; // ❌ Remove
  status?: ProductStatus;  // ✅ Use this instead
}
```

---

## 🟡 5. VirtualizedList Nesting Warning

### Vấn đề
```
ERROR  VirtualizedLists should never be nested inside plain ScrollViews 
with the same orientation
```

### Nguyên nhân
`<FlatList>` trong `<ScrollView>` ở Home screen.

### File ảnh hưởng
- `app/(tabs)/index.tsx` (line 496, 504 area)
- `components/products/ProductsList.tsx` (line 254)

### Giải pháp
Option 1: Dùng SectionList thay vì ScrollView + FlatList
```typescript
<SectionList
  sections={[
    { title: 'Banner', data: [{}], renderItem: renderBanner },
    { title: 'Products', data: products, renderItem: renderProduct },
  ]}
/>
```

Option 2: Dùng FlatList với ListHeaderComponent
```typescript
<FlatList
  ListHeaderComponent={() => (
    <>
      <Banner />
      <QuickActions />
      <Categories />
    </>
  )}
  data={products}
  renderItem={renderProduct}
/>
```

---

## 🟡 6. Invalid Icon Name "blueprint"

### Vấn đề
```
WARN  "blueprint" is not a valid icon name for family "ionicons"
```

### Nguyên nhân
Icon "blueprint" không tồn tại trong Ionicons.

### Giải pháp
Thay thế bằng icon hợp lệ:
```typescript
// Suggested alternatives
'construct-outline'  // Cho construction
'map-outline'        // Cho sitemap/blueprint
'grid-outline'       // Cho layout
'layers-outline'     // Cho layers/blueprint
```

### Cách tìm
Tìm trong codebase: `grep -r "blueprint" --include="*.tsx" --include="*.ts"`

---

## 🟡 7. expo-av Deprecated

### Vấn đề
```
WARN  [expo-av]: Expo AV has been deprecated and will be removed in SDK 54. 
Use the `expo-audio` and `expo-video` packages.
```

### Giải pháp
1. Install new packages:
```bash
npx expo install expo-audio expo-video
```

2. Migration:
```typescript
// OLD
import { Video, Audio } from 'expo-av';

// NEW
import { useVideoPlayer, VideoView } from 'expo-video';
import { Audio } from 'expo-audio';
```

### Files cần update
- Tất cả files sử dụng `expo-av`
- VideoPlayer components
- Audio playback components

---

## 🟡 8. ImagePicker.MediaTypeOptions Deprecated

### Vấn đề
```
WARN  [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. 
Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
```

### Giải pháp
```typescript
// OLD
mediaTypes: ImagePicker.MediaTypeOptions.Images,

// NEW
mediaTypes: ['images'], // or 'images' | 'videos' | 'livePhotos'
```

---

## ⚪ 9-11. Expo Go Limitations (Info Only)

Những warning này là **expected** khi chạy trong Expo Go:
- expo-notifications: Cần development build
- WebRTC: Cần development build  
- OpenAI API key: Cần set trong env

**Không cần fix** - chỉ cần development build để test đầy đủ.

---

## 📊 Backend Endpoints Status

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/profile` | GET | ✅ Works | |
| `/profile` | PATCH | ✅ Works | FE gọi sai path |
| `/profile/update` | POST | ❌ 404 | Không tồn tại |
| `/products` | GET | ⚠️ Partial | isAvailable không hỗ trợ |
| `/favorites` | GET | ❌ 404 | Chưa implement |
| `/favorites` | POST | ❌ 404 | Chưa implement |

---

## 🛠️ Thứ tự Fix

### Phase 1: Critical Runtime Errors (Ngay lập tức)
1. ✅ Fix Camera permission API
2. ✅ Fix profile update path (POST → PATCH)
3. ✅ Remove isAvailable from products query

### Phase 2: API Improvements (Tuần 1)
4. Create /favorites endpoint in BE
5. Add error fallback in FE contexts

### Phase 3: Layout/UI Fixes (Tuần 1)
6. Fix VirtualizedList nesting
7. Fix invalid icon names

### Phase 4: Deprecation Updates (Tuần 2)
8. Migrate expo-av → expo-video + expo-audio
9. Update ImagePicker MediaTypeOptions

---

## 📁 Files cần sửa

### FE - Immediate
- [ ] `context/PermissionContext.tsx` - Camera API
- [ ] `services/products.ts` - Remove isAvailable
- [ ] `app/profile/info.tsx` - PATCH instead of POST
- [ ] `app/(tabs)/index.tsx` - VirtualizedList

### BE - Week 1
- [ ] Tạo `src/favorites/` module
- [ ] Verify profile endpoint paths

### FE - Week 2
- [ ] Migrate expo-av usage
- [ ] Update ImagePicker calls

---

*Cập nhật lần cuối: 2025-12-23*
