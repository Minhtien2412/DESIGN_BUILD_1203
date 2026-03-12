# End-to-End Test Scenarios

**Date**: December 11, 2025  
**Version**: 1.0.0  
**Backend API**: https://baotienweb.cloud/api/v1  
**Test Status**: ✅ Ready for Execution

---

## 🎯 Test Overview

This document defines comprehensive end-to-end test scenarios to validate the complete user experience across all integrated features.

**Test Accounts**:
- **CLIENT**: `client.test@demo.com` / `Test123456` (ID: 15)
- **ENGINEER**: `engineer.test@demo.com` / `Test123456` (ID: 16)
- **ADMIN**: `admin.test@demo.com` / `Test123456` (ID: 17)

**Test Environment**:
- Device: Android/iOS/Web
- Network: WiFi (stable connection)
- API: Production backend

---

## 📋 Test Scenario 1: New User Journey (CLIENT Role)

**Objective**: Verify complete signup → onboarding → marketplace browse flow

### Steps:

#### 1.1 Registration
- [ ] Open app (should show signin screen if not logged in)
- [ ] Tap "Sign Up" / "Create Account"
- [ ] Enter test email: `newuser+test@example.com`
- [ ] Enter password: `TestPass123`
- [ ] Enter full name: `Test User`
- [ ] Enter phone: `+1234567890`
- [ ] Tap "Register"

**Expected**:
- ✅ Loading indicator shows during registration
- ✅ Success: redirects to home screen
- ✅ User is automatically logged in
- ✅ Bottom tab bar visible (Home, Projects, Notifications, Profile)

#### 1.2 Home Screen - First Impression
- [ ] Verify home screen loads
- [ ] Check welcome message shows user's name
- [ ] Verify quick actions visible

**Expected**:
- ✅ Smooth transition to home
- ✅ No error messages
- ✅ UI fully rendered

#### 1.3 Browse Services Marketplace
- [ ] Tap "Projects" tab → Navigate to marketplace
- [ ] Verify skeleton screens show during load
- [ ] Wait for services to load
- [ ] Scroll through service list
- [ ] Search for "design" in search bar
- [ ] Verify filtered results
- [ ] Clear search
- [ ] Select "ARCHITECTURE" category
- [ ] Verify category filter works
- [ ] Tap on a service card to view details

**Expected**:
- ✅ Skeleton screens during initial load
- ✅ Services display with images, names, prices
- ✅ Search filters results immediately
- ✅ Category filter updates list
- ✅ Service detail screen shows full information
- ✅ No network errors
- ✅ Pull-to-refresh works

#### 1.4 View Profile
- [ ] Tap "Profile" tab
- [ ] Verify profile loads with correct data
- [ ] Check user info: email, name, role (CLIENT)
- [ ] Verify stats section (if applicable)

**Expected**:
- ✅ Profile shows correct user data
- ✅ Role displays as "CLIENT"
- ✅ No loading errors

#### 1.5 Logout
- [ ] Scroll to bottom of profile screen
- [ ] Tap "Sign Out" button
- [ ] Confirm logout if prompted

**Expected**:
- ✅ Loading indicator during logout
- ✅ Redirects to signin screen
- ✅ Cannot navigate back to authenticated screens
- ✅ Token cleared from storage

---

## 📋 Test Scenario 2: Returning User Journey (CLIENT Role)

**Objective**: Verify login → projects view → notifications → logout flow

### Steps:

#### 2.1 Login
- [ ] Open app (signin screen)
- [ ] Enter email: `client.test@demo.com`
- [ ] Enter password: `Test123456`
- [ ] Tap "Sign In"

**Expected**:
- ✅ Loading indicator shows
- ✅ Success: redirects to home screen
- ✅ Welcome message shows "Client Demo"

#### 2.2 View Projects
- [ ] Tap "Projects" tab
- [ ] Wait for projects list to load
- [ ] Verify CLIENT has 3 projects
- [ ] Tap on first project to view details
- [ ] Verify project details screen loads:
  - Project name: "Beach Resort Design" (or similar)
  - Status: "In Progress" / "ACTIVE"
  - Budget, dates, owner info
  - Members list
- [ ] Go back to projects list
- [ ] Try pull-to-refresh

**Expected**:
- ✅ 3 projects visible
- ✅ Each project shows: name, status, progress, budget
- ✅ Status mapped correctly (ACTIVE → "In Progress")
- ✅ Project details load without errors
- ✅ Back navigation works
- ✅ Pull-to-refresh updates list

