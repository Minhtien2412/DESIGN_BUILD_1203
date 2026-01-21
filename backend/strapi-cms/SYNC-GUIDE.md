# Strapi CMS - Đồng bộ với Backend NestJS

## 🎯 Tổng quan

Strapi CMS được tích hợp **đồng bộ 2 chiều** với Backend NestJS tại `https://baotienweb.cloud/api/v1`:

```
┌─────────────────┐         ┌──────────────────┐
│  Strapi CMS     │◄───────►│ Backend NestJS   │
│  localhost:1337 │  Sync   │ baotienweb.cloud │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         ▼                           ▼
    Editors/Admins           Mobile App + Admin Web
    (Manage content)         (Consume APIs)
```

## ⚡ Cơ chế đồng bộ

### 1️⃣ **Strapi → Backend** (Auto-sync với Lifecycle Hooks)

Khi bạn tạo/sửa/xóa trong Strapi admin panel:

```javascript
// Tự động gọi qua lifecycle hooks
Create Product trong Strapi
  ↓
afterCreate hook
  ↓
syncToBackend('products', 'create', data)
  ↓
POST https://baotienweb.cloud/api/v1/strapi-sync/products
  ↓
Backend nhận và lưu vào database
```

### 2️⃣ **Backend → Strapi** (Webhook hoặc Manual API call)

Khi mobile app/admin web tạo data qua backend:

```javascript
// Backend gọi Strapi API sau khi lưu
POST http://localhost:1337/api/sync/import
Headers: Authorization: Bearer strapi-sync-token-secret-change-this
Body: {
  "contentType": "products",
  "data": {
    "id": "backend-id-123",
    "name": "Xi măng PCB40",
    "price": 95000,
    "stock": 100
  }
}
```

## 🚀 Cài đặt & Chạy

### 1. Khởi động Strapi

```bash
cd strapi-cms
npm run develop
```

Server sẽ chạy tại: **http://localhost:1337/admin**

### 2. Tạo Admin Account

Lần đầu chạy, bạn sẽ thấy màn hình đăng ký admin:
- Email: admin@baotienweb.cloud
- Password: Admin@Strapi123!
- Confirm password: Admin@Strapi123!

### 3. Content Types có sẵn

✅ **Products** (`api::product.product`)
- name (string)
- description (text)
- price (decimal)
- stock (integer)
- category (string)
- image (media)
- status (enum: active/inactive/out_of_stock)
- strapiId (string) - ID từ backend

✅ **Projects** (`api::project.project`)
- name (string)
- description (richtext)
- status (enum: planning/in_progress/on_hold/completed/cancelled)
- budget (decimal)
- startDate, endDate (date)
- client, location (string)
- progress (integer 0-100)
- strapiId (string)

## 🔧 Cấu hình Backend Sync

### File `.env` trong Strapi:

```env
BACKEND_URL=https://baotienweb.cloud/api/v1
BACKEND_API_TOKEN=strapi-sync-token-secret-change-this
```

**⚠️ QUAN TRỌNG:** Đổi `BACKEND_API_TOKEN` thành một secret key mạnh hơn!

## 📡 API Endpoints để Backend gọi

### 1. Import single item

```bash
POST http://localhost:1337/api/sync/import
Authorization: Bearer strapi-sync-token-secret-change-this
Content-Type: application/json

{
  "contentType": "products",
  "data": {
    "id": "prod-123",
    "name": "Xi măng",
    "price": 95000,
    "stock": 50
  }
}
```

### 2. Batch import

```bash
POST http://localhost:1337/api/sync/batch-import
Authorization: Bearer strapi-sync-token-secret-change-this
Content-Type: application/json

{
  "contentType": "products",
  "items": [
    { "id": "prod-1", "name": "Xi măng", "price": 95000 },
    { "id": "prod-2", "name": "Thép", "price": 25000 }
  ]
}
```

