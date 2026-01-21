# 🔄 CẬP NHẬT STRAPI CMS - SYNC VỚI BACKEND PRISMA

## ✅ Đã cập nhật (26/12/2025)

### 1. **Content Types đã chỉnh sửa theo Prisma Schema**

#### 📦 **Products** (`api::product.product`)
- ✅ **Enum category** phù hợp: `ELECTRONICS`, `FASHION`, `HOME`, `BEAUTY`, `SPORTS`, `BOOKS`, `TOYS`, `FOOD`, `OTHER`
- ✅ **Enum status** Prisma: `PENDING`, `APPROVED`, `REJECTED`
- ✅ **Fields mới:**
  - `rejectionReason` (text)
  - `viewCount` (integer, default 0)
  - `soldCount` (integer, default 0)
  - `isBestseller` (boolean, default false)
  - `isNew` (boolean, default true)
  - `reviewedAt` (datetime)
  - `images` (media, multiple) - thay vì `image` single
  - `backendId` (integer) - để track backend record
- ✅ **Đã xóa:** `image` (single) → đổi thành `images` (multiple)

#### 🏗️ **Projects** (`api::project.project`)
- ✅ **Field name đổi:** `name` → `title` (match Prisma)
- ✅ **Enum status** uppercase: `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED`, `CANCELLED`
- ✅ **Fields mới:**
  - `clientId` (integer) - foreign key to User
  - `engineerId` (integer) - foreign key to User
  - `images` (media, multiple)
  - `backendId` (integer)
- ✅ **Đã xóa:**
  - `client` (string) → đổi thành `clientId` (integer)
  - `location` (string) - backend không có field này
  - `progress` (integer) - backend không track progress trong Project model

#### 🛠️ **Services** (MỚI - `api::service.service`)
- ✅ **Enum category:** `DESIGN`, `CONSTRUCTION`, `FINISHING`, `CONSULTING`, `INSPECTION`, `MAINTENANCE`
- ✅ **Enum status:** `ACTIVE`, `INACTIVE`, `PENDING`, `REJECTED`
- ✅ **Fields đầy đủ:**
  - `name` (string, max 255, required)
  - `description` (text, required)
  - `category` (enum, required)
  - `price` (decimal, required, min 0)
  - `unit` (string, max 50, default "công trình")
  - `duration` (string, max 100) - VD: "2-3 tháng"
  - `features` (json, default []) - Các tính năng chính
  - `images` (media, multiple)
  - `status` (enum, default PENDING)
  - `viewCount`, `orderCount`, `rating`, `reviewCount`
  - `strapiId`, `backendId`
- ✅ **Lifecycle hooks:** sync với backend sau create/update/delete/publish

#### ✅ **Tasks** (MỚI - `api::task.task`)
- ✅ **Enum status:** `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `CANCELLED`
- ✅ **Enum priority:** `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- ✅ **Fields đầy đủ:**
  - `title` (string, required)
  - `description` (text)
  - `status` (enum, default TODO)
  - `priority` (enum, default MEDIUM)
  - `dueDate` (datetime)
  - `projectId` (integer, required) - foreign key
  - `assigneeId` (integer) - foreign key to User
  - `strapiId`, `backendId`
- ✅ **Lifecycle hooks:** sync với backend

---

## 🔧 Files đã cập nhật

### Content Type Schemas

```
strapi-cms/src/api/
├── product/content-types/product/
│   ├── schema.json                    ✅ Updated - match Prisma
│   └── lifecycles.js                  ✅ Already exists
├── project/content-types/project/
│   ├── schema.json                    ✅ Updated - match Prisma
│   └── lifecycles.js                  ✅ Already exists
├── service/content-types/service/     🆕 NEW
│   ├── schema.json                    ✅ Created
│   └── lifecycles.js                  ✅ Created
└── task/content-types/task/           🆕 NEW
    ├── schema.json                    ✅ Created
    └── lifecycles.js                  ✅ Created
```

### Sync Services

```
strapi-cms/src/
├── services/
│   └── backendSync.js                 ✅ Updated
│       ├── transformDataForBackend() → Added services, tasks
│       └── transformDataFromBackend() → Added services, tasks
└── api/sync/controllers/
    └── sync.js                        ✅ Updated
        └── Added services, tasks support in switch case
```

---

## 🎯 Mapping Backend Prisma ↔ Strapi

### Products

