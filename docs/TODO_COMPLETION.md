# 📋 TODO - App Completion Checklist

## Cập nhật: 2026-01-26

---

## 🎯 Tổng quan tiến độ

| Hạng mục       | Hoàn thành | Trạng thái             |
| -------------- | ---------- | ---------------------- |
| Authentication | 95%        | ✅ Gần hoàn thiện      |
| Chat/Messaging | 80%        | 🔄 Đang xử lý          |
| Video/Audio    | 95%        | ✅ Gần hoàn thiện      |
| Notifications  | 75%        | 🔄 Đang xử lý          |
| Projects       | 85%        | ✅ Tốt                 |
| E-commerce     | 70%        | 🔄 Đang phát triển     |
| Backend API    | 90%        | ✅ Gần hoàn thiện      |
| UI/UX          | 85%        | ✅ Tốt                 |

---

## 🔴 CRITICAL - Phải sửa ngay

### 1. Fix lỗi "Text node in View"

**Trạng thái:** ⚠️ Cần sửa
**Mức độ:** Critical - Gây crash app

**Files cần kiểm tra:**

- [ ] `app/(tabs)/index.tsx` - Trang chủ
- [ ] `components/social/PostCardInteractive.tsx`
- [ ] `components/community/FacebookFeedCard.tsx`
- [ ] `components/ui/full-media-viewer.tsx`

**Cách sửa:**

```tsx
// ❌ Sai
{
  condition && "text";
}

// ✅ Đúng
{
  condition ? <Text>text</Text> : null;
}
```

### 2. Fix lỗi pointerEvents deprecated

**Trạng thái:** ⚠️ Cần sửa
**Mức độ:** Warning

**Cách sửa:**

```tsx
// ❌ Sai
<View pointerEvents="none">

// ✅ Đúng
<View style={{ pointerEvents: 'none' }}>
```

### 3. Migrate expo-av sang expo-audio/expo-video

**Trạng thái:** ✅ 95% hoàn thành
**Mức độ:** High - expo-av sẽ bị remove ở SDK 54

**Wrappers đã tạo:**

- ✅ `utils/videoWrapper.ts` - Video controller, preloader
- ✅ `utils/audioWrapper.ts` - Audio controller
- ✅ `lib/communication/AudioWrapper.tsx`
- ✅ `lib/communication/VideoWrapper.tsx`

**Files đã migrate (import wrapper):**

- ✅ `components/community/FeedVideoPlayer.tsx`
- ✅ `components/messages/VoicePlayer.tsx`
- ✅ `components/messages/VoiceRecorder.tsx`
- ✅ `components/live/LivePlayer.tsx`
- ✅ `components/products/VideoPlayer.tsx`
- ✅ `components/viewer/VideoViewerScreen.tsx`
- ✅ `components/ui/full-media-viewer.tsx`
- ✅ `components/community/AdvancedVideoPlayer.tsx`
- ✅ `features/gallery/PexelsGalleryScreen.tsx`
- ✅ `features/call/PremiumCallScreen.tsx`
- ✅ `features/chat/GroupChatScreen.tsx`
- ✅ `app/social/reels-viewer.tsx`
- ✅ `app/(tabs)/live.tsx`

**Files còn sử dụng expo-av trực tiếp (wrappers/services):**

- ⚠️ `utils/videoWrapper.ts` - Wrapper chính (expected)
- ⚠️ `utils/audioWrapper.ts` - Wrapper chính (expected)
- ⚠️ `services/ringtoneService.ts` - Sẽ migrate sau
- ⚠️ `services/voiceAIService.ts` - Sẽ migrate sau
- ⚠️ `services/CameraService.ts` - Sẽ migrate sau

**Cách migrate:**

```tsx
// Thay thế:
import { Video, Audio } from 'expo-av';

// Bằng:
import { VideoController } from '@/utils/videoWrapper';
import { AudioController } from '@/utils/audioWrapper';
```

---

## 🟡 HIGH PRIORITY - Cần hoàn thiện sớm

### 4. Chat System Consolidation

**Trạng thái:** ✅ 95% hoàn thành

**Tasks:**

- [x] Tạo `chatAPIService.ts` - REST API calls
- [x] Tạo `socketManager.ts` - WebSocket connection
- [x] Tạo `useMessages.ts` hook
- [x] Consolidate chat routes - Tất cả routes trùng đã thành redirects
- [x] Đặt `/messages/[userId]` làm route chính
- [x] Deprecate `/chat/[chatId]` route → redirect