## 🔌 Backend NestJS cần implement

Trong `BE-baotienweb.cloud/`, tạo controller:

### File: `src/strapi-sync/strapi-sync.controller.ts`

```typescript
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';

@Controller('strapi-sync')
export class StrapiSyncController {
  private readonly STRAPI_TOKEN = process.env.STRAPI_SYNC_TOKEN || 'strapi-sync-token-secret-change-this';

  @Post('products')
  async syncProduct(
    @Body() body: { operation: 'create' | 'update' | 'delete', data: any },
    @Headers('authorization') auth: string,
  ) {
    // Verify token
    if (!auth || !auth.includes(this.STRAPI_TOKEN)) {
      throw new UnauthorizedException('Invalid sync token');
    }

    const { operation, data } = body;

    switch (operation) {
      case 'create':
        // Tạo product mới trong database
        await this.productsService.create({
          ...data,
          strapiId: data.strapiId
        });
        break;

      case 'update':
        // Update product by strapiId
        await this.productsService.updateBystrapiId(data.strapiId, data);
        break;

      case 'delete':
        // Xóa product by strapiId
        await this.productsService.deleteBystrapiId(data.strapiId);
        break;
    }

    return { success: true, message: `Product ${operation}d` };
  }

  @Post('projects')
  async syncProject(@Body() body: any, @Headers('authorization') auth: string) {
    // Tương tự như products
  }
}
```

### File: `.env` trong Backend

```env
STRAPI_SYNC_TOKEN=strapi-sync-token-secret-change-this
STRAPI_URL=http://localhost:1337
```

### Service để gọi Strapi từ Backend

```typescript
// src/strapi/strapi.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StrapiService {
  private readonly apiClient = axios.create({
    baseURL: process.env.STRAPI_URL + '/api',
    headers: {
      'Authorization': `Bearer ${process.env.STRAPI_SYNC_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  async syncToStrapi(contentType: string, data: any) {
    try {
      await this.apiClient.post('/sync/import', {
        contentType,
        data
      });
      console.log(`✅ Synced ${contentType} to Strapi`);
    } catch (error) {
      console.error(`❌ Failed to sync to Strapi:`, error.message);
    }
  }
}
```

## 📝 Workflow ví dụ

### Scenario 1: Tạo Product từ Strapi Admin

1. Vào http://localhost:1337/admin
2. Click **Content Manager** → **Product** → **Create new entry**
3. Nhập:
   - Name: Xi măng PCB40
   - Price: 95000
   - Stock: 100
   - Category: Vật liệu
4. Click **Save** → **Publish**

**✅ Kết quả:**
- Product lưu trong Strapi SQLite
- Lifecycle hook tự động gọi Backend API
- Backend nhận và lưu vào database PostgreSQL
- Data đã sync!

### Scenario 2: Tạo Product từ Mobile App

1. User mở app, vào "Thêm sản phẩm"
2. Nhập thông tin, click "Tạo"
3. App gọi: `POST https://baotienweb.cloud/api/v1/products`
4. Backend xử lý:
   ```typescript
   // Lưu vào database
   const product = await this.productsService.create(dto);
   
   // Sync sang Strapi
   await this.strapiService.syncToStrapi('products', product);
   ```
5. Strapi nhận và lưu

**✅ Kết quả:**
- Product có trong Backend database
- Product cũng xuất hiện trong Strapi admin
- Editors có thể edit trong Strapi

## 🧪 Test đồng bộ

### Test 1: Strapi → Backend

```bash
# Terminal 1: Chạy Strapi
cd strapi-cms
npm run develop

# Terminal 2: Chạy Backend
cd BE-baotienweb.cloud
npm run start:dev

# Terminal 3: Tạo product trong Strapi
# Vào admin panel, tạo product mới
# Xem logs của Backend để verify nhận được webhook
```

### Test 2: Backend → Strapi

