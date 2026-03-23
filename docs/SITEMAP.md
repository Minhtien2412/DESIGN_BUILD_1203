# App Sitemap & Navigation Guide

> Auto-generated navigation reference. Last updated: 2026-03-21

---

## 1. Complete Sitemap

### Auth Flow

| Route                       | Screen             | Status |
| --------------------------- | ------------------ | ------ |
| `/(auth)/login`             | Đăng nhập          | ✅     |
| `/(auth)/login-unified`     | Đăng nhập hợp nhất | ✅     |
| `/(auth)/login-2fa`         | Xác thực 2 bước    | ✅     |
| `/(auth)/register`          | Đăng ký            | ✅     |
| `/(auth)/register-unified`  | Đăng ký hợp nhất   | ✅     |
| `/(auth)/forgot-password`   | Quên mật khẩu      | ✅     |
| `/(auth)/reset-password`    | Đặt lại mật khẩu   | ✅     |
| `/(auth)/otp-verify`        | Xác thực OTP       | ✅     |
| `/(auth)/face-verification` | Xác thực khuôn mặt | ✅     |

### Main Tabs (Visible)

| Route                   | Screen           | Role |
| ----------------------- | ---------------- | ---- |
| `/(tabs)`               | Trang chủ (Home) | All  |
| `/(tabs)/activity`      | Hoạt động        | All  |
| `/(tabs)/communication` | Liên lạc         | All  |
| `/(tabs)/profile`       | Hồ sơ cá nhân    | All  |

### Main Tabs (Hidden)

| Route                       | Screen        | Role                |
| --------------------------- | ------------- | ------------------- |
| `/(tabs)/shop`              | Cửa hàng VLXD | Customer            |
| `/(tabs)/social`            | Mạng xã hội   | All                 |
| `/(tabs)/projects`          | Dự án         | Engineer/Contractor |
| `/(tabs)/home-construction` | Xây dựng nhà  | Customer            |
| `/(tabs)/live`              | Live Stream   | All                 |
| `/(tabs)/news`              | Tin tức       | All                 |
| `/(tabs)/menu`              | Menu          | All                 |
| `/(tabs)/ai-assistant`      | Trợ lý AI     | All                 |
| `/(tabs)/progress`          | Tiến độ       | Engineer/Contractor |
| `/(tabs)/notifications`     | Thông báo     | All                 |
| `/(tabs)/messages`          | Tin nhắn      | All                 |

### Services (36 screens under `/services/`)

| Route                            | Screen             |
| -------------------------------- | ------------------ |
| `/services`                      | Danh sách dịch vụ  |
| `/services/house-design`         | Thiết kế nhà       |
| `/services/interior-design`      | Thiết kế nội thất  |
| `/services/construction-lookup`  | Tra cứu xây dựng   |
| `/services/permit`               | Xin phép xây dựng  |
| `/services/sample-docs`          | Hồ sơ mẫu          |
| `/services/home-maintenance`     | Sửa chữa / Bảo trì |
| `/services/quality-consulting`   | Tư vấn chất lượng  |
| `/services/construction-company` | Công ty xây dựng   |
| `/services/interior-company`     | Công ty nội thất   |
| `/services/quality-supervision`  | Giám sát thi công  |
| `/services/architect-listing`    | Kiến trúc sư       |
| `/services/engineer-listing`     | Kỹ sư              |
| `/services/structural-engineer`  | Kỹ sư kết cấu      |
| `/services/mep-electrical`       | Hệ thống điện      |
| `/services/mep-plumbing`         | Hệ thống nước      |
| `/services/cost-estimate-ai`     | Dự toán AI         |
| `/services/feng-shui`            | Phong thủy         |
| + 18 more...                     |                    |

### Workers & Booking

| Route                     | Screen            |
| ------------------------- | ----------------- |
| `/workers`                | Danh sách thợ     |
| `/workers/[id]`           | Chi tiết thợ      |
| `/find-workers`           | Tìm thợ           |
| `/worker-bookings`        | Danh sách booking |
| `/worker-schedule`        | Lịch làm việc     |
| `/booking/select-service` | Chọn dịch vụ      |
| `/booking/select-worker`  | Chọn thợ          |
| `/booking/worker-confirm` | Xác nhận thợ      |
| `/booking/contact-info`   | Thông tin liên hệ |
| `/booking/schedule`       | Chọn lịch         |
| `/booking/summary`        | Tóm tắt đặt hẹn   |
| `/booking/confirmation`   | Xác nhận đặt hẹn  |
| `/booking/scan-workers`   | Quét mã thợ       |

