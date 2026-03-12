# WebRTC Testing & Sitemap Completion Plan

## 🎯 Priority 1: WebRTC Testing (DO THIS FIRST)

### Current Status:
- ✅ Frontend: WebRTC implementation complete
- ✅ Backend: Code fixes ready (not deployed yet)
- ✅ Packages: expo-background-fetch, expo-task-manager installed
- ⏳ Deployment: Backend needs deployment to VPS
- ⏳ Build: Development build needed for testing

---

## 📋 WebRTC Testing Checklist

### Step 1: Deploy Backend Fixes ⏳
```powershell
# In separate terminal (don't stop Expo server)
.\deploy-backend-webrtc.ps1
```

**Expected:**
- [OK] SSH connection successful
- [OK] Files uploaded
- [OK] Build successful
- [OK] PM2 restarted
- [OK] API is responding

**If fails:** Check [ANDROID_TESTING_GUIDE.md](ANDROID_TESTING_GUIDE.md)

---

### Step 2: Prepare Testing Devices ⏳

**Option A: 2 Physical Devices (RECOMMENDED)**
```bash
# Enable USB debugging on both phones
# Connect phone 1
adb devices
# Should show device 1

# Build & install
npm run run:dev:android
# Wait 5-10 minutes for first build

# Disconnect phone 1, connect phone 2
# Install APK on phone 2
adb install <apk-path>
```

**Option B: 1 Device + Emulator (Limited)**
```bash
# Fix emulator first
.\fix-emulator.ps1
# Choose option 1 or 3

# Build
npm run run:dev:android
```

---

### Step 3: Test Video Call ⏳

**Device 1:**
1. Open app
2. Login: `testuser@baotienweb.cloud` / `Test123456`
3. Navigate: Home → Contacts (or Profile → Contacts)
4. Find "Test User 2"
5. Tap video call icon

**Device 2:**
1. Open app
2. Login: `testuser2@baotienweb.cloud` / `Test123456`
3. Wait for incoming call popup
4. Tap "Accept"

**Expected Result:**
- ✅ Local video shows on both devices (small preview)
- ✅ Remote video shows on both devices (full screen)
- ✅ Audio works both directions
- ✅ Controls work: Mute, Video Off, Speaker, Flip Camera
- ✅ End call returns to previous screen

---

### Step 4: Debug If Issues ⏳

**Check Backend Logs:**
```bash
ssh root@baotienweb.cloud 'pm2 logs baotienweb-api --lines 100'
```

**Check Frontend Logs:**
- Open Chrome DevTools (shake device → Debug Remote JS)
- Look for errors in Console tab

**Common Issues:**
| Issue | Solution |
|-------|----------|
| No video stream | Check camera permissions granted |
| No audio | Check microphone permissions granted |
| Call doesn't connect | Check backend logs for signaling errors |
| "WebRTC not available" | Need development build (not Expo Go) |
| Connection timeout | Need TURN server (production only) |

---

## 🗺️ Priority 2: Sitemap & Navigation Structure

### Current App Structure:

```
APP_DESIGN_BUILD
├── (auth) - Authentication Screens
│   ├── login.tsx ✅
│   ├── register.tsx ✅
│   └── auth-3d-flip.tsx ✅
│
├── (tabs) - Main App Tabs
│   ├── index.tsx (Home) ✅
│   │   ├── Header with search
│   │   ├── Category grid (9 categories)
│   │   ├── Services section
│   │   ├── Quick tools
│   │   └── Product showcase
│   │
│   ├── shop.tsx (Projects/Shop) ✅
│   │   ├── Project list view
│   │   ├── Grid/List toggle
│   │   └── Filter options
│   │
│   ├── notifications.tsx ✅
│   │   ├── Notification list
│   │   └── Mark as read
│   │
│   ├── profile.tsx (Personal) ✅
│   │   ├── User info
│   │   ├── Settings
│   │   ├── Contacts ✅
│   │   ├── Call history ✅
│   │   └── Logout
│   │
│   ├── menu4.tsx → menu9.tsx (Hidden menus) ⚠️
│   │   └── NOT in tab bar (tabBarButton: null)
│
├── cart.tsx (Shopping Cart) ✅
├── product/[id].tsx (Product Detail) ✅
└── call/active.tsx (Active Call Screen) ✅
```

