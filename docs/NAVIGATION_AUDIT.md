# Navigation & Feature Integration Audit

> **Generated:** 2026-03-21 | **Updated:** 2026-03-21 (P0+P1 fixes applied)  
> **Scope:** Toàn bộ app Xây Dựng PRO  
> **Baseline:** route-registry.ts (67 modules) + feature-map.ts (129 items, 17 arrays) + safeNavigation.ts

---

## 1. Executive Summary — Hiện Trạng Navigation

| Metric                                    | Before                            | After                                           |
| ----------------------------------------- | --------------------------------- | ----------------------------------------------- |
| Modules trong registry                    | 39                                | **67** (+28)                                    |
| Feature maps                              | 14 arrays / 111 items             | **17 arrays / 129 items** (+3 maps / +18 items) |
| Modules orphan (hoàn toàn thiếu registry) | 18                                | **0** ✅                                        |
| Feature ID collisions                     | 4 groups (c1-8, a1-4, a1-8, p1-4) | **0** ✅                                        |
| menu.tsx coming-soon false positives      | 5                                 | **0** ✅                                        |
| TS errors                                 | —                                 | **0** ✅                                        |

### Fixes Applied (P0 + P1)

1. **P0.1 — Feature ID collisions:** Renamed `c1-c8` → `wc1-wc8` (worker), `a1-a4` → `ea1-ea4` (engineer), `a1-a8` → `ca1-ca8` (contractor), `p1-p4` → `cp1-cp4` (contractor) across 4 data files + feature-map.ts
2. **P0.2 — menu.tsx coming-soon routes:** Fixed 5 routes → real screens (`/labor`, `/inventory`, `/weather`, `/submittal`, `/meeting-minutes`)
3. **P0.3-5 + P1 — Missing registry modules:** Added 28 new modules: SELLER, SETTINGS, ORDERS, PAYMENT, LABOR, INVENTORY, EQUIPMENT, WEATHER, CHANGE_MANAGEMENT, CHANGE_ORDER, CONSTRUCTION_PROGRESS, WARRANTY, RISK, INSPECTION, MEETING_MINUTES, DOCUMENT_CONTROL, AS_BUILT, COMMISSIONING, OM_MANUALS, HANDBOOK, FLEET, SUBMITTAL, LOYALTY, LEGAL, REVIEWS, MESSAGES, LIVE, CONSULTATION
4. **P1 — Expanded feature-map:** Added 3 new maps (CONTRACTOR_SELLER_MAP, CONTRACTOR_LABOR_MAP, ENGINEER_SITE_MAP) with 18 new feature entries for seller management, labor/equipment, and site management tools

---

## 2. Route Audit Table

### 2.1 Modules ĐÃ có trong Route Registry — ĐỦ screens

| Module         | Registry Entries | Screen Files                          | Status                                                             |
| -------------- | ---------------- | ------------------------------------- | ------------------------------------------------------------------ |
| AUTH           | 10               | 12                                    | ✅ Ready                                                           |
| ENTRY          | 3                | 3                                     | ✅ Ready                                                           |
| TABS           | 15               | 20                                    | ✅ Ready (+ messages nested)                                       |
| SERVICES       | 28               | 36                                    | ✅ Ready                                                           |
| UTILITIES      | 20               | 25                                    | ✅ Ready                                                           |
| FINISHING      | 10               | 17                                    | ✅ Ready                                                           |
| BOOKING        | 10               | 10                                    | ✅ Ready                                                           |
| WORKERS        | 5                | 2 (+worker-bookings, worker-schedule) | ✅ Ready                                                           |
| PROJECTS       | 18               | 73                                    | ⚠️ Partial — nhiều nested screens chưa registry                    |
| CONSTRUCTION   | 5                | 18                                    | ⚠️ Partial — chỉ 5/18 đã registry                                  |
| BUDGET         | 9                | 9                                     | ✅ Ready                                                           |
| CRM            | 19               | 26                                    | ⚠️ Partial — thiếu activity, tickets, mind-map, project-management |
| DASHBOARD      | 5                | 5                                     | ✅ Ready                                                           |
| ADMIN          | 12               | 22                                    | ⚠️ Partial — thiếu activity, perfex-test, dashboard-rbac           |
| AI             | 11               | 9 (+ai-analysis/2)                    | ✅ Ready                                                           |
| AI_DESIGN      | 6                | 6                                     | ✅ Ready                                                           |
| AI_ARCHITECT   | 8                | 9                                     | ✅ Ready                                                           |
| CHAT           | 4                | 4                                     | ✅ Ready                                                           |
| CALL           | 8                | 8                                     | ✅ Ready                                                           |
| COMMUNICATIONS | 4                | 5                                     | ✅ Ready                                                           |
| SHOPPING       | 4 (+VLXD 8)      | 2 + 8                                 | ✅ Ready cho product/categories/vlxd                               |
| CALCULATORS    | 20               | 21                                    | ✅ Ready                                                           |
| TOOLS          | 8                | 8                                     | ✅ Ready                                                           |
| TIMELINE       | 10               | 10                                    | ✅ Ready                                                           |
| QUALITY        | 7                | 8+                                    | ✅ Ready (nested: audit, checklists, defects, inspections, ncr)    |
| SAFETY         | 9                | 9                                     | ✅ Ready                                                           |
| DOCUMENTS      | 8                | 10                                    | ✅ Ready                                                           |
| STORAGE        | 3                | ?                                     | ⚠️ Check                                                           |
| PROFILE        | 3                | 45                                    | ⚠️ Rất ít registry vs rất nhiều screens                            |
| SOCIAL         | 3                | 11                                    | ⚠️ Partial                                                         |
| VIDEOS         | 3                | 2                                     | ✅ Ready                                                           |
| DESIGN_LIBRARY | 5                | 4                                     | ✅ Ready                                                           |
| PROCUREMENT    | 6                | 6                                     | ✅ Ready                                                           |
| MATERIALS      | 4                | 3                                     | ✅ Ready                                                           |
| CONTRACTS      | 3                | 9                                     | ⚠️ Partial — thiếu create, templates, settlement, quotes           |
| ANALYTICS      | 2                | 2                                     | ✅ Ready                                                           |
| DAILY_REPORT   | 2                | 2                                     | ✅ Ready                                                           |
| MISC           | 18               | varies                                | ✅ Ready                                                           |

