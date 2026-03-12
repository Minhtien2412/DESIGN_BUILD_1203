# Phase 1 E2E Testing Plan
**Date:** December 12, 2025  
**Status:** 🧪 In Progress  
**Testing Type:** Manual E2E (Frontend-only with Mock Data)

---

## 🎯 Testing Objectives

Since backend is not yet implemented, we'll test the **complete user flow** with:
- ✅ Mock data and API responses
- ✅ UI/UX interactions
- ✅ Form validation logic
- ✅ Navigation flows
- ✅ State management
- ⏳ Backend integration (will test after API implementation)

---

## 📋 Test Scenarios

### Scenario 1: Profile Management Flow
**User Story:** As a user, I want to upload and manage my profile avatar

**Test Steps:**
1. **Navigate to Profile**
   - [ ] Open app → Tap "Cá nhân" tab
   - [ ] Verify profile screen loads
   - [ ] Verify avatar placeholder shows if no avatar

2. **Upload Avatar from Gallery**
   - [ ] Tap on avatar/edit button
   - [ ] Select "Chọn từ thư viện"
   - [ ] Pick image from gallery
   - [ ] Verify upload progress shows
   - [ ] Verify success message
   - [ ] Verify avatar updates in Profile screen
   - [ ] Navigate to Menu tab → Verify avatar shows there too

3. **Upload Avatar from Camera**
   - [ ] Tap on avatar/edit button
   - [ ] Select "Chụp ảnh mới"
   - [ ] Take photo with camera
   - [ ] Verify upload progress
   - [ ] Verify avatar updates

4. **Delete Avatar**
   - [ ] Tap on avatar → Select "Xóa ảnh"
   - [ ] Verify confirmation alert shows
   - [ ] Confirm deletion
   - [ ] Verify avatar reverts to placeholder
   - [ ] Verify Menu tab also shows placeholder

5. **Avatar Persistence**
   - [ ] Upload an avatar
   - [ ] Force close app (swipe away from recent apps)
   - [ ] Reopen app
   - [ ] Verify avatar still shows in Profile tab
   - [ ] Verify avatar still shows in Menu tab

**Expected Results:**
- Avatar upload shows progress indicator
- Avatar displays in both Profile and Menu tabs
- Avatar persists after app restart
- Delete confirmation prevents accidental deletion

**Known Limitations (Backend Pending):**
- Avatar stored in memory only (not persistent in mock mode)
- No actual server upload/resize
- No thumbnail generation

---

### Scenario 2: Project Creation Flow
**User Story:** As a user, I want to create a new construction project

**Test Steps:**
1. **Navigate to Project Creation**
   - [ ] Tap "Dự án" tab
   - [ ] Tap "Tạo dự án mới" button (or FAB/quick action)
   - [ ] Verify form screen opens

2. **Test Form Validation - Empty Title**
   - [ ] Leave all fields empty
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Tên dự án không được để trống"

3. **Test Form Validation - Short Title**
   - [ ] Enter title: "AB" (2 chars)
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Tên dự án phải có ít nhất 3 ký tự"

4. **Test Form Validation - Invalid Budget**
   - [ ] Enter title: "Dự án Test"
   - [ ] Enter budget: "abc123" (non-numeric)
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Ngân sách phải là số"

5. **Test Form Validation - Invalid Dates**
   - [ ] Enter title: "Dự án Test"
   - [ ] Set startDate: 2025-12-20
   - [ ] Set endDate: 2025-12-15 (before startDate)
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Ngày kết thúc phải sau ngày bắt đầu"

6. **Test Form Validation - Invalid Phone**
   - [ ] Enter title: "Dự án Test"
   - [ ] Enter clientPhone: "123" (invalid format)
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Số điện thoại không hợp lệ"

7. **Test Form Validation - Invalid Email**
   - [ ] Enter title: "Dự án Test"
   - [ ] Enter clientEmail: "notanemail" (invalid format)
   - [ ] Tap "Tạo dự án"
   - [ ] Verify error: "Email không hợp lệ"