| Backend Prisma Field | Type | Strapi Field | Type | Notes |
|---------------------|------|--------------|------|-------|
| `id` | Int | `backendId` | integer | Backend primary key |
| `name` | String | `name` | string | ✅ Match |
| `description` | String | `description` | text | ✅ Match |
| `price` | Decimal(12,2) | `price` | decimal | ✅ Match |
| `category` | Enum | `category` | enumeration | ✅ Match (9 values) |
| `stock` | Int | `stock` | integer | ✅ Match |
| `status` | Enum | `status` | enumeration | ✅ Match (PENDING/APPROVED/REJECTED) |
| `rejectionReason` | String? | `rejectionReason` | text | ✅ Match |
| `viewCount` | Int | `viewCount` | integer | ✅ Match |
| `soldCount` | Int | `soldCount` | integer | ✅ Match |
| `isBestseller` | Boolean | `isBestseller` | boolean | ✅ Match |
| `isNew` | Boolean | `isNew` | boolean | ✅ Match |
| `reviewedAt` | DateTime? | `reviewedAt` | datetime | ✅ Match |
| `images` (relation) | ProductImage[] | `images` | media (multiple) | ⚠️ Simplified (Strapi media) |
| - | - | `strapiId` | string | Strapi documentId |

### Projects

| Backend Prisma Field | Type | Strapi Field | Type | Notes |
|---------------------|------|--------------|------|-------|
| `id` | Int | `backendId` | integer | Backend primary key |
| `title` | String | `title` | string | ✅ Match |
| `description` | String? | `description` | richtext | ✅ Match |
| `status` | Enum | `status` | enumeration | ✅ Match (5 values) |
| `budget` | Decimal? | `budget` | decimal | ✅ Match |
| `startDate` | DateTime? | `startDate` | date | ✅ Match |
| `endDate` | DateTime? | `endDate` | date | ✅ Match |
| `clientId` | Int? | `clientId` | integer | ✅ Match (foreign key) |
| `engineerId` | Int? | `engineerId` | integer | ✅ Match (foreign key) |
| `images` | String[] | `images` | media (multiple) | ✅ Match |

### Services

| Backend Prisma Field | Type | Strapi Field | Type | Notes |
|---------------------|------|--------------|------|-------|
| `id` | Int | `backendId` | integer | Backend primary key |
| `name` | VarChar(255) | `name` | string | ✅ Match |
| `description` | Text | `description` | text | ✅ Match |
| `category` | Enum | `category` | enumeration | ✅ Match (6 values) |
| `price` | Decimal(12,2) | `price` | decimal | ✅ Match |
| `unit` | VarChar(50) | `unit` | string | ✅ Match |
| `duration` | VarChar(100)? | `duration` | string | ✅ Match |
| `features` | String[] | `features` | json | ✅ Match |
| `images` | String[] | `images` | media (multiple) | ✅ Match |
| `status` | Enum | `status` | enumeration | ✅ Match (4 values) |
| `viewCount` | Int | `viewCount` | integer | ✅ Match |
| `orderCount` | Int | `orderCount` | integer | ✅ Match |
| `rating` | Decimal(3,2)? | `rating` | decimal | ✅ Match |
| `reviewCount` | Int | `reviewCount` | integer | ✅ Match |

### Tasks

| Backend Prisma Field | Type | Strapi Field | Type | Notes |
|---------------------|------|--------------|------|-------|
| `id` | Int | `backendId` | integer | Backend primary key |
| `title` | String | `title` | string | ✅ Match |
| `description` | String? | `description` | text | ✅ Match |
| `status` | Enum | `status` | enumeration | ✅ Match (5 values) |
| `priority` | Enum | `priority` | enumeration | ✅ Match (4 values) |
| `dueDate` | DateTime? | `dueDate` | datetime | ✅ Match |
| `projectId` | Int | `projectId` | integer | ✅ Match (foreign key) |
| `assigneeId` | Int? | `assigneeId` | integer | ✅ Match (foreign key) |

---

## 🚀 Test sau khi update

### 1. Restart Strapi

```bash
# Stop server (Ctrl+C hoặc)
Get-Process -Name node | Stop-Process -Force

# Xóa cache
cd strapi-cms
Remove-Item -Recurse -Force .cache, build

# Restart
npm run develop
```

### 2. Tạo test data cho mỗi content type

#### Products:
```json
{
  "name": "Xi măng PCB40 Hoàng Thạch",
  "description": "Xi măng Portland composite chất lượng cao",
  "price": 95000,
  "category": "OTHER",
  "stock": 500,
  "status": "APPROVED",
  "isBestseller": true,
  "isNew": false,
  "viewCount": 1250,
  "soldCount": 340
}
```

