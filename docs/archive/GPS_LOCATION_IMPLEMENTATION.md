# GPS LOCATION TRACKING - ĐĂNG NHẬP/ĐĂNG KÝ

## ✅ Đã Cài Đặt

### Frontend Dependencies
```json
{
  "expo-location": "~19.0.8",
  "react-native-maps": "1.20.1"
}
```

### Backend Dependencies (Optional - nếu muốn lưu location)
```json
{
  "@nestjs/typeorm": "^10.0.0",
  "pg": "^8.11.3"
}
```

---

## 📦 Modules Mới Đã Thêm

### 1. **useLocation Hook** (`hooks/useLocation.ts`)

**Chức năng:**
- ✅ Yêu cầu quyền truy cập GPS
- ✅ Lấy tọa độ GPS hiện tại (latitude, longitude)
- ✅ Reverse geocoding (tọa độ → địa chỉ)
- ✅ Tính khoảng cách giữa 2 điểm (Haversine formula)
- ✅ Auto-refresh khi permission được cấp

**API:**
```typescript
interface UseLocationResult {
  location: LocationData | null;        // GPS data
  address: string | null;                // Địa chỉ đầy đủ
  loading: boolean;                      // Đang lấy vị trí
  error: string | null;                  // Lỗi
  requestPermission: () => Promise<boolean>;  // Xin quyền
  getCurrentLocation: () => Promise<LocationData | null>;  // Lấy vị trí
  hasPermission: boolean;                // Đã có quyền?
}

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;  // Độ chính xác (meters)
    heading: number | null;   // Hướng di chuyển
    speed: number | null;     // Tốc độ (m/s)
  };
  timestamp: number;
  address?: string;           // "123 Nguyễn Văn Linh, Q7, TP.HCM"
  city?: string;              // "TP. Hồ Chí Minh"
  country?: string;           // "Vietnam"
  region?: string;            // "Hồ Chí Minh"
}
```

**Sử dụng:**
```tsx
import { useLocation, formatLocationString } from '@/hooks/useLocation';

function MyComponent() {
  const {
    location,
    address,
    loading,
    error,
    requestPermission,
    hasPermission,
  } = useLocation();

  return (
    <>
      {!hasPermission && (
        <Button onPress={requestPermission}>Bật GPS</Button>
      )}
      
      {location && (
        <Text>{address || formatLocationString(location)}</Text>
      )}
      
      {error && <Text>Lỗi: {error}</Text>}
    </>
  );
}
```

---

## 🔧 Đã Tích Hợp Vào

### `app/(auth)/register.tsx`

**GPS UI Flow:**

1. **Chưa cấp quyền:**
   - Hiển thị nút "Bật GPS để lấy vị trí"
   - Icon: `locate` (màu primary)
   - Border dashed style

