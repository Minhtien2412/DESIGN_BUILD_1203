# Form Integration Testing Checklist

**Date:** November 3, 2025  
**Status:** ✅ Server Running on http://localhost:8082  
**Files Tested:** 
- `app/projects/[id].tsx` (715 lines)
- `components/forms/add-expense-form.tsx` (414 lines)
- `components/forms/add-task-form.tsx` (387 lines)

---

## ✅ Pre-Test Verification

- [x] **Zero TypeScript Errors** - All files compile successfully
- [x] **Server Running** - Expo dev server on port 8082
- [x] **Forms Imported** - AddExpenseForm and AddTaskForm imported
- [x] **State Hooks Added** - showExpenseForm and showTaskForm useState
- [x] **Handlers Created** - handleAddExpense and handleAddTask functions
- [x] **Modals Rendered** - Forms added to render tree before `</>`

---

## 🧪 Test Suite 1: Add Expense Form

### Test 1.1: Open Expense Form
- [ ] Navigate to Projects tab
- [ ] Click on any project card (Project 1, 2, or 3)
- [ ] Scroll to "Quản lý ngân sách" (Budget Tracker) section
- [ ] Click the "+" button at top right of Budget section
- [ ] **Expected:** AddExpenseForm modal slides up from bottom
- [ ] **Expected:** Modal shows "Thêm chi phí" header

### Test 1.2: Form Layout & UI
- [ ] **Type Toggle:** See "Chi phí" and "Thu nhập" buttons
- [ ] **Category Grid:** See 5 categories with icons (Materials, Labor, Equipment, Permits, Other)
- [ ] **Amount Input:** See "Số tiền" field with ₫ symbol
- [ ] **Description:** See "Mô tả" multiline textarea
- [ ] **Date Input:** See "Ngày" field with YYYY-MM-DD placeholder
- [ ] **Status Chips:** See 3 status options (Chờ duyệt, Đã duyệt, Đã thanh toán)
- [ ] **Footer:** See "Hủy" and "Thêm chi phí" buttons

### Test 1.3: Type Toggle
- [ ] Click "Thu nhập" button
- [ ] **Expected:** Button turns green with checkmark icon
- [ ] **Expected:** Submit button changes to "Thêm thu nhập"
- [ ] Click "Chi phí" button again
- [ ] **Expected:** Button turns red with trending-down icon
- [ ] **Expected:** Submit button changes back to "Thêm chi phí"

### Test 1.4: Category Selection
- [ ] Click "Vật liệu" category (orange icon)
- [ ] **Expected:** Category card highlights with border
- [ ] **Expected:** Budget context shows: "Đã chi: ₫X.XXB / ₫X.XXB"
- [ ] Click "Nhân công" category (blue icon)
- [ ] **Expected:** Previous selection clears, new category highlights
- [ ] Try each category: Materials, Labor, Equipment, Permits, Other

### Test 1.5: Amount Input & Formatting
- [ ] Click amount input field
- [ ] Type: `1234567`
- [ ] **Expected:** Displays as `₫1,234,567` with thousand separators
- [ ] Clear and type: `1000000`
- [ ] **Expected:** Displays as `₫1,000,000`
- [ ] Try decimals: `1234.56`
- [ ] **Expected:** Accepts decimals, formats as `₫1,234.56`

### Test 1.6: Description Input
- [ ] Click description field
- [ ] Type: "Test expense description"
- [ ] **Expected:** Text appears in multiline input
- [ ] Try long text (100+ characters)
- [ ] **Expected:** Text wraps to multiple lines

### Test 1.7: Date Input
- [ ] Click date field
- [ ] Type: `2025-11-03`
- [ ] **Expected:** Date accepted in YYYY-MM-DD format
- [ ] Try invalid format: `11/03/2025`
- [ ] **Expected:** Field accepts but might show validation error later

### Test 1.8: Status Selection
- [ ] Click "Chờ duyệt" (Pending) chip
- [ ] **Expected:** Chip highlights with gray background
- [ ] Click "Đã duyệt" (Approved) chip
- [ ] **Expected:** Previous clears, new chip highlights blue
- [ ] Click "Đã thanh toán" (Paid) chip
- [ ] **Expected:** Chip highlights green

