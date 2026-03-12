# 🧪 Phase 1 E2E Manual Testing Guide
**Quick Start:** Follow this guide to manually test all Phase 1 features

---

## 🎬 Pre-Test Setup

### 1. Ensure App is Running
```bash
# Check if expo is running
npx expo start

# If not running, start it
npm start
```

### 2. Open App on Device/Emulator
- **Android Emulator:** Press 'a' in terminal
- **iOS Simulator:** Press 'i' in terminal  
- **Physical Device:** Scan QR code with Expo Go app
- **Web Browser:** Press 'w' in terminal

### 3. Login/Create Account
- If not logged in, sign up or use test account:
  - Email: `test@demo.com`
  - Password: `test123`

---

## ✅ Test Scenario 1: Profile Avatar Upload (15 min)

### Current Status: ⏳ READY TO TEST

### Step 1.1: Navigate to Profile
```
Action: Tap bottom tab "Cá nhân" (Person icon)
Expected: Profile screen opens, shows user info
Check: ☐ Profile loads ☐ Avatar placeholder shows (if no avatar)
```

### Step 1.2: Upload from Gallery
```
Action: Tap on avatar or "Chỉnh sửa ảnh đại diện" button
Action: Select "Chọn từ thư viện"
Action: Pick any image from gallery
Expected: 
  - Image picker opens
  - Selected image shows preview
  - Upload starts automatically
  - Progress indicator shows (0% → 100%)
  - Success message: "Cập nhật ảnh đại diện thành công"
  - Avatar updates immediately in Profile screen
Check: 
  ☐ Image picker works
  ☐ Progress shows
  ☐ Success message appears
  ☐ Avatar updates
```

### Step 1.3: Verify Avatar Sync
```
Action: Navigate to bottom tab "Trang chủ" → then "Menu" (≡ icon if exists)
Expected: Avatar shows in Menu/Header
Check: ☐ Avatar displays in Menu ☐ Same image as Profile
```

### Step 1.4: Upload from Camera (Optional - requires physical device)
```
Action: Tap avatar → "Chụp ảnh mới"
Action: Take photo with camera
Expected: Camera opens, photo taken, uploads successfully
Check: ☐ Camera works ☐ Upload succeeds
```

### Step 1.5: Delete Avatar
```
Action: Tap avatar → "Xóa ảnh đại diện"
Expected: Confirmation alert: "Bạn có chắc muốn xóa ảnh đại diện?"
Action: Tap "Xác nhận"
Expected: 
  - Avatar reverts to placeholder (icon or initials)
  - Menu tab also shows placeholder
Check: 
  ☐ Confirmation alert shows
  ☐ Avatar removed from Profile
  ☐ Avatar removed from Menu
```

### ⚠️ Known Limitation
- Without backend: Avatar stored in memory only
- **Test Persistence:** Close app → Reopen → Avatar may not persist
- **This is expected** until backend is implemented

### 📝 Test Results
```
Status: ☐ PASS ☐ FAIL ☐ BLOCKED
Issues Found:
[List any bugs, UI issues, crashes]

Notes:
[Performance, UX feedback]
```

---

## ✅ Test Scenario 2: Project Creation (20 min)

### Current Status: ⏳ READY TO TEST

### Step 2.1: Navigate to Create Project
```
Action: Tap bottom tab "Dự án"
Action: Look for "Tạo dự án mới" button or FAB (+ icon)
Action: Tap create button
Expected: Project creation form opens
Check: ☐ Form screen loads ☐ All fields visible
```

### Step 2.2: Test Empty Title Validation
```
Action: Leave all fields empty
Action: Tap "Tạo dự án" button
Expected: Error message under title field: "Tên dự án không được để trống"
Check: ☐ Error displays ☐ Form doesn't submit
```

### Step 2.3: Test Short Title Validation
```
Action: Enter title "AB" (2 characters)
Action: Tap "Tạo dự án"
Expected: Error: "Tên dự án phải có ít nhất 3 ký tự"
Check: ☐ Validation works
```

