# 🎨 Perfex Login - Visual Preview

**Component:** DevLoginHelper + Enhanced Login Screen  
**Created:** 2025-12-31  
**Platform:** Web / iOS / Android

---

## 📱 Login Screen Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│           🔵 Gradient Background            │
│                                             │
│                                             │
│              [Perfex Logo]                  │
│                                             │
│          Đăng nhập Perfex CRM               │
│        Dành cho nhân viên & khách hàng      │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │  [ Staff ]     [ Customer ]             │ │ ← Toggle
│ │                                         │ │
│ │  Email                                  │ │
│ │  ┌───────────────────────────────────┐ │ │
│ │  │ 📧 staff@example.com              │ │ │
│ │  └───────────────────────────────────┘ │ │
│ │                                         │ │
│ │  Mật khẩu                               │ │
│ │  ┌───────────────────────────────────┐ │ │
│ │  │ 🔒 ••••••••              👁       │ │ │
│ │  └───────────────────────────────────┘ │ │
│ │                                         │ │
│ │        🟠 [⚡ Quick Fill]               │ │ ← NEW!
│ │                                         │ │
│ │  ⬜ Nhớ tài khoản này                  │ │ ← NEW!
│ │                                         │ │
│ │  ┌─────────────────────────────────┐   │ │
│ │  │      Đăng nhập (Loading...)     │   │ │
│ │  └─────────────────────────────────┘   │ │
│ │                                         │ │
│ │  Quay lại đăng nhập chính              │ │
│ │  Test API Connection (dev)              │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Quick Fill Modal (Development Only)

### Closed State
```
┌──────────────────────┐
│  ⚡ Quick Fill       │ ← Orange button, centered
└──────────────────────┘
```

### Open State (Modal)
```
╔═══════════════════════════════════════════════╗
║  Overlay (semi-transparent black)             ║
║                                               ║
║  ┌───────────────────────────────────────┐   ║
║  │  Test Credentials             [X]     │   ║
║  ├───────────────────────────────────────┤   ║
║  │                                       │   ║
║  │  ┌─────────────────────────────────┐ │   ║
║  │  │ 🔵 Staff Account            →   │ │   ║
║  │  │ staff@thietkeresort.com         │ │   ║
║  │  │ Role: Staff Member              │ │   ║
║  │  └─────────────────────────────────┘ │   ║
║  │                                       │   ║
║  │  ┌─────────────────────────────────┐ │   ║
║  │  │ 🔷 Customer Account         →   │ │   ║
║  │  │ customer@thietkeresort.com      │ │   ║
║  │  │ Role: Client                    │ │   ║
║  │  └─────────────────────────────────┘ │   ║
║  │                                       │   ║
║  │  ┌─────────────────────────────────┐ │   ║
║  │  │ 🟠 Admin Account            →   │ │   ║
║  │  │ admin@thietkeresort.com         │ │   ║
║  │  │ Role: Administrator             │ │   ║
║  │  └─────────────────────────────────┘ │   ║
║  │                                       │   ║
║  │  ℹ️  Development mode only           │   ║
║  └───────────────────────────────────────┘   ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🎨 Color Scheme

### Gradient Background
```
Top:    #03a9f4 (Light Blue)
Bottom: #00bcd4 (Cyan)
```

### Quick Fill Button
```
Background: #ff9800 (Orange)
Text: #ffffff (White)
Icon: ⚡ (Lightning bolt)
```

### Role Badges
```
Staff:    #03a9f4 (Blue)     - Icon: 💼 briefcase
Customer: #00bcd4 (Cyan)     - Icon: 👥 people
Admin:    #ff9800 (Orange)   - Icon: 🛡️ shield-checkmark
```

### Form Elements
```
Input Border:  #e0e0e0 (Light Gray)
Input Focus:   #03a9f4 (Blue)
Error:         #f44336 (Red)
Success:       #4caf50 (Green)
Text:          #2c3e50 (Dark Gray)
Muted:         #7f8c8d (Gray)
```

---

## 📐 Dimensions & Spacing

### Container
```
Width:      90% (max 400px)
Padding:    24px
Border:     12px radius
Shadow:     0 4px 16px rgba(0,0,0,0.1)
```

### Quick Fill Button
```
Padding:    8px 12px (vertical, horizontal)
Border:     8px radius
Gap:        6px (icon to text)
Margin:     12px (vertical)
```

### Modal
```
Width:      100% (max 400px)
Border:     16px radius
Shadow:     0 4px 8px rgba(0,0,0,0.2)
Elevation:  8 (Android)
```

### Option Cards
```
Padding:    16px
Border:     12px radius
Gap:        12px (between cards)
Background: #f8f9fa
Border:     1px #e0e0e0
```

---

## 🎬 Animation & Interactions

### Modal Entrance
```
Animation:   fade
Duration:    300ms
Easing:      ease-out
From:        opacity: 0
To:          opacity: 1
```

### Button Press
```
State:       activeOpacity: 0.8
Feedback:    Haptic (iOS/Android)
Ripple:      Android Material Design
```

### Form Focus
```
Border:      #e0e0e0 → #03a9f4
Shadow:      0 → 0 0 4px rgba(3,169,244,0.3)
Duration:    200ms
```

---

## 🖼️ Icons Reference

### Ionicons Used
```tsx
// Login Screen
<Ionicons name="mail" size={20} />           // Email input
<Ionicons name="lock-closed" size={20} />    // Password input
<Ionicons name="eye" size={20} />            // Show password
<Ionicons name="eye-off" size={20} />        // Hide password
<Ionicons name="arrow-back" size={24} />     // Back button
<Ionicons name="alert-circle" size={20} />   // Error icon

