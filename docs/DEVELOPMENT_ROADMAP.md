# 🚀 DEVELOPMENT ROADMAP - App Modernization Plan

> **Ngày tạo:** 23/12/2025  
> **Phiên bản:** 1.0  
> **Mục tiêu:** Hoàn thiện tất cả tính năng FE trước khi deploy cùng BE

---

## 📊 TỔNG QUAN TÌNH TRẠNG HIỆN TẠI

### ✅ Đã Hoàn Thành
- [x] Hệ thống TikTok-style video (feed, comments, likes, shares)
- [x] Backend NestJS trên server (baotienweb.cloud) đang hoạt động
- [x] Auth system (đăng nhập/đăng ký, Google OAuth)
- [x] Cart & Checkout system
- [x] OpenAI API Key đã cấu hình

### ⚠️ Cần Sửa Lỗi
- [ ] WebSocket connection errors
- [ ] WebRTC không hoạt động trong Expo Go
- [ ] Upload documents/profile issues
- [ ] TypeScript errors (~40+ files)

### 🔧 Cần Phát Triển Mới
- [ ] Social Feed (Facebook-style timeline)
- [ ] AI Integration
- [ ] Backend local hoàn thiện

---

## 🎯 PHASE 1: SỬA LỖI CẤP BÁCH (Priority: HIGH)

### 1.1 WebSocket/Socket.IO Fix
**Vấn đề:** FE đang connect đến `wss://baotienweb.cloud/ws` nhưng BE có namespace `/chat`, `/call`, `/progress`

**Giải pháp:**
```typescript
// config/env.ts - Current (có lỗi)
WS_URL: 'wss://baotienweb.cloud/ws'  // ❌ /ws không tồn tại

// config/env.ts - Fixed
WS_URL: 'wss://baotienweb.cloud'  // ✅ Base URL
WS_CHAT_NS: '/chat'               // ✅ Chat namespace
WS_CALL_NS: '/call'               // ✅ Call namespace
WS_PROGRESS_NS: '/progress'       // ✅ Progress namespace
```

**Tasks:**
- [ ] Cập nhật `config/env.ts` với đúng namespaces
- [ ] Sửa `services/socket.ts` để connect đúng namespace
- [ ] Test connection với BE server

### 1.2 WebRTC Fix
**Vấn đề:** react-native-webrtc không hoạt động trong Expo Go (cần dev build)

**Giải pháp:**
- Option A: Tạo development build (`npx expo run:android`)
- Option B: Graceful fallback với message "Vui lòng cài app từ store để sử dụng video call"

**Tasks:**
- [ ] Cập nhật `utils/webrtc.ts` với better error messages
- [ ] Thêm UI fallback khi WebRTC không khả dụng
- [ ] Tạo dev build script trong package.json

### 1.3 Upload & Profile Fix
**Tasks:**
- [ ] Kiểm tra `services/uploadService.ts`
- [ ] Test upload endpoint với BE
- [ ] Fix profile update API calls

---

## 🎯 PHASE 2: SOCIAL FEED SYSTEM (Priority: HIGH)

### 2.1 Types & Interfaces
**File:** `types/social.ts`
```typescript
interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  images?: string[];
  videos?: string[];
  reactions: Reaction[];
  comments: Comment[];
  shares: number;
  privacy: 'public' | 'friends' | 'private';
  createdAt: string;
  updatedAt: string;
}

interface Reaction {
  userId: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

interface Timeline {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}
```

### 2.2 Services
**File:** `services/socialService.ts`
- [ ] `getTimeline(userId?, cursor?)` - Lấy timeline
- [ ] `createPost(content, media?, privacy)` - Tạo bài viết
- [ ] `updatePost(postId, data)` - Sửa bài viết
- [ ] `deletePost(postId)` - Xóa bài viết
- [ ] `reactToPost(postId, type)` - React bài viết
- [ ] `getComments(postId)` - Lấy comments
- [ ] `sharePost(postId, content?)` - Chia sẻ

### 2.3 Context
**File:** `context/SocialContext.tsx`
- [ ] Feed state management
- [ ] Optimistic updates
- [ ] Real-time sync via WebSocket

### 2.4 Components
**Folder:** `components/social/`
- [ ] `PostCard.tsx` - Card bài viết
- [ ] `PostComposer.tsx` - Tạo bài viết mới
- [ ] `ReactionBar.tsx` - Like, love, etc.
- [ ] `CommentSection.tsx` - Phần bình luận
- [ ] `ShareSheet.tsx` - Chia sẻ bài viết
- [ ] `ImageGallery.tsx` - Gallery ảnh
- [ ] `UserCard.tsx` - Card user mini

