# 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ DEPLOY ADMIN WEB

## ✅ Đã hoàn thành

Tôi đã tạo xong **Admin Web Dashboard** đầy đủ với các tính năng:

### 📋 Tính năng đã implement:

1. **✅ Xác thực (Authentication)**
   - Trang đăng nhập ([/login](admin-web/app/login/page.tsx))
   - Trang đăng ký ([/register](admin-web/app/register/page.tsx))
   - JWT authentication với cookies
   - Auto redirect nếu chưa đăng nhập

2. **✅ Dashboard chính** ([/dashboard](admin-web/app/dashboard/page.tsx))
   - Thống kê tổng quan (Users, Products, Projects)
   - Activity feed
   - System status
   - Charts và biểu đồ

3. **✅ Quản lý Người dùng** ([/dashboard/users](admin-web/app/dashboard/users/page.tsx))
   - Danh sách người dùng
   - Tìm kiếm
   - Phân trang
   - CRUD operations (Create, Read, Update, Delete)

4. **✅ Quản lý Sản phẩm** ([/dashboard/products](admin-web/app/dashboard/products/page.tsx))
   - Danh sách sản phẩm
   - Grid view với cards
   - Tìm kiếm sản phẩm
   - Quản lý tồn kho

5. **✅ Responsive Design**
   - Mobile, Tablet, Desktop
   - Sidebar collapse trên mobile
   - Touch-friendly UI

6. **✅ API Integration**
   - Axios client cấu hình sẵn
   - Interceptors cho token
   - Error handling tự động
   - Connect đến https://baotienweb.cloud/api/v1

---

## 🏃 CHẠY NGAY (Development)

### Bước 1: Chạy dev server

```powershell
cd admin-web
npm run dev
```

### Bước 2: Truy cập

Mở trình duyệt: **http://localhost:3000**

### Tài khoản Demo:
- **Email:** admin@baotienweb.cloud
- **Password:** Admin123!

---

## 🌐 DEPLOY LÊN VPS (Production)

### Option 1: Deploy tự động bằng PowerShell

```powershell
cd admin-web
.\deploy-to-vps.ps1
```

Script sẽ tự động:
1. Build production
2. Upload lên VPS
3. Cài đặt dependencies
4. Restart PM2

### Option 2: Deploy thủ công

```powershell
# Bước 1: Build
cd admin-web
npm run build

# Bước 2: Zip file
Compress-Archive -Path .next, public, package.json, next.config.js -DestinationPath deploy.zip

# Bước 3: Upload lên VPS
scp deploy.zip root@baotienweb.cloud:/var/www/admin-web/

# Bước 4: SSH vào VPS
ssh root@baotienweb.cloud

# Bước 5: Trên VPS
cd /var/www/admin-web
unzip -o deploy.zip
npm install --production
pm2 restart admin-web || pm2 start npm --name admin-web -- start
pm2 save
```

---

## ⚙️ CẤU HÌNH NGINX (Trên VPS)

### Tạo file config

```bash
sudo nano /etc/nginx/sites-available/admin.baotienweb.cloud
```

### Nội dung:

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

### Kích hoạt:

```bash
sudo ln -s /etc/nginx/sites-available/admin.baotienweb.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL (Let's Encrypt):

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d admin.baotienweb.cloud
```

---

## 🔧 CẤU HÌNH PM2

### Start app

```bash
pm2 start npm --name "admin-web" -- start
pm2 save
pm2 startup
```

### Quản lý PM2

```bash
pm2 list                    # List tất cả apps
pm2 logs admin-web          # Xem logs
pm2 restart admin-web       # Restart
pm2 stop admin-web          # Stop
pm2 delete admin-web        # Delete
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
admin-web/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard pages
│   │   ├── layout.tsx          # Dashboard layout (sidebar)
│   │   ├── page.tsx            # Dashboard home
│   │   ├── users/page.tsx      # User management
│   │   ├── products/page.tsx   # Product management
│   │   ├── projects/           # Project pages (TODO)
│   │   └── analytics/          # Analytics pages (TODO)
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Register page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (redirect)
│   └── globals.css             # Global styles
│
├── lib/                         # Utilities
│   ├── api.ts                  # API client + all endpoints
│   └── auth.ts                 # Auth utilities (token, cookies)
│
├── public/                      # Static files
├── .env.local                   # Environment variables
├── next.config.js              # Next.js config
├── tailwind.config.js          # Tailwind CSS config
├── package.json                # Dependencies
├── deploy-to-vps.ps1           # Deploy script (Windows)
├── deploy-to-vps.sh            # Deploy script (Linux)
└── README.md                   # Documentation
```

---

## 🔌 API ENDPOINTS CẦN IMPLEMENT (Backend)

Backend của bạn cần có các endpoints sau:

### Authentication
```
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/register        # Register  
POST   /api/v1/auth/logout          # Logout
GET    /api/v1/auth/profile         # Get profile
```

### Users
```
GET    /api/v1/users                # List users (với pagination)
GET    /api/v1/users/:id            # Get user by ID
POST   /api/v1/users                # Create user
PUT    /api/v1/users/:id            # Update user
DELETE /api/v1/users/:id            # Delete user
```

### Products
```
GET    /api/v1/products             # List products
GET    /api/v1/products/:id         # Get product
POST   /api/v1/products             # Create product
PUT    /api/v1/products/:id         # Update product
DELETE /api/v1/products/:id         # Delete product
```

### Projects
```
GET    /api/v1/projects             # List projects
GET    /api/v1/projects/:id         # Get project
GET    /api/v1/projects/stats       # Get statistics
```

### Analytics
```
GET    /api/v1/analytics/dashboard  # Dashboard metrics
GET    /api/v1/analytics/revenue    # Revenue data
```

---

## 🎨 THÊM TÍNH NĂNG MỚI

### Ví dụ: Thêm trang Projects

1. Tạo file `app/dashboard/projects/page.tsx`
2. Copy template từ `users/page.tsx` hoặc `products/page.tsx`
3. Sửa API calls thành `projectsApi.getAll()`
4. Đã có trong menu sidebar sẵn!

---

## 🐛 TROUBLESHOOTING

### Port 3000 đã được sử dụng

```powershell
npx kill-port 3000
# hoặc
npm run dev -- -p 3001
```

### Build failed

```powershell
rm -rf .next node_modules
npm install
npm run build
```

### PM2 không start

```bash
pm2 logs admin-web
pm2 restart admin-web --update-env
```

### CORS errors

Thêm vào backend:

```javascript
app.use(cors({
  origin: ['https://admin.baotienweb.cloud', 'http://localhost:3000'],
  credentials: true
}));
```

---

## 📞 KIỂM TRA

### Local
- Dashboard: http://localhost:3000/dashboard
- Login: http://localhost:3000/login
- Users: http://localhost:3000/dashboard/users
- Products: http://localhost:3000/dashboard/products

### Production (sau khi deploy)
- https://admin.baotienweb.cloud
- https://admin.baotienweb.cloud/dashboard
- https://admin.baotienweb.cloud/dashboard/users
- https://admin.baotienweb.cloud/dashboard/products

---

## 🎉 HOÀN TẤT!

Admin web dashboard đã sẵn sàng! Bạn có thể:

1. ✅ Chạy ngay: `npm run dev`
2. ✅ Test các tính năng
3. ✅ Deploy lên VPS: `.\deploy-to-vps.ps1`
4. ✅ Mở rộng thêm tính năng (Projects, Analytics, Settings...)

Backend API cần implement các endpoints như đã liệt kê ở trên để admin web hoạt động đầy đủ.

**Contact:** support@baotienweb.cloud