#### 2.3 Check Notifications
- [ ] Tap "Notifications" tab
- [ ] Verify notifications load (may be 0 initially)
- [ ] Check unread count badge (if any)
- [ ] If notifications exist:
  - [ ] Tap on an unread notification
  - [ ] Verify it marks as read
  - [ ] Try "Mark All Read" button
  - [ ] Try deleting a notification

**Expected**:
- ✅ Notifications list loads (empty or with data)
- ✅ Unread count shows in badge (if applicable)
- ✅ Tapping notification marks as read
- ✅ "Mark All Read" updates all notifications
- ✅ Delete removes notification from list
- ✅ Pull-to-refresh works

#### 2.4 Profile & Logout
- [ ] Tap "Profile" tab
- [ ] Verify profile shows CLIENT role
- [ ] Verify email: client.test@demo.com
- [ ] Tap "Sign Out"

**Expected**:
- ✅ Profile accurate
- ✅ Logout redirects to signin
- ✅ Cannot access protected screens

---

## 📋 Test Scenario 3: ENGINEER Role Journey

**Objective**: Verify engineer-specific features (tasks management)

### Steps:

#### 3.1 Login as Engineer
- [ ] Open app
- [ ] Login with: `engineer.test@demo.com` / `Test123456`

**Expected**:
- ✅ Login successful
- ✅ Welcome message shows "Engineer Demo"

#### 3.2 View My Tasks
- [ ] Navigate to Tasks section (if separate screen/tab)
- [ ] OR check home screen for tasks widget
- [ ] Verify tasks load (may be 0 tasks)
- [ ] If tasks exist:
  - [ ] Verify task list shows: title, status, priority, due date
  - [ ] Tap on a task to view details
  - [ ] Try updating task status (e.g., mark as completed)
  - [ ] Verify status update reflects immediately

**Expected**:
- ✅ Tasks endpoint accessible to ENGINEER role
- ✅ Task list loads without errors
- ✅ Task details screen works
- ✅ Status updates succeed
- ✅ UI updates optimistically

#### 3.3 Browse Projects (Read-Only)
- [ ] Navigate to Projects
- [ ] Verify engineer can view projects (if assigned)
- [ ] Check that engineer cannot create new projects (CLIENT-only feature)

**Expected**:
- ✅ Can view assigned projects
- ✅ No "Create Project" button (or button shows error)

#### 3.4 Profile & Logout
- [ ] Check profile shows "ENGINEER" role
- [ ] Logout

**Expected**:
- ✅ Role displays correctly
- ✅ Logout successful

---

## 📋 Test Scenario 4: ADMIN Role Journey

**Objective**: Verify admin-specific features and access

### Steps:

#### 4.1 Login as Admin
- [ ] Login with: `admin.test@demo.com` / `Test123456`

**Expected**:
- ✅ Login successful
- ✅ Welcome message shows "Admin Demo"

#### 4.2 View All Tasks (Admin View)
- [ ] Navigate to tasks section
- [ ] Verify admin can see ALL tasks (not just assigned)
- [ ] Check task count is comprehensive

**Expected**:
- ✅ GET /tasks endpoint accessible (not /tasks/my-tasks)
- ✅ All tasks visible across all projects

#### 4.3 View All Notifications
- [ ] Navigate to notifications
- [ ] Verify admin notifications load
- [ ] Check for system-level notifications

**Expected**:
- ✅ Admin receives broader notifications
- ✅ Can manage all notifications

#### 4.4 Access Admin Features
- [ ] Check if admin panel/menu exists
- [ ] Verify elevated permissions in UI

**Expected**:
- ✅ Admin-only features visible
- ✅ Full access to management screens

#### 4.5 Profile & Logout
- [ ] Verify role shows "ADMIN"
- [ ] Logout

---

## 📋 Test Scenario 5: Error Handling & Recovery

**Objective**: Verify app handles errors gracefully

### Steps:

#### 5.1 Network Error
- [ ] Login with any account
- [ ] Turn OFF WiFi/mobile data
- [ ] Navigate to Projects tab
- [ ] Verify error message displays:
  - 🔴 "Network Error"
  - "Unable to connect. Check your internet connection."
  - [Retry] button visible
- [ ] Turn ON internet
- [ ] Tap [Retry] button
- [ ] Verify data loads successfully

