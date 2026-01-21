# 📍 Tính năng Theo dõi Tiến độ Cuộc họp/Công trình

> Theo dõi lộ trình và tiến độ người tham gia đến cuộc họp/công trình, tương tự như tính năng giao hàng của Shopee

![Meeting Tracking Feature](https://img.shields.io/badge/Status-Ready-green)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)
![Location Services](https://img.shields.io/badge/Location-GPS-orange)

## 🎯 Tổng quan

Tính năng mới này cho phép:
- ✅ Theo dõi vị trí thời gian thực của người tham gia
- ✅ Hiển thị lộ trình trên bản đồ (tương tự Shopee delivery)
- ✅ Cập nhật ETA (Estimated Time of Arrival) tự động
- ✅ Trạng thái cuộc họp: Chưa bắt đầu / Đang di chuyển / Đã tới
- ✅ Check-in tự động khi đến địa điểm
- ✅ Thống kê người tham gia real-time

## 📁 Cấu trúc File

### 1. Types & Models
```
types/
└── meeting.ts                 # Định nghĩa types cho Meeting, Participant, Location
```

### 2. Data & Mock
```
data/
└── meetings.ts                # Mock data và helper functions
```

### 3. Context
```
contexts/
└── MeetingContext.tsx         # State management cho meeting tracking
```

### 4. Components
```
components/meeting/
├── StatusBadge.tsx            # Badge hiển thị trạng thái
├── ParticipantCard.tsx        # Card thông tin người tham gia
├── MeetingMapView.tsx         # Bản đồ với route visualization
└── MeetingTrackingCard.tsx    # Quick access card cho homepage
```

### 5. Screens
```
app/
├── meet/
│   └── [id].tsx              # Chi tiết cuộc họp với map tracking
└── progress-meetings/
    └── index.tsx             # Danh sách cuộc họp
```

## 🚀 Cách sử dụng

### 1. Xem danh sách cuộc họp

Từ màn hình chủ, nhấn vào card **"Theo dõi Tiến độ"** hoặc truy cập:
```typescript
router.push('/progress-meetings');
```

### 2. Xem chi tiết một cuộc họp

```typescript
import { useMeeting } from '@/contexts/MeetingContext';

// Trong component
const { setActiveMeeting, getMeetingById } = useMeeting();

// Navigate to meeting detail
const meeting = getMeetingById('m1');
setActiveMeeting(meeting);
router.push(`/meet/${meeting.id}`);
```

### 3. Check-in vào cuộc họp

```typescript
const { checkInToMeeting, userLocation } = useMeeting();

const handleCheckIn = async () => {
  const success = await checkInToMeeting(meetingId);
  if (success) {
    Alert.alert('Thành công', 'Bạn đã check-in');
  }
};
```

### 4. Cập nhật vị trí người tham gia

```typescript
const { updateParticipantLocation } = useMeeting();

updateParticipantLocation(
  meetingId,
  participantId,
  { latitude: 10.8120, longitude: 106.6350 }
);
```

## 🎨 Tính năng chính

### 1. Map View với Route Tracking
```typescript
<MeetingMapView
  meeting={meeting}
  userLocation={userLocation}
  focusedParticipant={selectedParticipant}
  showAllRoutes={true}
/>
```

**Hiển thị:**
- 📍 Markers cho điểm đến (meeting location)
- 🚗 Markers động cho người tham gia đang di chuyển
- 📏 Polyline cho lộ trình
- 👤 User location marker

### 2. Participant Tracking
```typescript
<ParticipantCard
  participant={participant}
  onPress={() => focusOnMap(participant)}
  showRoute={true}
/>
```

**Thông tin:**
- Avatar & tên
- Status badge (chưa bắt đầu / đang đến / đã tới)
- Khoảng cách còn lại
- ETA (thời gian dự kiến)

### 3. Status Tabs
- **Bản đồ**: Xem route visualization
- **Người tham gia**: Danh sách chi tiết
- **Chi tiết**: Thông tin cuộc họp

### 4. Real-time Updates

Context tự động:
- Watch location updates mỗi 10 giây
- Cập nhật ETA dựa trên khoảng cách
- Auto-change status khi gần đến (<100m)

## 📊 Data Models

### Meeting
```typescript
interface Meeting {
  id: string;
  title: string;
  type: 'meeting' | 'site-inspection' | 'delivery' | 'construction';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location: Location;
  scheduledTime: string;
  participants: Participant[];
  checkInRequired: boolean;
  checkInRadius?: number; // meters
}
```

### Participant
```typescript
interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'not-started' | 'on-the-way' | 'arrived' | 'cancelled';
  currentLocation?: Coordinates;
  estimatedArrival?: string;
  distance?: number; // km
}
```

## 🔧 Configuration

### Location Permissions

App yêu cầu:
- `expo-location` (đã có sẵn)
- Foreground location permission
- Optional: Background location (cho real-time tracking)

### Mock Data

Để test, sử dụng mock data trong `data/meetings.ts`:
```typescript
import { MOCK_MEETINGS, LOCATIONS } from '@/data/meetings';
```

**Locations có sẵn:**
- AEON Tân Phú
- Tân Sơn Nhất Airport
- Làng hoa Gò Vấp
- Quận 1, Quận 7

## 🎯 Roadmap & Improvements

### Phase 2 (Future)
- [ ] Tích hợp `react-native-maps` thật (hiện đang mock)
- [ ] Real-time WebSocket updates
- [ ] Push notifications khi participant gần đến
- [ ] Route optimization với Google Directions API
- [ ] Lịch sử các cuộc họp
- [ ] Export báo cáo

### Map Integration
Khi deploy production, cài đặt `react-native-maps`:
```bash
npx expo install react-native-maps
```

Và thay thế mock view trong `MeetingMapView.tsx` bằng:
```typescript
import MapView, { Marker, Polyline } from 'react-native-maps';
```

## 🐛 Troubleshooting

### Location Permission bị từ chối
```typescript
const { locationPermission, error } = useMeeting();

if (!locationPermission) {
  Alert.alert('Cần quyền truy cập', 'App cần quyền vị trí để theo dõi tiến độ');
}
```

### ETA không chính xác
- Kiểm tra `calculateDistance()` function
- Tốc độ mặc định: 30 km/h (có thể điều chỉnh)
- Thêm traffic data cho chính xác hơn

## 📱 Screenshots

### 1. Danh sách cuộc họp
- Filter tabs: Tất cả / Đang diễn ra / Sắp tới
- Meeting cards với status & participant count

### 2. Chi tiết cuộc họp
- Map view với routes
- Participant list với ETA
- Check-in button

### 3. Quick Access Card
- Hiển thị trên homepage
- Thống kê nhanh: meetings đang diễn ra & sắp tới

## 🤝 Contributing

Khi thêm tính năng mới:
1. Cập nhật types trong `types/meeting.ts`
2. Thêm logic vào `MeetingContext.tsx`
3. Tạo UI components trong `components/meeting/`
4. Test với mock data trước
5. Update documentation này

## 📞 Support

Nếu có vấn đề:
- Kiểm tra location permissions
- Xem console logs từ `MeetingContext`
- Verify mock data có đúng format

---

**Built with ❤️ for better construction project management**

*Tính năng này được thiết kế dựa trên trải nghiệm giao hàng của Shopee, giúp quản lý cuộc họp và tiến độ công trình hiệu quả hơn.*
