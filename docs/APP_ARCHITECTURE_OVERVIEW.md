# 🏗️ App Architecture Overview - Tổng quan Kiến trúc Ứng dụng

> **Tài liệu phân tích toàn diện**: Sơ đồ kiến trúc app, kế hoạch tích hợp BE-FE, mapping chức năng với giao diện

---

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total Routes** | 548 routes | ✅ Complete |
| **Categories** | 18 major categories | ✅ Defined |
| **Implemented Screens** | ~120 screens | 🟡 60% coverage |
| **Backend Integration** | 5/18 categories | 🔴 30% complete |
| **Missing Endpoints** | ~200 endpoints | 🔴 Critical |
| **Tech Stack** | Expo Router + React 19 + TS | ✅ Modern |

---

## 🗺️ Sitemap Structure (548 Routes)

### 1️⃣ **AUTH_ROUTES** (4 routes)
**Purpose**: Authentication & Authorization

| Route | Screen | Backend Endpoint | Status |
|-------|--------|------------------|--------|
| `/(auth)/login` | ✅ login.tsx | ✅ POST /auth/login | ✅ Complete |
| `/(auth)/register` | ✅ register.tsx | ✅ POST /auth/register | ✅ Complete |
| `/(auth)/forgot-password` | ✅ forgot-password.tsx | ⚠️ POST /auth/forgot-password | 🟡 FE only |
| `/(auth)/reset-password` | ✅ reset-password.tsx | ⚠️ POST /auth/reset-password | 🟡 FE only |

**Integration**: 75% complete (login/register work, password reset needs BE)

---

### 2️⃣ **MAIN_TAB_ROUTES** (10 routes)
**Purpose**: Bottom navigation tabs

| Route | Screen File | Backend | Status |
|-------|-------------|---------|--------|
| `/` (index) | ✅ app/(tabs)/index.tsx | ✅ GET /auth/me | ✅ Done |
| `/(tabs)/home-construction` | ✅ home-construction.tsx | ❌ No API yet | 🟡 UI only |
| `/(tabs)/projects` | ✅ projects.tsx | ⚠️ GET /projects | 🟡 Partial |
| `/(tabs)/notifications` | ✅ notifications.tsx | ✅ GET /notifications | ✅ Done |
| `/(tabs)/profile` | ✅ profile-luxury.tsx | ⚠️ GET /auth/me | 🟡 No upload |
| `/(tabs)/live` | ✅ live.tsx | ❌ No streaming | 🔴 Not started |
| `/(tabs)/cart` | ✅ cart.tsx | ❌ Local only | 🟡 No sync |
| `/(tabs)/menu` | ✅ menu.tsx | ❌ Static | ✅ UI done |

**Integration**: 40% complete (auth + notifications working)

---

### 3️⃣ **CONSTRUCTION_ROUTES** (8 routes)
**Purpose**: Construction-specific features

| Route | Screen | Backend Endpoint | Status |
|-------|--------|------------------|--------|
| `/construction/designer` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/construction/progress` | ✅ progress.tsx | ❌ No API | 🟡 Mock data |
| `/construction/tracking` | ✅ tracking.tsx | ❌ No API | 🟡 Mock data |
| `/construction/booking` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/construction/utilities` | ✅ utilities.tsx | ❌ No API | 🟡 Static |
| `/construction/payment-progress` | ✅ payment-progress.tsx | ❌ No API | 🟡 Mock |
| `/construction/villa-progress` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/construction/progress-tracking` | ✅ progress-tracking.tsx | ❌ No API | 🟡 Mock |

**Integration**: 0% (all screens use mock data)

---

### 4️⃣ **PROJECT_ROUTES** (30+ routes)
**Purpose**: Detailed project management (dynamic `[id]`)

**Main screens**:
- ✅ `/projects/[id]` → project detail
- ⚠️ `/projects/[id]/timeline` → timeline (partial)
- ❌ `/projects/[id]/workflow-map` → not implemented
- ❌ `/projects/[id]/documents` → not implemented
- ⚠️ `/projects/[id]/tasks` → tasks (partial)
- ❌ `/projects/[id]/team` → not implemented
- ❌ `/projects/[id]/reports` → not implemented

**Sub-modules**:
- **Diary**: `/projects/[id]/diary/` (3 routes) → ❌ Not implemented
- **Materials**: `/projects/[id]/materials/` (3 routes) → ❌ Not implemented
- **Equipment**: `/projects/[id]/equipment/` (3 routes) → ❌ Not implemented
- **QC**: `/projects/[id]/qc/` (3 routes) → ❌ Not implemented
- **Safety**: `/projects/[id]/safety/` (3 routes) → ❌ Not implemented

**Integration**: 10% (only basic project list + detail working)

**Required Endpoints**:
```typescript
// Core
GET /projects
GET /projects/:id
POST /projects
PATCH /projects/:id
DELETE /projects/:id

