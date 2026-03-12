# 🚀 Hướng Dẫn Deploy Backend - Services & Utilities Modules

## ✅ Trạng Thái Hiện Tại

**Frontend:** ✅ 100% Hoàn thành
- Admin dashboard UI
- Services management (list, create, edit, delete)
- Utilities management (list, create, edit, delete, toggle)
- API service clients ready

**Backend Code:** ✅ 100% Sẵn sàng
- Services module (4 files)
- Utilities module (4 files)
- Prisma schema đã được thêm vào server

**Cần Làm:** Deploy backend modules lên server

---

## 📋 Bước 1: SSH vào Server

```bash
ssh root@103.200.20.100
```

**Nhập password khi được yêu cầu**

---

## 📋 Bước 2: Generate Prisma Client

```bash
cd /root/baotienweb-api

# Generate Prisma Client với models mới
npx prisma generate

# Kiểm tra schema đã có Service và Utility chưa
cat prisma/schema.prisma | grep -A5 "model Service"
cat prisma/schema.prisma | grep -A5 "model Utility"
```

**Kết quả mong đợi:** Thấy Service và Utility models

---

## 📋 Bước 3: Tạo Migration cho Database

```bash
# Development (tự động chạy migration)
npx prisma migrate dev --name add_services_utilities_modules

# HOẶC Production (cần confirm)
npx prisma migrate deploy
```

**Kết quả mong đợi:** 
- Tạo tables: `services`, `utilities`
- Tạo enums: `ServiceCategory`, `ServiceStatus`, `UtilityType`

---

## 📋 Bước 4: Tạo Services Module

### 4.1 Tạo thư mục và DTOs

```bash
cd /root/baotienweb-api/src
mkdir -p services/dto
```

### 4.2 Copy services.controller.ts

```bash
cat > services/services.controller.ts << 'CONTROLLER_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.controller.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
CONTROLLER_EOF
```

### 4.3 Copy services.service.ts

```bash
cat > services/services.service.ts << 'SERVICE_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.service.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
SERVICE_EOF
```

### 4.4 Copy services.module.ts

```bash
cat > services/services.module.ts << 'MODULE_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.module.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
MODULE_EOF
```

### 4.5 Copy services.dto.ts

```bash
cat > services/dto/index.ts << 'DTO_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\services.dto.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
DTO_EOF
```

### 4.6 Verify Services Module

```bash
ls -la services/
ls -la services/dto/
```

**Kết quả mong đợi:**
```
services/
├── dto/
│   └── index.ts
├── services.controller.ts
├── services.service.ts
└── services.module.ts
```

---

## 📋 Bước 5: Tạo Utilities Module

### 5.1 Tạo thư mục

```bash
cd /root/baotienweb-api/src
mkdir -p utilities/dto
```

### 5.2 Copy utilities.controller.ts

```bash
cat > utilities/utilities.controller.ts << 'CONTROLLER_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.controller.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
CONTROLLER_EOF
```

### 5.3 Copy utilities.service.ts

```bash
cat > utilities/utilities.service.ts << 'SERVICE_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.service.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
SERVICE_EOF
```

### 5.4 Copy utilities.module.ts

```bash
cat > utilities/utilities.module.ts << 'MODULE_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.module.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
MODULE_EOF
```

### 5.5 Copy utilities.dto.ts

```bash
cat > utilities/dto/index.ts << 'DTO_EOF'
```

**Mở file local:** `c:\tien\APP_DESIGN_BUILD15.11.2025\docs\backend-code\utilities.dto.ts`

**Copy toàn bộ nội dung, paste vào terminal, nhấn Enter, sau đó gõ:**

```bash
DTO_EOF
```

### 5.6 Verify Utilities Module

```bash
ls -la utilities/
ls -la utilities/dto/
```

---

## 📋 Bước 6: Register Modules trong app.module.ts

```bash
cd /root/baotienweb-api/src

# Backup app.module.ts
cp app.module.ts app.module.ts.backup

# Tìm dòng cuối cùng của imports array
nano app.module.ts
```

**Trong nano editor:**

1. Tìm dòng imports array (thường ở đầu file)
2. Thêm 2 dòng import ở đầu file (sau các import khác):

```typescript
import { ServicesModule } from './services/services.module';
import { UtilitiesModule } from './utilities/utilities.module';
```

3. Thêm 2 modules vào imports array:

