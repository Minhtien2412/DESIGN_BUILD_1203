# BÁO CÁO KIỂM TRA TOÀN DIỆN BACKEND API

## baotienweb.cloud — Ngày 12/03/2026

---

## 1. TỔNG QUAN

| Hạng mục         | Giá trị                                                           |
| ---------------- | ----------------------------------------------------------------- |
| **Server**       | VPS 103.200.20.100                                                |
| **Domain**       | baotienweb.cloud (SSL Let's Encrypt)                              |
| **Backend**      | NestJS trong Docker container `baotienweb-api`                    |
| **Port**         | Docker: 3002→3000                                                 |
| **Database**     | PostgreSQL + Redis                                                |
| **API Base URL** | `https://baotienweb.cloud/api/v1/`                                |
| **API Key**      | Header `X-API-Key` bắt buộc cho mọi request                       |
| **Auth**         | JWT Bearer token (accessToken từ `/auth/login`)                   |
| **Swagger**      | `https://baotienweb.cloud/api/docs`                               |
| **WebSocket**    | Socket.io tại `/socket.io/` (chat, call, notifications, progress) |

---

## 2. CÁC SỬA CHỮA ĐÃ THỰC HIỆN

### 2.1 Nguyên nhân gốc lỗi 502

- **Nginx** proxy đến PM2 (port 3000) đang crashloop thay vì Docker container (port 3002)
- PM2 đã restart hơn 4,338 lần

### 2.2 Các fix đã áp dụng

| #   | Fix             | Chi tiết                                                    |
| --- | --------------- | ----------------------------------------------------------- |
| 1   | **Nginx proxy** | Đổi tất cả 8 `proxy_pass` từ `:3000` → `:3002`              |
| 2   | **PM2**         | Dừng PM2 crashlooping process                               |
| 3   | **ApiKeyGuard** | Patch vào Docker container `app.module.js` (thiếu guard)    |
| 4   | **Video-cache** | Sửa quyền `chown nestjs:nodejs /var/www/video-cache`        |
| 5   | **Healthcheck** | Cập nhật docker-compose thêm API key header                 |
| 6   | **Container**   | Commit image mới `baotienweb-api:patched-v2` → tag `latest` |

---

## 3. KẾT QUẢ KIỂM TRA

### 3.1 Test hàng loạt 264 GET endpoints (không tham số)

| Trạng thái         | Số lượng | Tỷ lệ |
| ------------------ | -------- | ----- |
| ✅ OK (200)        | 175      | 66.5% |
| 🔒 AUTH (401)      | 86       | 32.7% |
| ❌ 500 Error       | 2        | 0.8%  |
| ⚠️ 400 Bad Request | 1        | 0.4%  |

### 3.2 Test chi tiết FE→BE (103 endpoint FE sử dụng, có JWT token)

| Trạng thái          | Số lượng | Tỷ lệ |
| ------------------- | -------- | ----- |
| ✅ OK (200/201)     | 60       | 58.3% |
| ⚠️ 400 Bad Request  | 4        | 3.9%  |
| 🔒 401 Unauthorized | 0        | 0%    |
| 📭 404 Not Found    | 33       | 32.0% |
| ❌ 500 Server Error | 6        | 5.8%  |

---

## 4. CÁC ENDPOINT HOẠT ĐỘNG TỐT (60 endpoints) ✅

### Auth & User

- `auth/me`, `users`, `users/1`, `profile`, `users/addresses`

### Products & Ecommerce

- `products`, `products/1`, `products/2`, `products/categories`
- `cart`, `orders`, `invoices`, `invoices/1`

### News, Reels & Content

- `news`, `news/1`, `reels`, `reels/1`, `reels/feed`, `reels/trending`, `reels/categories`
- `contacts`, `contacts/1`

### Chat & Communication

- `chat/rooms`, `messages/search`, `conversations`, `call/history`

### Construction & Project Management

- `projects`, `construction-progress`, `timeline/phases`
- `daily-reports`, `safety/incidents`
- `change-orders`, `submittals`, `rfis`
- `document-control/documents`, `document-control/transmittals`
- `files`

### Environmental

- `environmental/monitoring`, `environmental/waste`, `environmental/emissions`
- `environmental/incidents`, `environmental/permits`

### Quality Control

- `qc/categories`, `qc/checklists`, `qc/inspections`
- `commissioning/summary`

### Admin & Analytics

- `admin/dashboard`, `admin/dashboard/projects-status`, `admin/stats/projects`, `admin/stats/users`
- `analytics/dashboard`, `analytics/overview`

### Other

- `labor`, `labor/nearby`, `materials`, `notifications`
- `health`, `metrics`

### WebSocket & Docs

- Socket.io polling: ✅ 200
- Swagger UI: ✅ 200
- Swagger JSON: ✅ 200

---

## 5. BUG 500 - CẦN SỬA TRONG SOURCE CODE (6 endpoints) ❌

### 5.1 AI Controller — `ai/analyses`, `ai/reports`

```
TypeError: Cannot read properties of undefined (reading 'userId')
at AIController.getAnalysisHistory (ai.controller.js:44:59)
```

- **Nguyên nhân**: Controller dùng `req.user.userId` nhưng JWT strategy đặt user ID vào `req.user.sub`
- **Vẫn lỗi 500 ngay cả khi có JWT token hợp lệ**
- **Fix**: Trong `ai.controller.ts`, đổi `req.user.userId` → `req.user.sub` hoặc cập nhật JWT strategy để map `.sub` → `.userId`

### 5.2 Materials Controller — `materials/suppliers`, `materials/list`, `materials/categories`

```
TypeError: Cannot read properties of undefined (reading 'id')
at MaterialsController.findOne (materials.controller.js:40:69)
```

- **Nguyên nhân**: Route `/materials/suppliers` match vào route `/materials/:id` (id="suppliers"), route này dùng `req.user.id.toString()` nhưng JWT có `req.user.sub`, không có `req.user.id`
- **Fix 1**: Thêm route cụ thể `@Get('suppliers')` trước `@Get(':id')` trong controller
- **Fix 2**: Cập nhật JWT strategy để map `.sub` → `.id`

### 5.3 CRM Tasks — `crm/tasks`

```
TypeError: Cannot read properties of null (reading 'tbltasks')
at CrmService.getAllTasks (crm.service.js:129:31)
```

- **Nguyên nhân**: Perfex CRM database connection is null — CRM service cố đọc `tbltasks` từ Perfex DB nhưng connection không được thiết lập
- **Fix**: Cấu hình Perfex CRM DB connection hoặc thêm null check trong `crm.service.ts`

### 5.4 CRM Clients — `crm/clients`

- Cùng root cause với CRM Tasks — Perfex DB null

### 5.5 Users Search — `users/search`

- Tương tự — khả năng cao dùng `req.user.id` hoặc `req.user.userId` mà không tương thích với JWT payload

---

## 6. FE→BE ROUTE MISMATCH - 404 (33 endpoints) 📭

### 6.1 Route FE gọi nhưng BE chưa implement (hoặc tên khác)

| FE Route                                      | Ghi chú                                                   |
| --------------------------------------------- | --------------------------------------------------------- |
| `construction-projects`                       | BE có thể dùng `projects` thay vì `construction-projects` |
| `construction-designs`                        | Chưa có controller riêng                                  |
| `contracts`, `contracts/templates`            | Chưa implement                                            |
| `documents` (standalone)                      | BE dùng `document-control/documents`                      |
| `bookings`                                    | Chưa implement                                            |
| `payments/history`                            | Chưa implement                                            |
| `warranty`, `warranty-claims`                 | Chưa implement                                            |
| `fleet/equipment`                             | Chưa implement                                            |
| `quote-requests`                              | Chưa implement                                            |
| `commissioning-plans`                         | BE dùng `commissioning/summary`                           |
| `commissioning-deficiencies`                  | Chưa implement                                            |
| `progress-photos`, `progress-photos/timeline` | Chưa implement                                            |

### 6.2 Admin route không tồn tại

| FE Route                                             | Ghi chú                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `admin/users`                                        | Không có route (nhưng `admin/stats/users` có) |
| `admin/departments`, `admin/staff`, `admin/settings` | Chưa implement                                |

### 6.3 CRM route không tồn tại

| FE Route                                   | Ghi chú                                |
| ------------------------------------------ | -------------------------------------- |
| `crm/leads`, `crm/deals`, `crm/activities` | Perfex CRM integration chưa hoàn chỉnh |
| `crm/dashboard/stats`                      | Chưa implement                         |

### 6.4 Khác

| FE Route                                                        | Ghi chú                            |
| --------------------------------------------------------------- | ---------------------------------- |
| `messages` (standalone)                                         | BE dùng `chat/rooms` + WebSocket   |
| `timeline/tasks`, `timeline/baselines`, `timeline/dependencies` | Chưa implement                     |
| `ai/chat/sessions`                                              | Chưa implement                     |
| `analytics/performance`                                         | Chưa implement                     |
| `users/me/status`, `users/me/notification-preferences`          | Chưa implement                     |
| `workers/search`                                                | Dùng query param thay vì sub-route |

---

## 7. VALIDATION ERRORS (400) - BÌNH THƯỜNG ⚠️

| Endpoint                     | Lý do                           |
| ---------------------------- | ------------------------------- |
| `products/search?q=gach`     | Cần param khác hoặc format khác |
| `services/search?q=thiet+ke` | Tương tự                        |
| `construction-map/stages`    | Cần `projectId` query param     |
| `construction-map/tasks`     | Cần `projectId` query param     |

---

## 8. BẢNG TRỐNG (Data empty nhưng API hoạt động bình thường)

| Bảng       | Số bản ghi |
| ---------- | ---------- |
| `workers`  | 0          |
| `services` | 0          |

---

## 9. TÓM TẮT VÀ KHUYẾN NGHỊ

### ✅ Đã hoàn thành

1. Tất cả lỗi 502 đã được sửa (Nginx, PM2, ApiKeyGuard, healthcheck)
2. Docker container hoạt động ổn định, healthy
3. 60/103 endpoint FE-dùng hoạt động tốt (58%)
4. WebSocket/Socket.io hoạt động
5. Swagger docs hoạt động
6. Auth flow (register/login/JWT) hoạt động hoàn chỉnh

### ⚡ Cần sửa ngay (Source code bugs)

1. **JWT payload mismatch** — Root cause chung cho AI, Materials, Users/search: JWT strategy cần map `sub` → `userId` và `id` để tương thích với tất cả controller
2. **Perfex CRM connection** — CRM tasks/clients lỗi vì DB connection null
3. **Materials route ordering** — `suppliers`/`list`/`categories` bị catch bởi `:id` route

### 📋 Cần implement thêm (33 route FE gọi nhưng BE chưa có)

- Ưu tiên cao: `contracts`, `bookings`, `payments`, `warranty`
- Ưu tiên trung: `admin/users|departments|staff|settings`, `construction-projects`, `progress-photos`
- Ưu tiên thấp: `fleet`, `commissioning-plans`, `ai/chat/sessions`

### 🔒 Bảo mật

- API Key guard hoạt động trên mọi endpoint
- JWT auth hoạt động cho protected endpoints
- Swagger docs nên cân nhắc disable trên production

---

_Báo cáo được tạo tự động từ kết quả kiểm tra endpoint ngày 12/03/2026_
