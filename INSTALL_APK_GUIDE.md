# 🚀 HƯỚNG DẪN CÀI ĐẶT APK

## ✅ Build Đang Chạy

EAS Build đang build APK development. Theo dõi tại:
https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds

**Thời gian ước tính:** 10-20 phút

---

## 📱 Cài Đặt APK Sau Khi Build Xong

### Bước 1: Download APK
1. Mở link build ở trên
2. Chờ build hoàn tất (màu xanh)
3. Click **"Download"** để tải APK

### Bước 2: Chuyển APK Vào Điện Thoại
**Cách 1:** USB
```
- Kết nối điện thoại với máy tính qua USB
- Copy file APK vào thư mục Downloads của điện thoại
```

**Cách 2:** Google Drive / Cloud
```
- Upload APK lên Google Drive
- Mở Drive trên điện thoại
- Download APK
```

**Cách 3:** Direct Link
```
- EAS Build cung cấp link download trực tiếp
- Mở link trên điện thoại Android
- Download và cài đặt
```

### Bước 3: Bật "Unknown Sources" (Nếu Cần)
```
Settings > Security > Unknown Sources > Bật ON
```

Hoặc:
```
Settings > Apps > Special Access > Install Unknown Apps > Chrome/Files > Cho phép
```

### Bước 4: Cài Đặt APK
1. Mở File Manager
2. Tìm file APK vừa download
3. Nhấn vào file APK
4. Chọn "Install"
5. Chờ cài đặt xong
6. Nhấn "Open" để mở app

---

## 🔍 Kiểm Tra App Sau Khi Cài

### Test Cơ Bản:
- [ ] App mở được
- [ ] Màn hình welcome hiển thị
- [ ] Bottom navigation hoạt động
- [ ] Có thể chuyển giữa các tabs

### Test Đăng Nhập:
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập bằng email/password
- [ ] Đăng nhập Google (nếu đã config)
- [ ] Remember me hoạt động

### Test Features Mới:
- [ ] Live Streams: Xem danh sách live
- [ ] Stories: Xem stories carousel
- [ ] Activity Feed: Xem notifications
- [ ] Videos: Vertical swipe videos
- [ ] Cart: Thêm sản phẩm, checkout
- [ ] Profile: Xem và edit profile

### Test Permissions:
- [ ] Camera (khi tạo live/story)
- [ ] Microphone (khi record voice)
- [ ] Storage (khi upload ảnh)
- [ ] Location (nếu cần)
- [ ] Notifications (khi nhận push)

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### Lỗi: "App not installed"
**Nguyên nhân:** APK bị lỗi hoặc không tương thích
**Giải pháp:**
- Download lại APK
- Xóa app cũ (nếu có) rồi cài lại
- Kiểm tra Android version (cần Android 5.0+)

### Lỗi: "Parse error"
**Nguyên nhân:** File APK bị hỏng
**Giải pháp:**
- Download lại APK
- Kiểm tra file có đầy đủ không bị cắt giữa chừng

### Lỗi: Google Sign In không hoạt động
**Nguyên nhân:** SHA-1 fingerprint chưa đăng ký
**Giải pháp:**
```powershell
# Lấy SHA-1 từ keystore
eas credentials -p android

# Đăng ký SHA-1 vào Firebase Console:
# Firebase > Project Settings > General > Your apps > SHA fingerprints
```

### App crash khi mở
**Nguyên nhân:** Lỗi code hoặc thiếu permissions
**Giải pháp:**
- Kiểm tra logs với: `adb logcat`
- Rebuild với profile "development" để xem error details

---

## 🔄 Update App

Khi có phiên bản mới:
1. Uninstall app cũ (hoặc cài đè)
2. Download APK mới
3. Cài đặt lại

**Lưu ý:** Uninstall sẽ xóa data. Để giữ data, cài đè (overwrite).

---

## 📊 So Sánh Build Profiles

| Profile | Mục Đích | Kích Thước | Dev Tools | Tốc Độ |
|---------|----------|------------|-----------|--------|
| **development** | Test features, debug | ~100MB | ✅ Có | Chậm |
| **preview** | Test trước khi release | ~50MB | ❌ Không | Nhanh |
| **production** | Google Play Store | ~30MB AAB | ❌ Không | Rất nhanh |

**Khuyến nghị:** 
- Dùng **development** để test và debug
- Dùng **preview** để test performance thật
- Dùng **production** khi upload lên Store

---

## 🎯 Next Steps Sau Khi Test APK

1. **Thu thập feedback**
   - Test với người dùng thật
   - Ghi lại các bug/issues
   - Cải thiện UX

2. **Tối ưu performance**
   - Giảm kích thước APK
   - Tăng tốc độ load
   - Optimize images

3. **Chuẩn bị Production**
   ```powershell
   # Build production AAB (App Bundle)
   eas build --profile production --platform android
   ```

4. **Upload Google Play Store**
   - Tạo listing trên Play Console
   - Upload AAB file
   - Điền thông tin app
   - Submit for review

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds
2. Xem error details trong build logs
3. Rebuild với config đơn giản hơn
4. Liên hệ support nếu cần

**Build hiện tại:** Development APK
**Link theo dõi:** https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds
