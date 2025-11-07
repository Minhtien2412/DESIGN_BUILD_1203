# 📱 Advanced Notifications System

Hệ thống thông báo toàn diện với analytics, scheduling, rich templates và multi-language support.

## 🚀 Features Overview

### ✅ Đã triển khai
- **📊 Analytics Dashboard** - Thống kê engagement chi tiết
- **⏰ Scheduled Notifications** - Lên lịch thông báo tự động  
- **🎨 Rich Templates** - 6 template có sẵn với media support
- **🌐 Multi-language** - Hỗ trợ 5 ngôn ngữ (vi/en/zh/ja/ko)
- **🔔 Real-time Notifications** - Push notifications tức thì
- **💾 Persistent Storage** - Lưu trữ bảo mật với SecureStore
- **🎯 Smart Routing** - Navigation tích hợp sâu

### 🔄 Đang phát triển  
- **👥 User-to-user Notifications** - Thông báo peer-to-peer
- **🔗 Deep Linking** - Advanced navigation patterns

## 📂 Cấu trúc Files

```
features/notifications/
├── README.md                 # Documentation
├── index.ts                  # Main exports
├── i18n.ts                  # Multi-language system
├── analyticsStore.ts        # Analytics tracking
├── scheduledNotifications.ts # Scheduling service
├── hooks/
│   └── useNotifications.ts  # Main hook
└── screens/
    ├── notifications.tsx    # Main screen
    ├── notification-analytics.tsx
    ├── scheduled-notifications.tsx  
    └── notification-history.tsx

components/ui/rich-notification.tsx  # Rich templates
app/notification-showcase.tsx        # Demo screen
```

## 🛠 API Reference

### Core Hook

```typescript
const {
  notifications,    // NotificationItem[]
  unreadCount,     // number
  add,             // (notification) => void
  markRead,        // (id) => void
  markAllRead,     // () => void
  remove,          // (id) => void
  clear,           // () => void
} = useNotifications();
```

### Analytics

```typescript
// Tracking
trackNotificationReceived(id, type);
trackNotificationRead(id, type);
trackNotificationClicked(id, type);

// Loading data
const analytics = await loadAnalytics();
```

### Scheduled Notifications

```typescript
// Quick helpers
await scheduleReminder(title, body, minutesFromNow);
await scheduleDeadline(title, body, timestamp);
await scheduleAppointment(title, body, timestamp);

// Full control
await createScheduledNotification({
  title, body, type, scheduledFor, data
});
```

### Rich Templates

```typescript
// Available templates
NOTIFICATION_TEMPLATES = {
  'project_update': { layout: 'progress', ... },
  'new_message': { layout: 'image', ... },
  'task_reminder': { layout: 'action', ... },
  // ... 6 templates total
}

// Create from template
const notification = createNotificationFromTemplate(
  'project_update', 
  { project_name: 'Villa', progress: '75' }
);
```

### Multi-language

```typescript
// Translation
t('common.loading', {}, 'vi'); // "Đang tải..."
translateType('message', 'en'); // "Message"

// Language management
await setStoredLanguage('vi');
const lang = await getStoredLanguage();
```

## 🎨 Templates Chi tiết

### 1. Project Update (Progress)
- **Layout:** Progress bar + metadata
- **Use case:** Tiến độ dự án, task completion
- **Data:** `project_name`, `progress`, `start_time`, `end_time`

### 2. New Message (Image + Text)
- **Layout:** Avatar + preview text
- **Use case:** Chat messages, comments
- **Data:** `sender_name`, `message_preview`

### 3. Task Reminder (Action Buttons)
- **Layout:** Title + description + buttons
- **Use case:** Nhắc nhở công việc, deadlines
- **Data:** `task_name`, `time_left`

### 4. Payment Alert (Image + Amount)
- **Layout:** Payment icon + transaction details
- **Use case:** Thanh toán, giao dịch
- **Data:** `amount`, `transaction_id`

### 5. Live Event (Media Preview)
- **Layout:** Video thumbnail + event info
- **Use case:** Live streams, events
- **Data:** `event_title`, `start_time`

### 6. System Alert (Basic + Icon)
- **Layout:** Minimal với icon và text
- **Use case:** System updates, maintenance
- **Data:** Generic title/body

## 📊 Analytics Metrics

### Engagement Metrics
- **Total Notifications:** Tổng số thông báo
- **Read Rate:** Tỷ lệ đọc (%)
- **Click Rate:** Tỷ lệ click (%)
- **Response Time:** Thời gian phản hồi trung bình

### Type Breakdown
- Phân tích theo loại: `system`, `message`, `live`, `order`, `reminder`
- Chart visualization với màu sắc riêng biệt

### Daily Trends
- Số lượng thông báo theo ngày
- Engagement trends theo thời gian
- Export data CSV/JSON

## ⏰ Scheduling Types

### Reminder
```typescript
await scheduleReminder(
  'Họp team', 
  'Cuộc họp bắt đầu sau 15 phút',
  15 // minutes from now
);
```

### Deadline
```typescript
await scheduleDeadline(
  'Nộp báo cáo',
  'Deadline báo cáo dự án hôm nay',
  Date.now() + 3600000 // 1 hour
);
```

### Appointment
```typescript
await scheduleAppointment(
  'Gặp khách hàng',
  'Cuộc hẹn với ABC Company',
  appointmentTimestamp
);
```

## 🌐 Languages Supported