### 2.5 Screens
**Folder:** `app/social/`
- [ ] `index.tsx` - Feed chính (Timeline)
- [ ] `post/[id].tsx` - Chi tiết bài viết
- [ ] `profile/[id].tsx` - Trang cá nhân (với timeline user)
- [ ] `compose.tsx` - Tạo bài viết
- [ ] `_layout.tsx` - Stack navigator

---

## 🎯 PHASE 3: AI INTEGRATION (Priority: MEDIUM)

### 3.1 AI Chat Assistant
**Sử dụng:** OpenAI API key đã có trong `.env`
```
OPENAI_API_KEY=sk-proj-KNvtlj9...
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-KNvtlj9...
```

**Files cần tạo/sửa:**
- [ ] `services/openaiService.ts` - API wrapper
- [ ] `context/AIContext.tsx` - AI state
- [ ] `components/ai/ChatBot.tsx` - Chat UI
- [ ] `app/ai/assistant.tsx` - AI Assistant screen

### 3.2 AI Features
- [ ] **AI Search:** Tìm kiếm thông minh trong app
- [ ] **AI Statistics:** Phân tích dữ liệu dự án
- [ ] **AI Suggestions:** Gợi ý thông minh
- [ ] **AI Report:** Tự động tạo báo cáo

### 3.3 Integration Points
- [ ] Home screen: AI quick actions
- [ ] Search: AI-powered search
- [ ] Dashboard: AI insights
- [ ] Projects: AI recommendations

---

## 🎯 PHASE 4: BACKEND LOCAL (Priority: MEDIUM)

### 4.1 Setup Local Development
```bash
cd BE-baotienweb.cloud
npm install
cp .env.example .env.local
# Configure DATABASE_URL for local PostgreSQL
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 4.2 Environment Config
```dotenv
# .env.local (Backend)
DATABASE_URL=postgresql://user:pass@localhost:5432/appdb
JWT_SECRET=local-dev-secret
PORT=4000

# .env (Frontend) - Local mode
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.xxx:4000/api/v1
EXPO_PUBLIC_WS_URL=ws://192.168.1.xxx:4000
```

### 4.3 Backend Modules to Complete
- [ ] `/social` - Posts, Timeline, Reactions
- [ ] `/upload` - File upload improvements  
- [ ] `/profile` - Profile management
- [ ] `/ai` - AI integration endpoints

---

## 🎯 PHASE 5: CÁC TRANG CÒN SƠ SÀI (Priority: LOW-MEDIUM)

### 5.1 Các trang cần hoàn thiện
| Trang | Status | Cần thêm |
|-------|--------|----------|
| `/projects` | 60% | CRUD, filters, search |
| `/dashboard` | 50% | Charts, real data |
| `/profile` | 40% | Edit, avatar upload |
| `/messages` | 30% | Real-time chat |
| `/notifications` | 40% | Push notifications |
| `/reports` | 20% | Generate, export |
| `/settings` | 30% | All settings |
| `/search` | 40% | AI search, filters |

### 5.2 UI/UX Improvements
- [ ] Loading skeletons cho tất cả screens
- [ ] Error boundaries
- [ ] Pull-to-refresh
- [ ] Infinite scroll
- [ ] Empty states
- [ ] Offline support

---

## 📋 CHECKLIST TỔNG HỢP

### Week 1: Bug Fixes
- [ ] Fix WebSocket namespaces
- [ ] Fix WebRTC fallback
- [ ] Fix upload service
- [ ] Fix profile update
- [ ] Fix TypeScript errors

### Week 2: Social Feed
- [ ] Types & Services
- [ ] Context & Components
- [ ] Screens & Navigation
- [ ] Integration test

### Week 3: AI Integration
- [ ] OpenAI service
- [ ] AI Chat component
- [ ] AI Search
- [ ] AI Dashboard widgets

### Week 4: Polish & Deploy
- [ ] Backend local complete
- [ ] All screens functional
- [ ] Performance optimization
- [ ] Final testing
- [ ] Deploy preparation

---

## 🔗 LIÊN KẾT QUAN TRỌNG

- **Backend API:** https://baotienweb.cloud/api/v1
- **WebSocket:** wss://baotienweb.cloud/{namespace}
- **OpenAPI Docs:** https://baotienweb.cloud/api/docs
- **Local BE:** http://localhost:4000

---

## 📝 GHI CHÚ

1. **WebRTC:** Yêu cầu development build, không chạy được trong Expo Go
2. **Socket.IO:** Backend dùng namespaces `/chat`, `/call`, `/progress`
3. **AI:** Đã có API key, sẵn sàng tích hợp
4. **Deploy:** Chờ hoàn thiện FE rồi deploy cùng BE một lần

---

*Cập nhật lần cuối: 23/12/2025*
