# Backend API Deployment Guide

## Hướng dẫn triển khai API Backend

### 1. Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- PM2 (process manager)

### 2. Cấu trúc API Endpoints

#### Home Data API

```
GET /api/v1/home/data          - Lấy tất cả dữ liệu trang chủ
GET /api/v1/home/banners       - Lấy danh sách banner
GET /api/v1/home/featured-services?category=main&limit=8
GET /api/v1/home/quick-stats   - Thống kê nhanh
GET /api/v1/home/recent-activities
```

#### Services API

```
GET /api/v1/services/featured  - Dịch vụ nổi bật
GET /api/v1/services/design    - Dịch vụ thiết kế
GET /api/v1/services/:id       - Chi tiết dịch vụ
```

#### Workers API

```
GET /api/v1/workers            - Danh sách thợ
GET /api/v1/workers?category=construction
GET /api/v1/workers?category=finishing
GET /api/v1/workers/categories - Danh mục thợ
GET /api/v1/workers/:id        - Chi tiết thợ
GET /api/v1/workers/:id/reviews
GET /api/v1/workers/:id/availability
```

#### Categories API

```
GET /api/v1/categories         - Tất cả danh mục
GET /api/v1/categories/library - Danh mục thư viện
GET /api/v1/categories/main    - Danh mục chính
```

#### Products/Equipment API

```
GET /api/v1/products/equipment - Thiết bị & nội thất
GET /api/v1/products/materials - Vật liệu
GET /api/v1/products/:id
```

#### Notifications API

```
GET /api/v1/notifications              - Danh sách thông báo
GET /api/v1/notifications/count        - Số lượng theo loại
GET /api/v1/notifications/unread-count - Tổng chưa đọc
PUT /api/v1/notifications/:id/read     - Đánh dấu đã đọc
PUT /api/v1/notifications/read-all     - Đọc tất cả
DELETE /api/v1/notifications/:id
GET /api/v1/notifications/settings
PUT /api/v1/notifications/settings
```

#### Messages API

```
GET /api/v1/messages/conversations           - Danh sách hội thoại
GET /api/v1/messages/conversations/:id       - Chi tiết hội thoại
GET /api/v1/messages/conversations/:id/messages
POST /api/v1/messages/conversations/:id/messages
POST /api/v1/messages/conversations          - Tạo hội thoại mới
PUT /api/v1/messages/conversations/:id/read
GET /api/v1/messages/unread-count
```

#### Calls API

```
GET /api/v1/calls/history          - Lịch sử cuộc gọi
GET /api/v1/calls/missed-count     - Số cuộc gọi nhỡ
POST /api/v1/calls/initiate        - Khởi tạo cuộc gọi
PUT /api/v1/calls/:id/answer
PUT /api/v1/calls/:id/reject
PUT /api/v1/calls/:id/end
PUT /api/v1/calls/:id/mark-seen
GET /api/v1/calls/token?roomId=xxx - Lấy token WebRTC
```

### 3. Triển khai Database

```bash
# SSH vào server
ssh root@103.200.20.100

# Kết nối PostgreSQL
sudo -u postgres psql

# Tạo database
CREATE DATABASE app_design;

# Kết nối database
\c app_design

# Chạy migration
\i /path/to/migrations.sql
```

### 4. Cấu hình Backend

Tạo file `.env`:

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=app_design
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# LiveKit (for calls)
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-livekit-server

# Push Notifications
FCM_SERVER_KEY=your_fcm_key

# File Upload
UPLOAD_PATH=/var/www/uploads
MAX_FILE_SIZE=50000000
```

### 5. Build & Deploy

```bash
# Clone repository
cd /var/www
git clone your-repo backend-api
cd backend-api

# Install dependencies
npm install

# Build
npm run build

# Run migrations
npm run migration:run

# Start with PM2
pm2 start dist/main.js --name "app-api"
pm2 save
```

### 6. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name baotienweb.cloud;

    ssl_certificate /etc/letsencrypt/live/baotienweb.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/baotienweb.cloud/privkey.pem;

    location /api/v1 {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for chat/calls
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 7. Response Format

Tất cả API trả về format thống nhất:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "timestamp": "2026-01-24T04:30:00.000Z"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "timestamp": "2026-01-24T04:30:00.000Z"
}
```

### 8. Authentication

Tất cả API (trừ public endpoints) yêu cầu Bearer token:

```
Authorization: Bearer <jwt_token>
```

Public endpoints:

- GET /api/v1/home/\*
- GET /api/v1/services/\*
- GET /api/v1/workers (list only)
- GET /api/v1/categories/\*
- GET /api/v1/products/\*

### 9. WebSocket Events

#### Chat Namespace (/chat)

```
connect
disconnect
join_conversation
leave_conversation
send_message
message_received
typing_start
typing_stop
message_read
```

#### Call Namespace (/call)

```
connect
disconnect
incoming_call
call_answered
call_rejected
call_ended
participant_joined
participant_left
```

#### Notification Namespace (/notifications)

```
connect
new_notification
notification_read
badge_update
```

### 10. Rate Limiting

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 500 requests/minute
- File upload: 10 requests/minute

### 11. Monitoring

```bash
# Check logs
pm2 logs app-api

# Monitor
pm2 monit

# Status
pm2 status
```
