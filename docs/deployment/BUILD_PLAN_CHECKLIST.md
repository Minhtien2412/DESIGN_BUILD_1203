# 📋 BUILD PLAN - Kế hoạch hoàn thiện App

**Ngày tạo:** 05/01/2026  
**Cập nhật:** 05/01/2026  
**Trạng thái:** Đang phát triển  
**Backend:** https://baotienweb.cloud  
**CRM:** https://thietkeresort.com.vn/perfex_crm

---

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ ĐÃ HOẠT ĐỘNG VỚI DỮ LIỆU ĐỘNG

| Module | File/Hook | Nguồn dữ liệu | Trạng thái |
|--------|-----------|---------------|------------|
| **Dashboard Home** | `app/(tabs)/index.tsx` | `useDashboardData` → Perfex CRM | ✅ Hoạt động |
| **Auth/Login** | `context/AuthContext.tsx` | `authApi` → Backend | ✅ Hoạt động |
| **CRM Tasks** | `hooks/useCRMTasks.ts` | `PerfexTasksService` | ✅ Hoạt động |
| **CRM Invoices** | `hooks/useCRMInvoices.ts` | `PerfexInvoicesService` | ✅ Hoạt động |
| **CRM Leads** | `hooks/useCRMLeads.ts` | `PerfexLeadsService` | ✅ Hoạt động |
| **CRM Customers** | `hooks/useDashboardData.ts` | `PerfexCustomersService` | ✅ Hoạt động |
| **Projects Hub** | `hooks/useProjectsHub.ts` | `PerfexProjectsService` | ✅ Hoạt động |
| **Construction Hub** | `hooks/useConstructionHub.ts` | CRM Integration | ✅ Hoạt động |
| **Villa Progress** | `app/construction/villa-progress.tsx` | `PerfexApiIntegration` | ✅ Hoạt động |
| **Admin Settings** | `app/admin/settings.tsx` | `apiFetch` | ✅ Hoạt động |
| **Admin Staff** | `app/admin/staff/*.tsx` | `apiFetch` | ✅ Hoạt động |
| **Seller Products** | `app/seller/*.tsx` | `apiFetch` | ✅ Hoạt động |
| **Profile Info** | `app/profile/info.tsx` | `apiFetch` | ✅ Hoạt động |
| **Forgot Password** | `app/(auth)/forgot-password.tsx` | `apiFetch` | ✅ Hoạt động |
| **Reset Password** | `app/(auth)/reset-password.tsx` | `apiFetch` | ✅ Hoạt động |
| **🆕 Construction Progress** | `app/construction-progress/index.tsx` | `PerfexProjectsService` | ✅ HOÀN THÀNH |
| **🆕 Customer Projects** | `app/projects/customer-projects.tsx` | `PerfexCustomersService + PerfexProjectsService` | ✅ HOÀN THÀNH |
| **🆕 Project Timeline** | `app/projects/[id]/timeline.tsx` | `PerfexTasksService` | ✅ HOÀN THÀNH |
| **🆕 Payment Progress** | `app/projects/[id]/payment-progress.tsx` | `PerfexInvoicesService` | ✅ HOÀN THÀNH |
| **🆕 Orders** | `app/profile/orders.tsx` | `listOrders()` → Backend | ✅ HOÀN THÀNH |
| **🆕 Timeline Task** | `app/timeline/task/[id].tsx` | `PerfexTasksService.getById` | ✅ HOÀN THÀNH |
| **🆕 Vouchers** | `app/profile/vouchers.tsx` | `VoucherService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Rewards** | `app/profile/rewards.tsx` | `RewardService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Reviews** | `app/profile/reviews.tsx` | `ReviewService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Project Gallery** | `app/projects/[id]/gallery.tsx` | `GalleryService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Checkout** | `app/checkout.tsx` | `AddressService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Product Reviews** | `app/product/[id]/reviews.tsx` | `ReviewService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Phase Detail** | `app/timeline/phase/[id].tsx` | `PhaseService` → Perfex | ✅ HOÀN THÀNH |
| **🆕 Edit Phase** | `app/timeline/edit-phase.tsx` | `PhaseService` → Perfex | ✅ HOÀN THÀNH |
| **🆕 Addresses** | `app/profile/addresses.tsx` | `AddressService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Construction Progress Detail** | `app/construction-progress/[id].tsx` | `ConstructionProgressService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Quotation List** | `app/projects/quotation-list.tsx` | `QuotationService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Find Contractors** | `app/projects/find-contractors.tsx` | `ContractorService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Materials Catalog** | `app/services/materials-catalog.tsx` | `MaterialsCatalogService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Architecture Portfolio** | `app/projects/architecture-portfolio.tsx` | `PortfolioService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Architecture Detail** | `app/projects/architecture/[id].tsx` | `PortfolioService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Stories Viewer** | `app/stories/[userId].tsx` | `StoriesService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Construction Tracking** | `app/construction/tracking.tsx` | `WorkerService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Suppliers** | `app/inventory/suppliers.tsx` | `useSuppliers` Hook → Backend | ✅ HOÀN THÀNH |
| **🆕 BOQ** | `app/profile/portfolio/boq.tsx` | `PortfolioDocsService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Specifications** | `app/profile/portfolio/spec.tsx` | `PortfolioDocsService` → Backend | ✅ HOÀN THÀNH |
| **🆕 3D Design** | `app/profile/portfolio/3d-design.tsx` | `PortfolioDocsService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Videos Feed** | `app/videos/index.tsx` | `ShortVideoService` → Backend | ✅ HOÀN THÀNH |
| **🆕 Project Detail** | `app/projects/[id].tsx` | `ProjectDetailService` → Backend | ✅ HOÀN THÀNH |

---

### ⚠️ ĐANG DÙNG MOCK DATA - CẦN KẾT NỐI API

#### 🏗️ **GROUP 1: Dự án & Thi công** (Ưu tiên cao)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| ~~Construction Tracking~~ | ~~`app/construction/tracking.tsx`~~ | ~~`MOCK_WORKER`~~ | `WorkerService` | ✅ DONE |
| ~~Construction Progress~~ | ~~`app/construction-progress/index.tsx`~~ | ~~`MOCK_PROJECTS`~~ | ~~`PerfexProjectsService`~~ | ✅ DONE |
| ~~Project Detail~~ | ~~`app/projects/[id].tsx`~~ | ~~`MOCK_WORKFLOW, MOCK_TEAM, MOCK_DOCUMENTS`~~ | `ProjectDetailService` | ✅ DONE |
| ~~Project Timeline~~ | ~~`app/projects/[id]/timeline.tsx`~~ | ~~`MOCK_TIMELINE`~~ | ~~`PerfexTasksService`~~ | ✅ DONE |
| Project Gallery | `app/projects/[id]/gallery.tsx` | ~~`MOCK_PHOTOS`~~ | `GalleryService` | ✅ DONE |
| ~~Project Payment~~ | ~~`app/projects/[id]/payment-progress.tsx`~~ | ~~`MOCK_PAYMENT_PHASES`~~ | ~~`PerfexInvoicesService`~~ | ✅ DONE |
| ~~Customer Projects~~ | ~~`app/projects/customer-projects.tsx`~~ | ~~`MOCK_CUSTOMERS, MOCK_PROJECTS`~~ | ~~`PerfexCustomersService`~~ | ✅ DONE |
| Timeline Mindmap | `app/projects/timeline-mindmap.tsx` | `MOCK_NODES, MOCK_CONNECTIONS, MOCK_TODOS` | `/projects/{id}/mindmap` |
| Timeline Phase | `app/timeline/phase/[id].tsx` | ~~`MOCK_PHASE`~~ | `PhaseService` | ✅ DONE |
| ~~Timeline Task~~ | ~~`app/timeline/task/[id].tsx`~~ | ~~`MOCK_TASK`~~ | ~~`PerfexTasksService`~~ | ✅ DONE |
| Edit Phase | `app/timeline/edit-phase.tsx` | ~~`MOCK_PHASE`~~ | `PhaseService` | ✅ DONE |
| Construction Progress Detail | `app/construction-progress/[id].tsx` | ~~`MOCK_PROJECT, MOCK_TASKS`~~ | `ConstructionProgressService` | ✅ DONE |

#### 🛒 **GROUP 2: E-Commerce & Profile** (Ưu tiên cao)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| Checkout | `app/checkout.tsx` | ~~`MOCK_ADDRESSES`~~ | `AddressService` | ✅ DONE |
| ~~Orders~~ | ~~`app/profile/orders.tsx`~~ | ~~`MOCK_ORDERS`~~ | ~~`listOrders()`~~ | ✅ DONE |
| Vouchers | `app/profile/vouchers.tsx` | ~~`MOCK_VOUCHERS`~~ | `VoucherService` | ✅ DONE |
| Rewards | `app/profile/rewards.tsx` | ~~`MOCK_HISTORY, MOCK_REWARDS`~~ | `RewardService` | ✅ DONE |
| Reviews | `app/profile/reviews.tsx` | ~~`MOCK_REVIEWS`~~ | `ReviewService` | ✅ DONE |
| Product Reviews | `app/product/[id]/reviews.tsx` | ~~`MOCK_REVIEWS`~~ | `ReviewService` | ✅ DONE |
| Addresses | `app/profile/addresses.tsx` | ~~`MOCK_ADDRESSES`~~ | `AddressService` | ✅ DONE |

#### 📁 **GROUP 3: Portfolio & Documents** (Ưu tiên trung bình)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| ~~BOQ~~ | ~~`app/profile/portfolio/boq.tsx`~~ | ~~`MOCK_BOQ`~~ | `PortfolioDocsService` | ✅ DONE |
| ~~Specifications~~ | ~~`app/profile/portfolio/spec.tsx`~~ | ~~`MOCK_SPECS`~~ | `PortfolioDocsService` | ✅ DONE |
| ~~3D Design~~ | ~~`app/profile/portfolio/3d-design.tsx`~~ | ~~`MOCK_DESIGNS`~~ | `PortfolioDocsService` | ✅ DONE |
| ~~Architecture Portfolio~~ | ~~`app/projects/architecture-portfolio.tsx`~~ | ~~`MOCK_PROJECTS`~~ | `PortfolioService` | ✅ DONE |
| ~~Architecture Detail~~ | ~~`app/projects/architecture/[id].tsx`~~ | ~~`MOCK_PROJECT`~~ | `PortfolioService` | ✅ DONE |
| ~~Quotation List~~ | ~~`app/projects/quotation-list.tsx`~~ | ~~`MOCK_QUOTATIONS`~~ | `QuotationService` | ✅ DONE |
| ~~Find Contractors~~ | ~~`app/projects/find-contractors.tsx`~~ | ~~`MOCK_CONTRACTORS`~~ | `ContractorService` | ✅ DONE |

#### 📱 **GROUP 4: Social & Media** (Ưu tiên trung bình)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| ~~Stories~~ | ~~`app/stories/[userId].tsx`~~ | ~~`MOCK_STORY_GROUPS`~~ | `StoriesService` | ✅ DONE |
| ~~Videos~~ | ~~`app/videos/index.tsx`~~ | ~~`MOCK_VIDEOS, MOCK_COMMENTS`~~ | `ShortVideoService` | ✅ DONE |

#### 🏢 **GROUP 5: Materials & Services** (Ưu tiên trung bình)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| ~~Materials Catalog~~ | ~~`app/services/materials-catalog.tsx`~~ | ~~`MATERIALS`~~ | `MaterialsCatalogService` | ✅ DONE |
| ~~Supplier Detail~~ | ~~`app/inventory/suppliers.tsx`~~ | ~~via hook~~ | `useSuppliers` Hook | ✅ DONE |
| Construction Company | `app/services/construction-company.tsx` | Mock data trong file | `/companies` |
| Communications | `app/communications/[id].tsx` | `MOCK_MESSAGES` | WebSocket Chat |

#### 🤖 **GROUP 6: AI & Advanced** (Ưu tiên thấp)

| Screen | File | Mock Variable | API cần kết nối |
|--------|------|---------------|-----------------|
| Progress Prediction | `app/ai/progress-prediction.tsx` | `mockPrediction` | `/ai/predict` |
| Dashboard Admin | `app/dashboard/admin-enhanced.tsx` | `mockAdminDashboard` | `/admin/dashboard` |
| Environmental | `app/environmental/index.tsx` | Mock project ID | `/projects/{id}/environmental` |

---

## 📈 TIẾN ĐỘ HOÀN THÀNH: 33/40+ screens migrated (~80%)

---

## 🔧 CẤU HÌNH API ĐÃ THIẾT LẬP

### Backend (NestJS/Fastify)
```
URL: https://baotienweb.cloud
API Key: thietke-resort-api-key-2024
WebSocket: wss://baotienweb.cloud
  - /chat (Chat namespace)
  - /call (Video call namespace)
  - /progress (Progress updates namespace)
