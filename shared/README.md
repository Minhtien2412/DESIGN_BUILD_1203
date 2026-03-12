# Shared Utilities Documentation

Tài liệu hướng dẫn sử dụng các shared utilities có sẵn trong app.

## 📦 Import

```typescript
// Import từ shared module
import {
  // Device utilities
  deviceUtils,
  getDeviceInfo,
  getBatteryInfo,
  isOnline,
  isLowEndDevice,

  // Localization
  formatVND,
  formatCurrency,
  getLocaleInfo,
  translate,

  // Haptic feedback
  haptic,
  buttonPress,
  successNotification,

  // Clipboard
  copyToClipboard,
  copyPhoneNumber,
  copyPrice,

  // Share
  shareText,
  shareProduct,
  shareImage,

  // Permissions
  requestCameraPermission,
  requestLocationPermission,
  checkPermissions,

  // Validation
  validateEmail,
  validateVietnamesePhone,
  validatePassword,
  validateForm,

  // Date/Time
  formatDateVN,
  getRelativeTime,
  isToday,
  addDays,

  // Store Review
  requestReview,
  maybeRequestReview,

  // Hooks
  useOnlineStatus,
  useBattery,
  useDeviceInfo,

  // Components
  PerformantList,
} from "@/shared";
```

## 🔧 Device Utilities

### Thông tin thiết bị

```typescript
const info = await getDeviceInfo();
// { brand, model, osVersion, isPhone, isTablet, totalMemoryGB }

const battery = await getBatteryInfo();
// { level, isCharging, isLow }

const network = await getNetworkInfo();
// { isConnected, type }
```

### Kiểm tra thiết bị

```typescript
if (isLowEndDevice()) {
  // Giảm chất lượng hình ảnh
}

if (await isOnline()) {
  // Thực hiện API call
}
```

## 🌏 Localization

### Format tiền VND

```typescript
formatVND(1500000); // "1.500.000 ₫"
formatCurrency(100, "USD"); // "$100.00"
```

### Format ngày giờ

```typescript
formatDateVN(new Date()); // "28/01/2025"
formatDateTimeVN(new Date()); // "28/01/2025 15:30"
getRelativeTime(pastDate); // "2 giờ trước"
```

### Đa ngôn ngữ

```typescript
const t = createTranslator({
  vi: { hello: "Xin chào" },
  en: { hello: "Hello" },
});
t("hello"); // "Xin chào" (theo ngôn ngữ thiết bị)
```

## 📳 Haptic Feedback

```typescript
// Rung nhẹ khi nhấn nút
await buttonPress();

// Rung khi thành công
await successNotification();

// Rung khi lỗi
await errorNotification();

// Rung theo kiểu tùy chọn
await haptic("medium");
```

## 📋 Clipboard

```typescript
// Copy text
await copyToClipboard("Hello World");

// Copy với thông báo tùy chỉnh
await copyPhoneNumber("0901234567"); // + Toast "Đã sao chép số điện thoại"

// Copy giá tiền
await copyPrice(1500000); // Copy "1.500.000 ₫"
```

## 📤 Share

```typescript
// Chia sẻ text
await shareText("Xin chào!", "Lời chào");

// Chia sẻ URL
await shareUrl("https://example.com", "Website hay");

// Chia sẻ sản phẩm
await shareProduct("iPhone 15", 25000000, "https://shop.com/iphone15");

// Chia sẻ file ảnh
await shareImage(imageUri, "Ảnh đẹp");

// Mời dùng app
await shareAppInvite("MyApp", "https://playstore.com/myapp");
```

## 🔐 Permissions

```typescript
// Kiểm tra quyền
const cameraStatus = await checkCameraPermission();
if (!cameraStatus.granted) {
  const result = await requestCameraPermission();
}

// Kiểm tra nhiều quyền
const results = await checkPermissions(["camera", "location", "notifications"]);

// Mở cài đặt app
openSettings();

// Hiện alert khi bị từ chối
showPermissionDeniedAlert(
  "Cần quyền Camera",
  "Vui lòng cấp quyền camera để chụp ảnh",
);
```

## ✅ Validation

### Validate đơn lẻ

```typescript
// Email
const email = validateEmail("test@example.com");
// { isValid: true }

// Số điện thoại Việt Nam
const phone = validateVietnamesePhone("0901234567");
// { isValid: true }

// Mật khẩu mạnh
const password = validatePassword("MyPass123!", {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
});
```

