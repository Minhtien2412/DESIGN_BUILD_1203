# Hệ thống Thông báo Tin nhắn/Cuộc gọi Thống nhất (Zalo-style)

## 📋 Tổng quan

Hệ thống thông báo thống nhất đã được tích hợp vào app, hoạt động tương tự như Zalo:
- **Tin nhắn mới** → Hiển thị badge số trên icon
- **Đọc tin nhắn** → Badge tự động clear
- **Cuộc gọi nhỡ** → Hiển thị badge, xem lịch sử → clear

---

## 🗂️ Files đã tạo/cập nhật

### Files mới tạo:
1. **`context/UnifiedBadgeContext.tsx`** (~380 lines)
   - Quản lý toàn bộ badge counts
   - Types: `BadgeCounts`, `MessageNotification`, `CallNotification`
   - AsyncStorage persistence
   - Sync methods với messaging hook

2. **`components/ui/unified-badge.tsx`** (~90 lines)
   - Badge component có thể tái sử dụng
   - Support: sizes (small/medium/large), types (default/dot/warning/success)
   - Max count display (99+)

3. **`components/notifications/NotificationToast.tsx`** (~220 lines)
   - Toast popup khi có tin nhắn mới
   - Animation slide-in/out
   - Auto hide sau 4 giây
   - Tap để navigate vào conversation

4. **`scripts/test-unified-badges.ts`**
   - Test script kiểm tra hệ thống

### Files đã cập nhật:

5. **`app/_layout.tsx`**
   - Import `UnifiedBadgeProvider`
   - Import `NotificationToast`
   - Wrap app với provider

6. **`app/messages/unified.tsx`**
   - Import `useUnifiedBadge`
   - Sync badge counts với context khi data thay đổi
   - useEffect để sync `totalUnreadCount` và `missedCallsCount`

7. **`app/messages/chat/[conversationId].tsx`**
   - Import `useUnifiedBadge`
   - Call `markBadgeRead(conversationId)` khi vào chat
   - Clear badge cho conversation cụ thể

8. **`app/call/history.tsx`**
   - Import `useUnifiedBadge`
   - Clear `missedCalls` badge khi vào màn hình lịch sử cuộc gọi

9. **`app/(tabs)/index-v4.tsx`** (Home Screen)
   - Import `useUnifiedBadge`
   - Dynamic badges cho Quick Access buttons
   - Dynamic badges cho Communication section
   - Badge numbers trên header icons (notifications, messages)

---

## 🔧 Cách sử dụng

### 1. Truy cập badge context
```tsx
import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';

function MyComponent() {
  const { 
    badges,              // { messages, missedCalls, notifications, ... }
    totalBadge,          // Tổng tất cả badges
    addMessageNotification,
    markMessageAsRead,
    clearBadge,
    syncWithMessaging,
  } = useUnifiedBadge();
}
```

### 2. Thêm notification mới
```tsx
addMessageNotification({
  id: 'unique-id',
  conversationId: 'conv-123',
  senderId: 1,
  senderName: 'Nguyễn Văn A',
  content: 'Xin chào!',
  type: 'text',
  timestamp: new Date().toISOString(),
  isRead: false,
});
```

### 3. Clear badge khi đọc
```tsx
// Clear tin nhắn của conversation cụ thể
markMessageAsRead('conv-123');

// Clear badge loại cụ thể
clearBadge('missedCalls');

// Clear tất cả
clearAllBadges();
```

### 4. Sync với messaging hook
```tsx
// Trong component sử dụng useUnifiedMessaging
const { totalUnreadCount, missedCallsCount } = useUnifiedMessaging();
const { syncWithMessaging } = useUnifiedBadge();

useEffect(() => {
  syncWithMessaging(totalUnreadCount, missedCallsCount);
}, [totalUnreadCount, missedCallsCount]);
```

---

## 📊 Badge Types

| Key | Mô tả | Hiển thị ở |
|-----|-------|-----------|
| `messages` | Tin nhắn chưa đọc | Header, Quick Access, Communication |
| `missedCalls` | Cuộc gọi nhỡ | Communication section |
| `notifications` | Thông báo hệ thống | Header notifications icon |
| `projects` | Cập nhật dự án | Quick Access |
| `orders` | Đơn hàng mới | Quick Access |
| `crm` | CRM updates | - |
| `social` | Social notifications | Communication |
| `live` | Live streams | Communication |

---

## 🎯 Flow hoạt động

```
[Tin nhắn mới đến]
       ↓
[addMessageNotification()] → badges.messages++
       ↓
[NotificationToast hiện popup]
       ↓
[User tap toast / vào conversation]
       ↓
[markMessageAsRead()] → badges.messages--
       ↓
[Badge clear, toast hide]
```

---

## 🧪 Test thủ công

1. **Mở app** → Kiểm tra badge trên header
2. **Vào Tin nhắn** → Xem danh sách conversation với unread count
3. **Chọn conversation** → Badge giảm sau khi đọc
4. **Quay lại Home** → Badge số cập nhật
5. **Vào Cuộc gọi** → Badge cuộc gọi nhỡ clear
6. **Nhận tin nhắn mới** → Toast popup hiện lên

---

## ⚠️ Lưu ý

- Badge được lưu vào AsyncStorage, persist qua app restart
- Toast chỉ hiện khi có notification mới chưa đọc
- Cần WebSocket/Push để nhận realtime notifications
- Mock data có thể test bằng cách gọi `addMessageNotification()` manually

---

*Cập nhật: 03/01/2026*
