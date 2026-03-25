# Deploy app.baotienweb.com — Production Guide

## Tài liệu triển khai hoàn chỉnh cho VPS Ubuntu

---

## ⚠ CẢNH BÁO — localhost:8081 là Expo Metro Bundler

`http://localhost:8081` trong Expo **KHÔNG PHẢI** production web server.

Đây là **Expo Metro Bundler / Dev Server** — phục vụ:

- bundling code khi dev
- hot reload / fast refresh
- debug
- dùng cho **lập trình viên** ở local

**Nếu reverse proxy trực tiếp localhost:8081 ra internet:**

- App chết khi dev server dừng
- Hiệu năng kém, tài nguyên bị hao
- Không phù hợp public internet
- Dễ lỗi reload / bundling / memory / watcher
- Có thể lộ hành vi dev-only

**→ Không bao giờ deploy trực tiếp Expo Metro Bundler ra domain production.**

---

## Phương án triển khai

### Phương án 1 — Build Expo Web tĩnh + Nginx (KHUYẾN NGHỊ)

- Dùng khi muốn mở app trên browser bằng https://app.baotienweb.com
- Nhanh, nhẹ, ít tốn tài nguyên, ổn định
- Không cần giữ Node process chạy liên tục

### Phương án 2 — Node.js / Next.js + PM2 + Nginx

- Dùng khi cần runtime server, SSR, hoặc dynamic server logic
- Phức tạp hơn nhưng linh hoạt hơn

### Phương án 3 — Expo + EAS cho mobile

- Dùng khi mục tiêu chính là iOS/Android
- Domain lúc này dùng cho landing page / API / deeplink

---

## HƯỚNG DẪN CHI TIẾT — PHƯƠNG ÁN 1

### Bước 1: Build Expo Web

```bash
cd /path/to/project
npm install
npx expo export --platform web
```

Kết quả: thư mục `dist/` chứa `index.html`, `_expo/`, `assets/`, v.v.

> **QUAN TRỌNG:** Trước khi build, đảm bảo biến môi trường API KHÔNG còn
> trỏ về localhost. Phải dùng URL production, ví dụ https://api.baotienweb.com

### Bước 2: Trỏ DNS

Tạo bản ghi A:

```
Type: A
Host: app
Value: <IP_VPS>
TTL: 300
```

Kiểm tra:

```bash
dig +short app.baotienweb.com
```

### Bước 3: Cài Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

### Bước 4: Tạo thư mục chứa build

```bash
sudo mkdir -p /var/www/app.baotienweb.com/current
sudo chown -R $USER:$USER /var/www/app.baotienweb.com
```

### Bước 5: Copy build lên VPS

Từ máy local:

```bash
rsync -avz --delete dist/ user@VPS_IP:/var/www/app.baotienweb.com/current/
```

Hoặc trên VPS:

```bash
cp -r dist/* /var/www/app.baotienweb.com/current/
```

### Bước 6: Config Nginx

Tạo file `/etc/nginx/sites-available/app.baotienweb.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.baotienweb.com;

    root /var/www/app.baotienweb.com/current;
    index index.html;

    access_log /var/log/nginx/app.baotienweb.com.access.log;
    error_log  /var/log/nginx/app.baotienweb.com.error.log warn;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache built assets
    location /_expo/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /assets/ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — tất cả route đều trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Bước 7: Enable site + Test + Reload

```bash
sudo ln -s /etc/nginx/sites-available/app.baotienweb.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 8: SSL bằng Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.baotienweb.com
sudo certbot renew --dry-run
```

### Bước 9: Kiểm tra

```bash
curl -I https://app.baotienweb.com
sudo tail -f /var/log/nginx/app.baotienweb.com.error.log
```

---

## HƯỚNG DẪN TỔ-NG QUAN — PHƯƠNG ÁN 2 (PM2 + Nginx)

### Cài PM2

```bash
sudo npm install -g pm2
```

### Chạy Node app

```bash
cd /var/www/your-app
npm install && npm run build
pm2 start dist/server.js --name app-baotienweb
pm2 save
```

### Chạy Next.js

```bash
cd /var/www/your-next-app
npm install && npm run build
PORT=3000 pm2 start npm --name app-baotienweb -- start
pm2 save
```

### PM2 startup sau reboot

```bash
pm2 startup
# chạy lệnh sudo mà PM2 in ra
pm2 save
```

### Config Nginx reverse proxy

File: `/etc/nginx/sites-available/app.baotienweb.com`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.baotienweb.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Sau đó SSL:

```bash
sudo certbot --nginx -d app.baotienweb.com
```

---

## PHƯƠNG ÁN 3 — Mobile (EAS)

### EAS Build

- Dịch vụ build chính thức của Expo
- Build APK/AAB cho Android, IPA cho iOS

### Kiến trúc mobile-first

- Mobile app: Expo + EAS build
- api.baotienweb.com: backend API
- app.baotienweb.com: web app hoặc landing page
- Domain không phải nơi chạy app native

---

## LỖI THƯỜNG GẶP

| Lỗi                          | Nguyên nhân                          | Xử lý                           |
| ---------------------------- | ------------------------------------ | ------------------------------- |
| Nhầm dev server = production | Dùng `npx expo start` làm production | Build static hoặc dùng PM2      |
| Reverse proxy crash          | Proxy vào Metro bundler              | Chọn đúng mô hình deploy        |
| Blank page                   | Build lỗi env, API trỏ localhost     | Kiểm tra biến env trước build   |
| SPA route 404                | Thiếu `try_files ... /index.html`    | Thêm vào nginx config           |
| SSL lỗi                      | DNS chưa trỏ, port blocked           | `dig`, `ufw allow 80 443`       |
| DNS chưa đúng                | Bản ghi A sai                        | `dig +short app.baotienweb.com` |

---

## CHECKLIST DEPLOY

- [ ] Hiểu đúng: localhost:8081 = Expo Metro Bundler
- [ ] Chọn mô hình: static web / Node runtime / mobile EAS
- [ ] Nếu web: `npx expo export --platform web`
- [ ] Kiểm tra biến env API, KHÔNG dùng localhost
- [ ] Trỏ DNS app.baotienweb.com → IP VPS
- [ ] Cài Nginx
- [ ] Copy dist/ lên /var/www/app.baotienweb.com/current
- [ ] Tạo config Nginx
- [ ] `sudo nginx -t`
- [ ] `sudo systemctl reload nginx`
- [ ] `sudo certbot --nginx -d app.baotienweb.com`
- [ ] Kiểm tra HTTPS
- [ ] Nếu cần runtime server: PM2 + Nginx reverse proxy
- [ ] Nếu cần mobile: Expo + EAS Build
