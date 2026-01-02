# Notification Timeline Enhancement - Implementation Summary

## ✅ Đã Hoàn Thành

### 1. Type Definitions
**File:** `types/notification-timeline.ts`
- `NotificationTimestamp`: Timestamps chi tiết (created, received, read, delivered)
- `ActivityLogEntry`: Cấu trúc cho login history và activity events
- `EnhancedNotification`: Notification mở rộng với priority, category, actionUrl
- `NotificationStats`: Thống kê thông báo

### 2. Activity Log Component
**File:** `components/ActivityLogItem.tsx`
- Component hiển thị login history và security events
- Metadata: IP address, device, location, browser
- Icons màu sắc theo loại (login=green, logout=orange, security=blue)
- Timeline visualization với dots

### 3. Enhanced Notification Screen (Partial)
**File:** `app/(tabs)/notifications-timeline.tsx` (NEW)
- Timeline layout với connector lines
- Expandable details (long-press to expand)
- Full timestamps với định dạng dd/MM/yyyy HH:mm:ss
- Trust badge ("Tất cả hoạt động được mã hóa...")
- Stats display (unread count, 10/user limit)
- Pulse animation cho unread items

### 4. New Hooks Created
- `useMessageUnreadCount` - Tính tổng unread từ conversations
- `useCallUnreadCount` - Đếm missed calls
- `useUnreadCounts` (enhanced) - Tích hợp cả 2 hooks trên + auto re-probe

## 🚧 Cần Hoàn Thiện

### 1. Backend API Changes Required

#### Endpoint: `POST /api/notifications` (Create)
```json
{
  "userId": "string",
  "type": "info|success|warning|error|message|call|security",
  "title": "string",
  "message": "string",
  "timestamps": {
    "createdAt": "ISO timestamp",
    "deliveredAt": "ISO timestamp" 
  },
  "metadata": {
    "device": "iPhone 14 Pro",
    "ipAddress": "123.45.67.89",
    "location": "Hồ Chí Minh, VN",
    "browser": "Safari 17.0"
  },
  "priority": "low|normal|high|urgent",
  "category": "projects|messages|system"
}
```

#### Endpoint: `GET /api/notifications` (List - Updated)
Response thêm fields:
```json
{
  "success": true,
  "notifications": [{
    "id": "string",
    "type": "...",
    "title": "...",
    "message": "...",
    "read": boolean,
    "createdAt": "ISO timestamp",
    "data": {
      "receivedAt": "ISO timestamp",  // NEW
      "readAt": "ISO timestamp",      // NEW
      "device": "string",              // NEW
      "ipAddress": "string",           // NEW
      "location": "string"             // NEW
    }
  }],
  "unread": 5,
  "total": 10,  // Always limited to 10 per user
  "limit": 10
}
```

#### Endpoint: `POST /api/notifications/:id/read` (Mark as Read)
Cập nhật để ghi `readAt` timestamp:
```json
{
  "readAt": "ISO timestamp"
}
```

#### Endpoint: `GET /api/activity-log` (NEW)
Lấy lịch sử đăng nhập và hoạt động:
```json
{
  "success": true,
  "activities": [{
    "id": "string",
    "type": "login|logout|security|action",
    "title": "Đăng nhập thành công",
    "description": "Đăng nhập từ thiết bị mới",
    "timestamp": "ISO timestamp",
    "metadata": {
      "ipAddress": "123.45.67.89",
      "device": "iPhone 14 Pro",
      "location": "Hồ Chí Minh, VN",
      "browser": "Safari 17.0"
    }
  }],
  "total": 20,
  "limit": 20  // Keep last 20 activities
}
```

### 2. Database Schema Updates

#### `notifications` table
```sql
ALTER TABLE notifications ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE notifications ADD COLUMN delivered_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN device VARCHAR(255);
ALTER TABLE notifications ADD COLUMN ip_address VARCHAR(45);
ALTER TABLE notifications ADD COLUMN location VARCHAR(255);
ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN category VARCHAR(50);

-- Add constraint for 10 notification limit per user
CREATE OR REPLACE FUNCTION limit_notifications_per_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM notifications
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_notification_limit
AFTER INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION limit_notifications_per_user();
```

#### `activity_logs` table (NEW)
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,  -- 'login', 'logout', 'security', 'action'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  device VARCHAR(255),
  location VARCHAR(255),
  browser VARCHAR(255),
  metadata JSONB
);

CREATE INDEX idx_activity_logs_user_timestamp ON activity_logs(user_id, timestamp DESC);