### Step 2.4: Test Invalid Budget
```
Action: Enter title "Dự án Test 123"
Action: Enter budget "abc123" (contains letters)
Action: Tap "Tạo dự án"
Expected: Error: "Ngân sách phải là số"
Check: ☐ Numeric validation works
```

### Step 2.5: Test Invalid Date Range
```
Action: Enter title "Dự án Test 123"
Action: Select Start Date: 2025-12-20
Action: Select End Date: 2025-12-15 (BEFORE start date)
Action: Tap "Tạo dự án"
Expected: Error: "Ngày kết thúc phải sau ngày bắt đầu"
Check: ☐ Date validation works
```

### Step 2.6: Test Invalid Phone Format
```
Action: Enter title "Dự án Test 123"
Action: Enter Client Phone "123456" (too short/invalid)
Action: Tap "Tạo dự án"
Expected: Error: "Số điện thoại không hợp lệ"
Check: ☐ Phone validation works (Vietnamese format)
```

### Step 2.7: Create Project - Minimal Fields
```
Action: Clear all fields
Action: Enter title "Nhà Phố Quận 7"
Action: Tap "Tạo dự án"
Expected: 
  - Success alert: "Thành công - Dự án đã được tạo"
  - 2 options: "Xem dự án" | "Tạo dự án khác"
Action: Tap "Xem dự án"
Expected: Navigates to project detail page
Check: 
  ☐ Success alert shows
  ☐ Navigation works
  ☐ Project appears in list
```

### Step 2.8: Create Project - All Fields
```
Action: Tap "Tạo dự án mới" again
Action: Fill ALL fields:
  Title: "Biệt Thự Vinhomes Grand Park"
  Description: "Thiết kế và thi công biệt thự hiện đại 3 tầng"
  Budget: "5000000000" (5 billion VND)
  Start Date: 2025-12-15
  End Date: 2026-06-30
  Location: "Vinhomes Grand Park, Quận 9, TP.HCM"
  Client Name: "Nguyễn Văn A"
  Client Phone: "0901234567"
  Client Email: "nguyenvana@gmail.com"
Action: Tap "Tạo dự án"
Expected: Success alert
Action: Tap "Tạo dự án khác"
Expected: Form resets, all fields empty
Check: 
  ☐ All fields accept input
  ☐ Submit succeeds
  ☐ Form reset works
```

### Step 2.9: Test Keyboard Behavior
```
Action: Tap title field
Expected: Keyboard shows, title field focused
Action: Scroll to bottom fields (Client Email)
Action: Tap Client Email field
Expected: 
  - Keyboard doesn't cover input field
  - On iOS: KeyboardAvoidingView pushes content up
  - On Android: ScrollView allows scrolling above keyboard
Check: 
  ☐ Can see what you're typing
  ☐ No fields hidden behind keyboard
```

### 📝 Test Results
```
Status: ☐ PASS ☐ FAIL ☐ BLOCKED
Issues Found:
[List validation errors not working, UI bugs]

Notes:
[Form UX, keyboard issues, navigation]
```

---

## ✅ Test Scenario 3: Service Booking (25 min)

### Current Status: ⏳ READY TO TEST

### Step 3.1: Navigate to Service Detail
```
Action: From Home screen, navigate to Services section
Action: Find "Thiết kế Nhà Phố" or similar service
Action: OR manually navigate to: /services/detail/house-design
Expected: Service detail page loads
Check: 
  ☐ Hero images display (3 images)
  ☐ Service name shows
  ☐ Rating shows: 4.8/5.0 (156 đánh giá)
  ☐ 6 features display with icons
```

### Step 3.2: Test Image Gallery
```
Action: Swipe hero images left (scroll horizontally)
Expected: 
  - Images scroll smoothly
  - Dots indicator at bottom updates
  - Image 1 → Dot 1 active (white)
  - Image 2 → Dot 2 active
  - Image 3 → Dot 3 active
Check: 
  ☐ Horizontal scroll works
  ☐ Dots indicator syncs
  ☐ Smooth animation
```

