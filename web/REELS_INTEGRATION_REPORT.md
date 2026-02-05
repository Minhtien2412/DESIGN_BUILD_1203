# Reels Viewer - Multi-Source Video Integration Report

## 📅 Cập nhật: 13/01/2026

## 🎯 Mục tiêu
Cập nhật Reels Viewer để sử dụng video từ nhiều nguồn với thứ tự ưu tiên:
1. **Video người dùng đăng tải** (User uploads) - Ưu tiên cao nhất
2. **Pexels API** - Fallback khi không có user videos
3. **Mock data** - Fallback cuối cùng khi cả 2 nguồn trên fail

## 📁 Files Created/Modified

### 1. `services/reelsService.ts` (NEW)
Service mới quản lý video reels từ nhiều nguồn:

```typescript
// Types
interface Reel {
  id: string;
  user: ReelUser;
  videoUrl: string;
  thumbnail: string;
  description: string;
  source: 'user' | 'pexels' | 'mock';
  // ... other fields
}

// Main functions
getReels(category, page, limit)        // Combined từ tất cả nguồn
getUserReels(page, limit)               // Từ User API
getPexelsReels(category, page, limit)   // Từ Pexels API

// Interactions
toggleReelLike(reelId)
toggleReelSave(reelId)
incrementReelView(reelId)
```

### 2. `app/social/reels-viewer.tsx` (MODIFIED)
Cập nhật component chính:

**Thay đổi chính:**
- Import `reelsService` thay vì static data
- Thêm loading states (isLoading, isRefreshing, isLoadingMore)
- Thêm pagination (currentPage, hasMore)
- Hiển thị nguồn video (dataSource indicator)
- Pull-to-refresh để tải lại
- Infinite scroll để load thêm
- Source badge trên mỗi reel (User/Pexels)

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    loadReels() Called                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              1. Try User API First                           │
│              GET /api/reels?page=X&limit=Y                   │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
         Has Results?                No Results
              │                           │
              ▼                           ▼
┌─────────────────────┐    ┌──────────────────────────────────┐
│ Return User Reels   │    │  2. Try Pexels API               │
│ source: 'user'      │    │  GET /videos/search?query=...    │
└─────────────────────┘    └──────────────────────────────────┘
                                          │
                            ┌─────────────┴─────────────┐
                            │                           │
                       Has Results?                No Results
                            │                           │
                            ▼                           ▼
              ┌─────────────────────┐    ┌─────────────────────┐
              │ Return Pexels Reels │    │ 3. Use Fallback     │
              │ source: 'pexels'    │    │ Mock Data           │
              │ or 'mixed'          │    │ source: 'mock'      │
              └─────────────────────┘    └─────────────────────┘
```

## 🎨 UI Changes

### Loading State
```
┌─────────────────────────────┐
│                             │
│      🔄 Loading...          │
│   Đang tải video...         │
│                             │
│   Ưu tiên: Video người      │
│   dùng → Pexels → Mẫu       │
│                             │
└─────────────────────────────┘
```

### Source Indicator
```
┌─────────────────────────────┐
│  ← Reels [User] →           │  ← Badge hiển thị nguồn
│                             │
│  👤 Video từ người dùng     │  ← Data source indicator
│  🎬 Video từ Pexels         │
│  🔄 Kết hợp nhiều nguồn     │
│                             │
└─────────────────────────────┘
```

### Each Reel Item
```
┌─────────────────────────────┐
│        [User] or [Pexels]   │  ← Source badge on header
│                             │
│     ┌───────────────────┐   │
│     │                   │   │
│     │   VIDEO/IMAGE     │   │
│     │                   │   │
│     │                   │   │
│     └───────────────────┘   │
│                             │
│  @username [Theo dõi]       │
│  Description...             │
│  ♪ Music                    │
└─────────────────────────────┘
```

## 🔧 API Endpoints (Backend Required)

Để fully utilize User videos, backend cần implement:

```
GET  /api/reels                    # List all user reels
GET  /api/reels?category=X         # Filter by category
GET  /api/users/:id/reels          # User's reels
POST /api/reels/:id/like           # Like/unlike
POST /api/reels/:id/save           # Save/unsave
POST /api/reels/:id/view           # Track view
```

## 📊 Categories Mapping

| Category ID | Vietnamese | Pexels Query |
|------------|------------|--------------|
| all | Tất cả | construction building architecture |
| kientruc | Kiến trúc | architecture modern building design |
| noithat | Nội thất | interior design modern living room |
| thicong | Thi công | construction work building site |
| vatlieu | Vật liệu | construction materials concrete |
| phongthuy | Phong thủy | feng shui zen garden meditation |
| diennuoc | Điện nước | plumbing electrical work |
| sanvuon | Sân vườn | garden landscape outdoor |

## ✅ Features Implemented

- [x] Multi-source video loading (User → Pexels → Mock)
- [x] Pull-to-refresh
- [x] Infinite scroll pagination
- [x] Source indicator (badge + header)
- [x] Category filtering
- [x] Like/Save with API call (user reels only)
- [x] View tracking (user reels only)
- [x] Error handling with fallback
- [x] Loading states

## 🧪 Testing

```bash
# Start the app
npm start

# Navigate to Reels
# Tab Projects → Reels option
# or direct: /social/reels-viewer

# Test scenarios:
1. First load → Should try User API, then Pexels
2. Pull down → Should refresh from all sources
3. Scroll to bottom → Should load more
4. Change category → Should filter and reload
```

## 📝 Notes

1. **Pexels API Key**: Already configured in `.env`
2. **User API**: Will fail gracefully if backend not available
3. **Fallback**: Always shows mock data if all APIs fail
4. **Real Videos**: Pexels provides actual video files (not just images)

## 🔜 Future Enhancements

- [ ] Video player component with actual playback
- [ ] Upload user videos functionality
- [ ] Comments from API instead of mock
- [ ] Share to social media
- [ ] Cache reels locally
- [ ] Offline mode support
