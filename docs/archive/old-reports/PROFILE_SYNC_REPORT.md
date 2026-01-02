# Báo Cáo Kiểm Tra Đồng Bộ Profile & Avatar

**Ngày**: December 12, 2025  
**Trạng thái**: ⚠️ Chưa hoàn chỉnh - Cần backend hỗ trợ

---

## ✅ Đã Hoàn Thành

### 1. Frontend Infrastructure
- ✅ **AuthContext** có `updateAvatar()` và `updateProfile()`
- ✅ **useAvatar.ts** hook mới với `useAvatarUpload()` cho upload
- ✅ **profileApi.ts** service với `uploadAvatar()` function
- ✅ **resolveAvatar()** utility xử lý tất cả URL formats
- ✅ **PROFILE_SYNC_DOCUMENTATION.md** - Tài liệu chi tiết

### 2. Components Support
- ✅ `LuxuryAvatar` component sẵn sàng
- ✅ Upload UI trong `info-luxury.tsx`
- ✅ Avatar display trong `profile-luxury.tsx`
- ✅ Avatar trong `index.tsx` (home screen)

---

## ❌ Chưa Hoàn Thành

### 1. Backend API Endpoints (CRITICAL)

**Thiếu các endpoints sau:**

#### a) Upload Avatar
```
POST /api/v1/profile/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: FormData { avatar: File }

Response: {
  success: true,
  data: {
    avatar_url: "/uploads/avatars/user_123_1702345678.jpg"
  }
}
```

#### b) Update Profile
```
PATCH /api/v1/profile
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  name?: string,
  phone?: string,
  avatar?: string,
  bio?: string,
  address?: string,
  city?: string,
  country?: string
}

Response: {
  success: true,
  data: { ...updatedUserProfile }
}
```

#### c) Get Profile Enhancement
```
GET /api/v1/profile
Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    id: 123,
    email: "user@example.com",
    name: "User Name",
    avatar: "/uploads/avatars/user_123.jpg",  // ← Cần thêm field này
    phone: "0123456789",
    role: "CLIENT",
    bio: "...",
    address: "...",
    city: "...",
    country: "..."
  }
}
```

### 2. File Storage Setup

**Backend cần:**
- 📁 Thư mục: `/public/uploads/avatars/`
- 📝 Naming convention: `user_{userId}_{timestamp}.{ext}`
- ✂️ Image processing: Resize to 512x512px
- 🖼️ Thumbnail generation: 120x120px
- ✅ Validation:
  - Max size: 5MB
  - Allowed: jpg, jpeg, png, webp
  - Security: Validate mime type

### 3. Frontend Integration

**Cần update các screens:**

#### a) Home Screen (`app/(tabs)/index.tsx`)
```typescript
// BEFORE (hiện tại)
<Image 
  source={{ uri: user.avatar || 'https://i.pravatar.cc/150?img=12' }}
  style={styles.avatar}
/>

// AFTER (cần sửa)
import { useAvatarUpload } from '@/hooks/useAvatar';

const { avatarUrl } = useAvatarUpload();

<Image 
  source={{ uri: avatarUrl }}
  style={styles.avatar}
/>
```

#### b) Profile Luxury (`app/(tabs)/profile-luxury.tsx`)
```typescript
// BEFORE
const avatar = resolveAvatar(user?.avatar, { ... });

// AFTER
import { useAvatarUpload } from '@/hooks/useAvatar';
const { avatarUrl } = useAvatarUpload();
```

#### c) Profile Info (`app/profile/info-luxury.tsx`)
```typescript
// BEFORE
const [avatarUri, setAvatarUri] = useState<string>(...);

// AFTER
import { useAvatarUpload } from '@/hooks/useAvatar';

const { avatarUrl, upload, uploading } = useAvatarUpload();
const [localAvatar, setLocalAvatar] = useState(avatarUrl);

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({...});
  
  if (!result.canceled) {
    const uri = result.assets[0].uri;
    setLocalAvatar(uri); // Optimistic UI
    
    try {
      await upload(uri); // Upload & sync globally
    } catch (error) {
      setLocalAvatar(avatarUrl); // Rollback
      alert('Upload thất bại');
    }
  }
};
```

---

## 🔄 Vấn Đề Không Đồng Bộ

### Hiện Tại

| Screen | Avatar Source | Vấn đề |
|--------|---------------|--------|
| **Home** | `user.avatar` trực tiếp | Không dùng `resolveAvatar()`, hardcode placeholder |
| **Profile Luxury** | `resolveAvatar()` | Chỉ có placeholder, không có real data |
| **Profile Info** | Local state + ImagePicker | Upload UI sẵn sàng nhưng không sync backend |
| **Notifications** | Không có | Chưa hiển thị avatar user |

