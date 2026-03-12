# 🚀 Hướng Dẫn Deploy Backend Ngay

## Tình Trạng Hiện Tại

| Hạng mục                | Trạng thái                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| Code Frontend           | ✅ Hoàn thành, 0 lỗi TypeScript                                  |
| Code Backend (GitHub)   | ✅ Đã push lên `appdesignbuild/demo28.git`                       |
| Parent Repo (GitHub)    | ✅ Đã push lên `minhtien2412tran/APP_DESIGN_BUILD05.12.2025.git` |
| GitHub Actions Workflow | ✅ Đã trigger (build sẽ chạy)                                    |
| SSH Port 22 trên Server | ❌ **ĐANG BỊ CHẶN**                                              |
| Deploy tự động          | ❌ Chờ mở SSH port                                               |

## ⚠️ VẤN ĐỀ: SSH Port 22 Bị Chặn

Server `103.200.20.100` (baotienweb.cloud) đang **chặn port 22** (SSH). Chỉ có port 9090 (Prometheus) đang mở.

### Cách Khắc Phục

**Cách 1: Liên hệ nhà cung cấp VPS**

- Yêu cầu mở port 22 (SSH) trên firewall
- Hoặc truy cập VPS console/panel của nhà cung cấp để tự mở

**Cách 2: Dùng VPS Console (VNC/noVNC)**

- Đăng nhập vào trang quản lý VPS (dashboard của nhà cung cấp)
- Mở Console trực tiếp (VNC) không cần SSH
- Chạy lệnh: `ufw allow 22/tcp` hoặc `iptables -A INPUT -p tcp --dport 22 -j ACCEPT`
- Sau đó restart firewall

**Cách 3: Nếu có quyền qua web panel**

- Truy cập VPS management panel
- Tìm mục "Firewall" hoặc "Security Group"
- Thêm rule: Allow TCP port 22 (SSH) from 0.0.0.0/0

---

## 🔧 SAU KHI MỞ SSH PORT 22

### Cách A: Deploy Tự Động qua GitHub Actions

1. Vào GitHub repo: https://github.com/minhtien2412tran/APP_DESIGN_BUILD05.12.2025
2. Mở tab **Actions**
3. Chọn workflow **"Deploy Backend"**
4. Click **"Run workflow"** → chọn "production" → **"Run workflow"**

**Yêu cầu:** Phải setup GitHub Secret:

- Vào repo **Settings → Secrets → Actions**
- Thêm secret `SSH_PRIVATE_KEY` = nội dung file private key SSH

### Cách B: Deploy Thủ Công qua SSH

```bash
# 1. SSH vào server
ssh root@103.200.20.100
# Password: 6k4BOIRDwWhsM39F2DyM

# 2. Tải code từ GitHub
cd /opt
git clone https://github.com/appdesignbuild/demo28.git baotienweb
cd baotienweb

# 3. Tạo file .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://baotienweb:Baotien123!@127.0.0.1:5432/baotienweb?schema=public
JWT_SECRET=your-jwt-secret-here-change-me
JWT_REFRESH_SECRET=your-refresh-secret-here-change-me
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
EOF

# 4. Deploy với Docker
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Chạy Prisma migration
docker exec baotienweb-api npx prisma db push

# 6. Kiểm tra
curl http://localhost:3000/api/v1/health
```

### Cách C: Deploy Không Có Docker

```bash
# 1. SSH vào server
ssh root@103.200.20.100

# 2. Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 3. Tải code
cd /opt
git clone https://github.com/appdesignbuild/demo28.git baotienweb
cd baotienweb

# 4. Install & Build
npm ci
npx prisma generate
npm run build

# 5. Tạo .env (như Cách B bước 3)

# 6. Chạy Prisma migration
npx prisma db push

# 7. Chạy với PM2
npm install -g pm2
pm2 start dist/main.js --name baotienweb-api
pm2 save
pm2 startup
```

---

## 📋 Checklist Sau Deploy

- [ ] Kiểm tra health: `curl https://baotienweb.cloud/api/v1/health`
- [ ] Kiểm tra auth: `curl -X POST https://baotienweb.cloud/api/v1/auth/login`
- [ ] Kiểm tra workers API: `curl https://baotienweb.cloud/api/v1/workers`
- [ ] Mở port 3000 hoặc setup Nginx reverse proxy (port 80/443 → 3000)
- [ ] Setup SSL certificate (Let's Encrypt): `certbot --nginx -d baotienweb.cloud`

---

## 📂 Repositories

| Repo              | URL                                                                | Branch |
| ----------------- | ------------------------------------------------------------------ | ------ |
| Frontend (Parent) | https://github.com/minhtien2412tran/APP_DESIGN_BUILD05.12.2025.git | master |
| Backend           | https://github.com/appdesignbuild/demo28.git                       | master |

## 🔐 Server Info

| Item         | Value                |
| ------------ | -------------------- |
| IP           | 103.200.20.100       |
| Domain       | baotienweb.cloud     |
| SSH User     | root                 |
| SSH Password | 6k4BOIRDwWhsM39F2DyM |
| DB User      | baotienweb           |
| DB Password  | Baotien123!          |
| Deploy Path  | /opt/baotienweb      |
