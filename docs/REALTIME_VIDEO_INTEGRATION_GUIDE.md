# 🎥 Real-time Features & Video Calls Integration Guide

**Last Updated**: December 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Push Notifications](#push-notifications)
3. [Real-time Notifications](#real-time-notifications)
4. [Video Calls](#video-calls)
5. [API Integration](#api-integration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

This guide covers the implementation of real-time features in the baotienweb.cloud construction management app:

- **Push Notifications**: Native device notifications via Expo
- **Real-time Notifications**: WebSocket-based instant updates
- **Video Calls**: LiveKit-powered video conferencing

All features are fully integrated with the backend at `baotienweb.cloud`.

---

## 🔔 Push Notifications

### Architecture

```typescript
Device → Expo Push API → NotificationsContext → App UI
                              ↓
                         Badge Update
                              ↓
                      Navigation Routing
```

### Setup

**1. Install Dependencies** (✅ Already installed)
```bash
npm install expo-notifications
```

**2. Configure Permissions** (✅ Already configured in app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "...",
      "NSMicrophoneUsageDescription": "..."
    }
  },
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.POST_NOTIFICATIONS"
    ]
  }
}
```

### Usage

**Using NotificationsContext**:
```typescript
import { useNotifications } from '@/context/NotificationsContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {notifications.map(n => (
        <TouchableOpacity key={n.id} onPress={() => markAsRead(n.id)}>
          <Text>{n.title}</Text>
          <Text>{n.body}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

**Notification Types**:
- `task` → Routes to `/construction/tasks/[taskId]`
- `message` → Routes to `/messages/[roomId]`
- `project` → Routes to `/projects/[projectId]`
- `meeting` → Routes to `/meet/[meetingId]/room`
- `payment` → Routes to `/contracts/payments/[paymentId]`
- `document` → Routes to `/documents/[documentId]`

### Backend Integration

**Send Push Notification**:
```typescript
POST /notifications/send
{
  "userId": "user-123",
  "title": "New Task Assigned",
  "body": "You have been assigned to 'Build Foundation'",
  "data": {
    "type": "task",
    "taskId": "task-456"
  }
}
```

**Register Device Token**:
```typescript
POST /notifications/register-token
{
  "token": "ExponentPushToken[...]",
  "platform": "ios" | "android"
}
```

---

## 🔄 Real-time Notifications

### Architecture

```typescript
Backend → WebSocket (socket.io) → socketManager → NotificationsContext → UI
                                        ↓
                              'new_notification' event
                                        ↓
                           Instant UI update + Badge
```

### Setup

**1. WebSocket Connection** (✅ Automatic via NotificationsContext)
```typescript
// NotificationsContext handles this automatically
await socketManager.connect('notifications');
```

**2. Event Listeners** (✅ Already configured)
```typescript
socketManager.on('notifications', 'new_notification', (notification) => {
  // Add to notifications array
  // Update badge count
  // Show in-app alert
});

socketManager.on('notifications', 'notification_read', (notificationId) => {
  // Mark as read in UI
  // Update badge count
});
```

### Usage

**Notifications Screen** (✅ Already created at `/app/notifications/index.tsx`):
```typescript
import { router } from 'expo-router';

// Navigate to notifications screen
router.push('/notifications');
```

**Features**:
- ✅ Real-time notification arrival
- ✅ Mark as read/unread
- ✅ Bulk selection and delete
- ✅ Pull-to-refresh
- ✅ Empty state
- ✅ Offline indicator

### Backend Integration

**Emit Notification Event**:
```typescript
// NestJS backend example
@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  notifyUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('new_notification', notification);
  }

  markAsRead(userId: string, notificationId: string) {
    this.server.to(`user-${userId}`).emit('notification_read', notificationId);
  }
}
```

---

## 🎥 Video Calls

### Architecture

```typescript
Frontend → Backend (/video/token) → LiveKit Token
                                         ↓
                              LiveKit Room Connection
                                         ↓
                    VideoView Rendering + Media Controls
                                         ↓
                     Disconnect → Backend (/video/end)
```

### Setup

**1. Install Dependencies** (✅ Already installed)
```bash
npm install @livekit/react-native @livekit/react-native-webrtc
```