### 2.2 Modules KHÔNG có trong Route Registry — ORPHAN

| Module                    | Screen Files                                                                                                                      | Priority | Phù hợp Role                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| **seller**                | 12 (dashboard, products, orders, analytics, promotions, reviews, revenue, shop-settings, add-product, edit-product, order-detail) | **P0**   | contractor, engineer (bán dịch vụ) |
| **shopping**              | 13 (products-catalog, flash-sale, furniture, paint, electrical, construction, compare, cart, new-customer-offer)                  | **P1**   | customer                           |
| **settings**              | 16 (account/security, account/privacy, preferences, language, cloud-backup, help, two-factor, biometric, contact-sync)            | **P0**   | all                                |
| **labor**                 | 12 (workers, attendance, payroll, shifts, leave-requests, create-\*)                                                              | **P1**   | contractor                         |
| **inventory**             | 8 (materials, orders, suppliers, create-\*)                                                                                       | **P1**   | contractor                         |
| **fleet**                 | 2 (index, [id])                                                                                                                   | P2       | contractor                         |
| **food**                  | 3 (index, order-tracking, restaurant/[id])                                                                                        | P2       | all (phụ)                          |
| **equipment**             | 3 (index, [id], maintenance)                                                                                                      | P1       | contractor, engineer               |
| **environmental**         | 2 (index, [id])                                                                                                                   | P2       | contractor, engineer               |
| **change-management**     | 3 (index, create, orders)                                                                                                         | P1       | contractor, engineer               |
| **change-order**          | 2 (index, [id])                                                                                                                   | P1       | contractor                         |
| **commissioning**         | 2 (index, [id])                                                                                                                   | P2       | contractor, engineer               |
| **construction-progress** | 7 (create, mindmap, [id], [id]/edit, [id]/review, [id]/task/[id])                                                                 | P1       | contractor, engineer               |
| **warranty**              | 2 (index, [id])                                                                                                                   | P1       | customer, contractor               |
| **weather**               | 4 (index, dashboard, alerts, stoppages)                                                                                           | P1       | contractor, worker                 |
| **risk**                  | 2 (index, mitigation)                                                                                                             | P1       | contractor, engineer               |
| **inspection**            | 2 (index, tests)                                                                                                                  | P1       | engineer, contractor               |
| **meeting-minutes**       | 2 (index, [id])                                                                                                                   | P1       | all (professional)                 |
| **om-manuals**            | 2 (index, [id])                                                                                                                   | P2       | contractor, engineer               |
| **handbook**              | 4 (index, calculator, reference, [categoryId])                                                                                    | P1       | worker, contractor                 |
| **document-control**      | 2 (index, [id])                                                                                                                   | P1       | contractor, engineer               |
| **as-built**              | 2 (index, [id])                                                                                                                   | P1       | contractor, engineer               |
| **loyalty**               | 1 (index)                                                                                                                         | P2       | customer                           |
| **orders**                | 3 (index, [id], [id]/refund)                                                                                                      | **P0**   | customer                           |
| **payment**               | 3 (bank-transfer, pending, success)                                                                                               | **P0**   | all                                |
| **consultation**          | 3 (index, design-process, kts-form)                                                                                               | P1       | customer                           |
| **community**             | 1 (index)                                                                                                                         | P2       | all                                |
| **ar-viewer**             | 1 (index)                                                                                                                         | P2       | customer, engineer                 |
| **reviews**               | 3 (index, [productId], create)                                                                                                    | P1       | customer                           |
| **messages** (root)       | 14 (index, [userId], contacts, groups, unified, etc.)                                                                             | P1       | all                                |
| **live** (root)           | 5 (index, [id], broadcaster, create, viewer)                                                                                      | P1       | all                                |
| **demo**                  | 16                                                                                                                                | P2       | dev only                           |
| **legal**                 | 5 (index, about-us, faq, privacy-policy, terms-of-service)                                                                        | P1       | all                                |

---

## 3. Feature-to-Role-to-Route Matrix

### 3.1 Customer Features (67 mapped items)

