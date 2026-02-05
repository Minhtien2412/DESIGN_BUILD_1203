# 🎯 Messages & Calls Live API Integration - COMPLETE GUIDE

## ✅ TẤT CẢ ĐÃ HOÀN THÀNH!

### Summary
Đã hoàn thành việc fix tất cả lỗi về Messages và Calls, chuyển từ mock data sang live API thực.

---

## 📁 Files Được Tạo/Sửa

| File | Status | Description |
|------|--------|-------------|
| `features/notifications/UnifiedNotificationsScreen.tsx` | ✅ Modified | Badge reset on item press (Zalo-style) |
| `services/unifiedChatService.ts` | ✅ Created | Chat API adapter |
| `services/unifiedCallService.ts` | ✅ Created | Call API adapter |
| `hooks/crm/useUnifiedMessaging.refactored.ts` | ✅ Created | Refactored với real API + WebSocket |
| `hooks/useCall.refactored.ts` | ✅ Created | Refactored với real API + badge sync |

---

## 🔄 CÁCH ACTIVATE (Bước cuối cùng)

### Option 1: Replace file gốc (Recommended)

Chạy trong terminal:

```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"

# Backup files gốc
Copy-Item "hooks\crm\useUnifiedMessaging.ts" "hooks\crm\useUnifiedMessaging.backup.ts" -Force
Copy-Item "hooks\useCall.ts" "hooks\useCall.backup.ts" -Force

# Replace với refactored files
Copy-Item "hooks\crm\useUnifiedMessaging.refactored.ts" "hooks\crm\useUnifiedMessaging.ts" -Force
Copy-Item "hooks\useCall.refactored.ts" "hooks\useCall.ts" -Force

Write-Host "✅ Đã activate refactored files!"
```

### Option 2: Cập nhật imports

Trong các file sử dụng hook, đổi import:

```typescript
// Messages - Thay vì:
import { useUnifiedMessaging } from '@/hooks/crm/useUnifiedMessaging';
// Đổi thành:
import { useUnifiedMessaging } from '@/hooks/crm/useUnifiedMessaging.refactored';

// Calls - Thay vì:
import useCall from '@/hooks/useCall';
// Đổi thành:
import useCall from '@/hooks/useCall.refactored';
```

---

## 📋 Testing Checklist

### ✅ Test Notification Badge
- [ ] Mở app → vào Notifications tab
- [ ] Ấn vào 1 item thông báo → badge giảm 1
- [ ] Ấn "Mark all read" → badge = 0
- [ ] Restart app → badge được restore từ AsyncStorage

### ✅ Test Messages  
- [ ] Mở Messages tab → conversations load từ API
- [ ] Check Network tab → API call tới `/api/v1/chat/conversations`
- [ ] Mở 1 conversation → messages load từ API
- [ ] Gửi tin nhắn → optimistic update + API call
- [ ] Check console logs → WebSocket connected
- [ ] Test nhận tin nhắn realtime (nếu có người gửi)

### ✅ Test Calls
- [ ] Xem Call History tab → load từ API
- [ ] Missed calls badge sync với tab
- [ ] Test start call (nếu có người nhận)
- [ ] Test end call → history refresh

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      UI Components                           │
│  MessagesScreen │ CallsScreen │ NotificationsScreen          │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                        Hooks                                 │
│  useUnifiedMessaging.ts │ useCall.ts                         │
│  (state, optimistic UI) │ (call state, timer)                │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                  Unified Services (NEW)                      │
│  unifiedChatService.ts  │  unifiedCallService.ts             │
│  (API → Unified format) │  (API → Unified format)            │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                  Core API Services                           │
│  chatApi.ts │ chatRealtime.ts │ call.service.ts              │
│  (HTTP)     │ (WebSocket)     │ (HTTP + LiveKit)             │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                     Backend API                              │
│            https://baotienweb.cloud/api/v1                   │
│            wss://baotienweb.cloud (WebSocket)                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Badge Context Integration

Tất cả badge được sync qua `UnifiedBadgeContext`:

```typescript
const { 
  syncWithMessages,     // Chat unread count
  syncWithCalls,        // Missed calls count  
  syncWithNotifications // Notification unread count
} = useUnifiedBadge();
```

**Features:**
- ✅ Persist với AsyncStorage
- ✅ Auto-restore khi app restart
- ✅ Real-time sync giữa các screens
- ✅ Giống Zalo: ấn vào item → badge giảm ngay

---

## 📡 API Endpoints Reference

### Chat API (`/api/v1/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List conversations |
| GET | `/conversations/:id/messages` | Get messages |
| POST | `/conversations/:id/messages` | Send message |
| PUT | `/conversations/:id/read` | Mark as read |
| POST | `/conversations` | Create conversation |

### Call API (`/api/v1/call`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/start` | Start call |
| POST | `/accept` | Accept call |
| POST | `/reject` | Reject call |
| POST | `/end` | End call |
| GET | `/history` | Call history |
| GET | `/missed-count` | Missed calls count |

### WebSocket Events
- `wss://baotienweb.cloud/chat` - Chat namespace
- Events: `message`, `typing`, `read_receipt`, `online_status`

---

## 🔧 Key Features Implemented

### Messages (useUnifiedMessaging.refactored.ts)
- ✅ Real API calls via UnifiedChatService
- ✅ WebSocket realtime messages
- ✅ Optimistic UI updates
- ✅ Badge sync với UnifiedBadgeContext
- ✅ Cache fallback cho offline mode
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online status

### Calls (useCall.refactored.ts)
- ✅ Real API calls via UnifiedCallService
- ✅ Call history pagination
- ✅ Missed calls badge sync
- ✅ Duration timer
- ✅ Mute/Video toggle
- ✅ Helper functions (formatDuration, getCallStatusText, etc.)
- ✅ Cache cho offline mode

---

## 📝 Notes

- Mock data đã được loại bỏ hoàn toàn trong refactored files
- WebSocket auto-reconnect handled trong `chatRealtime.ts`
- All API calls go through `apiFetch` for timeout & error handling
- Optimistic updates for better UX
- Files gốc được giữ lại với đuôi `.backup.ts` để rollback nếu cần

---

## 🚀 Quick Start

1. **Activate refactored files** (xem phần CÁCH ACTIVATE ở trên)
2. **Start app**: `npm start`
3. **Test**: Chạy qua testing checklist
4. **Check logs**: Xem console để verify API calls

---

*Last updated: 12/01/2026*