**2. Configure Permissions** (✅ Already configured)
- iOS: Camera + Microphone permissions
- Android: CAMERA + RECORD_AUDIO permissions

### Usage

**Start Video Call**:
```typescript
import { router } from 'expo-router';

// Start a new video call
const startVideoCall = (meetingId: string, participantName: string) => {
  router.push(`/meet/${meetingId}/room?participantName=${encodeURIComponent(participantName)}`);
};

// Example
startVideoCall('meeting-123', 'John Doe');
```

**Video Call Service** (Advanced Usage):
```typescript
import { videoCallService } from '@/services/videoCallService';

// Initialize call
const room = await videoCallService.initializeCall(
  {
    meetingId: 'meeting-123',
    participantName: 'John Doe',
    isCameraOn: true,
    isMicOn: true,
  },
  {
    onParticipantJoined: (participant) => {
      console.log('Participant joined:', participant.name);
    },
    onParticipantLeft: (participant) => {
      console.log('Participant left:', participant.name);
    },
  }
);

// Toggle camera
await videoCallService.toggleCamera();

// Toggle microphone
await videoCallService.toggleMicrophone();

// Switch camera (front/back)
await videoCallService.switchCamera();

// Get participants
const participants = videoCallService.getParticipants();

// Get call stats
const stats = videoCallService.getCallStats();
// { duration: 120, participantCount: 3, networkQuality: 'good' }

// Disconnect
await videoCallService.disconnect();
```

### Backend Integration

**Generate LiveKit Token** (Required):
```typescript
POST /video/token
{
  "meetingId": "meeting-123",
  "participantName": "John Doe"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "url": "wss://livekit.example.com",
  "roomName": "meeting-123",
  "participantIdentity": "john-doe-456"
}
```

**NestJS Backend Example**:
```typescript
import { AccessToken } from 'livekit-server-sdk';

@Controller('video')
export class VideoController {
  @Post('token')
  async getToken(@Body() body: { meetingId: string; participantName: string }) {
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: body.participantName,
        name: body.participantName,
      }
    );

    token.addGrant({
      roomJoin: true,
      room: body.meetingId,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      token: token.toJwt(),
      url: process.env.LIVEKIT_URL,
      roomName: body.meetingId,
      participantIdentity: body.participantName,
    };
  }

  @Post('end')
  async endCall(@Body() body: { duration: number }) {
    // Save call history to database
    return { success: true };
  }
}
```

**Environment Variables Required**:
```env
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_URL=wss://your-livekit-server.com
```

### UI Features

**Video Call Room Screen** (`/meet/[meetingId]/room`):
- ✅ Participant video grid (1x1 or 2x2 adaptive layout)
- ✅ Camera on/off toggle
- ✅ Microphone on/off toggle
- ✅ Speaker on/off toggle
- ✅ Front/back camera switch
- ✅ End call button
- ✅ Call duration timer
- ✅ Participant count display
- ✅ Network quality indicator
- ✅ Avatar placeholder when camera off
- ✅ Muted indicator badge
- ✅ Loading state
- ✅ Error state with retry

---

## 🔌 API Integration

### Base Configuration

**Backend**: `https://baotienweb.cloud/api/v1`  
**WebSocket**: `wss://baotienweb.cloud`

### Notification Endpoints

```typescript
// Get all notifications
GET /notifications
Response: Notification[]

// Mark notification as read
PUT /notifications/:id/read
Response: { success: boolean }

// Mark all as read
PUT /notifications/mark-all-read
Response: { success: boolean }

// Delete notification
DELETE /notifications/:id
Response: { success: boolean }

// Clear all notifications
DELETE /notifications/clear-all
Response: { success: boolean }
```

### Video Call Endpoints

```typescript
// Get LiveKit access token
POST /video/token
Body: { meetingId: string, participantName: string }
Response: { token: string, url: string, roomName: string }

// Notify call ended
POST /video/end
Body: { duration: number }
Response: { success: boolean }

// Get meeting details
GET /meetings/:id
Response: Meeting

// Schedule new meeting
POST /meetings
Body: { title: string, startTime: Date, participants: string[] }
Response: Meeting
```

### WebSocket Events