### Test 1.9: Form Validation
- [ ] Click "Thêm chi phí" button with empty form
- [ ] **Expected:** See red error messages:
  - "Vui lòng chọn danh mục"
  - "Vui lòng nhập mô tả"
  - "Vui lòng nhập số tiền"
  - "Vui lòng nhập ngày"
  - "Vui lòng chọn trạng thái"
- [ ] Fill only category
- [ ] **Expected:** Category error disappears
- [ ] Fill only amount
- [ ] **Expected:** Amount error disappears
- [ ] Continue until all fields valid

### Test 1.10: Successful Submission
- [ ] Fill complete valid form:
  - Type: Chi phí
  - Category: Vật liệu
  - Amount: 5000000
  - Description: "Mua xi măng"
  - Date: 2025-11-03
  - Status: Đã thanh toán
- [ ] Click "Thêm chi phí" button
- [ ] **Expected:** Alert appears: "Thành công - Đã thêm chi phí: Mua xi măng"
- [ ] Click OK on alert
- [ ] **Expected:** Form closes, returns to project detail
- [ ] **Expected:** Console log shows: `New expense: { type: 'expense', ... }`

### Test 1.11: Cancel & Reset
- [ ] Open form again, fill partial data
- [ ] Click "Hủy" button
- [ ] **Expected:** Form closes without submission
- [ ] Open form again
- [ ] **Expected:** All fields reset to empty/default values

### Test 1.12: Income Flow
- [ ] Open form, click "Thu nhập"
- [ ] Fill form with income data:
  - Category: Other
  - Amount: 2000000
  - Description: "Thanh toán giai đoạn 1"
  - Date: 2025-11-03
  - Status: Đã thanh toán
- [ ] Submit
- [ ] **Expected:** Alert: "Thành công - Đã thêm thu nhập: Thanh toán giai đoạn 1"

---

## 🧪 Test Suite 2: Add Task Form

### Test 2.1: Open Task Form
- [ ] Scroll to "Quản lý công việc" (Task Management) section
- [ ] Click the "+" button at top right of Tasks section
- [ ] **Expected:** AddTaskForm modal slides up
- [ ] **Expected:** Modal shows "Thêm công việc mới" header

### Test 2.2: Form Layout & UI
- [ ] **Title Input:** See "Tiêu đề" field with character counter (0/100)
- [ ] **Description:** See "Mô tả" textarea with counter (0/500)
- [ ] **Priority Grid:** See 4 options (Khẩn cấp, Cao, Trung bình, Thấp)
- [ ] **Status Grid:** See 4 options (Cần làm, Đang làm, Hoàn thành, Bị chặn)
- [ ] **Tags Section:** See 9 common tags + custom input
- [ ] **Due Date:** See "Ngày hết hạn" optional field
- [ ] **Footer:** See "Hủy" and "Tạo công việc" buttons

### Test 2.3: Title Input
- [ ] Click title field
- [ ] Type: "Test task title"
- [ ] **Expected:** Counter shows: "15/100"
- [ ] Type 100 characters total
- [ ] **Expected:** Counter shows: "100/100"
- [ ] Try to type more
- [ ] **Expected:** Input stops at 100 characters

### Test 2.4: Description Input
- [ ] Click description field
- [ ] Type: "This is a test task description"
- [ ] **Expected:** Counter updates: "29/500"
- [ ] Type 500 characters
- [ ] **Expected:** Counter shows: "500/500"
- [ ] Try to type more
- [ ] **Expected:** Input stops at 500 characters

### Test 2.5: Priority Selection
- [ ] Click "Khẩn cấp" (Urgent)
- [ ] **Expected:** Card highlights RED with alert-circle icon
- [ ] Click "Cao" (High)
- [ ] **Expected:** Card highlights ORANGE with arrow-up icon
- [ ] Click "Trung bình" (Medium)
- [ ] **Expected:** Card highlights BLUE with minus icon
- [ ] Click "Thấp" (Low)
- [ ] **Expected:** Card highlights GRAY with arrow-down icon

### Test 2.6: Status Selection
- [ ] Click "Cần làm" (Todo)
- [ ] **Expected:** Card highlights BLUE
- [ ] Click "Đang làm" (In Progress)
- [ ] **Expected:** Card highlights ORANGE
- [ ] Click "Hoàn thành" (Completed)
- [ ] **Expected:** Card highlights GREEN
- [ ] Click "Bị chặn" (Blocked)
- [ ] **Expected:** Card highlights RED