// Timeline
GET /projects/:id/timeline
POST /projects/:id/timeline/phases
POST /projects/:id/timeline/tasks

// Materials
GET /projects/:id/materials
POST /projects/:id/materials/requests

// Equipment
GET /projects/:id/equipment
POST /projects/:id/equipment/bookings

// QC/Safety
GET /projects/:id/qc/inspections
GET /projects/:id/safety/incidents
```

---

### 5️⃣ **PROJECT_LISTING_ROUTES** (11 routes)
**Purpose**: Project discovery & creation

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/projects/create` | ❌ Missing | ❌ POST /projects | 🔴 Not implemented |
| `/projects/library` | ✅ library.tsx | ❌ No API | 🟡 Static |
| `/projects/find-contractors` | ❌ Missing | ❌ GET /contractors | 🔴 Not implemented |
| `/projects/quotation-list` | ❌ Missing | ❌ GET /quotations | 🔴 Not implemented |
| `/projects/design-portfolio` | ❌ Missing | ❌ GET /portfolios?type=design | 🔴 Not implemented |

**Integration**: 0% (library screen exists but static)

---

### 6️⃣ **MANAGEMENT_ROUTES** (50+ routes)
**Purpose**: Admin dashboards, budget, timeline, inventory, labor, documents

**Dashboards**:
- ✅ `/dashboard/admin` → admin-enhanced.tsx (UI done)
- ✅ `/dashboard/client` → client-enhanced.tsx (UI done)
- ✅ `/dashboard/engineer` → engineer-enhanced.tsx (UI done)
- ❌ Backend: No analytics API

**Budget & Finance** (5 routes):
- ❌ All missing screens
- ❌ Endpoints: GET/POST /budget, /expenses, /invoices

**Timeline & Planning** (6 routes):
- ✅ `/timeline/index` → timeline.tsx (partial)
- ❌ `/timeline/critical-path` → not implemented
- ❌ Endpoints: GET/POST /timeline/phases, /tasks

**Inventory** (5 routes):
- ❌ All missing
- ❌ Endpoints: GET/POST /inventory/materials, /orders

**Labor** (7 routes):
- ❌ All missing
- ❌ Endpoints: GET/POST /labor/workers, /attendance, /payroll

**Documents** (6 routes):
- ❌ Upload implemented but no backend
- ❌ Endpoints: POST /documents/upload, GET /folders, /versions

**Contracts** (3 routes):
- ❌ Not implemented
- ❌ Endpoints: POST /contracts, /sign, /milestones

**Integration**: 5% (only dashboard UI exists)

---

### 7️⃣ **QUALITY_SAFETY_ROUTES** (14 routes)
**Purpose**: QC/QA, Safety, Punch List, As-Built

| Module | Routes | Screens | Backend | Status |
|--------|--------|---------|---------|--------|
| QC/QA | 5 | ⚠️ Partial | ❌ No API | 🔴 Mock only |
| Safety | 6 | ⚠️ Partial | ❌ No API | 🔴 Mock only |
| Punch List | 2 | ❌ Missing | ❌ No API | 🔴 Not implemented |
| As-Built | 1 | ❌ Missing | ❌ No API | 🔴 Not implemented |

**Integration**: 0%

---

### 8️⃣ **ADVANCED_ROUTES** (20+ routes)
**Purpose**: Document control, change management, RFI, submittal, commissioning

All routes: ❌ Not implemented
Backend: ❌ None

**Integration**: 0%

---

### 9️⃣ **RESOURCE_ROUTES** (12 routes)
**Purpose**: Resource planning, procurement, equipment, fleet, materials

All routes: ❌ Not implemented (except basic materials screen)
Backend: ❌ None

**Integration**: 5%

---

