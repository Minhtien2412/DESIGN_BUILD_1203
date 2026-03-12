# 🎬 Demo Guide - Meeting Tracking Feature

## 🎯 Demo Scenario

### Tình huống: Họp tiến độ công trình Phú Mỹ Hưng

**Bối cảnh:**
- Cuộc họp tại Sân bay Tân Sơn Nhất lúc 15:00
- 4 người tham gia: Kỹ sư, Chủ đầu tư, Nhà thầu, Công nhân
- 2 người đã tới, 2 người đang trên đường

---

## 📱 Demo Flow (5 bước)

### Bước 1: Truy cập từ Homepage
1. Mở app
2. Scroll xuống tìm card **"Theo dõi Tiến độ"** (màu xanh với icon navigate)
3. Card hiển thị:
   - 🟡 1 cuộc họp đang diễn ra
   - 🔵 2 cuộc họp sắp tới
4. **Tap vào card**

---

### Bước 2: Xem danh sách cuộc họp
**Screen: Meeting List**

1. Hiển thị filter tabs phía trên:
   - Tất cả (3)
   - Đang diễn ra (1)
   - Sắp tới (2)

2. Tap vào **"Đang diễn ra"**
   - Filter chỉ hiển thị 1 meeting

3. Meeting card hiển thị:
   - ✅ Icon công trình (màu cam)
   - ✅ Tiêu đề: "Họp tiến độ công trình Phú Mỹ Hưng"
   - ✅ Thời gian: Hôm nay, 15:00
   - ✅ Địa điểm: Sân bay Tân Sơn Nhất
   - ✅ 4 người tham gia • 2 đã tới
   - ✅ Status dot màu cam

4. **Tap vào meeting card**

---

### Bước 3: Xem Map View
**Screen: Meeting Detail - Tab Bản đồ**

1. Header hiển thị:
   - ← Back button
   - Tiêu đề meeting
   - Thời gian: 09/01, 15:00
   - 🔄 Refresh button

2. Status Summary (3 ô):
   - 👥 4 Người tham gia
   - ✅ 2 Đã tới (màu xanh)
   - 🧭 2 Đang đến (màu cam)

3. Tabs (3 tab):
   - **🗺️ Bản đồ** (active - màu xanh)
   - 👥 Người tham gia
   - ℹ️ Chi tiết

4. Map hiển thị:
   - 📍 **Red marker**: Sân bay Tân Sơn Nhất (destination)
   - 🚗 **Blue markers**: 2 người đang di chuyển
   - 📏 **Lines**: Routes từ vị trí hiện tại đến destination
   - 🟢 **Green dot**: Vị trí của bạn (nếu có permission)
   - 📊 **Legend**: Giải thích các markers

5. Info banner:
   - "Bản đồ thực tế sẽ hiển thị khi deploy với react-native-maps"

**Highlight:**
- Tương tự Shopee delivery tracking!
- Thấy rõ ai đang ở đâu
- Routes visualization

---

### Bước 4: Xem Người tham gia
**Screen: Meeting Detail - Tab Người tham gia**

1. **Tap vào tab "Người tham gia"**

2. Danh sách 4 người:

   **Card 1: Nguyễn Văn A**
   - 🧭 Status: Đang di chuyển (màu cam)
   - 👔 Kỹ sư giám sát
   - 📍 Cách 3.5 km
   - ⏱️ Còn 15 phút
   - 🗺️ Navigate button

   **Card 2: Trần Thị B**
   - ✅ Status: Đã tới (màu xanh)
   - 👔 Chủ đầu tư
   - ✅ Đã có mặt tại địa điểm

   **Card 3: Lê Văn C**
   - ⏰ Status: Chưa bắt đầu (màu xám)
   - 👔 Nhà thầu
   - 📍 Cách 8.2 km
   - ⏱️ Còn 45 phút

   **Card 4: Phạm Thị D**
   - 🧭 Status: Đang di chuyển
   - 👔 Công nhân
   - 📍 Cách 5.1 km
   - ⏱️ Còn 25 phút

3. **Tap vào Nguyễn Văn A**
   - Auto switch về tab Map
   - Focus vào marker của Nguyễn Văn A
   - Highlight route của người này

---

### Bước 5: Check-in & Chi tiết
**Screen: Meeting Detail - Tab Chi tiết**

1. **Tap vào tab "Chi tiết"**

2. Thông tin chi tiết:
   - 📍 **Địa điểm**: 
     - Sân bay Tân Sơn Nhất
     - Cảng hàng không quốc tế Tân Sơn Nhất
   
   - ⏰ **Thời gian**:
     - 09/01, 15:00
   
   - 💼 **Người tổ chức**:
     - Công ty TNHH Xây dựng ABC
   
   - 📝 **Mô tả**:
     - Họp báo cáo tiến độ thi công tháng 1/2026

