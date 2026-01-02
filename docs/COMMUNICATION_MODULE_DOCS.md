# Communication Module - Modern Open Source Integration

## Tổng quan

Module communication mới được thiết kế để cung cấp giải pháp giao tiếp thời gian thực hoàn chỉnh cho ứng dụng, bao gồm:

- **Cuộc gọi video/audio** (WebRTC)
- **Tin nhắn real-time** (WebSocket)
- **Live streaming** (HLS/RTMP)
- **Media utilities** (Recording, Upload, Camera)

## Cấu trúc Module

```
lib/communication/
├── index.ts          # Entry point, exports & config
├── types.ts          # TypeScript definitions
├── webrtc.ts         # WebRTC Manager
├── socket.ts         # Socket Manager
└── media.ts          # Media utilities

hooks/
├── useRealTimeCommunication.ts  # Main hook
└── useCommunication.ts          # Legacy hook (existing)
```

## Cài đặt Dependencies

```bash
npx expo install expo-av expo-file-system expo-image-picker expo-image-manipulator expo-video-thumbnails
```

## Sử dụng cơ bản

### 1. Import Module

```typescript
import {
  // Managers
  getWebRTCManager,
  getSocketManager,
  getAudioManager,
  
  // Types
  Call,
  CallType,
  Message,
  Conversation,
  
  // Utils
  uploadFile,
  takePhoto,
  recordVideo,
} from '@/lib/communication';
```

### 2. Hook Integration

```typescript
import { useRealTimeCommunication } from '@/hooks/useRealTimeCommunication';

function CommunicationScreen() {
  const {
    // Connection
    isConnected,
    connectSocket,
    disconnectSocket,
    
    // Call
    activeCall,
    incomingCall,
    localStream,
    remoteStream,
    initiateCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleVideo,
    
    // Chat
    messages,
    sendMessage,
    startTyping,
    stopTyping,
  } = useRealTimeCommunication({
    autoConnectSocket: true,
    userId: 'user123',
    token: 'auth-token',
    onIncomingCall: (call) => {
      console.log('Incoming call:', call);
    },
    onNewMessage: (message) => {
      console.log('New message:', message);
    },
  });

  return (
    // ... UI implementation
  );
}
```

## API Reference

### WebRTCManager

```typescript
const webrtc = getWebRTCManager();

// Start local media
await webrtc.startLocalStream(withVideo: boolean);

// Create peer connection
await webrtc.createPeerConnection();

// Create offer (caller)
const offer = await webrtc.createOffer();

// Create answer (callee)
const answer = await webrtc.createAnswer();

// Set remote description
await webrtc.setRemoteDescription(sdp);

// Add ICE candidate
await webrtc.addIceCandidate(candidate);

// Toggle audio/video
webrtc.toggleAudio(enabled);
webrtc.toggleVideo(enabled);

// Switch camera
await webrtc.switchCamera();

// End call
webrtc.hangup();
```

### SocketManager

```typescript
const socket = getSocketManager();

// Connect with auth
socket.connect({ userId: 'user123', token: 'token' });

// Disconnect
socket.disconnect();

// Join/leave room
socket.joinRoom('room-id');
socket.leaveRoom('room-id');

// Chat
socket.sendMessage('conv-id', 'Hello!', 'text');
socket.markAsRead('conv-id', 'msg-id');
socket.startTyping('conv-id');
socket.stopTyping('conv-id');

// Call signaling
socket.initiateCall('callee-id', 'video');
socket.acceptCall('call-id');
socket.rejectCall('call-id', 'busy');
socket.endCall('call-id');

// Event listeners
const unsubscribe = socket.on('message:new', (msg) => {
  console.log(msg);
});
unsubscribe(); // Cleanup
```

### AudioManager

```typescript
const audio = getAudioManager();

// Recording
await audio.startRecording({
  onProgress: (duration) => console.log(duration),
  maxDuration: 60,
});
const uri = await audio.stopRecording();

// Playback
await audio.playAudio(uri, () => console.log('Finished'));
await audio.stopPlayback();
```

