# Hướng dẫn Tích hợp Thông báo Perfex CRM

## 📱 Giới thiệu

Hệ thống đã được tích hợp để nhận thông báo từ Perfex CRM tại `https://thietkeresort.com.vn/perfex_crm`.

## 🔧 Cấu hình đã có

### 1. API Token
- **User**: nhaxinhd
- **Name**: thietkeresort
- **Expiration**: 2030-12-30
- Token đã được cấu hình trong `.env` và `config/env.ts`

### 2. Các service đã tạo

| File | Mô tả |
|------|-------|
| `services/perfexNotificationService.ts` | Service xử lý thông báo từ CRM |
| `hooks/usePerfexNotifications.ts` | React hook quản lý state thông báo |
| `components/crm/CrmNotificationsScreen.tsx` | UI hiển thị thông báo |
| `app/crm-notifications.tsx` | Route màn hình thông báo CRM |

## 📲 Cách sử dụng trong App

### Polling tự động (mặc định)
```tsx
import { usePerfexNotifications } from '@/hooks/usePerfexNotifications';

function MyComponent() {
  const { 
    notifications, 
    unreadCount,
    loading,
    markAsRead,
    refresh 
  } = usePerfexNotifications({
    autoPolling: true,      // Tự động poll mỗi 60s
    pollingInterval: 60000, // Thời gian poll (ms)
    unreadOnly: false,      // Lấy tất cả hoặc chỉ chưa đọc
  });

  return (
    <View>
      <Text>Có {unreadCount} thông báo chưa đọc</Text>
      {notifications.map(n => (
        <NotificationItem 
          key={n.id} 
          notification={n} 
          onPress={() => markAsRead(n.id)}
        />
      ))}
    </View>
  );
}
```

### Điều hướng đến màn hình thông báo
```tsx
import { router } from 'expo-router';

// Mở màn hình thông báo CRM
router.push('/crm-notifications');
```

### Hiển thị badge count
```tsx
import { usePerfexNotifications } from '@/hooks/usePerfexNotifications';

function NotificationBadge() {
  const { unreadCount } = usePerfexNotifications();
  
  return (
    <View>
      <Ionicons name="notifications" size={24} />
      {unreadCount > 0 && (
        <Badge>{unreadCount}</Badge>
      )}
    </View>
  );
}
```

## 🔄 Các loại thông báo được hỗ trợ

| Type | Mô tả | Icon |
|------|-------|------|
| `project_created` | Dự án mới | 🏗️ |
| `project_updated` | Cập nhật dự án | 📝 |
| `project_completed` | Hoàn thành dự án | ✅ |
| `task_assigned` | Task được giao | 📋 |
| `task_completed` | Task hoàn thành | ✔️ |
| `task_comment` | Bình luận mới | 💬 |
| `invoice_created` | Hóa đơn mới | 📄 |
| `invoice_paid` | Thanh toán | 💰 |
| `estimate_created` | Báo giá mới | 📊 |
| `estimate_accepted` | Duyệt báo giá | ✅ |
| `estimate_declined` | Từ chối báo giá | ❌ |
| `contract_signed` | Ký hợp đồng | 📝 |
| `ticket_created` | Ticket mới | 🎫 |
| `ticket_reply` | Phản hồi ticket | 💬 |
| `lead_created` | Lead mới | 👤 |
| `proposal_created` | Đề xuất mới | 📋 |
| `announcement` | Thông báo | 📢 |
| `reminder` | Nhắc nhở | ⏰ |

## ⚙️ Cấu hình Webhook trên CRM (Tùy chọn)

Để nhận thông báo realtime thay vì polling, cần cấu hình webhook trên Perfex CRM:

### Bước 1: Tạo endpoint nhận webhook trên backend
```javascript
// Backend Node.js/Express
app.post('/api/webhooks/perfex', async (req, res) => {
  const { event, data } = req.body;
  
  // Xử lý webhook
  await handleCrmWebhook({ event, data });
  
  // Gửi push notification đến app
  await PushNotificationService.broadcastSystem(
    deviceTokens,
    getNotificationTitle(event),
    data.message
  );
  
  res.json({ success: true });
});
```

### Bước 2: Cấu hình webhook trong Perfex CRM
1. Vào **Setup** > **Settings** > **Webhooks**
2. Thêm URL: `https://your-backend.com/api/webhooks/perfex`
3. Chọn các events cần nhận:
   - Project created/updated/completed
   - Task assigned/completed
   - Invoice created/paid
   - etc.

### Bước 3: Xác thực webhook
```php
// Thêm vào Perfex CRM webhook handler
$secret = 'your-webhook-secret';
$signature = hash_hmac('sha256', $payload, $secret);
header('X-Perfex-Signature: ' . $signature);
```

## 📡 API Endpoints được sử dụng

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/notifications` | GET | Lấy danh sách thông báo |
| `/api/notifications/{id}/read` | POST | Đánh dấu đã đọc |
| `/api/notifications/read_all` | POST | Đánh dấu tất cả đã đọc |
| `/api/activities` | GET | Lấy activity feed |

## 🔐 Bảo mật

- API Token được lưu trong `SecureStore` (iOS Keychain / Android Keystore)
- Không expose token trong client-side code
- Sử dụng HTTPS cho tất cả API calls
- Token có thể revoke từ CRM admin panel

## 🐛 Troubleshooting

### Không nhận được thông báo
1. Kiểm tra token còn hạn: Expiration 2030-12-30
2. Kiểm tra network connectivity
3. Xem console log: `[PerfexNotifications]`

### Polling quá nhanh
```tsx
// Tăng interval
usePerfexNotifications({
  pollingInterval: 120000 // 2 phút
});
```

### Lỗi authentication
```bash
# Kiểm tra token trong .env
PERFEX_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 📊 Monitoring

Xem logs trong console:
```
[PerfexNotifications] Starting polling every 60s
[PerfexNotifications] Found 3 new notifications
[PerfexNotifications] Polling error: Network request failed
```

## 🔗 Links

- CRM Admin: https://thietkeresort.com.vn/perfex_crm/admin
- API Management: https://thietkeresort.com.vn/perfex_crm/admin/api/api_management
- API Docs: https://thietkeresort.com.vn/perfex_crm/api/documentation

---

*Tài liệu này được tạo tự động bởi AI Assistant - 14/01/2026*
