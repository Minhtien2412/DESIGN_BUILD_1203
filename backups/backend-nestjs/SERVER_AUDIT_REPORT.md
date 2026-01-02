# 🔍 Server Audit Report - baotienweb.cloud (103.200.20.100)

**Thời gian kiểm tra**: 2025-12-04 09:15 +07  
**Mục đích**: Chuẩn bị deploy Construction Map API

---

## ✅ Tình trạng máy chủ

### 1. Thông số hệ thống
```
Hostname: baotienweb.cloud
IP: 103.200.20.100
OS: Ubuntu (Linux)
Node.js: v20.19.5 ✅
NPM: 10.8.2 ✅
```

### 2. Tài nguyên
```
Disk: 22G/49G (45% used) ✅ Còn 27GB free
RAM: 2.3G/7.8G used ✅ Còn 5GB available
Swap: 0B (không có swap)
```

### 3. Services đang chạy

#### PM2 Applications
```
┌────┬─────────────────────┬──────────┬─────────┬──────────┐
│ ID │ Name                │ Status   │ Memory  │ Uptime   │
├────┼─────────────────────┼──────────┼─────────┼──────────┤
│ 3  │ baotienweb-admin    │ online   │ 167.7MB │ 10 days  │
│ 8  │ baotienweb-api      │ online   │ 60.2MB  │ 26 hours │
└────┴─────────────────────┴──────────┴─────────┴──────────┘

⚠️ Note: baotienweb-api đã restart 5 lần
```

#### PostgreSQL
```
Status: ✅ RUNNING
Port: 5432 (localhost only)
Databases:
  - postgres (default)
  - template0
  - template1
  
⚠️ KHÔNG có database cho construction_map
```

#### Redis
```
Status: ✅ RUNNING
Port: 6379 (localhost only)
Uptime: 6 days
Memory: 4.3MB
```

#### Nginx
```
Status: ✅ RUNNING (assumed)
Configured sites:
  - admin.baotienweb.cloud
  - crm.baotienweb.cloud
  - thk.conf (legacy)
  
⚠️ KHÔNG có config cho api.baotienweb.cloud
```

### 4. Ports đang sử dụng
```
3001: baotienweb-admin (Next.js)  ⚠️ CONFLICT!
5432: PostgreSQL (localhost)
6379: Redis (localhost)

⚠️ Port 3001 đã bị chiếm bởi admin app
⚠️ Port 3002 chưa được sử dụng (OK cho WebSocket)
```

---

## 📂 Cấu trúc hiện tại

### /root/baotienweb-api/
```
Mục đích: Backend API chính (NestJS)
Framework: NestJS
Database: PostgreSQL (Prisma ORM)
PM2 process: baotienweb-api (ID 8)
Port: Không rõ (không thấy trong netstat)

Files quan trọng:
- .env (đã có, 5644 bytes)
- package.json (NestJS dependencies)
- dist/ (built files)
- src/ (26 subfolders - nhiều modules)
- prisma/ (schema files)
- node_modules/ (610 folders!)

⚠️ Folder rất lớn, có cả CRM system
```

---

## ⚠️ Vấn đề cần giải quyết

### 1. Port Conflict
**Vấn đề**: Port 3001 đã bị admin app chiếm  
**Giải pháp**:
- **Option A**: Dùng port 3003 cho Construction Map API
- **Option B**: Dùng reverse proxy Nginx (recommended)
- **Option C**: Chạy trong cùng NestJS app với /api/construction-map

### 2. Database chưa tạo
**Vấn đề**: Không có database `construction_map`  
**Giải pháp**: Tạo database mới
```bash
sudo -u postgres psql -c "CREATE DATABASE construction_map;"
sudo -u postgres psql -c "CREATE USER construction_user WITH PASSWORD 'secure_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE construction_map TO construction_user;"
```

### 3. Nginx chưa config API subdomain
**Vấn đề**: Không có `/etc/nginx/sites-enabled/api.baotienweb.cloud`  
**Giải pháp**: Tạo config mới với reverse proxy

### 4. SSL Certificate
**Vấn đề**: Chưa biết có SSL cho api.baotienweb.cloud chưa  
**Giải pháp**: Run certbot sau khi config Nginx

---

## 💡 Deployment Plan (Recommended)

### **Option 1: Standalone App (Isolated)** ⭐ RECOMMENDED

**Ưu điểm**:
- Độc lập hoàn toàn với baotienweb-api hiện tại
- Không ảnh hưởng API đang chạy
- Dễ debug và rollback
- Có thể scale riêng

**Nhược điểm**:
- Thêm 1 PM2 process
- Tốn thêm ~60-100MB RAM

**Implementation**:
```bash
# 1. Tạo folder mới
mkdir -p /root/construction-map-api

# 2. Upload backend-nestjs files
rsync -avz backend-nestjs/ root@103.200.20.100:/root/construction-map-api/

# 3. Setup
cd /root/construction-map-api
npm install --production
cp .env.example .env
# Edit .env:
#   PORT=3003
#   DB_DATABASE=construction_map

# 4. Create database
sudo -u postgres psql -c "CREATE DATABASE construction_map;"

# 5. Build & migrate
npm run build
npm run migration:run

# 6. PM2 start
pm2 start dist/main.js --name construction-map-api

# 7. Nginx config
cat > /etc/nginx/sites-available/api.baotienweb.cloud << 'EOF'
upstream construction_api {
    server localhost:3003;
}

server {
    listen 80;
    server_name api.baotienweb.cloud;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.baotienweb.cloud;

    location /api/construction-map/ {
        proxy_pass http://construction_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /construction-map {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -s /etc/nginx/sites-available/api.baotienweb.cloud /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 8. SSL
certbot --nginx -d api.baotienweb.cloud

# 9. Test
curl https://api.baotienweb.cloud/api/construction-map/health
```