// Quick Fill Modal
<Ionicons name="flash" size={16} />          // Quick Fill button
<Ionicons name="close" size={24} />          // Close modal
<Ionicons name="briefcase" size={24} />      // Staff badge
<Ionicons name="people" size={24} />         // Customer badge
<Ionicons name="shield-checkmark" size={24} /> // Admin badge
<Ionicons name="chevron-forward" size={20} /> // Arrow right
<Ionicons name="information-circle" size={16} /> // Info icon
```

---

## 📱 Responsive Behavior

### Mobile (< 400px)
```
Container Width:  90%
Font Size:        14px (body), 18px (title)
Button Height:    48px (touch target)
Modal:            Full width - 40px margin
```

### Tablet (400px - 768px)
```
Container Width:  400px fixed
Font Size:        15px (body), 20px (title)
Modal:            400px fixed
```

### Desktop (> 768px)
```
Container Width:  400px fixed
Hover Effects:    Enabled
Cursor:           Pointer on interactive elements
Modal:            Centered with overlay
```

---

## ⚡ State Indicators

### Loading State
```
┌─────────────────────┐
│  ⏳ Đang đăng nhập  │  ← Button disabled
│  [Spinner animation]│
└─────────────────────┘
```

### Error State
```
┌────────────────────────────────┐
│ 🔴 Email không hợp lệ         │  ← Red text
└────────────────────────────────┘
```

### Success State (Navigation)
```
Redirect to: /(tabs)
Animation: Slide from right
```

---

## 🎭 User Flow Visualization

### Flow 1: Quick Fill Login
```
Login Screen
     ↓
Click "Quick Fill"
     ↓
Modal Opens (fade in)
     ↓
Select "Staff Account"
     ↓
Modal Closes (fade out)
     ↓
Form Auto-filled ✅
     ↓
Click "Đăng nhập"
     ↓
Loading Spinner
     ↓
Success → Dashboard
```

### Flow 2: Remember Me
```
Login Screen
     ↓
Enter Email
     ↓
Check "Remember Me" ✅
     ↓
Login Success
     ↓
Sign Out
     ↓
Return to Login
     ↓
Email Auto-filled ✅
```

---

## 🔍 Accessibility

### Screen Reader Labels
```tsx
<TouchableOpacity
  accessible
  accessibilityLabel="Quick fill test credentials"
  accessibilityRole="button"
/>

