# Quick Testing Guide - Form Integration

## 🎯 Quick Start (5 Minutes)

### Setup
1. ✅ Server running on http://localhost:8082
2. Open in browser or press `w` in terminal
3. Navigate to Projects → Click any project card

### Quick Test Flow

**Test Expense Form (2 min):**
```
1. Scroll to "Quản lý ngân sách" section
2. Click "+" button
3. Select type: Chi phí
4. Select category: Vật liệu
5. Enter amount: 5000000 (shows as ₫5,000,000)
6. Enter description: "Test expense"
7. Enter date: 2025-11-03
8. Select status: Đã thanh toán
9. Click "Thêm chi phí"
10. ✓ Should see success alert
```

**Test Task Form (2 min):**
```
1. Scroll to "Quản lý công việc" section
2. Click "+" button
3. Enter title: "Test task"
4. Enter description: "Testing task form"
5. Select priority: Cao
6. Select status: Cần làm
7. Click "thi công" tag
8. Enter due date: 2025-11-15
9. Click "Tạo công việc"
10. ✓ Should see success alert
```

---

## ⚡ Fast Validation Checks

### Forms Open Correctly
- [ ] Expense form: Click Budget "+" → Modal appears
- [ ] Task form: Click Tasks "+" → Modal appears

### Basic Data Entry Works
- [ ] Amount formats with commas: ₫1,234,567
- [ ] Character counters update: 15/100, 29/500
- [ ] Tags can be added/removed

### Validation Catches Errors
- [ ] Submit empty expense form → See errors
- [ ] Submit empty task form → See "title required"
- [ ] Fill required fields → Errors disappear

### Submission Success
- [ ] Complete expense form → Alert shows
- [ ] Complete task form → Alert shows
- [ ] Console logs show data

### Cancel Works
- [ ] Fill partial data → Click Hủy → Form closes
- [ ] Reopen → Fields are reset

---

## 🔍 Console Commands

Open browser DevTools console (F12) and check:

```javascript
// Should see these logs when submitting:
New expense: { type: 'expense', category: 'materials', ... }
New task: { title: 'Test task', priority: 'high', ... }
```

---

## ⚠️ Common Issues to Check

| Issue | Check | Expected |
|-------|-------|----------|
| Form doesn't open | Button clickable? | Modal slides up |
| Can't type amount | Keyboard shows? | Numbers appear |
| Categories don't highlight | Click registered? | Border appears |
| Tags don't add | Tag button works? | Appears in selected |
| Submit does nothing | Validation errors? | Alert appears |
| Form doesn't close | Hủy button works? | Modal dismisses |

---

## 📱 Device-Specific Tests

### Web Browser (Quickest)
1. Press `w` in terminal
2. Opens http://localhost:8082
3. Test all flows in browser

### Android (if available)
1. Press `a` in terminal
2. Wait for build
3. Test on Android device/simulator

### iOS (if available)
1. Press `i` in terminal (macOS only)
2. Wait for build
3. Test on iOS device/simulator

---

## ✅ Success Criteria

**All tests pass if:**
- ✅ Both forms open without errors
- ✅ All inputs accept data correctly
- ✅ Validation shows appropriate errors
- ✅ Submission shows success alert
- ✅ Console logs confirm data structure
- ✅ Cancel button closes forms
- ✅ Forms reset after close
- ✅ No React errors in console
- ✅ UI is responsive and smooth
- ✅ Vietnamese text displays correctly

---

## 🐛 If Issues Found

1. **Check Browser Console** (F12) for React errors
2. **Check Terminal** for build errors
3. **Review this checklist** - might be expected behavior
4. **Take screenshot** of issue
5. **Note repro steps** to recreate

---

## 📊 Test Results

Date: ____________  
Tester: ____________

| Test | Status | Notes |
|------|--------|-------|
| Expense form opens | ⬜ | |
| Task form opens | ⬜ | |
| Amount formatting | ⬜ | |
| Tag management | ⬜ | |
| Validation errors | ⬜ | |
| Expense submission | ⬜ | |
| Task submission | ⬜ | |
| Cancel functionality | ⬜ | |
| Form reset | ⬜ | |
| Console logs | ⬜ | |

**Overall Result:** ⏳ In Progress / ✅ Passed / ❌ Failed

---

## 🎯 Next Steps After Testing

If all tests pass:
1. Mark "Test Form Integration" as complete ✅
2. Start "Add Data Persistence" phase
3. Connect forms to actual state management
4. Replace console.log with real API calls

If tests fail:
1. Document issues in FORM_INTEGRATION_TEST.md
2. Create bug fixes
3. Retest until passing
4. Then proceed to persistence

---

**Quick Command Reference:**
- `npm start` - Start server
- `w` - Open web
- `a` - Open Android  
- `i` - Open iOS
- `r` - Reload app
- `Ctrl+C` - Stop server