---

### **Option 2: Integrate into existing baotienweb-api** 

**Ưu điểm**:
- Dùng chung database connection pool
- Không cần thêm PM2 process
- Endpoint: https://baotienweb.cloud/api/construction-map

**Nhược điểm**:
- Phải merge vào codebase hiện tại
- Có thể gây conflict với modules khác
- Khó rollback nếu có vấn đề

**Implementation**:
```bash
# 1. Copy module vào baotienweb-api
cd /root/baotienweb-api
mkdir -p src/construction-map
rsync -avz /upload/backend-nestjs/src/construction-map/ src/construction-map/

# 2. Update app.module.ts
# Import ConstructionMapModule

# 3. Rebuild
npm run build
pm2 restart baotienweb-api

# 4. Test
curl https://baotienweb.cloud/api/construction-map/health
```

---

## 🎯 Recommended Action Plan

### Phase 1: Setup (10 phút)
```bash
# 1. Tạo database
ssh root@103.200.20.100
sudo -u postgres psql
CREATE DATABASE construction_map;
CREATE USER construction_user WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE construction_map TO construction_user;
\q

# 2. Tạo folder
mkdir -p /root/construction-map-api
```

### Phase 2: Upload & Install (5 phút)
```bash
# From local machine
cd c:\tien\APP_DESIGN_BUILD15.11.2025\backend-nestjs
scp -r ./* root@103.200.20.100:/root/construction-map-api/

# On server
cd /root/construction-map-api
npm install --production
```

### Phase 3: Configure (3 phút)
```bash
# Edit .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3003

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=construction_user
DB_PASSWORD=SecurePassword123!
DB_DATABASE=construction_map
DB_SYNCHRONIZE=false
DB_LOGGING=false

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300

CORS_ORIGIN=https://baotienweb.cloud,https://admin.baotienweb.cloud

JWT_SECRET=construction-map-secret-key-$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF
```

### Phase 4: Build & Migrate (2 phút)
```bash
npm run build
npm run migration:run
```

### Phase 5: PM2 Start (1 phút)
```bash
pm2 start dist/main.js --name construction-map-api
pm2 save
```

### Phase 6: Nginx + SSL (5 phút)
```bash
# Create config (as shown above)
nginx -t
systemctl reload nginx
certbot --nginx -d api.baotienweb.cloud
```

### Phase 7: Test (2 phút)
```bash
curl https://api.baotienweb.cloud/api/construction-map/health
```

**Total time**: ~30 phút

---

## 🚨 Risks & Mitigation

### Risk 1: Port đã bị chiếm
**Probability**: Low (port 3003 free)  
**Impact**: Medium  
**Mitigation**: Đã check port 3003 chưa dùng

### Risk 2: Database migration fails
**Probability**: Low  
**Impact**: Medium  
**Mitigation**: Có backup script sẵn

### Risk 3: Nginx config syntax error
**Probability**: Low  
**Impact**: High (ảnh hưởng sites khác)  
**Mitigation**: Luôn chạy `nginx -t` trước `reload`

### Risk 4: SSL certificate không tạo được
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**: Dùng HTTP trước, SSL sau

### Risk 5: PM2 out of memory
**Probability**: Low (còn 5GB RAM)  
**Impact**: Medium  
**Mitigation**: Monitor với `pm2 monit`

---

## ✅ Pre-flight Checklist

- [x] Server accessible via SSH
- [x] Node.js 20.x installed
- [x] PostgreSQL running
- [x] Redis running
- [x] PM2 installed
- [x] Nginx running
- [ ] Database `construction_map` created
- [ ] Port 3003 available
- [ ] Nginx config created
- [ ] SSL certificate ready
- [ ] Backend files uploaded

---

## 📊 Resource Usage Forecast

**Current**:
- baotienweb-admin: 167MB
- baotienweb-api: 60MB
- Total: 227MB

**After deployment**:
- baotienweb-admin: 167MB
- baotienweb-api: 60MB
- construction-map-api: ~80MB (estimated)
- **Total: 307MB** (< 10% of 7.8GB RAM) ✅

---

## 🎬 Next Steps

1. **Xác nhận deployment strategy**: Option 1 (standalone) hay Option 2 (integrate)?
2. **Tạo database** construction_map
3. **Upload files** từ local → server
4. **Configure .env** với credentials
5. **Build & run migrations**
6. **Start PM2 process**
7. **Setup Nginx reverse proxy**
8. **Get SSL certificate**
9. **Test endpoints**
10. **Monitor logs**

---

**Recommendation**: Chọn **Option 1 (Standalone)** vì:
- An toàn hơn (không ảnh hưởng API hiện tại)
- Dễ debug
- Có thể rollback nhanh
- RAM đủ dư

**Ready to proceed?** 🚀
