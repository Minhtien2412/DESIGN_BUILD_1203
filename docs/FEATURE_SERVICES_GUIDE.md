# Feature Services Guide
Complete documentation for Photo Timeline, Communication, and Notification services

---

## 📸 Photo Timeline Service

### Overview
Comprehensive progress photo management with timeline views, before/after comparisons, annotations, and analytics.

### Import
```typescript
import { photoTimelineService } from '@/services/api';
// or
import photoTimeline from '@/services/api/photo-timeline.service';
```

### Types

#### PhotoCategory
```typescript
'FOUNDATION' | 'STRUCTURE' | 'FRAMING' | 'ROOFING' | 'EXTERIOR' 
| 'INTERIOR' | 'MEP' | 'FINISHING' | 'LANDSCAPE' | 'OVERALL' 
| 'DEFECT' | 'OTHER'
```

#### PhotoPhase
```typescript
'PRE_CONSTRUCTION' | 'SITE_PREPARATION' | 'FOUNDATION' | 'STRUCTURE' 
| 'ENCLOSURE' | 'INTERIOR' | 'FINISHING' | 'COMPLETION' | 'POST_COMPLETION'
```

#### ProgressPhoto
```typescript
interface ProgressPhoto {
  id: number;
  projectId: number;
  category: PhotoCategory;
  phase: PhotoPhase;
  location: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  width: number;
  height: number;
  capturedAt: string;
  uploadedBy: number;
  uploadedAt: string;
  tags: string[];
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  weather?: {
    temperature: number;
    condition: string;
  };
  comparisonGroupId?: number;
  metadata?: Record<string, any>;
}
```

#### PhotoComparison
```typescript
interface PhotoComparison {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  location: string;
  beforePhotoId: number;
  afterPhotoId: number;
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
  timeDifference: number; // days
  createdAt: string;
}
```

### Usage Examples

#### Upload Photo
```typescript
const uploadPhoto = async (projectId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId.toString());
  formData.append('category', 'STRUCTURE');
  formData.append('phase', 'FOUNDATION');
  formData.append('location', 'Building A - East Wing');
  formData.append('description', 'Foundation complete');
  formData.append('tags', JSON.stringify(['foundation', 'completed']));

  const result = await photoTimelineService.uploadPhoto(formData);
  return result.data;
};
```

#### Get Timeline
```typescript
const getProjectTimeline = async (projectId: number) => {
  const result = await photoTimelineService.getTimeline({
    projectId,
    groupBy: 'week', // 'day' | 'week' | 'month'
    phase: 'FOUNDATION',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });
  
  return result.data;
  // Returns: { projectId, photos: TimelineGroup[], totalPhotos, dateRange }
};
```

#### Create Before/After Comparison
```typescript
const createComparison = async (
  projectId: number,
  beforePhotoId: number,
  afterPhotoId: number
) => {
  const result = await photoTimelineService.createComparison({
    projectId,
    name: 'Foundation Progress',
    description: 'Site preparation to completed foundation',
    location: 'Building A',
    beforePhotoId,
    afterPhotoId,
  });
  
  return result.data;
};
```

#### Add Photo Annotation
```typescript
const addAnnotation = async (photoId: number) => {
  const result = await photoTimelineService.createAnnotation({
    photoId,
    x: 45.5, // percentage from left
    y: 30.2, // percentage from top
    label: 'Crack detected',
    description: 'Vertical crack, 2cm width',
    color: '#FF0000',
  });
  
  return result.data;
};
```

#### Bulk Upload
```typescript
const bulkUpload = async (projectId: number, files: File[]) => {
  const formDataArray = files.map(file => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());
    formData.append('category', 'INTERIOR');
    formData.append('phase', 'FINISHING');
    return formData;
  });

  const result = await photoTimelineService.bulkUpload(formDataArray);
  return result.data;
};
```