8. **Create Project - Minimal Fields**
   - [ ] Enter title: "Nhà Phố Quận 7"
   - [ ] Tap "Tạo dự án"
   - [ ] Verify success alert shows
   - [ ] Select "Xem dự án" → Verify navigates to project detail
   - [ ] Verify project appears in Projects list

9. **Create Project - All Fields**
   - [ ] Enter all fields:
     - Title: "Biệt Thự Vinhomes"
     - Description: "Thiết kế và thi công biệt thự 3 tầng"
     - Budget: "5000000000" (5 tỷ)
     - Start Date: 2025-12-15
     - End Date: 2026-06-15
     - Location: "Vinhomes Grand Park, TP.HCM"
     - Client Name: "Nguyễn Văn A"
     - Client Phone: "0901234567"
     - Client Email: "nguyenvana@gmail.com"
   - [ ] Tap "Tạo dự án"
   - [ ] Verify success alert
   - [ ] Select "Tạo dự án khác" → Verify form resets

10. **Form UX - Keyboard Handling**
    - [ ] Tap on title field → Verify keyboard shows
    - [ ] Scroll to bottom fields → Verify keyboard doesn't cover input
    - [ ] On iOS: Verify KeyboardAvoidingView works
    - [ ] On Android: Verify scrolling works

**Expected Results:**
- All validation errors display correctly
- Form prevents invalid submissions
- Success flow navigates to project detail or resets form
- Keyboard doesn't cover input fields

**Known Limitations (Backend Pending):**
- Project stored in local state only (not persistent)
- No actual API call
- Project ID is mock/generated locally

---

### Scenario 3: Service Booking Flow
**User Story:** As a user, I want to book a construction service

**Test Steps:**
1. **Navigate to Service Detail - House Design**
   - [ ] From home/services → Navigate to `/services/detail/house-design`
   - [ ] Verify service detail page loads
   - [ ] Verify hero images display
   - [ ] Verify rating shows: 4.8/5.0 (156 đánh giá)
   - [ ] Verify 6 features display with icons

2. **View Image Gallery**
   - [ ] Scroll hero images horizontally
   - [ ] Verify dots indicator updates (active dot changes)
   - [ ] Swipe to 2nd image → Verify dot #2 active
   - [ ] Swipe to 3rd image → Verify dot #3 active

3. **View Pricing Packages**
   - [ ] Scroll to pricing section
   - [ ] Verify 3 packages display:
     - Gói Cơ Bản: 300.000đ/m²
     - Gói Tiêu Chuẩn: 500.000đ/m² (RECOMMENDED badge)
     - Gói Cao Cấp: 800.000đ/m²
   - [ ] Verify each package shows duration (30, 45, 60 ngày)
   - [ ] Verify feature lists display with checkmarks

4. **Select Pricing Package**
   - [ ] Tap "Gói Cơ Bản" card
   - [ ] Verify card highlights (orange border, light orange background)
   - [ ] Verify bottom button enables: "Đặt dịch vụ ngay"
   - [ ] Tap "Gói Tiêu Chuẩn" card
   - [ ] Verify previous selection deselects
   - [ ] Verify new card highlights

5. **View Reviews**
   - [ ] Scroll to reviews section
   - [ ] Verify 3 reviews display
   - [ ] Verify each has: avatar, name, rating stars, comment, date

6. **Book Service - No Package Selected**
   - [ ] Deselect any package (or refresh page)
   - [ ] Verify bottom button disabled
   - [ ] Verify button text: "Vui lòng chọn gói dịch vụ"

7. **Open Booking Form**
   - [ ] Select any package
   - [ ] Tap "Đặt dịch vụ ngay"
   - [ ] Verify booking form screen displays
   - [ ] Verify header shows: "Thông tin đặt dịch vụ"
   - [ ] Verify selected package badge shows

