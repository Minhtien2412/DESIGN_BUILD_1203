# Hệ Thống Thông Báo & Tin Nhắn Tự Động

## Tổng quan

Hệ thống thông báo thông minh giống Shopee với:
- ✅ Tin nhắn chào mừng tự động từ CSKH
- ✅ Badge cập nhật real-time (giỏ hàng, thông báo, tin nhắn)
- ✅ Lịch sử xem sản phẩm/dịch vụ
- ✅ Gợi ý thông minh dựa trên hành vi

---

## 1. Welcome Message Service

### File: `services/welcome-message.ts`

**Chức năng:**
- Gửi 4 tin nhắn chào mừng từ CSKH Design Build
- Delay 2 giây giữa mỗi tin nhắn (giống người thật)
- Chỉ gửi 1 lần cho mỗi user
- Lưu trạng thái vào AsyncStorage

**API:**

```typescript
import { sendWelcomeMessages, hasWelcomeMessageSent } from '@/services/welcome-message';

// Gửi tin nhắn chào mừng (tự động khi đăng ký)
await sendWelcomeMessages(userId);

// Kiểm tra đã gửi chưa
const sent = await hasWelcomeMessageSent(userId);

// Gửi lại (reset + gửi mới)
await sendWelcomeMessageNow(userId);
```

**Nội dung tin nhắn:**

1. 👋 Xin chào! Chào mừng bạn đến với Design Build...
2. 🏠 Chúng tôi cung cấp: Thiết kế, Thi công, Nội thất...
3. 🎁 Ưu đãi: Giảm 15% thiết kế, Tư vấn free...
4. 💬 Nhắn tin cho tôi nếu cần hỗ trợ!

**Tích hợp:**

Đã tích hợp vào `AuthContext.signUp()`:
```tsx
// Tự động gửi khi user đăng ký thành công
const { sendWelcomeMessages } = await import('@/services/welcome-message');
sendWelcomeMessages(user.id);
```

---

## 2. Notification Badge Service

### File: `services/notification-badge.ts`

**Badge Types:**
- `notifications` - Thông báo hệ thống
- `messages` - Tin nhắn chưa đọc
- `cart` - Số lượng sản phẩm trong giỏ
- `orders` - Đơn hàng mới/cập nhật

**API:**

```typescript
import { 
  updateBadgeCount,
  incrementBadge,
  decrementBadge,
  resetBadge,
  cartBadge,
  messageBadge,
  notificationBadge,
} from '@/services/notification-badge';

// Cập nhật badge cụ thể
await updateBadgeCount('cart', 5);
await incrementBadge('messages'); // +1
await decrementBadge('cart'); // -1
await resetBadge('notifications'); // = 0

// Helper functions
await cartBadge.set(10);
await cartBadge.increment();
await messageBadge.reset();
```

**React Hook:**

```typescript
import { useBadgeCount, useSingleBadge } from '@/hooks/use-badge-count';

// Lấy tất cả badges
const { notifications, messages, cart, orders } = useBadgeCount();

// Lấy badge đơn lẻ
const cartCount = useSingleBadge('cart');
```

**Tích hợp giỏ hàng:**

Đã tích hợp vào `CartContext`:
```tsx
// Tự động cập nhật badge khi items thay đổi
useEffect(() => {
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.set(totalQty);
}, [items]);
```

---

## 3. Recent Activity Tracking

### File: `services/recent-activity.ts`

**Chức năng:**
- Theo dõi sản phẩm vừa xem
- Theo dõi dịch vụ vừa xem
- Phân tích mức độ quan tâm (số lần xem)

**API:**

```typescript
import {
  addRecentProduct,
  getRecentProducts,
  addRecentService,
  getRecentServices,
  addInterest,
  getInterests,
} from '@/services/recent-activity';

// Thêm sản phẩm vào lịch sử
await addRecentProduct({
  id: 'p1',
  name: 'Gạch men 60x60',
  image: 'https://...',
  price: '350.000₫',
  category: 'Vật liệu',
});

// Lấy 10 sản phẩm vừa xem
const recent = await getRecentProducts(10);

// Thêm vào danh sách quan tâm (tăng interactions)
await addInterest({
  id: 'service-1',
  type: 'service',
  name: 'Thợ xây',
  image: 'https://...',
});

// Lấy gợi ý (sắp xếp theo interactions)
const suggestions = await getInterests(10);
```

---

## 4. UI Components

### Badge Icon Component

**File:** `components/ui/badge-icon.tsx`

```tsx
import { BadgeIcon } from '@/components/ui/badge-icon';

<BadgeIcon
  iconName="notifications"
  iconSize={24}
  iconColor="#000"
  badgeCount={5}
  maxCount={99}
  badgeBackgroundColor="#EE4D2D"
/>
// Hiển thị: 🔔 với badge "5"
```

**Props:**
- `iconName` - Tên icon Ionicons
- `badgeCount` - Số lượng hiển thị
- `maxCount` - Số max (vd: 99+)
- `showZero` - Hiện badge khi = 0

### Recently Viewed Section

**File:** `components/ui/recently-viewed.tsx`

```tsx
import { RecentlyViewed } from '@/components/ui/recently-viewed';

<RecentlyViewed maxItems={10} showHeader={true} />
```

Hiển thị horizontal scroll với sản phẩm vừa xem.

### Interest Suggestions Section

**File:** `components/ui/interest-suggestions.tsx`

```tsx
import { InterestSuggestions } from '@/components/ui/interest-suggestions';

<InterestSuggestions maxItems={10} showHeader={true} />
```

Hiển thị gợi ý "Có thể bạn quan tâm" với badge số lần xem.