| ID      | Label                  | Route                          | Screen Exists? | Status                           |
| ------- | ---------------------- | ------------------------------ | -------------- | -------------------------------- |
| sv1     | Thiết kế nhà           | /services/house-design         | ✅             | **ready**                        |
| sv2     | Thiết kế nội thất      | /services/interior-design      | ✅             | **ready**                        |
| sv3     | Tra cứu xây dựng       | /services/construction-lookup  | ✅             | **ready**                        |
| sv4     | Xin phép               | /services/permit               | ✅             | **ready**                        |
| sv5     | Hồ sơ mẫu              | /services/sample-docs          | ✅             | **ready**                        |
| sv6     | Sửa nhà                | /services/home-maintenance     | ✅             | **ready**                        |
| sv7     | Mẫu nhà                | /design-library                | ✅             | **ready**                        |
| sv8     | Tư vấn chất lượng      | /services/quality-consulting   | ✅             | **ready**                        |
| sv9     | Công ty xây dựng       | /services/construction-company | ✅             | **ready**                        |
| sv10    | Công ty nội thất       | /services/interior-company     | ✅             | **ready**                        |
| sv11    | Giám sát thi công      | /services/quality-supervision  | ✅             | **ready**                        |
| sv12    | Xem thêm               | /services                      | ✅             | **ready**                        |
| d1      | Kiến trúc sư           | /services/architect-listing    | ✅             | **ready**                        |
| d2      | Kỹ sư                  | /services/engineer-listing     | ✅             | **ready**                        |
| d3      | Kết cấu                | /services/structural-engineer  | ✅             | **ready**                        |
| d4      | Điện                   | /services/mep-electrical       | ✅             | **ready**                        |
| d5      | Nước                   | /services/mep-plumbing         | ✅             | **ready**                        |
| d6      | Dự toán                | /services/cost-estimate-ai     | ✅             | **ready**                        |
| d7      | Nội thất               | /services/interior-design      | ✅             | **ready**                        |
| d8      | Công Cụ AI             | /ai-hub                        | ✅             | **ready**                        |
| c1      | Ép cọc                 | /utilities/ep-coc              | ✅             | **ready**                        |
| c2      | Đào đất                | /utilities/dao-dat             | ✅             | **ready**                        |
| c3      | Vật liệu               | /utilities/vat-lieu            | ✅             | **ready**                        |
| c4      | Nhân công xây dựng     | /utilities/nhan-cong           | ✅             | **ready**                        |
| c5      | Thợ xây                | /utilities/tho-xay             | ✅             | **ready**                        |
| c6      | Thợ cốt pha            | /utilities/tho-coffa           | ✅             | **ready**                        |
| c7      | Thợ cơ khí             | /workers                       | ✅             | **ready**                        |
| c8      | Xem thêm               | /utilities                     | ✅             | **ready**                        |
| f1      | Thợ lát gạch           | /finishing/lat-gach            | ✅             | **ready**                        |
| f2      | Thợ thạch cao          | /finishing/thach-cao           | ✅             | **ready**                        |
| f3      | Thợ sơn                | /finishing/son                 | ✅             | **ready**                        |
| f4      | Thợ đá                 | /finishing/da                  | ✅             | **ready**                        |
| f5      | Thợ trần cáo           | /finishing/lam-cua             | ✅             | **ready**                        |
| f6      | Thợ lan can            | /finishing/lan-can             | ✅             | **ready**                        |
| f7      | Thợ cổng               | /workers                       | ✅             | **ready**                        |
| f8      | Thợ camera             | /finishing/camera              | ✅             | **ready**                        |
| m1-m7   | Thợ sửa (7 loại)       | /services/home-maintenance     | ✅             | **ready** (params differentiate) |
| m8      | Xem thêm               | /services/home-maintenance     | ✅             | **ready**                        |
| mp1-mp7 | Marketplace categories | /(tabs)/shop                   | ✅             | **ready** (params differentiate) |
| mp8     | Xem thêm               | /(tabs)/shop                   | ✅             | **ready**                        |
| fp1-fp3 | Furniture products     | /product/fp1,fp2,fp3           | ✅             | **ready** ([id].tsx handles)     |

### 3.2 Worker Features (20 mapped items)

| ID    | Label              | Route                             | Screen Exists? | Status             |
| ----- | ------------------ | --------------------------------- | -------------- | ------------------ |
| w1    | Nhận việc          | /worker-bookings                  | ✅             | **ready**          |
| w2    | Việc gần đây       | /find-workers                     | ✅             | **ready**          |
| w3    | Tổ đội             | /booking/scan-workers             | ✅             | **ready**          |
| w4    | Vật tư             | /vlxd                             | ✅             | **ready**          |
| w5    | Chấm công          | /worker-schedule                  | ✅             | **ready**          |
| w6    | Lịch hẹn           | /worker-schedule                  | ✅             | **ready**          |
| w7    | Lương              | /budget                           | ✅             | **ready**          |
| w8    | Live công trình    | /(tabs)/live                      | ✅             | **ready**          |
| c1\*  | Thợ sơn            | /workers?specialty=painter        | ✅             | **⚠️ ID CONFLICT** |
| c2\*  | Thợ điện           | /workers?specialty=electrician    | ✅             | **⚠️ ID CONFLICT** |
| c3\*  | Thợ nước           | /workers?specialty=plumber        | ✅             | **⚠️ ID CONFLICT** |
| c4\*  | Thợ hồ             | /workers?specialty=mason          | ✅             | **⚠️ ID CONFLICT** |
| c5\*  | Thợ mộc            | /workers?specialty=carpenter      | ✅             | **⚠️ ID CONFLICT** |
| c6\*  | Thợ hàn            | /workers?specialty=welder         | ✅             | **⚠️ ID CONFLICT** |
| c7\*  | Thợ ốp lát         | /workers?specialty=tiler          | ✅             | **⚠️ ID CONFLICT** |
| c8\*  | Thợ nhôm kính      | /workers?specialty=aluminum-glass | ✅             | **⚠️ ID CONFLICT** |
| j1-j4 | Hot Jobs (4 items) | /worker-bookings                  | ✅             | **ready**          |

> ⚠️ **ID CONFLICT**: `WORKER_CATEGORY_MAP` dùng id `c1-c8` trùng với `CUSTOMER_CONSTRUCTION_UTILITY_MAP`. Vì `_index` Map iterate sau → worker `c1-c8` **overwrite** customer `c1-c8`.

### 3.3 Engineer Features (12 mapped items)

| ID  | Label             | Route                                  | Screen Exists? | Status    |
| --- | ----------------- | -------------------------------------- | -------------- | --------- |
| e1  | Hồ sơ năng lực    | /(tabs)/profile                        | ✅             | **ready** |
| e2  | Dự án             | /(tabs)/projects                       | ✅             | **ready** |
| e3  | Chứng chỉ         | /(tabs)/profile?section=certifications | ✅             | **ready** |
| e4  | Báo giá           | /calculators/project-estimate          | ✅             | **ready** |
| e5  | Hợp đồng          | /crm/contracts                         | ✅             | **ready** |
| e6  | Giám sát          | /quality-assurance                     | ✅             | **ready** |
| e7  | Live Preview      | /(tabs)/live                           | ✅             | **ready** |
| e8  | Lịch họp          | /communications/create-meeting         | ✅             | **ready** |
| a1  | VR/AR Mặt bằng    | /vr-preview                            | ✅             | **ready** |
| a2  | Camera công trình | /construction/progress                 | ✅             | **ready** |
| a3  | Bản vẽ 2D/3D      | /ai-design/visualizer                  | ✅             | **ready** |
| a4  | Tư vấn khách hàng | /chat                                  | ✅             | **ready** |

