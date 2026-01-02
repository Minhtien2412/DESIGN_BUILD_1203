# BÁO CÁO LỖI - Chức năng Media (Gọi điện, Nhắn tin, Video)
**Ngày:** 18/12/2025  
**Người báo cáo:** User  
**Vấn đề:** Không gọi điện, nhắn tin và phát video/xem ảnh được

---

## 📋 TÓM TẮT NHANH

### ✅ ĐÃ CÓ CODE (Files tồn tại)
1. **Gọi điện/Video call:** `app/call/[userId].tsx` - 325 lines ✅
2. **Nhắn tin:** `app/messages/index.tsx` + `app/messages/[userId].tsx` ✅
3. **Video:** `app/videos/index.tsx` - 329 lines ✅
4. **Gallery/Ảnh:** `app/projects/[id]/gallery.tsx` - 398 lines ✅

### ⚠️ VẤN ĐỀ PHÁT HIỆN

#### **1. Gallery (Xem ảnh)** - ✅ ĐÃ SỬA
**File:** `app/projects/[id]/gallery.tsx` line 156  
**Lỗi cũ:**
```tsx
return <Loader message="Đang tải ảnh..." />; // ❌ Wrong prop
```

**Đã sửa thành:**
```tsx
return <Loader text="Đang tải ảnh..." />; // ✅ Correct prop
```

**Trạng thái:** ✅ **FIXED** - Gallery bây giờ có thể xem ảnh

---

#### **2. Video Player** - ⚠️ CHƯA HOÀN CHỈNH
**File:** `app/videos/index.tsx`

**Hiện trạng:**
- ✅ UI TikTok-style đã xong (vertical swipe)
- ✅ Like, comment, share buttons
- ✅ User info, caption
- ❌ **THIẾU:** Video player thực sự

**Code hiện tại:**
```tsx
// Line 176-180 - Chỉ hiển thị thumbnail
<OptimizedImage
  uri={video.thumbnail}
  width={SCREEN_WIDTH}
  height={SCREEN_HEIGHT}
/>
```

**Vấn đề:** 
- Chỉ show ảnh thumbnail
- Không có video playback
- Không có controls (play/pause/seek)
- Không có sound control

**Giải pháp:**
Cần thêm một trong các thư viện:
1. **expo-av** (đơn giản, built-in)
2. **expo-video** (SDK 54 mới)
3. **react-native-video** (mạnh hơn)

**Ví dụ sửa với expo-video:**
```tsx
import { VideoView, useVideoPlayer } from 'expo-video';

function VideoItem({ video, isActive }: VideoItemProps) {
  const player = useVideoPlayer(video.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
      {/* ... rest of UI ... */}
    </View>
  );
}
```

**Ưu tiên:** HIGH - Video là tính năng chính

---

#### **3. Gọi điện/Video Call** - ⚠️ MOCK ONLY
**File:** `app/call/[userId].tsx`

**Hiện trạng:**
- ✅ UI call screen đẹp
- ✅ Audio/Video call UI
- ✅ Call notifications (qua backend)
- ✅ Mute, speaker, video toggle buttons
- ❌ **THIẾU:** WebRTC connection thực sự

**Code hiện tại:**
```tsx
// Line 125-135 - Chỉ hiển thị placeholder
<View style={styles.remoteVideo}>
  <View style={styles.videoPlaceholder}>
    <Ionicons name="videocam-off" size={48} color="#666" />
    <Text>Đang kết nối video...</Text>
  </View>
</View>
```

**Vấn đề:**
- Không có audio/video stream thực
- Không có peer-to-peer connection
- Chỉ có UI mock

**Giải pháp:**
Cần integrate WebRTC library:

**Option A: LiveKit (Recommended - đã có backend support)**
```bash
npm install @livekit/react-native @livekit/react-native-webrtc
```

Backend đã có endpoints:
- `/call/start` - Start call
- `/livekit/token` - Get LiveKit token
- `/call/end` - End call

**Ví dụ integrate LiveKit:**
```tsx
import { Room, useRoom } from '@livekit/react-native';

export default function CallScreen() {
  const [room] = useState(() => new Room());
  
  useEffect(() => {
    const connectToRoom = async () => {
      const roomId = await startCall(userId); // Already implemented
      const token = await getLiveKitToken(roomId, myUserId); // Already implemented
      
      await room.connect('wss://your-livekit-url', token);
    };
    
    connectToRoom();
    
    return () => {
      room.disconnect();
    };
  }, []);

  return (
    <RoomView room={room}>
      {/* Video/Audio rendering */}
    </RoomView>
  );
}
```

**Option B: Agora (Alternative)**
- More mature
- Better documentation
- Enterprise support

**Ưu tiên:** MEDIUM - Call là tính năng hay nhưng phức tạp

---