### Step 3.3: View Pricing Packages
```
Action: Scroll down to "Gói dịch vụ" section
Expected: See 3 packages:
  1. Gói Cơ Bản: 300.000đ/m² (30 ngày)
     - Bản vẽ 2D
     - Bản vẽ 3D cơ bản
     - 1 lần chỉnh sửa
  
  2. Gói Tiêu Chuẩn: 500.000đ/m² (45 ngày) [RECOMMENDED BADGE]
     - All Cơ Bản features
     - Bản vẽ 3D chi tiết
     - Bản vẽ thi công
     - 2 lần chỉnh sửa
     - Tư vấn phong thủy
  
  3. Gói Cao Cấp: 800.000đ/m² (60 ngày)
     - All Tiêu Chuẩn features
     - Chỉnh sửa không giới hạn
     - Hỗ trợ xin phép
     - Video 3D
     - Thiết kế cảnh quan
Check: 
  ☐ All 3 packages display
  ☐ "Phổ biến nhất" badge on package 2
  ☐ Features list readable
  ☐ Pricing clear
```

### Step 3.4: Select Pricing Package
```
Action: Tap "Gói Cơ Bản" card
Expected: 
  - Card highlights with orange border
  - Background changes to light orange (#FFF8F5)
  - Bottom button enables
  - Button text: "Đặt dịch vụ ngay"
Action: Tap "Gói Tiêu Chuẩn" card
Expected: 
  - Previous selection (Cơ Bản) deselects
  - New card highlights
Check: 
  ☐ Single selection only
  ☐ Visual feedback clear
  ☐ Bottom button updates
```

### Step 3.5: View Reviews
```
Action: Scroll to "Đánh giá" section
Expected: See 3 reviews:
  - Review 1: Nguyễn Văn A, 5 stars, positive comment
  - Review 2: Trần Thị B, 5 stars, positive comment  
  - Review 3: Lê Văn C, 4 stars, constructive feedback
Check: 
  ☐ Avatar/icon shows
  ☐ Star rating displays
  ☐ Comments readable
  ☐ Date shows
```

### Step 3.6: Test Bottom Button - No Package
```
Action: Scroll back up, deselect all packages (or refresh page)
Expected: 
  - Bottom button disabled (gray background)
  - Button text: "Vui lòng chọn gói dịch vụ"
Action: Try tapping button
Expected: Nothing happens (button disabled)
Check: ☐ Button disabled state works
```

### Step 3.7: Open Booking Form
```
Action: Select any package
Action: Tap "Đặt dịch vụ ngay"
Expected: 
  - Form screen slides in/navigates
  - Header: "Thông tin đặt dịch vụ"
  - Subheader: "Thiết kế Nhà Phố"
  - Badge shows selected package: "Gói: Gói Tiêu Chuẩn"
  - Form fields:
    * Họ và tên *
    * Số điện thoại *
    * Email
    * Diện tích (m²) *
    * Địa điểm
    * Ghi chú thêm (textarea)
Check: 
  ☐ Form displays
  ☐ Package badge correct
  ☐ All fields present
```

### Step 3.8: Test Form Validation - Empty Fields
```
Action: Leave all fields empty
Action: Tap "Gửi yêu cầu"
Expected: Errors display:
  - "Vui lòng nhập họ tên"
  - "Vui lòng nhập số điện thoại"
  - "Vui lòng nhập diện tích"
Check: 
  ☐ All 3 errors show
  ☐ Red error text under fields
  ☐ Form doesn't submit
```

### Step 3.9: Test Form Validation - Invalid Phone
```
Action: Enter:
  Name: "Nguyễn Văn B"
  Phone: "123" (too short)
  Area: "100"
Action: Tap "Gửi yêu cầu"
Expected: Error: "Số điện thoại không hợp lệ"
Check: ☐ Phone validation works
```

### Step 3.10: Test Form Validation - Invalid Area
```
Action: Change:
  Area: "abc" (not a number)
Action: Tap "Gửi yêu cầu"
Expected: Error: "Diện tích phải là số dương"
Check: ☐ Numeric validation works
```