### 3.4 Contractor Features (12 mapped items)

| ID    | Label           | Route                         | Screen Exists? | Status                              |
| ----- | --------------- | ----------------------------- | -------------- | ----------------------------------- |
| a1\*  | Quản lý nhân sự | /crm/staff                    | ✅             | **⚠️ ID CONFLICT** with engineer a1 |
| a2\*  | Đội thi công    | /workers?view=team            | ✅             | **⚠️ ID CONFLICT** with engineer a2 |
| a3\*  | Dự án           | /(tabs)/projects              | ✅             | **⚠️ ID CONFLICT** with engineer a3 |
| a4\*  | Hợp đồng        | /crm/contracts                | ✅             | **⚠️ ID CONFLICT** with engineer a4 |
| a5    | Kho vật tư      | /vlxd                         | ✅             | **ready**                           |
| a6    | Điều phối       | /timeline                     | ✅             | **ready**                           |
| a7    | Báo giá         | /calculators/project-estimate | ✅             | **ready**                           |
| a8    | Báo cáo         | /crm/reports                  | ✅             | **ready**                           |
| p1-p4 | Dự án samples   | /projects/{id}                | ✅             | **ready**                           |

> ⚠️ **ID CONFLICT**: `CONTRACTOR_ACTION_MAP` dùng id `a1-a4` trùng với `ENGINEER_ACTION_MAP`. Worker contractor `a1-a4` **overwrite** engineer `a1-a4` trong `_index` Map.

---

## 4. Hidden Feature Audit

### 4.1 Screens có file nhưng KHÔNG reachable từ HomeScreen

(không nằm trong feature-map, không có entry point rõ từ home)

| Screen                   | Route                     | Phù hợp role         | Nên nằm ở                       | Khi nào hiện           |
| ------------------------ | ------------------------- | -------------------- | ------------------------------- | ---------------------- |
| seller/dashboard         | /seller/dashboard         | contractor           | Home → Quick Action             | Khi đã tạo shop        |
| seller/products          | /seller/products          | contractor           | Home → Quick Action             | Khi đã tạo shop        |
| seller/orders            | /seller/orders            | contractor           | Home → Quick Action             | Khi có đơn hàng        |
| seller/analytics         | /seller/analytics         | contractor           | Dashboard                       | Khi có dữ liệu bán     |
| seller/promotions        | /seller/promotions        | contractor           | Shop settings                   | Luôn                   |
| seller/reviews           | /seller/reviews           | contractor           | Shop settings                   | Khi có review          |
| seller/revenue           | /seller/revenue           | contractor           | Dashboard KPI                   | Khi có doanh thu       |
| labor/workers            | /labor/workers            | contractor           | Home → Quick Action "Nhân sự"   | Luôn                   |
| labor/attendance         | /labor/attendance         | contractor           | Home → Quick Action "Chấm công" | Khi có worker          |
| labor/payroll            | /labor/payroll            | contractor           | Home → "Lương"                  | Khi có worker          |
| labor/shifts             | /labor/shifts             | contractor           | Projects → Team                 | Khi có dự án           |
| inventory/materials      | /inventory/materials      | contractor           | Home → "Kho vật tư"             | Luôn                   |
| inventory/orders         | /inventory/orders         | contractor           | Inventory → Orders              | Khi có đơn đặt         |
| inventory/suppliers      | /inventory/suppliers      | contractor           | Inventory list                  | Luôn                   |
| equipment/index          | /equipment                | contractor, engineer | Home → Quick Action             | Khi có dự án           |
| weather/dashboard        | /weather/dashboard        | contractor, worker   | Home → Banner/Card              | Luôn khi ngoài trời    |
| weather/alerts           | /weather/alerts           | contractor, worker   | Notification                    | Khi có alert           |
| risk/index               | /risk                     | contractor, engineer | Projects → Detail               | Khi có dự án           |
| warranty/index           | /warranty                 | customer, contractor | Profile → Mục bảo hành          | Khi có công trình xong |
| change-management/\*     | /change-management/\*     | contractor, engineer | Projects → Detail               | Khi có dự án           |
| construction-progress/\* | /construction-progress/\* | contractor, engineer | Projects → Detail               | Khi có tiến độ         |
| inspection/\*            | /inspection               | engineer, contractor | Quality tab                     | Khi có dự án           |
| meeting-minutes/\*       | /meeting-minutes          | all (professional)   | Communication tab               | Sau khi họp xong       |
| handbook/\*              | /handbook                 | worker, contractor   | Profile → Tài liệu              | Luôn                   |
| document-control/\*      | /document-control         | contractor, engineer | Documents                       | Khi có dự án           |
| as-built/\*              | /as-built                 | contractor, engineer | Projects → Detail               | Khi hoàn công          |
| shopping/\*              | /shopping/\*              | customer             | Home → Marketplace              | Luôn                   |
| orders/\*                | /orders                   | customer             | Profile → Đơn hàng              | Khi có đơn             |
| payment/\*               | /payment/\*               | all                  | Checkout flow                   | Khi thanh toán         |
| settings/\*              | /settings/\*              | all                  | Profile → Cài đặt               | Luôn                   |
| consultation/\*          | /consultation             | customer             | Services                        | Luôn                   |
| reviews/\*               | /reviews                  | customer             | Product → Reviews               | Khi có đánh giá        |
| loyalty                  | /loyalty                  | customer             | Profile → Rewards               | Khi có điểm            |
| messages/\* (root)       | /messages/\*              | all                  | Communication tab               | Luôn                   |
| live/\* (root)           | /live/\*                  | all                  | Live tab                        | Khi có livestream      |
| fleet/\*                 | /fleet                    | contractor           | Quick Actions                   | Khi có xe/thiết bị     |
| om-manuals/\*            | /om-manuals               | contractor, engineer | Documents                       | Khi hoàn công          |
| commissioning/\*         | /commissioning            | contractor, engineer | Projects                        | Gần hoàn công          |

