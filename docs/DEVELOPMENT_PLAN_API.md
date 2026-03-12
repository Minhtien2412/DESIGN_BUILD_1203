# 📋 KẾ HOẠCH PHÁT TRIỂN API INTEGRATION

**Ngày tạo:** 2026-01-03  
**Cập nhật:** 2026-01-03  
**Trạng thái:** Đang thực hiện (Phase 2: Screens Integration)

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Homepage Real Data Integration
- [x] Tạo `hooks/useDashboardData.ts` - Hook tổng hợp fetch data từ CRM
- [x] Cập nhật `app/(tabs)/index.tsx` - Sử dụng real data thay mock
- [x] Cập nhật `components/home/progress-section.tsx` - Fetch từ CRM
- [x] Hiển thị Data Source Badge (Live/Demo/Cache)
- [x] Dynamic badges cho Quick Access (projects, chat, orders)
- [x] Dynamic stats cho Core Modules

### 2. CRM Hooks Suite (Phase 1 Complete ✅)
- [x] `hooks/useProjectsHub.ts` - Dashboard cho Projects tab
- [x] `hooks/useCRMTasks.ts` - Quản lý tasks từ Perfex CRM
- [x] `hooks/useCRMInvoices.ts` - Quản lý invoices/thanh toán
- [x] `hooks/useCRMLeads.ts` - Quản lý leads pipeline
- [x] `hooks/useConstructionHub.ts` - Construction progress tracking
- [x] `hooks/useShoppingProductsAPI.ts` - Products catalog with filters
- [x] `hooks/crm/index.ts` - Export tất cả CRM hooks

### 3. CRM Screens (Phase 2 - Mới tạo 2026-01-03) ✅
- [x] `app/crm/tasks.tsx` - Tasks Kanban Board + CRUD
- [x] `app/crm/leads.tsx` - Lead Pipeline với funnel chart
- [x] `app/crm/invoices.tsx` - Invoice list với payment tracking
- [x] `app/crm/index.tsx` - Quick Actions menu (updated)
- [x] `app/crm/_layout.tsx` - Routes cho tasks, leads, invoices

### 4. Screens đã cập nhật
- [x] `features/projects/ProjectsHubScreen.tsx` - Sử dụng useProjectsHub
- [x] Thêm Data Source Badge (🟢 Live CRM / 🟡 Demo)
- [x] Dynamic stats từ real CRM data

### 5. Files Structure:
```
hooks/
├── useDashboardData.ts          ✅ Homepage dashboard
├── useProjectsHub.ts            ✅ Projects hub data
├── useCRMTasks.ts               ✅ Tasks management
├── useCRMInvoices.ts            ✅ Invoices & payments
├── useCRMLeads.ts               ✅ Leads pipeline
├── useConstructionHub.ts        ✅ Construction progress
├── useShoppingProductsAPI.ts    ✅ Products catalog
└── crm/
    └── index.ts                 ✅ Export all CRM hooks

app/crm/
├── _layout.tsx                  ✅ UPDATED - New routes
├── index.tsx                    ✅ UPDATED - Quick Actions
├── tasks.tsx                    ✅ NEW - Tasks Kanban
├── leads.tsx                    ✅ NEW - Lead Pipeline
├── invoices.tsx                 ✅ NEW - Invoice List

features/projects/
├── ProjectsHubScreen.tsx        ✅ UPDATED - Uses useProjectsHub

components/home/
├── progress-section.tsx         ✅ UPDATED - Fetches from CRM

app/(tabs)/
├── index.tsx                    ✅ UPDATED - Uses useDashboardData

docs/
├── API_STATUS_REPORT_272_FEATURES.md  ✅ Full audit report
├── DEVELOPMENT_PLAN_API.md            ✅ This file (updated)
```

---

## 🔄 ĐANG THỰC HIỆN

### Phase 2: Screens Integration - 80% Done

**Màn hình CRM đã hoàn thành:**
| Screen | Route | Hook | Features | Status |
|--------|-------|------|----------|--------|
| Tasks | `/crm/tasks` | useCRMTasks | Kanban, Create, Complete | ✅ Done |
| Leads | `/crm/leads` | useCRMLeads | Pipeline, Funnel, Convert | ✅ Done |
| Invoices | `/crm/invoices` | useCRMInvoices | List, Stats, Mark Paid | ✅ Done |
| Projects Hub | `/projects` | useProjectsHub | Stats, Recent | ✅ Done |
| Homepage | `/` | useDashboardData | Overview, Badges | ✅ Done |