### Media Utilities

```typescript
import {
  takePhoto,
  recordVideo,
  pickMedia,
  uploadFile,
  downloadFile,
  resizeImage,
  generateVideoThumbnail,
  formatFileSize,
  formatDuration,
} from '@/lib/communication';

// Camera
const photo = await takePhoto();
const video = await recordVideo();

// Media picker
const files = await pickMedia('images'); // 'images' | 'videos' | 'all'

// Upload with progress
const result = await uploadFile(uri, 'https://api.example.com/upload', {
  onProgress: ({ percent }) => console.log(`${percent}%`),
});

// Download
const localUri = await downloadFile(url, 'filename.jpg', {
  onProgress: ({ percent }) => console.log(`${percent}%`),
});

// Image processing
const resized = await resizeImage(uri, 800, 600, 0.8);
const thumbnail = await generateVideoThumbnail(videoUri, 1000); // 1s
```

## Types Reference

### Call Types

```typescript
interface Call {
  id: string;
  type: 'video' | 'audio';
  status: CallStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  participants: CallParticipant[];
  initiator: CommunicationUser;
  isGroup: boolean;
}

type CallStatus = 
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'failed'
  | 'busy'
  | 'missed';
```

### Message Types

```typescript
interface Message {
  id: string;
  conversationId: string;
  sender: CommunicationUser;
  content: string;
  type: MessageType;
  timestamp: string;
  status: MessageStatus;
  replyTo?: Message;
  reactions?: MessageReaction[];
  attachments?: Attachment[];
}

type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'location'
  | 'sticker'
  | 'system';
```

### Conversation Types

```typescript
interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  participants: CommunicationUser[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Feature Flags

```typescript
import { FEATURES } from '@/lib/communication';

// Check feature availability
if (FEATURES.VIDEO_CALL) {
  // Enable video call UI
}

if (FEATURES.SCREEN_SHARE) {
  // Show screen share button
}
```

## Configuration

```typescript
// lib/communication/index.ts
export const COMMUNICATION_CONFIG = {
  webrtc: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      // Add TURN server for production
    ],
  },
  socket: {
    url: 'wss://baotienweb.cloud',
    reconnectionAttempts: 5,
  },
  livekit: {
    url: 'wss://live.baotienweb.cloud',
  },
};
```

## Best Practices

### 1. Cleanup Resources

```typescript
useEffect(() => {
  const socket = getSocketManager();
  socket.connect({ userId, token });

  return () => {
    socket.disconnect();
    resetWebRTCManager();
    resetSocketManager();
  };
}, []);
```

### 2. Error Handling

```typescript
try {
  await initiateCall(targetUser, 'video');
} catch (error) {
  Alert.alert('Error', 'Could not start call');
}
```

### 3. Permission Handling

```typescript
// Media permissions are handled internally
// but you can check manually:
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

const [cameraPermission] = Camera.useCameraPermissions();
const [audioPermission] = Audio.usePermissions();
```

## Migration từ API cũ

### Trước (services/api/call.service.ts)

```typescript
import { callService } from '@/services/api/call.service';

// Start call
const call = await callService.startCall({
  userId: 'target-user',
  type: 'video',
});
```

### Sau (lib/communication)

```typescript
import { useRealTimeCommunication } from '@/hooks/useRealTimeCommunication';

const { initiateCall } = useRealTimeCommunication();

// Start call
await initiateCall(
  { id: 'target-user', name: 'Target User' },
  'video'
);
```

## Changelog

### v2.0.0 (2025-12-23)
- Tạo module communication mới
- Tích hợp WebRTC với full peer connection management
- Tích hợp Socket.IO với auto-reconnection
- Media utilities với expo-av, expo-file-system
- Hook useRealTimeCommunication mới
- TypeScript strict mode support

---

*Tài liệu được tạo tự động. Cập nhật: 23/12/2025*