### 4.2 Coming-soon Features (đang fallback)

| Feature           | Route hiện tại          | Screen thật tồn tại?              | Hành động cần                |
| ----------------- | ----------------------- | --------------------------------- | ---------------------------- |
| labor             | /coming-soon/labor      | ✅ `/labor` (12 screens)          | **Bỏ fallback, route thẳng** |
| inventory         | /coming-soon/inventory  | ✅ `/inventory` (8 screens)       | **Bỏ fallback, route thẳng** |
| weather           | /coming-soon/weather    | ✅ `/weather` (4 screens)         | **Bỏ fallback, route thẳng** |
| rfi               | /coming-soon/rfi        | ❌ No screen                      | Giữ fallback                 |
| submittals        | /coming-soon/submittals | ✅ `/submittal` (2 screens)       | **Bỏ fallback, route thẳng** |
| meetings          | /coming-soon/meetings   | ✅ `/meeting-minutes` (2 screens) | **Bỏ fallback, route thẳng** |
| reminders         | /coming-soon/reminders  | ❌ No screen                      | Giữ fallback                 |
| AR Room (75%)     | /coming-soon hub        | ✅ `/ar-viewer`                   | Semi-ready                   |
| VR Tour (60%)     | /coming-soon hub        | ✅ `/vr-preview`                  | Semi-ready                   |
| AI Design (85%)   | /coming-soon hub        | ✅ `/ai-design` (6 screens)       | **Bỏ fallback**              |
| Marketplace (90%) | /coming-soon hub        | ✅ `/shopping` (13 screens)       | **Bỏ fallback**              |
| Smart Home (40%)  | /coming-soon hub        | ❌ No screen                      | Giữ fallback                 |
| Installment (95%) | /coming-soon hub        | ❌ No screen                      | Giữ fallback                 |

---

## 5. Visibility Rules Matrix

### 5.1 Role-Based Visibility

| Feature Category             | customer | worker | engineer | contractor | Condition              |
| ---------------------------- | -------- | ------ | -------- | ---------- | ---------------------- |
| Services (sv1-sv12)          | ✅       | ❌     | ❌       | ❌         | Luôn                   |
| Design Utility (d1-d8)       | ✅       | ❌     | ✅       | ❌         | Luôn                   |
| Construction Utility (c1-c8) | ✅       | ❌     | ❌       | ✅         | Luôn                   |
| Finishing Utility (f1-f8)    | ✅       | ❌     | ❌       | ❌         | Luôn                   |
| Maintenance (m1-m8)          | ✅       | ❌     | ❌       | ❌         | Luôn                   |
| Marketplace (mp1-mp8)        | ✅       | ❌     | ❌       | ❌         | Luôn                   |
| Worker Shortcuts (w1-w8)     | ❌       | ✅     | ❌       | ❌         | Luôn                   |
| Worker Categories (wc1-wc8)  | ✅       | ✅     | ❌       | ✅         | Luôn                   |
| Hot Jobs (j1-j4)             | ❌       | ✅     | ❌       | ❌         | Khi có việc mới        |
| Engineer Tools (e1-e8)       | ❌       | ❌     | ✅       | ❌         | Luôn                   |
| Engineer Actions (ea1-ea4)   | ❌       | ❌     | ✅       | ❌         | Luôn                   |
| Contractor Actions (ca1-ca8) | ❌       | ❌     | ❌       | ✅         | Luôn                   |
| Contractor Projects (p1-p4)  | ❌       | ❌     | ❌       | ✅         | Khi có dự án           |
| Seller module                | ❌       | ❌     | ❌       | ✅         | Khi đã tạo shop        |
| Labor module                 | ❌       | ❌     | ❌       | ✅         | Khi có nhân sự         |
| Inventory module             | ❌       | ❌     | ❌       | ✅         | Khi có kho             |
| Equipment                    | ❌       | ❌     | ✅       | ✅         | Khi có dự án           |
| Weather                      | ❌       | ✅     | ❌       | ✅         | Luôn (outdoor work)    |
| Risk/Safety                  | ❌       | ✅     | ✅       | ✅         | Khi có dự án           |
| Orders                       | ✅       | ❌     | ❌       | ❌         | Khi có đơn hàng        |
| Warranty                     | ✅       | ❌     | ❌       | ✅         | Khi có công trình xong |
| Settings                     | ✅       | ✅     | ✅       | ✅         | Luôn                   |
| Legal pages                  | ✅       | ✅     | ✅       | ✅         | Luôn                   |

### 5.2 State-Based Visibility

| Condition          | Features Affected                             | Rule                                     |
| ------------------ | --------------------------------------------- | ---------------------------------------- |
| `!onboardingSeen`  | Tất cả                                        | Redirect → onboarding                    |
| `!selectedRole`    | Tất cả                                        | Redirect → role-select                   |
| `!isAuthenticated` | Protected features                            | Show login prompt (không block toàn app) |
| `!hasProject`      | Project-specific (timeline, budget, team, QC) | Show "Tạo dự án đầu tiên" CTA            |
| `!hasBooking`      | Booking tracking, reviews                     | Hide hoặc show empty state               |
| `!hasShop`         | Seller module                                 | Show "Đăng ký bán hàng" CTA              |
| `!isVerified`      | Contractor bidding, Engineer certification    | Show verification prompt                 |
| `!hasTeam`         | Labor management, shifts                      | Show "Thêm nhân sự" CTA                  |
| `isOffline`        | All API-dependent                             | Show cached data + offline banner        |

---

## 6. Screen Template Reuse Map

### 6.1 Reusable Templates Identified