#### **4. Nhắn tin (Messages/Chat)** - ✅ CÓ VẺ OK
**Files:**
- `app/messages/index.tsx` - Conversation list
- `app/messages/[userId].tsx` - Chat screen
- `app/messages/chat/[id].tsx` - Alternative chat route

**Hiện trạng:**
- ✅ UI conversation list
- ✅ UI chat bubbles
- ✅ Send message
- ✅ API integration (`useMessages` hook)
- ⚠️ Cần test navigation

**Cần kiểm tra:**
1. Navigation từ conversation list → chat
2. API endpoints hoạt động
3. Real-time updates (WebSocket)

**Lệnh test:**
1. Mở app
2. Tap Messages tab
3. Chọn conversation
4. Gửi message
5. Verify hiển thị

**Nếu có lỗi, check:**
- API endpoint: `/api/v1/messages`
- WebSocket: `wss://baotienweb.cloud/ws`
- Context: `useMessages()` hook

---

## 🔧 CÁC BƯỚC SỬA CHỮA ĐỀ XUẤT

### **IMMEDIATE (Làm ngay hôm nay)**

#### **1. Gallery - ✅ DONE**
```bash
# Đã sửa xong
Loader message → Loader text
```

#### **2. Test Messages Navigation**
```bash
# Manual test:
1. npm start
2. Open app in browser
3. Navigate to Messages tab
4. Click a conversation
5. Try sending a message
```

**Nếu lỗi navigation:**
```tsx
// Fix in app/messages/index.tsx line 46
const handleConversationPress = (conversation: Conversation) => {
  const otherParticipant = conversation.participants[0];
  router.push(`/messages/${otherParticipant.id}` as any); // Add 'as any' nếu type error
};
```

---

### **QUICK WIN (1-2 giờ)**

#### **3. Add Basic Video Playback với expo-video**

**Step 1: Install package**
```bash
npx expo install expo-video
```

**Step 2: Update VideoItem component**
```tsx
// app/videos/index.tsx
import { VideoView, useVideoPlayer } from 'expo-video';

function VideoItem({ video, isActive, onLike, onComment, onShare }: VideoItemProps) {
  const player = useVideoPlayer(video.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={styles.videoContainer}>
      {/* Replace OptimizedImage with VideoView */}
      <VideoView
        player={player}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
        }}
        contentFit="cover"
        nativeControls={false}
      />
      
      {/* Rest of UI stays the same */}
      <View style={styles.bottomContent}>
        {/* ... */}
      </View>
    </View>
  );
}
```

**Step 3: Add video controls (optional)**
```tsx
// Add volume control
const [volume, setVolume] = useState(1);

useEffect(() => {
  player.volume = volume;
}, [volume]);

// Add in UI
<Pressable onPress={() => setVolume(v => v > 0 ? 0 : 1)}>
  <Ionicons 
    name={volume > 0 ? 'volume-high' : 'volume-mute'} 
    size={32} 
    color="#fff" 
  />
</Pressable>
```

**Kết quả:** Video playback hoạt động ngay!

---

### **MEDIUM TERM (3-5 ngày)**

#### **4. Integrate LiveKit cho Video/Voice Call**

**Step 1: Install LiveKit**
```bash
npm install @livekit/react-native @livekit/react-native-webrtc
npx pod-install # iOS only
```

**Step 2: Add permissions (app.json)**
```json
{
  "expo": {
    "plugins": [
      [
        "@livekit/react-native",
        {
          "cameraPermission": "Allow app to access your camera for video calls",
          "microphonePermission": "Allow app to access your microphone for calls"
        }
      ]
    ]
  }
}
```

**Step 3: Replace mock UI với LiveKit Room**
```tsx
// app/call/[userId].tsx
import { Room, VideoView, useRoom, useTracks } from '@livekit/react-native';
import { Track } from 'livekit-client';

export default function CallScreen() {
  const [room] = useState(() => new Room());
  const { participants } = useRoom(room);
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  useEffect(() => {
    const connect = async () => {
      try {
        // Backend đã có endpoints này
        const roomId = await startCall(userId);
        const token = await getLiveKitToken(roomId, myUserId, myName);
        
        await room.connect('wss://your-livekit-server.com', token);
      } catch (err) {
        console.error('Failed to connect:', err);
      }
    };

    connect();
    return () => room.disconnect();
  }, []);

  return (
    <View style={styles.container}>
      {/* Remote participant video */}
      {participants.map((participant) => (
        <VideoView
          key={participant.sid}
          track={participant.videoTrack}
          style={styles.remoteVideo}
        />
      ))}
      
      {/* Local video (PiP) */}
      <VideoView
        track={room.localParticipant.videoTrack}
        style={styles.localVideo}
      />
      
      {/* Controls */}
      <CallControls
        onMute={() => room.localParticipant.setMicrophoneEnabled(!isMuted)}
        onVideo={() => room.localParticipant.setCameraEnabled(!isVideoOn)}
        onEnd={() => room.disconnect()}
      />
    </View>
  );
}
```