---

### 🔍 Issues Found:

#### 1. Missing Links on Home Screen Cards

**Categories (9 items):**
- ❌ Dịch vụ thi công → No link
- ❌ Hoàn thiện nội thất → No link
- ❌ Dịch vụ chuyên nghiệp → No link
- ✅ Công cụ quản lý → Has screens
- ❌ Miễn phí tư vấn → No screen
- ❌ Other categories → Need screens

**Services:**
- ❌ Service cards → Static, no navigation
- Need: service/[id].tsx screen

**Quick Tools:**
- ❌ Tool cards → Static, no functionality
- Need: tool-specific screens

---

#### 2. Hidden Menu Screens (menu4-menu9)

**Current:**
```typescript
// app/(tabs)/_layout.tsx
<Tabs.Screen name="menu4" options={{ tabBarButton: () => null }} />
<Tabs.Screen name="menu5" options={{ tabBarButton: () => null }} />
// ... menu6-9
```

**Issues:**
- ❌ Not accessible from anywhere
- ❌ No navigation paths defined
- ❌ Unknown purpose/content

**Need to decide:**
1. Convert to proper feature screens?
2. Remove if unused?
3. Create navigation from home categories?

---

#### 3. Contacts & Call System

**Current:**
- ✅ Contacts list: `/profile` → Contacts button
- ✅ Call history: `/profile` → Call History button
- ✅ Video call UI: Working
- ⏳ WebRTC: Needs testing

**Missing:**
- ❌ Direct link from Home to Contacts
- ❌ Quick call button on Home
- ❌ Recent calls widget

---

### 📝 Proposed Sitemap (Complete)

```
Root
│
├── Authentication Flow
│   ├── /login
│   ├── /register
│   └── /auth-3d-flip (Welcome screen)
│
├── Main App (Bottom Tabs)
│   │
│   ├── Tab 1: Home (/)
│   │   ├── Search bar
│   │   ├── Categories Grid
│   │   │   ├── Dịch vụ thi công → /services/construction
│   │   │   ├── Hoàn thiện nội thất → /services/interior
│   │   │   ├── Dịch vụ chuyên nghiệp → /services/professional
│   │   │   ├── Công cụ quản lý → /tools/management
│   │   │   ├── Miễn phí tư vấn → /consultation/free
│   │   │   └── [6 more categories] → /category/[slug]
│   │   │
│   │   ├── Services Section
│   │   │   └── Service cards → /service/[id]
│   │   │
│   │   ├── Quick Tools
│   │   │   ├── Calculator → /tools/calculator
│   │   │   ├── Budget → /tools/budget
│   │   │   ├── 3D Viewer → /tools/3d-viewer
│   │   │   └── Progress Tracker → /tools/progress
│   │   │
│   │   └── Products Showcase
│   │       └── Product cards → /product/[id] ✅
│   │
│   ├── Tab 2: Projects (/shop)
│   │   ├── Project grid/list
│   │   ├── Filter & sort
│   │   └── Project detail → /project/[id]
│   │
│   ├── Tab 3: Notifications (/notifications)
│   │   ├── All notifications
│   │   ├── Mark as read
│   │   └── Notification settings → /settings/notifications
│   │
│   └── Tab 4: Profile (/profile)
│       ├── User info
│       ├── Contacts → /contacts ✅
│       ├── Call History → /call-history ✅
│       ├── Messages → /messages
│       ├── Settings → /settings
│       │   ├── Account
│       │   ├── Privacy
│       │   ├── Notifications
│       │   └── About
│       └── Logout
│
├── Shopping Flow
│   ├── /cart ✅
│   ├── /checkout
│   └── /order/[id]
│
├── Communication
│   ├── /contacts ✅
│   ├── /call-history ✅
│   ├── /call/active ✅ (Video call)
│   ├── /messages (Chat)
│   └── /conversation/[id]
│
├── Services & Tools
│   ├── /service/[id]
│   ├── /category/[slug]
│   ├── /tools/calculator
│   ├── /tools/budget
│   ├── /tools/3d-viewer
│   └── /tools/progress
│
└── Settings & Help
    ├── /settings
    ├── /help
    ├── /terms
    └── /privacy
```

