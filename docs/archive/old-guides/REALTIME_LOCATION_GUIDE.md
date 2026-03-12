# REAL-TIME LOCATION TRACKING - ZALO STYLE

## ✅ Tính Năng Đã Thêm

### 1. **useRealtimeLocation Hook** (`hooks/useRealtimeLocation.ts`)

**Chức năng:**
- ✅ Theo dõi vị trí liên tục (continuous tracking)
- ✅ Cập nhật mỗi 30 giây hoặc khi di chuyển 50m
- ✅ Phát hiện chuyển động (isMoving)
- ✅ Broadcast vị trí qua WebSocket
- ✅ Tự động tạm dừng khi app background
- ✅ Tối ưu pin (battery-efficient)

**API:**
```typescript
const {
  location,           // Vị trí hiện tại
  isTracking,         // Đang theo dõi?
  error,              // Lỗi
  startTracking,      // Bắt đầu theo dõi
  stopTracking,       // Dừng theo dõi
  updateNow,          // Cập nhật ngay
} = useRealtimeLocation({
  enabled: true,
  updateInterval: 30000,    // 30s
  distanceInterval: 50,     // 50m
  broadcastToServer: true,
});
```

### 2. **LocationStatusBar Component** (`components/ui/location-status-bar.tsx`)

**Giao diện giống Zalo:**
- Thanh chào hỏi với tên người dùng
- Hiển thị vị trí real-time
- Icon động khi đang di chuyển (pulse animation)
- Toggle switch để bật/tắt định vị
- Indicator "LIVE" khi đang tracking
- Loading state & error handling

**Props:**
```typescript
<LocationStatusBar 
  userName="Nguyễn Văn A"   // Tên hiển thị
  autoStart={false}          // Tự động bật?
  showToggle={true}          // Hiện nút bật/tắt?
/>
```

### 3. **WebSocket Integration**

**Broadcast location to server:**
```typescript
socket.emit('location:update', {
  latitude: 10.762622,
  longitude: 106.660172,
  address: "123 Nguyễn Văn Linh, Q7, TP.HCM",
  city: "TP. Hồ Chí Minh",
  isMoving: true,
  timestamp: 1702742400000
});
```

---

## 📱 Đã Tích Hợp Vào App

### Home Screen ([app/(tabs)/index.tsx](app/(tabs)/index.tsx))

```tsx
import { LocationStatusBar } from '@/components/ui/location-status-bar';

export default function HomeScreen() {
  const { user } = useAuth();
  
  return (
    <ScrollView>
      {/* Header */}
      <View>...</View>
      
      {/* Real-time Location Status Bar (Zalo-style) */}
      <LocationStatusBar 
        userName={user?.name || 'Bạn'} 
        autoStart={false}
        showToggle={true}
      />
      
      {/* Content */}
      <View>...</View>
    </ScrollView>
  );
}
```

---

## 🎨 UI/UX Features

### 1. **Greeting Bar**
```
╔═══════════════════════════════════════╗
║ Chào buổi sáng, Nguyễn Văn A          ║
║                                        ║
║ 🧭 TP. Hồ Chí Minh              [🔘]  ║
║    123 Nguyễn Văn Linh, Q7           ║
║                              LIVE 🟢   ║
╚═══════════════════════════════════════╝
```

### 2. **States**

**Chưa bật định vị:**
```
📍 Nhấn để bật định vị [  ]
```

**Đang lấy vị trí:**
```
⏳ Đang lấy vị trí... [◉ ]
```

**Đã có vị trí (đứng yên):**
```
📍 TP. Hồ Chí Minh [◉ ] LIVE
   123 Nguyễn Văn Linh, Q7
```

**Đang di chuyển:**
```
🚶 TP. Hồ Chí Minh [◉ ] LIVE (Pulse animation)
   Đang di chuyển trên Nguyễn Văn Linh
```

### 3. **Animations**
- ✅ Pulse animation cho icon khi đang di chuyển
- ✅ Toggle switch smooth transition
- ✅ Loading spinner khi đang fetch

---

## 🔧 Backend Integration (NestJS)

### 1. **WebSocket Gateway**

```typescript
// backend-nestjs/src/location/location.gateway.ts
import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway()
export class LocationGateway {
  @SubscribeMessage('location:update')
  handleLocationUpdate(
    @MessageBody() data: {
      latitude: number;
      longitude: number;
      address: string;
      city?: string;
      isMoving: boolean;
      timestamp: number;
    },
  ) {
    console.log('User location update:', data);
    
    // Lưu vào DB
    // Broadcast đến friends/contacts
    // Update user status
    
    return { success: true };
  }
}
```

### 2. **Database Schema**

```typescript
// backend-nestjs/src/users/entities/user-location.entity.ts
@Entity('user_locations')
export class UserLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: false })
  isMoving: boolean;

  @Column({ type: 'bigint' })
  timestamp: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. **Service Logic**

```typescript
// backend-nestjs/src/location/location.service.ts
async updateUserLocation(userId: string, locationData: UpdateLocationDto) {
  const location = this.locationRepository.create({
    user: { id: userId },
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address,
    city: locationData.city,
    isMoving: locationData.isMoving,
    timestamp: locationData.timestamp,
  });

  await this.locationRepository.save(location);

  // Broadcast to friends
  this.broadcastToFriends(userId, location);

  return location;
}