**Routes đã cleanup:**

```
app/messages/index.tsx          ✅ Main - Danh sách tin nhắn
app/messages/[userId].tsx       ✅ Main - Chat với user
app/messages/unified.tsx        ✅ Redirect → /messages
app/messages/realtime-chat.tsx  ✅ Redirect → /messages
app/messages/chat/[id].tsx      ✅ Redirect → /messages/[id]
app/messages/chat/enhanced.tsx  ✅ Redirect
app/chat/[chatId].tsx           ✅ Redirect → /messages/[chatId]
```

### 5. Notification System

**Trạng thái:** 🔄 75% hoàn thành

**Backend:**

- [x] `notifications.service.ts`
- [x] `notifications.gateway.ts` (WebSocket)
- [x] `notifications.controller.ts`
- [ ] Push notification với FCM production

**Frontend:**

- [x] `notificationService.ts`
- [x] `UnifiedBadgeContext.tsx`
- [ ] Test real-time notification
- [ ] Badge sync với backend

### 6. WebSocket Connection

**Trạng thái:** ✅ 90% hoàn thành

**Đã có:**

- [x] `socketManager.ts` - Auto-reconnect, exponential backoff
- [x] `chat.gateway.ts` - Backend WebSocket gateway
- [x] `notifications.gateway.ts`
- [x] Room management
- [x] `utils/websocketTest.ts` - Connection diagnostics utility

**Test WebSocket:**

```typescript
import { runDiagnostics } from '@/utils/websocketTest';

// Run full diagnostics
const result = await runDiagnostics(authToken);
console.log(result);
```

**Cần kiểm tra:**

- [ ] Test connection stability với backend production
- [ ] Monitor reconnection behavior
- [ ] Add connection status UI indicator

---

## 🟢 MEDIUM PRIORITY - Cải thiện

### 7. Authentication Enhancements

**Trạng thái:** ✅ 95% hoàn thành

**Đã có:**

- [x] Email/Password login
- [x] Phone + OTP login
- [x] Google OAuth
- [x] Zalo OAuth
- [x] 2FA (TOTP)
- [x] Biometric authentication
- [x] JWT + Refresh token
- [x] Device session management

**Còn thiếu:**

- [ ] Facebook OAuth (disabled)
- [ ] Apple Sign-In (iOS only)

### 8. Backend API Completion

**Trạng thái:** ✅ 90% hoàn thành

**Modules hoàn thiện:**

- [x] auth/ - Full authentication
- [x] users/ - User management
- [x] chat/ - Chat rooms, messages
- [x] call/ - LiveKit integration
- [x] notifications/ - Push + WebSocket
- [x] projects/ - Project management
- [x] products/ - E-commerce
- [x] upload/ - File upload, presigned URLs
- [x] prisma/ - Database ORM

**Modules cần hoàn thiện:**

- [ ] analytics/ - Thêm tracking events
- [ ] payment/ - Test VNPay, Momo production

### 9. i18n (Đa ngôn ngữ)

**Trạng thái:** 🔄 70% hoàn thành

**Đã có:**

- [x] `i18nService.ts`
- [x] `I18nContext`
- [x] Vietnamese translations
- [x] English translations
- [x] Language selector screen

**Còn thiếu:**

- [ ] Dịch đầy đủ tất cả screens
- [ ] Dynamic language switching
- [ ] RTL support (if needed)

### 10. Profile & Settings

**Trạng thái:** ✅ 90% hoàn thành

**Đã có:**

- [x] Profile screen với European style
- [x] Security settings (2FA, password)
- [x] Language settings
- [x] Notification settings
- [x] Sound settings (ringtones)

**Còn thiếu:**

- [ ] Privacy settings
- [ ] Linked accounts management

---

## 🔵 LOW PRIORITY - Nice to have

### 11. Onboarding Flow

**Trạng thái:** ✅ Đã tạo

- [x] `app/intro/index.tsx`
- [ ] Thêm animation
- [ ] Skip functionality
- [ ] First-time user detection

### 12. Performance Optimization

**Tasks:**

- [ ] Lazy loading cho heavy components
- [ ] Image caching optimization
- [ ] Bundle size analysis
- [ ] Memory leak detection

### 13. Testing

**Tasks:**

- [ ] Unit tests cho services
- [ ] Integration tests cho API
- [ ] E2E tests cho critical flows

