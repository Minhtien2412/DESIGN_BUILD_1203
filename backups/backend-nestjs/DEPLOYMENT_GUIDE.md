# Backend Deployment Guide - baotienweb.cloud

## 🚀 Hướng Dẫn Deploy NestJS Backend lên baotienweb.cloud

### Thông Tin Server
- **Domain**: baotienweb.cloud
- **Platform**: NestJS + PostgreSQL/MongoDB
- **WebSocket**: Socket.IO
- **Authentication**: JWT

---

## 📦 Cấu Trúc Backend

```
backend-nestjs/
├── src/
│   ├── construction-map/
│   │   ├── construction-map.module.ts
│   │   ├── construction-map.controller.ts
│   │   ├── construction-map.service.ts
│   │   ├── construction-map.gateway.ts (WebSocket)
│   │   ├── dto/
│   │   │   ├── create-task.dto.ts
│   │   │   ├── update-task.dto.ts
│   │   │   ├── create-stage.dto.ts
│   │   │   └── update-map-state.dto.ts
│   │   ├── entities/
│   │   │   ├── task.entity.ts
│   │   │   ├── stage.entity.ts
│   │   │   ├── link.entity.ts
│   │   │   └── map-state.entity.ts
│   │   └── schemas/ (nếu dùng MongoDB)
│   ├── app.module.ts
│   └── main.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 📋 Các Bước Deploy

### 1. SSH vào Server

```bash
ssh root@baotienweb.cloud
# Nhập password khi được yêu cầu
```

### 2. Clone hoặc Upload Code

**Option A: Git Clone**
```bash
cd /var/www
git clone <your-repo-url> construction-map-backend
cd construction-map-backend
```

**Option B: SCP Upload**
```bash
# Từ máy local
scp -r backend-nestjs/* root@baotienweb.cloud:/var/www/construction-map-backend/
```

### 3. Install Dependencies

```bash
cd /var/www/construction-map-backend
npm install
```

### 4. Configure Environment

```bash
nano .env
```

Nội dung `.env`:
```env
# Server
NODE_ENV=production
PORT=3001

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=construction_user
DB_PASSWORD=your_secure_password
DB_DATABASE=construction_map

# hoặc MongoDB
MONGO_URI=mongodb://localhost:27017/construction_map

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,exp://192.168.1.100:8081

# WebSocket
WS_PORT=3002

# Redis (cho caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Setup Database

**PostgreSQL:**
```bash
# Tạo database
sudo -u postgres psql
CREATE DATABASE construction_map;
CREATE USER construction_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE construction_map TO construction_user;
\q

# Run migrations
npm run migration:run
```

**MongoDB:**
```bash
# Khởi động MongoDB nếu chưa chạy
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 6. Build Production

```bash
npm run build
```

### 7. Setup PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/main.js --name construction-map-api

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
# Copy và chạy command được suggest
```

### 8. Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/construction-map
```

Nội dung config:
```nginx
# HTTP API
upstream construction_api {
    server localhost:3001;
}

# WebSocket
upstream construction_ws {
    server localhost:3002;
}

server {
    listen 80;
    server_name api.baotienweb.cloud;

    # API endpoints
    location /api/construction-map {
        proxy_pass http://construction_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket endpoint
    location /ws/construction-map {
        proxy_pass http://construction_ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/construction-map /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Setup SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d api.baotienweb.cloud
```

### 10. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs construction-map-api

# Test API
curl https://api.baotienweb.cloud/api/construction-map/health
```

---

## 🔄 Update/Redeploy

```bash
# SSH vào server
ssh root@baotienweb.cloud

# Navigate to project
cd /var/www/construction-map-backend

# Pull latest code (nếu dùng Git)
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart construction-map-api

# Check logs
pm2 logs construction-map-api --lines 100
```

---

## 🔍 Monitoring & Logs

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs construction-map-api

# View specific log file
tail -f /var/www/construction-map-backend/logs/error.log

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 🛠️ Troubleshooting

### Port đã được sử dụng
```bash
# Check port
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

### Database connection failed
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check MongoDB
sudo systemctl status mongod

# Test connection
psql -U construction_user -d construction_map -h localhost
```

### PM2 không tự động start
```bash
pm2 unstartup
pm2 startup
# Chạy command được suggest
pm2 save
```

---

## 📊 Database Backup

```bash
# PostgreSQL backup
pg_dump -U construction_user construction_map > backup_$(date +%Y%m%d).sql

# MongoDB backup
mongodump --db construction_map --out backup_$(date +%Y%m%d)
```

---

## 🔐 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication
- [ ] Database với strong password
- [ ] JWT secret được generate ngẫu nhiên
- [ ] CORS configured correctly
- [ ] SSL certificate installed
- [ ] Regular backups scheduled
- [ ] PM2 running as non-root user (recommended)

---

## 📞 Support

Nếu gặp vấn đề, check:
1. PM2 logs: `pm2 logs construction-map-api`
2. Nginx logs: `/var/log/nginx/error.log`
3. Application logs: `/var/www/construction-map-backend/logs/`
4. Database status: `systemctl status postgresql` hoặc `mongod`