#### Search Photos
```typescript
const searchPhotos = async (query: string) => {
  const result = await photoTimelineService.searchPhotos(query, {
    projectId: 1,
    category: 'STRUCTURE',
    tags: ['foundation', 'completed'],
  });
  
  return result.data.items;
};
```

#### Get Statistics
```typescript
const getStats = async (projectId: number) => {
  const result = await photoTimelineService.getStatistics(projectId);
  
  console.log(result.data);
  // {
  //   totalPhotos: 245,
  //   byCategory: { FOUNDATION: 45, STRUCTURE: 78, ... },
  //   byPhase: { FOUNDATION: 45, STRUCTURE: 78, ... },
  //   byMonth: { '2024-01': 23, '2024-02': 45, ... },
  //   lastUpdated: '2024-03-15'
  // }
};
```

---

## 💬 Communication Service

### Overview
Real-time team communication with channels, messaging, announcements, meeting notes, and file sharing.

### Import
```typescript
import { communicationService } from '@/services/api';
// or
import communication from '@/services/api/communication.service';
```

### Types

#### ChannelType
```typescript
'PROJECT' | 'TEAM' | 'DIRECT' | 'ANNOUNCEMENT'
```

#### MemberRole
```typescript
'ADMIN' | 'MODERATOR' | 'MEMBER'
```

#### Channel
```typescript
interface Channel {
  id: number;
  projectId?: number;
  type: ChannelType;
  name: string;
  description?: string;
  avatar?: string;
  isPrivate: boolean;
  memberCount: number;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  createdBy: number;
  createdAt: string;
}
```

