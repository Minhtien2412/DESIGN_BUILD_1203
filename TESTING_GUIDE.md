# 🧪 Construction App - Complete Testing Guide

## 📱 App Overview
**Ứng dụng quản lý thi công xây dựng** - Chuyển đổi từ Grab-style app sang Construction Management

---

## ✅ Pre-Testing Checklist

### 1. Start Development Server
```bash
npm start
# or
npm run web  # For web testing
```

### 2. Clear Cache (if needed)
```bash
npm start -- --clear
```

### 3. Check No Errors
- Run: Check terminal for compilation errors
- TypeScript: All files should compile without errors ✅ (Verified)
- ESLint: No critical warnings

---

## 🎯 Complete Testing Scenarios

### **Test 1: Home Screen → Construction Booking Flow**

**Steps:**
1. Open app → Navigate to **Home** tab
2. Scroll to section **"TIỆN ÍCH XÂY DỰNG"**
3. Tap **"Thợ xây"** icon

**Expected Results:**
- ✅ Navigate to `/construction/booking`
- ✅ "Thợ Xây" worker type is **pre-selected** (highlighted)
- ✅ Price shows: 500,000đ/ngày
- ✅ Description: "Xây tường, đổ bê tông, làm móng"

**Continue Booking:**
4. Enter site address: "123 Đường ABC, Quận 1"
5. Select work days: "3"
6. Enter description: "Xây tường tầng 1"
7. Tap promo code field → Enter: **"BUILD15"**
8. Tap "Áp dụng"

**Expected Results:**
- ✅ Discount applied: -15%
- ✅ Original price: 1,500,000đ (500k × 3 days)
- ✅ Discounted price: 1,275,000đ
- ✅ Green badge shows: "Giảm 15%"

9. Select payment: **"Chuyển khoản"**
10. Tap **"Đặt Dịch Vụ"** button

**Expected Results:**
- ✅ Navigate to `/construction/tracking`
- ✅ Tracking screen appears with status: "Đang tìm thợ"

---

### **Test 2: Worker Tracking Status Progression**

**Watch Status Animation (Auto-progression):**

**0-3 seconds: Finding**
- ✅ Icon: 🔍 Search spinner
- ✅ Text: "Đang tìm thợ phù hợp..."
- ✅ Map shows: Searching animation
- ✅ Progress bar: 0%

**3-6 seconds: Accepted**
- ✅ Icon: ✓ Checkmark circle
- ✅ Text: "Thợ đã chấp nhận"
- ✅ Worker card appears:
  - Name: "Nguyễn Văn Thợ"
  - Avatar image
  - Rating: 4.9 ⭐
  - Specialty: "Thợ Xây"
- ✅ Call & Chat buttons appear
- ✅ ETA shows: "15 phút"
- ✅ Progress bar: 25%

**6-10 seconds: Traveling**
- ✅ Icon: 🚗 Car
- ✅ Text: "Đang đến công trường"
- ✅ ETA countdown starts
- ✅ Worker pin animates on map (pulse effect)
- ✅ Progress bar: 50%

**10-15 seconds: Working**
- ✅ Icon: 🔨 Hammer
- ✅ Text: "Đang làm việc"
- ✅ Timer shows work duration
- ✅ Work details card visible
- ✅ Progress bar: 75%

**15+ seconds: Completed**
- ✅ Icon: ✅ Double checkmark
- ✅ Text: "Hoàn thành"
- ✅ Confetti animation (optional)
- ✅ **2 Action Buttons Appear:**
  1. "Xem Tiến Độ & Thanh Toán" (green outlined)
  2. "Đánh giá dịch vụ" (green filled)
- ✅ Progress bar: 100%

**Test Interactive Elements:**
- Tap **Call button** → Alert shows phone number
- Tap **Chat button** → Navigate to `/messages`
- Tap **Cancel** → Confirmation dialog

---

### **Test 3: Progress & Payment Management**

**From Tracking Completed State:**
1. Tap **"Xem Tiến Độ & Thanh Toán"** button

**Expected Results:**
- ✅ Navigate to `/construction/progress`
- ✅ Project card shows:
  - Title: "Xây Nhà 3 Tầng"
  - Status badge: "Đang thi công" (blue dot)
  - Address with location icon
  - Progress bar: 30% (animated fill)
  - Paid: 135,000,000đ / Total: 450,000,000đ
- ✅ Worker section:
  - Avatar: Round 48px
  - Name: "Nguyễn Văn A"
  - Role: "Trưởng công trình"
  - Call & Chat buttons (green circular)

**Scroll Down - View Milestones:**