**Expected**:
- ✅ Network error detected
- ✅ User-friendly error message
- ✅ Retry button works
- ✅ Data loads after retry

#### 5.2 Slow Network (Timeout)
- [ ] Simulate slow network (if possible via dev tools)
- [ ] Make an API request
- [ ] Wait > 30 seconds
- [ ] Verify timeout error shows:
  - 🟡 "Request Timeout"
  - "The request is taking too long. Try again."

**Expected**:
- ✅ Request times out after 30s
- ✅ Timeout error message shows
- ✅ Can retry request

#### 5.3 Expired Token Refresh
- [ ] Login with any account
- [ ] Wait 15+ minutes (or manually expire token via dev tools)
- [ ] Make an API request (navigate to Projects)
- [ ] Verify automatic token refresh:
  - Brief loading state
  - Request succeeds after refresh
  - No logout or error

**Expected**:
- ✅ 401 detected automatically
- ✅ Token refresh attempted
- ✅ Original request retried with new token
- ✅ User sees seamless experience

#### 5.4 Refresh Token Expired (Force Logout)
- [ ] Login
- [ ] Manually invalidate BOTH tokens (via dev tools or wait 7 days)
- [ ] Make an API request
- [ ] Verify automatic logout:
  - "Session expired" message (or similar)
  - Redirects to signin screen

**Expected**:
- ✅ Refresh fails, triggers logout
- ✅ User redirected to signin
- ✅ Cannot access protected screens

---

## 📋 Test Scenario 6: Loading States

**Objective**: Verify all loading indicators work correctly

### Steps:

#### 6.1 Skeleton Screens
- [ ] Logout (clear cache)
- [ ] Login
- [ ] Navigate to Services marketplace
- [ ] Observe initial load
- [ ] Verify skeleton cards show before data loads

**Expected**:
- ✅ SkeletonCard components visible
- ✅ Smooth transition to real data
- ✅ No blank screen flash

#### 6.2 Inline Loaders
- [ ] Navigate to any screen with action buttons
- [ ] Trigger an action (e.g., mark notification as read)
- [ ] Verify inline loader shows in button

**Expected**:
- ✅ InlineLoader replaces button text
- ✅ Button disabled during action
- ✅ Returns to normal after completion

#### 6.3 Overlay Loader
- [ ] Trigger a critical action (e.g., logout)
- [ ] Verify fullscreen overlay loader shows

**Expected**:
- ✅ Semi-transparent overlay covers screen
- ✅ Loading spinner + text visible
- ✅ Blocks interaction during action

#### 6.4 Pull-to-Refresh
- [ ] On any list screen (Projects, Notifications, Services)
- [ ] Pull down to refresh
- [ ] Verify refresh indicator shows
- [ ] Wait for data reload

**Expected**:
- ✅ Native pull-to-refresh indicator
- ✅ Data reloads from backend
- ✅ List updates with fresh data

---

## 📋 Test Scenario 7: Cross-Screen Navigation

**Objective**: Verify navigation flows work correctly

### Steps:

#### 7.1 Tab Navigation
- [ ] Login
- [ ] Tap each bottom tab: Home → Projects → Notifications → Profile
- [ ] Verify each screen loads correctly
- [ ] Tap tabs in different order
- [ ] Verify no navigation bugs

**Expected**:
- ✅ All tabs navigate correctly
- ✅ Tab highlighting shows active tab
- ✅ Back button behavior appropriate for each tab

#### 7.2 Deep Navigation
- [ ] From home, navigate to Projects
- [ ] Tap on a project → Project Details
- [ ] From project details, view a task (if available)
- [ ] Use back button to navigate back step-by-step
- [ ] Verify each back press goes to correct previous screen

**Expected**:
- ✅ Deep navigation works
- ✅ Back stack preserved
- ✅ Can navigate back to root

#### 7.3 Navigation After Logout
- [ ] Logout
- [ ] Try to manually navigate to protected routes (if possible via deep link)
- [ ] Verify redirects to signin

**Expected**:
- ✅ Protected routes blocked
- ✅ Always redirects to signin when not authenticated

---

## 📋 Test Scenario 8: Data Consistency

**Objective**: Verify data stays consistent across screens

### Steps:

#### 8.1 Profile Data Consistency
- [ ] Login as CLIENT
- [ ] Note profile name/email on Profile screen
- [ ] Navigate to Home screen
- [ ] Verify welcome message shows same name
- [ ] Logout and login as ENGINEER
- [ ] Verify profile changes to engineer data