```typescript
@Module({
  imports: [
    // ... existing modules
    TimelineModule,
    QCModule,
    CRMModule,
    ServicesModule,      // ← Thêm dòng này
    UtilitiesModule,     // ← Thêm dòng này
  ],
  // ...
})
```

4. Lưu: `Ctrl + O`, Enter, `Ctrl + X`

### Verify:

```bash
cat app.module.ts | grep -E "ServicesModule|UtilitiesModule"
```

**Kết quả mong đợi:** Thấy 2 dòng import và 2 dòng trong imports array

---

## 📋 Bước 7: Build Backend

```bash
cd /root/baotienweb-api

# Install dependencies (nếu cần)
npm install

# Build project
npm run build
```

**Kiểm tra lỗi compile:**
- Nếu có lỗi, đọc kỹ error message
- Thường là import path không đúng hoặc thiếu dependencies

---

## 📋 Bước 8: Restart PM2

```bash
# Restart backend service
pm2 restart baotienweb-api

# Xem logs để kiểm tra lỗi
pm2 logs baotienweb-api --lines 100

# Kiểm tra status
pm2 status
```

**Kết quả mong đợi:**
- Status: `online`
- Không có error trong logs
- Thấy messages: "Application is running on..."

---

## 📋 Bước 9: Test API Endpoints

### 9.1 Login để lấy Token

```bash
# Login
curl -X POST "https://baotienweb.cloud/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "123456"
  }'
```

**Copy access_token từ response**

### 9.2 Test Services Endpoints

```bash
# Thay YOUR_TOKEN bằng token vừa lấy được
TOKEN="YOUR_TOKEN"

# 1. Get all services (không cần auth)
curl -X GET "https://baotienweb.cloud/api/v1/services"

# 2. Create service (cần auth)
curl -X POST "https://baotienweb.cloud/api/v1/services" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thiết kế kiến trúc",
    "description": "Thiết kế bản vẽ kiến trúc 2D/3D chuyên nghiệp",
    "category": "DESIGN",
    "price": 500000,
    "unit": "m²",
    "duration": "2-3 tháng",
    "features": ["Bản vẽ 3D", "File CAD", "Tư vấn miễn phí"]
  }'

# 3. Get service by ID (thay :id bằng ID từ response trên)
curl -X GET "https://baotienweb.cloud/api/v1/services/1"

# 4. Update service
curl -X PATCH "https://baotienweb.cloud/api/v1/services/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 550000
  }'

# 5. Toggle status
curl -X PATCH "https://baotienweb.cloud/api/v1/services/1/toggle-status" \
  -H "Authorization: Bearer $TOKEN"

# 6. Delete service
curl -X DELETE "https://baotienweb.cloud/api/v1/services/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 9.3 Test Utilities Endpoints

```bash
# 1. Get all utilities
curl -X GET "https://baotienweb.cloud/api/v1/utilities"

# 2. Create utility
curl -X POST "https://baotienweb.cloud/api/v1/utilities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tính toán vật liệu",
    "description": "Công cụ tính toán lượng vật liệu cần thiết",
    "type": "CALCULATOR",
    "icon": "calculator-outline",
    "color": "#3B82F6",
    "route": "/utilities/material-calculator"
  }'

# 3. Get utility by ID
curl -X GET "https://baotienweb.cloud/api/v1/utilities/1"

# 4. Toggle enabled
curl -X PATCH "https://baotienweb.cloud/api/v1/utilities/1/toggle-enabled" \
  -H "Authorization: Bearer $TOKEN"

# 5. Increment use count
curl -X POST "https://baotienweb.cloud/api/v1/utilities/1/use"

# 6. Delete utility
curl -X DELETE "https://baotienweb.cloud/api/v1/utilities/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Bước 10: Verify Swagger Documentation

**Mở browser:**

```
https://baotienweb.cloud/api/docs
```

**Kiểm tra:**
- Tìm section "Construction Services" (6 endpoints)
- Tìm section "App Utilities" (7 endpoints)
- Test các endpoints trực tiếp từ Swagger UI

---

## 📋 Bước 11: Seed Sample Data (Optional)

### Create seed script:

```bash
cd /root/baotienweb-api
nano prisma/seed-admin.ts
```

