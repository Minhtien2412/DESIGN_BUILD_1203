# 🚀 Quick Start - Meeting Tracking Feature

## Truy cập tính năng

### 1. Từ Homepage
Tìm và nhấn vào card **"Theo dõi Tiến độ"** với icon navigate-circle màu xanh.

### 2. Direct Navigation
```typescript
// Xem danh sách cuộc họp
router.push('/progress-meetings');

// Xem chi tiết cuộc họp cụ thể
router.push('/meet/m1');
```

## Demo với Mock Data

App đã có sẵn 3 cuộc họp mẫu:

### Cuộc họp 1: "Họp tiến độ công trình Phú Mỹ Hưng"
- **Trạng thái**: Đang diễn ra
- **Địa điểm**: Sân bay Tân Sơn Nhất
- **Người tham gia**: 4 người
  - 2 đã tới
  - 2 đang trên đường
- **Tính năng**: Map view, real-time tracking, check-in

### Cuộc họp 2: "Kiểm tra chất lượng công trình"
- **Trạng thái**: Đã lên lịch
- **Địa điểm**: Làng hoa Gò Vấp
- **Thời gian**: Ngày mai 9:00

### Cuộc họp 3: "Giao nhận vật liệu xây dựng"
- **Trạng thái**: Đang diễn ra
- **Loại**: Delivery tracking
- **Địa điểm**: Quận 7

## 🎯 Test Flow

1. **Xem danh sách** → Click vào meeting card
2. **Xem bản đồ** → Tab "Bản đồ" hiển thị routes
3. **Xem người tham gia** → Tab "Người tham gia"
4. **Check thông tin** → Tab "Chi tiết"
5. **Check-in** → Nút Check-in ở bottom (nếu có)

## 🔑 Key Components

```typescript
// Sử dụng trong component
import { useMeeting } from '@/contexts/MeetingContext';

const {
  meetings,              // Danh sách tất cả meetings
  activeMeeting,        // Meeting đang xem
  userLocation,         // Vị trí user hiện tại
  setActiveMeeting,     // Set meeting đang active
  checkInToMeeting,     // Check-in function
} = useMeeting();
```

## 📍 Location Services

App tự động:
- Request location permission khi vào tính năng
- Update vị trí mỗi 10 giây khi có active meeting
- Calculate distance & ETA tự động
- Change status khi người dùng đến gần (<100m)

## 🎨 UI Features

### Status Colors
- 🟡 Đang diễn ra: `#F59E0B` (Orange)
- 🔵 Sắp tới: `#6366F1` (Indigo)
- 🟢 Đã hoàn thành: `#10B981` (Green)
- 🔴 Đã hủy: `#EF4444` (Red)

### Status Badges
- ⏰ Chưa bắt đầu
- 🧭 Đang di chuyển
- ✅ Đã tới
- ❌ Đã hủy

## 🚗 Map View (Mock)

Hiện tại sử dụng mock map view vì `react-native-maps` được mock trong development.

**Hiển thị:**
- Destination marker (đỏ)
- Participant markers (xanh)
- Route lines (polylines)
- Legend box

**Production**: Sẽ thay bằng Google Maps thật

## 💡 Tips

1. **Test location**: Mock data đã set sẵn tọa độ ở TP.HCM
2. **Add meeting**: Thêm vào `data/meetings.ts`
3. **Custom routes**: Dùng `generateSimpleRoute()` helper
4. **Distance calc**: Dùng `calculateDistance()` (Haversine formula)

## 🔗 Routes

```
/progress-meetings          → Danh sách cuộc họp
/meet/[id]                  → Chi tiết cuộc họp
```

## ⚡ Performance

- Location updates: 10s interval
- Distance threshold: 50m
- Check-in radius: Configurable (default 100m)
- ETA recalculation: Mỗi khi location update

---

**Ready to use!** 🎉

Mở app và navigate đến `/progress-meetings` để bắt đầu.