**Milestone 1: Móng và Kết cấu (30%)**
- ✅ Timeline dot: Green with checkmark
- ✅ Status badge: "Đã thanh toán" (green bg)
- ✅ Amount: 135,000,000đ (30%)
- ✅ Dates: 2025-10-01 → 2025-10-20
- ✅ Completion: 2025-10-18 (green checkmark)
- ✅ 3 progress photos (80×80 thumbnails)
- ✅ "Đã thanh toán" indicator (green)

**Milestone 2: Tường và Mái (40%)**
- ✅ Timeline dot: Blue with sync icon
- ✅ Status badge: "Đang thực hiện" (blue bg)
- ✅ Amount: 180,000,000đ (40%)
- ✅ Dates: 2025-10-21 → 2025-11-25
- ✅ 2 progress photos + "Thêm ảnh" upload button
- ✅ Upload button: Dashed border, camera icon
- ✅ No payment button yet (not completed)

**Milestone 3: Hoàn thiện (30%)**
- ✅ Timeline dot: Gray with outline circle
- ✅ Status badge: "Chưa bắt đầu" (gray bg)
- ✅ Amount: 135,000,000đ (30%)
- ✅ Dates: 2025-11-26 → 2025-12-31
- ✅ No photos yet
- ✅ No actions available

**Test Interactions:**
2. Tap any **photo thumbnail** → Alert (view full photo)
3. Tap **"Thêm ảnh"** button → Alert (upload photo)
4. Tap **worker call button** → Alert with phone
5. Tap **worker chat button** → Navigate to `/messages`
6. Tap **receipt icon** (header) → Alert (payment history)

---

### **Test 4: Materials Shopping Flow**

**From Home Screen:**
1. Scroll to **"MUA SẮM THIẾT BỊ"** section
2. Tap any icon (e.g., "Thiết bị bếp", "Điện", "Nước")

**Expected Results:**
- ✅ Navigate to `/materials/index`
- ✅ Header: "Mua Sắm Vật Liệu"
- ✅ Search bar with clear button
- ✅ Cart button with badge (shows "0")
- ✅ 8 Category chips (horizontal scroll):
  - Tất cả, Xi măng, Gạch, Điện, Nước, Sơn, Cửa, Vệ sinh
  - Each with colored icon
  - "Tất cả" selected (green bg)

**Browse Suppliers:**
- ✅ 6 supplier cards visible:
  1. Thế Giới Vật Liệu (verified ✓, "Giảm 10%")
  2. Điện Nước Hoàng Long (verified ✓)
  3. Thiết Bị Vệ Sinh Toto ("Freeship")
  4. Xi Măng - Gạch Ngói (verified ✓)
  5. Sơn - Bả Dulux (verified ✓, "Giảm 15%")
  6. Cửa - Cửa Sổ Nhôm Kính

**For Each Card Check:**
- ✅ Supplier image (400×180)
- ✅ Rating stars (yellow)
- ✅ Reviews count
- ✅ Category label
- ✅ Delivery time icon + text
- ✅ Distance icon + text
- ✅ Min order amount (green badge)
- ✅ Promo tag (red corner) if applicable
- ✅ Verified badge (shield) if applicable

**Test Category Filter:**
3. Tap **"Xi măng"** category chip

**Expected:**
- ✅ Chip background turns green
- ✅ Suppliers filter to show only cement suppliers
- ✅ Other chips remain gray

4. Test **search bar**: Type "sơn"

**Expected:**
- ✅ Clear button appears (X icon)
- ✅ Results filter to suppliers matching "sơn"
- ✅ Tap X → Clear search

---

### **Test 5: Supplier Detail & Add to Cart**

**Continue from Materials Shopping:**
1. Tap first supplier card: **"Thế Giới Vật Liệu Xây Dựng"**

**Expected Results:**
- ✅ Navigate to `/materials/supplier/1`
- ✅ Parallax header with supplier image
- ✅ Overlay shows:
  - Supplier name (white text)
  - Verified shield icon (green)
  - Rating: 4.9 ⭐
  - Delivery time + Distance icons
- ✅ Header opacity fades in on scroll
- ✅ Back & Cart buttons (white circular)

**Scroll Down - View Products:**
- ✅ Category chips (horizontal scroll):
  - Tất cả, Xi Măng, Gạch, Cát - Đá, Gạch Ốp Lát, Sắt Thép, Sơn, Ống Nước
  - "Tất cả" selected initially
- ✅ 8 Material product cards:

**Product Card Format Check:**
- ✅ Thumbnail left (120×120)
- ✅ Product name (bold, 2 lines max)
- ✅ Description (gray, 2 lines max)
- ✅ Min quantity badge (green text)
- ✅ Price row:
  - Original price (strikethrough if discount)
  - Current price (red, bold)
  - Unit text (/bao, /viên, /m³)
  - Discount badge (-10%, -15%)