8. **Test Booking Form Validation - Empty Required Fields**
   - [ ] Leave all fields empty
   - [ ] Tap "Gửi yêu cầu"
   - [ ] Verify errors:
     - "Vui lòng nhập họ tên"
     - "Vui lòng nhập số điện thoại"
     - "Vui lòng nhập diện tích"

9. **Test Booking Form Validation - Invalid Phone**
   - [ ] Enter name: "Nguyễn Văn B"
   - [ ] Enter phone: "123" (invalid)
   - [ ] Enter area: "100"
   - [ ] Tap "Gửi yêu cầu"
   - [ ] Verify error: "Số điện thoại không hợp lệ"

10. **Test Booking Form Validation - Invalid Area**
    - [ ] Enter name: "Nguyễn Văn B"
    - [ ] Enter phone: "0901234567"
    - [ ] Enter area: "abc" (non-numeric)
    - [ ] Tap "Gửi yêu cầu"
    - [ ] Verify error: "Diện tích phải là số dương"

11. **Submit Booking - Valid Data**
    - [ ] Enter all fields:
      - Name: "Trần Thị C"
      - Phone: "0987654321"
      - Email: "tranthic@gmail.com"
      - Area: "120"
      - Location: "Quận 7, TP.HCM"
      - Notes: "Cần tư vấn phong thủy thêm"
    - [ ] Tap "Gửi yêu cầu"
    - [ ] Verify success alert: "Yêu cầu đặt dịch vụ của bạn đã được gửi..."
    - [ ] Tap "OK"
    - [ ] Verify navigates back to service list/home

12. **Cancel Booking Form**
    - [ ] Open booking form again
    - [ ] Enter some data
    - [ ] Tap "Hủy bỏ" button
    - [ ] Verify returns to service detail page
    - [ ] Verify form data not saved

13. **Test Other Services**
    - [ ] Navigate to `/services/detail/interior-design`
    - [ ] Verify different pricing: 250k, 450k, 700k
    - [ ] Navigate to `/services/detail/permit`
    - [ ] Verify flat pricing: 5M, 10M (no per m²)
    - [ ] Navigate to `/services/detail/feng-shui`
    - [ ] Verify pricing: 2M, 5M

**Expected Results:**
- Image gallery scrolls smoothly with dot indicators
- Package selection highlights correctly
- Bottom button enables only after package selection
- Form validation works for all fields
- Success alert shows and navigates back
- Different services show different pricing structures

**Known Limitations (Backend Pending):**
- No actual booking creation
- No booking confirmation email/notification
- Booking data not stored anywhere

---

## 🔄 Cross-Feature Integration Tests

### Integration 1: Profile Avatar → Project Creation
**Test Flow:**
1. Upload avatar in Profile
2. Navigate to Projects → Create new project
3. Verify avatar shows in header/navigation
4. Create project successfully
5. Navigate to project detail
6. Verify avatar still shows in navigation

### Integration 2: Service Booking → Notifications
**Test Flow:**
1. Book a service successfully
2. Check Notifications tab
3. Verify booking confirmation notification shows (if implemented)
4. Tap notification → Verify navigates to booking detail

### Integration 3: Multiple Projects → State Management
**Test Flow:**
1. Create Project #1: "Nhà Phố A"
2. Create Project #2: "Biệt Thự B"
3. Create Project #3: "Căn Hộ C"
4. Navigate to Projects list
5. Verify all 3 projects display
6. Tap Project #2 → Verify correct detail shows
7. Navigate back → Navigate to Project #1
8. Verify correct detail shows

---

## 📱 Device Testing Matrix

### Test Devices
| Device | OS | Screen Size | Test Status |
|--------|----|----|-------------|
| Android Emulator | Android 13 | 1080x2400 | ⏳ Pending |
| Physical Android | Android 12+ | Various | ⏳ Pending |
| iOS Simulator | iOS 16+ | iPhone 14 | ⏳ Pending |
| Physical iPhone | iOS 16+ | Various | ⏳ Pending |
| Web Browser | Chrome | Desktop | ⏳ Pending |