```bash
# Gọi API backend để tạo product
curl -X POST https://baotienweb.cloud/api/v1/products \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 50000,
    "stock": 10
  }'

# Vào Strapi admin, verify product đã xuất hiện
```

## 🔒 Security

1. **Đổi BACKEND_API_TOKEN** trong cả Strapi và Backend `.env`
2. **CORS:** Cấu hình trong `strapi-cms/config/middlewares.js`:

```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'connect-src': ["'self'", 'https:', 'http:'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',  // Admin Web
        'https://baotienweb.cloud',
        'http://localhost:1337'
      ],
      headers: ['Content-Type', 'Authorization', 'X-Strapi-Sync']
    }
  },
  // ... rest
];
```

3. **Production:** Dùng PostgreSQL thay vì SQLite

## 🚢 Deploy Strapi lên VPS

```bash
# SSH vào VPS
ssh root@baotienweb.cloud

# Clone hoặc copy code
cd /var/www
rsync -avz strapi-cms/ root@baotienweb.cloud:/var/www/strapi-cms/

# Cài đặt dependencies
cd /var/www/strapi-cms
npm ci --only=production

# Build admin panel
npm run build

# Chạy với PM2
pm2 start npm --name "strapi-cms" -- run start
pm2 save

# Cấu hình Nginx reverse proxy
# Tạo file /etc/nginx/sites-available/strapi
server {
    listen 80;
    server_name cms.baotienweb.cloud;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
ln -s /etc/nginx/sites-available/strapi /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL với Let's Encrypt
certbot --nginx -d cms.baotienweb.cloud
```

## 📊 Admin Panel Features

Sau khi login vào http://localhost:1337/admin, bạn có:

✅ **Content Manager** - Quản lý Products, Projects
✅ **Media Library** - Upload và quản lý hình ảnh
✅ **Content-Type Builder** - Tạo thêm models mới
✅ **Users & Permissions** - Quản lý roles
✅ **Settings** - Cấu hình webhooks, API tokens

## 🆘 Troubleshooting

### Lỗi: Cannot sync to backend

```bash
# Check .env
cat strapi-cms/.env | grep BACKEND

# Test backend endpoint
curl https://baotienweb.cloud/api/v1/strapi-sync/products \
  -H "Authorization: Bearer strapi-sync-token-secret-change-this" \
  -X POST -d '{"operation":"create","data":{"name":"test"}}'
```

### Lỗi: Strapi không nhận được data từ backend

```bash
# Check Strapi logs
cd strapi-cms
npm run develop

# Test import endpoint
curl http://localhost:1337/api/sync/import \
  -H "Authorization: Bearer strapi-sync-token-secret-change-this" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"products","data":{"id":"test-1","name":"Test"}}'
```

### Port 1337 bị chiếm

```bash
# Tìm process
netstat -ano | findstr :1337

# Kill process
taskkill /PID <PID> /F

# Hoặc đổi port trong .env
PORT=1338
```

## 📚 Tài liệu tham khảo

- [Strapi Documentation](https://docs.strapi.io)
- [Lifecycle Hooks](https://docs.strapi.io/dev-docs/backend-customization/models#lifecycle-hooks)
- [REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Content Type Builder](https://docs.strapi.io/user-docs/content-type-builder)

---

## 🎉 Kết luận

Bạn đã có:
- ✅ Strapi CMS với admin panel đẹp
- ✅ Auto-sync Strapi → Backend khi có thay đổi
- ✅ API cho Backend → Strapi sync
- ✅ Content types: Products, Projects
- ✅ Media library cho hình ảnh
- ✅ Authentication & permissions

**Next steps:**
1. Chạy Strapi: `cd strapi-cms && npm run develop`
2. Tạo admin account đầu tiên
3. Implement endpoints trong Backend NestJS
4. Test đồng bộ 2 chiều
5. Deploy lên VPS

Có câu hỏi? Check logs hoặc hỏi tôi! 🚀