**Expected**:
- ✅ User data consistent across screens
- ✅ No stale data from previous user

#### 8.2 Projects Data Consistency
- [ ] View projects list
- [ ] Note project count and names
- [ ] Navigate away and back to Projects
- [ ] Verify same data shows (without API call if cached)
- [ ] Pull-to-refresh
- [ ] Verify data updates if backend changed

**Expected**:
- ✅ Data consistent between navigations
- ✅ Refresh updates data from backend

---

## ✅ Test Summary Checklist

### Authentication & Authorization
- [ ] Login works for all 3 roles (CLIENT, ENGINEER, ADMIN)
- [ ] Registration creates new account
- [ ] Logout clears session and redirects
- [ ] Token refresh automatic on 401
- [ ] Force logout on refresh token expiry

### API Integration
- [ ] Services marketplace loads and filters correctly
- [ ] Projects list shows correct data for CLIENT role
- [ ] Tasks accessible to ENGINEER role
- [ ] Notifications load and mark as read
- [ ] Profile shows correct user data

### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Timeout errors handled gracefully
- [ ] Server errors (5xx) show retry option
- [ ] 404 errors handled appropriately
- [ ] All errors have retry functionality

### Loading States
- [ ] Skeleton screens on initial load
- [ ] Inline loaders in buttons during actions
- [ ] Overlay loader for critical operations
- [ ] Pull-to-refresh works on all lists

### Navigation
- [ ] Bottom tab navigation works
- [ ] Deep navigation and back stack correct
- [ ] Protected routes blocked when logged out
- [ ] Navigation state preserved during app lifecycle

### Data Consistency
- [ ] User data consistent across screens
- [ ] No stale data after logout/login
- [ ] Data updates correctly after refresh
- [ ] Role-based access enforced

---

## 🐛 Issues Found

| # | Issue | Screen | Severity | Status |
|---|-------|--------|----------|--------|
| 1 | (Example) Network error shows generic message | Projects | Low | Open |
| 2 | ... | ... | ... | ... |

*(Update this table as testing progresses)*

---

## 📊 Test Results Summary

**Test Date**: _________  
**Tester**: _________  
**Device**: _________  
**OS Version**: _________

**Overall Status**: 🟡 In Progress

| Scenario | Status | Pass Rate | Notes |
|----------|--------|-----------|-------|
| Scenario 1: New User Journey | ⏳ Not Started | 0/15 | |
| Scenario 2: Returning User | ⏳ Not Started | 0/18 | |
| Scenario 3: ENGINEER Role | ⏳ Not Started | 0/12 | |
| Scenario 4: ADMIN Role | ⏳ Not Started | 0/10 | |
| Scenario 5: Error Handling | ⏳ Not Started | 0/16 | |
| Scenario 6: Loading States | ⏳ Not Started | 0/10 | |
| Scenario 7: Navigation | ⏳ Not Started | 0/12 | |
| Scenario 8: Data Consistency | ⏳ Not Started | 0/8 | |
| **TOTAL** | **⏳** | **0/101** | |

---

## 🎬 Getting Started with Testing

### Prerequisites
1. **Backend API**: https://baotienweb.cloud/api/v1 (running)
2. **Test Accounts**: CLIENT, ENGINEER, ADMIN credentials ready
3. **Device**: Android/iOS device or emulator
4. **Network**: Stable WiFi connection

### Starting the App
```bash
# Start Metro bundler
npm start

# On Android
npm run android

# On iOS  
npm run ios

# On Web
npm run web
```

### Test Execution Tips
1. **Test in order**: Follow scenarios 1-8 sequentially
2. **Check boxes**: Mark each step as completed
3. **Take screenshots**: Capture any errors or unexpected behavior
4. **Log issues**: Record all bugs in "Issues Found" table
5. **Retry on failure**: Some network issues may be transient
6. **Clear app data**: Between major scenarios to ensure clean state

### Reporting Results
After completing all scenarios:
1. Update "Test Results Summary" table
2. Calculate pass rates (passed steps / total steps)
3. Document all issues found
4. Provide overall assessment
5. Share this document with team

---

**Next Steps After E2E Testing**:
- Fix any critical bugs discovered
- Optimize performance bottlenecks identified
- Enhance UX based on test observations
- Consider automated E2E testing (Detox, Appium)
- Proceed to production deployment

---

**Status**: ✅ Test Plan Ready  
**Last Updated**: December 11, 2025