#### Message
```typescript
interface Message {
  id: number;
  channelId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyToId?: number;
  replyTo?: Message;
  mentions: number[];
  reactions: Array<{
    emoji: string;
    count: number;
    userIds: number[];
  }>;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Usage Examples

#### Create Channel
```typescript
const createChannel = async (projectId: number) => {
  const result = await communicationService.createChannel({
    projectId,
    type: 'TEAM',
    name: 'Construction Team A',
    description: 'Main channel for Team A',
    isPrivate: false,
  });
  
  return result.data;
};
```

#### Send Message
```typescript
const sendMessage = async (channelId: number, content: string) => {
  const result = await communicationService.sendMessage({
    channelId,
    type: 'TEXT',
    content,
    mentions: [5, 12], // User IDs to mention
  });
  
  return result.data;
};
```

#### Send Message with Reply
```typescript
const replyToMessage = async (channelId: number, replyToId: number) => {
  const result = await communicationService.sendMessage({
    channelId,
    type: 'TEXT',
    content: 'Acknowledged!',
    replyToId,
  });
  
  return result.data;
};
```

#### Add Reaction
```typescript
const reactToMessage = async (messageId: number, emoji: string) => {
  await communicationService.addReaction(messageId, emoji);
  // emoji: '👍', '❤️', '😀', etc.
};
```

#### Get Messages
```typescript
const getMessages = async (channelId: number) => {
  const result = await communicationService.getMessages({
    channelId,
    limit: 50,
    before: '2024-03-15T10:00:00Z', // Load older messages
  });
  
  return result.data.items;
};
```

#### Create Announcement
```typescript
const createAnnouncement = async (projectId: number) => {
  const formData = new FormData();
  formData.append('projectId', projectId.toString());
  formData.append('title', 'Site Closure Notice');
  formData.append('content', 'Site will be closed for inspection tomorrow');
  formData.append('priority', 'HIGH');
  formData.append('targetAudience', 'ALL');
  formData.append('isPinned', 'true');
  
  // Optional attachments
  formData.append('attachments', file1);
  formData.append('attachments', file2);

  const result = await communicationService.createAnnouncement(formData);
  return result.data;
};
```

#### Create Meeting Note
```typescript
const createMeeting = async (projectId: number) => {
  const result = await communicationService.createMeetingNote({
    projectId,
    title: 'Weekly Progress Review',
    meetingDate: '2024-03-15T14:00:00Z',
    duration: 60, // minutes
    location: 'Site Office',
    attendees: [
      { userId: 1, status: 'PRESENT' },
      { userId: 2, status: 'PRESENT' },
      { userId: 3, status: 'ABSENT' },
    ],
    agenda: [
      'Review last week progress',
      'Discuss budget variance',
      'Safety incidents',
    ],
    notes: 'All teams on schedule. Minor budget adjustment needed.',
    decisions: [
      'Approved budget increase for materials',
      'Schedule safety training for next week',
    ],
    actionItems: [
      {
        description: 'Order additional materials',
        assignedTo: 5,
        dueDate: '2024-03-20',
        status: 'PENDING',
      },
      {
        description: 'Schedule safety training',
        assignedTo: 8,
        dueDate: '2024-03-22',
        status: 'PENDING',
      },
    ],
  });
  
  return result.data;
};
```

#### Upload File to Channel
```typescript
const uploadFile = async (projectId: number, channelId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', 'Latest blueprints');
  formData.append('tags', JSON.stringify(['blueprints', 'design']));

  const result = await communicationService.uploadFile(
    projectId,
    file,
    channelId,
    'Latest blueprints',
    ['blueprints', 'design']
  );
  
  return result.data;
};
```

#### Search Messages
```typescript
const searchMessages = async (channelId: number, query: string) => {
  const result = await communicationService.searchMessages(channelId, query);
  return result.data.items;
};
```

---

## 🔔 Notification Service

### Overview
Smart notification system with multiple channels (in-app, email, SMS, push), preferences, rules, templates, and daily digest.

### Import
```typescript
import { notificationService } from '@/services/api';
// or
import notification from '@/services/api/notification.service';
```

### Types

#### NotificationType
```typescript
'TASK_DEADLINE' | 'INSPECTION_DUE' | 'MATERIAL_LOW_STOCK' 
| 'MATERIAL_REQUEST' | 'SAFETY_ALERT' | 'SAFETY_INCIDENT' 
| 'DOCUMENT_APPROVAL' | 'BUDGET_ALERT' | 'PAYMENT_DUE' 
| 'MEETING_REMINDER' | 'MILESTONE_COMPLETE' | 'PROJECT_UPDATE' 
| 'TEAM_MENTION' | 'SYSTEM'
```

#### NotificationPriority
```typescript
'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
```

#### NotificationChannel
```typescript
'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'
```

#### Notification
```typescript
interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}
```

### Usage Examples

#### Get Notifications
```typescript
const getNotifications = async (userId: number) => {
  const result = await notificationService.getNotifications({
    userId,
    isRead: false,
    priority: 'HIGH',
    page: 1,
    limit: 20,
  });
  
  return result.data.items;
};
```

#### Get Unread Count
```typescript
const getUnreadCount = async (userId: number) => {
  const result = await notificationService.getUnreadCount(userId);
  
  console.log(result.data);
  // {
  //   count: 5,
  //   byType: {
  //     TASK_DEADLINE: 2,
  //     SAFETY_ALERT: 1,
  //     MATERIAL_LOW_STOCK: 2
  //   }
  // }
};
```

#### Send Custom Notification
```typescript
const sendNotification = async (userId: number) => {
  const result = await notificationService.sendNotification({
    userId,
    type: 'PROJECT_UPDATE',
    priority: 'NORMAL',
    title: 'Project Milestone Reached',
    message: 'Foundation phase completed successfully',
    data: { projectId: 1, phase: 'FOUNDATION' },
    actionUrl: '/projects/1',
    channels: ['IN_APP', 'EMAIL', 'PUSH'],
  });
  
  return result.data;
};
```

#### Send Bulk Notifications
```typescript
const sendBulkNotification = async (userIds: number[]) => {
  await notificationService.sendBulkNotifications({
    userIds,
    type: 'SAFETY_ALERT',
    priority: 'URGENT',
    title: 'Emergency Safety Alert',
    message: 'All workers must evacuate to assembly point',
    channels: ['IN_APP', 'PUSH', 'SMS'],
  });
};
```

#### Smart Notifications

##### Task Deadline
```typescript
const notifyTaskDeadline = async (taskId: number, daysUntil: number) => {
  await notificationService.notifyTaskDeadline(taskId, daysUntil);
  // Auto-sends to assigned user with priority based on days until due
};
```

##### Low Stock Alert
```typescript
const notifyLowStock = async (materialId: number) => {
  await notificationService.notifyLowStock(materialId, 5, 10);
  // Current: 5 units, Minimum: 10 units
};
```

##### Safety Alert
```typescript
const notifySafetyAlert = async (projectId: number) => {
  await notificationService.notifySafetyAlert(
    projectId,
    'HAZARD_DETECTED',
    'Unsafe scaffolding detected in Zone B',
    'URGENT'
  );
};
```

##### Budget Alert
```typescript
const notifyBudgetAlert = async (budgetId: number) => {
  await notificationService.notifyBudgetAlert(
    budgetId,
    'THRESHOLD', // 'OVERSPEND' | 'THRESHOLD' | 'FORECAST'
    95000, // current spend
    100000 // threshold
  );
};
```

##### Meeting Reminder
```typescript
const notifyMeetingReminder = async (meetingId: number) => {
  await notificationService.notifyMeetingReminder(
    meetingId,
    'Weekly Progress Review',
    '2024-03-15T14:00:00Z',
    15 // 15 minutes until meeting
  );
};
```

#### Notification Preferences

##### Get Preferences
```typescript
const getPreferences = async (userId: number) => {
  const result = await notificationService.getPreferences(userId);
  
  console.log(result.data);
  // {
  //   userId: 1,
  //   enableInApp: true,
  //   enableEmail: true,
  //   enableSms: false,
  //   enablePush: true,
  //   dailyDigest: true,
  //   digestTime: '08:00',
  //   channels: [ ... ]
  // }
};
```

##### Update Preferences
```typescript
const updatePreferences = async (userId: number) => {
  await notificationService.updatePreferences(userId, {
    enablePush: true,
    dailyDigest: true,
    digestTime: '09:00',
  });
};
```

##### Update Channel Preferences for Type
```typescript
const updateChannelPrefs = async (userId: number) => {
  await notificationService.updateChannelPreferences(
    userId,
    'SAFETY_ALERT',
    {
      inApp: true,
      email: true,
      sms: true,
      push: true,
      priority: 'URGENT',
    }
  );
};
```

#### Notification Rules

##### Create Rule
```typescript
const createRule = async (projectId: number) => {
  const result = await notificationService.createRule({
    projectId,
    type: 'MATERIAL_LOW_STOCK',
    condition: {
      field: 'stock_level',
      operator: 'LESS_THAN',
      value: 10,
    },
    channels: ['IN_APP', 'EMAIL'],
    recipients: [1, 2, 3], // User IDs
  });
  
  return result.data;
};
```

##### Get Rules
```typescript
const getRules = async (projectId: number) => {
  const result = await notificationService.getRules(projectId);
  return result.data;
};
```

##### Toggle Rule
```typescript
const toggleRule = async (ruleId: number, isActive: boolean) => {
  await notificationService.toggleRule(ruleId, isActive);
};
```

#### Daily Digest

##### Get Daily Digest
```typescript
const getDailyDigest = async (userId: number) => {
  const result = await notificationService.getDailyDigest(userId);
  
  console.log(result.data);
  // {
  //   userId: 1,
  //   date: '2024-03-15',
  //   summary: {
  //     totalNotifications: 12,
  //     byType: { ... },
  //     urgent: [ ... ],
  //     tasks: [ ... ],
  //     inspections: [ ... ],
  //     materials: [ ... ],
  //     safety: [ ... ]
  //   }
  // }
};
```

##### Schedule Daily Digest
```typescript
const scheduleDailyDigest = async (userId: number) => {
  await notificationService.scheduleDailyDigest(userId, '08:00');
};
```

#### Push Notifications

##### Register Device
```typescript
const registerDevice = async (userId: number, deviceToken: string) => {
  await notificationService.registerDevice(userId, deviceToken, 'ios');
  // platform: 'ios' | 'android'
};
```

##### Test Push
```typescript
const testPush = async (userId: number) => {
  await notificationService.testPushNotification(userId);
};
```

#### Analytics

##### Get Statistics
```typescript
const getStats = async (userId: number) => {
  const result = await notificationService.getStatistics(
    userId,
    '2024-03-01',
    '2024-03-31'
  );
  
  console.log(result.data);
  // {
  //   total: 45,
  //   read: 38,
  //   unread: 7,
  //   byType: { ... },
  //   byPriority: { ... },
  //   responseTime: 15.5 // minutes
  // }
};
```

##### Get Engagement Metrics
```typescript
const getEngagement = async (projectId: number) => {
  const result = await notificationService.getEngagementMetrics(projectId);
  
  console.log(result.data);
  // {
  //   totalSent: 500,
  //   totalRead: 432,
  //   readRate: 86.4,
  //   avgResponseTime: 12.3,
  //   byChannel: {
  //     IN_APP: { sent: 500, delivered: 500, read: 432 },
  //     EMAIL: { sent: 300, delivered: 295, read: 210 },
  //     PUSH: { sent: 450, delivered: 445, read: 380 }
  //   }
  // }
};
```

---

## 🔧 Service Configuration

All three services extend `BaseApiService` with different configurations:

### Photo Timeline
- **Retry:** 3 attempts, 1s → 10s exponential backoff
- **Cache:** 5 minutes TTL
- **Offline:** Enabled (mutations queued)

### Communication
- **Retry:** 2 attempts, 500ms → 5s exponential backoff
- **Cache:** 30 seconds (minimal for real-time)
- **Offline:** Enabled (messages queued)

### Notification
- **Retry:** 2 attempts, 500ms → 5s exponential backoff
- **Cache:** Disabled (real-time)
- **Offline:** Enabled (notifications queued)

---

## 🎯 Best Practices

### Photo Timeline
1. **Batch uploads** - Use `bulkUpload()` for multiple photos
2. **Tag consistently** - Use standardized tags across project
3. **GPS coordinates** - Include for outdoor photos
4. **Comparisons** - Create before/after groups regularly
5. **Annotations** - Use for defect tracking and quality control

### Communication
1. **Channel organization** - One channel per team/purpose
2. **@mentions** - Use for urgent messages requiring attention
3. **Reactions** - Quick acknowledgment without message clutter
4. **Meeting notes** - Document all meetings with action items
5. **File sharing** - Use for important documents vs. inline images

### Notification
1. **Preferences** - Allow users to customize notification types
2. **Priority** - Use URGENT sparingly (only true emergencies)
3. **Channels** - Match channel to urgency (SMS for urgent)
4. **Daily digest** - Enable for non-urgent updates
5. **Rules** - Set up automated alerts for critical thresholds

---

## 🚀 Integration Examples

### Complete Photo Timeline Flow
```typescript
// 1. Upload photos
const photos = await uploadMultiplePhotos(projectId, files);