```

### Perfex CRM
```
URL: https://thietkeresort.com.vn/perfex_crm
Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Custom API Key: 67890abcdef!@#$%^&*
```

---

## 📅 KẾ HOẠCH THỰC HIỆN

### **PHASE 1: Core Business Logic (1-2 tuần)**
**Mục tiêu:** Hoàn thiện các chức năng nghiệp vụ chính

- [ ] **1.1** Kết nối Construction Tracking với Workers API
- [ ] **1.2** Kết nối Project Detail với đầy đủ data (team, documents, workflow)
- [ ] **1.3** Kết nối Timeline/Phases với Perfex Tasks
- [ ] **1.4** Kết nối Payment Progress với Perfex Invoices
- [ ] **1.5** Kết nối Customer Projects với Perfex Customers

### **PHASE 2: E-Commerce (1 tuần)**
**Mục tiêu:** Hoàn thiện luồng mua sắm

- [ ] **2.1** Tạo API addresses cho checkout
- [ ] **2.2** Tạo API orders & order history
- [ ] **2.3** Kết nối vouchers/rewards với loyalty system
- [ ] **2.4** Kết nối reviews system

### **PHASE 3: Real-time Features (1 tuần)**
**Mục tiêu:** Kích hoạt WebSocket cho real-time

- [ ] **3.1** Kích hoạt Chat WebSocket namespace
- [ ] **3.2** Kích hoạt Video Call WebSocket namespace
- [ ] **3.3** Kích hoạt Progress Updates namespace
- [ ] **3.4** Test real-time notifications

### **PHASE 4: Media & Social (3-5 ngày)**
**Mục tiêu:** Hoàn thiện tính năng xã hội

- [ ] **4.1** Kết nối Stories với media upload
- [ ] **4.2** Kết nối Videos với streaming service
- [ ] **4.3** Test social features (like, comment, share)

### **PHASE 5: Testing & Polish (3-5 ngày)**
**Mục tiêu:** Kiểm tra và hoàn thiện

- [ ] **5.1** Unit tests cho hooks
- [ ] **5.2** Integration tests cho API calls
- [ ] **5.3** E2E tests cho main flows
- [ ] **5.4** Performance optimization
- [ ] **5.5** Error handling & offline mode

### **PHASE 6: Build & Deploy (2-3 ngày)**
**Mục tiêu:** Đóng gói và phát hành

- [ ] **6.1** Configure EAS Build
- [ ] **6.2** Build Android APK
- [ ] **6.3** Build iOS IPA
- [ ] **6.4** Test trên thiết bị thật
- [ ] **6.5** Submit to stores (optional)

---

## 📝 CHECKLIST TRƯỚC KHI BUILD

### Environment
- [ ] API_BASE_URL configured
- [ ] CRM Token valid & not expired
- [ ] WebSocket endpoints reachable
- [ ] All secrets in .env file

### Code Quality
- [ ] No TypeScript errors
- [ ] No console.error in production
- [ ] All MOCK_ variables removed/replaced
- [ ] Error boundaries in place
- [ ] Loading states handled

### Assets
- [ ] App icons all sizes
- [ ] Splash screens
- [ ] Marketing images
- [ ] Demo videos (if needed)

### Documentation
- [ ] README updated
- [ ] API documentation
- [ ] User guide (optional)

---

## 🎯 QUICK WINS (Có thể làm ngay)

1. **Thay MOCK_ORDERS → /orders API** (đã có endpoint)
2. **Thay MOCK_PROJECTS trong construction-progress** (dùng `PerfexProjectsService`)
3. **Kết nối MOCK_TIMELINE → Perfex Tasks** (đã có service)
4. **Thay MOCK_REVIEWS → /reviews API** (đã có logic)

---

## 📊 THỐNG KÊ

| Loại | Số lượng |
|------|----------|
| Tổng số màn hình | ~150+ |
| Đã kết nối API | ~15 màn hình |
| Còn dùng Mock | ~40+ màn hình |
| Hooks CRM sẵn có | 10 hooks |
| Services API sẵn có | 100+ files |

---

**Ghi chú:**  
- Ưu tiên GROUP 1 & 2 trước vì là core business
- Có thể bỏ qua GROUP 6 cho MVP
- WebSocket đã cấu hình, chỉ cần kích hoạt

---

*Cập nhật lần cuối: 05/01/2026*