### 14. Documentation

**Tasks:**

- [x] Architecture diagram
- [x] API endpoints documentation
- [ ] Component documentation
- [ ] Deployment guide hoàn chỉnh

---

## 📁 Files cần xóa/cleanup

```
Duplicate/Deprecated files:
- app/messages/unified.tsx          → Merge vào index
- app/messages/realtime-chat.tsx    → Merge vào [id]
- app/chat/[chatId].tsx             → Deprecate
- app/messages/chat/[id].tsx        → Check duplicate
- app/messages/chat/enhanced.tsx    → Check duplicate
- app/messages/chat/[conversationId].tsx → Check duplicate

Services cleanup:
- services/legacy/*                 → Remove
- services/mysqlAuth*.ts            → Remove if not used
- services/perfex*.ts               → Consolidate
```

---

## 🔍 Kết quả kiểm tra (2026-01-26)

### ✅ Đã xác nhận hoạt động:

1. **SocketManager** - Đã có auto-reconnect, heartbeat, room management
2. **pointerEvents** - Không tìm thấy pattern deprecated trong components
3. **index.tsx** - File trang chủ không có lỗi text node
4. **Chat system** - Routes đã được consolidate

### ⚠️ Cần tiếp tục:

1. **Text node in View** - Lỗi có thể từ packages bên ngoài hoặc dynamic content
2. **expo-av migration** - Cần migrate các components
3. **WebSocket connection** - Cần test với backend thực

---

## 🗓️ Timeline đề xuất

### Tuần 1 (Ngay lập tức):

- [x] Kiểm tra index.tsx - OK
- [x] Kiểm tra pointerEvents - OK  
- [x] Kiểm tra SocketManager - OK
- [x] Tạo WebSocket test utility - `utils/websocketTest.ts`
- [x] Tạo Notification test utility - `utils/notificationTest.ts`
- [x] Tạo deploy scripts - `scripts/deploy-backend.ps1`
- [x] Tạo cleanup scripts - `scripts/cleanup-chat-routes.ps1`
- [ ] Test WebSocket connection với backend production
- [ ] Deploy backend lên server production

### Tuần 2:

- [x] Consolidate chat routes - Tất cả đã chuyển thành redirects
- [x] Tạo video/audio wrappers - `utils/videoWrapper.ts`, `utils/audioWrapper.ts`
- [x] VoiceMessagePlayer updated - Sử dụng AudioPlayer wrapper
- [x] VoiceRecorder updated - Sử dụng AudioRecorder wrapper
- [x] LivePlayer updated - Sử dụng VideoController wrapper
- [x] products/VideoPlayer updated - Sử dụng VideoController wrapper
- [x] Migrate expo-av components còn lại:
  - [x] components/viewer/VideoViewerScreen.tsx
  - [x] components/ui/full-media-viewer.tsx
  - [x] components/community/AdvancedVideoPlayer.tsx
  - [x] features/gallery/PexelsGalleryScreen.tsx
  - [x] features/call/PremiumCallScreen.tsx
  - [x] features/chat/GroupChatScreen.tsx
  - [x] app/social/reels-viewer.tsx
  - [x] app/(tabs)/live.tsx
- [ ] Test notification system

### Tuần 3:

- [ ] Complete i18n translations
- [ ] Performance optimization
- [ ] Cleanup duplicate files

### Tuần 4:

- [ ] Testing
- [ ] Bug fixes
- [ ] Production deployment

---

## 🔧 Scripts hữu ích

```bash
# Tìm files sử dụng expo-av
grep -r "expo-av" --include="*.tsx" --include="*.ts"

# Tìm pointerEvents deprecated
grep -r 'pointerEvents=' --include="*.tsx"

# Tìm conditional rendering có thể gây lỗi
grep -r '&& "' --include="*.tsx"
grep -r "&& '" --include="*.tsx"

# Check bundle size
npx expo-optimize

# Clear cache và restart
npx expo start --clear
```

---

## ✅ Checklist trước khi deploy

- [ ] Tất cả lỗi critical đã fix
- [ ] expo-av đã migrate
- [ ] WebSocket hoạt động stable
- [ ] Push notification hoạt động
- [ ] Authentication flow hoàn chỉnh
- [ ] i18n hoàn chỉnh
- [ ] Performance OK
- [ ] No memory leaks
- [ ] All APIs tested
- [ ] Error handling đầy đủ