<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your Perfex CRM email"
/>
```

### Keyboard Navigation
```
Tab Order:
1. User Type Toggle (Staff/Customer)
2. Email Input
3. Password Input
4. Show/Hide Password Button
5. Quick Fill Button
6. Remember Me Checkbox
7. Login Button
8. Back to Main Login Link
```

---

## 📊 Component Hierarchy

```
LoginPerfexScreen
├── LinearGradient (Background)
├── ScrollView
│   ├── KeyboardAvoidingView
│   │   ├── Container
│   │   │   ├── Logo Image
│   │   │   ├── Title Text
│   │   │   ├── Subtitle Text
│   │   │   ├── Form Container
│   │   │   │   ├── User Type Toggle
│   │   │   │   │   ├── Staff Button
│   │   │   │   │   └── Customer Button
│   │   │   │   ├── Email Input Group
│   │   │   │   │   ├── Label
│   │   │   │   │   ├── Input (with icon)
│   │   │   │   │   └── Error Text
│   │   │   │   ├── Password Input Group
│   │   │   │   │   ├── Label
│   │   │   │   │   ├── Input (with icons)
│   │   │   │   │   └── Error Text
│   │   │   │   ├── DevLoginHelper ★ NEW
│   │   │   │   │   ├── Trigger Button
│   │   │   │   │   └── Modal
│   │   │   │   │       ├── Header (Title + Close)
│   │   │   │   │       ├── Options
│   │   │   │   │       │   ├── Staff Option
│   │   │   │   │       │   ├── Customer Option
│   │   │   │   │       │   └── Admin Option
│   │   │   │   │       └── Footer (Info)
│   │   │   │   ├── Remember Me Checkbox ★ NEW
│   │   │   │   ├── General Error Alert
│   │   │   │   └── Login Button
│   │   │   ├── Back to Main Link
│   │   │   └── Test API Link (dev)
```

---

## 🎨 Design Tokens

### Typography
```javascript
const TYPOGRAPHY = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  body: {
    fontSize: 15,
    color: '#2c3e50',
  },
  error: {
    fontSize: 12,
    color: '#f44336',
  },
  muted: {
    fontSize: 12,
    color: '#7f8c8d',
  },
};
```

### Spacing
```javascript
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

---

## ✅ Visual Checklist

### Login Screen Elements
- [ ] Gradient background (blue → cyan)
- [ ] Perfex logo (centered, white)
- [ ] Title: "Đăng nhập Perfex CRM"
- [ ] Subtitle: "Dành cho nhân viên & khách hàng"
- [ ] User type toggle (active state highlighted)
- [ ] Email input (mail icon, placeholder)
- [ ] Password input (lock icon, eye toggle)
- [ ] **Quick Fill button (orange, flash icon)** ← NEW
- [ ] **Remember Me checkbox** ← NEW
- [ ] Login button (disabled when loading)
- [ ] Back to main login link
- [ ] Test API link (dev only)

### Quick Fill Modal
- [ ] Semi-transparent overlay
- [ ] White modal card (rounded corners)
- [ ] "Test Credentials" title
- [ ] Close button (X)
- [ ] 3 option cards (Staff, Customer, Admin)
- [ ] Role badges with icons (briefcase, people, shield)
- [ ] Email display
- [ ] Role description
- [ ] Arrow right indicators
- [ ] Footer info text
- [ ] Fade in/out animation

---

## 📸 Screenshot Locations

### Where to Test Visuals
1. **Web:** http://localhost:8083/(auth)/login-perfex
2. **iOS Simulator:** Run `npm run ios`
3. **Android Emulator:** Run `npm run android`

### Visual States to Capture
1. Default login screen
2. Quick Fill button (before click)
3. Quick Fill modal (open)
4. Staff option selected
5. Customer option selected
6. Admin option selected
7. Remember Me checked
8. Error state (invalid email)
9. Loading state (login in progress)
10. Success state (navigating away)

---

**Last Updated:** 2025-12-31  
**Designer:** ThietKeResort Team  
**Status:** ✅ Ready for visual QA