### 🔟 **RISK_ENV_ROUTES** (7 routes)
**Purpose**: Risk management, environmental, weather

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/weather/alerts` | ✅ alerts.tsx | ❌ No API | 🟡 Mock |
| `/weather/dashboard` | ✅ dashboard.tsx | ❌ No API | 🟡 Mock |
| `/weather/stoppages` | ✅ stoppages.tsx | ❌ No API | 🟡 Mock |
| `/risk/*` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/environmental/*` | ❌ Missing | ❌ No API | 🔴 Not implemented |

**Integration**: 0% (weather screens exist but use mock data)

---

### 1️⃣1️⃣ **COMMUNICATION_ROUTES** (14 routes)
**Purpose**: Messages, video calls, live streaming, stories

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/messages/index` | ✅ menu9.tsx | ⚠️ WebSocket ready | 🟡 BE not deployed |
| `/messages/[userId]` | ✅ Dynamic chat | ❌ No API | 🟡 Local only |
| `/call/video-call` | ❌ Missing | ❌ No WebRTC | 🔴 Not implemented |
| `/live/create` | ❌ Missing | ❌ No streaming | 🔴 Not implemented |
| `/stories/[userId]` | ✅ stories.tsx | ❌ No API | 🟡 Mock |

**Integration**: 10% (WebSocket context ready, backend not deployed)

---

### 1️⃣2️⃣ **SERVICES_ROUTES** (25+ routes)
**Purpose**: Service marketplace, house design, AI assistant

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/services/index` | ✅ index.tsx | ✅ GET /services | ✅ Working |
| `/services/house-design` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/services/permit` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/services/ai-assistant/*` | ⚠️ Partial | ❌ No AI API | 🟡 UI only |

**Integration**: 20% (marketplace works, specific services missing)

---

### 1️⃣3️⃣ **UTILITIES_ROUTES** (17 routes)
**Purpose**: Worker marketplace, material suppliers, utilities

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/utilities/[slug]` | ✅ [slug].tsx | ❌ No API | 🟡 Mock |
| `/utilities/vat-lieu` | ✅ vat-lieu.tsx | ❌ No API | 🟡 Mock |
| `/utilities/tho-xay` | ✅ tho-xay.tsx | ❌ No API | 🟡 Mock |
| `/utilities/qr-scanner` | ✅ qr-scanner.tsx | ✅ Local | ✅ Works |

**Integration**: 0% (all use mock data)

---

### 1️⃣4️⃣ **FINISHING_ROUTES** (8 routes)
**Purpose**: Finishing work - tiles, paint, doors, etc.

All routes: ❌ Not implemented (only data exists in home-construction.tsx)
Backend: ❌ None

**Integration**: 0%

---

### 1️⃣5️⃣ **SHOPPING_ROUTES** (12 routes)
**Purpose**: E-commerce, food ordering

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/product/[id]` | ✅ [id].tsx | ❌ No API | 🟡 Mock |
| `/checkout/*` | ❌ Missing | ❌ No payment | 🔴 Not implemented |
| `/food/*` | ❌ Missing | ❌ No API | 🔴 Not implemented |

**Integration**: 0%

---

### 1️⃣6️⃣ **PROFILE_ROUTES** (30+ routes)
**Purpose**: User profile, settings, payments, portfolio

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/profile/edit` | ✅ info-luxury.tsx | ⚠️ PATCH /profile | 🟡 FE ready, BE missing |
| `/profile/payment` | ✅ payment-luxury.tsx | ❌ No API | 🟡 Mock |
| `/profile/settings` | ❌ Missing | ❌ No API | 🔴 Not implemented |
| `/profile/orders` | ❌ Missing | ❌ GET /orders | 🔴 Not implemented |
| `/profile/portfolio/*` | ❌ Missing | ❌ No API | 🔴 Not implemented |

**Integration**: 10% (basic profile works, upload pending)

**Critical Missing**:
```typescript
POST /profile/avatar  // Profile picture upload
PATCH /profile        // Update user data
GET /profile/orders   // Order history
GET /profile/payment-methods  // Saved cards
```

---

### 1️⃣7️⃣ **MEDIA_ROUTES** (4 routes)
**Purpose**: Videos, search

| Route | Screen | Backend | Status |
|-------|--------|---------|--------|
| `/videos/index` | ✅ index.tsx | ⚠️ GET /videos | 🟡 Partial |
| `/search/*` | ❌ Missing | ❌ No search API | 🔴 Not implemented |

**Integration**: 25%

---

### 1️⃣8️⃣ **LEGAL_ROUTES** (6 routes)
**Purpose**: Terms, privacy policy, FAQ

All routes: ✅ Static screens exist
Backend: ❌ Not needed (static content)

**Integration**: 100% ✅

---

## 🎯 Priority Matrix: BE-FE Integration Plan

### Phase 1 - Critical Foundation (Week 1-2)
**Goal**: Enable core user flows

#### Backend Tasks
1. **Profile Upload** (2 days)
   ```typescript
   POST /api/v1/profile/avatar
   PATCH /api/v1/profile
   GET /api/v1/profile (enhance with avatar field)
   ```
   - File storage: `/uploads/avatars/`
   - Image processing: resize 512x512
   - Security: validate mime types

2. **Project CRUD** (3 days)
   ```typescript
   GET /api/v1/projects
   GET /api/v1/projects/:id
   POST /api/v1/projects
   PATCH /api/v1/projects/:id
   DELETE /api/v1/projects/:id
   ```

3. **Services Enhancement** (2 days)
   ```typescript
   GET /api/v1/services/:id/details
   POST /api/v1/services/bookings
   GET /api/v1/services/:id/reviews
   ```

#### Frontend Tasks
1. **Profile Sync** (1 day after BE ready)
   - Update `app/(tabs)/index.tsx`: use `useAvatarUpload()`
   - Update `app/(tabs)/profile-luxury.tsx`: use `useAvatarUpload()`
   - Update `app/profile/info-luxury.tsx`: connect upload button

2. **Project Integration** (2 days after BE ready)
   - Create `app/projects/create.tsx`
   - Enhance `app/projects/[id].tsx` with real data
   - Add loading states, error handling

3. **Service Detail Pages** (1 day)
   - Create service-specific screens (house-design, permit, etc.)
   - Connect booking flow

**Deliverables**:
- ✅ Users can upload avatar
- ✅ Projects can be created/edited
- ✅ Services can be booked

---

### Phase 2 - Project Management (Week 3-4)
**Goal**: Enable project workflows

#### Backend Tasks
1. **Timeline API** (3 days)
   ```typescript
   GET /api/v1/projects/:id/timeline
   POST /api/v1/projects/:id/timeline/phases
   POST /api/v1/projects/:id/timeline/tasks
   PATCH /api/v1/projects/:id/timeline/tasks/:taskId
   ```

2. **Materials API** (2 days)
   ```typescript
   GET /api/v1/projects/:id/materials
   POST /api/v1/projects/:id/materials/requests
   GET /api/v1/materials/suppliers
   ```

3. **Documents API** (2 days)
   ```typescript
   POST /api/v1/documents/upload
   GET /api/v1/projects/:id/documents
   GET /api/v1/documents/:id/versions
   ```

#### Frontend Tasks
1. **Timeline Enhancement** (2 days)
   - Enhance `app/timeline/index.tsx` with real API
   - Add phase creation UI
   - Add task management

2. **Materials Module** (2 days)
   - Create `app/projects/[id]/materials/index.tsx`
   - Create request form
   - Add supplier list

3. **Document Upload** (1 day)
   - Connect existing upload UI to backend
   - Add version history display

**Deliverables**:
- ✅ Timeline with phases and tasks
- ✅ Material request workflow
- ✅ Document management with versioning

---

### Phase 3 - Commerce & Communication (Week 5-6)
**Goal**: Enable shopping and messaging

#### Backend Tasks
1. **Shopping Cart API** (2 days)
   ```typescript
   GET /api/v1/cart
   POST /api/v1/cart/items
   DELETE /api/v1/cart/items/:id
   POST /api/v1/checkout
   ```

2. **Payment API** (3 days)
   ```typescript
   POST /api/v1/payments/create-intent
   POST /api/v1/payments/confirm
   GET /api/v1/orders
   GET /api/v1/orders/:id
   ```

3. **WebSocket Messaging** (3 days)
   ```typescript
   // WebSocket events
   connection → authenticate
   message:send → broadcast
   message:new → receive
   typing:start/stop → status
   ```

#### Frontend Tasks
1. **Cart Sync** (1 day)
   - Convert local cart to synced cart
   - Add optimistic updates

2. **Checkout Flow** (2 days)
   - Create checkout screens
   - Integrate payment gateway

3. **Real-time Chat** (2 days)
   - Connect WebSocket to backend
   - Add online/offline indicators
   - Add typing indicators

**Deliverables**:
- ✅ Synced shopping cart
- ✅ Complete checkout flow
- ✅ Real-time messaging

---

### Phase 4 - Advanced Features (Week 7-8)
**Goal**: Add specialized modules

#### Backend Tasks
1. **Budget & Finance API** (3 days)
2. **QC/Safety API** (3 days)
3. **Labor Management API** (2 days)

#### Frontend Tasks
1. Implement budget screens
2. Implement safety checklists
3. Implement labor/payroll

---

## 🔍 Screen Coverage Analysis

### ✅ Complete Screens (40%)
- Authentication (login, register)
- Home luxury (index.tsx)
- Home construction (home-construction.tsx)
- Profile luxury (profile-luxury.tsx)
- Notifications (notifications.tsx)
- Services marketplace (services/index.tsx)
- Videos (videos/index.tsx)
- Weather (alerts, dashboard, stoppages)
- Legal (terms, privacy, FAQ)

### 🟡 Partial Screens (20%)
- Projects list (no create/edit)
- Timeline (UI only, no API)
- Messages (WebSocket ready, BE not deployed)
- Profile edit (upload UI ready, BE missing)
- Shopping (product display, no checkout)

### 🔴 Missing Screens (40%)
- Project sub-modules (diary, materials, equipment, QC, safety)
- Management (budget, inventory, labor, contracts)
- Advanced (RFI, submittal, change orders)
- Communication (video calls, live streaming)
- Shopping (checkout, order tracking)
- Profile (settings, portfolio, verification)

---

## 🚨 Critical Blockers

### 1. Profile Avatar Upload
**Impact**: High - affects user experience across all screens
**Status**: Frontend ready, backend missing
**Required**:
- POST /api/v1/profile/avatar
- File storage setup
- Image processing

### 2. Project Creation
**Impact**: High - core feature unusable
**Status**: No screen, no backend
**Required**:
- Create form UI
- POST /api/v1/projects endpoint
- Validation logic

### 3. WebSocket Deployment
**Impact**: Medium - messaging doesn't work
**Status**: Frontend ready, backend not deployed
**Required**:
- Deploy WebSocket server (wss://baotienweb.cloud/ws)
- Configure authentication
- Test real-time events

### 4. Payment Integration
**Impact**: High - can't monetize
**Status**: No backend
**Required**:
- Payment gateway integration (Stripe/MoMo/ZaloPay)
- Order management system
- Webhook handling

---

## 🛠️ Fix "Premature Close" Error

**Error**: `Error: Premature close at onclose (node:internal/streams/end-of-stream:162:30)`

**Root Cause**: Metro bundler stream interrupted during compilation (happens when browser refreshes while bundling)

**Solutions**:
1. ✅ **Immediate**: Ignore - this is a non-critical warning
2. 🔧 **Short-term**: Add error handling in metro.config.js
3. 🎯 **Long-term**: Upgrade to Expo SDK 55 (better bundler stability)

**No action needed** - this error doesn't affect app functionality.

---

## 📈 Progress Dashboard

```
📊 Overall Progress: 35%
├── 🎨 UI Implementation: 60% ████████████░░░░░░░░
├── 🔌 Backend Integration: 30% ██████░░░░░░░░░░░░░░
├── 📱 Navigation: 90% ██████████████████░░
├── 🧪 Testing: 15% ███░░░░░░░░░░░░░░░░░
└── 📚 Documentation: 70% ██████████████░░░░░░

🎯 Categories Complete:
✅ Auth (75%)
✅ Legal (100%)
🟡 Services (20%)
🟡 Profile (10%)
🟡 Communication (10%)
🔴 Projects (10%)
🔴 Management (5%)
🔴 Shopping (0%)
🔴 Construction (0%)
```

---

## 🎯 Next Steps (This Week)

### Monday-Tuesday
- [ ] Backend: Implement POST /profile/avatar endpoint
- [ ] Backend: Setup file storage + image processing
- [ ] Frontend: Test avatar upload flow

### Wednesday-Thursday
- [ ] Backend: Implement POST /projects endpoint
- [ ] Frontend: Create project creation screen
- [ ] Frontend: Test project CRUD

### Friday
- [ ] Testing: End-to-end profile upload
- [ ] Testing: End-to-end project creation
- [ ] Documentation: Update API docs

---

## 📝 Conclusion

**Strengths**:
- ✅ Solid navigation structure (548 routes well-organized)
- ✅ Modern tech stack (Expo Router + React 19)
- ✅ Good UI coverage (60% screens implemented)
- ✅ Authentication working

**Weaknesses**:
- 🔴 Backend integration only 30% complete
- 🔴 200+ endpoints missing
- 🔴 Core features blocked (profile upload, project creation)
- 🔴 No payment system

**Recommendations**:
1. **Prioritize backend development** - frontend is waiting
2. **Focus on Phase 1 features** - profile + projects + services
3. **Deploy WebSocket server** - enable messaging
4. **Set up CI/CD** - automate testing

**Timeline**:
- Phase 1: 2 weeks (profile + projects)
- Phase 2: 2 weeks (timeline + materials)
- Phase 3: 2 weeks (commerce + messaging)
- Phase 4: 2 weeks (advanced features)
- **Total**: 8 weeks to full feature parity

---

*Generated: 2025-12-12*
*Last Updated: 2025-12-12*
