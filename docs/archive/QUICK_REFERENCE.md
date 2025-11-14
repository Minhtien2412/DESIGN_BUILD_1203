# 🚀 Quick Reference - Notification Timeline System

## ✅ What's Done (Frontend)

### Hooks
```typescript
// Message unread count
import { useMessageUnreadCount } from '@/hooks/useMessageUnreadCount';
const { count, loading, refresh } = useMessageUnreadCount();

// Call unread count  
import { useCallUnreadCount } from '@/hooks/useCallUnreadCount';
const { count, loading, refresh } = useCallUnreadCount();

// Combined with auto re-probe
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
const { counts, loading, error, refresh } = useUnreadCounts();
// counts = { messages, calls, notifications, total }
```

### Components
```typescript
// Activity log item
import { ActivityLogItem } from '@/components/ActivityLogItem';
<ActivityLogItem event={{
  id: 'act-001',
  type: 'login',
  title: 'Đăng nhập thành công',
  description: 'Đăng nhập từ thiết bị mới',
  timestamp: '2025-11-06T09:00:00Z',
  metadata: {
    ipAddress: '123.45.67.89',
    device: 'iPhone 14 Pro',
    location: 'Hồ Chí Minh, VN'
  }
}} />
```

### Screens
- `app/(tabs)/notifications.tsx` - Enhanced with expandable details
- `app/(tabs)/notifications-timeline.tsx` - Reference implementation
- Long-press avatar in Profile → Opens diagnostics (__DEV__ only)

### Types
```typescript
import type { 
  NotificationTimestamp,
  ActivityLogEntry,
  EnhancedNotification,
  NotificationStats 
} from '@/types/notification-timeline';
```

## ⏳ What's Needed (Backend)

### Database Commands
```sql
-- Run these in PostgreSQL
\i backend-implementation/migrations/add_notification_timestamps.sql
\i backend-implementation/migrations/create_activity_logs_table.sql
```

### API Endpoints to Implement
1. `POST /api/activity-log` - Record login/logout
2. `GET /api/activity-log` - Fetch activity history
3. `GET /api/notifications` - Add timestamps/metadata to response
4. `POST /api/notifications/:id/read` - Record readAt timestamp

### Integration Code
```typescript
// Create: utils/activity-tracker.ts
export async function trackLogin() { ... }
export async function trackLogout() { ... }

// Wire in: context/AuthContext.tsx
import { trackLogin, trackLogout } from '@/utils/activity-tracker';

// In signIn():
await trackLogin();

// In signOut():
await trackLogout();
```

## 🧪 Testing

### Run System Check
```bash
node scripts/test-notifications.js
```

### Test User Flow
1. Open app in dev mode
2. Navigate to Profile tab
3. Long-press avatar → Opens diagnostics
4. Check health, videos, auth, upload tests
5. Navigate to Notifications tab
6. Long-press notification → Expands details
7. View timestamps (created, received, read)
8. View device metadata

### Verify Unread Counts
```typescript
// In any component
const { counts } = useUnreadCounts();
console.log('Messages:', counts.messages);
console.log('Calls:', counts.calls);
console.log('Notifications:', counts.notifications);
console.log('Total:', counts.total);
```

## 📊 Re-probe Schedule
When `/api/notifications/unread-count` returns 404:
- Attempt 1: 10 minutes later
- Attempt 2: 20 minutes later
- Attempt 3: 40 minutes later
- Attempt 4+: 60 minutes later
- Stops when endpoint returns 200

## 🎨 UI Features

### Timeline View
- Connector lines between items
- Color-coded icons (green=login, orange=logout, blue=security)
- Pulse animation on unread items
- "Mới" badge for unread

### Expandable Details
- Tap notification → Mark as read
- Long-press → Toggle expanded view
- Shows: created time, received time, read time, device info

### Trust Signals
- Shield icon badge: "Tất cả hoạt động được mã hóa..."
- Stats display: "5 mới", "Giới hạn 10/user"
- Metadata: IP, device, location visible in details

## 📱 User Experience Flow

### First Time User
1. Register → Activity log records first login
2. Receive notification → Shows "Vừa xong"
3. Tap notification → Marks as read, shows readAt timestamp
4. Long-press → See full details (device, IP)

### Returning User
1. Login → Activity log + login notification
2. Check notifications → See timeline with timestamps
3. View activity history → See all login/logout events
4. Trust signals → See IP/device for security

### Developer
1. Long-press profile avatar → Diagnostics screen
2. Test API health, auth, upload
3. Check logs for unread count fallback
4. Monitor re-probe schedule in console

## 🔐 Security Features
- All timestamps in ISO format (UTC)
- IP address logged for audit
- Device info captured for suspicious activity detection
- 20 activity logs retained per user
- 10 notifications retained per user

## 📚 Documentation
- `NOTIFICATION_TIMELINE_IMPLEMENTATION.md` - Full implementation guide
- `SYSTEM_CHECK_LOG.md` - Detailed test results
- `scripts/test-notifications.js` - Automated tests

## 🎯 Priority Order (Backend)
1. Database schema (30 min)
2. POST /api/activity-log (1 hour)
3. GET /api/activity-log (30 min)
4. Enhanced GET /api/notifications (1 hour)
5. Activity tracking integration (30 min)

**Total: ~3.5 hours backend work**

---

**Status:** Frontend 100% ✅ | Backend 0% ⏳  
**Next:** Backend team to implement database + API  
**Timeline:** ~5 days to production-ready