#### Projects:
```json
{
  "title": "Xây dựng nhà 3 tầng - Quận 7",
  "description": "Dự án xây dựng nhà phố 3 tầng diện tích 120m2",
  "status": "IN_PROGRESS",
  "budget": 850000000,
  "startDate": "2025-01-15",
  "endDate": "2025-06-30",
  "clientId": 1,
  "engineerId": 2
}
```

#### Services:
```json
{
  "name": "Thiết kế kiến trúc nhà phố",
  "description": "Thiết kế kiến trúc đầy đủ cho nhà phố từ 3-5 tầng",
  "category": "DESIGN",
  "price": 15000000,
  "unit": "công trình",
  "duration": "1-2 tháng",
  "features": ["Bản vẽ 3D", "Hồ sơ xin phép", "Tư vấn phong thủy"],
  "status": "ACTIVE",
  "rating": 4.8,
  "reviewCount": 28
}
```

#### Tasks:
```json
{
  "title": "Đổ móng nhà chính",
  "description": "Đào móng và đổ bê tông móng",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-02-10",
  "projectId": 1,
  "assigneeId": 3
}
```

### 3. Verify sync logs

```bash
# Strapi logs should show:
[Product] afterCreate <documentId>
[Strapi → Backend] Syncing products - create
[Strapi → Backend] ✅ Synced products successfully

# Backend logs should show:
[StrapiSyncController] Syncing product: create - <strapiId>
[ProductsService] Created new product: <id>
```

---

## ⚠️ Breaking Changes (Cần lưu ý)

### 1. Product images
- **Cũ:** `image` (single media)
- **Mới:** `images` (multiple media)
- **Action:** Nếu có data cũ, cần migrate `image` → `images[0]`

### 2. Project name → title
- **Cũ:** `name` field
- **Mới:** `title` field
- **Action:** Nếu có data cũ, rename field hoặc create migration

### 3. Project status values
- **Cũ:** `planning`, `in_progress` (lowercase with underscore)
- **Mới:** `PLANNING`, `IN_PROGRESS` (uppercase)
- **Action:** Transform values in sync logic (already handled in backendSync.js)

### 4. Product status values
- **Cũ:** `active`, `inactive`, `out_of_stock`
- **Mới:** `PENDING`, `APPROVED`, `REJECTED`
- **Action:** Completely different enum - cần re-review data logic

---

## 📝 Next Steps

### Immediate (Phải làm ngay)

1. ✅ **Restart Strapi** để load content types mới
2. ✅ **Test tạo data** cho 4 content types: Products, Projects, Services, Tasks
3. ✅ **Verify sync** logs xuất hiện đúng
4. ⚠️ **Update Backend** để có endpoints nhận sync từ Strapi:
   - `POST /api/v1/strapi-sync/services`
   - `POST /api/v1/strapi-sync/tasks`

### Backend cần implement

#### File: `BE-baotienweb.cloud/src/strapi-sync/strapi-sync.controller.ts`

Thêm methods:

```typescript
@Post('services')
async syncService(@Body() payload: SyncPayload, @Headers('authorization') auth: string) {
  // Tương tự syncProduct
}

@Post('tasks')
async syncTask(@Body() payload: SyncPayload, @Headers('authorization') auth: string) {
  // Tương tự syncProduct
}
```

#### Services cần method `findByStrapiId`:

```typescript
// services.service.ts
async findByStrapiId(strapiId: string): Promise<Service | null> {
  return this.prisma.service.findFirst({ where: { strapiId } });
}

// tasks.service.ts
async findByStrapiId(strapiId: string): Promise<Task | null> {
  return this.prisma.task.findFirst({ where: { strapiId } });
}
```

#### Prisma migrations cần:

```sql
-- Add strapiId column to services
ALTER TABLE "services" ADD COLUMN "strapiId" VARCHAR(255);
CREATE INDEX "idx_services_strapi_id" ON "services"("strapiId");

-- Add strapiId column to tasks
ALTER TABLE "tasks" ADD COLUMN "strapiId" VARCHAR(255);
CREATE INDEX "idx_tasks_strapi_id" ON "tasks"("strapiId");
```

---

## 🎉 Tổng kết

✅ **4 Content Types** hoàn chỉnh match với Prisma schema  
✅ **Lifecycle hooks** cho tất cả content types  
✅ **Transform functions** updated cho services + tasks  
✅ **Sync controller** hỗ trợ 4 content types  

**Bước tiếp theo:**
1. Restart Strapi
2. Test 4 content types
3. Update Backend endpoints
4. Run Prisma migrations
5. Test đồng bộ 2 chiều đầy đủ

Có câu hỏi về bất kỳ phần nào, hỏi tôi! 🚀
