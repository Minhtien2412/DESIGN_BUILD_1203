# 📋 KẾ HOẠCH HOÀN THIỆN DỮ LIỆU BE & FE

> **Ngày tạo:** 21/01/2026  
> **Trạng thái:** Đang tiến hành  
> **Server:** https://baotienweb.cloud

---

## ✅ ĐÃ HOÀN THÀNH HÔM NAY (21/01/2026)

### 1. ConstructionMapModule ✅

- **16 endpoints mới:**
  - `GET /api/v1/construction-map/health`
  - `GET /api/v1/construction-map/:projectId`
  - `GET /api/v1/construction-map/:projectId/progress`
  - `GET /api/v1/construction-map/:projectId/tasks`
  - `GET /api/v1/construction-map/tasks/:id`
  - `POST /api/v1/construction-map/tasks`
  - `PUT /api/v1/construction-map/tasks/:id`
  - `PATCH /api/v1/construction-map/tasks/:id/position`
  - `PATCH /api/v1/construction-map/tasks/:id/status`
  - `PATCH /api/v1/construction-map/tasks/:id/progress`
  - `DELETE /api/v1/construction-map/tasks/:id`
  - `GET /api/v1/construction-map/:projectId/stages`
  - `GET /api/v1/construction-map/stages/:id`
  - `GET /api/v1/construction-map/stages/:id/tasks`
  - `POST /api/v1/construction-map/stages`
  - `PUT /api/v1/construction-map/stages/:id`
  - `DELETE /api/v1/construction-map/stages/:id`
  - `GET /api/v1/construction-map/:projectId/state`
  - `PUT /api/v1/construction-map/:projectId/state`

### 2. LaborModule ✅

- **11 endpoints mới:**
  - `GET /api/v1/labor-providers`
  - `GET /api/v1/labor-providers/nearby`
  - `GET /api/v1/labor-providers/:id`
  - `POST /api/v1/labor-providers`
  - `PUT /api/v1/labor-providers/:id`
  - `DELETE /api/v1/labor-providers/:id`
  - `GET /api/v1/labor-providers/:id/reviews`
  - `POST /api/v1/labor-providers/:id/reviews`
  - `POST /api/v1/labor-providers/:id/bookings`
  - `GET /api/v1/labor-providers/bookings/my`
  - `GET /api/v1/labor-providers/bookings/:id`
  - `PUT /api/v1/labor-providers/bookings/:id`

### Build Status: ✅ PASSED

---

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ Backend Server (158 endpoints đang hoạt động)

| Module             | Endpoints | Trạng thái |
| ------------------ | --------- | ---------- |
| Health             | 3         | ✅ OK      |
| Auth               | 12        | ✅ OK      |
| Users              | 2         | ✅ OK      |
| Profile            | 2         | ✅ OK      |
| Projects           | 6         | ✅ OK      |
| Tasks              | 3         | ✅ OK      |
| Comments           | 2         | ✅ OK      |
| Chat               | 4         | ✅ OK      |
| Messages           | 6         | ✅ OK      |
| Call               | 8         | ✅ OK      |
| Video              | 5         | ✅ OK      |
| Notifications      | 5         | ✅ OK      |
| AI                 | 16        | ✅ OK      |
| Reels              | 11        | ✅ OK      |
| LiveStream         | 10        | ✅ OK      |
| Products           | 3         | ✅ OK      |
| Services           | 4         | ✅ OK      |
| Fleet              | 12        | ✅ OK      |
| Contract           | 19        | ✅ OK      |
| QC                 | 15        | ✅ OK      |
| Timeline           | 11        | ✅ OK      |
| Dashboard          | 4         | ✅ OK      |
| Upload             | 6         | ✅ OK      |
| Payment            | 7         | ✅ OK      |
| Zalo               | 15        | ✅ OK      |
| Utilities          | 4         | ✅ OK      |
| Strapi Sync        | 5         | ✅ OK      |
| Video Interactions | 14        | ✅ OK      |

---

## ❌ ENDPOINTS FE CẦN MÀ BE CHƯA CÓ

### 🔴 **Ưu tiên CAO** (Core Features)

#### 1. Construction Map Module