### Validate form

```typescript
const results = validateForm({
  email: {
    value: "test@example",
    rules: [
      { validate: (v) => !isEmpty(v), message: "Email là bắt buộc" },
      {
        validate: (v) => validateEmail(v).isValid,
        message: "Email không hợp lệ",
      },
    ],
  },
  phone: {
    value: "0901234567",
    rules: [
      {
        validate: (v) => validateVietnamesePhone(v).isValid,
        message: "SĐT không hợp lệ",
      },
    ],
  },
});

if (isFormValid(results)) {
  // Submit form
} else {
  alert(getFirstError(results));
}
```

## 📅 Date/Time Utilities

```typescript
// Format ngày Việt Nam
formatDateVN(new Date()); // "28/01/2025"
formatDateTimeVN(new Date()); // "28/01/2025 15:30"
formatDateFull(new Date()); // "Thứ ba, 28/01/2025"

// Thời gian tương đối
getRelativeTime(pastDate); // "2 giờ trước"
getSmartTime(messageDate); // "15:30" hoặc "T2 15:30" hoặc "28/01"

// Kiểm tra
isToday(date); // true/false
isYesterday(date); // true/false
isThisWeek(date); // true/false

// Tính toán
addDays(date, 7); // Thêm 7 ngày
addMonths(date, 1); // Thêm 1 tháng
diffInDays(date1, date2); // Số ngày chênh lệch

// Countdown
const countdown = getCountdownTo(futureDate);
// { days: 2, hours: 5, minutes: 30, seconds: 15, isPast: false }
formatCountdown(totalSeconds); // "02:30:15"
```

## ⭐ Store Review

```typescript
// Hiện dialog đánh giá (nếu có thể)
await requestReview();

// Yêu cầu đánh giá thông minh
await maybeRequestReview({
  minDaysSinceInstall: 7,
  minAppOpens: 10,
  minSignificantEvents: 3,
});

// Track sự kiện
trackAppOpen();
trackSignificantEvent(); // Khi user hoàn thành mua hàng, etc.
```

## 🪝 React Hooks

```typescript
function MyComponent() {
  // Trạng thái mạng
  const isOnline = useOnlineStatus();

  // Thông tin pin
  const { level, isCharging, isLow } = useBattery();

  // Thông tin thiết bị
  const deviceInfo = useDeviceInfo();

  // Adaptive quality
  const quality = useAdaptiveQuality();
  // 'high' | 'medium' | 'low' based on device

  // Should load media
  const shouldLoad = useShouldLoadMedia();
  // true nếu wifi/charging hoặc thiết bị mạnh

  return (
    <View>
      {isOnline ? 'Online' : 'Offline'}
      {isLow && 'Pin yếu!'}
    </View>
  );
}
```

## 📃 PerformantList Component

```typescript
import { PerformantList } from '@/shared';

function ProductList() {
  return (
    <PerformantList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={(item) => item.id}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      onEndReached={loadMore}
      emptyMessage="Không có sản phẩm"
    />
  );
}
```

## 🎯 Best Practices

1. **Luôn check platform** - Một số utility chỉ hoạt động trên native
2. **Handle errors** - Các async functions có thể throw error
3. **Sử dụng TypeScript** - Tận dụng type safety
4. **Tối ưu performance** - Dùng useCallback/useMemo khi cần

```typescript
// ✅ Good
const handlePress = useCallback(async () => {
  await buttonPress();
  // do something
}, []);

// ❌ Bad - tạo function mới mỗi render
<Button onPress={async () => await buttonPress()} />
```

## 📁 File Structure

```
shared/
├── utils/
│   ├── deviceUtils.ts      # Thông tin thiết bị
│   ├── localizationUtils.ts # Đa ngôn ngữ, format
│   ├── hapticUtils.ts      # Haptic feedback
│   ├── clipboardUtils.ts   # Copy/paste
│   ├── shareUtils.ts       # Chia sẻ
│   ├── permissionUtils.ts  # Quản lý quyền
│   ├── validationUtils.ts  # Xác thực dữ liệu
│   ├── dateUtils.ts        # Xử lý ngày giờ
│   ├── storeReviewUtils.ts # Đánh giá app
│   └── index.ts
├── hooks/
│   ├── deviceHooks.ts      # React hooks
│   └── index.ts
├── components/
│   ├── PerformantList.tsx  # FlashList wrapper
│   └── index.ts
└── index.ts                # Main export
```
