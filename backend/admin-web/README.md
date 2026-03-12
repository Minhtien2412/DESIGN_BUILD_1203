# Construction Manager - Admin Web Dashboard

Admin dashboard web application để quản lý hệ thống Construction Manager.

## 🎯 Tính năng

- ✅ Đăng ký / Đăng nhập admin
- ✅ Dashboard tổng quan
- ✅ Quản lý người dùng (CRUD)
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý dự án (View, Stats)
- ✅ Thống kê và báo cáo
- ✅ Responsive design (Mobile/Tablet/Desktop)
- ✅ Authentication với JWT
- ✅ API integration với backend

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd admin-web
npm install
```

### 2. Cấu hình environment

Sửa file `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://baotienweb.cloud/api/v1
NEXT_PUBLIC_APP_NAME=Construction Manager Admin
```

### 3. Chạy development server

```bash
npm run dev
```

Truy cập: http://localhost:3000

## 📦 Build & Deploy lên VPS

### Option 1: Build & Deploy thủ công

```bash
# Build production
npm run build

# Copy toàn bộ folder lên VPS
scp -r .next package.json node_modules root@baotienweb.cloud:/var/www/admin-web/

# SSH vào VPS
ssh root@baotienweb.cloud

# Cài đặt PM2 (nếu chưa có)
npm install -g pm2

# Start app với PM2
cd /var/www/admin-web
pm2 start npm --name "admin-web" -- start
pm2 save
pm2 startup
```

### Option 2: Deploy tự động với script

Tạo file `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Building admin web..."
npm run build

echo "📦 Uploading to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env.local' \
  ./ root@baotienweb.cloud:/var/www/admin-web/

echo "🔧 Installing dependencies on VPS..."
ssh root@baotienweb.cloud << 'EOF'
  cd /var/www/admin-web
  npm install --production
  pm2 restart admin-web || pm2 start npm --name "admin-web" -- start
  pm2 save
EOF

echo "✅ Deploy completed!"
echo "🌐 Access: https://admin.baotienweb.cloud"
```

Chạy deploy:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Cấu hình Nginx (trên VPS)

Tạo file `/etc/nginx/sites-available/admin.baotienweb.cloud`:

```nginx
server {
    listen 80;
    server_name admin.baotienweb.cloud;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt:

```bash
ln -s /etc/nginx/sites-available/admin.baotienweb.cloud /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔐 SSL với Let's Encrypt

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d admin.baotienweb.cloud
```

## 📱 Tài khoản Demo

- **Email:** admin@baotienweb.cloud
- **Password:** Admin123!

## 🗂️ Cấu trúc thư mục

```
admin-web/
├── app/                    # Next.js 14 App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx      # Dashboard home
│   │   ├── users/        # User management
│   │   ├── products/     # Product management
│   │   ├── projects/     # Project management
│   │   └── analytics/    # Analytics
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── auth.ts          # Auth utilities
├── public/              # Static files
└── package.json         # Dependencies
```

## 🛠️ Công nghệ sử dụng

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form:** React Hook Form
- **Icons:** Lucide React
- **Toast:** React Hot Toast
- **Auth:** JWT + Cookies

## 📋 API Endpoints Required

Backend cần implement các endpoints sau:

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile

GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

GET    /api/v1/projects
GET    /api/v1/projects/:id
GET    /api/v1/projects/stats

GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/revenue
```

## 🐛 Troubleshooting

### Port đã được sử dụng

```bash
# Kill process trên port 3000
npx kill-port 3000

# Hoặc chạy trên port khác
npm run dev -- -p 3001
```

### PM2 không start

```bash
pm2 logs admin-web
pm2 restart admin-web
```

## 📞 Support

- Email: support@baotienweb.cloud
- Website: https://baotienweb.cloud