2. **Đã cấp quyền + có location:**
   - Hiển thị địa chỉ đầy đủ
   - Tọa độ (latitude, longitude)
   - Icon checkmark xanh lá
   - Background xanh nhạt (#10B98115)

3. **Loading:**
   - ActivityIndicator trong nút GPS

4. **Error:**
   - InlineError component với thông báo lỗi

**Data Flow khi đăng ký:**

```typescript
const registrationData = {
  email: "user@example.com",
  password: "***",
  fullName: "Nguyen Van A",
  role: "CLIENT",
  userType: "buyer",
  location: {                    // 👈 GPS data
    latitude: 10.762622,
    longitude: 106.660172,
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM, Vietnam",
    city: "TP. Hồ Chí Minh",
    country: "Vietnam",
    timestamp: 1702742400000
  }
};
```

---

## 🗄️ Backend Integration (NestJS)

### 1. Database Schema

**User Entity với Location:**
```typescript
// backend-nestjs/src/users/entities/user.entity.ts
import { Entity, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  registrationAddress: string;

  @Column({ nullable: true })
  registrationCity: string;

  @Column({ nullable: true })
  registrationCountry: string;

  @Column({ type: 'bigint', nullable: true })
  locationTimestamp: number;
}
```

### 2. DTO Update

```typescript
// backend-nestjs/src/auth/dto/register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
    timestamp?: number;
  };
}
```

### 3. Service Logic

```typescript
// backend-nestjs/src/auth/auth.service.ts
async register(registerDto: RegisterDto) {
  const user = this.usersRepository.create({
    email: registerDto.email,
    fullName: registerDto.fullName,
    // ... other fields
    
    // GPS Location
    latitude: registerDto.location?.latitude,
    longitude: registerDto.location?.longitude,
    registrationAddress: registerDto.location?.address,
    registrationCity: registerDto.location?.city,
    registrationCountry: registerDto.location?.country,
    locationTimestamp: registerDto.location?.timestamp,
  });

  await this.usersRepository.save(user);
  return user;
}
```

### 4. Migration

```sql
-- Create migration:
-- npm run migration:generate -- CreateLocationFields

-- SQL:
ALTER TABLE users
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN registration_address TEXT,
ADD COLUMN registration_city VARCHAR(100),
ADD COLUMN registration_country VARCHAR(100),
ADD COLUMN location_timestamp BIGINT;

CREATE INDEX idx_users_location ON users(latitude, longitude);
```

---

## 📱 Testing Guide

### 1. **Android Emulator**
```bash
# Enable GPS in emulator
# Settings → Location → Use Google location → ON

# Set custom location:
# Android Studio → Extended Controls (⋮) → Location → Set location
# Example: 10.762622, 106.660172 (Saigon)
```

### 2. **iOS Simulator**
```bash
# Debug → Location → Custom Location
# Latitude: 10.762622
# Longitude: 106.660172
```

### 3. **Real Device**
```bash
# Đảm bảo GPS được bật trong Settings
# Cấp quyền location cho app khi được yêu cầu
```

### 4. **Web (Development)**
```bash
# Browser sẽ hỏi permission
# Hoặc fake location với browser DevTools:
# Chrome → F12 → ⋮ → More tools → Sensors → Location
```

---

## 🔐 Permissions (app.json / app.config.ts)

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Ứng dụng cần truy cập vị trí để xác nhận đăng ký tài khoản.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Ứng dụng cần truy cập vị trí để xác nhận đăng ký tài khoản."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

---

## 🚀 Usage Examples

### Ví dụ 1: Lấy vị trí khi component mount
```tsx
useEffect(() => {
  if (hasPermission) {
    getCurrentLocation();
  }
}, [hasPermission]);
```

### Ví dụ 2: Tính khoảng cách từ user đến văn phòng
```tsx
import { calculateDistance } from '@/hooks/useLocation';

const officeCoords = { lat: 10.762622, lng: 106.660172 };

if (location) {
  const distance = calculateDistance(
    location.coords.latitude,
    location.coords.longitude,
    officeCoords.lat,
    officeCoords.lng
  );
  
  console.log(`Khoảng cách: ${distance.toFixed(2)} km`);
}
```

### Ví dụ 3: Hiển thị bản đồ với marker
```tsx
import MapView, { Marker } from 'react-native-maps';

{location && (
  <MapView
    initialRegion={{
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    <Marker
      coordinate={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }}
      title="Vị trí của bạn"
    />
  </MapView>
)}
```

---

## 📊 Analytics & Tracking

### Lưu lịch sử vị trí đăng nhập

```typescript
// backend-nestjs/src/auth/entities/login-history.entity.ts
@Entity('login_history')
export class LoginHistory {
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

  @Column({ type: 'varchar', length: 50 })
  deviceType: string; // 'ios', 'android', 'web'

  @CreateDateColumn()
  loginTime: Date;
}
```

---

## 🛡️ Security Considerations

1. **Privacy:**
   - ✅ Location là optional (user có thể bỏ qua)
   - ✅ Không lưu location vào localStorage (chỉ gửi khi đăng ký)
   - ⚠️ Cần GDPR consent ở EU

2. **Validation:**
   - ✅ Kiểm tra latitude: -90 → 90
   - ✅ Kiểm tra longitude: -180 → 180
   - ✅ Kiểm tra timestamp hợp lệ

3. **Rate Limiting:**
   - ⚠️ Giới hạn số lần request location (tránh spam)

---

## ❌ Troubleshooting

### Lỗi: "Permission denied"
**Giải pháp:**
- Check app.json có khai báo permissions
- Build lại app (expo run:android / ios)
- Settings → App → Permissions → Location → Allow

### Lỗi: "Location services disabled"
**Giải pháp:**
- Bật GPS trong Settings thiết bị
- Kiểm tra chế độ máy bay (airplane mode)

### Lỗi: "Geocoding failed"
**Giải pháp:**
- Vẫn có tọa độ GPS, chỉ thiếu địa chỉ
- Có thể dùng Google Maps API để reverse geocode

### Lỗi: "Timeout"
**Giải pháp:**
- Tăng timeout trong getCurrentPositionAsync
- Giảm accuracy xuống Medium/Low

---

## 🎯 Next Steps

1. **Hiển thị map trong profile:**
   ```tsx
   // app/(tabs)/profile.tsx
   <MapView
     region={{
       latitude: user.latitude,
       longitude: user.longitude,
     }}
   />
   ```

2. **Theo dõi vị trí đăng nhập bất thường:**
   ```typescript
   // Backend: Alert if login from different country
   if (user.registrationCountry !== loginCountry) {
     sendSecurityAlert(user.email);
   }
   ```

3. **Tìm người dùng gần nhất:**
   ```sql
   SELECT *,
   (6371 * acos(
     cos(radians(:latitude)) * cos(radians(latitude)) *
     cos(radians(longitude) - radians(:longitude)) +
     sin(radians(:latitude)) * sin(radians(latitude))
   )) AS distance
   FROM users
   WHERE latitude IS NOT NULL
   ORDER BY distance
   LIMIT 10;
   ```

---

## 📝 Summary

✅ **Đã hoàn thành:**
- useLocation hook với full features
- GPS UI trong register screen
- Format địa chỉ tự động
- Error handling & loading states
- TypeScript types đầy đủ

🔄 **Cần làm tiếp (optional):**
- Backend lưu location vào DB
- Migration schema
- Login history tracking
- Map component riêng
- Background location (nếu cần)

---

**Tài liệu tham khảo:**
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