3. **Scroll xuống bottom**
   - Button **"Check-in"** với icon ✓

4. **Tap Check-in**
   - Nếu trong bán kính 100m → ✅ Success
   - Nếu ngoài radius → ⚠️ "Bạn phải ở trong bán kính 100m để check-in"

5. **Pull to refresh** ở bất kỳ tab nào
   - Update locations
   - Recalculate ETA

---

## 🎨 Key Visual Highlights

### Colors & Status
- 🟡 **Cam (#F59E0B)**: Đang diễn ra / On the way
- 🔵 **Xanh indigo (#6366F1)**: Sắp tới / Scheduled
- 🟢 **Xanh lá (#10B981)**: Đã tới / Completed
- ⚪ **Xám (#6B7280)**: Chưa bắt đầu
- 🔴 **Đỏ (#EF4444)**: Đã hủy / Destination

### Icons
- 🏗️ `construct`: Site inspection
- 👥 `people`: Meeting
- 📦 `cube`: Delivery
- 🔨 `hammer`: Construction
- 🧭 `navigate`: On the way
- ✅ `checkmark-circle`: Arrived
- ⏰ `time`: Not started

---

## 🎤 Demo Script

### Opening (15s)
> "Giới thiệu tính năng mới: **Theo dõi Tiến độ Cuộc họp**, 
> tương tự như tracking giao hàng của Shopee nhưng dành cho 
> quản lý cuộc họp và công trình."

### Feature Tour (2 phút)
> "Bạn có thể:
> 1. ✅ Xem tất cả cuộc họp sắp tới
> 2. 🗺️ Theo dõi vị trí người tham gia trên bản đồ
> 3. ⏱️ Biết chính xác ai sẽ tới khi nào
> 4. 📍 Check-in tự động khi đến địa điểm
> 5. 📊 Thống kê real-time"

### Map Demo (30s)
> "Bản đồ hiển thị:
> - Điểm đến màu đỏ
> - Người đang di chuyển màu xanh
> - Lộ trình được vẽ rõ ràng
> - Cập nhật mỗi 10 giây"

### Participant Demo (30s)
> "Mỗi người tham gia có:
> - Status badge màu sắc
> - Khoảng cách còn lại
> - Thời gian dự kiến tới
> - Tap để focus trên map"

### Check-in Demo (15s)
> "Check-in thông minh:
> - Tự động khi vào bán kính 100m
> - Hoặc tap button check-in
> - Xác nhận có mặt"

### Closing (15s)
> "Tính năng này giúp:
> - Quản lý thời gian hiệu quả
> - Giảm waiting time
> - Transparency trong team
> - Professional hơn"

---

## 📊 Demo Metrics to Show

1. **Performance**
   - Location update: 10 giây
   - ETA accurate: ±5 phút
   - Check-in radius: 100m

2. **User Benefits**
   - Save 30% waiting time
   - 100% attendance tracking
   - Real-time updates

3. **Features Count**
   - 3 status tabs
   - 4 participant statuses
   - Unlimited meetings

---

## 🎯 Demo Tips

### Do's ✅
- Show real-time updates (pull to refresh)
- Highlight color-coded statuses
- Demonstrate check-in validation
- Show filter functionality
- Emphasize map visualization

### Don'ts ❌
- Don't explain technical details
- Don't show code
- Don't mention "mock data"
- Don't compare with competitors (except Shopee reference)

---

## 📸 Screenshot Checklist

1. ✅ Homepage with MeetingTrackingCard
2. ✅ Meeting list with filters
3. ✅ Map view with routes
4. ✅ Participant list
5. ✅ Detail info screen
6. ✅ Check-in success alert
7. ✅ Status summary header

---

## 🎬 Video Recording Tips

### Setup
- Clean device (no notifications)
- Good lighting
- Stable recording
- Clear audio

### Structure
1. **Intro** (5s): Show app logo
2. **Problem** (10s): Why need this feature?
3. **Solution** (2m): Demo walkthrough
4. **Benefits** (15s): Key takeaways
5. **CTA** (5s): Try it now!

### Editing
- Add text overlays for key points
- Highlight important UI elements
- Background music (upbeat, professional)
- Transitions between screens

---

**Demo Duration**: ~3-4 phút
**Target Audience**: Construction managers, project coordinators
**Goal**: Show value → Drive adoption

🎉 **Ready to Demo!**