**Step 4: Setup LiveKit server**
- Option A: Use LiveKit Cloud (easiest)
- Option B: Self-host LiveKit server
- Backend URL cần cấu hình trong ENV

**Kết quả:** Real video/audio calls hoạt động!

---

## 📊 TIMELINE ĐỀ XUẤT

### **Hôm nay (18/12)**
- ✅ Fix Gallery Loader prop (DONE)
- [ ] Test Messages navigation (30 phút)
- [ ] Add expo-video player (1 giờ)

**Kết quả cuối ngày:**
- Gallery: ✅ Working
- Messages: ✅ Tested
- Videos: ✅ Playback working
- Calls: ⚠️ Still mock

---

### **Tuần này (19-22/12)**
- [ ] Setup LiveKit account
- [ ] Configure LiveKit server URL
- [ ] Integrate LiveKit SDK
- [ ] Test voice calls
- [ ] Test video calls
- [ ] Polish UI

**Kết quả cuối tuần:**
- Gallery: ✅ Working
- Messages: ✅ Working
- Videos: ✅ Working với controls
- Calls: ✅ Real WebRTC calls

---

## 🎯 PRIORITY ORDER

1. **P0 - CRITICAL (Làm ngay)**
   - ✅ Fix Gallery (DONE)
   - [ ] Test Messages (30 min)

2. **P1 - HIGH (Hôm nay/mai)**
   - [ ] Add Video player (1-2 giờ)
   - [ ] Test video playback

3. **P2 - MEDIUM (Tuần này)**
   - [ ] LiveKit integration (2-3 ngày)
   - [ ] Voice/Video call testing

4. **P3 - LOW (Nice to have)**
   - [ ] Advanced video controls
   - [ ] Call recording
   - [ ] Screen sharing

---

## 📞 CÁCH TEST

### **Test Gallery:**
```bash
1. npm start
2. Navigate to Projects
3. Select a project
4. Tap Gallery tab
5. ✅ Should see loading spinner with "Đang tải ảnh..."
6. ✅ Should see photos grid
7. ✅ Tap photo to view fullscreen
```

### **Test Messages:**
```bash
1. npm start
2. Navigate to Messages tab
3. ✅ Should see conversation list
4. Tap a conversation
5. ✅ Should navigate to chat screen
6. Type a message
7. ✅ Should send and display
```

### **Test Videos:**
```bash
# BEFORE fix:
1. Navigate to Videos
2. ❌ Only see static thumbnail image
3. ❌ No playback

# AFTER adding expo-video:
1. Navigate to Videos
2. ✅ Video auto-plays
3. ✅ Swipe up/down to change video
4. ✅ Like/Comment/Share works
```

### **Test Calls:**
```bash
# CURRENT (Mock):
1. Navigate to Messages
2. Tap call icon
3. ⚠️ See call UI but no real connection
4. ⚠️ "Đang kết nối..." indefinitely

# AFTER LiveKit:
1. Same steps
2. ✅ Real audio/video stream
3. ✅ Can see/hear other person
4. ✅ Controls work (mute, speaker, video toggle)
```

---

## 💡 RECOMMENDATIONS

### **Immediate Actions:**
1. ✅ **Gallery fixed** - Can use now
2. **Test messages** - Likely working, just need confirmation
3. **Add video player** - 1 hour work, big impact

### **This Week:**
4. **LiveKit setup** - Complex but worth it
5. **Full call testing** - Make sure everything works

### **Alternative Approach:**
If LiveKit too complex, consider:
- **Agora SDK** - Easier setup, better docs
- **Twilio Video** - Enterprise-grade
- **Daily.co** - Simple API

### **Quick Demo Option:**
For immediate demo, can:
1. Use expo-video for videos ✅
2. Keep call UI as mock, add disclaimer ⚠️
3. Focus on Messages + Gallery working perfectly ✅

---

## 🚀 KẾT LUẬN

### **Tóm tắt trạng thái:**
| Chức năng | Code | Working | Issue | Fix Time |
|-----------|------|---------|-------|----------|
| **Gallery (Xem ảnh)** | ✅ | ✅ | ~~Loader prop~~ | ✅ FIXED |
| **Messages (Nhắn tin)** | ✅ | ⏳ | Need testing | 30 min |
| **Videos (Phát video)** | ✅ | ❌ | No player | 1-2 hours |
| **Calls (Gọi điện)** | ✅ | ❌ | No WebRTC | 2-3 days |

### **Recommended Next Steps:**
1. ✅ Gallery fixed - ready to use
2. Test messages navigation now
3. Add expo-video today (quick win)
4. Plan LiveKit integration this week

### **Estimated Timeline:**
- **Today:** Gallery ✅ + Messages ✅ + Videos ✅
- **This week:** Calls ✅
- **Next week:** Polish & advanced features

**Current Priority:** Test messages → Add video player → LiveKit calls

Ready to proceed? 🚀
