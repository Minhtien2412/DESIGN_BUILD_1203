# 🚀 HƯỚNG DẪN DEPLOY MODULES MỚI

## Modules đã tạo (21/01/2026)

1. **ConstructionMapModule** - `/api/v1/construction-map/*`
2. **LaborModule** - `/api/v1/labor-providers/*`

## Bước 1: Kết nối SSH vào server

```bash
ssh root@103.200.20.100
# Password: [your-password]
```

## Bước 2: Tạo thư mục cho modules mới

```bash
cd /var/www/baotienweb-api
mkdir -p src/construction-map/dto
mkdir -p src/construction-map/entities
mkdir -p src/labor/dto
mkdir -p src/labor/entities
```

## Bước 3: Tạo các file module

### 3.1 Construction Map Module

Copy nội dung từ local files vào server:

```bash
# Trên local, chạy:
cat BE-baotienweb.cloud/src/construction-map/construction-map.module.ts
cat BE-baotienweb.cloud/src/construction-map/construction-map.controller.ts
cat BE-baotienweb.cloud/src/construction-map/construction-map.service.ts
cat BE-baotienweb.cloud/src/construction-map/dto/index.ts
cat BE-baotienweb.cloud/src/construction-map/dto/task.dto.ts
cat BE-baotienweb.cloud/src/construction-map/dto/stage.dto.ts
cat BE-baotienweb.cloud/src/construction-map/dto/state.dto.ts
cat BE-baotienweb.cloud/src/construction-map/entities/index.ts
cat BE-baotienweb.cloud/src/construction-map/index.ts
```

### 3.2 Labor Module

```bash
cat BE-baotienweb.cloud/src/labor/labor.module.ts
cat BE-baotienweb.cloud/src/labor/labor.controller.ts
cat BE-baotienweb.cloud/src/labor/labor.service.ts
cat BE-baotienweb.cloud/src/labor/dto/index.ts
cat BE-baotienweb.cloud/src/labor/dto/provider.dto.ts
cat BE-baotienweb.cloud/src/labor/dto/review.dto.ts
cat BE-baotienweb.cloud/src/labor/dto/booking.dto.ts
cat BE-baotienweb.cloud/src/labor/entities/index.ts
cat BE-baotienweb.cloud/src/labor/index.ts
```

## Bước 4: Cập nhật app.module.ts

Thêm imports vào `/var/www/baotienweb-api/src/app.module.ts`:

```typescript
// Thêm ở đầu file
import { ConstructionMapModule } from './construction-map/construction-map.module';
import { LaborModule } from './labor/labor.module';

// Thêm vào mảng imports:
@Module({
  imports: [
    // ... existing modules ...
    ConstructionMapModule, // Construction map with tasks, stages
    LaborModule, // Labor provider management
  ],
})
```

## Bước 5: Build và restart

```bash
cd /var/www/baotienweb-api
npm run build
pm2 restart baotienweb-api
```

## Bước 6: Verify

```bash
# Health check
curl https://baotienweb.cloud/api/v1/health

# Construction Map health
curl https://baotienweb.cloud/api/v1/construction-map/health

# Get labor providers
curl https://baotienweb.cloud/api/v1/labor-providers
```

## Expected Response

### Health Check

```json
{
  "status": "ok",
  "timestamp": "2026-01-21T...",
  "uptime": ...
}
```

### Construction Map Health

```json
{
  "status": "ok",
  "module": "construction-map",
  "timestamp": "2026-01-21T...",
  "stats": {
    "tasks": 3,
    "stages": 3,
    "projects": 1
  }
}
```

### Labor Providers

```json
{
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn Minh",
      "skills": ["Electrical", "Wiring"],
      "rating": 4.8,
      ...
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 20
  }
}
```

---

## Alternative: SCP Upload

Nếu có SSH key configured:

```powershell
# From Windows PowerShell
scp -r ".\BE-baotienweb.cloud\src\construction-map" root@103.200.20.100:/var/www/baotienweb-api/src/
scp -r ".\BE-baotienweb.cloud\src\labor" root@103.200.20.100:/var/www/baotienweb-api/src/
scp ".\BE-baotienweb.cloud\src\app.module.ts" root@103.200.20.100:/var/www/baotienweb-api/src/
```

---

_Created: 21/01/2026_