### Phase 1 Hooks - 100% Complete ✅

| Hook | File | Features | Status |
|------|------|----------|--------|
| useDashboardData | `hooks/useDashboardData.ts` | Homepage stats, badges | ✅ Done |
| useProjectsHub | `hooks/useProjectsHub.ts` | Projects tab stats, recent | ✅ Done |
| useCRMTasks | `hooks/useCRMTasks.ts` | CRUD tasks, stats | ✅ Done |
| useCRMInvoices | `hooks/useCRMInvoices.ts` | Payment tracking | ✅ Done |
| useCRMLeads | `hooks/useCRMLeads.ts` | Lead pipeline | ✅ Done |
| useConstructionHub | `hooks/useConstructionHub.ts` | Construction progress | ✅ Done |
| useShoppingProductsAPI | `hooks/useShoppingProductsAPI.ts` | Products, filters, flash sale | ✅ Done |

---

## 📝 PHASE 3 - TIẾP THEO
// app/projects/index.tsx
- [ ] Import useDashboardData hoặc tạo useProjects hook
- [ ] Replace MOCK_PROJECTS với PerfexProjectsService.getAll()
- [ ] Thêm loading state, error handling
- [ ] Thêm pull-to-refresh

// app/projects/[id].tsx
- [ ] Fetch project detail từ PerfexProjectsService.getById(id)
- [ ] Fetch tasks của project