### Construction & Utilities

| Route                  | Screen            |
| ---------------------- | ----------------- |
| `/utilities`           | Tiện ích xây dựng |
| `/utilities/ep-coc`    | Ép cọc            |
| `/utilities/dao-dat`   | Đào đất           |
| `/utilities/vat-lieu`  | Vật liệu          |
| `/utilities/nhan-cong` | Nhân công         |
| `/utilities/tho-xay`   | Thợ xây           |
| `/utilities/tho-coffa` | Thợ cốt pha       |
| `/finishing/lat-gach`  | Thợ lát gạch      |
| `/finishing/thach-cao` | Thợ thạch cao     |
| `/finishing/son`       | Thợ sơn           |
| `/finishing/da`        | Thợ đá            |
| `/finishing/lam-cua`   | Thợ cửa           |
| `/finishing/lan-can`   | Thợ lan can       |
| `/finishing/camera`    | Thợ camera        |

### AI Features

| Route                         | Screen          |
| ----------------------------- | --------------- |
| `/ai`                         | AI Hub          |
| `/ai/chat`                    | AI Chat         |
| `/ai/design/visualizer`       | AI Visualizer   |
| `/ai/design/room-planner`     | AI Phòng        |
| `/ai/design/material-suggest` | Gợi ý vật liệu  |
| `/ai-architect`               | AI Kiến trúc sư |

### Projects

| Route              | Screen          |
| ------------------ | --------------- |
| `/projects`        | Danh sách dự án |
| `/projects/[id]`   | Chi tiết dự án  |
| `/projects/create` | Tạo dự án       |

### CRM

| Route            | Screen          |
| ---------------- | --------------- |
| `/crm/staff`     | Quản lý nhân sự |
| `/crm/contracts` | Hợp đồng        |
| `/crm/reports`   | Báo cáo         |

### Communication

| Route                            | Screen         |
| -------------------------------- | -------------- |
| `/chat`                          | Danh sách chat |
| `/chat/[id]`                     | Chi tiết chat  |
| `/call/voice`                    | Gọi thoại      |
| `/call/video`                    | Gọi video      |
| `/communications/create-meeting` | Tạo cuộc họp   |

### Misc

| Route                    | Screen                    |
| ------------------------ | ------------------------- |
| `/search`                | Tìm kiếm                  |
| `/coming-soon`           | Đang phát triển           |
| `/coming-soon/[feature]` | Đang phát triển (feature) |
| `/vr-preview`            | VR Preview                |

---

## 2. Route Registry

All routes are centralized in `constants/route-registry.ts`.

**Usage:**

```typescript
import { SERVICES, TABS, WORKERS } from "@/constants/route-registry";
// or
import { R } from "@/constants/route-registry";

// Static routes
router.push(SERVICES.HOUSE_DESIGN);

// Dynamic routes
router.push(R.PROJECTS.DETAIL("abc-123"));
```

**Available modules:** AUTH, ENTRY, TABS, SERVICES, UTILITIES, FINISHING, BOOKING, WORKERS, PROJECTS, CONSTRUCTION, BUDGET, CRM, DASHBOARD, ADMIN, AI, AI_DESIGN, AI_ARCHITECT, CHAT, CALL, COMMUNICATIONS, SHOPPING, VLXD, CALCULATORS, TOOLS, TIMELINE, QUALITY, SAFETY, DOCUMENTS, STORAGE, PROFILE, SOCIAL, VIDEOS, DESIGN_LIBRARY, PROCUREMENT, MATERIALS, CONTRACTS, ANALYTICS, DAILY_REPORT, MISC

---

## 3. Feature-to-Route Mapping

Every icon/shortcut/CTA on every role's home screen maps to a concrete route in `constants/feature-map.ts`.

### Customer Home (67 features)

| Section             | Count | Maps                                  |
| ------------------- | ----- | ------------------------------------- |
| DỊCH VỤ grid        | 12    | `CUSTOMER_SERVICE_MAP`                |
| Tiện ích Thiết kế   | 8     | `CUSTOMER_DESIGN_UTILITY_MAP`         |
| Tiện ích Xây dựng   | 8     | `CUSTOMER_CONSTRUCTION_UTILITY_MAP`   |
| Tiện ích Hoàn thiện | 8     | `CUSTOMER_FINISHING_UTILITY_MAP`      |
| Tiện ích Bảo trì    | 8     | `CUSTOMER_MAINTENANCE_UTILITY_MAP`    |
| Marketplace         | 8     | `CUSTOMER_MARKETPLACE_MAP`            |
| Sản phẩm Nội thất   | 3     | `CUSTOMER_FURNITURE_MAP`              |
| Search header       | 2     | Direct `safeNavigate("/search")`      |
| LIVE/VIDEO          | 8+    | Direct `safeNavigate("/(tabs)/live")` |