### Kết quả
- ❌ Upload avatar trong Profile Info **KHÔNG** cập nhật Home screen
- ❌ Mỗi trang có URL khác nhau cho cùng 1 user
- ❌ Không có single source of truth

---

## 📋 Checklist Hoàn Thiện

### Backend (Ưu tiên cao)
- [ ] Tạo migration thêm `users.avatar` column (VARCHAR 255)
- [ ] Tạo `ProfileController.uploadAvatar()` endpoint
- [ ] Tạo `ProfileController.updateProfile()` endpoint  
- [ ] Setup multer middleware cho file upload
- [ ] Setup sharp/jimp cho image resize
- [ ] Tạo thư mục `/public/uploads/avatars/` với permissions
- [ ] Add CORS cho `/uploads/*` path
- [ ] Test với Postman/curl

### Frontend
- [ ] Update `app/(tabs)/index.tsx` dùng `useAvatarUpload()`
- [ ] Update `app/(tabs)/profile-luxury.tsx` dùng `useAvatarUpload()`
- [ ] Update `app/profile/info-luxury.tsx` connect upload button
- [ ] Test upload flow end-to-end
- [ ] Verify cache busting hoạt động
- [ ] Test offline/online sync

### Documentation
- [x] Tạo PROFILE_SYNC_DOCUMENTATION.md
- [x] Document API specs
- [ ] Update API_INTEGRATION.md
- [ ] Add examples vào BACKEND_INTEGRATION_GUIDE.md

---

## 🚀 Steps Triển Khai

### Phase 1: Backend API (1-2 ngày)
```bash
1. Database migration
   - ALTER TABLE users ADD COLUMN avatar VARCHAR(255);

2. Create ProfileController
   - uploadAvatar(req, res)
   - updateProfile(req, res)
   - getProfile(req, res) // enhance existing

3. Setup middleware
   - multer for file upload
   - sharp for image processing
   - file validation

4. Test endpoints
   - POST /profile/avatar
   - PATCH /profile
   - GET /profile
```

### Phase 2: Frontend Integration (1 ngày)
```bash
1. Update screens
   - index.tsx (home)
   - profile-luxury.tsx
   - info-luxury.tsx

2. Test flows
   - Upload avatar
   - Verify sync across screens
   - Test cache busting
   - Test error handling
```

### Phase 3: Testing & Polish (0.5 ngày)
```bash
1. E2E testing
   - Upload → Home refresh → Profile check
   - Offline → Online sync
   - Large file handling
   - Invalid file types

2. UX improvements
   - Loading states
   - Error messages
   - Optimistic updates
```

---

## 📊 API Example

### Upload Avatar Request
```bash
curl -X POST https://baotienweb.cloud/api/v1/profile/avatar \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/image.jpg"
```

### Response
```json
{
  "success": true,
  "data": {
    "avatar_url": "/uploads/avatars/user_123_1702345678.jpg",
    "full_url": "https://baotienweb.cloud/uploads/avatars/user_123_1702345678.jpg",
    "thumbnail_url": "/uploads/avatars/user_123_1702345678_thumb.jpg"
  }
}
```

### Update Profile Request
```bash
curl -X PATCH https://baotienweb.cloud/api/v1/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "bio": "Construction Engineer",
    "city": "Hà Nội"
  }'
```

---

## 🎯 Kết Luận

### ✅ Đã Sẵn Sàng
- Frontend infrastructure hoàn chỉnh
- Services & hooks đã implement
- UI components ready
- Documentation đầy đủ

### ❌ Đang Chờ
- **Backend API endpoints** (CRITICAL BLOCKER)
- File storage setup
- Image processing pipeline

### 📝 Hành Động Tiếp Theo
1. **Backend team**: Implement 3 endpoints (avatar upload, profile update, profile get enhancement)
2. **DevOps**: Setup `/uploads/avatars/` folder với permissions
3. **Frontend team**: Test integration khi backend sẵn sàng

**Thời gian dự kiến**: 2-3 ngày khi có backend hỗ trợ

---

## 📞 Liên Hệ

**Frontend**: Ready & waiting for backend  
**Backend**: Cần implement profile endpoints  
**Status**: 🟡 Blocked by backend API

**Files Created**:
- ✅ `PROFILE_SYNC_DOCUMENTATION.md` - Chi tiết solution
- ✅ `hooks/useAvatar.ts` - Avatar upload hook (updated)
- ✅ `services/api/profileApi.ts` - Profile API service
- ✅ `context/AuthContext.tsx` - Added updateAvatar & updateProfile
- ✅ `PROFILE_SYNC_REPORT.md` - Báo cáo này
