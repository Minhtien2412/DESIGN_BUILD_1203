# 📋 Frontend Testing Checklist

Complete manual testing guide for the Expo mobile application.

**Date:** December 24, 2025  
**Tester:** _______________

---

## 🚀 Pre-Testing Setup

```bash
# 1. Ensure backend is running
# SSH to VPS and check:
pm2 status
curl http://localhost:3000/api/v1/health

# 2. Start Expo development server
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
npm start

# 3. Open on Android device
# Press 'a' in terminal OR scan QR code with Expo Go app
```

---

## 🔐 Authentication Testing

### Sign Up Screen

#### Test Case 1: View All 8 Roles
- [ ] Navigate to Sign Up screen
- [ ] Scroll through role selection
- [ ] **Verify 8 role buttons visible:**
  - [ ] CLIENT (person icon)
  - [ ] ENGINEER (calculator icon)
  - [ ] CONTRACTOR (hammer icon)
  - [ ] STAFF (briefcase icon)
  - [ ] ARCHITECT (compass icon)
  - [ ] DESIGNER (color-palette icon)
  - [ ] SUPPLIER (cube icon)
  - [ ] ADMIN (shield icon)

**Expected:** All 8 buttons render correctly with icons and labels

---

#### Test Case 2: Staff Secret Validation
- [ ] Select **STAFF** role
- [ ] **Verify "Mã bảo mật nhân viên" input appears**
- [ ] Leave secret empty → Try to submit
  - **Expected:** Error "Vui lòng nhập mã bảo mật"
- [ ] Enter wrong secret "abc123" → Submit
  - **Expected:** Error "Mã bảo mật không đúng"
- [ ] Enter correct secret "Nhaxinh@123" → Submit
  - **Expected:** Registration proceeds (no error)

**Pass:** ✅ / Fail: ❌

**Notes:**
```
____________________________________________
____________________________________________
```

---

#### Test Case 3: Register as CLIENT
- [ ] Select **CLIENT** role
- [ ] Verify staff secret input does NOT appear
- [ ] Fill form:
  - Email: `client-test-$(timestamp)@example.com`
  - Password: `Test123456!`
  - Full Name: `Test Client User`
- [ ] Submit registration
- [ ] **Expected:** Success message + redirect to home
- [ ] Verify user is logged in (check profile screen)

**Pass:** ✅ / Fail: ❌

---

#### Test Case 4: Email Validation
- [ ] Enter invalid email "notanemail"
- [ ] Submit
- [ ] **Expected:** Error "Invalid email format"

**Pass:** ✅ / Fail: ❌

---

#### Test Case 5: Password Validation
- [ ] Enter weak password "123"
- [ ] **Expected:** Error "Password must be at least 8 characters"
- [ ] Enter password without uppercase "test123456!"
- [ ] **Expected:** Error "Password must contain uppercase letter"

**Pass:** ✅ / Fail: ❌

---

### Sign In Screen

#### Test Case 6: Login with Registered User
- [ ] Navigate to Sign In
- [ ] Enter email from Test Case 3
- [ ] Enter password `Test123456!`
- [ ] Submit
- [ ] **Expected:** Login success + redirect to home
- [ ] Verify profile shows correct user data

**Pass:** ✅ / Fail: ❌

---

#### Test Case 7: Invalid Credentials
- [ ] Enter wrong email `nonexistent@example.com`
- [ ] Enter any password
- [ ] Submit
- [ ] **Expected:** Error "Invalid email or password"

**Pass:** ✅ / Fail: ❌

---

#### Test Case 8: Empty Fields
- [ ] Leave email empty → Submit
- [ ] **Expected:** Error "Email is required"
- [ ] Leave password empty → Submit
- [ ] **Expected:** Error "Password is required"

**Pass:** ✅ / Fail: ❌

---

## 🏠 Home Screen Testing

#### Test Case 9: Load Products
- [ ] Navigate to Home screen
- [ ] **Expected:** Products grid displays
- [ ] Verify each product card shows:
  - [ ] Product image
  - [ ] Product name
  - [ ] Price (formatted VND)
  - [ ] Rating (if available)

**Pass:** ✅ / Fail: ❌

---

#### Test Case 10: Search Products
- [ ] Tap search bar
- [ ] Enter product name (e.g., "Sofa")
- [ ] **Expected:** Results filter in real-time
- [ ] Verify relevant products appear

**Pass:** ✅ / Fail: ❌

---

#### Test Case 11: Category Filter
- [ ] Tap category chip (e.g., "Furniture")
- [ ] **Expected:** Only furniture products display
- [ ] Tap "All" chip
- [ ] **Expected:** All products return

**Pass:** ✅ / Fail: ❌