// services/projectsApi.ts
- [ ] Wrap PerfexProjectsService với error handling
- [ ] Add caching layer
```

**Code example:**
```typescript
// hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { PerfexProjectsService } from '@/services/perfexCRM';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetch() {
      try {
        const res = await PerfexProjectsService.getAll({ limit: 50 });
        setProjects(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);
  
  return { projects, loading };
}
```

---

### 2️⃣ Thi công XD (`/construction/*`)

**Files cần update:**
```typescript
// app/construction/progress.tsx
- [ ] Import PerfexProjectsService
- [ ] Fetch active projects (status=2)
- [ ] Map progress data to UI

// app/construction/payment-progress.tsx  
- [ ] Fetch invoices từ PerfexInvoicesService
- [ ] Group by project, calculate payment phases

// services/constructionApi.ts
- [ ] Tạo service mới aggregate construction data
```

---

### 3️⃣ Hợp đồng & Báo giá (`/contracts/*`)

**Files cần update:**
```typescript
// app/contracts/index.tsx
- [ ] Fetch từ PerfexEstimatesService hoặc main API

// app/quote-request.tsx
- [ ] POST request tạo estimate mới
- [ ] Uncomment API call đã có

// services/contractsApi.ts
- [ ] Wrap CRM contracts/estimates
```

---

### 4️⃣ QC/QA (`/quality-assurance/*`)

**Cần tạo backend endpoint:**
```typescript
// Backend endpoints needed:
POST /api/v1/inspections
GET  /api/v1/inspections
GET  /api/v1/inspections/:id
PUT  /api/v1/inspections/:id

POST /api/v1/checklists
GET  /api/v1/checklists
```

**Frontend updates:**
```typescript
// services/qcApi.ts - Tạo mới
// hooks/useQualityAssurance.ts - Tạo mới
// app/quality-assurance/index.tsx - Update để fetch
```

---

### 5️⃣ Shopping (`/shopping/*`)

**Files cần update:**
```typescript
// app/shopping/index.tsx
- [ ] Fetch products từ main API /products
- [ ] Fetch categories từ /categories

// app/cart.tsx
- [ ] Sync cart với server (optional)
- [ ] Checkout POST /orders

// services/productsApi.ts
- [ ] Tạo service fetch products
```

---

### 6️⃣ CRM Module (`/crm/*`)

**Đã có sẵn integration:**
```typescript
// app/crm/index.tsx - ✅ Sử dụng PerfexSyncProvider
// app/crm/customers.tsx - ✅ Fetch customers
// app/crm/projects.tsx - ✅ Fetch projects
```

**Cần thêm:**
```typescript
// app/crm/tasks.tsx
- [ ] Fetch tasks với filter by project
// app/crm/invoices.tsx  
- [ ] Fetch invoices với status filter
// app/crm/leads.tsx
- [ ] Fetch leads với pipeline view
```

---

### 7️⃣ Admin (`/admin/*`)

**Đã hoạt động:**
```typescript
// app/admin/staff/* - ✅ CRUD via apiFetch
// app/admin/settings.tsx - ✅ Fetch settings
// app/admin/roles/* - ✅ Role management
```

**Cần thêm:**
```typescript
// app/admin/logs.tsx - Activity logs
// app/admin/backup.tsx - Backup operations
```

---

### 8️⃣ Messages/Communication (`/messages/*`)

**Current state:** Mock data

**Implementation plan:**
```typescript
// 1. Setup WebSocket connection
// services/websocket.ts
const ws = new WebSocket('wss://baotienweb.cloud/chat');

// 2. Create hooks
// hooks/useMessages.ts
// hooks/useWebSocket.ts

// 3. Update screens
// app/messages/index.tsx - List conversations
// app/messages/[id].tsx - Chat room
```

---

## 📊 PRIORITY MATRIX

| Priority | Module | Impact | Effort | Week |
|----------|--------|--------|--------|------|
| 🔴 High | Projects | High | Low | 1 |
| 🔴 High | Construction | High | Medium | 1 |
| 🔴 High | CRM Tasks/Invoices | High | Low | 1 |
| 🟡 Medium | Contracts | Medium | Medium | 2 |
| 🟡 Medium | QC/QA | Medium | High | 2 |
| 🟡 Medium | Shopping | Medium | Medium | 2 |
| 🟢 Low | Messages (WS) | Low | High | 3 |
| 🟢 Low | Video Call | Low | High | 4 |

---

## 🛠️ IMPLEMENTATION STEPS

### Cho mỗi module:

#### Step 1: Tạo Service
```typescript
// services/{module}Api.ts
export const ModuleApiService = {
  getAll: async (params) => { ... },
  getById: async (id) => { ... },
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
};
```

#### Step 2: Tạo Hook
```typescript
// hooks/use{Module}.ts
export function useModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetch = useCallback(async () => { ... }, []);
  const refresh = useCallback(async () => { ... }, []);
  
  useEffect(() => { fetch(); }, []);
  
  return { data, loading, error, refresh };
}
```

#### Step 3: Update Screen
```typescript
// app/{module}/index.tsx
export default function ModuleScreen() {
  const { data, loading, error, refresh } = useModule();
  
  if (loading) return <Loader />;
  if (error) return <ErrorView onRetry={refresh} />;
  
  return (
    <FlatList
      data={data}
      refreshControl={<RefreshControl onRefresh={refresh} />}
      ...
    />
  );
}
```

#### Step 4: Test
- [ ] Test với real API
- [ ] Test fallback mock data
- [ ] Test offline mode
- [ ] Test error states

---

## 📁 FILE STRUCTURE PLAN

```
services/
├── api.ts                   # Base apiFetch
├── apiIntegration.ts        # Caching, retry logic
├── perfexCRM.ts             # ✅ CRM integration
├── dashboardApi.ts          # Dashboard aggregation
├── projectsApi.ts           # 🔄 To update
├── constructionApi.ts       # 🔄 To create
├── contractsApi.ts          # 🔄 To create
├── qcApi.ts                 # 🔄 To create
├── productsApi.ts           # 🔄 To create
├── messagesApi.ts           # 🔄 To create
└── websocket.ts             # 🔄 To create

hooks/
├── useDashboardData.ts      # ✅ Done
├── useProjects.ts           # 🔄 To create
├── useConstruction.ts       # 🔄 To create
├── useContracts.ts          # 🔄 To create
├── useQC.ts                 # 🔄 To create
├── useProducts.ts           # 🔄 To create
├── useMessages.ts           # 🔄 To create
└── useWebSocket.ts          # 🔄 To create
```

---

## ⏱️ ESTIMATED TIMELINE

| Week | Tasks | Deliverables |
|------|-------|--------------|
| 1 | CRM integration complete | Projects, Tasks, Invoices hoạt động |
| 2 | Construction + Contracts | Progress tracking, Quote system |
| 3 | QC/QA + Shopping | Inspections, Products catalog |
| 4 | Communication | Messages, Video call ready |
| 5 | Testing + Polish | Full integration test |

---

## 📌 NOTES

1. **Mock Fallback**: Luôn giữ mock data khi API fail
2. **Error Handling**: Sử dụng try-catch, hiển thị user-friendly messages
3. **Loading States**: Skeleton UI cho UX tốt hơn
4. **Caching**: Sử dụng CacheManager từ apiIntegration.ts
5. **Offline Support**: Store critical data trong AsyncStorage

---

*Last updated: 2026-01-03*