**Notifications Namespace** (`/notifications`):
```typescript
// Client → Server
emit('join_room', userId);
emit('mark_read', notificationId);

// Server → Client
on('new_notification', (notification) => { /* ... */ });
on('notification_read', (notificationId) => { /* ... */ });
```

---

## 🧪 Testing

### Notifications Testing

**1. Test Push Notifications** (Requires physical device):
```typescript
// Send test notification from backend
POST /notifications/send
{
  "userId": "test-user",
  "title": "Test Notification",
  "body": "This is a test",
  "data": { "type": "task", "taskId": "123" }
}
```

**2. Test Real-time Updates**:
```typescript
// Open app on two devices/simulators
// Send notification from backend
// Verify both devices receive instantly
```

**3. Test Navigation**:
```typescript
// Send notification with type='task'
// Tap notification
// Verify routes to /construction/tasks/[taskId]
```

### Video Call Testing

**1. Test Single User**:
```bash
# Join call on one device
# Verify camera/mic controls work
# Verify call stats display
```

**2. Test Multiple Participants**:
```bash
# Join call on 2-4 devices
# Verify all participants appear in grid
# Verify video/audio transmission
# Verify participant leave updates grid
```

**3. Test Network Interruption**:
```bash
# Join call
# Toggle airplane mode
# Verify auto-reconnect works
```

---

## 🔧 Troubleshooting

### Notifications Issues

**Problem**: Push notifications not received
**Solution**:
- Verify device token registered: Check backend logs
- Check Expo push permissions: Settings → App → Notifications
- Test on physical device (not simulator for iOS)

**Problem**: Badge count not updating
**Solution**:
- Verify `setBadgeCount()` called in NotificationsContext
- Check iOS permissions: Settings → App → Badges

**Problem**: Notification tap not routing
**Solution**:
- Verify notification `data.type` matches expected values
- Check NotificationsContext `handleNotificationTap()` logic
- Verify route exists (e.g., `/construction/tasks/[id]`)

### Video Call Issues

**Problem**: Failed to join call
**Solution**:
- Verify backend `/video/token` endpoint returns valid token
- Check LiveKit server URL and credentials
- Test network connectivity

**Problem**: No video/audio
**Solution**:
- Check camera/microphone permissions: Settings → App
- Verify tracks published: Check `videoCallService.enableCamera()`
- Test device camera/mic in other apps

**Problem**: Poor video quality
**Solution**:
- Check network bandwidth: Requires 1+ Mbps per participant
- Verify LiveKit server settings (bitrate, resolution)
- Test on better network connection

**Problem**: Audio echo
**Solution**:
- Enable AEC (Acoustic Echo Cancellation) on LiveKit server
- Use headphones during call
- Adjust microphone sensitivity

---

## 📚 Additional Resources

### Documentation
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [LiveKit React Native SDK](https://docs.livekit.io/client-sdk/react-native/)
- [socket.io Documentation](https://socket.io/docs/v4/)

### Example Code
- Notifications: [`app/notifications/index.tsx`](../app/notifications/index.tsx)
- Video Call: [`app/meet/[meetingId]/room.tsx`](../app/meet/%5BmeetingId%5D/room.tsx)
- Video Service: [`services/videoCallService.ts`](../services/videoCallService.ts)
- Example Usage: [`components/examples/VideoCallExample.tsx`](../components/examples/VideoCallExample.tsx)

### Backend Integration
- NestJS: [GitHub - nestjs/nest](https://github.com/nestjs/nest)
- LiveKit Server SDK: [npm - livekit-server-sdk](https://www.npmjs.com/package/livekit-server-sdk)
- Socket.io NestJS: [@nestjs/platform-socket.io](https://docs.nestjs.com/websockets/gateways)

---

## 🤝 Contributing

When adding new notification types:

1. **Add type to NotificationsContext**:
```typescript
type NotificationType = 'task' | 'message' | 'project' | 'meeting' | 'your-new-type';
```

2. **Add navigation routing**:
```typescript
case 'your-new-type':
  router.push(`/your-route/${data.yourId}`);
  break;
```

3. **Add icon mapping** (in notifications screen):
```typescript
case 'your-new-type':
  return 'your-icon-name';
```

4. **Update backend** to emit new notification type

---

**End of Documentation**  
*For support, contact: GitHub Copilot or backend team*  
*Last Updated: December 2025*