---

#### Test Case 12: Quick Actions
- [ ] Verify quick action buttons visible:
  - [ ] Construction
  - [ ] Materials
  - [ ] Safety
  - [ ] Documents
- [ ] Tap "Construction" button
- [ ] **Expected:** Navigate to construction screen

**Pass:** ✅ / Fail: ❌

---

## 🛍️ Product Detail Testing

#### Test Case 13: View Product Detail
- [ ] Tap any product card
- [ ] **Expected:** Navigate to product detail screen
- [ ] Verify displays:
  - [ ] Image carousel (swipeable)
  - [ ] Product name
  - [ ] Price
  - [ ] Description
  - [ ] Specifications table
  - [ ] "Add to Cart" button

**Pass:** ✅ / Fail: ❌

---

#### Test Case 14: Image Carousel
- [ ] Swipe left/right on product images
- [ ] **Expected:** Images scroll smoothly
- [ ] Indicator dots update correctly

**Pass:** ✅ / Fail: ❌

---

#### Test Case 15: Quantity Selector
- [ ] Tap "-" button when quantity = 1
- [ ] **Expected:** Quantity stays at 1 (minimum)
- [ ] Tap "+" button 3 times
- [ ] **Expected:** Quantity increases to 4
- [ ] Verify price updates: Price × Quantity

**Pass:** ✅ / Fail: ❌

---

#### Test Case 16: Add to Cart
- [ ] Set quantity to 2
- [ ] Tap "Add to Cart"
- [ ] **Expected:** Success toast/alert
- [ ] Navigate to Cart
- [ ] Verify product appears with quantity 2

**Pass:** ✅ / Fail: ❌

---

## 🛒 Cart Testing

#### Test Case 17: View Cart
- [ ] Navigate to Cart screen
- [ ] **Expected:** List of cart items displays
- [ ] Each item shows:
  - [ ] Product thumbnail
  - [ ] Name
  - [ ] Price
  - [ ] Quantity controls
  - [ ] Remove button

**Pass:** ✅ / Fail: ❌

---

#### Test Case 18: Increment Quantity
- [ ] Tap "+" on any cart item
- [ ] **Expected:** Quantity increases
- [ ] Subtotal updates correctly
- [ ] Total price recalculates

**Pass:** ✅ / Fail: ❌

---

#### Test Case 19: Decrement Quantity
- [ ] Tap "-" on item with quantity > 1
- [ ] **Expected:** Quantity decreases
- [ ] Tap "-" on item with quantity = 1
- [ ] **Expected:** Confirmation dialog "Remove item?"
- [ ] Confirm removal
- [ ] **Expected:** Item disappears from cart

**Pass:** ✅ / Fail: ❌

---

#### Test Case 20: Remove Item
- [ ] Tap trash icon on any item
- [ ] **Expected:** Confirmation dialog
- [ ] Cancel
- [ ] **Expected:** Item remains
- [ ] Tap trash again → Confirm
- [ ] **Expected:** Item removed

**Pass:** ✅ / Fail: ❌

---

#### Test Case 21: Empty Cart State
- [ ] Remove all items from cart
- [ ] **Expected:** Empty state displays
  - [ ] Empty cart icon
  - [ ] Message "Your cart is empty"
  - [ ] "Continue Shopping" button

**Pass:** ✅ / Fail: ❌

---

#### Test Case 22: Cart Persistence
- [ ] Add 2 products to cart
- [ ] Close app completely (swipe away)
- [ ] Reopen app
- [ ] Navigate to Cart
- [ ] **Expected:** Cart items still present

**Pass:** ✅ / Fail: ❌

---

## 🏗️ Projects Tab Testing

#### Test Case 23: View Projects List
- [ ] Tap "Projects" tab
- [ ] **Expected:** Projects list displays
- [ ] Each project shows:
  - [ ] Project name
  - [ ] Location
  - [ ] Status badge
  - [ ] Progress bar

**Pass:** ✅ / Fail: ❌

---

#### Test Case 24: Filter by Status
- [ ] Tap "In Progress" filter chip
- [ ] **Expected:** Only in-progress projects show
- [ ] Tap "Completed" filter
- [ ] **Expected:** Only completed projects show

**Pass:** ✅ / Fail: ❌

---

#### Test Case 25: View Project Detail
- [ ] Tap any project card
- [ ] **Expected:** Navigate to project detail
- [ ] Verify displays:
  - [ ] Project images
  - [ ] Description
  - [ ] Timeline
  - [ ] Budget
  - [ ] Team members

**Pass:** ✅ / Fail: ❌

---

## 🔔 Notifications Testing