---

## 🚀 Action Plan

### Phase 1: WebRTC Testing (TODAY) ⏳

```bash
# 1. Deploy backend (5 minutes)
.\deploy-backend-webrtc.ps1

# 2. Build development build (10 minutes)
npm run run:dev:android

# 3. Test on 2 devices (20 minutes)
# Follow Step 3 above

# 4. Fix any bugs found (1-2 hours)
```

**Success Criteria:**
- [ ] Backend deployed successfully
- [ ] App installed on 2 devices
- [ ] Video call connects
- [ ] Video/audio streams work
- [ ] Controls functional
- [ ] Call ends properly

---

### Phase 2: Create Missing Screens (NEXT)

**Priority Order:**

**1. Service Detail Screen** (High)
```bash
# Create: app/service/[id].tsx
# Purpose: Show service details, pricing, booking
# Links from: Home service cards
```

**2. Category Screens** (High)
```bash
# Create: app/category/[slug].tsx
# Purpose: Show category content, filtered items
# Links from: Home category grid
```

**3. Tool Screens** (Medium)
```bash
# Create: 
# - app/tools/calculator.tsx (Cost calculator)
# - app/tools/budget.tsx (Budget planner)
# - app/tools/3d-viewer.tsx (3D model viewer)
# - app/tools/progress.tsx (Project progress)
# Links from: Home quick tools
```

**4. Clean Up Hidden Menus** (Low)
```bash
# Either:
# A. Remove menu4-menu9 if unused
# B. Convert to feature screens
# C. Document their purpose
```

**5. Navigation Enhancements** (Medium)
```bash
# Add:
# - Quick access to Contacts from Home
# - Recent calls widget on Home
# - Chat/Messages screen
# - Settings subpages
```

---

### Phase 3: Sitemap Documentation (AFTER TESTING)

**Create comprehensive sitemap with:**
- Navigation flow diagram
- Screen relationships
- Deep link structure
- SEO metadata (for web)

---

## 📊 Current Progress

| Feature | Status | Priority | ETA |
|---------|--------|----------|-----|
| WebRTC Backend Fix | ✅ Code Ready | 🔴 HIGH | 5 min |
| WebRTC Testing | ⏳ Pending | 🔴 HIGH | 30 min |
| Service Detail Screen | ❌ Missing | 🔴 HIGH | 2 hours |
| Category Screens | ❌ Missing | 🔴 HIGH | 3 hours |
| Tool Screens | ❌ Missing | 🟡 MEDIUM | 4 hours |
| Chat/Messages | ❌ Missing | 🟡 MEDIUM | 6 hours |
| Settings Subpages | ❌ Missing | 🟢 LOW | 2 hours |
| Clean Up Menus | ❌ Pending | 🟢 LOW | 1 hour |
| Sitemap Documentation | ❌ Missing | 🟢 LOW | 1 hour |

---

## 🎯 Next Immediate Steps

1. **NOW:** Deploy backend WebRTC fixes
   ```bash
   # In new terminal (keep Expo running)
   .\deploy-backend-webrtc.ps1
   ```

2. **THEN:** Build & test WebRTC (30 minutes)
   ```bash
   npm run run:dev:android
   # Test on 2 devices
   ```

3. **AFTER:** Create missing screens (6-8 hours)
   - Service detail
   - Category pages
   - Tool screens

4. **FINALLY:** Complete sitemap documentation

---

**Question:** Bạn muốn:
- **A.** Deploy backend WebRTC ngay bây giờ?
- **B.** Tạo missing screens trước (service, category, tools)?
- **C.** Làm cả 2 song song (deploy backend + tạo 1 screen mẫu)?

Chọn A/B/C? 🎯
