# 🚀 HƯỚNG DẪN NHANH - Strapi + Backend Sync

## ✅ Đã hoàn thành

1. ✅ **Strapi CMS đã cài đặt** - 1445 packages
2. ✅ **Content Types:** Products, Projects với đầy đủ fields
3. ✅ **Lifecycle hooks** - Auto sync Strapi → Backend
4. ✅ **Sync service** - backendSync.js với axios client
5. ✅ **API endpoints** - /api/sync/import, /api/sync/batch-import
6. ✅ **Backend controllers** - StrapiSyncController, StrapiService
7. ✅ **Server đang chạy** - http://localhost:1337/admin

---

## 🎯 BƯỚC TIẾP THEO

### Bước 1: Tạo Admin Account (BẮT BUỘC)

1. Mở browser: **http://localhost:1337/admin**
2. Điền form đăng ký:
   - **Name:** Admin Bảo Tiên
   - **Email:** admin@baotienweb.cloud
   - **Password:** Admin@Strapi123!
   - **Confirm Password:** Admin@Strapi123!
3. Click **Create Admin**

### Bước 2: Tạo Product đầu tiên trong Strapi

1. Sau khi login, click **Content Manager** (menu bên trái)
2. Click **Product** → **Create new entry**
3. Nhập:
   - Name: `Xi măng PCB40`
   - Description: `Xi măng Portland composite chất lượng cao`
   - Price: `95000`
   - Stock: `100`
   - Category: `Vật liệu xây dựng`
   - Status: `active`
4. Click **Save** → **Publish**

✅ **Kết quả:** Product sẽ tự động sync sang Backend qua lifecycle hook!

### Bước 3: Setup Backend để nhận webhook

#### A. Thêm environment variables

File: `BE-baotienweb.cloud/.env`

```env
# Strapi Sync
STRAPI_URL=http://localhost:1337
STRAPI_SYNC_TOKEN=strapi-sync-token-secret-change-this
```

#### B. Import StrapiSyncModule

File: `BE-baotienweb.cloud/src/app.module.ts`

```typescript
import { StrapiSyncModule } from './strapi-sync/strapi-sync.module';

@Module({
  imports: [
    // ... các module khác
    StrapiSyncModule, // ← Thêm dòng này
  ],
})
export class AppModule {}
```

#### C. Thêm strapiId column vào Product entity

File: `BE-baotienweb.cloud/src/products/entities/product.entity.ts`

```typescript
@Entity('products')
export class Product {
  // ... các columns hiện có

  @Column({ nullable: true, unique: true })
  strapiId: string; // ← Thêm field này
}
```

#### D. Inject StrapiService vào ProductsService

File: `BE-baotienweb.cloud/src/products/products.service.ts`

```typescript
import { StrapiService } from '../strapi-sync/strapi.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private strapiService: StrapiService, // ← Inject
  ) {}

  async findByStrapiId(strapiId: string): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { strapiId } });
  }

  async create(dto: any): Promise<Product> {
    const product = this.productsRepository.create(dto);
    const saved = await this.productsRepository.save(product);
    
    // Sync sang Strapi
    this.strapiService.syncToStrapi('products', saved);
    
    return saved;
  }
}
```

#### E. Chạy backend

```bash
cd BE-baotienweb.cloud
npm run start:dev
```

---

## 🧪 TEST ĐỒNG BỘ

### Test 1: Strapi → Backend

**Đã làm ở Bước 2 trên!** Kiểm tra logs backend:

```
[StrapiSyncController] Syncing product: create - <strapi-id>
✅ Created new product: <backend-id>
```

### Test 2: Backend → Strapi

```bash
# Gọi API backend để tạo product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Thép D10 Hòa Phát",
    "price": 25000,
    "stock": 200,
    "category": "Vật liệu"
  }'
```

Sau đó vào Strapi admin → Content Manager → Products → Verify product mới xuất hiện!

---

## 📋 ENDPOINTS

### Strapi APIs (cho Backend gọi)

```
POST http://localhost:1337/api/sync/import
Authorization: Bearer strapi-sync-token-secret-change-this
Body: {
  "contentType": "products",
  "data": { "id": "...", "name": "...", ... }
}
```

### Backend APIs (cho Strapi gọi)

```
POST https://baotienweb.cloud/api/v1/strapi-sync/products
Authorization: Bearer strapi-sync-token-secret-change-this
Body: {
  "operation": "create|update|delete",
  "data": { "strapiId": "...", "name": "...", ... }
}
```

---

## 🎨 Strapi Admin Panel Features

Sau khi login vào http://localhost:1337/admin:

### 1. Content Manager
- **Products:** Quản lý sản phẩm (tạo, sửa, xóa, publish)
- **Projects:** Quản lý dự án xây dựng
- Drag-and-drop reorder
- Bulk actions (delete, publish nhiều items)
- Filters & search

### 2. Media Library
- Upload hình ảnh sản phẩm
- Auto-resize & optimize
- Folders để organize
- CDN ready

### 3. Content-Type Builder
- Tạo thêm models mới (Categories, Users, Orders...)
- Thêm fields vào models hiện tại
- Relations (1-1, 1-N, N-N)