// 2. Create comparison
const comparison = await photoTimelineService.createComparison({
  projectId,
  name: 'Foundation Progress',
  location: 'Building A',
  beforePhotoId: photos[0].id,
  afterPhotoId: photos[1].id,
});

// 3. Add annotation to defect photo
const annotation = await photoTimelineService.createAnnotation({
  photoId: photos[2].id,
  x: 50,
  y: 30,
  label: 'Crack',
  color: '#FF0000',
});

// 4. Get timeline
const timeline = await photoTimelineService.getTimeline({
  projectId,
  groupBy: 'week',
});
```

### Complete Communication Flow
```typescript
// 1. Create project channel
const channel = await communicationService.createChannel({
  projectId,
  type: 'TEAM',
  name: 'Team A - Construction',
  isPrivate: false,
});

// 2. Add team members
await communicationService.addMember(channel.id, userId1, 'ADMIN');
await communicationService.addMember(channel.id, userId2, 'MEMBER');

// 3. Send message with mention
const message = await communicationService.sendMessage({
  channelId: channel.id,
  type: 'TEXT',
  content: '@John Please review the latest blueprints',
  mentions: [userId1],
});

// 4. Create announcement
const announcement = await communicationService.createAnnouncement(
  new FormData() // with project details
);

// 5. Document meeting
const meeting = await communicationService.createMeetingNote({
  projectId,
  title: 'Weekly Review',
  // ... meeting details
});
```

### Complete Notification Flow
```typescript
// 1. Set up user preferences
await notificationService.updatePreferences(userId, {
  enablePush: true,
  dailyDigest: true,
  digestTime: '08:00',
});

