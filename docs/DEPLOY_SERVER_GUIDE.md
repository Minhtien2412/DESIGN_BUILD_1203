# 🚀 Hướng Dẫn Deploy Backend lên Server VPS

## Server Information

- **IP**: 103.200.20.100
- **Domain**: baotienweb.cloud / api.thietkeresort.com.vn
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: v20.x
- **PM2**: Production process manager

---

## 📋 Danh Sách Modules Đã Tạo

| Module                | Endpoints | Mô Tả                                    |
| --------------------- | --------- | ---------------------------------------- |
| ConstructionMapModule | 16        | Quản lý bản đồ công trình, tasks, stages |
| LaborModule           | 11        | Quản lý nhà cung cấp lao động            |
| AnalyticsModule       | 9         | Analytics dashboard, events, reports     |
| SafetyModule          | 17        | Audits, incidents, PPE, trainings        |
| AsBuiltModule         | 15        | Bản vẽ hoàn công, exports, comments      |
| EnvironmentalModule   | 18        | Emissions, monitoring, waste, permits    |
| DocumentControlModule | 20+       | Documents, transmittals, revisions       |

**Tổng: ~106 endpoints mới**

---

## 🛠️ Bước 1: Chuẩn Bị Local

### Build project

```powershell
cd "c:\tien\New folder\APP_DESIGN_BUILD05.12.2025\BE-baotienweb.cloud"
npm run build
```

### Tạo file deploy

```powershell
# PowerShell - Tạo zip file để upload
Compress-Archive -Path dist, package.json, package-lock.json, prisma -DestinationPath deploy-modules.zip -Force
```

---

## 🚀 Bước 2: Upload lên Server

### Sử dụng SCP (nếu có SSH key)

```bash
scp deploy-modules.zip root@103.200.20.100:/var/www/api/
```

### Hoặc sử dụng FileZilla/WinSCP

1. Connect đến 103.200.20.100
2. Navigate đến `/var/www/api/`
3. Upload file `deploy-modules.zip`

---

## 🔧 Bước 3: Deploy trên Server

### SSH vào server

```bash
ssh root@103.200.20.100
```

### Backup và deploy

```bash
cd /var/www/api

# Backup folder dist hiện tại
mv dist dist.backup.$(date +%Y%m%d_%H%M%S)

# Giải nén
unzip deploy-modules.zip

# Cài dependencies (nếu có package mới)
npm ci --production

# Generate Prisma client (nếu có thay đổi schema)
npx prisma generate

# Restart service với PM2
pm2 restart api

# Kiểm tra logs
pm2 logs api --lines 50
```

---

## ✅ Bước 4: Verify Deployment

### Kiểm tra health endpoints

```bash
# Local test trên server
curl http://localhost:4000/api/v1/construction-map/health
curl http://localhost:4000/api/v1/labor/health
curl http://localhost:4000/api/v1/analytics/health
curl http://localhost:4000/api/v1/safety/health
curl http://localhost:4000/api/v1/as-built/health
curl http://localhost:4000/api/v1/environmental/health
curl http://localhost:4000/api/v1/document-control/health
```

### Kiểm tra qua domain

```bash
curl https://api.thietkeresort.com.vn/api/v1/construction-map/health
curl https://api.thietkeresort.com.vn/api/v1/environmental/dashboard
curl https://api.thietkeresort.com.vn/api/v1/document-control/dashboard
```

---

## 📜 Bước 5: Kiểm Tra PM2 Status

```bash
# Xem tất cả processes
pm2 list

# Xem chi tiết process api
pm2 show api

# Monitor real-time
pm2 monit

# Restart nếu cần
pm2 restart api

# Reload zero-downtime
pm2 reload api
```

---

## 🔥 Troubleshooting

### Lỗi port đang sử dụng

```bash
# Tìm process đang dùng port 4000
lsof -i :4000
netstat -tulpn | grep 4000

# Kill process nếu cần
kill -9 <PID>
```

### Lỗi permission

```bash
chown -R www-data:www-data /var/www/api
chmod -R 755 /var/www/api
```

### Xem error logs

```bash
# PM2 logs
pm2 logs api --err --lines 100

# System logs
journalctl -u nginx -f
tail -f /var/log/nginx/error.log
```

### Rollback nếu có lỗi

```bash
cd /var/www/api
rm -rf dist
mv dist.backup.YYYYMMDD_HHMMSS dist
pm2 restart api
```

---

## 🔄 CI/CD Suggestion (Optional)

### GitHub Actions workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]
    paths:
      - "BE-baotienweb.cloud/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install & Build
        run: |
          cd BE-baotienweb.cloud
          npm ci
          npm run build

      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "BE-baotienweb.cloud/dist/*"
          target: "/var/www/api/"

      - name: Restart PM2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/api
            npm ci --production
            pm2 restart api
```

---

## 📊 API Endpoints Summary

### Construction Map (`/construction-map`)

- `GET /dashboard` - Dashboard metrics
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET/PUT /projects/:id` - Get/Update project
- `POST /projects/:id/stages` - Add stage
- `GET/POST /tasks` - Tasks CRUD
- `PATCH /tasks/:id/status` - Update task status
- `POST /tasks/:id/assign` - Assign worker

### Labor (`/labor`)

- `GET /dashboard` - Dashboard
- `GET/POST /providers` - Provider CRUD
- `GET/POST /workers` - Worker CRUD
- `POST /workers/:id/assign` - Assign to project

### Analytics (`/analytics`)

- `GET /dashboard` - Metrics dashboard
- `POST /events/track` - Track event
- `GET /events` - Get events
- `POST /compare` - Compare periods
- `GET /user-flow` - User flow data
- `POST /export` - Export analytics

### Safety (`/safety`)

- `GET /dashboard` - Safety dashboard
- `GET/POST /audits` - Audits CRUD
- `POST /audits/:id/findings` - Add finding
- `GET/POST /incidents` - Incidents CRUD
- `GET/POST /ppe` - PPE distribution
- `GET/POST /trainings` - Trainings CRUD

### As-Built (`/as-built`)

- `GET /dashboard` - Dashboard
- `GET/POST /drawings` - Drawings CRUD
- `POST /drawings/:id/revisions` - Add revision
- `PATCH /drawings/:id/submit-review` - Submit for review
- `PATCH /drawings/:id/approve` - Approve
- `GET/POST /drawings/:id/comments` - Comments
- `GET/POST /exports` - Export packages

### Environmental (`/environmental`)

- `GET /dashboard` - Dashboard
- `GET/POST /emissions` - Emission records
- `GET/POST /monitoring` - Monitoring schedules
- `PATCH /monitoring/:id/complete` - Complete monitoring
- `GET/POST /waste` - Waste records
- `GET/POST /permits` - Environmental permits
- `GET/POST /incidents` - Environmental incidents

### Document Control (`/document-control`)

- `GET /dashboard` - Dashboard
- `GET/POST /documents` - Documents CRUD
- `POST /documents/:id/revisions` - Add revision
- `PATCH /documents/:id/submit-review` - Submit for review
- `PATCH /documents/:id/review` - Review document
- `POST /documents/:id/distribute` - Distribute document
- `GET/POST /documents/:id/comments` - Comments
- `GET/POST /transmittals` - Transmittals CRUD
- `PATCH /transmittals/:id/send` - Send transmittal
- `PATCH /transmittals/:id/acknowledge` - Acknowledge
- `PATCH /transmittals/:id/respond` - Respond

---

## 📞 Support

- **Developer**: Tien
- **Server Admin**: baotienweb.cloud
- **Documentation**: `/docs/` folder trong project
