# 📍 Location Tracking + UI Update - Auth Screen

## ✅ Đã hoàn thành

### 1. **Location Tracking khi đăng ký**
- ✅ Tự động lấy vị trí GPS khi mở màn hình đăng ký
- ✅ Chuyển đổi tọa độ thành địa chỉ (reverse geocoding)
- ✅ Hiển thị địa chỉ trong form đăng ký
- ✅ Lưu location vào database khi đăng ký
- ✅ Nút "Cập nhật vị trí" để refresh

### 2. **Cải thiện UI - Màu sắc mới**
- ✅ Location card với màu xanh lá #10B981
- ✅ Role buttons với hover effect
- ✅ Background gradient cho cards
- ✅ Border styling mới

## 📱 Tính năng mới

### Location Display
```tsx
┌─────────────────────────────┐
│ 📍 Vị trí của bạn           │
│                             │
│ 📍 123 Nguyễn Văn Linh,    │
│    Quận 7, TP.HCM           │
│                             │
│ [🔄 Cập nhật vị trí]        │
└─────────────────────────────┘
```

### Dữ liệu lưu khi đăng ký:
```typescript
{
  email: "user@example.com",
  password: "******",
  name: "Nguyễn Văn A",
  phone: "0901234567",
  role: "customer",
  location: {
    latitude: 10.7769,
    longitude: 106.7009,
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM, Vietnam"
  }
}
```

## 🎨 Màu sắc mới

### Location Card:
- Background: `rgba(16, 185, 129, 0.1)` - Xanh lá nhạt
- Border: `rgba(16, 185, 129, 0.3)` - Xanh lá viền
- Icon: `#10B981` - Xanh lá đậm
- Button: `rgba(16, 185, 129, 0.15)` - Nền nút

### Role Buttons:
- Inactive: `rgba(255, 255, 255, 0.05)` - Trắng mờ
- Active: `primary` color (theme) - Màu chủ đạo app
- Border: Dynamic theo theme

## 📊 Location Flow

```
1. User mở màn hình đăng ký
   ↓
2. App request location permission
   ↓
3. Nếu OK → Lấy GPS coordinates
   ↓
4. Convert coords → địa chỉ (Reverse Geocode)
   ↓
5. Hiển thị trong Location Card
   ↓
6. User điền form + bấm Submit
   ↓
7. Gửi data + location lên backend
   ↓
8. Backend lưu vào database
```

## 🔧 Permission Required

App cần quyền:
- ✅ Location (Foreground) - để lấy vị trí hiện tại

Add vào `app.json`:
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
    ]
  }
}
```

## 💡 Features

### Auto Location:
- Tự động lấy khi mount component
- Loading indicator khi đang lấy
- Error handling nếu user từ chối

### Manual Refresh:
- Nút "Cập nhật vị trí" 
- Loading state khi refresh
- Update UI ngay lập tức

### Address Display:
- Format: `Street, District, City, Country`
- Fallback: "Không xác định" nếu fail
- 2 lines max với ellipsis

## 🎯 UI Components

### Location Card:
```tsx
<View style={styles.locationContainer}>
  {/* Header với icon */}
  <View style={styles.locationHeader}>
    <Ionicons name="location" size={18} color="#10B981" />
    <Text>Vị trí của bạn</Text>
  </View>
  
  {/* Address text */}
  <Text numberOfLines={2}>
    📍 {userLocation.address}
  </Text>
  
  {/* Refresh button */}
  <TouchableOpacity onPress={getLocation}>
    <Ionicons name="refresh" />
    <Text>Cập nhật vị trí</Text>
  </TouchableOpacity>
</View>
```

### Role Button (Updated):
```tsx
<TouchableOpacity
  style={[
    styles.roleButton,
    registerRole === 'customer' && {
      backgroundColor: primary,
      borderColor: primary
    }
  ]}
>
  <Ionicons name="person-outline" />
  <Text>Khách hàng</Text>
</TouchableOpacity>
```

## 🐛 Error Handling

### Permission Denied:
```
"Vui lòng cấp quyền truy cập vị trí"
→ Toast notification
→ Location card không hiện
```

### GPS Unavailable:
```
Location = null
→ Không hiện location card
→ Vẫn cho phép đăng ký (location optional)
```

### Geocoding Failed:
```
Address = "Không xác định"
→ Vẫn lưu coordinates
→ Có thể geocode lại sau
```

## 📝 Console Logs

Khi lấy location thành công:
```
📍 Location: {
  latitude: 10.7769,
  longitude: 106.7009,
  address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM, Vietnam"
}
```

Khi đăng ký:
```
📝 Registration data: {
  email: "...",
  name: "...",
  location: { ... }
}
```

## 🎨 Color Palette

Tất cả màu sắc theo theme app:
- Primary: `#0A6847` (xanh lá đậm - từ theme)
- Success: `#10B981` (xanh lá sáng - location)
- Background cards: `rgba(255, 255, 255, 0.05)`
- Borders: Dynamic theo theme
- Text: Dynamic theo theme (light/dark mode)

## 🚀 Next Steps (Optional)

- [ ] Lưu history các địa điểm đã đăng ký
- [ ] Hiển thị bản đồ mini
- [ ] Tự động điền city/province vào form
- [ ] Validate location trong radius nhất định
- [ ] Offline caching location

---

**Status**: ✅ COMPLETE  
**Last Updated**: December 2024  
**Files Modified**: `app/(auth)/auth-3d-flip.tsx`