```
GET    /api/v1/construction-map/{projectId}
GET    /api/v1/construction-map/{projectId}/progress
GET    /api/v1/construction-map/{projectId}/tasks
GET    /api/v1/construction-map/tasks/{id}
POST   /api/v1/construction-map/tasks
PUT    /api/v1/construction-map/tasks/{id}
PATCH  /api/v1/construction-map/tasks/{id}/position
PATCH  /api/v1/construction-map/tasks/{id}/status
PATCH  /api/v1/construction-map/tasks/{id}/progress
GET    /api/v1/construction-map/{projectId}/stages
GET    /api/v1/construction-map/stages/{id}
POST   /api/v1/construction-map/stages
PUT    /api/v1/construction-map/stages/{id}
GET    /api/v1/construction-map/{projectId}/state
PUT    /api/v1/construction-map/{projectId}/state
GET    /api/v1/construction-map/health
```

#### 2. Labor/Worker Module

```
GET    /api/v1/labor-providers
GET    /api/v1/labor-providers/{id}
GET    /api/v1/labor-providers/{id}/reviews
POST   /api/v1/labor-providers
PUT    /api/v1/labor-providers/{id}
DELETE /api/v1/labor-providers/{id}
POST   /api/v1/labor-providers/{id}/reviews
POST   /api/v1/labor-providers/{id}/bookings
GET    /api/v1/labor-providers/nearby
```

#### 3. As-Built Module

```
GET    /api/v1/as-built/drawings
POST   /api/v1/as-built/export/drawing
POST   /api/v1/as-built/export/package
POST   /api/v1/as-built/export/register
GET    /api/v1/as-built/packages
```

### 🟡 **Ưu tiên TRUNG BÌNH**

#### 4. Analytics Module

```
GET    /api/v1/analytics/dashboard
POST   /api/v1/analytics/events
POST   /api/v1/analytics/query
GET    /api/v1/analytics/compare
POST   /api/v1/analytics/export
GET    /api/v1/analytics/templates
GET    /api/v1/analytics/user-flow
```

#### 5. Safety Module

```
GET    /api/v1/safety/audits
POST   /api/v1/safety/audits
GET    /api/v1/safety/incidents
POST   /api/v1/safety/incidents
GET    /api/v1/safety/ppe
POST   /api/v1/safety/ppe/distribute
GET    /api/v1/safety/training/programs
GET    /api/v1/safety/training/sessions
GET    /api/v1/safety/training/certifications
```

#### 6. Environmental Module

```
GET    /api/v1/environmental/emissions
POST   /api/v1/environmental/emissions/calculate
GET    /api/v1/environmental/monitoring
GET    /api/v1/environmental/waste
GET    /api/v1/environmental/permits
GET    /api/v1/environmental/incidents
POST   /api/v1/environmental/export/{type}
```

#### 7. Document Control Module

```
GET    /api/v1/document-control/documents
POST   /api/v1/document-control/documents
GET    /api/v1/document-control/transmittals
POST   /api/v1/document-control/transmittals
POST   /api/v1/document-control/export/{type}
```

### 🟢 **Ưu tiên THẤP**

#### 8. Quality Module (mở rộng)

```
GET    /api/v1/quality/defects
GET    /api/v1/quality/tests
GET    /api/v1/quality/ncrs
POST   /api/v1/quality/export/{type}
```

#### 9. Procurement Module

```
GET    /api/v1/procurement
POST   /api/v1/procurement
GET    /api/v1/procurement/{id}
PUT    /api/v1/procurement/{id}
```

#### 10. Resource Management

```
GET    /api/v1/resource-allocations
POST   /api/v1/resource-allocations
GET    /api/v1/resource-pools
GET    /api/v1/resource-levelings
```

#### 11. O&M Manuals Module

```
GET    /api/v1/om-manuals/packages
POST   /api/v1/om-manuals/packages
GET    /api/v1/om-manuals/training
```

---

## 🎯 KẾ HOẠCH TRIỂN KHAI

### Phase 1: Core APIs (Tuần 1)

**Mục tiêu:** Hoàn thành 3 module ưu tiên cao

| Ngày  | Task                      | Module           |
| ----- | ------------------------- | ---------------- |
| 21/01 | Tạo ConstructionMapModule | Construction Map |
| 22/01 | Tạo LaborProviderModule   | Labor            |
| 23/01 | Tạo AsBuiltModule         | As-Built         |
| 24/01 | Test & Fix bugs           | All Phase 1      |

### Phase 2: Analytics & Safety (Tuần 2)

| Ngày  | Task                    | Module        |
| ----- | ----------------------- | ------------- |
| 25/01 | Tạo AnalyticsModule     | Analytics     |
| 26/01 | Tạo SafetyModule        | Safety        |
| 27/01 | Tạo EnvironmentalModule | Environmental |
| 28/01 | Test & Fix bugs         | All Phase 2   |