### Step 3.11: Submit Valid Booking
```
Action: Fill all fields:
  Name: "Trần Thị C"
  Phone: "0987654321"
  Email: "tranthic@gmail.com"
  Area: "120"
  Location: "Quận 7, TP.HCM"
  Notes: "Cần tư vấn thêm về phong thủy và hướng nhà"
Action: Tap "Gửi yêu cầu"
Expected: 
  - Success alert: "Thành công"
  - Message: "Yêu cầu đặt dịch vụ của bạn đã được gửi. Chúng tôi sẽ liên hệ với bạn trong 24h."
Action: Tap "OK"
Expected: 
  - Navigates back to service detail or home
  - Form data cleared
Check: 
  ☐ Success alert shows
  ☐ Navigation works
  ☐ No crash
```

### Step 3.12: Cancel Booking Form
```
Action: Open booking form again
Action: Enter some data (don't fill completely)
Action: Tap "Hủy bỏ" button
Expected: 
  - Returns to service detail page
  - Form data not saved
  - Can start fresh booking
Check: ☐ Cancel works without saving
```

### Step 3.13: Test Other Service Types
```
Action: Navigate to /services/detail/interior-design
Expected: 
  - Different pricing: 250k, 450k, 700k per m²
  - Different features (color palette, furniture, etc.)
  - Different reviews
Check: ☐ Interior design service loads correctly

Action: Navigate to /services/detail/permit
Expected: 
  - Flat pricing (not per m²): 5.000.000đ, 10.000.000đ
  - Different features (document prep, submission)
Check: ☐ Permit service loads correctly

Action: Navigate to /services/detail/feng-shui
Expected: 
  - Flat pricing: 2.000.000đ, 5.000.000đ
  - Different features (compass, consultation)
Check: ☐ Feng shui service loads correctly
```

### 📝 Test Results
```
Status: ☐ PASS ☐ FAIL ☐ BLOCKED
Issues Found:
[Gallery bugs, form validation, navigation issues]

Notes:
[UX feedback, performance, design issues]
```

---

## 🔄 Integration Tests (10 min)

### Test 1: Avatar Persistence Across Screens
```
1. Upload avatar in Profile
2. Navigate to Projects tab
3. Check if avatar shows in header/menu
4. Create a new project
5. Check if avatar still shows
6. Navigate back to Home
7. Check if avatar persists
Result: ☐ PASS ☐ FAIL
```

### Test 2: Multiple Projects State
```
1. Create 3 projects:
   - "Nhà Phố A"
   - "Biệt Thự B"  
   - "Căn Hộ C"
2. Go to Projects list
3. Verify all 3 show in list
4. Tap Project #2 → Check details correct
5. Go back → Tap Project #1 → Check details
Result: ☐ PASS ☐ FAIL
```

### Test 3: Service to Notifications (if implemented)
```
1. Book a service
2. Navigate to Notifications tab
3. Check for booking confirmation notification
4. Tap notification → Verify navigation
Result: ☐ PASS ☐ FAIL ☐ NOT IMPLEMENTED
```

---

## 🐛 Bug Report Template

### Bug #1
```
Title: [Brief description]
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
Steps to Reproduce:
1.
2.
3.
Expected:
Actual:
Screenshots: [Attach if possible]
Device: [Android/iOS, version]
```

---

## ✅ Final Checklist

### Before Submitting Results
- [ ] All 3 scenarios tested
- [ ] Results documented in each section
- [ ] Screenshots taken for bugs
- [ ] Performance notes recorded
- [ ] Device info recorded

### Update Documents
- [ ] Update PHASE_1_E2E_TEST_PLAN.md with results
- [ ] Update PHASE_1_COMPLETION_REPORT.md testing section
- [ ] Create bug tickets if needed

### Next Steps
- [ ] If PASS: Mark Phase 1 frontend testing complete
- [ ] If FAIL: Create bug report, fix issues, retest
- [ ] Wait for backend → Retest with real APIs

---

## 📊 Quick Status Check

```bash
# Current Test Status
Scenario 1 (Profile):      ⏳ NOT STARTED
Scenario 2 (Projects):     ⏳ NOT STARTED  
Scenario 3 (Services):     ⏳ NOT STARTED
Integration Tests:         ⏳ NOT STARTED

# Overall Progress: 0%
```

---

**Happy Testing! 🚀**  
Remember: This is manual testing with **mock data**. Real backend testing comes next!
