# Kiến trúc tích hợp Strapi CMS

## 📊 Tổng quan hệ thống

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CONSTRUCTION MANAGER APP                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌───────────────────────────────────┐
│   MOBILE APP         │         │    ADMIN WEB DASHBOARD            │
│   (React Native)     │         │    (Next.js)                      │
│                      │         │    http://localhost:3000          │
│  - Browse products   │         │    - User management              │
│  - Create orders     │         │    - Product list                 │
│  - Track projects    │         │    - Analytics                    │
└──────────┬───────────┘         └───────────┬───────────────────────┘
           │                                 │
           │ REST API                        │ REST API
           │ GET/POST/PUT/DELETE             │ GET/POST/PUT/DELETE
           ▼                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                    BACKEND NESTJS API                              │
│            https://baotienweb.cloud/api/v1                         │
│                                                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │   Products     │  │   Projects     │  │  Strapi Sync     │   │
│  │   Service      │  │   Service      │  │  Controller      │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬─────────┘   │
│           │                   │                    │              │
│           ▼                   ▼                    ▼              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL Database                         │    │
│  │  Tables: products, projects, users, orders...           │    │
│  │  + strapiId column (unique) để track Strapi records     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              Strapi Service                              │    │
│  │  syncToStrapi('products', data) → Push to Strapi        │    │
│  └──────────────────────────────────────────────────────────┘    │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                        │ HTTP POST
                        │ /api/sync/import
                        │ Authorization: Bearer <token>
                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                    STRAPI CMS                                      │
│               http://localhost:1337                                │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              ADMIN PANEL                                    │   │
│  │         http://localhost:1337/admin                        │   │
│  │                                                             │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  │   │
│  │  │ Content       │  │ Media         │  │ Settings     │  │   │
│  │  │ Manager       │  │ Library       │  │              │  │   │
│  │  ├───────────────┤  ├───────────────┤  ├──────────────┤  │   │
│  │  │• Products     │  │• Upload       │  │• API Tokens  │  │   │
│  │  │• Projects     │  │• Images       │  │• Webhooks    │  │   │
│  │  │• Categories   │  │• Optimize     │  │• Permissions │  │   │
│  │  └───────────────┘  └───────────────┘  └──────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │         LIFECYCLE HOOKS (Auto-sync)                        │   │
│  │                                                             │   │
│  │  afterCreate(product) → syncToBackend()                   │   │
│  │  afterUpdate(product) → syncToBackend()                   │   │
│  │  afterDelete(product) → syncToBackend()                   │   │
│  │                                                             │   │
│  │  POST https://baotienweb.cloud/api/v1/strapi-sync/products│  │
│  │  Body: { operation: 'create', data: {...} }               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              SQLite Database (.tmp/data.db)                │   │
│  │  Tables: products, projects, upload_files...              │   │
│  │  + strapiId field để track Backend IDs                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘

                        ▲
                        │ HTTP POST
                        │ /api/v1/strapi-sync/products
                        │ Authorization: Bearer <token>
                        └─────────────────────┘
                     (Lifecycle hooks)
```

---

## 🔄 Data Flow Scenarios

### Scenario 1: User tạo Product từ Mobile App

```
1. User nhập thông tin sản phẩm trong Mobile App
   ↓
2. App gọi: POST https://baotienweb.cloud/api/v1/products
   Body: { name: "Xi măng", price: 95000, stock: 100 }
   ↓
3. Backend NestJS ProductsService:
   - Lưu vào PostgreSQL database
   - Tạo record với id = UUID mới
   ↓
4. Backend gọi StrapiService.syncToStrapi('products', product)
   ↓
5. Strapi nhận qua POST /api/sync/import
   - Kiểm tra strapiId có tồn tại không
   - Nếu không: tạo mới trong SQLite
   - Nếu có: update existing record
   ↓
6. ✅ Product đã có ở cả 2 systems:
   - PostgreSQL (Backend) - id = backend-uuid
   - SQLite (Strapi) - strapiId = backend-uuid
   ↓