### Screen Sizes to Test
- Small phone: 5.5" (Android SE equivalent)
- Medium phone: 6.1" (iPhone 14)
- Large phone: 6.7" (iPhone 14 Pro Max)
- Tablet: 10" iPad

---

## 🐛 Known Issues Tracker

### Critical Issues
- [ ] None yet

### Medium Issues
- [ ] Tab bar animation error (fixed in custom-tab-bar.tsx)

### Low Issues
- [ ] None yet

---

## 📊 Test Results Summary

### Scenario 1: Profile Management
| Test Case | Status | Notes |
|-----------|--------|-------|
| Upload from gallery | ⏳ | |
| Upload from camera | ⏳ | |
| Delete avatar | ⏳ | |
| Avatar sync (Menu/Profile) | ⏳ | |
| Avatar persistence | ⏳ | Backend needed |

### Scenario 2: Project Creation
| Test Case | Status | Notes |
|-----------|--------|-------|
| Empty title validation | ⏳ | |
| Short title validation | ⏳ | |
| Invalid budget validation | ⏳ | |
| Invalid dates validation | ⏳ | |
| Invalid phone validation | ⏳ | |
| Invalid email validation | ⏳ | |
| Create minimal fields | ⏳ | |
| Create all fields | ⏳ | |
| Keyboard handling | ⏳ | |

### Scenario 3: Service Booking
| Test Case | Status | Notes |
|-----------|--------|-------|
| Image gallery scroll | ⏳ | |
| Pricing package selection | ⏳ | |
| Reviews display | ⏳ | |
| Booking form validation | ⏳ | |
| Submit booking | ⏳ | Backend needed |
| Multiple services | ⏳ | |

---

## 🚀 Next Steps

### Immediate (Today)
1. [ ] Run app on Android emulator
2. [ ] Test Profile upload flow (Scenario 1)
3. [ ] Test Project creation (Scenario 2)
4. [ ] Document any bugs found

### Short Term (This Week)
1. [ ] Complete all manual E2E tests
2. [ ] Test on physical devices (Android + iOS)
3. [ ] Create bug report for any issues
4. [ ] Update PHASE_1_COMPLETION_REPORT.md with test results

### Long Term (Next Week)
1. [ ] Wait for backend implementation
2. [ ] Test with real API endpoints
3. [ ] Add automated E2E tests (Detox or Maestro)
4. [ ] Performance testing (loading times, memory usage)

---

## 📝 Test Execution Log

### Session 1: December 12, 2025
**Tester:** [Your Name]  
**Device:** [Device Info]  
**Build:** [Version]

**Tests Executed:**
- [ ] Scenario 1: Profile Management
- [ ] Scenario 2: Project Creation
- [ ] Scenario 3: Service Booking

**Issues Found:**
1. Tab bar animation error - ✅ Fixed

**Notes:**
[Add any observations, performance issues, UX feedback]

---

## ✅ Sign-off Criteria

Phase 1 E2E testing is considered COMPLETE when:
- [ ] All 3 scenarios pass on Android
- [ ] All 3 scenarios pass on iOS
- [ ] All validation errors display correctly
- [ ] No critical bugs blocking user flows
- [ ] Performance is acceptable (< 3s load times)
- [ ] UI matches design specifications
- [ ] Navigation flows work as expected

**Backend Integration Sign-off:**
- [ ] All API endpoints implemented (11 total)
- [ ] Avatar upload/delete works with real backend
- [ ] Project CRUD works with real backend
- [ ] Service booking works with real backend
- [ ] Data persists after app restart
- [ ] Error handling works (network errors, validation errors)

---

*Document Version: 1.0*  
*Last Updated: December 12, 2025*  
*Status: Ready for Manual Testing*