| Template Name          | Used By                                        | Description                         |
| ---------------------- | ---------------------------------------------- | ----------------------------------- |
| `professional-listing` | d1 (architect), d2 (engineer), d3 (structural) | Danh sách chuyên gia filter by type |
| `worker-listing`       | c7, f7, c1*-c8*, a2 (contractor team)          | Workers filtered by specialty/view  |
| `home-maintenance`     | m1-m7, sv6                                     | Maintenance category → worker list  |
| `finishing-worker`     | f3, f5                                         | Finishing trade workers             |
| `shop-category`        | mp1-mp7                                        | Shop filtered by category           |
| `product-detail`       | fp1-fp3, shopping product                      | Product detail screen               |
| `project-detail`       | p1-p4, engineer projects                       | Project overview                    |
| `worker-bookings`      | w1, j1-j4                                      | Job listings / bookings             |
| `worker-schedule`      | w5, w6                                         | Schedule / attendance view          |
| `find-workers`         | w2                                             | Nearby worker search                |
| `scan-workers`         | w3                                             | QR/proximity worker scan            |
| `budget`               | w7                                             | Budget / salary overview            |
| `calculators`          | e4, a7                                         | Cost estimators                     |
| `crm-contracts`        | e5, a4                                         | Contract management                 |
| `crm-staff`            | a1 (contractor)                                | Staff/HR management                 |
| `crm-reports`          | a8                                             | Report dashboard                    |
| `quality-assurance`    | e6                                             | QA/QC hub                           |
| `timeline`             | a6                                             | Project timeline                    |
| `vlxd`                 | w4, a5                                         | Building materials                  |
| `communications`       | e8                                             | Meeting scheduler                   |
| `chat`                 | a4 (engineer)                                  | Chat interface                      |
| `list-detail`          | Most modules with index + [id]                 | Generic list → tap → detail pattern |

### 6.2 Template Grouping cho Coming-soon → Real screens

| Template Pattern            | Screens That Can Reuse                                 | New Screen Needed?        |
| --------------------------- | ------------------------------------------------------ | ------------------------- |
| **CRUD List/Detail**        | labor/workers, inventory/materials, equipment, fleet   | ❌ Đã có screens          |
| **Attendance/Schedule**     | labor/attendance, labor/shifts, worker-schedule        | Có thể merge              |
| **Order List**              | seller/orders, inventory/orders, orders                | Share OrderList component |
| **Dashboard + KPI**         | seller/dashboard, seller/analytics, seller/revenue     | Share DashboardCard       |
| **Form: Create/Edit**       | labor/create-_, inventory/create-_, procurement/create | Share FormBuilder         |
| **Coming-soon placeholder** | rfi, reminders, smart-home, installment                | Giữ nguyên template       |

---

## 7. Missing Screens List

### 7.1 Registry Routes WITHOUT Screen Files

| Registry Route             | Module                        | File Expected                           | Status                |
| -------------------------- | ----------------------------- | --------------------------------------- | --------------------- |
| QUALITY.DEFECTS            | quality-assurance             | defects.tsx (index may exist in nested) | ⚠️ Check nested dir   |
| QUALITY.INSPECTIONS_CREATE | quality-assurance/inspections | create.tsx                              | ⚠️ Check              |
| QUALITY.NCR                | quality-assurance             | ncr.tsx or ncr/index.tsx                | ⚠️ Check              |
| STORAGE.INDEX              | storage                       | index.tsx                               | ⚠️ Check              |
| STORAGE.SETTINGS           | storage                       | settings.tsx                            | ⚠️ Check              |
| STORAGE.FILE               | storage                       | file/[id].tsx                           | ⚠️ Check              |
| SOCIAL.STORIES             | stories                       | index.tsx                               | ✅ Exists at /stories |
| SOCIAL.STORIES_CREATE      | stories                       | create.tsx                              | ✅ Exists             |
| SOCIAL.REELS               | reels                         | index.tsx                               | ✅ Exists             |
| SOCIAL.INSTAGRAM_FEED      | root                          | instagram-feed.tsx                      | ✅ Exists             |
| SOCIAL.TIKTOK              | tiktok                        | index.tsx                               | ✅ Exists             |
| SOCIAL.TRENDING            | trending                      | index.tsx                               | ✅ Exists             |
| MISC.WAREHOUSE             | warehouse                     | index.tsx                               | ✅ Exists             |
| MISC.EVENTS                | events                        | index.tsx                               | ✅ Exists             |
| MISC.NEWS                  | news                          | index.tsx                               | ✅ Exists             |
| MISC.DISCOVER              | discover                      | index.tsx                               | ✅ Exists             |
| MISC.TRACKING              | tracking                      | index.tsx                               | ✅ Exists             |

### 7.2 Features in feature-map WITHOUT screen files

Tất cả 111 features đều có screen tương ứng. ✅ **Không có feature nào trỏ vào screen không tồn tại.**

---

## 8. Duplicate / Overlap / Conflict List

### 8.1 Feature ID Conflicts (CRITICAL)

| Conflict  | Arrays                                                   | IDs                     | Impact                                           |
| --------- | -------------------------------------------------------- | ----------------------- | ------------------------------------------------ |
| **c1-c8** | CUSTOMER_CONSTRUCTION_UTILITY_MAP vs WORKER_CATEGORY_MAP | c1,c2,c3,c4,c5,c6,c7,c8 | Worker overwrite customer trong `_index` Map     |
| **a1-a4** | ENGINEER_ACTION_MAP vs CONTRACTOR_ACTION_MAP             | a1,a2,a3,a4             | Contractor overwrite engineer trong `_index` Map |

**Impact**: `navigateByFeatureId("c1")` → resolve sang Worker route (painter) thay vì Customer route (ép cọc). Tương tự `navigateByFeatureId("a1")` → contractor route (CRM staff) thay vì engineer route (VR preview).

**Fix cần thiết**: Đổi IDs thành unique — ví dụ: `wc1-wc8` cho worker categories, `ea1-ea4` cho engineer actions, `ca1-ca8` cho contractor actions.

### 8.2 Route Overlaps