async getNearbyUsers(userId: string, radius: number = 5000) {
  // Find users within radius (meters)
  const userLocation = await this.getCurrentLocation(userId);
  
  const nearby = await this.locationRepository
    .createQueryBuilder('loc')
    .select('loc.*, (
      6371000 * acos(
        cos(radians(:lat)) * cos(radians(loc.latitude)) *
        cos(radians(loc.longitude) - radians(:lng)) +
        sin(radians(:lat)) * sin(radians(loc.latitude))
      )
    ) AS distance')
    .where('loc.userId != :userId')
    .andWhere('loc.createdAt > :since')
    .setParameters({
      lat: userLocation.latitude,
      lng: userLocation.longitude,
      userId,
      since: new Date(Date.now() - 3600000), // Last 1 hour
    })
    .having('distance < :radius', { radius })
    .orderBy('distance', 'ASC')
    .getRawMany();

  return nearby;
}
```

---

## 🧪 Testing

### 1. **Test Tracking**
```bash
npx expo start

# Mở app → Home screen → Nhấn toggle ON
# Cho phép quyền location
# Xem vị trí hiển thị trong status bar
```

### 2. **Test Movement Detection**
```bash
# Android Emulator:
# Extended Controls (⋮) → Location → Routes
# Tạo route và play → Xem icon pulse & "isMoving"

# iOS Simulator:
# Debug → Location → Freeway Drive
```

### 3. **Test WebSocket**
```bash
# Check browser console:
# Mở http://localhost:3001/socket.io/socket.io.js
# Xem socket connection & location events
```

---

## ⚙️ Configuration

### app.json / app.config.ts

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Ứng dụng cần truy cập vị trí để cập nhật trạng thái real-time như Zalo.",
        "NSLocationWhenInUseUsageDescription": "Ứng dụng cần truy cập vị trí để hiển thị vị trí hiện tại.",
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    }
  }
}
```

---

## 🔋 Battery Optimization

### Strategies Used:
1. **Balanced Accuracy** - Không dùng GPS liên tục
2. **Distance Interval** - Chỉ update khi di chuyển > 50m
3. **Time Interval** - Tối đa mỗi 30s
4. **App State Detection** - Pause tracking khi background
5. **Conditional Geocoding** - Chỉ geocode khi cần thiết

---

## 📊 Analytics & Features

### 1. **Location History**
```typescript
// Xem lịch sử vị trí user
const history = await locationService.getLocationHistory(userId, {
  from: '2025-12-01',
  to: '2025-12-16',
  limit: 100,
});
```

### 2. **Heatmap**
```typescript
// Tạo heatmap từ location data
const heatmap = await locationService.generateHeatmap(userId, {
  resolution: 'high',
  timeRange: '7d',
});
```

### 3. **Find Nearby Friends**
```typescript
// Tìm bạn bè gần đó
const nearby = await locationService.getNearbyFriends(userId, {
  radius: 5000, // 5km
  limit: 10,
});
```

---

## 🛡️ Privacy & Security

### 1. **User Consent**
- ✅ Toggle switch để bật/tắt
- ✅ Không tự động bật khi mở app
- ✅ Hiển thị indicator "LIVE" rõ ràng

### 2. **Data Protection**
- ✅ Chỉ broadcast khi user cho phép
- ✅ Encrypt location data qua HTTPS/WSS
- ✅ Auto-delete old location data (>30 days)

### 3. **Permissions**
```typescript
// Request permissions properly
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  // Show explanation dialog
}

const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
// Background is optional
```

---

## 🚀 Usage Examples

### Ví dụ 1: Bật tracking tự động khi vào trang
```tsx
<LocationStatusBar 
  userName={user.name} 
  autoStart={true}     // ← Tự động bật
  showToggle={false}   // Ẩn toggle
/>
```

### Ví dụ 2: Chỉ hiển thị vị trí, không cho tắt
```tsx
const { location } = useRealtimeLocation({ enabled: true });

return (
  <View>
    <Text>{formatLocationStatus(location)}</Text>
  </View>
);
```

### Ví dụ 3: Custom interval
```tsx
const { location } = useRealtimeLocation({
  enabled: true,
  updateInterval: 10000,   // 10s
  distanceInterval: 20,     // 20m (sensitive)
  accuracy: Location.Accuracy.High,
});
```

---

## 📄 Files Created/Modified

### New Files:
1. ✅ `hooks/useRealtimeLocation.ts` - Real-time tracking hook
2. ✅ `components/ui/location-status-bar.tsx` - Zalo-style status bar
3. ✅ `REALTIME_LOCATION_GUIDE.md` - This documentation

### Modified Files:
1. ✅ `app/(tabs)/index.tsx` - Added LocationStatusBar
2. ✅ `services/socket.ts` - Added getSocket() export

---

## 🎯 Next Steps (Optional)

### 1. **Friend Location Sharing**
```typescript
// Share location with specific friends
const shareLocation = async (friendIds: string[]) => {
  socket.emit('location:share', { friendIds, location });
};
```

### 2. **Geofencing**
```typescript
// Alert when entering/leaving area
await Location.startGeofencingAsync('HOME', [
  {
    latitude: 10.762622,
    longitude: 106.660172,
    radius: 100,
  },
]);
```

### 3. **Location-based Notifications**
```typescript
// Send notification when near project site
if (distanceToProject < 500) {
  showNotification('Bạn đang gần công trình ABC!');
}
```

---

## ❌ Troubleshooting

### Lỗi: "Location services disabled"
**Fix:** Bật GPS trong Settings → Location

### Lỗi: "Background permission denied"
**Fix:** Foreground vẫn hoạt động, chỉ mất tính năng background tracking

### Lỗi: "Socket not connected"
**Fix:** Kiểm tra ENV.WS_URL, đảm bảo backend đang chạy

### Lỗi: Battery drain
**Fix:** Tăng updateInterval lên 60000 (60s), giảm accuracy xuống Balanced

---

**Tài liệu tham khảo:**
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Socket.IO Emit](https://socket.io/docs/v4/emitting-events/)
- [Location Best Practices](https://developer.android.com/training/location/permissions)