- ✅ Add button (green circle, + icon)
- ✅ Popular badge (flame icon) on some
- ✅ Out of stock text (gray) if unavailable

**Test Add to Cart:**
2. Tap **green "+" button** on "Xi Măng Portland PCB40"

**Expected:**
- ✅ Alert shows: "Đã thêm vào giỏ"
- ✅ Message: "Xi Măng Portland PCB40 x10" (respects minQuantity)
- ✅ Cart badge updates (if counter implemented)

3. Try adding more products:
- "Gạch Block" (min 100)
- "Sơn Dulux" (with 15% discount)

4. Test category filter: Tap **"Sơn"**
- ✅ Only paint products shown

5. Tap **Cart icon** (header)
- ✅ Navigate to `/shopping/cart`
- ✅ Cart shows added items

---

### **Test 6: Chat System**

**Access Chat from Multiple Points:**

**Option A - From Tracking:**
1. Go to tracking screen (completed state)
2. Tap **Chat button** (bubble icon)

**Option B - From Progress:**
1. Go to progress screen
2. Tap worker **Chat button** (bubble icon)

**Expected Results:**
- ✅ Navigate to `/messages`
- ✅ Header shows:
  - Back button
  - User avatar (round)
  - Name: "Nguyễn Văn Thợ"
  - Online status: "Đang hoạt động" (green dot)
  - Video & Info buttons
- ✅ Message list shows 4 messages:
  - M1: "Xin chào! Tôi đang trên đường đến công trường"
  - M2: "Tôi đang ở cổng chính..."
  - M3: "Vâng, tôi sẽ vào ngay..."
  - M4: "Cảm ơn anh!"
- ✅ Messages have:
  - Avatar (worker messages only)
  - Timestamp
  - Status icons (checkmarks)
  - Bubble colors (worker: gray, user: green)

**Test Typing Indicator:**
- ✅ Wait 2-3 seconds → "Đang nhập..." appears
- ✅ Animated dots bounce
- ✅ After 3 seconds → New message: "Tôi đã đến công trường rồi ạ"

**Test Sending Message:**
3. Type in input: "Ok, cảm ơn anh"
4. Tap **Send button** (paper plane icon)

**Expected:**
- ✅ Message appears in list (green bubble, right aligned)
- ✅ Input clears
- ✅ Scroll to bottom
- ✅ Status: "Đang gửi..." → "Đã gửi" (checkmark)

**Test Quick Actions:**
5. Tap **Camera icon** → Alert (attach photo)
6. Tap **Mic icon** → Alert (voice message)
7. Tap **Attachment icon** → Alert (attach file)

---

### **Test 7: Rating System**

**From Tracking Completed:**
1. Tap **"Đánh giá dịch vụ"** button

**Expected Results:**
- ✅ Full screen rating modal
- ✅ Header: Close button (X, top-right)
- ✅ Worker card:
  - Avatar (80×80, round)
  - Name: "Nguyễn Văn Thợ"
  - Specialty: "Thợ Xây • 5 ngày làm việc"
  - Work cost: 2,500,000đ (large, cyan)
  - Work date: Today's date

**Test Star Rating:**
2. Tap **1st star**

**Expected:**
- ✅ Star fills yellow
- ✅ Star scales up (animation)
- ✅ Label shows: "Rất tệ" (red text)

3. Tap **3rd star**
- ✅ 3 stars filled
- ✅ Label: "Bình thường" (orange)

4. Tap **5th star**
- ✅ All 5 stars filled (gold)
- ✅ Label: "Tuyệt vời" (green text)
- ✅ Scale animation

**Test Quick Comments:**
5. Tap chips:
- "Thợ thân thiện" → Selected (green bg)
- "Làm việc cẩn thận" → Selected
- "Tay nghề tốt" → Selected

**Expected:**
- ✅ Selected chips: Green bg, white text
- ✅ Unselected chips: Gray bg, dark text
- ✅ Toggle on/off works

**Test Review Text:**
6. Tap text area
7. Type: "Thợ làm việc rất tốt, tôi rất hài lòng!"

**Expected:**
- ✅ Text appears in field
- ✅ Character count updates (if implemented)
- ✅ Keyboard appears

**Test Photo Upload:**
8. Tap **"Thêm hình ảnh"** button

**Expected:**
- ✅ Image picker opens (simulated alert for now)

**Submit Rating:**
9. Tap **"Gửi đánh giá"** button