### Test 2.7: Tag Management - Common Tags
- [ ] Click "thiết kế" tag
- [ ] **Expected:** Tag appears in "Đã chọn" section with X button
- [ ] Click "thi công" tag
- [ ] **Expected:** Second tag appears in selected list
- [ ] Click X on "thiết kế" tag
- [ ] **Expected:** Tag removed from selected, reappears in common tags
- [ ] Add multiple tags: "giám sát", "nghiệm thu", "bảo trì"
- [ ] **Expected:** All appear in selected section

### Test 2.8: Tag Management - Custom Tags
- [ ] Click custom tag input field
- [ ] Type: "custom-tag-1"
- [ ] Press Enter or click "+" button
- [ ] **Expected:** Custom tag appears in selected section
- [ ] Add another: "urgent-fix"
- [ ] **Expected:** Both custom tags in selected list
- [ ] Remove custom tag
- [ ] **Expected:** Custom tag disappears (doesn't return to common)

### Test 2.9: Due Date Input
- [ ] Click due date field
- [ ] Type: `2025-12-31`
- [ ] **Expected:** Date accepted
- [ ] Leave field empty
- [ ] **Expected:** No error (optional field)

### Test 2.10: Form Validation
- [ ] Click "Tạo công việc" with empty form
- [ ] **Expected:** See error: "Vui lòng nhập tiêu đề"
- [ ] Fill only title
- [ ] **Expected:** Error disappears
- [ ] Submit again
- [ ] **Expected:** No other required field errors (title is only required)

### Test 2.11: Successful Submission
- [ ] Fill complete form:
  - Title: "Hoàn thiện mặt đứng tầng 1"
  - Description: "Hoàn thiện thi công mặt đứng khu vực tầng 1, bao gồm sơn và gắn kính"
  - Priority: Cao
  - Status: Cần làm
  - Tags: "thi công", "giám sát"
  - Due Date: 2025-11-15
- [ ] Click "Tạo công việc"
- [ ] **Expected:** Alert: "Thành công - Đã thêm công việc: Hoàn thiện mặt đứng tầng 1"
- [ ] Click OK
- [ ] **Expected:** Form closes
- [ ] **Expected:** Console log shows: `New task: { title: '...', ... }`

### Test 2.12: Cancel & Reset
- [ ] Open form, fill partial data with tags
- [ ] Click "Hủy"
- [ ] **Expected:** Form closes
- [ ] Open form again
- [ ] **Expected:** All fields empty, no tags selected

### Test 2.13: Edge Cases
- [ ] Try title with special characters: "Test @#$% Task"
- [ ] **Expected:** Accepts special characters
- [ ] Try description with emojis: "Task with 🚀 emoji"
- [ ] **Expected:** Accepts emojis
- [ ] Select all 9 common tags + 3 custom
- [ ] **Expected:** All 12 tags appear in selected section

---

## 🧪 Test Suite 3: Integration & State

### Test 3.1: Modal State Management
- [ ] Open expense form
- [ ] Tap outside modal (background)
- [ ] **Expected:** Modal stays open (no auto-close)
- [ ] Click "Hủy"
- [ ] **Expected:** Modal closes
- [ ] Open task form immediately after
- [ ] **Expected:** Task form opens correctly (state independent)

### Test 3.2: Multiple Submissions
- [ ] Add 3 expenses in sequence
- [ ] **Expected:** Each shows success alert, form resets
- [ ] Add 3 tasks in sequence
- [ ] **Expected:** Each shows success alert, form resets

### Test 3.3: Data Refresh
- [ ] Note current budget spent amount
- [ ] Add new expense for ₫1,000,000
- [ ] After success alert
- [ ] **Expected:** Budget data refreshes (though mock won't change)
- [ ] **Expected:** Console shows refresh() was called

### Test 3.4: Navigation Persistence
- [ ] Open expense form, fill data
- [ ] Don't submit
- [ ] Navigate back (if possible)
- [ ] **Expected:** Form data lost (no persistence)

### Test 3.5: Theme Support
- [ ] Check form in light mode
- [ ] **Expected:** Appropriate light colors
- [ ] Toggle to dark mode (system settings or app toggle)
- [ ] Open forms again
- [ ] **Expected:** Dark theme colors applied

---

## 🧪 Test Suite 4: Error Handling

### Test 4.1: Invalid Amount
- [ ] Try amount: `-1000` (negative)
- [ ] **Expected:** Either blocked or validation error
- [ ] Try amount: `0`
- [ ] **Expected:** Validation error on submit

### Test 4.2: Invalid Date Format
- [ ] Enter date: `32-13-2025` (invalid day/month)
- [ ] Submit form
- [ ] **Expected:** Either blocked during input or validation error

### Test 4.3: Extreme Values
- [ ] Amount: `999999999999` (very large)
- [ ] **Expected:** Formats correctly: ₫999,999,999,999
- [ ] Title: 100 character string
- [ ] **Expected:** Accepted, counter at 100/100
- [ ] Description: 500 character string
- [ ] **Expected:** Accepted, counter at 500/500

### Test 4.4: Special Characters
- [ ] Description with Vietnamese: "Mua xi măng và cát"
- [ ] **Expected:** Displays correctly
- [ ] Title with symbols: "Task #1 - Phase 2"
- [ ] **Expected:** Accepts all characters

---

## 🧪 Test Suite 5: UX & Performance

### Test 5.1: Form Open Animation
- [ ] Click "+" to open expense form
- [ ] **Expected:** Smooth slide-up animation
- [ ] **Expected:** Background dims with overlay
- [ ] Click "+" to open task form
- [ ] **Expected:** Same smooth animation

### Test 5.2: Input Focus & Keyboard
- [ ] Click amount input
- [ ] **Expected:** Number keyboard appears (iOS/Android)
- [ ] Click description
- [ ] **Expected:** Full keyboard appears
- [ ] Click date field
- [ ] **Expected:** Appropriate keyboard for date input

### Test 5.3: Scrolling in Forms
- [ ] Open expense form on small screen
- [ ] Try scrolling to see all fields
- [ ] **Expected:** Form content scrollable within modal
- [ ] Open task form
- [ ] Add 12 tags (fills selected section)
- [ ] **Expected:** Selected tags section scrolls if needed

### Test 5.4: Loading & Responsiveness
- [ ] Click submit button
- [ ] **Expected:** Immediate feedback (alert appears quickly)
- [ ] **Expected:** No UI freezing during submission
- [ ] Form closes smoothly after success

### Test 5.5: Accessibility
- [ ] Use keyboard navigation (Tab key)
- [ ] **Expected:** Can navigate through all fields
- [ ] **Expected:** Focus indicators visible
- [ ] Test with screen reader (if available)
- [ ] **Expected:** Labels announced correctly

---

## 📊 Test Results Summary

### Expense Form Tests
- **Total Tests:** 12 suites × ~5 checks = ~60 test cases
- **Passed:** ___ / 60
- **Failed:** ___ / 60
- **Critical Issues:** ___

### Task Form Tests
- **Total Tests:** 13 suites × ~5 checks = ~65 test cases
- **Passed:** ___ / 65
- **Failed:** ___ / 65
- **Critical Issues:** ___

### Integration Tests
- **Total Tests:** 5 suites × ~4 checks = ~20 test cases
- **Passed:** ___ / 20
- **Failed:** ___ / 20
- **Critical Issues:** ___

### Overall Status
- **Total Test Cases:** ~145
- **Pass Rate:** ____%
- **Status:** ⏳ Testing in Progress

---

## 🐛 Known Issues

| #   | Issue | Severity | Status | Fix |
|-----|-------|----------|--------|-----|
| 1   | TBD   | -        | -      | -   |

---

## ✅ Post-Test Actions

- [ ] Document all bugs found
- [ ] Create GitHub issues for critical bugs
- [ ] Plan fixes for validation errors
- [ ] Update form components if needed
- [ ] Retest after fixes

---

## 🚀 Next Development Phase

Once all tests pass:
1. **Add Data Persistence** - Save to AsyncStorage or API
2. **Implement Edit Forms** - Pre-fill existing expenses/tasks
3. **Add Delete Functionality** - Remove items with confirmation
4. **Improve Success Feedback** - Toast notifications instead of alerts
5. **Add Loading States** - Show spinner during async operations
6. **Optimize Performance** - Memoize expensive renders

---

**Tester:** _______________  
**Date Completed:** _______________  
**Sign-off:** _______________
