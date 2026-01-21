# Pexels API Integration Report
## Tích hợp Pexels API cho ảnh & video miễn phí

**Ngày tạo:** 13/01/2026  
**Trạng thái:** ✅ Hoàn thành

---

## 📋 Tổng quan

Đã tích hợp thành công **Pexels API** để cung cấp ảnh và video miễn phí chất lượng cao cho người dùng app. Tất cả nội dung từ Pexels có thể sử dụng cho mục đích thương mại.

---

## 🔑 API Configuration

| Tên | Giá trị |
|-----|---------|
| API Key | `jrbziKeYNCKFNatKRlsn6iIzjE5RZljR2ncLn1ai6D80VQu7ND8BYN2c` |
| Base URL | `https://api.pexels.com` |
| Photos Endpoint | `/v1/search`, `/v1/curated` |
| Videos Endpoint | `/videos/search`, `/videos/popular` |
| Status | ✅ Working (200 OK) |

---

## 📁 Files Created/Modified

### 1. Pexels Service
**File:** `services/pexelsService.ts`  
**Chức năng:**
- `searchPhotos(query, options)` - Tìm kiếm ảnh
- `searchVideos(query, options)` - Tìm kiếm video  
- `getCuratedPhotos(page, per_page)` - Ảnh được tuyển chọn
- `getPopularVideos(page, per_page)` - Video phổ biến
- `getConstructionPhotos(category)` - Ảnh xây dựng theo danh mục
- `getConstructionVideos(category)` - Video xây dựng theo danh mục
- `pexelsVideoToAppVideo()` - Chuyển đổi format video
- `pexelsPhotoToAppPhoto()` - Chuyển đổi format ảnh
- `checkPexelsStatus()` - Kiểm tra trạng thái API

### 2. Pexels Gallery Screen
**File:** `features/gallery/PexelsGalleryScreen.tsx`  
**Route:** `/pexels-gallery`  
**Chức năng:**
- Tab chuyển đổi Ảnh/Video
- Lọc theo danh mục (Xây dựng, Biệt thự, Resort, Nội thất, Cảnh quan, Vật liệu, Kỹ thuật)
- Grid hiển thị ảnh 2 cột
- List hiển thị video với thumbnail
- Modal xem chi tiết + video player
- Pull-to-refresh
- Infinite scroll (load more)
- Link tải về Pexels

### 3. Route File
**File:** `app/pexels-gallery.tsx`

### 4. Config Updates
**File:** `.env`
```
PEXELS_API_KEY=jrbziKeYNCKFNatKRlsn6iIzjE5RZljR2ncLn1ai6D80VQu7ND8BYN2c
EXPO_PUBLIC_PEXELS_API_KEY=jrbziKeYNCKFNatKRlsn6iIzjE5RZljR2ncLn1ai6D80VQu7ND8BYN2c
```

**File:** `config/env.ts`
- Added `PEXELS_API_KEY` to `EnvConfig` interface
- Added value mapping in `ENV` object

### 5. Menu Integration
**File:** `app/(tabs)/menu.tsx`
- Added "Media & Nội dung" category với Pexels Gallery và Video Demo

### 6. Home Screen Integration
**File:** `app/(tabs)/index.tsx`
- Added "PEXELS MEDIA" section với shortcuts
- Styled cards for Pexels Gallery và Video Demo
- FREE badge + HOT/NEW indicators

---

## 🎨 Construction Keywords

Service tự động tìm kiếm nội dung liên quan đến xây dựng với các từ khóa:

| Category | Keywords |
|----------|----------|
| general | construction, building, architecture |
| villa | villa, luxury house, mansion |
| resort | resort, hotel, hospitality |
| interior | interior design, home decor, furniture |
| landscape | landscape, garden, outdoor |
| material | construction material, brick, concrete |
| technique | construction technique, building process |

---

## 🧪 API Test Results

```
Photos API:
- Status: 200 OK
- Total Results: 8000+
- Sample: Photo #35347731 by Raymond Petrik

Videos API:
- Status: 200 OK  
- Total Results: 8000+
- Sample: Video #1197802, Duration 61s, by Anamul Rezwan
```

---

## 📱 Usage in App

### Import Service
```typescript
import pexelsService, {
  type PexelsPhoto,
  type PexelsVideo,
  CONSTRUCTION_KEYWORDS,
} from '@/services/pexelsService';
```

### Lấy ảnh xây dựng
```typescript
const photos = await pexelsService.getConstructionPhotos('villa', 1, 20);
// Returns: { total_results, page, per_page, photos[] }
```

### Lấy video xây dựng
```typescript
const videos = await pexelsService.getConstructionVideos('interior', 1, 15);
// Returns: { total_results, page, per_page, videos[] }
```

### Kiểm tra trạng thái API
```typescript
const status = await pexelsService.checkPexelsStatus();
// Returns: { status: 'working' | 'error', message, latency }
```

---

## 🔗 Navigation

| Route | Description |
|-------|-------------|
| `/pexels-gallery` | Pexels Gallery với Photos & Videos |
| `/demo-videos` | Video demo xây dựng |
| `/(tabs)/menu` → Media & Nội dung | Menu shortcuts |

---

## ⚠️ Important Notes

1. **Attribution:** Pexels không yêu cầu attribution nhưng khuyến khích ghi credit cho photographer
2. **Rate Limits:** Pexels API có rate limit, service đã handle với timeout
3. **Video Quality:** Service cung cấp helper để chọn SD/HD video phù hợp
4. **Caching:** Recommend implement caching để giảm API calls

---

## ✅ Checklist

- [x] Pexels API key configured in .env
- [x] Service với đầy đủ CRUD operations
- [x] Gallery screen với tabs & filters
- [x] Modal xem chi tiết
- [x] Video player integration
- [x] Menu integration
- [x] Home screen shortcuts
- [x] Error handling
- [x] Loading states
- [x] Pull-to-refresh
- [x] Infinite scroll

---

*Pexels - Beautiful free photos & videos*