7. Admin có thể vào Strapi panel để edit product này!
```

### Scenario 2: Editor tạo Product từ Strapi Admin

```
1. Editor login Strapi admin panel
   ↓
2. Content Manager → Products → Create new entry
   Nhập: name, price, stock, upload image
   ↓
3. Click "Save" → "Publish"
   ↓
4. Strapi lifecycle hook afterCreate() triggers
   ↓
5. backendSync.syncToBackend('products', 'create', data)
   POST https://baotienweb.cloud/api/v1/strapi-sync/products
   Headers: Authorization: Bearer strapi-sync-token
   Body: {
     operation: "create",
     data: {
       strapiId: "strapi-doc-id-123",
       name: "Xi măng",
       price: 95000,
       stock: 100,
       image: "http://localhost:1337/uploads/xi-mang.jpg"
     }
   }
   ↓
6. Backend StrapiSyncController nhận:
   - Verify token
   - Check product với strapiId này đã tồn tại chưa
   - Nếu chưa: ProductsService.create() với strapiId field
   - Nếu rồi: ProductsService.update()
   ↓
7. ✅ Product đã có ở cả 2 systems:
   - SQLite (Strapi) - documentId = strapi-doc-id-123
   - PostgreSQL (Backend) - strapiId = strapi-doc-id-123
   ↓
8. Mobile App fetch từ Backend API → user thấy product mới!
```

### Scenario 3: Editor update Product trong Strapi

```
1. Editor vào Strapi, edit product "Xi măng"
   Đổi price: 95000 → 105000
   ↓
2. Click "Save"
   ↓
3. Lifecycle hook afterUpdate() triggers
   ↓
4. syncToBackend('products', 'update', updatedData)
   ↓
5. Backend tìm product theo strapiId, update price
   ↓
6. ✅ Price updated ở cả 2 systems
   ↓
7. Mobile App fetch lại → user thấy giá mới
```

### Scenario 4: Admin xóa Product từ Backend API

```
1. Admin gọi: DELETE /api/v1/products/:id
   ↓
2. Backend ProductsService.remove(id)
   - Lấy product từ database (có strapiId)
   - Xóa khỏi PostgreSQL
   ↓
3. StrapiService.syncToStrapi('products', { 
     id, 
     strapiId, 
     _deleted: true 
   })
   ↓
4. Strapi nhận, tìm product theo strapiId, xóa khỏi SQLite
   ↓
5. ✅ Product đã xóa ở cả 2 systems
```

---

## 🔐 Authentication & Authorization Flow

```
┌──────────────────────────┐
│   STRAPI ADMIN PANEL     │
│                          │
│  Login với:              │
│  - Email/Password        │
│  - Role-based access     │
│  - API Tokens            │
└────────┬─────────────────┘
         │
         │ JWT Token
         ▼
┌──────────────────────────────────────┐
│  STRAPI API ENDPOINTS                │
│                                      │
│  Protected với JWT:                  │
│  - GET /api/products                 │
│  - POST /api/products                │
│  - PUT /api/products/:id             │
│  - DELETE /api/products/:id          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  BACKEND SYNC ENDPOINTS              │
│                                      │
│  Protected với custom token:         │
│  - POST /api/sync/import             │
│    Header: Authorization: Bearer <STRAPI_SYNC_TOKEN>
│                                      │
│  - POST /api/v1/strapi-sync/products │
│    Header: Authorization: Bearer <BACKEND_API_TOKEN>
└──────────────────────────────────────┘

┌──────────────────────────┐
│   MOBILE APP / WEB       │
│                          │
│  Login với:              │
│  - Email/Password        │
│  - JWT from Backend      │
└────────┬─────────────────┘
         │
         │ JWT Token
         ▼
┌──────────────────────────────────────┐
│  BACKEND API ENDPOINTS               │
│                                      │
│  Protected với JWT:                  │
│  - GET /api/v1/products              │
│  - POST /api/v1/products             │
│  - POST /api/v1/orders               │
└──────────────────────────────────────┘
```

---

## 📦 Database Schema Sync

### PostgreSQL (Backend)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  strapi_id VARCHAR(255) UNIQUE,  -- ← Để track Strapi record
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_strapi_id ON products(strapi_id);
```