---

## 5. Cách sử dụng

### A. Khi user đăng ký

```tsx
// AuthContext tự động gửi welcome message
// Không cần code thêm gì
```

### B. Khi thêm sản phẩm vào giỏ

```tsx
// CartContext tự động cập nhật badge
// Không cần code thêm gì
```

### C. Khi xem sản phẩm

```tsx
import { addRecentProduct, addInterest } from '@/services/recent-activity';

// Trong ProductDetail screen
useEffect(() => {
  // Thêm vào lịch sử
  addRecentProduct({
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    category: product.category,
  });

  // Tăng mức độ quan tâm
  addInterest({
    id: product.id,
    type: 'product',
    name: product.name,
    image: product.image,
  });
}, [product]);
```

### D. Khi có tin nhắn mới

```tsx
import { messageBadge } from '@/services/notification-badge';

// Trong MessageContext hoặc API handler
await messageBadge.increment();
```

### E. Khi đọc tin nhắn

```tsx
import { messageBadge } from '@/services/notification-badge';

await messageBadge.decrement();
// hoặc
await messageBadge.reset(); // nếu đọc hết
```

### F. Hiển thị badge trong Tab Bar

```tsx
import { BadgeIcon } from '@/components/ui/badge-icon';
import { useSingleBadge } from '@/hooks/use-badge-count';

function TabBarIcon({ name }: { name: string }) {
  const cartCount = useSingleBadge('cart');
  const messageCount = useSingleBadge('messages');

  if (name === 'cart') {
    return <BadgeIcon iconName="cart" badgeCount={cartCount} />;
  }

  if (name === 'messages') {
    return <BadgeIcon iconName="chatbubbles" badgeCount={messageCount} />;
  }

  return <Ionicons name={name} size={24} />;
}
```

---

## 6. Workflow hoàn chỉnh

### User Journey:

```
1. Đăng ký tài khoản
   ↓
   AuthContext.signUp()
   ↓
   [Tự động] sendWelcomeMessages(userId)
   ↓
   User nhận 4 tin nhắn từ CSKH (delay 2s mỗi tin)
   ↓
   messageBadge.set(4)

2. Duyệt sản phẩm
   ↓
   Xem ProductDetail
   ↓
   addRecentProduct() + addInterest()
   ↓
   Hiển thị trong "Sản phẩm vừa xem"

3. Thêm vào giỏ hàng
   ↓
   CartContext.addToCart()
   ↓
   [Tự động] cartBadge.set(totalQty)
   ↓
   Badge số lượng hiển thị trên icon giỏ hàng

4. Thanh toán
   ↓
   OrderContext.createOrder()
   ↓
   orderBadge.increment()
   ↓
   notificationBadge.increment()
   ↓
   User nhận thông báo: "Đơn hàng đã được đặt"

5. Quay lại trang chủ
   ↓
   Hiển thị "Có thể bạn quan tâm" (dựa trên lịch sử)
```

---

## 7. API Backend (Cần triển khai)

### Endpoints cần có:

**GET `/users/:id/badge-counts`**
```json
{
  "notifications": 3,
  "messages": 5,
  "cart": 2,
  "orders": 1
}
```

**POST `/messages/send`**
```json
{
  "fromUserId": "cskh-design-build",
  "toUserId": "user123",
  "content": "Xin chào!",
  "type": "text",
  "metadata": {
    "isWelcomeMessage": true
  }
}
```

**GET `/users/:id/recent-activity`**
```json
{
  "recentProducts": [...],
  "recentServices": [...],
  "interests": [...]
}
```

---

## 8. Storage Structure

### AsyncStorage Keys:

```
welcome_message_sent_{userId} = "true"
welcome_message_sent_{userId}_data = { sent, timestamp, userId }
badge_counts = { notifications, messages, cart, orders }
recent_products = [ {...}, {...} ]
recent_services = [ {...}, {...} ]
user_interests = [ {...}, {...} ]
```

---

## 9. Testing

### Test Welcome Message:

```typescript
import { sendWelcomeMessageNow } from '@/services/welcome-message';

// Force resend
await sendWelcomeMessageNow('test-user-id');
```

### Test Badge Updates:

```typescript
import { cartBadge, messageBadge } from '@/services/notification-badge';

await cartBadge.set(5);
await messageBadge.increment();
```

### Test Recent Activity:

```typescript
import { addRecentProduct, getRecentProducts } from '@/services/recent-activity';

await addRecentProduct({
  id: 'test-1',
  name: 'Test Product',
  image: 'https://...',
  price: '100.000₫',
  category: 'Test',
});

const recent = await getRecentProducts();
console.log(recent); // Should show test-1
```

---

## 10. Performance

- ✅ Badge updates: Real-time với listeners
- ✅ AsyncStorage: Async operations, không block UI
- ✅ Recent activity: Limited to 20 items (auto-prune)
- ✅ Interests: Top 50 items (sorted by interactions)
- ✅ Welcome messages: Fire-and-forget (không chờ response)

---

## 11. Roadmap

### Phase 1 (Hoàn thành):
- ✅ Welcome message service
- ✅ Badge management
- ✅ Recent activity tracking
- ✅ UI components
- ✅ Cart integration
- ✅ Auth integration

### Phase 2 (Tiếp theo):
- 🔜 Backend API integration
- 🔜 Push notifications
- 🔜 In-app notifications center
- 🔜 Message thread UI
- 🔜 Read/unread tracking
- 🔜 Smart recommendations (ML)

---

**Developer:** Tien  
**Date:** 18/12/2025  
**Version:** 1.0.0