| Code | Language | Native Name |
|------|----------|-------------|
| `vi` | Vietnamese | Tiếng Việt |
| `en` | English | English |
| `zh` | Chinese | 中文 |
| `ja` | Japanese | 日本語 |
| `ko` | Korean | 한국어 |

### Translation Keys
```typescript
NOTIFICATION_MESSAGES = {
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'action.mark_read': { vi: 'Đánh dấu đã đọc', en: 'Mark as read' },
  // ... 50+ keys total
}
```

## 🚀 Usage Examples

### Basic Notification
```typescript
add({
  title: 'Thông báo mới',
  body: 'Bạn có 1 tin nhắn mới',
  type: 'message'
});
```

### Rich Template Notification
```typescript
const notification = createNotificationFromTemplate('new_message', {
  sender_name: 'Nguyễn Văn A',
  message_preview: 'Chào bạn! Tôi muốn...'
});

add({
  title: notification.title,
  body: notification.body,
  type: 'message',
  data: notification
});
```

### Scheduled with Rich Template
```typescript
const richNotif = createNotificationFromTemplate('deadline', {
  task_name: 'Hoàn thiện thiết kế',
  time_left: '2 giờ'
});

await createScheduledNotification({
  title: richNotif.title,
  body: richNotif.body,
  type: 'deadline',
  scheduledFor: deadlineTime,
  data: richNotif
});
```

## 🎯 Navigation Integration

### Available Routes
- `/notification-showcase` - Demo tất cả tính năng
- `/notification-analytics` - Analytics dashboard
- `/scheduled-notifications` - Quản lý lịch
- `/notification-history` - Lịch sử & tìm kiếm
- `/notifications-preferences` - Cài đặt

### Deep Linking
```typescript
// From template action
onAction={(action, route) => {
  if (route) router.push(route);
}}

// Custom navigation
router.push('/product/123?from=notification');
```

## 💾 Storage Schema

### NotificationItem
```typescript
{
  id: string;
  title: string;
  body: string;
  type: 'system' | 'message' | 'live' | 'order' | 'reminder';
  read: boolean;
  createdAt: number;
  data?: any; // Rich template data
}
```

### ScheduledNotification
```typescript
{
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'deadline' | 'appointment';
  scheduledFor: number;
  createdAt: number;
  data?: any;
}
```

### Analytics Data
```typescript
{
  totalNotifications: number;
  totalRead: number;
  totalClicked: number;
  typeBreakdown: Record<string, number>;
  dailyStats: Array<{
    date: string;
    count: number;
    readCount: number;
  }>;
  lastUpdated: number;
}
```

## 🔧 Configuration

### Constants
```typescript
// Storage keys
STORAGE_KEYS = {
  NOTIFICATIONS: '@app/notifications',
  ANALYTICS: '@app/notification-analytics',
  SCHEDULED: '@app/scheduled-notifications',
  LANGUAGE: '@app/notification-language',
}

// Template categories
TEMPLATE_CATEGORIES = [
  'project', 'communication', 'task', 
  'payment', 'event', 'system'
]
```

### Customization
```typescript
// Theme colors
NOTIFICATION_COLORS = {
  system: '#007AFF',
  message: '#34C759', 
  live: '#FF9500',
  order: '#FF3B30',
  reminder: '#AF52DE'
}
```

## 🔄 Migration Guide

### From Basic to Rich Notifications
1. Existing notifications remain unchanged
2. New notifications can use rich templates
3. Analytics tracking is backward compatible

### Adding New Languages
```typescript
// 1. Add to SUPPORTED_LANGUAGES
{ code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' }

// 2. Update NOTIFICATION_MESSAGES
'common.loading': { 
  vi: 'Đang tải...', 
  en: 'Loading...',
  fr: 'Chargement...' 
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Templates not rendering:**
   ```typescript
   // Ensure all template data fields are provided
   const data = { project_name: 'Required field' };
   ```

2. **Scheduled notifications not firing:**
   ```typescript
   // Check permission
   const { status } = await Notifications.getPermissionsAsync();
   ```

3. **Analytics not updating:**
   ```typescript
   // Force refresh
   await persistAnalytics(analytics);
   ```

## 📈 Performance Notes

- Analytics data persisted on mutation (fire-and-forget)
- Templates pre-compiled at build time
- Translations cached in memory
- Images lazy-loaded in rich notifications

## 🎁 Demo Usage

Truy cập `/notification-showcase` để xem:
- ✅ Tất cả templates với preview
- ✅ Multi-language switching
- ✅ Scheduled notifications demo
- ✅ Quick navigation shortcuts
- ✅ Live template creation

---

## 🚧 Roadmap

### Phase 2 (Upcoming)
- **👥 P2P Notifications:** User-to-user messaging
- **🔗 Deep Links:** Advanced routing patterns
- **📅 Calendar Integration:** Sync with device calendar
- **🔕 Smart DND:** Intelligent quiet hours
- **🤖 AI Suggestions:** Smart template recommendations

### Phase 3 (Future)
- **📱 Widget Support:** Home screen widgets
- **⌚ Watch Integration:** Apple Watch/WearOS
- **🎵 Custom Sounds:** Per-type notification sounds
- **📊 Advanced Analytics:** ML-powered insights
- **🔄 Sync Service:** Multi-device synchronization

---

*Hệ thống notification hoàn chỉnh đã sẵn sàng production! 🎉*