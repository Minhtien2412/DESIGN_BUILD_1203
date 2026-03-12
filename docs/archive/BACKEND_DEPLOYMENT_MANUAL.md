# Backend Deployment Guide

## 📋 Tổng quan

Tài liệu này hướng dẫn triển khai các module Backend mới cho ứng dụng:
- **Profile Module**: Quản lý hồ sơ người dùng, avatar
- **Notifications Module**: Hệ thống thông báo

## 🖥️ Thông tin Server

```
Server: 103.200.20.100
User: root
Password: 6k4BOIRDwWhsM39F2DyM
Backend Path: /var/www/baotienweb-api
PM2 App: baotienweb-api
```

## 🚀 Cách 1: Triển khai Tự động (Khuyến nghị)

### Bước 1: SSH vào server
```bash
ssh root@103.200.20.100
# Nhập password: 6k4BOIRDwWhsM39F2DyM
```

### Bước 2: Tạo và chạy script
```bash
cd /var/www/baotienweb-api

# Tải script từ local hoặc copy nội dung deploy-backend.sh
# Sau đó chạy:
bash deploy-backend.sh
```

## 🔧 Cách 2: Triển khai Thủ công

### Bước 1: SSH vào server
```bash
ssh root@103.200.20.100
```

### Bước 2: Tạo thư mục module
```bash
cd /var/www/baotienweb-api
mkdir -p src/profile/dto
mkdir -p src/notifications/dto
mkdir -p uploads/avatars
chmod 755 uploads uploads/avatars
```

### Bước 3: Copy files

Copy nội dung các file từ thư mục `backend-files/` trong dự án local:

1. **Profile Module:**
   - `backend-files/profile/profile.controller.ts` → `src/profile/profile.controller.ts`
   - `backend-files/profile/profile.service.ts` → `src/profile/profile.service.ts`
   - `backend-files/profile/profile.module.ts` → `src/profile/profile.module.ts`
   - `backend-files/profile/dto/update-profile.dto.ts` → `src/profile/dto/update-profile.dto.ts`
   - `backend-files/profile/index.ts` → `src/profile/index.ts`

2. **Notifications Module:**
   - `backend-files/notifications/notifications.controller.ts` → `src/notifications/notifications.controller.ts`
   - `backend-files/notifications/notifications.service.ts` → `src/notifications/notifications.service.ts`
   - `backend-files/notifications/notifications.module.ts` → `src/notifications/notifications.module.ts`
   - `backend-files/notifications/index.ts` → `src/notifications/index.ts`

### Bước 4: Cập nhật app.module.ts

Mở file `src/app.module.ts` và thêm:

```typescript
// Thêm imports ở đầu file
import { ProfileModule } from './profile/profile.module';
import { NotificationsModule } from './notifications/notifications.module';

// Thêm vào mảng imports trong @Module
@Module({
  imports: [
    // ...existing modules...
    ProfileModule,
    NotificationsModule,
  ],
  // ...
})
export class AppModule {}
```

### Bước 5: Cập nhật Prisma Schema

Thêm vào file `prisma/schema.prisma`:

```prisma
// Thêm vào User model
model User {
  // ...existing fields...
  avatarThumbnail String?
  dateOfBirth     DateTime?
  gender          Gender?
  address         String?
  bio             String?
  notifications   Notification[]
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

model Notification {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String    @db.VarChar(255)
  message     String    @db.Text
  type        NotificationType @default(IN_APP)
  priority    NotificationPriority @default(MEDIUM)
  isRead      Boolean   @default(false)
  readAt      DateTime?
  actionUrl   String?   @db.VarChar(500)
  actionData  Json?
  archivedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId])
  @@index([isRead])
  @@index([type])
  @@index([createdAt])
}

enum NotificationType {
  PUSH
  EMAIL
  SMS
  IN_APP
}

enum NotificationPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Bước 6: Chạy migration
```bash
npx prisma migrate dev --name add_profile_notifications
```

### Bước 7: Cài đặt dependencies
```bash
npm install sharp --save
```

### Bước 8: Build và restart
```bash
npm run build
pm2 restart baotienweb-api
```

## 📡 API Endpoints

### Profile Module

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/profile` | Lấy thông tin profile |
| PATCH | `/api/v1/profile` | Cập nhật profile |
| POST | `/api/v1/profile/avatar` | Upload avatar |
| DELETE | `/api/v1/profile/avatar` | Xóa avatar |

### Notifications Module

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/notifications` | Lấy danh sách thông báo |
| GET | `/api/v1/notifications/unread-count` | Đếm thông báo chưa đọc |
| PATCH | `/api/v1/notifications/:id/read` | Đánh dấu đã đọc |
| PATCH | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc |
| PATCH | `/api/v1/notifications/:id/archive` | Lưu trữ thông báo |

## 🧪 Test API

```bash
# Test profile (cần Bearer token)
curl -X GET https://baotienweb.cloud/api/v1/profile \
  -H "Authorization: Bearer <your_token>"

# Test notifications
curl -X GET "https://baotienweb.cloud/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer <your_token>"

# Test unread count
curl -X GET https://baotienweb.cloud/api/v1/notifications/unread-count \
  -H "Authorization: Bearer <your_token>"
```

## 🔐 Authentication

Tất cả endpoints đều yêu cầu JWT token trong header:
```
Authorization: Bearer <access_token>
```

## 📁 File Structure

```
/var/www/baotienweb-api/
├── src/
│   ├── profile/
│   │   ├── dto/
│   │   │   └── update-profile.dto.ts
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   ├── profile.module.ts
│   │   └── index.ts
│   ├── notifications/
│   │   ├── dto/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   └── index.ts
│   └── app.module.ts (updated)
├── prisma/
│   └── schema.prisma (updated)
├── uploads/
│   └── avatars/
└── ...
```

## ⚠️ Troubleshooting

### Lỗi "Cannot find module"
```bash
npm run build
pm2 restart baotienweb-api
```

### Lỗi Prisma
```bash
npx prisma generate
npx prisma migrate deploy
```

### Lỗi Permission uploads
```bash
chmod -R 755 uploads/
chown -R www-data:www-data uploads/
```

### Xem logs
```bash
pm2 logs baotienweb-api --lines 100
```

## ✅ Checklist

- [ ] SSH vào server thành công
- [ ] Tạo thư mục profile/ và notifications/
- [ ] Copy tất cả files
- [ ] Cập nhật app.module.ts
- [ ] Cập nhật prisma/schema.prisma
- [ ] Chạy migration
- [ ] Cài đặt sharp
- [ ] Build project
- [ ] Restart PM2
- [ ] Test API endpoints