### 4. Settings
- **API Tokens:** Tạo token cho external integrations
- **Webhooks:** Config webhook URLs
- **Roles & Permissions:** Quản lý quyền truy cập
- **Internationalization:** Multi-language content

---

## 🔄 WORKFLOW THỰC TẾ

### Scenario: Editor muốn thêm sản phẩm mới

1. **Editor** login vào Strapi admin (http://localhost:1337/admin)
2. Vào **Content Manager** → **Product** → **Create**
3. Nhập thông tin sản phẩm, upload hình
4. Click **Save** → **Publish**
5. **Lifecycle hook** tự động gọi Backend API
6. **Backend** lưu vào PostgreSQL database
7. **Mobile App** fetch từ Backend API → hiển thị sản phẩm mới
8. ✅ Editor không cần biết code, Developer không cần deploy!

### Scenario: User tạo order từ Mobile App

1. **User** chọn sản phẩm, tạo order trong app
2. **Mobile App** → POST `/api/v1/orders` → Backend
3. **Backend** lưu order vào database
4. **Backend** gọi `strapiService.syncToStrapi('orders', order)`
5. **Strapi** nhận và lưu
6. **Admin** vào Strapi panel → xem orders realtime
7. ✅ Admin có dashboard để monitor không cần query database!

---

## 🔒 BẢO MẬT

### ⚠️ QUAN TRỌNG: Đổi token trước khi deploy

**File 1:** `strapi-cms/.env`
```env
BACKEND_API_TOKEN=your-super-secret-token-change-this-now
```

**File 2:** `BE-baotienweb.cloud/.env`
```env
STRAPI_SYNC_TOKEN=your-super-secret-token-change-this-now
```

**2 tokens phải giống nhau!**

### Generate secure token:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

## 📁 CẤU TRÚC FILES ĐÃ TẠO

```
strapi-cms/
├── src/
│   ├── api/
│   │   ├── product/
│   │   │   └── content-types/
│   │   │       └── product/
│   │   │           ├── schema.json         ✅ Product model
│   │   │           └── lifecycles.js       ✅ Auto-sync hooks
│   │   ├── project/
│   │   │   └── content-types/
│   │   │       └── project/
│   │   │           ├── schema.json         ✅ Project model
│   │   │           └── lifecycles.js       ✅ Auto-sync hooks
│   │   └── sync/
│   │       ├── controllers/sync.js         ✅ Import endpoint
│   │       └── routes/sync.js              ✅ Routes
│   └── services/
│       └── backendSync.js                  ✅ Axios client
├── config/
│   └── server.js                           ✅ Server config
├── .env                                    ✅ Environment vars
└── SYNC-GUIDE.md                           ✅ Documentation

BE-baotienweb.cloud/
└── src/
    └── strapi-sync/
        ├── strapi-sync.controller.ts       ✅ Webhook receiver
        ├── strapi.service.ts               ✅ Push to Strapi
        ├── strapi-sync.module.ts           ✅ NestJS module
        └── STRAPI-INTEGRATION.md           ✅ Backend guide
```

---

## 🚀 DEPLOY LÊN VPS

### Deploy Strapi

```bash
# SSH vào VPS
ssh root@baotienweb.cloud

# Copy code
rsync -avz strapi-cms/ root@baotienweb.cloud:/var/www/strapi-cms/

# Install & build
cd /var/www/strapi-cms
npm ci --only=production
npm run build

# Chạy với PM2
pm2 start npm --name "strapi-cms" -- run start
pm2 save

# Nginx config
server {
    listen 80;
    server_name cms.baotienweb.cloud;
    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# SSL
certbot --nginx -d cms.baotienweb.cloud
```

Sau deploy, Strapi sẽ ở: **https://cms.baotienweb.cloud/admin**

---

## 📞 HỖ TRỢ

### Check logs:

```bash
# Strapi logs
cd strapi-cms
npm run develop
# Xem terminal output

# Backend logs
cd BE-baotienweb.cloud
npm run start:dev
# Xem [StrapiSyncController] và [StrapiService] logs

# PM2 logs (production)
pm2 logs strapi-cms
pm2 logs backend
```

### Common issues:

1. **401 Unauthorized** → Check token match
2. **Connection refused** → Đảm bảo cả 2 servers đang chạy
3. **Product không sync** → Check lifecycle hooks logs
4. **Duplicate strapiId** → Implement findByStrapiId logic

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có:

✅ **Strapi CMS** - Admin panel đẹp, dễ dùng  
✅ **Backend NestJS** - API mạnh mẽ, type-safe  
✅ **Đồng bộ 2 chiều** - Data luôn consistent  
✅ **Mobile App ready** - Consume backend APIs  
✅ **Editors empowered** - Manage content không cần dev  

**Next steps:**
1. Tạo admin account trong Strapi
2. Test tạo product → verify sync
3. Implement backend endpoints
4. Add thêm content types (Categories, Orders...)
5. Deploy lên VPS

Có câu hỏi? Hỏi tôi! 🚀