**Expected:**
- ✅ Button shows loading state
- ✅ After 1.5s: Alert "Cảm ơn bạn!"
- ✅ Message: "Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ"
- ✅ Tap OK → Navigate back

**Test Validation:**
10. Clear all stars → Tap Submit

**Expected:**
- ✅ Alert: "Vui lòng chọn số sao đánh giá"

---

### **Test 8: Navigation & Deep Linking**

**Test Back Navigation:**
1. Progress → Back → Should go to tracking
2. Supplier Detail → Back → Materials list
3. Booking → Back → Home
4. Chat → Back → Previous screen
5. Rating → X button → Previous screen

**Test Tab Navigation:**
1. Switch between tabs: Home, Projects, Notifications, Profile
2. Tap same tab twice → Should scroll to top
3. Badge counts update correctly

**Test Deep Links (if implemented):**
- `/construction/booking?workerType=electrician`
- `/materials/supplier/1`
- `/construction/progress`

---

## 🐛 **Known Issues & Edge Cases**

### **Check These:**

1. **Empty States:**
   - [ ] Materials with no results (search "xyz")
   - [ ] Progress with no photos
   - [ ] Chat with no messages

2. **Loading States:**
   - [ ] Booking submission (button disabled)
   - [ ] Rating submission (loading spinner)
   - [ ] Image uploads (progress indicator)

3. **Error Handling:**
   - [ ] Invalid promo code → Error message
   - [ ] Network failure → Retry option
   - [ ] Invalid inputs → Validation errors

4. **Responsive Design:**
   - [ ] Small screens (iPhone SE)
   - [ ] Large screens (iPad)
   - [ ] Landscape mode
   - [ ] Web browser (if applicable)

5. **Performance:**
   - [ ] Smooth scrolling (60fps)
   - [ ] Fast navigation transitions
   - [ ] Image loading (no jank)
   - [ ] Memory usage (no leaks)

---

## ✅ **Testing Checklist Summary**

```
Home Screen
✅ Service icons navigate correctly
✅ Utilities pre-select worker type
✅ Equipment icons go to materials
✅ Search works
✅ Videos play

Construction Booking
✅ Worker selection works
✅ Promo codes apply discounts
✅ Price calculates correctly
✅ Form validation works
✅ Navigate to tracking

Worker Tracking
✅ Status progression works (5 stages)
✅ Animations smooth
✅ Worker card appears
✅ Call/Chat buttons work
✅ Progress bar updates
✅ Completed state shows buttons

Progress & Payment
✅ Project card shows data
✅ Progress bar animates
✅ 3 milestones display correctly
✅ Timeline dots colored right
✅ Photos display
✅ Upload button works
✅ Payment actions available

Materials Shopping
✅ 6 suppliers display
✅ Categories filter works
✅ Search filters results
✅ Cards have all info
✅ Navigate to supplier detail

Supplier Detail
✅ Parallax header works
✅ 8 products display
✅ Category filter works
✅ Add to cart works
✅ Min quantity respected
✅ Discounts show correctly

Chat System
✅ Messages display
✅ Typing indicator works
✅ Send message works
✅ Worker context correct
✅ Animations smooth

Rating System
✅ Star animation works
✅ Quick comments toggle
✅ Text input works
✅ Photo upload triggers
✅ Validation works
✅ Submit success
```

---

## 🚀 **Performance Benchmarks**

**Target Metrics:**
- [ ] App launch: < 3 seconds
- [ ] Screen transitions: < 300ms
- [ ] Scroll FPS: 60fps
- [ ] Image load: < 1s
- [ ] Button response: Immediate

---

## 📝 **Test Results Log**

| Test | Status | Notes | Issues |
|------|--------|-------|--------|
| Home → Booking | ⏳ Pending | | |
| Tracking Animation | ⏳ Pending | | |
| Progress Timeline | ⏳ Pending | | |
| Materials Shopping | ⏳ Pending | | |
| Supplier Detail | ⏳ Pending | | |
| Chat Messages | ⏳ Pending | | |
| Rating Submission | ⏳ Pending | | |
| Navigation Flow | ⏳ Pending | | |

**Legend:**
- ⏳ Pending
- ✅ Pass
- ❌ Fail
- ⚠️ Warning

---

## 🎯 **Ready for Production?**

**Checklist:**
- [ ] All test scenarios pass
- [ ] No console errors
- [ ] No TypeScript errors ✅ (Verified)
- [ ] All animations smooth
- [ ] All images load
- [ ] All navigation works
- [ ] Forms validate correctly
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Empty states designed

**When all checked → Deploy! 🚀**

---

**Last Updated:** November 13, 2025
**App Version:** 1.0.0
**Test Coverage:** 8/8 Major Flows