// 2. Create notification rules
await notificationService.createRule({
  projectId,
  type: 'MATERIAL_LOW_STOCK',
  condition: { field: 'stock', operator: 'LESS_THAN', value: 10 },
  channels: ['IN_APP', 'EMAIL'],
  recipients: [userId],
});

// 3. Send smart notifications
await notificationService.notifyTaskDeadline(taskId, 2); // 2 days until due
await notificationService.notifyLowStock(materialId, 5, 10);

// 4. Get daily digest
const digest = await notificationService.getDailyDigest(userId);

// 5. Check unread
const unread = await notificationService.getUnreadCount(userId);
```

---

## 📊 Response Formats

All services return standardized responses:

### Success Response
```typescript
{
  data: T, // Your data
  success: true,
  message?: string
}
```

### Paginated Response
```typescript
{
  data: {
    items: T[],
    total: number,
    page: number,
    limit: number,
    hasMore: boolean
  },
  success: true
}
```

### Error Response
```typescript
{
  error: {
    message: string,
    code?: string,
    details?: any
  },
  success: false
}
```

---

## 🛠️ Offline Support

All mutations are queued when offline and synced when back online:

```typescript
// These are automatically queued when offline:
- photoTimelineService.uploadPhoto()
- photoTimelineService.updatePhoto()
- photoTimelineService.deletePhoto()
- communicationService.sendMessage()
- communicationService.createChannel()
- notificationService.sendNotification()
- notificationService.markAsRead()