**Paste nội dung:**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin data...');

  // Seed Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Thiết kế kiến trúc',
        description: 'Thiết kế bản vẽ kiến trúc 2D/3D chuyên nghiệp',
        category: 'DESIGN',
        price: 500000,
        unit: 'm²',
        duration: '2-3 tháng',
        features: ['Bản vẽ 3D', 'File CAD', 'Tư vấn miễn phí'],
        createdBy: 1, // Admin user ID
      },
    }),
    prisma.service.create({
      data: {
        name: 'Thi công phần thô',
        description: 'Thi công xây dựng phần thô hoàn chỉnh',
        category: 'CONSTRUCTION',
        price: 3500000,
        unit: 'm²',
        duration: '4-6 tháng',
        features: ['Móng', 'Cột dầm', 'Tường', 'Mái'],
        createdBy: 1,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Hoàn thiện nội thất',
        description: 'Hoàn thiện nội thất cao cấp',
        category: 'FINISHING',
        price: 2500000,
        unit: 'm²',
        duration: '2-3 tháng',
        features: ['Sơn', 'Trần thạch cao', 'Sàn gỗ', 'Đèn'],
        createdBy: 1,
      },
    }),
  ]);

  console.log(`Created ${services.length} services`);

  // Seed Utilities
  const utilities = await Promise.all([
    prisma.utility.create({
      data: {
        name: 'Tính toán vật liệu',
        description: 'Công cụ tính toán lượng vật liệu cần thiết',
        type: 'CALCULATOR',
        icon: 'calculator-outline',
        color: '#3B82F6',
        route: '/utilities/material-calculator',
        createdBy: 1,
      },
    }),
    prisma.utility.create({
      data: {
        name: 'Trò chuyện AI',
        description: 'Tư vấn xây dựng bằng trí tuệ nhân tạo',
        type: 'AI',
        icon: 'chatbubbles-outline',
        color: '#8B5CF6',
        route: '/utilities/ai-chat',
        createdBy: 1,
      },
    }),
    prisma.utility.create({
      data: {
        name: 'Live Stream',
        description: 'Phát trực tiếp tiến độ công trình',
        type: 'MEDIA',
        icon: 'videocam-outline',
        color: '#EF4444',
        route: '/utilities/live-stream',
        createdBy: 1,
      },
    }),
  ]);

  console.log(`Created ${utilities.length} utilities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**

```bash
npx ts-node prisma/seed-admin.ts
```

---

## 🎯 Checklist Hoàn Thành

- [ ] SSH vào server thành công
- [ ] `npx prisma generate` chạy thành công
- [ ] `npx prisma migrate dev` tạo tables thành công
- [ ] Services module được tạo (4 files)
- [ ] Utilities module được tạo (4 files)
- [ ] app.module.ts đã register 2 modules
- [ ] `npm run build` không có lỗi
- [ ] `pm2 restart` thành công, status = online
- [ ] GET /api/v1/services trả về data
- [ ] POST /api/v1/services tạo được service mới
- [ ] GET /api/v1/utilities trả về data
- [ ] POST /api/v1/utilities tạo được utility mới
- [ ] Swagger docs hiển thị đầy đủ endpoints
- [ ] Seed data thành công (optional)

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module '@prisma/client'"

```bash
cd /root/baotienweb-api
npm install
npx prisma generate
```

### Lỗi: "Table 'services' already exists"

```bash
# Drop tables và tạo lại
npx prisma migrate reset
npx prisma migrate dev --name add_services_utilities_modules
```

### Lỗi: PM2 restart failed

```bash
# Xem logs chi tiết
pm2 logs baotienweb-api --err --lines 200

# Stop và start lại
pm2 stop baotienweb-api
pm2 start baotienweb-api
```

### Lỗi: "Module not found" khi build

- Kiểm tra import paths trong controller/service
- Đảm bảo tên file đúng: `services.service.ts`, không phải `service.service.ts`
- Kiểm tra dto/index.ts export đúng

### Lỗi: 401 Unauthorized khi test API

```bash
# Login lại để lấy token mới
curl -X POST "https://baotienweb.cloud/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

---

## 📞 Liên Hệ Hỗ Trợ

Nếu gặp lỗi, kiểm tra:
1. `pm2 logs baotienweb-api` - Server logs
2. Browser DevTools Console - Frontend errors
3. Network tab - API response errors

---

**Hoàn thành deployment! 🎉**

Sau khi hoàn tất các bước trên, bạn có thể test frontend app:
1. Mở app admin dashboard
2. Vào Services management
3. Tạo service mới
4. Vào Utilities management
5. Tạo utility mới
