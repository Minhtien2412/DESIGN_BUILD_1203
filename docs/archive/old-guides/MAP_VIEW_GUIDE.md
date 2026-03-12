# 🗺️ Map View - Installation & Setup Guide

## ✅ Tính năng

### Hiển thị trên bản đồ:
- 📍 **Vị trí người dùng** - GPS real-time với vòng tròn bán kính
- 🏗️ **Vị trí công trình** - Custom markers màu sắc theo tiến độ
- 🎨 **Map type** - Standard / Satellite
- 📊 **Progress badge** - Hiển thị % hoàn thành
- 💬 **Callout info** - Chi tiết công trình khi tap marker
- 🧭 **My Location** - Button quay về vị trí hiện tại

## 📦 Cài đặt

### 1. Install dependencies:
```bash
npx expo install react-native-maps
npx expo install expo-location
```

### 2. Configure app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ],
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Get Google Maps API Key:
1. Vào https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Maps SDK for Android** và **Maps SDK for iOS**
4. Tạo API key trong Credentials
5. Thêm restrictions nếu cần
6. Copy API key vào app.json

## 🚀 Sử dụng

### Từ Homepage:
```tsx
// Thêm button vào homepage
<TouchableOpacity onPress={() => router.push('/construction/map-view')}>
  <Ionicons name="map" size={24} color={Colors.primary} />
  <Text>Bản đồ công trình</Text>
</TouchableOpacity>
```

### Hoặc từ menu:
```tsx
const MENU_ITEMS = [
  // ...existing items
  {
    id: 'map',
    label: 'Bản đồ',
    icon: 'map',
    route: '/construction/map-view'
  }
];
```

## 🎨 Màu sắc Markers

### Theo tiến độ:
- 🟠 **Orange (#F59E0B)** - Khởi công (0-49%)
- 🔵 **Blue (#3B82F6)** - Đang thi công (50-89%)
- 🟢 **Green (#10B981)** - Hoàn thiện (90-100%)

## 📱 UI Components

### 1. Map View
- Full screen map
- User location circle (500m radius)
- Construction site markers
- Pinch to zoom, drag to pan

### 2. Custom Marker
```
┌───────┐
│  🏢   │ ← Icon
└───┬───┘
    │     ← Triangle pointer
    ▼
```

### 3. Callout (Info Window)
```
┌──────────────────────────┐
│ Dự án Vinhomes          │
│ Quận 9, TP.HCM          │
│                          │
│ [Biệt thự]    [75%]    │
│                          │
│ Xem chi tiết →          │
└──────────────────────────┘
```

### 4. Bottom Sheet
Hiển thị khi tap marker:
- Tên công trình
- Địa chỉ
- Loại công trình
- Trạng thái
- Tiến độ (progress bar)
- Button "Xem chi tiết"

### 5. Legend
Chú thích màu sắc ở góc trên phải

### 6. My Location Button
Floating button ở góc dưới phải

## 🔧 Tùy chỉnh

### Thêm công trình mới:
```typescript
const CONSTRUCTION_SITES = [
  {
    id: 1,
    name: 'Tên dự án',
    address: 'Địa chỉ',
    latitude: 10.7769,
    longitude: 106.7009,
    status: 'Đang thi công',
    progress: 75,
    type: 'Biệt thự',
  },
  // Thêm sites khác...
];
```

### Kết nối API:
```typescript
// Thay mock data bằng API call
const fetchConstructionSites = async () => {
  const response = await fetch('/api/v1/projects/locations');
  const sites = await response.json();
  return sites;
};
```

### Custom marker icon:
```tsx
<Marker coordinate={location}>
  <Image 
    source={require('../assets/marker-icon.png')} 
    style={{ width: 40, height: 40 }}
  />
</Marker>
```

## 📊 Features Detail

### 1. User Location Circle
- Tự động lấy GPS khi mount
- Vòng tròn bán kính 500m
- Màu xanh dương semi-transparent
- Show user dot tại center

### 2. Construction Markers
- Custom marker với icon building
- Màu sắc động theo progress
- Border trắng + shadow
- Triangle pointer hướng xuống

### 3. Map Controls
- **Map Type Toggle**: Standard ↔ Satellite
- **Compass**: Tự động hiện khi rotate
- **Scale Bar**: Hiển thị tỷ lệ
- **Zoom Controls**: Pinch gesture

### 4. Navigation
- Tap marker → Hiện bottom sheet
- Tap callout / button → Navigate to detail page
- Back button → Return to previous screen

## 🎯 Data Flow

```
1. Component mount
   ↓
2. Request location permission
   ↓
3. Get user GPS coordinates
   ↓
4. Load construction sites (API/Mock)
   ↓
5. Render map với:
   - User location + circle
   - Site markers với colors
   ↓
6. User tap marker
   ↓
7. Show bottom sheet với details
   ↓
8. User tap "Xem chi tiết"
   ↓
9. Navigate to construction progress page
```

## 🐛 Troubleshooting

### Map không hiển thị (Android):
```bash
# Thêm API key vào android/app/src/main/AndroidManifest.xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_API_KEY"/>
```

### Location permission denied:
```typescript
// Check & request lại
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Cần quyền truy cập vị trí');
}
```

### Markers không hiện:
- Check latitude/longitude values
- Ensure numbers, not strings
- Verify coordinates in valid range

### Map lag/slow:
- Reduce number of markers
- Disable satellite view
- Optimize marker rendering

## 📝 Example Usage

### Homepage Integration:
```tsx
// app/(tabs)/index.tsx
const QUICK_TOOLS = [
  // ...existing
  { 
    id: 9, 
    label: 'Bản đồ', 
    icon: 'map-outline', 
    route: '/construction/map-view' 
  },
];
```

### Navigation:
```typescript
import { router } from 'expo-router';

// Navigate to map
router.push('/construction/map-view');

// Navigate to specific site
router.push(`/construction/progress?id=${siteId}`);
```

## 🎨 Styling

### Colors:
- Primary: `#0A6847` (từ theme)
- User Circle: `rgba(59, 130, 246, 0.2)` (xanh dương nhạt)
- Markers: Dynamic based on progress
- Background: `#F9FAFB`
- Bottom Sheet: `#fff` với shadow

### Dimensions:
- Marker size: 36x36px
- Circle radius: 500m
- Bottom sheet: Auto height
- Legend: Fixed width

## 🔐 Permissions

### iOS (Info.plist):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby construction sites</string>
```

### Android (AndroidManifest.xml):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## 🚀 Performance Tips

1. **Cluster markers** nếu có > 50 sites
2. **Lazy load** site details khi tap
3. **Cache** map tiles
4. **Debounce** region change events
5. **Optimize** marker re-renders

## 📚 References

- React Native Maps: https://github.com/react-native-maps/react-native-maps
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Google Maps API: https://developers.google.com/maps

---

**Status**: ✅ READY TO USE  
**Last Updated**: December 2024  
**File**: `app/construction/map-view.tsx`