### Worker Home (20 features)

| Section              | Count | Maps                  |
| -------------------- | ----- | --------------------- |
| Tiện ích nghề nghiệp | 8     | `WORKER_SHORTCUT_MAP` |
| Ngành nghề xây dựng  | 8     | `WORKER_CATEGORY_MAP` |
| Việc hot gần bạn     | 4     | `WORKER_JOB_MAP`      |

### Engineer Home (12 features)

| Section            | Count | Maps                  |
| ------------------ | ----- | --------------------- |
| Công cụ chuyên môn | 8     | `ENGINEER_TOOL_MAP`   |
| Công cụ nâng cao   | 4     | `ENGINEER_ACTION_MAP` |

### Contractor Home (12 features)

| Section         | Count | Maps                     |
| --------------- | ----- | ------------------------ |
| Quản lý nhanh   | 8     | `CONTRACTOR_ACTION_MAP`  |
| Dự án đang chạy | 4     | `CONTRACTOR_PROJECT_MAP` |

**Lookup helper:**

```typescript
import { getFeatureMapping, resolveRoute } from "@/constants/feature-map";

// O(1) lookup
const mapping = getFeatureMapping("sv1"); // → FeatureMapping for "Thiết kế nhà"
const { route, params } = resolveRoute("m3"); // → { route: "/services/home-maintenance", params: { category: "drainage" } }
```

---

## 4. Screen Dependency Map

```
app/_layout.tsx
├── Auth providers (AuthContext, PerfexAuthContext)
├── Cart, Favorites, ViewHistory providers
├── Communication providers (Meeting, Call, Hubs, WebSocket)
├── Utility providers (Progress, ProjectData, Notifications)
│
├── (auth)/           ← unauthenticated screens
│   ├── login.tsx
│   ├── register.tsx
│   └── ...
│
├── (tabs)/           ← main tab navigator
│   ├── _layout.tsx   ← TabBar with 4 visible + 11 hidden
│   ├── index.tsx     ← Home (RoleContext → 4 role screens)
│   ├── activity.tsx
│   ├── communication.tsx
│   ├── profile.tsx
│   ├── shop.tsx (hidden)
│   ├── live.tsx (hidden)
│   └── ...
│
├── services/         ← 36 service screens
├── workers/          ← Worker listing + detail
├── booking/          ← 9-step booking flow
├── projects/         ← Project CRUD
├── chat/             ← Chat list + detail
├── call/             ← Voice + Video call
├── ai/               ← AI Hub + chat + design tools
├── coming-soon/      ← Fallback screens
└── +not-found.tsx    ← 404 fallback
```

---

## 5. Template Reuse List

