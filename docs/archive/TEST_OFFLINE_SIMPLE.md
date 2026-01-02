# HƯỚNG DẪN TEST OFFLINE - ĐƠN GIẢN

## Bước 1: Gửi Thông Báo Test

Chạy PowerShell script có sẵn:
```powershell
.\send-all-notifications.ps1
```

**Nhập thông tin:**
- Email: Tài khoản của bạn (đã đăng ký trong app)
- Password: Mật khẩu của bạn

Script sẽ gửi 7 thông báo test đến tài khoản.

## Bước 2: Mở App (ONLINE)

1. Mở app trên điện thoại/emulator
2. Đảm bảo WiFi/Mobile Data BẬT
3. Vào màn hình Notifications (click bell icon)
4. Kiểm tra:
   - ✅ Badge count hiển thị số thông báo
   - ✅ Danh sách thông báo hiển thị đầy đủ
   - ✅ Có thể click xem chi tiết

## Bước 3: BẬT CHẾ ĐỘ OFFLINE

### Android:
1. Settings → Network & Internet
2. Bật **Airplane Mode**

### iOS:
1. Swipe down Control Center
2. Tap **Airplane Mode** icon

### Emulator:
**Android Studio:**
```
Extended Controls (…) → Cellular → Data → Off
```

**iOS Simulator:**
```
Settings → Toggle Airplane Mode ON
```

## Bước 4: Đóng App Hoàn Toàn

**Android:**
- Recent Apps (Square button)
- Swipe app lên trên để đóng

**iOS:**
- Double click Home button
- Swipe app lên

**Expo:**
- Đóng Metro bundler terminal
- Mở lại: `npm start`

## Bước 5: Mở App Lại (OFFLINE)

Mở app trong chế độ không có internet.

### Kết Quả Mong Đợi:

✅ **App vẫn mở được (không crash)**
```
- Không có lỗi "Network Error"
- Không có white screen
- App load bình thường
```

✅ **Thông báo vẫn hiển thị**
```
- Badge count vẫn hiển thị (số cuối cùng)
- Danh sách notifications vẫn có data
- Data này lấy từ cache offline
```

✅ **Có thể đọc thông báo**
```
- Click vào notification → Mở detail
- Content hiển thị đầy đủ
- Tất cả data từ cache
```

❌ **Không thể làm gì cần internet:**
```
- Pull to refresh → Hiển thị lỗi
- Mark as read → Không sync được
- Delete → Không xóa trên server
```

## Bước 6: TẮT Airplane Mode (Back Online)

1. Tắt Airplane Mode
2. Đợi kết nối WiFi/Mobile Data
3. Quay lại app

### Kết Quả Mong Đợi:

✅ **Auto sync với server:**
```
- Pull to refresh → Fetch data mới
- Badge count cập nhật real-time
- Thông báo mới (nếu có) xuất hiện
```

✅ **Các tính năng hoạt động:**
```
- Mark as read → Sync lên server
- Delete → Xóa trên server
- Refresh → Lấy data mới nhất
```

## KẾT QUẢ KIỂM TRA

### ✅ Offline Mode Hoạt Động Tốt Nếu:

1. **App không crash khi offline**
   - Mở được bình thường
   - Không hiển thị error screen

2. **Hiển thị cached data**
   - Notifications cũ vẫn thấy
   - Badge count vẫn hiển thị
   - Có thể đọc content

3. **Graceful degradation**
   - Các tính năng cần internet báo lỗi rõ ràng
   - Không crash app khi user thử refresh

4. **Auto recovery khi back online**
   - Tự động sync khi có internet
   - Data mới được fetch
   - Không cần restart app

### ❌ Có Lỗi Nếu:

1. **App crash khi offline**
   - White screen of death
   - "Network Error" không handle được

2. **Không có data khi offline**
   - Notifications list trống
   - Badge count = 0
   - Cache không hoạt động

3. **Không sync khi back online**
   - Phải force close app
   - Data cũ không cập nhật
   - Badge count sai

## CODE LIÊN QUAN

### Hook Xử Lý Offline
File: `hooks/useNotifications.ts`

```typescript
// Dòng 32-43: Logic kiểm tra offline
if (isOffline) {
  console.log('[useNotifications] Device offline, using offline storage');
  const offlineData = await getOfflineData<Notification[]>(OFFLINE_KEY);
  if (offlineData) {
    setNotifications(offlineData);
    const unread = offlineData.filter(n => !n.isRead).length;
    setUnreadCount(unread);
    // Trả về data từ cache
    return;
  }
}
```

### Nơi Sử dụng
- `app/(tabs)/index.tsx` - Header bell badge
- `app/(tabs)/home-construction.tsx` - Header bell badge
- `app/(tabs)/notifications.tsx` - Notifications list

## DEBUG TIPS

### Xem Log Offline
Mở React Native Debugger và check console:

```
[useNotifications] Device offline, using offline storage
[useNotifications] Loaded 5 notifications from offline cache
```

### Xóa Cache (Test lại từ đầu)
```javascript
// In browser console (React Native Debugger)
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('notifications_offline');
```

### Kiểm Tra Network Status
```javascript
// Add temporary log in useNotifications.ts
console.log('Network Status:', { isOffline });
```

## TÓM TẮT

**Mục tiêu:** App vẫn hoạt động khi không có internet
**Cách test:** Bật Airplane Mode → Mở app → Kiểm tra
**Kỳ vọng:** Thông báo cũ vẫn hiển thị từ cache
**Thành công nếu:** Không crash + Hiển thị cache + Auto sync khi online