| Screen A                  | Screen B                               | Routes                            | Issue                                     |
| ------------------------- | -------------------------------------- | --------------------------------- | ----------------------------------------- |
| `app/checkout.tsx`        | `app/checkout/payment.tsx`             | /checkout vs /checkout/payment    | Hợp lệ (parent + child)                   |
| `(tabs)/projects.tsx`     | `projects/index.tsx`                   | Cùng /projects nhưng khác context | ⚠️ Tab vs standalone — potential conflict |
| `crm/projects.tsx`        | `(tabs)/projects.tsx`                  | /crm/projects vs /(tabs)/projects | OK - khác scope                           |
| `(tabs)/messages/*`       | `messages/*`                           | Cùng /messages nhưng khác nesting | ⚠️ Có thể conflict                        |
| `(tabs)/live.tsx`         | `live/*.tsx`                           | /(tabs)/live vs /live/\*          | ⚠️ Có thể conflict                        |
| `(tabs)/social.tsx`       | `social/*.tsx`                         | /(tabs)/social vs /social/\*      | ⚠️ Có thể conflict                        |
| SHOPPING.CART (`/cart`)   | `shopping/cart.tsx` (`/shopping/cart`) | 2 cart screens                    | ⚠️ Duplicate                              |
| SERVICES.HOME_MAINTENANCE | `services/home-maintenance/index.tsx`  | Same route, correct               | ✅ OK                                     |

### 8.3 Functional Duplicates

| Feature          | Screen 1                        | Screen 2                     | Recommendation                    |
| ---------------- | ------------------------------- | ---------------------------- | --------------------------------- |
| Cart             | `/cart` (root)                  | `/shopping/cart`             | Giữ `/cart`, remove shopping/cart |
| QR Scanner       | `/utilities/qr-scanner`         | `/tools/qr-scanner`          | Giữ 1, alias khác                 |
| Worker listing   | `/workers`                      | `/booking/worker-list`       | Khác use case, giữ cả 2           |
| Project estimate | `/calculators/project-estimate` | `/services/cost-estimate-ai` | Khác approach (manual vs AI)      |
| Feng shui        | `/services/feng-shui`           | `/tools/fengshui`            | Giữ 1, alias                      |
| Feedback         | `/feedback`                     | `/profile/reviews`           | Khác context                      |

---

## 9. Navigation Risk List

### 9.1 P0 — Broken / Must-fix

| Risk   | Description                                                 | Impact                                                   | Fix                              |
| ------ | ----------------------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| **R1** | Feature ID collision: c1-c8, a1-a4                          | `navigateByFeatureId()` returns wrong route for 12 items | ➡️ Rename IDs to unique prefixes |
| **R2** | menu.tsx hardcodes `/coming-soon/labor` but `/labor` exists | Users see "coming soon" for ready features               | ➡️ Update menu.tsx routes        |
| **R3** | `/coming-soon/inventory` but `/inventory` exists            | Same as above                                            | ➡️ Update menu.tsx               |
| **R4** | `/coming-soon/weather` but `/weather` exists                | Same as above                                            | ➡️ Update menu.tsx               |
| **R5** | `/coming-soon/submittals` but `/submittal` exists           | Same as above                                            | ➡️ Update menu.tsx               |
| **R6** | `/coming-soon/meetings` but `/meeting-minutes` exists       | Same as above                                            | ➡️ Update menu.tsx               |
| **R7** | orders module (3 screens) has no registry entry             | No safe navigation for order pages                       | ➡️ Add ORDERS to registry        |
| **R8** | payment module (3 screens) has no registry entry            | Payment flow may break                                   | ➡️ Add PAYMENT to registry       |
| **R9** | settings module (16 screens) has no registry entry          | Can't navigate to settings safely                        | ➡️ Add SETTINGS to registry      |

### 9.2 P1 — Should Fix for Correct UX

| Risk    | Description                                                        | Impact                                                  |
| ------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| **R10** | seller module (12 screens) not in registry                         | Contractor can't access shop management                 |
| **R11** | labor module (12 screens) not in registry                          | Contractor can't manage workers properly                |
| **R12** | inventory module (8 screens) not in registry                       | Contractor can't manage inventory                       |
| **R13** | Profile has 45 screens but only 3 registry entries                 | Most profile features unreachable via safe nav          |
| **R14** | Social has 11 screens but only 3 registry entries                  | Most social features unreachable                        |
| **R15** | Contracts has 9 screens but only 3 registry entries                | Missing create, templates, settlement, quotes           |
| **R16** | CRM has 26 screens but 19 registry entries                         | Missing activity, tickets, mind-map, project-management |
| **R17** | messages (root) 14 screens not differentiated from (tabs)/messages | Navigation confusion                                    |
| **R18** | Tab bar not role-aware                                             | All roles see same 4 tabs                               |

### 9.3 P2 — Enhancement

| Risk    | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| **R19** | demo/ screens (16) pollute route namespace                        |
| **R20** | food/ module (3 screens) purpose unclear in construction app      |
| **R21** | tiktok/ module (5 screens) may be deprecated/experimental         |
| **R22** | 73 project screens — many may be nested deep without direct entry |
| **R23** | No deep-link scheme for external navigation                       |
| **R24** | No analytics on orphan screen visits (are they even used?)        |

---

## 10. Prioritized Next-Step Plan

### P0 — Must Fix Now (Broken Navigation) 🔴

| #    | Task                                                                                                                                                               | Files to Change                                       | Effort |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ------ |
| P0.1 | **Fix feature ID collisions** — rename c1-c8 in WORKER_CATEGORY_MAP to wc1-wc8, a1-a4 in ENGINEER_ACTION_MAP to ea1-ea4, a1-a8 in CONTRACTOR_ACTION_MAP to ca1-ca8 | `feature-map.ts` + 3 home data files + 3 home screens | M      |
| P0.2 | **Update menu.tsx** — replace 5 `/coming-soon/*` routes with real routes (/labor, /inventory, /weather, /submittal, /meeting-minutes)                              | `app/(tabs)/menu.tsx`                                 | S      |
| P0.3 | **Add ORDERS module** to route-registry.ts                                                                                                                         | `route-registry.ts`                                   | S      |
| P0.4 | **Add PAYMENT module** to route-registry.ts                                                                                                                        | `route-registry.ts`                                   | S      |
| P0.5 | **Add SETTINGS module** to route-registry.ts                                                                                                                       | `route-registry.ts`                                   | S      |

