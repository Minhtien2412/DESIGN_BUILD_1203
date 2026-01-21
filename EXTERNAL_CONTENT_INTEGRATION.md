# External Content Integration Report

> **Ngày cập nhật:** 16/01/2026  
> **Mục đích:** Tích hợp API Pexels & GNews để hiển thị nội dung bổ sung khi không có dữ liệu từ Database

---

## 📋 Tổng quan

Khi app không có đủ dữ liệu từ database (video, tin tức, ảnh), hệ thống sẽ tự động fetch nội dung bổ sung từ các API miễn phí:

- **Pexels API**: Video và ảnh stock chất lượng cao
- **GNews API**: Tin tức xây dựng, bất động sản

### Nguyên tắc hiển thị:
1. ✅ **Dữ liệu thật từ DB luôn hiển thị trước**
2. ✅ **External content nằm dưới dưới dạng "Nội dung tham khảo"**
3. ✅ **Badge rõ ràng: "Từ Pexels" / "Từ GNews"**
4. ✅ **Cache 5 phút để tránh gọi API nhiều lần**

---

## 🗂️ Files đã tạo

### 1. Service Layer
**[services/externalContentService.ts](services/externalContentService.ts)**
```typescript
// Unified service cho external content
- getConstructionVideos(page, perPage, category)
- getConstructionNews(category, topic, max)
- getConstructionPhotos(page, perPage, category)
- getCombinedFeed(page, perPage)
```

**Features:**
- 5-minute caching để tránh rate limit
- Type transformations (ExternalVideo, ExternalArticle, ExternalPhoto)
- Category-based queries (villa, interior, timelapse, etc.)

### 2. React Hooks
**[hooks/useExternalContent.ts](hooks/useExternalContent.ts)**
```typescript
- useExternalVideos({ category, perPage, enabled })
- useExternalNews({ category, max, enabled })
- useExternalPhotos({ category, perPage, enabled })
- useCombinedFeed({ perPage, enabled })
- useExternalContentStatus()
```

**Features:**
- Pagination support (loadMore, hasMore)
- Refetch capability
- Loading & error states
- Conditional fetching với `enabled` flag

### 3. UI Components
**[components/ExternalContentSection.tsx](components/ExternalContentSection.tsx)**
```typescript
// Card components
- ExternalVideoCard
- ExternalArticleCard
- ExternalPhotoCard

// Section components
- ExternalVideoSection
- ExternalNewsSection
- ExternalPhotoSection
- EmptyWithExternal (fallback component)
```

**Features:**
- External badge ("Từ Pexels", "Từ GNews")
- Play icon overlay cho video
- Source branding
- Responsive sizing

---

## 📱 Screens đã tích hợp

### 1. Home Screen - [app/(tabs)/index.tsx](app/(tabs)/index.tsx)
```typescript
// Imports
import { useExternalNews, useExternalVideos } from '@/hooks/useExternalContent';
import { ExternalNewsSection, ExternalVideoSection } from '@/components/ExternalContentSection';

// Hooks
const { videos: externalVideos, isLoading: videosLoading, refetch: refetchVideos } = useExternalVideos({ 
  category: 'general', perPage: 8, enabled: true 
});
const { articles: externalNews, isLoading: newsLoading, refetch: refetchNews } = useExternalNews({ 
  category: 'general', max: 6, enabled: true 
});

// Render (cuối ScrollView, trước Bottom Padding)
{externalVideos.length > 0 && <ExternalVideoSection ... />}
{externalNews.length > 0 && <ExternalNewsSection ... />}
```

### 2. Social Feed - [app/(tabs)/social.tsx](app/(tabs)/social.tsx)
```typescript
// Imports
import { ExternalVideoSection } from '@/components/ExternalContentSection';
import { useExternalVideos } from '@/hooks/useExternalContent';

// Hook
const { videos: externalVideos, isLoading: videosLoading, refetch: refetchVideos } = useExternalVideos({ 
  category: 'general', perPage: 8, enabled: REELS.length < 5 
});

// Render (sau Reels preview section)
{externalVideos.length > 0 && <ExternalVideoSection title="🎬 Video xây dựng tham khảo" ... />}
```