// Check offline queue status
const status = await photoTimelineService.getOfflineQueueStatus();
console.log(`${status.pending} items pending sync`);
```

---

## 🎨 UI Integration Hints

### Photo Timeline Screen
```typescript
// components/PhotoTimelineScreen.tsx
- Grid view with filters (phase, category, date)
- Timeline view (day/week/month toggle)
- Comparison slider for before/after
- Annotation overlay on photo detail
- Bulk upload drag-and-drop
```

### Communication Screen
```typescript
// components/CommunicationScreen.tsx
- Channel list sidebar
- Message list with infinite scroll
- Message composer with @mention autocomplete
- Reaction picker
- File upload preview
- Meeting notes editor
```

### Notification Center
```typescript
// components/NotificationCenter.tsx
- Notification list grouped by priority
- Filter by type/priority/read status
- Quick actions (mark read, delete)
- Preferences modal
- Daily digest preview
```

---

## 📝 Next Steps

1. **Create UI Screens** - Build React Native screens for each service
2. **WebSocket Integration** - Real-time updates for communication
3. **Push Notification Setup** - Configure FCM/APNs
4. **Weather API Integration** - Fetch weather for photo metadata
5. **Analytics Dashboard** - Visualize notification engagement metrics

---

**Version:** 1.0.0  
**Last Updated:** March 2024  
**Services:** Photo Timeline, Communication, Notification