#### Test Case 26: View Notifications
- [ ] Tap "Notifications" tab
- [ ] **Expected:** Notification list displays
- [ ] Unread notifications have blue dot

**Pass:** ✅ / Fail: ❌

---

#### Test Case 27: Mark as Read
- [ ] Tap unread notification
- [ ] **Expected:** Blue dot disappears
- [ ] Notification details display

**Pass:** ✅ / Fail: ❌

---

## 👤 Profile Testing

#### Test Case 28: View Profile
- [ ] Tap "Profile" tab
- [ ] **Expected:** Profile screen displays
- [ ] Verify shows:
  - [ ] User avatar (or initials)
  - [ ] Full name
  - [ ] Email
  - [ ] Role badge

**Pass:** ✅ / Fail: ❌

---

#### Test Case 29: Edit Profile
- [ ] Tap "Edit Profile"
- [ ] Change full name to "Updated Name"
- [ ] Change phone to "+1234567890"
- [ ] Save changes
- [ ] **Expected:** Success message
- [ ] Go back to profile
- [ ] Verify changes persisted

**Pass:** ✅ / Fail: ❌

---

#### Test Case 30: Theme Toggle
- [ ] Locate theme toggle switch
- [ ] Toggle Dark Mode ON
- [ ] **Expected:** Entire app switches to dark theme
- [ ] Toggle OFF
- [ ] **Expected:** Returns to light theme

**Pass:** ✅ / Fail: ❌

---

#### Test Case 31: Logout
- [ ] Tap "Logout" button
- [ ] **Expected:** Confirmation dialog
- [ ] Cancel → stays on profile
- [ ] Tap Logout again → Confirm
- [ ] **Expected:** Redirect to sign in screen
- [ ] Verify cart cleared
- [ ] Try to navigate back
- [ ] **Expected:** Cannot access authenticated screens

**Pass:** ✅ / Fail: ❌

---

## 🎨 UI/UX Testing

#### Test Case 32: Navigation
- [ ] Tap each bottom tab
- [ ] **Expected:** Smooth transitions
- [ ] Back button works correctly
- [ ] No navigation errors/crashes

**Pass:** ✅ / Fail: ❌

---

#### Test Case 33: Loading States
- [ ] Trigger data fetch (pull to refresh)
- [ ] **Expected:** Loading spinner displays
- [ ] Skeleton screens (if applicable)
- [ ] No content flicker

**Pass:** ✅ / Fail: ❌

---

#### Test Case 34: Error Handling
- [ ] Turn off WiFi
- [ ] Try to load products
- [ ] **Expected:** Error message displays
  - "Please check your internet connection"
  - Retry button appears
- [ ] Turn WiFi back on → Tap Retry
- [ ] **Expected:** Data loads successfully

**Pass:** ✅ / Fail: ❌

---

#### Test Case 35: Animations
- [ ] Observe screen transitions
- [ ] Button press feedback (scale down)
- [ ] Card animations on scroll
- [ ] **Expected:** Smooth 60fps animations
- [ ] No janky/stuttering motion

**Pass:** ✅ / Fail: ❌

---

#### Test Case 36: Responsive Layout
- [ ] Rotate device to landscape
- [ ] **Expected:** Layout adjusts properly
- [ ] Text remains readable
- [ ] Images scale correctly

**Pass:** ✅ / Fail: ❌

---

## 📊 Test Summary

**Total Test Cases:** 36

| Category | Passed | Failed |
|----------|--------|--------|
| Authentication (8) | ___ | ___ |
| Home Screen (4) | ___ | ___ |
| Product Detail (4) | ___ | ___ |
| Cart (6) | ___ | ___ |
| Projects (3) | ___ | ___ |
| Notifications (2) | ___ | ___ |
| Profile (4) | ___ | ___ |
| UI/UX (5) | ___ | ___ |
| **TOTAL** | ___ | ___ |

**Pass Rate:** ____%

---

## 🐛 Bugs Found

| # | Test Case | Issue Description | Severity | Status |
|---|-----------|-------------------|----------|--------|
| 1 | | | 🔴 Critical | Open |
| 2 | | | 🟡 Medium | Open |
| 3 | | | 🟢 Low | Open |

---

## 📝 Notes & Observations

```
____________________________________________
____________________________________________
____________________________________________
____________________________________________
```

---

## ✅ Sign-Off

**Tester Name:** _______________  
**Date Completed:** _______________  
**Overall Status:** ⬜ PASS / ⬜ FAIL / ⬜ PASS WITH ISSUES

**Recommendation:**
```
⬜ Ready for Production
⬜ Needs Minor Fixes
⬜ Needs Major Fixes
⬜ Not Ready
```

---

**Last Updated:** December 24, 2025