### 3. Video Discovery - [app/social/video-discovery.tsx](app/social/video-discovery.tsx)
```typescript
// Imports
import { useExternalPhotos, useExternalVideos } from '@/hooks/useExternalContent';
import { ExternalPhotoSection, ExternalVideoSection } from '@/components/ExternalContentSection';

// Hooks với category-based filtering
const { videos: externalVideos, ... } = useExternalVideos({ 
  category: selectedCategory === 'noithat' ? 'interior' : selectedCategory === 'kientruc' ? 'villa' : 'general',
  perPage: 12, enabled: true
});
const { photos: externalPhotos, ... } = useExternalPhotos({ 
  category: 'general', perPage: 10, enabled: true 
});

// Render (sau Free Resources Banner)
{externalVideos.length > 0 && <ExternalVideoSection title="🎬 Video tư liệu xây dựng" ... />}
{externalPhotos.length > 0 && <ExternalPhotoSection title="📷 Ảnh tư liệu kiến trúc" ... />}
```

### 4. News Feed - [components/news/NewsFeed.tsx](components/news/NewsFeed.tsx)
```typescript
// Hooks
const { articles: externalNews, isLoading: externalLoading, refetch: refetchNews } = useExternalNews({ 
  category: 'general', max: 8, enabled: true 
});

// Render trong FlatList
ListEmptyComponent: externalNews.length > 0 && <ExternalNewsSection ... />
ListFooterComponent: articles.length > 0 && articles.length < 5 && <ExternalNewsSection ... />
```

---

## 🔧 API Keys được sử dụng

| API | Key (env) | Status |
|-----|-----------|--------|
| **Pexels** | `EXPO_PUBLIC_PEXELS_API_KEY` | ✅ Working |
| **GNews** | `EXPO_PUBLIC_GNEWS_API_KEY` | ✅ Working |

---

## 🎯 Cách hoạt động

### Flow khi màn hình load:

```
1. Component mount
   ↓
2. useExternalVideos/News hooks gọi service
   ↓
3. Service kiểm tra cache (5 phút)
   ↓
4a. Cache hit → Return cached data
4b. Cache miss → Gọi Pexels/GNews API
   ↓
5. Transform response → ExternalVideo/Article types
   ↓
6. Component render với external content
```

### Điều kiện hiển thị:

```typescript
// Video: Luôn hiển thị nếu có
{externalVideos.length > 0 && <ExternalVideoSection ... />}

// News: Hiển thị khi DB articles < 5
{articles.length < 5 && externalNews.length > 0 && <ExternalNewsSection ... />}

// Conditional fetch: Chỉ fetch khi cần
enabled: REELS.length < 5 // Không fetch nếu đã có đủ data
```

---

## 📝 Categories mapping

### Video (Pexels):
| App Category | Pexels Query |
|--------------|--------------|
| `general` | "construction site" |
| `villa` | "villa architecture" |
| `interior` | "interior design" |
| `timelapse` | "construction timelapse" |

### News (GNews):
| App Category | GNews Query |
|--------------|-------------|
| `general` | "construction building" |
| `realEstate` | "real estate property" |
| `architecture` | "architecture design" |
| `interior` | "interior design home" |

---

## 🚀 Hướng dẫn sử dụng

### Thêm external content vào màn hình mới:

```typescript
// 1. Import hooks và components
import { useExternalVideos, useExternalNews } from '@/hooks/useExternalContent';
import { ExternalVideoSection, ExternalNewsSection } from '@/components/ExternalContentSection';

// 2. Sử dụng hooks
const { videos, isLoading, refetch } = useExternalVideos({ 
  category: 'general', 
  perPage: 10, 
  enabled: true 
});

// 3. Refresh khi pull-to-refresh
const onRefresh = useCallback(() => {
  refetch();
  // ... other refresh logic
}, [refetch]);

// 4. Render section
{videos.length > 0 && (
  <ExternalVideoSection 
    videos={videos}
    title="🎬 Video tham khảo"
    subtitle="Video từ Pexels"
    isLoading={isLoading}
    onSeeAll={() => router.push('/videos')}
  />
)}
```

---

## ✅ Checklist đã hoàn thành

- [x] Tạo externalContentService.ts với caching
- [x] Tạo useExternalContent.ts hooks
- [x] Tạo ExternalContentSection.tsx components
- [x] Tích hợp vào Home screen (index.tsx)
- [x] Tích hợp vào Social screen (social.tsx)
- [x] Tích hợp vào Video Discovery (video-discovery.tsx)
- [x] Tích hợp vào News Feed (NewsFeed.tsx)
- [x] Fix tất cả TypeScript errors

---

## 📌 Ghi chú

1. **Rate Limits:**
   - Pexels: 200 requests/hour
   - GNews: 100 requests/day (free tier)
   
2. **Caching:** 5 phút để tránh vượt rate limit

3. **Error Handling:** Nếu API fail, component sẽ không hiển thị external content (graceful degradation)

4. **External Badge:** Tất cả external content đều có badge rõ ràng để user biết nguồn