| Template Screen               | Reused By                    | Param                                                                                                     |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/services/home-maintenance`  | 7 maintenance icons          | `category` (washing-machine, refrigerator, drainage, electrical, water-supply, network, air-conditioning) |
| `/workers`                    | 9 worker category icons      | `specialty` (painter, electrician, plumber, mason, carpenter, welder, tiler, aluminum-glass, mechanic)    |
| `/(tabs)/shop`                | 8 marketplace icons          | `category` (kitchen-equipment, sanitary-equipment, electrical, fire-safety, bedroom, study-desks, sofas)  |
| `/services/architect-listing` | 3 professional listings      | Architect, Engineer, Structural Engineer                                                                  |
| `/finishing/*`                | 7 finishing trade icons      | `trade` param for sơn, cửa                                                                                |
| `/worker-bookings`            | 4 hot job cards              | `jobId`                                                                                                   |
| `/projects/[id]`              | 4 contractor project cards   | Dynamic `id`                                                                                              |
| `/coming-soon/[feature]`      | Fallback for unbuilt screens | `feature` slug                                                                                            |

---

## 6. Missing Screens (need creation)

| Route                         | Purpose                     | Priority                           |
| ----------------------------- | --------------------------- | ---------------------------------- |
| `/search`                     | Global search screen        | HIGH                               |
| `/vr-preview`                 | VR/AR preview for engineers | MEDIUM                             |
| Several `/finishing/*` routes | Individual trade screens    | LOW (can use coming-soon fallback) |
| `/crm/staff`                  | CRM staff management        | MEDIUM                             |
| `/crm/reports`                | CRM reports                 | MEDIUM                             |

> Note: All missing routes safely fallback to `/coming-soon` via `safeNavigate()`.

---

## 7. Directory Structure

```
app/
├── _layout.tsx              ← Root: providers, analytics, overlays
├── +not-found.tsx           ← 404 fallback
├── index.tsx                ← Entry redirect
│
├── (auth)/                  ← Auth screens (9 files)
├── (tabs)/                  ← Tab navigator + 15 tab screens
│
├── services/                ← 36 service screens
├── workers/                 ← Worker listing + [id] detail
├── find-workers.tsx         ← Worker search/filter
├── worker-bookings/         ← Worker booking management
├── worker-schedule/         ← Worker calendar
├── booking/                 ← 9-step booking flow
│
├── projects/                ← Project CRUD (index, [id], create)
├── construction/            ← Construction monitoring
├── budget/                  ← Budget management
│
├── ai/                      ← AI hub + chat + design
├── ai-architect/            ← AI architect tools
├── ai-brain/                ← AI brain screens
│
├── chat/                    ← Messaging (list + [id])
├── call/                    ← Voice/Video calling
├── communications/          ← Meetings
│
├── utilities/               ← Construction utility screens
├── finishing/               ← Finishing trade screens
├── vlxd/                    ← Building materials
├── calculators/             ← Cost calculators
│
├── coming-soon/             ← Fallback (index + [feature])
├── search.tsx               ← Global search
└── ...
```

---

## 8. Navigation Safety Checklist

### Anti-Broken-Link Measures

- [x] Central route registry (`constants/route-registry.ts`) — no hardcoded strings
- [x] Feature mapping (`constants/feature-map.ts`) — every icon has a target
- [x] Safe navigation (`utils/safeNavigation.ts`) — try/catch with fallback
- [x] `+not-found.tsx` — 404 screen for unmatched routes
- [x] `coming-soon/[feature].tsx` — fallback for unbuilt features

### Per-Role Navigation Audit

- [x] **Customer**: 67 features mapped (12 services + 32 utilities + 8 marketplace + 3 furniture + LIVE/VIDEO + search)
- [x] **Worker**: 20 features mapped (8 shortcuts + 8 categories + 4 hot jobs + CTAs)
- [x] **Engineer**: 12 features mapped (8 tools + 4 actions + projects + certs)
- [x] **Contractor**: 12 features mapped (8 quick actions + 4 projects + team + alerts)

### Code Patterns

```typescript
// ✅ CORRECT — use safe navigation
import { navigateByFeatureId, safeNavigate } from "@/utils/safeNavigation";
navigateByFeatureId(item.id); // for items in feature-map
safeNavigate("/search"); // for direct routes

// ❌ WRONG — never do this
router.push("/services/some-route"); // hardcoded, no fallback
```

### Files Modified/Created in This Integration

| File                                                              | Action                                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `constants/route-registry.ts`                                     | CREATED — central route constants                            |
| `constants/feature-map.ts`                                        | CREATED — feature-to-route mappings                          |
| `utils/safeNavigation.ts`                                         | CREATED — safe navigation utilities                          |
| `app/+not-found.tsx`                                              | CREATED — 404 fallback screen                                |
| `components/role-home/customer/CustomerHomeScreen.tsx`            | MODIFIED — wired all navigation callbacks                    |
| `components/role-home/customer/sections/ServiceGridSection.tsx`   | MODIFIED — added `onItemPress`                               |
| `components/role-home/customer/sections/UtilitySection.tsx`       | MODIFIED — added `onItemPress`, `onPromoPress`               |
| `components/role-home/customer/sections/MarketplaceSection.tsx`   | MODIFIED — added `onItemPress`                               |
| `components/role-home/customer/sections/FurnitureProductsRow.tsx` | MODIFIED — added `onItemPress`, `onSeeAllPress`              |
| `components/role-home/customer/sections/LiveVideoRow.tsx`         | MODIFIED — added `onLivePress`, `onVideoPress`, `onSeeMore*` |
| `components/role-home/customer/sections/CustomerSearchHeader.tsx` | MODIFIED — added `onSearchPress`, `onFilterPress`            |
| `components/role-home/worker/WorkerHomeScreen.tsx`                | MODIFIED — wired all navigation                              |
| `components/role-home/engineer/EngineerArchitectHomeScreen.tsx`   | MODIFIED — wired all navigation                              |
| `components/role-home/contractor/ContractorCompanyHomeScreen.tsx` | MODIFIED — wired all navigation                              |
| `docs/SITEMAP.md`                                                 | CREATED — this file                                          |