### SQLite (Strapi)

```sql
-- Tự động tạo bởi Strapi Content-Type Builder
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT UNIQUE NOT NULL,  -- Strapi v5 document ID
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'active',
  strapi_id TEXT,  -- ← Để track Backend record
  created_at DATETIME,
  updated_at DATETIME,
  published_at DATETIME,
  locale TEXT
);

-- Media relation
CREATE TABLE products_image_lnk (
  id INTEGER PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  file_id INTEGER REFERENCES upload_files(id)
);
```

---

## 🔧 Configuration Files

### Strapi `.env`

```env
# Server
HOST=0.0.0.0
PORT=1337

# Backend Sync
BACKEND_URL=https://baotienweb.cloud/api/v1
BACKEND_API_TOKEN=your-secret-token-must-match-backend

# Database (SQLite for dev, PostgreSQL for production)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

### Backend `.env`

```env
# Strapi Sync
STRAPI_URL=http://localhost:1337
STRAPI_SYNC_TOKEN=your-secret-token-must-match-strapi

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/construction_db
```

---

## 📊 Monitoring & Logging

### Strapi Logs

```bash
cd strapi-cms
npm run develop

# Output:
[Product] afterCreate doc-id-123
[Strapi → Backend] Syncing products - create
[Strapi → Backend] ✅ Synced products successfully
```

### Backend Logs

```bash
cd BE-baotienweb.cloud
npm run start:dev

# Output:
[StrapiSyncController] Syncing product: create - doc-id-123
[ProductsService] Created new product: uuid-456
[StrapiService] [Backend → Strapi] Syncing products...
[StrapiService] [Backend → Strapi] ✅ Synced successfully
```

---

## 🚀 Deployment Architecture

```
┌────────────────────────────────────────────────────────┐
│                  VPS: baotienweb.cloud                 │
│                  IP: 103.200.20.100                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Nginx Reverse Proxy                 │ │
│  │                                                  │ │
│  │  cms.baotienweb.cloud:443 → localhost:1337     │ │
│  │  api.baotienweb.cloud:443 → localhost:3000     │ │
│  │  admin.baotienweb.cloud:443 → localhost:3001   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │   Strapi    │  │  Backend    │  │  Admin Web   │  │
│  │   (PM2)     │  │  (PM2)      │  │  (PM2)       │  │
│  │   :1337     │  │  :3000      │  │  :3001       │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │          PostgreSQL Database                   │   │
│  │          :5432                                 │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘

External Access:
- https://cms.baotienweb.cloud/admin → Strapi Admin (Editors)
- https://api.baotienweb.cloud/api/v1 → Backend API (Mobile App)
- https://admin.baotienweb.cloud → Admin Web (Admins)
```

---

## ✅ Benefits of This Architecture

1. **✨ Separation of Concerns**
   - Strapi: Content management (non-technical users)
   - Backend: Business logic & APIs (developers)
   - Mobile App: Consumer interface (end users)

2. **🔄 Data Consistency**
   - 2-way sync ensures data always up-to-date
   - No manual database access needed
   - Single source of truth via sync mechanism

3. **👥 Team Productivity**
   - Content editors work independently
   - Developers focus on features
   - No deployment needed for content changes

4. **🚀 Scalability**
   - Strapi handles admin traffic
   - Backend optimized for API requests
   - Can scale each component independently

5. **🔒 Security**
   - Strapi admin protected by separate auth
   - Backend APIs use JWT
   - Sync endpoints use custom tokens
   - Role-based access control

6. **📱 Multi-platform Ready**
   - Mobile app (React Native)
   - Admin web (Next.js)
   - Future: Public website, PWA, etc.

---

Tài liệu này mô tả kiến trúc tổng thể của hệ thống Construction Manager với Strapi CMS tích hợp!