### Phase 3: Documentation & Quality (Tuần 3)

| Ngày  | Task                      | Module           |
| ----- | ------------------------- | ---------------- |
| 29/01 | Tạo DocumentControlModule | Document Control |
| 30/01 | Mở rộng QualityModule     | Quality          |
| 31/01 | Tạo ProcurementModule     | Procurement      |
| 01/02 | Test & Fix bugs           | All Phase 3      |

### Phase 4: Resource & O&M (Tuần 4)

| Ngày  | Task                | Module    |
| ----- | ------------------- | --------- |
| 02/02 | Tạo ResourceModule  | Resources |
| 03/02 | Tạo OMManualModule  | O&M       |
| 04/02 | Integration Testing | All       |
| 05/02 | Deploy Production   | All       |

---

## 📝 CHI TIẾT TỪNG MODULE CẦN TẠO

### 1. ConstructionMapModule

```typescript
// src/construction-map/construction-map.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([
    ConstructionTask,
    ConstructionStage,
    ConstructionState
  ])],
  controllers: [ConstructionMapController],
  providers: [ConstructionMapService],
})

// Entities cần tạo:
- construction-task.entity.ts
- construction-stage.entity.ts
- construction-state.entity.ts

// DTOs cần tạo:
- create-task.dto.ts
- update-task.dto.ts
- create-stage.dto.ts
```

### 2. LaborProviderModule

```typescript
// src/labor/labor.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([
    LaborProvider,
    LaborReview,
    LaborBooking
  ])],
  controllers: [LaborController],
  providers: [LaborService],
})

// Entities cần tạo:
- labor-provider.entity.ts
- labor-review.entity.ts
- labor-booking.entity.ts
```

### 3. AsBuiltModule

```typescript
// src/as-built/as-built.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([
    AsBuiltDrawing,
    AsBuiltPackage
  ])],
  controllers: [AsBuiltController],
  providers: [AsBuiltService],
})
```

---

## 🔧 CÔNG VIỆC CẦN LÀM NGAY

### Bước 1: Tạo ConstructionMapModule (Hôm nay)

```bash
# Trên server VPS
cd /var/www/baotienweb-api
nest g module construction-map
nest g controller construction-map
nest g service construction-map
```

### Bước 2: Kiểm tra Database Schema

```sql
-- Các bảng cần tạo trong MySQL
CREATE TABLE construction_tasks (...);
CREATE TABLE construction_stages (...);
CREATE TABLE labor_providers (...);
CREATE TABLE as_built_drawings (...);
```

### Bước 3: Cập nhật Frontend Service

```typescript
// services/api/constructionMapApi.ts - Đã có, chỉ cần verify
// services/api/labor.service.ts - Đã có, chỉ cần verify
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] **Phase 1: Core APIs**
  - [ ] ConstructionMapModule
  - [ ] LaborProviderModule
  - [ ] AsBuiltModule
  - [ ] All tests pass

- [ ] **Phase 2: Analytics & Safety**
  - [ ] AnalyticsModule
  - [ ] SafetyModule
  - [ ] EnvironmentalModule
  - [ ] All tests pass

- [ ] **Phase 3: Documentation**
  - [ ] DocumentControlModule
  - [ ] Extended QualityModule
  - [ ] ProcurementModule
  - [ ] All tests pass

- [ ] **Phase 4: Resources**
  - [ ] ResourceModule
  - [ ] OMManualModule
  - [ ] Full Integration Testing
  - [ ] Production Deploy

---

## 📈 METRICS THEO DÕI

| Metric            | Hiện tại | Mục tiêu |
| ----------------- | -------- | -------- |
| BE Endpoints      | 158      | 250+     |
| FE-BE Match Rate  | ~65%     | 95%+     |
| API Test Coverage | 268/268  | All Pass |
| Build Success     | ✅       | ✅       |
| Server Uptime     | 995s+    | 99.9%    |

---

## 🚀 NEXT STEPS

1. **Ngay bây giờ:** Bắt đầu tạo ConstructionMapModule
2. **Hôm nay:** Hoàn thành entity và controller
3. **Ngày mai:** Tạo LaborProviderModule
4. **Cuối tuần:** Test integration với FE

---

_Cập nhật lần cuối: 21/01/2026 14:00_