-- Limit to 20 activities per user
CREATE OR REPLACE FUNCTION limit_activity_logs_per_user()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM activity_logs
    WHERE user_id = NEW.user_id
    ORDER BY timestamp DESC
    LIMIT 20
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_activity_log_limit
AFTER INSERT ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION limit_activity_logs_per_user();
```

### 3. Frontend Integration Steps

#### Step 1: Update NotificationContext
File: `context/NotificationContext.tsx`

Thêm activity log support:
```typescript
interface NotificationContextType {
  // ... existing
  activityLogs: ActivityEvent[];
  fetchActivityLogs: () => Promise<void>;
}
```

#### Step 2: Complete notifications.tsx
File: `app/(tabs)/notifications.tsx`

Cần thêm:
- Tab switcher (Thông báo / Lịch sử hoạt động)
- Integrate ActivityLogItem component
- State management cho expanded items
- Styles cho các elements mới

Tham khảo: `app/(tabs)/notifications-timeline.tsx` đã tạo

#### Step 3: Tracking Helper
Tạo file: `utils/activity-tracker.ts`

```typescript
import { apiFetch } from '@/services/api';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

export async function trackLogin() {
  const metadata = await getDeviceMetadata();
  await apiFetch('/api/activity-log', {
    method: 'POST',
    body: JSON.stringify({
      type: 'login',
      title: 'Đăng nhập thành công',
      description: `Đăng nhập từ ${metadata.device}`,
      timestamp: new Date().toISOString(),
      metadata
    })
  });
}

export async function trackLogout() {
  const metadata = await getDeviceMetadata();
  await apiFetch('/api/activity-log', {
    method: 'POST',
    body: JSON.stringify({
      type: 'logout',
      title: 'Đăng xuất',
      description: 'Đăng xuất khỏi hệ thống',
      timestamp: new Date().toISOString(),
      metadata
    })
  });
}

async function getDeviceMetadata() {
  const ipAddress = await Network.getIpAddressAsync();
  return {
    device: `${Device.brand} ${Device.modelName}`,
    ipAddress,
    location: 'Việt Nam', // Can integrate with geolocation API
    browser: Device.osName,
  };
}
```

#### Step 4: Wire up tracking in AuthContext
File: `context/AuthContext.tsx`

```typescript
import { trackLogin, trackLogout } from '@/utils/activity-tracker';

// In signIn function:
await trackLogin();

// In signOut function:
await trackLogout();
```

### 4. Additional Features (Optional)

#### A. Push Notification Integration
- React Native Notifications
- Update `receivedAt` when notification arrives
- Background sync

#### B. Security Alerts
- Detect unusual login locations
- New device notifications
- Auto-lock on suspicious activity

#### C. Export Activity Log
- Export to CSV/PDF
- Email report
- GDPR compliance

## 📋 Testing Checklist

- [ ] Backend: Notification limit enforces 10/user
- [ ] Backend: Activity log records login/logout with metadata
- [ ] Backend: Timestamps properly recorded (created, delivered, read)
- [ ] Frontend: Timeline displays correctly with connector lines
- [ ] Frontend: Long-press expands details panel
- [ ] Frontend: Tab switching between Notifications and Activity works
- [ ] Frontend: Trust badge displays correctly
- [ ] Frontend: Timestamps formatted correctly in Vietnamese
- [ ] Integration: Login tracking works automatically
- [ ] Integration: Logout tracking works automatically
- [ ] Integration: Device metadata captured correctly
- [ ] Performance: List renders smoothly with 10+ items
- [ ] UX: Pull-to-refresh updates both tabs
- [ ] UX: Unread badge counts match reality

## 🎯 User Benefits

1. **Transparency**: Chi tiết timestamps tăng tin cậy
2. **Security**: Login history giúp phát hiện truy cập trái phép
3. **Trust**: Metadata (device, IP, location) cho người dùng kiểm soát
4. **Compliance**: Activity log phục vụ audit và GDPR
5. **UX**: Timeline UI trực quan, dễ theo dõi

## 📁 File Structure Summary

```
app/
  (tabs)/
    notifications.tsx            # Main screen (needs completion)
    notifications-timeline.tsx   # Reference implementation
    
components/
  ActivityLogItem.tsx           # ✅ Complete
  
context/
  NotificationContext.tsx       # Needs update for activity logs
  
types/
  notification-timeline.ts      # ✅ Complete type definitions
  
utils/
  activity-tracker.ts          # To be created
  
hooks/
  useMessageUnreadCount.ts     # ✅ Complete
  useCallUnreadCount.ts        # ✅ Complete
  useUnreadCounts.ts           # ✅ Enhanced with re-probe
```

## 🚀 Next Steps

1. **Backend Priority**: Implement database schema changes + API endpoints
2. **Frontend Priority**: Complete notifications.tsx với tab switching
3. **Integration**: Wire activity tracking vào login/logout flow
4. **Testing**: Verify 10-notification limit + 20-activity limit
5. **Polish**: Animation, loading states, error handling

---

**Status**: Group A tasks complete ✅  
**Current Task**: Notification timeline redesign (Task #11) - 60% complete  
**Blocking**: Backend API implementation required for full functionality