### P1 — Should Complete for Correct Role UX 🟡

| #     | Task                                                                                                                                                                                                                   | Files to Change                       | Effort |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------ |
| P1.1  | **Add SELLER module** to route-registry.ts + add seller features to contractor home feature-map                                                                                                                        | `route-registry.ts`, `feature-map.ts` | M      |
| P1.2  | **Add LABOR module** to route-registry.ts + link from contractor Quick Actions                                                                                                                                         | `route-registry.ts`, `feature-map.ts` | M      |
| P1.3  | **Add INVENTORY module** to route-registry.ts + link from contractor                                                                                                                                                   | `route-registry.ts`, `feature-map.ts` | M      |
| P1.4  | **Add EQUIPMENT module** to route-registry.ts                                                                                                                                                                          | `route-registry.ts`                   | S      |
| P1.5  | **Add WEATHER module** to route-registry.ts + add weather card to contractor/worker home                                                                                                                               | `route-registry.ts`, `feature-map.ts` | M      |
| P1.6  | **Expand PROFILE registry** — add settings, verify, portfolio, rewards, orders sub-routes                                                                                                                              | `route-registry.ts`                   | M      |
| P1.7  | **Expand CONTRACTS registry** — add create, templates, settlement, quotes                                                                                                                                              | `route-registry.ts`                   | S      |
| P1.8  | **Expand SOCIAL registry** — add posts, groups, explore, create-post, shorts                                                                                                                                           | `route-registry.ts`                   | S      |
| P1.9  | **Add construction-related modules** to registry: change-management, change-order, construction-progress, inspection, risk, warranty, as-built, commissioning, document-control, meeting-minutes, om-manuals, handbook | `route-registry.ts`                   | L      |
| P1.10 | **Expand feature-map** — add contractor features (seller, labor, inventory), engineer features (QC detail, documents, inspection), worker features (weather, handbook)                                                 | `feature-map.ts`                      | L      |
| P1.11 | **Add MESSAGES module** to registry (root messages, not tabs)                                                                                                                                                          | `route-registry.ts`                   | S      |
| P1.12 | **Add LIVE module** to registry (root live screens)                                                                                                                                                                    | `route-registry.ts`                   | S      |

### P2 — Enhancement / Optimization 🟢

| #     | Task                                                                 | Effort |
| ----- | -------------------------------------------------------------------- | ------ |
| P2.1  | **Add SHOPPING module** to registry (separate from VLXD)             | S      |
| P2.2  | **Add LEGAL module** to registry                                     | S      |
| P2.3  | Remove or consolidate route duplicates (cart, qr-scanner, feng-shui) | M      |
| P2.4  | Make tab bar role-aware                                              | L      |
| P2.5  | Add deep-link scheme                                                 | L      |
| P2.6  | Add navigation analytics (track orphan screen visits)                | M      |
| P2.7  | Deprecate/hide demo/ screens in production                           | S      |
| P2.8  | Review food/tiktok modules — keep or remove                          | S      |
| P2.9  | Consolidate messages (tabs) vs messages (root)                       | M      |
| P2.10 | Consolidate live (tabs) vs live (root)                               | M      |

---

## Appendix A — Navigation Entry Points per Screen

| Entry Point                  | # Screens Reachable | Method                    |
| ---------------------------- | ------------------- | ------------------------- |
| Customer home (12 sections)  | 67                  | `navigateByFeatureId()`   |
| Worker home (6 sections)     | 20                  | `navigateByFeatureId()`   |
| Engineer home (6 sections)   | 12                  | `navigateByFeatureId()`   |
| Contractor home (6 sections) | 12                  | `navigateByFeatureId()`   |
| Menu (272+ items)            | ~272                | Direct route push         |
| Tab bar (4 tabs)             | 4                   | Tab navigation            |
| Search                       | ~all                | Search → route            |
| Profile                      | ~45 (nested)        | Internal navigation       |
| **Total reachable**          | **~300**            |                           |
| **Total screens**            | **775**             |                           |
| **Unreachable**              | **~475 (~61%)**     | Via menu only or no entry |

## Appendix B — ID Collision Fix Reference

```
Current → Fixed
────────────────────────────────────
WORKER_CATEGORY_MAP:
  c1 → wc1 (Thợ sơn)
  c2 → wc2 (Thợ điện)
  c3 → wc3 (Thợ nước)
  c4 → wc4 (Thợ hồ)
  c5 → wc5 (Thợ mộc)
  c6 → wc6 (Thợ hàn)
  c7 → wc7 (Thợ ốp lát)
  c8 → wc8 (Thợ nhôm kính)

ENGINEER_ACTION_MAP:
  a1 → ea1 (VR/AR Mặt bằng)
  a2 → ea2 (Camera công trình)
  a3 → ea3 (Bản vẽ 2D/3D)
  a4 → ea4 (Tư vấn khách hàng)

CONTRACTOR_ACTION_MAP:
  a1 → ca1 (Quản lý nhân sự)
  a2 → ca2 (Đội thi công)
  a3 → ca3 (Dự án)
  a4 → ca4 (Hợp đồng)
  a5 → ca5 (Kho vật tư)
  a6 → ca6 (Điều phối)
  a7 → ca7 (Báo giá)
  a8 → ca8 (Báo cáo)

CONTRACTOR_PROJECT_MAP:
  p1 → cp1 (Biệt thự Thảo Điền)
  p2 → cp2 (Văn phòng Landmark)
  p3 → cp3 (Nhà phố Quận 9)
  p4 → cp4 (Chung cư Riverside)
```
